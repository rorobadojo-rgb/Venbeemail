"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { DOMAINS, type Domain } from "@/lib/domains";
import { BagChip, type BagChipHandle } from "./BagChip";

const STRINGS = [40, 62, 48, 70, 44, 58, 50, 66, 42, 56];

type Props = {
  selected: Domain;
  /** a bag was pressed: its art box is where the flight to the counter starts */
  onSelect: (domain: Domain, from: DOMRect | null) => void;
};

/** A bamboo pole with the ten syrup bags hanging from strings. */
export function BagRack({ selected, onSelect }: Props) {
  const bags = useRef<(BagChipHandle | null)[]>([]);
  const empty = useRef<HTMLButtonElement>(null);
  const [prev, setPrev] = useState(selected);
  const [returning, setReturning] = useState<Domain | null>(null);
  if (prev !== selected) {
    setPrev(selected);
    setReturning(prev);
  }

  const focusAt = (k: number) => {
    const d = DOMAINS[(k + DOMAINS.length) % DOMAINS.length];
    if (d.domain === selected) empty.current?.focus();
    else bags.current[(k + DOMAINS.length) % DOMAINS.length]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, k: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      focusAt(k + step);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      focusAt(e.key === "Home" ? 0 : DOMAINS.length - 1);
    }
  };

  return (
    <div className="rack">
      <div className="rack__pole" aria-hidden="true" />
      <div className="rack__hooks" role="radiogroup" aria-label="Pilih domain: kantong sirup">
        {DOMAINS.map((d, k) => (
          <div className="rack__hook" key={d.domain} style={{ ["--k" as string]: k }}>
            {d.domain === selected ? (
              <button
                ref={empty}
                type="button"
                role="radio"
                aria-checked="true"
                tabIndex={0}
                className="rack__empty"
                style={{ ["--string" as string]: `${STRINGS[k]}px` }}
                onKeyDown={(e) => onKey(e, k)}
                onClick={() => document.getElementById("counter-bag")?.scrollIntoView({ block: "center", behavior: "smooth" })}
              >
                <span className="rack__string" aria-hidden="true" />
                <span className="rack__note">
                  <span className="sr-only">{d.flavor} @{d.domain}: </span>di meja<span aria-hidden="true"> ↓</span>
                </span>
              </button>
            ) : (
              <BagChip
                ref={(el) => void (bags.current[k] = el)}
                role="radio"
                tabIndex={-1}
                label={`@${d.domain}`}
                flavor={d.flavor}
                syrup={d.syrup}
                deep={d.deep}
                effect={d.effect}
                stringLength={STRINGS[k]}
                phase={k}
                className={returning === d.domain ? "is-returning" : ""}
                onKeyDown={(e) => onKey(e, k)}
                onPress={() => onSelect(d.domain, bags.current[k]?.artRect() ?? null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
