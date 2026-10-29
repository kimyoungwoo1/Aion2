-- 기존 캐릭터, 파티 배정, 성역 일정은 삭제하지 않습니다.
-- 각 성역의 1~8 파티별 자유 메모와 징표를 저장합니다.
CREATE TABLE IF NOT EXISTS sanctuary_party_details (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  note TEXT NOT NULL DEFAULT '' CHECK(length(note) <= 150),
  marker TEXT NOT NULL DEFAULT '' CHECK(marker IN ('','1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, party_number)
);

-- 기존 파티 배정은 그대로 두고, 참여자별 징표만 신규 컬럼에 추가.
ALTER TABLE sanctuary_party_slots ADD COLUMN marker TEXT NOT NULL DEFAULT '';
