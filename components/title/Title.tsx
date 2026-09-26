"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { playThrottled } from "@/lib/sound";
import { TITLE } from "./glyphs";
import { Letter } from "./Letter";
import { Vending } from "./Vending";

/**
 * "VenbeeMail" in custom hand-cut lettering. "Venbee" is zombie slime
 * (drips, bubbles, bite holes, stitches, an eyeball); "Mail" is label red with
 * a cream outline. On load the letters drop out of the vending machine chute
 * one by one and bounce onto the shelf.
 */
export function Title() {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<SVGSVGElement>(".tl"));
    const chute = el.querySelector<SVGRectElement>(".vm__chute");
    const flap = el.querySelector<SVGRectElement>(".vm__flap");
    if (prefersReducedMotion() || !chute) {
      el.classList.add("is-in");
      return;
    }
    const c = chute.getBoundingClientRect();
    const cx = c.left + c.width * 0.6;
    const cy = c.top + c.height * 0.5;
    const tl = gsap.timeline({ delay: 0.35, onComplete: () => el.classList.add("is-in") });
    letters.forEach((svg, i) => {
      const r = svg.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      const at = i * 0.13;
      const peak = Math.min(dy, 0) - 70 - Math.abs(dx) * 0.12;
      gsap.set(svg, { x: dx, y: dy, scale: 0.28, rotation: gsap.utils.random(-60, 60), autoAlpha: 0 });
      if (flap) tl.fromTo(flap, { scaleY: 1 }, { scaleY: 0.15, svgOrigin: "65 205", duration: 0.08, yoyo: true, repeat: 1 }, at);
      tl.set(svg, { autoAlpha: 1 }, at + 0.02)
        .to(svg, { x: 0, rotation: 0, scale: 1, duration: 0.8, ease: "power1.out" }, at + 0.02)
        .to(svg, { keyframes: [{ y: peak, duration: 0.34, ease: "power2.out" }, { y: 0, duration: 0.62, ease: "bounce.out" }] }, at + 0.02)
        .call(() => playThrottled("slap", 60, { volume: 0.5, rate: 0.9 + i * 0.03 }), [], at + 0.5);
    });
    return () => {
      tl.kill();
      gsap.set(letters, { clearProps: "all" });
    };
  }, []);

  return (
    <h1 ref={root} className="title">
      <span className="sr-only">VenbeeMail</span>
      <span className="title__art" aria-hidden="true">
        <Vending className="title__machine" />
        <span className="title__word title__word--venbee">
          {TITLE.slice(0, 6).map((l, i) => (
            <Letter key={i} l={l} i={i} />
          ))}
        </span>
        <span className="title__word title__word--mail">
          {TITLE.slice(6).map((l, i) => (
            <Letter key={i + 6} l={l} i={i + 6} />
          ))}
        </span>
      </span>
    </h1>
  );
}
