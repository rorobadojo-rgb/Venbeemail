---
name: etsy-storefront-brand-planner
description: Menyusun pembukaan dan tampilan toko Etsy untuk Studio Wall Art by Nangka, yaitu daftar langkah membuka toko, nama dan kalimat toko, section, banner dan ikon, halaman about, pengumuman, kebijakan toko untuk produk digital, FAQ, dan struktur katalog. Pakai saat pemilik berkata "mau buka toko Etsy", "nama tokonya apa?", "isi about", "section dibagi gimana?", "banner toko", "kebijakan refund produk digital", "toko saya berantakan", atau saat toko belum dibuat. Menghasilkan rencana toko berisi teks siap tempel dan daftar hal yang harus dicek di formulir Etsy. Jangan dipakai untuk menulis listing satuan atau rutinitas mingguan.
---

# etsy-storefront-brand-planner

Toko adalah rumah bagi semua listing: nama, wajah, dan aturan mainnya harus terasa satu dengan karya. Skill ini pemilik identitas dan struktur toko.

Sebelum mulai, baca `references/studio-core.md`. Template rencana toko: `assets/rencana-toko.md`.

## Kapan digunakan

- Toko belum dibuat, atau baru dibuat dan masih kosong.
- Menata ulang section setelah koleksi bertambah.
- Menulis atau memperbarui about, pengumuman, kebijakan, dan FAQ.

## Kapan tidak digunakan

- Judul, deskripsi, tag listing.
- Jadwal kerja mingguan (`etsy-store-operations-planner`).

## Input

- Wajib: memori merek (profil studio, identitas, preferensi).
- Opsional: `visual-dna.md`, rencana koleksi, profil pembeli, catatan fakta Etsy, nama toko yang diinginkan.

## Default

- Toko dibuka dengan bentuk paling kecil yang layak: nama, ikon, banner sederhana, about singkat, kebijakan digital, 2-3 section, dan minimal satu koleksi siap.
- Section disusun menurut ruangan pembeli, karena begitulah pembeli mencari; koleksi menjadi penanda di dalamnya.
- Semua teks toko berbahasa Inggris Amerika.
- Hal yang ditentukan formulir Etsy (panjang nama toko, ukuran banner, pilihan kebijakan) tidak ditebak: diminta dari `etsy-policy-fact-checker` atau dilihat pemilik di formulir.

## Pertanyaan bila info penting belum ada

1. "Nama toko: pakai 'Nangka' di dalamnya, atau nama lain?" (beri 3 usulan)
2. "Ingin toko terasa seperti apa dalam tiga kata?"
3. "Rekening bank untuk pencairan sudah siap atas nama Anda?" (syarat pembukaan toko)

## Langkah kerja

1. Baca memori merek dan `studio-brand-memory` untuk identitas yang sudah diputuskan.
2. Susun daftar langkah pembukaan toko sebagai daftar centang untuk pemilik: akun, bahasa dan mata uang toko, nama toko, listing pertama, cara pembayaran, penagihan, keamanan akun. Tandai butir yang syarat dan biayanya harus dicek di catatan fakta (biaya pembukaan, ketersediaan pembayaran untuk negara penjual).
3. Nama toko: usulkan 5 nama yang mudah dieja pembeli AS, tidak memuat merek orang lain, dan selaras dengan nama studio. Pemilik mengecek ketersediaannya di Etsy; asisten tidak bisa.
4. Tulis kalimat toko (shop title) dan pengumuman singkat yang menyebut produk digital.
5. Arahkan ikon dan banner dari DNA visual: warna, motif, apa yang tidak boleh ada. Ukuran pixel diambil dari catatan fakta atau formulir.
6. Susun section: 3-6 nama section menurut ruangan dan jenis, dengan aturan penempatan listing.
7. Tulis about: cerita singkat studio, cara karya dibuat (jujur, termasuk pemakaian alat AI bila ada), dan apa yang dijanjikan kepada pembeli.
8. Tulis kebijakan dan FAQ untuk produk digital: cara unduh, tidak ada barang fisik, sikap soal pengembalian (sesuai pilihan yang tersedia di Etsy), syarat pemakaian, warna cetak, bantuan.
9. Isi template, tandai tiap butir "siap tempel", "perlu dicek di formulir", atau "menunggu keputusan pemilik".

## Aturan keputusan

- Nama toko dan about adalah KEPUTUSAN pemilik; skill ini mengusulkan.
- About tidak mengarang riwayat (tahun berdiri, jumlah pelanggan, penghargaan). Hanya yang benar.
- Cara pembuatan ditulis jujur. Bila karya dibantu AI, about tidak menyiratkan dilukis tangan.
- Kebijakan toko tidak boleh bertentangan dengan lembar penawaran dan panduan cetak.
- Membuat toko, mengubah pengaturan, dan menerbitkan apa pun adalah tindakan ke luar: disiapkan di sini, dijalankan pemilik atau dengan izin jelas.
- Data pribadi pemilik (alamat, rekening) tidak ditulis ke file studio.

## Format hasil

Rencana toko (template): daftar pembukaan, nama dan kalimat toko, arahan ikon dan banner, section, about, pengumuman, kebijakan, FAQ, dan daftar "perlu dicek di formulir".

## Pemeriksaan kualitas

- Tiap teks siap tempel berbahasa Inggris dan tanpa klaim yang tidak benar.
- Tiap butir yang bergantung aturan Etsy diberi tanda cek, bukan angka dari ingatan.
- Section mencakup semua listing yang direncanakan, tanpa section kosong.

## Penanganan kesalahan

- Identitas belum ada di memori merek: buat usulan sementara dan kirim keputusan yang dibutuhkan ke pemilik.
- Nama yang diinginkan memuat merek orang lain: tolak, beri alternatif.
- Catatan fakta tidak memuat syarat pembukaan toko: minta dicek, dan beri pemilik daftar hal untuk dilihat sendiri saat mendaftar.

## Serah terima

- `etsy-store-operations-planner` menerima daftar pembukaan dan pekerjaan toko untuk dijadwalkan.
- Keputusan identitas (nama, kalimat toko, nada tulisan) dicatat lewat `studio-brand-memory`.

## Batas kemampuan alat

Tidak bisa mendaftarkan toko, mengecek ketersediaan nama, atau melihat formulir Etsy. Konektor Etsy belum tentu aktif.

## Contoh penggunaan

Toko belum ada. Hasil: daftar pembukaan 9 langkah (3 bertanda cek fakta), 5 usulan nama, section "Nursery and Kids", "Living Room and Bedroom", "Kitchen and Dining", "Home Office", about 90 kata yang menyebut studio di Indonesia dan pemakaian alat AI, kebijakan digital, 6 FAQ.

## Contoh kegagalan dan perbaikannya

Gagal: about berbunyi "trusted by thousands of happy customers since 2019" untuk toko yang belum dibuka. Perbaikan: hapus; tulis apa yang benar hari ini, misalnya asal studio dan cara kerja.

## Cara menguji skill ini

Minta "rencana buka toko" dengan memori merek berstatus toko belum dibuat. Hasil benar: daftar pembukaan bercentang, minimal tiga butir bertanda "perlu dicek", usulan nama tanpa merek orang lain, section menurut ruangan, about tanpa angka atau riwayat karangan, dan pernyataan bahwa toko belum dibuat oleh asisten.
