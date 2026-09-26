import type { SfxName } from "./audioSprite.generated";

/**
 * Colour tokens shared by every sticker (buttons, chips, labels). `ink` is the
 * text colour that stays readable on that colour (WCAG AA for bold text).
 */
export const STICKER_COLORS = {
  red: { bg: "#FF3A1F", ink: "#0A0A0A" },
  grey: { bg: "#8C8578", ink: "#0A0A0A" },
  lime: { bg: "#A6F23A", ink: "#0A0A0A" },
  purple: { bg: "#8A2BE2", ink: "#F5E6C8" },
  pink: { bg: "#FF1F5A", ink: "#0A0A0A" },
  black: { bg: "#1A1A1A", ink: "#F5E6C8" },
  cyan: { bg: "#2BD9F0", ink: "#0A0A0A" },
  yellow: { bg: "#FFD23F", ink: "#0A0A0A" },
  orange: { bg: "#FF8A1F", ink: "#0A0A0A" },
  cream: { bg: "#F5E6C8", ink: "#0A0A0A" },
  teal: { bg: "#17B8A6", ink: "#0A0A0A" },
  white: { bg: "#FFFFFF", ink: "#0A0A0A" },
  blue: { bg: "#2563EB", ink: "#FFFFFF" },
  kraft: { bg: "#C9A36A", ink: "#0A0A0A" },
} as const;
export type StickerColor = keyof typeof STICKER_COLORS;

export type StickerEffect =
  | "crush" | "fizz" | "bite" | "freeze" | "pricegun" | "bagpop" | "spill" | "jelly" | "coins" | "scan"
  | "print" | "tear" | "drawer" | "crumple" | "flip" | "spin" | "none";

/** Default sound for each effect (all from the supermarket-zombie kit). */
export const EFFECT_SOUND: Record<StickerEffect, SfxName | null> = {
  crush: "crush",
  fizz: "fizz",
  bite: "bite",
  freeze: "freeze",
  pricegun: "pricegun",
  bagpop: "bagpop",
  spill: "spill",
  jelly: "jelly",
  coins: "coins",
  scan: "beep",
  print: "printer",
  tear: "tear",
  drawer: "drawer",
  crumple: "crumple",
  flip: "flip",
  spin: "vending",
  none: null,
};

/** The ten "products" on the domain shelf. */
export const DOMAINS = [
  { domain: "peler.com", band: "red", body: "grey", effect: "crush", snack: "can" },
  { domain: "ewe.com", band: "lime", body: "purple", effect: "fizz", snack: "soda" },
  { domain: "bawok.com", band: "pink", body: "black", effect: "bite", snack: "chips" },
  { domain: "vevek.com", band: "cyan", body: "grey", effect: "freeze", snack: "popsicle" },
  { domain: "pentil.com", band: "yellow", body: "black", effect: "pricegun", snack: "candy" },
  { domain: "ngab.com", band: "orange", body: "cream", effect: "bagpop", snack: "bag" },
  { domain: "gaskeun.com", band: "purple", body: "lime", effect: "spill", snack: "juice" },
  { domain: "santuy.com", band: "teal", body: "pink", effect: "jelly", snack: "jelly" },
  { domain: "receh.com", band: "white", body: "red", effect: "coins", snack: "coins" },
  { domain: "gabut.com", band: "blue", body: "yellow", effect: "scan", snack: "cereal" },
] as const satisfies readonly {
  domain: string;
  band: StickerColor;
  body: StickerColor;
  effect: StickerEffect;
  snack: string;
}[];

export type Domain = (typeof DOMAINS)[number]["domain"];
export type Snack = (typeof DOMAINS)[number]["snack"];
export const DOMAIN_NAMES = DOMAINS.map((d) => d.domain) as Domain[];
export const isDomain = (d: unknown): d is Domain => typeof d === "string" && (DOMAIN_NAMES as string[]).includes(d);
