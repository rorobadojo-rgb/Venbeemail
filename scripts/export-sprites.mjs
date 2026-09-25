// Writes every penguin frame as a standalone SVG to public/sprites/ plus a contact sheet.
import { mkdirSync, writeFileSync } from 'node:fs';
import { CAST, penguinSVG } from '../src/penguins.js';

const out = new URL('../public/sprites/', import.meta.url);
mkdirSync(out, { recursive: true });
let sheet = '';
CAST.forEach((c, row) => {
  c.frames.forEach((pose, f) => {
    const svg = penguinSVG(c.spec, pose, `${c.id}-${f}`);
    writeFileSync(new URL(`${c.id}-${f}.svg`, out), svg);
    sheet += `<g transform="translate(${f * 256} ${row * 256})">${svg.replace('<svg ', '<svg x="0" y="0" ')}</g>`;
  });
});
const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${4 * 256} ${CAST.length * 256}" width="${4 * 256}" height="${CAST.length * 256}"><rect width="100%" height="100%" fill="#F5E6C8"/>${sheet}</svg>`;
writeFileSync(new URL('cast-sheet.svg', out), sheetSvg);
console.log(`exported ${CAST.length} penguins × 4 frames → public/sprites/`);
