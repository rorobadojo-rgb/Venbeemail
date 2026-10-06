// BanaMail Worker — terima email (email), layani API (fetch), bersihkan alamat kedaluwarsa (scheduled).
//
// API (semua JSON, kecuali lampiran). Kecuali /health dan POST /addresses, setiap permintaan wajib
// membawa `Authorization: Bearer <token>` dari POST /addresses — tahu alamatnya saja tidak cukup.
//   GET    /api/health                         → {ok, domains, ttlMinutes, sending}
//   POST   /api/addresses        {prefix?, domain?} → {address, local, domain, expiresAt, token}
//   GET    /api/mailbox                        → {inbox[], spam[], sent[], expiresAt}   (metadata saja)
//   GET    /api/messages/:id                   → metadata + text + html (+ data gambar inline cid)
//   PATCH  /api/messages/:id     {folder}      → metadata   (pindah inbox ↔ spam)
//   GET    /api/messages/:id/attachments/:n    → berkas (selalu sebagai unduhan)
//   POST   /api/replies                        → 501 selama SENDING_ENABLED=false
//   DELETE /api/addresses/me                   → hapus alamat + semua isinya (alamat tidak dipakai ulang)

import PostalMime from 'postal-mime';
import { newId, newToken, randomLocal, randomSuffix, isValidPrefix, sha256hex } from './ids.js';
import { scanRescue, snippetOf } from './scan.js';
import { scoreSpam } from './spam.js';

const MAX_ATTACHMENTS = 50;
const INLINE_IMAGE_MAX = 300 * 1024; // gambar cid ≤ 300 KB dikirim sebagai data: supaya tampil di isi surat

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (err) {
      console.error('fetch error', err);
      return json({ error: 'server-error' }, 500);
    }
  },
  async email(message, env) {
    await receive(message, env);
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(cleanup(env));
  },
};

/* ------------------------------------------------------------------ konfigurasi */

function config(env) {
  const num = (v, d) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
  const domains = String(env.DOMAINS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return {
    domains: domains.length ? domains : ['venbeemail.com'],
    ttlMs: num(env.TTL_MINUTES, 60) * 60000,
    randomLength: num(env.RANDOM_LENGTH, 10),
    suffixLength: num(env.SUFFIX_LENGTH, 6),
    maxBytes: num(env.MAX_MESSAGE_BYTES, 20 * 1024 * 1024),
    newAddressLimit: num(env.NEW_ADDRESS_LIMIT, 20),
    sending: env.SENDING_ENABLED === 'true',
  };
}

/* ------------------------------------------------------------------ HTTP */

const SECURITY_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS } });

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;
  if (!path.startsWith('/api/')) return json({ error: 'not-found' }, 404);
  const c = config(env);

  if (path === '/api/health' && method === 'GET') {
    return json({ ok: true, domains: c.domains, ttlMinutes: c.ttlMs / 60000, sending: c.sending });
  }
  if (path === '/api/addresses' && method === 'POST') return createAddress(request, env, c);

  const me = await authenticate(request, env);
  if (!me) return json({ error: 'unauthorized' }, 401);

  if (path === '/api/mailbox' && method === 'GET') return mailbox(env, me);
  if (path === '/api/addresses/me' && method === 'DELETE') {
    await purgeAddress(env, me.address);
    return json({ ok: true });
  }
  if (path === '/api/replies' && method === 'POST') {
    return json({ error: c.sending ? 'not-implemented' : 'sending-disabled' }, 501);
  }
  let m = path.match(/^\/api\/messages\/([a-z0-9]{8,40})$/);
  if (m && method === 'GET') return getMessage(env, me, m[1]);
  if (m && method === 'PATCH') return moveMessage(request, env, me, m[1]);
  m = path.match(/^\/api\/messages\/([a-z0-9]{8,40})\/attachments\/(\d{1,3})$/);
  if (m && method === 'GET') return getAttachment(env, me, m[1], Number(m[2]));
  return json({ error: 'not-found' }, 404);
}

async function authenticate(request, env) {
  const m = (request.headers.get('Authorization') || '').match(/^Bearer ([A-Za-z0-9_-]{32,64})$/);
  if (!m) return null;
  const row = await env.DB.prepare('SELECT address, expires_at FROM addresses WHERE token_hash = ?1 AND deleted_at IS NULL')
    .bind(await sha256hex(m[1])).first();
  if (!row || row.expires_at <= Date.now()) return null;
  return row;
}

/** Jendela tetap per kunci; true = masih boleh. */
async function allow(env, key, limit, windowMs) {
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count    = CASE WHEN reset_at <= ?3 THEN 1  ELSE count + 1 END,
       reset_at = CASE WHEN reset_at <= ?3 THEN ?2 ELSE reset_at END
     RETURNING count`,
  ).bind(key, now + windowMs, now).first();
  return row.count <= limit;
}

async function createAddress(request, env, c) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  if (!(await allow(env, `new:${ip}`, c.newAddressLimit, 10 * 60000))) return json({ error: 'rate-limited' }, 429);

  let body = {};
  try { body = await request.json(); } catch { /* badan kosong = alamat acak */ }
  const wanted = String(body?.domain || '').toLowerCase();
  const domain = c.domains.includes(wanted) ? wanted : c.domains[0];
  const prefix = body?.prefix ? String(body.prefix).trim().toLowerCase() : '';
  if (prefix && !isValidPrefix(prefix)) return json({ error: 'invalid-prefix' }, 400);

  const token = newToken();
  const hash = await sha256hex(token);
  const now = Date.now();
  const expiresAt = now + c.ttlMs;
  for (let i = 0; i < 6; i++) {
    const local = prefix ? `${prefix}.${randomSuffix(c.suffixLength)}` : randomLocal(c.randomLength);
    const address = `${local}@${domain}`;
    // ON CONFLICT DO NOTHING: nama yang pernah dipakai (termasuk batu nisan) tidak akan diberikan lagi.
    const r = await env.DB.prepare(
      'INSERT INTO addresses (address, token_hash, created_at, expires_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(address) DO NOTHING',
    ).bind(address, hash, now, expiresAt).run();
    if (r.meta.changes === 1) return json({ address, local, domain, expiresAt, token }, 201);
  }
  return json({ error: 'try-again' }, 503);
}

const META_COLUMNS = 'id, folder, from_name, from_address, to_address, subject, date, snippet, rescue, attachments, in_reply_to';
const parseJson = (s, fallback) => { try { return s ? JSON.parse(s) : fallback; } catch { return fallback; } };
const toMeta = (r) => ({
  id: r.id,
  folder: r.folder,
  from: { name: r.from_name, address: r.from_address },
  to: r.to_address,
  subject: r.subject,
  date: new Date(r.date).toISOString(),
  snippet: r.snippet,
  rescue: parseJson(r.rescue, null),
  attachments: parseJson(r.attachments, []),
  inReplyTo: r.in_reply_to || undefined,
});

async function mailbox(env, me) {
  const { results } = await env.DB.prepare(`SELECT ${META_COLUMNS} FROM messages WHERE address = ?1 ORDER BY date DESC LIMIT 300`)
    .bind(me.address).all();
  const out = { inbox: [], spam: [], sent: [], expiresAt: me.expires_at };
  for (const r of results) out[r.folder]?.push(toMeta(r));
  return json(out);
}

const findRow = (env, me, id) =>
  env.DB.prepare(`SELECT ${META_COLUMNS} FROM messages WHERE id = ?1 AND address = ?2`).bind(id, me.address).first();

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function getMessage(env, me, id) {
  const row = await findRow(env, me, id);
  if (!row) return json({ error: 'not-found' }, 404);
  const meta = toMeta(row);
  const obj = await env.MAIL.get(`m/${id}/body.json`);
  const body = obj ? parseJson(await obj.text(), {}) : {};
  // Gambar inline (cid:) kecil dikirim sebagai base64 agar bisa tampil di isi surat yang disanitasi.
  await Promise.all(meta.attachments.map(async (a, n) => {
    if (!a.cid || !/^image\/(png|gif|jpe?g|webp)$/i.test(a.type) || a.size > INLINE_IMAGE_MAX) return;
    const file = await env.MAIL.get(`m/${id}/a/${n}`);
    if (file) a.data = toBase64(await file.arrayBuffer());
  }));
  return json({ ...meta, text: body.text || '', html: body.html || '' });
}

async function moveMessage(request, env, me, id) {
  let body = {};
  try { body = await request.json(); } catch { /* ditangani di bawah */ }
  const folder = body?.folder;
  if (folder !== 'inbox' && folder !== 'spam') return json({ error: 'invalid-folder' }, 400);
  const r = await env.DB.prepare("UPDATE messages SET folder = ?1 WHERE id = ?2 AND address = ?3 AND folder IN ('inbox', 'spam')")
    .bind(folder, id, me.address).run();
  if (r.meta.changes !== 1) return json({ error: 'not-found' }, 404);
  return json(toMeta(await findRow(env, me, id)));
}

/** Nama berkas untuk filename*= (RFC 5987): encodeURIComponent + ' ( ) * juga di-escape. */
const rfc5987 = (name) => encodeURIComponent(name).replace(/['()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

async function getAttachment(env, me, id, n) {
  const row = await findRow(env, me, id);
  const att = row && parseJson(row.attachments, [])[n];
  if (!att) return json({ error: 'not-found' }, 404);
  const file = await env.MAIL.get(`m/${id}/a/${n}`);
  if (!file) return json({ error: 'not-found' }, 404);
  // Selalu octet-stream + attachment: isi dari pengirim asing tidak boleh dirender di domain ini.
  return new Response(file.body, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${rfc5987(att.name)}`,
      ...SECURITY_HEADERS,
    },
  });
}

/* ------------------------------------------------------------------ email masuk */

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf',
  'text/plain': 'txt', 'text/html': 'html', 'text/calendar': 'ics', 'message/rfc822': 'eml', 'application/zip': 'zip' };
const safeName = (n) => String(n || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 120);
const byteLength = (content) => (typeof content === 'string' ? new TextEncoder().encode(content).length : content?.byteLength ?? 0);

/** Semua surat untuk alamat yang masih aktif disimpan — spam hanya dipindah ke folder Spam. */
export async function receive(message, env) {
  const c = config(env);
  const to = String(message.to || '').trim().toLowerCase();
  const now = Date.now();
  const box = await env.DB.prepare('SELECT address, expires_at FROM addresses WHERE address = ?1 AND deleted_at IS NULL').bind(to).first();
  if (!box || box.expires_at <= now) {
    message.setReject('Address does not exist');
    return;
  }
  if (message.rawSize > c.maxBytes) {
    message.setReject('Message too large');
    return;
  }

  const raw = await new Response(message.raw).arrayBuffer();
  let email;
  try {
    email = await PostalMime.parse(raw);
  } catch (err) {
    // Tetap simpan: surat yang tidak bisa diurai disimpan apa adanya sebagai lampiran .eml.
    console.error('parse error', err);
    email = {
      headers: [], from: { name: '', address: String(message.from || '') }, subject: '(email tidak bisa diurai)',
      text: 'Email ini tidak bisa diurai. Isi aslinya ada di lampiran pesan-asli.eml.', html: '',
      attachments: [{ filename: 'pesan-asli.eml', mimeType: 'message/rfc822', content: raw }],
    };
  }

  const id = newId();
  const text = email.text || '';
  const html = email.html || '';
  const spam = scoreSpam(email);
  const files = (email.attachments || []).slice(0, MAX_ATTACHMENTS);
  const attachments = files.map((a, n) => ({
    name: safeName(a.filename) || `lampiran-${n + 1}${EXT[a.mimeType] ? '.' + EXT[a.mimeType] : ''}`,
    type: a.mimeType || 'application/octet-stream',
    size: byteLength(a.content),
    ...(a.contentId ? { cid: String(a.contentId).replace(/^<|>$/g, '') } : {}),
  }));

  await env.MAIL.put(`m/${id}/body.json`, JSON.stringify({ text, html }), { httpMetadata: { contentType: 'application/json' } });
  await Promise.all(files.map((a, n) => env.MAIL.put(`m/${id}/a/${n}`, a.content)));

  const from = email.from?.address ? email.from : { name: email.from?.name || '', address: String(message.from || '') };
  await env.DB.prepare(
    `INSERT INTO messages (id, address, folder, from_name, from_address, to_address, subject, date, snippet,
                           spam_score, spam_reasons, rescue, attachments, in_reply_to, size)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
  ).bind(
    id, box.address, spam.isSpam ? 'spam' : 'inbox',
    String(from.name || '').slice(0, 200), String(from.address || '').slice(0, 320), box.address,
    String(email.subject || '').slice(0, 500), now, snippetOf({ text, html }),
    spam.score, JSON.stringify(spam.reasons), JSON.stringify(scanRescue({ subject: email.subject, text, html })),
    JSON.stringify(attachments), email.inReplyTo || null, raw.byteLength,
  ).run();
}

/* ------------------------------------------------------------------ pembersihan */

/** Hapus isi alamat dan jadikan batu nisan (alamat tidak bisa dibuat ulang). */
export async function purgeAddress(env, address) {
  const { results } = await env.DB.prepare('SELECT id, attachments FROM messages WHERE address = ?1').bind(address).all();
  const keys = results.flatMap((r) => [`m/${r.id}/body.json`, ...parseJson(r.attachments, []).map((_, n) => `m/${r.id}/a/${n}`)]);
  for (let i = 0; i < keys.length; i += 1000) await env.MAIL.delete(keys.slice(i, i + 1000));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM messages WHERE address = ?1').bind(address),
    env.DB.prepare('UPDATE addresses SET token_hash = NULL, deleted_at = ?2 WHERE address = ?1').bind(address, Date.now()),
  ]);
}

export async function cleanup(env) {
  const now = Date.now();
  const { results } = await env.DB.prepare('SELECT address FROM addresses WHERE deleted_at IS NULL AND expires_at <= ?1 LIMIT 200')
    .bind(now).all();
  for (const r of results) await purgeAddress(env, r.address);
  await env.DB.prepare('DELETE FROM rate_limits WHERE reset_at <= ?1').bind(now).run();
  if (results.length) console.log(`cleanup: ${results.length} alamat kedaluwarsa dihapus`);
}
