// Periksa bahwa isi teknis dan teks lama yang dipakai ada PERSIS di halaman baru.
// Sumber kebenaran: situs-pro-kong/lama/inventaris.json (dari halaman /pro lama).
//
//     node situs-pro-kong/alat/cek_teks_lama.mjs [berkas.html]   (bawaan: sumber.html)
//
// Perbandingan: tag HTML tetap dibandingkan, tetapi atributnya diabaikan
// (misalnya <code class="long"> lama = <code class="vbk-panjang"> baru),
// dan spasi beruntun disamakan. Teks, tanda baca, dan apostrof harus sama.
import { readFileSync } from "node:fs";

const berkas = process.argv[2] || "situs-pro-kong/sumber.html";
const html = readFileSync(berkas, "utf8");
const inv = JSON.parse(readFileSync("situs-pro-kong/lama/inventaris.json", "utf8"));

const normal = (s) => s.replace(/<(\/?)([a-z0-9]+)\b[^>]*>/gi, "<$1$2>").replace(/\s+/g, " ").trim();
const halaman = normal(html);
const kamus = Object.fromEntries(inv.kamus.map((k) => [k.kunci, k]));

// Kunci lama yang wajib ada (keputusan D11 sampai D14 dan isi teknis bagian 3).
const WAJIB = [
  "hero.lede", "hero.cta1", "hero.facts",
  "uses.label", "uses.a", "uses.b", "uses.c",
  "how.title", "how.1t", "how.1p", "how.2t", "how.2p", "how.3t", "how.3p", "how.4t", "how.4p",
  "first.title", "first.sub", "first.req", "first.req2", "first.rule", "first.note", "first.res",
  "f.address", "f.local", "f.domain", "f.expires", "f.token",
  "man.label", "man.sub", "man.1", "man.2", "man.3", "man.4", "man.5", "man.6", "man.7",
  "dom.title", "dom.sub", "dom.g0", "dom.g1", "dom.g2", "dom.g3",
  "end.title",
];
// Kunci lama yang sengaja tidak dipakai, dengan alasannya.
const TIDAK_DIPAKAI = {
  "hero.eyebrow": "Kalimat 1 hero sudah 'Kotak masuk uji lewat API.'; label kecil memakai 'Untuk developer' (PRD 8.7)",
  "hero.h1": "D11: judul hero lama tidak dipakai",
  "stage.aria": "Adegan Orbit Surat diganti hero HR1 (D10)",
  "end.p": "D14: Tentang sudah punya ajakan menghubungi",
  "man.title": "Judul gunting 'Semua endpoint' (PRD 11.3); EN memakai 'Every endpoint' dari halaman lama",
  "copy.fail": "Pesan gagal salin mengikuti perangkat: 'Tekan Ctrl+C' (lama) atau 'Tekan lama untuk menyalin' (PRD 10.3), di halaman.js",
  "copy.idle": "Tombol 'Salin' / 'Copy' ada", "copy.done": "Tombol 'Tersalin' / 'Copied' ada",
  "nav.aria": "Label 'Bagian halaman' / 'Page sections' ada di data-label", "lang.aria": "Tombol bahasa punya label sendiri (PRD 8.6)",
  "nav.how": "Menu", "nav.api": "Menu", "nav.domains": "Menu", "how.label": "Label kecil Cara kerja", "dom.label": "Label kecil Domain",
  "hero.cta2": "Tombol 'Buka BanaMail' / 'Open BanaMail' di Tentang",
};

const gagal = [];
for (const k of WAJIB) {
  const e = kamus[k];
  if (!e) { gagal.push(`${k}: tidak ada di inventaris`); continue; }
  for (const b of ["id", "en"]) if (!halaman.includes(normal(e[b]))) gagal.push(`${k} (${b}) tidak ada persis: ${e[b]}`);
}
for (const k of Object.keys(kamus)) if (!WAJIB.includes(k) && !(k in TIDAK_DIPAKAI)) gagal.push(`${k}: belum diputuskan (dipakai atau tidak)`);

// Contoh curl: textContent <pre> lama harus sama persis dengan <code id="vbk-curl-N">.
const urai = (s) => s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
inv.curl.forEach((c, i) => {
  const m = html.match(new RegExp(`<code id="vbk-curl-${i + 1}">([\\s\\S]*?)</code>`));
  if (!m) gagal.push(`curl ${i + 1}: blok tidak ada`);
  else if (urai(m[1]).replace(/\r\n/g, "\n") !== c.teks.replace(/\r\n/g, "\n")) gagal.push(`curl ${i + 1}: teks berbeda`);
});
for (const e of inv.endpoint) if (!urai(html).includes(e.jalur)) gagal.push(`endpoint ${e.metode} ${e.jalur} tidak ada`);
for (const d of inv.domain) if (!html.includes(d.domain)) gagal.push(`domain ${d.domain} tidak ada`);
for (const f of inv.field) if (!html.includes(`<code>${f.field}</code>`)) gagal.push(`field ${f.field} tidak ada`);
for (const t of ["admin@venbeemail.com", "NongBana"]) if (!html.includes(t)) gagal.push(`${t} tidak ada`);
const surel = [...new Set(html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g) || [])].filter((s) => !/^qa-signup\./.test(s));
if (surel.some((s) => s !== "admin@venbeemail.com")) gagal.push(`ada alamat email selain admin@venbeemail.com: ${surel.join(", ")}`);
if (/api\/replies/.test(html)) gagal.push("endpoint yang belum aktif (/api/replies) tampil");

if (gagal.length) { console.error(`GAGAL (${gagal.length}):\n- ` + gagal.join("\n- ")); process.exit(1); }
console.log(`${berkas}: ${WAJIB.length} teks lama x 2 bahasa, ${inv.curl.length} curl, ${inv.endpoint.length} endpoint, ${inv.domain.length} domain, ${inv.field.length} field: semua persis. ${Object.keys(TIDAK_DIPAKAI).length} kunci lama sengaja tidak dipakai (alasan tercatat).`);
