---
name: wall-art-personalization-designer
description: Merancang produk wall art custom atau personalisasi (nama, tanggal, kutipan pembeli, warna pilihan, ilustrasi dari foto pembeli) dengan input pelanggan, batas revisi, waktu pengerjaan, dan hal yang ditolak, yang semuanya jelas sebelum produk dijual. Pakai saat pemilik berkata "mau buka pesanan custom", "produk personalisasi", "pembeli bisa ganti nama", "potret hewan peliharaan dari foto", "berapa kali revisi?", atau saat merencanakan tahap kedua toko setelah produk siap unduh berjalan. Menghasilkan spesifikasi produk custom. Jangan dipakai untuk menjalankan pesanan custom yang sedang berlangsung.
---

# wall-art-personalization-designer

Merancang produk custom di atas kertas sebelum ada pesanan, supaya batasnya ditentukan oleh studio dan bukan oleh pelanggan yang paling gigih. Skill ini pemilik spesifikasi produk custom.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/spesifikasi-custom.md`.

Catatan studio: produk siap unduh didahulukan; personalisasi adalah tahap berikutnya. Skill ini dipakai saat tahap itu direncanakan.

## Kapan digunakan

- Merencanakan produk custom baru.
- Produk custom yang ada sering memicu revisi tanpa akhir atau salah paham.

## Kapan tidak digunakan

- Mengelola satu pesanan yang sedang berjalan (`etsy-custom-order-workflow`).
- Menulis balasan ke pelanggan.

## Input

- Wajib: gagasan produk custom (apa yang bisa diubah pembeli).
- Opsional: kapasitas mingguan, alat yang tersedia, karya dasar yang akan dipersonalisasi, pengalaman pesanan sebelumnya.

## Default

- Tingkat personalisasi paling ringan lebih dulu: teks (nama, tanggal) di atas karya dasar yang sudah ada.
- Satu proof (pratinjau untuk disetujui) dan satu putaran revisi kecil sudah termasuk harga.
- Waktu pengerjaan proof 2-3 hari kerja, disesuaikan dengan kapasitas 5-10 jam per minggu.
- Foto dari pembeli dihapus 30 hari setelah pesanan selesai.

## Pertanyaan bila info penting belum ada

1. "Apa saja yang boleh diubah pembeli: teks, warna, atau gambar dari foto mereka?"
2. "Berapa pesanan custom per minggu yang sanggup Anda kerjakan?"
3. "Alat apa yang dipakai untuk menempatkan teks?" (penting, karena alat gambar AI lemah dalam menulis teks)

## Langkah kerja

1. Tetapkan tingkat personalisasi: A teks saja; B teks dan pilihan warna dari daftar; C ilustrasi dari foto pembeli. Mulai dari yang paling ringan yang masih bernilai.
2. Daftar tiap input pembeli beserta batasnya: jumlah karakter, huruf dan bahasa yang didukung, format tanggal, pilihan warna tertutup, syarat foto (terang, tajam, jumlah).
3. Tulis yang tetap dan tidak bisa diubah (gaya, tata letak, palet dasar).
4. Tetapkan alur: input, proof, revisi, persetujuan tertulis, penyerahan file. Sebut jumlah proof dan revisi yang termasuk, dan apa yang dihitung sebagai revisi kecil.
5. Tetapkan waktu pengerjaan tiap tahap dan batas tunggu jawaban pembeli.
6. Tulis daftar yang ditolak: karakter dan logo berhak cipta, wajah tokoh terkenal, isi yang merendahkan, foto yang bukan milik pembeli.
7. Tulis perlakuan data: foto dan nama hanya untuk pesanan itu, disimpan di folder `pelanggan/`, dihapus setelah batas waktu, tidak dipakai sebagai contoh tanpa izin tertulis.
8. Hitung beban: menit per pesanan dikali pesanan per minggu, bandingkan dengan kapasitas. Angka ini menjadi masukan harga.
9. Tandai hal yang bergantung pada aturan Etsy (cara menyerahkan file custom, kebijakan pengembalian untuk barang custom) sebagai "perlu dicek" sebelum dijual.
10. Isi template dan minta persetujuan pemilik.

## Aturan keputusan

- Tiap hal yang bisa diubah pembeli harus punya batas tertulis. "Bebas" tidak diterima.
- Teks pembeli ditempatkan dengan alat yang menulis huruf secara pasti (penyunting gambar atau skrip), bukan digenerasi AI, agar ejaan tepat.
- Tingkat C (dari foto) hanya dibuka bila tingkat A sudah berjalan lancar dan kapasitas mencukupi.
- Bila beban per minggu melebihi separuh kapasitas, batasi jumlah pesanan atau naikkan harga; putusan pada pemilik.
- Janji waktu ditulis dalam hari kerja dengan cadangan, bukan waktu tercepat.

## Format hasil

Spesifikasi produk custom (template): tingkat, tabel input dan batas, yang tetap, alur dan jumlah revisi, waktu, daftar ditolak, perlakuan data, beban kerja, hal yang perlu dicek, serta teks ringkas "cara pesan" berbahasa Inggris untuk listing.

## Pemeriksaan kualitas

- Semua input punya batas.
- Jumlah proof dan revisi tertulis angka.
- Ada daftar yang ditolak dan perlakuan data.
- Beban kerja dihitung terhadap kapasitas.

## Penanganan kesalahan

- Pemilik ingin "revisi tanpa batas": jelaskan akibatnya pada waktu, tawarkan revisi tambahan berbayar.
- Alat penempatan teks tidak ada: produk teks ditunda, atau teks ditempatkan lewat skrip sederhana; jangan mengandalkan AI menulis nama.
- Aturan Etsy untuk barang custom belum dicek: spesifikasi berstatus `needs_input` sampai dicek.

## Serah terima

- `wall-art-product-offer-planner` memasukkan produk custom ke isi produk dan batas layanan.
- `etsy-custom-order-workflow` memakai spesifikasi ini sebagai aturan main tiap pesanan.

## Batas kemampuan alat

Tidak bisa menguji alur pemesanan di Etsy dari sini. Hasil ilustrasi dari foto pembeli sulit dijamin mirip; itu sebabnya proof wajib.

## Contoh penggunaan

Produk "nama anak di cetakan satwa tropis": tingkat A; input nama (maksimal 12 huruf Latin), tanggal lahir opsional (format Month DD, YYYY); 1 proof, 1 revisi kecil (ejaan atau letak); proof dalam 3 hari kerja; beban 25 menit per pesanan; batas 6 pesanan per minggu.

## Contoh kegagalan dan perbaikannya

Gagal: spesifikasi berbunyi "pembeli bisa minta perubahan apa saja sampai puas". Perbaikan: tetapkan yang tetap, batas tiap input, satu revisi kecil, dan harga revisi tambahan.

## Cara menguji skill ini

Minta "rancang produk potret hewan peliharaan dari foto". Hasil benar: tingkat C dengan peringatan prasyarat, syarat foto tertulis, jumlah proof dan revisi berupa angka, daftar ditolak, aturan hapus foto, hitungan beban terhadap kapasitas, dan tanda "perlu dicek" untuk aturan Etsy.
