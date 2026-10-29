-- 어비스회랑은 수요일 주간 초기화 대상이 아니므로 완료 여부를 계속 유지한다.
-- 0007 이전/이후로 저장된 기존 'abyss' 완료 기록 중 최근 기록을 이관.
INSERT OR IGNORE INTO homework_progress
    (week_start, character_id, task_key, completed, updated_at)
SELECT '1970-01-01', character_id, 'abyss', 1, MAX(updated_at)
FROM homework_progress
WHERE task_key = 'abyss' AND completed = 1
GROUP BY character_id;

-- 기존 주차별 어비스회랑 데이터는 영구 레코드로 옮겼으므로 정리.
DELETE FROM homework_progress
WHERE task_key = 'abyss' AND week_start <> '1970-01-01';
