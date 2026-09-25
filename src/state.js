// Shared runtime flags.
const mq = (q) => (typeof matchMedia === 'function' ? matchMedia(q) : { matches: false, addEventListener() {} });

export const reducedMQ = mq('(prefers-reduced-motion: reduce)');
export const mobileMQ = mq('(max-width: 820px), (pointer: coarse)');

export const state = {
  reduced: reducedMQ.matches,
  mobile: mobileMQ.matches,
};

export function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    return null;
  }
  return value;
}
