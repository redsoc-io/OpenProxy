import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.SQLITE_DIR || path.join(__dirname, "../../../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "data.sqlite");
const db = new Database(DB_PATH);

db.exec(
  `CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    url TEXT,
    tested INTEGER DEFAULT 0,
    working INTEGER DEFAULT 0,
    responseTime INTEGER DEFAULT -1,
    streak INTEGER DEFAULT 0,
    addedOn TEXT,
    lastOnline TEXT,
    lastChecked TEXT,
    geo TEXT
  );`
);

// Migration: Add geo column if it doesn't exist
try {
  db.exec(`ALTER TABLE servers ADD COLUMN geo TEXT;`);
} catch (e) {
  // Column already exists
}

export function upsertServer(server) {
  const stmt = db.prepare(
    `INSERT INTO servers (id, url, tested, working, responseTime, streak, addedOn, lastOnline, lastChecked, geo)
     VALUES (@id, @url, @tested, @working, @responseTime, @streak, @addedOn, @lastOnline, @lastChecked, @geo)
     ON CONFLICT(id) DO UPDATE SET
       url=excluded.url,
       tested=excluded.tested,
       working=excluded.working,
       responseTime=excluded.responseTime,
       streak=excluded.streak,
       addedOn=excluded.addedOn,
       lastOnline=excluded.lastOnline,
       lastChecked=excluded.lastChecked,
       geo=excluded.geo;
    `
  );
  stmt.run({
    ...server,
    tested: server.tested ? 1 : 0,
    working: server.working ? 1 : 0,
    addedOn: server.addedOn?.toISOString?.() || server.addedOn || null,
    lastOnline: server.lastOnline?.toISOString?.() || server.lastOnline || null,
    lastChecked:
      server.lastChecked?.toISOString?.() || server.lastChecked || null,
    geo: server.geo || null,
  });
}
