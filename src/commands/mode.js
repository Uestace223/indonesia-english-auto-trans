import { getChatSettings } from "../services/chatSettings.js";

export default function register(bot) {
  bot.command("mode", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return ctx.reply("Can't read chat id.");

    const { settings, persisted } = await getChatSettings(chatId);

    const dir = settings.directionMode || "auto";
    const auto = settings.autoTranslate ? "ON" : "OFF";

    const txt =
      "Current chat settings:\n" +
      "Auto-translate: " + auto + "\n" +
      "Direction: " + dir + "\n" +
      (persisted ? "" : "\nNote: Add MONGODB_URI to persist settings across restarts.");

    await ctx.reply(txt);
  });
}
