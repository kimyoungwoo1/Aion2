-- Automatically refresh all registered characters at 06:00 and 18:00 KST.
-- This is separate from weekly homework / sanctuary reset tables.
CREATE TABLE IF NOT EXISTS character_power_refresh_runs (
    slot TEXT PRIMARY KEY,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    total_count INTEGER NOT NULL DEFAULT 0,
    max_character_id INTEGER NOT NULL DEFAULT 0,
    last_character_id INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('running', 'complete', 'partial'))
);
CREATE INDEX IF NOT EXISTS idx_character_power_refresh_finished
    ON character_power_refresh_runs(finished_at DESC);
