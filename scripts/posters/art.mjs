// Original doodle characters for the Zombie Mart poster wall, drawn in code for
// this project. Style rules from the brief: black ground, hot-pink lightning
// rays, black / grey / white cartoon characters with thick ink outlines.
// Every character is drawn in its own ~100-unit box centred on (0,0) and
// placed with `put()`, so the outline weight stays constant at any size.

export const INK = "#0A0A0A";
export const PINK = "#FF1F5A";
export const WHITE = "#F2F0EC";
export const G1 = "#4E4E4E";
export const G2 = "#8C8C8C";
export const G3 = "#C6C6C6";
export const PAPER = "#E9E1CF";
export const LW = 7; // outline weight in poster px

const f = (n) => Number(n.toFixed(2));

/** Place a character: translate / rotate / scale, with outline width compensated. */
export function put(x, y, s, rot, draw, opts = {}) {
  const k = (LW / s).toFixed(2);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${draw(k, opts)}</g>`;
}

const ol = (k, extra = 1) => `stroke="${INK}" stroke-width="${f(k * extra)}" stroke-linejoin="round" stroke-linecap="round"`;
/** Shapes with one outline wrapping their union (outline layer, then fills). */
const outlined = (k, shapes, fill) =>
  `<g fill="${INK}" ${ol(k, 2)}>${shapes}</g><g fill="${fill}">${shapes}</g>`;

// ------------------------------------------------------------------ rays
/**
 * Zig-zag lightning rays radiating from (cx, cy). Every other wedge is pink.
 * `a0`/`a1` limit the fan (degrees), `n` rays, `R` their length.
 */
export function rays(cx, cy, { n = 14, a0 = 0, a1 = 360, R = 900, color = PINK, seed = 1, id = "" } = {}) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const span = (a1 - a0) * (Math.PI / 180);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 * (Math.PI / 180) + (span * (i + 0.5)) / n;
    const dir = [Math.cos(a), Math.sin(a)];
    const nrm = [-dir[1], dir[0]];
    const wMax = (span / n) * R * (0.55 + rnd() * 0.25);
    const kinks = [0, 0.18, 0.2, 0.45, 0.47, 0.72, 0.74, 1];
    const pts = kinks.map((t, j) => {
      const side = j === 0 || j === kinks.length - 1 ? 0 : (j % 4 < 2 ? 1 : -1) * wMax * 0.16 * (0.6 + rnd() * 0.6);
      return { r: t * R, off: side, w: 4 + wMax * t };
    });
    const left = pts.map((p) => [cx + dir[0] * p.r + nrm[0] * (p.off + p.w / 2), cy + dir[1] * p.r + nrm[1] * (p.off + p.w / 2)]);
    const right = pts.map((p) => [cx + dir[0] * p.r + nrm[0] * (p.off - p.w / 2), cy + dir[1] * p.r + nrm[1] * (p.off - p.w / 2)]).reverse();
    const d = "M" + [...left, ...right].map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";
    out.push(`<path d="${d}"/>`);
  }
  return `<g ${id ? `id="${id}" ` : ""}fill="${color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round">${out.join("")}</g>`;
}

// ------------------------------------------------------------- characters
export const skull = (k, { crown = false, blink = false, iris = PINK } = {}) => `
  ${crown ? `<path d="M-32 -50L-30 -80L-16 -64L-2 -86L12 -64L28 -80L30 -50Z" fill="${WHITE}" ${ol(k)}/>
  <circle cx="-2" cy="-86" r="5" fill="${PINK}" ${ol(k, 0.7)}/>` : ""}
  <path d="M-46 -8C-50 -44 -26 -62 0 -62C26 -62 50 -44 46 -8C44 8 38 14 30 18L30 30L-30 30L-30 18C-38 14 -44 8 -46 -8Z" fill="${WHITE}" ${ol(k)}/>
  <path d="M30 -48C42 -36 46 -20 42 -4C40 8 34 14 28 16L26 4C34 -6 36 -24 30 -48Z" fill="${G3}"/>
  <path d="M-26 30L26 30L24 50C24 55 20 58 15 58L-15 58C-20 58 -24 55 -24 50Z" fill="${WHITE}" ${ol(k)}/>
  <path d="M-14 30V50M-4 31V54M6 31V54M16 30V50M-24 42H24" fill="none" ${ol(k, 0.7)}/>
  ${blink
    ? `<path d="M-30 -8Q-19 2 -8 -8M8 -8Q19 2 30 -8" fill="none" ${ol(k, 1.3)}/>`
    : `<ellipse cx="-19" cy="-8" rx="13" ry="14" fill="${INK}"/><ellipse cx="19" cy="-8" rx="13" ry="14" fill="${INK}"/>
       <circle cx="-18" cy="-7" r="6" fill="${iris}"/><circle cx="20" cy="-7" r="6" fill="${iris}"/>
       <circle cx="-16" cy="-10" r="2.2" fill="${WHITE}"/><circle cx="22" cy="-10" r="2.2" fill="${WHITE}"/>`}
  <path d="M0 8L-7 19L7 19Z" fill="${INK}" ${ol(k, 0.5)}/>
  <path d="M12 -60L5 -46L13 -40L6 -28" fill="none" ${ol(k, 0.7)}/>`;

export const ghost = (k, { blink = false, fill = WHITE, tongue = true } = {}) => `
  <path d="M-42 44L-42 -8C-42 -42 -22 -62 0 -62C22 -62 42 -42 42 -8L42 44C36 38 30 34 24 44C18 54 14 40 8 38C2 36 0 58 -6 56C-12 54 -10 38 -16 38C-22 38 -24 50 -30 50C-36 50 -36 40 -42 44Z" fill="${fill}" ${ol(k)}/>
  <path d="M28 -44C38 -30 40 -12 38 30C34 30 32 30 30 34L30 -8C30 -24 28 -34 22 -46Z" fill="${G3}"/>
  ${blink
    ? `<path d="M-24 -18Q-15 -10 -6 -18M6 -18Q15 -10 24 -18" fill="none" ${ol(k, 1.2)}/>`
    : `<ellipse cx="-15" cy="-20" rx="9" ry="14" fill="${INK}"/><ellipse cx="15" cy="-20" rx="9" ry="14" fill="${INK}"/>
       <circle cx="-12" cy="-25" r="3.4" fill="${WHITE}"/><circle cx="18" cy="-25" r="3.4" fill="${WHITE}"/>`}
  <path d="M-14 4Q0 26 14 4Q0 10 -14 4Z" fill="${INK}" ${ol(k, 0.6)}/>
  ${tongue ? `<path d="M-4 12Q2 30 10 12Z" fill="${PINK}" ${ol(k, 0.5)}/>` : ""}`;

export const bone = (k, { len = 90, fill = WHITE } = {}) => {
  const h = len / 2 - 8;
  const shapes = `<rect x="${-h}" y="-6" width="${2 * h}" height="12"/>
    <circle cx="${-h}" cy="-8" r="9"/><circle cx="${-h}" cy="8" r="9"/>
    <circle cx="${h}" cy="-8" r="9"/><circle cx="${h}" cy="8" r="9"/>`;
  return outlined(k, shapes, fill) + `<path d="M${-h + 8} -2H${h - 8}" stroke="${G3}" stroke-width="${f(k * 0.8)}" stroke-linecap="round"/>`;
};

export const bolt = (k, { fill = WHITE } = {}) =>
  `<path d="M-8 -48L20 -48L6 -10L24 -10L-14 50L-2 6L-20 6Z" fill="${fill}" ${ol(k)}/>`;

export const robot = (k, { blink = false } = {}) => `
  <path d="M0 -64V-80" fill="none" ${ol(k)}/>
  <circle cx="0" cy="-84" r="6" fill="${PINK}" ${ol(k, 0.8)}/>
  <rect x="-40" y="-52" width="8" height="18" fill="${G2}" ${ol(k, 0.8)}/>
  <rect x="32" y="-52" width="8" height="18" fill="${G2}" ${ol(k, 0.8)}/>
  <rect x="-32" y="-66" width="64" height="44" rx="5" fill="${G2}" ${ol(k)}/>
  <rect x="-26" y="-62" width="52" height="8" fill="${G3}"/>
  ${blink
    ? `<path d="M-22 -44H-6M6 -44H22" fill="none" ${ol(k, 1.1)}/>`
    : `<circle cx="-14" cy="-44" r="10" fill="${WHITE}" ${ol(k, 0.8)}/><circle cx="14" cy="-44" r="10" fill="${WHITE}" ${ol(k, 0.8)}/>
       <circle cx="-13" cy="-44" r="4.5" fill="${INK}"/><circle cx="15" cy="-44" r="4.5" fill="${INK}"/>`}
  <rect x="-16" y="-32" width="32" height="7" fill="${WHITE}" ${ol(k, 0.6)}/>
  <path d="M-8 -32V-25M0 -32V-25M8 -32V-25" ${ol(k, 0.4)}/>
  <rect x="-9" y="-22" width="18" height="7" fill="${G1}" ${ol(k, 0.7)}/>
  <rect x="-58" y="-12" width="16" height="40" rx="3" fill="${G2}" ${ol(k)}/>
  <rect x="42" y="-12" width="16" height="40" rx="3" fill="${G2}" ${ol(k)}/>
  <path d="M-60 28Q-66 40 -56 46M-40 28Q-34 40 -44 46" fill="none" ${ol(k, 1.1)}/>
  <path d="M40 28Q34 40 44 46M60 28Q66 40 56 46" fill="none" ${ol(k, 1.1)}/>
  <rect x="-40" y="-16" width="80" height="60" rx="5" fill="${G3}" ${ol(k)}/>
  <path d="M-16 6A16 16 0 0 1 16 6Z" fill="${WHITE}" ${ol(k, 0.7)}/>
  <path d="M0 6L9 -5" stroke="${PINK}" stroke-width="${f(k * 0.6)}" stroke-linecap="round"/>
  <path d="M-11 0L-8 2M0 -9V-6M11 0L8 2" ${ol(k, 0.4)}/>
  <circle cx="-14" cy="26" r="5" fill="${PINK}" ${ol(k, 0.6)}/>
  <circle cx="0" cy="26" r="5" fill="${WHITE}" ${ol(k, 0.6)}/>
  <circle cx="14" cy="26" r="5" fill="${INK}" ${ol(k, 0.6)}/>
  <circle cx="-33" cy="-9" r="2" fill="${INK}"/><circle cx="33" cy="-9" r="2" fill="${INK}"/>
  <circle cx="-33" cy="37" r="2" fill="${INK}"/><circle cx="33" cy="37" r="2" fill="${INK}"/>
  <rect x="-30" y="44" width="22" height="26" fill="${G2}" ${ol(k)}/>
  <rect x="8" y="44" width="22" height="26" fill="${G2}" ${ol(k)}/>
  <rect x="-36" y="68" width="30" height="12" rx="3" fill="${G1}" ${ol(k)}/>
  <rect x="6" y="68" width="30" height="12" rx="3" fill="${G1}" ${ol(k)}/>`;

export const bunny = (k, { blink = false } = {}) => `
  <path d="M-30 -40C-44 -90 -34 -112 -22 -110C-10 -108 -8 -80 -10 -46Z" fill="${G2}" ${ol(k)}/>
  <path d="M10 -46C12 -84 18 -112 32 -108C46 -104 40 -74 26 -38Z" fill="${G2}" ${ol(k)}/>
  <path d="M-26 -50C-32 -80 -28 -98 -22 -98C-16 -98 -16 -78 -16 -52Z" fill="${G3}"/>
  <path d="M-52 4C-54 -34 -30 -54 0 -54C30 -54 54 -34 52 4C50 34 28 54 0 54C-28 54 -50 34 -52 4Z" fill="${G2}" ${ol(k)}/>
  <path d="M34 -40C48 -22 50 6 40 26C46 6 44 -18 30 -36Z" fill="${G3}"/>
  ${blink
    ? `<path d="M-30 -14L-12 -10M12 -10L30 -14" fill="none" ${ol(k, 1.2)}/>`
    : `<path d="M-34 -22L-10 -12L-14 -2C-24 0 -32 -8 -34 -22Z" fill="${WHITE}" ${ol(k, 0.8)}/>
       <path d="M34 -22L10 -12L14 -2C24 0 32 -8 34 -22Z" fill="${WHITE}" ${ol(k, 0.8)}/>
       <circle cx="-17" cy="-9" r="3.6" fill="${INK}"/><circle cx="17" cy="-9" r="3.6" fill="${INK}"/>`}
  <path d="M-36 12Q0 44 36 12Q30 36 0 40Q-30 36 -36 12Z" fill="${INK}" ${ol(k, 0.7)}/>
  <path d="M-30 16L-24 26L-18 19L-12 30L-6 21L0 32L6 21L12 30L18 19L24 26L30 16Q0 36 -30 16Z" fill="${WHITE}"/>
  <path d="M-4 0L4 0L0 6Z" fill="${PINK}" ${ol(k, 0.5)}/>`;

export const mug = (k, { blink = false } = {}) => `
  <path d="M-10 -70C-20 -80 0 -88 -8 -100M10 -66C0 -76 20 -86 12 -98" fill="none" stroke="${WHITE}" stroke-width="${f(k * 1.2)}" stroke-linecap="round"/>
  <path d="M34 -28C62 -30 62 20 34 18" fill="none" ${ol(k, 3)}/>
  <path d="M34 -28C62 -30 62 20 34 18" fill="none" stroke="${WHITE}" stroke-width="${f(k * 1.3)}" stroke-linecap="round"/>
  <path d="M-40 -50L40 -50L36 42C36 50 30 54 22 54L-22 54C-30 54 -36 50 -36 42Z" fill="${WHITE}" ${ol(k)}/>
  <path d="M24 -46L34 -46L31 40C31 46 28 50 22 50L20 50C26 46 26 40 26 30Z" fill="${G3}"/>
  <ellipse cx="0" cy="-50" rx="40" ry="8" fill="${G1}" ${ol(k)}/>
  ${blink
    ? `<path d="M-22 -18Q-14 -12 -6 -18M6 -18Q14 -12 22 -18" fill="none" ${ol(k, 1.1)}/>`
    : `<circle cx="-14" cy="-18" r="9" fill="${WHITE}" ${ol(k, 0.8)}/><circle cx="14" cy="-18" r="9" fill="${WHITE}" ${ol(k, 0.8)}/>
       <circle cx="-12" cy="-16" r="4" fill="${PINK}"/><circle cx="16" cy="-16" r="4" fill="${PINK}"/>`}
  <path d="M-24 4Q0 30 24 4Z" fill="${INK}" ${ol(k, 0.7)}/>
  <path d="M-18 6L-13 16L-8 8M8 8L13 16L18 6" fill="${WHITE}" ${ol(k, 0.4)}/>`;

export const eyeball = (k, { blink = false, iris = PINK } = {}) => `
  <circle r="40" fill="${WHITE}" ${ol(k)}/>
  <path d="M-38 -8Q-26 -6 -22 -16M-36 14Q-24 10 -18 18M34 -18Q24 -12 22 -22M36 12Q26 8 24 18" fill="none" stroke="${PINK}" stroke-width="${f(k * 0.45)}" stroke-linecap="round"/>
  ${blink
    ? `<path d="M-40 0C-40 -30 40 -30 40 0Z" fill="${G2}" ${ol(k)}/><path d="M-40 0C-40 22 40 22 40 0" fill="${G3}" ${ol(k)}/><path d="M-34 4Q0 20 34 4" fill="none" ${ol(k, 0.9)}/>`
    : `<circle cx="4" cy="2" r="18" fill="${iris}" ${ol(k, 0.8)}/><circle cx="5" cy="3" r="8" fill="${INK}"/><circle cx="10" cy="-4" r="4" fill="${WHITE}"/>`}`;

export const cloud = (k, { blink = false } = {}) => {
  const puffs = `<circle cx="-44" cy="6" r="26"/><circle cx="-18" cy="-18" r="32"/><circle cx="18" cy="-22" r="30"/>
    <circle cx="46" cy="0" r="26"/><rect x="-60" y="0" width="120" height="30" rx="15"/>`;
  return outlined(k, puffs, WHITE) + `
    ${blink
      ? `<path d="M-22 2Q-14 8 -6 2M6 2Q14 8 22 2" fill="none" ${ol(k, 1)}/>`
      : `<circle cx="-14" cy="0" r="7" fill="${INK}"/><circle cx="14" cy="0" r="7" fill="${INK}"/>
         <circle cx="-12" cy="-2" r="2.4" fill="${WHITE}"/><circle cx="16" cy="-2" r="2.4" fill="${WHITE}"/>`}
    <path d="M-10 18Q0 10 10 18" fill="none" ${ol(k, 0.8)}/>
    <path d="M-30 -14Q-26 -22 -18 -24" fill="none" stroke="${G3}" stroke-width="${f(k * 0.9)}" stroke-linecap="round"/>`;
};

export const drop = (k, { fill = PINK } = {}) =>
  `<path d="M0 -24C8 -10 14 -2 14 8C14 17 8 22 0 22C-8 22 -14 17 -14 8C-14 -2 -8 -10 0 -24Z" fill="${fill}" ${ol(k)}/>
   <path d="M-6 6Q-6 12 -2 15" fill="none" stroke="${WHITE}" stroke-width="${f(k * 0.6)}" stroke-linecap="round"/>`;

export const hand = (k) => `
  <path d="M-26 90L-24 10C-34 4 -40 -8 -36 -18L-30 -44C-28 -52 -18 -52 -18 -44L-18 -26L-16 -60C-16 -68 -4 -68 -4 -60L-4 -30L-2 -64C-2 -72 10 -72 10 -64L10 -30L14 -56C14 -64 26 -64 26 -56L24 -10C24 4 18 12 12 14L14 90Z" fill="${G2}" ${ol(k)}/>
  <path d="M-12 40L-4 34L-10 28M2 60L10 54L4 48" fill="none" ${ol(k, 0.6)}/>
  <path d="M16 -50L14 -8C14 2 10 8 6 10L12 12C20 6 22 -2 22 -10L24 -54Z" fill="${G3}"/>`;

export const can = (k, { label = PINK } = {}) => `
  <path d="M-26 -50L26 -50L28 -42L28 44L26 52L-26 52L-28 44L-28 -42Z" fill="${G3}" ${ol(k)}/>
  <rect x="-28" y="-30" width="56" height="56" fill="${label}" ${ol(k, 0.8)}/>
  <path d="M-12 -18C-20 -18 -20 2 -12 4L-12 14M12 -18C20 -18 20 2 12 4L12 14M-12 -18Q0 -26 12 -18" fill="none" stroke="${WHITE}" stroke-width="${f(k * 0.8)}" stroke-linecap="round"/>
  <path d="M-6 -10Q0 -4 6 -10M-4 2Q0 6 4 2" fill="none" stroke="${WHITE}" stroke-width="${f(k * 0.5)}" stroke-linecap="round"/>
  <path d="M18 -46L20 48" stroke="${WHITE}" stroke-width="${f(k * 0.8)}" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="0" cy="-50" rx="26" ry="5" fill="${G2}" ${ol(k, 0.8)}/>
  <path d="M-4 -52L8 -54" ${ol(k, 0.8)}/>`;

export const worm = (k, { blink = false } = {}) => `
  <path d="M-10 60C-12 30 -20 10 -12 -12C-6 -30 16 -32 20 -14C24 2 12 14 14 30C16 44 20 52 22 60Z" fill="${G3}" ${ol(k)}/>
  <path d="M-12 20Q4 26 16 20M-14 36Q2 42 18 36" fill="none" ${ol(k, 0.5)}/>
  ${blink
    ? `<path d="M-4 -12L4 -12M10 -12L16 -12" ${ol(k, 0.9)}/>`
    : `<circle cx="0" cy="-12" r="5" fill="${WHITE}" ${ol(k, 0.6)}/><circle cx="12" cy="-12" r="5" fill="${WHITE}" ${ol(k, 0.6)}/>
       <circle cx="1" cy="-11" r="2" fill="${INK}"/><circle cx="13" cy="-11" r="2" fill="${INK}"/>`}
  <path d="M0 0Q6 4 12 0" fill="none" ${ol(k, 0.6)}/>`;

export const sparkle = (k, { fill = WHITE } = {}) =>
  `<path d="M0 -20Q3 -3 20 0Q3 3 0 20Q-3 3 -20 0Q-3 -3 0 -20Z" fill="${fill}" ${ol(k, 0.6)}/>`;

export const bubbles = (pts, fill = WHITE) =>
  pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="4"/>`).join("");

/** Slime / paint drips hanging from a bar at y (poster px). */
export function drips(x0, x1, y, fill = PINK, seed = 3) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let d = `M${x0} ${y - 14}L${x1} ${y - 14}L${x1} ${y}`;
  for (let x = x1; x > x0; ) {
    const w = 18 + rnd() * 26;
    const h = rnd() < 0.55 ? 10 + rnd() * 60 : 4;
    const xm = x - w / 2;
    d += `C${f(x - 2)} ${f(y + h * 0.6)} ${f(xm + 7)} ${f(y + h)} ${f(xm)} ${f(y + h + 6)}C${f(xm - 7)} ${f(y + h)} ${f(x - w + 2)} ${f(y + h * 0.6)} ${f(x - w)} ${y}`;
    x -= w;
  }
  d += "Z";
  return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
}

/** Poster text: Bungee (rendered to paths by resvg) with an ink outline behind. */
export function words(x, y, text, { size = 44, rot = 0, fill = WHITE, anchor = "middle", stroke = 9 } = {}) {
  const attrs = `x="${x}" y="${y}" font-family="Bungee" font-size="${size}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})"`;
  return `<text ${attrs} fill="${INK}" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round">${text}</text>
    <text ${attrs} fill="${fill}">${text}</text>`;
}
