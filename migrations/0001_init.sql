CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  character_name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  class_name TEXT NOT NULL,
  item_level INTEGER NOT NULL DEFAULT 0 CHECK (item_level >= 0),
  naddol_k REAL NOT NULL DEFAULT 0 CHECK (naddol_k >= 0),
  notes TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_characters_owner_name ON characters (owner_name);
