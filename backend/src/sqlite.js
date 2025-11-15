import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";

// emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.SQLITE_DIR || path.join(__dirname, "../../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "data.sqlite");
const db = new Database(DB_PATH);

// Schema init
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

// Create indexes for performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_working ON servers(working);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_streak ON servers(streak);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_response ON servers(responseTime);`);

export function upsertServer(s) {
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
    ...s,
    tested: s.tested ? 1 : 0,
    working: s.working ? 1 : 0,
    addedOn: s.addedOn?.toISOString?.() || s.addedOn || null,
    lastOnline: s.lastOnline?.toISOString?.() || s.lastOnline || null,
    lastChecked: s.lastChecked?.toISOString?.() || s.lastChecked || null,
    geo: s.geo || null,
  });
}

export function getServers({ working = null } = {}) {
  let q = "SELECT * FROM servers";
  const params = [];
  if (working !== null) {
    q += " WHERE working = ?";
    params.push(working ? 1 : 0);
  }
  q += " ORDER BY streak DESC, responseTime ASC";
  return db
    .prepare(q)
    .all(...params)
    .map((r) => ({
      ...r,
      tested: !!r.tested,
      working: !!r.working,
      addedOn: r.addedOn ? new Date(r.addedOn) : null,
      lastOnline: r.lastOnline ? new Date(r.lastOnline) : null,
      lastChecked: r.lastChecked ? new Date(r.lastChecked) : null,
    }));
}
