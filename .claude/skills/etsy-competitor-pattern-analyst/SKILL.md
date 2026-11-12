---
name: etsy-competitor-pattern-analyst
description: Mempelajari pola penawaran toko dan listing wall art lain di Etsy, lalu menemukan celah, tanpa meniru produk mereka. Pakai saat pemilik berkata "lihat pesaing", "toko lain jualnya gimana?", "kenapa listing mereka menarik?", "apa bedanya punya saya?", atau saat menentukan bentuk produk, rentang harga, dan gaya gambar listing untuk sebuah niche. Menghasilkan peta pola (format, isi paket, rentang harga yang terlihat, gaya thumbnail, pola judul) dan daftar celah berlabel hipotesis. Jangan dipakai untuk menyalin desain, judul, atau deskripsi toko lain.
---

# etsy-competitor-pattern-analyst

Melihat pesaing sebagai kumpulan pola, bukan sebagai sumber bahan. Yang dicatat adalah cara mereka menawarkan, bukan karya mereka. Skill ini pemilik peta pola pesaing dan celah.

Sebelum mulai, baca `references/studio-core.md`.

## Kapan digunakan

- Niche sudah dipilih atau sedang dibandingkan.
- Sebelum menentukan isi produk, harga, dan arahan gambar listing.
- Listing sendiri kalah menarik dan pemilik ingin tahu sebabnya.

## Kapan tidak digunakan

- Mencari bukti permintaan (`etsy-market-evidence-researcher`).
- Membaca gaya gambar untuk identitas studio. Gambar pesaing bukan referensi gaya untuk ditiru.

## Input

- Wajib: niche atau istilah pencarian, dan 10-20 listing yang diamati (tautan, tangkapan layar, atau lembar amatan dari pemilik).
- Opsional: bukti pasar, listing sendiri untuk dibandingkan.

## Default

- Amati halaman pertama hasil pencarian untuk 2-3 istilah utama.
- Minimal 10 listing dari minimal 6 toko berbeda, supaya pola tidak mencerminkan satu toko saja.

## Pertanyaan bila info penting belum ada

1. "Istilah pencarian apa yang kira-kira diketik pembeli Anda?" (beri dua usulan)
2. "Bisa kirim tangkapan layar halaman pertama hasil pencarian itu?" (bila halaman tidak bisa dibuka dari sini)

## Langkah kerja

1. Kumpulkan amatan per listing ke dalam tabel: bentuk jual (satuan, set), rasio atau ukuran yang ditawarkan, jumlah file, harga yang terlihat dan tanggalnya, jenis gambar pertama, panjang dan pola judul, hal yang dijanjikan, ada tidaknya penyebutan AI, layanan tambahan.
2. Hitung pola: berapa dari N listing yang melakukan hal yang sama. Tulis sebagai "8 dari 12", bukan "kebanyakan".
3. Pisahkan pola yang tampaknya menjadi harapan dasar pembeli (hampir semua melakukannya) dari yang menjadi pembeda (hanya sedikit).
4. Cari celah: kebutuhan dari profil pembeli yang tidak dilayani pola yang ada, misalnya rasio yang jarang disediakan, panduan cetak yang tidak jelas, set yang tidak serasi.
5. Tulis tiap celah sebagai HIPOTESIS beserta cara mengujinya.
6. Catat baris amatan ke `studio-nangka/riset/bukti-pasar.csv` dengan `jenis_sinyal: penawaran`. Penulisan dilakukan lewat pemilik file tersebut; di sini cukup siapkan barisnya di blok serah terima.

## Aturan keputusan

- Dilarang: menyimpan gambar pesaing sebagai bahan, mengunggahnya ke alat AI, menyalin judul atau deskripsi, meniru tata letak mockup khas sebuah toko.
- Boleh: mencatat sifat umum ("thumbnail dalam bingkai kayu terang di dinding putih: 7 dari 12").
- Nama toko hanya muncul di catatan bukti untuk pelacakan, tidak di ringkasan dan tidak di materi publik.
- Harga yang terlihat adalah PENGAMATAN pada satu tanggal; diskon sering berubah. Jangan menyimpulkan pendapatan toko dari harga dan jumlah ulasan.
- "Celah" tidak sama dengan "peluang pasti". Tulis apa yang tidak terlihat, pada amatan mana.

## Format hasil

```
PETA POLA PESAING  niche: ...  tanggal: ...  N listing: ..  N toko: ..
| Hal | Pola | Hitungan |
Harapan dasar pembeli (hampir semua): ...
Pembeda (sedikit yang melakukan): ...
CELAH (HIPOTESIS)
1. ... cara menguji: ...
Yang tidak akan kita tiru: ...
```

## Pemeriksaan kualitas

- Semua pola punya hitungan.
- Tidak ada kalimat yang menyalin teks listing lebih dari beberapa kata umum.
- Tiap celah punya cara uji.

## Penanganan kesalahan

- Etsy tidak bisa dibuka: minta tangkapan layar atau lembar amatan manual dari pemilik; analisis tetap bisa dilakukan dari itu.
- Kurang dari 10 listing: laporkan sebagai "amatan awal", jangan menyebut pola.
- Pemilik meminta "buat seperti toko X": tolak bagian menirunya, tawarkan pola umum yang bisa dipelajari dan arahkan pembeda sendiri.

## Serah terima

- `etsy-micro-niche-mapper` memakai celah untuk menilai kandidat niche.
- `wall-art-product-offer-planner` memakai harapan dasar dan pembeda untuk isi produk.

## Batas kemampuan alat

Tidak melihat penjualan, kunjungan, atau iklan toko lain. Urutan hasil pencarian berbeda antarpengguna dan antarwaktu, jadi amatan adalah potret sesaat.

## Contoh penggunaan

12 listing "tropical animal nursery print" dari 9 toko. Pola: set 3 (9 dari 12), menyediakan 5 rasio (7 dari 12), gambar pertama dalam bingkai di kamar bayi (10 dari 12), panduan cetak disebut jelas (3 dari 12). Celah HIPOTESIS: panduan cetak yang mudah dipahami pembeli awam.

## Contoh kegagalan dan perbaikannya

Gagal: laporan menyarankan "pakai judul yang sama dengan listing teratas". Perbaikan: catat pola judulnya saja (urutan unsur, panjang), dan serahkan penulisan judul asli ke skill penulis listing.

## Cara menguji skill ini

Beri 12 baris amatan listing buatan (tanpa gambar). Hasil benar: tabel pola berhitung "x dari 12", pemisahan harapan dasar dan pembeda, minimal dua celah berlabel HIPOTESIS dengan cara uji, dan bagian "yang tidak akan kita tiru".
