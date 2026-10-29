-- 성역별 캐릭터 연결 / 파티 배치. 기존 일정 데이터와 로그인 설정을 건드리지 않습니다.
CREATE TABLE IF NOT EXISTS sanctuary_member_characters (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname),
  UNIQUE (sanctuary, character_id)
);

CREATE TABLE IF NOT EXISTS sanctuary_party_slots (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname),
  UNIQUE (sanctuary, party_number, slot_number)
);
CREATE INDEX IF NOT EXISTS idx_sanctuary_party_slots_party
ON sanctuary_party_slots(sanctuary,party_number,slot_number);
