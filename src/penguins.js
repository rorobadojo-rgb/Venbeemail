// Original VenbeeMail penguin cast — parametric, flat cel-shaded SVG sprites.
// Pure string output (no DOM) so the same code builds the WebGL texture atlas,
// the mobile/DOM penguins and the exported files in public/sprites/.

const K = '#0A0A0A';
const SW = 5;

function rgb(h) {
  h = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export function shade(h, f) {
  const c = rgb(h).map((v) => (f < 0 ? v * (1 + f) : v + (255 - v) * f));
  return '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
const rad = (d) => (d * Math.PI) / 180;
const f1 = (n) => Math.round(n * 10) / 10;

function egg(cx, cy, w, h) {
  const t = cy - h / 2, b = cy + h / 2, r = w / 2;
  return `M${f1(cx)} ${f1(t)}C${f1(cx + r * 0.8)} ${f1(t)} ${f1(cx + r)} ${f1(cy - h * 0.25)} ${f1(cx + r)} ${f1(cy + h * 0.08)}` +
    `C${f1(cx + r)} ${f1(b - h * 0.1)} ${f1(cx + r * 0.62)} ${f1(b)} ${f1(cx)} ${f1(b)}` +
    `C${f1(cx - r * 0.62)} ${f1(b)} ${f1(cx - r)} ${f1(b - h * 0.1)} ${f1(cx - r)} ${f1(cy + h * 0.08)}` +
    `C${f1(cx - r)} ${f1(cy - h * 0.25)} ${f1(cx - r * 0.8)} ${f1(t)} ${f1(cx)} ${f1(t)}Z`;
}
const poly = (pts, fill, extra = '') =>
  `<polygon points="${pts.map((p) => p.map(f1).join(',')).join(' ')}" fill="${fill}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" ${extra}/>`;

/* ---------------- hair ---------------- */
function hair(spec, g) {
  const { cx, t, r, faceY } = g;
  const H = spec.hair || {};
  const c = H.color || '#B4FF1A';
  const d = shade(c, -0.35);
  switch (H.type) {
    case 'mohawk': {
      const tips = [[-16, -38], [-8, -54], [0, -62], [9, -56], [17, -40]];
      const pts = [[cx - 20, t + 14]];
      tips.forEach(([x, y], i) => {
        pts.push([cx + x, t + y]);
        if (i < tips.length - 1) pts.push([cx + x + 4.5, t - 6]);
      });
      pts.push([cx + 20, t + 14]);
      const shadePts = [[cx + 2, t + 10], [cx + 9, t - 56], [cx + 12, t - 6], [cx + 17, t - 40], [cx + 20, t + 14]];
      return { front: poly(pts, c) + `<polygon points="${shadePts.map((p) => p.map(f1).join(',')).join(' ')}" fill="${d}" opacity=".55"/>` };
    }
    case 'split': {
      const L = [[cx - r * 0.95, faceY - 4], [cx - r * 1.05, t + 8], [cx - 30, t - 18], [cx - 16, t - 6], [cx - 10, t - 26], [cx, t - 4], [cx, faceY - 14], [cx - 18, faceY - 22]];
      const R = [[cx, t - 4], [cx + 8, t - 30], [cx + 20, t - 8], [cx + 36, t - 20], [cx + r * 1.02, t + 10], [cx + r * 0.9, faceY - 2], [cx + 20, faceY - 20], [cx, faceY - 14]];
      return { front: poly(L, H.color || '#FF3DAE') + poly(R, H.color2 || '#22E6FF') };
    }
    case 'liberty': {
      let s = '';
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = rad(-78 + (156 / (n - 1)) * i);
        const bx = cx + Math.sin(a) * r * 0.55, by = t + 22 - Math.cos(a) * 20;
        const tx = cx + Math.sin(a) * 66, ty = t + 22 - Math.cos(a) * 68;
        const px = Math.cos(a) * 9, py = Math.sin(a) * 9;
        s += poly([[bx - px, by - py], [tx, ty], [bx + px, by + py]], i % 2 ? c : shade(c, 0.15));
      }
      return { back: s };
    }
    case 'beanie': {
      const band = `<rect x="${f1(cx - r * 0.92)}" y="${f1(t + 2)}" width="${f1(r * 1.84)}" height="15" rx="5" fill="${d}" stroke="${K}" stroke-width="${SW}"/>`;
      const dome = `<path d="M${f1(cx - r * 0.86)} ${f1(t + 6)}Q${f1(cx - r * 0.8)} ${f1(t - 34)} ${f1(cx)} ${f1(t - 36)}Q${f1(cx + r * 0.8)} ${f1(t - 34)} ${f1(cx + r * 0.86)} ${f1(t + 6)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}"/>`;
      let ribs = '';
      for (let i = -3; i <= 3; i++) ribs += `<line x1="${f1(cx + i * 11)}" y1="${f1(t + 4)}" x2="${f1(cx + i * 11)}" y2="${f1(t + 15)}" stroke="${K}" stroke-width="2" opacity=".5"/>`;
      const pom = H.pom === false ? '' : `<circle cx="${cx}" cy="${f1(t - 40)}" r="10" fill="${H.color2 || '#F5E6C8'}" stroke="${K}" stroke-width="${SW}"/>`;
      return { front: pom + dome + band + ribs };
    }
    case 'bucket': {
      return {
        front:
          `<path d="M${f1(cx - r * 1.2)} ${f1(t + 26)}L${f1(cx - r * 0.7)} ${f1(t + 8)}L${f1(cx + r * 0.7)} ${f1(t + 8)}L${f1(cx + r * 1.2)} ${f1(t + 26)}Z" fill="${d}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
          `<path d="M${f1(cx - r * 0.72)} ${f1(t + 12)}Q${f1(cx - r * 0.7)} ${f1(t - 20)} ${f1(cx)} ${f1(t - 20)}Q${f1(cx + r * 0.7)} ${f1(t - 20)} ${f1(cx + r * 0.72)} ${f1(t + 12)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}"/>` +
          `<path d="M${f1(cx - r * 0.7)} ${f1(t + 4)}H${f1(cx + r * 0.7)}" stroke="${K}" stroke-width="3" stroke-dasharray="4 4" opacity=".6"/>`,
      };
    }
    case 'afro': {
      let s = '';
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = rad(-100 + (200 / (n - 1)) * i);
        s += `<circle cx="${f1(cx + Math.sin(a) * r * 0.95)}" cy="${f1(t + 14 - Math.cos(a) * 26)}" r="${f1(r * 0.42)}" fill="${c}" stroke="${K}" stroke-width="${SW}"/>`;
      }
      return { back: s + `<ellipse cx="${cx}" cy="${f1(t + 6)}" rx="${f1(r * 1.05)}" ry="${f1(r * 0.55)}" fill="${c}"/>` };
    }
    case 'bowl': {
      return {
        front: `<path d="M${f1(cx - r * 0.98)} ${f1(faceY - 2)}Q${f1(cx - r * 1.05)} ${f1(t - 14)} ${f1(cx)} ${f1(t - 16)}Q${f1(cx + r * 1.05)} ${f1(t - 14)} ${f1(cx + r * 0.98)} ${f1(faceY - 2)}L${f1(cx + r * 0.6)} ${f1(faceY - 16)}L${f1(cx + r * 0.3)} ${f1(faceY - 10)}L${f1(cx)} ${f1(faceY - 18)}L${f1(cx - r * 0.3)} ${f1(faceY - 10)}L${f1(cx - r * 0.6)} ${f1(faceY - 16)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
          `<path d="M${f1(cx - r * 0.5)} ${f1(t - 6)}Q${f1(cx)} ${f1(t - 12)} ${f1(cx + r * 0.3)} ${f1(t - 8)}" stroke="${shade(c, 0.5)}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      };
    }
    case 'rainbow': {
      const cols = ['#FF3A1F', '#FF8A1F', '#FFE81F', '#B4FF1A', '#22E6FF', '#9B4DFF'];
      let s = '';
      cols.forEach((col, i) => {
        const x = cx - r * 0.9 + i * ((r * 1.8) / 6);
        const w = (r * 1.8) / 6 + 2;
        s += `<path d="M${f1(x)} ${f1(t - 4 - (i % 2) * 6)}L${f1(x + w)} ${f1(t - 8 + (i % 2) * 4)}L${f1(x + w * 0.8)} ${f1(faceY - 10 + (i % 3) * 3)}L${f1(x + w * 0.1)} ${f1(faceY - 14)}Z" fill="${col}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
      });
      return { front: s };
    }
    case 'pigtails': {
      const tail = (sx) =>
        `<path d="M${f1(cx + sx * r * 0.8)} ${f1(t + 14)}q${f1(sx * 34)} -8 ${f1(sx * 30)} 22q${f1(-sx * 4)} 14 ${f1(-sx * 20)} 4z" fill="${c}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
        `<circle cx="${f1(cx + sx * r * 0.82)}" cy="${f1(t + 16)}" r="5" fill="#FFE81F" stroke="${K}" stroke-width="3"/>`;
      return {
        back: tail(-1) + tail(1),
        front: `<path d="M${f1(cx - r * 0.8)} ${f1(t + 16)}Q${f1(cx)} ${f1(t - 16)} ${f1(cx + r * 0.8)} ${f1(t + 16)}Q${f1(cx)} ${f1(t + 2)} ${f1(cx - r * 0.8)} ${f1(t + 16)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}"/>`,
      };
    }
    case 'spiky': {
      const pts = [[cx - r * 0.85, t + 20]];
      for (let i = 0; i < 6; i++) {
        const x = cx - r * 0.8 + i * ((r * 1.6) / 5);
        pts.push([x - 4, t - 4 - (i % 2 ? 22 : 12)]);
        pts.push([x + 6, t + 6]);
      }
      pts.push([cx + r * 0.85, t + 20]);
      return { front: poly(pts, c) };
    }
    case 'cap': {
      return {
        front:
          `<path d="M${f1(cx - r * 0.9)} ${f1(t + 22)}Q${f1(cx - r * 0.9)} ${f1(t - 16)} ${f1(cx)} ${f1(t - 16)}Q${f1(cx + r * 0.9)} ${f1(t - 16)} ${f1(cx + r * 0.9)} ${f1(t + 22)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}"/>` +
          `<path d="M${f1(cx + r * 0.3)} ${f1(t - 10)}L${f1(cx + r * 1.35)} ${f1(t - 20)}L${f1(cx + r * 1.3)} ${f1(t - 8)}L${f1(cx + r * 0.5)} ${f1(t + 2)}Z" fill="${d}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
          `<circle cx="${cx}" cy="${f1(t - 14)}" r="4" fill="${K}"/>`,
      };
    }
    case 'curly': {
      let s = '';
      for (let i = 0; i < 5; i++) {
        const x = cx - 26 + i * 13;
        s += `<circle cx="${f1(x)}" cy="${f1(t - 2 - (i % 2) * 6)}" r="10" fill="${c}" stroke="${K}" stroke-width="4"/>`;
      }
      return { front: s };
    }
    case 'buzz': {
      return {
        front: `<path d="M${f1(cx - r * 0.8)} ${f1(t + 16)}Q${f1(cx)} ${f1(t - 12)} ${f1(cx + r * 0.8)} ${f1(t + 16)}Q${f1(cx)} ${f1(t + 4)} ${f1(cx - r * 0.8)} ${f1(t + 16)}Z" fill="${c}" stroke="${K}" stroke-width="4"/>` +
          `<path d="M${f1(cx - 4)} ${f1(t - 2)}l6 18" stroke="${H.color2 || '#F5E6C8'}" stroke-width="5" stroke-linecap="round"/>`,
      };
    }
    default:
      return {};
  }
}

/* ---------------- eyes ---------------- */
function eyes(spec, g, P) {
  const { cx, faceY } = g;
  const gz = P.gaze || 0;
  if (P.blink && spec.eyes !== 'shades') {
    return `<path d="M${cx - 22} ${faceY + 2}q8 5 16 0M${cx + 6} ${faceY + 2}q8 5 16 0" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
  switch (spec.eyes) {
    case 'angry':
      return (
        `<polygon points="${cx - 25},${faceY - 6} ${cx - 5},${faceY + 1} ${cx - 6},${faceY + 11} ${cx - 23},${faceY + 8}" fill="${K}"/>` +
        `<polygon points="${cx + 25},${faceY - 6} ${cx + 5},${faceY + 1} ${cx + 6},${faceY + 11} ${cx + 23},${faceY + 8}" fill="${K}"/>` +
        `<rect x="${cx - 18 + gz}" y="${faceY + 3}" width="3" height="3" fill="#F5E6C8"/><rect x="${cx + 12 + gz}" y="${faceY + 3}" width="3" height="3" fill="#F5E6C8"/>`
      );
    case 'shades': {
      let s = `<rect x="${cx - 32}" y="${faceY - 7}" width="64" height="6" fill="${K}"/>`;
      for (const sx of [-1, 1]) {
        const x0 = sx < 0 ? cx - 30 : cx + 4;
        s += `<rect x="${x0}" y="${faceY - 3}" width="26" height="14" fill="${K}"/>` +
          `<rect x="${x0 + 4}" y="${faceY + 1}" width="4" height="4" fill="#22E6FF"/><rect x="${x0 + 8}" y="${faceY - 3}" width="4" height="4" fill="#fff" opacity=".7"/>` +
          `<rect x="${x0 + 22}" y="${faceY + 11}" width="4" height="4" fill="${K}"/>`;
      }
      return s + `<rect x="${cx - 4}" y="${faceY - 1}" width="8" height="4" fill="${K}"/>`;
    }
    case 'sleepy':
      return (
        `<path d="M${cx - 24} ${faceY}h18M${cx + 6} ${faceY}h18" stroke="${K}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M${cx - 21} ${faceY}q6 8 12 0M${cx + 9} ${faceY}q6 8 12 0" fill="${K}"/>`
      );
    case 'wide':
    default: {
      const s = spec.eyeSize || 9;
      return (
        `<circle cx="${cx - 14}" cy="${faceY + 2}" r="${s}" fill="#fff" stroke="${K}" stroke-width="3.5"/>` +
        `<circle cx="${cx + 14}" cy="${faceY + 2}" r="${s}" fill="#fff" stroke="${K}" stroke-width="3.5"/>` +
        `<circle cx="${cx - 13 + gz}" cy="${faceY + 3}" r="${s * 0.45}" fill="${K}"/><circle cx="${cx + 15 + gz}" cy="${faceY + 3}" r="${s * 0.45}" fill="${K}"/>` +
        (spec.brows ? `<path d="M${cx - 25} ${faceY - 10}l16 5M${cx + 25} ${faceY - 10}l-16 5" stroke="${K}" stroke-width="5" stroke-linecap="round"/>` : '')
      );
    }
  }
}

/* ---------------- beak ---------------- */
function beak(spec, g, P) {
  const { cx, faceY } = g;
  const s = spec.beak || 1;
  const bw = 22 * s, bh = 13 * s, by = faceY + 13;
  const col = spec.beakColor || '#FF8A1F';
  const open = (P.mouth || 0) * 10 * s;
  if (open < 1) {
    return poly([[cx - bw / 2, by], [cx + bw / 2, by], [cx + 2, by + bh]], col) +
      `<path d="M${f1(cx - bw / 2 + 5)} ${f1(by + 3)}H${f1(cx + 2)}" stroke="${shade(col, 0.5)}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return (
    poly([[cx - bw / 2, by + 2], [cx + bw / 2, by + 2], [cx + bw * 0.35, by + open + bh * 0.6], [cx - bw * 0.35, by + open + bh * 0.6]], '#7a0f12') +
    poly([[cx - bw / 2 - 2, by - 2], [cx + bw / 2 + 2, by - 2], [cx + 2, by + bh * 0.55]], col) +
    poly([[cx - bw * 0.36, by + open + bh * 0.3], [cx + bw * 0.36, by + open + bh * 0.3], [cx + 1, by + open + bh]], shade(col, -0.12))
  );
}

/* ---------------- garments (clipped to body) ---------------- */
function outfit(spec, g, uid) {
  const { cx, cy, t, b, r, faceY, bodyH } = g;
  const O = spec.outfit || {};
  const c = O.color || '#3D6FB6';
  const d = shade(c, -0.3);
  const neck = faceY + 26;
  switch (O.type) {
    case 'vest': {
      const panel = (sx) => {
        const x0 = cx + sx * r * 1.1, x1 = cx + sx * 16;
        return poly([[x0, neck - 8], [cx + sx * 20, neck - 2], [x1, cy + bodyH * 0.1], [cx + sx * 20, b - 14], [x0, b - 10]], c);
      };
      let patches = '';
      const pc = ['#FF3DAE', '#B4FF1A', '#FFE81F', '#22E6FF'];
      patches += `<rect x="${cx - r * 0.78}" y="${cy - 2}" width="16" height="12" fill="${pc[0]}" stroke="${K}" stroke-width="2.5" transform="rotate(-8 ${cx - r * 0.7} ${cy})"/>`;
      patches += `<circle cx="${cx + r * 0.62}" cy="${cy + 6}" r="8" fill="${pc[1]}" stroke="${K}" stroke-width="2.5"/>`;
      patches += `<rect x="${cx - r * 0.72}" y="${cy + 24}" width="14" height="10" fill="${pc[2]}" stroke="${K}" stroke-width="2.5"/>`;
      patches += `<path d="M${cx + r * 0.5} ${cy + 26}l6 -8l2 7l6 -6" stroke="${pc[3]}" stroke-width="3" fill="none"/>`;
      let studs = '';
      for (let i = 0; i < 5; i++) studs += `<circle cx="${f1(cx - 21 - i * 0.5)}" cy="${f1(neck + 6 + i * 11)}" r="2.3" fill="#E8E2D2"/><circle cx="${f1(cx + 21 + i * 0.5)}" cy="${f1(neck + 6 + i * 11)}" r="2.3" fill="#E8E2D2"/>`;
      return { clipped: panel(-1) + panel(1) + patches + studs + `<path d="M${cx - r} ${b - 12}l6 5l5 -5l6 5l5 -5M${cx + r} ${b - 12}l-6 5l-5 -5l-6 5l-5 -5" stroke="${d}" stroke-width="3" fill="none"/>` };
    }
    case 'tank': {
      return {
        clipped:
          `<path d="M${cx - r * 1.1} ${f1(neck + 4)}L${cx - r * 0.55} ${f1(neck + 4)}L${cx - r * 0.5} ${f1(t + bodyH * 0.3)}L${cx - r * 0.3} ${f1(t + bodyH * 0.3)}Q${cx} ${f1(neck + 22)} ${cx + r * 0.3} ${f1(t + bodyH * 0.3)}L${cx + r * 0.5} ${f1(t + bodyH * 0.3)}L${cx + r * 0.55} ${f1(neck + 4)}L${cx + r * 1.1} ${f1(neck + 4)}L${cx + r * 1.1} ${f1(b - 16)}L${cx - r * 1.1} ${f1(b - 16)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
          `<path d="M${cx - r} ${f1(b - 24)}H${cx + r}" stroke="${d}" stroke-width="4"/>`,
      };
    }
    case 'flannel': {
      const pid = `pl-${uid}`;
      const defs = `<pattern id="${pid}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${c}"/><rect width="16" height="6" y="5" fill="${d}" opacity=".7"/><rect width="6" height="16" x="5" fill="${d}" opacity=".6"/><rect width="16" height="1.5" y="13" fill="${O.color2 || '#F5E6C8'}" opacity=".7"/></pattern>`;
      const panel = (sx) => poly([[cx + sx * r * 1.1, neck - 10], [cx + sx * 12, neck], [cx + sx * 18, b - 8], [cx + sx * r * 1.1, b - 6]], `url(#${pid})`);
      const collar = (sx) => poly([[cx + sx * 12, neck - 2], [cx + sx * 30, neck - 8], [cx + sx * 22, neck + 14]], d);
      return { defs, clipped: panel(-1) + panel(1) + collar(-1) + collar(1) };
    }
    case 'bomber': {
      const panel = (sx) => poly([[cx + sx * r * 1.1, neck - 10], [cx + sx * 10, neck + 2], [cx + sx * 12, b - 18], [cx + sx * r * 1.1, b - 18]], c);
      return {
        clipped:
          `<rect x="${cx - 12}" y="${neck}" width="24" height="${f1(b - neck - 18)}" fill="#FF8A1F"/>` +
          panel(-1) + panel(1) +
          `<rect x="${cx - r * 1.1}" y="${f1(b - 20)}" width="${r * 2.2}" height="12" fill="${d}" stroke="${K}" stroke-width="4"/>` +
          `<path d="M${cx - r} ${f1(b - 16)}H${cx + r}M${cx - r} ${f1(b - 12)}H${cx + r}" stroke="${K}" stroke-width="1.5" opacity=".5"/>` +
          `<path d="M${cx - 26} ${neck - 6}Q${cx} ${neck + 8} ${cx + 26} ${neck - 6}" stroke="${d}" stroke-width="7" fill="none"/>` +
          `<rect x="${cx + r * 0.45}" y="${cy - 6}" width="6" height="18" fill="${d}" stroke="${K}" stroke-width="2"/>`,
      };
    }
    case 'tee': {
      const gfx = O.graphic || 'bolt';
      let art = '';
      const gy = cy + bodyH * 0.08;
      if (gfx === 'bolt') art = poly([[cx + 4, gy - 20], [cx - 12, gy + 2], [cx - 1, gy + 2], [cx - 6, gy + 20], [cx + 12, gy - 4], [cx + 1, gy - 4]], '#B4FF1A');
      if (gfx === 'eye') art = `<ellipse cx="${cx}" cy="${gy}" rx="18" ry="11" fill="#F5E6C8" stroke="${K}" stroke-width="3"/><circle cx="${cx}" cy="${gy}" r="6" fill="#FF3A1F" stroke="${K}" stroke-width="2"/>`;
      if (gfx === 'star') art = poly([[cx, gy - 18], [cx + 5, gy - 5], [cx + 18, gy - 5], [cx + 8, gy + 4], [cx + 12, gy + 18], [cx, gy + 9], [cx - 12, gy + 18], [cx - 8, gy + 4], [cx - 18, gy - 5], [cx - 5, gy - 5]], '#FFE81F');
      if (gfx === 'skull') art = `<path d="M${cx - 14} ${gy + 2}a14 14 0 1 1 28 0v6h-6v6h-16v-6h-6z" fill="#F5E6C8" stroke="${K}" stroke-width="3"/><circle cx="${cx - 6}" cy="${gy}" r="4" fill="${K}"/><circle cx="${cx + 6}" cy="${gy}" r="4" fill="${K}"/>`;
      return {
        clipped:
          `<path d="M${cx - r * 1.1} ${neck}Q${cx} ${neck + 14} ${cx + r * 1.1} ${neck}L${cx + r * 1.1} ${f1(b - 14)}L${cx - r * 1.1} ${f1(b - 14)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}"/>` +
          `<path d="M${cx - 18} ${neck + 5}Q${cx} ${neck + 16} ${cx + 18} ${neck + 5}" stroke="${d}" stroke-width="5" fill="none"/>` + art,
      };
    }
    case 'hoodie': {
      // oversized: drawn un-clipped so it spills past the body silhouette
      const w = r * 1.28;
      return {
        back: `<path d="M${cx - r * 0.95} ${f1(faceY + 18)}Q${cx - r * 1.05} ${f1(t - 6)} ${cx} ${f1(t - 8)}Q${cx + r * 1.05} ${f1(t - 6)} ${cx + r * 0.95} ${f1(faceY + 18)}Z" fill="${d}" stroke="${K}" stroke-width="${SW}"/>`,
        over:
          `<path d="M${cx - r * 0.7} ${neck - 6}Q${cx} ${neck + 10} ${cx + r * 0.7} ${neck - 6}L${cx + w} ${f1(b - 22)}Q${cx + w} ${f1(b - 4)} ${cx + w - 10} ${f1(b - 4)}L${cx - w + 10} ${f1(b - 4)}Q${cx - w} ${f1(b - 4)} ${cx - w} ${f1(b - 22)}Z" fill="${c}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
          `<path d="M${cx - 26} ${f1(cy + bodyH * 0.14)}H${cx + 26}L${cx + 32} ${f1(cy + bodyH * 0.34)}H${cx - 32}Z" fill="${d}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>` +
          `<path d="M${cx - 8} ${neck + 2}v22M${cx + 8} ${neck + 2}v18" stroke="${O.color2 || '#F5E6C8'}" stroke-width="3" stroke-linecap="round"/>` +
          `<rect x="${cx - w}" y="${f1(b - 12)}" width="${w * 2}" height="8" fill="${d}" opacity=".7"/>`,
      };
    }
    default:
      return {};
  }
}

/* ---------------- lower body extras ---------------- */
function shorts(spec, g) {
  if (!spec.shorts) return '';
  const { cx, b, r } = g;
  const c = spec.shorts;
  return `<path d="M${cx - r * 0.92} ${f1(b - 30)}H${cx + r * 0.92}L${cx + r * 0.98} ${f1(b + 2)}H${cx + 4}L${cx} ${f1(b - 8)}L${cx - 4} ${f1(b + 2)}H${cx - r * 0.98}Z" fill="${c}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
    `<rect x="${cx - r * 0.86}" y="${f1(b - 18)}" width="16" height="13" fill="${shade(c, -0.2)}" stroke="${K}" stroke-width="2.5"/><rect x="${cx + r * 0.86 - 16}" y="${f1(b - 18)}" width="16" height="13" fill="${shade(c, -0.2)}" stroke="${K}" stroke-width="2.5"/>`;
}

function feet(spec, g, P) {
  const { cx, feetY } = g;
  const sh = spec.shoes;
  const spread = P.sit ? 22 : 17;
  const fy = feetY + (P.sit ? 4 : 0);
  if (!sh) {
    return [-1, 1].map((s) => `<ellipse cx="${cx + s * spread}" cy="${fy}" rx="14" ry="7" fill="#FF8A1F" stroke="${K}" stroke-width="${SW}"/>`).join('');
  }
  const col = sh.color || '#F5E6C8';
  return [-1, 1]
    .map((s) => {
      const x = cx + s * spread;
      const hi = sh.type === 'high' ? 16 : 8;
      return `<g transform="translate(${x} ${fy}) scale(${s} 1)">` +
        `<path d="M-10 ${-hi}H6L8 -4Q20 -3 20 3V6H-12V${-hi + 2}Z" fill="${col}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>` +
        `<rect x="-12" y="2" width="32" height="5" fill="${sh.sole || '#fff'}" stroke="${K}" stroke-width="3"/>` +
        (sh.type === 'high' ? `<circle cx="-2" cy="${-hi + 6}" r="3" fill="${sh.accent || K}"/>` : '') +
        `<path d="M0 -8l7 3M-1 -3l8 3" stroke="${K}" stroke-width="2"/></g>`;
    })
    .join('');
}

/* ---------------- props ---------------- */
function tipOf(sx, sy, L, deg, side) {
  const a = rad(deg);
  return [sx + side * Math.sin(a) * L, sy + Math.cos(a) * L];
}

function board(g, P, spec) {
  const { cx, feetY } = g;
  const B = P.board;
  if (!B) return '';
  const col = spec.boardColor || '#FF3DAE';
  const y = feetY + 12 + (B.dy || 0);
  const x = cx + (B.dx || 0);
  const flip = B.flip || 1; // -1 shows the underside graphic
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${B.angle || 0}) scale(1 ${flip})">` +
    `<path d="M-50 -2Q-58 -10 -50 -12L50 -12Q58 -10 50 -2Z" fill="${flip < 0 ? col : '#2a2a2a'}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>` +
    (flip < 0 ? `<path d="M-30 -7h20M8 -7l8 -3l8 3" stroke="#F5E6C8" stroke-width="3" stroke-linecap="round"/>` : `<path d="M-50 -2L50 -2" stroke="${col}" stroke-width="3"/>`) +
    `<rect x="-36" y="-2" width="16" height="5" fill="#9aa0a6" stroke="${K}" stroke-width="2.5"/><rect x="20" y="-2" width="16" height="5" fill="#9aa0a6" stroke="${K}" stroke-width="2.5"/>` +
    `<circle cx="-28" cy="7" r="6" fill="#FFE81F" stroke="${K}" stroke-width="3"/><circle cx="28" cy="7" r="6" fill="#FFE81F" stroke="${K}" stroke-width="3"/></g>`;
}

function guitar(g, P) {
  const { cx, cy, bodyH } = g;
  const jx = cx - 4, jy = cy + bodyH * 0.14 + (P.guitarDy || 0);
  return `<g transform="translate(${f1(jx)} ${f1(jy)}) rotate(${P.guitarAngle ?? 28}) scale(.78)">` +
    `<rect x="-104" y="-4.5" width="104" height="9" fill="#6b3f1d" stroke="${K}" stroke-width="3.5"/>` +
    `<path d="M-100 -4V4M-86 -4V4M-72 -4V4M-58 -4V4M-44 -4V4" stroke="#F5E6C8" stroke-width="1.5" opacity=".7"/>` +
    `<polygon points="-104,-6 -126,-14 -128,4 -104,6" fill="#FF3DAE" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<polygon points="0,-9 60,-34 68,-22 16,0 68,22 60,34 0,9" fill="#FF3DAE" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/>` +
    `<polygon points="6,-5 56,-27 60,-22 14,-1" fill="#22E6FF"/><polygon points="6,5 56,27 60,22 14,1" fill="#9B4DFF"/>` +
    `<rect x="8" y="-5" width="10" height="10" fill="${K}"/><path d="M-100 -1.5H20M-100 1.5H20" stroke="#ddd" stroke-width=".9"/>` +
    `<circle cx="36" cy="-11" r="3" fill="#FFE81F" stroke="${K}" stroke-width="1.5"/><circle cx="42" cy="11" r="3" fill="#FFE81F" stroke="${K}" stroke-width="1.5"/></g>`;
}

function drums(g, P) {
  const { cx, feetY, t } = g;
  const kx = cx, ky = feetY - 34;
  const cymL = P.cymbal || 0;
  return (
    // cymbals
    `<line x1="${cx - 74}" y1="${t + 28}" x2="${cx - 74}" y2="${feetY}" stroke="#777" stroke-width="3"/><line x1="${cx + 76}" y1="${t + 40}" x2="${cx + 76}" y2="${feetY}" stroke="#777" stroke-width="3"/>` +
    `<ellipse cx="${cx - 74}" cy="${t + 26}" rx="26" ry="${6 + cymL}" fill="#E9B83B" stroke="${K}" stroke-width="3.5" transform="rotate(${-10 + cymL * 3} ${cx - 74} ${t + 26})"/>` +
    `<ellipse cx="${cx + 76}" cy="${t + 38}" rx="24" ry="${6 - cymL * 0.5}" fill="#E9B83B" stroke="${K}" stroke-width="3.5" transform="rotate(${8 - cymL * 2} ${cx + 76} ${t + 38})"/>` +
    // snare + tom
    `<path d="M${cx - 76} ${feetY - 60}v16a22 7 0 0 0 44 0v-16z" fill="#E8E2D2" stroke="${K}" stroke-width="3.5"/><ellipse cx="${cx - 54}" cy="${feetY - 60}" rx="22" ry="7" fill="#F5E6C8" stroke="${K}" stroke-width="3.5"/>` +
    `<path d="M${cx + 34} ${feetY - 66}v14a20 7 0 0 0 40 0v-14z" fill="#FF3A1F" stroke="${K}" stroke-width="3.5"/><ellipse cx="${cx + 54}" cy="${feetY - 66}" rx="20" ry="7" fill="#F5E6C8" stroke="${K}" stroke-width="3.5"/>` +
    // kick drum with cassette sticker
    `<circle cx="${kx}" cy="${ky}" r="40" fill="#FF3A1F" stroke="${K}" stroke-width="${SW}"/><circle cx="${kx}" cy="${ky}" r="32" fill="#F5E6C8" stroke="${K}" stroke-width="3"/>` +
    `<rect x="${kx - 20}" y="${ky - 13}" width="40" height="26" rx="3" fill="#B4FF1A" stroke="${K}" stroke-width="3" transform="rotate(-8 ${kx} ${ky})"/>` +
    `<g transform="rotate(-8 ${kx} ${ky})"><rect x="${kx - 13}" y="${ky - 5}" width="26" height="10" rx="5" fill="${K}"/><circle cx="${kx - 7}" cy="${ky}" r="3" fill="#F5E6C8"/><circle cx="${kx + 7}" cy="${ky}" r="3" fill="#F5E6C8"/><path d="M${kx - 12} ${ky + 9}h24" stroke="${K}" stroke-width="2"/></g>` +
    `<path d="M${kx - 42} ${ky + 34}l-8 10M${kx + 42} ${ky + 34}l8 10" stroke="#888" stroke-width="4"/>`
  );
}

/* ---------------- main ---------------- */
export function penguinSVG(spec, pose = {}, uid = 'pg', opts = {}) {
  const P = { bob: 0, tilt: 0, armL: 12, armR: 12, mouth: 0, squash: 1, lift: 0, board: null, sit: false, gaze: 0, ...pose };
  const h = spec.height || 1;
  const cx = 100;
  const feetY = 174 - P.lift;
  const bodyH = 116 * h * P.squash;
  const bodyW = 100 * (spec.width || 1) * (1 + (1 - P.squash) * 0.7);
  const cy = feetY - 9 - bodyH / 2 + P.bob + (P.sit ? 8 : 0);
  const t = cy - bodyH / 2, b = cy + bodyH / 2, r = bodyW / 2;
  const faceY = t + bodyH * 0.27;
  const g = { cx, cy, t, b, r, faceY, bodyH, feetY };
  const bodyCol = spec.body || '#17171F';
  const belly = spec.belly || '#F5E6C8';
  const H = hair(spec, g);
  const O = outfit(spec, g, uid);
  const clip = `cl-${uid}`;
  const bodyPath = egg(cx, cy, bodyW, bodyH);

  // belly patch shapes — differ per penguin
  const bs = spec.bellyShape || 'oval';
  let bellyEl = '';
  const by = cy + bodyH * 0.16;
  if (bs === 'oval') bellyEl = `<ellipse cx="${cx}" cy="${f1(by)}" rx="${f1(r * 0.62)}" ry="${f1(bodyH * 0.33)}" fill="${belly}"/>`;
  if (bs === 'round') bellyEl = `<circle cx="${cx}" cy="${f1(by + 6)}" r="${f1(r * 0.7)}" fill="${belly}"/>`;
  if (bs === 'tall') bellyEl = `<ellipse cx="${cx}" cy="${f1(by - 4)}" rx="${f1(r * 0.46)}" ry="${f1(bodyH * 0.4)}" fill="${belly}"/>`;
  if (bs === 'heart') bellyEl = `<path d="M${cx} ${f1(by - bodyH * 0.2)}C${cx - 12} ${f1(by - bodyH * 0.34)} ${f1(cx - r * 0.8)} ${f1(by - bodyH * 0.2)} ${f1(cx - r * 0.66)} ${f1(by + 6)}C${f1(cx - r * 0.5)} ${f1(by + bodyH * 0.3)} ${cx} ${f1(by + bodyH * 0.36)} ${cx} ${f1(by + bodyH * 0.36)}C${cx} ${f1(by + bodyH * 0.36)} ${f1(cx + r * 0.5)} ${f1(by + bodyH * 0.3)} ${f1(cx + r * 0.66)} ${f1(by + 6)}C${f1(cx + r * 0.8)} ${f1(by - bodyH * 0.2)} ${cx + 12} ${f1(by - bodyH * 0.34)} ${cx} ${f1(by - bodyH * 0.2)}Z" fill="${belly}"/>`;
  if (bs === 'bib') bellyEl = `<path d="M${f1(cx - r * 0.6)} ${f1(by - bodyH * 0.2)}H${f1(cx + r * 0.6)}Q${f1(cx + r * 0.72)} ${f1(by + bodyH * 0.34)} ${cx} ${f1(by + bodyH * 0.36)}Q${f1(cx - r * 0.72)} ${f1(by + bodyH * 0.34)} ${f1(cx - r * 0.6)} ${f1(by - bodyH * 0.2)}Z" fill="${belly}"/>`;
  if (spec.bellySpot) bellyEl += `<circle cx="${f1(cx + r * 0.2)}" cy="${f1(by + 10)}" r="6" fill="${bodyCol}" opacity=".85"/><circle cx="${f1(cx - r * 0.25)}" cy="${f1(by + 22)}" r="3.5" fill="${bodyCol}" opacity=".85"/>`;

  // face mask: union of 3 shapes, outlined via double pass
  const fm = (extra) =>
    `<ellipse cx="${cx - 14}" cy="${faceY}" rx="19" ry="17" ${extra}/><ellipse cx="${cx + 14}" cy="${faceY}" rx="19" ry="17" ${extra}/><ellipse cx="${cx}" cy="${faceY + 12}" rx="${f1(16 + (spec.beak || 1) * 4)}" ry="12" ${extra}/>`;
  const face = fm(`fill="${K}" stroke="${K}" stroke-width="6"`) + fm(`fill="${belly}"`);

  // cel shading: darker crescent on the right side of the body
  const cel = `<path d="${egg(cx + r * 0.42, cy + 4, bodyW * 0.7, bodyH * 0.98)}" fill="${shade(bodyCol, -0.45)}" opacity=".9"/>` +
    `<path d="M${f1(cx - r * 0.6)} ${f1(t + bodyH * 0.2)}Q${f1(cx - r * 0.72)} ${f1(cy)} ${f1(cx - r * 0.56)} ${f1(cy + bodyH * 0.22)}" stroke="${shade(bodyCol, 0.35)}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;

  // flippers
  const sy = cy - bodyH * 0.04;
  const sxL = cx - r * 0.86, sxR = cx + r * 0.86;
  const L = 42 * h;
  const sleeve = spec.sleeve || (['hoodie', 'bomber', 'flannel'].includes(spec.outfit?.type) ? spec.outfit.color : null);
  const flip = (sx, deg, side) => {
    const col = sleeve || bodyCol;
    return `<g transform="translate(${f1(sx)} ${f1(sy)}) rotate(${f1(-side * deg)})">` +
      `<path d="M-10 -4C-15 ${f1(L * 0.5)} -6 ${f1(L)} 0 ${f1(L)}C6 ${f1(L)} 15 ${f1(L * 0.5)} 10 -4Z" fill="${col}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
      (sleeve ? `<path d="M-9 ${f1(L * 0.6)}Q0 ${f1(L * 0.7)} 9 ${f1(L * 0.6)}" stroke="${K}" stroke-width="3" fill="none"/><path d="M-5 ${f1(L * 0.66)}C-5 ${f1(L * 0.9)} 5 ${f1(L * 0.9)} 5 ${f1(L * 0.66)}" fill="${bodyCol}"/>` : '') +
      (spec.wristband && side < 0 ? `<rect x="-9" y="${f1(L * 0.55)}" width="18" height="8" fill="#FF3A1F" stroke="${K}" stroke-width="2.5"/>` : '') +
      `</g>`;
  };
  const tipL = tipOf(sxL, sy, L, P.armL, -1);
  const tipR = tipOf(sxR, sy, L, P.armR, 1);

  // held props
  let held = '';
  const acc = spec.acc || [];
  if (acc.includes('mic')) {
    const [tx, ty] = tipR;
    const bx = cx + 12, byk = faceY + 18;
    const mx = tx + (bx - tx) * 0.55, my = ty + (byk - ty) * 0.55;
    held += `<path d="M${f1(tx)} ${f1(ty)}C${f1(tx + 30)} ${f1(ty + 40)} ${f1(cx + 70)} ${f1(feetY - 6)} ${f1(cx + 40)} ${f1(feetY + 2)}" stroke="${K}" stroke-width="3" fill="none"/>` +
      `<line x1="${f1(tx)}" y1="${f1(ty)}" x2="${f1(mx)}" y2="${f1(my)}" stroke="#333" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="${f1(mx)}" cy="${f1(my)}" r="8" fill="#C9CED6" stroke="${K}" stroke-width="3.5"/><path d="M${f1(mx - 5)} ${f1(my - 2)}h10M${f1(mx - 5)} ${f1(my + 2)}h10" stroke="${K}" stroke-width="1.2"/>`;
  }
  if (acc.includes('sticks')) {
    for (const [[tx, ty], s] of [[tipL, -1], [tipR, 1]]) {
      const ang = rad(s * (P.stickAngle ?? 40));
      held += `<line x1="${f1(tx)}" y1="${f1(ty)}" x2="${f1(tx + Math.sin(ang) * 40)}" y2="${f1(ty - Math.cos(ang) * 40)}" stroke="#E7C98C" stroke-width="5" stroke-linecap="round"/><line x1="${f1(tx)}" y1="${f1(ty)}" x2="${f1(tx + Math.sin(ang) * 40)}" y2="${f1(ty - Math.cos(ang) * 40)}" stroke="${K}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>`;
    }
  }
  if (acc.includes('phone')) {
    const [tx, ty] = tipL;
    held += `<g transform="translate(${f1(tx + 6)} ${f1(ty - 10)}) rotate(-8)"><rect x="-10" y="-17" width="20" height="32" rx="4" fill="#23232d" stroke="${K}" stroke-width="3.5"/><rect x="-7" y="-13" width="14" height="22" fill="#22E6FF" opacity=".85"/><circle cx="4" cy="-10" r="2.4" fill="#FF3A1F"/></g>`;
  }
  if (acc.includes('horns')) {
    const [tx, ty] = tipR;
    held += `<path d="M${f1(tx - 3)} ${f1(ty)}l-3 -10M${f1(tx + 4)} ${f1(ty)}l4 -10" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`;
  }

  const chain = acc.includes('chain')
    ? `<path d="M${f1(cx - 22)} ${f1(faceY + 26)}Q${cx} ${f1(faceY + 50)} ${f1(cx + 22)} ${f1(faceY + 26)}" stroke="#E9B83B" stroke-width="4" fill="none" stroke-dasharray="4 2"/><circle cx="${cx}" cy="${f1(faceY + 44)}" r="5" fill="#E9B83B" stroke="${K}" stroke-width="2"/>`
    : '';
  const headband = acc.includes('headband')
    ? `<path d="M${f1(cx - r * 0.86)} ${f1(faceY - 20)}Q${cx} ${f1(faceY - 30)} ${f1(cx + r * 0.86)} ${f1(faceY - 20)}" stroke="#F5E6C8" stroke-width="10" fill="none"/><path d="M${f1(cx - r * 0.86)} ${f1(faceY - 20)}Q${cx} ${f1(faceY - 30)} ${f1(cx + r * 0.86)} ${f1(faceY - 20)}" stroke="#FF3A1F" stroke-width="4" fill="none"/>`
    : '';
  const headphones = acc.includes('headphones')
    ? `<path d="M${f1(cx - r * 0.9)} ${f1(faceY)}Q${cx} ${f1(t - 30)} ${f1(cx + r * 0.9)} ${f1(faceY)}" stroke="${K}" stroke-width="6" fill="none"/><rect x="${f1(cx - r * 0.98 - 6)}" y="${f1(faceY - 12)}" width="14" height="24" rx="5" fill="#FF8A1F" stroke="${K}" stroke-width="3.5"/><rect x="${f1(cx + r * 0.98 - 8)}" y="${f1(faceY - 12)}" width="14" height="24" rx="5" fill="#FF8A1F" stroke="${K}" stroke-width="3.5"/>`
    : '';

  const behindArmL = P.armL > 100; // raised arms render behind head props for depth
  const inner =
    `<defs><clipPath id="${clip}"><path d="${bodyPath}"/></clipPath>${O.defs || ''}</defs>` +
    `<ellipse cx="${cx}" cy="${f1(feetY + 8)}" rx="${f1(r * 0.95)}" ry="7" fill="${K}" opacity="${opts.shadow === false ? 0 : 0.28}"/>` +
    (H.back || '') + (O.back || '') +
    (behindArmL ? flip(sxL, P.armL, -1) : '') +
    feet(spec, g, P) +
    `<path d="${bodyPath}" fill="${bodyCol}"/>` +
    `<g clip-path="url(#${clip})">${cel}${bellyEl}${O.clipped || ''}</g>` +
    `<path d="${bodyPath}" fill="none" stroke="${K}" stroke-width="${SW}"/>` +
    shorts(spec, g) + (O.over || '') + chain +
    face + eyes(spec, g, P) + beak(spec, g, P) + headband + headphones + (H.front || '') +
    (acc.includes('guitar') ? guitar(g, P) : '') +
    (behindArmL ? '' : flip(sxL, P.armL, -1)) + flip(sxR, P.armR, 1) +
    (acc.includes('drums') ? drums(g, P) : '') +
    held + board(g, P, spec);

  if (opts.inner) return inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -25 230 230" width="${opts.size || 256}" height="${opts.size || 256}"><g transform="rotate(${P.tilt} ${cx} ${feetY})">${inner}</g></svg>`;
}

/* ---------------- the cast ---------------- */
// Every penguin differs in beak size, belly patch, height and hair.
export const CAST = [
  {
    id: 'vocalist', role: 'band', scale: 2.8,
    spec: { height: 1.0, beak: 1.3, eyes: 'angry', bellyShape: 'heart', belly: '#F5E6C8', hair: { type: 'mohawk', color: '#B4FF1A' }, outfit: { type: 'vest', color: '#3D6FB6' }, shoes: { type: 'high', color: '#F5E6C8', accent: '#FF3A1F' }, acc: ['mic'] },
    frames: [
      { armR: 150, armL: 20, mouth: 0.2 },
      { armR: 150, armL: 60, mouth: 1, bob: 3, tilt: -4 },
      { armR: 155, armL: 150, mouth: 1.1, bob: -2, tilt: 5 },
      { armR: 145, armL: 30, mouth: 0.6, bob: 4, squash: 0.95 },
    ],
  },
  {
    id: 'guitarist', role: 'band', scale: 2.7,
    spec: { height: 0.94, width: 1.02, beak: 0.9, eyes: 'shades', bellyShape: 'bib', belly: '#FFF8EC', hair: { type: 'split', color: '#FF3DAE', color2: '#22E6FF' }, outfit: { type: 'tee', color: '#9B4DFF', graphic: 'skull' }, shoes: { type: 'high', color: '#17171F', sole: '#F5E6C8', accent: '#B4FF1A' }, acc: ['guitar', 'chain'] },
    frames: [
      { armL: 100, armR: 30, tilt: -3 },
      { armL: 104, armR: 58, tilt: 4, bob: 4, guitarAngle: 24 },
      { armL: 100, armR: 22, tilt: -8, bob: -2, guitarAngle: 32 },
      { armL: 108, armR: 60, tilt: 8, bob: 3, squash: 0.94, guitarAngle: 26 },
    ],
  },
  {
    id: 'drummer', role: 'band', scale: 2.9,
    spec: { height: 1.06, beak: 1.1, eyes: 'wide', brows: true, bellyShape: 'round', belly: '#F2EBDD', hair: { type: 'liberty', color: '#FF8A1F' }, outfit: { type: 'tank', color: '#E0281A' }, wristband: true, acc: ['drums', 'sticks', 'headband'] },
    frames: [
      { armL: 60, armR: 30, stickAngle: 50, mouth: 0.3 },
      { armL: 30, armR: 70, stickAngle: 20, cymbal: 3, bob: 3 },
      { armL: 80, armR: 40, stickAngle: 60, mouth: 0.8, bob: -1 },
      { armL: 35, armR: 85, stickAngle: 10, cymbal: -3, bob: 3 },
    ],
  },
  {
    id: 'kickflip', role: 'skater', scale: 1.9,
    spec: { height: 0.92, beak: 1.0, eyes: 'wide', eyeSize: 8, bellyShape: 'tall', belly: '#F5E6C8', hair: { type: 'beanie', color: '#FFE81F', color2: '#FF3A1F' }, outfit: { type: 'hoodie', color: '#9B4DFF', color2: '#FFE81F' }, shoes: { type: 'low', color: '#22E6FF' }, boardColor: '#B4FF1A' },
    frames: [
      { armL: 40, armR: 30, board: { angle: 0 }, tilt: -4 },
      { armL: 70, armR: 60, lift: 14, squash: 0.92, board: { angle: -18, dy: -4 } },
      { armL: 95, armR: 100, lift: 26, board: { angle: 25, dy: 4, flip: -1 }, tilt: 6 },
      { armL: 60, armR: 50, squash: 0.88, board: { angle: 0 } },
    ],
  },
  {
    id: 'cruiser', role: 'skater', scale: 1.8,
    spec: { height: 0.98, width: 0.96, beak: 1.15, eyes: 'sleepy', bellyShape: 'oval', belly: '#EDE3CF', bellySpot: true, hair: { type: 'cap', color: '#FF3A1F' }, outfit: { type: 'tee', color: '#F5E6C8', graphic: 'eye' }, shorts: '#8A7A4E', shoes: { type: 'high', color: '#FF3A1F', sole: '#fff', accent: '#F5E6C8' }, boardColor: '#FF8A1F' },
    frames: [
      { armL: 30, armR: 40, board: { angle: 0 }, tilt: -6 },
      { armL: 45, armR: 20, board: { angle: 0 }, tilt: -2, bob: 3, squash: 0.95 },
      { armL: 25, armR: 55, board: { angle: 0 }, tilt: -8 },
      { armL: 50, armR: 30, board: { angle: 0 }, tilt: -3, bob: 2 },
    ],
  },
  {
    id: 'filmer', role: 'skater', scale: 1.6,
    spec: { height: 0.86, beak: 0.8, eyes: 'wide', eyeSize: 10, bellyShape: 'round', belly: '#FFF8EC', hair: { type: 'curly', color: '#FFE81F' }, outfit: { type: 'bomber', color: '#3E5A3A' }, shoes: { type: 'low', color: '#F5E6C8' }, acc: ['phone', 'headphones'] },
    frames: [
      { sit: true, armL: 150, armR: 20, gaze: -2 },
      { sit: true, armL: 155, armR: 24, gaze: 2, bob: 1 },
      { sit: true, armL: 140, armR: 30, gaze: 0 },
      { sit: true, armL: 150, armR: 20, blink: true },
    ],
  },
];

const crowdFrames = (s = 1) => [
  { armL: 18, armR: 18 },
  { armL: 24, armR: 20, bob: 4, squash: 0.94 },
  { armL: 150 * s, armR: 155, mouth: 0.8, lift: 6 },
  { armL: 160 * s, armR: 145, mouth: 1, lift: 14, squash: 1.04 },
];
const crowd = [
  { id: 'c-flannel', spec: { height: 0.9, beak: 1.4, eyes: 'wide', bellyShape: 'oval', belly: '#F5E6C8', hair: { type: 'afro', color: '#9B4DFF' }, outfit: { type: 'flannel', color: '#C0281C' }, shoes: { type: 'low', color: '#17171F', sole: '#F5E6C8' } } },
  { id: 'c-bomber', spec: { height: 1.02, beak: 0.85, eyes: 'angry', bellyShape: 'tall', belly: '#FFF8EC', hair: { type: 'bowl', color: '#1FC8B5' }, outfit: { type: 'bomber', color: '#2B2B2B' }, shoes: { type: 'high', color: '#F5E6C8', accent: '#9B4DFF' } } },
  { id: 'c-bucket', spec: { height: 0.84, beak: 1.05, eyes: 'sleepy', bellyShape: 'round', belly: '#EDE3CF', hair: { type: 'bucket', color: '#FFE81F' }, outfit: { type: 'tee', color: '#17171F', graphic: 'bolt' }, acc: ['horns'] } },
  { id: 'c-chain', spec: { height: 0.96, beak: 1.2, eyes: 'wide', brows: true, bellyShape: 'heart', belly: '#F2EBDD', bellySpot: true, hair: { type: 'rainbow' }, acc: ['chain'], shoes: { type: 'low', color: '#FF3DAE' } } },
  { id: 'c-bandtee', spec: { height: 0.88, width: 1.06, beak: 0.95, eyes: 'wide', eyeSize: 7, bellyShape: 'bib', belly: '#F5E6C8', hair: { type: 'pigtails', color: '#FF3DAE' }, outfit: { type: 'tee', color: '#22E6FF', graphic: 'star' }, shoes: { type: 'high', color: '#17171F', sole: '#fff', accent: '#FF3DAE' } } },
  { id: 'c-plaid', spec: { height: 1.0, beak: 1.1, eyes: 'angry', bellyShape: 'oval', belly: '#FFF8EC', hair: { type: 'spiky', color: '#FFE81F' }, outfit: { type: 'flannel', color: '#2A4E8C', color2: '#B4FF1A' }, acc: ['horns'] } },
  { id: 'c-capkid', spec: { height: 0.8, beak: 0.75, eyes: 'wide', eyeSize: 10, bellyShape: 'round', belly: '#F5E6C8', hair: { type: 'cap', color: '#B4FF1A' }, outfit: { type: 'bomber', color: '#FF8A1F' }, shoes: { type: 'low', color: '#9B4DFF' } } },
  { id: 'c-buzz', spec: { height: 1.08, width: 0.94, beak: 1.35, eyes: 'sleepy', bellyShape: 'tall', belly: '#EDE3CF', hair: { type: 'buzz', color: '#1FC8B5', color2: '#FF3DAE' }, outfit: { type: 'hoodie', color: '#22E6FF', color2: '#17171F' }, acc: ['chain'], shoes: { type: 'high', color: '#FFE81F', accent: '#17171F' } } },
];
crowd.forEach((c, i) => CAST.push({ ...c, role: 'crowd', scale: 1.45 + (c.spec.height - 0.9) * 0.6, frames: crowdFrames(i % 2 ? 1 : 0.9) }));

export function castById(id) {
  return CAST.find((c) => c.id === id);
}
