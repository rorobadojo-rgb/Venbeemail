---
name: wall-art-product-offer-planner
description: Menentukan isi produk wall art digital yang akan dijual, yaitu file dan rasio yang termasuk, bentuk jual satuan, set, atau bundel, variasi, syarat pemakaian, dan batas layanan, lalu memetakannya menjadi daftar listing. Pakai saat pemilik bertanya "dijual satuan atau set?", "isi paketnya apa saja?", "perlu bundel tidak?", "berapa listing dari koleksi ini?", "pembeli boleh minta ukuran lain tidak?", "lisensinya gimana?", atau setelah rencana koleksi dan profil pembeli tersedia. Menghasilkan lembar penawaran per listing. Jangan dipakai untuk menghitung harga atau menulis deskripsi.
---

# wall-art-product-offer-planner

Memutuskan apa yang sebenarnya dibeli orang: file apa, untuk ukuran apa, dengan hak pakai apa, dan apa yang tidak termasuk. Semua skill listing berikutnya mengikuti lembar ini. Skill ini pemilik isi produk, variasi, bundel, dan batas layanan.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/lembar-penawaran.md`.

## Kapan digunakan

- Koleksi direncanakan dan perlu diterjemahkan menjadi produk.
- Menambah bentuk jual baru (set, bundel) dari karya yang ada.
- Pesan pembeli menunjukkan isi produk membingungkan.

## Kapan tidak digunakan

- Menghitung harga (`etsy-digital-pricing-modeler`).
- Merancang produk custom dari nol (`wall-art-personalization-designer`); hasilnya masuk ke sini.

## Input

- Wajib: rencana koleksi atau daftar karya yang akan dijual.
- Opsional: tuntutan produk dari profil pembeli, peta pola pesaing, rencana cetak (ukuran yang layak), spesifikasi produk custom, kapasitas.

## Default

- Tiap listing satuan berisi 5 file rasio (2:3, 3:4, 4:5, 11:14, seri A) dan satu panduan cetak.
- Syarat pemakaian: pribadi saja; tidak untuk dijual ulang, dibagikan, atau dipakai pada produk jualan.
- Tidak ada layanan tambahan: tanpa perubahan warna, tanpa ukuran khusus, tanpa cetak fisik.
- Dari koleksi 6 karya: 6 listing satuan dan 1 listing set 3. Bundel koleksi ditunda sampai ada bukti minat.

## Pertanyaan bila info penting belum ada

1. "Dari koleksi ini, mana yang dijual sebagai set?"
2. "Pembeli boleh meminta ukuran di luar daftar? (tidak / ya, gratis / ya, berbayar)"
3. "File boleh dipakai pembeli untuk apa?"

## Langkah kerja

1. Daftar karya dan peran masing-masing dari rencana koleksi.
2. Tetapkan bentuk jual: satuan untuk tiap karya yang kuat berdiri sendiri; set untuk anggota yang dirancang berdampingan; bundel bila ada alasan.
3. Untuk tiap listing, tetapkan isi: rasio dan ukuran yang termasuk (hanya yang layak menurut rencana cetak bila sudah ada; bila belum, tulis "menunggu rencana cetak"), jumlah file, panduan cetak.
4. Hitung jumlah file akhir terhadap batas file per listing di catatan fakta. Set 3 karya dengan 5 rasio berarti 15 gambar: rencanakan penggabungan ke ZIP per karya atau per rasio, dan tulis cara itu.
5. Tetapkan syarat pemakaian dan yang tidak termasuk dengan kalimat yang bisa disalin ke listing.
6. Tetapkan batas layanan: apa yang dijawab ya, apa yang dijawab tidak, dan balasan standar untuk permintaan di luar itu.
7. Periksa tumpang tindih: karya yang dijual satuan dan di dalam set harus jelas hubungannya, supaya pembeli tidak membeli dua kali tanpa sadar.
8. Hitung beban: jumlah listing dikali biaya listing dan jam kerja, bandingkan dengan kapasitas dan anggaran.
9. Isi lembar penawaran per listing dan minta persetujuan pemilik.

## Aturan keputusan

- Yang dijanjikan harus bisa dipenuhi file yang ada. Ukuran yang belum lolos hitungan tidak dijanjikan.
- Tiap listing menjawab empat hal tanpa ragu: apa yang didapat, untuk ukuran apa, boleh dipakai untuk apa, apa yang tidak termasuk.
- Lebih sedikit listing yang jelas lebih baik daripada banyak listing yang saling memakan. Bila kapasitas hanya cukup untuk separuh, dahulukan karya utama dan set.
- Variasi di dalam satu listing digital dipakai hanya bila toko mendukung berkas berbeda per variasi; ini aturan Etsy yang harus dicek, jadi default studio adalah listing terpisah.
- Pemakaian komersial oleh pembeli tidak ditawarkan kecuali hak bahan karya itu `cleared` tanpa syarat dan pemilik memutuskannya.

## Format hasil

Lembar penawaran per listing (template), dan tabel ringkas: `Listing | Bentuk | Karya | Isi file | Ukuran | Syarat | Catatan`.

## Pemeriksaan kualitas

- Tiap listing punya empat jawaban di atas.
- Jumlah file akhir tiap listing tidak melebihi batas, atau cara penggabungannya tertulis.
- Hubungan satuan dan set tertulis.
- Tidak ada janji layanan yang tidak sanggup dipenuhi kapasitas.

## Penanganan kesalahan

- Rencana cetak belum ada: isi ukuran ditandai sementara; lembar berstatus `needs_input` untuk bagian itu.
- Pemilik ingin menawarkan "ukuran apa pun": hitung dulu dengan perencana rasio; tawarkan hanya yang lolos.
- Set membutuhkan lebih banyak file daripada batas: pakai ZIP per karya, dan pastikan panduan cetak menjelaskannya.

## Serah terima

- `etsy-digital-pricing-modeler` menerima daftar listing dan bentuk jualnya untuk dimodelkan harganya.
- `wall-art-ratio-resolution-planner` menerima daftar rasio dan ukuran yang harus disediakan.

## Batas kemampuan alat

Tidak tahu fitur variasi dan batas file Etsy saat ini kecuali dari catatan fakta. Tidak bisa memprakirakan bentuk jual mana yang lebih laku.

## Contoh penggunaan

Koleksi satwa tropis: 6 listing satuan (5 rasio + panduan), 1 listing set 3 (tiga ZIP, satu per karya, masing-masing berisi 5 rasio, ditambah panduan: 4 file). Syarat pemakaian pribadi. Tidak melayani ukuran khusus; balasan standar disiapkan.

## Contoh kegagalan dan perbaikannya

Gagal: listing set menjanjikan "15 file terpisah" padahal batas 5 file per listing. Perbaikan: ubah menjadi tiga ZIP per karya dan panduan; tulis jelas di lembar dan teruskan ke panduan cetak.

## Cara menguji skill ini

Beri rencana koleksi 6 karya dengan satu set 3. Hasil benar: 7 lembar penawaran, tiap lembar memuat isi file, ukuran, syarat pemakaian, dan yang tidak termasuk; listing set menjelaskan cara 15 gambar dimuat dalam batas file; dan tidak ada angka harga.
