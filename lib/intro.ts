/**
 * The hero entrance (letters dropping out of the vending machine) should run
 * on a quiet main thread, so heavier work such as the WebGL mart waits for it.
 */
let done = false;
const waiting = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

/** Run `fn` once the intro has finished (or after `maxMs`, whichever is first). */
export function afterIntro(fn: () => void, maxMs = 5000) {
  if (done) {
    fn();
    return () => undefined;
  }
  let fired = false;
  const once = () => {
    if (fired) return;
    fired = true;
    window.clearTimeout(timer);
    waiting.delete(once);
    fn();
  };
  const timer = window.setTimeout(once, maxMs);
  waiting.add(once);
  return () => {
    fired = true;
    window.clearTimeout(timer);
    waiting.delete(once);
  };
}
