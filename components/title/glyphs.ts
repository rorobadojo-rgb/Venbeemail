/**
 * Hand-cut block letters for the "VenbeeMail" title, drawn for this project in
 * the style of the brief's lettering reference: straight scissor cuts, chipped
 * notches, slit counters, uneven heights, rotated letters on a wavy baseline.
 *
 * Units: baseline at y = 0, cap height 150, x-height 112, ascender 162.
 * `holes` are cut out with the even-odd rule.
 */
export type Pt = readonly [number, number];
export type Glyph = { w: number; outer: Pt[]; holes?: Pt[][]; dot?: Pt[] };

export const GLYPHS = {
  V: {
    w: 128,
    outer: [[0, -146], [9, -154], [48, -150], [64, -64], [80, -149], [98, -150], [103, -140], [109, -150], [128, -146], [92, 2], [38, 0]],
  },
  e: {
    w: 104,
    outer: [[0, -106], [98, -113], [104, -44], [36, -41], [37, -29], [102, -34], [98, 2], [4, 0], [2, -40], [-4, -46], [1, -52]],
    holes: [[[34, -85], [70, -88], [69, -66], [35, -63]]],
  },
  n: {
    w: 104,
    outer: [[0, -106], [64, -112], [104, -86], [102, 0], [66, 2], [66, -70], [52, -71], [48, -64], [44, -70], [38, -68], [38, 0], [0, 2]],
  },
  b: {
    w: 108,
    outer: [[0, -162], [42, -158], [40, -112], [76, -114], [108, -86], [104, 0], [2, 2], [3, -80], [-3, -86], [2, -92]],
  },
  M: {
    w: 156,
    outer: [[0, -150], [40, -148], [78, -97], [116, -152], [156, -146], [154, 0], [118, 2], [116, -84], [80, -44], [74, -44], [38, -88], [38, 0], [0, 2]],
  },
  a: {
    w: 104,
    outer: [[4, -112], [98, -108], [104, 0], [0, 2], [0, -68], [62, -72], [62, -82], [4, -80]],
    holes: [[[30, -46], [64, -48], [64, -24], [30, -22]]],
  },
  i: {
    w: 46,
    outer: [[0, -112], [44, -108], [46, 0], [2, 2]],
    dot: [[2, -162], [46, -158], [42, -126], [4, -128]],
  },
  l: {
    w: 46,
    outer: [[2, -162], [30, -161], [34, -154], [38, -160], [46, -158], [44, 0], [0, 2]],
  },
} satisfies Record<string, Glyph>;

export type GlyphKey = keyof typeof GLYPHS;

/** Per-letter placement and decoration of the title. */
export type TitleLetter = {
  ch: GlyphKey;
  kind: "slime" | "label";
  color: string;
  light: string;
  rot: number;
  dy: number;
  sy: number;
  drips?: { x: number; len: number }[];
  bubbles?: [number, number, number][];
  bite?: [number, number, number];
  stitches?: [Pt, Pt];
  eyeball?: [number, number, number];
};

const LIME = ["#A6F23A", "#D8FF8A"] as const;
const PINK = ["#FF1F5A", "#FF7A9C"] as const;
const PURPLE = ["#8A2BE2", "#B97CF2"] as const;
const RED = "#FF3A1F";

export const TITLE: TitleLetter[] = [
  { ch: "V", kind: "slime", color: LIME[0], light: LIME[1], rot: -5, dy: 0, sy: 1.04, drips: [{ x: 52, len: 34 }, { x: 78, len: 18 }], bubbles: [[26, -120, 7], [40, -134, 4]], bite: [120, -142, 20] },
  { ch: "e", kind: "slime", color: PINK[0], light: PINK[1], rot: 4, dy: -8, sy: 0.96, drips: [{ x: 70, len: 26 }], bubbles: [[82, -96, 6]] },
  { ch: "n", kind: "slime", color: PURPLE[0], light: PURPLE[1], rot: -3, dy: 4, sy: 1.02, drips: [{ x: 18, len: 40 }, { x: 86, len: 16 }], stitches: [[8, -92], [52, -104]] },
  { ch: "b", kind: "slime", color: LIME[0], light: LIME[1], rot: 5, dy: -6, sy: 1, drips: [{ x: 30, len: 22 }, { x: 80, len: 36 }], eyeball: [70, -52, 21], bite: [110, -100, 16] },
  { ch: "e", kind: "slime", color: PURPLE[0], light: PURPLE[1], rot: -4, dy: 6, sy: 0.94, drips: [{ x: 24, len: 30 }], bubbles: [[74, -24, 7], [60, -14, 4]], stitches: [[10, -52], [34, -30]] },
  { ch: "e", kind: "slime", color: PINK[0], light: PINK[1], rot: 3, dy: -4, sy: 1.05, drips: [{ x: 56, len: 42 }], bubbles: [[20, -94, 5]] },
  { ch: "M", kind: "label", color: RED, light: RED, rot: -4, dy: 2, sy: 1.03 },
  { ch: "a", kind: "label", color: RED, light: RED, rot: 5, dy: -8, sy: 0.97 },
  { ch: "i", kind: "label", color: RED, light: RED, rot: -3, dy: 6, sy: 1.06 },
  { ch: "l", kind: "label", color: RED, light: RED, rot: 6, dy: -2, sy: 0.98 },
];

export const polyPath = (pts: readonly Pt[]) => "M" + pts.map(([x, y]) => `${x} ${y}`).join("L") + "Z";
export function glyphPath(g: Glyph) {
  return [g.outer, ...(g.holes ?? [])].map(polyPath).join("") + (g.dot ? polyPath(g.dot) : "");
}

/** Shared vertical frame for every letter SVG (room for ascenders, extrusion and drips). */
export const FRAME = { top: -178, bottom: 62, padX: 14 };
