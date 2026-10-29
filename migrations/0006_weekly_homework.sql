-- 개인 잠금 코드는 해시+salt만 저장. 개인별 숙제 데이터는 서버에서 접근 통제.
CREATE TABLE IF NOT EXISTS homework_users (
  nickname TEXT PRIMARY KEY COLLATE NOCASE,
  pin_salt TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS homework_sessions (
  token_hash TEXT PRIMARY KEY,
  nickname TEXT NOT NULL COLLATE NOCASE,
  login_token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_homework_sessions_expiry ON homework_sessions(expires_at);
CREATE TABLE IF NOT EXISTS homework_progress (
  week_start TEXT NOT NULL,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL CHECK(task_key IN ('abyss','awakening','rudra','invasion','muspel','deltras','trial','craft')),
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start,character_id,task_key)
);
CREATE INDEX IF NOT EXISTS idx_homework_progress_week ON homework_progress(week_start);
