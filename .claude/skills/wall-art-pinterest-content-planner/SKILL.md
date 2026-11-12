---
name: wall-art-pinterest-content-planner
description: Membuat rencana konten Pinterest untuk toko wall art digital memakai aset yang haknya jelas, mencakup papan, jenis pin, judul dan deskripsi pin berbahasa Inggris, tautan ke listing, dan jadwal yang muat di kapasitas studio. Pakai saat pemilik berkata "promosi di Pinterest", "bikin pin", "rencana konten", "papan Pinterest apa saja?", "posting apa minggu ini?", "datangkan pengunjung ke toko", atau setelah listing terbit dan gambar listing tersedia. Menghasilkan kalender pin dan teks siap pakai sebagai draf. Jangan dipakai untuk mengumpulkan referensi gaya dari Pinterest atau menjadwalkan posting tanpa izin.
---

# wall-art-pinterest-content-planner

Pinterest dipakai studio dalam dua arah yang harus dipisah tegas: sebagai tempat mencari ilham (milik orang lain, hanya dibaca) dan sebagai tempat memajang karya sendiri. Skill ini hanya mengurus yang kedua. Skill ini pemilik rencana konten Pinterest.

Sebelum mulai, baca `references/studio-core.md` (bagian 6 dan 7). Template: `assets/kalender-pin.md`.

## Kapan digunakan

- Ada listing terbit atau hampir terbit dengan gambar listing.
- Merencanakan konten sebulan.
- Mengisi papan toko yang masih kosong.

## Kapan tidak digunakan

- Membaca gambar Pinterest sebagai referensi (`wall-art-reference-reader`).
- Belum ada karya sendiri yang lolos gerbang kualitas: tidak ada yang layak dipin.

## Input

- Wajib: daftar karya dan gambar listing yang tersedia, beserta status haknya, dan tautan listing bila sudah terbit.
- Opsional: bank keyword, profil pembeli, kalender musiman, kapasitas, statistik Pinterest bila ada.

## Default

- 3 pin per minggu pada kapasitas 5-10 jam; lebih baik sedikit dan teratur.
- Papan menurut ruangan dan tema, memakai bahasa pembeli.
- Pin tegak. Ukuran dan rasio yang disarankan Pinterest berubah; ambil dari sumber resmi Pinterest saat merencanakan, jangan dari ingatan.
- Semua hasil berupa draf. Penjadwalan lewat alat (misalnya Metricool, bila terhubung) hanya dengan izin pemilik.

## Pertanyaan bila info penting belum ada

1. "Akun Pinterest bisnis sudah ada dan terhubung ke toko?"
2. "Berapa pin per minggu yang sanggup Anda siapkan gambarnya?"

## Langkah kerja

1. Daftar aset yang boleh dipakai: karya dan mockup berstatus `cleared` (atau `restricted` terpenuhi) menurut `studio-asset-rights-register`. Template mockup harus mengizinkan pemakaian di media sosial. Referensi `inspiration_only` tidak pernah dipin sebagai konten toko.
2. Susun 4-6 papan: nama, deskripsi satu kalimat, dan karya yang masuk.
3. Tentukan jenis pin dari tiap karya: karya dalam bingkai, mockup ruangan, potongan detail, set berdampingan, cara cetak, ide susunan dinding.
4. Tulis judul dan deskripsi pin berbahasa Inggris memakai bahasa pembeli dari bank keyword; jujur menyebut "printable" atau "digital download".
5. Pasangkan tiap pin dengan tautan listing yang tepat. Listing belum terbit: pin ditandai "menunggu tautan".
6. Susun kalender 4 minggu: tanggal, papan, jenis pin, karya, teks, tautan. Sisipkan momen dari kalender musiman lebih awal dari hari-H.
7. Tetapkan cara ukur sederhana: klik keluar ke toko per pin (dari statistik Pinterest) dicatat bulanan.
8. Serahkan kalender dan teks. Bila diminta menjadwalkan dan alatnya ada: tampilkan dulu apa yang akan dijadwalkan, lalu jalankan sebatas izin.

## Aturan keputusan

- Hanya karya dan gambar milik studio yang dipin sebagai konten toko.
- Tidak ada klaim palsu di pin (diskon yang tidak ada, "bestseller").
- Mockup di pin mengikuti aturan yang sama dengan gambar listing: karya asli, skala jujur.
- Bila Pinterest atau Etsy mewajibkan penandaan konten buatan AI, ikuti; aturan itu dicek dari sumber resmi, bukan diasumsikan.
- Jumlah pin mengikuti kapasitas; bila produksi karya tertinggal, konten dikurangi lebih dulu, bukan produksi.
- Hasil Pinterest dibaca sebagai petunjuk minat visual, tidak sama dengan perilaku pembeli Etsy.

## Format hasil

Kalender pin (template) dan daftar teks:

```
PAPAN: nama | deskripsi | karya
PIN  [tanggal]  papan: ..  jenis: ..  karya: ..
Title: ...
Description: ...
Link: ... / menunggu tautan
Aset: file .. (status hak: ..)
```

## Pemeriksaan kualitas

- Tiap pin memakai aset berstatus hak yang sah dan menyebut filenya.
- Tiap pin punya tautan atau tanda menunggu.
- Jumlah pin per minggu sesuai kapasitas.
- Status "draf, belum dijadwalkan" tertulis kecuali memang dijadwalkan dengan izin.

## Penanganan kesalahan

- Belum ada gambar listing: minta dibuat dulu lewat pengarah mockup; jangan merencanakan pin tanpa aset.
- Akun bisnis belum ada: beri daftar langkah singkat untuk pemilik dan tunda kalender.
- Alat penjadwal tidak terhubung: kalender diserahkan untuk dijadwalkan manual.

## Serah terima

`etsy-store-operations-planner` menerima pekerjaan konten (menyiapkan gambar pin, mengunggah) untuk dimasukkan ke rencana mingguan.

## Batas kemampuan alat

Tidak melihat akun Pinterest atau statistiknya kecuali lewat alat yang terhubung atau data dari pemilik. Tidak tahu aturan dan ukuran Pinterest terbaru tanpa mengeceknya.

## Contoh penggunaan

Koleksi satwa tropis, 2 listing terbit. Papan: "Nursery Wall Art Ideas", "Tropical Nursery Decor", "Printable Wall Art". Kalender 4 minggu berisi 12 pin: 4 bingkai, 3 mockup kamar bayi, 2 detail, 2 set, 1 cara cetak; 5 pin menunggu tautan listing yang belum terbit.

## Contoh kegagalan dan perbaikannya

Gagal: kalender berisi pin ulang gambar kamar bayi milik akun lain "untuk meramaikan papan", dicampur sebagai konten toko. Perbaikan: keluarkan dari kalender toko; konten toko hanya aset sendiri.

## Cara menguji skill ini

Beri 3 karya `cleared` dengan gambar listing, 1 gambar `inspiration_only`, dan 1 tautan listing. Hasil benar: kalender 4 minggu dengan 3 pin per minggu yang hanya memakai tiga karya itu, gambar inspirasi tidak dipakai, pin tanpa tautan ditandai menunggu, dan status draf.
