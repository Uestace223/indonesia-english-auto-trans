import { aiChat } from "../lib/ai.js";

function clampText(s) {
  const t = String(s || "");
  if (t.length <= 3500) return t;
  return t.slice(0, 3500);
}

function directionLabel(targetLang) {
  if (targetLang === "en") return "→ EN";
  if (targetLang === "id") return "→ ID";
  if (targetLang === "es") return "→ ES";
  if (targetLang === "fr") return "→ FR";
  if (targetLang === "pt") return "→ PT";
  return "";
}

export async function translateText({ botProfile, text, directionMode }) {
  const t = clampText(text);

  const targetHint =
    directionMode === "toen" ? "en" :
    directionMode === "toid" ? "id" :
    directionMode === "tosp" ? "es" :
    directionMode === "tofr" ? "fr" :
    directionMode === "topt" ? "pt" :
    "auto";

  const system =
    String(botProfile || "") +
    "\n\n" +
    "Task: Translate chat messages between Indonesian (id), English (en), Spanish (es), French (fr), and Portuguese (pt)." +
    "\n" +
    "Rules:" +
    "\n" +
    "1) Detect input language." +
    "\n" +
    "2) If target is auto: translate Indonesian ↔️ English. For Spanish/French/Portuguese or uncertain detection, translate into English." +
    "\n" +
    "3) If target is forced (en/id/es/fr/pt), translate into that target language." +
    "\n" +
    "4) Return ONLY translated text.";

  const user =
    "Target: " + targetHint + "\n" +
    "Text:\n" + t;

  const res = await aiChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    meta: { platform: "telegram", purpose: "translate", target: targetHint }
  });

  if (!res.ok) {
    return { ok: false, error: res.error || "AI_ERROR" };
  }

  const content = res?.json?.output?.content;
  const out = String(content || "").trim();
  if (!out) return { ok: false, error: "EMPTY_TRANSLATION" };

  let label = "";
  if (directionMode === "toen") label = directionLabel("en");
  else if (directionMode === "toid") label = directionLabel("id");
  else if (directionMode === "tosp") label = directionLabel("es");
  else if (directionMode === "tofr") label = directionLabel("fr");
  else if (directionMode === "topt") label = directionLabel("pt");
  else {
    // Preserve existing ID/EN auto heuristic behavior.
    const lower = out.toLowerCase();
    const idHints = [" yang ", " tidak ", " saya ", " kamu ", " ini ", " itu ", " dan ", " di ", " ke "];
    const idScore = idHints.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    label = idScore >= 2 ? directionLabel("id") : directionLabel("en");
  }

  return { ok: true, translatedText: out, label };
}
