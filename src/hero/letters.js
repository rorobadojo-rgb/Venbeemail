// "VenbeeMail" as individual die-cut letter stickers:
// cream face · red-orange outline · black hard shadow · cream die-cut (same as the bird's border).
import { gsap } from 'gsap';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { rand } from '../lib/prefs.js';

const WORD = 'VenbeeMail';
// Bowlby One advance widths in 1/100 em (read from the font's hmtx table).
const ADV = { V: 75.9, e: 72, n: 71.3, b: 74.4, M: 107.1, a: 76.9, i: 37.3, l: 37.6 };
const PAD = 17; // die-cut + outline room around the glyph
const SX = 4.5; // hard shadow offset
const SY = 6;
const CAP = 80;
const CREAM = '#F5E6C8';
const RED = '#FF3A1F';
const BLACK = '#0A0A0A';

function letterSVG(ch, id) {
  const adv = ADV[ch] ?? 72;
  const w = adv + PAD * 2 + SX;
  const h = CAP + 4 + PAD * 2 + SY;
  const x = PAD + adv / 2;
  const y = PAD + CAP;
  const t = (attrs, dx = 0, dy = 0) => `<text x="${x + dx}" y="${y + dy}" ${attrs}>${ch}</text>`;
  const cut = `fill="${CREAM}" stroke="${CREAM}" stroke-width="30"`;
  const solid = `fill="${BLACK}" stroke="${BLACK}" stroke-width="15"`;
  const extrude = [0.33, 0.66, 1].map((k) => t(solid, SX * k, SY * k)).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${(w / 100).toFixed(3)}em" height="${(h / 100).toFixed(3)}em" aria-hidden="true" focusable="false">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/>
</linearGradient></defs>
<g font-family="'Bowlby One', 'Titan One', 'Arial Black', sans-serif" font-size="100" text-anchor="middle" stroke-linejoin="round">
${t(cut)}${t(cut, SX, SY)}${extrude}${t(solid)}
${t(`fill="${CREAM}" stroke="${RED}" stroke-width="11" paint-order="stroke"`)}
${t(`fill="url(#${id})" stroke="${BLACK}" stroke-width="2.2"`)}
</g></svg>`;
}

export function buildLetters(title) {
  title.textContent = '';
  return [...WORD].map((ch, i) => {
    const el = document.createElement('span');
    el.className = 'ltr';
    el.innerHTML = letterSVG(ch, `ltr-gloss-${i}`);
    el.dataset.rot = rand(-8, 8).toFixed(2);
    el.style.zIndex = String(i + 1);
    title.append(el);
    gsap.set(el, { rotation: +el.dataset.rot });
    return el;
  });
}

function land(el, { volume = 0.45 } = {}) {
  el.classList.remove('is-lifted');
  return gsap
    .timeline()
    .to(el, { scale: 1, duration: 0.12, ease: 'power3.in', overwrite: 'auto' })
    .add(() => {
      audio.play('slap', { rate: rand(1.05, 1.35), volume });
      shake(0.16);
    })
    .to(el, { scaleX: 1.14, scaleY: 0.86, duration: 0.05, ease: 'power2.out' })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1.2, 0.35)' });
}

/** One letter at a time: fly in big, slap, squash, settle. */
export function slapInLetters(letters) {
  const tl = gsap.timeline();
  tl.set(letters, { opacity: 0 }, 0);
  tl.set(letters[0].parentElement, { autoAlpha: 1 }, 0);
  letters.forEach((el, i) => {
    const rot = +el.dataset.rot;
    tl.add(
      gsap
        .timeline()
        .fromTo(
          el,
          { scale: 2.7, y: -46, rotation: rot + rand(-45, 45), opacity: 0 },
          { scale: 1, y: 0, rotation: rot, opacity: 1, duration: 0.26, ease: 'power3.in' },
        )
        .add(() => {
          audio.play('slap', { rate: rand(1.05, 1.4), volume: 0.32 });
          shake(0.14);
        })
        .to(el, { scaleX: 1.16, scaleY: 0.84, duration: 0.05, ease: 'power2.out' })
        .to(el, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.25, 0.32)' }),
      i * 0.085,
    );
  });
  return tl;
}

/** Desktop only: drag letters around (with throw inertia); double-click resets them. */
export async function enableLetterDrag(letters, bounds) {
  const [{ Draggable }, { InertiaPlugin }] = await Promise.all([
    import('gsap/Draggable'),
    import('gsap/InertiaPlugin'),
  ]);
  gsap.registerPlugin(Draggable, InertiaPlugin);
  const title = letters[0].parentElement;
  title.classList.add('can-drag');

  letters.forEach((el) => {
    const rot = +el.dataset.rot;
    const tilt = gsap.quickTo(el, 'rotation', { duration: 0.3, ease: 'power2.out' });
    const [drag] = Draggable.create(el, {
      type: 'x,y',
      bounds,
      inertia: true,
      edgeResistance: 0.8,
      zIndexBoost: true,
      onPress() {
        el.classList.add('is-lifted');
        gsap.to(el, { scale: 1.14, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
        audio.peelStart();
      },
      onDrag() {
        tilt(rot + gsap.utils.clamp(-16, 16, this.deltaX * 1.4));
        audio.peelSpeed(Math.hypot(this.deltaX, this.deltaY) * 60);
      },
      onThrowUpdate() {
        tilt(rot + gsap.utils.clamp(-10, 10, this.deltaX));
      },
      onRelease() {
        audio.peelStop();
        tilt(rot);
        gsap.delayedCall(0, () => {
          if (!drag.isThrowing) land(el);
        });
      },
      onThrowComplete() {
        land(el);
      },
    });
  });

  title.addEventListener('dblclick', (e) => {
    e.preventDefault();
    letters.forEach((el, i) => {
      gsap
        .timeline({ delay: i * 0.045 })
        .to(el, { x: 0, y: 0, scale: 1.15, rotation: +el.dataset.rot, duration: 0.32, ease: 'power2.inOut' })
        .add(() => land(el, { volume: 0.3 }));
    });
  });
}
