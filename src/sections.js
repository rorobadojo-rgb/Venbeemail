// Scroll choreography: flipping skate decks, the step-skating penguin, setlist FAQ, lights-out footer.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { castById, penguinSVG } from './penguins.js';
import { state } from './state.js';
import { sfx } from './audio.js';

gsap.registerPlugin(ScrollTrigger);

export function initSections({ onLights } = {}) {
  /* ---------- Kenapa VenbeeMail: decks flip over on scroll ---------- */
  const decks = gsap.utils.toArray('.deck-inner');
  if (!state.reduced) {
    decks.forEach((d, i) => {
      gsap.fromTo(
        d,
        { rotationY: 180, rotationZ: i % 2 ? 8 : -8, y: 80 },
        {
          rotationY: 0, rotationZ: (i - 1) * 3, y: 0, ease: 'power2.out',
          scrollTrigger: { trigger: d.closest('.decks'), start: `top ${85 - i * 8}%`, end: `top ${35 - i * 8}%`, scrub: 0.8 },
        }
      );
    });
  }

  /* ---------- Cara kerja: a penguin skates between the 3 steps ---------- */
  const rider = document.querySelector('.rider');
  const steps = gsap.utils.toArray('.step');
  if (rider) {
    const sk = castById('kickflip');
    rider.innerHTML = [0, 1, 2].map((f) => `<div class="rider-f rider-f${f}">${penguinSVG(sk.spec, sk.frames[f], `rd${f}`, { size: 120 })}</div>`).join('');
    const frames = rider.querySelectorAll('.rider-f');
    const show = (f) => frames.forEach((el, k) => (el.style.opacity = k === f ? 1 : 0));
    show(0);
    const track = document.querySelector('.track');
    let lastStep = -1;
    ScrollTrigger.create({
      trigger: '#cara',
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: true,
      onUpdate(self) {
        const p = self.progress;
        const max = track.clientWidth - rider.clientWidth;
        // hop over each step marker
        const seg = p * 2;
        const local = seg - Math.floor(seg);
        const airborne = local > 0.4 && local < 0.95 && p < 0.999;
        const hop = airborne ? Math.sin(((local - 0.4) / 0.55) * Math.PI) : 0;
        gsap.set(rider, { x: p * max, y: -hop * 46, rotation: hop * -12 });
        show(airborne ? (hop > 0.5 ? 2 : 1) : 0);
        const active = Math.min(2, Math.floor(p * 2 + 0.25));
        steps.forEach((s, k) => s.classList.toggle('active', k <= active));
        if (active !== lastStep) {
          if (lastStep !== -1) sfx('pop');
          lastStep = active;
        }
      },
    });
  }

  /* ---------- FAQ setlist accordion ---------- */
  document.querySelectorAll('.set-q').forEach((btn) => {
    const ans = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      btn.parentElement.classList.toggle('open', open);
      sfx('pop');
      if (state.reduced) {
        ans.hidden = !open;
        return;
      }
      if (open) {
        ans.hidden = false;
        gsap.fromTo(ans, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out' });
      } else {
        gsap.to(ans, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => (ans.hidden = true) });
      }
    });
  });
  if (!state.reduced) {
    gsap.from('.setlist', { rotation: -6, y: 80, opacity: 0, duration: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.setlist', start: 'top 85%' } });
    gsap.utils.toArray('.section-title').forEach((h) =>
      gsap.from(h, { y: 60, rotation: -4, opacity: 0, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: h, start: 'top 88%' } })
    );
  }

  /* ---------- Footer: stage lights switch off one by one ---------- */
  const lamps = gsap.utils.toArray('.lamp');
  ScrollTrigger.create({
    trigger: '#footer',
    start: 'top 95%',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      const on = Math.round((1 - self.progress) * lamps.length);
      lamps.forEach((l, i) => l.classList.toggle('off', i >= on));
      onLights?.(on / lamps.length);
    },
  });
}
