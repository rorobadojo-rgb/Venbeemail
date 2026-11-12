---
name: wall-art-style-consistency-reviewer
description: Memeriksa apakah sebuah gambar atau satu koleksi wall art sesuai DNA visual studio, sekaligus mendeteksi pengulangan berlebihan antarkarya. Pakai saat pemilik bertanya "sudah sesuai gaya studio belum?", "kok beda sendiri?", "terlalu mirip satu sama lain tidak?", "cek konsistensi koleksi", setelah gambar lolos pemeriksaan cacat, atau sebelum gerbang gambar master. Menghasilkan penilaian per aturan DNA, temuan pengulangan, dan perbaikan yang menunjuk skill pemiliknya. Jangan dipakai untuk mencari cacat teknis gambar atau menulis ulang DNA.
---

# wall-art-style-consistency-reviewer

Menjaga dua hal yang saling tarik: semua karya terasa satu keluarga, tetapi tidak ada dua karya yang terasa salinan. Skill ini pemilik penilaian konsistensi gaya.

Sebelum mulai, baca `references/studio-core.md`.

## Kapan digunakan

- Satu gambar baru akan masuk koleksi.
- Koleksi selesai dan akan diproduksi.
- Toko mulai terlihat campur aduk atau sebaliknya monoton.

## Kapan tidak digunakan

- Cacat teknis seperti jari aneh, tepi rusak, noda (`wall-art-artifact-retouch-reviewer`).
- Mengubah aturan DNA (`wall-art-visual-dna-builder`).

## Input

- Wajib: gambar yang bisa dilihat dan `studio-nangka/memori/visual-dna.md`.
- Opsional: karya lain di koleksi yang sama, kartu palet, rancangan komposisi, laporan cacat.

## Default

- Tanpa `visual-dna.md`: bandingkan dengan karya lain di koleksi saja dan katakan bahwa penilaian terhadap DNA belum bisa dilakukan.
- Pengulangan diperiksa pada empat sisi: komposisi, pose atau bentuk subjek, pembagian warna, kepadatan.

## Pertanyaan bila info penting belum ada

"Gambar ini dinilai sendiri, atau bersama karya lain di koleksinya? Bila bersama, kirim semuanya."

## Langkah kerja

1. Baca aturan tetap (T1 dan seterusnya), rentang variasi, dan larangan (L1 dan seterusnya) dari DNA.
2. Untuk tiap aturan tetap, jawab ya, tidak, atau tidak terlihat, dengan menunjuk bagian gambar.
3. Untuk tiap larangan, jawab dilanggar atau tidak.
4. Periksa apakah variasi berada dalam rentang yang diizinkan.
5. Bila ada beberapa karya: bandingkan berpasangan pada empat sisi pengulangan. Dua karya yang sama pada tiga sisi atau lebih ditandai "terlalu mirip".
6. Periksa kebalikannya: adakah karya yang hanya sama pada satu sisi atau kurang dengan keluarganya (terlalu jauh).
7. Tetapkan hasil dengan aturan keputusan dan tulis perbaikan per temuan.
8. Bila hasil sesuai atau sesuai dengan catatan, minta `studio-quality-gate` menilai gerbang G3.

## Aturan keputusan

- Sesuai: semua aturan tetap ya, tidak ada larangan dilanggar, tidak ada pasangan terlalu mirip.
- Sesuai dengan catatan: paling banyak satu aturan tetap "tidak terlihat" atau satu pasangan mirip pada tiga sisi; tidak ada larangan dilanggar.
- Menyimpang: ada aturan tetap "tidak", larangan dilanggar, atau karya terlalu jauh dari keluarganya.
- Satu koleksi sebaiknya punya minimal satu pembeda nyata per karya (subjek, susunan, atau aksen) dan minimal dua pengikat (dari kartu palet dan DNA).
- Bila aturan yang sama dilanggar tiga karya berturut-turut, mungkin aturannya yang salah: laporkan sebagai usulan tinjau DNA, jangan memaksa gambar.
- Penilaian suka atau tidak suka bukan bagian skill ini.

## Format hasil

```
CEK GAYA  ART-...  v..   terhadap visual-dna v..
| Aturan | Jawaban | Bukti pada gambar |
Larangan dilanggar: ...
Pengulangan (pasangan x-y): komposisi / subjek / warna / kepadatan
Hasil: SESUAI | SESUAI DENGAN CATATAN | MENYIMPANG
Perbaikan: 1) ... (skill: ...)
```

## Pemeriksaan kualitas

- Semua aturan tetap dan larangan dijawab, tidak ada yang dilompati.
- Tiap jawaban menunjuk bagian gambar.
- Temuan pengulangan menyebut pasangan dan sisinya.

## Penanganan kesalahan

- Gambar tidak bisa dilihat: jangan menilai dari deskripsi atau prompt; minta gambar.
- DNA berisi aturan yang tidak bisa dicek: nilai "tidak terlihat" dan laporkan aturannya untuk diperbaiki pemilik DNA.

## Serah terima

- `wall-art-ratio-resolution-planner` menerima karya yang sesuai untuk direncanakan ukuran cetaknya.
- `studio-quality-gate` dipanggil untuk keputusan gerbang G3.

## Batas kemampuan alat

Menilai dari gambar pada ukuran yang ditampilkan; detail halus tekstur mungkin tidak terlihat. Tidak bisa membandingkan dengan seluruh katalog bila hanya sebagian gambar yang diberikan.

## Contoh penggunaan

Enam karya satwa tropis. Temuan: semua aturan tetap ya; karya 2 dan 5 sama pada komposisi, pose, dan pembagian warna (terlalu mirip); karya 6 memakai hijau neon (larangan L1). Hasil menyimpang untuk karya 6, sesuai dengan catatan untuk koleksi; perbaikan: ubah pose karya 5, ganti aksen karya 6.

## Contoh kegagalan dan perbaikannya

Gagal: laporan berbunyi "secara umum konsisten" tanpa tabel. Perbaikan: jawab tiap aturan satu per satu dengan bukti; kesimpulan baru ditulis setelah tabel lengkap.

## Cara menguji skill ini

Beri DNA dengan aturan T1 "latar satu warna polos" dan larangan L1 "tidak ada teks", serta gambar berlatar polos yang memuat tulisan kecil. Hasil benar: T1 ya, L1 dilanggar dengan lokasi tulisan, hasil MENYIMPANG, perbaikan menunjuk pemeriksa cacat atau penulis prompt, dan gerbang G3 tidak dipanggil.
