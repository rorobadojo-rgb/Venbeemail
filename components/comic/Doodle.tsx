import type { CSSProperties } from "react";
import { ATLAS_COLS, DOODLES, type DoodleName } from "@/lib/doodleAtlas.generated";

type Props = {
  name: DoodleName;
  className?: string;
  style?: CSSProperties;
  /** extras are dropped on small screens (~60% fewer doodles on mobile) */
  extra?: boolean;
  /** base rotation in degrees */
  rotate?: number;
};

/** One doodle from the shared atlas, drawn as a CSS sprite (no extra request). */
export function Doodle({ name, className = "", style, extra, rotate = 0 }: Props) {
  const i = DOODLES.indexOf(name);
  const vars = {
    "--dx": i % ATLAS_COLS,
    "--dy": Math.floor(i / ATLAS_COLS),
    "--r": `${rotate}deg`,
    ...style,
  } as CSSProperties;
  return <span aria-hidden="true" className={`doodle${extra ? " doodle--extra" : ""} ${className}`} style={vars} />;
}
