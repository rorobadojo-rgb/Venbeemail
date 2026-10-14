#!/usr/bin/env node
/*
 * Sisipkan hero VenbeeMail Pro (Fase 1) ke index.html /pro yang lama.
 *
 *   node sisipkan.js [--cek] <index.html lama> <situs-pro/index.html> [awalan-url]
 *
 * Mengambil tiga blok bertanda dari situs-pro/index.html:
 *   vbpro-kepala  -> disisipkan tepat sebelum </head>
 *   vbpro-hero    -> disisipkan tepat setelah <body ...>
 *   vbpro-skrip   -> disisipkan tepat sebelum </body>
 * Alamat "aset/vbpro/" diganti menjadi awalan-url + "aset/vbpro/" (bawaan "/pro/").
 * Kalau blok yang sama sudah ada (pemasangan ulang), blok lama diganti.
 * Selain itu hanya nama "BanaMail Pro" di <title>, og:title, dan twitter:title
 * yang diganti menjadi "VenbeeMail Pro". Isi <body> lama tidak diubah.
 *
 * --cek: hanya memeriksa dan melapor, tidak menulis apa pun.
 * Ditulis untuk Node lama juga (tanpa sintaks baru).
 */
"use strict";

var fs = require("fs");

var argumen = process.argv.slice(2);
var cekSaja = argumen[0] === "--cek";
if (cekSaja) argumen.shift();
var berkasLama = argumen[0];
var berkasSumber = argumen[1];
var awalan = argumen[2] || "/pro/";

function gagal(pesan) {
  console.error("BERHENTI: " + pesan + " Tidak ada yang diubah.");
  process.exit(1);
}

if (!berkasLama || !berkasSumber) gagal("Pakai: node sisipkan.js [--cek] <index.html lama> <situs-pro/index.html> [awalan-url].");
if (!/^\/[^\s"'<>]*\/$/.test(awalan)) gagal("Awalan url harus diawali dan diakhiri garis miring, misalnya /pro/.");

var lama = fs.readFileSync(berkasLama, "utf8");
var sumber = fs.readFileSync(berkasSumber, "utf8");

var NAMA = ["kepala", "hero", "skrip"];

function polaBlok(nama) {
  return new RegExp("[ \\t]*<!-- vbpro-" + nama + ":mulai -->[\\s\\S]*?<!-- vbpro-" + nama + ":selesai -->[ \\t]*\\r?\\n?", "g");
}

function ambilBlok(teks, nama) {
  var cocok = teks.match(polaBlok(nama));
  if (!cocok || cocok.length !== 1) gagal("Blok vbpro-" + nama + " harus ada tepat satu di " + berkasSumber + ".");
  return cocok[0].replace(/^[ \t]+/, "").replace(/\s+$/, "") + "\n";
}

var blok = {};
NAMA.forEach(function (nama) {
  blok[nama] = ambilBlok(sumber, nama).split("aset/vbpro/").join(awalan + "aset/vbpro/");
});

// Buang blok lama hasil pemasangan sebelumnya.
var bersih = lama;
var sudahPernah = false;
NAMA.forEach(function (nama) {
  var p = polaBlok(nama);
  if (p.test(bersih)) sudahPernah = true;
  bersih = bersih.replace(polaBlok(nama), "");
});

var hasil = bersih;

var tutupKepala = hasil.search(/<\/head\s*>/i);
if (tutupKepala < 0) gagal("Tag </head> tidak ditemukan di " + berkasLama + ".");
hasil = hasil.slice(0, tutupKepala) + blok.kepala + hasil.slice(tutupKepala);

var bukaBody = /<body\b[^>]*>/i.exec(hasil);
if (!bukaBody) gagal("Tag <body> tidak ditemukan di " + berkasLama + ".");
var setelahBody = bukaBody.index + bukaBody[0].length;
hasil = hasil.slice(0, setelahBody) + blok.hero + hasil.slice(setelahBody);

var tutupBody = hasil.toLowerCase().lastIndexOf("</body");
if (tutupBody < 0) hasil = hasil + "\n" + blok.skrip;
else hasil = hasil.slice(0, tutupBody) + blok.skrip + hasil.slice(tutupBody);

// Nama di judul tab dan kartu bagikan.
var gantiNama = 0;
hasil = hasil.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, function (t) {
  return t.replace(/BanaMail Pro/g, function () { gantiNama++; return "VenbeeMail Pro"; });
});
hasil = hasil.replace(/<meta\b[^>]*(?:property|name)\s*=\s*["'](?:og:title|twitter:title)["'][^>]*>/gi, function (t) {
  return t.replace(/BanaMail Pro/g, function () { gantiNama++; return "VenbeeMail Pro"; });
});

// Pemeriksaan: isi body lama harus utuh di hasil.
function isiBody(teks) {
  var buka = /<body\b[^>]*>/i.exec(teks);
  var tutup = teks.toLowerCase().lastIndexOf("</body");
  if (!buka) return "";
  return teks.slice(buka.index + buka[0].length, tutup < 0 ? teks.length : tutup);
}
var bodyLama = isiBody(bersih);
var bodyBaru = isiBody(hasil);
var tanpaBlok = bodyBaru;
NAMA.forEach(function (nama) { tanpaBlok = tanpaBlok.replace(polaBlok(nama), ""); });
if (tanpaBlok !== bodyLama) gagal("Pemeriksaan gagal: isi body lama tidak utuh.");
NAMA.forEach(function (nama) {
  var n = (hasil.match(polaBlok(nama)) || []).length;
  if (n !== 1) gagal("Pemeriksaan gagal: blok vbpro-" + nama + " muncul " + n + " kali.");
});

console.log("Halaman lama   : " + berkasLama + " (" + lama.length + " karakter)");
console.log("Pemasangan     : " + (sudahPernah ? "ulang (blok lama diganti)" : "pertama"));
console.log("Alamat aset    : " + awalan + "aset/vbpro/");
console.log("Nama diganti   : " + gantiNama + " tempat (judul/meta)");
console.log("Isi body lama  : utuh");

if (cekSaja) {
  console.log("Mode cek: tidak ada yang ditulis.");
  process.exit(0);
}

// Tulis di berkas yang sama supaya pemilik dan izin berkas tetap.
fs.writeFileSync(berkasLama, hasil, "utf8");
console.log("Ditulis        : " + berkasLama + " (" + hasil.length + " karakter)");
