-- 기존 캐릭터, 성역 일정, 파티 위치, 파티 비고는 유지.
-- 참여자별 징표를 파티 배정과 독립적으로 보관.
CREATE TABLE IF NOT EXISTS sanctuary_member_markers (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  marker TEXT NOT NULL CHECK(marker IN ('1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname)
);
INSERT OR IGNORE INTO sanctuary_member_markers (sanctuary,nickname,marker,updated_by,updated_at)
SELECT sanctuary,nickname,marker,updated_by,updated_at
FROM sanctuary_party_slots
WHERE marker IN ('1','2','3','4','5','star','skull','moon');

-- 기존 '영구' 어비스회랑 완료 기록은 현재 수/토 21시 주기에 맞춰 이전한다.
-- UTC now - 12시간 -> KST 21:00 경계에서 전환되는 날짜.
-- SQLite weekday: 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토.
INSERT OR IGNORE INTO homework_progress (week_start,character_id,task_key,completed,updated_at)
SELECT date('now','-12 hours','-' || (
    CASE CAST(strftime('%w','now','-12 hours') AS INTEGER)
      WHEN 0 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 3 WHEN 3 THEN 0
      WHEN 4 THEN 1 WHEN 5 THEN 2 ELSE 0 END
    ) || ' days'),
       character_id, task_key, completed, updated_at
FROM homework_progress
WHERE task_key='abyss' AND week_start='1970-01-01' AND completed=1;
DELETE FROM homework_progress WHERE task_key='abyss' AND week_start='1970-01-01';
