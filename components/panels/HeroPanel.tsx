"use client";

import { useState } from "react";
import { TypewriterBubble } from "@/components/comic/Bubble";
import { ComicButton } from "@/components/comic/ComicButton";
import { Doodle } from "@/components/comic/Doodle";
import { Starburst } from "@/components/comic/Starburst";
import { Mascot } from "@/components/mascot/Mascot";
import { goToStep } from "@/lib/nav";

const TITLE = "VenbeeMail";
const TILTS = [-4, 3, -2, 4, -3, 2, -4, 3, -2, 4];

export function HeroPanel() {
  const [replay, setReplay] = useState(0);
  const [focused, setFocused] = useState(false);

  return (
    <article className="panel panel--hero" aria-labelledby="hero-title">
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__doodles" data-depth="1.8" aria-hidden="true">
        <Doodle name="skull-flame" className="hd hd--1" rotate={-8} />
        <Doodle name="ghost-grin" className="hd hd--2" rotate={10} />
        <Doodle name="bomb" className="hd hd--3" rotate={-12} extra />
        <Doodle name="bubble-yes" className="hd hd--4" rotate={8} extra />
        <Doodle name="crown" className="hd hd--5" rotate={-14} extra />
        <Doodle name="mushroom" className="hd hd--6" rotate={6} extra />
        <Doodle name="arrow" className="hd hd--7" rotate={0} extra />
        <Doodle name="bubble-no" className="hd hd--8" rotate={-6} />
      </div>

      <div className="hero__episode" data-depth="0.5">
        <p className="caption">
          Episode #1 <b>· Email sekali pakai</b>
        </p>
      </div>

      <div className="hero__center" data-depth="1">
        <h1 id="hero-title" className="title">
          <span className="sr-only">{TITLE}</span>
          <span className="boom" aria-hidden="true">
            <Starburst className="boom__outer" points={16} inner={0.72} seed={3} fill="var(--red)" strokeWidth={6} />
            <Starburst className="boom__inner" points={14} inner={0.7} seed={11} fill="var(--blue)" strokeWidth={5} />
            <span className="boom__dots" />
            <span className="boom__word">BOOM!</span>
          </span>
          <span className="title__word" aria-hidden="true">
            {Array.from(TITLE).map((l, i) => (
              <span
                key={i}
                className="tl"
                data-l={l}
                style={{ "--i": i, "--tilt": `${TILTS[i]}deg` } as React.CSSProperties}
              >
                {l}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero__tagline">
          <span>Email sementara.</span> <span>Tanpa daftar.</span> <span>Hilang sendiri.</span>
        </p>
        <div className="hero__cta">
          <ComicButton
            href="#generator"
            variant="red"
            onClick={(e) => {
              e.preventDefault();
              goToStep(1);
            }}
          >
            Bikin email!
          </ComicButton>
          <span className="sfx sfx--small hero__free" aria-hidden="true">
            Gratis!
          </span>
        </div>
      </div>

      <div className="hero__inset" data-depth="0.6">
        <div className="inset hero__inset-frame">
        <span className="inset__label" aria-hidden="true">
          Narator
        </span>
        <button
          type="button"
          className="inset__bird"
          aria-label="Sapa Venbee, si burung narator"
          onClick={() => setReplay((r) => r + 1)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <Mascot priority raised={focused} />
        </button>
        <TypewriterBubble text="Butuh email? Sebentar aja? Nih." replay={replay} tail="bottom-left" className="hero__bubble" />
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="sfx sfx--small">Scroll!</span>
        <span className="hero__scroll-arrow">↓</span>
      </div>
    </article>
  );
}
