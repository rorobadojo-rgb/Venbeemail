import { useSyncExternalStore } from "react";
import type { Howl } from "howler";
import { asset } from "./asset";
import { AMBIENCE_LOOP, SFX_SPRITE, type SfxName } from "./audioSprite.generated";

/**
 * Howler.js sound manager: one effects sprite + one ambience loop (fluorescent
 * hum, fridge buzz and faint in-store music).
 *
 * Browsers only allow audio after a user gesture, so nothing is created until
 * the first pointerdown / keydown / touchstart; Howler itself is code-split
 * and only downloaded then (or prefetched when the main thread is idle).
 * The mute preference (the TUTUP / BUKA sign) persists in localStorage.
 */
export type { SfxName };
type SoundState = { muted: boolean; unlocked: boolean };
type PlayOptions = { rate?: number; volume?: number };

const KEY_MUTED = "venbee:muted";
const AMBIENCE_VOLUME = 0.22;
const SERVER_STATE: SoundState = { muted: false, unlocked: false };

let state: SoundState = SERVER_STATE;
const listeners = new Set<() => void>();
let initialized = false;
let howler: typeof import("howler") | null = null;
let sfx: Howl | null = null;
let amb: Howl | null = null;
let ambId: number | undefined;
let queue: { name: SfxName; opts?: PlayOptions; at: number }[] = [];
const lastPlayed = new Map<SfxName, number>();

function setState(patch: Partial<SoundState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode: the preference just won't persist */
  }
}

function whenIdle(fn: () => void) {
  if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 6000 });
  else setTimeout(fn, 3000);
}

export function initSound() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  setState({ muted: read(KEY_MUTED) === "1" });

  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const unlock = () => {
    events.forEach((e) => window.removeEventListener(e, unlock, true));
    void start();
  };
  events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!conn?.saveData) {
    const prefetch = () => whenIdle(() => void import("howler"));
    if (document.readyState === "complete") prefetch();
    else window.addEventListener("load", prefetch, { once: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (!amb || ambId === undefined) return;
    if (document.hidden) amb.pause(ambId);
    else if (!state.muted) amb.play(ambId);
  });
}

async function start() {
  if (state.unlocked) return;
  setState({ unlocked: true });
  // bundlers differ on CommonJS interop: the API is either the namespace or its default
  const mod = await import("howler");
  howler = mod.Howler ? mod : (mod as unknown as { default: typeof import("howler") }).default;
  howler.Howler.mute(state.muted);
  sfx = new howler.Howl({
    src: [asset("/audio/sfx.mp3")],
    sprite: SFX_SPRITE as unknown as Record<string, [number, number]>,
    volume: 0.75,
  });
  const now = performance.now();
  const pending = queue.filter((q) => now - q.at < 900);
  queue = [];
  pending.forEach((q) => play(q.name, q.opts));
  if (!state.muted) startAmbience();
}

function startAmbience() {
  if (!howler) return;
  if (!amb) {
    amb = new howler.Howl({
      src: [asset("/audio/ambience.mp3")],
      sprite: { loop: AMBIENCE_LOOP },
      volume: AMBIENCE_VOLUME,
    });
  }
  if (ambId !== undefined && amb.playing(ambId)) return;
  ambId = ambId === undefined ? amb.play("loop") : amb.play(ambId);
  amb.fade(0, AMBIENCE_VOLUME, 1800, ambId);
}

function stopAmbience() {
  if (!amb || ambId === undefined) return;
  const a = amb;
  const id = ambId;
  a.fade(a.volume(id) as number, 0, 350, id);
  a.once("fade", () => a.pause(id), id);
}

/** Play a sound effect. Silently ignored until the first user gesture. */
export function play(name: SfxName, opts?: PlayOptions) {
  if (!state.unlocked || state.muted) {
    // the very first click unlocks audio; keep what it asked for
    if (!state.unlocked && !state.muted) queue.push({ name, opts, at: performance.now() });
    return;
  }
  if (!sfx) {
    queue.push({ name, opts, at: performance.now() });
    return;
  }
  const id = sfx.play(name);
  if (opts?.rate) sfx.rate(opts.rate, id);
  if (opts?.volume !== undefined) sfx.volume(opts.volume, id);
}

/** Like play(), but drops repeats that come faster than `gapMs`. */
export function playThrottled(name: SfxName, gapMs: number, opts?: PlayOptions) {
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < gapMs) return;
  lastPlayed.set(name, now);
  play(name, opts);
}

/** Play several sounds as one gesture, e.g. crumple then bin. */
export function playSeq(steps: [SfxName, number][]) {
  steps.forEach(([name, delay]) => (delay ? window.setTimeout(() => play(name), delay) : play(name)));
}

const LAUGHS: SfxName[] = ["laugh1", "laugh2", "laugh3"];
let lastLaugh = -1;
/** One of the three zombie laughs, never the same twice in a row. */
export function playLaugh() {
  let i = Math.floor(Math.random() * LAUGHS.length);
  if (i === lastLaugh) i = (i + 1) % LAUGHS.length;
  lastLaugh = i;
  play(LAUGHS[i], { rate: 0.94 + Math.random() * 0.12 });
}

export function setMuted(muted: boolean) {
  setState({ muted });
  write(KEY_MUTED, muted ? "1" : "0");
  howler?.Howler.mute(muted);
  if (muted) stopAmbience();
  else startAmbience();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useSound() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}
