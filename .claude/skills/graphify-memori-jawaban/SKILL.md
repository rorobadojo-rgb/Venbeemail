---
name: graphify-memori-jawaban
description: Memori kerja graphify. Menyimpan hasil tanya-jawab ke graph sebagai berguna, buntu, atau dikoreksi lewat graphify save-result, lalu menyarikan pelajarannya dengan graphify reflect menjadi LESSONS.md, sehingga sesi berikutnya tahu node mana yang sering benar dan pertanyaan mana yang pernah buntu. Pakai saat pengguna berkata "catat jawaban ini", "itu salah, yang benar ...", "pelajaran apa dari tanya-jawab kemarin?", "graph-nya belajar dari koreksi saya", atau setiap kali skill tanya-dokumen selesai menjawab. Jangan dipakai untuk menyimpan preferensi umum pengguna di luar graph, atau untuk mencatat graph yang dibangun, itu tugas graphify-catatan-graph.
---

# graphify-memori-jawaban

Satu pemilik untuk catatan hasil jawaban dan pelajaran graph (`graphify-out/memory/` dan
`graphify-out/reflections/LESSONS.md`, atau padanannya di folder korpus lain).

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Setelah jawaban dari graph: dicatat berguna, buntu, atau dikoreksi.
- Pengguna meminta pelajaran dari tanya-jawab sebelumnya.
- Awal sesi panjang: baca `LESSONS.md` agar tidak mengulang jalan buntu.

## Kapan tidak digunakan

- Mencatat graph yang dibangun: `graphify-catatan-graph`.
- Menyimpan isi dokumen baru: itu masuk korpus, bukan memori.

## Input

- Wajib untuk mencatat: pertanyaan, ringkasan jawaban, hasil (`useful`, `dead_end`, `corrected`).
- Opsional: node yang dipakai, koreksi pengguna, jenis (`query`, `path_query`, `explain`).

## Default

- Graph utama: `--memory-dir graphify-out/memory`. Korpus lain: `--memory-dir graphify-kerja/graph/<id>/graphify-out/memory`.
- Refleksi: setengah umur sinyal 30 hari, minimal 2 jawaban berguna untuk menguatkan sebuah node.

## Pertanyaan bila info penting belum ada

Hanya bila hasilnya tidak jelas: "Jawaban tadi membantu, buntu, atau perlu dikoreksi?"

## Langkah kerja

1. Mencatat:
   `graphify save-result --question "<q>" --answer "<ringkas>" --type query --nodes "<node1>" "<node2>" --outcome useful --memory-dir <dir>`.
   Untuk koreksi: `--outcome corrected --correction "<yang benar>"`.
2. Menyarikan: `graphify reflect --memory-dir <dir> --graph <graph.json>` menulis
   `reflections/LESSONS.md` (node yang sering benar, pertanyaan yang buntu, koreksi).
3. Membaca pelajaran sebelum menjawab pertanyaan sejenis.
4. Laporkan apa yang dicatat atau pelajaran utama (tiga poin).

## Aturan keputusan

- Jawaban dicatat ringkas (satu sampai tiga kalimat); jangan menyimpan data pribadi atau rahasia.
- Koreksi pengguna selalu dicatat; itu sinyal terkuat.
- Pelajaran dari refleksi tetap HIPOTESIS untuk pertanyaan baru; tetap verifikasi ke sumber.

## Format hasil

```
Tercatat: "apa beda Pro dan Kong?" -> useful (node: Paket Pro, Situs Kong)
LESSONS.md: 12 hasil, 2 buntu, 1 koreksi; node andal: "Paket Harga VenbeeMail Pro"
```

## Pemeriksaan kualitas

- Setiap catatan punya pertanyaan, hasil, dan node yang dipakai.
- Tidak ada isi rahasia di jawaban yang dicatat.

## Penanganan kesalahan

- Folder memori belum ada: graphify membuatnya saat `save-result` pertama.
- `reflect` tanpa `--graph`: tetap jalan, tetapi node usang tidak dibuang; sertakan `--graph`.

## Serah terima

Skill layanan: mengembalikan konfirmasi pencatatan atau ringkasan pelajaran ke pemanggil.

## Batas kemampuan alat

Memori hanya bertahan bila folder `memory/` di-commit (di repo ini, `graphify-out/memory/` ikut di-commit).
Refleksi bersifat statistik; tidak memeriksa kebenaran jawaban.

## Contoh penggunaan

Setelah tanya-dokumen menjawab dan pengguna mengoreksi angka kuota, dicatat `--outcome corrected
--correction "kuota 50 pesan, bukan 100"`. Refleksi berikutnya menandai node "Kuota Kotak Masuk"
sebagai pernah dikoreksi.

## Contoh kegagalan dan perbaikannya

Gagal: menyimpan seluruh isi email pelanggan sebagai "jawaban". Perbaikan: catatan selalu ringkas dan
tanpa data pribadi; contoh pelanggan diganti deskripsi umum.

## Cara menguji skill ini

Catat dua jawaban berguna dan satu buntu untuk node yang sama, lalu jalankan refleksi. Hasil benar:
`LESSONS.md` ada, menyebut node tersebut dan pertanyaan yang buntu.
