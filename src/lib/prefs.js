// Environment flags + tiny helpers shared by every module.
const mq = (q) => (typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false);

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
export const coarsePointer = mq('(pointer: coarse)') || !mq('(hover: hover)');
/** "Mobile" = touch-first or narrow: no physics drag, fewer stickers. */
export const isMobile = () => coarsePointer || window.innerWidth < 760;

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / storage disabled: state just won't persist */
    }
  },
};

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** App-wide event bus: 'address' (detail: string|''), 'generate', 'toss'. */
export const bus = new EventTarget();
export const emit = (type, detail) => bus.dispatchEvent(new CustomEvent(type, { detail }));
export const on = (type, fn) => bus.addEventListener(type, (e) => fn(e.detail));

export const idle = (fn, timeout = 1500) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);
