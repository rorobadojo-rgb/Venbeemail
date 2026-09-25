"use client";

import { gsap } from "gsap";
import { useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Variant = "red" | "blue" | "cream" | "ink";

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

const REST = 6; // shadow offset in px at rest
const HOVER = 10;

/**
 * 3D comic button with a hard black offset shadow.
 * hover: lifts up-left while the shadow grows (the shadow shifts diagonally)
 * press: slides into its shadow (shadow → 0, flat against the panel)
 * release: springs back with an elastic bounce
 */
export function ComicButton({ children, variant = "red", className = "", onClick, href, disabled, ...aria }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const hovering = useRef(false);
  const pressed = useRef(false);

  const to = (x: number, sh: number, spring = false) => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    gsap.to(el, {
      x,
      y: x,
      "--sh": sh,
      duration: reduce ? 0.01 : spring ? 0.9 : 0.16,
      ease: spring && !reduce ? "elastic.out(1.15, 0.3)" : "power2.out",
      overwrite: true,
    });
  };
  const rest = (spring = false) => (hovering.current ? to(REST - HOVER, HOVER, spring) : to(0, REST, spring));
  const press = () => {
    if (disabled) return;
    pressed.current = true;
    const el = ref.current;
    if (el) gsap.to(el, { x: REST, y: REST, "--sh": 0, duration: 0.06, ease: "power2.out", overwrite: true });
  };
  const release = () => {
    if (!pressed.current) return;
    pressed.current = false;
    rest(true);
  };

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || disabled) return;
      hovering.current = true;
      if (!pressed.current) rest();
    },
    onPointerLeave: () => {
      hovering.current = false;
      if (pressed.current) release();
      else rest();
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button === 0) press();
    },
    onPointerUp: release,
    onPointerCancel: release,
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) press();
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") release();
    },
    onBlur: release,
    onClick,
  };

  const cls = `cbtn cbtn--${variant} ${className}`;
  if (href) {
    return (
      <a ref={(n) => void (ref.current = n)} href={href} className={cls} {...handlers} {...aria}>
        <span className="cbtn__label">{children}</span>
      </a>
    );
  }
  return (
    <button
      ref={(n) => void (ref.current = n)}
      type="button"
      className={cls}
      disabled={disabled}
      {...handlers}
      {...aria}
    >
      <span className="cbtn__label">{children}</span>
    </button>
  );
}
