// Synthesises every VenbeeMail sound from scratch (no samples, no licensing)
// and encodes them with ffmpeg (libmp3lame):
//
//   public/audio/sfx.mp3       one Howler sprite with every sound effect
//   public/audio/ambient.mp3   night-market bed: crowd chatter, a sizzling
//                              grill, a distant dangdut-style beat and a
//                              bicycle bell. Written twice, so the loop region
//                              sits in the middle and is seamless whatever
//                              encoder delay the browser applies.
//   lib/audioSprite.generated.ts
//
// Run: npm run assets:audio   (needs ffmpeg on PATH)
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SR = 44100;
const TAU = Math.PI * 2;

// deterministic noise so rebuilding gives identical files
let seed = 0x5eed;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** RBJ biquad; returns a stateful per-sample filter with .set(freq). */
function biquad(type, freq, q = 0.707) {
  let b0, b1, b2, a1, a2;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f, qq = q) => {
    const w = (TAU * Math.min(Math.max(f, 10), SR * 0.45)) / SR;
    const al = Math.sin(w) / (2 * qq);
    const c = Math.cos(w);
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; } // band-pass (0 dB peak)
    const a0 = 1 + al;
    a1 = -2 * c / a0; a2 = (1 - al) / a0;
    b0 /= a0; b1 /= a0; b2 /= a0;
  };
  set(freq);
  const f = (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
  f.set = set;
  return f;
}

/** Add `src` into `out` at `at` seconds (wrapping when `wrap`). */
function mix(out, src, at, gain = 1, wrap = false) {
  const o = Math.floor(at * SR);
  for (let i = 0; i < src.length; i++) {
    let j = o + i;
    if (wrap) j %= out.length;
    else if (j >= out.length) break;
    out[j] += src[i] * gain;
  }
  return out;
}

// ------------------------------------------------------------- voice kit
const VOWELS = {
  a: [[750, 1], [1220, 0.55], [2600, 0.25]],
  e: [[480, 1], [1900, 0.5], [2600, 0.3]],
  o: [[430, 1], [820, 0.6], [2700, 0.15]],
  u: [[330, 1], [700, 0.4], [2500, 0.1]],
  i: [[300, 1], [2300, 0.45], [3000, 0.25]],
};

/** A growly voiced syllable: aspirated "h" into a vowel, with vocal fry. */
function syllable(dur, f0a, f0b, vowel, { growl = 0.6, breath = 0.35, fry = 28 } = {}) {
  const out = buf(dur + 0.05);
  const forms = VOWELS[vowel].map(([f, g]) => [biquad("bp", f, 6), g]);
  const aspir = VOWELS[vowel].map(([f, g]) => [biquad("bp", f, 3), g]);
  let ph = 0, sub = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const k = clamp01(t / dur);
    const f0 = (f0a + (f0b - f0a) * k) * (1 + 0.015 * noise());
    ph += f0 / SR; if (ph >= 1) ph -= 1;
    sub += f0 / 2 / SR; if (sub >= 1) sub -= 1;
    // glottal-ish pulse: saw with a soft corner, plus a subharmonic for growl
    const pulse = (1 - 2 * ph) ** 3 + growl * (sub < 0.5 ? 0.6 : -0.6);
    const tremor = 1 - 0.45 * (0.5 + 0.5 * Math.sin(TAU * fry * t + 3 * noise() * 0.1));
    const voicedEnv = clamp01((t - 0.035) / 0.03) * clamp01((dur - t) / 0.06);
    const hEnv = clamp01(t / 0.01) * clamp01((0.07 - t) / 0.04);
    let v = 0, h = 0;
    const n = noise();
    for (const [f, g] of forms) v += f(pulse) * g;
    for (const [f, g] of aspir) h += f(n) * g;
    out[i] = v * voicedEnv * tremor * 2.2 + h * (hEnv * 1.3 + voicedEnv * breath * 0.35);
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 2.4);
  return out;
}

function laugh(parts, tail) {
  const total = parts.reduce((n, p) => Math.max(n, p.at + p.dur), 0) + (tail ?? 0.2);
  const out = buf(total);
  for (const p of parts) mix(out, syllable(p.dur, p.f0[0], p.f0[1], p.v, p.opts), p.at, p.gain ?? 1);
  const lp = biquad("lp", 3400);
  for (let i = 0; i < out.length; i++) out[i] = lp(out[i]);
  return out;
}

// "heh-heh-heh-heh", quick and wheezy, falling
const laugh1 = () =>
  laugh([0, 1, 2, 3, 4].map((k) => ({ at: k * 0.17, dur: 0.14, f0: [150 - k * 10, 138 - k * 10], v: "e", gain: 1 - k * 0.1 })));
// "HAAAA-ha-ha-ha": a big rising howl, then chuckles
const laugh2 = () =>
  laugh([
    { at: 0, dur: 0.5, f0: [95, 150], v: "a", opts: { growl: 0.8, fry: 22 } },
    ...[0, 1, 2].map((k) => ({ at: 0.56 + k * 0.16, dur: 0.13, f0: [140 - k * 12, 126 - k * 12], v: "a", gain: 0.85 - k * 0.12 })),
  ]);
// "hoo-hoo-hohh" deep and slow, ending in a gurgle
function laugh3() {
  const out = laugh([
    { at: 0, dur: 0.22, f0: [88, 84], v: "o", opts: { growl: 0.9, fry: 18 } },
    { at: 0.3, dur: 0.22, f0: [86, 80], v: "o", opts: { growl: 0.9, fry: 18 } },
    { at: 0.6, dur: 0.42, f0: [84, 62], v: "u", opts: { growl: 1, fry: 14, breath: 0.6 } },
  ], 0.45);
  const g = gurgle(0.4);
  return mix(out, g, 0.95, 0.6);
}

function gurgle(dur) {
  const out = buf(dur);
  for (let k = 0; k < 9; k++) mix(out, bloop(0.05 + rand() * 0.05, 140 + rand() * 200, 2.2), rand() * (dur - 0.1), 0.6);
  return out;
}

// ------------------------------------------------------------- material kit
/** A single water bloop: a sine that sweeps up fast. */
function bloop(dur, f, rise = 2.5) {
  const out = buf(dur);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const k = t / dur;
    ph += (TAU * f * (1 + (rise - 1) * Math.min(1, k * 1.6))) / SR;
    out[i] = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, k)) ** 0.6 * Math.exp(-k * 3);
  }
  return out;
}

function clinkOne(f) {
  const out = buf(0.35);
  const parts = [[1, 1, 18], [2.32, 0.6, 26], [4.25, 0.35, 34], [6.8, 0.2, 44]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    for (const [r, a, d] of parts) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t * d);
    out[i] = s * Math.min(1, t / 0.0006) + noise() * Math.exp(-t * 900) * 0.5;
  }
  return out;
}

function rustle(dur, { density = 0.02, lo = 1800, hi = 5200, body = 0.1 } = {}) {
  const out = buf(dur);
  const bp = biquad("bp", 2600, 0.8);
  const hp = biquad("hp", lo);
  const lp = biquad("lp", hi);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const sw = Math.sin(Math.PI * clamp01(t / dur));
    out[i] = bp(noise()) * body * sw;
    if (rand() < density * sw) {
      const len = Math.floor(SR * (0.001 + rand() * 0.005));
      const amp = 0.3 + rand() * 0.7;
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += lp(hp(noise())) * amp * (1 - k / len);
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 3);
  return out;
}

function woodKnock(f0 = 120, dur = 0.4, bright = 1) {
  const out = buf(dur);
  const modes = [[f0, 1, 22], [f0 * 2.4, 0.5 * bright, 30], [f0 * 4.1, 0.35 * bright, 45], [f0 * 7.3, 0.15 * bright, 70]];
  const lp = biquad("lp", 2500);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    for (const [f, a, d] of modes) s += Math.sin(TAU * f * t) * a * Math.exp(-t * d);
    out[i] = s * Math.min(1, t / 0.001) + lp(noise()) * Math.exp(-t * 120) * 0.8;
  }
  return out;
}

// ------------------------------------------------------------------ effects
function flap() {
  // a tarp whipped by wind: fluttering low noise with plastic crackle
  const out = buf(0.9);
  const lp = biquad("lp", 700, 1.2);
  const hp = biquad("hp", 2600);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const rate = 14 + 10 * Math.sin(t * 7);
    ph += (TAU * rate) / SR;
    const flutter = 0.35 + 0.65 * Math.abs(Math.sin(ph)) ** 3;
    const env = clamp01(t / 0.04) * Math.exp(-t * 2.6);
    out[i] = (lp(noise()) * 2.2 + (rand() < 0.03 ? hp(noise()) * 2 : hp(noise()) * 0.15)) * flutter * env;
  }
  return out;
}

function squish() {
  const out = buf(0.45);
  const bp = biquad("bp", 1800, 3);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    bp.set(1900 * Math.exp(-t * 6) + 250, 3);
    ph += (TAU * (320 * Math.exp(-t * 5) + 90)) / SR;
    const env = clamp01(t / 0.015) * Math.exp(-t * 7);
    out[i] = (bp(noise()) * 1.6 + Math.sin(ph) * 0.6 * (0.5 + 0.5 * Math.sin(TAU * 34 * t))) * env;
  }
  return mix(out, bloop(0.08, 260, 2), 0.18, 0.4);
}

function slurp() {
  const out = buf(0.95);
  const bp = biquad("bp", 900, 5);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const k = t / 0.95;
    bp.set(700 + 1300 * k + 300 * Math.sin(TAU * 23 * t), 5);
    const gate = 0.3 + 0.7 * (rand() < 0.5 ? 1 : 0.6) * Math.abs(Math.sin(TAU * 17 * t + Math.sin(t * 40)));
    const env = clamp01(t / 0.06) * clamp01((0.95 - t) / 0.2);
    out[i] = bp(noise()) * gate * env * 2.2;
  }
  for (let k = 0; k < 6; k++) mix(out, bloop(0.06, 300 + rand() * 300, 2.5), 0.55 + k * 0.06, 0.35);
  return out;
}

function spin() {
  const out = buf(0.9);
  const bp = biquad("bp", 800, 1.4);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const rot = Math.sin(TAU * (2.2 + t * 2) * t);
    bp.set(900 + 700 * rot, 1.4);
    const env = clamp01(t / 0.08) * clamp01((0.9 - t) / 0.3);
    out[i] = bp(noise()) * (0.55 + 0.45 * rot) * env * 1.8;
  }
  return out;
}

function clink() {
  const out = buf(0.8);
  [[0, 2350], [0.09, 3100], [0.2, 2650], [0.33, 3500]].forEach(([at, f], k) => mix(out, clinkOne(f), at, 1 - k * 0.15));
  return out;
}

function puff() {
  const out = buf(1.1);
  const bp = biquad("bp", 600, 1.2);
  const lp = biquad("lp", 900);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    if (t < 0.45) {
      bp.set(500 + 2200 * (t / 0.45), 1.2); // inflating: rising "fffff"
      out[i] = bp(noise()) * clamp01(t / 0.05) * clamp01((0.47 - t) / 0.05) * 0.9;
    } else {
      const u = t - 0.5; // deflating raspberry
      const buzz = 0.5 + 0.5 * Math.sign(Math.sin(TAU * (48 - 20 * u) * u));
      out[i] = lp(noise()) * buzz * clamp01(u / 0.02) * Math.exp(-u * 3.5) * 2.4;
    }
  }
  return out;
}

function drip() {
  const out = buf(0.9);
  mix(out, bloop(0.07, 700, 2.2), 0.02, 1);
  // splash below: short noise burst plus a few droplets
  const sp = buf(0.35);
  const hp = biquad("hp", 1500);
  for (let i = 0; i < sp.length; i++) {
    const t = i / SR;
    sp[i] = hp(noise()) * Math.exp(-t * 28) * 0.9;
  }
  mix(out, sp, 0.42, 0.9);
  for (let k = 0; k < 4; k++) mix(out, bloop(0.04, 900 + rand() * 900, 1.8), 0.46 + rand() * 0.15, 0.35);
  return out;
}

function stretch() {
  const out = buf(1.05);
  const bp = biquad("bp", 400, 6);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let f, env;
    if (t < 0.55) { // rubbery creak going down
      f = 180 + 260 * (t / 0.55) + 12 * Math.sin(TAU * 7 * t);
      env = clamp01(t / 0.05) * 0.8;
      bp.set(f * 3, 6);
    } else { // springing back: a damped boing
      const u = t - 0.55;
      f = 220 + 160 * Math.exp(-u * 5) * Math.cos(TAU * 9 * u);
      env = Math.exp(-u * 5);
    }
    ph += (TAU * f) / SR;
    const saw = 2 * (ph / TAU - Math.floor(ph / TAU + 0.5));
    out[i] = (Math.sin(ph) * 0.6 + bp(saw + noise() * 0.3) * 1.2) * env;
  }
  return out;
}

function band() {
  // Karplus-Strong twang with a falling pitch, plus a snap
  const out = buf(0.7);
  let period = SR / 150;
  const line = new Float32Array(Math.ceil(SR / 60)).map(() => noise());
  let idx = 0, last = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    period = SR / (150 - 50 * clamp01(t / 0.5));
    const p = Math.floor(period);
    const j = idx % p;
    const v = 0.5 * (line[j] + line[(j + 1) % p]) * 0.994;
    line[j] = v;
    idx++;
    last = v;
    out[i] = last * Math.exp(-t * 3);
  }
  const snap = woodKnock(900, 0.05, 0.3);
  return mix(out, snap, 0, 0.5);
}

function sparkle() {
  const out = buf(1.2);
  for (let k = 0; k < 16; k++) {
    const f = 2000 + rand() * 4200;
    const s = buf(0.4);
    for (let i = 0; i < s.length; i++) {
      const t = i / SR;
      s[i] = (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2.7 * t)) * Math.exp(-t * 12) * Math.min(1, t / 0.001);
    }
    mix(out, s, 0.02 + (k / 16) * 0.7 + rand() * 0.05, 0.35 + rand() * 0.3);
  }
  return out;
}

function bubbles() {
  const out = buf(1.1);
  for (let k = 0; k < 11; k++) mix(out, bloop(0.05 + rand() * 0.06, 220 + rand() * 380, 2 + rand()), rand() * 0.9, 0.5 + rand() * 0.5);
  return out;
}

function thud() {
  return woodKnock(105, 0.45, 1);
}

function pen() {
  // felt marker on paper: rhythmic strokes, 1.8 s so it covers the writing
  const out = buf(1.8);
  const bp = biquad("bp", 3200, 1.1);
  const hp = biquad("hp", 1200);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (7 + 3 * Math.sin(t * 3.1))) / SR;
    const stroke = Math.abs(Math.sin(ph)) ** 0.8 * (0.6 + 0.4 * Math.sin(t * 11));
    const env = clamp01(t / 0.04) * clamp01((1.8 - t) / 0.1);
    out[i] = (bp(noise()) + hp(noise()) * 0.3) * stroke * env;
  }
  return out;
}

function rip() {
  const out = buf(0.6);
  const bp = biquad("bp", 2200, 0.8);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const dens = 0.02 + 0.5 * clamp01(t / 0.4);
    out[i] = bp(noise()) * 0.25 * clamp01((0.55 - t) / 0.1);
    if (rand() < dens * 0.1) {
      const len = Math.floor(SR * (0.0005 + rand() * 0.002));
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += noise() * (0.5 + rand() * 0.5);
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 2.5) * clamp01((0.6 - i / SR) / 0.08);
  return out;
}

function stamp() {
  const out = woodKnock(80, 0.3, 0.4);
  const slap = buf(0.08);
  const bp = biquad("bp", 1400, 0.9);
  for (let i = 0; i < slap.length; i++) slap[i] = bp(noise()) * Math.exp(-(i / SR) * 70) * 2;
  return mix(out, slap, 0, 1);
}

function crumple() {
  return rustle(0.75, { density: 0.03, lo: 900, hi: 6000, body: 0.14 });
}

function toss() {
  const out = buf(0.9);
  const bp = biquad("bp", 700, 1.2);
  for (let i = 0; i < SR * 0.45; i++) {
    const t = i / SR;
    bp.set(500 + 1400 * Math.sin(Math.PI * t / 0.45), 1.2);
    out[i] = bp(noise()) * Math.sin(Math.PI * t / 0.45) ** 2 * 0.8;
  }
  mix(out, woodKnock(160, 0.25, 0.3), 0.5, 0.7);
  mix(out, rustle(0.3, { density: 0.05, body: 0.05 }), 0.5, 0.6); // the woven basket
  return out;
}

function tok() {
  // kentongan: a hollow bamboo slit drum
  const out = buf(0.5);
  const body = biquad("bp", 520, 14);
  const air = biquad("bp", 1250, 9);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const hit = noise() * Math.exp(-t * 300) + (i < 40 ? 1 : 0);
    out[i] = body(hit) * 9 * Math.exp(-t * 9) + air(hit) * 4 * Math.exp(-t * 18) + Math.sin(TAU * 260 * t) * Math.exp(-t * 16) * 0.3;
  }
  return out;
}

function bellRing(f = 2900) {
  // bicycle bell: bright inharmonic partials with the hammer's trill
  const out = buf(0.9);
  const parts = [[1, 1, 3.5], [1.52, 0.6, 5], [2.43, 0.4, 7], [3.9, 0.2, 10]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    for (const [r, a, d] of parts) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t * d);
    const trill = t < 0.35 ? 0.55 + 0.45 * Math.abs(Math.sin(TAU * 22 * t)) : 1;
    out[i] = s * trill * Math.min(1, t / 0.001);
  }
  return out;
}

function mail() {
  const out = buf(0.9);
  mix(out, rustle(0.4, { density: 0.03, lo: 1500, hi: 4500, body: 0.12 }), 0, 0.8);
  const ding = bellRing(3300).subarray(0, Math.floor(0.5 * SR));
  return mix(out, ding, 0.3, 0.35);
}

function unwrap() {
  return rustle(0.6, { density: 0.025, lo: 1400, hi: 4000, body: 0.16 });
}

function flame() {
  // match strike + catching flame
  const out = buf(0.7);
  const hp = biquad("hp", 2000);
  const lp = biquad("lp", 900);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const strike = t < 0.12 ? hp(noise()) * clamp01(t / 0.01) * (1 - t / 0.12) : 0;
    const whoosh = t > 0.08 ? lp(noise()) * Math.sin(Math.PI * clamp01((t - 0.08) / 0.6)) * 1.2 : 0;
    out[i] = strike * 1.3 + whoosh;
  }
  return out;
}

function snuff() {
  const out = buf(0.5);
  const bp = biquad("bp", 900, 0.8);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = bp(noise()) * clamp01(t / 0.02) * Math.exp(-t * 7) * 1.4;
  }
  return out;
}

function click() {
  const out = buf(0.08);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = Math.sin(TAU * 1700 * t) * Math.exp(-t * 90) * 0.6 + noise() * Math.exp(-t * 900) * 0.5;
  }
  return out;
}

// ------------------------------------------------------------------ ambient
const LOOP = 16; // seconds: 8 bars at 120 bpm

function ambient() {
  const out = new Float32Array(LOOP * SR);

  // 1. crowd chatter: a dozen murmuring voices switching vowels
  const crowd = new Float32Array(out.length);
  const vk = Object.keys(VOWELS);
  for (let v = 0; v < 14; v++) {
    const f0base = 95 + rand() * 150;
    let t = rand() * LOOP;
    const end = t + LOOP; // wraps around the loop
    while (t < end) {
      const words = 2 + Math.floor(rand() * 5);
      for (let w = 0; w < words; w++) {
        const d = 0.09 + rand() * 0.16;
        const s = syllable(d, f0base * (1 + rand() * 0.15), f0base * (0.85 + rand() * 0.2), vk[Math.floor(rand() * vk.length)],
          { growl: 0, breath: 0.4, fry: 0.001 });
        mix(crowd, s, t % LOOP, 0.35 + rand() * 0.3, true);
        t += d + 0.02 + rand() * 0.05;
      }
      t += 0.3 + rand() * 1.8; // pause between phrases
    }
  }
  {
    const lp = biquad("lp", 1800);
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < crowd.length; i++) crowd[i] = pass ? lp(crowd[i]) : crowd[i];
  }

  // 2. grill sizzle: hissing noise and fat crackles, slowly breathing
  const sizzle = new Float32Array(out.length);
  {
    const hp = biquad("hp", 3200);
    const lp = biquad("lp", 9000);
    for (let i = 0; i < sizzle.length; i++) {
      const t = i / SR;
      const breathe = 0.6 + 0.4 * Math.sin((TAU * t) / LOOP * 3) * Math.sin((TAU * t) / LOOP);
      sizzle[i] = lp(hp(noise())) * 0.18 * breathe;
      if (rand() < 0.0009) {
        const len = Math.floor(SR * (0.002 + rand() * 0.01));
        const amp = 0.4 + rand() * 0.8;
        for (let k = 0; k < len; k++) sizzle[(i + k) % sizzle.length] += noise() * amp * (1 - k / len);
      }
    }
  }

  // 3. distant dangdut-style groove: kendang "dut" and "tak", bass, a reedy riff
  const band = new Float32Array(out.length);
  const bpm = 120;
  const e = 60 / bpm / 2; // eighth note
  const bars = Math.round(LOOP / (8 * e));
  const dut = (at, f = 150) => {
    const s = buf(0.35);
    let ph = 0;
    for (let i = 0; i < s.length; i++) {
      const t = i / SR;
      ph += (TAU * (f * 0.55 + f * 0.45 * Math.exp(-t * 14))) / SR; // the kendang's pitch drop
      s[i] = Math.sin(ph) * Math.exp(-t * 9);
    }
    mix(band, s, at, 0.9, true);
  };
  const tak = (at) => {
    const s = buf(0.12);
    const bp = biquad("bp", 1100, 2);
    for (let i = 0; i < s.length; i++) {
      const t = i / SR;
      s[i] = bp(noise()) * Math.exp(-t * 45) * 2 + Math.sin(TAU * 420 * t) * Math.exp(-t * 40) * 0.5;
    }
    mix(band, s, at, 0.6, true);
  };
  const tone = (at, dur, f, amp, bright = 0.3) => {
    const s = buf(dur + 0.05);
    let ph = 0;
    for (let i = 0; i < s.length; i++) {
      const t = i / SR;
      ph += (TAU * f * (1 + (t > 0.1 ? 0.01 * Math.sin(TAU * 5.5 * t) : 0))) / SR;
      const v = Math.sin(ph) + bright * Math.sin(2 * ph) + bright * 0.6 * Math.sin(3 * ph);
      s[i] = v * clamp01(t / 0.02) * clamp01((dur - t) / 0.04);
    }
    mix(band, s, at, amp, true);
  };
  const chords = [[45, 57, 60, 64], [50, 57, 62, 65], [52, 56, 59, 64], [45, 57, 60, 64]]; // Am Dm E Am
  const riff = [69, 71, 72, 71, 69, 67, 69, 64];
  for (let bar = 0; bar < bars; bar++) {
    const b0 = bar * 8 * e;
    // tak . dut tak . dut dut .   (a loose dangdut kendang pattern)
    tak(b0); dut(b0 + 2 * e); tak(b0 + 3 * e); dut(b0 + 5 * e, 170); dut(b0 + 6 * e);
    const c = chords[bar % 4];
    for (let s = 0; s < 8; s += 2) tone(b0 + s * e, e * 1.6, midi(c[0] - 12 + (s % 4 ? 7 : 0)), 0.5, 0.15);
    if (bar % 2 === 0) riff.forEach((n, s) => tone(b0 + s * e, e * 0.9, midi(n), 0.16, 0.5));
  }
  {
    // far away: dull, roomy
    const lp = biquad("lp", 1100);
    for (let i = 0; i < band.length; i++) band[i] = lp(band[i]);
    const d = Math.floor(0.11 * SR);
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < band.length; i++) band[i] += band[(i - d + band.length) % band.length] * 0.35;
  }

  // 4. a bicycle bell passing by, twice per loop
  const bells = new Float32Array(out.length);
  mix(bells, bellRing(2800), 5.2, 0.5, true);
  mix(bells, bellRing(2800), 5.45, 0.45, true);
  mix(bells, bellRing(3050), 13.1, 0.35, true);

  const norm = (a) => {
    let m = 0;
    for (const v of a) m = Math.max(m, Math.abs(v));
    return (x) => x / (m || 1);
  };
  const nc = norm(crowd), ns = norm(sizzle), nb = norm(band), nbe = norm(bells);
  for (let i = 0; i < out.length; i++) {
    out[i] = nc(crowd[i]) * 0.55 + ns(sizzle[i]) * 0.22 + nb(band[i]) * 0.42 + nbe(bells[i]) * 0.3;
  }
  return out;
}

// ------------------------------------------------------------------ output
function normalize(a, peak = 0.89) {
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < a.length; i++) a[i] = (a[i] / m) * peak;
  return a;
}

function toMp3(samples, file, kbps, rate = SR) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(SR), "-ac", "1", "-i", "pipe:0",
    "-ar", String(rate), "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, file], { input: pcm, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
}

const effects = {
  laugh1: [laugh1(), 1],
  laugh2: [laugh2(), 1],
  laugh3: [laugh3(), 1],
  flap: [flap(), 0.8],
  squish: [squish(), 0.8],
  slurp: [slurp(), 0.75],
  spin: [spin(), 0.7],
  clink: [clink(), 0.6],
  puff: [puff(), 0.75],
  drip: [drip(), 0.75],
  stretch: [stretch(), 0.7],
  band: [band(), 0.8],
  sparkle: [sparkle(), 0.55],
  bubbles: [bubbles(), 0.7],
  thud: [thud(), 1],
  pen: [pen(), 0.45],
  rip: [rip(), 0.8],
  stamp: [stamp(), 0.9],
  crumple: [crumple(), 0.8],
  toss: [toss(), 0.8],
  tok: [tok(), 0.9],
  mail: [mail(), 0.7],
  unwrap: [unwrap(), 0.7],
  flame: [flame(), 0.6],
  snuff: [snuff(), 0.6],
  click: [click(), 0.5],
};

// Each slot: 60 ms of silence, the sound, then a gap. The sprite starts
// 30 ms into the silence so encoder delay never clips the attack.
const PAD = 0.06, GAP = 0.15, LEAD = 0.03;
let cursor = 0;
const sprite = {};
const parts = [];
for (const [name, [s, gain]] of Object.entries(effects)) {
  normalize(s, 0.89 * gain);
  const slot = new Float32Array(Math.ceil((PAD + s.length / SR + GAP) * SR));
  slot.set(s, Math.floor(PAD * SR));
  sprite[name] = [Math.round((cursor + PAD - LEAD) * 1000), Math.round((s.length / SR + LEAD) * 1000)];
  cursor += slot.length / SR;
  parts.push(slot);
}
const all = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
let o = 0;
for (const p of parts) { all.set(p, o); o += p.length; }

const loop = normalize(ambient(), 0.8);
const twice = new Float32Array(loop.length * 2);
twice.set(loop, 0);
twice.set(loop, loop.length);

mkdirSync(join(ROOT, "public", "audio"), { recursive: true });
toMp3(all, join(ROOT, "public", "audio", "sfx.mp3"), 80);
toMp3(twice, join(ROOT, "public", "audio", "ambient.mp3"), 48, 32000);

const ts = `// Generated by scripts/audio/build-audio.mjs. Do not edit by hand.
export const SFX_SPRITE = ${JSON.stringify(sprite, null, 2)} as const;
export type SfxName = keyof typeof SFX_SPRITE;
/** Loop region inside ambient.mp3: [start ms, duration ms, loop]. */
export const AMBIENT_LOOP: [number, number, boolean] = [${Math.round((LOOP / 2) * 1000)}, ${LOOP * 1000}, true];
`;
writeFileSync(join(ROOT, "lib", "audioSprite.generated.ts"), ts);
console.log("sfx:", Object.keys(sprite).length, "sounds,", cursor.toFixed(1), "s; ambient loop", LOOP, "s");
