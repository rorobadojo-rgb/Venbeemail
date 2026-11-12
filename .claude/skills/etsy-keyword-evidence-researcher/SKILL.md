---
name: etsy-keyword-evidence-researcher
description: Mengembangkan keyword bahasa Inggris untuk listing wall art di Etsy dan mencatat bukti, tanggal, sumber, serta ketidakpastian tiap keyword. Pakai saat pemilik berkata "cari keyword", "kata kunci apa yang dipakai pembeli?", "riset SEO Etsy", "orang nyarinya pakai kata apa?", sebelum menulis judul dan tag, atau saat listing sepi dan bahasanya dicurigai tidak cocok dengan cara pembeli mencari. Menghasilkan bank keyword berkelompok dengan bukti, bukan angka volume karangan. Jangan dipakai untuk memilih 13 tag akhir atau menulis judul.
---

# etsy-keyword-evidence-researcher

Mengumpulkan kata yang dipakai pembeli, bukan kata yang dipakai penjual. Skill ini pemilik `studio-nangka/riset/keyword-bank.csv`.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/keyword-bank.csv`.

## Kapan digunakan

- Niche sudah dipilih dan listing akan ditulis.
- Bank keyword lebih dari 90 hari atau koleksi berganti tema.
- Listing mendapat tayangan rendah dan bahasa judulnya ingin diperiksa.

## Kapan tidak digunakan

- Memilih tag akhir, kategori, dan atribut (`etsy-tag-attribute-mapper`).
- Menulis judul dan deskripsi (`etsy-listing-copy-builder`).
- Membuktikan besar pasar.

## Input

- Wajib: niche terpilih atau deskripsi karya (subjek, gaya, ruangan).
- Opsional: profil pembeli, bukti pasar, amatan saran pencarian Etsy dari pemilik, data kata pencarian dari statistik toko sendiri.

## Default

- Bahasa Inggris Amerika.
- Lima kelompok keyword: subjek, gaya, ruangan, momen atau penerima, format produk.
- 30-50 keyword per niche, masing-masing dengan bukti atau tanda "belum ada bukti".

## Pertanyaan bila info penting belum ada

1. "Karya ini paling tepat disebut apa oleh orang awam, dalam tiga kata?"
2. "Bisa ketik [istilah benih] di kotak pencarian Etsy dan kirim saran yang muncul?" (bila Etsy tidak bisa dibuka dari sini)

## Langkah kerja

1. Tulis 5-8 istilah benih dari cara orang awam menyebut karya, bukan istilah studio.
2. Kembangkan tiap benih di lima kelompok. Sertakan frasa panjang (3-5 kata) karena lebih jelas niatnya.
3. Kumpulkan bukti per keyword, sesuai alat yang ada:
   - Saran otomatis kotak pencarian Etsy (PENGAMATAN langsung, paling dekat dengan bahasa pembeli).
   - Kata pencarian di statistik toko sendiri bila toko sudah berjalan (FAKTA untuk toko ini).
   - Google Trends atau Pinterest Trends (arah minat relatif, bukan volume Etsy).
   - Alat pihak ketiga (perkiraan; tulis nama alat dan tanggal).
4. Tulis niat di balik tiap keyword: apa yang sedang dicari orang yang mengetiknya.
5. Tandai keyword bermasalah: nama merek, karakter, seniman, atau klaim yang tidak benar untuk produk ("framed", "canvas" untuk file digital).
6. Hitung panjang karakter tiap keyword, karena tag punya batas panjang (lihat catatan fakta Etsy).
7. Simpan ke bank keyword dan tulis blok serah terima.

## Aturan keputusan

- Tidak ada angka volume pencarian kecuali dari alat bernama dengan tanggal, dan tetap ditulis "perkiraan".
- Keyword harus benar untuk produk. Kata yang menarik tetapi tidak menggambarkan produk dibuang.
- Urutan prioritas bukti: statistik toko sendiri, saran pencarian Etsy, arah minat umum, perkiraan alat.
- Keyword tanpa bukti boleh disimpan berlabel HIPOTESIS; jangan dihapus, jangan diberi peringkat tinggi.
- Ejaan dan istilah mengikuti pembeli AS ("nursery", "gray", "living room").

## Format hasil

Tabel per kelompok: `Keyword | Karakter | Niat | Bukti | Sumber dan tanggal | Keyakinan | Catatan`.

Kolom CSV: `keyword, bahasa, kelompok, jumlah_karakter, niat, bukti, sumber, tanggal, keyakinan, ketidakpastian, status_hak, dipakai_di`.

Ditutup dengan: 10 keyword terkuat buktinya, 5 HIPOTESIS yang layak diuji, dan daftar yang dibuang beserta alasannya.

## Pemeriksaan kualitas

- Tiap keyword punya kelompok, niat, dan jumlah karakter.
- Tidak ada merek, karakter, atau nama seniman di daftar yang dipakai.
- Tidak ada keyword yang menjanjikan benda fisik untuk produk digital.

## Penanganan kesalahan

- Tidak ada akses pencarian: hasilkan daftar berlabel HIPOTESIS seluruhnya, dan beri pemilik 5 istilah untuk diketik di Etsy agar bukti bisa diisi.
- Keyword bagus tetapi lebih dari batas karakter tag: simpan untuk judul dan deskripsi, beri catatan.
- Dua keyword bermakna sama: simpan keduanya, tandai sebagai varian; pemetaan tag yang memilih.

## Serah terima

- `etsy-listing-copy-builder` memakai keyword terkuat untuk judul dan deskripsi.
- `etsy-tag-attribute-mapper` memilih tag, kategori, dan atribut dari bank ini.

## Batas kemampuan alat

Etsy tidak membuka volume pencarian. Semua angka dari luar Etsy adalah perkiraan. Saran otomatis berbeda antarwilayah dan antarwaktu.

## Contoh penggunaan

Niche satwa tropis kamar bayi. Benih: "tropical animal nursery print", "jungle nursery wall art", "safari nursery decor". Hasil 38 keyword di lima kelompok; 9 punya bukti saran Etsy dari amatan pemilik, sisanya HIPOTESIS; "framed" dibuang karena produk digital.

## Contoh kegagalan dan perbaikannya

Gagal: tabel berisi kolom "volume 12.400 per bulan" tanpa sumber. Perbaikan: hapus angka, ganti dengan bukti yang benar-benar ada atau "belum ada bukti".

## Cara menguji skill ini

Minta keyword untuk "poster botani vintage untuk dapur" tanpa akses web. Hasil benar: 30-50 keyword bahasa Inggris di lima kelompok, kolom karakter terisi, semuanya berlabel HIPOTESIS, tidak ada angka volume, dan lima istilah untuk diamati pemilik.
