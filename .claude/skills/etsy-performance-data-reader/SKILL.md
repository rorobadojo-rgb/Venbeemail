---
name: etsy-performance-data-reader
description: Membaca data kinerja toko Etsy (tayangan, kunjungan, favorit, pesanan, pendapatan, sumber kunjungan, kata pencarian) dengan definisi metrik yang benar dan kehati-hatian terhadap angka kecil. Pakai saat pemilik menempelkan statistik toko atau berkas CSV dan berkata "baca data ini", "toko saya gimana?", "listing mana yang bagus?", "kenapa sepi?", "conversion rate saya berapa?", "artinya angka ini apa?", atau sebelum eksperimen, keputusan portofolio, dan tinjauan bulanan. Menghasilkan pembacaan berlabel fakta, pengamatan, dan hipotesis, bukan vonis. Jangan dipakai untuk meramal penjualan atau memutuskan produk dihentikan.
---

# etsy-performance-data-reader

Membaca angka apa adanya: apa yang terukur, apa yang hanya tampak, dan apa yang belum bisa disimpulkan karena datanya terlalu sedikit. Skill ini pemilik pembacaan data toko.

Sebelum mulai, baca `references/studio-core.md`. Definisi metrik dan rumus: `references/definisi-metrik.md`.

## Kapan digunakan

- Ada data toko yang baru (tangkapan layar statistik, CSV pesanan, angka yang diketik pemilik).
- Sebelum merancang eksperimen atau meninjau portofolio.
- Pemilik bingung dengan arti sebuah angka.

## Kapan tidak digunakan

- Toko belum punya data: arahkan ke riset pasar atau eksperimen di luar toko.
- Memutuskan nasib produk (`etsy-portfolio-decision-reviewer`).

## Input

- Wajib: data dan rentang tanggalnya.
- Opsional: katalog (untuk mencocokkan listing dengan SKU), daftar perubahan yang dilakukan di rentang itu, register eksperimen, kalender musiman.

## Default

- Rentang baca 30 hari, dibandingkan dengan 30 hari sebelumnya bila ada.
- Patokan kerja studio untuk angka kecil: kurang dari 100 kunjungan pada sebuah listing dalam rentang berarti "terlalu sedikit untuk disimpulkan".
- Tidak ada pembanding "rata-rata industri"; pembandingnya toko sendiri dari waktu ke waktu.

## Pertanyaan bila info penting belum ada

1. "Data ini untuk rentang tanggal berapa sampai berapa?"
2. "Adakah yang Anda ubah di toko pada rentang itu (harga, gambar, judul, diskon, iklan)?"

## Langkah kerja

1. Catat sumber data, rentang tanggal, dan tanggal diunduh. Tanpa rentang, pembacaan tidak dilanjutkan.
2. Kenali tiap kolom dengan `references/definisi-metrik.md`. Bila nama kolom tidak dikenal, tanyakan; jangan menebak artinya.
3. Hitung turunan yang diperlukan dengan rumus di referensi (misalnya pesanan dibagi kunjungan). Tulis rumus dan angkanya; pakai alat hitung bila ada.
4. Beri tanda kecukupan data pada tiap angka: cukup, tipis, atau terlalu sedikit.
5. Baca tiga tingkat: toko (arah umum), sumber kunjungan (dari mana orang datang), listing (mana yang dilihat, disukai, dibeli).
6. Cocokkan lonjakan atau penurunan dengan daftar perubahan dan kalender musiman. Kecocokan waktu ditulis sebagai HIPOTESIS, bukan sebab.
7. Tulis hasil dalam tiga kelompok: FAKTA (angka terukur), PENGAMATAN (pola yang terlihat), HIPOTESIS (dugaan sebab dan cara mengujinya).
8. Tutup dengan pertanyaan yang layak dijawab berikutnya dan skill yang menjawabnya.

## Aturan keputusan

- Kunjungan dan tayangan tidak dipertukarkan. Tingkat konversi dihitung dari kunjungan, sesuai definisi di referensi.
- Persentase dari angka kecil selalu ditulis bersama angka mentahnya ("2 pesanan dari 40 kunjungan"), dan tidak dibandingkan antarlisting.
- Pendapatan bukan laba. Laba butuh model harga.
- Listing berumur kurang dari 30 hari dibaca terpisah dan tidak dinilai.
- Satu pesanan tidak membuktikan apa pun; satu minggu sepi juga tidak.
- Skill ini tidak menyimpulkan "listing ini gagal". Ia melaporkan apa yang terukur dan apa yang belum.

## Format hasil

```
PEMBACAAN DATA  rentang: .. s.d. ..  sumber: ..  diunduh: ..
TOKO: kunjungan .., pesanan .., pendapatan ..  (pembanding: ..)
SUMBER KUNJUNGAN: ...
LISTING
| SKU / listing | Kunjungan | Favorit | Pesanan | Pesanan/kunjungan | Kecukupan data |
FAKTA: ...
PENGAMATAN: ...
HIPOTESIS (dengan cara uji): ...
Belum bisa disimpulkan: ...
Pertanyaan berikut: ... (skill: ...)
```

## Pemeriksaan kualitas

- Rentang tanggal dan sumber tertulis.
- Tiap persentase disertai angka mentah dan tanda kecukupan.
- Tidak ada kata sebab ("karena") di bagian FAKTA.
- Tidak ada pembanding dari luar toko yang tidak bersumber.

## Penanganan kesalahan

- Data hanya tangkapan layar sebagian: baca yang terlihat, sebut yang tidak terlihat.
- Angka tidak cocok satu sama lain (pesanan lebih banyak dari kunjungan): laporkan sebagai kejanggalan data, minta pemilik mengecek rentang atau sumbernya.
- Format CSV tidak dikenal: minta contoh lima baris pertama dan arti kolom dari pemilik.

## Serah terima

- `studio-experiment-planner` menerima HIPOTESIS yang layak diuji.
- `etsy-portfolio-decision-reviewer` menerima tabel listing untuk ditinjau.
- `studio-monthly-strategy-reviewer` menerima ringkasan toko untuk tinjauan bulanan.

## Batas kemampuan alat

Tidak mengambil data dari Etsy sendiri bila konektor tidak aktif; pemilik mengunduh atau menyalin. Definisi metrik Etsy bisa berubah; cocokkan dengan keterangan di halaman statistik toko.

## Contoh penggunaan

30 hari, toko baru: 240 kunjungan, 3 pesanan. Listing A 110 kunjungan, 9 favorit, 2 pesanan (data tipis); listing B 40 kunjungan, 0 pesanan (terlalu sedikit). PENGAMATAN: 70% kunjungan dari pencarian Etsy. HIPOTESIS: gambar pertama listing A lebih jelas; uji lewat eksperimen gambar pada listing B.

## Contoh kegagalan dan perbaikannya

Gagal: "Listing B gagal, konversinya 0%." Perbaikan: 0 dari 40 kunjungan terlalu sedikit; tulis "belum bisa disimpulkan" dan sarankan menunggu atau memperbaiki kunjungan dulu.

## Cara menguji skill ini

Beri data: listing X 1.000 tayangan, 80 kunjungan, 4 pesanan; listing Y 300 tayangan, 150 kunjungan, 3 pesanan; rentang 30 hari. Hasil benar: pesanan per kunjungan dihitung dari kunjungan (4 dari 80 dan 3 dari 150) dengan angka mentah, X ditandai terlalu sedikit dan Y tipis, tidak ada vonis gagal, dan minimal satu HIPOTESIS dengan cara uji.
