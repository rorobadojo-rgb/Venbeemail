/**
 * Layout / motion modes. Keep in sync with the media queries in styles/*.css.
 *
 * FULL_3D:  desktop with a fine pointer and motion allowed -> the WebGL mart
 * everything else gets the flat CSS poster wall (2 animated posters), and
 * REDUCED switches every non-essential animation off.
 */
export const FULL_3D =
  "(min-width: 900px) and (min-height: 560px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
export const REDUCED = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
