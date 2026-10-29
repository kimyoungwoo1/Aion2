-- 4·3성역의 고정 명단은 별개지만, 같은 사람의 요일별 가능 여부는 공동 사용.
-- 기존 주차별 일정 레코드를 지우거나 초기화하지 않는다.
CREATE TABLE IF NOT EXISTS sanctuary_members (
  sanctuary TEXT NOT NULL CHECK (sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname)
);
CREATE INDEX IF NOT EXISTS idx_sanctuary_members_sanctuary ON sanctuary_members (sanctuary);

CREATE TABLE IF NOT EXISTS sanctuary_shared_availability (
  week_start TEXT NOT NULL,
  nickname TEXT NOT NULL COLLATE NOCASE,
  statuses TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start, nickname)
);

-- 이전에 일정 저장한 참여자는 자동으로 고정 명단으로 승격한다.
INSERT OR IGNORE INTO sanctuary_members (sanctuary, nickname, created_by, created_at)
SELECT sanctuary, nickname, updated_by, updated_at
FROM sanctuary_schedules;

-- 양쪽에 서로 다른 기존 일정이 있으면 마지막 수정 기록을 초기 공통 값으로 삼는다.
-- 수정 시각이 같으면 4성역의 값을 우선 사용한다.
INSERT OR IGNORE INTO sanctuary_shared_availability (week_start, nickname, statuses, updated_by, updated_at)
SELECT s.week_start, s.nickname, s.statuses, s.updated_by, s.updated_at
FROM sanctuary_schedules s
WHERE s.sanctuary IN ('4','3')
AND NOT EXISTS (
  SELECT 1 FROM sanctuary_schedules newer
  WHERE newer.sanctuary IN ('4','3')
    AND newer.week_start = s.week_start AND newer.nickname = s.nickname
    AND (newer.updated_at > s.updated_at OR
         (newer.updated_at = s.updated_at AND newer.sanctuary > s.sanctuary))
);
