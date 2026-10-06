// API /api/* + berkas halaman BanaMail. Dijalankan di 127.0.0.1; Nginx (aaPanel) meneruskan
// https://venbeemail.com ke sini.
//
//   GET    /api/health                         → {ok, domains, ttlMinutes, sending}
//   POST   /api/addresses        {prefix?, domain?} → {address, local, domain, expiresAt, token}
//   GET    /api/mailbox                        → {inbox[], spam[], sent[], expiresAt}   (metadata saja)
//   GET    /api/messages/:id                   → metadata + text + html (+ data gambar inline cid)
//   PATCH  /api/messages/:id     {folder}      → metadata   (pindah inbox ↔ spam)
//   GET    /api/messages/:id/attachments/:n    → berkas (selalu sebagai unduhan)
//   POST   /api/replies                        → 501 selama SENDING_ENABLED=false
//   DELETE /api/addresses/me                   → hapus alamat + semua isinya
// Selain /health dan POST /addresses, wajib `Authorization: Bearer <token>`.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { HttpError } from './mail.js';

const SECURITY = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const MAX_JSON = 16 * 1024;

const rfc5987 = (name) => encodeURIComponent(name).replace(/['()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY, ...headers });
  res.end(body);
}
const json = (res, status, data) => send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8' });

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_JSON) { reject(new HttpError(413, 'too-large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

/** Batas laju sederhana di memori (satu proses). */
function rateLimiter(limit, windowMs) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset <= now) hits.delete(k); }, windowMs).unref();
  return (key) => {
    const now = Date.now();
    const h = hits.get(key);
    if (!h || h.reset <= now) { hits.set(key, { count: 1, reset: now + windowMs }); return true; }
    h.count++;
    return h.count <= limit;
  };
}

function clientIp(req, config) {
  const direct = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  const fromLocalProxy = direct === '127.0.0.1' || direct === '::1';
  if (config.trustProxy && fromLocalProxy) {
    const fwd = req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0];
    if (fwd) return String(fwd).trim();
  }
  return direct;
}

function serveStatic(req, res, config) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const root = path.resolve(config.staticDir);
  const file = path.resolve(root, '.' + rel);
  if (!file.startsWith(root + path.sep)) return send(res, 404, 'Not Found');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const cache = type.startsWith('text/html') ? 'no-cache' : 'public, max-age=86400';
    res.writeHead(200, { ...SECURITY, 'Cache-Control': cache, 'Content-Type': type, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

export function createHttpServer({ config, mailbox }) {
  const allowNewAddress = rateLimiter(config.newAddressLimit, 10 * 60000);

  async function api(req, res, pathname) {
    const p = pathname.replace(/\/+$/, '');
    const m = req.method;
    if (p === '/api/health' && m === 'GET') {
      return json(res, 200, { ok: true, domains: config.domains, ttlMinutes: config.ttlMs / 60000, sending: config.sending });
    }
    if (p === '/api/addresses' && m === 'POST') {
      if (!allowNewAddress(clientIp(req, config))) return json(res, 429, { error: 'rate-limited' });
      const body = await readJson(req);
      return json(res, 201, await mailbox.createAddress({ prefix: body?.prefix, domain: body?.domain }));
    }

    const token = String(req.headers.authorization || '').match(/^Bearer (\S+)$/)?.[1];
    const me = await mailbox.authenticate(token);
    if (!me) return json(res, 401, { error: 'unauthorized' });

    if (p === '/api/mailbox' && m === 'GET') return json(res, 200, mailbox.mailbox(me));
    if (p === '/api/addresses/me' && m === 'DELETE') { mailbox.purgeAddress(me.address); return json(res, 200, { ok: true }); }
    if (p === '/api/replies' && m === 'POST') return json(res, 501, { error: config.sending ? 'not-implemented' : 'sending-disabled' });

    let r = p.match(/^\/api\/messages\/([a-z0-9]{8,40})$/);
    if (r && m === 'GET') return json(res, 200, mailbox.getMessage(me, r[1]));
    if (r && m === 'PATCH') return json(res, 200, mailbox.moveMessage(me, r[1], (await readJson(req))?.folder));
    r = p.match(/^\/api\/messages\/([a-z0-9]{8,40})\/attachments\/(\d{1,3})$/);
    if (r && m === 'GET') {
      const file = mailbox.getAttachment(me, r[1], Number(r[2]));
      // Selalu octet-stream + attachment: isi dari pengirim asing tidak boleh dirender di domain ini.
      return send(res, 200, Buffer.from(file.data), {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${rfc5987(file.name)}`,
      });
    }
    return json(res, 404, { error: 'not-found' });
  }

  return http.createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://x');
      if (pathname.startsWith('/api/')) return await api(req, res, pathname);
      return serveStatic(req, res, config);
    } catch (err) {
      if (err instanceof HttpError) return json(res, err.status, { error: err.code });
      console.error('http error', err);
      if (!res.headersSent) json(res, 500, { error: 'server-error' });
    }
  });
}
