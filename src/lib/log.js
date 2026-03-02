import { cfg } from "./config.js";

const levelOrder = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function shouldLog(level) {
  const cur = levelOrder[cfg.LOG_LEVEL] ?? levelOrder.info;
  return (levelOrder[level] ?? 999) >= cur;
}

export const log = {
  debug: (msg, meta = undefined) => {
    if (!shouldLog("debug")) return;
    console.log("[debug]", msg, meta || "");
  },
  info: (msg, meta = undefined) => {
    if (!shouldLog("info")) return;
    console.log("[info]", msg, meta || "");
  },
  warn: (msg, meta = undefined) => {
    if (!shouldLog("warn")) return;
    console.warn("[warn]", msg, meta || "");
  },
  error: (msg, meta = undefined) => {
    if (!shouldLog("error")) return;
    console.error("[error]", msg, meta || "");
  }
};
