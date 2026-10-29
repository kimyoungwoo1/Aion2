-- 오드1/오드2는 캐릭터별로 수동 입력한다. 매주 수요일 오전 05:00(KST) 새 주가 시작된다.
-- 오드합은 저장하지 않고, 조회/화면에서 두 값을 합산한다.
CREATE TABLE IF NOT EXISTS homework_od_amounts (
  week_start TEXT NOT NULL,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER CHECK (od1 IS NULL OR (od1 BETWEEN 0 AND 999999999)),
  od2 INTEGER CHECK (od2 IS NULL OR (od2 BETWEEN 0 AND 999999999)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start, character_id)
);
CREATE INDEX IF NOT EXISTS idx_homework_od_amounts_week ON homework_od_amounts(week_start);
