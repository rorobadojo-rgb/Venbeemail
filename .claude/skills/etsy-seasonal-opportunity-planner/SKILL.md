---
name: etsy-seasonal-opportunity-planner
description: Menyusun kalender peluang musiman untuk toko wall art digital dengan hitung mundur waktu persiapan yang masuk akal bagi kapasitas studio. Pakai saat pemilik bertanya "kapan harus mulai untuk Natal?", "musim apa yang cocok?", "masih keburu tidak?", "rencana setahun", atau saat bukti pasar menunjukkan pola musiman. Menghasilkan daftar momen, tanggal mulai produksi, tanggal target terbit, dan keputusan kejar atau lewati. Jangan dipakai untuk rutinitas kerja mingguan.
---

# etsy-seasonal-opportunity-planner

Menghitung mundur dari sebuah momen ke hari ini, lalu bertanya jujur: masih sempat atau lebih baik untuk tahun depan. Skill ini pemilik kalender musiman studio.

Sebelum mulai, baca `references/studio-core.md`. Daftar momen pasar AS: `references/momen-pasar-as.md`.

## Kapan digunakan

- Merencanakan koleksi bertema musim atau hari besar.
- Menentukan urutan pengerjaan beberapa koleksi dalam setahun.
- Memeriksa apakah sebuah momen masih terkejar.

## Kapan tidak digunakan

- Menjadwalkan tugas mingguan (`etsy-store-operations-planner`).
- Membuktikan sebuah momen laku (butuh bukti pasar).

## Input

- Wajib: tanggal hari ini (ambil dari lingkungan; jangan menebak) dan momen atau rentang waktu yang direncanakan.
- Opsional: kapasitas jam per minggu, jumlah karya per koleksi, bukti pola musiman, eksperimen terdahulu.

## Default

- Kapasitas dari memori merek (5-10 jam per minggu); hitung dengan angka bawah.
- Waktu produksi satu koleksi 6 karya: 3-4 minggu pada kapasitas itu (ASUMSI studio; perbarui setelah koleksi pertama selesai).
- Target terbit 8 minggu sebelum momen (ASUMSI kerja, bukan fakta Etsy). Alasannya: listing baru butuh waktu untuk mulai tampil, dan pembeli dekorasi musiman berbelanja lebih awal dari hari-H. Ganti dengan angka dari bukti bila ada.

## Pertanyaan bila info penting belum ada

1. "Momen mana yang ingin dikejar?" (beri 3-4 pilihan terdekat dari daftar momen)
2. "Berapa jam per minggu yang benar-benar bisa dipakai bulan ini?"

## Langkah kerja

1. Ambil tanggal hari ini dan tanggal momen. Untuk momen yang tanggalnya bergeser tiap tahun, cari tanggal tahun itu; jangan mengandalkan ingatan.
2. Hitung mundur: tanggal momen, dikurangi jarak terbit, hasilnya target terbit; dikurangi waktu produksi, hasilnya tanggal mulai. Bila ada alat hitung (Python), pakai itu untuk tanggalnya.
3. Bandingkan tanggal mulai dengan hari ini dan beri status: aman (lebih dari 2 minggu longgar), ketat (0-2 minggu), terlambat.
4. Untuk yang terlambat, tawarkan tiga pilihan: versi kecil (2-3 karya), geser ke momen berikutnya, atau siapkan untuk tahun depan.
5. Pisahkan momen musiman dari kebutuhan sepanjang tahun (misalnya kamar bayi) yang tidak punya tenggat.
6. Susun kalender 6-12 bulan: paling banyak satu koleksi musiman berjalan bersamaan dengan satu koleksi sepanjang tahun.
7. Tulis tiap baris dengan label: tanggal momen FAKTA (bersumber), jarak terbit ASUMSI, kelayakan HIPOTESIS.

## Aturan keputusan

- Kapasitas mengalahkan ambisi: bila jam yang tersedia tidak cukup, kurangi jumlah momen, bukan mutu.
- Momen yang terikat merek atau karakter (film, tim olahraga, tokoh) tidak dimasukkan.
- Koleksi musiman harus tetap sesuai DNA visual studio; momen hanya mengubah tema dan warna aksen.
- Skill ini tidak menjanjikan bahwa terbit lebih awal menaikkan peringkat pencarian.

## Format hasil

```
KALENDER MUSIMAN  dibuat: [tanggal]  kapasitas: [jam/minggu]
| Momen | Tanggal momen | Target terbit | Mulai produksi | Sisa waktu | Status | Usulan |
Sepanjang tahun: ...
Dilewati tahun ini dan alasannya: ...
Asumsi yang dipakai: jarak terbit .. minggu; produksi .. minggu per koleksi
```

## Pemeriksaan kualitas

- Semua tanggal dihitung dari tanggal hari ini yang disebut di kepala hasil.
- Tidak ada dua koleksi musiman yang produksinya bertumpuk melebihi kapasitas.
- Asumsi jarak terbit dan waktu produksi tertulis.

## Penanganan kesalahan

- Tanggal hari ini tidak diketahui: tanyakan; jangan menghitung dari perkiraan.
- Semua momen terdekat terlambat: katakan demikian, usulkan satu koleksi sepanjang tahun sekarang dan momen pertama yang masih aman.

## Serah terima

- `wall-art-series-collection-builder` menerima momen terpilih beserta tenggat produksinya.
- `etsy-store-operations-planner` menerima tanggal mulai dan target terbit untuk dijadwalkan per minggu.

## Batas kemampuan alat

Tidak mengetahui kapan pembeli benar-benar mulai mencari sebuah tema; itu harus diamati lewat Google Trends, Pinterest Trends, atau data toko sendiri.

## Contoh penggunaan

Hari ini 12 November 2026, pemilik ingin koleksi Natal. Natal 25 Desember; target terbit 8 minggu sebelumnya sudah lewat. Status terlambat. Usulan: versi kecil 2 karya bila ingin belajar, dan koleksi "penyegaran rumah awal tahun" atau kamar bayi sebagai fokus utama.

## Contoh kegagalan dan perbaikannya

Gagal: kalender memuat enam koleksi musiman dalam enam bulan untuk kapasitas 5 jam per minggu. Perbaikan: hitung jam yang dibutuhkan, pangkas menjadi dua, tulis sisanya di "dilewati tahun ini".

## Cara menguji skill ini

Beri tanggal hari ini 2026-11-12, kapasitas 5 jam per minggu, dan permintaan "Hari Ibu". Hasil benar: tanggal Hari Ibu AS tahun 2027 dicari atau dinyatakan perlu dicek (Minggu kedua bulan Mei), target terbit dan mulai produksi dihitung mundur, status aman, dan asumsi tertulis.
