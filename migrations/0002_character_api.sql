-- 기존 캐릭터 정보를 유지하면서 서버 ID / API 최종 조회 시각 추가
-- 기존에 서버 정보가 없는 캐릭터는 Google Apps Script 기본값인 2003 적용
-- 서버별 동일 캐릭터명을 등록할 수 있도록 복합 UNIQUE로 변경
CREATE TABLE characters_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  character_name TEXT NOT NULL COLLATE NOCASE,
  server_id INTEGER NOT NULL DEFAULT 2003 CHECK (server_id BETWEEN 1 AND 999999),
  class_name TEXT NOT NULL,
  item_level INTEGER NOT NULL DEFAULT 0 CHECK (item_level >= 0),
  naddol_k REAL NOT NULL DEFAULT 0 CHECK (naddol_k >= 0),
  notes TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  synced_at INTEGER,
  UNIQUE (server_id, character_name)
);

INSERT INTO characters_v2
  (id, owner_name, character_name, server_id, class_name, item_level,
   naddol_k, notes, updated_by, updated_at, synced_at)
SELECT id, owner_name, character_name, 2003, class_name, item_level,
       naddol_k, notes, updated_by, updated_at, NULL
FROM characters;

DROP TABLE characters;
ALTER TABLE characters_v2 RENAME TO characters;
CREATE INDEX idx_characters_owner_name ON characters (owner_name);
