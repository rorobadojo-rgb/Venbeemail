/**
 * Original "crushed snack" doodles printed on the sticker bodies, plus the
 * register key icons. Colours come from the sticker: --band (packaging
 * colour), --paper (cream) and --ink, so one drawing works on every body.
 */
import type { Snack } from "@/lib/domains";

const S = { stroke: "var(--ink-line)", strokeWidth: 3.2, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const band = "var(--band)";
const paper = "var(--paper)";
const ink = "var(--ink-line)";

function Svg({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <svg className="doodle" viewBox="0 0 120 90" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      {children}
    </svg>
  );
}

const snacks: Record<Snack, React.ReactNode> = {
  can: (
    <>
      <path d="M36 16h44l2 10-6 10 7 9-6 11 5 10-2 12H38l-3-11 6-10-7-11 7-9-6-10z" fill={band} {...S} />
      <path d="M40 34h36l-4 12 5 8H41l4-9z" fill={paper} {...S} strokeWidth={2.4} />
      <path d="M52 40l6 6m0-6l-6 6M62 40l6 6m0-6l-6 6" fill="none" {...S} strokeWidth={2.2} />
      <ellipse cx="58" cy="16" rx="22" ry="4" fill={paper} {...S} />
      <path d="M72 22l2 6M44 64l-2 6" fill="none" {...S} stroke={paper} strokeWidth={2} />
    </>
  ),
  soda: (
    <>
      <g transform="rotate(-14 60 48)">
        <path d="M52 10h14v10l8 12v44c0 4-3 6-6 6H50c-3 0-6-2-6-6V32l8-12z" fill={band} {...S} />
        <rect x="45" y="44" width="28" height="18" fill={paper} {...S} strokeWidth={2.4} />
        <path d="M50 53h18" fill="none" {...S} strokeWidth={2.2} />
        <rect x="51" y="5" width="16" height="7" fill={ink} />
      </g>
      <circle cx="86" cy="26" r="4" fill={paper} {...S} strokeWidth={2} />
      <circle cx="94" cy="14" r="2.6" fill={paper} {...S} strokeWidth={1.8} />
      <circle cx="80" cy="12" r="2" fill={paper} {...S} strokeWidth={1.6} />
    </>
  ),
  chips: (
    <>
      <path d="M30 18l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6-4 58 5 6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6 4-6z" fill={band} {...S} />
      <ellipse cx="60" cy="44" rx="20" ry="14" fill={paper} {...S} strokeWidth={2.4} />
      <path d="M48 44l6-5 6 7 6-6 6 4" fill="none" {...S} strokeWidth={2.2} />
      <path d="M38 26h8M74 26h8" fill="none" {...S} stroke={paper} strokeWidth={2.4} />
    </>
  ),
  popsicle: (
    <>
      <path d="M58 64v18" fill="none" {...S} strokeWidth={6} stroke={ink} />
      <path d="M58 64v16" stroke="#D9B98A" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M42 22c0-10 8-14 16-14s16 4 16 14v38c0 4-3 6-6 6H48c-3 0-6-2-6-6z" fill={band} {...S} />
      <path d="M42 36c6 4 10-2 16 2s10-2 16 2" fill="none" {...S} stroke={paper} strokeWidth={3} />
      <path d="M50 20v10M66 20v8" fill="none" {...S} stroke={paper} strokeWidth={2.4} />
      <path d="M72 58c3 4 3 8 0 10-3-2-3-6 0-10z" fill={band} {...S} strokeWidth={2} />
    </>
  ),
  candy: (
    <>
      <path d="M22 30l14 8-14 10 14 6-14 10 20-6V38z" fill={band} {...S} />
      <path d="M98 30l-14 8 14 10-14 6 14 10-20-6V38z" fill={band} {...S} />
      <rect x="36" y="32" width="48" height="30" rx="4" fill={band} {...S} />
      <rect x="44" y="38" width="32" height="18" fill={paper} {...S} strokeWidth={2.4} />
      <path d="M50 47h20M60 41v12" fill="none" {...S} strokeWidth={2.2} />
    </>
  ),
  bag: (
    <>
      <path d="M28 20c10-6 54-6 64 0l-2 6c4 14 4 38 0 50l2 6c-10 6-54 6-64 0l2-6c-4-12-4-36 0-50z" fill={band} {...S} />
      <path d="M30 26h60M30 76h60" fill="none" {...S} strokeWidth={2.2} />
      <circle cx="60" cy="51" r="15" fill={paper} {...S} strokeWidth={2.4} />
      <path d="M53 51l5 5 9-10" fill="none" {...S} strokeWidth={2.6} />
      <path d="M38 34c-2 8-2 22 0 30" fill="none" {...S} stroke={paper} strokeWidth={2.4} />
    </>
  ),
  juice: (
    <>
      <path d="M68 16l10-10" fill="none" {...S} strokeWidth={4} />
      <path d="M38 22l30-6 14 8v52l-30 6-14-8z" fill={band} {...S} />
      <path d="M38 22l14 8 30-6M52 30v52" fill="none" {...S} strokeWidth={2.6} />
      <path d="M56 44l20-4v16l-20 4z" fill={paper} {...S} strokeWidth={2.2} />
      <path d="M38 64c4 4 2 10 6 12s4-6 8-4" fill="#A6F23A" {...S} strokeWidth={2.2} />
    </>
  ),
  jelly: (
    <>
      <path d="M32 46c0-20 12-30 28-30s28 10 28 30z" fill={band} {...S} />
      <path d="M42 30c4-6 10-8 16-8" fill="none" {...S} stroke={paper} strokeWidth={3} />
      <path d="M26 46h68l-8 30c-1 3-3 4-6 4H40c-3 0-5-1-6-4z" fill={paper} {...S} />
      <path d="M34 56h52" fill="none" {...S} strokeWidth={2.2} />
      <circle cx="60" cy="38" r="3" fill={paper} />
    </>
  ),
  coins: (
    <>
      {[70, 58, 46].map((y, i) => (
        <g key={y}>
          <ellipse cx={56 + i * 3} cy={y + 6} rx="24" ry="7" fill={ink} />
          <ellipse cx={56 + i * 3} cy={y} rx="24" ry="7" fill="#FFD23F" {...S} strokeWidth={2.6} />
        </g>
      ))}
      <circle cx="86" cy="30" r="13" fill="#FFD23F" {...S} />
      <path d="M80 30h12M86 24v12" fill="none" {...S} strokeWidth={2.2} />
    </>
  ),
  cereal: (
    <>
      <path d="M36 12h44l6 6v64H42l-6-6z" fill={band} {...S} />
      <path d="M36 12l6 6h44M42 18v64" fill="none" {...S} strokeWidth={2.4} />
      <circle cx="58" cy="36" r="10" fill={paper} {...S} strokeWidth={2.4} />
      <circle cx="70" cy="42" r="6" fill={paper} {...S} strokeWidth={2.2} />
      <rect x="50" y="56" width="30" height="18" fill={paper} {...S} strokeWidth={2} />
      <path d="M54 59v12M57 59v12M61 59v12M63 59v12M67 59v12M71 59v12M73 59v12M76 59v12" stroke={ink} strokeWidth={1.6} />
    </>
  ),
};

export function SnackDoodle({ snack }: { snack: Snack }) {
  return <Svg>{snacks[snack]}</Svg>;
}

export type KeyIcon = "print" | "copy" | "refresh" | "delete" | "qr" | "random";

const keys: Record<KeyIcon, React.ReactNode> = {
  print: (
    <>
      <path d="M40 10h40v34H40z" fill={paper} {...S} />
      <path d="M46 20h28M46 28h20M46 36h24" fill="none" {...S} strokeWidth={2.2} />
      <rect x="26" y="40" width="68" height="30" rx="5" fill={band} {...S} />
      <path d="M36 50h48" fill="none" {...S} strokeWidth={5} />
      <circle cx="84" cy="62" r="3" fill={paper} />
    </>
  ),
  copy: (
    <>
      <path d="M46 14h36v58H46z" fill={paper} {...S} />
      <path d="M36 22h36v58H36z" fill={paper} {...S} />
      <path d="M36 50l6-3 6 3 6-3 6 3 6-3 6 3" fill="none" {...S} strokeWidth={2.4} />
      <circle cx="84" cy="54" r="6" fill={band} {...S} />
      <circle cx="84" cy="72" r="6" fill={band} {...S} />
      <path d="M78 58l-18 10M78 68l-18-10" fill="none" {...S} />
    </>
  ),
  refresh: (
    <>
      <rect x="22" y="44" width="76" height="30" rx="3" fill={band} {...S} />
      <path d="M22 54h76" fill="none" {...S} strokeWidth={2.4} />
      <rect x="50" y="60" width="20" height="6" rx="3" fill={paper} {...S} strokeWidth={2} />
      <path d="M42 30a18 18 0 0 1 32-6" fill="none" {...S} strokeWidth={4} />
      <path d="M76 12l-2 12-12-2" fill="none" {...S} strokeWidth={4} />
    </>
  ),
  delete: (
    <>
      <path d="M38 30h44l-5 48H43z" fill={band} {...S} />
      <path d="M32 24h56M52 18h16" fill="none" {...S} strokeWidth={4} />
      <path d="M52 40v28M60 40v28M68 40v28" fill="none" {...S} strokeWidth={2.4} />
      <path d="M78 10c6-4 14 0 12 6s-10 6-12 2-6-4 0-8z" fill={paper} {...S} strokeWidth={2.2} />
    </>
  ),
  qr: (
    <>
      <rect x="32" y="12" width="56" height="66" fill={paper} {...S} />
      {[[38, 18], [66, 18], [38, 50]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="16" height="16" fill={ink} />
          <rect x={x + 4} y={y + 4} width="8" height="8" fill={paper} />
        </g>
      ))}
      <path d="M66 50h6v6h-6zM76 56h6v6h-6zM66 62h6v6h-6zM78 68h4v4h-4zM58 20h4v8h-4zM58 52h4v4h-4z" fill={ink} />
    </>
  ),
  random: (
    <>
      <rect x="30" y="16" width="44" height="44" rx="7" fill={paper} {...S} transform="rotate(-10 52 38)" />
      <g fill={ink}>
        <circle cx="42" cy="30" r="4" />
        <circle cx="54" cy="38" r="4" />
        <circle cx="64" cy="46" r="4" />
      </g>
      <rect x="62" y="40" width="30" height="30" rx="6" fill={band} {...S} transform="rotate(12 77 55)" />
      <circle cx="72" cy="50" r="3" fill={paper} />
      <circle cx="82" cy="60" r="3" fill={paper} />
      <path d="M22 76c10 6 30 6 40 0" fill="none" {...S} strokeWidth={2.4} />
    </>
  ),
};

export function KeyDoodle({ icon }: { icon: KeyIcon }) {
  return <Svg>{keys[icon]}</Svg>;
}
