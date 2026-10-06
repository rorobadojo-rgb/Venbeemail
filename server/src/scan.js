// Penyelamat kode: cari OTP (angka 4–8 digit / alfanumerik) di dekat kata kunci, atau tautan
// verifikasi. Logika sama dengan `Scan` di public/banamail/index.html — ubah keduanya bersamaan.

const KW = /\b(kode|code|otp|pin|passcode|verifikasi|verification|verify|token|sandi|password|one[- ]?time|sekali pakai|login|masuk|konfirmasi|confirmation|aktivasi|activation)\b/gi;
const NUM = /(^|[^\d.,:/#])(\d{3}[ -]\d{3}|\d{4,8})(?![\d,:/]|\.\d)/g;
const ALNUM = /\b(?=[A-Z0-9-]*\d)(?=[A-Z0-9-]*[A-Z])([A-Z0-9]{3,4}-[A-Z0-9]{3,4}|[A-Z0-9]{6,8})\b/g;
const LINK_HINT = /verif|confirm|konfirmasi|activat|aktivasi|aktifkan|magic|token=|validat|validasi|reset/i;
const URL_RE = /https?:\/\/[^\s<>"']+/g;
const trimUrl = (u) => u.replace(/[.,;:!?)\]]+$/, '');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENTITIES[e.toLowerCase()] ?? m;
});

/** Teks kasar dari HTML (cukup untuk pemindaian & cuplikan, bukan untuk ditampilkan). */
export function htmlToText(html) {
  return decode(String(html || '')
    .replace(/<(script|style|head|noscript)[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' '));
}

export const snippetOf = ({ text, html }) => (text || htmlToText(html)).replace(/\s+/g, ' ').trim().slice(0, 160);

function findCode(text) {
  const kws = [...text.matchAll(KW)].map((m) => [m.index, m.index + m[0].length]);
  if (!kws.length) return null;
  const cands = [
    ...[...text.matchAll(NUM)].map((m) => ({ v: m[2], i: m.index + m[1].length, num: true })),
    ...[...text.matchAll(ALNUM)].map((m) => ({ v: m[1], i: m.index, num: false })),
  ];
  let best = null;
  for (const c of cands) {
    const end = c.i + c.v.length;
    let dist = Infinity;
    for (const [a, b] of kws) dist = Math.min(dist, b <= c.i ? c.i - b : a >= end ? (a - end) * 1.5 : 0);
    if (dist > 80) continue;
    if (c.num && /^(19|20)\d\d$/.test(c.v) && dist > 12) continue; // kemungkinan tahun
    const score = dist + (c.num ? 0 : 10);
    if (!best || score < best.score) best = { ...c, score };
  }
  return best ? { code: best.v, copy: best.num ? best.v.replace(/[ -]/g, '') : best.v } : null;
}

function findLink({ text, html }) {
  const links = [];
  for (const m of String(html || '').matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    links.push({ href: decode(m[2]).trim(), text: htmlToText(m[3]) });
  }
  for (const u of String(text || '').match(URL_RE) || []) links.push({ href: trimUrl(u), text: '' });
  const hit = links.find((l) => /^https?:\/\//i.test(l.href) && (LINK_HINT.test(l.href) || LINK_HINT.test(l.text)));
  return hit ? hit.href : null;
}

/** → {code, copy, link} atau null. */
export function scanRescue({ subject, text, html }) {
  const all = [subject, text, htmlToText(html)].filter(Boolean).join('\n');
  const c = findCode(all);
  const l = findLink({ text, html });
  if (!c && !l) return null;
  return { code: c?.code || null, copy: c?.copy || l, link: l };
}
