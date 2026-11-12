---
name: etsy-portfolio-decision-reviewer
description: Meninjau produk dan koleksi di katalog toko wall art lalu mengusulkan untuk tiap produk apakah dipertahankan, direvisi, dihentikan, atau dikembangkan menjadi koleksi lanjutan, berdasarkan bukti data dan kesesuaian dengan identitas studio. Pakai saat pemilik berkata "produk mana yang dibuang?", "mana yang perlu diperbaiki?", "koleksi mana yang dilanjutkan?", "bikin lanjutan dari yang laku", "rapikan katalog", "listing ini diperpanjang atau tidak?", atau saat tinjauan portofolio berkala. Menghasilkan tabel usulan beralasan dan rencana gelombang pengembangan. Jangan dipakai untuk membaca data mentah atau merancang isi koleksi baru secara rinci.
---

# etsy-portfolio-decision-reviewer

Memutuskan ke mana waktu yang terbatas sebaiknya pergi: memperbaiki yang hampir berhasil, melepas yang tidak bergerak, dan memperluas yang punya tanda minat. Skill ini pemilik usulan pertahankan, revisi, hentikan, dan kembangkan; keputusan akhirnya pada pemilik studio.

Sebelum mulai, baca `references/studio-core.md`. Lembar tinjauan: `assets/lembar-portofolio.md`.

## Kapan digunakan

- Tinjauan berkala (bulanan atau per kuartal).
- Menjelang perpanjangan listing.
- Menentukan koleksi lanjutan.

## Kapan tidak digunakan

- Data belum dibaca (`etsy-performance-data-reader` dulu).
- Toko belum punya listing terbit minimal 60 hari: belum ada yang layak ditinjau.

## Input

- Wajib: katalog (`studio-nangka/register/katalog.csv`) dan pembacaan data untuk rentang yang sama.
- Opsional: register eksperimen, model harga, catatan pemeriksa gaya, pesan dan keluhan per produk, kapasitas.

## Default

- Hanya listing berumur 60 hari atau lebih yang ditinjau; yang lebih muda ditandai "terlalu dini".
- Rentang bukti 90 hari bila ada.
- Gelombang pengembangan berisi 3 karya, bukan koleksi penuh, sampai tanda minat berulang.
- Katalog dibaca lewat `etsy-catalog-sku-manager`; perubahan status dicatat di sana setelah pemilik memutuskan.

## Pertanyaan bila info penting belum ada

1. "Rentang waktu mana yang ditinjau?"
2. "Berapa jam per minggu yang bisa dipakai untuk revisi dan karya baru bulan depan?"

## Langkah kerja

1. Susun daftar produk dari katalog dengan umur listing, bentuk jual, dan koleksi.
2. Tempel angka dari pembacaan data: kunjungan, favorit, pesanan, dan tanda kecukupan datanya.
3. Kelompokkan tiap produk:
   - Ada pesanan berulang atau tanda minat kuat: calon dipertahankan atau dikembangkan.
   - Dilihat dan disukai tetapi jarang dibeli: calon direvisi (harga, isi, gambar, kejelasan).
   - Jarang dilihat: calon direvisi di sisi temuan (gambar pertama, judul, tag) sebelum dinilai produknya.
   - Tidak dilihat dan tidak sesuai DNA, atau memicu keluhan berulang: calon dihentikan.
4. Untuk tiap calon revisi, sebut satu perubahan paling mungkin berpengaruh dan skill pemiliknya; perubahan itu dijalankan sebagai eksperimen.
5. Untuk tiap calon dihentikan, pilih `jeda` (bisa kembali) atau `pensiun`, dan sebut akibatnya pada set atau bundel yang memuatnya (lihat `terkait_sku`).
6. Untuk tiap calon dikembangkan, tulis rencana gelombang: sumbu perluasan (subjek baru dalam gaya yang sama, ruangan lain, bentuk set, varian warna), 3 karya, bukti yang mendasari, dan tanda yang akan membenarkan gelombang berikutnya.
7. Hitung beban semua usulan terhadap kapasitas; urutkan dan potong sampai muat.
8. Minta keputusan pemilik per baris; catat sebagai KEPUTUSAN.

## Aturan keputusan

- Data terlalu sedikit berarti usulan "tunggu" atau "perbaiki temuan", bukan "hentikan".
- Satu atau dua pesanan bukan dasar pengembangan koleksi penuh; cukup untuk gelombang kecil.
- Produk yang melanggar hak atau memicu klaim dihentikan segera, tanpa menunggu data.
- Produk yang tidak sesuai DNA visual tetapi laku: laporkan apa adanya dan ajukan pertanyaan ke pemilik, apakah DNA yang perlu ditinjau. Jangan disembunyikan.
- Biaya mempertahankan listing (perpanjangan) diambil dari catatan fakta; biasanya kecil, jadi alasan menghentikan lebih sering soal kerapian toko dan fokus.
- Pengembangan dijalankan sebagai proyek baru lewat brief dan perancang koleksi; skill ini hanya menetapkan arah dan ukurannya.

## Format hasil

```
TINJAUAN PORTOFOLIO  rentang: ..  tanggal: ..
| SKU | Umur (hari) | Kunjungan | Favorit | Pesanan | Data | Usulan | Alasan | Tindakan (skill) |
GELOMBANG PENGEMBANGAN
- Dari: SKU ..  Sumbu: ..  3 karya: ..  Bukti: ..  Lanjut bila: ..
Beban: .. jam dari kapasitas ..
KEPUTUSAN pemilik per baris: (menunggu)
```

## Pemeriksaan kualitas

- Tiap usulan punya alasan yang menunjuk angka atau temuan.
- Tidak ada usulan "hentikan" yang hanya berdasar data terlalu sedikit.
- Akibat pada set dan bundel disebut.
- Total beban tidak melebihi kapasitas.

## Penanganan kesalahan

- Katalog dan data tidak cocok (listing tanpa SKU): tinjau yang cocok, daftar yang tidak cocok untuk dirapikan di katalog.
- Semua listing terlalu dini: laporkan demikian; usulkan fokus pada temuan dan koleksi berikutnya.
- Pemilik ingin menghapus banyak listing sekaligus: sarankan `jeda` dulu, karena penghapusan tidak bisa dibatalkan.

## Serah terima

`studio-monthly-strategy-reviewer` menerima keputusan portofolio dan rencana gelombang sebagai bahan prioritas bulan berikutnya.

## Batas kemampuan alat

Usulan sebaik data yang dibaca. Tidak tahu apa yang dilakukan pesaing atau perubahan pencarian Etsy pada rentang itu.

## Contoh penggunaan

Tujuh produk berumur 75 hari. Usulan: kutilang satuan dipertahankan (6 pesanan, 310 kunjungan); set 3 dikembangkan dengan gelombang 3 satwa baru; katak pohon direvisi gambar pertamanya (banyak favorit, 0 pesanan, data tipis); dua produk "tunggu" karena kunjungan di bawah 100.

## Contoh kegagalan dan perbaikannya

Gagal: mengusulkan koleksi 12 karya baru karena satu produk terjual dua kali. Perbaikan: turunkan menjadi gelombang 3 karya dengan tanda lanjut yang jelas.

## Cara menguji skill ini

Beri katalog 4 produk: A (90 hari, 600 kunjungan, 12 pesanan), B (90 hari, 450 kunjungan, 40 favorit, 0 pesanan), C (90 hari, 30 kunjungan), D (20 hari). Hasil benar: A dipertahankan atau dikembangkan dengan gelombang 3 karya, B direvisi dengan satu perubahan sebagai eksperimen, C "perbaiki temuan" bukan dihentikan, D "terlalu dini", dan semua menunggu keputusan pemilik.
