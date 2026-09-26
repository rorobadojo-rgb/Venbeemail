// App icons from the traced logo (public/logo/venbee-zombie.svg):
//   app/icon.png (512), app/apple-icon.png (180, on the night background),
//   app/favicon.ico (16 / 32 / 48 PNG-in-ICO)
// Run: node scripts/logo/build-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const svg = readFileSync(join(ROOT, "public", "logo", "venbee-zombie.svg"), "utf8");
const render = (size) => new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

const square = async (size, pad, background) => {
  const inner = Math.round(size * (1 - pad * 2));
  const logo = await sharp(render(inner * 2)).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toBuffer();
};

const clear = { r: 0, g: 0, b: 0, alpha: 0 };
writeFileSync(join(ROOT, "app", "icon.png"), await square(512, 0.02, clear));
writeFileSync(join(ROOT, "app", "apple-icon.png"), await square(180, 0.08, { r: 10, g: 10, b: 10, alpha: 1 }));

// ICO with embedded PNGs
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => square(s, 0, clear)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(ROOT, "app", "favicon.ico"), Buffer.concat([header, ...pngs]));
console.log("icons written");
