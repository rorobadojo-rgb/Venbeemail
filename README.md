# VenbeeMail

A cinematic 3D landing page for **VenbeeMail**, a temporary-email service, set in an
Indonesian zombie night market (*pasar malam*). You walk down a lane of stalls under
strings of warm bulbs. The main warung's banner carries the official zombie logo, and the
email tool is the warung's counter.

Stack: **Next.js 16 (App Router) · React Three Fiber · GSAP · Howler.js**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph URLs are absolute. On Vercel the
production domain is picked up automatically.

### GitHub Pages

`.github/workflows/pages.yml` builds a static export (`npm run build:pages`, served under
`/Venbeemail`) and publishes it on every push to `main`:
**https://rorobadojo-rgb.github.io/Venbeemail/**

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## What's on the page

| Part | What happens |
| --- | --- |
| **Warung banner** | The logo is painted on the banner. Its eyes blink every 3–5 s and the irises follow the cursor. Clicking it plays one of three zombie laughs and a tarp flap: the banner flaps in the wind, the bulb string swings, and slime drips off the bottom edge. Hovering the logo brightens the bulbs around the banner. |
| **Title** | "VenbeeMail" in hand-cut block letters. Each "Venbee" letter is a different syrup (pink, green, red, orange, purple, yellow) with jelly cubes, bubbles and a tiny eyeball floating inside, and slow heavy drips. "Mail" is cream with a bulb-yellow outline. On entrance, syrup pours from above into letter-shaped molds, fills them and wobbles as it settles. This is pure CSS, so it plays before hydration. |
| **Domain bags** | Ten plastic bags of syrup hang on a bamboo pole, each with a die-cut label sticker. Every bag has its own press effect (squish, straw slurp, spin, ice clink, puff, drip + splash, goo stretch, rubber band, sparkle, coconut-milk bubbles). The picked bag is unhooked and flies to the counter. Long domains wrap to two lines and shrink to fit; they are never cut off. |
| **Wooden signs** | GENERATE, COPY, REFRESH, DELETE, QR CODE and RANDOM are hand-painted planks on a nail. Hover tilts the sign forward; a press knocks it back with a wooden thud and a little sawdust. |
| **Nota** | A warung receipt book with a pink carbon copy. On GENERATE a zombie hand writes the address in marker (real single-stroke paths), under a blue "WARUNG VENBEE" stamp, with the date, the item line and "Sisa waktu: 10 menit". COPY rips the top sheet off and stamps the carbon "SUDAH DISALIN". DELETE crumples the nota and tosses it into a woven basket. QR CODE flips the nota and draws a scannable code on its back with the pen. |
| **Services** | Custom username + RANDOM, a candle that burns down as the countdown, Extend +10 min, Change address, Copy inbox link (`?inbox=…` opens it), Forward to real email, Download .eml, up to three inboxes as numbered stall plates, a spam filter and browser notifications. |
| **Inbox** | New mail arrives every 8 s wrapped in banana leaf and slides across the counter. Clicking a letter unwraps it. |
| **Sections** | *Kenapa VenbeeMail* (three stall signs), *Cara kerja* (a chalkboard menu), the FAQ (a warung menu board) and the footer. When the footer scrolls into view, the stalls roll their shutters down one by one, the bulbs switch off (in the 3D lane too), and the logo blinks and closes its eyes. |
| **Sound** | Everything is synthesised: zombie laughs, the tarp, ten bag sounds, the wood thud, pen, paper rip, stamp, crumple, a leaf rustle for mail, and an ambient bed (crowd chatter, a sizzling grill, a distant dangdut-style groove, a bicycle bell). The mute toggle is a kentongan in the top-right corner, and the setting is saved in `localStorage`. |

> **Demo mode.** There is no mail server behind the page yet. Addresses are generated in
> the browser, the letters are made up (`lib/fakeMail.ts`), and "Forward to real email"
> only marks letters as forwarded. The page says so in the inbox and the FAQ. The swap
> points are `pumpOnce()` / `startMailPump()` in `lib/mailbox.ts`.

## The 3D lane

`components/market/` holds the lane. `MarketBackdrop` shows a poster first. On desktop it
code-splits React Three Fiber and loads it on the first sign of a real visitor (mouse
move, scroll, key), then fades the live lane in.

- **Instanced everything** (`lane.ts`): posts, printed tarp roofs, doodle banners,
  counters, glasses of syrup, plastic stools, grills, gerobak carts and wheels are each
  one `InstancedMesh`, with an ink-outline pass on the chunky parts. There are about
  600 bulbs (plus their glow sprites), and the grill smoke and the insects around the
  bulbs are one draw call each. The whole scene is about 25 draw calls.
- **Endless walk**: the lane is a ring of 14 slots. When a slot falls behind the camera it
  moves to the far end and is dressed again (new tarp colours, banners, carts), so no
  per-frame matrix work is needed. Mouse parallax is ±5°.
- **Textures**: one 2048 px atlas (`public/doodles/atlas.webp`) of eight original doodle
  banners, used by the banners and printed onto the tarps.
- **Adaptive**: if frames get slow, the lane drops to DPR 1, then turns off the outlines,
  smoke and insects.
- **Phones, touch screens and reduced motion** get the static lane: a poster rendered from
  the same scene (`public/market/poster-mobile.webp`) with swaying DOM bulb strings on
  top. The logo blink and laugh, the bag effects and the nota writing still run.
- **Reduced motion** also shows the title already filled, writes the nota instantly and
  skips all flaps, flights and shakes.

## Assets

Everything generated is committed. You only need these scripts to change the art.

| Asset | Source → script |
| --- | --- |
| `public/logo/*`, `components/logo/logoGeometry.generated.ts` | The official logo (`assets/logo/venbee-zombie-source.jpg`) → `npm run assets:logo` (Python 3 + Pillow + NumPy + SciPy, and the `potrace` CLI). It removes the black plate and traces a **layered SVG** (`venbee-zombie.svg`: sticker › fills › eyes › ink). It also writes the two layers the animated logo stacks around its live eyes (`zombie-under.svg`, `zombie-ink.svg`), plus eye centres, iris radii, eye-white clip paths and brow lines. |
| `app/icon.png`, `apple-icon.png`, `favicon.ico` | From the traced logo → `node scripts/logo/build-icons.mjs` |
| `public/doodles/*` | Original doodles drawn in code (`scripts/doodles/doodles.mjs`: skull, ghost, bones, slime puddle, tin robot, es-campur glass, smoke puff, grinning star, eyeball, zombie hand) → `npm run assets:doodles` (resvg + sharp). This writes 8 banner SVGs, the individual stamps and the 2048 px atlas. |
| `public/audio/*` | `npm run assets:audio` (needs `ffmpeg` with libmp3lame). This writes one effects sprite and a seamless ambient loop. |
| `lib/handFont.generated.ts` | "EMS Tech" single-line font (SIL OFL 1.1, `assets/fonts/`) → `npm run assets:hand` |
| `public/market/*`, `app/opengraph-image.jpg` | Rendered from the running site → `npm run assets:poster [-- http://localhost:3000]` (playwright-core + a Chromium) |

The doodles follow the palette and energy of the brief's reference board, but every
character is drawn from scratch; nothing from the reference image is copied.

## Reusable components

- **`BagChip`** (`components/tool/BagChip.tsx`): a hanging syrup bag. You give it `label`,
  `flavor`, `syrup` (a colour or `"rainbow"`), `deep`, `effect` and `mode` (`hanging` or
  `counter`). It auto-fits the label, and its handle exposes `poke()` and `artRect()`.
- **`WoodSign`** (`components/tool/WoodSign.tsx`): a plank sign button. You give it
  `label`, `caption`, `color` (`red | green | blue | pink | yellow | purple`), `icon`,
  `onClick` and `nudge`.

## Customising

- **Domains, colours and effects:** `lib/domains.ts`
- **Address rules, timers and the mail pump:** `lib/mailbox.ts`
- **Copy:** `app/page.tsx`, `components/sections/*`, `components/tool/*`
- **Colours and fonts:** tokens at the top of `styles/base.css`. The fonts are Bungee
  (signs), Chakra Petch (labels), Permanent Marker (chalk and tags) and Rubik (body),
  all via `next/font`.

## Performance

Lighthouse 12 on the production build (`next start`) in headless Chromium, measured
locally:

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 91 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

## Project map

```
app/                  layout (fonts, metadata), page, icons, OG image
components/hero/      WarungBanner, SyrupTitle (+ glyphs), BulbString
components/logo/      ZombieLogo (live eyes over the traced layers)
components/tool/      MailTool, BagRack, BagChip, WoodSign, Nota, HandText,
                      ZombieHand, Candle, StallPlates, Services, Inbox
components/market/    MarketBackdrop (poster + lazy 3D), MarketScene (R3F),
                      director.ts (walk, lights, quality), lane.ts (instanced lane)
components/sections/  WhySection, HowSection, FaqSection, ClosingFooter
lib/                  mailbox store, domains, fake mail, .eml, QR, handwriting,
                      sound (Howler), bus, motion
scripts/              logo tracing + icons, doodles, audio, handwriting, posters
```
