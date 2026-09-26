"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import { pointAt, write } from "@/lib/handwriting";

export type HandTextHandle = {
  /** total stroke length in viewBox units */
  total: number;
  /** show the first `len` units of ink */
  setLength: (len: number) => void;
  /** client-space position of the pen after `len` units */
  tipAt: (len: number) => { x: number; y: number } | null;
};

type Props = {
  text: string;
  /** rendered font size in px (the SVG may shrink to fit its box) */
  px: number;
  className?: string;
  /** start fully written (no animation) */
  drawn?: boolean;
};

const SIZE = 40; // glyph units per em inside the viewBox

/** Single-stroke marker handwriting that can be drawn stroke by stroke. */
export const HandText = forwardRef<HandTextHandle, Props>(function HandText({ text, px, className = "", drawn = true }, ref) {
  const svg = useRef<SVGSVGElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const w = useMemo(() => write(text, SIZE), [text]);
  const starts = useMemo(() => {
    let acc = 0;
    return w.strokes.map((s) => {
      const at = acc;
      acc += s.len;
      return at;
    });
  }, [w]);

  const setLength = (len: number) => {
    w.strokes.forEach((s, i) => {
      const p = paths.current[i];
      if (!p) return;
      const shown = Math.max(0, Math.min(s.len, len - starts[i]));
      p.style.strokeDashoffset = String(s.len - shown + 0.001);
      p.style.opacity = shown > 0 ? "1" : "0";
    });
  };

  useImperativeHandle(ref, () => ({
    total: w.total,
    setLength,
    tipAt: (len: number) => {
      const el = svg.current;
      if (!el || !w.strokes.length) return null;
      let i = starts.findIndex((s, k) => len >= s && len <= s + w.strokes[k].len);
      if (i < 0) i = len <= 0 ? 0 : w.strokes.length - 1;
      const [x, y] = pointAt(w.strokes[i], Math.max(0, len - starts[i]));
      const m = el.getScreenCTM();
      if (!m) return null;
      const pt = new DOMPoint(x, y).matrixTransform(m);
      return { x: pt.x, y: pt.y };
    },
  }));

  // text changed: either fully written or blank, until the pen comes
  useLayoutEffect(() => {
    setLength(drawn ? Infinity : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, drawn]);

  const top = SIZE * 0.1;
  const h = SIZE * 0.98;
  const vbW = w.width + 8;
  return (
    <svg
      ref={svg}
      className={`hand ${className}`}
      viewBox={`-4 ${top} ${vbW} ${h}`}
      style={{ width: `${(vbW / SIZE) * px}px`, aspectRatio: `${vbW} / ${h}` }}
      aria-hidden="true"
      focusable="false"
    >
      {w.strokes.map((s, i) => (
        <path
          key={i}
          ref={(el) => void (paths.current[i] = el)}
          d={s.d}
          strokeDasharray={`${s.len} ${s.len}`}
          strokeDashoffset={drawn ? 0 : s.len}
        />
      ))}
    </svg>
  );
});
