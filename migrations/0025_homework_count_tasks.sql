-- Counter-type optional homework tasks (weekly reset) and task type metadata.
ALTER TABLE homework_custom_tasks ADD COLUMN task_type TEXT NOT NULL DEFAULT 'toggle'
  CHECK (task_type IN ('toggle','count'));
ALTER TABLE homework_custom_tasks ADD COLUMN max_count INTEGER NOT NULL DEFAULT 0
  CHECK (max_count >= 0);
CREATE TABLE IF NOT EXISTS homework_custom_count_progress (
  task_id INTEGER NOT NULL REFERENCES homework_custom_tasks(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(task_id,character_id,week_start)
);
CREATE INDEX IF NOT EXISTS idx_homework_custom_count_week
  ON homework_custom_count_progress(week_start,task_id,character_id);
