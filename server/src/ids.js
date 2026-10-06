// Nama alamat, token akses, dan id pesan — semua dari crypto.getRandomValues.

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const ALNUM = ALPHA + '0123456789';

/** n karakter acak dari `alphabet`, tanpa bias modulo (byte di atas kelipatan terbesar dibuang). */
export function randomChars(n, alphabet) {
  const out = [];
  const limit = 256 - (256 % alphabet.length);
  const buf = new Uint8Array(Math.max(8, n * 2));
  while (out.length < n) {
    crypto.getRandomValues(buf);
    for (const b of buf) if (b < limit && out.length < n) out.push(alphabet[b % alphabet.length]);
  }
  return out.join('');
}

/** Nama acak penuh, mis. ifhew8883d: huruf pertama a–z, sisanya a–z/0–9. */
export const randomLocal = (length = 10) => randomChars(1, ALPHA) + randomChars(length - 1, ALNUM);
export const randomSuffix = (length = 6) => randomChars(length, ALNUM);

/** Nama kustom 3–20 karakter (sebelum akhiran acak): huruf kecil/angka, . _ - hanya di tengah dan tidak dobel. */
export const isValidPrefix = (s) => /^[a-z0-9](?:[a-z0-9._-]{1,18})[a-z0-9]$/.test(s) && !/[._-]{2}/.test(s);

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Token akses kotak masuk: 32 byte acak (256 bit). Hanya hash-nya yang disimpan. */
export function newToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return b64url(b);
}

export async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Id pesan: urut waktu + 10 karakter acak. */
export const newId = () => 'm' + Date.now().toString(36) + randomChars(10, ALNUM);
