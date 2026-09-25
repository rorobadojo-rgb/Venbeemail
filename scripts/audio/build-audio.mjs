// Synthesises every VenbeeMail sound from scratch (no samples) and encodes
// them with ffmpeg (libmp3lame):
//
//   public/audio/sfx.mp3        one Howler sprite with all sound effects
//   public/audio/chiptune.mp3   8-bar background loop (two identical copies,
//                               so the loop region sits in the middle and is
//                               seamless whatever encoder delay the browser
//                               applies)
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

/** RBJ biquad, returns a stateful per-sample filter. */
function biquad(type, freq, q = 0.707) {
  let b0, b1, b2, a1, a2;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f) => {
    const w = (TAU * Math.min(f, SR * 0.45)) / SR;
    const al = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    let a0;
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; } // band-pass
    a0 = 1 + al; a1 = -2 * c; a2 = 1 - al;
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

// ---------------------------------------------------------------- effects
function pageFlip() {
  const out = buf(0.5);
  const bp = biquad("bp", 1200, 0.9);
  const hp = biquad("hp", 2500);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    bp.set(900 + 4200 * Math.min(1, t / 0.28));
    const swell = Math.sin(Math.PI * Math.min(1, t / 0.34)) ** 1.6;
    let s = bp(noise()) * swell * 1.4;
    // the paper "flap" at the end: a few fast crackles
    if (t > 0.26 && t < 0.4 && rand() < 0.02) s += hp(noise()) * 1.5;
    else s += hp(noise()) * 0.05 * swell;
    out[i] = s;
  }
  return out;
}

function pow() {
  const out = buf(0.65);
  const lp = biquad("lp", 1800);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const f = 45 + 140 * Math.exp(-t * 16);
    ph += (TAU * f) / SR;
    const thump = Math.sin(ph) * Math.exp(-t * 6.5);
    const crack = lp(noise()) * Math.exp(-t * 30) * 1.3;
    out[i] = Math.tanh((thump * 1.3 + crack) * 1.8);
  }
  return out;
}

function ding() {
  const out = buf(1.3);
  const partials = [
    [1, 1, 3.2], [2.0, 0.45, 5], [2.76, 0.3, 7], [5.4, 0.12, 11], [8.9, 0.06, 16],
  ];
  const notes = [[midi(88), 0], [midi(95), 0.09]]; // E6 then B6
  for (const [f0, start] of notes) {
    const o = Math.floor(start * SR);
    for (let i = o; i < out.length; i++) {
      const t = (i - o) / SR;
      let s = 0;
      for (const [r, a, d] of partials) s += Math.sin(TAU * f0 * r * t) * a * Math.exp(-t * d);
      out[i] += s * Math.min(1, t / 0.002) * (start ? 0.8 : 1);
    }
  }
  return out;
}

function crumple() {
  const out = buf(0.75);
  const hp = biquad("hp", 900);
  const bp = biquad("bp", 3000, 0.7);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const density = 0.004 + 0.02 * Math.sin(Math.PI * Math.min(1, t / 0.6));
    out[i] = bp(noise()) * 0.12 * Math.sin(Math.PI * Math.min(1, t / 0.7));
    if (rand() < density) {
      const len = Math.floor(SR * (0.001 + rand() * 0.006));
      const amp = 0.3 + rand() * 0.8;
      for (let k = 0; k < len && i + k < out.length; k++) out[i + k] += hp(noise()) * amp * (1 - k / len);
    }
  }
  // squash the crackle peaks so the rustle has some body
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 3.5);
  return out;
}

function scribble() {
  const out = buf(0.6);
  const bp = biquad("bp", 4200, 1.4);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (13 + 5 * Math.sin(t * 9))) / SR;
    const strokes = Math.abs(Math.sin(ph)) ** 0.7;
    const env = Math.min(1, t / 0.03) * Math.min(1, (0.6 - t) / 0.08);
    out[i] = bp(noise()) * strokes * env * 1.6;
  }
  return out;
}

function typeClick() {
  const out = buf(0.07);
  const hp = biquad("hp", 1500);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] =
      hp(noise()) * Math.exp(-t * 400) * 0.9 +
      Math.sin(TAU * 2100 * t) * Math.exp(-t * 90) * 0.25 +
      Math.sin(TAU * 180 * t) * Math.exp(-t * 60) * 0.35;
  }
  return out;
}

function klik() {
  const out = buf(0.14);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (800 + 900 * Math.min(1, t / 0.03))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 38) * 0.7 + noise() * Math.exp(-t * 700) * 0.6;
  }
  return out;
}

function pop() {
  const out = buf(0.12);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (380 + 700 * (t / 0.12))) / SR;
    out[i] = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, t / 0.12)) ** 0.5 * Math.exp(-t * 18) * 0.8;
  }
  return out;
}

function zap() {
  const out = buf(0.32);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * (1900 * Math.exp(-t * 9) + 120)) / SR;
    const sq = Math.sign(Math.sin(ph)) * 0.5 + Math.sin(ph * 2.01) * 0.2;
    out[i] = sq * Math.exp(-t * 7) * 0.6;
  }
  return out;
}

// --------------------------------------------------------------- chiptune
function polyblep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
function pulseVoice(out, start, dur, freq, amp, duty = 0.5, vib = 0) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor((dur + 0.04) * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const f = freq * (1 + (t > 0.12 ? vib * Math.sin(TAU * 5.5 * t) : 0));
    const dt = f / SR;
    ph += dt; if (ph >= 1) ph -= 1;
    let v = (ph < duty ? 1 : -1) + polyblep(ph, dt) - polyblep((ph + 1 - duty) % 1, dt);
    const env = Math.min(1, t / 0.004) * (t < dur ? 0.65 + 0.35 * Math.exp(-t * 10) : Math.max(0, 1 - (t - dur) / 0.04) * 0.65);
    const i = s0 + k;
    out[i % out.length] += v * amp * env;
  }
}
function triVoice(out, start, dur, freq, amp) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor((dur + 0.02) * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const p = (freq * t) % 1;
    const v = 4 * Math.abs(p - 0.5) - 1;
    const env = Math.min(1, t / 0.003) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.02));
    out[(s0 + k) % out.length] += v * amp * env;
  }
}
function drum(out, start, kind) {
  const s0 = Math.floor(start * SR);
  const hp = biquad("hp", 7000);
  const n = Math.floor(0.25 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    let v = 0;
    if (kind === "kick") { ph += (TAU * (50 + 120 * Math.exp(-t * 30))) / SR; v = Math.sin(ph) * Math.exp(-t * 14) * 0.55; }
    if (kind === "snare") v = (noise() * 0.6 + Math.sin(TAU * 190 * t) * 0.4) * Math.exp(-t * 22) * 0.28;
    if (kind === "hat") v = hp(noise()) * Math.exp(-t * 70) * 0.14;
    out[(s0 + k) % out.length] += v;
  }
}

function chiptune() {
  const bpm = 128;
  const e = 60 / bpm / 2; // eighth note
  const bars = 8;
  const len = bars * 8 * e;
  const out = new Float32Array(Math.round(len * SR));
  const chords = {
    C: { arp: [60, 64, 67, 72], bass: 36 },
    G: { arp: [59, 62, 67, 71], bass: 43 },
    Am: { arp: [57, 60, 64, 69], bass: 45 },
    F: { arp: [57, 60, 65, 69], bass: 41 },
  };
  const prog = ["C", "G", "Am", "F", "C", "G", "Am", "F"];
  const R = null, H = "-";
  const melody = [
    [76, R, 79, R, 84, H, 83, 79], [74, H, 79, R, 83, R, 81, 79],
    [76, R, 81, R, 84, R, 83, 81], [77, H, 81, H, 79, R, 76, 74],
    [76, 79, 84, 79, 76, 79, 84, 86], [83, H, 81, 79, 83, H, 86, H],
    [84, 83, 81, 76, 81, 83, 84, 88], [86, H, 84, H, 83, R, 79, R],
  ];
  prog.forEach((name, bar) => {
    const c = chords[name];
    const b0 = bar * 8 * e;
    for (let s = 0; s < 16; s++) pulseVoice(out, b0 + s * (e / 2), e / 2 * 0.8, midi(c.arp[s % 4]), 0.05, 0.25);
    for (let s = 0; s < 8; s++) triVoice(out, b0 + s * e, e * 0.85, midi(c.bass + (s % 2 ? 12 : 0)), 0.22);
    for (let s = 0; s < 8; s++) {
      if (s === 0 || s === 4 || (bar % 2 && s === 7)) drum(out, b0 + s * e, "kick");
      if (s === 2 || s === 6) drum(out, b0 + s * e, "snare");
      if (s % 2) drum(out, b0 + s * e, "hat");
    }
    const line = melody[bar];
    for (let s = 0; s < 8; s++) {
      const n = line[s];
      if (typeof n !== "number") continue;
      let d = 1;
      while (s + d < 8 && line[s + d] === H) d++;
      pulseVoice(out, b0 + s * e, e * d * 0.9, midi(n), 0.13, 0.5, d > 1 ? 0.006 : 0);
    }
  });
  return { out, len };
}

// ------------------------------------------------------------------ output
function normalize(a, peak = 0.89) {
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

const effects = {
  flip: [pageFlip(), 0.8],
  pow: [pow(), 1],
  ding: [ding(), 0.75],
  crumple: [crumple(), 0.9],
  scribble: [scribble(), 0.55],
  type: [typeClick(), 0.5],
  klik: [klik(), 0.6],
  pop: [pop(), 0.6],
  zap: [zap(), 0.55],
};

// Each slot: 60 ms of silence, the sound, then a gap. The sprite starts
// 30 ms into the silence so encoder delay never clips the attack.
const PAD = 0.06, GAP = 0.2, LEAD = 0.03;
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

const { out: loop, len } = chiptune();
normalize(loop, 0.85);
const twice = new Float32Array(loop.length * 2);
twice.set(loop, 0);
twice.set(loop, loop.length);

mkdirSync(join(ROOT, "public", "audio"), { recursive: true });
toMp3(all, join(ROOT, "public", "audio", "sfx.mp3"), 96);
toMp3(twice, join(ROOT, "public", "audio", "chiptune.mp3"), 64);

const loopStart = Math.round((len / 2) * 1000);
const ts = `// Generated by scripts/audio/build-audio.mjs. Do not edit by hand.
export const SFX_SPRITE = ${JSON.stringify(sprite, null, 2)} as const;
export type SfxName = keyof typeof SFX_SPRITE;
/** Loop region inside chiptune.mp3: [start ms, duration ms, loop]. */
export const MUSIC_LOOP: [number, number, boolean] = [${loopStart}, ${Math.round(len * 1000)}, true];
`;
writeFileSync(join(ROOT, "lib", "audioSprite.generated.ts"), ts);
console.log("sfx sprite", sprite, "loop", len.toFixed(2), "s");
