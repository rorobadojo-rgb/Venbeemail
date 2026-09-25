// Static illustrated skatepark (mobile, reduced motion, no-WebGL and 3D poster) with a few CSS-animated penguins.
import { castById, penguinSVG } from './penguins.js';

const sprite = (id, frame, x, y, size, uid) => {
  const c = castById(id);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="-15 -25 230 230" class="mp-f mp-f${frame}">${penguinSVG(c.spec, c.frames[frame], uid, { inner: true })}</svg>`;
};

function doodles() {
  const cols = ['#B4FF1A', '#FF3DAE', '#22E6FF', '#9B4DFF', '#FF8A1F', '#FFE81F'];
  let s = '';
  for (let i = 0; i < 12; i++) {
    const x = 40 + i * 98, y = 360 + (i % 3) * 14, c = cols[i % cols.length];
    if (i % 4 === 0) s += `<polygon points="${x},${y - 26} ${x + 8},${y - 6} ${x + 28},${y - 6} ${x + 12},${y + 6} ${x + 18},${y + 26} ${x},${y + 14} ${x - 18},${y + 26} ${x - 12},${y + 6} ${x - 28},${y - 6} ${x - 8},${y - 6}" fill="${c}" stroke="#0A0A0A" stroke-width="4"/>`;
    if (i % 4 === 1) s += `<polygon points="${x + 6},${y - 30} ${x - 14},${y + 2} ${x},${y + 2} ${x - 8},${y + 30} ${x + 16},${y - 6} ${x + 2},${y - 6}" fill="${c}" stroke="#0A0A0A" stroke-width="4"/>`;
    if (i % 4 === 2) s += `<ellipse cx="${x}" cy="${y}" rx="34" ry="20" fill="${c}" stroke="#0A0A0A" stroke-width="4"/><circle cx="${x + 5}" cy="${y}" r="9" fill="#0A0A0A"/>`;
    if (i % 4 === 3) s += `<path d="M${x - 30} ${y}c0-34 60-34 60 0l0 10a5 5 0 0 1-10 0v6a5 5 0 0 1-10 0v-8a5 5 0 0 1-10 0v12a5 5 0 0 1-10 0v-10a5 5 0 0 1-10 0z" fill="${c}" stroke="#0A0A0A" stroke-width="4"/>`;
  }
  return s;
}

export function buildStaticPark(host) {
  let fence = '';
  for (let x = -40; x < 1240; x += 22) fence += `M${x} 300l60 110M${x + 60} 300l-60 110`;
  const lights = [150, 330, 870, 1050]
    .map((x, i) =>
      `<g class="sp-light" style="--d:${i * 0.35}s"><rect x="${x - 4}" y="140" width="8" height="330" fill="#111"/>` +
      `<polygon class="sp-cone" points="${x - 26},150 ${x + 26},150 ${x < 600 ? x + 380 : x - 120},640 ${x < 600 ? x + 120 : x - 380},640" fill="url(#sp-beam)"/>` +
      `<rect x="${x - 30}" y="128" width="60" height="30" rx="4" fill="#1a1a1a" stroke="#0A0A0A" stroke-width="3"/><rect class="sp-bulb" x="${x - 25}" y="133" width="50" height="20" fill="#fff4d6"/></g>`
    )
    .join('');
  host.innerHTML = `
  <svg class="sp-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--sky-top)"/><stop offset=".55" style="stop-color:var(--sky-mid)"/><stop offset="1" style="stop-color:var(--sky-low)"/>
      </linearGradient>
      <radialGradient id="sp-sun"><stop offset="0" stop-color="#fff3d0"/><stop offset=".25" stop-color="#ffc56b" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
      <linearGradient id="sp-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></linearGradient>
      <linearGradient id="sp-bowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d574f"/><stop offset="1" stop-color="#8f887e"/></linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#sp-sky)"/>
    <circle class="sp-sunball" cx="330" cy="330" r="260" fill="url(#sp-sun)"/>
    <path d="${fence}" stroke="#bfc3c4" stroke-width="2.2" opacity=".55"/>
    <rect x="0" y="330" width="1200" height="96" fill="#7d766c"/>
    ${doodles()}
    <rect x="0" y="420" width="1200" height="380" fill="var(--concrete)"/>
    <path d="M0 470H1200M0 560H1200M0 680H1200M300 420L120 800M900 420L1080 800" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    ${lights}
    <ellipse cx="600" cy="560" rx="440" ry="120" fill="url(#sp-bowl)"/>
    <ellipse cx="600" cy="560" rx="440" ry="120" fill="none" stroke="#d6d9dc" stroke-width="7"/>
    <rect x="430" y="470" width="340" height="80" fill="#b8864f" stroke="#0A0A0A" stroke-width="5"/>
    <path d="M430 490H770M530 470V550M650 470V550" stroke="#6b3f1d" stroke-width="3" opacity=".6"/>
    <path d="M428 472h344v8q-10 22-16 0q-12 30-24 0q-10 18-20 0q-14 34-26 0q-10 16-22 0q-12 26-24 0q-8 14-18 0q-14 30-26 0q-10 20-22 0q-12 24-24 0q-8 16-20 0q-12 28-24 0q-8 12-16 0q-12 22-22 0q-10 18-20 0z" fill="#B4FF1A" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="440" y="392" width="62" height="80" fill="#141414" stroke="#F5E6C8" stroke-width="3"/><rect x="698" y="392" width="62" height="80" fill="#141414" stroke="#F5E6C8" stroke-width="3"/>
    <g class="mp mp-drum">${sprite('drummer', 0, 530, 330, 150, 'md0')}${sprite('drummer', 1, 530, 330, 150, 'md1')}</g>
    <g class="mp mp-voc">${sprite('vocalist', 0, 432, 350, 140, 'mv0')}${sprite('vocalist', 2, 432, 350, 140, 'mv1')}</g>
    <g class="mp mp-gtr">${sprite('guitarist', 1, 640, 352, 138, 'mg0')}${sprite('guitarist', 3, 640, 352, 138, 'mg1')}</g>
    <rect x="760" y="690" width="260" height="8" rx="4" fill="#d6d9dc" stroke="#0A0A0A" stroke-width="3"/><path d="M790 698v34M990 698v34" stroke="#d6d9dc" stroke-width="6"/>
    <g class="mp-skate"><g class="mp mp-sk">${sprite('kickflip', 0, 0, 600, 130, 'mk0')}${sprite('kickflip', 2, 0, 600, 130, 'mk1')}</g></g>
  </svg>`;
}
