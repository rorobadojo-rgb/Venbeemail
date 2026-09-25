// Sound manager. Howler + synthesised sounds are only loaded after the first
// user interaction (autoplay-friendly and keeps them off the critical path).
import { store, rand, clamp } from './prefs.js';

const KEY = 'venbee:muted';
const VOL = { slap: 0.55, peel: 0.5, squeak: 0.45, shutter: 0.7, whoosh: 0.6, beat: 0.2 };

let muted = store.get(KEY, false);
let lib = null; // { Howler, sounds }
let loading = null;
let peelId = null;
const subscribers = new Set();

function startBeat() {
  if (!lib || muted || document.hidden) return;
  const b = lib.sounds.beat;
  if (b.playing()) return;
  b.volume(0);
  b.play();
  b.fade(0, VOL.beat, 2500);
}

export const audio = {
  get muted() {
    return muted;
  },

  subscribe(fn) {
    subscribers.add(fn);
  },

  setMuted(value) {
    muted = !!value;
    store.set(KEY, muted);
    if (lib) {
      lib.Howler.mute(muted);
      if (muted) lib.sounds.beat.pause();
      else startBeat();
    }
    subscribers.forEach((fn) => fn(muted));
  },

  unlock() {
    loading ||= Promise.all([import('howler'), import('./synth.js')])
      .then(async ([howler, synth]) => {
        const { Howl, Howler } = howler.Howl ? howler : howler.default;
        const urls = await synth.renderAll();
        const sounds = {};
        for (const [name, url] of Object.entries(urls)) {
          sounds[name] = new Howl({
            src: [url],
            format: ['wav'],
            volume: VOL[name] ?? 0.6,
            loop: name === 'beat' || name === 'peel',
          });
        }
        Howler.mute(muted);
        lib = { Howler, sounds };
        startBeat();
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) sounds.beat.pause();
          else startBeat();
        });
      })
      .catch((err) => console.warn('[venbee] audio disabled:', err));
    return loading;
  },

  /** One-shot (looping sounds are played once); `max` cuts it short after that many seconds. */
  play(name, { rate = 1, volume, max } = {}) {
    if (!lib || muted) return;
    const s = lib.sounds[name];
    if (!s) return;
    const id = s.play();
    s.loop(false, id);
    s.rate(rate, id);
    if (volume != null) s.volume(volume, id);
    if (max) {
      setTimeout(() => s.fade(s.volume(id), 0, 60, id), max * 1000);
      setTimeout(() => s.stop(id), max * 1000 + 80);
    }
  },

  /** Looping tape-peel while something is being dragged. */
  peelStart() {
    if (!lib || muted || peelId != null) return;
    const s = lib.sounds.peel;
    peelId = s.play();
    s.rate(rand(0.9, 1.15), peelId);
    s.volume(0.14, peelId);
  },
  peelSpeed(pxPerSecond) {
    if (peelId == null || !lib) return;
    lib.sounds.peel.volume(clamp(0.12 + pxPerSecond * 0.00045, 0.12, 0.6), peelId);
  },
  peelStop() {
    if (peelId == null || !lib) return;
    const s = lib.sounds.peel;
    const id = peelId;
    peelId = null;
    s.fade(s.volume(id), 0, 120, id);
    setTimeout(() => s.stop(id), 150);
  },
};
