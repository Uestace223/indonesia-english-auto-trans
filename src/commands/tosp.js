import { updateChatSettings } from "../services/chatSettings.js";

export default function register(bot) {
  bot.command("tosp", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return ctx.reply("Can't read chat id.");

    const r = await updateChatSettings(chatId, { directionMode: "tosp" });
    if (!r.ok) return ctx.reply("Direction set: translate into Spanish (es). (temporary) Add MONGODB_URI to persist settings.");

    await ctx.reply("Direction set: translate into Spanish (es).");
  });
}
