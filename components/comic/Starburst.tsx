type Props = {
  points?: number;
  /** inner radius as a fraction of the outer one */
  inner?: number;
  jitter?: number;
  seed?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Jagged comic explosion shape in a 200x200 viewBox (deterministic per seed). */
export function starburstPoints(points = 14, inner = 0.68, jitter = 0.14, seed = 7) {
  const rnd = mulberry(seed);
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const outer = i % 2 === 0;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * 0.12;
    const r = (outer ? 1 : inner) * (1 - rnd() * jitter) * 96;
    out.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
  }
  return out.join(" ");
}

export function Starburst({
  points,
  inner,
  jitter,
  seed,
  className,
  fill = "var(--blue)",
  stroke = "var(--ink)",
  strokeWidth = 5,
  children,
}: Props) {
  return (
    <svg className={className} viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
      <polygon
        points={starburstPoints(points, inner, jitter, seed)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {children}
    </svg>
  );
}
