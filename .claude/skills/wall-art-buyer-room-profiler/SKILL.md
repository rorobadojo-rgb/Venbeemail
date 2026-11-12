---
name: wall-art-buyer-room-profiler
description: Memetakan kebutuhan pembeli wall art menurut ruangan, tujuan membeli, dan selera dekorasi, lalu menerjemahkannya menjadi tuntutan produk seperti orientasi, ukuran, jumlah gambar dalam set, suasana warna, dan keberatan yang harus dijawab listing. Pakai saat pemilik bertanya "siapa pembelinya?", "buat ruangan apa?", "ukuran apa yang cocok?", "set berapa gambar?", atau sebelum merancang koleksi dan isi produk untuk ruang tamu, kamar tidur, kamar bayi dan anak, dapur, ruang makan, atau kantor rumah. Jangan dipakai untuk riset angka pasar.
---

# wall-art-buyer-room-profiler

Menjawab pertanyaan sederhana: orang seperti apa menggantung karya ini di dinding mana, dan apa yang mereka butuhkan agar berani membeli. Skill ini pemilik profil pembeli dan ruangan.

Sebelum mulai, baca `references/studio-core.md`. Patokan ruangan: `references/patokan-ruangan.md`.

## Kapan digunakan

- Niche sudah dipilih dan perlu didalami sisi pembelinya.
- Sebelum menentukan jumlah karya, orientasi, dan set.
- Listing terasa tidak menjawab pertanyaan pembeli.

## Kapan tidak digunakan

- Mengukur besar pasar atau mencari keyword.
- Menentukan harga.

## Input

- Wajib: niche atau tema, dan ruangan sasaran.
- Opsional: bukti pasar, ulasan pembeli yang diamati (dari toko sendiri atau amatan umum), profil studio.

## Default

- Pembeli di Amerika Serikat; ukuran dalam inci.
- Dua tujuan beli yang selalu diperiksa: untuk rumah sendiri dan untuk hadiah.
- Tanpa data pembeli nyata, seluruh profil berlabel HIPOTESIS.

## Pertanyaan bila info penting belum ada

1. "Ruangan mana yang dituju karya ini?"
2. "Lebih mungkin dibeli untuk diri sendiri atau sebagai hadiah?"

## Langkah kerja

1. Tulis satu profil per ruangan (paling banyak dua ruangan per putaran).
2. Untuk tiap profil isi enam hal: siapa dan dalam situasi apa; tujuan membeli; dinding dan perabot di sekitarnya; suasana yang dicari; cara mereka mencetak (di rumah, toko cetak, layanan daring); keberatan sebelum membeli.
3. Buka `references/patokan-ruangan.md` dan ambil patokan dekorasi untuk ruangan itu. Patokan ini kebiasaan dekorasi umum, bukan data pasar; tulis sebagai ASUMSI.
4. Terjemahkan menjadi tuntutan produk: orientasi, rasio yang perlu ada, bentuk jual (satuan, set 2, set 3, galeri), suasana warna, hal yang harus dijelaskan di listing.
5. Tandai tiap baris: PENGAMATAN (ada sumbernya), ASUMSI, atau HIPOTESIS.
6. Tulis tiga pertanyaan yang kemungkinan besar diajukan pembeli, untuk dijawab di deskripsi listing.

## Aturan keputusan

- Jangan mengarang persona bernama dengan umur dan gaji; itu terlihat meyakinkan tetapi tidak punya dasar. Tulis situasi dan kebutuhan.
- Karya untuk kamar bayi dan anak: suasana tenang dan ramah, tanpa unsur menakutkan; ini tuntutan produk, tulis tegas.
- Tuntutan produk dari skill ini adalah masukan. Isi produk final diputuskan `wall-art-product-offer-planner`.
- Bila dua ruangan menuntut hal berlawanan, pisahkan menjadi dua varian koleksi, jangan dirata-rata.

## Format hasil

```
PROFIL: [ruangan] - [niche]
Siapa dan situasinya     : ... [label]
Tujuan membeli           : ...
Dinding dan sekitarnya   : ...
Suasana yang dicari      : ...
Cara mencetak            : ...
Keberatan                : ...
TUNTUTAN PRODUK
- Orientasi: ...   - Rasio wajib: ...   - Bentuk jual: ...
- Suasana warna: ...   - Harus dijelaskan di listing: ...
Tiga pertanyaan pembeli: 1) 2) 3)
```

## Pemeriksaan kualitas

- Tiap baris berlabel.
- Tuntutan produk bisa langsung dipakai (menyebut orientasi dan rasio, bukan "ukuran yang pas").
- Tidak ada angka pasar.

## Penanganan kesalahan

- Ruangan tidak disebut: pakai ruangan pertama di profil studio, tandai ASUMSI.
- Pemilik membawa ulasan pembeli asli: pakai sebagai PENGAMATAN, hapus nama dan data pribadi sebelum dicatat.

## Serah terima

- `wall-art-series-collection-builder` memakai tuntutan produk untuk merancang koleksi.
- `wall-art-product-offer-planner` memakai bentuk jual dan rasio wajib.

## Batas kemampuan alat

Tanpa data pembeli nyata, profil adalah dugaan terdidik. Akan membaik setelah toko punya ulasan dan pesan pelanggan.

## Contoh penggunaan

Niche satwa tropis untuk kamar bayi. Tuntutan produk: orientasi tegak, set 3 yang serasi, rasio 4:5 dan 2:3 wajib karena bingkai 8x10 dan 16x20 umum (ASUMSI), suasana lembut, listing harus menjelaskan bahwa ini file digital dan cara mencetaknya.

## Contoh kegagalan dan perbaikannya

Gagal: "Pembeli adalah Sarah, 29 tahun, pendapatan USD 70.000." Perbaikan: ganti dengan situasi ("orang tua baru yang menata kamar bayi sebelum kelahiran, sering membeli sebagai set") berlabel HIPOTESIS.

## Cara menguji skill ini

Minta profil untuk "abstrak modern di atas sofa". Hasil benar: profil ruang tamu berlabel, patokan lebar karya terhadap sofa ditulis sebagai ASUMSI dari patokan dekorasi, tuntutan produk menyebut orientasi dan rasio, serta tiga pertanyaan pembeli.
