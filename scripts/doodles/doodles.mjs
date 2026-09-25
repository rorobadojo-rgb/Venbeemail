// Original VenbeeMail doodle extras, drawn in-house for this project.
// Each doodle lives in a 512x512 cell. Style rules (taken from the brief):
// blue bodies with a top-lit gradient, thick black outlines, red-orange and
// cream accents. Shapes built from several parts use `outlined()` so their
// outline wraps the union instead of every overlapping part.

export const INK = "#0A0A0A";
export const RED = "#FF3A1F";
export const BLUE = "#1B7CFF";
export const CREAM = "#F5E6C8";
const LW = 18; // outline weight inside a 512 cell

export const defs = `
  <linearGradient id="vb" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#63BDFF"/>
    <stop offset=".55" stop-color="${BLUE}"/>
    <stop offset="1" stop-color="#0A4ACC"/>
  </linearGradient>
  <radialGradient id="vbi" cx=".4" cy=".35" r=".7">
    <stop offset="0" stop-color="#7CCBFF"/>
    <stop offset="1" stop-color="#0A4ACC"/>
  </radialGradient>`;

const ink = (w = LW) =>
  `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (d, w = 14) =>
  `<path d="${d}" fill="none" stroke="#CFEBFF" stroke-width="${w}" stroke-linecap="round" opacity=".9"/>`;
/** Draw shapes with one outline around their union. */
const outlined = (shapes, fill = "url(#vb)") =>
  `<g fill="${INK}" ${ink(LW * 2)}>${shapes}</g><g fill="${fill}">${shapes}</g>`;

export const doodles = [
  {
    name: "skull-flame",
    svg: `
      <path d="M256 58C138 58 78 140 82 238c2 54 26 84 48 100l8 52c4 30 30 50 62 50h112c32 0 58-20 62-50l8-52c22-16 46-46 48-100 4-98-56-180-174-180Z" fill="url(#vb)" ${ink()}/>
      ${shine("M140 170c10-40 40-70 80-80")}
      <path d="M330 92l-18 34 26 12-22 40" fill="none" ${ink(12)}/>
      <ellipse cx="186" cy="252" rx="58" ry="62" fill="${INK}"/>
      <ellipse cx="326" cy="252" rx="58" ry="62" fill="${INK}"/>
      <path d="M186 200c26 30 40 52 32 80-5 20-18 30-32 30-22 0-36-16-33-38 2-20 18-26 18-44 10 10 12 22 20 24 4-18 0-34-5-52Z" fill="${RED}" ${ink(8)}/>
      <path d="M186 270c8 8 10 18 4 26-6 6-16 4-18-4-2-8 6-12 14-22Z" fill="${CREAM}"/>
      <circle cx="326" cy="252" r="28" fill="none" stroke="${CREAM}" stroke-width="10"/>
      <circle cx="326" cy="252" r="8" fill="${CREAM}"/>
      <path d="M256 318l-22 34h44Z" fill="${INK}" ${ink(8)}/>
      <path d="M168 380h176v46c0 10-8 18-18 18H186c-10 0-18-8-18-18Z" fill="${CREAM}" ${ink(14)}/>
      <path d="M204 382v58M240 382v60M276 382v60M312 382v58" ${ink(10)}/>`,
  },
  {
    name: "ghost-grin",
    svg: `
      <path d="M128 444V232c0-92 58-152 128-152s128 60 128 152v212l-32-30-32 30-32-30-32 30-32-30-32 30-32-30Z" fill="url(#vb)" ${ink()}/>
      ${shine("M168 180c8-36 36-62 70-70")}
      <ellipse cx="212" cy="214" rx="17" ry="28" fill="${INK}"/>
      <ellipse cx="300" cy="214" rx="17" ry="28" fill="${INK}"/>
      <circle cx="216" cy="204" r="6" fill="${CREAM}"/>
      <circle cx="304" cy="204" r="6" fill="${CREAM}"/>
      <path d="M190 280q66 80 132 0Z" fill="${INK}" ${ink(14)}/>
      <path d="M226 300q30 20 60 0" fill="${RED}"/>
      <path d="M160 300c-20 6-30 20-26 34M352 300c20 6 30 20 26 34" fill="none" ${ink(12)}/>`,
  },
  {
    name: "ghost-drip",
    svg: `
      <path d="M142 300c0-128 50-198 114-198s114 70 114 198c0 30 6 58-10 72-14 10-24-10-30-22-4 40-14 80-34 80s-16-50-26-58c-8 28-20 80-44 80s-12-62-22-80c-8 18-24 28-38 18-16-12-24-52-24-90Z" fill="url(#vb)" ${ink()}/>
      ${shine("M178 200c6-32 26-56 54-64")}
      <path d="M188 216q20-14 40 0M284 216q20-14 40 0" fill="none" ${ink(14)}/>
      <ellipse cx="208" cy="246" rx="14" ry="20" fill="${INK}"/>
      <ellipse cx="304" cy="246" rx="14" ry="20" fill="${INK}"/>
      <path d="M224 312q32-26 64 0" fill="none" ${ink(14)}/>
      <path d="M196 272c-6 14-12 22-12 30 0 8 6 14 12 14s12-6 12-14c0-8-6-16-12-30Z" fill="#9ED8FF" ${ink(6)}/>`,
  },
  {
    name: "bomb",
    svg: `
      <path d="M338 118c34-40 76-40 100-86" fill="none" ${ink(14)}/>
      <path d="M300 146l44-34 38 50-44 34Z" fill="#2A2A2A" ${ink(14)}/>
      <circle cx="238" cy="300" r="156" fill="${INK}"/>
      <path d="M140 230q24-58 86-72" fill="none" stroke="${BLUE}" stroke-width="22" stroke-linecap="round"/>
      <path d="M128 280q-4 18 0 34" fill="none" stroke="${BLUE}" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="200" cy="300" rx="20" ry="32" fill="${CREAM}"/>
      <ellipse cx="290" cy="300" rx="20" ry="32" fill="${CREAM}"/>
      <circle cx="206" cy="310" r="9" fill="${INK}"/>
      <circle cx="284" cy="310" r="9" fill="${INK}"/>
      <path d="M168 256l52 18M322 256l-52 18" stroke="${CREAM}" stroke-width="12" stroke-linecap="round"/>
      <path d="M210 386q36-20 72 0" fill="none" stroke="${CREAM}" stroke-width="12" stroke-linecap="round"/>
      <path d="M440 12l10 26 26-8-16 22 22 16-28 2 2 28-18-20-18 20 2-28-28-2 22-16-16-22 26 8Z" fill="${RED}" ${ink(8)}/>
      <circle cx="440" cy="40" r="8" fill="${CREAM}"/>`,
  },
  {
    name: "mushroom",
    svg: `
      <path d="M192 300l-12 118c0 28 32 40 76 40s76-12 76-40l-12-118Z" fill="${CREAM}" ${ink()}/>
      <path d="M68 282C68 162 158 78 256 78s188 84 188 204c0 20-22 30-44 26H112c-22 4-44-6-44-26Z" fill="url(#vb)" ${ink()}/>
      ${shine("M112 214c14-54 56-96 108-110")}
      <circle cx="176" cy="196" r="30" fill="${INK}"/>
      <circle cx="268" cy="142" r="24" fill="${INK}"/>
      <circle cx="348" cy="210" r="36" fill="${INK}"/>
      <circle cx="250" cy="250" r="18" fill="${INK}"/>
      <circle cx="398" cy="270" r="12" fill="${INK}"/>
      <circle cx="232" cy="362" r="10" fill="${INK}"/>
      <circle cx="282" cy="362" r="10" fill="${INK}"/>
      <path d="M236 396q20 16 40 0" fill="none" ${ink(10)}/>`,
  },
  {
    name: "arrow",
    svg: `
      <g transform="translate(96 404) rotate(-42)">
        <path d="M0-42h250v-72l150 114-150 114v-72H0Z" fill="url(#vb)" ${ink()}/>
        <path d="M44-42v84M92-42v84M140-42v84M188-42v84" ${ink(12)}/>
        ${shine("M268-70l72 54", 12)}
      </g>`,
  },
  {
    name: "crown",
    svg: `
      <path d="M100 382L78 170l100 92 78-146 78 146 100-92-22 212Z" fill="url(#vb)" ${ink()}/>
      <path d="M100 382h312v52H100Z" fill="#0A4ACC" ${ink()}/>
      ${shine("M122 300l-8-62")}
      <path d="M256 280l30 36-30 36-30-36Z" fill="${CREAM}" ${ink(12)}/>
      <circle cx="78" cy="160" r="22" fill="${RED}" ${ink(12)}/>
      <circle cx="256" cy="106" r="24" fill="${RED}" ${ink(12)}/>
      <circle cx="434" cy="160" r="22" fill="${RED}" ${ink(12)}/>
      <circle cx="160" cy="408" r="10" fill="${CREAM}"/>
      <circle cx="256" cy="408" r="10" fill="${CREAM}"/>
      <circle cx="352" cy="408" r="10" fill="${CREAM}"/>`,
  },
  {
    name: "bubble-yes",
    svg: `
      <path d="M256 104c126 0 208 62 208 146s-82 146-208 146c-22 0-42-2-60-6l-92 58 26-82c-50-26-82-68-82-116 0-84 82-146 208-146Z" fill="${CREAM}" ${ink()}/>
      <g fill="none" ${ink(30)}>
        <path d="M130 184l40 60 40-60M170 244v68"/>
        <path d="M312 184h-62v128h62M250 248h50"/>
        <path d="M400 196c-12-16-58-18-58 12 0 34 64 28 64 68 0 36-50 42-72 18"/>
      </g>`,
  },
  {
    name: "bubble-no",
    svg: `
      <path d="M256 104C130 104 48 166 48 250s82 146 208 146c22 0 42-2 60-6l92 58-26-82c50-26 82-68 82-116 0-84-82-146-208-146Z" fill="url(#vb)" ${ink()}/>
      ${shine("M110 200c20-36 60-60 112-66")}
      <g fill="none" ${ink(32)}>
        <path d="M150 316V184l86 132V184"/>
        <ellipse cx="330" cy="250" rx="46" ry="66"/>
      </g>
      <path d="M404 176v70" ${ink(26)}/><circle cx="404" cy="300" r="15" fill="${INK}"/>`,
  },
  {
    name: "eyeball",
    svg: `
      <path d="M236 404c-6 30-2 56 18 70M280 404c10 22 30 34 54 36" fill="none" stroke="${RED}" stroke-width="14" stroke-linecap="round"/>
      <circle cx="256" cy="250" r="160" fill="${CREAM}" ${ink()}/>
      <path d="M102 210c30 10 50 4 70 18M110 300c30-6 44 8 66 2M150 380c18-18 36-22 56-18" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="292" cy="238" r="84" fill="url(#vbi)" ${ink(14)}/>
      <path d="M292 162v28M292 286v28M216 238h28M340 238h28M240 186l20 20M324 270l20 20M344 186l-20 20M260 270l-20 20" stroke="#0A4ACC" stroke-width="6" stroke-linecap="round"/>
      <circle cx="298" cy="236" r="38" fill="${INK}"/>
      <circle cx="318" cy="214" r="13" fill="#FFFFFF"/>
      <circle cx="274" cy="262" r="6" fill="#FFFFFF"/>`,
  },
  {
    name: "bone",
    svg: `
      <g transform="rotate(-32 256 256)">
        ${outlined(`
          <rect x="120" y="222" width="272" height="68" rx="20"/>
          <circle cx="112" cy="214" r="46"/><circle cx="112" cy="298" r="46"/>
          <circle cx="400" cy="214" r="46"/><circle cx="400" cy="298" r="46"/>`, CREAM)}
        <path d="M150 238h200" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity=".8"/>
      </g>`,
  },
  {
    name: "mail-monster",
    svg: `
      <path d="M130 420l-10 48M382 420l10 48" ${ink(16)}/>
      <rect x="70" y="140" width="372" height="282" rx="24" fill="url(#vb)" ${ink()}/>
      <path d="M78 150l178 138 178-138" fill="none" ${ink()}/>
      ${shine("M100 196v80")}
      <path d="M160 328q96 90 192 0Z" fill="${INK}" ${ink(14)}/>
      <path d="M176 334l18 26 18-20 18 24 18-22 16 22 18-22 18 24 18-22 16 16" fill="${CREAM}" stroke="${CREAM}" stroke-width="6" stroke-linejoin="round"/>
      <g transform="translate(150 212)"><ellipse rx="38" ry="30" fill="${CREAM}" ${ink(10)}/><path d="M-44-4h88" ${ink(16)}/><circle cy="12" r="7" fill="${INK}"/></g>
      <g transform="translate(362 212)"><ellipse rx="38" ry="30" fill="${CREAM}" ${ink(10)}/><path d="M-44-4h88" ${ink(16)}/><circle cy="12" r="7" fill="${INK}"/></g>
      <circle cx="420" cy="120" r="30" fill="${RED}" ${ink(12)}/>
      <path d="M420 104v18M420 134v2" ${ink(10)}/>`,
  },
  {
    name: "at-blob",
    svg: `
      <path d="M318 214v84c0 42 72 44 82-12 18-100-56-170-144-170-92 0-156 70-156 150 0 90 70 152 160 152 44 0 74-10 98-28" fill="none" stroke="${INK}" stroke-width="84" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="256" cy="262" r="66" fill="${INK}"/>
      <path d="M318 214v84c0 42 72 44 82-12 18-100-56-170-144-170-92 0-156 70-156 150 0 90 70 152 160 152 44 0 74-10 98-28" fill="none" stroke="url(#vb)" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="256" cy="262" r="48" fill="url(#vb)"/>
      <circle cx="240" cy="252" r="9" fill="${INK}"/><circle cx="274" cy="252" r="9" fill="${INK}"/>
      <path d="M238 280q18 14 36 0" fill="none" ${ink(8)}/>
      <path d="M140 200c10-26 30-44 56-54" fill="none" stroke="#CFEBFF" stroke-width="12" stroke-linecap="round"/>`,
  },
  {
    name: "lightning",
    svg: `
      <path d="M298 44L136 284h104l-44 184 190-264H278l58-160Z" fill="url(#vb)" ${ink()}/>
      ${shine("M280 90l-86 130", 12)}
      <path d="M396 120l40-20M410 170h44M90 360l-40 14M84 310l-44-6" ${ink(12)}/>`,
  },
  {
    name: "paper-ball",
    svg: `
      <path d="M150 128l74-40 58 30 70-22 44 64 38 40-20 76 26 60-58 58-72 4-54 34-64-28-70 2-28-70-30-58 32-60-6-66Z" fill="${CREAM}" ${ink()}/>
      <path d="M224 88l-12 70 70-40M352 96l-20 84 64 20M132 270l86-18-22 90M432 346l-78-26 8-74M226 436l30-86 64 54" fill="none" ${ink(9)} opacity=".85"/>
      <path d="M196 214l40 40M236 214l-40 40M292 214l40 40M332 214l-40 40" ${ink(14)}/>
      <path d="M214 316q20-18 40 0t40 0t40 0" fill="none" ${ink(12)}/>`,
  },
  {
    name: "splat-star",
    svg: `
      <path d="M256 36l40 110 104-58-38 112 118 14-104 64 78 90-118-20-6 120-74-92-74 92-6-120-118 20 78-90-104-64 118-14-38-112 104 58Z" fill="url(#vb)" ${ink()}/>
      <circle cx="256" cy="262" r="70" fill="${CREAM}" ${ink(14)}/>
      <path d="M256 222v40" ${ink(24)}/><circle cx="256" cy="298" r="12" fill="${INK}"/>`,
  },
];
