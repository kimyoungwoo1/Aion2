#!/usr/bin/env python3
import sqlite3
from pathlib import Path

sql = (Path(__file__).resolve().parents[1] / 'migrations/0021_inquiries_board.sql').read_text(encoding='utf-8')
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys = ON')
db.executescript(sql)
db.execute("INSERT INTO aion_inquiries(author_nickname,title,content,created_at) VALUES('슬롱','질문','내용',12345)")
db.execute("INSERT INTO aion_inquiry_replies(inquiry_id,author_nickname,content,created_at) VALUES(1,'MID','답글',12346)")
assert db.execute('SELECT COUNT(*) FROM aion_inquiry_replies').fetchone()[0] == 1
db.execute('DELETE FROM aion_inquiries WHERE id=1')
assert db.execute('SELECT COUNT(*) FROM aion_inquiry_replies').fetchone()[0] == 0
print('PASS: D1 SQLite migration and reply foreign-key cascade.')
