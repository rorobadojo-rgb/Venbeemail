---
name: wall-art-series-collection-builder
description: Merancang koleksi wall art yang serasi sebagai satu keluarga tanpa terlihat seperti salinan satu gambar, lengkap dengan peran tiap karya, matriks variasi, set yang bisa dijual, dan urutan produksi. Pakai saat pemilik berkata "bikin koleksi", "set 3 gambar", "seri baru", "berapa karya yang perlu dibuat?", "koleksi lanjutan", atau setelah niche, profil pembeli, atau momen musiman ditetapkan. Menghasilkan rencana koleksi yang menjadi dasar konsep tiap karya dan isi produk. Jangan dipakai untuk membuat konsep rinci satu karya atau menentukan harga.
---

# wall-art-series-collection-builder

Merencanakan satu keluarga karya: apa yang mengikat mereka, apa yang membedakan tiap anggota, dan bagaimana mereka dijual bersama. Skill ini pemilik rencana koleksi.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/rencana-koleksi.md`.

## Kapan digunakan

- Memulai koleksi baru dari brief, profil pembeli, atau momen musiman.
- Mengembangkan koleksi lanjutan setelah ada keputusan portofolio.
- Menata ulang kumpulan karya lepas menjadi koleksi.

## Kapan tidak digunakan

- Konsep rinci satu karya (`wall-art-concept-divergence`).
- Isi file, variasi listing, dan batas layanan (`wall-art-product-offer-planner`).

## Input

- Wajib: brief (tema, ruangan, jumlah karya) atau keputusan pengembangan koleksi.
- Opsional: tuntutan produk dari profil pembeli, `visual-dna.md`, pustaka motif, tenggat musiman, kapasitas mingguan.

## Default

- Enam karya: satu karya utama, tiga yang membentuk set, dua pelengkap.
- Orientasi sama untuk seluruh koleksi (tegak), supaya mudah digabung.
- Tiap karya berbeda dari karya lain pada minimal dua sumbu dan terikat oleh minimal dua pengikat.
- Kapasitas dari memori merek; satu karya dihitung 3-4 jam dari konsep sampai paket cetak (ASUMSI sampai ada catatan waktu nyata).

## Pertanyaan bila info penting belum ada

1. "Koleksi ini untuk ruangan mana dan suasana apa?"
2. "Lebih penting set yang dijual bersama, atau karya satuan yang berdiri sendiri?"
3. "Ada tenggat?"

## Langkah kerja

1. Tulis gagasan koleksi dalam satu kalimat dan beri `collection_id`.
2. Tetapkan pengikat: hal yang sama di semua karya (dari DNA: perlakuan garis, tekstur, warna pengikat, pola komposisi).
3. Tetapkan sumbu variasi: subjek, susunan, warna aksen, skala, arah hadap.
4. Isi matriks variasi: satu baris per karya dengan nilai tiap sumbu. Periksa tiap pasangan berbeda pada minimal dua sumbu.
5. Beri peran: karya utama (wajah koleksi dan gambar pertama listing), anggota set, pelengkap.
6. Rancang set: karya mana yang berdampingan, urutannya dari kiri ke kanan, dan apa yang membuat set terasa utuh (garis dasar sama, subjek menghadap ke dalam, aksen bergilir).
7. Petakan ke bentuk jual sebagai usulan: satuan, set, bundel koleksi.
8. Susun urutan produksi: karya utama dulu sebagai uji gaya, lalu anggota set, lalu pelengkap. Hitung minggu yang dibutuhkan terhadap kapasitas dan tenggat.
9. Isi template, minta persetujuan pemilik, tulis blok serah terima.

## Aturan keputusan

- Koleksi yang tidak muat dalam kapasitas sebelum tenggat diperkecil jumlahnya, bukan dipercepat mutunya.
- Dua karya yang hanya berbeda warna dihitung sebagai satu karya dengan varian warna; keputusan varian ada di perencana isi produk.
- Karya utama dibuat dan dinilai lebih dulu. Bila gagal di gerbang G3, rencana koleksi ditinjau sebelum sisanya dikerjakan.
- Nama koleksi dan nama karya tidak memakai merek, karakter, atau nama tempat yang dilindungi.
- Bentuk jual di sini adalah usulan; yang memutuskan adalah perencana isi produk dan pemilik.

## Format hasil

Rencana koleksi (template): gagasan, pengikat, sumbu variasi, matriks variasi, peran, rancangan set, usulan bentuk jual, urutan dan jadwal produksi, risiko.

## Pemeriksaan kualitas

- Matriks menunjukkan tiap pasangan berbeda pada dua sumbu atau lebih.
- Minimal dua pengikat tertulis.
- Jadwal dihitung dari kapasitas dan tanggal yang disebut.
- Tiap karya punya `artwork_id`.

## Penanganan kesalahan

- Tema tidak cukup kaya untuk enam karya berbeda: usulkan empat karya, atau lebarkan tema satu tingkat.
- Pemilik ingin 20 karya sekaligus: pecah menjadi koleksi inti 6 dan gelombang lanjutan yang bergantung pada hasil gelombang pertama.
- DNA belum ada: rencana tetap dibuat, pengikat ditandai sementara, dan pembuatan DNA diusulkan sebelum produksi.

## Serah terima

- `wall-art-palette-material-director` membuat kartu palet koleksi.
- `wall-art-concept-divergence` mengerjakan konsep tiap karya, mulai dari karya utama.
- `wall-art-product-offer-planner` menerima usulan bentuk jual.

## Batas kemampuan alat

Rencana belum menjamin gambar-gambarnya akan serasi; itu diperiksa setelah gambar jadi oleh pemeriksa gaya.

## Contoh penggunaan

Koleksi "Satwa Tropis Halaman" untuk kamar bayi: pengikat latar gading, garis cokelat tidak rata, tekstur kertas; variasi subjek (kutilang, tokek, kupu-kupu, capung, katak pohon, siput), susunan, dan aksen. Set 3: kutilang, kupu-kupu, katak pohon. Jadwal 4 minggu pada 6 jam per minggu.

## Contoh kegagalan dan perbaikannya

Gagal: enam karya semuanya burung menghadap kanan di tengah bidang, hanya warnanya berganti. Perbaikan: isi matriks; karena hanya sumbu warna yang berbeda, ganti tiga subjek dan dua susunan.

## Cara menguji skill ini

Minta "koleksi botani untuk dapur, 6 karya, kapasitas 5 jam per minggu". Hasil benar: matriks 6 baris dengan minimal tiga sumbu, dua pengikat, satu karya utama, satu set dengan urutan kiri ke kanan, jadwal dalam minggu yang dihitung dari 5 jam per minggu, dan `artwork_id` berformat benar.
