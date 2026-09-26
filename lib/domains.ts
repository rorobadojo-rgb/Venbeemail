/**
 * The ten domains, each sold as a little plastic bag of syrup. `effect` is
 * what the bag does when pressed (see components/tool/BagChip.tsx).
 */
export type BagEffect =
  | "squish"
  | "slurp"
  | "spin"
  | "clink"
  | "puff"
  | "drip"
  | "stretch"
  | "band"
  | "sparkle"
  | "bubbles";

export type DomainInfo = {
  domain: string;
  /** syrup colour; "rainbow" is special-cased */
  syrup: string;
  /** darker tone for the liquid's shadow and the label band text */
  deep: string;
  /** flavour name printed on the label band */
  flavor: string;
  effect: BagEffect;
};

export const DOMAINS = [
  { domain: "peler.com", syrup: "#FF3A1F", deep: "#B8200C", flavor: "MERAH", effect: "squish" },
  { domain: "ewe.com", syrup: "#7CFF2B", deep: "#3FB10C", flavor: "HIJAU", effect: "slurp" },
  { domain: "bawok.com", syrup: "#FF3DAE", deep: "#C0147A", flavor: "PINK", effect: "spin" },
  { domain: "vevek.com", syrup: "#3D8BFF", deep: "#1846B8", flavor: "BIRU", effect: "clink" },
  { domain: "pentil.com", syrup: "#FFD23F", deep: "#C99A0A", flavor: "KUNING", effect: "puff" },
  { domain: "vevekbasah.com", syrup: "#19D3C5", deep: "#0B8F85", flavor: "TOSKA", effect: "drip" },
  { domain: "vevekbegelambir.com", syrup: "#8A2BE2", deep: "#5A12A0", flavor: "UNGU", effect: "stretch" },
  { domain: "tempeksempit.com", syrup: "#FF8A1F", deep: "#C2560A", flavor: "ORANYE", effect: "band" },
  { domain: "tempikenak.com", syrup: "rainbow", deep: "#8A2BE2", flavor: "PELANGI", effect: "sparkle" },
  { domain: "contlogedi.com", syrup: "#FFF4DC", deep: "#D9C49A", flavor: "SANTAN", effect: "bubbles" },
] as const satisfies readonly DomainInfo[];

export type Domain = (typeof DOMAINS)[number]["domain"];

export const DOMAIN_NAMES = DOMAINS.map((d) => d.domain) as readonly Domain[];
export const isDomain = (v: unknown): v is Domain => typeof v === "string" && (DOMAIN_NAMES as readonly string[]).includes(v);
export const domainInfo = (d: Domain): DomainInfo => DOMAINS.find((x) => x.domain === d) ?? DOMAINS[0];

/** A flat colour for UI bits that can't show a gradient. */
export const syrupFlat = (info: DomainInfo) => (info.syrup === "rainbow" ? "#FF3DAE" : info.syrup);

export const RAINBOW = ["#FF3A1F", "#FF8A1F", "#FFD23F", "#7CFF2B", "#19D3C5", "#3D8BFF", "#8A2BE2"];
