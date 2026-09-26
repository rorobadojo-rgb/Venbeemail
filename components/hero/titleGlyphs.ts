/**
 * Hand-cut block letters for "VenbeeMail", drawn for this project in the
 * spirit of chunky paper-cut lettering: straight cuts, slightly uneven
 * corners, a wavy baseline. Units: cap height 120, x-height starts at y 30.
 * Holes are extra subpaths (fill-rule evenodd).
 */
export type Glyph = {
  ch: string;
  d: string;
  w: number;
  /** y of the letter's top edge (0 for caps / ascenders, ~30 for x-height) */
  top: number;
  /** where the pour stream lands and drips can hang (x in letter units) */
  pour: number;
  drips: number[];
  /** floating bits inside the syrup: jelly cube, bubble or eyeball */
  bits: { k: "cube" | "bubble" | "eye"; x: number; y: number }[];
};

export const GLYPHS: Record<string, Glyph> = {
  V: {
    ch: "V", w: 112, top: 0, pour: 22,
    d: "M0 2L38 0L56 64L73 -2L112 4L77 120L34 118Z",
    drips: [44, 66], bits: [{ k: "cube", x: 18, y: 22 }, { k: "bubble", x: 92, y: 18 }, { k: "bubble", x: 56, y: 100 }],
  },
  e: {
    ch: "e", w: 90, top: 30, pour: 20,
    d: "M2 34L86 30L88 80L38 82L38 96L86 94L86 120L0 118Z M36 50L55 49L55 64L36 65Z",
    drips: [16, 64], bits: [{ k: "cube", x: 18, y: 96 }, { k: "bubble", x: 72, y: 60 }],
  },
  n: {
    ch: "n", w: 86, top: 30, pour: 44,
    d: "M0 32L82 30L86 120L52 120L50 62L36 62L36 120L2 120Z",
    drips: [18, 70], bits: [{ k: "bubble", x: 18, y: 92 }, { k: "cube", x: 68, y: 96 }],
  },
  b: {
    ch: "b", w: 88, top: 0, pour: 18,
    d: "M0 0L36 0L36 30L84 32L88 120L2 120Z M36 60L55 60L55 92L36 92Z",
    drips: [14, 72], bits: [{ k: "cube", x: 16, y: 30 }, { k: "eye", x: 72, y: 76 }],
  },
  M: {
    ch: "M", w: 128, top: 0, pour: 20,
    d: "M0 0L40 0L64 42L88 0L128 2L124 120L90 120L90 58L64 92L38 58L38 120L2 120Z",
    drips: [20, 108], bits: [],
  },
  a: {
    ch: "a", w: 88, top: 30, pour: 70,
    d: "M4 30L84 30L88 120L0 120L2 70L52 68L52 52L4 54Z M32 86L54 86L54 104L32 104Z",
    drips: [16, 70], bits: [],
  },
  i: {
    ch: "i", w: 40, top: 0, pour: 20,
    d: "M4 44L38 42L40 120L2 120Z M4 2L38 4L36 32L6 30Z",
    drips: [20], bits: [],
  },
  l: {
    ch: "l", w: 56, top: 0, pour: 20,
    d: "M4 0L38 0L38 92L54 90L56 120L0 118Z",
    drips: [20], bits: [],
  },
};

/** Per-letter jitter: rotation (deg) and baseline shift, for the hand-cut wobble. */
export const JITTER = [
  [-4, 6], [3, -2], [-2, 4], [4, -4], [-3, 2], [2, 6],
  [-3, 0], [4, 4], [-2, -2], [3, 2],
] as const;

export const SYRUPS = [
  { c: "#FF3DAE", deep: "#B80F72", hi: "#FF9AD5" }, // pink
  { c: "#7CFF2B", deep: "#35A80A", hi: "#CBFF9E" }, // green
  { c: "#FF3A1F", deep: "#B31C08", hi: "#FF9B8A" }, // red
  { c: "#FF8A1F", deep: "#BF560A", hi: "#FFC58A" }, // orange
  { c: "#8A2BE2", deep: "#4E0D96", hi: "#C99BFF" }, // purple
  { c: "#FFD23F", deep: "#C48F00", hi: "#FFEFA6" }, // yellow
];
