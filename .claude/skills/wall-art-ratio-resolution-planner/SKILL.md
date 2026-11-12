---
name: wall-art-ratio-resolution-planner
description: Merencanakan pemotongan (crop) gambar wall art ke tiap rasio cetak dan menghitung apakah pixelnya cukup untuk tiap ukuran cetak pada target PPI. Pakai saat pemilik bertanya "bisa dicetak sebesar apa?", "cukup tidak untuk 24x36?", "rasio apa saja yang harus dibuat?", "kepotong tidak kalau 8x10?", "perlu di-upscale?", "ukuran file berapa pixel?", atau setelah gambar master lolos gerbang kualitas dan sebelum file diekspor. Menghasilkan tabel rasio, kotak crop, PPI per ukuran, dan rencana ekspor dari skrip hitung. Jangan dipakai untuk mengekspor file atau mengatur warna.
---

# wall-art-ratio-resolution-planner

Satu gambar master dijual untuk banyak ukuran bingkai. Skill ini menjawab dua hal sekaligus dengan hitungan, bukan perkiraan: bagian mana yang terpotong di tiap rasio, dan ukuran cetak terbesar yang jujur untuk diklaim. Skill ini pemilik rencana rasio, crop, dan ukuran cetak.

Sebelum mulai, baca `references/studio-core.md`. Penjelasan rasio, ukuran, dan PPI: `references/ukuran-cetak.md`. Penghitung: `scripts/print_math.py`.

## Kapan digunakan

- Gambar master lolos G3 dan akan diproduksi.
- Pemilik ingin tahu ukuran cetak terbesar sebelum membuat gambar (untuk menentukan resolusi yang dibutuhkan).
- Isi produk menetapkan rasio dan ukuran yang harus disediakan.

## Kapan tidak digunakan

- Mengekspor file (`wall-art-color-export-manager`).
- Merancang komposisi dari nol.

## Input

- Wajib: ukuran pixel gambar master (lebar dan tinggi) atau filenya.
- Opsional: titik fokus dari rancangan komposisi, daftar rasio dan ukuran dari isi produk, target PPI.

## Default

- Lima rasio: 2:3, 3:4, 4:5, 11:14, dan seri A.
- Target 300 PPI; minimum yang masih diterima 150 PPI. PPI adalah jumlah pixel per inci pada ukuran cetak; makin tinggi makin tajam.
- Titik fokus di tengah bila rancangan komposisi tidak ada.
- Ukuran pixel selalu dibaca dari file sebenarnya bila file tersedia.

## Pertanyaan bila info penting belum ada

1. "Berapa ukuran pixel gambar master, atau bisa kirim filenya?"
2. "Di gambar, bagian terpenting ada di mana (tengah, agak atas, agak bawah)?"

## Langkah kerja

1. Ambil ukuran pixel. Dengan file: `python3 scripts/print_math.py --image <file> --focus x,y --json <rencana.json>`. Tanpa file: `--width W --height H`.
2. Isi `--focus` dari rancangan komposisi: x dan y antara 0 dan 1 (0,0 kiri atas). Kotak crop tiap rasio dipusatkan pada titik itu.
3. Baca hasil per rasio: bagian yang tersisa (persen), PPI di tiap ukuran, dan statusnya (`ok`, `cukup`, `kurang`).
4. Bandingkan dengan zona aman: bila unsur wajib utuh berada di luar bagian yang tersisa, geser titik fokus dan hitung ulang, atau kembalikan ke komposisi.
5. Tetapkan klaim ukuran tiap rasio dengan aturan keputusan.
6. Untuk ukuran yang `kurang`: hitung faktor pembesaran yang dibutuhkan (kolom "perlu pembesaran"), lalu pilih: tidak menawarkan ukuran itu, memperbesar dengan alat AI, atau membuat ulang pada resolusi lebih tinggi.
7. Simpan rencana JSON ke `studio-nangka/proyek/<project_id>/karya/<artwork_id>/rencana-cetak.json`, salin tabel ke hasil, tulis blok serah terima.

## Aturan keputusan

- Ukuran yang diklaim di listing hanya yang berstatus `ok`. Status `cukup` boleh ditawarkan hanya dengan keputusan pemilik dan disebut jujur sebagai cocok untuk dilihat dari jauh.
- Skrip tidak pernah memperbesar gambar. Pembesaran adalah langkah terpisah dengan alat AI; setelah itu rencana dihitung ulang dari file baru, dan gambar diperiksa cacatnya lagi karena pembesaran bisa memunculkan cacat.
- Faktor pembesaran di atas 2x diperlakukan sebagai risiko: sarankan membuat ulang pada resolusi lebih tinggi.
- Bila lebih dari 20% sisi panjang terpotong pada sebuah rasio dan subjek ikut terpotong, rasio itu tidak ditawarkan atau gambarnya diperluas latarnya.
- Angka PPI adalah hitungan pixel dibagi inci. Mutu cetak juga bergantung pada printer dan kertas, jadi jangan menjanjikan ketajaman.

## Format hasil

Tabel dari skrip (tempel apa adanya), lalu:

```
KLAIM UKURAN
| Rasio | Ukuran yang ditawarkan | File ekspor (pixel) | Bagian terpotong | Catatan |
Tidak ditawarkan dan alasannya: ...
Perlu tindakan: (pembesaran .. x / buat ulang / geser fokus)
```

## Pemeriksaan kualitas

- Ukuran pixel berasal dari file, atau ditandai "dari keterangan pemilik".
- Tidak ada ukuran berstatus `kurang` di klaim.
- Titik fokus yang dipakai tertulis.
- Rencana JSON tersimpan bila ada sistem file.

## Penanganan kesalahan

- File tidak ada dan pemilik tidak tahu ukuran pixel: jelaskan cara melihatnya (properti file), jangan menebak dari nama alat.
- Gambar mendatar atau persegi: skrip menyesuaikan orientasi; untuk persegi, banyak bagian terpotong di semua rasio, jadi sarankan rasio persegi tersendiri atau komposisi ulang.
- Master terlalu kecil untuk ukuran apa pun pada target: laporkan ukuran terbesar pada PPI minimum dan faktor pembesaran yang dibutuhkan.

## Serah terima

`wall-art-color-export-manager` menerima rencana JSON untuk mengekspor file tiap rasio.

## Batas kemampuan alat

Skrip menghitung geometri dan pixel; ia tidak melihat isi gambar, jadi tidak tahu apakah subjek terpotong. Pemeriksaan itu memakai titik fokus dan mata.

## Contoh penggunaan

Master 7200x10800, fokus 0.5,0.62. Hasil: 2:3 sampai 24x36 `ok` (300 PPI); 4:5 menyisakan 83,3% tinggi, file 4800x6000 untuk 16x20; seri A sampai A1 (307,5 PPI). Semua lima rasio ditawarkan.

## Contoh kegagalan dan perbaikannya

Gagal: master 2048x3072 diklaim "cetak sampai 24x36". Hitungan: 85,3 PPI, status `kurang`. Perbaikan: klaim hanya sampai 4x6 pada 300 PPI, atau perbesar 3,5x (berisiko) atau buat ulang; listing mengikuti hasil hitung.

## Cara menguji skill ini

1. Jalankan `python3 scripts/print_math.py --width 7200 --height 10800`. Hasil benar: 24x36 berstatus `ok` dengan 300.0 PPI, dan rasio 4:5 menyisakan tinggi 83.3%.
2. Jalankan `python3 scripts/print_math.py --width 2048 --height 3072`. Hasil benar: 24x36 berstatus `kurang`, dan klaim tidak memuat ukuran itu.
