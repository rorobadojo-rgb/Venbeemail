---
name: etsy-store-operations-planner
description: Membuat rutinitas dan rencana kerja mingguan untuk toko wall art digital berdasarkan kapasitas jam yang nyata dan prioritas toko, mencakup produksi, listing, layanan pelanggan, konten, dan pengukuran. Pakai saat pemilik berkata "minggu ini ngerjain apa?", "bagi waktu saya", "jadwal kerja toko", "kewalahan", "banyak yang belum selesai", "rencana mingguan", atau setelah rencana toko, kalender musiman, atau rencana konten menghasilkan pekerjaan baru. Menghasilkan rencana minggu berisi tugas berukuran jam dan satu hal yang sengaja ditunda. Jangan dipakai untuk strategi bulanan atau kalender musiman.
---

# etsy-store-operations-planner

Mengubah daftar keinginan menjadi minggu yang muat di 5-10 jam. Rencana yang baik menyebut juga apa yang tidak dikerjakan. Skill ini pemilik rutinitas dan rencana mingguan.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/rencana-mingguan.md`.

## Kapan digunakan

- Awal minggu, atau saat pekerjaan menumpuk.
- Ada pekerjaan baru dari rencana toko, kalender musiman, atau rencana konten.
- Kapasitas berubah.

## Kapan tidak digunakan

- Menentukan prioritas bulan (`studio-monthly-strategy-reviewer`).
- Menghitung tenggat musiman.

## Input

- Wajib: jam yang benar-benar tersedia minggu ini, dan daftar pekerjaan terbuka.
- Opsional: prioritas bulan dari memori merek, kalender musiman, proyek aktif dan tahapnya, pekerjaan toko dari rencana toko, rencana konten.

## Default

- Kapasitas dari memori merek; pakai angka bawah (5 jam) kecuali pemilik menyebut lain.
- Pembagian waktu awal: produksi karya 50%, listing dan toko 25%, layanan dan pesan 10%, konten 10%, mengukur dan mencatat 5%. Bila toko belum dibuka, porsi layanan dan konten dialihkan ke produksi dan pembukaan toko.
- Cadangan 15% dari jam tidak diisi.
- Paling banyak satu koleksi dalam pengerjaan pada satu waktu.

## Pertanyaan bila info penting belum ada

1. "Berapa jam yang benar-benar ada minggu ini, dan di hari apa?"
2. "Apa satu hal yang paling ingin selesai minggu ini?"

## Langkah kerja

1. Kumpulkan pekerjaan terbuka dari proyek aktif (serah terima terakhir tiap proyek), rencana toko, kalender, dan konten.
2. Beri tiap pekerjaan perkiraan jam. Pekerjaan lebih dari 2 jam dipecah.
3. Tandai yang bertenggat (musim, pesanan custom, kasus) dan yang menghalangi pekerjaan lain.
4. Isi minggu dengan urutan: yang bertenggat, yang membuka sumbatan, satu hal utama pemilik, lalu sisanya sampai 85% kapasitas.
5. Sebut dengan jelas apa yang ditunda dan sampai kapan.
6. Tambahkan rutinitas tetap berukuran kecil: cek pesan (5 menit per hari kerja, setelah toko buka), catat waktu nyata per tugas, perbarui katalog dan memori di akhir minggu.
7. Tulis tiap tugas dengan kata kerja, hasil yang bisa dicek, perkiraan jam, dan skill studio yang dipakai.
8. Di akhir minggu (bila diminta): bandingkan rencana dengan kenyataan, perbarui angka perkiraan jam per jenis tugas untuk minggu berikut.

## Aturan keputusan

- Rencana tidak boleh melebihi 85% jam yang tersedia. Bila pekerjaan bertenggat saja sudah melebihi, laporkan dan minta pemilik memilih yang dilepas.
- Selesai lebih baik daripada mulai banyak: satu karya sampai paket cetak mengalahkan tiga karya setengah jadi.
- Tugas tanpa hasil yang bisa dicek ditulis ulang ("riset" menjadi "isi lembar amatan untuk 3 istilah").
- Perkiraan jam yang berasal dari catatan nyata mengalahkan default. Tanpa catatan, perkiraan berlabel ASUMSI.
- Skill ini tidak mengubah prioritas bulan; bila rencana minggu bertentangan dengannya, tampilkan pertentangannya.

## Format hasil

Rencana mingguan (template): kapasitas, hal utama, tabel tugas (hari, tugas, hasil yang dicek, jam, skill), rutinitas tetap, yang ditunda, dan risiko minggu ini.

## Pemeriksaan kualitas

- Jumlah jam tugas tidak lebih dari 85% kapasitas; angkanya ditulis.
- Tiap tugas punya hasil yang bisa dicek.
- Ada bagian "ditunda".
- Tugas bertenggat masuk lebih dulu.

## Penanganan kesalahan

- Daftar pekerjaan tidak ada: susun dari serah terima terakhir proyek aktif; bila itu pun tidak ada, mulai dari langkah pertama jalur yang relevan.
- Pemilik tidak tahu jam yang tersedia: pakai 5 jam dan minta dikoreksi.
- Minggu lalu meleset jauh: kurangi isi minggu ini, jangan menambah untuk "mengejar".

## Serah terima

Skill ujung: tidak menyerahkan ke skill lain. `next_skill` diisi `null`. Rencana kembali ke pemilik; tugas dikerjakan lewat skill yang disebut di tiap baris.

## Batas kemampuan alat

Tidak tahu kalender pribadi pemilik. Perkiraan jam kasar sampai ada catatan waktu nyata. Tidak mengingatkan otomatis kecuali lingkungan punya penjadwal dan pemilik memintanya.

## Contoh penggunaan

Kapasitas 6 jam, toko belum buka. Rencana 5 jam: 2 jam karya utama sampai gerbang G3, 1 jam rencana rasio dan ekspor, 1 jam rencana toko (nama dan about), 0,5 jam register hak, 0,5 jam catat dan perbarui memori. Ditunda: rencana Pinterest sampai listing pertama terbit.

## Contoh kegagalan dan perbaikannya

Gagal: rencana berisi 14 jam tugas untuk kapasitas 6 jam "supaya cepat". Perbaikan: potong sampai 5 jam, pindahkan sisanya ke bagian ditunda dengan minggu sasarannya.

## Cara menguji skill ini

Beri kapasitas 5 jam dan 9 pekerjaan terbuka berjumlah 13 jam, satu di antaranya bertenggat. Hasil benar: jumlah jam rencana paling banyak 4,25, tugas bertenggat masuk, tiap tugas punya hasil yang bisa dicek, dan ada daftar ditunda dengan minggu sasaran.
