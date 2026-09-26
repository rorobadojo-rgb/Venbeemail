import { useSyncExternalStore } from "react";
import { DOMAIN_NAMES, isDomain, type Domain } from "./domains";

/**
 * The Zombie Mart mailbox demo: up to three inboxes ("baskets"), each with its
 * own address, expiry countdown and messages. Everything runs in the browser
 * and is remembered in localStorage. Demo mail arrives every 8 s.
 *
 * Where a real mail backend plugs in:
 *   - generateLocalPart()        ask the API for an address
 *   - deliverDemo()              replace with polling / a websocket
 *   - setForward()               POST the forwarding target
 */
export type Message = {
  id: string;
  fromName: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  at: number;
  read: boolean;
  spam: boolean;
  forwardedTo?: string;
};

export type Inbox = {
  id: string;
  local: string | null;
  domain: Domain;
  createdAt: number;
  expiresAt: number;
  messages: Message[];
  /** spam dropped by the filter */
  blocked: number;
  /** bumps whenever the address changes, so views can replay their print animation */
  serial: number;
};

export type MailState = {
  inboxes: Inbox[];
  active: string;
  spamFilter: boolean;
  notify: boolean;
  forwardTo: string | null;
  ready: boolean;
};

export type MailEvent =
  | { type: "delivered"; inbox: string; message: Message; filtered: boolean }
  | { type: "expired"; inbox: string };

export const MAX_INBOXES = 3;
export const LIFETIME_MS = 10 * 60 * 1000;
export const EXTEND_MS = 10 * 60 * 1000;
export const MAX_LEFT_MS = 60 * 60 * 1000;
export const DELIVERY_MS = 8000;
const MAX_MESSAGES = 20;
const KEY = "venbee:mart:v1";

const NOUNS = [
  "cilok", "bakso", "seblak", "cireng", "tahu", "tempe", "kerupuk", "sendal", "bebek", "cicak",
  "kucing", "kopi", "mangga", "otak", "odading", "martabak", "gorengan", "sambal", "kecap", "lontong",
  "kaleng", "struk", "kasir", "troli",
];
const MOODS = [
  "ngantuk", "galak", "pedas", "kilat", "rebahan", "santuy", "gabut", "kalem", "nekat", "misterius",
  "busuk", "sultan", "hemat", "bingung", "turbo", "sakti", "lapar", "zombi",
];

function rand(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}
const uid = () => `${Date.now().toString(36)}${rand(1e9).toString(36)}`;

export function generateLocalPart() {
  return `${NOUNS[rand(NOUNS.length)]}.${MOODS[rand(MOODS.length)]}${rand(900) + 100}`;
}

/** Normalise a custom username; returns null when it can't be an address. */
export function cleanLocalPart(input: string) {
  const v = input.trim().toLowerCase().replace(/@.*$/, "").replace(/\s+/g, ".");
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,28}[a-z0-9])?$/.test(v) || v.includes("..")) return null;
  return v;
}

export const addressOf = (i: Pick<Inbox, "local" | "domain"> | undefined) => (i?.local ? `${i.local}@${i.domain}` : null);
export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

function newInbox(domain: Domain = DOMAIN_NAMES[0], local: string | null = generateLocalPart()): Inbox {
  const now = Date.now();
  return { id: uid(), local, domain, createdAt: now, expiresAt: now + LIFETIME_MS, messages: [], blocked: 0, serial: 1 };
}

const SERVER: MailState = {
  inboxes: [{ id: "srv", local: null, domain: DOMAIN_NAMES[0], createdAt: 0, expiresAt: 0, messages: [], blocked: 0, serial: 0 }],
  active: "srv",
  spamFilter: true,
  notify: false,
  forwardTo: null,
  ready: false,
};

let state: MailState = SERVER;
const listeners = new Set<() => void>();
const eventListeners = new Set<(e: MailEvent) => void>();

function persist() {
  try {
    const { inboxes, active, spamFilter, notify, forwardTo } = state;
    localStorage.setItem(KEY, JSON.stringify({ inboxes, active, spamFilter, notify, forwardTo }));
  } catch {
    /* storage unavailable */
  }
}

function set(next: MailState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function patchInbox(id: string, fn: (i: Inbox) => Inbox) {
  set({ ...state, inboxes: state.inboxes.map((i) => (i.id === id ? fn(i) : i)) });
}

export const activeInbox = (s: MailState = state) => s.inboxes.find((i) => i.id === s.active) ?? s.inboxes[0];

function emit(e: MailEvent) {
  eventListeners.forEach((l) => l(e));
}
export function onMailEvent(l: (e: MailEvent) => void) {
  eventListeners.add(l);
  return () => void eventListeners.delete(l);
}

// ------------------------------------------------------------------ demo mail
type Template = { fromName: string; from: string; subject: string; body: string; spam?: boolean };
const code = () => String(rand(900000) + 100000);
const TEMPLATES: (() => Template)[] = [
  () => {
    const c = code();
    return {
      fromName: "Toko Oren Online", from: "noreply@toko-oren.example",
      subject: `Kode verifikasi kamu: ${c}`,
      body: `Halo!\n\nKode verifikasi kamu: ${c}\nBerlaku 5 menit. Jangan kasih ke siapa pun, termasuk zombie yang ngaku kasir.\n\nSalam,\nToko Oren Online`,
    };
  },
  () => ({
    fromName: "Kuburan Streaming", from: "halo@kuburan-stream.example",
    subject: "Selamat datang! Akunmu sudah aktif",
    body: "Akun kamu sudah aktif. Film horor pertama gratis, sisanya juga gratis karena kamu pakai email sementara.\n\nSelamat menonton (sambil nutup mata).",
  }),
  () => ({
    fromName: "Newsletter Kerupuk", from: "promo@kerupuk-blast.example",
    subject: "PROMO!!! Beli 2 gratis 1 (eh, kebalik)",
    body: "Diskon besar-besaran untuk kerupuk yang sudah melempem. Klik di sini, di sana, di mana-mana.",
    spam: true,
  }),
  () => {
    const c = code();
    return {
      fromName: "Forum Resep Otak", from: "admin@resep-otak.example",
      subject: "Konfirmasi alamat email kamu",
      body: `Satu langkah lagi! Masukkan kode ${c} untuk mengaktifkan akun forum.\n\nResep minggu ini: otak-otak bakar (ikan, tenang).`,
    };
  },
  () => ({
    fromName: "Pangeran Kaya Raya", from: "pangeran@warisan-asli.example",
    subject: "Warisan 10 miliar menunggumu!!!",
    body: "Saya pangeran sungguhan. Kirim nomor rekening dan PIN, warisan langsung cair. Percaya deh.",
    spam: true,
  }),
  () => {
    const c = code();
    return {
      fromName: "Game Gratisan", from: "support@game-gratisan.example",
      subject: "Reset password akunmu",
      body: `Ada yang minta reset password. Kalau itu kamu, pakai kode ${c}.\nKalau bukan kamu... mungkin itu zombie. Abaikan saja.`,
    };
  },
  () => ({
    fromName: "Tiket Konser Zombi", from: "tiket@konser-zombi.example",
    subject: `E-tiket kamu #ZM-${rand(90000) + 10000}`,
    body: "Tiket konser \"Malam Tanpa Otak\" sudah terbit. Tunjukkan email ini di pintu masuk. Dilarang menggigit penonton lain.",
  }),
  () => ({
    fromName: "Bank Hantu", from: "keamanan@bank-hantu.example",
    subject: "PERINGATAN: akun kamu diblokir! Klik sekarang",
    body: "Akun kamu diblokir. Klik tautan mencurigakan ini untuk membuka blokir. (Ini spam. Jangan diklik.)",
    spam: true,
  }),
  () => ({
    fromName: "Kasir Zombie Mart", from: "kasir@zombie-mart.example",
    subject: "Struk belanja kamu",
    body: "Terima kasih sudah belanja!\n\n1x Email sementara ..... Rp0\n1x Privasi .............. Rp0\n\nTOTAL: Rp0\nJangan lupa bawa kantong sendiri.",
  }),
  () => ({
    fromName: "Survei Kulkas", from: "survei@kulkas-dingin.example",
    subject: "Isi survei 30 detik, dapat es batu gratis",
    body: "Pertanyaan 1 dari 400: seberapa dingin kulkas kamu?",
    spam: true,
  }),
];
let templateCursor = rand(TEMPLATES.length);

function deliverDemo(to: Inbox) {
  const address = addressOf(to);
  if (!address) return;
  const t = TEMPLATES[templateCursor++ % TEMPLATES.length]();
  const message: Message = {
    id: uid(),
    ...t,
    spam: !!t.spam,
    to: address,
    at: Date.now(),
    read: false,
    forwardedTo: state.forwardTo && !t.spam ? state.forwardTo : undefined,
  };
  const filtered = message.spam && state.spamFilter;
  patchInbox(to.id, (i) =>
    filtered ? { ...i, blocked: i.blocked + 1 } : { ...i, messages: [message, ...i.messages].slice(0, MAX_MESSAGES) },
  );
  emit({ type: "delivered", inbox: to.id, message, filtered });
}

// ------------------------------------------------------------------ actions
export const mailActions = {
  /** New address for the active basket (custom username if given). */
  generate(custom?: string | null) {
    const local = (custom && cleanLocalPart(custom)) || generateLocalPart();
    const now = Date.now();
    patchInbox(state.active, (i) => ({
      ...i, local, createdAt: now, expiresAt: now + LIFETIME_MS, messages: [], blocked: 0, serial: i.serial + 1,
    }));
    scheduleNext(3000);
  },
  /** Pick a domain from the shelf: same username, new domain, fresh inbox. */
  setDomain(domain: Domain) {
    const i = activeInbox();
    if (i.domain === domain) return;
    const now = Date.now();
    patchInbox(i.id, (x) => ({
      ...x, domain, local: x.local ?? generateLocalPart(), createdAt: now, expiresAt: now + LIFETIME_MS,
      messages: [], blocked: 0, serial: x.serial + 1,
    }));
    scheduleNext(3000);
  },
  changeAddress(local: string, domain: Domain) {
    const clean = cleanLocalPart(local);
    if (!clean) return false;
    const now = Date.now();
    patchInbox(state.active, (i) => ({
      ...i, local: clean, domain, createdAt: now, expiresAt: now + LIFETIME_MS, messages: [], blocked: 0, serial: i.serial + 1,
    }));
    scheduleNext(3000);
    return true;
  },
  trash() {
    patchInbox(state.active, (i) => ({ ...i, local: null, messages: [], blocked: 0, expiresAt: 0 }));
  },
  extend() {
    const now = Date.now();
    patchInbox(state.active, (i) => ({ ...i, expiresAt: Math.min(Math.max(i.expiresAt, now) + EXTEND_MS, now + MAX_LEFT_MS) }));
  },
  /** Check for mail now (REFRESH). Returns false when there was nothing new. */
  refresh() {
    const i = activeInbox();
    if (!i.local) return false;
    if (Date.now() - lastDelivery < 2500) return false;
    lastDelivery = Date.now();
    deliverDemo(i);
    scheduleNext(DELIVERY_MS);
    return true;
  },
  addInbox() {
    if (state.inboxes.length >= MAX_INBOXES) return false;
    const used = new Set(state.inboxes.map((i) => i.domain));
    const domain = DOMAIN_NAMES.find((d) => !used.has(d)) ?? DOMAIN_NAMES[0];
    const inbox = newInbox(domain);
    set({ ...state, inboxes: [...state.inboxes, inbox], active: inbox.id });
    scheduleNext(3000);
    return true;
  },
  removeInbox(id: string) {
    if (state.inboxes.length <= 1) return;
    const inboxes = state.inboxes.filter((i) => i.id !== id);
    set({ ...state, inboxes, active: state.active === id ? inboxes[0].id : state.active });
  },
  setActive(id: string) {
    if (state.inboxes.some((i) => i.id === id)) set({ ...state, active: id });
  },
  setSpamFilter(on: boolean) {
    set({ ...state, spamFilter: on });
  },
  setNotify(on: boolean) {
    set({ ...state, notify: on });
  },
  setForward(email: string | null) {
    set({ ...state, forwardTo: email && isValidEmail(email) ? email.trim() : null });
  },
  markRead(msgId: string) {
    patchInbox(state.active, (i) => ({ ...i, messages: i.messages.map((m) => (m.id === msgId ? { ...m, read: true } : m)) }));
  },
  deleteMessage(msgId: string) {
    patchInbox(state.active, (i) => ({ ...i, messages: i.messages.filter((m) => m.id !== msgId) }));
  },
};

// ------------------------------------------------------------------ lifecycle
let started = false;
let lastDelivery = 0;
let nextAt = 0;

function scheduleNext(ms: number) {
  nextAt = Date.now() + ms;
}

function tick() {
  const now = Date.now();
  // expiry
  for (const i of state.inboxes) {
    if (i.local && i.expiresAt && now >= i.expiresAt) {
      patchInbox(i.id, (x) => ({ ...x, local: null, messages: [], blocked: 0, expiresAt: 0 }));
      emit({ type: "expired", inbox: i.id });
    }
  }
  // demo delivery: the active basket every 8 s, now and then another one
  if (nextAt && now >= nextAt) {
    const active = activeInbox();
    const others = state.inboxes.filter((i) => i.id !== active.id && i.local);
    const target = others.length && rand(3) === 0 ? others[rand(others.length)] : active;
    if (target.local) {
      lastDelivery = now;
      deliverDemo(target);
    }
    scheduleNext(DELIVERY_MS);
  }
}

/** Restore saved baskets (or open the first one) and start the clock. Client only. */
export function startMail() {
  if (started) return;
  started = true;
  let restored: MailState | null = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved && Array.isArray(saved.inboxes) && saved.inboxes.length) {
      const inboxes: Inbox[] = saved.inboxes
        .slice(0, MAX_INBOXES)
        .filter((i: Inbox) => i && typeof i.id === "string" && isDomain(i.domain))
        .map((i: Inbox) => ({ ...i, messages: Array.isArray(i.messages) ? i.messages.slice(0, MAX_MESSAGES) : [] }));
      if (inboxes.length) {
        restored = {
          inboxes,
          active: inboxes.some((i) => i.id === saved.active) ? saved.active : inboxes[0].id,
          spamFilter: saved.spamFilter !== false,
          notify: !!saved.notify,
          forwardTo: typeof saved.forwardTo === "string" && isValidEmail(saved.forwardTo) ? saved.forwardTo : null,
          ready: true,
        };
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const first = newInbox();
  set(restored ?? { inboxes: [first], active: first.id, spamFilter: true, notify: false, forwardTo: null, ready: true });

  // an inbox link (#kotak=name@domain) opens that address in a basket
  const m = /[#&]kotak=([^&]+)/.exec(location.hash);
  if (m) {
    const [local, domain] = decodeURIComponent(m[1]).split("@");
    const clean = cleanLocalPart(local ?? "");
    if (clean && isDomain(domain)) {
      const existing = state.inboxes.find((i) => i.local === clean && i.domain === domain);
      if (existing) set({ ...state, active: existing.id });
      else if (state.inboxes.length < MAX_INBOXES) {
        const inbox = newInbox(domain, clean);
        set({ ...state, inboxes: [...state.inboxes, inbox], active: inbox.id });
      } else patchInbox(state.active, (i) => ({ ...newInbox(domain, clean), id: i.id, serial: i.serial + 1 }));
    }
    history.replaceState(null, "", location.pathname + location.search);
  }
  scheduleNext(3000);
  window.setInterval(tick, 500);
}

export function inboxLink(i: Inbox) {
  const address = addressOf(i);
  if (!address) return null;
  return `${location.origin}${location.pathname}#kotak=${encodeURIComponent(address)}`;
}

// ------------------------------------------------------------------ .eml
function encodeHeader(s: string) {
  // RFC 2047 for anything outside printable ASCII
  if (/^[\x20-\x7e]*$/.test(s)) return s;
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

export function toEml(m: Message) {
  const lines = [
    `From: ${encodeHeader(`"${m.fromName}"`)} <${m.from}>`,
    `To: <${m.to}>`,
    `Subject: ${encodeHeader(m.subject)}`,
    `Date: ${new Date(m.at).toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${m.id}@venbeemail.demo>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "X-Mailer: VenbeeMail Zombie Mart (demo)",
    "",
    m.body,
    "",
  ];
  return lines.join("\r\n");
}

export function downloadEml(m: Message) {
  const blob = new Blob([toEml(m)], { type: "message/rfc822" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${m.subject.replace(/[^\w\- ]+/g, "").trim().slice(0, 40).replace(/\s+/g, "-") || "pesan"}.eml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ------------------------------------------------------------------ react
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
