const log = {
  info:  (...a) => console.log(...a),
  warn:  (...a) => console.warn(...a),
  error: (...a) => console.error(...a),
};

import "dotenv/config";

import { run } from "@grammyjs/runner";
import { cfg } from "./lib/config.js";

import { safeErr } from "./lib/safeErr.js";

process.on("unhandledRejection", (r) => {
  console.error("UnhandledRejection:", r);
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  console.error("UncaughtException:", e);
  process.exit(1);
});

let runner = null;
let restarting = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startPolling(bot) {
  await bot.api.deleteWebhook({ drop_pending_updates: true });

  let backoff = 2000;
  while (true) {
    try {
      log.info("[polling] start", { concurrency: 1 });
      runner = run(bot, { concurrency: 1 });
      await runner.task();

      // If runner.task resolves, treat it as a stop and restart.
      throw new Error("Polling runner stopped");
    } catch (e) {
      const msg = safeErr(e);

      // 409 Conflict: another getUpdates is running
      if (String(msg).includes("409") || String(msg).toLowerCase().includes("conflict")) {
        log.warn("[polling] conflict; retrying", { backoffMs: backoff, err: msg });
      } else {
        log.error("[polling] failed", { backoffMs: backoff, err: msg });
      }

      try {
        runner?.stop?.();
      } catch {}
      runner = null;

      await sleep(backoff);
      backoff = Math.min(20000, Math.round(backoff * 1.7));
    }
  }
}

async function boot() {
  log.info("[boot] start", {
    TELEGRAM_BOT_TOKEN_set: !!cfg.TELEGRAM_BOT_TOKEN,
    COOKMYBOTS_AI_ENDPOINT_set: !!cfg.COOKMYBOTS_AI_ENDPOINT,
    COOKMYBOTS_AI_KEY_set: !!cfg.COOKMYBOTS_AI_KEY,
    MONGODB_URI_set: !!cfg.MONGODB_URI
  });

  if (!cfg.TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is required. Add it to your env and redeploy.");
    process.exit(1);
  }

  if (!cfg.COOKMYBOTS_AI_ENDPOINT || !cfg.COOKMYBOTS_AI_KEY) {
    console.error("COOKMYBOTS_AI_ENDPOINT and COOKMYBOTS_AI_KEY are required for translation.");
    process.exit(1);
  }

  const { createBot } = await import("./bot.js");
  const { registerCommands } = await import("./commands/loader.js");

  const bot = createBot(cfg.TELEGRAM_BOT_TOKEN);

  bot.catch((err) => {
    log.error("[bot] error", { err: safeErr(err?.error || err) });
  });

  try {
    await bot.init();
  } catch (e) {
    log.warn("[boot] bot.init failed (continuing)", { err: safeErr(e) });
  }

  await registerCommands(bot);

  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Welcome & examples" },
      { command: "help", description: "How to use" },
      { command: "auto_on", description: "Enable auto-translate" },
      { command: "auto_off", description: "Disable auto-translate" },
      { command: "toen", description: "Force translation to English" },
      { command: "toid", description: "Force translation to Indonesian" },
      { command: "mode", description: "Show current chat mode" }
    ]);
  } catch (e) {
    log.warn("[boot] setMyCommands failed", { err: safeErr(e) });
  }

  // Memory log once per minute
  setInterval(() => {
    const m = process.memoryUsage();
    console.log("[mem]", {
      rssMB: Math.round(m.rss / 1e6),
      heapUsedMB: Math.round(m.heapUsed / 1e6)
    });
  }, 60_000).unref();

  await startPolling(bot);
}

boot().catch(async (e) => {
  log.error("[boot] failed", { err: safeErr(e) });
  if (!restarting) {
    restarting = true;
    await sleep(2000);
    process.exit(1);
  }
});
