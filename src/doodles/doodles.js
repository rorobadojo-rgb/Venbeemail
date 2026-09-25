/**
 * Original doodle stickers for VenbeeMail.
 *
 * Style notes (matching the reference mood, not its content): glossy blue bodies,
 * fat black outlines, red-orange accents, cream details, goofy faces.
 * Every doodle is drawn in a 200×200 box and keeps ~22 units of margin so the
 * die-cut border (added by scripts/build-atlas.mjs) never touches the cell edge.
 *
 * Consumed by the atlas build script only — the browser loads the baked atlas.
 */

const K = '#0A0A0A';
const C = '#F5E6C8';
const B = 'url(#gB)';
const BD = '#0F55E0';
const BL = '#9BE2FF';
const R = 'url(#gR)';
const RS = '#FF3A1F';
const o = (w = 7) => `stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const hl = (d, w = 7, c = BL) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const eye = (x, y, r = 11, px = 0, py = 2) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${C}" ${o(5)}/><circle cx="${x + px}" cy="${y + py}" r="${r * 0.48}" fill="${K}"/>`;

/** Shapes drawn twice: once as a fat black outline, then filled on top → merged silhouette outline. */
const union = (shapes, fill, w = 14) =>
  shapes
    .map((s) => s.replace('/>', ` fill="${K}" stroke="${K}" stroke-width="${w}" stroke-linejoin="round"/>`))
    .join('') + shapes.map((s) => s.replace('/>', ` fill="${fill}"/>`)).join('');

export const defs = `
<radialGradient id="gB" cx="0.36" cy="0.3" r="0.8">
  <stop offset="0" stop-color="#8BE0FF"/><stop offset="0.35" stop-color="#3AA2FF"/>
  <stop offset="0.72" stop-color="#1B7CFF"/><stop offset="1" stop-color="#0D4FD8"/>
</radialGradient>
<radialGradient id="gR" cx="0.34" cy="0.3" r="0.8">
  <stop offset="0" stop-color="#FF8A5E"/><stop offset="0.5" stop-color="#FF3A1F"/><stop offset="1" stop-color="#CF2710"/>
</radialGradient>
<radialGradient id="gK" cx="0.35" cy="0.3" r="0.75">
  <stop offset="0" stop-color="#3A3A3A"/><stop offset="0.6" stop-color="#151515"/><stop offset="1" stop-color="#0A0A0A"/>
</radialGradient>
<linearGradient id="gC" x1="0" y1="0" x2="0.4" y2="1">
  <stop offset="0" stop-color="#FFF7E6"/><stop offset="1" stop-color="#E6D2AC"/>
</linearGradient>
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#CFF1FF"/><stop offset="1" stop-color="#6FC4FF"/>
</linearGradient>`;

const bubble = (text, fill, textFill, size, tailLeft = true, rot = -6) => `
<g transform="rotate(${rot} 100 100)">
  <path d="M34 52 H166 Q178 52 178 64 V128 Q178 140 166 140 H${tailLeft ? '88 L58 170 L64 140' : '136 L150 170 L112 140'} H34 Q22 140 22 128 V64 Q22 52 34 52 Z" fill="${fill}" ${o(8)}/>
  <text x="100" y="${96 + size * 0.36}" text-anchor="middle" font-family="Bowlby One" font-size="${size}"
    fill="${textFill}" stroke="${K}" stroke-width="6" paint-order="stroke fill" stroke-linejoin="round">${text}</text>
</g>`;

export const doodles = [
  {
    id: 'env-monster',
    svg: `
<g transform="rotate(-6 100 100)">
  <path d="M50 74 L58 26 L148 36 L140 84 Z" fill="${C}" ${o()}/>
  <path d="M70 44 L130 51 M67 58 L112 63" ${o(5)}/>
  <rect x="26" y="66" width="148" height="104" rx="14" fill="${B}" ${o()}/>
  <path d="M26 80 L64 106 M174 80 L136 106" ${o(6)} fill="none"/>
  ${eye(78, 100, 13, 3)}${eye(122, 100, 13, -3)}
  <path d="M62 84 L90 92 M138 84 L110 92" ${o(6)}/>
  <path d="M56 126 Q100 170 144 126 Z" fill="${K}" ${o(6)}/>
  <path d="M62 128 L70 140 L79 130 L88 144 L97 131 L106 144 L115 130 L124 142 L132 130 L140 136 L142 128 Z" fill="${C}"/>
  <path d="M86 150 Q100 146 112 152 Q104 160 94 158 Z" fill="${RS}"/>
  ${hl('M38 92 Q38 78 52 76')}
</g>`,
  },
  {
    id: 'at-blob',
    svg: `
<path d="M136 160 A64 64 0 1 1 164 104 L164 116 Q164 136 146 136 Q130 136 132 116" fill="none" stroke="${K}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M136 160 A64 64 0 1 1 164 104 L164 116 Q164 136 146 136 Q130 136 132 116" fill="none" stroke="#2B8FFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
${hl('M56 70 Q66 52 86 44', 6)}
<circle cx="102" cy="102" r="34" fill="${B}" ${o()}/>
<circle cx="90" cy="96" r="6" fill="${K}"/><circle cx="114" cy="96" r="6" fill="${K}"/>
<path d="M88 112 Q102 126 116 112" fill="none" ${o(6)}/>
<path d="M100 118 Q104 132 112 124" fill="${RS}" ${o(4)}/>`,
  },
  {
    id: 'ghost-grin',
    svg: `
<g transform="rotate(-8 100 100)">
  <path d="M48 172 V92 C48 50 72 28 100 28 C128 28 152 50 152 92 V172 L136 158 L120 174 L104 158 L88 174 L72 158 Z" fill="${B}" ${o()}/>
  <path d="M72 88 Q81 76 90 88 M110 88 Q119 76 128 88" fill="none" ${o(6)}/>
  <path d="M74 106 Q100 140 126 106 Z" fill="${K}" ${o(6)}/>
  <path d="M90 122 Q100 116 110 122 Q106 130 100 130 Q94 130 90 122 Z" fill="${RS}"/>
  ${hl('M62 76 Q64 54 82 46')}
  <path d="M152 110 Q170 104 168 86" fill="none" ${o(7)}/>
</g>`,
  },
  {
    id: 'ghost-zip',
    svg: `
<g transform="rotate(7 100 100)">
  <path d="M52 168 V96 C52 54 74 30 100 30 C126 30 148 54 148 96 V168 Q139 180 130 168 Q121 156 112 168 Q103 180 94 168 Q85 156 76 168 Q67 180 58 168 Z" fill="${B}" ${o()}/>
  <ellipse cx="82" cy="86" rx="7" ry="10" fill="${K}"/><ellipse cx="118" cy="86" rx="7" ry="10" fill="${K}"/>
  <path d="M70 118 H130" ${o(6)}/>
  <path d="M78 112 V124 M88 112 V124 M98 112 V124 M108 112 V124 M118 112 V124" ${o(4)}/>
  <rect x="124" y="110" width="14" height="22" rx="4" fill="${C}" ${o(4)}/>
  ${hl('M64 76 Q66 56 84 48')}
</g>`,
  },
  {
    id: 'bomb',
    svg: `
<circle cx="96" cy="114" r="58" fill="url(#gK)" ${o()}/>
<rect x="116" y="46" width="30" height="22" rx="4" transform="rotate(38 131 57)" fill="#2A2A2A" ${o(6)}/>
<path d="M140 46 Q150 26 166 32" fill="none" ${o(6)}/>
<path d="M168 16 L173 28 L186 26 L177 35 L184 46 L171 41 L164 52 L162 39 L149 36 L161 30 Z" fill="${R}" ${o(4)}/>
<circle cx="168" cy="33" r="4" fill="${C}"/>
${hl('M52 102 Q56 74 82 62', 7, '#3AA2FF')}
<ellipse cx="78" cy="112" rx="12" ry="13" fill="${C}" ${o(4)}/><ellipse cx="114" cy="112" rx="12" ry="13" fill="${C}" ${o(4)}/>
<circle cx="81" cy="116" r="6" fill="${K}"/><circle cx="111" cy="116" r="6" fill="${K}"/>
<path d="M64 96 L90 102 M128 96 L102 102" stroke="${C}" stroke-width="6" stroke-linecap="round"/>
<path d="M80 144 Q88 136 96 144 Q104 152 112 144" fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`,
  },
  {
    id: 'hourglass',
    svg: `
<g transform="rotate(12 100 100)">
  <path d="M58 44 C58 84 92 90 92 100 C92 110 58 116 58 156 H142 C142 116 108 110 108 100 C108 90 142 84 142 44 Z" fill="url(#gGlass)" ${o()}/>
  <path d="M68 58 H132 C128 78 108 84 100 94 C92 84 72 78 68 58 Z" fill="${C}"/>
  <path d="M100 96 V144" stroke="${C}" stroke-width="4"/>
  <path d="M64 150 Q100 112 136 150 Z" fill="${C}" ${o(4)}/>
  <circle cx="92" cy="138" r="3.5" fill="${K}"/><circle cx="108" cy="138" r="3.5" fill="${K}"/>
  <ellipse cx="100" cy="145" rx="3" ry="2.5" fill="${K}"/>
  <rect x="40" y="26" width="120" height="20" rx="8" fill="${R}" ${o()}/>
  <rect x="40" y="154" width="120" height="20" rx="8" fill="${R}" ${o()}/>
  ${hl('M70 62 Q72 76 84 84', 5, '#FFFFFF')}
</g>`,
  },
  {
    id: 'trash',
    svg: `
<path d="M50 78 L62 174 H138 L150 78 Z" fill="${B}" ${o()}/>
<path d="M80 96 L84 156 M100 96 V158 M120 96 L116 156" stroke="${BD}" stroke-width="7" stroke-linecap="round"/>
<path d="M50 80 Q100 52 150 80 Z" fill="${K}" ${o(5)}/>
${eye(86, 72, 9, 2, 1)}${eye(112, 69, 9, 2, 1)}
<g transform="rotate(-22 56 64)">
  <rect x="40" y="52" width="118" height="18" rx="7" fill="${B}" ${o()}/>
  <rect x="84" y="38" width="30" height="16" rx="6" fill="none" ${o(6)}/>
</g>
<path d="M140 118 Q160 112 158 136 Q150 128 142 136" fill="${RS}" ${o(5)}/>
${hl('M62 100 L68 148', 6)}`,
  },
  {
    id: 'skull-star',
    svg: `
<g transform="rotate(-5 100 100)">
  <path d="M100 26 C58 26 34 56 34 92 C34 116 46 130 60 138 V160 C60 168 66 172 74 172 H126 C134 172 140 168 140 160 V138 C154 130 166 116 166 92 C166 56 142 26 100 26 Z" fill="${B}" ${o()}/>
  <path d="M74 72 L80 86 L95 87 L83 96 L88 111 L74 102 L61 111 L66 96 L54 87 L69 86 Z" fill="${RS}" ${o(5)}/>
  <circle cx="126" cy="94" r="19" fill="${K}"/><circle cx="120" cy="88" r="5" fill="${C}"/>
  <path d="M100 112 L91 130 H109 Z" fill="${K}" ${o(4)}/>
  <path d="M68 146 H132 M84 138 V170 M100 138 V170 M116 138 V170" ${o(5)}/>
  <path d="M58 48 L70 60 L62 68" fill="none" ${o(5)}/>
  <g transform="rotate(38 138 50)">
    <rect x="114" y="41" width="48" height="18" rx="8" fill="${C}" ${o(5)}/>
    <circle cx="132" cy="50" r="2" fill="${K}"/><circle cx="144" cy="50" r="2" fill="${K}"/>
  </g>
  ${hl('M46 94 Q46 62 68 46')}
</g>`,
  },
  {
    id: 'mushroom',
    svg: `
<path d="M70 108 C66 140 64 160 70 174 H130 C136 160 134 140 130 108 Z" fill="url(#gC)" ${o()}/>
<path d="M28 104 C28 58 62 30 100 30 C138 30 172 58 172 104 C172 112 164 118 156 116 C120 106 80 106 44 116 C36 118 28 112 28 104 Z" fill="${R}" ${o()}/>
<ellipse cx="72" cy="64" rx="13" ry="10" fill="${C}" ${o(4)}/>
<ellipse cx="118" cy="52" rx="10" ry="8" fill="${C}" ${o(4)}/>
<ellipse cx="146" cy="84" rx="11" ry="9" fill="${C}" ${o(4)}/>
<ellipse cx="98" cy="88" rx="8" ry="6" fill="${C}" ${o(4)}/>
<circle cx="86" cy="136" r="5" fill="${K}"/><circle cx="114" cy="136" r="5" fill="${K}"/>
<path d="M92 150 Q100 158 108 150" fill="none" ${o(5)}/>
<ellipse cx="78" cy="148" rx="6" ry="4" fill="#FF8A5E"/><ellipse cx="122" cy="148" rx="6" ry="4" fill="#FF8A5E"/>`,
  },
  {
    id: 'eyeball',
    svg: `
<path d="M82 144 L70 172 H54 M118 144 L134 170 H150" fill="none" ${o(8)}/>
<ellipse cx="52" cy="172" rx="12" ry="7" fill="${R}" ${o(5)}/>
<ellipse cx="152" cy="170" rx="12" ry="7" fill="${R}" ${o(5)}/>
<circle cx="100" cy="92" r="58" fill="url(#gC)" ${o()}/>
<path d="M44 84 Q56 90 58 80 M46 108 Q58 104 62 114 M150 70 Q142 76 138 68" fill="none" stroke="${RS}" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="112" cy="96" r="27" fill="${B}" ${o(5)}/>
<circle cx="114" cy="98" r="13" fill="${K}"/>
<circle cx="106" cy="88" r="6" fill="#FFFFFF"/>`,
  },
  {
    id: 'bone',
    svg: `
<g transform="rotate(-32 100 100)">
  ${union(
    [
      '<rect x="44" y="86" width="112" height="28" rx="6"/>',
      '<circle cx="42" cy="84" r="20"/>',
      '<circle cx="42" cy="116" r="20"/>',
      '<circle cx="158" cy="84" r="20"/>',
      '<circle cx="158" cy="116" r="20"/>',
    ],
    'url(#gC)',
  )}
  ${hl('M30 78 Q34 68 44 68', 5, '#FFFFFF')}
  <path d="M62 108 H138" stroke="#D8C19A" stroke-width="5" stroke-linecap="round"/>
</g>`,
  },
  {
    id: 'bolt',
    svg: `
<path d="M114 18 L50 112 H94 L78 182 L152 82 H108 L134 18 Z" fill="${R}" ${o()}/>
<circle cx="92" cy="98" r="5" fill="${K}"/><circle cx="110" cy="98" r="5" fill="${K}"/>
<path d="M88 110 Q100 122 112 110" fill="none" ${o(5)}/>
${hl('M110 30 L80 76', 5, '#FFC2A8')}`,
  },
  { id: 'bubble-spam', svg: bubble('SPAM?', R, C, 38, true, -7) },
  { id: 'bubble-nope', svg: bubble('NOPE', B, C, 42, false, 6) },
  { id: 'bubble-bye', svg: bubble('BYE!', 'url(#gC)', RS, 46, true, -4) },
  {
    id: 'flame',
    svg: `
<path d="M100 18 C114 50 152 66 152 118 C152 152 130 178 100 178 C70 178 48 152 48 118 C48 92 62 78 72 64 C74 84 80 92 90 96 C86 68 90 42 100 18 Z" fill="${B}" ${o()}/>
<path d="M100 88 C110 104 130 116 130 138 C130 156 116 166 100 166 C84 166 70 156 70 138 C70 122 86 110 100 88 Z" fill="${BL}" ${o(5)}/>
<path d="M82 128 L94 132 M118 128 L106 132" ${o(5)}/>
<circle cx="90" cy="140" r="4" fill="${K}"/><circle cx="110" cy="140" r="4" fill="${K}"/>
<path d="M92 156 Q100 150 108 156" fill="none" ${o(4)}/>
${hl('M62 110 Q62 88 76 76', 6)}`,
  },
  {
    id: 'cloud',
    svg: `
<path d="M100 146 C92 160 88 168 88 174 A12 12 0 0 0 112 174 C112 168 108 160 100 146 Z" fill="${BL}" ${o(5)}/>
${union(
  [
    '<circle cx="64" cy="104" r="30"/>',
    '<circle cx="100" cy="82" r="40"/>',
    '<circle cx="140" cy="100" r="32"/>',
    '<circle cx="118" cy="124" r="24"/>',
    '<circle cx="80" cy="126" r="24"/>',
  ],
  B,
)}
<circle cx="84" cy="98" r="10" fill="${C}" ${o(4)}/><circle cx="116" cy="98" r="10" fill="${C}" ${o(4)}/>
<circle cx="84" cy="103" r="5" fill="${K}"/><circle cx="116" cy="103" r="5" fill="${K}"/>
<path d="M88 126 Q100 116 112 126" fill="none" ${o(5)}/>
${hl('M74 64 Q84 50 100 50', 6)}`,
  },
  {
    id: 'plane',
    svg: `
<path d="M22 138 H58 M30 158 H74 M44 176 H70" stroke="#2B8FFF" stroke-width="8" stroke-linecap="round"/>
<path d="M22 104 L178 34 L112 170 L92 124 Z" fill="url(#gC)" ${o()}/>
<path d="M92 124 L112 170 L104 128 Z" fill="#D7C39D" ${o(5)}/>
<path d="M178 34 L92 124" ${o(5)}/>
<path d="M148 70 L158 60" stroke="${RS}" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    id: 'key',
    svg: `
<g transform="rotate(40 100 100)">
  <rect x="88" y="78" width="24" height="100" rx="6" fill="${B}" ${o()}/>
  <path d="M112 140 H132 V154 H112 M112 160 H138 V174 H112" fill="${B}" ${o(6)}/>
  <circle cx="100" cy="56" r="38" fill="${B}" ${o()}/>
  <circle cx="88" cy="50" r="5" fill="${K}"/><circle cx="112" cy="50" r="5" fill="${K}"/>
  <path d="M88 66 Q100 78 112 66" fill="none" ${o(5)}/>
  ${hl('M72 50 Q74 32 88 26', 6)}
</g>`,
  },
  {
    id: 'star',
    svg: `
<path d="M100 22 L122 76 L180 80 L135 117 L150 174 L100 143 L50 174 L65 117 L20 80 L78 76 Z" fill="${R}" ${o(8)}/>
${eye(86, 104, 10, 2, 2)}${eye(114, 104, 10, -2, 2)}
<path d="M90 124 Q100 138 110 124 Z" fill="${K}" ${o(4)}/>
${hl('M88 54 L96 36', 6, '#FFC2A8')}`,
  },
  {
    id: 'dice',
    svg: `
<g transform="rotate(-8 100 100)">
  <path d="M100 28 L168 62 L100 96 L32 62 Z" fill="#FFF7E6" ${o()}/>
  <path d="M32 62 L100 96 V172 L32 138 Z" fill="#E9D6B2" ${o()}/>
  <path d="M100 96 L168 62 V138 L100 172 Z" fill="#D6BE92" ${o()}/>
  <ellipse cx="100" cy="62" rx="12" ry="7" fill="${RS}"/>
  <ellipse cx="52" cy="92" rx="6" ry="8" transform="rotate(-20 52 92)" fill="${K}"/>
  <ellipse cx="80" cy="140" rx="6" ry="8" transform="rotate(-20 80 140)" fill="${K}"/>
  <ellipse cx="120" cy="104" rx="6" ry="8" transform="rotate(20 120 104)" fill="${K}"/>
  <ellipse cx="134" cy="118" rx="6" ry="8" transform="rotate(20 134 118)" fill="${K}"/>
  <ellipse cx="148" cy="132" rx="6" ry="8" transform="rotate(20 148 132)" fill="${K}"/>
</g>`,
  },
  {
    id: 'snail-mail',
    svg: `
<path d="M22 166 Q22 148 42 148 H138 L148 118 C152 104 172 104 176 118 C178 132 170 142 162 150 L156 166 Z" fill="${B}" ${o()}/>
<path d="M156 112 L150 82 M168 114 L178 86" ${o(6)}/>
${eye(150, 80, 9, 1, 2)}${eye(177, 86, 9, 1, 2)}
<path d="M158 130 Q164 136 170 130" fill="none" ${o(4)}/>
<g transform="rotate(-10 92 108)">
  <rect x="42" y="70" width="104" height="76" rx="8" fill="url(#gC)" ${o()}/>
  <path d="M42 76 L94 114 L146 76" fill="none" ${o(6)}/>
  <circle cx="94" cy="114" r="9" fill="${RS}" ${o(4)}/>
  <rect x="120" y="82" width="16" height="18" fill="#2B8FFF" ${o(3)}/>
</g>
${hl('M34 156 H60', 5)}`,
  },
  {
    id: 'heart',
    svg: `
<path d="M100 172 C60 142 24 114 24 76 C24 50 44 30 68 30 C84 30 94 40 100 52 C106 40 116 30 132 30 C156 30 176 50 176 76 C176 114 140 142 100 172 Z" fill="${R}" ${o()}/>
<g transform="rotate(-38 128 70)">
  <rect x="100" y="60" width="58" height="22" rx="10" fill="${C}" ${o(5)}/>
</g>
<g transform="rotate(38 128 70)">
  <rect x="100" y="60" width="58" height="22" rx="10" fill="${C}" ${o(5)}/>
  <circle cx="122" cy="71" r="2.2" fill="${K}"/><circle cx="136" cy="71" r="2.2" fill="${K}"/>
</g>
${hl('M44 76 Q44 56 62 50', 7, '#FFC2A8')}`,
  },
  {
    id: 'mailbox',
    svg: `
<rect x="88" y="118" width="24" height="60" fill="#2A2A2A" ${o()}/>
<path d="M140 108 V36" ${o(7)}/>
<path d="M140 36 H174 V60 H140 Z" fill="${R}" ${o(6)}/>
<path d="M36 124 V86 C36 60 54 46 78 46 H130 C152 46 166 62 166 86 V124 Z" fill="${B}" ${o()}/>
<path d="M36 124 V86 C36 64 48 52 62 52 C78 52 90 64 90 86 V124 Z" fill="${BD}" ${o()}/>
<rect x="46" y="86" width="34" height="10" rx="5" fill="${K}"/>
<path d="M54 94 Q52 118 62 118 Q72 118 70 94 Z" fill="${RS}" ${o(4)}/>
${eye(114, 80, 10, 2, 2)}${eye(142, 80, 10, 2, 2)}
${hl('M104 58 H132', 6)}`,
  },
  {
    id: 'clock',
    svg: `
<path d="M68 156 L56 176 M132 156 L144 176" ${o(8)}/>
<circle cx="58" cy="50" r="18" fill="${R}" ${o()}/><circle cx="142" cy="50" r="18" fill="${R}" ${o()}/>
<circle cx="100" cy="106" r="60" fill="${B}" ${o()}/>
<circle cx="100" cy="106" r="44" fill="url(#gC)" ${o(5)}/>
<path d="M100 70 V78 M136 106 H128 M100 142 V134 M64 106 H72" ${o(5)}/>
<path d="M100 106 V80 M100 106 L118 118" ${o(6)}/>
<circle cx="100" cy="106" r="5" fill="${RS}"/>
<path d="M26 34 L36 42 M22 58 H34 M174 34 L164 42 M178 58 H166" ${o(5)}/>
${hl('M52 96 Q54 72 74 60', 6)}`,
  },
  {
    id: 'crown',
    svg: `
<path d="M36 148 L26 64 L66 98 L100 40 L134 98 L174 64 L164 148 Z" fill="url(#gC)" ${o()}/>
<rect x="34" y="132" width="132" height="30" rx="6" fill="${B}" ${o()}/>
<circle cx="26" cy="62" r="10" fill="${R}" ${o(5)}/><circle cx="100" cy="36" r="11" fill="${R}" ${o(5)}/><circle cx="174" cy="62" r="10" fill="${R}" ${o(5)}/>
<path d="M92 112 L100 98 L108 112 L100 124 Z" fill="${RS}" ${o(4)}/>
<circle cx="64" cy="147" r="5" fill="${C}"/><circle cx="100" cy="147" r="5" fill="${C}"/><circle cx="136" cy="147" r="5" fill="${C}"/>
${hl('M44 118 L38 80', 5, '#FFFFFF')}`,
  },
  {
    id: 'drip-smile',
    svg: `
${union(
  [
    '<circle cx="100" cy="86" r="58"/>',
    '<rect x="62" y="100" width="20" height="64" rx="10"/>',
    '<rect x="110" y="100" width="18" height="76" rx="9"/>',
    '<rect x="136" y="100" width="16" height="48" rx="8"/>',
  ],
  B,
)}
<ellipse cx="80" cy="78" rx="7" ry="12" fill="${K}"/><ellipse cx="120" cy="78" rx="7" ry="12" fill="${K}"/>
<path d="M68 100 Q100 136 132 100" fill="none" ${o(7)}/>
${hl('M58 70 Q62 46 84 36', 7)}
${hl('M68 124 V140', 5)}`,
  },
  {
    id: 'bat',
    svg: `
<path d="M78 100 C62 78 40 72 16 78 C28 90 30 102 26 116 C40 108 52 110 58 122 C64 112 72 112 80 118 Z" fill="url(#gK)" ${o()}/>
<path d="M122 100 C138 78 160 72 184 78 C172 90 170 102 174 116 C160 108 148 110 142 122 C136 112 128 112 120 118 Z" fill="url(#gK)" ${o()}/>
<path d="M30 86 Q50 88 70 104 M166 86 Q150 88 130 104" fill="none" stroke="#2B8FFF" stroke-width="4" stroke-linecap="round"/>
<path d="M78 84 L74 58 L92 76 Z M122 84 L126 58 L108 76 Z" fill="#1A1A1A" ${o(6)}/>
<circle cx="100" cy="106" r="32" fill="url(#gK)" ${o()}/>
<circle cx="88" cy="100" r="8" fill="${RS}"/><circle cx="112" cy="100" r="8" fill="${RS}"/>
<circle cx="86" cy="98" r="2.5" fill="${C}"/><circle cx="110" cy="98" r="2.5" fill="${C}"/>
<path d="M90 118 L94 128 L98 118 M102 118 L106 128 L110 118" fill="${C}" stroke="${C}" stroke-width="2" stroke-linejoin="round"/>
${hl('M76 96 Q78 84 88 80', 5, '#2B8FFF')}`,
  },
  {
    id: 'mini-ghost',
    svg: `
<path d="M56 160 V100 C56 66 76 48 100 48 C124 48 144 66 144 100 V160 L128 148 L114 162 L100 148 L86 162 L72 148 Z" fill="url(#gC)" ${o(8)}/>
<circle cx="86" cy="100" r="7" fill="${K}"/><circle cx="114" cy="100" r="7" fill="${K}"/>
<ellipse cx="100" cy="122" rx="8" ry="10" fill="${K}"/>`,
  },
  {
    id: 'sparkle',
    svg: `
<path d="M100 24 C106 74 126 94 176 100 C126 106 106 126 100 176 C94 126 74 106 24 100 C74 94 94 74 100 24 Z" fill="${B}" ${o(8)}/>
<path d="M100 60 C103 88 112 97 140 100 C112 103 103 112 100 140 C97 112 88 103 60 100 C88 97 97 88 100 60 Z" fill="${BL}"/>`,
  },
];
