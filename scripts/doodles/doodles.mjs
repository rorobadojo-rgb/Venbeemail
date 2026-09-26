// Original VenbeeMail night-market doodles, drawn in code for this project.
//
// Style rules (from the brief's background reference, not copied from it):
// black ground, jagged lightning rays bursting from one point, grey / white
// cartoon characters with heavy black outlines, and syrup-coloured accents.
// Every character here is our own: a cracked skull, a drooling ghost, bones,
// a slime puddle with stalk eyes, a tin robot, an es-campur glass with a
// grin, a smoke puff, a grinning star, an eyeball and a zombie hand.
//
// Stamps are drawn in a 200 x 200 box. Parts that overlap use `outlined()`
// so a single outline wraps their union.

export const INK = "#0A0A0A";
export const WHITE = "#F4F1EA";
export const GREY = "#9A9A9A";
export const GREY_D = "#5E5E5E";
export const GREY_L = "#CFCFCF";

export const SYRUP = {
  pink: "#FF3DAE",
  green: "#7CFF2B",
  red: "#FF3A1F",
  purple: "#8A2BE2",
  yellow: "#FFD23F",
  teal: "#19D3C5",
  orange: "#FF8A1F",
  blue: "#2D6BFF",
};

const LW = 8;
const ink = (w = LW) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const line = (d, w = LW, color = INK) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Several shapes with one outline around their union. */
const outlined = (shapes, fill) => `<g fill="${INK}" ${ink(LW * 2)}>${shapes}</g><g fill="${fill}">${shapes}</g>`;

// ------------------------------------------------------------------ stamps
// each stamp: (a = main accent, b = second accent) => svg in a 200 box
export const stamps = {
  skull: (a, b) => `
    <path d="M100 16C56 16 28 46 28 88c0 26 11 42 25 51v21c0 9 7 16 16 16h62c9 0 16-7 16-16v-21c14-9 25-25 25-51 0-42-28-72-72-72Z" fill="${WHITE}" ${ink()}/>
    ${line("M42 104c4 18 12 28 22 34", 10, GREY_L)}
    ${line("M104 17l-10 20 13 9-11 18", 6)}
    <path d="M56 86c0-14 11-22 24-19 11 2 15 13 13 24-3 13-13 19-24 17-9-2-13-11-13-22Z" fill="${INK}"/>
    <path d="M144 86c0-14-11-22-24-19-11 2-15 13-13 24 3 13 13 19 24 17 9-2 13-11 13-22Z" fill="${INK}"/>
    <circle cx="76" cy="88" r="8" fill="${a}"/><circle cx="124" cy="88" r="8" fill="${a}"/>
    <circle cx="73" cy="85" r="3" fill="${WHITE}"/><circle cx="121" cy="85" r="3" fill="${WHITE}"/>
    <path d="M100 112l-10 15h20Z" fill="${INK}" ${ink(4)}/>
    ${line("M66 150h68M82 140v24M100 140v26M118 140v24", 6)}
    <path d="M150 40l16-10M156 52l18-2" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round"/>`,

  ghost: (a) => `
    <path d="M48 176V94c0-44 24-74 52-74s52 30 52 74v82l-13-12-13 15-13-14-13 15-13-15-13 14-13-15Z" fill="${WHITE}" ${ink()}/>
    ${line("M64 70c4-18 14-30 28-34", 9, GREY_L)}
    <ellipse cx="80" cy="88" rx="10" ry="16" fill="${INK}"/><ellipse cx="120" cy="88" rx="10" ry="16" fill="${INK}"/>
    <circle cx="83" cy="82" r="4" fill="${WHITE}"/><circle cx="123" cy="82" r="4" fill="${WHITE}"/>
    <path d="M78 118c10 18 34 18 44 0Z" fill="${INK}" ${ink(6)}/>
    <path d="M98 126c0 18 4 34 10 34s8-12 6-30Z" fill="${a}" ${ink(5)}/>
    <path d="M40 120c-12 2-18 10-16 20M160 120c12 2 18 10 16 20" fill="none" ${ink(7)}/>`,

  bone: (a) => {
    const shapes = `
      <rect x="44" y="88" width="112" height="26" rx="10" transform="rotate(-24 100 100)"/>
      <circle cx="42" cy="118" r="18"/><circle cx="54" cy="142" r="18"/>
      <circle cx="146" cy="58" r="18"/><circle cx="158" cy="82" r="18"/>`;
    return `${outlined(shapes, WHITE)}
      ${line("M60 118l74-34", 6, GREY_L)}
      <path d="M92 150c-4 10-4 18 2 22 6 4 12-2 12-10 0-6-6-10-14-12Z" fill="${a}" ${ink(5)}/>`;
  },

  puddle: (a, b) => {
    const blob = `
      <path d="M24 150c0-22 22-34 46-34 10-12 50-14 64-2 26 0 44 14 44 34 0 18-22 26-40 22l-6 22c-2 8-14 8-16 0l-4-16c-14 4-30 4-44 0l-4 24c-2 10-16 10-18 0l-4-24c-10-2-18-12-18-26Z"/>
      <rect x="66" y="52" width="10" height="72" rx="5"/><rect x="118" y="44" width="10" height="80" rx="5"/>
      <circle cx="71" cy="48" r="20"/><circle cx="123" cy="40" r="22"/>`;
    return `${outlined(blob, a)}
      <circle cx="71" cy="48" r="14" fill="${WHITE}"/><circle cx="123" cy="40" r="16" fill="${WHITE}"/>
      <circle cx="75" cy="50" r="6" fill="${INK}"/><circle cx="118" cy="42" r="7" fill="${INK}"/>
      ${line("M44 146c10-8 22-10 34-8", 8, "#FFFFFF66")}
      <path d="M86 150c8 8 22 8 30 0" fill="none" ${ink(6)}/>
      <circle cx="150" cy="150" r="6" fill="${b}"/>`;
  },

  robot: (a, b) => `
    <path d="M100 38V18" fill="none" ${ink(7)}/><circle cx="100" cy="14" r="10" fill="${a}" ${ink(6)}/>
    <rect x="40" y="38" width="120" height="96" rx="14" fill="${GREY}" ${ink()}/>
    <rect x="30" y="70" width="12" height="32" rx="4" fill="${GREY_D}" ${ink(6)}/>
    <rect x="158" y="70" width="12" height="32" rx="4" fill="${GREY_D}" ${ink(6)}/>
    ${line("M52 52h40", 8, GREY_L)}
    <circle cx="74" cy="80" r="20" fill="${WHITE}" ${ink(7)}/><circle cx="128" cy="78" r="14" fill="${WHITE}" ${ink(7)}/>
    <circle cx="78" cy="82" r="8" fill="${INK}"/><circle cx="130" cy="80" r="6" fill="${INK}"/>
    <rect x="62" y="108" width="76" height="16" rx="4" fill="${INK}"/>
    ${line("M76 110v12M90 110v12M104 110v12M118 110v12", 4, GREY_L)}
    <rect x="70" y="134" width="60" height="14" fill="${GREY_D}" ${ink(6)}/>
    <rect x="48" y="148" width="104" height="44" rx="8" fill="${GREY}" ${ink()}/>
    <circle cx="76" cy="170" r="9" fill="${b}" ${ink(5)}/><circle cx="104" cy="170" r="9" fill="${a}" ${ink(5)}/>
    <rect x="120" y="162" width="20" height="16" rx="3" fill="${WHITE}" ${ink(5)}/>
    <circle cx="52" cy="44" r="3" fill="${INK}"/><circle cx="148" cy="44" r="3" fill="${INK}"/>`,

  glass: (a, b) => `
    <path d="M126 10l-22 66" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>
    <path d="M126 10l-22 66" fill="none" stroke="${b}" stroke-width="8" stroke-linecap="round"/>
    <path d="M40 46h120l-14 138c-1 8-8 12-16 12H70c-8 0-15-4-16-12Z" fill="${WHITE}" ${ink()}/>
    <path d="M47 104h106l-9 80c-1 6-6 8-12 8H68c-6 0-11-2-12-8Z" fill="${a}"/>
    <rect x="60" y="72" width="30" height="30" rx="6" fill="#E6F6FF" ${ink(5)} transform="rotate(-12 75 87)"/>
    <rect x="108" y="78" width="26" height="26" rx="6" fill="#E6F6FF" ${ink(5)} transform="rotate(14 121 91)"/>
    <circle cx="80" cy="136" r="9" fill="${INK}"/><circle cx="122" cy="136" r="9" fill="${INK}"/>
    <circle cx="83" cy="133" r="3" fill="${WHITE}"/><circle cx="125" cy="133" r="3" fill="${WHITE}"/>
    <path d="M78 156c12 16 34 16 46 0Z" fill="${WHITE}" ${ink(6)}/>
    ${line("M90 156v8M101 157v9M112 156v8", 4)}
    <path d="M40 46h120l-14 138c-1 8-8 12-16 12H70c-8 0-15-4-16-12Z" fill="none" ${ink()}/>
    ${line("M142 58l-8 86", 7, "#FFFFFFAA")}`,

  puff: (a) => {
    const cloud = `<circle cx="60" cy="118" r="34"/><circle cx="96" cy="90" r="42"/><circle cx="140" cy="112" r="36"/>
      <circle cx="120" cy="146" r="28"/><circle cx="76" cy="150" r="26"/>`;
    return `${outlined(cloud, GREY_L)}
      ${line("M70 92c6-14 18-24 34-26", 8, WHITE)}
      <path d="M72 118q10 8 20 0M110 116q10 8 20 0" fill="none" ${ink(6)}/>
      <ellipse cx="102" cy="142" rx="10" ry="8" fill="${INK}"/>
      <path d="M162 70c10-6 14-16 10-26M36 76c-8-8-8-18 0-24" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round"/>`;
  },

  star: (a, b) => `
    <path d="M100 8l20 48 50-14-30 44 44 28-52 8 6 52-38-36-38 36 6-52-52-8 44-28-30-44 50 14Z" fill="${a}" ${ink()}/>
    <circle cx="82" cy="92" r="10" fill="${INK}"/><circle cx="118" cy="92" r="10" fill="${INK}"/>
    <circle cx="85" cy="89" r="3" fill="${WHITE}"/><circle cx="121" cy="89" r="3" fill="${WHITE}"/>
    <path d="M70 112c14 26 46 26 60 0Z" fill="${WHITE}" ${ink(6)}/>
    <path d="M78 116l6 10 6-10 6 10 6-10 6 10 6-10 6 10 6-10" fill="none" ${ink(4)}/>
    <circle cx="150" cy="40" r="6" fill="${b}"/><circle cx="40" cy="150" r="5" fill="${b}"/>`,

  eyeball: (a, b) => `
    <path d="M100 150c-4 14-8 24-8 32 0 8 4 12 8 12s8-4 8-12c0-8-4-18-8-32Z" fill="${a}" ${ink(6)}/>
    <circle cx="100" cy="92" r="62" fill="${WHITE}" ${ink()}/>
    ${line("M50 72c-6 10-8 20-6 30M54 124c6 8 14 14 22 16M150 66c6 8 8 16 8 26", 5, SYRUP.red)}
    <circle cx="110" cy="84" r="30" fill="${a}" ${ink(6)}/>
    <circle cx="112" cy="84" r="14" fill="${INK}"/>
    <circle cx="104" cy="76" r="6" fill="${WHITE}"/>
    ${line("M60 50c10-10 22-16 36-16", 8, GREY_L)}
    <circle cx="160" cy="150" r="7" fill="${b}"/>`,

  hand: (a, b) => {
    const hand = `
      <path d="M58 196l6-86c-10-18-14-34-10-40 6-8 16-2 20 10l4 12V30c0-10 14-10 16 0v58l2-68c0-10 16-10 16 0l-2 68 8-58c2-10 16-8 16 2l-8 64 12-40c4-10 16-6 14 4l-14 60c-4 20-12 34-26 44l-4 62Z"/>`;
    return `${outlined(hand, "#9BC47A")}
      ${line("M84 110l40 0M92 102v16M104 102v16M116 102v16", 5)}
      ${line("M88 40v40M108 34v44", 6, "#C4E4A4")}
      <path d="M62 196l4-40h54l-4 40Z" fill="${b}" ${ink(7)}/>
      ${line("M70 172h40", 6, INK)}
      <path d="M140 150c6 6 8 14 4 20" fill="none" stroke="${a}" stroke-width="8" stroke-linecap="round"/>`;
  },
};

export const STAMP_NAMES = Object.keys(stamps);

// ------------------------------------------------------------------ banners
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Jagged lightning rays bursting from (fx, fy). */
function rays(fx, fy, color, r, count = 13, len = 1400) {
  let out = "";
  const base = r() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const a = base + (i / count) * Math.PI * 2 + (r() - 0.5) * 0.2;
    const w = 0.08 + r() * 0.07; // half angle
    const pts = [];
    const steps = 5;
    // one side out, the other back: zig-zag edges like a lightning bolt
    for (let s = 0; s <= steps; s++) {
      const d = 30 + (len * s) / steps;
      const zig = (s % 2 ? 1 : -1) * 0.05;
      pts.push([fx + Math.cos(a - w + zig) * d, fy + Math.sin(a - w + zig) * d]);
    }
    for (let s = steps; s >= 0; s--) {
      const d = 30 + (len * s) / steps;
      const zig = (s % 2 ? 1 : -1) * 0.05;
      pts.push([fx + Math.cos(a + w + zig) * d, fy + Math.sin(a + w + zig) * d]);
    }
    out += `<path d="M${pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join("L")}Z" fill="${color}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`;
  }
  return out;
}

function sprinkles(w, h, colors, r, n = 26) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = r() * h;
    const c = colors[Math.floor(r() * colors.length)];
    const k = r();
    if (k < 0.35) out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(4 + r() * 7).toFixed(0)}" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
    else if (k < 0.6) out += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l10 6M${(x + 4).toFixed(0)} ${(y + 14).toFixed(0)}l10 6" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>`;
    else if (k < 0.8) {
      const s = 10 + r() * 10;
      out += `<path d="M${x.toFixed(0)} ${(y - s).toFixed(0)}l${(s * 0.4).toFixed(0)} ${s.toFixed(0)}h${(-s * 0.3).toFixed(0)}l${(s * 0.3).toFixed(0)} ${s.toFixed(0)}l${(-s * 0.9).toFixed(0)} ${(-s * 1.2).toFixed(0)}h${(s * 0.35).toFixed(0)}Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    } else out += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}c0 10 -8 16 -8 22a8 8 0 0 0 16 0c0-6-8-12-8-22Z" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
  }
  return out;
}

/** Slime drips along the top edge. */
function topDrips(w, color, r) {
  let d = `M0 0H${w}V18`;
  let x = w;
  while (x > 0) {
    const step = 40 + r() * 70;
    const nx = Math.max(0, x - step);
    const deep = r() < 0.55;
    if (deep) {
      const cx = (x + nx) / 2;
      const len = 30 + r() * 60;
      d += `L${(cx + 12).toFixed(0)} 18C${(cx + 12).toFixed(0)} ${(18 + len).toFixed(0)} ${(cx + 16).toFixed(0)} ${(30 + len).toFixed(0)} ${cx.toFixed(0)} ${(30 + len).toFixed(0)}S${(cx - 12).toFixed(0)} ${(18 + len).toFixed(0)} ${(cx - 12).toFixed(0)} 18`;
    }
    d += `L${nx.toFixed(0)} ${(16 + r() * 6).toFixed(0)}`;
    x = nx;
  }
  d += "Z";
  return `<path d="${d}" fill="${color}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
}

const PAIRS = [
  ["pink", "green"],
  ["green", "purple"],
  ["purple", "yellow"],
  ["yellow", "pink"],
  ["red", "teal"],
  ["teal", "pink"],
  ["orange", "purple"],
  ["pink", "yellow"],
];

export const BANNER_W = 1024;
export const BANNER_H = 512;

/** One wide doodle banner (1024 x 512). */
export function banner(index) {
  const r = rng(0xbadc0de + index * 7919);
  const [ka, kb] = PAIRS[index % PAIRS.length];
  const a = SYRUP[ka];
  const b = SYRUP[kb];
  const fx = [120, 900, 512, 60, 980, 300, 760, 512][index % 8];
  const fy = [470, 480, 560, 60, 40, 540, 520, -40][index % 8];
  const W = BANNER_W;
  const H = BANNER_H;

  // stamps on a jittered 4 x 2 grid, one cell left empty for breathing room
  const cells = [];
  for (let gy = 0; gy < 2; gy++) for (let gx = 0; gx < 4; gx++) cells.push([gx, gy]);
  const skip = Math.floor(r() * cells.length);
  const names = [...STAMP_NAMES].sort(() => r() - 0.5);
  let placed = "";
  let n = 0;
  cells.forEach(([gx, gy], i) => {
    if (i === skip) return;
    const name = names[n++ % names.length];
    const s = 0.95 + r() * 0.55;
    const x = (gx + 0.5) * (W / 4) + (r() - 0.5) * 70 - 100 * s;
    const y = (gy + 0.5) * (H / 2) + (r() - 0.5) * 50 - 100 * s;
    const rot = (r() - 0.5) * 40;
    const [c1, c2] = r() < 0.5 ? [a, b] : [b, a];
    placed += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rot.toFixed(1)} ${(100 * s).toFixed(0)} ${(100 * s).toFixed(0)}) scale(${s.toFixed(2)})">${stamps[name](c1, c2)}</g>`;
  });

  return `
    <rect width="${W}" height="${H}" fill="${INK}"/>
    ${rays(fx, fy, a, r)}
    <circle cx="${fx}" cy="${fy}" r="70" fill="${b}" stroke="${INK}" stroke-width="10"/>
    ${sprinkles(W, H, [a, b, WHITE], r)}
    ${placed}
    ${index % 2 ? topDrips(W, b, r) : ""}`;
}

export const BANNER_COUNT = PAIRS.length;
