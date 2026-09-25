// Every sound on the page is synthesised at runtime in an OfflineAudioContext and
// handed to Howler as a base64 WAV data URI — the site ships zero audio files.
// (Howler decodes data URIs itself, so no fetch/XHR is needed: works under strict CSPs
// that block blob: requests.)
// Loaded lazily after the visitor's first interaction.

const SR = 44100;
const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;

const ctxFor = (sec) => new OAC(1, Math.ceil(sec * SR), SR);

function noise(c, sec) {
  const len = Math.ceil(sec * SR);
  const buf = c.createBuffer(1, len, SR);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function filt(c, type, freq, Q = 0.7) {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = Q;
  return f;
}

/** Gain node with a percussive envelope, already connected to `to`. */
function env(c, t, attack, peak, decay, to) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, 0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(to);
  return g;
}

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// ─── one-shots ───────────────────────────────────────────────────────────────

async function slap() {
  const c = ctxFor(0.4);
  const out = c.destination;
  const thump = c.createOscillator();
  thump.frequency.setValueAtTime(190, 0);
  thump.frequency.exponentialRampToValueAtTime(48, 0.14);
  thump.connect(env(c, 0, 0.002, 0.9, 0.18, out));
  thump.start(0);
  thump.stop(0.4);

  const crack = noise(c, 0.4);
  crack
    .connect(filt(c, 'bandpass', 1500, 0.6))
    .connect(filt(c, 'highpass', 380))
    .connect(env(c, 0, 0.0008, 1.3, 0.06, out));
  crack.start(0);

  const sticky = noise(c, 0.4); // the vinyl grabbing the surface
  sticky.connect(filt(c, 'highpass', 3500)).connect(env(c, 0.012, 0.01, 0.12, 0.14, out));
  sticky.start(0);
  return c.startRendering();
}

async function peel() {
  // Tape/adhesive letting go: dense micro-crackles whose rate wobbles. Loops seamlessly.
  const sec = 1.4;
  const c = ctxFor(sec);
  const len = Math.ceil(sec * SR);
  const buf = c.createBuffer(1, len, SR);
  const d = buf.getChannelData(0);
  let e = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const rate = 0.075 + 0.05 * Math.sin(t * 2 * Math.PI * 3.1) + 0.035 * Math.sin(t * 2 * Math.PI * 7.7 + 1);
    if (Math.random() < rate) e = 0.45 + Math.random() * 0.55;
    e *= 0.93;
    d[i] = (Math.random() * 2 - 1) * e * 0.8 + (Math.random() * 2 - 1) * 0.035;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const pk = filt(c, 'peaking', 3200, 1);
  pk.gain.value = 6;
  src
    .connect(filt(c, 'highpass', 1200))
    .connect(pk)
    .connect(c.destination);
  src.start(0);
  return c.startRendering();
}

async function squeak() {
  const c = ctxFor(0.36);
  const g = env(c, 0, 0.012, 0.8, 0.26, c.destination);
  const bp = filt(c, 'bandpass', 1400, 2.2);
  bp.connect(g);
  const lfo = c.createOscillator();
  lfo.frequency.value = 42;
  const depth = c.createGain();
  depth.gain.value = 70;
  lfo.connect(depth);
  lfo.start(0);
  for (const [type, mul, vol] of [
    ['triangle', 1, 1],
    ['sine', 2, 0.35],
  ]) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(820 * mul, 0);
    o.frequency.exponentialRampToValueAtTime(1500 * mul, 0.07);
    o.frequency.exponentialRampToValueAtTime(1080 * mul, 0.25);
    depth.connect(o.frequency);
    const v = c.createGain();
    v.gain.value = vol;
    o.connect(v).connect(bp);
    o.start(0);
    o.stop(0.36);
  }
  const rub = noise(c, 0.36); // rubbery friction
  rub.connect(filt(c, 'bandpass', 2300, 4)).connect(env(c, 0, 0.01, 0.12, 0.2, c.destination));
  rub.start(0);
  return c.startRendering();
}

async function shutter() {
  const c = ctxFor(0.4);
  const click = (t, f, vol) => {
    const n = noise(c, 0.05);
    n.connect(filt(c, 'bandpass', f, 1.4)).connect(env(c, t, 0.0008, vol, 0.03, c.destination));
    n.start(t);
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = f / 3;
    o.connect(env(c, t, 0.0005, vol * 0.12, 0.012, c.destination));
    o.start(t);
    o.stop(t + 0.05);
  };
  click(0, 3200, 1);
  const whirr = noise(c, 0.2);
  whirr.connect(filt(c, 'bandpass', 6000, 2)).connect(env(c, 0.01, 0.005, 0.12, 0.06, c.destination));
  whirr.start(0);
  click(0.085, 2300, 0.8);
  return c.startRendering();
}

async function whoosh() {
  const c = ctxFor(0.7);
  // flick
  const tick = noise(c, 0.05);
  tick.connect(filt(c, 'highpass', 2500)).connect(env(c, 0, 0.0006, 0.9, 0.025, c.destination));
  tick.start(0);
  const snap = c.createOscillator();
  snap.frequency.setValueAtTime(1800, 0);
  snap.frequency.exponentialRampToValueAtTime(600, 0.03);
  snap.connect(env(c, 0, 0.0005, 0.3, 0.03, c.destination));
  snap.start(0);
  snap.stop(0.06);
  // whoosh
  const n = noise(c, 0.7);
  const bp = filt(c, 'bandpass', 300, 1.4);
  bp.frequency.setValueAtTime(300, 0.03);
  bp.frequency.exponentialRampToValueAtTime(2600, 0.28);
  bp.frequency.exponentialRampToValueAtTime(700, 0.6);
  const g = c.createGain();
  g.gain.setValueAtTime(0, 0);
  g.gain.linearRampToValueAtTime(0.0001, 0.03);
  g.gain.linearRampToValueAtTime(0.9, 0.22);
  g.gain.exponentialRampToValueAtTime(0.001, 0.62);
  n.connect(bp).connect(g).connect(c.destination);
  n.start(0);
  return c.startRendering();
}

// ─── lo-fi skate-video loop (84 bpm, 4 bars, swung 16ths) ───────────────────

async function beat() {
  const bpm = 84;
  const spb = 60 / bpm;
  const s16 = spb / 4;
  const bars = 4;
  const loopLen = bars * 4 * spb;
  const tail = 1.5;
  const c = ctxFor(loopLen + tail);

  const master = c.createGain();
  master.gain.value = 0.8;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3.5;
  comp.attack.value = 0.01;
  comp.release.value = 0.2;
  master
    .connect(filt(c, 'lowpass', 4200, 0.5))
    .connect(comp)
    .connect(c.destination);

  const at = (step) => step * s16 + (step % 2 ? s16 * 0.17 : 0);

  const kick = (t, v = 1) => {
    const o = c.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    o.connect(env(c, t, 0.003, 0.95 * v, 0.32, master));
    o.start(t);
    o.stop(t + 0.45);
  };
  const snare = (t, v = 1) => {
    const n = noise(c, 0.3);
    n.connect(filt(c, 'bandpass', 1900, 0.7))
      .connect(filt(c, 'highpass', 600))
      .connect(env(c, t, 0.001, 0.5 * v, 0.17, master));
    n.start(t);
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    o.connect(env(c, t, 0.001, 0.26 * v, 0.09, master));
    o.start(t);
    o.stop(t + 0.2);
  };
  const hat = (t, v = 1, open = false) => {
    const n = noise(c, open ? 0.35 : 0.08);
    n.connect(filt(c, 'highpass', 7200)).connect(env(c, t, 0.0008, 0.15 * v, open ? 0.22 : 0.035, master));
    n.start(t);
  };

  const keys = c.createGain();
  keys.gain.value = 0.55;
  keys.connect(filt(c, 'lowpass', 2200, 0.4)).connect(master);
  const wobble = c.createOscillator(); // tape wow
  wobble.frequency.value = 0.55;
  const wobbleAmt = c.createGain();
  wobbleAmt.gain.value = 9;
  wobble.connect(wobbleAmt);
  wobble.start(0);

  const note = (t, m, dur, v = 1) => {
    const f = mtof(m);
    const body = c.createOscillator();
    body.frequency.value = f;
    wobbleAmt.connect(body.detune);
    const g = c.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16 * v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.06 * v, t + Math.min(dur, 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
    body.connect(g).connect(keys);
    body.start(t);
    body.stop(t + dur + 0.4);
    const tine = c.createOscillator(); // rhodes-ish bell on the attack
    tine.frequency.value = f * 2;
    tine.detune.value = 4;
    tine.connect(env(c, t, 0.004, 0.05 * v, 0.35, keys));
    tine.start(t);
    tine.stop(t + 0.45);
  };
  const bass = (t, m, dur) => {
    const f = mtof(m);
    const g = c.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    const lp = filt(c, 'lowpass', 420, 0.8);
    lp.connect(g).connect(master);
    for (const type of ['triangle', 'sine']) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  };

  // ii–V–I–VI in C: Dm9 · G13 · Cmaj9 · A7(b13)
  const chords = [
    { root: 38, notes: [53, 57, 60, 64] },
    { root: 43, notes: [53, 59, 64] },
    { root: 36, notes: [52, 55, 59, 62] },
    { root: 33, notes: [55, 61, 65] },
  ];

  for (let bar = 0; bar < bars; bar++) {
    const b0 = bar * 16 * s16;
    const ch = chords[bar];
    (bar % 2 ? [0, 6, 10, 13] : [0, 7, 10]).forEach((s) => kick(b0 + at(s), s === 0 ? 1 : 0.8));
    [4, 12].forEach((s) => snare(b0 + at(s)));
    if (bar === 3) snare(b0 + at(15), 0.35);
    for (let s = 0; s < 16; s += 2) hat(b0 + at(s), s % 4 ? 0.6 : 1);
    if (bar % 2) hat(b0 + at(14), 0.7, true);
    else hat(b0 + at(15), 0.45);

    ch.notes.forEach((m, i) => note(b0 + i * 0.012, m, spb * 1.8, 0.9));
    ch.notes.forEach((m, i) => note(b0 + at(10) + i * 0.01, m, spb * 0.9, 0.62));

    bass(b0, ch.root, spb * 1.4);
    bass(b0 + at(7), ch.root + 12, spb * 0.4);
    bass(b0 + at(10), ch.root + 7, spb * 1.1);
    bass(b0 + at(14), ch.root, spb * 0.4);
  }

  // vinyl hiss + crackle
  const len = Math.ceil((loopLen + tail) * SR);
  const crk = c.createBuffer(1, len, SR);
  const cd = crk.getChannelData(0);
  for (let i = 0; i < len; i++) {
    cd[i] = (Math.random() * 2 - 1) * 0.01 + (Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.5 : 0);
  }
  const cs = c.createBufferSource();
  cs.buffer = crk;
  cs.connect(filt(c, 'bandpass', 2500, 0.5)).connect(master);
  cs.start(0);

  const rendered = (await c.startRendering()).getChannelData(0);
  // Fold the ringing tail back onto the start → seamless loop.
  const L = Math.round(loopLen * SR);
  const data = rendered.slice(0, L);
  for (let i = 0; i < rendered.length - L; i++) data[i] += rendered[L + i];
  return data;
}

// ─── WAV encoding ────────────────────────────────────────────────────────────

function wavUrl(samples) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const gain = peak > 0 ? 0.9 / peak : 1;
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, SR, true);
  v.setUint32(28, SR * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * gain));
    v.setInt16(44 + i * 2, s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

export async function renderAll() {
  if (!OAC) throw new Error('OfflineAudioContext unsupported');
  const jobs = { slap, peel, squeak, shutter, whoosh, beat };
  const entries = await Promise.all(
    Object.entries(jobs).map(async ([name, fn]) => {
      const out = await fn();
      return [name, wavUrl(out instanceof Float32Array ? out : out.getChannelData(0))];
    }),
  );
  return Object.fromEntries(entries);
}
