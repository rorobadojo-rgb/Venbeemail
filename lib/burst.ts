import { gsap } from "gsap";
import { prefersReducedMotion } from "./motion";

export type BurstColor = "red" | "blue" | "cream" | "ink";
type BurstOptions = {
  text: string;
  color?: BurstColor;
  /** spread of the halftone particles, in px */
  size?: number;
  particles?: number;
  /** draw a jagged starburst behind the word (POW!, BOOM!) */
  star?: boolean;
};

/**
 * Comic onomatopoeia burst ("KLIK!", "POW!", ...): halftone particles fly out
 * and the word pops, then everything fades. `at` is the element (or pointer
 * position) the burst comes from; `host` must be position:relative.
 */
export function burst(host: HTMLElement, at: Element | { clientX: number; clientY: number }, o: BurstOptions) {
  const hr = host.getBoundingClientRect();
  // the host may sit inside the scaled comic camera; convert to local px
  const k = hr.width / (host.offsetWidth || hr.width || 1);
  let cx: number;
  let cy: number;
  if (at instanceof Element) {
    const r = at.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  } else {
    cx = at.clientX;
    cy = at.clientY;
  }
  const el = document.createElement("div");
  el.className = `burst burst--${o.color ?? "red"}`;
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${(cx - hr.left) / k}px`;
  el.style.top = `${(cy - hr.top) / k}px`;
  if (o.star) {
    const star = document.createElement("span");
    star.className = "burst__star";
    el.appendChild(star);
  }
  const word = document.createElement("span");
  word.className = "burst__text";
  word.textContent = o.text;
  el.appendChild(word);
  host.appendChild(el);

  const tl = gsap.timeline({ onComplete: () => el.remove() });
  if (prefersReducedMotion()) {
    gsap.set(word, { xPercent: -50, yPercent: -50 });
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }).to(el, { autoAlpha: 0, duration: 0.3, delay: 0.6 });
    return;
  }
  const n = o.particles ?? 10;
  const spread = o.size ?? 90;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "burst__dot";
    const s = 10 + Math.random() * 20;
    p.style.width = p.style.height = `${s}px`;
    p.style.margin = `${-s / 2}px 0 0 ${-s / 2}px`;
    el.insertBefore(p, word);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
    const d = spread * (0.45 + Math.random() * 0.75);
    tl.fromTo(
      p,
      { x: 0, y: 0, scale: 0.2, autoAlpha: 1 },
      { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 1, autoAlpha: 0, duration: 0.55 + Math.random() * 0.3, ease: "power3.out" },
      0,
    );
  }
  const star = el.querySelector(".burst__star");
  if (star) {
    tl.fromTo(star, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(3)" }, 0).to(
      star,
      { scale: 1.25, autoAlpha: 0, duration: 0.3 },
      0.5,
    );
  }
  gsap.set(word, { xPercent: -50, yPercent: -50 });
  tl.fromTo(
    word,
    { scale: 0, rotation: gsap.utils.random(-16, 16) },
    { scale: 1, duration: 0.3, ease: "back.out(4)" },
    0,
  ).to(word, { y: -34, autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 0.6);
}
