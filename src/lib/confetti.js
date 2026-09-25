// A puff of doodle confetti (stars, bones, tiny ghosts) cut from the sticker atlas.
import { gsap } from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { reducedMotion, rand, pick } from './prefs.js';
import { setSprite, spritesOn } from './sprite.js';

gsap.registerPlugin(Physics2DPlugin);

const BITS = ['star', 'bone', 'mini-ghost', 'sparkle', 'star', 'mini-ghost'];
let layer;

export function puff(x, y, { count = 12, spread = 1 } = {}) {
  if (reducedMotion) return;
  layer ||= document.querySelector('.confetti');
  if (!layer) return;
  spritesOn();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    const size = rand(22, 40);
    el.className = 'confetti__bit sprite';
    setSprite(el, pick(BITS));
    el.style.width = el.style.height = `${size}px`;
    layer.append(el);
    const dur = rand(0.9, 1.35);
    gsap.set(el, { x: x - size / 2, y: y - size / 2, rotation: rand(-40, 40), scale: 0.2 });
    gsap.to(el, { scale: 1, duration: 0.2, ease: 'back.out(3)' });
    gsap.to(el, {
      duration: dur,
      ease: 'none',
      rotation: `+=${rand(-420, 420)}`,
      physics2D: { velocity: rand(260, 560) * spread, angle: rand(-155, -25), gravity: 1150 },
      onComplete: () => el.remove(),
    });
    gsap.to(el, { opacity: 0, duration: dur * 0.35, delay: dur * 0.65, ease: 'power1.in' });
  }
}
