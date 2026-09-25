"use client";

import { STEPS, goToStep, useStep } from "@/lib/nav";

/** Page-number badges for the cinematic comic page (hidden in flow mode). */
export function ChapterNav() {
  const step = useStep();
  return (
    <nav className="chapters" aria-label="Panel komik">
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === step ? "is-on" : undefined}
              aria-current={i === step ? "step" : undefined}
              onClick={() => goToStep(i)}
            >
              <span className="chapters__num">{i + 1}</span>
              <span className="chapters__label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
