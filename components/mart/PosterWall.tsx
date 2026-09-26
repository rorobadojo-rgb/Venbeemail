import { asset } from "@/lib/asset";
import { POSTERS } from "@/lib/posters.generated";

/**
 * Flat poster wall: phones, reduced motion, and desktop until WebGL is ready.
 * Two posters animate in CSS: "hantu-subuh" blinks and "harga-mati" pulses
 * its rays (unless reduced motion).
 */
const LAYOUT: Record<string, { x: number; y: number; r: number; s: number }> = {
  "harga-mati": { x: 4, y: 6, r: -6, s: 1 },
  "hantu-subuh": { x: 64, y: 4, r: 5, s: 1.05 },
  "robot-kaleng": { x: 34, y: 1, r: 2, s: 0.95 },
  "gigit-dulu": { x: 80, y: 40, r: -4, s: 0.9 },
  "kopi-kuburan": { x: -4, y: 48, r: 4, s: 0.95 },
  "lorong-13": { x: 22, y: 36, r: -3, s: 0.85 },
  "awas-basah": { x: 48, y: 44, r: 6, s: 1 },
  "minuman-otak": { x: 10, y: 78, r: -5, s: 0.9 },
  "dilarang-gigit": { x: 70, y: 76, r: 3, s: 0.95 },
};

export function PosterWall() {
  return (
    <div className="wall">
      {POSTERS.map((p, i) => {
        const l = LAYOUT[p.name] ?? { x: (i % 3) * 33, y: Math.floor(i / 3) * 33, r: 0, s: 1 };
        const kind = p.name === "hantu-subuh" ? " wall__poster--blink" : p.name === "harga-mati" ? " wall__poster--pulse" : "";
        return (
          <div
            key={p.name}
            className={`wall__poster${kind}`}
            style={{ "--x": `${l.x}%`, "--y": `${l.y}%`, "--r": `${l.r}deg`, "--s": l.s, "--k": i } as React.CSSProperties}
          >
            <img src={asset(`/posters/${p.name}.webp`)} alt="" width={256} height={320} loading="lazy" decoding="async" fetchPriority="low" />
            {kind.includes("blink") ? (
              <img className="wall__frame" src={asset(`/posters/${p.name}-blink.webp`)} alt="" width={256} height={320} loading="lazy" decoding="async" />
            ) : null}
            {kind.includes("pulse") ? (
              <img className="wall__rays" src={asset(`/posters/${p.name}-rays.webp`)} alt="" width={256} height={320} loading="lazy" decoding="async" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
