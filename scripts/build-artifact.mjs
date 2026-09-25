// Single-file build for sandboxed hosts (e.g. a Claude Artifact): every script, style, font and the
// logo are inlined, and the document wrapper is stripped so the host can supply its own skeleton.
import { build } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const outDir = 'dist-artifact';
await build({
  configFile: false,
  base: './',
  publicDir: false,
  logLevel: 'warn',
  plugins: [viteSingleFile()],
  build: { outDir, target: 'es2020', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5000 },
});

let html = readFileSync(`${outDir}/index.html`, 'utf8');
const logo = 'data:image/svg+xml;base64,' + readFileSync('public/logo.svg').toString('base64');
html = html.replaceAll('/logo.svg', logo);
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];

const styles = [...head.matchAll(/<style[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n');
const scripts = [...head.matchAll(/<script[\s\S]*?<\/script>/g)].map((m) => m[0]).join('\n');
// title first (scanned in the first 8KB), then styles, markup, and finally the inlined module
const page = `<title>VenbeeMail</title>\n<meta name="theme-color" content="#0A0A0A">\n${styles}\n${body}\n${scripts}\n`;
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/venbeemail.html`, page);
console.log(`${outDir}/venbeemail.html  ${(page.length / 1024).toFixed(0)} KB`);
