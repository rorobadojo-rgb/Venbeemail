// Bake every doodle into ONE texture atlas (≤ 2048px) with an automatic cream die-cut border.
//   out: src/assets/stickers.webp    (used by WebGL + as a CSS sprite)
//        src/assets/stickers-sm.webp (half-res, phones)
//        src/doodles/atlas.json      (cell map, imported by the app)
//
// The die-cut is a blur→threshold dilation of the art's alpha, which gives the rounded,
// "cut around the drawing" border of real vinyl stickers.
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { defs, doodles } from '../src/doodles/doodles.js';

const CELL = 340;
const COLS = 6;
const ROWS = Math.ceil(doodles.length / COLS);
const W = CELL * COLS;
const H = CELL * ROWS;
if (W > 2048 || H > 2048) throw new Error(`atlas ${W}x${H} exceeds 2048px`);

const dieCut = `
<filter id="dc" filterUnits="userSpaceOnUse" x="-18" y="-18" width="236" height="236" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="4.6" result="b"/>
  <feComponentTransfer in="b" result="m"><feFuncA type="linear" slope="16" intercept="-0.55"/></feComponentTransfer>
  <feFlood flood-color="#F5E6C8" result="f"/>
  <feComposite in="f" in2="m" operator="in" result="cut"/>
  <feMerge><feMergeNode in="cut"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`;

const cells = doodles.map((d, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    id: d.id,
    col,
    row,
    markup: `<svg x="${col * CELL}" y="${row * CELL}" width="${CELL}" height="${CELL}" viewBox="-18 -18 236 236"><g filter="url(#dc)">${d.svg}</g></svg>`,
  };
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}${dieCut}</defs>
${cells.map((c) => c.markup).join('\n')}
</svg>`;

const png = new Resvg(svg, {
  font: {
    fontFiles: ['assets-src/fonts/BowlbyOne.ttf', 'assets-src/fonts/TitanOne.ttf'],
    loadSystemFonts: false,
    defaultFontFamily: 'Bowlby One',
  },
})
  .render()
  .asPng();

const webp = await sharp(png).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer();
writeFileSync('src/assets/stickers.webp', webp);
// Half-resolution copy for phones: 4× less to download, decode and upload.
const webpSm = await sharp(png)
  .resize(W / 2, H / 2)
  .webp({ quality: 80, alphaQuality: 90, effort: 6 })
  .toBuffer();
writeFileSync('src/assets/stickers-sm.webp', webpSm);
if (process.argv.includes('--png')) writeFileSync('assets-src/stickers.debug.png', png); // QA only, git-ignored

// Per-cell opaque bounds (in 0..1 of the cell) → tight physics boxes & smarter layout.
const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const bounds = cells.map((c) => {
  let x0 = CELL,
    y0 = CELL,
    x1 = 0,
    y1 = 0;
  for (let y = 0; y < CELL; y += 2) {
    for (let x = 0; x < CELL; x += 2) {
      const a = data[((c.row * CELL + y) * info.width + c.col * CELL + x) * 4 + 3];
      if (a > 128) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  const r = (v) => Math.round((v / CELL) * 1000) / 1000;
  return [r(x0), r(y0), r(x1), r(y1)];
});

// 32×32 hit-test bitmask per cell (base64) → pointer picking without any GPU/canvas readback.
const MASK = 32;
const masks = cells.map((c) => {
  const bytes = new Uint8Array((MASK * MASK) / 8);
  for (let y = 0; y < MASK; y++) {
    for (let x = 0; x < MASK; x++) {
      const px = c.col * CELL + Math.floor(((x + 0.5) * CELL) / MASK);
      const py = c.row * CELL + Math.floor(((y + 0.5) * CELL) / MASK);
      if (data[(py * info.width + px) * 4 + 3] > 128) bytes[(y * MASK + x) >> 3] |= 1 << (x & 7);
    }
  }
  return Buffer.from(bytes).toString('base64');
});

const map = {
  width: W,
  height: H,
  cell: CELL,
  cols: COLS,
  rows: ROWS,
  maskSize: MASK,
  items: cells.map((c, i) => ({ id: c.id, col: c.col, row: c.row, bounds: bounds[i], mask: masks[i] })),
};
writeFileSync('src/doodles/atlas.json', JSON.stringify(map, null, 1) + '\n');
console.log(
  `atlas ${W}x${H}: ${doodles.length} stickers, webp ${(webp.length / 1024).toFixed(0)} KB (+ ${(webpSm.length / 1024).toFixed(0)} KB half-res)`,
);
