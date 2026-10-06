import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomLocal, randomSuffix, isValidPrefix, newToken, sha256hex, newId } from '../src/ids.js';
import { scanRescue, snippetOf, htmlToText } from '../src/scan.js';
import { scoreSpam } from '../src/spam.js';

test('random names: 10 chars, letter first, unique, evenly spread', () => {
  const xs = Array.from({ length: 20000 }, () => randomLocal(10));
  assert.ok(xs.every((x) => /^[a-z][a-z0-9]{9}$/.test(x)));
  assert.equal(new Set(xs).size, xs.length);
  const counts = {};
  for (const ch of xs.map((x) => x.slice(1)).join('')) counts[ch] = (counts[ch] || 0) + 1;
  const v = Object.values(counts);
  assert.equal(v.length, 36);
  assert.ok(Math.max(...v) / Math.min(...v) < 1.15);
  assert.match(randomSuffix(6), /^[a-z0-9]{6}$/);
});

test('custom prefix rules', () => {
  for (const ok of ['budi', 'skate.ria', 'a_b-c', 'abc', 'a'.repeat(20)]) assert.ok(isValidPrefix(ok), ok);
  for (const bad of ['ab', 'a'.repeat(21), '.abc', 'abc-', 'ab..c', 'Budi', 'bu di', 'bu@di']) assert.ok(!isValidPrefix(bad), bad);
});

test('tokens and ids', async () => {
  const t = newToken();
  assert.match(t, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(t, newToken());
  assert.match(await sha256hex('abc'), /^ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad$/);
  assert.match(newId(), /^m[a-z0-9]{15,}$/);
});

test('rescue: numeric OTP, spaced OTP, link, nothing', () => {
  assert.deepEqual(scanRescue({ subject: 'Kode verifikasi kamu', text: 'Kode verifikasi PixelPasar kamu: 482913. Berlaku 10 menit.' }),
    { code: '482913', copy: '482913', link: null });
  assert.deepEqual(scanRescue({ subject: 'Kode masuk', text: 'Kode masuk: 551 204\nKedaluwarsa dalam 5 menit.' }),
    { code: '551 204', copy: '551204', link: null });
  const l = scanRescue({ subject: 'Aktifkan akunmu', html: '<p>Tekan</p><a href="https://klubkomik.example/verify?token=kk_9f3a2c7e&amp;x=1">Aktifkan akun</a>' });
  assert.equal(l.code, null);
  assert.equal(l.link, 'https://klubkomik.example/verify?token=kk_9f3a2c7e&x=1');
  assert.equal(scanRescue({ subject: 'SELAMAT!!!', text: 'Hadiah Rp 50.000.000 di https://undian.example/klaim?id=88' }), null);
  assert.equal(scanRescue({ subject: 'Pesanan #BNM-2041 sudah dikirim', text: 'Lacak di https://toko.example/lacak/BNM-2041.' }), null);
});

test('html to text and snippet', () => {
  assert.equal(htmlToText('<style>p{}</style><p>Halo&nbsp;<b>dunia</b> &amp; &#128512;</p>').replace(/\s+/g, ' ').trim(), 'Halo dunia & 😀');
  assert.equal(snippetOf({ html: '<script>evil()</script><p>Isi   surat</p>' }), 'Isi surat');
});

const mail = (over = {}) => ({ headers: [], from: { name: 'A', address: 'a@x.example' }, subject: 'Halo', text: 'Apa kabar', html: '', ...over });

test('spam scoring', () => {
  assert.equal(scoreSpam(mail()).isSpam, false);
  assert.equal(scoreSpam(mail({ subject: 'SELAMAT!!! KAMU MENANG UNDIAN', text: 'Klaim hadiah sekarang' })).isSpam, true);
  assert.equal(scoreSpam(mail({ headers: [{ key: 'authentication-results', value: 'mx.cloudflare.net; dmarc=fail' }] })).isSpam, true);
  assert.equal(scoreSpam(mail({ headers: [{ key: 'x-spam-flag', value: 'YES' }] })).isSpam, true);
  assert.equal(scoreSpam(mail({ headers: [{ key: 'authentication-results', value: 'spf=pass dkim=pass dmarc=pass' }] })).isSpam, false);
});
