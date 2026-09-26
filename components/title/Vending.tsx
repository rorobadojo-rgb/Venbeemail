/**
 * A little vending machine ("MESIN HURUF"), drawn for this project. Used by
 * the title (letters drop out of its chute) and by the RANDOM key (it spins
 * its coils and drops a username). The chute mouth is `.vm__chute`.
 */
const INK = "#0A0A0A";

const coil = (y: number, k: number) => (
  <g key={y}>
    <path
      className="vm__coil"
      d={`M22 ${y}l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6`}
      fill="none"
      stroke="#9A9A9A"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {[0, 1, 2].map((j) => (
      <rect
        key={j}
        className="vm__item"
        x={28 + j * 26}
        y={y - 22}
        width="18"
        height="16"
        rx="2"
        fill={["#A6F23A", "#FF1F5A", "#8A2BE2", "#FF3A1F", "#FFD23F"][(k + j) % 5]}
        stroke={INK}
        strokeWidth="2.5"
      />
    ))}
  </g>
);

export function Vending({ className = "" }: { className?: string }) {
  return (
    <svg className={`vm ${className}`} viewBox="0 0 160 264" aria-hidden="true">
      <rect x="10" y="252" width="22" height="10" fill={INK} />
      <rect x="128" y="252" width="22" height="10" fill={INK} />
      <rect x="4" y="4" width="152" height="250" rx="10" fill="#3A3F3A" stroke={INK} strokeWidth="5" />
      <rect x="4" y="4" width="152" height="30" rx="10" fill="#FF1F5A" stroke={INK} strokeWidth="5" />
      <text x="80" y="26" textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill={INK}>
        MESIN HURUF
      </text>
      <rect className="vm__glass" x="16" y="42" width="98" height="150" rx="3" fill="#0F2E26" stroke={INK} strokeWidth="4" />
      {[80, 118, 156, 188].map((y, k) => coil(y, k))}
      <path d="M22 50l20 0M22 58l8 0" stroke="#EFFFF5" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <rect x="122" y="46" width="26" height="14" rx="2" fill="#A6F23A" stroke={INK} strokeWidth="3" />
      <g fill="#C9C4B8" stroke={INK} strokeWidth="2">
        {[0, 1, 2].flatMap((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={124 + c * 12} y={68 + r * 12} width="9" height="9" rx="1.5" />))}
      </g>
      <rect x="130" y="112" width="10" height="26" rx="3" fill={INK} />
      <rect className="vm__chute" x="16" y="202" width="98" height="40" rx="4" fill="#151515" stroke={INK} strokeWidth="4" />
      <rect className="vm__flap" x="20" y="205" width="90" height="20" rx="2" fill="#6E736E" stroke={INK} strokeWidth="3" />
      <rect x="124" y="206" width="24" height="30" rx="3" fill="#6E736E" stroke={INK} strokeWidth="3" />
    </svg>
  );
}
