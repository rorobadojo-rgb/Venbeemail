// Penyimpanan SQLite (node:sqlite, bawaan Node.js 22+). Satu berkas: mudah dicadangkan.

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
-- Alamat sementara. Barisnya tidak pernah dihapus: setelah kedaluwarsa/dihapus, token_hash
-- dikosongkan dan deleted_at diisi (batu nisan), supaya alamat lama tidak bisa dipakai ulang
-- orang lain dan menerima email reset kata sandi milik pemilik sebelumnya.
CREATE TABLE IF NOT EXISTS addresses (
  address    TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS addresses_live_expiry ON addresses (expires_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS messages (
  id           TEXT PRIMARY KEY,
  address      TEXT NOT NULL,
  folder       TEXT NOT NULL CHECK (folder IN ('inbox', 'spam', 'sent')),
  from_name    TEXT NOT NULL DEFAULT '',
  from_address TEXT NOT NULL DEFAULT '',
  to_address   TEXT NOT NULL,
  subject      TEXT NOT NULL DEFAULT '',
  date         INTEGER NOT NULL,
  snippet      TEXT NOT NULL DEFAULT '',
  spam_score   REAL NOT NULL DEFAULT 0,
  spam_reasons TEXT NOT NULL DEFAULT '[]',
  auth         TEXT NOT NULL DEFAULT '{}',
  rescue       TEXT,
  attachments  TEXT NOT NULL DEFAULT '[]',
  in_reply_to  TEXT,
  size         INTEGER NOT NULL DEFAULT 0,
  text_body    TEXT NOT NULL DEFAULT '',
  html_body    TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS messages_by_address ON messages (address, date);

CREATE TABLE IF NOT EXISTS files (
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  n          INTEGER NOT NULL,
  data       BLOB NOT NULL,
  PRIMARY KEY (message_id, n)
);
`;

export function openDb(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA auto_vacuum = INCREMENTAL;'); // berlaku untuk berkas baru; ruang lampiran lama bisa dikembalikan
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);

  const q = (sql) => db.prepare(sql);
  const stmts = {
    insertAddress: q('INSERT INTO addresses (address, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(address) DO NOTHING'),
    addressByToken: q('SELECT address, expires_at FROM addresses WHERE token_hash = ? AND deleted_at IS NULL'),
    liveAddress: q('SELECT address, expires_at FROM addresses WHERE address = ? AND deleted_at IS NULL AND expires_at > ?'),
    expired: q('SELECT address FROM addresses WHERE deleted_at IS NULL AND expires_at <= ? LIMIT 500'),
    tombstone: q('UPDATE addresses SET token_hash = NULL, deleted_at = ? WHERE address = ?'),
    deleteMessages: q('DELETE FROM messages WHERE address = ?'),
    insertMessage: q(`INSERT INTO messages (id, address, folder, from_name, from_address, to_address, subject, date, snippet,
      spam_score, spam_reasons, auth, rescue, attachments, in_reply_to, size, text_body, html_body)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    insertFile: q('INSERT INTO files (message_id, n, data) VALUES (?, ?, ?)'),
    listMeta: q(`SELECT id, folder, from_name, from_address, to_address, subject, date, snippet, rescue, attachments, in_reply_to
      FROM messages WHERE address = ? ORDER BY date DESC LIMIT 300`),
    getFull: q(`SELECT id, folder, from_name, from_address, to_address, subject, date, snippet, rescue, attachments, in_reply_to,
      text_body, html_body FROM messages WHERE id = ? AND address = ?`),
    move: q("UPDATE messages SET folder = ? WHERE id = ? AND address = ? AND folder IN ('inbox', 'spam')"),
    getFile: q('SELECT f.data FROM files f JOIN messages m ON m.id = f.message_id WHERE f.message_id = ? AND f.n = ? AND m.address = ?'),
  };

  return {
    db,
    stmts,
    /** Jalankan fn dalam satu transaksi. */
    tx(fn) {
      db.exec('BEGIN IMMEDIATE');
      try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    close() { db.close(); },
  };
}
