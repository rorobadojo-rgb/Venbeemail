import { useSyncExternalStore } from "react";

/**
 * Disposable-address state for the demo. Addresses are generated in the
 * browser (crypto.getRandomValues) and remembered in localStorage until the
 * user hits TRASH. Swap `generateLocalPart` for an API call when the real
 * mail backend exists.
 */
export const DOMAINS = ["peler.com", "ewe.com", "bawok.com", "vevek.com", "pentil.com"] as const;
export type Domain = (typeof DOMAINS)[number];

export type MailState = {
  local: string | null;
  domain: Domain;
  /** bumps on every GENERATE, so views can replay their arrival animation */
  serial: number;
  createdAt: number;
};

const KEY = "venbee:address";
const NOUNS = [
  "cilok", "bakso", "seblak", "cireng", "tahu", "tempe", "kerupuk", "sendal", "bebek", "cicak",
  "kucing", "kopi", "mangga", "rambutan", "odading", "martabak", "gorengan", "sambal", "kecap", "lontong",
];
const MOODS = [
  "ngantuk", "galak", "pedas", "kilat", "rebahan", "santuy", "gabut", "kalem", "nekat", "misterius",
  "ceria", "sultan", "hemat", "bingung", "turbo", "sakti",
];

const SERVER: MailState = { local: null, domain: "peler.com", serial: 0, createdAt: 0 };
let state: MailState = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

function rand(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}

export function generateLocalPart() {
  const digits = String(rand(900) + 100);
  return `${NOUNS[rand(NOUNS.length)]}.${MOODS[rand(MOODS.length)]}${digits}`;
}

function persist() {
  try {
    if (state.local) localStorage.setItem(KEY, JSON.stringify({ local: state.local, domain: state.domain, createdAt: state.createdAt }));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

function set(patch: Partial<MailState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

/** Restore the saved address, or mint a first one. Call once on the client. */
export function loadMail() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved && typeof saved.local === "string" && DOMAINS.includes(saved.domain)) {
      set({ local: saved.local, domain: saved.domain, createdAt: saved.createdAt ?? Date.now(), serial: 1 });
      return;
    }
  } catch {
    /* ignore corrupt storage */
  }
  set({ local: generateLocalPart(), createdAt: Date.now(), serial: 1 });
}

export const mailActions = {
  generate() {
    set({ local: generateLocalPart(), createdAt: Date.now(), serial: state.serial + 1 });
  },
  setDomain(domain: Domain) {
    set({ domain });
  },
  trash() {
    set({ local: null, createdAt: 0 });
  },
};

export const addressOf = (s: MailState) => (s.local ? `${s.local}@${s.domain}` : null);

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useMail() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers / insecure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
