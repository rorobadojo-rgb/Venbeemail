import { useSyncExternalStore } from "react";
import type { Howl } from "howler";
import { asset } from "./asset";
import { MUSIC_LOOP, SFX_SPRITE, type SfxName } from "./audioSprite.generated";

/**
 * Howler.js sound manager.
 *
 * Browsers only allow audio after a user gesture, so nothing is created until
 * the first pointerdown / keydown / touchstart. Howler itself is code-split and
 * only downloaded then (or prefetched when the main thread is idle).
 * Mute + music preferences persist in localStorage.
 */
type SoundState = { muted: boolean; music: boolean; unlocked: boolean };

const KEY_MUTED = "venbee:muted";
const KEY_MUSIC = "venbee:music";
const MUSIC_VOLUME = 0.16;
const SERVER_STATE: SoundState = { muted: false, music: true, unlocked: false };

let state: SoundState = SERVER_STATE;
const listeners = new Set<() => void>();
let initialized = false;
let howler: typeof import("howler") | null = null;
let sfx: Howl | null = null;
let music: Howl | null = null;
let musicId: number | undefined;
let queue: { name: SfxName; opts?: PlayOptions; at: number }[] = [];
const lastPlayed = new Map<SfxName, number>();

type PlayOptions = { rate?: number; volume?: number };

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
  setState({ muted: read(KEY_MUTED) === "1", music: read(KEY_MUSIC) !== "0" });

  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const unlock = () => {
    events.forEach((e) => window.removeEventListener(e, unlock, true));
    void start();
  };
  events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!conn?.saveData) {
    window.addEventListener(
      "load",
      () =>
        whenIdle(() => {
          void import("howler");
          void fetch(asset("/audio/sfx.mp3")).catch(() => undefined);
        }),
      { once: true },
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (!music || musicId === undefined) return;
    if (document.hidden) music.pause(musicId);
    else if (state.music && !state.muted) music.play(musicId);
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
    volume: 0.8,
  });
  const now = performance.now();
  const pending = queue.filter((q) => now - q.at < 700);
  queue = [];
  pending.forEach((q) => play(q.name, q.opts));
  if (state.music && !state.muted) startMusic();
}

function startMusic() {
  if (!howler) return;
  if (!music) {
    music = new howler.Howl({
      src: [asset("/audio/chiptune.mp3")],
      sprite: { loop: MUSIC_LOOP },
      volume: MUSIC_VOLUME,
    });
  }
  if (musicId !== undefined && music.playing(musicId)) return;
  musicId = musicId === undefined ? music.play("loop") : music.play(musicId);
  music.fade(0, MUSIC_VOLUME, 1400, musicId);
}

function stopMusic() {
  if (!music || musicId === undefined) return;
  const m = music;
  const id = musicId;
  m.fade(m.volume(id) as number, 0, 350, id);
  m.once("fade", () => m.pause(id), id);
}

/** Play a sound effect. Silently ignored until the first user gesture. */
export function play(name: SfxName, opts?: PlayOptions) {
  if (!state.unlocked || state.muted) return;
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

export function setMuted(muted: boolean) {
  setState({ muted });
  write(KEY_MUTED, muted ? "1" : "0");
  howler?.Howler.mute(muted);
  if (muted) stopMusic();
  else if (state.music) startMusic();
}

export function setMusic(on: boolean) {
  setState({ music: on });
  write(KEY_MUSIC, on ? "1" : "0");
  if (on && !state.muted) startMusic();
  else stopMusic();
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
