import { prefersReducedMotion } from "./motion";

/**
 * Store lighting, shared by the WebGL mart and the DOM.
 *
 * level:  master brightness multiplier (flickers when the sign is clicked)
 * off:    how many aisles have been switched off (the footer closes the shop)
 *
 * The 3D scene reads this object every frame; the DOM gets CSS variables
 * (--lights on <html>) and a data-aisles-off attribute.
 */
export const AISLES = 4;
export const lights = { level: 1, off: 0, version: 0 };

const listeners = new Set<() => void>();
function emit() {
  lights.version++;
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--lights", lights.level.toFixed(3));
    root.dataset.aislesOff = String(lights.off);
  }
  listeners.forEach((l) => l());
}

export function onLights(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

let flickering = false;
/** One fluorescent flicker (~0.8 s). */
export function flicker() {
  if (flickering || typeof window === "undefined") return;
  if (prefersReducedMotion()) return;
  flickering = true;
  // [time ms, level]
  const keys: [number, number][] = [
    [0, 1], [40, 0.25], [90, 0.95], [130, 0.15], [210, 0.8], [260, 0.35], [330, 1.15], [420, 0.55], [520, 1.05], [800, 1],
  ];
  const t0 = performance.now();
  const step = () => {
    const t = performance.now() - t0;
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
    lights.level = keys[i][1];
    emit();
    if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
    else {
      lights.level = 1;
      flickering = false;
      emit();
    }
  };
  requestAnimationFrame(step);
}

export function setAislesOff(n: number) {
  const v = Math.max(0, Math.min(AISLES, n));
  if (v === lights.off) return;
  lights.off = v;
  emit();
}
