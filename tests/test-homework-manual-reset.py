#!/usr/bin/env python3
"""Static API/UI checks + real SQLite deletion scope and preservation checks."""
from pathlib import Path
import re
import sqlite3

root = Path(__file__).resolve().parent.parent
html = (root / 'public/index.html').read_text(encoding='utf-8')
app = (root / 'public/app.js').read_text(encoding='utf-8')
server = (root / 'src/index.js').read_text(encoding='utf-8')

assert html.count('id="hwReset"') == 1, '현황 초기화 버튼이 하나 있어야 합니다.'
assert html.index('id="hwReset"') < html.index('id="hwReload"'), '현황 초기화는 새로고침 왼쪽이어야 합니다.'
assert app.count("$('hwReset').addEventListener('click'") == 1
assert "window.confirm(" in app
assert "api('/api/homework/reset', 'POST', {confirm:true})" in app
assert "path === '/api/homework/reset'" in server
assert 'body.confirm !== true' in server

# Extract and execute the exact SQL used by the API; do not maintain a duplicate query.
match = re.search(
    r"path === '/api/homework/reset'\)[\s\S]*?env\.DB\.prepare\(`(\s*DELETE FROM homework_progress[\s\S]*?)`\)"
    r"\.bind\(nickname, abyssPeriod, week\)\.run\(\)", server
)
assert match, 'API 초기화 SQL을 찾지 못했습니다.'
sql = match.group(1)
assert sql.count('?') == 3
assert 'owner_name = ?' in sql
assert "task_key = 'abyss'" in sql
assert "task_key <> 'abyss'" in sql
assert 'homework_od_balances' not in sql
assert 'homework_character_order' not in sql

conn = sqlite3.connect(':memory:')
conn.executescript('''
 CREATE TABLE characters (id INTEGER PRIMARY KEY, owner_name TEXT NOT NULL);
 CREATE TABLE homework_progress (week_start TEXT, character_id INTEGER, task_key TEXT, completed INTEGER);
 CREATE TABLE homework_od_balances (character_id INTEGER PRIMARY KEY, od1 INTEGER, od2 INTEGER, od1_membership INTEGER);
 CREATE TABLE homework_character_order (owner_name TEXT PRIMARY KEY, character_ids TEXT);
 INSERT INTO characters VALUES (1,'슬롱'), (2,'슬롱'), (3,'MID');
 INSERT INTO homework_progress VALUES
  ('2026-10-28',1,'awakening',1),
  ('2026-10-28',2,'rudra',1),
  ('2026-10-31',1,'abyss',1),
  ('2026-10-31',2,'abyss',1),
  ('2026-10-21',1,'trial',1),
  ('2026-10-28',3,'awakening',1),
  ('2026-10-31',3,'abyss',1),
  ('2026-10-28',3,'craft',1);
 INSERT INTO homework_od_balances VALUES (1,680,2700,1), (2,100,1500,0), (3,500,1000,1);
 INSERT INTO homework_character_order VALUES ('슬롱','[2,1]'), ('MID','[3]');
''')
original_od = conn.execute('SELECT * FROM homework_od_balances ORDER BY character_id').fetchall()
original_order = conn.execute('SELECT * FROM homework_character_order ORDER BY owner_name').fetchall()
updated = conn.execute(sql, ('슬롱', '2026-10-31', '2026-10-28'))
assert updated.rowcount == 4, ('삭제 개수 불일치', updated.rowcount)
remains = conn.execute('SELECT week_start, character_id, task_key FROM homework_progress ORDER BY character_id, week_start, task_key').fetchall()
assert remains == [
    ('2026-10-21', 1, 'trial'),
    ('2026-10-28', 3, 'awakening'),
    ('2026-10-28', 3, 'craft'),
    ('2026-10-31', 3, 'abyss'),
], remains
assert conn.execute('SELECT * FROM homework_od_balances ORDER BY character_id').fetchall() == original_od
assert conn.execute('SELECT * FROM homework_character_order ORDER BY owner_name').fetchall() == original_order
assert conn.execute(sql, ('슬롱', '2026-10-31', '2026-10-28')).rowcount == 0
print('PASS: left-of-refresh button, confirmation, owner-only current homework/abyss reset, od/membership/order preserved, repeat-safe')
