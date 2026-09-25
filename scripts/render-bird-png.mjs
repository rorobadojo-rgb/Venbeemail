// Rasterise the traced bird SVG into a high-res transparent PNG, plus the favicon/OG images.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('src/assets/brand/venbee-bird.svg', 'utf8');
const render = (width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

const png = render(1600);
writeFileSync('src/assets/brand/venbee-bird.png', png);
mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', render(192));
writeFileSync('public/og-bird.png', render(1200));
console.log(`venbee-bird.png ${png.length >> 10} KB (+ icon-192, og-bird)`);
