// The disposable-email tool. Front-end demo: the inbox is simulated until a mail backend is wired in
// (see `receiveMail` — swap the timer for a fetch/WebSocket to your SMTP catcher).
import gsap from 'gsap';
import { sfx } from './audio.js';
import { slimeSplat, lightningBurst, cameraFlash, sparkTrail, meltButton, squash } from './fx.js';
import { state, store } from './state.js';

export const DOMAINS = [
  ['peler.com', '#B4FF1A'], ['ewe.com', '#FF3DAE'], ['bawok.com', '#22E6FF'], ['vevek.com', '#9B4DFF'], ['pentil.com', '#FF8A1F'],
  ['ngab.com', '#FFE81F'], ['gaskeun.com', '#FF3A1F'], ['santuy.com', '#3DFFB0'], ['receh.com', '#C77DFF'], ['gabut.com', '#5AA9FF'],
];

const LIFETIME = 10 * 60 * 1000;
const MAIL_EVERY = 8000;
const USER_RE = /^[a-z0-9](?:[a-z0-9._-]{1,22})[a-z0-9]$/;

const ADJ = ['zombie', 'slime', 'receh', 'santuy', 'gabut', 'mager', 'bocil', 'kepo', 'galak', 'ngebut', 'lengket', 'bau', 'gaskeun', 'punk', 'rusuh'];
const NOUN = ['pinguin', 'skater', 'cilok', 'tahu', 'kucing', 'drummer', 'gitaris', 'bebek', 'kaset', 'sendal', 'mohawk', 'lele', 'bakwan', 'moshpit'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const MAILS = [
  { from: 'Gigs Tiket', subject: 'Kode verifikasi kamu: {code}', body: 'Masukkan kode <b>{code}</b> untuk lanjut. Berlaku 5 menit.<br>Jangan kasih kode ini ke siapa pun — termasuk pinguin yang ngaku admin.' },
  { from: 'Kolektif Papan Luncur', subject: 'Diskon 30% deck baru minggu ini', body: 'Deck maple 8.25" motif zombie slime lagi diskon. Stok terbatas, kayak kesabaran drummer kami.' },
  { from: 'Forum Distorsi', subject: 'Konfirmasi akun forum kamu', body: 'Tinggal satu langkah lagi! Klik tombol konfirmasi (demo) dan kamu resmi jadi anggota forum paling berisik se-Nusantara.' },
  { from: 'Kopi Rebel', subject: 'Poin kamu nambah +20 ☕', body: 'Makasih udah mampir. Kumpulin 100 poin, tukar satu es kopi susu gula aren. Tanpa ribet, tanpa nomor HP.' },
  { from: 'Radio Garasi', subject: 'Setlist malam ini sudah keluar', body: 'Open gate jam 7. Band pembuka: Pinguin Tanpa Rem. Bawa earplug, tinggalkan drama.' },
  { from: 'Demo Tape Club', subject: 'Welcome to the club, punk!', body: 'Kaset demo pertamamu sudah kami kirim (secara imajiner). Rewind pakai pensil, seperti leluhur.' },
  { from: 'Awan Trial', subject: 'Your 7-day free trial starts now', body: 'Trial aktif. Kami akan mengingatkan sebelum berakhir — ke alamat sementara ini, yang pada saat itu sudah meleleh. 😈' },
  { from: 'Mosh Pit Undercover', subject: 'Undangan: gig rahasia di bowl', body: 'Lokasi: skatepark biasa. Kode masuk: <b>{code}</b>. Dress code: denim, slime, dan niat.' },
  { from: 'Newsletter Receh', subject: '10 alasan slime lebih baik dari spam', body: '1. Slime bisa dipegang. 2. Spam tidak. 3–10. Lihat nomor 1 dan 2.' },
  { from: 'Satpam Akun', subject: 'Login baru terdeteksi', body: 'Ada login dari perangkat "Kulkas Pintar". Kalau itu kamu, abaikan email ini. Kalau bukan… itu tetap bukan urusan inbox sementara.' },
  { from: 'Toko Sepatu Tinggi', subject: 'High-top favoritmu restock!', body: 'Ukuran 42 sampai 44 kembali. Sol putih, tali neon, aura skater senior.' },
  { from: 'Undian Sendal', subject: 'Selamat! Kamu (belum tentu) menang', body: 'Ini contoh email yang pantas dibuang cepat. Untung alamatmu sementara.' },
];

const $ = (s, r = document) => r.querySelector(s);

export function initTool({ toast }) {
  const root = $('#tool');
  const goo = $('.tool-goo', root);
  const input = $('#username');
  const wrap = $('#input-wrap');
  const hint = $('#user-hint');
  const atDomain = $('#at-domain');
  const chips = $('#chips');
  const addrEl = $('#addr');
  const list = $('#mail-list');
  const empty = $('#inbox-empty');
  const count = $('#inbox-count');
  const timerVal = $('#timer-val');
  const bar = $('#slimebar');
  const btnGen = $('#btn-generate');

  const S = { user: '', domain: DOMAINS[0][0], address: '', expires: 0, total: LIFETIME, mails: 0, mailTimer: 0 };

  /* ---------- domain chips ---------- */
  chips.innerHTML = DOMAINS.map(
    ([d, c], i) => `<button type="button" class="chip" style="--slime:${c}" data-domain="${d}" aria-pressed="${i === 0}"><span>@${d}</span></button>`
  ).join('');
  const chipEls = [...chips.children];
  const colorOf = (d) => DOMAINS.find(([n]) => n === d)?.[1] || '#B4FF1A';
  function selectDomain(d, { splat = true } = {}) {
    S.domain = d;
    chipEls.forEach((c) => {
      const on = c.dataset.domain === d;
      c.setAttribute('aria-pressed', on);
      c.classList.toggle('coated', on);
      if (on && splat) {
        sfx('splat', { rate: 0.9 + Math.random() * 0.25 });
        slimeSplat(c, goo, colorOf(d));
        if (!state.reduced) gsap.fromTo(c, { scaleY: 0.7, scaleX: 1.15 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.35)' });
      }
    });
    atDomain.textContent = '@' + d;
    if (input.value) validate();
  }
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) selectDomain(c.dataset.domain);
  });
  chips.addEventListener('keydown', (e) => {
    const i = chipEls.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    chipEls[(i + step + chipEls.length) % chipEls.length].focus();
  });

  /* ---------- username validation ---------- */
  function validate() {
    const raw = input.value;
    const lower = raw.toLowerCase().replace(/\s+/g, '');
    let note = '';
    if (lower !== raw) {
      const pos = input.selectionStart;
      input.value = lower;
      input.setSelectionRange(pos, pos);
      note = 'Otomatis jadi huruf kecil. ';
    }
    const v = input.value;
    let ok = true, msg;
    if (!v) msg = 'Kosongin aja kalau mau nama random.';
    else if (/[^a-z0-9._-]/.test(v)) { ok = false; msg = 'Cuma boleh huruf kecil, angka, titik, strip, dan underscore.'; }
    else if (v.length < 3) { ok = false; msg = `Minimal 3 karakter (kurang ${3 - v.length}).`; }
    else if (/\.\./.test(v)) { ok = false; msg = 'Titiknya jangan dobel.'; }
    else if (!USER_RE.test(v)) { ok = false; msg = 'Awal & akhir harus huruf atau angka.'; }
    else msg = `Mantap — ${v}@${S.domain} siap dipakai.`;
    wrap.dataset.state = !v ? 'empty' : ok ? 'ok' : 'bad';
    input.setAttribute('aria-invalid', !ok);
    hint.textContent = note + msg;
    btnGen.disabled = !ok;
    return ok;
  }
  input.addEventListener('input', validate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnGen.click();
    }
  });
  const randomUser = () => `${pick(ADJ)}${pick(NOUN)}${Math.floor(10 + Math.random() * 990)}`;
  $('#btn-random').addEventListener('click', (e) => {
    input.value = randomUser();
    validate();
    sfx('pop');
    if (!state.reduced) {
      gsap.fromTo(input, { y: -8, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(3)' });
      gsap.fromTo(e.currentTarget.querySelector('.dice'), { rotation: 0 }, { rotation: 720, duration: 0.6, ease: 'power3.out' });
    }
  });

  /* ---------- address lifecycle ---------- */
  function setAddress(user, domain, { fresh = true } = {}) {
    S.user = user;
    S.address = `${user}@${domain}`;
    if (fresh) {
      S.expires = Date.now() + LIFETIME;
      S.total = LIFETIME;
      clearInbox();
    }
    addrEl.textContent = S.address;
    root.style.setProperty('--slime-active', colorOf(domain));
    $('#qr-addr').textContent = S.address;
    store('vm-address', JSON.stringify({ address: S.address, expires: S.expires }));
    if (!state.reduced) {
      gsap.fromTo(addrEl, { scale: 0.85, rotation: -2 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
    }
    scheduleMail(2500);
  }
  function generate() {
    const user = input.value && validate() ? input.value : randomUser();
    if (!input.value) {
      input.value = user;
      validate();
    }
    setAddress(user, S.domain);
  }
  btnGen.addEventListener('click', () => {
    if (btnGen.disabled) return;
    generate();
    sfx('drum');
    squash(btnGen);
    lightningBurst(btnGen);
    toast(`Alamat baru: ${S.address}`);
  });

  /* ---------- copy ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }
  const btnCopy = $('#btn-copy');
  btnCopy.addEventListener('click', async () => {
    await copyText(S.address);
    sfx('choke');
    cameraFlash();
    const copyIco = $('.ico-copy', btnCopy), check = $('.ico-check path', btnCopy), label = $('.lbl', btnCopy);
    gsap.killTweensOf([copyIco, check]);
    gsap.timeline()
      .to(copyIco, { scale: 0, rotation: -90, duration: 0.15, transformOrigin: '50% 50%' })
      .fromTo(check, { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' })
      .call(() => (label.textContent = 'COPIED!'), null, 0.1)
      .to(check, { strokeDashoffset: 30, duration: 0.2, delay: 1.3 })
      .to(copyIco, { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(3)' })
      .call(() => (label.textContent = 'COPY'));
    toast('Alamat disalin ke clipboard!');
  });

  /* ---------- inbox ---------- */
  const fmt = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function clearInbox() {
    list.innerHTML = '';
    S.mails = 0;
    count.textContent = '0';
    empty.hidden = false;
  }
  function receiveMail({ quiet = false } = {}) {
    const m = pick(MAILS);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const slug = m.from.toLowerCase().replace(/[^a-z]+/g, '');
    const li = document.createElement('li');
    li.className = 'mail';
    const id = `mail-${Date.now()}`;
    li.innerHTML =
      `<button class="mail-row" type="button" aria-expanded="false" aria-controls="${id}">` +
      `<span class="mail-dot" style="background:${pick(DOMAINS)[1]}"></span>` +
      `<span class="mail-from">${esc(m.from)}</span><span class="mail-subj">${esc(m.subject.replace('{code}', code))}</span>` +
      `<time class="mail-time">${fmt(new Date())}</time></button>` +
      `<div class="mail-body" id="${id}" hidden><p class="mail-meta">Dari: <b>${esc(m.from)}</b> &lt;noreply@${slug}.example&gt;<br>Ke: ${esc(S.address)}</p><p>${m.body.replaceAll('{code}', code)}</p></div>`;
    list.prepend(li);
    while (list.children.length > 25) list.lastElementChild.remove();
    S.mails++;
    count.textContent = String(S.mails);
    empty.hidden = true;
    if (!quiet) sfx('whoosh');
    if (!state.reduced) {
      gsap.from(li, { x: 140, rotationY: -35, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' });
      gsap.fromTo(count, { scale: 1.8 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }
  }
  function scheduleMail(delay = MAIL_EVERY) {
    clearTimeout(S.mailTimer);
    S.mailTimer = setTimeout(function loop() {
      if (!document.hidden) receiveMail();
      S.mailTimer = setTimeout(loop, MAIL_EVERY);
    }, delay);
  }
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.mail-row');
    if (!row) return;
    const li = row.parentElement;
    const body = li.querySelector('.mail-body');
    const open = row.getAttribute('aria-expanded') !== 'true';
    sfx('pop');
    const swap = () => {
      row.setAttribute('aria-expanded', open);
      body.hidden = !open;
      li.classList.toggle('open', open);
    };
    if (state.reduced) return swap();
    gsap.timeline()
      .to(li, { rotationX: 90, duration: 0.16, ease: 'power2.in', transformPerspective: 700 })
      .call(swap)
      .fromTo(li, { rotationX: -90 }, { rotationX: 0, duration: 0.45, ease: 'back.out(1.8)' });
  });

  const btnRefresh = $('#btn-refresh');
  btnRefresh.addEventListener('click', () => {
    sfx('rewind');
    const ico = $('.ico-refresh', btnRefresh);
    if (!state.reduced) gsap.fromTo(ico, { rotation: 0 }, { rotation: 360, duration: 0.65, ease: 'power2.inOut', transformOrigin: '50% 50%' });
    sparkTrail(ico);
    setTimeout(() => {
      if (Math.random() < 0.6) receiveMail();
      else toast('Belum ada email baru. Sabar, ngab.');
      scheduleMail();
    }, 650);
  });

  const btnDelete = $('#btn-delete');
  btnDelete.addEventListener('click', () => {
    sfx('squish');
    meltButton(btnDelete, goo, '#FF3A1F');
    const old = S.address;
    input.value = '';
    validate();
    setTimeout(() => {
      setAddress(randomUser(), S.domain);
      input.value = S.user;
      validate();
      toast(`${old} sudah dilelehkan. Ini alamat barumu.`);
    }, 500);
  });

  /* ---------- QR ---------- */
  const qrStage = $('#qr-stage');
  const qrCard = $('.qr-card', qrStage);
  const inboxLink = () => `${location.origin}${location.pathname}#inbox=${encodeURIComponent(S.address)}`;
  let qrLib = null;
  async function openQR() {
    qrLib ||= (await import('qrcode-generator')).default;
    const qr = qrLib(0, 'M');
    qr.addData(inboxLink());
    qr.make();
    $('#qr-code').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    qrStage.hidden = false;
    sfx('pop');
    if (state.reduced) return $('#qr-close').focus();
    gsap.fromTo(qrStage, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(qrCard, { rotationY: 180, scale: 0.6 }, { rotationY: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)', onComplete: () => $('#qr-close').focus() });
  }
  function closeQR() {
    if (state.reduced) return (qrStage.hidden = true);
    gsap.to(qrCard, { rotationY: -180, scale: 0.6, duration: 0.45, ease: 'power2.in' });
    gsap.to(qrStage, { opacity: 0, duration: 0.45, onComplete: () => (qrStage.hidden = true) });
  }
  $('#btn-qr').addEventListener('click', openQR);
  $('#qr-close').addEventListener('click', closeQR);
  qrStage.addEventListener('click', (e) => e.target === qrStage && closeQR());
  addEventListener('keydown', (e) => e.key === 'Escape' && !qrStage.hidden && closeQR());

  /* ---------- services ---------- */
  $('#svc-extend').addEventListener('click', () => {
    const remaining = Math.max(0, S.expires - Date.now()) + 10 * 60 * 1000;
    S.expires = Date.now() + remaining;
    S.total = Math.max(S.total, remaining);
    store('vm-address', JSON.stringify({ address: S.address, expires: S.expires }));
    sfx('glorp');
    if (!state.reduced) gsap.fromTo(bar, { filter: 'brightness(2)' }, { filter: 'brightness(1)', duration: 0.8 });
    toast('+10 menit. Slime-nya diisi ulang.');
  });
  $('#svc-change').addEventListener('click', () => {
    const d = pick(DOMAINS.filter(([n]) => n !== S.domain))[0];
    selectDomain(d);
    input.value = randomUser();
    validate();
    setAddress(input.value, d);
    toast(`Ganti alamat: ${S.address}`);
  });
  $('#svc-link').addEventListener('click', async () => {
    await copyText(inboxLink());
    sfx('choke');
    toast('Link inbox disalin. Buka di device lain buat pantau alamat ini.');
  });

  /* ---------- countdown ---------- */
  function tick() {
    const left = Math.max(0, S.expires - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    timerVal.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const p = left / S.total;
    bar.style.transform = `scaleX(${p})`;
    root.dataset.urgency = p < 0.1 ? 'high' : p < 0.3 ? 'mid' : 'low';
    if (left <= 0 && S.address) {
      toast(`${S.address} sudah hancur. Ini alamat baru, fresh dari oven.`);
      sfx('squish');
      setAddress(randomUser(), S.domain);
      input.value = S.user;
      validate();
    }
  }
  setInterval(tick, 250);

  /* ---------- boot: restore from #inbox= link or last session ---------- */
  let restored = null;
  const hash = new URLSearchParams(location.hash.slice(1)).get('inbox');
  if (hash) restored = { address: decodeURIComponent(hash), expires: Date.now() + LIFETIME };
  else {
    try {
      restored = JSON.parse(store('vm-address') || 'null');
    } catch {
      restored = null;
    }
  }
  const [ru, rd] = restored?.address?.split('@') || [];
  if (ru && USER_RE.test(ru) && DOMAINS.some(([d]) => d === rd) && restored.expires > Date.now()) {
    selectDomain(rd, { splat: false });
    input.value = ru;
    validate();
    S.expires = restored.expires;
    S.total = Math.max(LIFETIME, restored.expires - Date.now());
    setAddress(ru, rd, { fresh: false });
    receiveMail({ quiet: true });
  } else {
    selectDomain(DOMAINS[0][0], { splat: false });
    input.value = randomUser();
    validate();
    setAddress(input.value, S.domain);
  }
  tick();
}
