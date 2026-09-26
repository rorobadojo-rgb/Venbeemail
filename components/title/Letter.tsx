import { FRAME, GLYPHS, glyphPath, polyPath, type TitleLetter } from "./glyphs";

const INK = "#0A0A0A";
const CREAM = "#F5E6C8";

/** Drip hanging from the bottom edge at x, with a droplet that falls (CSS). */
function Drip({ x, len, color, k }: { x: number; len: number; color: string; k: number }) {
  const w = 8;
  const d = `M${x - w} -8L${x - w} ${len - 8}C${x - w} ${len + 2} ${x + w} ${len + 2} ${x + w} ${len - 8}L${x + w} -8Z`;
  return (
    <g className="tl__drip">
      <path d={d} fill={color} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <circle className="tl__drop" cx={x} cy={len + 4} r="6" fill={color} stroke={INK} strokeWidth="4" style={{ animationDelay: `${(k * 0.7) % 3}s` }} />
    </g>
  );
}

export function Letter({ l, i }: { l: TitleLetter; i: number }) {
  const g = GLYPHS[l.ch];
  const d = glyphPath(g);
  const outerOnly = polyPath(g.outer) + ("dot" in g && g.dot ? polyPath(g.dot) : "");
  const vbX = -FRAME.padX;
  const vbW = g.w + FRAME.padX * 2 + 8;
  const vbH = FRAME.bottom - FRAME.top;
  const cx = g.w / 2;
  const id = `tl${i}`;
  const slime = l.kind === "slime";
  return (
    <svg
      className={`tl tl--${l.kind}`}
      viewBox={`${vbX} ${FRAME.top} ${vbW} ${vbH}`}
      width={vbW}
      height={vbH}
      data-letter={l.ch}
      style={{ "--i": i } as React.CSSProperties}
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={d} clipRule="evenodd" />
        </clipPath>
        {l.bite ? (
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={vbX} y={FRAME.top} width={vbW} height={vbH}>
            <rect x={vbX} y={FRAME.top} width={vbW} height={vbH} fill="#fff" />
            <circle cx={l.bite[0]} cy={l.bite[1]} r={l.bite[2]} fill="#000" />
            <circle cx={l.bite[0] - l.bite[2] * 0.9} cy={l.bite[1] + l.bite[2] * 0.2} r={l.bite[2] * 0.55} fill="#000" />
            <circle cx={l.bite[0] + l.bite[2] * 0.2} cy={l.bite[1] + l.bite[2] * 0.9} r={l.bite[2] * 0.5} fill="#000" />
          </mask>
        ) : null}
      </defs>
      <g className="tl__body" transform={`translate(0 ${l.dy}) rotate(${l.rot} ${cx} -70) scale(1 ${l.sy})`}>
        <g mask={l.bite ? `url(#${id}-m)` : undefined}>
          {/* extruded side */}
          <path d={outerOnly} transform="translate(7 9)" fill={INK} stroke={INK} strokeWidth="10" strokeLinejoin="round" />
          {slime && l.drips?.map((dr, k) => <Drip key={k} x={dr.x} len={dr.len} color={l.color} k={i + k} />)}
          {slime ? (
            <path d={d} fill={l.color} fillRule="evenodd" stroke={INK} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke" />
          ) : (
            <>
              <path d={d} fill="none" stroke={INK} strokeWidth="18" strokeLinejoin="round" />
              <path d={d} fill={l.color} fillRule="evenodd" stroke={CREAM} strokeWidth="8" strokeLinejoin="round" paintOrder="stroke" />
            </>
          )}
          {slime ? (
            <g clipPath={`url(#${id}-c)`}>
              <path d={d} transform="translate(6 7)" fill="none" stroke={l.light} strokeWidth="9" strokeLinejoin="round" opacity=".8" />
              <path d={d} transform="translate(-5 -6)" fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" opacity=".18" />
            </g>
          ) : (
            <g clipPath={`url(#${id}-c)`}>
              <path d={d} transform="translate(5 6)" fill="none" stroke="#FF8A70" strokeWidth="5" strokeLinejoin="round" opacity=".7" />
            </g>
          )}
          {l.bubbles?.map(([x, y, r], k) => (
            <circle
              key={k}
              className="tl__bubble"
              cx={x}
              cy={y}
              r={r}
              fill={l.light}
              stroke={INK}
              strokeWidth="3"
              style={{ animationDelay: `${(i * 0.37 + k * 0.9) % 2.4}s` }}
            />
          ))}
          {l.stitches ? (
            <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
              <path d={`M${l.stitches[0].join(" ")}L${l.stitches[1].join(" ")}`} />
              {[0.2, 0.4, 0.6, 0.8].map((t) => {
                const [[x1, y1], [x2, y2]] = l.stitches!;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                const nx = -(y2 - y1);
                const ny = x2 - x1;
                const n = Math.hypot(nx, ny);
                return <path key={t} d={`M${x - (nx / n) * 8} ${y - (ny / n) * 8}L${x + (nx / n) * 8} ${y + (ny / n) * 8}`} />;
              })}
            </g>
          ) : null}
          {l.eyeball ? (
            <g className="tl__eye">
              <circle cx={l.eyeball[0]} cy={l.eyeball[1]} r={l.eyeball[2]} fill="#FFFFFF" stroke={INK} strokeWidth="5" />
              <circle cx={l.eyeball[0] + 3} cy={l.eyeball[1] + 2} r={l.eyeball[2] * 0.5} fill="#FF1F5A" stroke={INK} strokeWidth="3" />
              <circle cx={l.eyeball[0] + 4} cy={l.eyeball[1] + 3} r={l.eyeball[2] * 0.22} fill={INK} />
              <circle cx={l.eyeball[0] + 7} cy={l.eyeball[1] - 3} r="3" fill="#FFFFFF" />
              <circle className="tl__lid" cx={l.eyeball[0]} cy={l.eyeball[1]} r={l.eyeball[2]} fill={l.color} stroke={INK} strokeWidth="5" />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
