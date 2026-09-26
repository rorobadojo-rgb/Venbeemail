"use client";

import { useEffect, useState } from "react";
import { initSound, play, setMuted, useSound } from "@/lib/sound";

/** The mute toggle: a little bamboo kentongan you tap. Saved in localStorage. */
export function Kentongan() {
  const { muted } = useSound();
  const [hit, setHit] = useState(0);
  useEffect(() => initSound(), []);

  const tap = () => {
    setHit((h) => h + 1);
    if (muted) {
      setMuted(false);
      setTimeout(() => play("tok"), 40);
    } else {
      play("tok");
      setTimeout(() => setMuted(true), 200);
    }
  };

  return (
    <button type="button" className={`kentongan${muted ? " is-muted" : ""}`} onClick={tap} aria-pressed={!muted}>
      <span className="sr-only">Suara pasar</span>
      <svg className="kentongan__art" viewBox="0 0 80 110" aria-hidden="true" focusable="false">
        <path d="M40 0v18" stroke="#C9A06A" strokeWidth="3" />
        <g className="kentongan__drum" key={`d${hit}`}>
          <rect x="22" y="16" width="36" height="84" rx="16" fill="#C98B4E" stroke="#0A0A0A" strokeWidth="3.5" />
          <path d="M28 30h24M28 86h24" stroke="#7A4E22" strokeWidth="3" />
          <path d="M40 40v34" stroke="#0A0A0A" strokeWidth="6" strokeLinecap="round" />
          <path d="M30 24c-2 20-2 50 0 70" stroke="#E7B77C" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        <g className="kentongan__mallet" key={`m${hit}`}>
          <path d="M62 60l14-30" stroke="#8A5A2B" strokeWidth="5" strokeLinecap="round" />
          <rect x="54" y="54" width="16" height="10" rx="4" fill="#5E3A1A" stroke="#0A0A0A" strokeWidth="2.5" transform="rotate(-24 62 59)" />
        </g>
      </svg>
      <span className="kentongan__label" aria-hidden="true">
        SUARA <b>{muted ? "OFF" : "ON"}</b>
      </span>
    </button>
  );
}
