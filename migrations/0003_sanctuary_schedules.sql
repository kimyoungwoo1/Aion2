-- 3개 성역을 독립적으로 관리. 기존 캐릭터와 로그인 세션은 변경하지 않음.
-- (성역, 월요일 시작일, 닉네임) 단위로 주간 일정 1건씩 보관.
CREATE TABLE IF NOT EXISTS sanctuary_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sanctuary TEXT NOT NULL CHECK (sanctuary IN ('4','3','2')),
  week_start TEXT NOT NULL,
  nickname TEXT NOT NULL COLLATE NOCASE,
  statuses TEXT NOT NULL DEFAULT '["","","","","", "", ""]',
  note TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (sanctuary, week_start, nickname)
);
CREATE INDEX IF NOT EXISTS idx_sanctuary_schedules_week
ON sanctuary_schedules (week_start, sanctuary);
