"use client";

import { setMusic, setMuted, useSound } from "@/lib/sound";

/** "SHHH!" mute bubble + music sticker. Preferences persist in localStorage. */
export function SoundControls() {
  const { muted, music, unlocked } = useSound();
  const hint = muted ? "suara mati" : unlocked ? "suara nyala" : "klik = suara";
  return (
    <div className="sound-ctl">
      <button
        type="button"
        className={`shhh${muted ? " is-muted" : ""}`}
        aria-pressed={muted}
        onClick={() => setMuted(!muted)}
      >
        <span className="shhh__word">SHHH!</span>
        <span className="shhh__hint">{hint}</span>
        <span className="sr-only">(bisukan semua suara)</span>
        <svg className="shhh__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" />
          {muted ? <path d="M16 9l5 6M21 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
        </svg>
      </button>
      <button
        type="button"
        className={`music-tog${music && !muted ? " is-on" : ""}`}
        aria-pressed={music}
        disabled={muted}
        onClick={() => setMusic(!music)}
      >
        <span aria-hidden="true">♪</span>
        <span className="sr-only">Musik latar</span>
        <span className="music-tog__state">{music ? "on" : "off"}</span>
      </button>
    </div>
  );
}
