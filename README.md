# VenbeeMail

Landing page for **VenbeeMail**, a temporary/disposable email service: *"Email sementara. Bikin sebentar, buang cepat."*
It's a cinematic 3D motion-graphic page with a golden-hour or night skatepark, a penguin punk band, a zombie-slime title, and a working disposable-email tool UI.

**Stack:** Vite · Three.js · GSAP (+ScrollTrigger) · Howler.js · qrcode-generator. It builds to plain static files.

```bash
npm install
npm run dev       # local dev server
npm run build     # → dist/ (static, deploy anywhere; base is relative)
npm run preview   # serve the production build
npm run sprites   # re-export the penguin SVG sprites to public/sprites/
```

## What's where

| Path | What |
| --- | --- |
| `index.html` | Page shell: hero, tool panel, sections, settings drawer |
| `src/main.js` | Boot order, theme/mute/settings wiring, lazy 3D loading |
| `src/logo-data.js`, `public/logo.svg` | The official logo, vectorised into layered SVG paths (also the favicon) |
| `src/logo.js` | Logo as a floating extruded 3D sticker (stacked CSS 3D layers, rim light, angry shake on hover, pulsing anger mark) |
| `src/wordmark.js` | Custom hand-cut block lettering for "VenbeeMail". "Venbee" is colourful zombie slime (drips, bubbles, bite holes, stitches, pop-out eyeballs, turbulence jiggle). "Mail" is solid red cut-paper. Includes the drop/splat/zombie-get-up entrance, hover squish + glorp, and click-to-melt |
| `src/penguins.js` | Parametric generator for the **original** penguin cast (14 characters × 4 frames, flat cel-shaded SVG) |
| `public/sprites/` | Exported penguin sprites + `cast-sheet.svg` contact sheet |
| `src/scene/skatepark.js` | Three.js scene: bowl, half-pipe, rail, graffiti walls, chain-link fence, floodlights, volumetric shafts, anamorphic flares, dust, lightning, slime drips, instanced penguin sprites |
| `src/scene/textures.js` | Procedural canvas textures (concrete, plywood, graffiti doodles, fence, amps, flares) |
| `src/mobile-bg.js` | Illustrated skatepark with 4 CSS-animated penguins. Used on mobile, for reduced motion, as a no-WebGL fallback, and as the 3D poster |
| `src/tool.js` | Email tool: username validation, domain chips, address lifecycle, inbox, countdown, QR, services |
| `src/fx.js` | Slime splats (gooey SVG filter), lightning bursts, camera flash, spark trails, melting buttons |
| `src/audio.js` | Every sound is synthesised in JS, encoded to WAV, and played through Howler. Audio starts after the first interaction |
| `src/sections.js` | Scroll choreography: skate-deck flips, a penguin skating between steps, setlist FAQ, footer lights going out |
| `scripts/trace-logo.py` | Rebuilds the logo SVG from the source raster (`python3 scripts/trace-logo.py logo.jpg`) |

## Notes

- **The inbox is simulated.** It's a front-end demo, and fake emails arrive every 8 s. To wire in a real mail backend, replace the timer in `scheduleMail`/`receiveMail` (`src/tool.js`) with a fetch or WebSocket to your SMTP catcher.
- **3D is desktop-only and lazy.** three.js loads after `load` + idle, and only on a hardware WebGL2 GPU. Software rasterisers (SwiftShader, llvmpipe) and GPUs that can't hold about 25 fps fall back to the illustrated park. Pixel ratio drops to 1× automatically if frames run long.
- **Reduced motion.** `prefers-reduced-motion`, or the "Kurangi gerakan" setting, renders a still 3D frame, skips entrances, jiggle and splats, and stops CSS loops.
- **Persistence.** Theme (golden hour / night skatepark), mute state and the current address are kept in `localStorage`. "Copy inbox link" produces `#inbox=<address>`, which restores that address.
- **Debug URL flags:** `?flat` (never load 3D), `?still` (reduced-motion mode), `?force3d` (skip the software-GL check).
- **Lighthouse** (headless Chromium, local `vite preview`): mobile 98 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO). The headless runner has no GPU, so the desktop run measured the illustrated-park path. The 3D path should be profiled on real hardware.
- The penguins are original designs. Image 2 was used only as mood reference, and no text on the page is Japanese.
