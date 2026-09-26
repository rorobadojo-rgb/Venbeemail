"use client";

import { useEffect, useRef } from "react";
import { play } from "@/lib/sound";

type Props = { left: number; life: number; active: boolean };

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** The countdown as a candle burning down. Extending relights a taller one. */
export function Candle({ left, life, active }: Props) {
  const ratio = active && life > 0 ? Math.max(0, Math.min(1, left / life)) : 0;
  const out = !active || left <= 0;
  const prevOut = useRef(out);
  const prevLife = useRef(life);

  useEffect(() => {
    if (out && !prevOut.current) play("snuff");
    if (!out && (prevOut.current || life > prevLife.current + 1000)) play("flame");
    prevOut.current = out;
    prevLife.current = life;
  }, [out, life]);

  const wax = 18 + ratio * 118; // px of wax left
  const top = 172 - wax;
  const minutes = Math.ceil(left / 60000);
  return (
    <div className={`candle${out ? " is-out" : ""}${!out && left < 60000 ? " is-low" : ""}`}>
      <svg className="candle__art" viewBox="0 0 90 200" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="candle-glow">
            <stop offset="0" stopColor="#FFD23F" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFD23F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="candle-wax" x1="0" x2="1">
            <stop offset="0" stopColor="#E9D7B0" />
            <stop offset="0.35" stopColor="#FFF6E3" />
            <stop offset="1" stopColor="#D9C396" />
          </linearGradient>
        </defs>
        <g className="candle__top" style={{ transform: `translateY(${top}px)` }}>
          <circle className="candle__glow" cx="45" cy="-10" r="44" fill="url(#candle-glow)" />
          <g className="candle__flame">
            <path d="M45 -40C52 -26 58 -18 58 -8a13 13 0 0 1-26 0C32 -18 38 -26 45 -40Z" fill="#FF8A1F" stroke="#0A0A0A" strokeWidth="2.5" />
            <path d="M45 -26C49 -18 51 -13 51 -7a6 6 0 0 1-12 0C39 -13 41 -18 45 -26Z" fill="#FFD23F" />
          </g>
          <g className="candle__smoke">
            <path d="M45 -6c-6-8 6-14 0-22s6-14 0-22" fill="none" stroke="#9A9A9A" strokeWidth="3" strokeLinecap="round" />
          </g>
          <path d="M45 0v-8" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
        </g>
        <rect className="candle__wax" x="28" y={top} width="34" height={wax} fill="url(#candle-wax)" stroke="#0A0A0A" strokeWidth="3" rx="3" />
        <path className="candle__drips" d={`M30 ${top + 2}c0 10 4 12 4 20s-4 8-4 4M60 ${top + 2}c0 6-3 9-3 14`} fill="none" stroke="#FFF6E3" strokeWidth="4" strokeLinecap="round" />
        <path d="M12 172h66l-6 16H18Z" fill="#8A8F99" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="45" cy="172" rx="36" ry="6" fill="#B7BCC6" stroke="#0A0A0A" strokeWidth="3" />
        <path d="M78 176c10-2 12 8 2 10" fill="none" stroke="#0A0A0A" strokeWidth="3" />
      </svg>
      <div className="candle__time" role="timer" aria-live="off" aria-label={out ? "Waktu habis" : `Sisa waktu ${minutes} menit`}>
        <b>{active ? fmt(left) : "--:--"}</b>
        <span>{out ? (active ? "lilin habis" : "belum nyala") : "sisa waktu"}</span>
      </div>
    </div>
  );
}
