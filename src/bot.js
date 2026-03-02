const log = {
  info:  (...a) => console.log(...a),
  warn:  (...a) => console.warn(...a),
  error: (...a) => console.error(...a),
};

import { Bot } from "grammy";
import { cfg } from "./lib/config.js";

import { safeErr } from "./lib/safeErr.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import { getChatSettings } from "./services/chatSettings.js";
import { translateText } from "./services/translate.js";
import { buildBotProfile } from "./lib/botProfile.js";

function isGroupChat(chat) {
  const t = chat?.type || "private";
  return t === "group" || t === "supergroup";
}

function mentionedByEntity({ text, entities, botUsername }) {
  if (!botUsername) return false;
  const raw = String(text || "");
  const ents = Array.isArray(entities) ? entities : [];

  return ents.some((e) => {
    if (!e || e.type !== "mention") return false;
    const s = raw.slice(e.offset, e.offset + e.length);
    return s.toLowerCase() === ("@" + String(botUsername).toLowerCase());
  });
}

function stripMention(text, botUsername) {
  if (!botUsername) return String(text || "").trim();
  const raw = String(text || "");
  const re = new RegExp("@" + String(botUsername) + "\\b", "ig");
  return raw.replace(re, "").trim();
}

function isReplyToBot(ctx, botUsername) {
  const replyTo = ctx.message?.reply_to_message;
  if (!replyTo?.from?.is_bot) return false;
  if (!botUsername) return false;
  const u = String(replyTo.from.username || "").toLowerCase();
  return u === String(botUsername).toLowerCase();
}

export function createBot(token) {
  const bot = new Bot(token);

  bot.use(rateLimitMiddleware({ limit: 5, windowMs: 10_000 }));

  // Commands must be registered by src/commands/loader.js before this handler.
  bot.on("message", async (ctx, next) => {
    // Non-text message handling
    const hasText = typeof ctx.message?.text === "string";

    // Ignore commands here
    if (hasText && ctx.message.text.startsWith("/")) return next();

    // In groups: only respond when mentioned or replied-to
    const botUsername = ctx.me?.username || bot.botInfo?.username || "";
    if (isGroupChat(ctx.chat)) {
      const isMentioned = mentionedByEntity({
        text: ctx.message?.text,
        entities: ctx.message?.entities,
        botUsername
      });

      const replied = isReplyToBot(ctx, botUsername);
      if (!isMentioned && !replied) return;
    }

    if (!hasText) {
      try {
        await ctx.reply("Send text to translate.");
      } catch {}
      return;
    }

    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const { settings } = await getChatSettings(chatId);
    if (!settings.autoTranslate) return;

    const cleaned = stripMention(ctx.message.text, botUsername);
    if (!cleaned) return;

    const botProfile = buildBotProfile({ botUsername });

    try {
      const result = await translateText({
        botProfile,
        text: cleaned,
        directionMode: settings.directionMode
      });

      if (!result.ok) {
        await ctx.reply("Sorry, I couldn't translate that right now.");
        return;
      }

      const out = result.label + "\n" + result.translatedText;
      await ctx.reply(out);
    } catch (e) {
      log.error("[translate] handler failed", { err: safeErr(e) });
      try {
        await ctx.reply("Sorry, something went wrong.");
      } catch {}
    }
  });

  return bot;
}
