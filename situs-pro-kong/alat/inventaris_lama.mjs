// Inventaris isi /pro lama (PRD 18.2), dibaca langsung dari situs-pro-kong/lama/index.html.
// Semua teks diambil dari berkas, tidak diketik ulang. Jalankan dari akar repo:
//
//     node situs-pro-kong/alat/inventaris_lama.mjs
//
// Hasil: situs-pro-kong/lama/inventaris.json
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";

const MASUK = "situs-pro-kong/lama/index.html";
const KELUAR = "situs-pro-kong/lama/inventaris.json";
const html = readFileSync(MASUK, "utf8");

const ENTITAS = { "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'" };
const urai = (s) => s.replace(/&(lt|gt|amp|quot|#39);/g, (m) => ENTITAS[m]);
const teks = (s) => urai(s.replace(/<[^>]+>/g, ""));
const satu = (re, s = html) => { const m = s.match(re); if (!m) throw new Error("tidak ketemu: " + re); return m[1]; };

// Kamus dua bahasa T dari skrip halaman lama, dievaluasi apa adanya.
const blokT = satu(/var T=(\{[\s\S]*?\n  \});/);
const T = vm.runInNewContext("(" + blokT + ")");

// Tempat tiap kunci di halaman baru (PRD bagian 8 sampai 15).
const TEMPAT = {
  "nav.aria": "Menu: label navigasi (PRD 8.6 'Bagian halaman')",
  "lang.aria": "Menu: label kelompok tombol bahasa",
  "nav.how": "Menu 1", "nav.api": "Menu 2", "nav.domains": "Menu 4",
  "hero.eyebrow": "Hero: label kecil (lama, dipertahankan bila LO setuju; PRD 8.7 memakai 'Untuk developer')",
  "hero.h1": "Hero: tidak dipakai sebagai <h1> (PRD 8.7: <h1> 'VenbeeMail Pro'); usul: kalimat 1 hero",
  "hero.lede": "Hero: usul kalimat 2 (isi sama dengan PRD 8.7, ditambah teks/HTML)",
  "hero.cta1": "Hero: tombol 1", "hero.cta2": "Tentang: tombol 3 / kaki halaman",
  "hero.facts": "Hero atau Penutup: fakta '7 endpoint aktif · 4 domain email · masa berlaku' (angka nyata, boleh dipakai)",
  "stage.aria": "Tidak dipakai: adegan Orbit Surat diganti hero HR1 (D10); alt baru PRD 8.4/8.7",
  "uses.label": "Usul: pita kegunaan di bawah hero atau di Tentang ('Untuk siapa')",
  "uses.a": "Usul: pita kegunaan", "uses.b": "Usul: pita kegunaan", "uses.c": "Usul: pita kegunaan",
  "how.label": "Cara kerja: label kecil", "how.title": "Cara kerja: pengantar (menggantikan 'Empat langkah, sama seperti perjalanan surat tadi.' kalau LO setuju)",
  "how.1t": "Cara kerja: judul kartu 1", "how.1p": "Cara kerja: teks kartu 1 (persis)",
  "how.2t": "Cara kerja: judul kartu 2", "how.2p": "Cara kerja: teks kartu 2 (persis)",
  "how.3t": "Cara kerja: judul kartu 3", "how.3p": "Cara kerja: teks kartu 3 (persis)",
  "how.4t": "Cara kerja: judul kartu 4", "how.4p": "Cara kerja: teks kartu 4 (persis)",
  "first.title": "API: pengantar", "first.sub": "API: catatan field opsional dan token (persis)",
  "first.req": "API: tab Contoh 1 (label)", "first.req2": "API: tab Contoh 2 (label)",
  "first.rule": "API: aturan awalan (persis) + dasar pemeriksa AW1",
  "first.note": "API: catatan di bawah Contoh 2 (persis)", "first.res": "API: judul resi jawaban",
  "f.address": "API: resi, keterangan address", "f.local": "API: resi, keterangan local", "f.domain": "API: resi, keterangan domain",
  "f.expires": "API: resi, keterangan expiresAt (bentuk nilai: milidetik epoch)", "f.token": "API: resi, keterangan token",
  "man.label": "Semua endpoint: label kecil", "man.title": "Semua endpoint: judul gunting",
  "man.sub": "Semua endpoint: catatan header Authorization (persis)",
  "man.1": "Papan baris 1, kolom guna", "man.2": "Papan baris 2, kolom guna", "man.3": "Papan baris 3, kolom guna",
  "man.4": "Papan baris 4, kolom guna (arti PATCH)", "man.5": "Papan baris 5, kolom guna", "man.6": "Papan baris 6, kolom guna", "man.7": "Papan baris 7, kolom guna",
  "dom.label": "Domain: label kecil", "dom.title": "Domain: judul gunting atau subjudul",
  "dom.sub": "Domain: pengantar (PRD 11.4: dipakai karena halaman lama punya)",
  "dom.g0": "Perangko 1: keterangan", "dom.g1": "Perangko 2: keterangan", "dom.g2": "Perangko 3: keterangan", "dom.g3": "Perangko 4: keterangan",
  "end.title": "Penutup: usul kalimat di bawah manifesto", "end.p": "Penutup atau Tentang: ajakan menghubungi",
  "copy.idle": "Tombol Salin", "copy.done": "Tombol Salin setelah berhasil",
  "copy.fail": "Gagal salin: lama 'Tekan Ctrl+C'; PRD 10.3 'Tekan lama untuk menyalin' (HP). Usul: tampilkan sesuai perangkat",
};

const kunciId = Object.keys(T.id), kunciEn = Object.keys(T.en);
const kamus = kunciId.map((k) => ({ kunci: k, id: T.id[k], en: T.en[k] ?? null, tempat_baru: TEMPAT[k] ?? "BELUM DIPETAKAN" }));

// Contoh curl: teks yang disalin tombol Salin = textContent <pre>.
const curl = ["curl", "curl2"].map((id) => {
  const isi = teks(satu(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`)));
  return { id, teks: isi, sha256: createHash("sha256").update(isi).digest("hex") };
});

// Endpoint dari daftar manifest.
const manifest = satu(/<ul class="manifest">([\s\S]*?)<\/ul>/);
const endpoint = [...manifest.matchAll(/<li><span class="m m-(\w+)">(\w+)<\/span><span class="path">([\s\S]*?)<\/span><p data-i18n(?:-html)?="([\w.]+)">/g)]
  .map(([, , metode, jalur, kunci]) => ({ metode, jalur: teks(jalur), guna_id: T.id[kunci], guna_en: T.en[kunci], kunci }));

const domain = [...html.matchAll(/<li class="dtag"><code>([^<]+)<\/code><small data-i18n="([\w.]+)">/g)]
  .map(([, d, k]) => ({ domain: d, keterangan_id: T.id[k], keterangan_en: T.en[k] }));

const field = [...html.matchAll(/<div><dt>(\w+)<\/dt><dd data-i18n="([\w.]+)">/g)]
  .map(([, f, k]) => ({ field: f, keterangan_id: T.id[k], keterangan_en: T.en[k] }));

const meta = {
  title: satu(/<title>([^<]*)<\/title>/),
  description: satu(/<meta name="description" content="([^"]*)"/),
  og: Object.fromEntries([...html.matchAll(/<meta property="(og:[\w:]+)" content="([^"]*)"/g)].map((m) => [m[1], m[2]])),
  theme_color: satu(/<meta name="theme-color" content="([^"]*)"/),
  favicon: satu(/<link rel="icon"[^>]*href="([^"]*)"/),
  font_luar: satu(/<link rel="stylesheet" href="([^"]*)"/),
  html_lang: satu(/<html lang="(\w+)"/),
};

const hasil = {
  sumber: MASUK,
  ukuran_byte: Buffer.byteLength(html),
  sha256: createHash("sha256").update(html).digest("hex"),
  catatan: "Diambil LO dari /www/wwwroot/banamail-pro/index.html lewat File Manager aaPanel, 10 Oktober 2026. Ukuran sama dengan content-length di server (40830). Tidak ada blok vbpro-*.",
  meta,
  id_bagian: [...html.matchAll(/\sid="([\w-]+)"/g)].map((m) => m[1]),
  tautan: [...new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))],
  gambar: [...new Set([...html.matchAll(/(\d\d-[\w-]+\.webp|ikon\.png)/g)].map((m) => "aset/" + m[1]))],
  curl,
  endpoint,
  domain,
  field,
  kamus,
  kunci_tanpa_en: kunciId.filter((k) => !(k in T.en)),
  kunci_hanya_en: kunciEn.filter((k) => !(k in T.id)),
  skrip: [
    { nama: "dua bahasa + salin", fungsi: ["Ganti bahasa ID/EN lewat data-i18n, data-i18n-html, data-i18n-aria", "Simpan pilihan di localStorage 'bm-lang'", "Salin #curl, #curl2, #mail dengan navigator.clipboard, cadangan: pilih teks + 'Tekan Ctrl+C'"],
      tempat_baru: "halaman.js: bahasa (juga membaca kunci lama 'bm-lang' supaya pilihan pengunjung lama terbawa), salin + cap KT4" },
    { nama: "adegan Orbit Surat", fungsi: ["Kera, amplop, pesawat mengorbit maskot di dua cincin (canvas jejak)", "Tetesan lelehan dari tulisan 03-tulisan", "Paralaks kursor, berhenti saat tidak terlihat atau reduced-motion"],
      tempat_baru: "Diganti hero HR1 dan film (D10). Berkas aset lama tetap di server" },
  ],
  tanpa_analitik: !/gtag|analytics|plausible|umami|matomo/i.test(html),
};

const belum = kamus.filter((k) => k.tempat_baru === "BELUM DIPETAKAN");
if (belum.length) { console.error("Kunci belum dipetakan:", belum.map((k) => k.kunci).join(", ")); process.exit(1); }
writeFileSync(KELUAR, JSON.stringify(hasil, null, 2) + "\n");
console.log(`${KELUAR}: ${kamus.length} kunci, ${endpoint.length} endpoint, ${domain.length} domain, ${field.length} field, ${curl.length} curl`);
