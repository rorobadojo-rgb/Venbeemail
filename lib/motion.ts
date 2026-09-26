import { useSyncExternalStore } from "react";

/**
 * Motion / layout modes. Keep these in sync with the media queries in the
 * stylesheets (the CSS applies the same fallbacks before JS runs).
 */
export const REDUCED = "(prefers-reduced-motion: reduce)";
/** Phones, tablets and touch screens get the static lane (no live 3D). */
export const STATIC_LANE = "(max-width: 899.98px), (pointer: coarse)";

const matches = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const prefersReducedMotion = () => matches(REDUCED);
export const wantsStaticLane = () => matches(STATIC_LANE);

function subscribeTo(q: string) {
  return (cb: () => void) => {
    const m = window.matchMedia(q);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  };
}
const subscribeReduced = subscribeTo(REDUCED);

/** Live `prefers-reduced-motion`, false on the server. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => matches(REDUCED), () => false);
}

/** Random delay in [min, max) ms. */
export const between = (min: number, max: number) => min + Math.random() * (max - min);
