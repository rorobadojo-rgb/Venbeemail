"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { play, playThrottled } from "@/lib/sound";

export type Tail = "left" | "right" | "bottom-left" | "bottom-right" | "top-left" | "top-right";

type BubbleProps = {
  children: ReactNode;
  tail?: Tail;
  className?: string;
  /** "shout" = jagged outline for exclamations */
  shout?: boolean;
};

export function Bubble({ children, tail = "bottom-left", className = "", shout }: BubbleProps) {
  return <div className={`bubble bubble--${tail}${shout ? " bubble--shout" : ""} ${className}`}>{children}</div>;
}

type TypeProps = {
  text: string;
  tail?: Tail;
  className?: string;
  /** delay before the first character on mount (ms) */
  startDelay?: number;
  /** ms per character */
  speed?: number;
  /** change this number to type the line again */
  replay?: number;
};

/**
 * Speech bubble that types itself out with typewriter clicks. Every
 * character is rendered up front (hidden), so the bubble never changes size
 * while typing and screen readers get the whole sentence at once.
 */
export function TypewriterBubble({ text, tail = "bottom-left", className = "", startDelay = 1100, speed = 52, replay = 0 }: TypeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const chars = Array.from(host.querySelectorAll<HTMLSpanElement>(".tw-c"));
    if (prefersReducedMotion()) {
      chars.forEach((c) => c.classList.add("on"));
      host.classList.add("done");
      return;
    }
    chars.forEach((c) => c.classList.remove("on"));
    host.classList.remove("done");
    let i = 0;
    let timer = 0;
    const tick = () => {
      if (i >= chars.length) {
        host.classList.add("done");
        return;
      }
      const c = chars[i++];
      c.classList.add("on");
      const ch = c.textContent ?? "";
      if (ch.trim()) play("type", { rate: 0.85 + Math.random() * 0.35, volume: 0.55 });
      timer = window.setTimeout(tick, /[?.!,]/.test(ch) ? speed * 6 : speed);
    };
    timer = window.setTimeout(() => {
      playThrottled("scribble", 900, { volume: 0.35 });
      tick();
    }, first.current ? startDelay : 150);
    first.current = false;
    return () => clearTimeout(timer);
  }, [replay, speed, startDelay, text]);

  return (
    <Bubble tail={tail} className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} className="tw" aria-hidden="true">
        {Array.from(text).map((c, i) => (
          <span key={i} className="tw-c">
            {c}
          </span>
        ))}
        <span className="tw-caret" />
      </span>
    </Bubble>
  );
}
