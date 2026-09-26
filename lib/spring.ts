/**
 * The shared button spring (stiffness 400, damping 18, mass 1), as a CSS
 * `linear()` easing so release animations need no JavaScript per frame, and as
 * a plain function for GSAP.
 */
export const SPRING = { stiffness: 400, damping: 18, mass: 1 } as const;

const w0 = Math.sqrt(SPRING.stiffness / SPRING.mass);
const zeta = SPRING.damping / (2 * Math.sqrt(SPRING.stiffness * SPRING.mass));
const wd = w0 * Math.sqrt(1 - zeta * zeta);

/** Position of the spring (0 -> 1) at time t seconds. */
export function springAt(t: number) {
  return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
}

/** Seconds until the spring stays within 0.2% of rest. */
export const SPRING_SECONDS = Math.ceil((Math.log(1 / 0.002) / (zeta * w0)) * 100) / 100;
export const SPRING_MS = Math.round(SPRING_SECONDS * 1000);

/** GSAP-compatible ease over SPRING_SECONDS. */
export const springEase = (p: number) => (p >= 1 ? 1 : springAt(p * SPRING_SECONDS));

/** CSS linear() easing sampled from the spring. */
export function springLinear(samples = 40) {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    pts.push(String(Math.round(springEase(p) * 1000) / 1000));
  }
  return `linear(${pts.join(", ")})`;
}
