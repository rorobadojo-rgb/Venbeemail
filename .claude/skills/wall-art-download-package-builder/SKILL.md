---
name: wall-art-download-package-builder
description: Menyusun paket unduhan untuk satu listing wall art digital dengan nama file dan struktur yang mudah dipahami pembeli, lalu memeriksanya terhadap batas jumlah dan ukuran file toko. Pakai saat pemilik berkata "susun file untuk diunggah", "paket download-nya", "kok lebih dari 5 file?", "perlu di-zip tidak?", "cek paketnya sudah lengkap belum", atau setelah file tiap rasio diekspor. Menghasilkan folder paket akhir, manifest hasil skrip, dan penilaian gerbang paket cetak. Jangan dipakai untuk mengekspor gambar atau menulis panduan cetak.
---

# wall-art-download-package-builder

Pembeli menerima beberapa file dan harus langsung tahu mana yang dipakai untuk bingkainya. Skill ini menyusun paket itu dan membuktikan isinya lewat manifest. Skill ini pemilik isi dan struktur paket unduhan.

Sebelum mulai, baca `references/studio-core.md`. Penyusun dan pemeriksa: `scripts/build_package.py`.

## Kapan digunakan

- File tiap rasio selesai diekspor.
- Paket lama perlu ditambah file (misalnya panduan cetak) atau diperiksa ulang.

## Kapan tidak digunakan

- File rasio belum ada (`wall-art-color-export-manager` dulu).
- Menulis isi panduan cetak.

## Input

- Wajib: folder berisi file hasil ekspor.
- Opsional: daftar rasio yang dijanjikan isi produk, panduan cetak (PDF), batas file dari catatan fakta Etsy.

## Default

- Batas 5 file per listing dan 20 MB per file, dari `studio-nangka/fakta/etsy-facts.md`. Periksa tanggal catatan itu; bila lebih dari 90 hari, minta dicek ulang dulu.
- Bila jumlah file melebihi batas, file terkecil digabung ke dalam ZIP.
- Nama file huruf kecil, angka, tanda hubung dan garis bawah, tanpa spasi.

## Pertanyaan bila info penting belum ada

"Rasio apa saja yang dijanjikan produk ini?" Bila tidak dijawab, pakai lima rasio standar.

## Langkah kerja

1. Kumpulkan semua file yang akan diterima pembeli dalam satu folder sumber: file tiap rasio dan panduan cetak bila sudah ada.
2. Jalankan: `python3 scripts/build_package.py --src <folder sumber> --out <folder paket> --expect <rasio dipisah koma> --max-files <batas> --max-mb <batas>`.
3. Baca tiap baris pemeriksaan (`PASS`, `WARN`, `FAIL`) dan daftar file akhir.
4. Bila skrip menggabung file ke ZIP, catat file mana di dalam ZIP mana; ini harus dijelaskan di panduan cetak dan deskripsi listing.
5. Bila ada `FAIL`, paket tidak dibuat. Perbaiki penyebabnya di skill pemilik (lihat aturan keputusan) lalu jalankan ulang.
6. Simpan paket di `studio-nangka/proyek/<project_id>/karya/<artwork_id>/paket/`. Manifest dibuat skrip di folder itu.
7. Minta `studio-quality-gate` menilai gerbang G4 dengan manifest sebagai bukti, lalu tulis blok serah terima.

## Aturan keputusan

- Manifest hanya sah bila dibuat skrip. Jangan menulis manifest dengan tangan atau dari ingatan.
- Skrip menggabung dua file gambar terkecil lebih dulu dan membiarkan PDF panduan cetak berdiri sendiri agar mudah ditemukan. PDF baru ikut digabung bila tidak ada pilihan lain.
- `FAIL` nama file dan ukuran dikembalikan ke pengekspor. `FAIL` rasio hilang dikembalikan ke perencana rasio atau pengekspor.
- `WARN` (mendekati batas, tanpa tag DPI, bukan RGB) boleh lanjut dengan catatan di serah terima.
- Jumlah dan ukuran batas adalah aturan toko yang bisa berubah: selalu sebut tanggal catatan fakta yang dipakai.

## Format hasil

```
PAKET  ART-...  v..   batas: 5 file, 20 MB (catatan fakta tanggal ...)
Pemeriksaan: (tempel keluaran skrip)
File akhir:
| File | MB | Isi (bila ZIP) | Untuk ukuran |
Manifest: .../paket/manifest.json
Gerbang G4: (hasil)
```

## Pemeriksaan kualitas

- Manifest ada dan `verdict` bukan `fail`.
- Jumlah file akhir tidak melebihi batas.
- Tiap rasio yang dijanjikan ada, langsung atau di dalam ZIP.
- Tiap file akhir tercantum di `output_artifacts` dengan `verified: true`.

## Penanganan kesalahan

- Tidak ada sistem file atau Python: berikan daftar periksa manual (nama, jumlah, ukuran, rasio), dan katakan paket belum diverifikasi skrip.
- Pillow tidak ada: skrip tetap memeriksa nama, jumlah, dan ukuran; ukuran pixel ditandai `WARN`.
- File tidak bisa digabung karena semuanya besar: kurangi jumlah rasio lewat perencana isi produk atau turunkan ukuran terbesar yang diklaim.

## Serah terima

- `wall-art-print-instruction-writer` menerima daftar file akhir untuk menulis panduan yang cocok dengan isi paket.
- `studio-quality-gate` dipanggil untuk keputusan gerbang G4.

## Batas kemampuan alat

Skrip memeriksa file di disk, bukan unggahan di Etsy; ia tidak tahu apakah toko menerima sebuah jenis file. Daftar jenis file yang diterima harus dicek di catatan fakta.

## Contoh penggunaan

Lima JPEG rasio dan satu PDF panduan (6 file). Skrip membiarkan PDF panduan berdiri sendiri dan menggabung dua file gambar terkecil (11x14 dan 4x5) menjadi satu ZIP, hasil 5 file, semua `PASS`. G4 lulus.

## Contoh kegagalan dan perbaikannya

Gagal: laporan menyebut "paket berisi 5 file siap unggah" padahal folder hanya berisi 4 file dan tidak ada manifest. Perbaikan: jalankan skrip dengan `--expect`; rasio yang hilang muncul sebagai `FAIL`; ekspor ulang yang hilang, lalu laporkan dari manifest.

## Cara menguji skill ini

1. Jalankan skrip pada folder berisi 6 file kecil bernama benar dengan `--max-files 5`. Hasil benar: 5 file akhir, satu di antaranya ZIP berisi dua file, `verdict` `pass`.
2. Tambahkan file bernama `Gambar Final.jpg`. Hasil benar: `FAIL` pada nama file, folder paket tidak dibuat, kode keluar 1.
