export function buildBotProfile({ botUsername } = {}) {
  const name = botUsername ? ("@" + botUsername) : "this bot";

  return [
    "Bot purpose: Automatically translate chat messages between Indonesian (id) and English (en).",
    "Behavior: For normal text messages, detect if input is Indonesian or English, then translate to the opposite language unless a forced direction is set.",
    "Public commands:",
    "/start - Welcome and quick examples",
    "/help - Detailed usage",
    "/auto_on - Enable auto-translate for this chat",
    "/auto_off - Disable auto-translate for this chat",
    "/toen - Force translating into English",
    "/toid - Force translating into Indonesian",
    "/mode - Show current settings",
    "Key rules:",
    "1) Only translate non-command text (messages starting with / are commands and must not be translated).",
    "2) In group chats, respond only when mentioned by " + name + " or when the message is a reply to a bot message.",
    "3) Reply should be the translated text only (no extra commentary)."
  ].join("\n");
}
