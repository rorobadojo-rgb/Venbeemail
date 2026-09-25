"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { asset } from "@/lib/asset";
import { prefersReducedMotion } from "@/lib/motion";
import { playThrottled } from "@/lib/sound";
import { BIRD_GEOMETRY as G } from "./birdGeometry.generated";

/**
 * Venbee, the official VenbeeMail bird, as the comic narrator.
 *
 * The traced body (public/mascot/venbee-bird-body.svg) is an <img>, so every
 * panel shares one cached file. The eye and the black eye-mask bar are drawn
 * on top so they can switch frames:
 *   sleepy  – the logo pose (half-closed eye under the bar)
 *   raised  – "eyebrow" frame: the bar jumps up and tilts, the eye opens
 *   closed  – blink frame, shown for a beat every ~5 s
 */
type Frame = { lid: number; barDy: number; barRot: number };

const SLEEPY: Frame = { lid: 0, barDy: 0, barRot: 0 };
const RAISED: Frame = { lid: -24, barDy: -24, barRot: -5 };
const CLOSED_LID = G.eye.ry * 0.72;

const INK = "#0A0A0A";
const CREAM = "#FCE8C3";

type Props = {
  className?: string;
  /** mirror horizontally (bird looks right) */
  flip?: boolean;
  /** hover raises the eyebrow + pen scribble */
  interactive?: boolean;
  /** force the raised-eyebrow frame (e.g. while a wrapping button has focus) */
  raised?: boolean;
  /** hero instance: load eagerly */
  priority?: boolean;
  /** accessible name; decorative when omitted */
  label?: string;
};

export function Mascot({ className = "", flip, interactive = true, raised = false, priority, label }: Props) {
  const clipId = `lid${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const root = useRef<HTMLDivElement>(null);
  const lidRect = useRef<SVGRectElement>(null);
  const lidLine = useRef<SVGLineElement>(null);
  const bar = useRef<SVGPolygonElement>(null);
  const hovered = useRef(false);
  const base = useRef<Frame>(SLEEPY);

  const apply = useCallback((f: Frame) => {
    const half = Math.abs(f.lid) < G.eye.ry ? G.eye.rx * Math.sqrt(1 - (f.lid / G.eye.ry) ** 2) : 0;
    lidRect.current?.setAttribute("y", String(f.lid));
    const line = lidLine.current;
    if (line) {
      line.setAttribute("x1", String(-half));
      line.setAttribute("x2", String(half));
      line.setAttribute("y1", String(f.lid));
      line.setAttribute("y2", String(f.lid));
    }
    bar.current?.setAttribute(
      "transform",
      `translate(0 ${f.barDy}) rotate(${f.barRot} ${G.barPivot[0]} ${G.barPivot[1]})`,
    );
  }, []);

  const setRaised = useCallback(
    (on: boolean) => {
      base.current = on ? RAISED : SLEEPY;
      apply(base.current);
      root.current?.classList.toggle("is-raised", on);
    },
    [apply],
  );

  useEffect(() => {
    if (!hovered.current) setRaised(raised);
  }, [raised, setRaised]);

  // blink every ~5 s: half → closed → half → open, frame by frame
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const blink = () => {
      if (!document.hidden) {
        const b = base.current;
        const half = { ...b, lid: (b.lid + CLOSED_LID) / 2 };
        apply(half);
        later(() => apply({ ...base.current, lid: CLOSED_LID }), 45);
        later(() => apply({ ...base.current, lid: (base.current.lid + CLOSED_LID) / 2 }), 130);
        later(() => apply(base.current), 175);
      }
      later(blink, 4300 + Math.random() * 1600);
    };
    later(blink, 1200 + Math.random() * 3800);
    return () => timers.forEach(clearTimeout);
  }, [apply]);

  const onEnter = (e: React.PointerEvent) => {
    if (!interactive || e.pointerType === "touch") return;
    hovered.current = true;
    setRaised(true);
    playThrottled("scribble", 700, { volume: 0.7 });
  };
  const onLeave = () => {
    if (!hovered.current) return;
    hovered.current = false;
    setRaised(raised);
  };

  const [cx, cy] = [G.eye.cx, G.eye.cy];
  const { rx, ry, stroke } = G.eye;
  const [sx1, sy1, sx2, sy2] = G.split;

  return (
    <div
      ref={root}
      className={`mascot${flip ? " mascot--flip" : ""} ${className}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="mascot__inner">
        <img
          className="mascot__body"
          src={asset("/mascot/venbee-bird-body.svg")}
          alt=""
          width={G.width}
          height={G.height}
          draggable={false}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        <svg className="mascot__face" viewBox={`0 0 ${G.width} ${G.height}`} aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <rect ref={lidRect} x={-rx - 20} y={0} width={rx * 2 + 40} height={ry * 2 + 40} />
            </clipPath>
          </defs>
          <g transform={`translate(${cx} ${cy}) rotate(${G.barAngle})`}>
            <g clipPath={`url(#${clipId})`}>
              <ellipse rx={rx} ry={ry} fill={CREAM} stroke={INK} strokeWidth={stroke} />
              <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={INK} strokeWidth={stroke} />
            </g>
            <line ref={lidLine} x1={-rx} y1={0} x2={rx} y2={0} stroke={INK} strokeWidth={stroke + 2} strokeLinecap="round" />
          </g>
          <polygon ref={bar} points={G.bar.map((p) => p.join(",")).join(" ")} fill={INK} />
        </svg>
      </div>
    </div>
  );
}
