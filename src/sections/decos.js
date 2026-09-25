// Keep the sticker-bomb going below the hero: a few doodles stuck along the page edges.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import atlas from '../doodles/atlas.json';
import { setSprite } from '../lib/sprite.js';
import { audio } from '../lib/audio.js';
import { rand, shuffle, reducedMotion, isMobile } from '../lib/prefs.js';

gsap.registerPlugin(ScrollTrigger);

export function initDecos() {
  const pool = shuffle(atlas.items);
  const mobile = isMobile();
  document.querySelectorAll('.why, .inbox, .foot').forEach((section) => {
    const layer = document.createElement('div');
    layer.className = 'decos';
    layer.setAttribute('aria-hidden', 'true');
    const n = mobile ? 2 : section.classList.contains('foot') ? 4 : 6;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'deco sprite';
      setSprite(el, pool[(i + section.childElementCount * 7) % pool.length].id);
      const left = i % 2 === 0;
      const size = mobile ? rand(64, 84) : rand(96, 150);
      // hug the viewport edges, partially off-screen, so content is never covered
      const x = left ? rand(-0.35, 0.25) * size : null;
      el.style.setProperty('--s', `${size.toFixed(0)}px`);
      el.style.setProperty('--r', `${rand(-28, 28).toFixed(1)}deg`);
      el.style.top = `${(((Math.floor(i / 2) + rand(0.1, 0.8)) / Math.ceil(n / 2)) * 100).toFixed(1)}%`;
      if (left) el.style.left = `${x.toFixed(0)}px`;
      else el.style.right = `${(rand(-0.35, 0.25) * size).toFixed(0)}px`;
      layer.append(el);
      if (reducedMotion) continue;
      gsap.from(el, {
        scale: 2.3,
        opacity: 0,
        rotation: rand(-60, 60),
        duration: 0.34,
        ease: 'power3.in',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onComplete: () => audio.play('slap', { rate: rand(0.9, 1.25), volume: 0.3 }),
      });
      gsap.to(el, { y: rand(-60, -20), ease: 'none', scrollTrigger: { trigger: section, scrub: true } });
    }
    section.prepend(layer);
  });
}
