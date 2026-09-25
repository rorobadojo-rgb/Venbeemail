import './styles/main.css';
import { gsap } from 'gsap';
import { reducedMotion, isMobile, idle } from './lib/prefs.js';
import { initShake, shake } from './lib/shake.js';
import { audio } from './lib/audio.js';
import { hydrateSprites, spritesOn } from './lib/sprite.js';
import { buildLetters, slapInLetters, enableLetterDrag } from './hero/letters.js';
import { initBird } from './hero/bird.js';
import { initWidget } from './hero/widget.js';
import { initMute } from './hero/mute.js';

window.__venbee = true;
const $ = (s) => document.querySelector(s);
const hero = $('.hero');

initShake($('.hero__shake'));
hydrateSprites();
const letters = buildLetters($('.title'));
const bird = initBird($('.bird'));
const widget = initWidget({ root: $('.widget'), bird });
initMute($('.shh'));

// ── sound: Howler + synthesis load on the first interaction only ──
const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
const unlock = () => {
  audio.unlock();
  unlockEvents.forEach((t) => window.removeEventListener(t, unlock, true));
};
unlockEvents.forEach((t) => window.addEventListener(t, unlock, { capture: true, passive: true }));

// ── intro: bird → letters → tagline → label + domain stickers ──
function slapTagline() {
  const el = $('.tagline');
  return gsap
    .timeline()
    .set(el, { autoAlpha: 1 })
    .fromTo(
      el,
      { scale: 2.3, rotation: -14, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.28, ease: 'power3.in' },
    )
    .add(() => {
      audio.play('slap', { rate: 0.95 });
      shake(0.3);
    })
    .to(el, { scaleX: 1.1, scaleY: 0.9, duration: 0.05 })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.35)' });
}

const extras = ['.shh', '.scroll-cue', '.hero__tip'];
const fontsReady = Promise.race([
  document.fonts?.load('1em "Bowlby One"') ?? Promise.resolve(),
  new Promise((r) => setTimeout(r, 900)),
]);

// The bird needs no webfont, so it slaps in immediately; type waits for Bowlby One.
const heroIntro = new Promise((resolve) => {
  if (reducedMotion) {
    bird.show();
    fontsReady.then(() => {
      widget.layout();
      gsap.set(['.title', '.tagline', ...extras], { autoAlpha: 1 });
      widget.show();
      resolve();
    });
    return;
  }
  bird.slapIn();
  fontsReady.then(() => {
    widget.layout();
    gsap
      .timeline({ onComplete: resolve })
      .add(slapInLetters(letters), 0.1)
      .add(slapTagline(), '>-0.35')
      .add(widget.slapIn(), 0.3)
      .fromTo(
        extras,
        { autoAlpha: 0, scale: 1.8 },
        { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.12, ease: 'back.out(2)' },
        '>-0.3',
      );
  });
});
heroIntro.then(() => !isMobile() && !reducedMotion && enableLetterDrag(letters, hero));

// ── WebGL sticker bomb: after first paint, when the main thread is idle ──
function startStage() {
  const host = $('.stage');
  const opts = { host, count: isMobile() ? 15 : 40, reduced: reducedMotion, touch: isMobile() };
  import('./gl/stage.js')
    .then(({ createStage }) => createStage(opts))
    .catch((err) => {
      console.warn('[venbee] WebGL unavailable, using DOM stickers:', err);
      host.querySelector('canvas')?.remove();
      return import('./gl/fallback.js').then(({ fallbackStickers }) => fallbackStickers(opts));
    });
}

// ── below-the-fold sections ──
function startSections() {
  spritesOn();
  import('./sections/why.js').then((m) => m.initWhy());
  import('./sections/decos.js').then((m) => m.initDecos());
  import('./sections/inbox.js').then((m) => m.initInbox());
}

const afterLoad = (fn) =>
  document.readyState === 'complete' ? idle(fn) : window.addEventListener('load', () => idle(fn), { once: true });

// The doodle flood starts once the logo + title have landed (or as soon as the visitor
// interacts): the hero UI gets the first frames, WebGL set-up never competes with it.
let stageStarted = false;
const startStageOnce = () => {
  if (stageStarted) return;
  stageStarted = true;
  startStage();
};
heroIntro.then(() => afterLoad(startStageOnce));
['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) =>
  window.addEventListener(t, () => afterLoad(startStageOnce), { once: true, passive: true }),
);
afterLoad(startSections);
