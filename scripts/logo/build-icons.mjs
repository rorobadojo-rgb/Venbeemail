// Renders the app icons and the Open Graph card from the traced logo, the
// title glyphs and the poster atlas:
//
//   app/icon.png              512 px, transparent
//   app/apple-icon.png        180 px on black (iOS has no transparency)
//   app/favicon.ico           16 / 32 / 48 px (PNG-in-ICO)
//   app/opengraph-image.jpg   1200 x 630 share card
//
// Run: npm run assets:logo   (after trace_logo.py; needs the poster atlas)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const APP = join(ROOT, "app");
const CACHE = join(ROOT, "scripts", ".cache");
const FONT = join(CACHE, "Bungee-Regular.ttf");
const logo = readFileSync(join(ROOT, "public", "logo", "venbee-zombie.svg"), "utf8");
const [, , LW, LH] = logo.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
const inner = logo.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>.*?<\/title>/, "");

// the title glyphs live in TypeScript; Node strips the types
const { GLYPHS, TITLE, FRAME, glyphPath, polyPath } = await import(join(ROOT, "components", "title", "glyphs.ts"));

mkdirSync(CACHE, { recursive: true });
if (!existsSync(FONT)) {
  const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bungee")).text();
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  writeFileSync(FONT, Buffer.from(await (await fetch(url)).arrayBuffer()));
}

const render = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: "Bungee" } })
    .render()
    .asPng();

/** Square canvas with the logo centred at `k` of its size. */
function square(size, k, bg) {
  const s = Math.max(LW, LH) / k;
  const x = (s - LW) / 2;
  const y = (s - LH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${size}" height="${size}">
    ${bg ? `<rect width="${s}" height="${s}" fill="${bg}"/>` : ""}<g transform="translate(${x} ${y})">${inner}</g></svg>`;
}

writeFileSync(join(APP, "icon.png"), await sharp(render(square(512, 0.96), 512)).png({ compressionLevel: 9, palette: true }).toBuffer());
writeFileSync(join(APP, "apple-icon.png"), await sharp(render(square(180, 0.84, "#0A0A0A"), 180)).png({ compressionLevel: 9 }).toBuffer());

// ICO with PNG payloads (all current browsers read these)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(render(square(s, 1), s)).png().toBuffer()));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  head.writeUInt8(s, e);
  head.writeUInt8(s, e + 1);
  head.writeUInt16LE(1, e + 4);
  head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(pngs[i].length, e + 8);
  head.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(APP, "favicon.ico"), Buffer.concat([head, ...pngs]));

// ------------------------------------------------------------ OG card
const INK = "#0A0A0A";
function letterSvg(l, x) {
  const g = GLYPHS[l.ch];
  const d = glyphPath(g);
  const outer = polyPath(g.outer) + (g.dot ? polyPath(g.dot) : "");
  const cx = g.w / 2;
  const body =
    l.kind === "slime"
      ? `${(l.drips ?? []).map((dr) => `<path d="M${dr.x - 8} -8L${dr.x - 8} ${dr.len - 8}C${dr.x - 8} ${dr.len + 2} ${dr.x + 8} ${dr.len + 2} ${dr.x + 8} ${dr.len - 8}L${dr.x + 8} -8Z" fill="${l.color}" stroke="${INK}" stroke-width="6"/>`).join("")}
         <path d="${d}" fill="${l.color}" fill-rule="evenodd" stroke="${INK}" stroke-width="9" stroke-linejoin="round" paint-order="stroke"/>
         ${(l.bubbles ?? []).map(([bx, by, r]) => `<circle cx="${bx}" cy="${by}" r="${r}" fill="${l.light}" stroke="${INK}" stroke-width="3"/>`).join("")}
         ${l.eyeball ? `<circle cx="${l.eyeball[0]}" cy="${l.eyeball[1]}" r="${l.eyeball[2]}" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${l.eyeball[0] + 3}" cy="${l.eyeball[1] + 2}" r="${l.eyeball[2] * 0.5}" fill="#FF1F5A" stroke="${INK}" stroke-width="3"/><circle cx="${l.eyeball[0] + 4}" cy="${l.eyeball[1] + 3}" r="${l.eyeball[2] * 0.22}" fill="${INK}"/>` : ""}`
      : `<path d="${d}" fill="none" stroke="${INK}" stroke-width="18" stroke-linejoin="round"/>
         <path d="${d}" fill="${l.color}" fill-rule="evenodd" stroke="#F5E6C8" stroke-width="8" stroke-linejoin="round" paint-order="stroke"/>`;
  return `<g transform="translate(${x} 0) translate(0 ${l.dy}) rotate(${l.rot} ${cx} -70) scale(1 ${l.sy})">
    <path d="${outer}" transform="translate(7 9)" fill="${INK}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>${body}</g>`;
}
let x = 0;
const letters = TITLE.map((l, i) => {
  const s = letterSvg(l, x);
  x += GLYPHS[l.ch].w + (i === 5 ? 44 : 6);
  return s;
}).join("");
const titleW = x;

const atlas = sharp(join(ROOT, "public", "posters", "atlas.webp"));
const cells = [0, 1, 2, 3, 6, 7, 4, 8];
const posters = await Promise.all(
  cells.map(async (c, i) =>
    sharp(await atlas.clone().extract({ left: (c % 4) * 512, top: Math.floor(c / 4) * 640, width: 512, height: 640 }).toBuffer())
      .resize(230)
      .rotate([-6, 4, -3, 5, -4, 3, 6, -5][i], { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .modulate({ brightness: 0.42 })
      .png()
      .toBuffer(),
  ),
);
const W = 1200;
const H = 630;
const logoH = 380;
const logoW = (LW / LH) * logoH;
const tScale = 640 / titleW;
const card = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs><radialGradient id="glow" cx=".3" cy=".45" r=".5"><stop offset="0" stop-color="#A6F23A" stop-opacity=".35"/><stop offset="1" stop-color="#A6F23A" stop-opacity="0"/></radialGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0A0A" stop-opacity=".2"/><stop offset="1" stop-color="#0A0A0A" stop-opacity=".75"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect x="120" y="0" width="360" height="12" fill="#EFFFF5"/><rect x="720" y="0" width="360" height="12" fill="#EFFFF5"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g transform="translate(60 ${(H - logoH) / 2 + 10}) scale(${logoH / LH})">${inner}</g>
  <g transform="translate(${60 + logoW + 36} 330) scale(${tScale})">${letters}</g>
  <g font-family="Bungee" font-size="30">
    <g transform="translate(${60 + logoW + 40} 400) rotate(-3)"><rect width="140" height="52" fill="#A6F23A" stroke="${INK}" stroke-width="4"/><text x="70" y="38" text-anchor="middle" fill="${INK}">SEGAR.</text></g>
    <g transform="translate(${60 + logoW + 196} 404) rotate(2)"><rect width="226" height="52" fill="#FF1F5A" stroke="${INK}" stroke-width="4"/><text x="113" y="38" text-anchor="middle" fill="${INK}">SEMENTARA.</text></g>
    <g transform="translate(${60 + logoW + 70} 474) rotate(-1)"><rect width="364" height="52" fill="#FF3A1F" stroke="${INK}" stroke-width="4"/><text x="182" y="38" text-anchor="middle" fill="${INK}">100% TANPA DAFTAR.</text></g>
  </g>
</svg>`;
const bg = await sharp({ create: { width: W, height: H, channels: 3, background: "#0A0A0A" } })
  .composite(posters.map((input, i) => ({ input, left: -40 + (i % 4) * 330 + (i >= 4 ? 150 : 0), top: i < 4 ? -60 : 300 })))
  .png()
  .toBuffer();
const og = await sharp(bg).composite([{ input: render(card, W) }]).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
writeFileSync(join(APP, "opengraph-image.jpg"), og);
console.log("icons + og written");
