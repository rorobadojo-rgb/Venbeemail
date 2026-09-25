/**
 * Layout/motion modes. Keep these in sync with the media queries in
 * styles/comic.css (the CSS applies the same layouts before JS runs).
 */
export const CINEMATIC =
  "(min-width: 960px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";
export const FLOW =
  "(max-width: 959.98px) and (prefers-reduced-motion: no-preference), (max-height: 599.98px) and (prefers-reduced-motion: no-preference)";
export const REDUCED = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
