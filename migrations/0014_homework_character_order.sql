-- 로그인 닉네임별 캐릭터 표시 순서는 숙제 주차와 무관하게 영구 저장한다.
-- 숙제/오드 주간 초기화에서는 이 테이블을 삭제하지 않는다.
CREATE TABLE IF NOT EXISTS homework_character_order (
  owner_name TEXT NOT NULL PRIMARY KEY,
  character_ids TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
