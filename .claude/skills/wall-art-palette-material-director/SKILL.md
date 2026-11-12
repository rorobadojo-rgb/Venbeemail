---
name: wall-art-palette-material-director
description: Menentukan palet warna, bahan visual, tekstur, dan tingkat kontras untuk satu koleksi atau satu karya wall art, diturunkan dari DNA visual studio dan disesuaikan dengan ruangan. Pakai saat pemilik berkata "warnanya apa?", "buatkan palet", "terlalu ramai", "kurang hidup", "pakai tekstur apa?", "supaya tiga gambar ini serasi", atau sebelum konsep dan prompt dibuat. Menghasilkan kartu palet berisi warna berperan dengan kode hex, proporsi, kontras, dan tekstur, termasuk catatan risiko saat dicetak. Jangan dipakai untuk merumuskan identitas studio secara keseluruhan.
---

# wall-art-palette-material-director

Mengatur hubungan antarwarna dan rasa bahan, supaya sebuah koleksi serasi dan tetap enak setelah dicetak. Skill ini pemilik palet dan bahan visual per koleksi; palet induk tetap milik DNA visual.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/kartu-palet.md`.

## Kapan digunakan

- Koleksi baru akan dibuat.
- Karya terasa tidak serasi atau terlalu ramai.
- Satu koleksi perlu varian warna (misalnya versi netral dan versi hangat).

## Kapan tidak digunakan

- Menentukan aturan tetap studio.
- Mengatur ruang warna file dan ekspor (`wall-art-color-export-manager`).

## Input

- Wajib: `visual-dna.md` (bagian palet induk dan tekstur) dan rencana koleksi atau brief.
- Opsional: profil ruangan, warna terukur dari bacaan referensi, larangan pemilik.

## Default

- Lima sampai tujuh warna per koleksi.
- Proporsi tiga peran: dasar sekitar 60%, tubuh sekitar 30%, aksen sekitar 10% (patokan desain umum, bukan aturan).
- Kontras rendah sampai sedang untuk kamar bayi dan kamar tidur; sedang untuk ruang tamu, dapur, kantor.
- Tekstur kekuatan 1 dari 3 (halus), supaya tidak terlihat kotor saat dicetak kecil.
- Tanpa `visual-dna.md`: palet tetap dibuat dari brief, ditandai sementara.

## Pertanyaan bila info penting belum ada

1. "Ruangan sasaran koleksi ini?"
2. "Lebih ke hangat (krem, terakota, cokelat) atau sejuk (hijau keabuan, biru pudar)?"
3. "Adakah warna yang wajib ada atau wajib dihindari?"

## Langkah kerja

1. Ambil rentang palet induk dari DNA. Palet koleksi harus berada di dalam rentang itu.
2. Pilih warna dasar (latar) lebih dulu, karena menentukan suasana dan paling luas.
3. Tambah 2-3 warna tubuh yang berbeda terang gelapnya, lalu 1-2 aksen.
4. Tulis tiap warna: nama sehari-hari, kode hex, peran, dan tingkat terang (terang, tengah, gelap).
5. Periksa tangga terang gelap: harus ada minimal tiga tingkat yang jelas berbeda. Uji cepat: bayangkan palet diubah menjadi abu-abu; warna tubuh dan dasar tidak boleh menyatu.
6. Tetapkan aturan pembagian antar karya dalam koleksi: warna yang selalu ada di semua karya (pengikat) dan aksen yang boleh berganti tiap karya.
7. Tetapkan bahan dan tekstur: jenisnya (serat kertas, butir halus, goresan kuas kering) dan kekuatan 0-3.
8. Tulis catatan cetak (lihat aturan keputusan).
9. Isi kartu palet dan minta persetujuan pemilik.

## Aturan keputusan

- Warna sangat jenuh atau neon dan warna gelap pekat sering bergeser saat dicetak, karena printer tidak bisa meniru semua warna layar. Batasi pada aksen kecil dan tulis peringatannya.
- Latar putih murni (#FFFFFF) membuat batas karya hilang di kertas; pilih putih gading atau beri tekstur tipis, kecuali pemilik menginginkan sebaliknya.
- Bila palet koleksi keluar dari rentang palet induk, itu usulan perubahan DNA: jangan dipakai diam-diam, kembalikan ke pemilik.
- Warna pengikat minimal dua, supaya set tiga gambar terlihat satu keluarga.
- Kode hex adalah target di layar, bukan janji hasil cetak.

## Format hasil

Kartu palet (template): tabel warna berperan, proporsi, tangga terang gelap, warna pengikat dan aksen bergilir, tekstur, catatan cetak, dan kata-kata palet siap pakai untuk prompt (bahasa Inggris).

## Pemeriksaan kualitas

- Semua warna punya hex dan peran.
- Ada tiga tingkat terang gelap.
- Tidak melanggar larangan DNA.
- Ada catatan cetak.

## Penanganan kesalahan

- Pemilik meminta warna di luar DNA: buat sebagai varian bertanda, jelaskan akibatnya pada konsistensi toko, minta keputusan.
- Tidak ada warna terukur dari referensi: pakai nama dan hex usulan, tandai belum diuji pada gambar.

## Serah terima

`wall-art-concept-divergence` menerima kartu palet sebagai batas warna untuk semua arah konsep.

## Batas kemampuan alat

Tidak bisa memprakirakan hasil cetak di printer tertentu. Tidak melihat warna dinding pembeli.

## Contoh penggunaan

Koleksi satwa tropis kamar bayi: dasar gading hangat #F3EBDD, tubuh hijau zaitun pudar #8A9A6B dan terakota lembut #C98D6B, gelap cokelat tua #4A3B2F untuk garis, aksen kuning kunyit #D9A441. Pengikat: gading dan cokelat tua. Tekstur serat kertas kekuatan 1.

## Contoh kegagalan dan perbaikannya

Gagal: tujuh warna dengan terang yang hampir sama, sehingga gambar terlihat datar saat dicetak hitam putih atau dari jauh. Perbaikan: gelapkan satu warna tubuh dan terangkan dasar sampai ada tiga tingkat.

## Cara menguji skill ini

Minta palet untuk "koleksi dapur botani vintage". Hasil benar: 5-7 warna berkode hex dengan peran, proporsi tiga peran, minimal dua warna pengikat, tekstur dengan kekuatan, dan catatan bahwa hex bukan janji hasil cetak.
