import { updateChatSettings } from "../services/chatSettings.js";

export default function register(bot) {
  bot.command("auto_on", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return ctx.reply("Can't read chat id.");

    const r = await updateChatSettings(chatId, { autoTranslate: true });
    if (!r.ok) return ctx.reply("Auto-translate is ON (temporary). Add MONGODB_URI to persist settings.");

    await ctx.reply("Auto-translate is ON for this chat.");
  });
}
