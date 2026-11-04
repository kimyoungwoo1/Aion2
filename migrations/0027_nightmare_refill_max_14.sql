-- Correct Nightmare refill capacity to 14 without resetting existing progress.
UPDATE homework_custom_tasks
SET max_count=14
WHERE title='악몽' AND task_type='count';
