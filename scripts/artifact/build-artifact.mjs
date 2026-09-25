// Builds a self-contained static copy of the landing page for a Claude
// Artifact (or any static host): artifact-dist/index.html + app.js chunks +
// the public assets it uses. All URLs are relative.
//
// Run: npm run build:artifact
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "artifact-dist");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await build({
  entryPoints: [join(ROOT, "scripts/artifact/entry.tsx")],
  outdir: OUT,
  entryNames: "app",
  chunkNames: "chunk-[hash]",
  bundle: true,
  splitting: true,
  format: "esm",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  tsconfig: join(ROOT, "tsconfig.json"),
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_BASE_PATH": '"."',
    "process.env.NEXT_PUBLIC_SITE_URL": "undefined",
    "process.env.VERCEL_PROJECT_PRODUCTION_URL": "undefined",
  },
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
});

const css = readFileSync(join(OUT, "app.css"), "utf8");
rmSync(join(OUT, "app.css"));

for (const f of ["mascot/venbee-bird-body.svg", "doodles/atlas.svg", "doodles/atlas.webp", "audio/sfx.mp3", "audio/chiptune.mp3"]) {
  mkdirSync(join(OUT, dirname(f)), { recursive: true });
  copyFileSync(join(ROOT, "public", f), join(OUT, f));
}

// The artifact host wraps this in its own <html>/<head>/<body>.
const html = `<title>VenbeeMail Komik</title>
<meta name="description" content="Email sementara sekali pakai, gaya komik.">
<meta name="theme-color" content="#FF3A1F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=Bowlby+One&family=Space+Mono:wght@400;700&display=swap">
<script>document.documentElement.setAttribute("data-js","");document.documentElement.lang="id";</script>
<style>
:root{--font-bowlby:"Bowlby One";--font-bangers:"Bangers";--font-space-mono:"Space Mono";--atlas:url("./doodles/atlas.svg");color-scheme:light;background:#ff3a1f}
${css}
.sound-ctl{top:calc(12px + env(safe-area-inset-top, 0px))}
</style>
<div id="venbee"></div>
<script type="module" src="./app.js"></script>
`;
writeFileSync(join(OUT, "index.html"), html);
console.log("artifact-dist ready");
