import { Bubble } from "@/components/comic/Bubble";
import { Doodle } from "@/components/comic/Doodle";
import { Echoes } from "@/components/comic/Echoes";
import { Mascot } from "@/components/mascot/Mascot";
import type { DoodleName } from "@/lib/doodleAtlas.generated";

const INK = "#0A0A0A";
const RED = "#FF3A1F";
const BLUE = "#1B7CFF";
const CREAM = "#F5E6C8";

function FormArt() {
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true">
      <rect x="50" y="26" width="140" height="164" rx="12" fill={BLUE} stroke={INK} strokeWidth="7" />
      <rect x="64" y="44" width="112" height="132" rx="6" fill={CREAM} stroke={INK} strokeWidth="5" />
      <rect x="92" y="12" width="56" height="28" rx="8" fill={INK} />
      <path d="M76 70h30M76 84h86M76 106h30M76 120h86M76 142h40" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M44 44l152 132M196 44L44 176" stroke={INK} strokeWidth="32" strokeLinecap="round" />
      <path d="M44 44l152 132M196 44L44 176" stroke={RED} strokeWidth="18" strokeLinecap="round" />
    </svg>
  );
}

function PoofArt() {
  const dots: [number, number, number][] = [
    [22, 96, 7], [10, 78, 5], [32, 70, 5.5], [16, 56, 4], [40, 48, 3.5], [24, 36, 3], [52, 30, 2.4], [8, 30, 2],
  ];
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true">
      <circle cx="160" cy="92" r="58" fill={CREAM} stroke={INK} strokeWidth="7" />
      <rect x="150" y="16" width="20" height="20" rx="4" fill={INK} />
      <path d="M204 44l12-12" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M160 92V54M160 92l28 16" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M160 40v8M212 92h-8M160 144v-8M108 92h8" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="160" cy="92" r="7" fill={RED} stroke={INK} strokeWidth="3" />
      <g transform="rotate(-12 80 136)">
        <rect x="26" y="104" width="104" height="70" rx="8" fill={RED} stroke={INK} strokeWidth="6" />
        <path d="M28 108l50 38 50-38" fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      </g>
      <g fill={CREAM} stroke={INK} strokeWidth="5">
        <circle cx="40" cy="120" r="18" />
        <circle cx="26" cy="140" r="14" />
        <circle cx="52" cy="146" r="12" />
      </g>
      <g fill={INK}>
        {dots.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

function ShieldArt() {
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true">
      <path d="M120 10l80 26v58c0 52-35 84-80 100-45-16-80-48-80-100V36Z" fill={BLUE} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <path d="M120 28l62 20v46c0 38-26 64-62 78" fill="none" stroke="#63BDFF" strokeWidth="8" strokeLinecap="round" />
      <rect x="80" y="72" width="80" height="54" rx="6" fill={CREAM} stroke={INK} strokeWidth="6" />
      <path d="M82 76l38 28 38-28" fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <g stroke={INK} strokeWidth="22" fill="none" strokeLinecap="round">
        <circle cx="120" cy="99" r="50" />
        <path d="M86 64l68 70" />
      </g>
      <g stroke={RED} strokeWidth="11" fill="none" strokeLinecap="round">
        <circle cx="120" cy="99" r="50" />
        <path d="M86 64l68 70" />
      </g>
      <path d="M206 20l-18 30h14l-12 26" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Feature = {
  id: string;
  title: string;
  body: string;
  sfx: string;
  line: string;
  theme: "cream" | "blue" | "red";
  fly: "left" | "top" | "bottom";
  art: React.ReactNode;
  doodles: [DoodleName, DoodleName];
};

const FEATURES: Feature[] = [
  {
    id: "daftar",
    title: "Tanpa daftar",
    body: "Nggak perlu akun, nggak perlu password, nggak perlu nomor HP. Buka, dapet alamat, pakai.",
    sfx: "SKIP!",
    line: "Formulir? Skip!",
    theme: "cream",
    fly: "left",
    art: <FormArt />,
    doodles: ["bubble-no", "paper-ball"],
  },
  {
    id: "hilang",
    title: "Hilang otomatis",
    body: "Waktunya habis, inbox menghapus dirinya sendiri. Nggak ada jejak, nggak ada sisa.",
    sfx: "POOF!",
    line: "Poof! Udah ilang.",
    theme: "blue",
    fly: "top",
    art: <PoofArt />,
    doodles: ["ghost-drip", "skull-flame"],
  },
  {
    id: "spam",
    title: "Bebas spam",
    body: "Kasih alamat ini ke situs yang rewel. Spam nyangkut di sini, email utama kamu tetap bersih.",
    sfx: "ZAP!",
    line: "Spam? Tendang!",
    theme: "red",
    fly: "bottom",
    art: <ShieldArt />,
    doodles: ["lightning", "splat-star"],
  },
];

export function FeaturePanels() {
  return (
    <>
      <h2 className="sr-only">Kenapa VenbeeMail</h2>
      {FEATURES.map((f, i) => (
        <div key={f.id} className="feat-slot">
          <Echoes theme={f.theme} />
          <article className={`panel panel--feat panel--${f.theme}`} data-fly={f.fly} aria-labelledby={`feat-${f.id}`}>
            <Doodle name={f.doodles[0]} className="fd fd--1" rotate={i % 2 ? 12 : -10} />
            <Doodle name={f.doodles[1]} className="fd fd--2" rotate={i % 2 ? -8 : 14} extra />
            <span className="sfx feat__sfx" aria-hidden="true">
              {f.sfx}
            </span>
            <p className="caption feat__num">Fitur #{i + 1}</p>
            <div className="feat__art">{f.art}</div>
            <h3 id={`feat-${f.id}`} className="panel-title feat__title">
              {f.title}
            </h3>
            <p className="feat__body">{f.body}</p>
            <div className="feat__narrator">
              <Mascot className="feat__bird" flip={i === 1} />
              <Bubble tail="left" className="feat__bubble">
                {f.line}
              </Bubble>
            </div>
          </article>
        </div>
      ))}
    </>
  );
}
