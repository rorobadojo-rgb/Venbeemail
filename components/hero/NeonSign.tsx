"use client";

import { gsap } from "gsap";
import { useRef } from "react";
import { ZombieLogo, type ZombieLogoHandle } from "@/components/logo/ZombieLogo";
import { flicker } from "@/lib/lights";
import { prefersReducedMotion } from "@/lib/motion";
import { play, playLaugh, playThrottled } from "@/lib/sound";

/**
 * The store's hanging neon sign: the official logo on two chains.
 * Idle: blinks, pupils follow the cursor, slime drips onto the counter.
 * Hover: buzzes brighter. Click: zombie laugh + chain rattle, the sign swings,
 * slime splashes and the fluorescent tubes flicker once.
 */
export function NeonSign() {
  const root = useRef<HTMLDivElement>(null);
  const swing = useRef<HTMLButtonElement>(null);
  const logo = useRef<ZombieLogoHandle>(null);

  const splash = () => {
    const host = root.current;
    const sw = swing.current;
    if (!host || !sw) return;
    const hr = host.getBoundingClientRect();
    const sr = sw.getBoundingClientRect();
    const floor = hr.height + 70; // the counter below the sign
    for (let i = 0; i < 12; i++) {
      const b = document.createElement("span");
      b.className = "splat";
      b.setAttribute("aria-hidden", "true");
      host.appendChild(b);
      const x0 = sr.left - hr.left + sr.width * gsap.utils.random(0.25, 0.8);
      const y0 = sr.bottom - hr.top - sr.height * 0.12;
      const vx = gsap.utils.random(-140, 140);
      const s = gsap.utils.random(0.5, 1.2);
      gsap
        .timeline({ onComplete: () => b.remove() })
        .set(b, { x: x0, y: y0, scale: s })
        .to(b, { x: x0 + vx, duration: 0.7, ease: "none" }, 0)
        .to(b, { keyframes: [{ y: y0 - gsap.utils.random(40, 110), duration: 0.25, ease: "power2.out" }, { y: floor, duration: 0.45, ease: "power2.in" }] }, 0)
        .to(b, { scaleX: s * 2.2, scaleY: s * 0.35, duration: 0.12, ease: "power2.out" }, 0.7)
        .to(b, { autoAlpha: 0, duration: 0.5 }, 1.3);
    }
  };

  const onClick = () => {
    playLaugh();
    play("chain");
    window.setTimeout(() => play("splash"), 160);
    window.setTimeout(() => play("flicker"), 60);
    flicker();
    logo.current?.laugh();
    if (prefersReducedMotion()) return;
    const sw = swing.current;
    if (sw) {
      gsap.killTweensOf(sw);
      gsap.fromTo(sw, { rotation: gsap.utils.random(0, 1) > 0.5 ? 11 : -11 }, { rotation: 0, duration: 2.6, ease: "elastic.out(1.05, 0.18)" });
    }
    splash();
  };

  return (
    <div ref={root} className="sign">
      <button
        ref={swing}
        type="button"
        className="sign__swing"
        aria-label="Logo VenbeeMail. Klik biar zombinya ketawa"
        onClick={onClick}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") playThrottled("neon", 900, { volume: 0.6 });
        }}
      >
        <span className="sign__chain sign__chain--l" aria-hidden="true" />
        <span className="sign__chain sign__chain--r" aria-hidden="true" />
        <span className="sign__plate">
          <span className="sign__glow" aria-hidden="true" />
          <ZombieLogo className="sign__logo" />
          <span className="sign__drip sign__drip--a" aria-hidden="true" />
          <span className="sign__drip sign__drip--b" aria-hidden="true" />
        </span>
      </button>
      <span className="sign__puddle sign__puddle--a" aria-hidden="true" />
      <span className="sign__puddle sign__puddle--b" aria-hidden="true" />
    </div>
  );
}
