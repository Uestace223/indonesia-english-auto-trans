import { MongoClient } from "mongodb";
import { log } from "./log.js";
import { safeErr } from "./safeErr.js";

let _client = null;
let _db = null;
let _ensured = false;

export async function getDb(mongoUri) {
  if (!mongoUri) return null;
  if (_db) return _db;

  try {
    _client = new MongoClient(mongoUri, { maxPoolSize: 5 });
    await _client.connect();
    _db = _client.db();

    log.info("[db] connected", { mongoConfigured: true });

    if (!_ensured) {
      _ensured = true;
      await ensureIndexes(_db);
    }

    return _db;
  } catch (e) {
    log.error("[db] connect failed", { err: safeErr(e) });
    _client = null;
    _db = null;
    return null;
  }
}

async function ensureIndexes(db) {
  try {
    await db.collection("chat_settings").createIndex({ chatId: 1 }, { unique: true });
  } catch (e) {
    log.warn("[db] ensureIndexes failed", { err: safeErr(e) });
  }
}
