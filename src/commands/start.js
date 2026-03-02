export default function register(bot) {
  bot.command("start", async (ctx) => {
    const txt =
      "Hi! Send me a message in Indonesian or English and I'll translate it to the other language.\n\n" +
      "Auto translate is ON by default.\n\n" +
      "Examples:\n" +
      "1) kamu lagi di mana?  → I translate to English\n" +
      "2) where are you? → Aku terjemahkan ke Indonesia\n\n" +
      "Commands: /help, /auto_off, /auto_on, /toen, /toid, /mode";

    await ctx.reply(txt);
  });
}
