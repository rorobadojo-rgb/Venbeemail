---
name: studio-experiment-planner
description: Mengubah ide atau rencana perubahan menjadi eksperimen terukur untuk studio wall art, baik eksperimen kreatif (gaya, tema, palet) maupun eksperimen listing Etsy (gambar utama, judul, harga, isi bundel). Pakai saat pemilik berkata "mau coba...", "mana yang lebih bagus?", "kalau harganya dinaikkan gimana?", "ganti thumbnail", "tes dua gaya", atau ingin tahu apakah sebuah perubahan berhasil. Menghasilkan kartu eksperimen dengan hipotesis, satu perubahan, ukuran keberhasilan, lama uji, dan catatan faktor pengganggu. Jangan dipakai untuk membaca data toko yang sudah ada.
---

# studio-experiment-planner

Membuat eksperimen kecil yang jujur: satu dugaan, satu perubahan, satu ukuran, dan catatan hal lain yang bisa mengacaukan hasil. Skill ini pemilik rancangan eksperimen dan cara mengukurnya, untuk karya maupun listing.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/kartu-eksperimen.md` dan `assets/eksperimen-register.csv`.

## Kapan digunakan

- Pemilik ingin mencoba arah baru atau mengubah listing dan ingin tahu hasilnya.
- Skill lain menghasilkan HIPOTESIS yang layak diuji.
- Menutup eksperimen yang sudah berjalan (mencatat hasil).

## Kapan tidak digunakan

- Membaca statistik toko tanpa perubahan yang diuji (itu `etsy-performance-data-reader`).
- Keputusan mempertahankan atau menghentikan produk (itu `etsy-portfolio-decision-reviewer`).

## Input

- Wajib: ide atau perubahan yang ingin dicoba.
- Opsional: angka dasar listing (kunjungan, pesanan, favorit), kalender musiman, eksperimen lain yang sedang berjalan.

## Default

- Satu perubahan per eksperimen per listing.
- Lama uji 14 hari, sama panjang dengan masa pembanding sebelumnya.
- Tanpa angka dasar: eksperimen tetap dirancang, tetapi langkah pertama adalah mencatat angka dasar selama 14 hari.

## Pertanyaan bila info penting belum ada

1. "Apa yang ingin Anda ketahui dari percobaan ini?" (lebih banyak klik / lebih banyak pesanan / gaya mana yang disukai)
2. "Listing atau karya mana yang diuji?"
3. "Adakah hal lain yang berubah dalam waktu dekat (diskon, iklan, musim liburan)?"

## Langkah kerja

1. Tulis hipotesis dalam bentuk: "Jika [satu perubahan], maka [ukuran] akan [naik/turun], karena [alasan]."
2. Pilih satu ukuran utama yang cocok dengan perubahan: gambar utama atau judul diukur dengan kunjungan per tayangan bila datanya ada, atau kunjungan; harga dan isi produk diukur dengan pesanan per kunjungan; arah gaya diukur dengan favorit dan kunjungan pada dua karya setara.
3. Tetapkan pembanding: masa sebelum perubahan dengan panjang yang sama, atau dua karya setara yang terbit bersamaan.
4. Daftar faktor pengganggu: musim, diskon, iklan, perubahan lain di listing yang sama, listing baru yang masih dalam masa awal.
5. Tetapkan aturan berhenti dan aturan baca sebelum mulai (lihat aturan keputusan).
6. Isi kartu eksperimen, tambah satu baris di `studio-nangka/register/eksperimen.csv`.
7. Saat menutup: catat angka, faktor pengganggu yang benar terjadi, dan kesimpulan berlabel (didukung / tidak didukung / tidak bisa disimpulkan).

## Aturan keputusan

- Etsy tidak selalu menyediakan uji berdampingan untuk penjual, jadi kebanyakan eksperimen berupa sebelum dan sesudah. Itu lebih lemah; tulis demikian di kartu.
- Angka kecil berarti kesimpulan lemah. Patokan kerja studio (bukan aturan statistik): kurang dari 100 kunjungan per masa uji dibaca sebagai "petunjuk", bukan bukti.
- Dua perubahan pada listing yang sama dalam masa uji membuat hasil "tidak bisa disimpulkan".
- Eksperimen harga yang menaikkan atau menurunkan harga di toko adalah tindakan ke luar: rancang di sini, ubah di toko hanya dengan izin pemilik.
- Jangan pernah menulis "terbukti" untuk satu eksperimen; tulis "didukung oleh satu uji".

## Format hasil

Kartu eksperimen terisi (lihat template) dan satu baris register dengan kolom: `exp_id, tanggal_mulai, tanggal_selesai, objek, hipotesis, perubahan, ukuran_utama, angka_dasar, angka_hasil, faktor_pengganggu, kesimpulan, keputusan_lanjut`.

## Pemeriksaan kualitas

- Hipotesis bisa salah (ada keadaan yang akan membantahnya).
- Hanya satu perubahan.
- Ukuran utama dipilih sebelum data dilihat.
- Faktor pengganggu terisi, walau "tidak ada yang diketahui".

## Penanganan kesalahan

- Pemilik ingin mengubah tiga hal sekaligus: pisahkan menjadi tiga eksperimen berurutan, usulkan urutannya.
- Toko belum punya kunjungan: alihkan ke eksperimen kreatif di luar toko (misalnya dua pin Pinterest) dan catat bahwa hasilnya tidak sama dengan perilaku pembeli Etsy.
- Data hasil tidak lengkap: kesimpulan "tidak bisa disimpulkan", jangan mengisi kekosongan dengan perkiraan.

## Serah terima

`studio-monthly-strategy-reviewer` menerima eksperimen yang ditutup sebagai bahan prioritas bulan berikutnya.

## Batas kemampuan alat

Tidak bisa mengubah listing atau membaca statistik sendiri bila konektor Etsy tidak aktif; pemilik yang menjalankan perubahan dan menyalin angka. Tidak menghitung signifikansi statistik.

## Contoh penggunaan

Pemilik: "Coba ganti gambar utama jadi mockup ruang tamu." Kartu: hipotesis "jika gambar utama diganti dari karya polos ke mockup ruang tamu, kunjungan naik karena pembeli lebih mudah membayangkan"; ukuran utama kunjungan 14 hari; pembanding 14 hari sebelumnya; pengganggu: mendekati musim liburan.

## Contoh kegagalan dan perbaikannya

Gagal: judul, tag, dan harga diubah bersamaan lalu disimpulkan "judul baru berhasil". Perbaikan: tandai "tidak bisa disimpulkan", kembalikan dua perubahan atau jadwalkan uji terpisah.

## Cara menguji skill ini

Beri masukan "mau naikkan harga set 3 dari 9 ke 12 dolar, lihat efeknya". Hasil benar: satu hipotesis yang bisa salah, ukuran utama pesanan per kunjungan, lama uji dan pembanding sama panjang, minimal dua faktor pengganggu, dan pernyataan bahwa perubahan harga di toko menunggu izin pemilik.
