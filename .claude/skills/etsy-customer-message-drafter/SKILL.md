---
name: etsy-customer-message-drafter
description: Membuat draf balasan pesan pelanggan Etsy dalam bahasa Inggris untuk toko wall art digital, berdasarkan informasi pesanan yang benar-benar tersedia, misalnya pertanyaan cara unduh, cara cetak, ukuran, file tidak terbuka, permintaan custom, ucapan terima kasih, dan balasan ulasan. Pakai saat pemilik menempelkan pesan pembeli dan berkata "balas ini", "jawabnya gimana?", "buatkan balasan sopan", "balas ulasan ini", atau saat skill pesanan custom dan penanganan masalah membutuhkan kata-kata untuk pelanggan. Menghasilkan draf siap kirim beserta hal yang perlu dipastikan dulu. Jangan dipakai untuk memutuskan refund atau mengirim pesan tanpa izin.
---

# etsy-customer-message-drafter

Menulis balasan yang cepat dipahami, hangat, dan tidak menjanjikan lebih dari yang bisa ditepati. Skill ini pemilik kata-kata; keputusan penyelesaian masalah milik skill lain, dan pengiriman selalu di tangan pemilik studio.

Sebelum mulai, baca `references/studio-core.md` (bagian 3 tentang data pelanggan, bagian 7 tentang tindakan ke luar). Pola balasan: `references/pola-balasan.md`.

## Kapan digunakan

- Ada pesan atau ulasan pembeli yang perlu dibalas.
- Skill lain sudah memutuskan jalur dan butuh kalimatnya.
- Menyiapkan balasan standar untuk pertanyaan berulang.

## Kapan tidak digunakan

- Menentukan refund, penggantian, atau jalur sengketa (`etsy-issue-resolution-assistant` dulu).
- Mengelola tahap pesanan custom (`etsy-custom-order-workflow`).

## Input

- Wajib: isi pesan pelanggan (ditempel pemilik), dan fakta pesanan yang diketahui (produk apa, kapan dibeli, apa yang sudah terjadi).
- Opsional: lembar penawaran, panduan cetak, kebijakan toko, keputusan dari skill penanganan masalah, nada tulisan dari memori merek.

## Default

- Bahasa Inggris Amerika, 40-120 kata, tiga bagian: tanggapi, jawab, langkah berikut.
- Nada ramah dan tenang; tanpa huruf besar semua, tanpa tanda seru beruntun.
- Fakta yang tidak diketahui ditanyakan ke pemilik atau ditulis sebagai `[CEK: ...]`, tidak diisi tebakan.
- Draf saja. Tidak ada pesan yang dikirim tanpa izin jelas.

## Pertanyaan bila info penting belum ada

1. "Produk mana yang dibeli, dan pesanannya sudah selesai dibayar?"
2. "Apa yang sudah Anda putuskan untuk pembeli ini?" (bila pesan berisi keluhan)

## Langkah kerja

1. Baca pesan dan tulis ulang dalam satu kalimat: apa yang sebenarnya diminta.
2. Golongkan: informasi (unduh, cetak, ukuran, isi paket), permintaan (ukuran lain, custom, lisensi), keluhan, atau ulasan.
3. Untuk keluhan dan permintaan refund: berhenti, minta keputusan jalur dari skill penanganan masalah atau pemilik; jangan menulis janji lebih dulu.
4. Kumpulkan fakta dari lembar penawaran, panduan cetak, dan kebijakan toko. Jawaban harus sama dengan dokumen itu.
5. Tulis draf mengikuti pola di `references/pola-balasan.md`.
6. Tandai tiap hal yang belum pasti dengan `[CEK: ...]` dan daftar di bawah draf.
7. Untuk balasan ulasan (terlihat publik): lebih pendek, tanpa data pesanan, tanpa berdebat.
8. Serahkan draf. Kirim hanya bila pemilik meminta dan alatnya tersedia; bila tidak, pemilik menyalin sendiri.

## Aturan keputusan

- Tidak menjanjikan refund, penggantian, tenggat, atau fitur yang belum diputuskan.
- Tidak menyalahkan pembeli, walau kesalahan ada pada mereka (misalnya mengira barang fisik).
- Tidak mengajak transaksi atau komunikasi di luar Etsy, dan tidak meminta ulasan bagus sebagai imbalan. Aturan rinci soal ini ada di kebijakan Etsy; bila ragu, minta dicek.
- Data pribadi pembeli (nama lengkap, alamat, email) tidak disalin ke memori merek, contoh, atau file yang dibagikan. Nama depan di sapaan boleh.
- Balasan untuk pesan marah: satu kalimat pengakuan, lalu langsung ke solusi; tidak membela diri panjang.
- Bila pesan menyebut klaim hukum atau hak cipta: jangan dibalas dengan draf biasa; arahkan ke penanganan masalah.

## Format hasil

```
INTI PESAN: ...
GOLONGAN: informasi / permintaan / keluhan / ulasan
DRAF (bahasa Inggris, .. kata):
...
PERLU DIPASTIKAN SEBELUM KIRIM:
- [CEK: ...]
STATUS: draf, belum dikirim
```

## Pemeriksaan kualitas

- Draf menjawab inti pesan di dua kalimat pertama.
- Semua fakta sesuai dokumen studio; yang belum pasti bertanda `[CEK]`.
- Tidak ada janji di luar keputusan yang ada.
- Status kirim tertulis jujur.

## Penanganan kesalahan

- Pesan tidak jelas maksudnya: tulis draf yang bertanya satu hal dengan sopan.
- Pesan bukan bahasa Inggris: balas dalam bahasa pembeli bila yakin, sertakan terjemahan Indonesia untuk pemilik, dan tandai `[CEK]` terjemahannya.
- Pemilik meminta kalimat yang melanggar aturan di atas: jelaskan risikonya, beri versi aman.

## Serah terima

Skill ujung: tidak menyerahkan ke skill lain. `next_skill` diisi `null`. Draf kembali ke pemilik atau ke skill yang meminta.

## Batas kemampuan alat

Tidak membaca kotak pesan Etsy dan tidak tahu status pesanan kecuali diberi tahu. Tidak mengirim pesan bila konektor tidak aktif.

## Contoh penggunaan

Pesan: "Hi, I bought the bird print but nothing arrived in the mail?" Golongan informasi (salah paham produk digital). Draf 70 kata: menjelaskan dengan ramah bahwa ini unduhan digital, letak file di akun Etsy (Purchases and reviews), dan tawaran bantuan memilih file. `[CEK: pesanan atas nama pembeli ini sudah berstatus dibayar]`.

## Contoh kegagalan dan perbaikannya

Gagal: draf berbunyi "We'll refund you right away" padahal belum ada keputusan. Perbaikan: ganti dengan langkah bantuan yang pasti bisa dilakukan, dan minta keputusan refund lewat penanganan masalah.

## Cara menguji skill ini

Tempel pesan "The file won't open on my phone, I want my money back!!" tanpa keterangan lain. Hasil benar: golongan keluhan, skill meminta keputusan jalur lebih dulu, draf sementara hanya berisi pengakuan dan langkah bantuan membuka file, tidak ada janji refund, ada `[CEK]`, dan status "draf, belum dikirim".
