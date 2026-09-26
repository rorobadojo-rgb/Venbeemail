"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { bus } from "@/lib/bus";

type Props = {
  count: number;
  /** how far the wire sags in the middle, px */
  sag?: number;
  className?: string;
  /** react to the logo: brighten on hover, swing when it laughs */
  listen?: boolean;
  /** switch the bulbs off one by one */
  off?: boolean;
  /** every n-th bulb is a coloured one */
  colorEvery?: number;
};

const COLORS = ["#FF3DAE", "#7CFF2B", "#19D3C5", "#FF8A1F"];

/** A string of warm bulbs on a sagging wire. Bulbs sway; the wire is SVG. */
export function BulbString({ count, sag = 26, className = "", listen = false, off = false, colorEvery = 4 }: Props) {
  const [bright, setBright] = useState(false);
  const [shaken, setShaken] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!listen) return;
    const a = bus.on("banner-hover", ({ on }) => setBright(on));
    const b = bus.on("laugh", () => {
      setShaken((n) => n + 1);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShaken(0), 1700);
    });
    return () => {
      a();
      b();
      clearTimeout(timer.current);
    };
  }, [listen]);

  const bulbs = Array.from({ length: count }, (_, k) => {
    const t = (k + 0.5) / count;
    return { t, y: sag * 4 * t * (1 - t), c: colorEvery && k % colorEvery === 2 ? COLORS[k % COLORS.length] : null };
  });

  return (
    <div
      className={`bulbs${bright ? " is-bright" : ""}${shaken ? " is-shaken" : ""}${off ? " is-off" : ""} ${className}`}
      style={{ "--sag": `${sag}px` } as CSSProperties}
      aria-hidden="true"
    >
      <svg className="bulbs__wire" viewBox="0 0 100 10" preserveAspectRatio="none" focusable="false">
        <path d="M0 0Q50 20 100 0" fill="none" stroke="#1A1A1A" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((b, k) => (
        <span
          key={k}
          className="bulb"
          style={{ "--t": b.t, "--y": `${b.y}px`, "--k": k, "--c": b.c ?? "#FFD23F", "--d": `${-(k * 0.37) % 3}s` } as CSSProperties}
        >
          <span className="bulb__shake" key={shaken ? `s${shaken}` : "idle"}>
            <span className="bulb__glow" />
            <span className="bulb__glass" />
          </span>
        </span>
      ))}
    </div>
  );
}
