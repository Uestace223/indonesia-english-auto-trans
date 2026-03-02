import { aiChat } from "../lib/ai.js";

function clampText(s) {
  const t = String(s || "");
  if (t.length <= 3500) return t;
  return t.slice(0, 3500);
}

function directionLabel(targetLang) {
  return targetLang === "en" ? "ID → EN" : "EN → ID";
}

export async function translateText({ botProfile, text, directionMode }) {
  const t = clampText(text);

  const targetHint =
    directionMode === "toen" ? "en" :
    directionMode === "toid" ? "id" :
    "auto";

  const system =
    String(botProfile || "") +
    "\n\n" +
    "Task: Translate chat messages between Indonesian (id) and English (en)." +
    "\n" +
    "Rules:" +
    "\n" +
    "1) Detect whether the input text is Indonesian or English." +
    "\n" +
    "2) If target is auto: translate to the opposite language. If detection is uncertain, translate into English." +
    "\n" +
    "3) If target is forced (en or id), translate into that target language." +
    "\n" +
    "4) Return ONLY the translated text. No labels, no quotes, no explanations.";

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
  else {
    // For auto mode, infer label heuristically to match the prompt's intent.
    // If output contains many Indonesian stop words, assume EN->ID; else ID->EN.
    const lower = out.toLowerCase();
    const idHints = [" yang ", " tidak ", " saya ", " kamu ", " ini ", " itu ", " dan ", " di ", " ke "];
    const idScore = idHints.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    label = idScore >= 2 ? directionLabel("id") : directionLabel("en");
  }

  return { ok: true, translatedText: out, label };
}
