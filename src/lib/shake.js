// Screen shake driven by "trauma" (accumulates per slap, decays every frame).
import { gsap } from 'gsap';
import { reducedMotion } from './prefs.js';

let el = null;
let trauma = 0;
let applied = false;

export function initShake(target) {
  el = target;
  if (!reducedMotion) gsap.ticker.add(tick);
}

export function shake(amount = 0.25) {
  if (reducedMotion || !el) return;
  trauma = Math.min(1, trauma + amount);
}

function tick() {
  if (trauma <= 0.002) {
    if (applied) {
      el.style.transform = '';
      applied = false;
    }
    trauma = 0;
    return;
  }
  const t = trauma ** 1.6;
  const x = (Math.random() * 2 - 1) * 9 * t;
  const y = (Math.random() * 2 - 1) * 9 * t;
  const r = (Math.random() * 2 - 1) * 0.9 * t;
  el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg)`;
  applied = true;
  trauma = Math.max(0, trauma - 0.045 * gsap.ticker.deltaRatio());
}
