"use client";

import { gsap } from "gsap";
import { useEffect, useId, useRef } from "react";
import { asset } from "@/lib/asset";
import { between, prefersReducedMotion } from "@/lib/motion";
import { bus } from "@/lib/bus";
import { play } from "@/lib/sound";
import { LOGO } from "./logoGeometry.generated";

type EyeName = keyof typeof LOGO.eyes;
const EYE_NAMES = Object.keys(LOGO.eyes) as EyeName[];
/** how far each iris may travel (viewBox units) */
const TRACK: Record<EyeName, [number, number]> = { left: [14, 10], right: [16, 11] };
const OPEN = -20; // lid tucked fully under the brow

function lid(name: EyeName) {
  const e = LOGO.eyes[name];
  const [k, b] = e.brow;
  const [x0, , x1, y1] = e.box;
  const xa = x0 - 30;
  const xb = x1 + 30;
  const ya = k * xa + b;
  const yb = k * xb + b;
  const mx = (xa + xb) / 2;
  const my = (ya + yb) / 2 + 16; // the lid edge bows down a little
  return {
    fill: `M${xa} ${ya - 600}L${xb} ${yb - 600}L${xb} ${yb}Q${mx} ${my} ${xa} ${ya}Z`,
    edge: `M${xa} ${ya}Q${mx} ${my} ${xb} ${yb}`,
    close: y1 - Math.min(k * x0 + b, k * x1 + b) + 18,
  };
}
const LIDS = { left: lid("left"), right: lid("right") };

type Props = {
  className?: string;
  /** hero logo: clickable (zombie laugh) and hover brightens the banner bulbs */
  interactive?: boolean;
  /** eyes closed (the market has shut) */
  sleeping?: boolean;
  label?: string;
};

/**
 * The official logo, alive. Three stacked layers share one viewBox:
 * the traced sticker + fills (img), live eyes (inline SVG: irises that
 * follow the cursor, lids that blink under the brows) and the traced ink (img).
 */
export function ZombieLogo({ className = "", interactive = false, sleeping = false, label = "VenbeeMail" }: Props) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const irises = useRef<Record<EyeName, SVGGElement | null>>({ left: null, right: null });
  const lids = useRef<Record<EyeName, SVGGElement | null>>({ left: null, right: null });
  const sleepingRef = useRef(sleeping);
  const busy = useRef(false);
  const lastLaugh = useRef(-1);

  const lidEls = () => EYE_NAMES.map((n) => lids.current[n]).filter(Boolean) as SVGGElement[];
  const setLids = (amount: number, duration: number, ease = "power2.inOut") =>
    EYE_NAMES.forEach((n) => {
      const el = lids.current[n];
      if (el) gsap.to(el, { y: OPEN + (LIDS[n].close - OPEN) * amount, duration, ease, overwrite: "auto" });
    });

  // ---- blinking, every 3-5 s
  useEffect(() => {
    lidEls().forEach((el) => gsap.set(el, { y: OPEN }));
    if (prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      if (!sleepingRef.current && !busy.current && !document.hidden) {
        const tl = gsap.timeline();
        const once = (at: number) =>
          EYE_NAMES.forEach((n) => {
            const el = lids.current[n];
            if (!el) return;
            tl.to(el, { y: LIDS[n].close, duration: 0.07, ease: "power2.in" }, at).to(el, { y: OPEN, duration: 0.14, ease: "power2.out" }, at + 0.11);
          });
        once(0);
        if (Math.random() < 0.2) once(0.32);
      }
      timer = setTimeout(blink, between(3000, 5000));
    };
    timer = setTimeout(blink, between(1500, 3000));
    return () => clearTimeout(timer);
  }, []);

  // ---- irises follow the cursor (or the last tap)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const movers = EYE_NAMES.map((n) => {
      const el = irises.current[n]!;
      return { n, x: gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" }) };
    });
    let raf = 0;
    let px = 0, py = 0;
    const update = () => {
      raf = 0;
      const box = root.current?.getBoundingClientRect();
      if (!box || sleepingRef.current) return;
      const s = box.width / LOGO.width;
      for (const m of movers) {
        const e = LOGO.eyes[m.n];
        const dx = px - (box.left + e.cx * s);
        const dy = py - (box.top + e.cy * s);
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, dist / 260);
        m.x((dx / dist) * TRACK[m.n][0] * pull);
        m.y((dy / dist) * TRACK[m.n][1] * pull);
      }
    };
    const onMove = (ev: PointerEvent) => {
      px = ev.clientX;
      py = ev.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- closing time: blink twice, then the eyes shut
  useEffect(() => {
    sleepingRef.current = sleeping;
    if (!lidEls().length) return;
    if (prefersReducedMotion()) {
      setLids(sleeping ? 1 : 0, 0.01);
      return;
    }
    if (sleeping) {
      const tl = gsap.timeline();
      EYE_NAMES.forEach((n) => {
        const el = lids.current[n];
        if (!el) return;
        tl.to(el, { y: LIDS[n].close, duration: 0.08 }, 0)
          .to(el, { y: OPEN, duration: 0.14 }, 0.12)
          .to(el, { y: LIDS[n].close, duration: 0.08 }, 0.5)
          .to(el, { y: OPEN + (LIDS[n].close - OPEN) * 0.35, duration: 0.3 }, 0.64)
          .to(el, { y: LIDS[n].close, duration: 1.1, ease: "power1.inOut" }, 1.2);
      });
      EYE_NAMES.forEach((n) => irises.current[n] && gsap.to(irises.current[n], { x: 0, y: 4, duration: 1.2 }));
      return () => {
        tl.kill();
      };
    }
    setLids(0, 0.35);
  }, [sleeping]);

  const laugh = () => {
    let variant = Math.floor(Math.random() * 3);
    if (variant === lastLaugh.current) variant = (variant + 1) % 3;
    lastLaugh.current = variant;
    play((["laugh1", "laugh2", "laugh3"] as const)[variant]);
    play("flap", { volume: 0.8 });
    bus.emit("laugh", { variant });
    if (prefersReducedMotion() || !body.current) return;
    busy.current = true;
    const b = body.current;
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
        if (!sleepingRef.current) setLids(0, 0.25);
      },
    });
    tl.add(() => setLids(0.55, 0.08), 0);
    if (variant === 0) {
      tl.to(b, {
        keyframes: [
          { rotation: -6, y: -8, duration: 0.09 }, { rotation: 5, y: 0, duration: 0.09 },
          { rotation: -5, y: -8, duration: 0.09 }, { rotation: 4, y: 0, duration: 0.09 },
          { rotation: -3, y: -6, duration: 0.09 }, { rotation: 2, y: 0, duration: 0.09 },
          { rotation: -2, y: -4, duration: 0.09 }, { rotation: 0, y: 0, duration: 0.15 },
        ],
      }, 0);
    } else if (variant === 1) {
      tl.to(b, { rotation: -9, y: -16, scale: 1.07, duration: 0.45, ease: "power2.out" }, 0)
        .add(() => setLids(0.7, 0.2), 0.1)
        .to(b, { keyframes: [{ rotation: 4, y: 0, scale: 1, duration: 0.12 }, { rotation: -3, y: -6, duration: 0.12 }, { rotation: 3, y: 0, duration: 0.12 }, { rotation: 0, y: 0, duration: 0.2 }] }, 0.55);
    } else {
      tl.to(b, {
        keyframes: [
          { y: 10, scaleY: 0.93, scaleX: 1.05, duration: 0.14 }, { y: -4, scaleY: 1.03, scaleX: 0.98, duration: 0.16 },
          { y: 10, scaleY: 0.93, scaleX: 1.05, duration: 0.14 }, { y: -4, scaleY: 1.03, scaleX: 0.98, duration: 0.16 },
          { y: 12, scaleY: 0.9, scaleX: 1.07, duration: 0.3 }, { y: 0, scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" },
        ],
      }, 0);
    }
  };

  const eyes = (
    <svg className="zlogo__layer" viewBox={`0 0 ${LOGO.width} ${LOGO.height}`} aria-hidden="true" focusable="false">
      <defs>
        {EYE_NAMES.map((n) => (
          <clipPath key={n} id={`${uid}-${n}`}>
            <path d={LOGO.eyes[n].clip} />
          </clipPath>
        ))}
      </defs>
      {EYE_NAMES.map((n) => {
        const e = LOGO.eyes[n];
        const [ri, rr, ra, ro] = e.r;
        return (
          <g key={n} clipPath={`url(#${uid}-${n})`}>
            <rect x={e.box[0] - 10} y={e.box[1] - 10} width={e.box[2] - e.box[0] + 20} height={e.box[3] - e.box[1] + 20} fill={LOGO.colors.cream} />
            <g ref={(el) => void (irises.current[n] = el)}>
              <circle cx={e.cx} cy={e.cy} r={ro} fill={LOGO.colors.ink} />
              <circle cx={e.cx} cy={e.cy} r={ra} fill={LOGO.colors.slime} />
              <circle cx={e.cx} cy={e.cy} r={rr} fill={LOGO.colors.ink} />
              <circle cx={e.cx} cy={e.cy} r={ri} fill={LOGO.colors.slime} />
              <circle cx={e.cx - ri * 0.35} cy={e.cy - ri * 0.4} r={ri * 0.28} fill="#EFFFE0" opacity="0.8" />
            </g>
            <g ref={(el) => void (lids.current[n] = el)} transform={`translate(0 ${OPEN})`}>
              <path d={LIDS[n].fill} fill={LOGO.colors.lime} />
              <path d={LIDS[n].edge} fill="none" stroke={LOGO.colors.ink} strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
        );
      })}
    </svg>
  );

  const layers = (
    <div ref={body} className="zlogo__body">
      <img className="zlogo__layer" src={asset("/logo/zombie-under.svg")} alt="" draggable={false} />
      {eyes}
      <img className="zlogo__layer" src={asset("/logo/zombie-ink.svg")} alt="" draggable={false} />
    </div>
  );

  if (!interactive) {
    return (
      <div ref={root} className={`zlogo ${className}`} role="img" aria-label={label}>
        {layers}
      </div>
    );
  }
  return (
    <div ref={root} className={`zlogo zlogo--live ${className}`}>
      <button
        type="button"
        className="zlogo__btn"
        onClick={laugh}
        onPointerEnter={() => bus.emit("banner-hover", { on: true })}
        onPointerLeave={() => bus.emit("banner-hover", { on: false })}
        onFocus={() => bus.emit("banner-hover", { on: true })}
        onBlur={() => bus.emit("banner-hover", { on: false })}
      >
        <span className="sr-only">{label}: klik biar zombienya ketawa</span>
        {layers}
      </button>
    </div>
  );
}
