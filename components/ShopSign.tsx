"use client";

import { useEffect } from "react";
import { initSound, play, setMuted, useSound } from "@/lib/sound";

/**
 * Mute toggle as the little hanging door sign: BUKA = sound on, TUTUP = muted.
 * The choice is saved in localStorage.
 */
export function ShopSign() {
  const { muted, unlocked } = useSound();
  useEffect(() => initSound(), []);
  return (
    <button
      type="button"
      className={`shopsign${muted ? " is-closed" : ""}`}
      aria-pressed={muted}
      aria-label={muted ? "Suara mati (TUTUP). Klik untuk menyalakan" : "Suara nyala (BUKA). Klik untuk membisukan"}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) play("slap");
      }}
    >
      <span className="shopsign__string" aria-hidden="true" />
      <span className="shopsign__card" aria-hidden="true">
        <span className="shopsign__face shopsign__face--open">
          <b>BUKA</b>
          <small>{unlocked ? "suara nyala" : "klik = suara"}</small>
        </span>
        <span className="shopsign__face shopsign__face--closed">
          <b>TUTUP</b>
          <small>suara mati</small>
        </span>
      </span>
    </button>
  );
}
