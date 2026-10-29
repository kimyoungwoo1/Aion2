#!/usr/bin/env python3
"""No network. Verify note migration and safe preservation for 2-star/party data."""
from pathlib import Path
import sqlite3
import sys

root = Path(__file__).resolve().parents[1]
sql = (root / 'migrations/0019_shared_sanctuary_schedule_notes.sql').read_text(encoding='utf-8')
db = sqlite3.connect(':memory:')
db.row_factory = sqlite3.Row
db.executescript('''
CREATE TABLE sanctuary_schedules (
 sanctuary TEXT, week_start TEXT, nickname TEXT, statuses TEXT, note TEXT,
 updated_by TEXT, updated_at INTEGER,
 PRIMARY KEY(sanctuary,week_start,nickname));
CREATE TABLE sanctuary_members (sanctuary TEXT,nickname TEXT, PRIMARY KEY(sanctuary,nickname));
CREATE TABLE sanctuary_shared_availability (
 week_start TEXT, nickname TEXT, statuses TEXT, updated_by TEXT, updated_at INTEGER,
 PRIMARY KEY(week_start,nickname));
CREATE TABLE sanctuary_character_notes (sanctuary TEXT, character_id INTEGER, note TEXT,
 PRIMARY KEY(sanctuary, character_id));
''')
week = '2026-10-28'
db.executemany('INSERT INTO sanctuary_schedules VALUES (?,?,?,?,?,?,?)', [
    ('4',week,'슬롱','[]','4성역 비고','슬롱',10),
    ('3',week,'슬롱','[]','3성역 최신 비고','슬롱',20),
    ('2',week,'슬롱','[]','2성역 독립 비고','슬롱',30),
    ('4',week,'MID','[]','4성역 동일 시각','MID',50),
    ('3',week,'MID','[]','3성역 동일 시각','MID',50),
    ('3',week,'니코틴','[]','','니코틴',88),
    ('4',week,'니코틴','[]','기존 비고 보존','니코틴',10),
])
db.executemany('INSERT INTO sanctuary_members VALUES (?,?)', [('4','슬롱'),('3','슬롱'),('2','슬롱')])
db.execute('INSERT INTO sanctuary_character_notes VALUES (?,?,?)',('4',123,'파티 비고 유지'))
db.executescript(sql)
shared = db.execute('SELECT nickname,note FROM sanctuary_shared_schedule_notes').fetchall()
notes = {r['nickname']:r['note'] for r in shared}
assert notes == {'슬롱':'3성역 최신 비고','MID':'4성역 동일 시각','니코틴':'기존 비고 보존'}, notes
# Simulate saving in 4-star; reading 3-star must immediately show same note.
db.execute('UPDATE sanctuary_shared_schedule_notes SET note=? WHERE week_start=? AND nickname=?',('공통 수정',week,'슬롱'))
read = '''SELECT m.nickname, COALESCE(shared.statuses, ?) AS statuses,
COALESCE(shared_note.note, '') AS note
FROM sanctuary_members m
LEFT JOIN sanctuary_shared_availability shared ON shared.week_start=? AND shared.nickname=m.nickname
LEFT JOIN sanctuary_shared_schedule_notes shared_note ON shared_note.week_start=? AND shared_note.nickname=m.nickname
WHERE m.sanctuary=?'''
for sanct in ('4','3'):
    result = db.execute(read,('[]',week,week,sanct)).fetchone()
    assert result['note'] == '공통 수정', (sanct,result['note'])
assert db.execute("SELECT note FROM sanctuary_schedules WHERE sanctuary='2'").fetchone()[0] == '2성역 독립 비고'
assert db.execute("SELECT note FROM sanctuary_character_notes WHERE sanctuary='4'").fetchone()[0] == '파티 비고 유지'
assert db.execute("SELECT note FROM sanctuary_schedules WHERE sanctuary='4' AND nickname='슬롱'").fetchone()[0] == '4성역 비고'
# Explicitly clearing the shared note should clear it on both sides without local note resurrection.
db.execute('DELETE FROM sanctuary_shared_schedule_notes WHERE week_start=? AND nickname=?',(week,'슬롱'))
for sanct in ('4','3'):
    assert db.execute(read,('[]',week,week,sanct)).fetchone()['note'] == ''
print('PASS: legacy notes migrated, latest chosen, 4/3 synchronized, 2/party notes isolated, clear works')
