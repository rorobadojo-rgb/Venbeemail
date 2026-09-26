// Renders the 3D lane to still images: the first paint on desktop (before the
// live scene loads) and the static lane on phones / reduced motion.
//
//   public/market/poster.webp          1600 x 900
//   public/market/poster-mobile.webp    540 x 960
//   app/opengraph-image.jpg            1200 x 630, the hero once the syrup
//                                      has been poured
//
// Needs the site running (npm run dev, or npm run build && npm start) and a
// Chromium that playwright-core can find (PLAYWRIGHT_BROWSERS_PATH or
// CHROMIUM_PATH). Run: npm run assets:poster [-- http://localhost:3000]
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const base = process.argv[2] ?? "http://localhost:3000";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const [mode, width, height, file] of [
  ["desktop", 1600, 900, "poster.webp"],
  ["mobile", 540, 960, "poster-mobile.webp"],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`${base}/?poster=${mode}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__marketReady === true, null, { timeout: 120_000 });
  await page.waitForTimeout(2500); // atlas upload + a few settled frames
  const png = await page.screenshot({ type: "png" });
  await sharp(png).webp({ quality: 68, effort: 6 }).toFile(join(ROOT, "public", "market", file));
  console.log("wrote", file);
  await page.close();
}
// Open Graph card: the real hero
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".kentongan, nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(5000);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(join(ROOT, "app", "opengraph-image.jpg"));
  console.log("wrote opengraph-image.jpg");
  await page.close();
}
await browser.close();
