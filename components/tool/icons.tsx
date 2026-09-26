/** Little ink drawings for the sticker panels on the wooden signs. */
const s = { stroke: "#0A0A0A", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconPen = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <path d="M8 32l4-10L28 6l6 6-16 16Z" {...s} fill="#F5E6C8" />
    <path d="M8 32l4-10 6 6Z" {...s} fill="#2D6BFF" />
    <path d="M24 10l6 6" {...s} fill="none" />
    <path d="M4 37c6-3 10 1 16-2" {...s} fill="none" stroke="#2D6BFF" />
  </svg>
);
export const IconCopy = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <rect x="12" y="6" width="20" height="24" rx="2" {...s} fill="#FF9AD5" />
    <path d="M8 12v22h20" {...s} fill="#F5E6C8" />
    <path d="M16 13h12M16 18h9M16 23h11" {...s} fill="none" strokeWidth={2} />
  </svg>
);
export const IconRefresh = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <path d="M31 14a12 12 0 0 0-21-2M9 26a12 12 0 0 0 21 2" {...s} fill="none" />
    <path d="M8 5v8h8M32 35v-8h-8" {...s} fill="none" />
  </svg>
);
export const IconBin = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <path d="M7 14h26l-3 20H10Z" {...s} fill="#D39B58" />
    <path d="M11 20h18M12 26h16" {...s} fill="none" strokeWidth={2} />
    <circle cx="20" cy="9" r="6" {...s} fill="#F5E6C8" />
    <path d="M17 7l3 3 3-4" {...s} fill="none" strokeWidth={1.5} />
  </svg>
);
export const IconQr = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <path d="M6 6h11v11H6ZM23 6h11v11H23ZM6 23h11v11H6Z" {...s} fill="#F5E6C8" />
    <path d="M10 10h3v3h-3ZM27 10h3v3h-3ZM10 27h3v3h-3Z" fill="#0A0A0A" />
    <path d="M23 23h4v4h-4ZM30 23h4v4h-4ZM26 30h4v4h-4Z" fill="#0A0A0A" />
  </svg>
);
export const IconDice = () => (
  <svg viewBox="0 0 40 40" focusable="false">
    <rect x="6" y="6" width="28" height="28" rx="6" {...s} fill="#F5E6C8" transform="rotate(-8 20 20)" />
    <g fill="#0A0A0A" transform="rotate(-8 20 20)">
      <circle cx="13" cy="13" r="2.6" />
      <circle cx="20" cy="20" r="2.6" />
      <circle cx="27" cy="27" r="2.6" />
      <circle cx="27" cy="13" r="2.6" />
      <circle cx="13" cy="27" r="2.6" />
    </g>
  </svg>
);
