"use client";

import { gsap } from "gsap";
import { useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { play, vary } from "@/lib/sound";

export type WoodColor = "red" | "green" | "blue" | "pink" | "yellow" | "purple";

type Props = {
  /** big text on the sticker band, e.g. "GENERATE" */
  label: string;
  /** small caption on the sticker panel */
  caption?: string;
  color: WoodColor;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** draws attention (e.g. GENERATE when the order changed) */
  nudge?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

const DUST = 7;

/**
 * A hand-painted wooden plank sign hung on a nail, with a die-cut label
 * sticker slapped on. Hover: the sign tilts forward on its nail. Press: the
 * plank knocks back with a wooden thud and a few bits of sawdust fall.
 */
export function WoodSign({ label, caption, color, icon, onClick, disabled, nudge, className = "", ...aria }: Props) {
  const plank = useRef<HTMLSpanElement>(null);
  const dust = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);

  const rest = (spring = false) => {
    const el = plank.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    gsap.to(el, {
      rotationX: hovering.current ? -18 : 0,
      rotation: hovering.current ? -1.5 : 0,
      duration: reduce ? 0.01 : spring ? 0.9 : 0.35,
      ease: spring && !reduce ? "elastic.out(1.2, 0.35)" : "power2.out",
      overwrite: true,
    });
  };

  const knock = () => {
    play("thud", { rate: vary(0.16) });
    const el = plank.current;
    if (!el || prefersReducedMotion()) return;
    gsap.timeline({ overwrite: true })
      .to(el, { rotationX: 16, rotation: 1.5, duration: 0.07, ease: "power3.out" })
      .add(() => rest(true));
    const box = dust.current;
    if (!box) return;
    for (let k = 0; k < DUST; k++) {
      const bit = document.createElement("i");
      bit.className = "wsign__bit";
      box.appendChild(bit);
      const x = (Math.random() - 0.5) * 90;
      gsap.fromTo(bit,
        { x, y: 0, rotation: Math.random() * 180, opacity: 1, scale: 0.6 + Math.random() * 0.8 },
        {
          x: x + (Math.random() - 0.5) * 40,
          y: 40 + Math.random() * 50,
          rotation: `+=${120 + Math.random() * 240}`,
          opacity: 0,
          duration: 0.7 + Math.random() * 0.5,
          ease: "power1.in",
          onComplete: () => bit.remove(),
        });
    }
  };

  return (
    <button
      type="button"
      className={`wsign wsign--${color}${nudge ? " is-nudge" : ""} ${className}`}
      disabled={disabled}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || disabled) return;
        hovering.current = true;
        rest();
      }}
      onPointerLeave={() => {
        hovering.current = false;
        rest();
      }}
      onFocus={(e) => {
        if (!e.currentTarget.matches(":focus-visible")) return;
        hovering.current = true;
        rest();
      }}
      onBlur={() => {
        hovering.current = false;
        rest();
      }}
      onClick={() => {
        knock();
        onClick?.();
      }}
      {...aria}
    >
      <span className="wsign__nail" aria-hidden="true" />
      <span ref={plank} className="wsign__plank">
        <span className="wsign__nails" aria-hidden="true" />
        <span className="wsign__sticker">
          <span className="wsign__band">{label}</span>
          <span className="wsign__panel">
            {icon && <span className="wsign__icon" aria-hidden="true">{icon}</span>}
            {caption && <span className="wsign__caption">{caption}</span>}
          </span>
        </span>
      </span>
      <span ref={dust} className="wsign__dust" aria-hidden="true" />
    </button>
  );
}
