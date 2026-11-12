# Pengaturan Ekspor dan Alasannya

Ini praktik umum untuk unduhan cetak yang dicetak pembeli sendiri. Batas angka dari Etsy ada di catatan fakta studio, bukan di sini.

| Pengaturan | Pilihan studio | Alasan |
|---|---|---|
| Format | JPEG | Dibuka semua perangkat dan layanan cetak; ukuran file kecil. |
| Ruang warna | sRGB | Standar layar dan layanan cetak konsumen. File CMYK atau ruang warna lebar sering tampil pudar atau bergeser di perangkat pembeli. |
| Profil warna | sRGB disematkan | Supaya aplikasi tahu cara membaca warnanya. |
| Tag DPI | 300 | Sebagian layanan cetak membaca tag ini untuk menyarankan ukuran. Ketajaman tetap ditentukan jumlah pixel. |
| Kualitas JPEG | 95, turun bertahap sampai 82 | Di atas 90 perbedaan hampir tidak terlihat pada cetakan; di bawah 80 kotak kompresi mulai muncul pada bidang halus. |
| Pembesaran saat ekspor | tidak | Pembesaran biasa hanya menambah pixel. Bila perlu, pakai alat pembesar khusus lalu periksa cacat lagi. |
| Tembus pandang | diratakan di atas putih | JPEG tidak mendukung tembus pandang; kertas juga putih. |

## Kapan menambah PDF

- Pembeli mencetak di toko cetak yang meminta PDF.
- Produk berupa beberapa halaman.

PDF dihitung sebagai file tersendiri terhadap batas jumlah file per listing.

## Warna yang perlu diwaspadai

- Sangat jenuh atau neon: printer tidak bisa menirunya; hasil cetak lebih kusam.
- Hitam pekat dan gelap berdekatan: detail bisa hilang.
- Bidang gradasi halus: bisa bergaris pada kualitas JPEG rendah.

Karena itu panduan cetak untuk pembeli menyebut bahwa warna cetak bisa berbeda dari layar.

## Langkah manual bila skrip tidak bisa dijalankan

Di penyunting gambar apa pun:

1. Potong ke rasio sesuai kotak crop dari rencana.
2. Ubah ukuran ke pixel ekspor dari rencana (jangan lebih besar dari hasil potong).
3. Konversi ke sRGB dan sematkan profilnya.
4. Simpan JPEG kualitas tertinggi yang masih di bawah batas ukuran file; isi resolusi 300.
5. Beri nama `<nama-dasar>_<rasio>_<ukuran terbesar>.jpg`.
