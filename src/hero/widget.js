// The email "label" sticker: label-maker strip, domain stickers, and the three vinyl buttons.
import { gsap } from 'gsap';
import { DOMAINS, makeUser } from '../lib/email.js';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { puff } from '../lib/confetti.js';
import { emit, store, rand, reducedMotion } from '../lib/prefs.js';

const LIFETIME = 10 * 60; // seconds until an address "burns"
const DOMAIN_KEY = 'venbee:domain';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Slap a small sticker next to `anchor` (also announced via the live region). */
export function toast(text, anchor) {
  const layer = document.querySelector('.toast');
  const r = anchor.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'toast__sticker';
  el.textContent = text;
  layer.append(el);
  const x = Math.min(r.right - 40, window.innerWidth - el.offsetWidth - 16);
  gsap.set(el, { x, y: r.top - 18, rotation: 8 });
  gsap
    .timeline({ onComplete: () => el.remove() })
    .from(el, { scale: 2.2, opacity: 0, rotation: -20, duration: reducedMotion ? 0 : 0.22, ease: 'power3.in' })
    .to(el, { scaleX: 1.1, scaleY: 0.9, duration: 0.05 })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' })
    .to(el, { y: '-=40', opacity: 0, rotation: 20, duration: 0.35, ease: 'power2.in', delay: 0.9 });
}

export function initWidget({ root, bird }) {
  const $ = (s) => root.querySelector(s);
  const label = $('.label');
  const tape = $('.label__tape');
  const dymo = $('.dymo');
  const chars = $('.dymo__chars');
  const srText = $('[data-address-text]');
  const timerEl = $('[data-timer]');
  const flash = $('.label__flash');
  const slot = $('.label__slot');
  const stack = $('.domains__stack');
  const chips = [...root.querySelectorAll('.dom')];
  const btnGen = $('#btn-generate');
  const btnCopy = $('#btn-copy');
  const btnToss = $('#btn-toss');

  const saved = store.get(DOMAIN_KEY, DOMAINS[0]);
  const state = {
    user: makeUser(),
    domain: DOMAINS.includes(saved) ? saved : DOMAINS[0],
    empty: false,
    expires: 0,
  };
  const address = () => (state.empty ? '' : `${state.user}@${state.domain}`);
  const chipFor = (d) => chips.find((c) => c.dataset.domain === d);
  chips.forEach((c) => (c._rot = rand(-16, 16)));

  // ── label-maker strip ────────────────────────────────────────────
  let printTl;
  function print({ animate = true } = {}) {
    const text = address();
    srText.textContent = text || 'kosong';
    label.classList.toggle('is-empty', state.empty);
    btnCopy.disabled = state.empty;
    emit('address', text);
    if (state.empty) return;
    printTl?.kill();
    gsap.set(dymo, { clearProps: 'transform,opacity' });
    chars.textContent = '';
    const at = text.indexOf('@');
    const spans = [...text].map((ch, i) => {
      const s = document.createElement('span');
      s.className = i >= at ? 'dymo__c dymo__c--at' : 'dymo__c';
      s.textContent = ch;
      chars.append(s);
      return s;
    });
    if (!animate || reducedMotion) return;
    const step = 0.026;
    printTl = gsap
      .timeline({ onComplete: () => gsap.set(tape, { clearProps: 'clipPath' }) })
      .fromTo(
        tape,
        { clipPath: 'inset(-30px 100% -30px -30px)' },
        {
          clipPath: 'inset(-30px -6% -30px -30px)',
          duration: spans.length * step + 0.06,
          ease: `steps(${spans.length})`,
        },
        0,
      )
      .from(spans, { scaleY: 1.9, y: -6, opacity: 0, duration: 0.14, stagger: step, ease: 'back.out(3)' }, 0);
  }

  // ── countdown ────────────────────────────────────────────────────
  let timerId = 0;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  function tick() {
    const left = Math.max(0, Math.round((state.expires - Date.now()) / 1000));
    timerEl.textContent = fmt(left);
    if (left === 0 && !state.empty) toss();
  }
  function startTimer() {
    state.expires = Date.now() + LIFETIME * 1000;
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    tick();
  }
  function stopTimer() {
    clearInterval(timerId);
    timerEl.textContent = '--:--';
  }

  // ── domain stickers ──────────────────────────────────────────────
  function targets() {
    const size = chips[0].offsetWidth;
    const map = new Map();
    const sx = label.offsetLeft + slot.offsetLeft;
    const sy = label.offsetTop + slot.offsetTop;
    map.set(chipFor(state.domain), {
      x: sx + (slot.offsetWidth - size) / 2,
      y: sy + (slot.offsetHeight - size) / 2,
      rotation: 12,
    });
    const waiting = chips.filter((c) => c.dataset.domain !== state.domain);
    const sw = stack.offsetWidth;
    const sh = stack.offsetHeight;
    const horizontal = sw > sh;
    waiting.forEach((c, i) => {
      let x;
      let y;
      if (horizontal) {
        const step = Math.min(size * 1.05, (sw - size) / 3);
        x = stack.offsetLeft + (sw - (size + step * 3)) / 2 + i * step;
        y = stack.offsetTop + (sh - size) / 2 + (i % 2 ? 4 : -4);
      } else {
        const step = Math.min(size * 0.74, (sh - size) / 3);
        x = stack.offsetLeft + (sw - size) / 2 + (i % 2 ? 8 : -8);
        y = stack.offsetTop + (sh - (size + step * 3)) / 2 + i * step;
      }
      map.set(c, { x, y, rotation: c._rot });
    });
    return map;
  }

  let swapping = false;
  function layoutChips() {
    if (swapping) return;
    const t = targets();
    chips.forEach((c, i) => {
      gsap.set(c, t.get(c));
      c.style.zIndex = c.dataset.domain === state.domain ? 10 : String(i + 1);
    });
  }

  function syncAria() {
    chips.forEach((c) => {
      const on = c.dataset.domain === state.domain;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
    });
  }

  function selectDomain(domain) {
    if (domain === state.domain || swapping) return;
    const prev = chipFor(state.domain);
    const next = chipFor(domain);
    state.domain = domain;
    store.set(DOMAIN_KEY, domain);
    syncAria();
    const t = targets();
    chips.forEach((c, i) => (c.style.zIndex = String(i + 1)));
    next.style.zIndex = 20;
    prev.style.zIndex = 15;

    if (reducedMotion) {
      layoutChips();
      if (!state.empty) print({ animate: false });
      return;
    }
    swapping = true;
    audio.peelStart();
    const nt = t.get(next);
    const pt = t.get(prev);
    gsap
      .timeline({
        onComplete: () => {
          swapping = false;
          next.style.zIndex = 10;
        },
      })
      .to(next, { scale: 1.3, rotation: '+=24', duration: 0.14, ease: 'power2.out' })
      .add(() => audio.peelStop())
      .to(next, { x: nt.x, y: nt.y, rotation: nt.rotation, duration: 0.36, ease: 'power2.inOut' })
      .to(next, { scale: 1, duration: 0.1, ease: 'power3.in' }, '-=0.08')
      .add(() => {
        audio.play('slap', { rate: 1.2, volume: 0.5 });
        shake(0.25);
        if (!state.empty) print();
      })
      .to(next, { scaleX: 1.15, scaleY: 0.85, duration: 0.05 })
      .to(next, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.35)' });
    gsap
      .timeline({ delay: 0.06 })
      .to(prev, { scale: 1.2, duration: 0.12, ease: 'power2.out' })
      .to(prev, { x: pt.x, y: pt.y, rotation: pt.rotation, duration: 0.42, ease: 'power2.inOut' })
      .to(prev, { scale: 1, duration: 0.12, ease: 'power3.in' }, '-=0.1')
      .add(() => audio.play('slap', { rate: 1.45, volume: 0.28 }));
    chips
      .filter((c) => c !== next && c !== prev)
      .forEach((c) => gsap.to(c, { ...t.get(c), duration: 0.35, ease: 'power2.out' }));
  }

  chips.forEach((c) => {
    c.addEventListener('click', () => {
      if (c.dataset.domain === state.domain) {
        gsap.fromTo(c, { rotation: 4 }, { rotation: 12, duration: 0.6, ease: 'elastic.out(1.5, 0.3)' });
        return;
      }
      selectDomain(c.dataset.domain);
    });
    c.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const i = DOMAINS.indexOf(state.domain);
      const d = DOMAINS[(i + dir + DOMAINS.length) % DOMAINS.length];
      selectDomain(d);
      chipFor(d).focus();
    });
  });

  // ── vinyl buttons ────────────────────────────────────────────────
  function pressable(btn, action) {
    let byPointer = false;
    const release = () => {
      if (!btn.classList.contains('is-down')) return;
      btn.classList.remove('is-down');
      gsap.to(btn, { scaleX: 1, scaleY: 1, duration: 0.75, ease: 'elastic.out(1.35, 0.3)', overwrite: 'auto' });
    };
    btn.addEventListener('pointerdown', (e) => {
      if (btn.disabled || e.button !== 0) return;
      byPointer = true;
      btn.classList.add('is-down');
      gsap.to(btn, { scaleX: 0.94, scaleY: 0.88, duration: 0.08, ease: 'power2.out', overwrite: 'auto' });
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => btn.addEventListener(t, release));
    btn.addEventListener('click', () => {
      if (!byPointer) {
        gsap
          .timeline()
          .to(btn, { scaleX: 0.94, scaleY: 0.88, duration: 0.07, overwrite: 'auto' })
          .to(btn, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1.35, 0.3)' });
      }
      byPointer = false;
      audio.play('squeak', { rate: rand(0.9, 1.15) });
      const r = btn.getBoundingClientRect();
      puff(r.left + r.width / 2, r.top + r.height * 0.35);
      action();
    });
  }

  let tossTween;
  function generate() {
    tossTween?.kill();
    state.user = makeUser();
    state.empty = false;
    print();
    startTimer();
    bird?.hop();
    emit('generate');
  }

  async function copy() {
    if (state.empty) return;
    const ok = await copyText(address());
    audio.play('shutter');
    gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.5, ease: 'power2.out' });
    toast(ok ? 'TERSALIN!' : 'Gagal salin :(', label);
  }

  function toss() {
    if (state.empty) return;
    audio.play('whoosh');
    stopTimer();
    emit('toss');
    const finish = () => {
      state.empty = true;
      gsap.set(dymo, { clearProps: 'transform,opacity' });
      print({ animate: false });
    };
    if (reducedMotion) return finish();
    tossTween = gsap.to(dymo, {
      x: rand(240, 360),
      y: rand(-170, -100),
      rotation: rand(25, 70),
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: finish,
    });
  }

  pressable(btnGen, generate);
  pressable(btnCopy, copy);
  pressable(btnToss, toss);
  dymo.addEventListener('click', copy);

  // ── init ─────────────────────────────────────────────────────────
  syncAria();
  print({ animate: false });
  startTimer();
  layoutChips();
  new ResizeObserver(layoutChips).observe(root);

  function slapIn() {
    const t = targets();
    const active = chipFor(state.domain);
    const order = [...chips.filter((c) => c !== active), active];
    const tl = gsap.timeline();
    tl.add(() => print(), 0);
    tl.fromTo(
      label,
      { rotation: -5, scale: 1.04 },
      { rotation: -1.2, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' },
      0,
    );
    order.forEach((c, i) => {
      const p = t.get(c);
      tl.add(
        gsap
          .timeline()
          .set(c, { autoAlpha: 1 })
          .fromTo(
            c,
            { x: p.x, y: p.y - 40, scale: 2.3, rotation: p.rotation - 40, opacity: 0 },
            { y: p.y, scale: 1, rotation: p.rotation, opacity: 1, duration: 0.24, ease: 'power3.in' },
          )
          .add(() => {
            audio.play('slap', { rate: rand(1.2, 1.5), volume: 0.3 });
            shake(0.12);
          })
          .to(c, { scaleX: 1.15, scaleY: 0.85, duration: 0.05 })
          .to(c, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.35)' }),
        0.35 + i * 0.1,
      );
    });
    return tl;
  }

  return {
    address,
    layout: layoutChips,
    slapIn,
    show: () => gsap.set(chips, { autoAlpha: 1 }),
  };
}
