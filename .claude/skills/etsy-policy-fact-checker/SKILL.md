---
name: etsy-policy-fact-checker
description: Memeriksa dan mencatat aturan serta biaya Etsy yang berlaku sekarang, lengkap dengan sumber, tanggal, dan tingkat keyakinan. Pakai setiap kali muncul pertanyaan tentang biaya Etsy, potongan per penjualan, batas tag atau judul, batas file digital, aturan karya AI, kewajiban menyebut AI, iklan Offsite Ads, pembayaran untuk penjual Indonesia, atau saat skill lain membutuhkan angka kebijakan dan catatan fakta studio sudah lebih dari 90 hari. Jangan dipakai untuk riset pasar, keyword, atau menghitung harga.
---

# etsy-policy-fact-checker

Satu pemilik untuk "apa aturan Etsy sekarang". Skill harga, tag, preflight, dan penanganan masalah memakai catatan dari sini supaya semua memakai angka yang sama dan bertanggal.

Sebelum mulai, baca `references/studio-core.md`. Catatan terakhir yang dibawa skill ini: `references/etsy-facts-snapshot.md` (lihat tanggalnya; bisa sudah basi). Template angka biaya: `assets/fees-template.json`.

## Kapan digunakan

- Pertanyaan tentang biaya atau aturan Etsy.
- Sebelum keputusan uang atau kebijakan bila `studio-nangka/fakta/etsy-facts.md` lebih tua dari 90 hari atau belum ada.
- Ada kabar perubahan kebijakan.

## Kapan tidak digunakan

- Menghitung harga (`etsy-digital-pricing-modeler`).
- Menilai hak sebuah bahan (`studio-asset-rights-register`).

## Input

- Wajib: pertanyaan atau daftar fakta yang perlu dicek.
- Opsional: negara penjual, catatan fakta lama.

## Default

- Negara penjual Indonesia (ASUMSI sampai pemilik mengonfirmasi); pasar pembeli Amerika Serikat.
- Fakta tanpa sumber resmi diberi keyakinan `rendah`.

## Pertanyaan bila info penting belum ada

"Rekening bank toko berada di negara mana?" (menentukan biaya pemrosesan pembayaran).

## Langkah kerja

1. Baca `studio-nangka/fakta/etsy-facts.md`. Bila tidak ada, mulai dari `references/etsy-facts-snapshot.md`.
2. Untuk tiap fakta yang diminta, lihat tanggal ceknya. Lebih dari 90 hari atau keyakinan `rendah`: cek ulang.
3. Cek ulang dengan urutan sumber: halaman kebijakan Etsy (`etsy.com/legal/...`), Pusat Bantuan Etsy (`help.etsy.com`), Seller Handbook Etsy, lalu pihak ketiga hanya sebagai petunjuk.
4. Catat tiap fakta: isi, sumber (URL), tanggal dilihat, cara melihat (halaman dibuka langsung / kutipan mesin pencari / pihak ketiga), keyakinan.
5. Bila dua sumber resmi berbeda, catat keduanya dan tandai "bertentangan"; jangan memilih diam-diam.
6. Perbarui `studio-nangka/fakta/etsy-facts.md` dan `studio-nangka/fakta/fees.json`. Sebut baris yang berubah.
7. Jawab pertanyaan pemilik dalam bahasa sederhana, dengan tanggal dan keyakinan.

## Aturan keputusan

- Keyakinan `tinggi`: halaman resmi Etsy dibuka langsung pada tanggal cek. `sedang`: isi halaman resmi dikutip mesin pencari. `rendah`: hanya pihak ketiga atau ingatan model.
- Angka dari ingatan model tidak pernah ditulis sebagai FAKTA; paling tinggi ASUMSI berkeyakinan `rendah`.
- Fakta `rendah` boleh dipakai untuk perkiraan kasar, tidak untuk memutuskan terbit, refund, atau harga akhir.
- Bila tidak bisa dicek, tulis "belum bisa diverifikasi" dan beri pemilik URL untuk dibuka sendiri.

## Format hasil

Tabel: `Fakta | Isi | Sumber | Tanggal cek | Cara lihat | Keyakinan`, lalu daftar "berubah sejak catatan terakhir" dan "belum bisa diverifikasi".

## Pemeriksaan kualitas

- Setiap baris punya sumber dan tanggal.
- Tidak ada angka di `fees.json` tanpa `source` dan `verified_on`.
- Pertentangan antarsumber terlihat, tidak disembunyikan.

## Penanganan kesalahan

- Situs Etsy tidak bisa dibuka dari lingkungan ini: pakai kutipan mesin pencari (keyakinan `sedang`), katakan batasannya, dan beri daftar URL untuk dicek pemilik.
- Pencarian web tidak tersedia: jangan memperbarui tanggal cek; sajikan catatan lama beserta umurnya.
- Biaya dalam mata uang lokal: simpan angka lokal apa adanya; kurs diisi pemilik atau dicari dengan sumber dan tanggal.

## Serah terima

Skill layanan: mengembalikan fakta ke skill pemanggil. `next_skill` diisi `null`.

## Batas kemampuan alat

Tidak bisa masuk ke akun penjual, jadi biaya yang hanya tampil di dasbor toko (misalnya biaya pembukaan toko yang berbeda per lokasi) harus dilihat pemilik. Bukan nasihat pajak atau hukum.

## Contoh penggunaan

Skill harga meminta biaya untuk penjual Indonesia. Hasil: biaya listing dan biaya transaksi berkeyakinan `sedang`, biaya pemrosesan pembayaran Indonesia `rendah` dengan catatan "cek tabel resmi", kurs kosong menunggu pemilik.

## Contoh kegagalan dan perbaikannya

Gagal: menulis "maksimal 10 foto per listing" sebagai fakta dari ingatan. Perbaikan: catatan menunjukkan sumber pihak ketiga berbeda (10 dan 20) dan sumber resmi belum dilihat, jadi tulis "belum bisa diverifikasi" dan minta pemilik melihat formulir listing.

## Cara menguji skill ini

Tanyakan "berapa tag yang boleh dan berapa panjangnya?". Hasil benar: jawaban memuat angka, URL sumber Etsy, tanggal cek, cara lihat, dan keyakinan; bila catatan lebih dari 90 hari, skill mengecek ulang atau menyebut umurnya.
