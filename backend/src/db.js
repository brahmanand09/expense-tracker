import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'store.sqlite');

export const db = new Database(dbPath);

// PRAGMA & init
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('INR','USD')),
    category TEXT NOT NULL CHECK (category IN ('Food','Travel','Utilities','Other')),
    description TEXT,
    timestamp_utc TEXT NOT NULL,
    amount_in_inr REAL,
    original_rate REAL,
    pending_conversion INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS exchange_cache (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    rate REAL,
    fetched_at_utc TEXT
  );

  INSERT OR IGNORE INTO exchange_cache (id, rate, fetched_at_utc)
  VALUES (1, NULL, NULL);
`);
