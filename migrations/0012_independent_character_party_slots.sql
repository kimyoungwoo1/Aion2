-- 인원별 1개 슬롯 방식에서 실제 캐릭터 ID별 독립 편성으로 전환.
-- 기존 테이블은 삭제하지 않으며, 현재 연결되어 있는 캐릭터의 파티/징표를 이전한다.
-- 기존 캐릭터/숙제/일정/캐릭터별 비고는 변경하지 않는다.
CREATE TABLE IF NOT EXISTS sanctuary_character_party_slots (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id),
  UNIQUE (sanctuary, party_number, slot_number)
);
CREATE INDEX IF NOT EXISTS idx_sanctuary_character_party_slots
ON sanctuary_character_party_slots(sanctuary,party_number,slot_number);

CREATE TABLE IF NOT EXISTS sanctuary_character_markers (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  marker TEXT NOT NULL CHECK(marker IN ('1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id)
);

-- 과거에는 닉네임당 하나의 캐릭터만 선택할 수 있었다.
-- 연결된 ID가 있다면 그것을 우선하고, 없으면 예전 자동연결 규칙을 사용한다.
INSERT OR IGNORE INTO sanctuary_character_party_slots
  (sanctuary, character_id, party_number, slot_number, updated_by, updated_at)
SELECT p.sanctuary,
  COALESCE(mc.character_id, (
    SELECT c.id FROM characters c
    WHERE c.owner_name = p.nickname COLLATE NOCASE
      AND c.character_name = p.nickname COLLATE NOCASE
      AND (SELECT COUNT(*) FROM characters x
           WHERE x.character_name = p.nickname COLLATE NOCASE) = 1
    ORDER BY c.id LIMIT 1
  )), p.party_number, p.slot_number, p.updated_by, p.updated_at
FROM sanctuary_party_slots p
LEFT JOIN sanctuary_member_characters mc
  ON mc.sanctuary = p.sanctuary AND mc.nickname = p.nickname
WHERE COALESCE(mc.character_id, (
    SELECT c.id FROM characters c
    WHERE c.owner_name = p.nickname COLLATE NOCASE
      AND c.character_name = p.nickname COLLATE NOCASE
      AND (SELECT COUNT(*) FROM characters x
           WHERE x.character_name = p.nickname COLLATE NOCASE) = 1
    ORDER BY c.id LIMIT 1
)) IS NOT NULL;

INSERT OR IGNORE INTO sanctuary_character_markers
  (sanctuary, character_id, marker, updated_by, updated_at)
SELECT mm.sanctuary,
  COALESCE(mc.character_id, (
    SELECT c.id FROM characters c
    WHERE c.owner_name = mm.nickname COLLATE NOCASE
      AND c.character_name = mm.nickname COLLATE NOCASE
      AND (SELECT COUNT(*) FROM characters x
           WHERE x.character_name = mm.nickname COLLATE NOCASE) = 1
    ORDER BY c.id LIMIT 1
  )), mm.marker, mm.updated_by, mm.updated_at
FROM sanctuary_member_markers mm
LEFT JOIN sanctuary_member_characters mc
  ON mc.sanctuary = mm.sanctuary AND mc.nickname = mm.nickname
WHERE COALESCE(mc.character_id, (
    SELECT c.id FROM characters c
    WHERE c.owner_name = mm.nickname COLLATE NOCASE
      AND c.character_name = mm.nickname COLLATE NOCASE
      AND (SELECT COUNT(*) FROM characters x
           WHERE x.character_name = mm.nickname COLLATE NOCASE) = 1
    ORDER BY c.id LIMIT 1
)) IS NOT NULL;
