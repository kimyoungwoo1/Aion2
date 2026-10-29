-- 월요일(과거 시작일) -> 수요일(새 시작일) 주간 데이터 전환.
-- 기존 월~일 배열은 [수,목,금,토,일,미입력,미입력] 순서로 보존합니다.
-- 같은 주의 월/화(이전 기간)는 새 주에 포함되지 않으며, 다음 주 월/화는 새로 입력합니다.
-- 기존에 수요일 키로 저장된 내용이 있다면 해당 데이터를 우선합니다.
INSERT OR IGNORE INTO sanctuary_shared_availability
  (week_start,nickname,statuses,updated_by,updated_at)
SELECT date(week_start,'+2 days'), nickname,
  json_array(json_extract(statuses,'$[2]'),json_extract(statuses,'$[3]'),
             json_extract(statuses,'$[4]'),json_extract(statuses,'$[5]'),
             json_extract(statuses,'$[6]'),'',''),
  updated_by,updated_at
FROM sanctuary_shared_availability WHERE strftime('%w', week_start) = '1';

INSERT OR IGNORE INTO sanctuary_schedules
  (sanctuary,week_start,nickname,statuses,note,updated_by,updated_at)
SELECT sanctuary,date(week_start,'+2 days'),nickname,
  json_array(json_extract(statuses,'$[2]'),json_extract(statuses,'$[3]'),
             json_extract(statuses,'$[4]'),json_extract(statuses,'$[5]'),
             json_extract(statuses,'$[6]'),'',''),
  note,updated_by,updated_at
FROM sanctuary_schedules WHERE strftime('%w', week_start) = '1';

-- 수요일 00:00 KST 이후 기록된 완료 정보만 새 주차로 이어받습니다.
INSERT OR IGNORE INTO homework_progress
  (week_start,character_id,task_key,completed,updated_at)
SELECT date(week_start,'+2 days'),character_id,task_key,completed,updated_at
FROM homework_progress
WHERE strftime('%w',week_start) = '1'
  AND updated_at >= unixepoch(date(week_start,'+2 days') || ' 00:00:00','-9 hours');

DELETE FROM sanctuary_shared_availability WHERE strftime('%w',week_start) = '1';
DELETE FROM sanctuary_schedules WHERE strftime('%w',week_start) = '1';
DELETE FROM homework_progress WHERE strftime('%w',week_start) = '1';

-- 예전 개인 코드/잠금 인증은 더 이상 사용하지 않습니다.
DROP TABLE IF EXISTS homework_sessions;
DROP TABLE IF EXISTS homework_users;
