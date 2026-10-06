// Penilaian spam sederhana. Hasilnya hanya menentukan folder (inbox/spam) — surat TIDAK pernah
// ditolak atau dihapus karena dianggap spam.

import { htmlToText } from './scan.js';

export const SPAM_THRESHOLD = 3;

const SPAM_WORDS = /(menang(kan)?|pemenang|hadiah|undian|lottery|winner|you have won|jackpot|klaim hadiah|claim (your )?prize|giveaway|bitcoin|pinjaman cepat|pinjol|tanpa jaminan|slot gacor|casino|viagra|100% free|act now|urgent action)/g;

/** @param {import('postal-mime').Email} email → {score, isSpam, reasons} */
export function scoreSpam(email) {
  let score = 0;
  const reasons = [];
  const add = (n, why) => { score += n; reasons.push(why); };
  const header = (key) => (email.headers || []).filter((h) => h.key === key).map((h) => h.value).join('\n').toLowerCase();

  // Hasil SPF/DKIM/DMARC, kalau server di depan Worker menambahkan header hasil autentikasi.
  const auth = `${header('authentication-results')}\n${header('arc-authentication-results')}`;
  if (/\bspf=fail\b/.test(auth) || /^\s*fail\b/m.test(header('received-spf'))) add(2.5, 'spf-fail');
  else if (/\bspf=softfail\b/.test(auth) || /^\s*softfail\b/m.test(header('received-spf'))) add(1, 'spf-softfail');
  if (/\bdkim=fail\b/.test(auth)) add(1.5, 'dkim-fail');
  if (/\bdmarc=fail\b/.test(auth)) add(3, 'dmarc-fail');
  if (/^\s*yes\b/m.test(header('x-spam-flag')) || /^\s*yes\b/m.test(header('x-spam-status'))) add(5, 'upstream-spam-flag');

  const subject = email.subject || '';
  const letters = subject.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 8 && letters === letters.toUpperCase()) add(1.5, 'subject-all-caps');
  if (/!{3,}/.test(subject)) add(1, 'subject-exclamations');

  const body = `${subject} ${email.text || ''} ${htmlToText(email.html)}`.toLowerCase();
  const hits = new Set(body.match(SPAM_WORDS) || []);
  if (hits.size) add(Math.min(4, hits.size * 1.5), 'spam-words:' + [...hits].slice(0, 5).join(','));
  if (!email.from?.address) add(1, 'no-from');

  return { score, isSpam: score >= SPAM_THRESHOLD, reasons };
}
