#!/usr/bin/env node
/*
 * Siapkan halaman VenbeeMail Pro gaya Kong untuk dipasang (PRD 18.3).
 *
 *   node siapkan.js [--cek] --mode uji|utama --awalan /pro/kong/|/pro/ \
 *     --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html \
 *     [--lama <index.html yang sedang dipakai di server>] [--keluar <berkas hasil>]
 *   node siapkan.js --bersihkan <masuk> <keluar>   # buang blok vbpro-* dari halaman lama
 *
 * Diperiksa (berhenti tanpa menulis apa pun kalau ada yang gagal):
 *   - penanda <meta name="vbkong-halaman">, tanpa "[ISI", "[SALIN DARI HALAMAN LAMA", "{{"
 *   - tujuh endpoint, empat domain, lima field, admin@venbeemail.com, NongBana ada di sumber
 *   - setiap blok kode berisi curl di referensi ada persis sama di salah satu blok kode sumber
 *     (tag dibuang, entitas diurai, akhir baris disamakan)
 *   - kalau halaman live bukan halaman Kong, blok curl-nya harus sama dengan referensi
 * Lalu: alamat "aset/vbkong/" diberi awalan, data-akar diisi, robots noindex untuk mode uji.
 * --cek: hanya memeriksa dan melapor. Ditulis untuk Node lama juga (tanpa sintaks baru).
 */
"use strict";

var fs = require("fs");

function gagal(pesan) {
  console.error("BERHENTI: " + pesan + " Tidak ada yang ditulis.");
  process.exit(1);
}

var arg = process.argv.slice(2);

function buangBlokVbpro(teks) {
  return teks.replace(/[ \t]*<!-- vbpro-([a-z]+):mulai -->[\s\S]*?<!-- vbpro-\1:selesai -->[ \t]*\r?\n?/g, "");
}

if (arg[0] === "--bersihkan") {
  if (!arg[1] || !arg[2]) gagal("Pakai: node siapkan.js --bersihkan <masuk> <keluar>.");
  var masuk = fs.readFileSync(arg[1], "utf8"), bersih = buangBlokVbpro(masuk);
  fs.writeFileSync(arg[2], bersih);
  console.log("Blok vbpro-* dibuang: " + (masuk.length - bersih.length) + " byte. Hasil: " + arg[2]);
  process.exit(0);
}

var opsi = { cek: false };
for (var i = 0; i < arg.length; i++) {
  if (arg[i] === "--cek") opsi.cek = true;
  else if (/^--(mode|awalan|sumber|referensi|lama|keluar)$/.test(arg[i])) { opsi[arg[i].slice(2)] = arg[i + 1]; i++; }
  else gagal("Argumen tidak dikenal: " + arg[i] + ".");
}
if (opsi.mode !== "uji" && opsi.mode !== "utama") gagal("--mode harus uji atau utama.");
if (!opsi.awalan || !/^\/[^\s"'<>]*\/$/.test(opsi.awalan)) gagal("--awalan harus diawali dan diakhiri garis miring, misalnya /pro/kong/.");
if (!opsi.sumber || !opsi.referensi) gagal("--sumber dan --referensi wajib.");
if (!opsi.cek && !opsi.keluar) gagal("--keluar wajib kecuali --cek.");

var sumber = fs.readFileSync(opsi.sumber, "utf8");
var referensi = buangBlokVbpro(fs.readFileSync(opsi.referensi, "utf8"));

/* ---------- alat teks ---------- */
var ENTITAS = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function urai(t) {
  return t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, function (m, k) {
    if (k.charAt(0) === "#") return String.fromCharCode(k.charAt(1).toLowerCase() === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10));
    return Object.prototype.hasOwnProperty.call(ENTITAS, k.toLowerCase()) ? ENTITAS[k.toLowerCase()] : m;
  });
}
function teksPolos(html) { return urai(html.replace(/<[^>]*>/g, "")).replace(/\r\n/g, "\n"); }
function blokKode(html) {
  // isi <pre> (termasuk <code> di dalamnya) dan <code> lepas
  var hasil = [], m, pola = /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi;
  while ((m = pola.exec(html))) hasil.push(teksPolos(m[1]));
  var tanpaPre = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, ""), pola2 = /<code\b[^>]*>([\s\S]*?)<\/code>/gi;
  while ((m = pola2.exec(tanpaPre))) hasil.push(teksPolos(m[1]));
  return hasil;
}
function blokCurl(html) { return blokKode(html).filter(function (b) { return /\bcurl\b/.test(b); }); }

/* ---------- pemeriksaan sumber ---------- */
if (!/<meta name="vbkong-halaman" content="[^"]+">/.test(sumber)) gagal("Sumber tidak punya penanda <meta name=\"vbkong-halaman\">.");
["[ISI", "[SALIN DARI HALAMAN LAMA", "{{"].forEach(function (t) {
  if (sumber.indexOf(t) >= 0) gagal("Sumber masih berisi \"" + t + "\" (tempat isian). Jalankan rakit.py tanpa --pratinjau.");
});
var polos = teksPolos(sumber);
var ENDPOINT = [["POST", "/api/addresses"], ["GET", "/api/mailbox"], ["GET", "/api/messages/:id"], ["PATCH", "/api/messages/:id"],
  ["GET", "/api/messages/:id/attachments/:n"], ["DELETE", "/api/addresses/me"], ["GET", "/api/health"]];
var papan = (sumber.match(/<ol class="vbk-papan">([\s\S]*?)<\/ol>/) || [])[1];
if (!papan) gagal("Papan endpoint (<ol class=\"vbk-papan\">) tidak ditemukan di sumber.");
var barisPapan = [];
papan.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/g, function (m, isi) {
  var metode = teksPolos((isi.match(/class="[^"]*vbk-metode[^"]*">([\s\S]*?)<\/span>/) || [])[1] || "").trim();
  var jalur = teksPolos((isi.match(/<code class="[^"]*vbk-jalur[^"]*">([\s\S]*?)<\/code>/) || [])[1] || "").trim();
  barisPapan.push(metode + " " + jalur);
  return m;
});
ENDPOINT.forEach(function (e) {
  if (barisPapan.indexOf(e[0] + " " + e[1]) < 0) gagal("Endpoint " + e[0] + " " + e[1] + " tidak ada di papan sumber.");
});
if (barisPapan.length !== ENDPOINT.length) gagal("Papan sumber berisi " + barisPapan.length + " baris, harus " + ENDPOINT.length + ".");
var DOMAIN = ["venbeemail.com", "kotak.venbeemail.com", "surat.venbeemail.com", "pos.venbeemail.com"];
DOMAIN.forEach(function (d) {
  if (sumber.indexOf('data-domain="' + d + '"') < 0) gagal("Domain " + d + " tidak ada di sumber.");
});
var FIELD = ["address", "local", "domain", "expiresAt", "token"];
FIELD.forEach(function (f) {
  if (!new RegExp("<code>" + f + "</code>").test(sumber)) gagal("Field " + f + " tidak ada di sumber.");
});
["admin@venbeemail.com", "NongBana"].forEach(function (t) { if (polos.indexOf(t) < 0) gagal(t + " tidak ada di sumber."); });

/* ---------- blok curl: referensi harus ada persis di sumber ---------- */
var curlRef = blokCurl(referensi), curlSumber = blokCurl(sumber);
if (!curlRef.length) gagal("Referensi tidak berisi blok curl sama sekali.");
var cocok = 0;
curlRef.forEach(function (b, n) {
  if (curlSumber.indexOf(b) < 0) gagal("Blok curl ke-" + (n + 1) + " dari referensi tidak ada persis di sumber:\n" + b + "\n");
  cocok++;
});

/* ---------- halaman live ---------- */
var catatanLive = "tidak diperiksa (tanpa --lama)";
if (opsi.lama) {
  var live = fs.readFileSync(opsi.lama, "utf8");
  if (/<meta name="vbkong-halaman"/.test(live)) catatanLive = "sudah halaman Kong (pemasangan ulang)";
  else {
    var curlLive = blokCurl(buangBlokVbpro(live));
    var sama = curlLive.length === curlRef.length && curlLive.every(function (b, n) { return b === curlRef[n]; });
    if (!sama) gagal("Halaman live berubah sejak diambil. Ambil ulang isi lama (18.2).");
    catatanLive = "halaman lama, blok curl sama dengan referensi";
  }
}

/* ---------- ubah untuk pasang ---------- */
var hasil = sumber;
var awalan = opsi.awalan;
// src, href, srcset, poster, dan url(...) yang menunjuk aset/vbkong/ (belum berawalan)
hasil = hasil.replace(/(\s(?:src|href|poster)=")aset\/vbkong\//g, "$1" + awalan + "aset/vbkong/");
hasil = hasil.replace(/(\ssrcset=")([^"]*)"/g, function (m, kepala, isi) {
  return kepala + isi.replace(/(^|,\s*)aset\/vbkong\//g, "$1" + awalan + "aset/vbkong/") + '"';
});
hasil = hasil.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g, function (m, a, isi, z) {
  return a + isi.replace(/url\((["']?)aset\/vbkong\//g, "url($1" + awalan + "aset/vbkong/") + z;
});
hasil = hasil.replace(/<html([^>]*?)\sdata-akar="[^"]*"/, '<html$1 data-akar="' + awalan + '"');
if (!/data-akar="/.test(hasil.slice(0, 400))) gagal("Atribut data-akar tidak ditemukan di <html>.");
hasil = hasil.replace(/[ \t]*<meta name="robots"[^>]*>\r?\n?/g, "");
if (opsi.mode === "uji") hasil = hasil.replace(/(<meta name="viewport"[^>]*>\r?\n?)/, '$1<meta name="robots" content="noindex, nofollow">\n');
var sisa = hasil.match(/(?:src|href|poster|srcset)="aset\/vbkong\//g);
if (sisa) gagal("Masih ada " + sisa.length + " alamat aset tanpa awalan.");

console.log("Mode: " + opsi.mode + ", awalan: " + awalan);
console.log("Endpoint: " + barisPapan.length + ", domain: " + DOMAIN.length + ", field: " + FIELD.length + ", blok curl cocok: " + cocok + "/" + curlRef.length);
console.log("Halaman live: " + catatanLive);
if (opsi.cek) { console.log("CEK LOLOS (tidak ada yang ditulis)."); process.exit(0); }
fs.writeFileSync(opsi.keluar, hasil);
console.log("Ditulis: " + opsi.keluar + " (" + Buffer.byteLength(hasil) + " byte)");
