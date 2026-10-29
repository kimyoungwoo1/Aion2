-- Convert the membership dropdown to a checkbox: NULL now means normal (0).
-- Never accrue old, unknown recovery time retroactively.
-- Preserve pre-cap balances before correcting any legacy OD1>840 / OD2>2000.
CREATE TABLE IF NOT EXISTS homework_od_limit_backup_20261029 (
  character_id INTEGER PRIMARY KEY,
  original_od1 INTEGER,
  original_od2 INTEGER,
  backed_up_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO homework_od_limit_backup_20261029
  (character_id,original_od1,original_od2,backed_up_at)
SELECT character_id,od1,od2,CAST(strftime('%s','now') AS INTEGER)
FROM homework_od_balances WHERE od1>840 OR od2>2000;

-- Existing valid values and configured membership settings remain intact.
-- If membership was never selected, its currently saved amount becomes the
-- baseline for normal recovery, starting at the migration time.
UPDATE homework_od_balances
SET od1=CASE WHEN od1>840 THEN 840 ELSE od1 END,
    od2=CASE WHEN od2>2000 THEN 2000 ELSE od2 END,
    od1_updated_at=CASE
      WHEN od1_membership IS NULL AND od1 IS NOT NULL THEN CAST(strftime('%s','now') AS INTEGER)
      ELSE od1_updated_at END,
    od1_membership=COALESCE(od1_membership,0)
WHERE od1_membership IS NULL OR od1>840 OR od2>2000;
