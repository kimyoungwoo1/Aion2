-- Daily dungeon becomes a completion toggle. Nightmare and Shuggo use persistent refill charges.
CREATE TABLE IF NOT EXISTS homework_refill_count_progress (
  task_id INTEGER NOT NULL REFERENCES homework_custom_tasks(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  count INTEGER NOT NULL CHECK (count >= 0),
  last_refill_slot INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(task_id,character_id)
);
CREATE INDEX IF NOT EXISTS idx_homework_refill_character
  ON homework_refill_count_progress(character_id,task_id);

-- Preserve completed daily-dungeon states when converting remaining count 0 into a toggle.
INSERT OR IGNORE INTO homework_custom_progress(task_id,character_id,completed,updated_at)
SELECT DISTINCT p.task_id,p.character_id,1,unixepoch()
FROM homework_custom_count_progress p
JOIN homework_custom_tasks t ON t.id=p.task_id
WHERE t.title='일일 던전' AND p.count<=0;

UPDATE homework_custom_tasks
SET task_type='toggle',max_count=0
WHERE title='일일 던전';

-- Nightmare capacity changes to two. Existing weekly "used count" values are
-- not meaningful as refill balances, so initialize the new balance to full.
UPDATE homework_custom_tasks SET max_count=2
WHERE title='악몽' AND task_type='count';

INSERT OR IGNORE INTO homework_refill_count_progress
  (task_id,character_id,count,last_refill_slot,updated_at)
SELECT t.id,c.id,2,CAST((unixepoch()+14400)/43200 AS INTEGER),unixepoch()
FROM homework_custom_tasks t
JOIN characters c ON c.owner_name=t.owner_name
WHERE t.title='악몽' AND t.task_type='count';
