-- User-specific task columns, retained independent of all weekly reset functions.
CREATE TABLE IF NOT EXISTS homework_custom_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(owner_name,title)
);
CREATE INDEX IF NOT EXISTS idx_homework_custom_tasks_owner
  ON homework_custom_tasks(owner_name,id);
CREATE TABLE IF NOT EXISTS homework_custom_progress (
  task_id INTEGER NOT NULL REFERENCES homework_custom_tasks(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0,1)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(task_id,character_id)
);
CREATE TABLE IF NOT EXISTS homework_task_column_orders (
  owner_name TEXT PRIMARY KEY,
  task_keys TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
