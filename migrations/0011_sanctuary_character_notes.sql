-- 캐릭터별 비고는 각 성역 내 실제 캐릭터 ID에 귀속한다.
-- 기존 캐릭터/일정/파티/징표 및 과거 파티 비고 데이터는 삭제하지 않는다.
CREATE TABLE IF NOT EXISTS sanctuary_character_notes (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '' CHECK(length(note) <= 150),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
