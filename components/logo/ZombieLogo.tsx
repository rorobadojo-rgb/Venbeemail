"use client";

import { gsap } from "gsap";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { asset } from "@/lib/asset";
import { prefersReducedMotion } from "@/lib/motion";
import { pointer, trackPointer } from "@/lib/pointer";
import { LOGO_GEOMETRY as G } from "./logoGeometry.generated";

export type ZombieLogoHandle = {
  /** Squint-laugh: eyes squash in time with the laugh, brows bounce. */
  laugh: () => void;
  /** One blink (brows drop, eyes squash shut 120 ms, pop open). */
  blink: () => void;
};

type Props = {
  className?: string;
  /** Eyes closed for good (the shop is shut). */
  sleeping?: boolean;
  /** Blink every 3–5 s. */
  blink?: boolean;
  /** Pupils follow the cursor. */
  follow?: boolean;
  ref?: Ref<ZombieLogoHandle>;
};

const [, , VW, VH] = G.viewBox;
const SIDES = ["left", "right"] as const;
const REACH = { left: { x: 15, y: 11 }, right: { x: 17, y: 12 } };
const SQUASH = 0.07;

/**
 * The official logo, split into layers: the traced body is one cached <img>,
 * and the eyes, pupils and brows are drawn on top so they can move.
 * Blink: brows drop, eyes squash shut for 120 ms, then pop open.
 */
export function ZombieLogo({ className = "", sleeping = false, blink = true, follow = true, ref }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const q = (s: string) => svg.current?.querySelector<SVGGElement>(s) ?? null;
  const eyes = () => SIDES.map((s) => q(`.zl__eye--${s}`)).filter(Boolean) as SVGGElement[];
  const brows = () => SIDES.map((s) => q(`.zl__brow--${s}`)).filter(Boolean) as SVGGElement[];
  const sleepingRef = useRef(sleeping);
  const primed = useRef(false);
  /** Scale each eye around its own centre (SVG user units). */
  const prime = () => {
    if (primed.current || !svg.current) return;
    primed.current = true;
    SIDES.forEach((s) => gsap.set(q(`.zl__eye--${s}`), { svgOrigin: `${G.eyes[s].cx} ${G.eyes[s].cy}` }));
  };

  const blinkOnce = () => {
    if (sleepingRef.current || prefersReducedMotion()) return;
    prime();
    gsap
      .timeline()
      .to(brows(), { y: 14, duration: 0.06, ease: "power2.in" })
      .to(eyes(), { scaleY: SQUASH, duration: 0.06, ease: "power2.in" }, "<")
      .to(eyes(), { scaleY: 1, duration: 0.16, ease: "back.out(4)" }, "+=0.06")
      .to(brows(), { y: 0, duration: 0.22, ease: "back.out(3)" }, "<");
  };

  useImperativeHandle(ref, () => ({
    blink: blinkOnce,
    laugh() {
      if (prefersReducedMotion() || sleepingRef.current) return;
      const tl = gsap.timeline();
      for (let i = 0; i < 4; i++) {
        tl.to(eyes(), { scaleY: 0.35, duration: 0.07, ease: "power2.in" })
          .to(brows(), { y: 10, duration: 0.07 }, "<")
          .to(eyes(), { scaleY: 1, duration: 0.14, ease: "back.out(3)" })
          .to(brows(), { y: -6, duration: 0.14 }, "<");
      }
      tl.to(brows(), { y: 0, duration: 0.3, ease: "elastic.out(1, 0.4)" });
    },
  }));

  // sleeping: close / open the eyes
  useEffect(() => {
    sleepingRef.current = sleeping;
    prime();
    const reduce = prefersReducedMotion();
    gsap.to(eyes(), { scaleY: sleeping ? SQUASH : 1, duration: reduce ? 0 : sleeping ? 0.5 : 0.25, ease: sleeping ? "power2.inOut" : "back.out(3)" });
    gsap.to(brows(), { y: sleeping ? 14 : 0, duration: reduce ? 0 : 0.5, ease: "power2.inOut" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleeping]);

  // blink loop + pupils, only while on screen
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    trackPointer();
    const reduce = prefersReducedMotion();
    prime();
    let visible = false;
    let timer = 0;
    let raf = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      if (!visible || !blink || reduce) return;
      timer = window.setTimeout(() => {
        blinkOnce();
        schedule();
      }, 3000 + Math.random() * 2000);
    };
    const movers = SIDES.map((s) => {
      const g = q(`.zl__pupil--${s}`);
      return {
        s,
        x: g ? gsap.quickTo(g, "x", { duration: 0.35, ease: "power3.out" }) : null,
        y: g ? gsap.quickTo(g, "y", { duration: 0.35, ease: "power3.out" }) : null,
      };
    });
    let last = "";
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!pointer.active) return;
      const key = `${pointer.clientX},${pointer.clientY},${window.scrollY}`;
      if (key === last) return;
      last = key;
      const r = el.getBoundingClientRect();
      const k = r.width / VW;
      for (const m of movers) {
        const p = G.pupils[m.s];
        const dx = pointer.clientX - (r.left + p.cx * k);
        const dy = pointer.clientY - (r.top + p.cy * k);
        const d = Math.hypot(dx, dy) || 1;
        const t = Math.min(1, d / 260);
        m.x?.((dx / d) * t * REACH[m.s].x);
        m.y?.((dy / d) * t * REACH[m.s].y);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && follow && !reduce) raf = requestAnimationFrame(frame);
      schedule();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blink, follow]);

  const pupil = (s: (typeof SIDES)[number]) => {
    const p = G.pupils[s];
    return (
      <g className={`zl__pupil zl__pupil--${s}`}>
        <circle cx={p.cx} cy={p.cy} r={p.r[0]} fill={G.colors.ink} />
        <circle cx={p.cx} cy={p.cy} r={p.r[1]} fill={G.colors.green} />
        <circle cx={p.cx} cy={p.cy} r={p.r[2]} fill={G.colors.ink} />
        <circle cx={p.cx} cy={p.cy} r={p.r[3]} fill={G.colors.green} />
        <circle cx={p.cx - p.r[1] * 0.45} cy={p.cy - p.r[1] * 0.5} r={p.r[3] * 0.38} fill="#EFFFF5" opacity=".85" />
      </g>
    );
  };

  return (
    <span className={`zl ${className}`}>
      <img
        className="zl__body"
        src={asset("/logo/venbee-zombie-body.svg")}
        width={VW}
        height={VH}
        alt=""
        draggable={false}
        fetchPriority="high"
      />
      <svg ref={svg} className="zl__face" viewBox={G.viewBox.join(" ")} aria-hidden="true">
        <defs>
          {SIDES.map((s) => (
            <clipPath key={s} id={`zl-clip-${s}`}>
              <path d={G.eyes[s].white} />
            </clipPath>
          ))}
        </defs>
        {SIDES.map((s) => (
          <g key={s} className={`zl__eye zl__eye--${s}`}>
            <path d={G.eyes[s].ring} fill={G.colors.ink} />
            <path d={G.eyes[s].white} fill={G.colors.cream} />
            <g clipPath={`url(#zl-clip-${s})`}>{pupil(s)}</g>
          </g>
        ))}
        {SIDES.map((s) => (
          <polygon key={s} className={`zl__brow zl__brow--${s}`} points={G.brows[s].map((p) => p.join(",")).join(" ")} fill={G.colors.ink} />
        ))}
      </svg>
    </span>
  );
}
