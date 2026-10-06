-- Alamat sementara. Barisnya tidak pernah dihapus: setelah kedaluwarsa/dihapus, token_hash
-- dikosongkan dan deleted_at diisi (batu nisan), supaya alamat lama tidak bisa dipakai ulang
-- orang lain dan menerima email reset kata sandi milik pemilik sebelumnya.
CREATE TABLE addresses (
  address    TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE,              -- SHA-256 (hex) dari token akses; NULL setelah dihapus
  created_at INTEGER NOT NULL,         -- epoch ms
  expires_at INTEGER NOT NULL,         -- epoch ms
  deleted_at INTEGER                   -- epoch ms; NULL = masih aktif
);
CREATE INDEX addresses_live_expiry ON addresses (expires_at) WHERE deleted_at IS NULL;

-- Metadata surat. Isi (text/html) dan lampiran ada di R2:
--   m/<id>/body.json   {"text": "...", "html": "..."}
--   m/<id>/a/<n>       lampiran ke-n
CREATE TABLE messages (
  id           TEXT PRIMARY KEY,
  address      TEXT NOT NULL,
  folder       TEXT NOT NULL CHECK (folder IN ('inbox', 'spam', 'sent')),
  from_name    TEXT NOT NULL DEFAULT '',
  from_address TEXT NOT NULL DEFAULT '',
  to_address   TEXT NOT NULL,
  subject      TEXT NOT NULL DEFAULT '',
  date         INTEGER NOT NULL,       -- waktu diterima, epoch ms
  snippet      TEXT NOT NULL DEFAULT '',
  spam_score   REAL NOT NULL DEFAULT 0,
  spam_reasons TEXT NOT NULL DEFAULT '[]',
  rescue       TEXT,                   -- JSON {code, copy, link} kalau ada OTP/tautan verifikasi
  attachments  TEXT NOT NULL DEFAULT '[]', -- JSON [{name, type, size, cid?}]
  in_reply_to  TEXT,
  size         INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX messages_by_address ON messages (address, date);

-- Pembatas laju sederhana (jendela tetap), mis. pembuatan alamat per IP.
CREATE TABLE rate_limits (
  key      TEXT PRIMARY KEY,
  count    INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
