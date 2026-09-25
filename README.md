# VenbeeMail

A comic-book landing page for **VenbeeMail**, a disposable email service. Venbee the bird is
the narrator. As you scroll, each panel flies into a comic page, and the page ends on a
"To be continued…" end card.

Stack: **Next.js 16 (App Router) · GSAP + ScrollTrigger · Three.js · Howler.js**, with no
other runtime dependencies.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph URLs are absolute. On Vercel the
production domain is picked up automatically.

### GitHub Pages (view it on your phone)

`.github/workflows/pages.yml` builds a static export (`npm run build:pages`, served under
`/Venbeemail`) and publishes it on every push to `main`:
**https://rorobadojo-rgb.github.io/Venbeemail/**

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**,
then re-run the workflow from the **Actions** tab (or push to `main`).

## What's on the page

| Panel | What happens |
| --- | --- |
| **1 · Hero** | A tilted comic panel. "VenbeeMail" bursts in with a BOOM! starburst. The letters have a cream face, a black extruded side and a red-orange halftone drop shadow, and scale in 60 ms apart with an overshoot. The mouse tilts the camera up to ±6°. Venbee sits in an inset panel and types *"Butuh email? Sebentar aja? Nih."*, blinking every ~5 s. Hovering Venbee raises the eyebrow (a second frame); clicking replays the line. |
| **2 · Email machine** | A retro gadget. The address shows in a Space Mono caption box. The five domain stickers (`@peler.com`, `@ewe.com`, `@bawok.com`, `@vevek.com`, `@pentil.com`) are fanned like a hand of cards; picking one fires a KLIK! burst. The GENERATE / COPY / TRASH buttons have a hard offset shadow: it shifts diagonally on hover, collapses to 0 on press, then springs back. |
| **3 · Features** | *Tanpa daftar*, *Hilang otomatis* and *Bebas spam*, each flying in from a different edge. |
| **4 · Inbox demo** | Fake mail drops in as speech bubbles, one per frame of a comic strip. The spam one gets ZAP!ped, and a countdown shows the inbox self-destructing. |
| **5 · Full page** | The camera zooms out to show the finished comic page. |
| **6 · End card** | A film-style "To be continued…" card (grain, flicker, sprocket holes) with social links as comic badges. |

### Layout modes

These are defined in `lib/motion.ts` and mirrored in the CSS media queries:

- **Cinematic** (≥ 960 × 600, motion allowed): the four slots form a 2 × 2 comic spread
  inside a pinned stage. A scrubbed GSAP timeline moves a camera (`.cam`) from panel to
  panel. Each panel flies into its slot with a 3D tilt, a trail of echoes and speed lines,
  and the scroll snaps one panel per gesture. The chapter badges on the right and Tab
  focus both move the camera.
- **Flow** (phones and short screens): panels stack vertically with a simple fade + slide,
  there is no 3D tilt, and there are about 60% fewer doodles.
- **Reduced motion** (`prefers-reduced-motion`): static stacked layout with no fly-ins, no
  parallax, no blinking and no typing.

Without JavaScript the page falls back to the flow layout and is still fully readable.

### Doodle wall (Three.js)

`components/doodles/doodleScene.ts` draws every background doodle as one `InstancedMesh`
(a single draw call) that samples a single **2048 px texture atlas**. Idle motion,
line-boil jitter and endless wrapping all happen in the vertex shader. The Three camera
follows the comic camera, so near doodles move faster than far ones. It uses 90 instances
on desktop and 36 on mobile. If frames get slow, it lowers the pixel ratio and then stops
the idle animation.

Three.js is code-split and only loads on the first interaction (mouse move, touch, scroll
or key), so it never competes with first paint. Until then the CSS backdrop and the doodles
inside the panels carry the look. The panel doodles are CSS sprites from the same atlas.

### Sound (Howler.js)

Every sound is synthesised by `scripts/audio/build-audio.mjs`: no samples, no licensing.

- Page flip when the comic moves to another panel, POW on GENERATE, a ding on COPY, a
  paper crumple on TRASH.
- A pen scribble on mascot hover and when a line starts typing, plus typewriter clicks per
  character.
- A quiet chiptune loop.

All effects live in one audio sprite. Browsers only allow audio after a user gesture, so
nothing plays and Howler isn't loaded until the first click, tap or key. The **SHHH!**
bubble mutes everything and the ♪ sticker toggles the music. Both settings are saved in
`localStorage`.

## Assets

Everything generated is committed, so you only need these scripts to change the art.

| Asset | Source → script |
| --- | --- |
| `public/mascot/*` | The official bird (`assets/mascot/venbee-bird-source.png`) → `npm run assets:mascot` (Python 3 + Pillow + NumPy + SciPy, and the `potrace` CLI). This removes the black plate and writes a transparent PNG (`venbee-bird.png`, plus `venbee-bird@2x.png` rendered from the vector). It traces a layered SVG (`venbee-bird.svg`), a body without the eye/eye-mask (`venbee-bird-body.svg`) that the React mascot animates on top of, the static `-raised` / `-blink` frames, and `components/mascot/birdGeometry.generated.ts`. |
| `public/doodles/*` | 16 original doodles drawn in code (`scripts/doodles/doodles.mjs`) → `npm run assets:doodles` (resvg + sharp). This writes `atlas.svg` (CSS sprites), `atlas.webp` (2048 px WebGL texture) and the individual SVGs. |
| `public/audio/*` | `npm run assets:audio` (needs `ffmpeg` with libmp3lame). This writes `sfx.mp3` (a sprite) and `chiptune.mp3`, and the loop is written twice so the loop point is seamless. |
| `app/icon.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.jpg` | Rendered from the mascot and the hero. |

The doodle art uses the palette, line weight and characters of the reference board, but
all of it is drawn from scratch; nothing from the reference image is copied or included.

## Customising

- **Domains / address format:** `lib/mail.ts`. `generateLocalPart()` is where a real mail
  API goes; the demo generates addresses in the browser with `crypto.getRandomValues`.
- **Social links, site name, description:** `lib/site.ts`. The social links are `#`
  placeholders.
- **Copy:** each panel lives in `components/panels/*`.
- **Colours / type:** tokens at the top of `styles/base.css`. Fonts are Bowlby One (display),
  Bangers (comic captions) and Space Mono (the address), loaded with `next/font`.

## Performance

Lighthouse 12 on the production build in headless Chromium, measured locally:

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 96 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Why it's fast:

- The hero intro is pure CSS, so there is no wait for hydration.
- Three.js and Howler are lazy chunks, and the atlas is only fetched when WebGL starts.
- The mascot body is one cached SVG `<img>` shared by every panel.
- Fonts are self-hosted with metric-matched fallbacks, so CLS ≈ 0.

## Project map

```
app/                   layout (fonts, metadata), page, icons, OG image
components/ComicPage   scroll choreography: camera, fly-ins, snapping, modes
components/panels/     Hero, Generator (+ DomainFan), Features, Inbox, EndCard
components/mascot/     Venbee: traced body + animated eye / eye-mask overlay
components/comic/      Bubble / TypewriterBubble, ComicButton, Doodle, Starburst, Echoes
components/doodles/    DoodleField (lazy loader) + doodleScene (Three.js)
lib/                   sound (Howler), mail store, burst effect, nav/steps, camera bus
styles/                base (tokens, bubbles, buttons), comic (stage/layout), panels
scripts/               mascot tracing, doodle atlas, audio synthesis
```
