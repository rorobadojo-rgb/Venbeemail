---
name: wall-art-color-export-manager
description: Menentukan ruang warna, format, dan pengaturan ekspor file cetak wall art, lalu mengekspor satu file per rasio dari gambar master memakai skrip. Pakai saat pemilik berkata "ekspor filenya", "simpan sebagai apa, JPG atau PDF?", "sRGB atau CMYK?", "300 DPI itu gimana?", "filenya kegedean", "warnanya berubah setelah disimpan", atau setelah rencana rasio selesai. Menghasilkan file JPEG sRGB bertanda DPI di bawah batas ukuran, beserta laporan ekspor. Jangan dipakai untuk menghitung crop atau menyusun paket unduhan.
---

# wall-art-color-export-manager

Mengubah gambar master menjadi file yang aman dibuka dan dicetak pembeli di mana saja. Skill ini pemilik pengaturan warna dan ekspor.

Sebelum mulai, baca `references/studio-core.md`. Alasan tiap pengaturan: `references/pengaturan-ekspor.md`. Pengekspor: `scripts/export_print_files.py`.

## Kapan digunakan

- Rencana rasio (JSON) sudah ada dan file akan dibuat.
- File yang ada terlalu besar, berformat tidak cocok, atau warnanya bergeser.

## Kapan tidak digunakan

- Rencana rasio belum ada (`wall-art-ratio-resolution-planner` dulu).
- Mengemas dan memeriksa paket.

## Input

- Wajib: file gambar master dan rencana JSON dari perencana rasio.
- Opsional: nama dasar file, batas ukuran file dari catatan fakta Etsy, permintaan format tambahan.

## Default

- Format JPEG, ruang warna sRGB, tag 300 DPI, kualitas 95 dan turun bertahap sampai paling rendah 82 bila melewati batas ukuran.
- Batas ukuran per file 20 MB (dari `studio-nangka/fakta/etsy-facts.md`; periksa tanggalnya).
- Nama file: `<nama-dasar>_<rasio>_<ukuran terbesar>.jpg`, huruf kecil tanpa spasi.
- Tidak ada pembesaran saat ekspor.

## Pertanyaan bila info penting belum ada

"Nama dasar file apa yang dipakai?" Bila tidak dijawab, pakai `artwork_id` tanpa awalan `ART-`.

## Langkah kerja

1. Pastikan master adalah file ukuran penuh yang lolos G3, bukan pratinjau.
2. Pastikan rencana JSON dibuat untuk file itu (ukuran pixel sama).
3. Jalankan: `python3 scripts/export_print_files.py --image <master> --plan <rencana.json> --out <folder ekspor> --name <nama-dasar> --max-mb <batas>`.
4. Baca keluaran tiap file: ukuran pixel, MB, kualitas yang dipakai, peringatan.
5. Tangani peringatan dengan aturan keputusan.
6. Bandingkan warna: buka satu file hasil dan master berdampingan. Bila tersedia sistem file, ukur warna dominan keduanya; pergeseran yang terlihat dicatat.
7. Simpan laporan ekspor (dibuat skrip) di folder ekspor dan tulis blok serah terima yang memuat daftar file dengan `verified: true` hanya untuk file yang ada.

## Aturan keputusan

- sRGB untuk semua file pembeli. CMYK tidak dipakai untuk unduhan umum, karena printer rumahan dan layanan cetak konsumen mengharapkan sRGB dan mengonversi sendiri.
- Kualitas diturunkan skrip sampai 82 untuk memenuhi batas ukuran. Bila masih melewati batas, jangan menurunkan lagi: kurangi ukuran yang diklaim untuk rasio itu atau bahas dengan pemilik.
- Gambar bertembus pandang diratakan di atas putih dan diberi peringatan; periksa hasilnya.
- Peringatan "butuh pembesaran" berarti rencana meminta lebih dari pixel yang ada: kembali ke perencana rasio, jangan menaikkan `--allow-upscale` tanpa keputusan pemilik.
- PDF hanya dibuat bila isi produk memintanya; satu PDF per rasio, dan tetap dihitung terhadap batas jumlah file.
- Tag DPI adalah keterangan di dalam file. Yang menentukan ketajaman tetap jumlah pixel.

## Format hasil

```
EKSPOR  ART-...  v..   master: ... (pixel)
| File | Rasio | Untuk ukuran | Pixel | MB | Kualitas | Peringatan |
Ruang warna: sRGB   Tag DPI: 300   Batas: 20 MB (catatan fakta tanggal ...)
Cek warna terhadap master: sama / bergeser pada ...
Folder: ...
```

## Pemeriksaan kualitas

- Jumlah file sama dengan jumlah rasio dalam rencana.
- Tidak ada file di atas batas ukuran.
- Semua peringatan skrip tercantum dan ditangani.
- Cek warna dilakukan atau ditulis "belum dilakukan".

## Penanganan kesalahan

- Pillow tidak ada atau tidak ada sistem file: berikan pengaturan ekspor sebagai daftar langkah manual untuk alat pemilik, dan katakan file belum dibuat.
- Ukuran master tidak cocok dengan rencana: buat ulang rencana, jangan memaksa.
- Skrip keluar dengan kode gagal: baca file mana yang melewati batas; perbaiki rencana untuk rasio itu.

## Serah terima

`wall-art-download-package-builder` menerima folder ekspor untuk disusun dan diperiksa sebagai paket unduhan.

## Batas kemampuan alat

Tidak bisa meniru hasil cetak di kertas (soft proof). Warna di layar pembeli dan printer mereka di luar kendali studio. Skrip mengonversi profil warna bawaan ke sRGB bila ada; gambar tanpa profil dianggap sudah sRGB.

## Contoh penggunaan

Master 7200x10800 dan rencana lima rasio. Hasil: lima JPEG sRGB, terbesar 7200x10800 berukuran 7,7 MB pada kualitas 95, tanpa peringatan; cek warna sama.

## Contoh kegagalan dan perbaikannya

Gagal: file disimpan PNG 60 MB per rasio "agar tanpa kompresi". Perbaikan: PNG melewati batas ukuran dan tidak memberi manfaat terlihat pada cetakan; ekspor ulang sebagai JPEG kualitas 95.

## Cara menguji skill ini

Buat gambar uji 2400x3600, jalankan perencana rasio dengan `--json`, lalu skrip ekspor dengan `--name uji-01`. Hasil benar: lima file bernama `uji-01_<rasio>_<ukuran>.jpg`, semuanya di bawah batas, laporan `uji-01_laporan-ekspor.json` ada, dan menjalankan dengan nama berspasi ditolak.
