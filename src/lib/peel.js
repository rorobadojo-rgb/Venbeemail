// DOM sticker peel.
//
// A fold line sweeps in from one corner. The part of the sticker beyond the fold is
// clipped away from the front, and a "flap" (the sticker's paper backing) is drawn
// reflected across the fold line — exactly what a real peeled corner looks like
// from above. Works on any box; pass a mask on the flap for die-cut shapes.

const EMPTY = 'polygon(0 0, 0 0, 0 0)';

function clipHalfPlane(pts, f, sign) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const fa = sign * f(a);
    const fb = sign * f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const k = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}

const polygon = (pts) =>
  pts.length < 3 ? EMPTY : `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ')})`;

export class Peel {
  /**
   * @param {object} o
   * @param {HTMLElement} o.box   sizing element (front + flap fill it at inset 0)
   * @param {HTMLElement} o.front content that gets clipped
   * @param {HTMLElement} o.flap  backing layer, reflected over the fold
   * @param {'tl'|'tr'|'bl'|'br'} o.corner corner that lifts first
   * @param {number} o.skew  degrees to rotate the fold direction (avoids a perfect 45°)
   * @param {number} o.start fraction of the extent where the art begins (die-cut shapes
   *                         don't fill their box, so p is measured from first contact)
   * @param {number} o.lift  1 = flap folded flat; < 1 foreshortens it so it reads as
   *                         curling up towards the viewer instead of lying flat
   */
  constructor({ box, front, flap, corner = 'br', skew = 0, start = 0, lift = 1 }) {
    Object.assign(this, { box, front, flap, corner, skew, start, lift, p: 0 });
    this.measure();
  }

  measure() {
    const W = this.box.offsetWidth;
    const H = this.box.offsetHeight;
    const C = [this.corner.includes('r') ? W : 0, this.corner.includes('b') ? H : 0];
    let ux = W / 2 - C[0];
    let uy = H / 2 - C[1];
    const s = (this.skew * Math.PI) / 180;
    [ux, uy] = [ux * Math.cos(s) - uy * Math.sin(s), ux * Math.sin(s) + uy * Math.cos(s)];
    const len = Math.hypot(ux, uy) || 1;
    const u = [ux / len, uy / len];
    const corners = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ];
    const L = Math.max(...corners.map((P) => (P[0] - C[0]) * u[0] + (P[1] - C[1]) * u[1]));
    Object.assign(this, { W, H, C, u, L });
    this.set(this.p);
  }

  /** p: 0 = flat, 1 = folded all the way across. */
  set(p) {
    this.p = p;
    const { W, H, C, u, L, front, flap } = this;
    const t = p > 0 ? (this.start + p * (1 - this.start)) * L : 0;
    if (t < 0.5 || !W) {
      front.style.clipPath = '';
      flap.style.clipPath = EMPTY;
      return;
    }
    const rect = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ];
    const f = (P) => (P[0] - C[0]) * u[0] + (P[1] - C[1]) * u[1] - t;
    front.style.clipPath = polygon(clipHalfPlane(rect, f, 1));
    flap.style.clipPath = polygon(clipHalfPlane(rect, f, -1));

    // Reflect across the fold line (normal u, through F = C + t·u); the component along u
    // is scaled by `lift` so a lifted flap looks shorter than the area it came from.
    const m = 1 + this.lift;
    const k = m * ((C[0] + u[0] * t) * u[0] + (C[1] + u[1] * t) * u[1]);
    const a = 1 - m * u[0] * u[0];
    const b = -m * u[0] * u[1];
    const d = 1 - m * u[1] * u[1];
    flap.style.transform = `matrix(${a}, ${b}, ${b}, ${d}, ${k * u[0]}, ${k * u[1]})`;

    // Shade the backing: light at the tip, darker towards the crease, thin highlight on the bend.
    const ang = Math.atan2(u[0], -u[1]);
    const lg = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang));
    const sC = (C[0] - W / 2) * u[0] + (C[1] - H / 2) * u[1] + lg / 2;
    const sF = sC + t;
    flap.style.background = `linear-gradient(${((ang * 180) / Math.PI).toFixed(2)}deg,
      #f8f2e4 ${sC.toFixed(1)}px, #e2d9c6 ${(sC + t * 0.55).toFixed(1)}px,
      #cdc3ae ${(sF - 9).toFixed(1)}px, #fffaf0 ${(sF - 3.5).toFixed(1)}px, #bfb49d ${sF.toFixed(1)}px)`;
  }
}
