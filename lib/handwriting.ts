import { HAND_FONT } from "./handFont.generated";

/**
 * Lays text out in the single-stroke EMS Tech glyphs. Each stroke is a
 * polyline with its length, so a pen can draw it (stroke-dashoffset) and the
 * zombie hand can sit on the pen tip.
 */
export type Stroke = { points: [number, number][]; d: string; len: number };
export type Written = { strokes: Stroke[]; width: number; height: number; total: number };

const parsed = new Map<string, [number, [number, number][][]]>();
function glyph(ch: string) {
  let g = parsed.get(ch);
  if (!g) {
    const raw = HAND_FONT.glyphs[ch] ?? HAND_FONT.glyphs["?"];
    const adv = raw ? raw[0] : HAND_FONT.defaultAdvance;
    const lines = raw && raw[1]
      ? raw[1].split("|").map((s) => {
          const n = s.split(" ").map(Number);
          const pts: [number, number][] = [];
          for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
          return pts;
        })
      : [];
    g = [adv, lines];
    parsed.set(ch, g);
  }
  return g;
}

/**
 * @param size   font size in output units (em = size)
 * @param jitter small per-glyph wobble so it looks hand-written
 */
export function write(text: string, size = 40, jitter = 0.035): Written {
  const k = size / 1000;
  const strokes: Stroke[] = [];
  let x = 0;
  let seed = 7;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  for (const ch of text) {
    const [adv, lines] = glyph(ch);
    const dy = r() * jitter * size;
    const rot = r() * 0.06;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    for (const line of lines) {
      const pts = line.map(([px, py]) => {
        const lx = px * k, ly = py * k;
        return [x + lx * cos - (ly - size * 0.5) * sin, dy + lx * sin + (ly - size * 0.5) * cos + size * 0.5] as [number, number];
      });
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const d = "M" + pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join("L");
      strokes.push({ points: pts, d, len });
    }
    x += adv * k * 0.92; // marker handwriting runs a little tight
  }
  const total = strokes.reduce((n, s) => n + s.len, 0);
  return { strokes, width: Math.max(x, 1), height: size * 1.1, total };
}

/** Point at distance `t` along a stroke (for the pen tip). */
export function pointAt(s: Stroke, t: number): [number, number] {
  let left = t;
  for (let i = 1; i < s.points.length; i++) {
    const [ax, ay] = s.points[i - 1];
    const [bx, by] = s.points[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (left <= seg) {
      const f = seg ? left / seg : 0;
      return [ax + (bx - ax) * f, ay + (by - ay) * f];
    }
    left -= seg;
  }
  return s.points[s.points.length - 1];
}
