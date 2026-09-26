import { useSyncExternalStore } from "react";
import type { Howl } from "howler";
import { asset } from "./asset";
import { AMBIENT_LOOP, SFX_SPRITE, type SfxName } from "./audioSprite.generated";

/**
 * Howler.js sound manager.
 *
 * Browsers only allow audio after a user gesture, so nothing is created until
 * the first pointerdown / keydown / touchstart. Howler itself is code-split
 * and only downloaded then (or prefetched when the main thread is idle).
 * The mute setting (the kentongan) persists in localStorage.
 */
type SoundState = { muted: boolean; unlocked: boolean };
export type { SfxName };

const KEY_MUTED = "venbee:muted";
const AMBIENT_VOLUME = 0.32;
const SERVER_STATE: SoundState = { muted: false, unlocked: false };

let state: SoundState = SERVER_STATE;
const listeners = new Set<() => void>();
let initialized = false;
let howler: typeof import("howler") | null = null;
let sfx: Howl | null = null;
let ambient: Howl | null = null;
let ambientId: number | undefined;
let queue: { name: SfxName; opts?: PlayOptions; at: number }[] = [];
const lastPlayed = new Map<SfxName, number>();

export type PlayOptions = { rate?: number; volume?: number };

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
    /* private mode: preference just won't persist */
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
    const prefetch = () =>
      whenIdle(() => {
        void import("howler");
        void fetch(asset("/audio/sfx.mp3")).catch(() => undefined);
      });
    if (document.readyState === "complete") prefetch();
    else window.addEventListener("load", prefetch, { once: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (!ambient || ambientId === undefined) return;
    if (document.hidden) ambient.pause(ambientId);
    else if (!state.muted) ambient.play(ambientId);
  });
}

async function start() {
  if (state.unlocked) return;
  setState({ unlocked: true });
  howler = await import("howler");
  howler.Howler.mute(state.muted);
  sfx = new howler.Howl({
    src: [asset("/audio/sfx.mp3")],
    sprite: SFX_SPRITE as unknown as Record<string, [number, number]>,
    volume: 0.85,
  });
  const now = performance.now();
  const pending = queue.filter((q) => now - q.at < 700);
  queue = [];
  pending.forEach((q) => play(q.name, q.opts));
  if (!state.muted) startAmbient();
}

function startAmbient() {
  if (!howler) return;
  if (!ambient) {
    ambient = new howler.Howl({
      src: [asset("/audio/ambient.mp3")],
      sprite: { loop: AMBIENT_LOOP },
      volume: AMBIENT_VOLUME,
    });
  }
  if (ambientId !== undefined && ambient.playing(ambientId)) return;
  ambientId = ambientId === undefined ? ambient.play("loop") : ambient.play(ambientId);
  ambient.fade(0, AMBIENT_VOLUME, 2200, ambientId);
}

function stopAmbient() {
  if (!ambient || ambientId === undefined) return;
  const a = ambient;
  const id = ambientId;
  a.fade(a.volume(id) as number, 0, 350, id);
  a.once("fade", () => a.pause(id), id);
}

/** Play a sound effect. Silently ignored until the first user gesture. */
export function play(name: SfxName, opts?: PlayOptions) {
  if (!state.unlocked || state.muted) return undefined;
  if (!sfx) {
    queue.push({ name, opts, at: performance.now() });
    return undefined;
  }
  const id = sfx.play(name);
  if (opts?.rate) sfx.rate(opts.rate, id);
  if (opts?.volume !== undefined) sfx.volume(opts.volume, id);
  return id;
}

/** Stop a sound started with play() (e.g. the pen when writing is cut short). */
export function stop(id: number | undefined) {
  if (id !== undefined) sfx?.stop(id);
}

/** Like play(), but drops repeats that come faster than `gapMs`. */
export function playThrottled(name: SfxName, gapMs: number, opts?: PlayOptions) {
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < gapMs) return undefined;
  lastPlayed.set(name, now);
  return play(name, opts);
}

/** Slightly different pitch each time, so repeats don't sound robotic. */
export const vary = (spread = 0.12) => 1 + (Math.random() - 0.5) * spread;

export function setMuted(muted: boolean) {
  setState({ muted });
  write(KEY_MUTED, muted ? "1" : "0");
  howler?.Howler.mute(muted);
  if (muted) stopAmbient();
  else startAmbient();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useSound() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
