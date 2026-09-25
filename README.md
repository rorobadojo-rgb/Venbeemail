# VenbeeMail — sticker-bomb landing page

Interactive 3D "sticker bomb" landing page for **VenbeeMail**, a disposable / temporary email
service. *Tempel. Pakai. Buang.*

Static site: Vite + vanilla JS, **Three.js** (instanced WebGL stickers), **cannon-es** (drag physics),
**GSAP** (slaps, peels, ScrollTrigger, Draggable/Inertia, Physics2D confetti) and **Howler.js** (sound).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # → dist/  (relative paths, deploy the folder to any static host)
npm run preview   # serve dist/
```

## What's on the page

| Brief | Where |
| --- | --- |
| Matte-black surface + ~40 die-cut doodle stickers that fly in and **slap** down (sound + tiny screen shake) | `src/gl/stage.js`, `src/gl/shaders.js` |
| 3D corner curl, vinyl gloss that follows the cursor, soft shadows, paper backing on the curled underside | curl/gloss/shadow shaders in `src/gl/shaders.js` |
| Drag stickers with physics (grab point → natural swing, throw, bounce off the edges, re-slap) | `src/gl/physics.js` (cannon-es, lazy-loaded on desktop) |
| Bird logo: biggest sticker, visibly peeled corner, hover lifts it, click → peel off, spin, re-slap elsewhere, blinks every ~5s, hops on GENERATE | `src/hero/bird.js`, `src/lib/peel.js` |
| "VenbeeMail" letter stickers (cream face, red-orange outline, black hard shadow, cream die-cut) slap in one by one (±8°, overshoot, settle); draggable, double-click resets | `src/hero/letters.js` |
| Tagline sticker "Tempel. Pakai. Buang." | `index.html`, `src/main.js` |
| Label-maker email strip (Space Mono), countdown, 5 round domain stickers (`@peler.com`, `@ewe.com`, `@bawok.com`, `@vevek.com`, `@pentil.com`): active one sits on the label, the others wait stacked at the side | `src/hero/widget.js` |
| GENERATE / COPY / TOSS vinyl buttons: gloss sweep on hover, squash to 0.9 + spring, rubber squeak, doodle confetti (stars, bones, tiny ghosts) | `src/hero/widget.js`, `src/lib/confetti.js` |
| Sounds: slap, tape peel while dragging, squeak, shutter on COPY, whoosh + flick on TOSS, lo-fi skate loop | `src/lib/synth.js`, `src/lib/audio.js` |
| "SHH" mute sticker that flips over; state in `localStorage` | `src/hero/mute.js` |
| 2 · Kenapa VenbeeMail: 3 big stickers unpeel on scroll → *Tanpa daftar*, *Hilang otomatis*, *Bebas spam* | `src/sections/why.js` |
| 3 · Inbox demo: a fake email slaps onto the board every 8s (sender + subject) | `src/sections/inbox.js` |
| 4 · Footer "Made with too many stickers" + social mini stickers | `index.html` |

The inbox is a **simulation** — there is no mail backend in this repo; generated addresses are
client-side only.

## Assets

- **Logo** — the supplied bird artwork (`assets-src/venbee-bird-source.jpg`) is converted to a clean,
  layered vector with the black background removed: `npm run trace:bird`
  (`scripts/trace-bird.py`: flood-fill background removal → palette classification → potrace per
  colour layer; then `scripts/render-bird-png.mjs` renders a 1600px transparent PNG, favicon and OG image).
  Output: `src/assets/brand/venbee-bird.svg` / `.png`.
- **Doodle stickers** — 30 original doodles drawn as SVG in `src/doodles/doodles.js` (glossy blue bodies,
  fat black lines, red-orange accents). `npm run atlas` bakes them into **one texture atlas**
  (`src/assets/stickers.webp`, 2040×1700, plus a half-res copy for phones), adds the cream die-cut border
  automatically, and writes `src/doodles/atlas.json` (cell map, opaque bounds for physics, 32×32 hit masks).
  The same atlas is used by WebGL and as a CSS sprite for the DOM stickers.
- **Sound** — every sound is synthesised at runtime with an `OfflineAudioContext` and handed to Howler as a
  WAV blob, so the site ships no audio files. Nothing loads until the first click / key / touch.
- **Fonts** — Bowlby One (display), Titan One (fallback), Space Mono (address), self-hosted woff2 (SIL OFL,
  see `src/assets/fonts/OFL.txt`).

Rebuilding assets needs Python 3 with `numpy pillow scipy opencv-python-headless potracer` (logo only).

## Performance & accessibility

- Initial JS ≈ 38 KB gzip (GSAP + hero). Three.js, the stage, cannon-es, Howler, ScrollTrigger and Draggable
  are separate lazy chunks.
- One draw call for all stickers + one for their shadows (instanced geometry, per-instance attributes),
  a single atlas, and rendering only when something changes.
- The WebGL stage starts after the logo/title intro has landed (or on the first interaction, if that
  comes first). The atlas is decoded off the main thread and shader compile/upload is split into short
  tasks, so the hero UI is never blocked.
- **Mobile / touch:** 15 stickers, half-res atlas, capped pixel ratio, no physics drag (tap a sticker to
  flick it), no letter dragging. The slap-in stays.
- **`prefers-reduced-motion`:** no slap-ins, shake, confetti or blinking; everything is placed statically
  and the scroll stickers are shown already unpeeled.
- Real buttons, a radio group for domains (arrow keys work), a live region for the address,
  visible focus styles, and a DOM sticker fallback when WebGL is unavailable.

Lighthouse (headless Chromium, software WebGL, `vite preview`): **mobile 95 · desktop 100** for
performance, **100** for accessibility, best practices and SEO.

## Project layout

```
index.html
src/
  main.js                 boot + intro choreography, lazy-loads everything else
  styles/main.css
  hero/                   letters, bird, widget (label/domains/buttons), mute
  gl/                     stage (three), shaders, layout, physics (cannon-es), DOM fallback
  sections/               why (scroll peel), inbox (demo), decos (edge doodles)
  lib/                    audio + synth, peel, confetti, shake, sprite, prefs, email names
  doodles/                doodle SVG sources + generated atlas.json
  assets/                 logo, atlas, fonts
scripts/                  trace-bird.py, render-bird-png.mjs, build-atlas.mjs
assets-src/               original logo + TTFs used for baking
```
