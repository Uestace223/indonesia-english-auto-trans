const buckets = new Map();

function nowMs() {
  return Date.now();
}

export function rateLimitMiddleware({ limit = 5, windowMs = 10_000 } = {}) {
  return async (ctx, next) => {
    const userId = ctx.from?.id ? String(ctx.from.id) : "";
    if (!userId) return next();

    const now = nowMs();
    const b = buckets.get(userId) || { start: now, count: 0, warnedAt: 0 };

    if (now - b.start > windowMs) {
      b.start = now;
      b.count = 0;
    }

    b.count += 1;
    buckets.set(userId, b);

    if (b.count > limit) {
      if (now - (b.warnedAt || 0) > windowMs) {
        b.warnedAt = now;
        buckets.set(userId, b);
        try {
          await ctx.reply("You're sending too fast. Please wait a few seconds.");
        } catch {}
      }
      return;
    }

    return next();
  };
}
