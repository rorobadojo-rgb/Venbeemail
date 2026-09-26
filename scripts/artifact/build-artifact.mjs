// Turns the static export (out/) into a folder that works from any sub-path,
// for publishing the page as a Claude Artifact (or any static host you can't
// set a basePath for).
//
//   <dest>/index.html          a tiny loader that opens app.html
//   <dest>/app.html            the page, every asset URL relative
//   <dest>/assets/_next/…      Next's files (Artifact paths may not start with
//                              "_"; Next itself needs "/_next/" in its URLs)
//   <dest>/logo/, doodles/, audio/, market/, icons
//
// Run: npm run build:artifact   (dest defaults to artifact-out/)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "out");
const DEST = join(ROOT, process.argv[2] ?? "artifact-out");
if (!existsSync(join(OUT, "index.html"))) throw new Error("run the static export first (out/index.html missing)");

// only what the single page needs: no RSC navigation payloads, no 404 route,
// no pages-router build manifests
const skip = (p) =>
  /\.txt$/.test(p) || /(^|\/)(404|_not-found)(\.html|\/|$)/.test(p) || /(^|\/)__next\./.test(p) ||
  /^_next\/static\/[^/]+\/_(build|ssg|clientMiddleware)Manifest\.js$/.test(p) || p === ".nojekyll";
rmSync(DEST, { recursive: true, force: true });
cpSync(OUT, DEST, { recursive: true, filter: (src) => !skip(relative(OUT, src)) });
mkdirSync(join(DEST, "assets"));
renameSync(join(DEST, "_next"), join(DEST, "assets", "_next"));
for (const d of readdirSync(join(DEST, "assets", "_next", "static"))) {
  const p = join(DEST, "assets", "_next", "static", d);
  if (!["chunks", "media"].includes(d) && !readdirSync(p).length) rmSync(p, { recursive: true });
}

// 1. the page: absolute /_next/ and icon URLs become relative (HTML + the inline RSC payload)
const html = readFileSync(join(DEST, "index.html"), "utf8")
  .replace(/(["'])\/_next\//g, "$1assets/_next/")
  .replace(/(["'])\/(favicon\.ico|icon\.png|apple-icon\.png)/g, "$1$2");
if (/["']\/_next\//.test(html)) throw new Error("absolute /_next/ URL left in the page");
writeFileSync(join(DEST, "app.html"), html);

// 2. the turbopack runtime loads lazy chunks (the 3D lane, Howler) from "/_next/".
//    Also escape raw U+FFFD (a UTF-8 decoder's string literal), which the
//    Artifact service refuses in text files; "\uFFFD" means the same in JS.
const chunks = join(DEST, "assets", "_next", "static", "chunks");
let patched = 0;
const BASE = /TURBOPACK_CHUNK_BASE_PATH:"\/_next\/"/g;
for (const f of readdirSync(chunks)) {
  const p = join(chunks, f);
  if (!f.endsWith(".js") || !statSync(p).isFile()) continue;
  const src = readFileSync(p, "utf8");
  if (BASE.test(src)) patched++;
  const next = src.replace(BASE, 'TURBOPACK_CHUNK_BASE_PATH:"assets/_next/"').replaceAll("\uFFFD", "\\uFFFD");
  if (next !== src) writeFileSync(p, next);
}
if (!patched) throw new Error("turbopack chunk base path not found; check the runtime chunk");

// 3. the loader (the Artifact wraps it in its own document skeleton)
writeFileSync(
  join(DEST, "index.html"),
  `<title>Pasar Malam VenbeeMail</title>
<style>
  :root { --night: #0a0a0a; --cream: #f5e6c8; --bulb: #ffd23f; color-scheme: dark; }
  html, body { height: 100%; }
  body { display: grid; place-items: center; margin: 0; padding-inline: 16px; background: var(--night); color: var(--cream); font: 600 16px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center; }
  a { color: var(--bulb); }
  .bulb { width: 14px; height: 18px; margin: 0 auto 16px; border-radius: 50% 50% 45% 45%; background: var(--bulb); box-shadow: 0 0 26px 8px rgb(255 210 63 / 0.45); animation: flick 1.1s ease-in-out infinite alternate; }
  @keyframes flick { to { opacity: 0.55; } }
  @media (prefers-reduced-motion: reduce) { .bulb { animation: none; } }
</style>
<main>
  <div class="bulb" aria-hidden="true"></div>
  <p>Membuka lapak VenbeeMail…</p>
  <p><a href="app.html">Masuk ke pasar malam</a></p>
</main>
<script>location.replace("app.html");</script>
`,
);

const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1), 0);
console.log(`artifact: ${count(DEST)} files in ${relative(ROOT, DEST)}/ (patched ${patched} runtime chunk)`);
