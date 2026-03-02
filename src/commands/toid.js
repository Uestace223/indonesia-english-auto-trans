import { updateChatSettings } from "../services/chatSettings.js";

export default function register(bot) {
  bot.command("toid", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return ctx.reply("Can't read chat id.");

    const r = await updateChatSettings(chatId, { directionMode: "toid" });
    if (!r.ok) return ctx.reply("Direction set to Indonesian (temporary). Add MONGODB_URI to persist settings.");

    await ctx.reply("Direction set: always translate into Indonesian.");
  });
}
