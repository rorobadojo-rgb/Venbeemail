// No WebGL? Scatter the same atlas stickers as DOM sprites and still slap them in.
import { gsap } from 'gsap';
import atlas from '../doodles/atlas.json';
import { buildLayout } from './layout.js';
import { setSprite, spritesOn } from '../lib/sprite.js';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { rand } from '../lib/prefs.js';

export function fallbackStickers({ host, count, reduced }) {
  spritesOn();
  const W = host.clientWidth;
  const H = host.clientHeight;
  buildLayout(count, W, H, atlas.items).forEach((l, k) => {
    const el = document.createElement('span');
    el.className = 'fb-sticker sprite';
    setSprite(el, l.item.id);
    el.style.setProperty('--s', `${l.size.toFixed(0)}px`);
    el.style.left = `${(((l.x + W / 2) / W) * 100).toFixed(2)}%`;
    el.style.top = `${(((H / 2 - l.y) / H) * 100).toFixed(2)}%`;
    gsap.set(el, { rotation: (-l.rot * 180) / Math.PI });
    host.append(el);
    if (reduced) return;
    gsap.from(el, {
      scale: 2.4,
      opacity: 0,
      rotation: `+=${rand(-90, 90)}`,
      duration: 0.4,
      ease: 'power3.in',
      delay: 0.2 + k * 0.08,
      onComplete: () => {
        audio.play('slap', { rate: rand(0.9, 1.2), volume: 0.3 });
        shake(0.12);
      },
    });
  });
}
