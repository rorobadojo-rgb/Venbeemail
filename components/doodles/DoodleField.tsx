"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const DESKTOP_COUNT = 90;
const MOBILE_COUNT = 36; // ~60% fewer doodle extras on small / touch screens

/**
 * Fixed WebGL doodle wall behind the comic page. Three.js is code-split and
 * only loaded on the first interaction, so it never competes with the first
 * paint. Until then — or when WebGL is unavailable — the CSS backdrop and the
 * in-panel doodles carry the look.
 */
export function DoodleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dispose: (() => void) | undefined;
    let dead = false;
    const small = window.matchMedia("(max-width: 959.98px), (pointer: coarse)").matches;

    const start = () => {
      if (dead) return;
      void import("./doodleScene").then(({ createDoodleScene }) => {
        if (dead) return;
        try {
          dispose = createDoodleScene(canvas, {
            count: small ? MOBILE_COUNT : DESKTOP_COUNT,
            animate: !prefersReducedMotion(),
            onReady: () => canvas.classList.add("is-ready"),
          });
        } catch {
          /* no WebGL: keep the CSS backdrop */
        }
      });
    };

    // Wake the wall on the first sign of a real visitor (mouse move, touch,
    // scroll, key). Keeps three.js entirely off the critical path.
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      start();
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true }));
    const cleanups = [() => events.forEach((e) => window.removeEventListener(e, go))];

    return () => {
      dead = true;
      cleanups.forEach((c) => c());
      dispose?.();
    };
  }, []);

  return <canvas ref={ref} className="doodle-field" aria-hidden="true" />;
}
