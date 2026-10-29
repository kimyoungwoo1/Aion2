-- 21 server matching records are stored together as JSON for atomic updates.
-- Weekly reset/cron only deletes known homework/schedule tables: this persists.
CREATE TABLE IF NOT EXISTS content_schedule_server_matches (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
