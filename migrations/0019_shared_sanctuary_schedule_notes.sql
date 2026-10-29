-- Share the weekly schedule note across 4-star and 3-star sanctuaries.
-- 2-star schedules and per-character party notes remain independent.
CREATE TABLE IF NOT EXISTS sanctuary_shared_schedule_notes (
    week_start TEXT NOT NULL,
    nickname TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    updated_by TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (week_start, nickname)
);

-- Preserve existing nonempty 4/3 notes.  If both have different notes,
-- use the most recently updated one (4-star wins only on an exact timestamp tie).
-- The original sanctuary_schedules rows are NOT deleted or overwritten.
INSERT OR IGNORE INTO sanctuary_shared_schedule_notes
    (week_start, nickname, note, updated_by, updated_at)
SELECT week_start, nickname, note, COALESCE(updated_by, ''), COALESCE(updated_at, 0)
FROM (
    SELECT week_start, nickname, note, updated_by, updated_at,
           ROW_NUMBER() OVER (
               PARTITION BY week_start, nickname
               ORDER BY COALESCE(updated_at, 0) DESC,
                        CASE sanctuary WHEN '4' THEN 0 ELSE 1 END
           ) AS row_number
    FROM sanctuary_schedules
    WHERE sanctuary IN ('4','3') AND TRIM(COALESCE(note,'')) <> ''
)
WHERE row_number = 1;
