"use client";

import { useRef } from "react";
import { DOMAINS, type Domain } from "@/lib/mail";

type Props = {
  value: Domain;
  onChange: (d: Domain, from: HTMLElement) => void;
};

const SKINS = ["red", "cream", "blue", "ink", "cream"] as const;
const SHAPES = ["a", "b", "c", "d", "e"] as const;

/**
 * The five domains as sound-effect stickers fanned out like a hand of cards.
 * Keyboard: it is a radiogroup, so arrows move the selection.
 */
export function DomainFan({ value, onChange }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const mid = (DOMAINS.length - 1) / 2;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + DOMAINS.length) % DOMAINS.length;
    const el = refs.current[n];
    if (el) {
      el.focus();
      onChange(DOMAINS[n], el);
    }
  };

  return (
    <div className="fan" role="radiogroup" aria-label="Pilih domain">
      {DOMAINS.map((d, i) => {
        const on = d === value;
        return (
          <button
            key={d}
            ref={(n) => void (refs.current[i] = n)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={`sticker sticker--${SKINS[i]} sticker--${SHAPES[i]}${on ? " is-on" : ""}`}
            style={{ "--k": i - mid } as React.CSSProperties}
            onClick={(e) => onChange(d, e.currentTarget)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="sticker__face">
              <span className="sticker__at">@</span>
              {d.replace(/\.com$/, "")}
              <span className="sticker__tld">.com</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
