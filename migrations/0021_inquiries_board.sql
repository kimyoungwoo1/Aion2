-- AION2_INQUIRIES_V1. Persistent user questions; no weekly cleanup.
CREATE TABLE IF NOT EXISTS aion_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aion_inquiries_created ON aion_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aion_inquiries_author ON aion_inquiries(author_nickname, id DESC);

CREATE TABLE IF NOT EXISTS aion_inquiry_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL REFERENCES aion_inquiries(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aion_inquiry_replies_inquiry ON aion_inquiry_replies(inquiry_id, id);
CREATE INDEX IF NOT EXISTS idx_aion_inquiry_replies_author ON aion_inquiry_replies(author_nickname, id DESC);
