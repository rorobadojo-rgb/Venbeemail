// Every sound is synthesized in JS, encoded as WAV and played through Howler.js.
// Nothing loads until the first user interaction (autoplay policies + Lighthouse).
import { store } from './state.js';

const SR = 22050;
let Howl, Howler;
const sounds = {};
let ready = null;
let muted = store('vm-muted') === '1';
const listeners = new Set();

/* ---------- tiny DSP helpers ---------- */
function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
function buf(sec) {
  return new Float32Array(Math.floor(sec * SR));
}
function biquad(x, type, freq, q = 0.707) {
  const w = (2 * Math.PI * freq) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
  else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
  else { b0 = a; b1 = 0; b2 = -a; } // band-pass
  a0 = 1 + a; a1 = -2 * c; a2 = 1 - a;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
function noise(sec, seed) {
  const r = rng(seed), b = buf(sec);
  for (let i = 0; i < b.length; i++) b[i] = r() * 2 - 1;
  return b;
}
function env(b, attack, decay, curve = 3) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const e = t < attack ? t / attack : Math.pow(Math.max(0, 1 - (t - attack) / decay), curve);
    b[i] *= e;
  }
  return b;
}
function mix(...parts) {
  const len = Math.max(...parts.map((p) => p[0].length));
  const out = new Float32Array(len);
  for (const [p, g] of parts) for (let i = 0; i < p.length; i++) out[i] += p[i] * g;
  return out;
}
function sweep(sec, f0, f1, shape = 'sine') {
  const b = buf(sec);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const k = i / b.length;
    const f = f0 * Math.pow(f1 / f0, k);
    ph += (2 * Math.PI * f) / SR;
    b[i] = shape === 'saw' ? ((ph / Math.PI) % 2) - 1 : Math.sin(ph);
  }
  return b;
}
function normalize(b, peak = 0.9) {
  let m = 0;
  for (const v of b) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < b.length; i++) b[i] = (b[i] / m) * peak;
  return b;
}
function wav(b) {
  const n = b.length, dv = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, s) => [...s].forEach((ch, i) => dv.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, SR, true); dv.setUint32(28, SR * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  w(36, 'data'); dv.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, b[i])) * 32767, true);
  return URL.createObjectURL(new Blob([dv], { type: 'audio/wav' }));
}

/* ---------- sound design ---------- */
const recipes = {
  splat() {
    const n = env(biquad(noise(0.35, 7), 'lp', 900), 0.002, 0.3, 2);
    const thump = env(sweep(0.25, 180, 50), 0.002, 0.22, 2);
    const blip = env(sweep(0.12, 600, 160), 0.001, 0.1, 2);
    return normalize(mix([n, 1], [thump, 0.9], [blip, 0.3]));
  },
  glorp() {
    const b = buf(0.45);
    let ph = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const f = 140 + 220 * Math.sin(t * 9) * Math.exp(-t * 3) + 90 * Math.sin(t * 38);
      ph += (2 * Math.PI * f) / SR;
      b[i] = Math.sin(ph) * Math.sin(Math.min(1, t * 20) * Math.PI * 0.5) * Math.exp(-t * 4.5);
    }
    const bub = env(sweep(0.08, 400, 1200), 0.001, 0.07, 2);
    return normalize(mix([biquad(b, 'lp', 1400), 1], [bub, 0.25]));
  },
  drum() {
    const kick = env(sweep(0.4, 150, 42), 0.001, 0.38, 2.5);
    const snare = env(biquad(noise(0.25, 3), 'bp', 2200, 0.6), 0.001, 0.2, 3);
    const body = env(sweep(0.18, 260, 180), 0.001, 0.15, 3);
    return normalize(mix([kick, 1], [snare, 0.55], [body, 0.35]));
  },
  choke() {
    const n = biquad(noise(0.22, 11), 'hp', 5200);
    for (let i = 0; i < n.length; i++) {
      const t = i / SR;
      n[i] *= t < 0.002 ? t / 0.002 : t < 0.13 ? Math.exp(-t * 6) : Math.exp(-0.78) * Math.max(0, 1 - (t - 0.13) / 0.02);
    }
    const ring = env(sweep(0.15, 6100, 5900), 0.001, 0.14, 1);
    return normalize(mix([n, 1], [ring, 0.15]));
  },
  pop() {
    const click = env(biquad(noise(0.05, 5), 'bp', 3000, 1.2), 0.0005, 0.03, 2);
    const thud = env(sweep(0.1, 220, 90), 0.001, 0.09, 2);
    return normalize(mix([click, 0.8], [thud, 1]), 0.6);
  },
  rewind() {
    const b = sweep(0.65, 180, 1900, 'saw');
    const n = biquad(noise(0.65, 13), 'bp', 1500, 0.8);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const wob = 0.6 + 0.4 * Math.sin(t * 60);
      b[i] = (b[i] * 0.4 + n[i] * 0.8) * wob * Math.min(1, t * 20) * Math.min(1, (0.65 - t) * 12);
    }
    return normalize(biquad(b, 'lp', 3200), 0.7);
  },
  squish() {
    const n = biquad(noise(0.5, 17), 'lp', 700);
    for (let i = 0; i < n.length; i++) {
      const t = i / SR;
      n[i] *= (0.5 + 0.5 * Math.sin(t * 70 + Math.sin(t * 13) * 4)) * Math.exp(-t * 4) * Math.min(1, t * 60);
    }
    const drop = env(sweep(0.35, 320, 70), 0.005, 0.3, 2);
    return normalize(mix([n, 1], [drop, 0.5]));
  },
  whoosh() {
    const n = noise(0.6, 19);
    const out = new Float32Array(n.length);
    let lp = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / n.length;
      const a = 0.02 + 0.25 * Math.sin(t * Math.PI);
      lp += (n[i] - lp) * a;
      out[i] = lp * Math.sin(t * Math.PI);
    }
    return normalize(out, 0.6);
  },
  crowd() {
    const sec = 8, r = rng(23);
    let b = biquad(biquad(noise(sec, 29), 'bp', 700, 0.5), 'lp', 2400);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      b[i] *= 0.55 + 0.25 * Math.sin((t / sec) * Math.PI * 2 * 2) + 0.2 * Math.sin((t / sec) * Math.PI * 2 * 5 + 1);
    }
    // a few distant "woo"s
    for (let k = 0; k < 5; k++) {
      const start = Math.floor(r() * (sec - 1) * SR), len = Math.floor(0.7 * SR), f0 = 380 + r() * 240;
      let ph = 0;
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        ph += (2 * Math.PI * (f0 + 90 * Math.sin(t * 4) + 8 * Math.sin(t * 40))) / SR;
        b[start + i] += Math.sin(ph) * 0.08 * Math.sin((i / len) * Math.PI);
      }
    }
    // cross-fade the loop seam
    const xf = Math.floor(0.25 * SR);
    for (let i = 0; i < xf; i++) b[i] = b[i] * (i / xf) + b[b.length - xf + i] * (1 - i / xf);
    b = b.slice(0, b.length - xf);
    return normalize(b, 0.8);
  },
  guitar() {
    // palm-muted power-chord riff, 150 bpm, 2 bars
    const bpm = 150, step = 60 / bpm / 2, steps = 16;
    const riff = [40, 40, 0, 40, 43, 40, 0, 45, 40, 40, 0, 40, 47, 45, 43, 42];
    const mute = [1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0];
    const b = buf(step * steps);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    riff.forEach((note, s) => {
      if (!note) return;
      const start = Math.floor(s * step * SR), len = Math.floor(step * (mute[s] ? 0.8 : 1.9) * SR);
      for (const iv of [0, 7, 12]) {
        const f = hz(note + iv);
        let ph = 0;
        for (let i = 0; i < len && start + i < b.length; i++) {
          ph += f / SR;
          const t = i / SR;
          const e = Math.exp(-t * (mute[s] ? 14 : 2.5)) * Math.min(1, t * 300);
          b[start + i] += ((ph % 1) * 2 - 1) * e * 0.33;
        }
      }
    });
    for (let i = 0; i < b.length; i++) b[i] = Math.tanh(b[i] * 6);
    return normalize(biquad(biquad(b, 'lp', 2600), 'hp', 90), 0.7);
  },
};

const config = {
  splat: { volume: 0.7 },
  glorp: { volume: 0.55 },
  drum: { volume: 0.8 },
  choke: { volume: 0.5 },
  pop: { volume: 0.25 },
  rewind: { volume: 0.45 },
  squish: { volume: 0.7 },
  whoosh: { volume: 0.4 },
  crowd: { volume: 0.18, loop: true },
  guitar: { volume: 0.08, loop: true },
};

export function initAudio() {
  if (ready) return ready;
  ready = import('howler').then((m) => {
    ({ Howl, Howler } = m);
    Howler.mute(muted);
    for (const [name, make] of Object.entries(recipes)) {
      sounds[name] = new Howl({ src: [wav(make())], format: ['wav'], ...config[name] });
    }
    sounds.crowd.play();
    sounds.guitar.play();
  });
  return ready;
}

const last = {};
export function sfx(name, { throttle = 0, rate = 1 } = {}) {
  const s = sounds[name];
  if (!s) return;
  const now = performance.now();
  if (throttle && last[name] && now - last[name] < throttle) return;
  last[name] = now;
  const id = s.play();
  if (rate !== 1) s.rate(rate, id);
}

export function isMuted() {
  return muted;
}
export function setMuted(m) {
  muted = m;
  store('vm-muted', m ? '1' : '0');
  if (Howler) Howler.mute(m);
  listeners.forEach((fn) => fn(m));
}
export function onMute(fn) {
  listeners.add(fn);
}
