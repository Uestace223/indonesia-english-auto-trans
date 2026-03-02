const log = {
  info:  (...a) => console.log(...a),
  warn:  (...a) => console.warn(...a),
  error: (...a) => console.error(...a),
};

import { getDb } from "../lib/db.js";
import { cfg } from "../lib/config.js";

import { safeErr } from "../lib/safeErr.js";

const COL = "chat_settings";

export function defaultChatSettings(chatId) {
  return {
    chatId: String(chatId),
    autoTranslate: true,
    directionMode: "auto" // "auto" | "toen" | "toid"
  };
}

export async function getChatSettings(chatId) {
  const id = String(chatId);
  const db = await getDb(cfg.MONGODB_URI);
  if (!db) return { settings: defaultChatSettings(id), persisted: false };

  try {
    const row = await db.collection(COL).findOne({ chatId: id });
    if (!row) {
      const def = defaultChatSettings(id);
      await db.collection(COL).updateOne(
        { chatId: id },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: { ...def, updatedAt: new Date() }
        },
        { upsert: true }
      );
      return { settings: def, persisted: true };
    }

    return {
      settings: {
        chatId: id,
        autoTranslate: row.autoTranslate !== false,
        directionMode: row.directionMode === "toen" || row.directionMode === "toid" ? row.directionMode : "auto"
      },
      persisted: true
    };
  } catch (e) {
    log.error("[db] read failed", { col: COL, op: "findOne", err: safeErr(e) });
    return { settings: defaultChatSettings(id), persisted: false };
  }
}

export async function updateChatSettings(chatId, patch) {
  const id = String(chatId);
  const db = await getDb(cfg.MONGODB_URI);
  if (!db) {
    return { ok: false, error: "DB_NOT_CONFIGURED" };
  }

  const mutable = { ...patch };
  delete mutable._id;
  delete mutable.createdAt;

  try {
    await db.collection(COL).updateOne(
      { chatId: id },
      {
        $setOnInsert: { },
        $set: { ...mutable, chatId: id, updatedAt: new Date() }
      },
      { upsert: true }
    );
    return { ok: true };
  } catch (e) {
    log.error("[db] write failed", { col: COL, op: "updateOne", err: safeErr(e) });
    return { ok: false, error: safeErr(e) };
  }
}
