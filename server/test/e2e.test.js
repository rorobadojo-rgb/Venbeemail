// Uji ujung-ke-ujung: server sungguhan (SMTP + HTTP di port acak, SQLite di memori),
// surat dikirim lewat SMTP dengan nodemailer.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import nodemailer from 'nodemailer';
import { start } from '../src/server.js';

let app, base, smtp;
const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAwAI/AL+hc2rNAAAAABJRU5ErkJggg==';

before(async () => {
  app = await start({ DB_PATH: ':memory:', HTTP_PORT: '0', SMTP_PORT: '0', SMTP_HOST: '127.0.0.1', AUTH_CHECKS: 'false', NEW_ADDRESS_LIMIT: '30' });
  base = `http://127.0.0.1:${app.ports.http}`;
  smtp = nodemailer.createTransport({ host: '127.0.0.1', port: app.ports.smtp, secure: false, ignoreTLS: true, tls: { rejectUnauthorized: false } });
});
after(async () => { smtp.close(); await app.stop(); });

const api = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, headers: res.headers, data: type.includes('json') ? await res.json() : new Uint8Array(await res.arrayBuffer()) };
};
const newAddress = async (body = {}) => (await api('/api/addresses', { method: 'POST', body })).data;

/** Percakapan SMTP mentah, untuk melihat kode balasan RCPT apa adanya. */
function rawSmtp(lines) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(app.ports.smtp, '127.0.0.1');
    let buf = '';
    const replies = [];
    const queue = [...lines];
    sock.setEncoding('utf8');
    sock.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (/^\d{3} /.test(line)) {
          replies.push(line);
          const next = queue.shift();
          if (next === undefined) { sock.end(); resolve(replies); } else sock.write(next + '\r\n');
        }
      }
    });
    sock.on('error', reject);
  });
}

test('health + static page', async () => {
  const h = await api('/api/health');
  assert.deepEqual(h.data, { ok: true, domains: ['venbeemail.com'], ttlMinutes: 60, sending: false });
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /BanaMail/);
  assert.equal((await fetch(base + '/hero.webp')).headers.get('content-type'), 'image/webp');
  assert.equal((await fetch(base + '/../../server/package.json')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e/%2e%2e/server/package.json')).status, 404);
});

test('addresses: random, custom with suffix, invalid prefix', async () => {
  const a = await newAddress();
  assert.match(a.address, /^[a-z][a-z0-9]{9}@venbeemail\.com$/);
  assert.match(a.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match((await newAddress({ prefix: 'Budi' })).address, /^budi\.[a-z0-9]{6}@venbeemail\.com$/);
  assert.equal((await api('/api/addresses', { method: 'POST', body: { prefix: 'a..b' } })).status, 400);
  assert.equal((await api('/api/mailbox')).status, 401);
});

test('SMTP: no relay, unknown mailbox rejected, AUTH not offered', async () => {
  const a = await newAddress();
  const r = await rawSmtp(['EHLO tester.example', 'MAIL FROM:<x@sender.example>', 'RCPT TO:<someone@gmail.com>', 'RCPT TO:<nobody12345@venbeemail.com>', `RCPT TO:<${a.address.toUpperCase()}>`, 'QUIT']);
  assert.match(r[0], /^220 /);
  assert.ok(!/AUTH/.test(r[1]), 'AUTH not advertised');
  assert.match(r[3], /^550 5\.7\.1 Relaying denied/);
  assert.match(r[4], /^550 5\.1\.1 Mailbox does not exist/);
  assert.match(r[5], /^250 /, 'known address accepted (case-insensitive)');
});

test('receive → inbox/spam, rescue, body, inline image, attachment, move, other token, delete', async () => {
  const a = await newAddress();
  await smtp.sendMail({
    from: 'PixelPasar <no-reply@pixelpasar.example>', to: a.address,
    subject: 'SELAMAT!!! KODE VERIFIKASI', text: 'Kamu menang undian hadiah! Kode verifikasi PixelPasar kamu: 482913. Berlaku 10 menit.',
  });
  await smtp.sendMail({
    from: '"Toko Kertas Kotak" <pesanan@tokokertas.example>', to: a.address, subject: 'Pesanan sudah dikirim',
    html: '<p>Halo! Pesananmu sudah dikirim.</p><img src="cid:logo@toko">',
    attachments: [
      { filename: 'logo.png', content: Buffer.from(PNG_B64, 'base64'), cid: 'logo@toko' },
      { filename: "struk 'final'.txt", content: 'STRUK TOTAL Rp 85.000' },
    ],
  });
  const box = (await api('/api/mailbox', { token: a.token })).data;
  assert.equal(box.spam.length, 1);
  assert.equal(box.inbox.length, 1);
  const otp = box.spam[0];
  assert.deepEqual(otp.rescue, { code: '482913', copy: '482913', link: null });
  assert.ok(!('text' in otp) && !('html' in otp), 'list is metadata only');
  const shop = box.inbox[0];
  assert.equal(shop.snippet, 'Halo! Pesananmu sudah dikirim.');

  const full = (await api(`/api/messages/${shop.id}`, { token: a.token })).data;
  assert.match(full.html, /cid:logo@toko/);
  assert.equal(full.attachments.find((x) => x.cid === 'logo@toko').data, PNG_B64);
  const n = full.attachments.findIndex((x) => x.name.startsWith('struk'));
  const file = await api(`/api/messages/${shop.id}/attachments/${n}`, { token: a.token });
  assert.equal(file.headers.get('content-type'), 'application/octet-stream');
  assert.equal(file.headers.get('content-disposition'), "attachment; filename*=UTF-8''struk%20%27final%27.txt");
  assert.equal(new TextDecoder().decode(file.data), 'STRUK TOTAL Rp 85.000');

  const other = await newAddress();
  assert.equal((await api(`/api/messages/${otp.id}`, { token: other.token })).status, 404);
  assert.equal((await api(`/api/messages/${otp.id}`, { token: other.token, method: 'PATCH', body: { folder: 'inbox' } })).status, 404);

  const moved = await api(`/api/messages/${otp.id}`, { token: a.token, method: 'PATCH', body: { folder: 'inbox' } });
  assert.equal(moved.data.folder, 'inbox');
  assert.equal((await api(`/api/messages/${otp.id}`, { token: a.token, method: 'PATCH', body: { folder: 'sent' } })).status, 400);
  assert.equal((await api('/api/replies', { token: a.token, method: 'POST', body: {} })).status, 501);

  assert.equal((await api('/api/addresses/me', { token: a.token, method: 'DELETE' })).status, 200);
  assert.equal((await api('/api/mailbox', { token: a.token })).status, 401);
  const files = app.store.db.prepare('SELECT COUNT(*) AS n FROM files').get().n;
  const rows = app.store.db.prepare('SELECT token_hash, deleted_at FROM addresses WHERE address = ?').get(a.address);
  assert.equal(files, 0, 'attachments deleted with the address');
  assert.equal(rows.token_hash, null);
  assert.ok(rows.deleted_at > 0, 'tombstone kept: name never reused');
  await assert.rejects(smtp.sendMail({ from: 'a@b.example', to: a.address, subject: 'x', text: 'x' }), /550/);
});

test('oversized mail is refused with 552', async () => {
  const small = await start({ DB_PATH: ':memory:', HTTP_PORT: '0', SMTP_PORT: '0', SMTP_HOST: '127.0.0.1', AUTH_CHECKS: 'false', MAX_MESSAGE_BYTES: '2000' });
  try {
    const a = (await (await fetch(`http://127.0.0.1:${small.ports.http}/api/addresses`, { method: 'POST' })).json());
    const t = nodemailer.createTransport({ host: '127.0.0.1', port: small.ports.smtp, ignoreTLS: true });
    await assert.rejects(t.sendMail({ from: 'a@b.example', to: a.address, subject: 'big', text: 'x'.repeat(5000) }), /552/);
    t.close();
  } finally { await small.stop(); }
});

test('cleanup purges expired addresses', async () => {
  const a = await newAddress();
  await smtp.sendMail({ from: 'a@b.example', to: a.address, subject: 'hai', text: 'hai', attachments: [{ filename: 'x.txt', content: 'x' }] });
  app.store.db.prepare('UPDATE addresses SET expires_at = 1 WHERE address = ?').run(a.address);
  assert.equal((await api('/api/mailbox', { token: a.token })).status, 401, 'expired token refused at once');
  assert.ok(app.mailbox.cleanup() >= 1);
  assert.equal(app.store.db.prepare('SELECT COUNT(*) AS n FROM messages WHERE address = ?').get(a.address).n, 0);
});

test('rate limit on new addresses', async () => {
  const codes = [];
  for (let i = 0; i < 35; i++) codes.push((await api('/api/addresses', { method: 'POST', body: {} })).status);
  assert.ok(codes.includes(429), 'eventually 429');
});
