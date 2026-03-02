import { cfg } from "./config.js";
import { log } from "./log.js";
import { safeErr } from "./safeErr.js";

function trimSlash(u) {
  u = String(u || "");
  while (u.endsWith("/")) u = u.slice(0, -1);
  return u;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { ctrl, clear: () => clearTimeout(t) };
}

function getTimeoutMs(override) {
  const v = Number(override || cfg.AI_TIMEOUT_MS || 600000);
  return Number.isFinite(v) && v > 0 ? v : 600000;
}

function getRetries(override) {
  const v = Number.isFinite(override) ? Number(override) : Number(cfg.AI_MAX_RETRIES || 2);
  return Number.isFinite(v) && v >= 0 ? v : 2;
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

async function safeReadJson(r) {
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { text, json };
}

export async function aiChat({ messages, meta = {} }, opts = {}) {
  const base = trimSlash(cfg.COOKMYBOTS_AI_ENDPOINT || "");
  const key = String(cfg.COOKMYBOTS_AI_KEY || "");

  if (!base || !key) {
    const err = "AI_NOT_CONFIGURED (missing COOKMYBOTS_AI_ENDPOINT/COOKMYBOTS_AI_KEY)";
    return { ok: false, status: 412, json: null, error: err };
  }

  const timeoutMs = getTimeoutMs(opts.timeoutMs);
  const retries = getRetries(opts.retries);

  const url = base + "/chat";

  const started = Date.now();
  log.info("[ai] chat start", {
    feature: "translate",
    timeoutMs,
    retries,
    endpointSet: true,
    keySet: true
  });

  let attempt = 0;
  while (true) {
    attempt++;
    const { ctrl, clear } = withTimeout(timeoutMs);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages, meta }),
        signal: ctrl.signal
      });

      const { json, text } = await safeReadJson(r);

      if (!r.ok) {
        const msg = json?.error || json?.message || text || "AI_ERROR";
        log.warn("[ai] chat fail", { status: r.status, attempt, err: String(msg).slice(0, 300) });
        if (attempt <= retries && isRetryableStatus(r.status)) {
          await sleep(500 * attempt);
          continue;
        }
        return { ok: false, status: r.status, json, error: String(msg) };
      }

      const latencyMs = Date.now() - started;
      log.info("[ai] chat success", { latencyMs, attempt });
      return { ok: true, status: r.status, json, error: null };
    } catch (e) {
      const msg = safeErr(e);
      const status = e?.name === "AbortError" ? 408 : 0;
      log.warn("[ai] chat exception", { status, attempt, err: String(msg).slice(0, 300) });
      if (attempt <= retries && (status === 0 || status === 408)) {
        await sleep(500 * attempt);
        continue;
      }
      return { ok: false, status, json: null, error: String(msg) };
    } finally {
      clear();
    }
  }
}
