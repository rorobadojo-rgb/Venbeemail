// Synthesises every Zombie Mart sound from scratch (no samples, no licensing)
// and encodes it with ffmpeg (libmp3lame):
//
//   public/audio/sfx.mp3        one Howler sprite with every effect
//   public/audio/ambience.mp3   fluorescent hum + fridge buzz + faint in-store
//                               music. Written twice, so the loop region sits
//                               in the middle and is seamless whatever encoder
//                               delay the browser applies
//   lib/audioSprite.generated.ts
//
// All effects are loudness-matched (gated RMS with a rough K-weighting), so
// the whole "supermarket-zombie" kit plays at equal loudness.
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
let seed = 0x2b0b;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** RBJ biquad; returns a stateful per-sample filter with .set(freq, q). */
function biquad(type, freq, q = 0.707, gainDb = 0) {
  let b0, b1, b2, a1, a2;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (fr, qq = q) => {
    const w = (TAU * Math.min(Math.max(fr, 10), SR * 0.45)) / SR;
    const al = Math.sin(w) / (2 * qq);
    const c = Math.cos(w);
    const A = 10 ** (gainDb / 40);
    let a0;
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === "bp") { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else { // high shelf
      const s = 2 * Math.sqrt(A) * al;
      b0 = A * ((A + 1) + (A - 1) * c + s); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - s);
      a0 = (A + 1) - (A - 1) * c + s; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - s;
    }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
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

const env = (t, a, d) => clamp01(t / a) * Math.exp(-Math.max(0, t - a) * d);
function mixInto(out, src, at, gain = 1) {
  const o = Math.floor(at * SR);
  for (let i = 0; i < src.length && o + i < out.length; i++) if (o + i >= 0) out[o + i] += src[i] * gain;
}
function concat(...parts) {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Float32Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
/** Small room: a few feedback combs + allpass, mixed in at `wet`. */
function room(x, wet = 0.18, size = 1) {
  const out = new Float32Array(x.length + Math.floor(0.35 * SR));
  out.set(x);
  const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: Math.floor(d * size), buf: new Float32Array(Math.floor(d * size)), i: 0, lp: 0 }));
  for (let n = 0; n < out.length; n++) {
    const inp = n < x.length ? x[n] : 0;
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.6 + c.lp * 0.4;
      c.buf[c.i] = inp + c.lp * 0.72;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    out[n] += (s / combs.length) * wet;
  }
  return out;
}

// ------------------------------------------------------- shared shop kit
/** Barcode scanner: bright square-ish beep. */
function beep(freq = 2380, dur = 0.13) {
  const out = buf(dur + 0.02);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const e = clamp01(t / 0.004) * clamp01((dur - t) / 0.01);
    const s = Math.sin(TAU * freq * t) + 0.25 * Math.sin(TAU * freq * 3 * t) + 0.1 * Math.sin(TAU * freq * 5 * t);
    out[i] = s * e * 0.6;
  }
  return out;
}

/** Metallic partial bank ring (cans, coins, chains, bins). */
function metal(out, at, { base = 900, ratios = [1, 2.32, 3.87, 5.1, 7.3], decay = 18, amp = 1, bright = 1 }) {
  const o = Math.floor(at * SR);
  const n = Math.floor((6 / decay) * SR);
  for (const [j, r] of ratios.entries()) {
    const fr = base * r * (1 + (rand() - 0.5) * 0.02);
    const a = amp * (j === 0 ? 1 : 0.6 * bright / (j * 0.8 + 0.5));
    const d = decay * (1 + j * 0.35);
    const ph = rand() * TAU;
    for (let k = 0; k < n && o + k < out.length; k++) out[o + k] += Math.sin(ph + (TAU * fr * k) / SR) * a * Math.exp((-k / SR) * d);
  }
  // strike transient
  const hp = biquad("hp", 3000);
  for (let k = 0; k < 0.004 * SR && o + k < out.length; k++) out[o + k] += hp(noise()) * amp * 0.8 * (1 - k / (0.004 * SR));
}

function canCrush() {
  const out = buf(0.55);
  const bp = biquad("bp", 1800, 1.2);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    // crumpling aluminium: dense crackle whose pitch drops as it flattens
    bp.set(2600 - 1800 * clamp01(t / 0.35), 1.4);
    const dens = t < 0.32 ? 0.05 : 0.004;
    if (rand() < dens) {
      const len = Math.floor(SR * (0.0008 + rand() * 0.003));
      const a = 0.5 + rand();
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += noise() * a * (1 - k / len);
    }
    out[i] = bp(out[i]) * 2.2 + out[i] * 0.25;
  }
  metal(out, 0.0, { base: 620, decay: 22, amp: 0.5 });
  metal(out, 0.16, { base: 540, decay: 26, amp: 0.35 });
  metal(out, 0.3, { base: 470, decay: 30, amp: 0.45 });
  // the "pop back"
  metal(out, 0.44, { base: 880, decay: 40, amp: 0.3 });
  return out;
}

function bagRustle(dur = 0.4) {
  const out = buf(dur);
  const hp = biquad("hp", 1500);
  const bp = biquad("bp", 4200, 0.8);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const sw = Math.sin(Math.PI * clamp01(t / dur)) ** 0.8;
    out[i] += bp(noise()) * 0.25 * sw;
    if (rand() < 0.012 * sw) {
      const len = Math.floor(SR * (0.001 + rand() * 0.008));
      const a = 0.4 + rand() * 0.8;
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += hp(noise()) * a * (1 - k / len) * sw;
    }
  }
  return out;
}

function slurp() {
  const out = buf(0.6);
  const f1 = biquad("bp", 600, 6);
  const f2 = biquad("bp", 1500, 6);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    // a sucking formant sweep with gurgles
    const sweep = 300 + 1500 * clamp01(t / 0.45) ** 1.5;
    f1.set(sweep, 5);
    f2.set(sweep * 2.3, 6);
    const gurgle = 0.6 + 0.4 * Math.sin(TAU * (18 + 10 * t) * t);
    const e = clamp01(t / 0.04) * clamp01((0.55 - t) / 0.1);
    const n = noise();
    out[i] = (f1(n) * 1.8 + f2(n) * 1.1) * e * gurgle;
  }
  // bubbles
  for (let b = 0; b < 7; b++) bubble(out, 0.05 + rand() * 0.45, 300 + rand() * 500, 0.35);
  return out;
}

function bubble(out, at, f0, amp) {
  const o = Math.floor(at * SR);
  const n = Math.floor(0.05 * SR);
  let ph = 0;
  for (let k = 0; k < n && o + k < out.length; k++) {
    const t = k / SR;
    ph += (TAU * f0 * (1 + t * 30)) / SR;
    out[o + k] += Math.sin(ph) * Math.exp(-t * 70) * amp;
  }
}

// ------------------------------------------------------- domain effects
function fizz() {
  const out = buf(0.9);
  const hp = biquad("hp", 5000);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = hp(noise()) * 0.35 * env(t, 0.02, 3.2);
  }
  for (let b = 0; b < 40; b++) {
    const at = rand() ** 1.6 * 0.8;
    bubble(out, at, 1200 + rand() * 2500, 0.25 * (1 - at));
  }
  return out;
}

function bite() {
  const out = buf(0.45);
  const lp = biquad("lp", 900);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (130 * Math.exp(-t * 8) + 60)) / SR;
    out[i] = Math.sin(ph) * env(t, 0.003, 18) * 0.9 + lp(noise()) * env(t, 0.002, 30) * 1.4;
  }
  // crunchy grains after the chomp
  const bp = biquad("bp", 2400, 1);
  for (let g = 0; g < 26; g++) {
    const at = 0.02 + rand() * 0.28;
    const len = Math.floor(SR * (0.002 + rand() * 0.006));
    const o = Math.floor(at * SR);
    const a = 0.4 + rand() * 0.8;
    for (let k = 0; k < len && o + k < out.length; k++) out[o + k] += bp(noise()) * a * (1 - k / len) * 2;
  }
  return out;
}

function freeze() {
  const out = buf(1.0);
  // icy shimmer rising, then the frost cracks off
  for (let v = 0; v < 6; v++) {
    const f0 = 2200 + v * 530;
    for (let i = 0; i < 0.6 * SR; i++) {
      const t = i / SR;
      const f = f0 * (1 + t * 0.6);
      out[i] += Math.sin(TAU * f * t + v) * 0.08 * clamp01(t / 0.15) * clamp01((0.6 - t) / 0.2) * (0.5 + 0.5 * Math.sin(TAU * (7 + v) * t));
    }
  }
  const hp = biquad("hp", 2500);
  for (let c = 0; c < 9; c++) {
    const at = 0.58 + c * 0.03 + rand() * 0.02;
    const o = Math.floor(at * SR);
    const len = Math.floor(0.012 * SR);
    for (let k = 0; k < len && o + k < out.length; k++) out[o + k] += hp(noise()) * (1.2 - c * 0.1) * Math.exp(-k / (0.003 * SR));
  }
  metal(out, 0.6, { base: 3100, decay: 40, amp: 0.2 });
  return out;
}

function priceGun() {
  const out = buf(0.3);
  const click = (at, f, a) => {
    const o = Math.floor(at * SR);
    const hp = biquad("hp", 1200);
    for (let k = 0; k < 0.03 * SR && o + k < out.length; k++) {
      const t = k / SR;
      out[o + k] += (hp(noise()) * Math.exp(-t * 400) + Math.sin(TAU * f * t) * Math.exp(-t * 120) * 0.6) * a;
    }
  };
  click(0, 1800, 1);
  click(0.07, 1300, 0.8);
  // the spring
  for (let i = 0.07 * SR; i < out.length; i++) {
    const t = i / SR - 0.07;
    out[Math.floor(i)] += Math.sin(TAU * (520 + 60 * Math.sin(TAU * 30 * t)) * t) * Math.exp(-t * 22) * 0.25;
  }
  return out;
}

function bagPop() {
  const infl = bagRustle(0.35);
  const out = buf(0.75);
  mixInto(out, infl, 0, 0.6);
  // air filling it: rising filtered noise
  const bp = biquad("bp", 400, 2);
  for (let i = 0; i < 0.4 * SR; i++) {
    const t = i / SR;
    bp.set(300 + 900 * (t / 0.4), 2);
    out[i] += bp(noise()) * 0.6 * clamp01(t / 0.35);
  }
  // POP
  const o = Math.floor(0.42 * SR);
  const lp = biquad("lp", 3000);
  let ph = 0;
  for (let k = 0; o + k < out.length; k++) {
    const t = k / SR;
    ph += (TAU * (90 + 200 * Math.exp(-t * 60))) / SR;
    out[o + k] += Math.tanh((lp(noise()) * Math.exp(-t * 45) * 3 + Math.sin(ph) * Math.exp(-t * 16) * 1.5) * 1.5);
  }
  return out;
}

function spill() {
  const out = buf(1.0);
  // glug glug
  for (let g = 0; g < 4; g++) {
    const at = g * 0.13;
    const o = Math.floor(at * SR);
    const f1 = biquad("bp", 300, 5);
    for (let k = 0; k < 0.12 * SR; k++) {
      const t = k / SR;
      f1.set(250 + 500 * (t / 0.12), 5);
      out[o + k] += f1(noise()) * Math.sin(Math.PI * t / 0.12) * 2.2;
    }
    bubble(out, at + 0.05, 180 + g * 40, 0.5);
  }
  // splat
  const lp = biquad("lp", 1400);
  const o = Math.floor(0.56 * SR);
  for (let k = 0; o + k < out.length; k++) {
    const t = k / SR;
    out[o + k] += lp(noise()) * env(t, 0.004, 9) * 1.3;
  }
  for (let b = 0; b < 8; b++) bubble(out, 0.6 + rand() * 0.3, 400 + rand() * 600, 0.2);
  return out;
}

function jelly() {
  const out = buf(0.8);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    // "bwoing": pitch wobbles like gelatine
    const f = 170 + 70 * Math.sin(TAU * 9 * t) * Math.exp(-t * 3.5) + 40 * Math.exp(-t * 10);
    ph += (TAU * f) / SR;
    const s = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph);
    out[i] = s * env(t, 0.01, 4) * 0.8;
  }
  const lp = biquad("lp", 1200);
  for (let i = 0; i < out.length; i++) out[i] = lp(out[i]) * 1.4;
  return out;
}

function coins() {
  const out = buf(1.0);
  const hits = [0, 0.09, 0.16, 0.21, 0.3, 0.36, 0.45, 0.5, 0.58, 0.64];
  hits.forEach((at, i) => metal(out, at + rand() * 0.02, { base: 2600 + rand() * 900, ratios: [1, 1.52, 2.7, 3.9], decay: 14 + i * 2, amp: 0.55 - i * 0.03 }));
  return out;
}

// ------------------------------------------------------- register actions
function printer() {
  const out = buf(1.0);
  const bp = biquad("bp", 2200, 1.5);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    // thermal printer: fast stepper buzz in lines, paper feed rustle
    const line = Math.floor(t / 0.11);
    const inLine = (t % 0.11) / 0.11;
    const on = inLine < 0.75 && t < 0.9 ? 1 : 0.1;
    const step = Math.sin(TAU * (380 + (line % 3) * 30) * t) > 0.2 ? 1 : 0;
    out[i] = (bp(noise()) * 0.5 + (step - 0.5) * 0.35) * on * clamp01((0.95 - t) / 0.05);
  }
  const lp = biquad("lp", 800);
  for (let i = 0; i < out.length; i++) out[i] = out[i] * 0.7 + lp(out[i]) * 0.6;
  return out;
}

function tear() {
  const out = buf(0.4);
  const hp = biquad("hp", 1200);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const d = 0.02 + 0.08 * clamp01(t / 0.25);
    if (t < 0.3 && rand() < d) {
      const len = Math.floor(SR * (0.0005 + rand() * 0.002));
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += noise() * (0.6 + rand() * 0.6);
    }
    out[i] = hp(out[i]);
  }
  return out;
}

function stamp() {
  const out = buf(0.35);
  let ph = 0;
  const lp = biquad("lp", 2000);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (70 + 90 * Math.exp(-t * 40))) / SR;
    out[i] = Math.sin(ph) * env(t, 0.002, 14) * 1.2 + lp(noise()) * env(t, 0.001, 50) * 1.2;
  }
  return out;
}

function drawer() {
  const out = buf(1.2);
  // slide out (rumble)
  const bp = biquad("bp", 300, 1.5);
  for (let i = 0; i < 0.3 * SR; i++) {
    const t = i / SR;
    out[i] += bp(noise()) * Math.sin(Math.PI * t / 0.3) * 1.5;
  }
  metal(out, 0.3, { base: 380, decay: 25, amp: 0.4 });
  // ka-ching bell
  const bell = (at, f0, a) => {
    const o = Math.floor(at * SR);
    for (const [r, g, d] of [[1, 1, 3.5], [2.76, 0.5, 6], [5.4, 0.25, 9], [8.9, 0.1, 14]]) {
      for (let k = 0; o + k < out.length; k++) out[o + k] += Math.sin((TAU * f0 * r * k) / SR) * g * a * Math.exp((-k / SR) * d);
    }
  };
  bell(0.34, 2093, 0.45);
  bell(0.42, 2637, 0.35);
  // slam shut
  const o = Math.floor(0.78 * SR);
  bp.set(220, 1.5);
  for (let k = 0; k < 0.2 * SR; k++) out[o + k] += bp(noise()) * Math.sin(Math.PI * k / (0.2 * SR)) * 1.2;
  metal(out, 0.98, { base: 300, decay: 30, amp: 0.7 });
  return out;
}

function crumple() {
  const out = buf(0.7);
  const hp = biquad("hp", 900);
  const bp = biquad("bp", 3000, 0.7);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const density = 0.004 + 0.02 * Math.sin(Math.PI * clamp01(t / 0.6));
    out[i] += bp(noise()) * 0.12 * Math.sin(Math.PI * clamp01(t / 0.65));
    if (rand() < density) {
      const len = Math.floor(SR * (0.001 + rand() * 0.006));
      const amp = 0.3 + rand() * 0.8;
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += hp(noise()) * amp * (1 - k / len);
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 3);
  return out;
}

function bin() {
  const out = buf(0.8);
  // paper ball lands, then the lid clangs
  const lp = biquad("lp", 600);
  for (let i = 0; i < 0.08 * SR; i++) out[i] += lp(noise()) * env(i / SR, 0.002, 40) * 1.2;
  metal(out, 0.12, { base: 210, ratios: [1, 2.1, 3.3, 4.6, 6.2], decay: 7, amp: 0.8, bright: 1.2 });
  metal(out, 0.3, { base: 225, ratios: [1, 2.1, 3.3, 4.6], decay: 12, amp: 0.35 });
  return out;
}

function flip() {
  const out = buf(0.45);
  const bp = biquad("bp", 1200, 0.9);
  const hp = biquad("hp", 2500);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    bp.set(900 + 4200 * clamp01(t / 0.25));
    const swell = Math.sin(Math.PI * clamp01(t / 0.32)) ** 1.6;
    out[i] = bp(noise()) * swell * 1.4 + (t > 0.24 && t < 0.36 && rand() < 0.02 ? hp(noise()) * 1.5 : hp(noise()) * 0.05 * swell);
  }
  return out;
}

function vending() {
  const out = buf(1.3);
  // spiral motor whirr
  let ph = 0;
  for (let i = 0; i < 0.75 * SR; i++) {
    const t = i / SR;
    ph += (TAU * (110 + 25 * Math.sin(TAU * 3 * t))) / SR;
    const saw = ((ph / TAU) % 1) * 2 - 1;
    out[i] += saw * 0.3 * clamp01(t / 0.05) * clamp01((0.75 - t) / 0.05) + noise() * 0.04;
  }
  const lp = biquad("lp", 900);
  for (let i = 0; i < out.length; i++) out[i] = lp(out[i]) * 1.6;
  // clunk into the tray + little rattle
  const o = Math.floor(0.86 * SR);
  let p2 = 0;
  for (let k = 0; o + k < out.length; k++) {
    const t = k / SR;
    p2 += (TAU * (80 + 70 * Math.exp(-t * 30))) / SR;
    out[o + k] += Math.sin(p2) * env(t, 0.002, 12) * 1.1;
  }
  metal(out, 0.87, { base: 480, decay: 20, amp: 0.4 });
  metal(out, 0.98, { base: 520, decay: 35, amp: 0.2 });
  return out;
}

// ------------------------------------------------------- logo sign
/** Formant voice: syllables of { dur, f0 [start,end], vowel, h, growl, breath, amp }. */
const VOWELS = {
  a: [[730, 1, 90], [1090, 0.5, 110], [2440, 0.25, 160]],
  o: [[500, 1, 80], [850, 0.55, 90], [2450, 0.2, 150]],
  e: [[530, 1, 80], [1840, 0.45, 120], [2480, 0.25, 160]],
  u: [[380, 1, 70], [950, 0.4, 90], [2300, 0.15, 150]],
};
function voice(sylls, { jitter = 0.03 } = {}) {
  const total = sylls.reduce((a, s) => a + s.dur + (s.gap ?? 0), 0) + 0.1;
  const out = buf(total);
  let at = 0;
  for (const s of sylls) {
    const o = Math.floor(at * SR);
    const n = Math.floor(s.dur * SR);
    const fs = VOWELS[s.vowel].map(([fr, g, bw]) => ({ f: biquad("bp", fr, fr / bw), g }));
    let ph = 0;
    let jit = 0;
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      const u = t / s.dur;
      if (k % 400 === 0) jit = (rand() - 0.5) * jitter;
      const f0 = (s.f0[0] + (s.f0[1] - s.f0[0]) * u) * (1 + jit);
      ph += f0 / SR;
      // glottal-ish pulse: sharp saw, softened
      let src = (ph % 1) * 2 - 1;
      src = src - 0.6 * Math.sign(src) * src * src;
      // growl: period-doubling amplitude modulation + rolling roughness
      const g = s.growl ?? 0;
      src *= 1 - g * 0.5 * (1 + Math.sin(Math.PI * ph)) + g * 0.3 * Math.sin(TAU * 27 * t);
      const hPart = s.h ? clamp01(1 - t / s.h) : 0; // aspirated onset
      const voiced = clamp01((t - (s.h ?? 0) * 0.6) / 0.02);
      const breath = (s.breath ?? 0.15) + hPart;
      const exc = src * voiced * (1 - hPart * 0.8) + noise() * breath;
      let y = 0;
      for (const fl of fs) y += fl.f(exc) * fl.g;
      const e = clamp01(t / 0.015) * clamp01((s.dur - t) / (s.release ?? 0.06));
      out[o + k] += y * e * (s.amp ?? 1);
    }
    at += s.dur + (s.gap ?? 0);
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 2.4);
  return room(out, 0.22, 1.1);
}

const laughs = [
  // deep, slow "HOH. HOH. HOHHH"
  () => voice([
    { dur: 0.26, f0: [98, 86], vowel: "o", h: 0.07, growl: 0.55, gap: 0.08 },
    { dur: 0.24, f0: [94, 82], vowel: "o", h: 0.07, growl: 0.6, gap: 0.08 },
    { dur: 0.5, f0: [92, 62], vowel: "o", h: 0.08, growl: 0.8, release: 0.25 },
  ]),
  // wheezy, fast "heh-heh-heh-heh-hehh"
  () => voice([
    ...[0, 1, 2, 3, 4].map((i) => ({ dur: 0.12, f0: [150 + i * 8, 138 + i * 8], vowel: "e", h: 0.05, growl: 0.25, breath: 0.45, gap: 0.045 })),
    { dur: 0.34, f0: [176, 120], vowel: "e", h: 0.06, growl: 0.35, breath: 0.5, release: 0.2 },
  ], { jitter: 0.05 }),
  // growl into "HA-HA-HAAAA"
  () => voice([
    { dur: 0.45, f0: [62, 70], vowel: "u", growl: 1, breath: 0.35, gap: 0.05 },
    { dur: 0.16, f0: [128, 118], vowel: "a", h: 0.05, growl: 0.4, gap: 0.05 },
    { dur: 0.16, f0: [124, 112], vowel: "a", h: 0.05, growl: 0.45, gap: 0.05 },
    { dur: 0.55, f0: [132, 72], vowel: "a", h: 0.06, growl: 0.7, release: 0.3 },
  ]),
];

function chain() {
  const out = buf(0.9);
  // links knocking as the sign swings: clusters that thin out
  for (let i = 0; i < 34; i++) {
    const at = rand() ** 1.5 * 0.7;
    metal(out, at, { base: 2400 + rand() * 2200, ratios: [1, 1.8, 2.9, 4.4], decay: 45 + rand() * 30, amp: (0.2 + rand() * 0.35) * (1 - at) });
  }
  return out;
}

function splash() {
  const out = buf(0.55);
  const lp = biquad("lp", 1800);
  const bp = biquad("bp", 700, 3);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const n = noise();
    out[i] = lp(n) * env(t, 0.004, 10) * 1.1 + bp(n) * env(t, 0.01, 6) * 1.6;
  }
  for (let b = 0; b < 12; b++) bubble(out, 0.02 + rand() * 0.4, 250 + rand() * 900, 0.3);
  return out;
}

function tubeBuzz(out, at, dur, amp) {
  const o = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  for (let k = 0; k < n && o + k < out.length; k++) {
    const t = k / SR;
    let s = 0;
    for (let h = 1; h <= 9; h++) s += Math.sin(TAU * 100 * h * t) * (h % 2 ? 1 : 0.5) / h;
    out[o + k] += (s * 0.8 + noise() * 0.12) * amp * clamp01(t / 0.003) * clamp01((dur - t) / 0.004);
  }
}
function flicker() {
  const out = buf(0.9);
  const pattern = [[0, 0.04], [0.11, 0.02], [0.2, 0.05], [0.34, 0.015], [0.42, 0.4]];
  for (const [at, d] of pattern) {
    tubeBuzz(out, at, d, 0.6);
    metal(out, at, { base: 5200, ratios: [1, 1.7], decay: 90, amp: 0.25 }); // the starter "tink"
  }
  return out;
}

function neon() {
  const out = buf(0.22);
  tubeBuzz(out, 0, 0.2, 0.5);
  return out;
}

// ------------------------------------------------------- misc
function boxSlide() {
  const out = buf(0.7);
  const bp = biquad("bp", 500, 1.2);
  for (let i = 0; i < 0.45 * SR; i++) {
    const t = i / SR;
    out[i] += bp(noise()) * Math.sin(Math.PI * t / 0.45) * (0.8 + 0.4 * Math.sin(TAU * 40 * t)) * 1.4;
  }
  const lp = biquad("lp", 500);
  const o = Math.floor(0.45 * SR);
  for (let k = 0; o + k < out.length; k++) out[o + k] += lp(noise()) * env(k / SR, 0.003, 22) * 2;
  return out;
}

function lid() {
  const out = buf(0.4);
  const bp = biquad("bp", 900, 1);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = bp(noise()) * Math.sin(Math.PI * clamp01(t / 0.18)) * 1.2 + (t > 0.17 ? noise() * env(t - 0.17, 0.002, 60) * 0.8 : 0);
  }
  return out;
}

function lightSwitch() {
  const out = buf(0.25);
  const hp = biquad("hp", 1000);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = hp(noise()) * env(t, 0.001, 200) * 1.2 + Math.sin(TAU * 150 * t) * env(t, 0.002, 40) * 0.8;
  }
  return out;
}

/** Convenience-store door chime for new mail. */
function chime() {
  const out = buf(1.4);
  const note = (at, f0, a) => {
    const o = Math.floor(at * SR);
    for (const [r, g, d] of [[1, 1, 2.6], [2, 0.3, 4], [3, 0.12, 6]]) {
      for (let k = 0; o + k < out.length; k++) out[o + k] += Math.sin((TAU * f0 * r * k) / SR) * g * a * clamp01(k / 80) * Math.exp((-k / SR) * d);
    }
  };
  note(0, midi(76), 0.6);
  note(0.28, midi(72), 0.6);
  return out;
}

function slap() {
  const out = buf(0.2);
  const bp = biquad("bp", 1400, 0.8);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = bp(noise()) * env(t, 0.001, 45) * 2 + Math.sin(TAU * 180 * t) * env(t, 0.001, 50) * 0.5;
  }
  return out;
}

function nope() {
  const out = buf(0.35);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const sq = Math.sign(Math.sin(TAU * 140 * t)) * 0.5 + Math.sin(TAU * 140 * 2.01 * t) * 0.2;
    out[i] = sq * clamp01(t / 0.01) * clamp01((0.3 - t) / 0.04) * (t > 0.13 && t < 0.17 ? 0 : 1);
  }
  const lp = biquad("lp", 1500);
  for (let i = 0; i < out.length; i++) out[i] = lp(out[i]);
  return out;
}

// ------------------------------------------------------------ ambience
function ambience() {
  const bpm = 92;
  const beat = 60 / bpm;
  const bars = 8;
  const L = Math.round(bars * 4 * beat * SR);
  const X = Math.floor(0.5 * SR);
  const hum = new Float32Array(L + X);
  const music = new Float32Array(L);

  // fluorescent hum (100 Hz mains family) with a slow shimmer, fridge compressor rumble
  const lpF = biquad("lp", 180);
  const bpB = biquad("bp", 3800, 3);
  for (let i = 0; i < hum.length; i++) {
    const t = i / SR;
    let s = 0;
    for (let h = 1; h <= 12; h++) s += Math.sin(TAU * 100 * h * t + h) * (h === 1 ? 0.5 : h % 2 ? 0.22 / h : 0.3 / h);
    s *= 0.8 + 0.2 * Math.sin(TAU * 0.3 * t);
    const buzz = bpB(noise()) * 0.05 * (0.6 + 0.4 * Math.sin(TAU * 100 * t));
    const fridge = lpF(noise()) * 0.9 + Math.sin(TAU * 50 * t) * 0.18 + Math.sin(TAU * 150 * t + 1) * 0.05;
    hum[i] = s * 0.3 + buzz + fridge * 0.5;
  }
  // seamless: crossfade the overshoot back over the head (equal power)
  const humLoop = new Float32Array(L);
  for (let i = 0; i < L; i++) {
    if (i < X) {
      const a = i / X;
      humLoop[i] = hum[i] * Math.sin((a * Math.PI) / 2) + hum[L + i] * Math.cos((a * Math.PI) / 2);
    } else humLoop[i] = hum[i];
  }

  // in-store muzak: soft FM electric piano, bass, shaker, vibraphone melody
  const wrapAdd = (at, arr) => {
    const o = Math.floor(at * SR);
    for (let k = 0; k < arr.length; k++) music[(o + k) % L] += arr[k];
  };
  const ep = (f, dur, amp) => {
    const n = Math.floor((dur + 0.6) * SR);
    const a = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      const idx = 1.4 * Math.exp(-t * 4);
      const mod = Math.sin(TAU * f * t) * idx;
      const tine = Math.sin(TAU * f * 7 * t) * 0.08 * Math.exp(-t * 18);
      const e = clamp01(t / 0.004) * Math.exp(-t * 1.6) * (t < dur ? 1 : Math.exp(-(t - dur) * 10));
      a[k] = (Math.sin(TAU * f * t + mod) + tine) * e * amp;
    }
    return a;
  };
  const bass = (f, dur, amp) => {
    const n = Math.floor((dur + 0.05) * SR);
    const a = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      a[k] = (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * 2 * f * t)) * clamp01(t / 0.01) * Math.exp(-t * 2.5) * clamp01((dur + 0.05 - t) / 0.05) * amp;
    }
    return a;
  };
  const vib = (f, dur, amp) => {
    const n = Math.floor((dur + 0.8) * SR);
    const a = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      a[k] = (Math.sin(TAU * f * t) + 0.12 * Math.sin(TAU * 4 * f * t) * Math.exp(-t * 8)) * clamp01(t / 0.003) * Math.exp(-t * 2.2) * (1 + 0.25 * Math.sin(TAU * 5.5 * t)) * amp;
    }
    return a;
  };
  const shaker = (amp) => {
    const n = Math.floor(0.06 * SR);
    const a = new Float32Array(n);
    const hp = biquad("hp", 6000);
    for (let k = 0; k < n; k++) a[k] = hp(noise()) * Math.sin(Math.PI * k / n) * amp;
    return a;
  };
  // Fmaj7 - Dm9 - Gm7 - C9, twice
  const chords = [
    { v: [53, 57, 60, 64], b: 41 }, { v: [50, 53, 57, 60, 64], b: 38 },
    { v: [55, 58, 62, 65], b: 43 }, { v: [52, 58, 62, 64], b: 36 },
  ];
  const mel = [[72, 0, 1.5], [69, 1.5, 0.5], [67, 2, 2], [65, 4, 1], [67, 5, 1], [69, 6, 2],
    [70, 8, 1.5], [69, 9.5, 0.5], [67, 10, 2], [64, 12, 3], [65, 15, 1]];
  for (let bar = 0; bar < bars; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    // bossa comping: hits on 1, 2&, 4
    for (const [off, len] of [[0, 1.2], [1.5, 0.8], [3, 0.8]]) c.v.forEach((n) => wrapAdd(t0 + off * beat, ep(midi(n), len * beat, 0.05)));
    for (const [off, n] of [[0, c.b], [1.5, c.b + 7], [2, c.b + 7], [3.5, c.b]]) wrapAdd(t0 + off * beat, bass(midi(n), 0.9 * beat, 0.3));
    for (let s = 0; s < 8; s++) wrapAdd(t0 + s * beat / 2, shaker(s % 2 ? 0.05 : 0.09));
  }
  for (const rep of [0, 16]) for (const [n, at, d] of mel) wrapAdd((rep + at) * beat, vib(midi(n), d * beat, 0.09));
  // ceiling-speaker colour: band-limit the music
  const hp = biquad("hp", 250);
  const lp = biquad("lp", 2600);
  const warm = new Float32Array(L);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < L; i++) { const y = lp(hp(music[i])); if (pass) warm[i] = y; }

  const out = new Float32Array(L);
  for (let i = 0; i < L; i++) out[i] = humLoop[i] * 0.55 + warm[i] * 0.9;
  return { out, len: L / SR };
}

// ------------------------------------------------------------------ output
/** Gated RMS with a rough K-weighting (high shelf + high pass). */
function loudness(a) {
  const hs = biquad("hs", 1500, 0.707, 4);
  const hp = biquad("hp", 60, 0.5);
  const w = Math.floor(0.05 * SR);
  const blocks = [];
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    const y = hp(hs(a[i]));
    acc += y * y;
    if ((i + 1) % w === 0) { blocks.push(acc / w); acc = 0; }
  }
  const max = Math.max(...blocks, 1e-12);
  const gated = blocks.filter((b) => b > max * 0.01); // -20 dB relative gate
  return Math.sqrt(gated.reduce((s, b) => s + b, 0) / gated.length);
}
function matchLoudness(a, target) {
  const g = target / loudness(a);
  for (let i = 0; i < a.length; i++) a[i] = Math.tanh(a[i] * g * 1.05) / Math.tanh(1.05);
  return a;
}
function normalizePeak(a, peak = 0.89) {
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < a.length; i++) a[i] = (a[i] / m) * peak;
  return a;
}
function toMp3(samples, file, kbps) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(SR), "-ac", "1", "-i", "pipe:0",
    "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, file], { input: pcm });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
}

// name -> [samples, relative loudness]. 1 = the shared kit level.
const effects = {
  beep: [beep(), 1],
  crush: [canCrush(), 1],
  rustle: [bagRustle(), 1],
  slurp: [slurp(), 1],
  fizz: [fizz(), 1],
  bite: [bite(), 1],
  freeze: [freeze(), 1],
  pricegun: [priceGun(), 1],
  bagpop: [bagPop(), 1],
  spill: [spill(), 1],
  jelly: [jelly(), 1],
  coins: [coins(), 1],
  printer: [printer(), 0.9],
  tear: [tear(), 1],
  stamp: [stamp(), 1],
  drawer: [drawer(), 1],
  crumple: [crumple(), 1],
  bin: [bin(), 1],
  flip: [flip(), 0.9],
  vending: [vending(), 1],
  laugh1: [laughs[0](), 1.1],
  laugh2: [laughs[1](), 1.1],
  laugh3: [laughs[2](), 1.1],
  chain: [chain(), 0.8],
  splash: [splash(), 0.9],
  flicker: [flicker(), 0.8],
  neon: [neon(), 0.45],
  box: [boxSlide(), 0.9],
  lid: [lid(), 0.9],
  switch: [lightSwitch(), 0.9],
  chime: [chime(), 0.9],
  slap: [slap(), 0.8],
  nope: [nope(), 0.7],
};

// Each slot: 60 ms of silence, the sound, then a gap. The sprite starts
// 30 ms into the silence so encoder delay never clips the attack.
const TARGET = 0.2;
const PAD = 0.06, GAP = 0.2, LEAD = 0.03;
let cursor = 0;
const sprite = {};
const parts = [];
for (const [name, [s, gain]] of Object.entries(effects)) {
  matchLoudness(s, TARGET * gain);
  const slot = new Float32Array(Math.ceil((PAD + s.length / SR + GAP) * SR));
  slot.set(s, Math.floor(PAD * SR));
  sprite[name] = [Math.round((cursor + PAD - LEAD) * 1000), Math.round((s.length / SR + LEAD) * 1000)];
  cursor += slot.length / SR;
  parts.push(slot);
}
const all = concat(...parts);

const { out: loop, len } = ambience();
normalizePeak(loop, 0.8);
const twice = concat(loop, loop);

mkdirSync(join(ROOT, "public", "audio"), { recursive: true });
toMp3(all, join(ROOT, "public", "audio", "sfx.mp3"), 64);
toMp3(twice, join(ROOT, "public", "audio", "ambience.mp3"), 48);

const loopStart = Math.round((len / 2) * 1000);
const ts = `// Generated by scripts/audio/build-audio.mjs. Do not edit by hand.
export const SFX_SPRITE = ${JSON.stringify(sprite)} as const;
export type SfxName = keyof typeof SFX_SPRITE;
/** Loop region inside ambience.mp3: [start ms, duration ms, loop]. */
export const AMBIENCE_LOOP: [number, number, boolean] = [${loopStart}, ${Math.round(len * 1000)}, true];
`;
writeFileSync(join(ROOT, "lib", "audioSprite.generated.ts"), ts);
console.log("sfx", Object.keys(sprite).length, "sounds,", cursor.toFixed(1), "s; ambience loop", len.toFixed(2), "s");
