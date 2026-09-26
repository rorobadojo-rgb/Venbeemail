import type { CSSProperties } from "react";
import { GLYPHS, JITTER, SYRUPS, type Glyph } from "./titleGlyphs";

/**
 * "VenbeeMail" in hand-cut block letters. "Venbee" is es-campur syrup: each
 * letter a different flavour with jelly cubes, bubbles and a tiny eyeball
 * floating inside and slow heavy drips. "Mail" is solid cream with a
 * bulb-yellow outline.
 *
 * The entrance (syrup poured from above into letter-shaped molds, filling up,
 * then wobbling as it settles) is pure CSS, so it plays before hydration and
 * `prefers-reduced-motion` simply shows the finished title.
 */
const GAP = 8;
const WORD_GAP = 30;
const INK = "#0A0A0A";
const CREAM = "#F5E6C8";
const BULB = "#FFD23F";

type Placed = { g: Glyph; x: number; rot: number; dy: number };

function layout(word: string, x0: number, j0: number): [Placed[], number] {
  let x = x0;
  const out: Placed[] = [];
  [...word].forEach((ch, k) => {
    const g = GLYPHS[ch];
    const [rot, dy] = JITTER[(j0 + k) % JITTER.length];
    out.push({ g, x, rot, dy });
    x += g.w + GAP;
  });
  return [out, x - GAP];
}

function wave(w: number, y: number) {
  let d = `M-40 ${y}`;
  for (let x = -40; x < w + 80; x += 40) d += "q10 -5 20 0t20 0";
  return `${d}V${y + 12}H-40Z`;
}

const vars = (v: Record<string, string | number>) => v as CSSProperties;

export function SyrupTitle({ className = "" }: { className?: string }) {
  const [venbee, endV] = layout("Venbee", 0, 0);
  const [mail, end] = layout("Mail", endV + WORD_GAP, 6);
  const W = end;

  return (
    <svg className={`syrup ${className}`} viewBox={`-14 -18 ${W + 28} 196`} aria-hidden="true" focusable="false">
      <defs>
        {venbee.map(({ g }, i) => (
          <clipPath key={i} id={`vt-l${i}`}>
            <path d={g.d} clipRule="evenodd" />
          </clipPath>
        ))}
        {SYRUPS.map((s, i) => (
          <linearGradient key={i} id={`vt-g${i}`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor={s.hi} />
            <stop offset="0.3" stopColor={s.c} />
            <stop offset="1" stopColor={s.deep} />
          </linearGradient>
        ))}
        {SYRUPS.map((s, i) => (
          <linearGradient key={i} id={`vt-p${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.c} stopOpacity="0" />
            <stop offset="0.45" stopColor={s.c} />
          </linearGradient>
        ))}
      </defs>

      {venbee.map(({ g, x, rot, dy }, i) => {
        const s = SYRUPS[i];
        const fillH = 124 - g.top;
        return (
          <g key={i} transform={`translate(${x} ${dy}) rotate(${rot} ${g.w / 2} 60)`}>
            {/* the stream of syrup pouring in from above */}
            <path className="syrup__pour" d={`M${g.pour} -150V${g.top + 8}`} stroke={`url(#vt-p${i})`} style={vars({ "--i": i })} />
            <g className="syrup__jelly" style={vars({ "--i": i })}>
              <path d={g.d} fillRule="evenodd" fill="none" stroke={CREAM} strokeWidth="16" strokeLinejoin="round" />
              <path className="syrup__mold" d={g.d} fillRule="evenodd" />
              <g clipPath={`url(#vt-l${i})`}>
                <g className="syrup__fill" style={vars({ "--i": i, "--h": `${fillH}px` })}>
                  <rect x="-10" y={g.top - 3} width={g.w + 20} height={fillH + 10} fill={`url(#vt-g${i})`} />
                  <path className="syrup__wave" d={wave(g.w, g.top - 3)} fill={s.hi} opacity="0.85" />
                  {g.bits.map((b, k) =>
                    b.k === "cube" ? (
                      <rect key={k} className="syrup__bit" x={b.x - 7} y={b.y - 7} width="14" height="14" rx="3.5"
                        fill="#FFFFFF" fillOpacity="0.4" stroke={s.deep} strokeWidth="2.5" style={vars({ "--d": `${-k * 1.3 - i * 0.7}s` })} />
                    ) : b.k === "bubble" ? (
                      <circle key={k} className="syrup__bit" cx={b.x} cy={b.y} r="5" fill="#FFFFFF" fillOpacity="0.15"
                        stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2" style={vars({ "--d": `${-k * 1.1 - i * 0.5}s` })} />
                    ) : (
                      <g key={k} className="syrup__bit" style={vars({ "--d": `${-i * 0.9}s` })}>
                        <circle cx={b.x} cy={b.y} r="9" fill="#FFFDF4" stroke={INK} strokeWidth="2.5" />
                        <circle cx={b.x + 2} cy={b.y + 1} r="4.5" fill="#35A80A" />
                        <circle cx={b.x + 2} cy={b.y + 1} r="2.2" fill={INK} />
                        <circle cx={b.x - 3} cy={b.y - 4} r="1.6" fill="#FFFFFF" />
                      </g>
                    ),
                  )}
                </g>
                <path className="syrup__gloss" d={`M7 ${g.top + 10}l11 -3 -5 34 -9 3Z`} fill="#FFFFFF" />
              </g>
              <path d={g.d} fillRule="evenodd" fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              {g.drips.map((dx, k) => (
                <g key={k} transform={`translate(${dx} 115)`}>
                  <g className="syrup__drip" style={vars({ "--d": `${2.6 + i * 0.3 + k * 1.9}s`, "--t": `${7 + ((i + k) % 3) * 1.6}s` })}>
                    <path d="M-7 0C-7 10-9 22-9 30a9 9 0 0 0 18 0C9 22 7 10 7 0Z" fill={s.deep} />
                    <path d="M-7 2C-7 10-9 22-9 30a9 9 0 0 0 18 0C9 22 7 10 7 2" fill="none" stroke={INK} strokeWidth="3" vectorEffect="non-scaling-stroke" />
                    <path d="M-3 12c0 6-1 10-2 14" stroke={s.hi} strokeWidth="2.5" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
                  </g>
                  <circle className="syrup__drop" cx="0" cy="44" r="5" fill={s.deep} stroke={INK} strokeWidth="2.5"
                    style={vars({ "--d": `${2.6 + i * 0.3 + k * 1.9}s`, "--t": `${7 + ((i + k) % 3) * 1.6}s` })} />
                </g>
              ))}
            </g>
          </g>
        );
      })}

      {mail.map(({ g, x, rot, dy }, j) => (
        <g key={j} transform={`translate(${x} ${dy}) rotate(${rot} ${g.w / 2} 60)`}>
          <g className="syrup__stamp" style={vars({ "--j": j })}>
            <path d={g.d} fillRule="evenodd" fill="none" stroke={INK} strokeWidth="20" strokeLinejoin="round" />
            <path d={g.d} fillRule="evenodd" fill="none" stroke={BULB} strokeWidth="11" strokeLinejoin="round" />
            <path d={g.d} fillRule="evenodd" fill={CREAM} />
            <path d={`M8 ${g.top + 8}h${Math.min(26, g.w - 18)}`} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          </g>
        </g>
      ))}
    </svg>
  );
}
