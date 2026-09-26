"use client";

import { gsap } from "gsap";
import { forwardRef, useId, useImperativeHandle, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { RAINBOW, type BagEffect } from "@/lib/domains";
import { prefersReducedMotion } from "@/lib/motion";
import { play, vary, type SfxName } from "@/lib/sound";

export type BagChipProps = {
  /** exact text on the label, e.g. "@peler.com" */
  label: string;
  /** flavour printed on the label band */
  flavor: string;
  /** syrup colour, or "rainbow" */
  syrup: string;
  deep: string;
  effect: BagEffect;
  /** "hanging" on the pole (string + sway) or "counter" (resting, no string) */
  mode?: "hanging" | "counter";
  /** string length in px when hanging */
  stringLength?: number;
  selected?: boolean;
  /** called after the press effect has played */
  onPress?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  role?: string;
  className?: string;
  /** index for idle-sway phase */
  phase?: number;
};

export type BagChipHandle = {
  /** play the press effect without selecting */
  poke: () => Promise<void>;
  /** the bag's art box, for flight animations */
  artRect: () => DOMRect | null;
  focus: () => void;
};

const SOUND: Record<BagEffect, SfxName> = {
  squish: "squish",
  slurp: "slurp",
  spin: "spin",
  clink: "clink",
  puff: "puff",
  drip: "drip",
  stretch: "stretch",
  band: "band",
  sparkle: "sparkle",
  bubbles: "bubbles",
};

/** Split long domains at the last dot so they wrap to 2 lines, never cut. */
export function labelLines(label: string): string[] {
  if (label.length <= 11) return [label];
  const dot = label.lastIndexOf(".");
  return dot > 0 ? [label.slice(0, dot), label.slice(dot)] : [label];
}

const BODY = "M42 26C28 36 8 56 8 94C8 134 26 156 50 156C74 156 92 134 92 94C92 56 72 36 58 26Z";
const LEVEL = 50;

function surface(y: number) {
  let d = `M-40 ${y}`;
  for (let x = -40; x < 160; x += 30) d += "q7.5 -4 15 0t15 0";
  return `${d}V${y + 120}H-40Z`;
}

/**
 * A little plastic bag of syrup hanging from a string, with a die-cut label
 * sticker on the front. Reusable: give it a label, colours and an effect.
 */
export const BagChip = forwardRef<BagChipHandle, BagChipProps>(function BagChip(
  { label, flavor, syrup, deep, effect, mode = "hanging", stringLength = 44, selected = false, onPress, onKeyDown, tabIndex, role, className = "", phase = 0 },
  ref,
) {
  const uid = useId().replace(/:/g, "");
  const btn = useRef<HTMLButtonElement>(null);
  const swing = useRef<HTMLSpanElement>(null);
  const bodyEl = useRef<HTMLSpanElement>(null);
  const art = useRef<SVGSVGElement>(null);
  const q = (sel: string) => (art.current ? Array.from(art.current.querySelectorAll<SVGElement>(sel)) : []);
  const busy = useRef<Promise<void> | null>(null);
  const domainEl = useRef<HTMLSpanElement>(null);

  const rainbow = syrup === "rainbow";
  const base = rainbow ? RAINBOW[0] : syrup;
  const lines = labelLines(label);
  const chars = Math.max(...lines.map((l) => l.length));

  // never cut the label off: shrink until it fits the panel (again once
  // the label font has loaded, and whenever the bag changes size)
  useLayoutEffect(() => {
    const el = domainEl.current;
    if (!el) return;
    const fit = () => {
      el.style.removeProperty("--fit");
      let scale = 1;
      for (let k = 0; k < 10 && (el.scrollWidth > el.clientWidth + 0.5 || el.scrollHeight > el.clientHeight + 0.5); k++) {
        scale *= 0.92;
        el.style.setProperty("--fit", String(scale));
      }
    };
    fit();
    let dead = false;
    void document.fonts?.ready.then(() => !dead && fit());
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement ?? el);
    return () => {
      dead = true;
      ro.disconnect();
    };
  }, [label]);

  const runEffect = (): Promise<void> => {
    play(SOUND[effect], { rate: vary(0.08) });
    if (prefersReducedMotion() || !swing.current || !bodyEl.current) return Promise.resolve();
    const s = swing.current;
    const b = bodyEl.current;
    const liquid = q(".bag__liquid");
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    switch (effect) {
      case "squish":
        tl.to(b, { scaleX: 1.3, scaleY: 0.72, duration: 0.12, ease: "power2.out", transformOrigin: "50% 100%" })
          .to(b, { scaleX: 0.9, scaleY: 1.12, duration: 0.14 })
          .to(b, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1.1, 0.35)" })
          .fromTo(s, { y: 0 }, { y: 16, duration: 0.14, ease: "power2.in" }, 0.05)
          .to(s, { y: 0, duration: 0.8, ease: "elastic.out(1.2, 0.3)" }, 0.2);
        break;
      case "slurp":
        tl.fromTo(q(".bag__straw"), { y: -90, opacity: 1 }, { y: 0, duration: 0.25, ease: "power2.out" })
          .to(liquid, { y: 46, duration: 0.55, ease: "power1.in" }, 0.3)
          .to(q(".bag__straw"), { y: -90, duration: 0.2, ease: "power2.in" }, 0.9)
          .set(q(".bag__straw"), { opacity: 0 })
          .to(liquid, { y: 0, duration: 0.5, ease: "back.out(1.6)" }, 1.1);
        break;
      case "spin":
        tl.to(s, { rotationY: 720, duration: 1, ease: "power2.inOut" }).set(s, { rotationY: 0 });
        break;
      case "clink":
        q(".bag__ice").forEach((ice, k) =>
          tl.to(ice, {
            keyframes: [
              { x: k ? -6 : 6, y: -4, rotation: k ? -24 : 20, duration: 0.08 },
              { x: k ? 4 : -4, y: 2, rotation: k ? 14 : -16, duration: 0.1 },
              { x: k ? -3 : 3, y: -2, rotation: k ? -8 : 10, duration: 0.1 },
              { x: 0, y: 0, rotation: 0, duration: 0.3, ease: "elastic.out(1, 0.4)" },
            ],
            transformOrigin: "50% 50%",
          }, k * 0.06),
        );
        tl.to(b, { keyframes: [{ x: -3, duration: 0.05 }, { x: 3, duration: 0.05 }, { x: -2, duration: 0.05 }, { x: 0, duration: 0.1 }] }, 0);
        break;
      case "puff":
        tl.to(b, { scale: 1.28, duration: 0.4, ease: "power1.out", transformOrigin: "50% 40%" })
          .to(b, { scale: 1, duration: 0.7, ease: "elastic.out(1.3, 0.25)" }, 0.5);
        break;
      case "drip": {
        const drop = q(".bag__drop");
        const splash = q(".bag__splash i, .bag__splash circle");
        tl.fromTo(drop, { scaleY: 0, y: 0, opacity: 1 }, { scaleY: 1, duration: 0.3, ease: "power1.out", transformOrigin: "50% 0%" })
          .to(drop, { y: 74, duration: 0.3, ease: "power2.in" })
          .set(drop, { opacity: 0 })
          .fromTo(splash, { scale: 0, opacity: 1, x: 0, y: 0 }, {
            scale: 1, opacity: 0, duration: 0.5, ease: "power2.out",
            x: (k) => (k - (splash.length - 1) / 2) * 12, y: (k) => -6 - (k % 2) * 8, transformOrigin: "50% 50%",
          });
        break;
      }
      case "stretch":
        tl.to(b, { scaleY: 1.55, scaleX: 0.78, duration: 0.45, ease: "power2.out", transformOrigin: "50% 0%" })
          .to(b, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1.25, 0.28)" });
        break;
      case "band":
        tl.to(q(".bag__band"), { scaleX: 0.5, duration: 0.18, ease: "power3.in", transformOrigin: "50% 50%" })
          .to(b, { scaleX: 1.16, scaleY: 1.05, duration: 0.18, ease: "power2.out", transformOrigin: "50% 100%" }, 0.1)
          .to(q(".bag__band"), { scaleX: 1, duration: 0.6, ease: "elastic.out(1.4, 0.3)" }, 0.5)
          .to(b, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.35)" }, 0.5);
        break;
      case "sparkle": {
        const stars = q(".bag__spark");
        tl.to(b, { "--glow": 1, duration: 0.25 })
          .fromTo(stars, { scale: 0, rotation: 0, opacity: 1 }, {
            scale: 1, rotation: 90, duration: 0.35, ease: "back.out(2)", stagger: 0.07, transformOrigin: "50% 50%",
          }, 0.05)
          .to(stars, { scale: 0, opacity: 0, duration: 0.3, stagger: 0.07 }, 0.45)
          .to(b, { "--glow": 0, duration: 0.5 }, 0.9);
        break;
      }
      case "bubbles": {
        const bubbles = q(".bag__bubble");
        tl.fromTo(bubbles, { y: 0, scale: 0.4, opacity: 1 }, {
          y: -70, scale: 1, duration: 0.7, ease: "power1.in", stagger: 0.08, transformOrigin: "50% 50%",
        }).to(bubbles, { scale: 1.8, opacity: 0, duration: 0.12, stagger: 0.08 }, 0.7);
        break;
      }
    }
    return new Promise((resolve) => tl.eventCallback("onComplete", () => resolve()));
  };

  const poke = () => {
    if (!busy.current) busy.current = runEffect().finally(() => void (busy.current = null));
    return busy.current;
  };

  useImperativeHandle(ref, () => ({
    poke,
    artRect: () => bodyEl.current?.getBoundingClientRect() ?? null,
    focus: () => btn.current?.focus(),
  }));

  const click = async () => {
    const reduce = prefersReducedMotion();
    const done = poke();
    // selection happens most of the way through the effect
    if (!reduce) await Promise.race([done, new Promise((r) => setTimeout(r, 750))]);
    onPress?.();
  };

  const style = {
    "--syrup": base,
    "--deep": deep,
    "--string": `${stringLength}px`,
    "--phase": phase,
    "--chars": chars,
  } as CSSProperties;

  return (
    <button
      ref={btn}
      type="button"
      className={`bag bag--${mode} bag--${effect}${selected ? " is-selected" : ""} ${className}`}
      style={style}
      onClick={click}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
    >
      <span className="bag__sway">
        <span ref={swing} className="bag__swing">
          {mode === "hanging" && <span className="bag__string" aria-hidden="true" />}
          <span ref={bodyEl} className="bag__body">
            <svg ref={art} className="bag__art" viewBox="0 0 100 160" aria-hidden="true" focusable="false">
              <defs>
                <clipPath id={`${uid}-c`}>
                  <path d={BODY} />
                </clipPath>
                <linearGradient id={`${uid}-p`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#DDEBF2" stopOpacity="0.75" />
                  <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#C9DCE6" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                  {rainbow ? (
                    RAINBOW.map((c, k) => <stop key={k} offset={k / (RAINBOW.length - 1)} stopColor={c} />)
                  ) : (
                    <>
                      <stop offset="0" stopColor={base} />
                      <stop offset="1" stopColor={deep} />
                    </>
                  )}
                </linearGradient>
              </defs>
              {/* straw (slurp) */}
              <g className="bag__straw" style={{ opacity: 0 }}>
                <rect x="58" y="-30" width="9" height="130" rx="3" fill="#FFF6E3" stroke="#0A0A0A" strokeWidth="2.5" transform="rotate(12 62 30)" />
                <path d="M60 -20l7 8M60 0l7 8M60 20l7 8M60 40l7 8" stroke="#FF3DAE" strokeWidth="3" transform="rotate(12 62 30)" />
              </g>
              <g clipPath={`url(#${uid}-c)`}>
                <rect x="0" y="0" width="100" height="160" fill={`url(#${uid}-p)`} />
                <g className="bag__liquid">
                  <rect x="-10" y={LEVEL} width="120" height="120" fill={`url(#${uid}-g)`} />
                  <path className="bag__surface" d={surface(LEVEL)} fill="#FFFFFF" fillOpacity="0.28" />
                  <g className="bag__ice">
                    <rect x="24" y={LEVEL - 4} width="17" height="15" rx="4" fill="#EAF7FF" fillOpacity="0.85" stroke="#0A0A0A" strokeWidth="2" />
                  </g>
                  <g className="bag__ice">
                    <rect x="52" y={LEVEL - 2} width="15" height="14" rx="4" fill="#EAF7FF" fillOpacity="0.85" stroke="#0A0A0A" strokeWidth="2" transform={`rotate(14 59 ${LEVEL + 5})`} />
                  </g>
                  {[22, 38, 50, 64, 76].map((x, k) => (
                    <circle key={k} className="bag__bubble" cx={x} cy={140 - (k % 2) * 16} r={3 + (k % 3)} fill="#FFFFFF" fillOpacity="0.5" stroke="#FFFFFF" strokeWidth="1.5" style={{ opacity: 0 }} />
                  ))}
                </g>
                <path d="M22 70C17 92 19 120 31 140" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
                <path d="M78 64c3 6 5 12 5 18" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
              </g>
              <path d={BODY} fill="none" stroke="#0A0A0A" strokeWidth="3.2" strokeLinejoin="round" />
              {/* twisted plastic ears + rubber band */}
              <path d="M42 28L31 5Q36 1 41 5Q45 0 50 4Q55 0 59 5Q64 1 69 5L58 28Z" fill="#EAF3F7" fillOpacity="0.9" stroke="#0A0A0A" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M41 6l5 20M50 5v21M59 6l-5 20" fill="none" stroke="#0A0A0A" strokeWidth="1.4" opacity="0.35" />
              <g className="bag__band">
                <ellipse cx="50" cy="27" rx="11" ry="4.2" fill="none" stroke="#0A0A0A" strokeWidth="6" />
                <ellipse cx="50" cy="27" rx="11" ry="4.2" fill="none" stroke="#FF3A1F" strokeWidth="3.2" />
              </g>
              {/* drip + splash (drip) */}
              <path className="bag__drop" d="M50 152c-4 6-6 11-6 15a6 6 0 0 0 12 0c0-4-2-9-6-15Z" fill={base} stroke="#0A0A0A" strokeWidth="2" style={{ opacity: 0 }} />
              <g className="bag__splash" transform="translate(50 232)">
                {[0, 1, 2, 3, 4].map((k) => (
                  <circle key={k} cx="0" cy="0" r={3 + (k % 2) * 2} fill={base} stroke="#0A0A0A" strokeWidth="1.5" style={{ opacity: 0 }} />
                ))}
              </g>
              {/* sparkles (sparkle) */}
              {[[6, 40], [92, 52], [2, 118], [96, 120], [50, 2]].map(([x, y], k) => (
                <path key={k} className="bag__spark" d={`M${x} ${y - 9}l2.4 6.6 6.6 2.4-6.6 2.4L${x} ${y + 9}l-2.4-6.6-6.6-2.4 6.6-2.4Z`}
                  fill={RAINBOW[(k * 2) % RAINBOW.length]} stroke="#0A0A0A" strokeWidth="1.5" style={{ opacity: 0 }} />
              ))}
            </svg>
            <span className="bag__label">
              <span className="bag__band-label">{flavor}</span>
              <span className="sr-only"> </span>
              <span ref={domainEl} className="bag__domain" data-lines={lines.length}>
                {lines.map((l, k) => (
                  <span key={k}>{l}</span>
                ))}
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
});
