---
name: wall-art-mockup-art-director
description: Mengarahkan dan membuat gambar listing untuk produk wall art digital, yaitu urutan gambar, mockup karya di bingkai atau ruangan, lembar ukuran yang termasuk, dan potongan detail, yang menarik tetapi tidak menyesatkan soal ukuran, bingkai, atau isi produk. Pakai saat pemilik berkata "buat mockup", "gambar listing apa saja?", "thumbnail-nya gimana?", "gambar pertama yang bagus seperti apa?", "tampilkan di ruang tamu", atau setelah paket cetak dan panduan selesai. Menghasilkan daftar gambar berurutan, tiga gambar dasar dari skrip, dan arahan untuk mockup ruangan. Jangan dipakai untuk membuat karya itu sendiri atau menulis teks listing.
---

# wall-art-mockup-art-director

Gambar listing punya dua tugas: membuat orang berhenti menggulir, dan membuat mereka paham persis apa yang dibeli. Skill ini pemilik daftar dan arahan gambar listing.

Sebelum mulai, baca `references/studio-core.md`. Urutan dan aturan gambar: `references/urutan-gambar-listing.md`. Pembuat gambar dasar: `scripts/make_listing_images.py`.

## Kapan digunakan

- Paket cetak sudah ada dan listing akan disiapkan.
- Gambar listing lama kurang jelas atau menyesatkan.
- Menyiapkan gambar untuk set atau bundel.

## Kapan tidak digunakan

- Membuat atau mengedit karya.
- Konten Pinterest (`wall-art-pinterest-content-planner`).

## Input

- Wajib: file karya (salah satu file cetak) dan rencana cetak JSON.
- Opsional: profil ruangan, kartu palet (untuk warna dinding dan bingkai), lembar penawaran, titik fokus.

## Default

- Tujuh gambar per listing, mengikuti `references/urutan-gambar-listing.md`.
- Gambar persegi 2000x2000 pixel, aman dipotong di tepi, sesuai catatan fakta tentang tampilan toko.
- Gambar pertama tanpa teks dan tanpa kolase.
- Tiga gambar dasar dibuat skrip; mockup ruangan dibuat dengan alat gambar atau template milik pemilik.

## Pertanyaan bila info penting belum ada

1. "Ruangan apa yang ingin ditampilkan di mockup?"
2. "Punya template mockup berlisensi, atau mockup ruangan dibuat dengan alat AI?"

## Langkah kerja

1. Baca lembar penawaran dan rencana cetak: apa yang dijual dan ukuran apa yang layak.
2. Susun daftar gambar berurutan beserta tujuan tiap gambar.
3. Buat tiga gambar dasar: `python3 scripts/make_listing_images.py --image <file karya> --out <folder> --name <nama-dasar> --plan <rencana-cetak.json> --focus x,y`. Warna dinding dan bingkai bisa diatur dengan `--wall` dan `--frame` (kode hex dari kartu palet).
4. Lihat ketiga hasilnya dan periksa: karya tidak berubah, teks lembar ukuran terbaca, potongan detail jujur.
5. Untuk mockup ruangan, tulis arahan: ruangan, perabot, ukuran karya terhadap perabot, warna dinding, arah cahaya, sudut pandang. Tetapkan ukuran cetak yang digambarkan dan pastikan skalanya masuk akal (lihat aturan keputusan).
6. Tetapkan cara membuat mockup ruangan: template berlisensi (catat di register hak) atau latar ruangan buatan AI dengan karya asli ditempel sesudahnya.
7. Tulis keterangan singkat tiap gambar (bahasa Inggris) bila ada teks di dalamnya.
8. Simpan di `studio-nangka/proyek/<project_id>/karya/<artwork_id>/gambar-listing/` dan tulis blok serah terima.

## Aturan keputusan

- Karya di dalam mockup harus karya yang sebenarnya, ditempel tanpa diubah. Jangan meminta alat AI menggambar ulang karya di dalam ruangan, karena hasilnya bukan lagi produk yang dijual.
- Skala jujur: ukuran karya di mockup sesuai ukuran cetak yang benar-benar ditawarkan. Bila mockup memperlihatkan ukuran besar, ukuran itu harus berstatus layak di rencana cetak.
- Bila mockup memperlihatkan bingkai, salah satu gambar atau deskripsi harus menyebut "frame not included".
- Minimal satu gambar menyebut jelas bahwa ini unduhan digital.
- Template dan foto ruangan milik orang lain hanya dipakai bila lisensinya mengizinkan untuk listing; catat di register hak. Gambar ruangan dari toko lain tidak dipakai.
- Tidak ada lencana atau klaim palsu ("bestseller", bintang ulasan) di gambar.

## Format hasil

```
GAMBAR LISTING  [listing]
| No | Jenis | Tujuan | Sumber (skrip / template / AI) | File | Status |
Arahan mockup ruangan: ...
Skala yang digambarkan: .. inci (layak menurut rencana cetak: ya)
Yang harus disebut di listing: frame not included; digital download
```

## Pemeriksaan kualitas

- Gambar pertama tanpa teks.
- Ada gambar ukuran dan gambar yang menyebut unduhan digital.
- Tiap file yang disebut benar-benar ada.
- Sisi pendek gambar pertama memenuhi minimum di catatan fakta.

## Penanganan kesalahan

- Pillow tidak tersedia: berikan arahan lengkap untuk dibuat pemilik, katakan gambar belum dibuat.
- Rencana cetak belum ada: gambar ukuran tidak dibuat; jangan menulis ukuran dari perkiraan.
- Karya lebih kecil dari 2000 pixel: skrip memberi tahu bahwa potongan detail diperbesar; pertimbangkan tidak memakai gambar detail.

## Serah terima

`etsy-listing-preflight-reviewer` menerima daftar gambar dan filenya untuk diperiksa bersama teks dan file digital.

## Batas kemampuan alat

Skrip membuat mockup datar sederhana, bukan foto ruangan. Mockup ruangan realistis butuh template atau alat gambar, dan menempel karya asli ke dalamnya butuh penyunting gambar atau skrip tambahan.

## Contoh penggunaan

Listing satuan kutilang: gambar 1 bingkai datar di dinding gading (skrip); 2 mockup kamar bayi di atas meja ganti, digambarkan 16x20; 3 lembar ukuran (skrip); 4 potongan detail (skrip); 5 karya polos; 6 cara cetak tiga langkah; 7 karya bersama anggota set.

## Contoh kegagalan dan perbaikannya

Gagal: mockup menampilkan karya selebar sofa (kira-kira 60 inci) padahal ukuran terbesar yang layak 24x36. Perbaikan: perkecil karya di mockup sampai sesuai 24x36 terhadap sofa, atau ganti ke dinding yang lebih sempit.

## Cara menguji skill ini

Jalankan skrip pada gambar uji 2400x3600 dengan `--plan` dari perencana rasio. Hasil benar: tiga file `<nama>_01-bingkai.jpg`, `<nama>_02-ukuran.jpg`, `<nama>_03-detail.jpg` berukuran 2000x2000; gambar pertama tanpa teks; lembar ukuran hanya memuat ukuran berstatus `ok`.
