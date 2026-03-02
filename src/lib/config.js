export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

  // Mongo
  MONGODB_URI: process.env.MONGODB_URI || "",

  // CookMyBots AI Gateway
  // Base URL like: https://api.cookmybots.com/api/ai
  COOKMYBOTS_AI_ENDPOINT: process.env.COOKMYBOTS_AI_ENDPOINT || "",
  COOKMYBOTS_AI_KEY: process.env.COOKMYBOTS_AI_KEY || "",

  // Controls (safe fallbacks)
  LOG_LEVEL: (process.env.LOG_LEVEL || "info").toLowerCase(),
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 600000),
  AI_MAX_RETRIES: Number(process.env.AI_MAX_RETRIES || 2),
  CONCURRENCY: Number(process.env.CONCURRENCY || 20)
};
