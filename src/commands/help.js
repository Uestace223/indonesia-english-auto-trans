export default function register(bot) {
  bot.command("help", async (ctx) => {
    const txt =
      "How to use:\n" +
      "Send any text message and I'll translate it between Indonesian and English.\n\n" +
      "Commands:\n" +
      "/start - Welcome and quick examples\n" +
      "/help - This help\n" +
      "/auto_on - Enable auto-translate for this chat\n" +
      "/auto_off - Disable auto-translate for this chat\n" +
      "/toen - Force translating into English\n" +
      "/toid - Force translating into Indonesian\n" +
      "/tosp - Force translating into Spanish\n" +
      "/tofr - Force translating into French\n" +
      "/topt - Force translating into Portuguese\n" +
      "/mode - Show current settings\n\n" +
      "Notes / limitations:\n" +
      "1) Only text messages are translated.\n" +
      "2) In groups, I respond only if you reply to me or mention me (to reduce noise).\n" +
      "3) Auto mode: Indonesian ↔️ English. Other languages default to English.";

    await ctx.reply(txt);
  });
}
