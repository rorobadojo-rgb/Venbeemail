// Sticker-bomb layout: a jittered grid so stickers overlap but still cover the whole surface.
import { shuffle, rand, clamp } from '../lib/prefs.js';

export function buildLayout(n, W, H, items) {
  const base = clamp(Math.sqrt((W * H) / n) * 1.04, 78, 205);
  const cols = Math.max(2, Math.round(Math.sqrt((n * W) / H)));
  const rows = Math.ceil(n / cols);
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n);
  const pool = [];
  while (pool.length < n) pool.push(...shuffle(items));

  return cells.map((c, k) => {
    const cx = c % cols;
    const cy = Math.floor(c / cols);
    return {
      item: pool[k],
      x: ((cx + 0.5 + rand(-0.34, 0.34)) * W) / cols - W / 2,
      y: H / 2 - ((cy + 0.5 + rand(-0.34, 0.34)) * H) / rows,
      rot: rand(-0.5, 0.5),
      size: base * rand(0.8, 1.2),
      // curl toward one of the four corners (local space), slightly off-diagonal
      peelAngle: Math.PI / 4 + Math.floor(rand(0, 4)) * (Math.PI / 2) + rand(-0.3, 0.3),
      rest: rand(0.05, 0.11),
    };
  });
}
