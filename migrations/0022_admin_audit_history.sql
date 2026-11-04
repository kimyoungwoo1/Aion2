-- Administrator-only audit data; does not modify existing user tables.
CREATE TABLE IF NOT EXISTS admin_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at INTEGER NOT NULL,
  actor_nickname TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT,
  previous_json TEXT,
  current_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_time ON admin_audit_events(id DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor ON admin_audit_events(actor_nickname, id DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_category ON admin_audit_events(category, id DESC);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_session_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS admin_login_throttle (
  fingerprint TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
