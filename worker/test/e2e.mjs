// Uji ujung-ke-ujung terhadap `npm run dev` (wrangler dev lokal, D1 + R2 lokal).
// Jalankan: npm run dev -- --test-scheduled   (terminal 1)
//           node test/e2e.mjs                  (terminal 2)
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE || 'http://127.0.0.1:8787';
let passed = 0;
const step = async (name, fn) => { await fn(); passed++; console.log('ok -', name); };

const api = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, headers: res.headers, data: type.includes('json') ? await res.json() : new Uint8Array(await res.arrayBuffer()) };
};

/** Kirim surat lewat penguji Email Worker lokal milik wrangler. */
let seq = 0;
const deliver = (from, to, raw) =>
  fetch(`${BASE}/cdn-cgi/handler/email?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
    method: 'POST',
    body: (`Message-ID: <t${++seq}.${Date.now()}@test.example>\nDate: ${new Date().toUTCString()}\n` + raw).replace(/\n/g, '\r\n'),
  });

// PNG 1×1 kuning
const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAwAI/AL+hc2rNAAAAABJRU5ErkJggg==';

const otpSpam = (to) => `Authentication-Results: mx.example; spf=fail smtp.mailfrom=pixelpasar.example; dmarc=fail
From: PixelPasar <no-reply@pixelpasar.example>
To: ${to}
Subject: Kode verifikasi kamu
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Kode verifikasi PixelPasar kamu: 482913. Berlaku 10 menit.
`;

const withAttachments = (to) => `From: "Toko Kertas Kotak" <pesanan@tokokertas.example>
To: ${to}
Subject: Pesanan #BNM-2041 sudah dikirim
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mix"

--mix
Content-Type: multipart/related; boundary="rel"

--rel
Content-Type: text/html; charset=utf-8

<p>Halo! Pesananmu sudah dikirim.</p><img src="cid:logo@toko"><script>alert(1)</script>
--rel
Content-Type: image/png
Content-ID: <logo@toko>
Content-Transfer-Encoding: base64

${PNG_B64}
--rel--
--mix
Content-Type: text/plain; name="struk.txt"
Content-Disposition: attachment; filename="struk.txt"

STRUK #BNM-2041 TOTAL Rp 85.000
--mix--
`;

const linkSpam = (to) => `From: KlubKomik <akun@klubkomik.example>
To: ${to}
Subject: SELAMAT!!! AKTIFKAN AKUN SEKARANG
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8

<p>Kamu menang hadiah! <a href="https://klubkomik.example/verify?token=kk_9f3a2c7e">Aktifkan akun</a></p>
`;

let token, address, otpId, shopId;

/** Kueri D1 lokal milik wrangler dev. */
function sql(command) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'banamail', '--local', '--json', '--command', command], {
    env: { ...process.env, CI: '1' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(out)[0].results;
}

await step('health', async () => {
  const r = await api('/api/health');
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.domains, ['venbeemail.com']);
  assert.equal(r.data.sending, false);
});

await step('random address + token', async () => {
  const r = await api('/api/addresses', { method: 'POST', body: {} });
  assert.equal(r.status, 201);
  assert.match(r.data.address, /^[a-z][a-z0-9]{9}@venbeemail\.com$/);
  assert.match(r.data.token, /^[A-Za-z0-9_-]{43}$/);
  ({ token, address } = r.data);
});

await step('custom prefix gets random suffix; bad prefix refused', async () => {
  const r = await api('/api/addresses', { method: 'POST', body: { prefix: 'Budi' } });
  assert.equal(r.status, 201);
  assert.match(r.data.address, /^budi\.[a-z0-9]{6}@venbeemail\.com$/);
  assert.equal((await api('/api/addresses', { method: 'POST', body: { prefix: 'a..b' } })).status, 400);
});

await step('mailbox needs the token', async () => {
  assert.equal((await api('/api/mailbox')).status, 401);
  assert.equal((await api('/api/mailbox', { token: 'x'.repeat(43) })).status, 401);
  const r = await api('/api/mailbox', { token });
  assert.equal(r.status, 200);
  assert.deepEqual([r.data.inbox.length, r.data.spam.length, r.data.sent.length], [0, 0, 0]);
});

await step('receive: OTP spam, shop mail with attachments, link spam', async () => {
  for (const raw of [otpSpam(address), withAttachments(address), linkSpam(address)]) {
    const res = await deliver('sender@example.net', address, raw);
    assert.ok(res.ok, `deliver status ${res.status}: ${await res.text()}`);
  }
});

await step('mail to an unknown address is rejected (no message stored)', async () => {
  const res = await deliver('sender@example.net', 'nobody123@venbeemail.com', otpSpam('nobody123@venbeemail.com'));
  assert.equal(res.status, 400);
  assert.match(await res.text(), /Address does not exist/);
});

await step('mailbox sorts mail into inbox / spam with rescue data', async () => {
  const r = await api('/api/mailbox', { token });
  assert.equal(r.data.inbox.length, 1, JSON.stringify(r.data));
  assert.equal(r.data.spam.length, 2);
  const otp = r.data.spam.find((m) => m.subject === 'Kode verifikasi kamu');
  assert.deepEqual(otp.rescue, { code: '482913', copy: '482913', link: null });
  assert.equal(otp.from.address, 'no-reply@pixelpasar.example');
  assert.ok(!('text' in otp) && !('html' in otp), 'list is metadata only');
  const link = r.data.spam.find((m) => m.from.name === 'KlubKomik');
  assert.equal(link.rescue.link, 'https://klubkomik.example/verify?token=kk_9f3a2c7e');
  const shop = r.data.inbox[0];
  assert.equal(shop.attachments.length, 2);
  assert.equal(shop.snippet, 'Halo! Pesananmu sudah dikirim.');
  otpId = otp.id; shopId = shop.id;
});

await step('full message with inline cid image as data', async () => {
  const r = await api(`/api/messages/${shopId}`, { token });
  assert.equal(r.status, 200);
  assert.match(r.data.html, /cid:logo@toko/);
  const logo = r.data.attachments.find((a) => a.cid === 'logo@toko');
  assert.equal(logo.type, 'image/png');
  assert.equal(logo.data, PNG_B64);
  assert.equal((await api(`/api/messages/${otpId}`, { token })).data.text.trim(), 'Kode verifikasi PixelPasar kamu: 482913. Berlaku 10 menit.');
});

await step('attachment downloads as octet-stream attachment', async () => {
  const shop = (await api(`/api/messages/${shopId}`, { token })).data;
  const n = shop.attachments.findIndex((a) => a.name === 'struk.txt');
  const r = await api(`/api/messages/${shopId}/attachments/${n}`, { token });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'application/octet-stream');
  assert.match(r.headers.get('content-disposition'), /^attachment; filename\*=UTF-8''struk\.txt$/);
  assert.equal(new TextDecoder().decode(r.data).trim(), 'STRUK #BNM-2041 TOTAL Rp 85.000');
  assert.equal((await api(`/api/messages/${shopId}/attachments/9`, { token })).status, 404);
});

await step('another token cannot read this mailbox', async () => {
  const other = (await api('/api/addresses', { method: 'POST', body: {} })).data.token;
  assert.equal((await api(`/api/messages/${otpId}`, { token: other })).status, 404);
  assert.equal((await api(`/api/messages/${otpId}`, { token: other, method: 'PATCH', body: { folder: 'inbox' } })).status, 404);
});

await step('not spam → inbox', async () => {
  const r = await api(`/api/messages/${otpId}`, { token, method: 'PATCH', body: { folder: 'inbox' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.folder, 'inbox');
  const box = (await api('/api/mailbox', { token })).data;
  assert.deepEqual([box.inbox.length, box.spam.length], [2, 1]);
  assert.equal((await api(`/api/messages/${otpId}`, { token, method: 'PATCH', body: { folder: 'sent' } })).status, 400);
});

await step('replies are disabled for now', async () => {
  const r = await api('/api/replies', { token, method: 'POST', body: { to: 'a@b.example', text: 'hai' } });
  assert.equal(r.status, 501);
  assert.equal(r.data.error, 'sending-disabled');
});

await step('delete address → token dead, mail gone, address not reusable', async () => {
  assert.equal((await api('/api/addresses/me', { token, method: 'DELETE' })).status, 200);
  assert.equal((await api('/api/mailbox', { token })).status, 401);
  const res = await deliver('sender@example.net', address, otpSpam(address));
  assert.equal(res.status, 400);
  assert.match(await res.text(), /Address does not exist/);
  const row = sql(`SELECT token_hash, deleted_at FROM addresses WHERE address = '${address}'`)[0];
  assert.equal(row.token_hash, null);
  assert.ok(row.deleted_at > 0, 'tombstone kept so the name is never handed out again');
  assert.equal(sql(`SELECT COUNT(*) AS n FROM messages WHERE address = '${address}'`)[0].n, 0);
});

await step('cron removes expired addresses and their mail', async () => {
  const r = (await api('/api/addresses', { method: 'POST', body: {} })).data;
  assert.ok((await deliver('sender@example.net', r.address, otpSpam(r.address))).ok);
  sql(`UPDATE addresses SET expires_at = 1 WHERE address = '${r.address}'`);
  assert.equal((await api('/api/mailbox', { token: r.token })).status, 401, 'expired token is refused at once');
  const cron = await fetch(`${BASE}/cdn-cgi/handler/scheduled?cron=${encodeURIComponent('*/10 * * * *')}`);
  assert.ok(cron.ok, 'scheduled handler ' + cron.status);
  assert.equal(sql(`SELECT COUNT(*) AS n FROM messages WHERE address = '${r.address}'`)[0].n, 0);
  assert.ok(sql(`SELECT deleted_at FROM addresses WHERE address = '${r.address}'`)[0].deleted_at > 0);
});

console.log(`\n${passed} steps passed`);
