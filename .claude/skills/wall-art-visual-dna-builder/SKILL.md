---
name: wall-art-visual-dna-builder
description: Merumuskan DNA visual Studio Wall Art by Nangka, yaitu aturan visual khas yang bisa diterapkan ulang di semua karya agar toko terlihat seperti satu tangan. Pakai saat pemilik berkata "bikin gaya khas", "supaya konsisten", "identitas visual studio", "gabungkan semua selera saya jadi satu gaya", setelah beberapa referensi dibaca, atau saat karya-karya mulai terlihat seperti dari toko yang berbeda-beda. Menghasilkan file visual-dna.md berisi aturan tetap, rentang variasi, dan larangan yang bisa dicek. Jangan dipakai untuk membuat palet satu koleksi atau konsep satu karya.
---

# wall-art-visual-dna-builder

Menyatukan beberapa selera (abstrak modern, botani, vintage bertekstur, Nusantara tropis, hewan) menjadi satu cara memperlakukan gambar. Kuncinya: DNA didefinisikan pada perlakuan (warna, garis, tekstur, susunan), bukan pada subjek. Subjek boleh berganti; perlakuannya yang membuat orang mengenali studio. Skill ini pemilik `studio-nangka/memori/visual-dna.md`.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/visual-dna-template.md`.

## Kapan digunakan

- Pertama kali merumuskan identitas visual.
- Memperbarui DNA setelah koleksi selesai atau pemilik berubah selera.
- Pemeriksa gaya berulang kali menemukan penyimpangan yang sama.

## Kapan tidak digunakan

- Palet dan bahan untuk satu koleksi (`wall-art-palette-material-director`).
- Motif baru (`wall-art-motif-originality-designer`).
- Menilai satu gambar (`wall-art-style-consistency-reviewer`).

## Input

- Wajib: ringkasan pola dari pembaca referensi (minimal tiga gambar), dan preferensi pemilik dari memori merek.
- Opsional: karya studio yang sudah ada, catatan pemeriksa gaya, larangan dari pemilik.

## Default

- Karya dan foto milik pemilik menjadi dasar utama; referensi luar hanya penunjuk arah.
- DNA versi pertama sengaja longgar: 5 aturan tetap, 4 rentang variasi, 4 larangan. Diperketat setelah ada 6-10 karya.
- Tanpa referensi sama sekali: tulis DNA sementara dari profil estetika studio, tandai seluruhnya HIPOTESIS.

## Pertanyaan bila info penting belum ada

1. "Dari pola yang terbaca, mana yang ingin selalu ada di karya Anda?" (beri 3-4 pilihan dari ringkasan pola)
2. "Apa yang tidak pernah ingin Anda lihat di toko Anda?"
3. "Tiga kata untuk rasa yang ingin ditinggalkan karya Anda?"

## Langkah kerja

1. Baca memori merek dan `studio-brand-memory` untuk preferensi dan larangan yang sudah tercatat.
2. Dari ringkasan pola, pilih sifat perlakuan yang muncul di sebagian besar gambar milik sendiri dan dikonfirmasi pemilik.
3. Tulis tiga kata inti studio.
4. Rumuskan aturan tetap: sifat yang selalu ada. Tiap aturan harus bisa dijawab ya atau tidak dengan melihat gambar ("latar selalu satu warna polos bertekstur kertas halus"), bukan kata sifat ("elegan").
5. Rumuskan rentang variasi: hal yang boleh berubah dan batasnya (subjek, warna aksen, orientasi, kepadatan).
6. Rumuskan larangan: hal yang tidak pernah ada.
7. Tulis keluarga palet induk sebagai rentang (bukan satu palet), perlakuan garis dan bentuk, tekstur, dan pola komposisi.
8. Uji DNA pada tiap arah estetika studio: tulis satu kalimat bagaimana aturan yang sama diterapkan pada karya abstrak, botani, hewan, dan Nusantara tropis. Bila sebuah arah tidak bisa mengikuti aturan, longgarkan aturan atau keluarkan arah itu, dan minta keputusan pemilik.
9. Simpan sebagai versi baru di `visual-dna.md`; versi lama pindah ke bagian riwayat.

## Aturan keputusan

- Aturan yang tidak bisa dicek dengan melihat gambar tidak boleh masuk.
- DNA tidak boleh bisa diringkas sebagai "gaya [nama seniman atau merek]". Bila bisa, ia terlalu dekat dengan sumbernya: ubah minimal dua sifat perlakuan.
- Sifat yang hanya berasal dari referensi `inspiration_only` tidak dijadikan aturan tetap tanpa diubah dan dikonfirmasi pemilik.
- Aturan tetap paling banyak 7. Lebih dari itu membuat karya seragam dan membosankan.
- Perubahan aturan tetap adalah KEPUTUSAN pemilik; skill ini mengusulkan.

## Format hasil

File `visual-dna.md` mengikuti template: kata inti, aturan tetap, rentang variasi, larangan, palet induk, garis dan bentuk, tekstur, komposisi, penerapan per arah estetika, uji tiga detik, riwayat versi.

## Pemeriksaan kualitas

- Tiap aturan tetap berupa kalimat yang bisa dicek ya atau tidak.
- Tidak ada nama seniman, merek, atau karakter.
- Ada penerapan untuk tiap arah estetika studio.
- Versi dan tanggal tertulis.

## Penanganan kesalahan

- Referensi saling bertentangan (separuh minimalis, separuh padat): jangan dirata-rata. Tawarkan dua kandidat DNA dan minta pemilik memilih satu sebagai utama.
- Pemilik ingin semua gaya tanpa batas: jelaskan bahwa toko tanpa benang merah sulit dikenali, lalu usulkan benang merah paling longgar (misalnya hanya palet dan tekstur).

## Serah terima

- `wall-art-palette-material-director` menurunkan palet koleksi dari palet induk.
- `wall-art-motif-originality-designer` membuat motif sesuai perlakuan garis dan bentuk.
- Keputusan pemilik tentang DNA dicatat lewat `studio-brand-memory`.

## Batas kemampuan alat

DNA ditulis dari gambar yang terlihat dan kata pemilik. Tidak bisa menjamin gaya ini tidak mirip gaya orang lain; hanya bisa menjauhkan dari sumber yang diketahui.

## Contoh penggunaan

Dari 7 bacaan referensi: kata inti "tenang, hangat, teliti"; aturan tetap antara lain "latar satu warna terang bertekstur kertas", "paling banyak lima warna per karya", "satu subjek utama, tidak terpotong tepi"; rentang: subjek bebas di antara hewan, tumbuhan, bentuk abstrak; larangan: neon, teks di dalam gambar, bayangan keras.

## Contoh kegagalan dan perbaikannya

Gagal: aturan tetap berbunyi "terlihat mewah dan estetik". Perbaikan: ganti dengan yang bisa dicek, misalnya "ruang kosong minimal sepertiga bidang" dan "tidak lebih dari satu warna jenuh".

## Cara menguji skill ini

Beri ringkasan pola dari tiga bacaan dan minta DNA. Hasil benar: file mengikuti template, tiap aturan tetap bisa dijawab ya atau tidak, paling banyak tujuh aturan tetap, ada penerapan untuk empat arah estetika, dan tidak ada nama seniman.
