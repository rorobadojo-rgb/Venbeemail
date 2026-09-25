// Section 2 — three big stickers whose covers unpeel as you scroll (+ small scroll slaps).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Peel } from '../lib/peel.js';
import { audio } from '../lib/audio.js';
import { reducedMotion, rand } from '../lib/prefs.js';

gsap.registerPlugin(ScrollTrigger);

const HINT = 0.07; // resting corner lift so it reads as "peel me"

export function initWhy() {
  document.querySelectorAll('.peel-card').forEach((card, i) => {
    const cover = card.querySelector('.peel-card__cover');
    const flap = card.querySelector('.peel-flap');
    const wrap = card.querySelector('.peel-flapwrap');
    if (reducedMotion) {
      card.classList.add('is-peeled');
      return;
    }
    const peel = new Peel({
      box: card,
      front: cover,
      flap,
      corner: card.dataset.corner,
      skew: [10, -12, 8][i] ?? 0,
      lift: 0.6,
    });
    new ResizeObserver(() => peel.measure()).observe(card);

    const st = { p: HINT };
    let hush = 0;
    const apply = () => {
      const p = Math.min(st.p, 1);
      peel.set(p);
      wrap.style.opacity = String(1 - gsap.utils.clamp(0, 1, (p - 0.7) / 0.3));
      card.classList.toggle('is-peeled', p >= 0.999);
    };
    apply();

    gsap.to(st, {
      p: 1,
      ease: 'power1.in',
      onUpdate() {
        apply();
        // tape crackle while the scrub is moving
        audio.peelStart();
        clearTimeout(hush);
        hush = setTimeout(() => audio.peelStop(), 140);
      },
      scrollTrigger: { trigger: card, start: 'top 72%', end: 'top 12%', scrub: 0.6 },
    });
  });

  // Section titles, footer note and socials slap on when they scroll in.
  if (reducedMotion) return;
  gsap.utils.toArray('.section-title span, .foot__note span, .social').forEach((el) => {
    gsap.from(el, {
      scale: 2.2,
      opacity: 0,
      rotation: `+=${rand(-25, 25)}`,
      duration: 0.32,
      ease: 'power3.in',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => {
        audio.play('slap', { rate: rand(0.95, 1.25), volume: 0.35 });
        gsap.fromTo(
          el,
          { scaleX: 1.12, scaleY: 0.88 },
          { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.35)' },
        );
      },
    });
  });
}
