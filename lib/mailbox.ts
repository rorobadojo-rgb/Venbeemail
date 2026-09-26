import { useSyncExternalStore } from "react";
import { isDomain, type Domain } from "./domains";
import { makeLetter, welcomeLetter, type Letter } from "./fakeMail";

/**
 * The warung's mail state: up to three inboxes (the numbered stall plates),
 * each with an address, a candle timer and its letters. Everything lives in
 * the browser and persists in localStorage.
 *
 * DEMO: there is no mail server yet. `startMailPump()` drops a made-up
 * letter into the active inbox every 8 s; swap `pumpOnce` for a real API
 * poll when the backend exists.
 */
export const MAX_INBOXES = 3;
export const LIFE_MS = 10 * 60_000;
export const EXTEND_MS = 10 * 60_000;
export const MAX_LIFE_MS = 60 * 60_000;
export const MAIL_EVERY_MS = 8_000;
const MAX_LETTERS = 24;
const KEY = "venbee:warung";

export type Inbox = {
  id: string;
  local: string;
  domain: Domain;
  createdAt: number;
  expiresAt: number;
  /** candle length at the last (re)light, for the burn-down ratio */
  lifeMs: number;
  letters: Letter[];
  forwardTo: string | null;
  /** bumps whenever the address changes, so the nota is rewritten */
  serial: number;
};

export type Market = {
  ready: boolean;
  inboxes: Inbox[];
  active: number;
  /** the bag on the counter */
  domain: Domain;
  username: string;
  spamFilter: boolean;
  notify: boolean;
  /** nothing was saved yet: the hand writes a first nota when the counter shows up */
  firstVisit: boolean;
};

const SERVER: Market = {
  ready: false,
  inboxes: [],
  active: 0,
  domain: "peler.com",
  username: "",
  spamFilter: true,
  notify: false,
  firstVisit: false,
};

let state: Market = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

// ------------------------------------------------------------- helpers
function rand(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}

const NOUNS = [
  "cilok", "bakso", "seblak", "cireng", "tahu", "tempe", "kerupuk", "sate", "cimol", "martabak",
  "odading", "lontong", "gorengan", "cakwe", "batagor", "siomay", "pentol", "kue.cubit", "leker", "ronde",
];
const MOODS = [
  "ngantuk", "galak", "pedas", "kilat", "rebahan", "santuy", "gabut", "kalem", "nekat", "misterius",
  "ceria", "sultan", "hemat", "bingung", "turbo", "sakti", "melek", "lapar",
];

export function randomLocal() {
  return `${NOUNS[rand(NOUNS.length)]}.${MOODS[rand(MOODS.length)]}${rand(900) + 100}`;
}

/** Keep what an address local part may contain: a-z 0-9 . _ - (max 24). */
export function sanitizeLocal(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .slice(0, 24);
}
const trimDots = (v: string) => v.replace(/^[._-]+|[._-]+$/g, "");
export const isValidLocal = (v: string) => /^[a-z0-9](?:[a-z0-9._-]{0,22}[a-z0-9])?$/.test(v);

export const addressOf = (i: Inbox) => `${i.local}@${i.domain}`;
export const timeLeft = (i: Inbox, now: number) => Math.max(0, i.expiresAt - now);
export const isExpired = (i: Inbox, now: number) => timeLeft(i, now) <= 0;

const uid = () => `${Date.now().toString(36)}${rand(1e6).toString(36)}`;

function freshInbox(local: string, domain: Domain, serial = 1): Inbox {
  const now = Date.now();
  const inbox: Inbox = {
    id: uid(),
    local,
    domain,
    createdAt: now,
    expiresAt: now + LIFE_MS,
    lifeMs: LIFE_MS,
    letters: [],
    forwardTo: null,
    serial,
  };
  inbox.letters = [welcomeLetter(addressOf(inbox))];
  return inbox;
}

// --------------------------------------------------------------- store
function persist() {
  try {
    const { inboxes, active, domain, username, spamFilter, notify } = state;
    localStorage.setItem(KEY, JSON.stringify({ v: 1, inboxes, active, domain, username, spamFilter, notify }));
  } catch {
    /* storage unavailable: state just won't survive a reload */
  }
}

function set(patch: Partial<Market>) {
  state = { ...state, ...patch };
  if (state.ready) persist();
  listeners.forEach((l) => l());
}

function updateActive(fn: (i: Inbox) => Inbox) {
  const cur = state.inboxes[state.active];
  if (!cur) return;
  const inboxes = state.inboxes.slice();
  inboxes[state.active] = fn(cur);
  set({ inboxes });
}

function validInbox(x: unknown): x is Inbox {
  const i = x as Inbox;
  return !!i && typeof i.id === "string" && typeof i.local === "string" && isDomain(i.domain) && Array.isArray(i.letters);
}

/** Restore saved state. Call once on the client. */
export function loadMarket() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let next: Market = { ...SERVER, ready: true, firstVisit: true };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved) next.firstVisit = false;
    if (saved?.v === 1) {
      const inboxes = (saved.inboxes as unknown[]).filter(validInbox).slice(0, MAX_INBOXES);
      next = {
        ...next,
        inboxes,
        active: Math.min(Math.max(0, Number(saved.active) || 0), Math.max(0, inboxes.length - 1)),
        domain: isDomain(saved.domain) ? saved.domain : SERVER.domain,
        username: typeof saved.username === "string" ? sanitizeLocal(saved.username) : "",
        spamFilter: saved.spamFilter !== false,
        notify: saved.notify === true && typeof Notification !== "undefined" && Notification.permission === "granted",
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  state = next;
  openFromLink();
  persist();
  listeners.forEach((l) => l());
}

/** `?inbox=name@domain` (from "Copy inbox link") opens that inbox. */
function openFromLink() {
  const raw = new URLSearchParams(window.location.search).get("inbox");
  if (!raw) return;
  const [local, domain] = raw.toLowerCase().split("@");
  if (!isValidLocal(local ?? "") || !isDomain(domain)) return;
  const found = state.inboxes.findIndex((i) => i.local === local && i.domain === domain);
  if (found >= 0) {
    state = { ...state, active: found };
  } else {
    const inbox = freshInbox(local, domain);
    const inboxes = [...state.inboxes, inbox].slice(-MAX_INBOXES);
    state = { ...state, inboxes, active: inboxes.length - 1, domain };
  }
  const url = new URL(window.location.href);
  url.searchParams.delete("inbox");
  window.history.replaceState(null, "", url);
}

export const market = {
  /** GENERATE: write a new address for the active plate. */
  generate() {
    const wanted = trimDots(sanitizeLocal(state.username));
    const local = isValidLocal(wanted) ? wanted : randomLocal();
    const cur = state.inboxes[state.active];
    if (!cur) {
      set({ inboxes: [freshInbox(local, state.domain)], active: 0 });
      return;
    }
    updateActive((i) => ({ ...freshInbox(local, state.domain, i.serial + 1), id: i.id }));
  },
  /** "Change address": a fresh random name, same bag. */
  changeAddress() {
    const cur = state.inboxes[state.active];
    const domain = cur?.domain ?? state.domain;
    if (!cur) {
      set({ inboxes: [freshInbox(randomLocal(), domain)], active: 0 });
      return;
    }
    updateActive((i) => ({ ...freshInbox(randomLocal(), domain, i.serial + 1), id: i.id }));
  },
  /** RANDOM: roll a username into the input. */
  randomUsername() {
    set({ username: randomLocal() });
  },
  setUsername(v: string) {
    set({ username: sanitizeLocal(v) });
  },
  setDomain(domain: Domain) {
    if (isDomain(domain)) set({ domain });
  },
  addInbox() {
    if (state.inboxes.length >= MAX_INBOXES) return false;
    const inboxes = [...state.inboxes, freshInbox(randomLocal(), state.domain)];
    set({ inboxes, active: inboxes.length - 1 });
    return true;
  },
  switchInbox(index: number) {
    if (index >= 0 && index < state.inboxes.length) set({ active: index });
  },
  /** DELETE: the nota goes in the basket and the plate is freed. */
  removeActive() {
    const inboxes = state.inboxes.filter((_, k) => k !== state.active);
    set({ inboxes, active: Math.max(0, Math.min(state.active, inboxes.length - 1)) });
  },
  extend() {
    const now = Date.now();
    updateActive((i) => {
      const expiresAt = Math.min(Math.max(now, i.expiresAt) + EXTEND_MS, now + MAX_LIFE_MS);
      return { ...i, expiresAt, lifeMs: expiresAt - now };
    });
  },
  markRead(id: string) {
    updateActive((i) => ({ ...i, letters: i.letters.map((l) => (l.id === id ? { ...l, read: true } : l)) }));
  },
  setForward(email: string | null) {
    updateActive((i) => ({ ...i, forwardTo: email }));
  },
  toggleSpamFilter() {
    set({ spamFilter: !state.spamFilter });
  },
  /** Asks for permission the first time. Resolves to the new setting. */
  async toggleNotify(): Promise<"on" | "off" | "blocked"> {
    if (state.notify) {
      set({ notify: false });
      return "off";
    }
    if (typeof Notification === "undefined") return "blocked";
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") return "blocked";
    set({ notify: true });
    return "on";
  },
  receive(letter: Letter) {
    const cur = state.inboxes[state.active];
    if (!cur || isExpired(cur, Date.now())) return;
    const withFwd = cur.forwardTo && !letter.spam ? { ...letter, forwarded: cur.forwardTo } : letter;
    // listeners first, so views know the letter is new when they re-render
    listenersMail.forEach((l) => l(withFwd));
    updateActive((i) => ({ ...i, letters: [withFwd, ...i.letters].slice(0, MAX_LETTERS) }));
    notifyLetter(withFwd);
  },
};

// --------------------------------------------------------------- pump
const listenersMail = new Set<(l: Letter) => void>();
export const onLetter = (fn: (l: Letter) => void) => {
  listenersMail.add(fn);
  return () => {
    listenersMail.delete(fn);
  };
};

function notifyLetter(l: Letter) {
  if (!state.notify || !document.hidden || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted" || (l.spam && state.spamFilter)) return;
  try {
    new Notification(`Surat baru: ${l.subject}`, { body: `dari ${l.fromName}`, tag: "venbee-mail" });
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}

/** One delivery. The real backend poll goes here. */
export function pumpOnce() {
  const cur = state.inboxes[state.active];
  if (!cur || isExpired(cur, Date.now())) return false;
  market.receive(makeLetter(addressOf(cur)));
  return true;
}

let pumpTimer: ReturnType<typeof setInterval> | undefined;
export function startMailPump() {
  if (pumpTimer) return () => undefined;
  pumpTimer = setInterval(pumpOnce, MAIL_EVERY_MS);
  return () => {
    clearInterval(pumpTimer);
    pumpTimer = undefined;
  };
}

// --------------------------------------------------------------- hooks
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useMarket() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

export const getMarket = () => state;
export const activeInbox = (m: Market): Inbox | undefined => m.inboxes[m.active];

// a shared 1 s clock for candles and countdowns
let now = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | undefined;
function subscribeClock(l: () => void) {
  clockListeners.add(l);
  if (!clockTimer) {
    now = Date.now();
    clockTimer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((f) => f());
    }, 1000);
  }
  return () => {
    clockListeners.delete(l);
    if (!clockListeners.size && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}
/** Wall clock that ticks once a second (0 on the server). */
export function useNow() {
  return useSyncExternalStore(subscribeClock, () => (now ||= Date.now()), () => 0);
}

