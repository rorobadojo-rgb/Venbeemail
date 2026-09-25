// The mascot sticker: resting peeled corner, lifts further on hover, blinks every ~5s,
// hops when an address is generated, and on click peels off, spins and re-slaps elsewhere.
import { gsap } from 'gsap';
import { Peel } from '../lib/peel.js';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { rand, reducedMotion } from '../lib/prefs.js';

const REST = 0.07;
const HOVER = 0.15;

const overlap = (a, b) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

export function initBird(el) {
  const box = el.querySelector('.bird__peel');
  const hop = el.querySelector('.bird__hop');
  const lid = el.querySelector('.bird__lid path');
  const peel = new Peel({
    box,
    front: el.querySelector('.bird__front'),
    flap: el.querySelector('.bird__flap'),
    corner: 'tr',
    skew: -12,
    start: 0.2, // the silhouette starts ~21% in from the top-right corner of its box
    lift: 0.8,
  });
  const st = { p: REST };
  const apply = () => peel.set(st.p);
  let busy = false;

  new ResizeObserver(() => peel.measure()).observe(box);
  gsap.set(lid, { scaleY: 0, transformOrigin: '50% 0%' });
  gsap.set(hop, { transformOrigin: '50% 100%' });
  apply();

  // Blink every ~5s
  const blink = () => {
    gsap
      .timeline()
      .to(lid, { scaleY: 1, duration: 0.07, ease: 'power2.in' })
      .to(lid, { scaleY: 0, duration: 0.12, ease: 'power2.out', delay: 0.06 });
    gsap.delayedCall(rand(4.2, 5.8), blink);
  };
  if (!reducedMotion) gsap.delayedCall(3.2, blink);

  // Hover lifts the corner further
  el.addEventListener('pointerenter', (e) => {
    if (busy || e.pointerType === 'touch') return;
    gsap.to(st, { p: HOVER, duration: 0.3, ease: 'back.out(2.2)', onUpdate: apply, overwrite: true });
    audio.play('peel', { rate: 1.4, volume: 0.14, max: 0.22 });
  });
  el.addEventListener('pointerleave', () => {
    if (busy) return;
    gsap.to(st, { p: REST, duration: 0.4, ease: 'power2.out', onUpdate: apply, overwrite: true });
  });
  el.addEventListener('click', relocate);

  function pickSpot() {
    const hero = el.closest('.hero').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const cx = gsap.getProperty(el, 'x');
    const cy = gsap.getProperty(el, 'y');
    const homeLeft = r.left - cx;
    const homeTop = r.top - cy;
    const avoid = ['.title', '.widget', '.tagline', '.shh']
      .map((s) => document.querySelector(s)?.getBoundingClientRect())
      .filter(Boolean);
    const top0 = Math.max(hero.top, 0) + 8;
    const bottom0 = Math.min(hero.bottom, window.innerHeight) - r.height - 8;
    let best = null;
    for (let k = 0; k < 30; k++) {
      const left = rand(hero.left + 8, Math.max(hero.left + 8, hero.right - r.width - 8));
      const top = rand(top0, Math.max(top0, bottom0));
      const b = { left, top, right: left + r.width, bottom: top + r.height };
      let score = avoid.reduce((s, a) => s + overlap(b, a), 0);
      if (Math.hypot(left - r.left, top - r.top) < r.width * 0.9) score += 1e7;
      if (!best || score < best.score) best = { score, x: left - homeLeft, y: top - homeTop };
    }
    return best;
  }

  function relocate() {
    if (busy) return;
    busy = true;
    const spot = pickSpot();
    const rotation = rand(-16, 16);
    if (reducedMotion) {
      gsap.set(el, { x: spot.x, y: spot.y, rotation });
      audio.play('slap', { rate: 0.9 });
      busy = false;
      return;
    }
    audio.peelStart();
    const spin = Math.random() < 0.5 ? -360 : 360;
    gsap
      .timeline({
        onComplete: () => {
          busy = false;
        },
      })
      .to(st, { p: 0.5, duration: 0.34, ease: 'power2.in', onUpdate: apply, overwrite: true })
      .add(() => {
        audio.peelStop();
        audio.play('whoosh', { rate: 1.25, volume: 0.35 });
        st.p = 0;
        apply();
      })
      .to(el, { scale: 1.24, duration: 0.14, ease: 'power2.out' })
      .to(el, {
        x: spot.x,
        y: spot.y,
        rotation: rotation + spin,
        duration: 0.64,
        ease: 'power2.inOut',
      })
      .to(el, { scale: 1, duration: 0.13, ease: 'power3.in' }, '-=0.1')
      .add(() => {
        gsap.set(el, { rotation });
        audio.play('slap', { rate: 0.85 });
        shake(0.55);
      })
      .to(el, { scaleX: 1.1, scaleY: 0.9, duration: 0.06 })
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1.1, 0.35)' })
      .to(st, { p: REST, duration: 0.7, ease: 'elastic.out(1, 0.45)', onUpdate: apply }, '<');
  }

  function slapIn() {
    st.p = 0.35;
    apply();
    return gsap
      .timeline()
      .set(el, { autoAlpha: 1 })
      .fromTo(
        el,
        { scale: 2.5, rotation: -26, y: -70, opacity: 0 },
        { scale: 1, rotation: 0, y: 0, opacity: 1, duration: 0.38, ease: 'power3.in' },
      )
      .add(() => {
        audio.play('slap', { rate: 0.82 });
        shake(0.6);
      })
      .to(el, { scaleX: 1.1, scaleY: 0.9, duration: 0.06 })
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.35)' })
      .to(st, { p: REST, duration: 0.8, ease: 'elastic.out(1, 0.45)', onUpdate: apply }, '<');
  }

  function doHop() {
    if (reducedMotion) return;
    gsap
      .timeline()
      .to(hop, { y: -38, scaleY: 1.07, scaleX: 0.95, duration: 0.17, ease: 'power2.out', overwrite: 'auto' })
      .to(hop, { y: 0, scaleY: 1, scaleX: 1, duration: 0.17, ease: 'power2.in' })
      .add(() => audio.play('slap', { rate: 1.5, volume: 0.22 }))
      .to(hop, { scaleX: 1.09, scaleY: 0.9, duration: 0.05 })
      .to(hop, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.4)' });
  }

  window.addEventListener('resize', () => {
    if (!busy) gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 0.3 });
  });

  return { slapIn, hop: doHop, show: () => gsap.set(el, { autoAlpha: 1 }) };
}
