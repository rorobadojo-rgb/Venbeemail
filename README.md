# VenbeeMail · Zombie Mart

A cinematic landing page for **VenbeeMail**, a disposable email service, set in a mini-market
late at night where the staff are zombies. The hero is also the tool: pick a domain from the
shelf, print an address at the register, and parcels (emails) slide onto the counter.

*Segar. Sementara. 100% Tanpa Daftar.*

Stack: **Next.js 16 (App Router) · React Three Fiber (three.js) · GSAP · Howler.js**, plus
`uqr` for the QR code. There are no other runtime dependencies.

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

| Section | What happens |
| --- | --- |
| **Hero** | The official logo hangs on two chains as the store's neon sign. It blinks every 3–5 s (the brows drop and the eyes squash shut for 120 ms), its pupils follow the cursor, and slime drips onto the counter. Hovering makes it buzz brighter. Clicking it plays one of three zombie laughs with a chain rattle, swings the sign, splashes slime and flickers the fluorescent tubes once. Below it, the custom **VenbeeMail** lettering drops out of a vending-machine chute one letter at a time and bounces onto a shelf. |
| **Rak domain & kasir** (the tool) | Ten domain "products" sit on a two-row 3D shelf. The one you pick slides forward and stays lit. Next to it is the cash register with its keypad, receipt printer, expiry label, bin and a little vending machine, plus the service counter and the parcel counter. |
| **Kenapa VenbeeMail** | Three product boxes on a shelf, each with a nutrition-facts label. |
| **Cara kerja** | Three steps printed as line items on one long receipt. |
| **Tanya kasir** (FAQ) | Hanging aisle signs work as an accordion. |
| **Footer** | Closing time: the lights switch off aisle by aisle (in the 3D scene too), then the logo sign blinks twice and closes its eyes. Scroll back up and the shop reopens. |

The **TUTUP / BUKA** door sign in the top-right corner is the mute toggle, and the choice is
saved in `localStorage`.

## StickerButton: one button system

Every button on the page, including the domain chips, register keys, services, baskets,
parcels, FAQ signs and CTAs, is `components/sticker/StickerButton.tsx`: a die-cut
product-label sticker with an 8 px cream border, a 3 px ink stroke, a body colour, a coloured
top band with hand-cut lettering, crumbs, and a resting tilt of −4° to +4°.

```tsx
<StickerButton label="@peler.com" color="red" body="grey" effect="crush" size="md" selected={on} onClick={pick}>
  <SnackDoodle snack="can" />
</StickerButton>
```

| Prop | |
| --- | --- |
| `label` | Band text. |
| `color` / `body` | Band and body colours, from `STICKER_COLORS` in `lib/domains.ts`. Each colour carries a text colour that meets WCAG AA. |
| `effect` | The press effect: `crush`, `fizz`, `bite`, `freeze`, `pricegun`, `bagpop`, `spill`, `jelly`, `coins`, `scan`, `print`, `tear`, `drawer`, `crumple`, `flip`, `spin` or `none`. |
| `size` | `sm`, `md` or `lg`. |
| `sound` | The press sound. It defaults to the effect's sound from the kit; `null` makes the button silent. |
| `selected`, `loading`, `success`, `disabled` | States: a **DIPILIH** price tag slaps on, a barcode scanline sweeps across, a **BERES!** stamp lands, or the sticker is marked **HABIS** (sold out). |
| `children`, `note` | The doodle printed on the body and a small caption under it. |

**Motion** is plain CSS driven by classes (`styles/sticker.css`):

- **Hover:** the sticker lifts 6 px and straightens while its shadow grows (240 ms).
- **Press:** it squashes to 0.92 and pushes 4 px down while the shadow collapses (120 ms).
- **Release:** it springs back with stiffness 400 and damping 18. The spring is
  pre-computed into a CSS `linear()` easing (`lib/spring.ts`), so no JavaScript runs per frame.

Effects are GSAP timelines in `components/sticker/effects.ts`. With reduced motion they
become a short flash.

### The shelf

| Domain | Packaging | Effect | Sound |
| --- | --- | --- | --- |
| `@peler.com` | red / grey | can crush: dents and pops back | can crush |
| `@ewe.com` | lime / purple | fizz: soda bubbles burst upward | fizz |
| `@bawok.com` | hot pink / black | bite: a chunk bitten out, then regrows | bite |
| `@vevek.com` | cyan / grey | freeze: frost spreads, then cracks off | ice |
| `@pentil.com` | yellow / black | price gun: a sticker is shot on | price-gun click |
| `@ngab.com` | orange / cream | bag pop: puffs up and pops | bag pop |
| `@gaskeun.com` | purple / lime | spill: tips over, slime spills out | glug + splat |
| `@santuy.com` | teal / pink | jelly: gelatin wobble | boing |
| `@receh.com` | white / red | coin drop: coins rain onto it | coins |
| `@gabut.com` | blue / yellow | barcode scan: red laser sweep | scanner beep |

### The register keypad

| Key | Colour | What it does |
| --- | --- | --- |
| GENERATE | red | Prints a receipt with a new address (your own username if you typed one). Sound: receipt printer. |
| COPY | lime | Tears the receipt and lands a **TERSALIN!** stamp. Sound: tear + stamp. |
| REFRESH | cyan | The drawer slides open and shut, and new mail is checked. Sound: drawer. |
| DELETE | hot pink | The receipt crumples into the bin. Sound: crumple + bin. |
| QR CODE | yellow | Prints the inbox link as a QR code on the back of the receipt and flips it out. Sound: paper flip. |
| RANDOM | purple | The vending machine spins and drops a random username. Sound: vending machine. |

### The email tool

`lib/mail.ts` holds the mailbox state, persisted in `localStorage`:

- **Baskets:** up to three inboxes, each with its own address, countdown and parcels.
- **Expiry:** every address auto-deletes after 10 minutes. The countdown is shown as a draining
  "baik digunakan sebelum" (best before) label, and **Extend +10 min** tops it up to at most an
  hour ahead.
- **Change address:** pick a new username and domain.
- **Copy inbox link:** copies a link (`#kotak=name@domain`) that reopens the inbox on another
  device.
- **Forward to real email** and **Download .eml** (RFC 822).
- **Spam filter** and **notifications:** the store door chime, plus a system notification
  while the tab is in the background.
- **Parcels:** mail arrives every 8 s as a parcel sliding onto the counter. Click one to flip
  its lid open.

This is a **browser-only demo**: addresses are generated on the device, the mail is sample
mail, and forwarding is simulated (the UI says so). The places where a real mail backend
plugs in are marked at the top of `lib/mail.ts` (`generateLocalPart`, `deliverDemo`,
`setForward`).

## The 3D mini-market

`components/mart/MartScene.tsx` is a React Three Fiber scene:

- **Lighting:** flickering fluorescent tubes (one row per aisle, one tube dying), with glow
  sprites and haze cones.
- **Shelves:** metal gondola shelves filled with **instanced** products (one draw call each for
  boxes, cans, labels and metal).
- **Fridge:** a glowing drinks fridge that hums.
- **Poster wall:** torn posters that flap in the AC draught and peel at one corner, all in a
  vertex shader. Two posters pulse their rays and three blink.
- **Atmosphere:** floating dust, fog and a slow camera push-in. Scrolling walks you down the
  aisle, and the mouse adds ±5° of parallax.

`lib/lights.ts` is the shared lighting state. The sign click (flicker) and the footer (lights
off) write to it, and both the scene and the CSS read it.

The scene is code-split. It only loads on a desktop with a fine pointer and motion allowed,
and only on the first interaction (or after 6 quiet seconds), so it never competes with the
first paint. If frames get slow, it drops the pixel ratio.

- **Phones and tablets:** a flat CSS poster wall where only two posters animate (one blinks,
  one pulses its rays), and a flat domain shelf. The logo blink and laugh, the chip effects and
  the button motion all stay.
- **`prefers-reduced-motion`:** a static wall. There's no entrance animation, parallax or
  flapping; effects become a flash and the buttons don't move.

## Sound (Howler.js)

Everything is synthesised by `scripts/audio/build-audio.mjs`: no samples, no licensing. Effects
are **loudness-matched** (gated RMS with a rough K-weighting), so the whole kit plays at equal
loudness.

- **Shared kit:** scanner beep, can crush, bag rustle and slurp, plus fizz, bite, ice, price gun,
  bag pop, spill, jelly and coins.
- **Register:** printer, tear, stamp, drawer, crumple, bin, paper flip and vending machine.
- **Logo:** three original zombie laughs (formant synthesis with growl), chain rattle, slime
  splash, tube flicker and neon buzz.
- **Store:** parcel slide, lid, light switch, door chime.
- **Ambience loop:** fluorescent hum, fridge buzz and faint in-store bossa muzak, written twice
  so the loop point is seamless.

Browsers only allow audio after a user gesture, so nothing plays and Howler isn't loaded until
the first click, tap or key.

## Assets

Everything generated is committed, so you only need these scripts to change the art.

| Asset | Source → script |
| --- | --- |
| `public/logo/venbee-zombie.svg` | The official logo (`assets/logo/venbee-zombie-source.jpg`) traced with potrace into a **layered SVG** with the groups `sticker`, `cap`, `head`, `teeth`, `drips`, `anger`, `ink`, `eyes`, `pupils` and `brows`, and the black plate removed. `venbee-zombie-body.svg` is the same logo without eyes, pupils and brows (the face underneath is filled in), and `components/logo/logoGeometry.generated.ts` holds the animated parts. Run `npm run assets:logo` (needs Python 3 + Pillow, NumPy, SciPy and the `potrace` CLI). The same command renders `app/icon.png`, `apple-icon.png`, `favicon.ico` and `opengraph-image.jpg`. |
| `public/posters/*` | Nine **original** doodle posters drawn in code (`scripts/posters/art.mjs`, `posters.mjs`) in the style of the reference board. Nothing from the reference is copied, and all text is original. The output is individual SVGs, small WebPs for the CSS wall, blink frames, a rays layer and a 2048 × 1920 WebGL atlas. Run `npm run assets:posters`; poster text uses Bungee (SIL OFL), downloaded once into `scripts/.cache`. |
| `public/audio/*` | `npm run assets:audio` (needs `ffmpeg` with libmp3lame). |
| Title lettering | `components/title/glyphs.ts`: hand-cut block letters drawn as polygons, rendered by `Letter.tsx`. |

## Customising

- **Domains, colours and effects:** `lib/domains.ts`
- **Mail logic and the backend hook:** `lib/mail.ts`
- **Social links, site name and description:** `lib/site.ts`. The social links are `#`
  placeholders.
- **Tokens:** the top of `styles/base.css`. The fonts are Bungee (signage), Chakra Petch
  (labels) and Space Mono (receipts), loaded with `next/font`.

## Performance

Lighthouse 12 on the production build in headless Chromium, measured locally:

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 95–96 | 100 | 100 | 100 |
| Desktop | 99–100 | 100 | 100 | 100 |

Lighthouse does not interact with the page, so these runs measure the page before the 3D
scene loads. The scene itself arrives on the first mouse move.

- React Three Fiber / three.js, Howler and the QR encoder are lazy chunks.
- The poster wall mounts after `load`, so its images never compete with the hero.
- The logo is one cached SVG `<img>` with only the moving parts inline.
- Fonts are self-hosted with metric-matched fallbacks, so CLS is 0.

## Project map

```
app/                  layout (fonts, metadata, spring easing), page, icons, OG image
components/hero/      Hero, NeonSign (the hanging logo)
components/logo/      ZombieLogo (blink, pupils, laugh) + generated geometry
components/title/     glyphs, Letter, Title (vending-chute entrance), Vending
components/sticker/   StickerButton, effects, snack / key doodles
components/tool/      Toko, DomainShelf, Register, ExpiryLabel, Services, Inbox
components/sections/  Why, How, Faq, Footer
components/mart/      Backdrop (lazy loader), PosterWall (CSS), MartScene (R3F)
lib/                  mail store, sound, lights, pointer, spring, domains, toasts
styles/               base, sticker, hero, toko, sections, mart
scripts/              logo tracing + icons, poster art + atlas, audio synthesis
```
