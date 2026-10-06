// Logika kotak surat: alamat, penerimaan surat, pembacaan, pembersihan. Dipakai SMTP dan HTTP.

import PostalMime from 'postal-mime';
import { newId, newToken, randomLocal, randomSuffix, isValidPrefix, sha256hex } from './ids.js';
import { scanRescue, snippetOf } from './scan.js';
import { scoreSpam } from './spam.js';

const MAX_ATTACHMENTS = 50;
const INLINE_IMAGE_MAX = 300 * 1024; // gambar cid ≤ 300 KB dikirim sebagai data: supaya tampil di isi surat
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf',
  'text/plain': 'txt', 'text/html': 'html', 'text/calendar': 'ics', 'message/rfc822': 'eml', 'application/zip': 'zip' };

const parseJson = (s, fallback) => { try { return s ? JSON.parse(s) : fallback; } catch { return fallback; } };
const safeName = (n) => String(n || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 120);
const toBytes = (content) => (typeof content === 'string' ? new TextEncoder().encode(content) : new Uint8Array(content));

export class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

export function createMailbox({ store, config }) {
  const { stmts } = store;

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
    ...(r.in_reply_to ? { inReplyTo: r.in_reply_to } : {}),
  });

  /** Alamat yang masih aktif (huruf kecil) atau null. */
  const liveAddress = (address) => stmts.liveAddress.get(String(address || '').trim().toLowerCase(), Date.now()) || null;

  async function createAddress({ prefix, domain } = {}) {
    const wanted = String(domain || '').toLowerCase();
    const dom = config.domains.includes(wanted) ? wanted : config.domains[0];
    const base = prefix ? String(prefix).trim().toLowerCase() : '';
    if (base && !isValidPrefix(base)) throw new HttpError(400, 'invalid-prefix');
    const token = newToken();
    const hash = await sha256hex(token);
    const now = Date.now();
    const expiresAt = now + config.ttlMs;
    for (let i = 0; i < 6; i++) {
      const local = base ? `${base}.${randomSuffix(config.suffixLength)}` : randomLocal(config.randomLength);
      const address = `${local}@${dom}`;
      // ON CONFLICT DO NOTHING: nama yang pernah dipakai (termasuk batu nisan) tidak diberikan lagi.
      if (stmts.insertAddress.run(address, hash, now, expiresAt).changes === 1) return { address, local, domain: dom, expiresAt, token };
    }
    throw new HttpError(503, 'try-again');
  }

  async function authenticate(token) {
    if (!/^[A-Za-z0-9_-]{32,64}$/.test(token || '')) return null;
    const row = stmts.addressByToken.get(await sha256hex(token));
    return row && row.expires_at > Date.now() ? row : null;
  }

  function mailbox(me) {
    const out = { inbox: [], spam: [], sent: [], expiresAt: me.expires_at };
    for (const r of stmts.listMeta.all(me.address)) out[r.folder]?.push(toMeta(r));
    return out;
  }

  function getMessage(me, id) {
    const r = stmts.getFull.get(id, me.address);
    if (!r) throw new HttpError(404, 'not-found');
    const meta = toMeta(r);
    meta.attachments.forEach((a, n) => {
      if (!a.cid || !/^image\/(png|gif|jpe?g|webp)$/i.test(a.type) || a.size > INLINE_IMAGE_MAX) return;
      const f = stmts.getFile.get(id, n, me.address);
      if (f) a.data = Buffer.from(f.data).toString('base64');
    });
    return { ...meta, text: r.text_body, html: r.html_body };
  }

  function moveMessage(me, id, folder) {
    if (folder !== 'inbox' && folder !== 'spam') throw new HttpError(400, 'invalid-folder');
    if (stmts.move.run(folder, id, me.address).changes !== 1) throw new HttpError(404, 'not-found');
    const r = stmts.getFull.get(id, me.address);
    return toMeta(r);
  }

  function getAttachment(me, id, n) {
    const r = stmts.getFull.get(id, me.address);
    const att = r && parseJson(r.attachments, [])[n];
    const f = att && stmts.getFile.get(id, n, me.address);
    if (!f) throw new HttpError(404, 'not-found');
    return { name: att.name, data: f.data };
  }

  /** Hapus isi alamat dan jadikan batu nisan (alamat tidak bisa dibuat ulang). */
  function purgeAddress(address) {
    store.tx(() => {
      stmts.deleteMessages.run(address); // lampiran ikut terhapus (ON DELETE CASCADE)
      stmts.tombstone.run(Date.now(), address);
    });
  }

  function cleanup() {
    const rows = stmts.expired.all(Date.now());
    for (const r of rows) purgeAddress(r.address);
    if (rows.length) store.db.exec('PRAGMA incremental_vacuum;');
    return rows.length;
  }

  /**
   * Simpan satu surat untuk alamat-alamat penerima yang sudah dicek aktif.
   * Spam tidak pernah ditolak — hanya ditempatkan di folder Spam.
   * @param {Uint8Array} raw  surat mentah (RFC 822)
   * @param {string[]} recipients
   * @param {{spf?: string, dkim?: string, dmarc?: string}} auth  hasil SPF/DKIM/DMARC
   * @param {string} envelopeFrom
   */
  async function receive(raw, recipients, auth = {}, envelopeFrom = '') {
    let email;
    try {
      email = await PostalMime.parse(raw);
    } catch (err) {
      console.error('parse error', err);
      email = {
        headers: [], from: { name: '', address: envelopeFrom }, subject: '(email tidak bisa diurai)',
        text: 'Email ini tidak bisa diurai. Isi aslinya ada di lampiran pesan-asli.eml.', html: '',
        attachments: [{ filename: 'pesan-asli.eml', mimeType: 'message/rfc822', content: raw }],
      };
    }
    const text = email.text || '';
    const html = email.html || '';
    const spam = scoreSpam(email, auth);
    const files = (email.attachments || []).slice(0, MAX_ATTACHMENTS).map((a) => ({ ...a, bytes: toBytes(a.content) }));
    const attachments = files.map((a, n) => ({
      name: safeName(a.filename) || `lampiran-${n + 1}${EXT[a.mimeType] ? '.' + EXT[a.mimeType] : ''}`,
      type: a.mimeType || 'application/octet-stream',
      size: a.bytes.byteLength,
      ...(a.contentId ? { cid: String(a.contentId).replace(/^<|>$/g, '') } : {}),
    }));
    const from = email.from?.address ? email.from : { name: email.from?.name || '', address: envelopeFrom };
    const rescue = JSON.stringify(scanRescue({ subject: email.subject, text, html }));
    const now = Date.now();
    const ids = [];

    store.tx(() => {
      for (const to of recipients) {
        const id = newId();
        stmts.insertMessage.run(
          id, to, spam.isSpam ? 'spam' : 'inbox',
          String(from.name || '').slice(0, 200), String(from.address || '').slice(0, 320), to,
          String(email.subject || '').slice(0, 500), now, snippetOf({ text, html }),
          spam.score, JSON.stringify(spam.reasons), JSON.stringify(auth), rescue,
          JSON.stringify(attachments), email.inReplyTo || null, raw.byteLength, text, html,
        );
        files.forEach((a, n) => stmts.insertFile.run(id, n, a.bytes));
        ids.push(id);
      }
    });
    return { ids, spam };
  }

  return { liveAddress, createAddress, authenticate, mailbox, getMessage, moveMessage, getAttachment, purgeAddress, cleanup, receive };
}
