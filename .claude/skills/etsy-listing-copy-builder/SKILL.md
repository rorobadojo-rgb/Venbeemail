---
name: etsy-listing-copy-builder
description: Menulis judul, deskripsi, dan informasi produk listing Etsy dalam bahasa Inggris untuk wall art digital secara akurat, selaras dengan isi paket, panduan cetak, dan kewajiban menyebut bantuan AI. Pakai saat pemilik berkata "tulis judul", "buatkan deskripsi listing", "copy untuk Etsy", "perbaiki deskripsi ini", "kenapa pembeli masih bingung?", atau setelah isi produk, harga, dan bank keyword tersedia. Menghasilkan berkas paket listing (listing.json) dan teks siap tempel. Jangan dipakai untuk memilih tag dan atribut atau menerbitkan listing.
---

# etsy-listing-copy-builder

Menulis teks yang ditemukan pencarian dan dipahami manusia, tanpa menjanjikan apa pun yang tidak ada di dalam paket. Skill ini pemilik judul dan deskripsi, serta pembuat berkas paket listing yang nantinya dilengkapi dan diperiksa skill lain.

Sebelum mulai, baca `references/studio-core.md`. Kerangka deskripsi dan aturan judul: `references/kerangka-listing.md`. Berkas paket listing: `assets/listing-template.json`.

## Kapan digunakan

- Menyiapkan listing baru.
- Memperbaiki listing yang sering memicu pertanyaan atau salah paham.
- Isi paket, harga, atau syarat pemakaian berubah.

## Kapan tidak digunakan

- Tag, kategori, atribut (`etsy-tag-attribute-mapper`).
- Pemeriksaan akhir dan penerbitan.

## Input

- Wajib: lembar penawaran (isi produk dan syarat pemakaian), dan daftar file akhir dari manifest paket.
- Opsional: bank keyword, panduan cetak, harga yang diputuskan pemilik, profil pembeli (tiga pertanyaan pembeli), catatan generasi (apakah karya dibantu AI), catatan fakta Etsy.

## Default

- Bahasa Inggris Amerika, kalimat pendek, tanpa huruf besar semua.
- Judul: mulai dengan apa barangnya, memakai 2-3 frasa keyword terkuat, dalam batas karakter di catatan fakta.
- Karya yang dibuat dengan alat AI diberi `ai_assisted: true` dan kalimat penyebutannya di deskripsi.
- Tanpa bank keyword: judul ditulis dari deskripsi produk yang jujur, dan keyword ditandai HIPOTESIS.

## Pertanyaan bila info penting belum ada

1. "Karya ini dibuat dengan bantuan alat AI?" (menentukan kalimat wajib)
2. "Nama toko dan nada tulisan: ramah santai, atau tenang dan rapi?"

## Langkah kerja

1. Kumpulkan fakta produk dari lembar penawaran dan manifest: jumlah file, rasio, ukuran yang layak, syarat pemakaian, yang tidak termasuk. Semua angka di teks berasal dari sini.
2. Pilih keyword dari bank: 2-3 frasa terkuat untuk judul, sisanya disebar wajar di deskripsi.
3. Tulis judul mengikuti `references/kerangka-listing.md`. Hitung karakternya.
4. Tulis deskripsi dengan kerangka: kalimat pembuka, apa yang didapat, ukuran, cara kerjanya, catatan warna, syarat pemakaian, yang tidak termasuk, penyebutan AI bila berlaku, ajakan bertanya.
5. Jawab tiga pertanyaan pembeli dari profil pembeli di dalam deskripsi.
6. Cocokkan dengan panduan cetak: isi paket dan syarat pemakaian harus sama kata demi makna.
7. Isi `listing.json` dari template: judul, deskripsi, harga (bila sudah diputuskan), `digital_files`, `images`, `claims`, `ai_assisted`. Biarkan `tags`, `category`, `attributes` untuk pemeta tag.
8. Simpan di `studio-nangka/proyek/<project_id>/listing/<nama-listing>/listing.json`, tampilkan teks siap tempel, tulis blok serah terima.

## Aturan keputusan

- Tidak ada klaim yang tidak bisa dibuktikan: laku, terbaik, unik, mutu museum, warna pasti sama.
- Tidak menyebut benda yang tidak dijual sebagai produk: "framed", "canvas", "poster shipped". Boleh menyebut "frame not included".
- Kalimat "digital download" dan "no physical item will be shipped" wajib ada.
- Penyebutan AI wajib bila karya dibuat dengan alat AI (lihat catatan fakta Etsy); tulis jujur dan singkat, tanpa meminta maaf dan tanpa menyembunyikan.
- Nama merek, karakter, dan seniman tidak dipakai sebagai keyword.
- Saran Etsy tentang panjang judul bertentangan antarsumber (lihat catatan fakta). Sikap studio: judul jelas dan terbaca lebih dulu, tidak wajib menghabiskan batas karakter. Perubahan sikap ini lewat eksperimen.
- URL listing dibentuk dari judul saat pertama terbit, jadi judul pertama ditulis dengan sungguh-sungguh.

## Format hasil

```
JUDUL (.. karakter, batas ..): ...
DESKRIPSI:
...
CATATAN: keyword yang dipakai dan asalnya; hal yang harus sama dengan panduan cetak
Berkas: .../listing.json (tags, category, attributes menunggu pemeta tag)
```

## Pemeriksaan kualitas

- Jumlah file, rasio, dan ukuran di teks sama dengan manifest dan rencana cetak.
- Judul dalam batas karakter; dua kalimat wajib ada.
- Penyebutan AI ada bila `ai_assisted` benar.
- Tidak ada kata dari daftar berisiko.

## Penanganan kesalahan

- Manifest atau lembar penawaran belum ada: tulis draf dengan tanda `[ISI DARI MANIFEST]`, status `needs_input`; jangan mengisi angka dari perkiraan.
- Harga belum diputuskan: kosongkan `price_usd` dan catat di pertanyaan terbuka.
- Pemilik meminta kata "handmade": jelaskan bahwa itu klaim cara pembuatan yang harus benar; tawarkan kata yang jujur.

## Serah terima

`etsy-tag-attribute-mapper` menerima `listing.json` untuk mengisi tag, kategori, dan atribut.

## Batas kemampuan alat

Tidak bisa menguji kinerja judul di pencarian Etsy. Tidak menerbitkan listing; hasilnya draf.

## Contoh penggunaan

Listing satuan kutilang. Judul 84 karakter: "Tropical Bird Nursery Wall Art, Printable Jungle Animal Print, Neutral Nursery Decor". Deskripsi menyebut 5 file JPG, lima rasio dengan ukurannya, unduhan digital tanpa barang fisik, warna cetak bisa berbeda, pemakaian pribadi, dan "This artwork was created with the help of AI tools and finished by our studio."

## Contoh kegagalan dan perbaikannya

Gagal: deskripsi menyebut "includes 24x36" padahal rencana cetak hanya meloloskan sampai 16x24. Perbaikan: ambil ukuran dari rencana cetak; hapus 20x30 dan 24x36 dari teks dan dari `claims`.

## Cara menguji skill ini

Beri lembar penawaran (5 file, lima rasio, pemakaian pribadi) dan keterangan karya dibantu AI. Hasil benar: judul dalam batas karakter dengan hitungan tertulis, deskripsi memuat "digital download", pernyataan tanpa barang fisik, penyebutan AI, lima rasio yang sama dengan lembar, dan `listing.json` dengan `tags` kosong.
