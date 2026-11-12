---
name: etsy-tag-attribute-mapper
description: Memetakan keyword dari bank keyword studio ke tag, kategori, dan atribut listing Etsy sesuai batas dan aturan terkini, lalu memeriksanya dengan skrip. Pakai saat pemilik berkata "pilihkan 13 tag", "tag-nya apa?", "kategori yang benar apa?", "isi atribut", "tag saya kepanjangan", "cek tag ini", atau setelah judul dan deskripsi selesai. Menghasilkan daftar tag berikut alasan tiap tag, kategori, dan atribut, serta hasil pemeriksaan batas. Jangan dipakai untuk mencari keyword baru atau menulis judul.
---

# etsy-tag-attribute-mapper

Tag adalah slot terbatas, jadi tiap slot harus punya tugas. Skill ini memilih isi slot dari keyword yang sudah berbukti dan memastikan semuanya lolos batas. Skill ini pemilik tag, kategori, dan atribut listing.

Sebelum mulai, baca `references/studio-core.md`. Pemeriksa: `scripts/check_tags.py`.

## Kapan digunakan

- `listing.json` sudah berisi judul dan deskripsi.
- Tag lama ingin diperiksa atau diganti.
- Batas tag atau pilihan atribut Etsy berubah.

## Kapan tidak digunakan

- Bank keyword belum ada (`etsy-keyword-evidence-researcher` dulu).
- Menulis judul dan deskripsi.

## Input

- Wajib: bank keyword niche itu dan `listing.json` (judul dan deskripsi).
- Opsional: catatan fakta Etsy (batas tag), daftar kategori dan atribut yang terlihat di formulir listing (dari pemilik), profil pembeli.

## Default

- Batas dari `studio-nangka/fakta/etsy-facts.md`: jumlah tag dan panjang karakter. Bila catatan lebih dari 90 hari, minta `etsy-policy-fact-checker` mengecek dulu.
- Semua slot diisi, dengan frasa beberapa kata.
- Pembagian slot: subjek 3, gaya 2, ruangan 3, momen atau penerima 2, format produk 3. Ini titik awal studio, bukan aturan Etsy.

## Pertanyaan bila info penting belum ada

"Di formulir listing Etsy, kategori dan atribut apa yang ditawarkan untuk produk ini? Kirim tangkapan layarnya." Asisten tidak bisa melihat formulir itu, dan pilihan atribut berbeda per kategori.

## Langkah kerja

1. Ambil batas tag dari catatan fakta.
2. Dari bank keyword, ambil kandidat yang panjangnya dalam batas. Keyword lebih panjang tetap berguna untuk judul dan deskripsi, bukan untuk tag.
3. Isi slot menurut pembagian default, mendahulukan keyword berbukti kuat. Slot sisa boleh diisi HIPOTESIS, diberi tanda.
4. Hindari pemborosan: jangan dua tag yang hanya beda urutan kata; jangan mengulang persis frasa yang sudah menjadi kategori atau atribut, kecuali pemilik menginginkannya.
5. Jalankan `python3 scripts/check_tags.py --file <tags.txt> --title "<judul>" --max-tags <batas> --max-chars <batas>`. Perbaiki sampai `LULUS`.
6. Kategori: pilih yang paling spesifik dan benar untuk produk digital dari daftar yang dikirim pemilik. Tanpa daftar itu, tulis usulan sebagai ASUMSI untuk dicocokkan di formulir.
7. Atribut: isi hanya yang benar untuk karya (warna utama, orientasi, subjek, ruangan, momen). Atribut yang tidak benar dikosongkan.
8. Tulis alasan satu baris per tag, masukkan `tags`, `category`, `attributes` ke `listing.json`, tulis blok serah terima.

## Aturan keputusan

- Tag harus benar untuk produk. Tag yang menarik tetapi menyesatkan dibuang ("framed", "canvas print").
- Tidak ada merek, karakter, atau nama seniman.
- Bukti menentukan urutan prioritas: statistik toko sendiri, saran pencarian Etsy, arah minat umum, perkiraan alat, lalu HIPOTESIS.
- Atribut menggambarkan produk, bukan harapan. Warna yang hanya muncul sebagai aksen kecil bukan "warna utama".
- Skill ini tidak menjanjikan peringkat pencarian dari susunan tag mana pun.
- Pergantian tag pada listing yang sudah berjalan adalah perubahan yang layak dicatat sebagai eksperimen.

## Format hasil

```
TAG  (.. dari .. slot; batas .. karakter; catatan fakta tanggal ..)
| No | Tag | Karakter | Kelompok | Bukti | Alasan |
Hasil skrip: LULUS
KATEGORI: ... (dari formulir / ASUMSI)
ATRIBUT: warna utama .., orientasi .., subjek .., ruangan .., momen ..
```

## Pemeriksaan kualitas

- Skrip menyatakan `LULUS`.
- Tiap tag punya kelompok dan alasan.
- Tidak ada tag yang tidak benar untuk produk.
- Tanggal catatan fakta tertulis.

## Penanganan kesalahan

- Bank keyword tidak ada: jangan mengarang tag berperingkat; buat daftar sementara berlabel HIPOTESIS dan minta riset keyword.
- Banyak keyword bagus melebihi batas karakter: singkatkan tanpa mengubah makna ("nursery wall art" tetap; "tropical animal nursery print" menjadi "tropical nursery art"), lalu cek ulang.
- Kategori dan atribut tidak bisa dilihat: tandai `needs_input` untuk bagian itu; tag tetap diselesaikan.

## Serah terima

`etsy-listing-preflight-reviewer` menerima `listing.json` yang sudah lengkap untuk diperiksa sebelum terbit.

## Batas kemampuan alat

Tidak bisa melihat formulir listing, pilihan kategori, atau atribut terkini di Etsy. Tidak bisa mengukur dampak tag.

## Contoh penggunaan

Listing kutilang kamar bayi: 13 tag antara lain "nursery wall art" (16), "tropical nursery art" (20), "bird nursery print" (18), "printable wall art" (18), "neutral nursery decor" (21, terlalu panjang, diganti "neutral nursery art" 19). Skrip `LULUS`. Kategori ASUMSI menunggu tangkapan layar formulir.

## Contoh kegagalan dan perbaikannya

Gagal: tag "tropical animal nursery wall art printable" (41 karakter) dimasukkan apa adanya. Perbaikan: skrip menandai melebihi batas; pecah menjadi dua tag dalam batas.

## Cara menguji skill ini

1. Jalankan `python3 scripts/check_tags.py "nursery wall art" "this tag is far too long for etsy" "nursery wall art"`. Hasil benar: `TIDAK LULUS` dengan dua masalah, yaitu panjang dan ganda.
2. Beri bank keyword 30 baris dan minta 13 tag. Hasil benar: 13 tag dalam batas, tiap tag berkelompok dan beralasan, skrip `LULUS`, dan kategori ditandai ASUMSI bila formulir tidak diberikan.
