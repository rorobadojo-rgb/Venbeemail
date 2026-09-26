// Builds the Zombie Mart poster wall.
//
//   public/posters/atlas.webp          2048 x 1920 texture atlas (4 x 3 cells of
//                                      512 x 640) for the WebGL wall: every
//                                      poster, then the eyes-closed frames
//   public/posters/<name>.webp         256 x 320 poster for the CSS wall (phones,
//                                      reduced motion, and before WebGL loads)
//   public/posters/<name>-blink.webp   eyes-closed frame (blinking posters)
//   public/posters/<name>-rays.webp    rays only, for the CSS pulse
//   public/posters/<name>.svg          vector source of each poster
//   lib/posters.generated.ts
//
// Poster text is set in Bungee (SIL OFL), downloaded once into scripts/.cache.
// Run: npm run assets:posters
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { INK, PAPER } from "./art.mjs";
import { H, W, posters } from "./posters.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "public", "posters");
const CACHE = join(ROOT, "scripts", ".cache");
const FONT = join(CACHE, "Bungee-Regular.ttf");
const COLS = 4;
const SMALL = 256;

mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });
if (!existsSync(FONT)) {
  // without a browser user agent the Google Fonts CSS API serves plain TTF
  const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bungee")).text();
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error("could not find the Bungee TTF url");
  writeFileSync(FONT, Buffer.from(await (await fetch(url)).arrayBuffer()));
}

const f = (n) => Number(n.toFixed(1));
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** Paper outline with ripped edges; `torn` lists the ripped sides. */
function sheet(torn, seed) {
  const r = rng(seed);
  const m = 14;
  const [x0, y0, x1, y1] = [m, m, W - m, H - m];
  const edge = (ax, ay, bx, by, rip) => {
    const pts = [];
    const n = rip ? 26 : 1;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      let x = ax + (bx - ax) * t;
      let y = ay + (by - ay) * t;
      if (rip && i > 0) {
        // inward offset (towards the poster centre), bigger now and then
        const depth = r() < 0.18 ? 10 + r() * 22 : 2 + r() * 7;
        const nx = -(by - ay);
        const ny = bx - ax;
        const len = Math.hypot(nx, ny);
        x += (nx / len) * depth;
        y += (ny / len) * depth;
      }
      pts.push([x, y]);
    }
    return pts;
  };
  const corner = torn.length >= 2; // two ripped sides: the corner between them is gone
  const pts = [
    ...edge(x0, y0, x1, y0, torn.includes("t")),
    ...edge(x1, y0, x1, y1, torn.includes("r")),
    ...edge(x1, y1, x0, y1, torn.includes("b")),
    ...edge(x0, y1, x0, y0, torn.includes("l")),
  ];
  let poly = pts;
  if (corner) {
    const c = { tl: [x0, y0], tr: [x1, y0], br: [x1, y1], bl: [x0, y1] };
    const key = Object.keys(c).find((k) => torn.includes(k[0]) && torn.includes(k[1]));
    if (key) {
      const [cx, cy] = c[key];
      const cut = 70 + r() * 40;
      poly = pts.filter(([x, y]) => Math.abs(x - cx) + Math.abs(y - cy) > cut);
      // insert a jagged diagonal where the corner was ripped off
      const i = pts.findIndex(([x, y]) => Math.abs(x - cx) + Math.abs(y - cy) <= cut);
      const a = [cx + Math.sign(W / 2 - cx) * cut, cy];
      const b = [cx, cy + Math.sign(H / 2 - cy) * cut];
      const [p, q] = key === "tl" || key === "br" ? [b, a] : [a, b];
      const jag = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        jag.push([p[0] + (q[0] - p[0]) * t + (r() - 0.5) * 10, p[1] + (q[1] - p[1]) * t + (r() - 0.5) * 10]);
      }
      const at = poly.findIndex((pt) => pts.indexOf(pt) > i);
      poly.splice(at < 0 ? poly.length : at, 0, ...jag);
    }
  }
  return "M" + poly.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";
}

function tape(x, y, rot, w = 70) {
  return `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" fill="#EDE3C4" fill-opacity=".78" transform="rotate(${rot} ${x} ${y})"/>`;
}

function posterSvg(p, i, { blink = false, raysOnly = false } = {}) {
  const outline = sheet(p.torn, 101 + i * 13);
  const art = p.art(blink, raysOnly);
  const tapes = [
    !p.torn.includes("t") || !p.torn.includes("l") ? tape(48, 30, -32) : "",
    !p.torn.includes("t") || !p.torn.includes("r") ? tape(W - 48, 30, 30) : "",
    p.torn.includes("b") ? "" : tape(W / 2, H - 22, 3, 90),
  ].join("");
  const clip = `<clipPath id="art${i}"><rect x="24" y="24" width="${W - 48}" height="${H - 48}"/></clipPath>
    <clipPath id="sheet${i}"><path d="${outline}"/></clipPath>`;
  if (raysOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${clip}</defs>
      <g clip-path="url(#sheet${i})"><g clip-path="url(#art${i})">${art}</g></g></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${clip}</defs>
    <g clip-path="url(#sheet${i})">
      <rect width="${W}" height="${H}" fill="${PAPER}"/>
      <g clip-path="url(#art${i})"><rect width="${W}" height="${H}" fill="${INK}"/>${art}</g>
    </g>
    <path d="${outline}" fill="none" stroke="#B9AE95" stroke-width="2"/>
    ${tapes}</svg>`;
}

const render = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: "Bungee" },
  }).render().asPng();

const cells = [];
const meta = [];
for (const [i, p] of posters.entries()) {
  const svg = posterSvg(p, i);
  writeFileSync(join(OUT, `${p.name}.svg`), svg.replace(/\n\s*/g, ""));
  cells.push(render(svg, W));
  await sharp(render(svg, SMALL)).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(OUT, `${p.name}.webp`));
  meta.push({ name: p.name, cell: i, blinkCell: -1, blink: !!p.blink, pulse: !!p.pulse });
}
for (const [i, p] of posters.entries()) {
  if (p.blink) {
    const svg = posterSvg(p, i, { blink: true });
    meta[i].blinkCell = cells.length;
    cells.push(render(svg, W));
    await sharp(render(svg, SMALL)).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(OUT, `${p.name}-blink.webp`));
  }
  if (p.pulse) {
    const svg = posterSvg(p, i, { raysOnly: true });
    await sharp(render(svg, SMALL)).webp({ quality: 75, alphaQuality: 70, effort: 6 }).toFile(join(OUT, `${p.name}-rays.webp`));
  }
}
const ROWS = Math.ceil(cells.length / COLS);
if (cells.length > COLS * 3) throw new Error("atlas is full (max 12 cells)");
await sharp({ create: { width: COLS * W, height: ROWS * H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(cells.map((input, i) => ({ input, left: (i % COLS) * W, top: Math.floor(i / COLS) * H })))
  .webp({ quality: 82, alphaQuality: 85, effort: 6 })
  .toFile(join(OUT, "atlas.webp"));

const ts = `// Generated by scripts/posters/build-posters.mjs. Do not edit by hand.
export const POSTER_ATLAS = { cols: ${COLS}, rows: ${ROWS}, cellW: ${W}, cellH: ${H}, width: ${COLS * W}, height: ${ROWS * H} } as const;
export const POSTERS = ${JSON.stringify(meta)} as const;
export type PosterName = (typeof POSTERS)[number]["name"];
`;
writeFileSync(join(ROOT, "lib", "posters.generated.ts"), ts);
console.log(`posters: ${posters.length}, atlas cells: ${cells.length} (${COLS * W} x ${ROWS * H})`);
