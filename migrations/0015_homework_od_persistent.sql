-- Convert od1 and od2 to persistent balances per character (NOT per week).
-- Keep the old weekly table as a read-only archive. Do not destroy historical values.
-- For each character, the most recent weekly record wins, including explicit NULLs.
CREATE TABLE IF NOT EXISTS homework_od_balances (
  character_id INTEGER PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER CHECK (od1 IS NULL OR (od1 BETWEEN 0 AND 999999999)),
  od2 INTEGER CHECK (od2 IS NULL OR (od2 BETWEEN 0 AND 999999999)),
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO homework_od_balances(character_id, od1, od2, updated_at)
SELECT old.character_id, old.od1, old.od2, old.updated_at
FROM homework_od_amounts AS old
WHERE old.rowid = (
  SELECT latest.rowid
  FROM homework_od_amounts AS latest
  WHERE latest.character_id = old.character_id
  ORDER BY latest.week_start DESC, latest.updated_at DESC, latest.rowid DESC
  LIMIT 1
);
