---
name: wall-art-image-prompt-engineer
description: Menulis prompt pembuatan atau pengeditan gambar wall art yang disesuaikan dengan alat yang dipakai (Higgsfield, Artlist, Midjourney, atau alat AI lain), dan menjalankannya bila alat terhubung serta pemilik mengizinkan pemakaian kredit. Pakai saat pemilik berkata "buatkan prompt", "generate gambarnya", "prompt Midjourney untuk ini", "perbaiki bagian ini", "bikin versi lain", "perbesar gambarnya", atau setelah rancangan komposisi selesai. Menghasilkan prompt siap tempel, prompt perbaikan, dan catatan generasi yang bisa dilacak. Jangan dipakai untuk memilih konsep, palet, atau komposisi.
---

# wall-art-image-prompt-engineer

Menerjemahkan keputusan kreatif yang sudah diambil (konsep, palet, motif, komposisi) menjadi kata yang dipahami alat gambar, lalu mencatat apa yang dibuat dengan apa. Skill ini pemilik prompt dan catatan generasi.

Sebelum mulai, baca `references/studio-core.md` (bagian 6 hak bahan, bagian 7 izin tindakan). Panduan per alat: `references/panduan-alat.md`. Catatan generasi: `assets/catatan-generasi.csv`.

## Kapan digunakan

- Rancangan komposisi sudah ada dan gambar akan dibuat.
- Laporan cacat meminta perbaikan lewat prompt edit.
- Gambar perlu diperbesar atau latarnya diperluas.

## Kapan tidak digunakan

- Keputusan kreatif belum diambil (kembali ke skill konsep atau komposisi).
- Membuat mockup ruangan (`wall-art-mockup-art-director`).

## Input

- Wajib: rancangan komposisi, dan alat yang akan dipakai.
- Opsional: kartu palet (kata palet), kartu motif (kata prompt), peta peran referensi, laporan cacat, paket langganan alat.

## Default

- Rasio master 2:3 tegak, resolusi tertinggi yang disediakan alat.
- Gambar uji 2-4 buah lebih dulu sebelum jumlah besar.
- Yang dibuat adalah karya datar memenuhi bidang: tanpa bingkai, tanpa dinding, tanpa tepi kertas, tanpa teks, tanpa tanda tangan, tanpa tanda air.
- Bila alat tidak disebut: tulis prompt inti yang netral alat, ditambah versi Midjourney siap tempel.

## Pertanyaan bila info penting belum ada

1. "Gambar ini dibuat di alat apa?" (Higgsfield / Artlist / Midjourney / lainnya)
2. "Saya jalankan sekarang dengan kredit Anda, atau cukup prompt untuk Anda jalankan sendiri?"

## Langkah kerja

1. Kumpulkan keputusan: subjek, komposisi (fokus, skala, ruang kosong), kata palet, tekstur, cahaya, suasana.
2. Susun prompt inti dalam bahasa Inggris dengan urutan: jenis karya dan teknik tampak, subjek, komposisi, palet, tekstur dan bahan, cahaya, suasana, lalu batasan (yang tidak boleh muncul).
3. Sesuaikan dengan alat memakai `references/panduan-alat.md`. Untuk alat yang terhubung, tanyakan dulu ke alat daftar model dan kemampuannya; jangan menganggap nama model atau parameter dari ingatan.
4. Periksa hak: gambar masukan hanya yang `cleared` atau `restricted` terpenuhi menurut `studio-asset-rights-register`. Tidak ada nama seniman, merek, karakter, atau judul karya dalam prompt.
5. Bila akan dijalankan: tampilkan jumlah gambar, model, dan biaya kredit (tanyakan alat bila ada fitur perkiraan biaya), lalu jalankan hanya sebatas izin pemilik.
6. Simpan hasil ke `studio-nangka/proyek/<project_id>/karya/<artwork_id>/` dan catat tiap generasi di catatan generasi: alat, model, tanggal, prompt, pengaturan, paket langganan, file hasil, ukuran pixel.
7. Daftarkan gambar hasil sebagai bahan baru di register hak (jenis AI), lalu tulis blok serah terima.
8. Untuk perbaikan: tulis prompt edit yang menyebut bagian mana, apa yang diubah, dan apa yang harus tetap.

## Aturan keputusan

- Prompt hanya memuat keputusan yang sudah ada. Bila sesuatu belum diputuskan (misalnya warna aksen), tanyakan atau kembalikan; jangan mengarang.
- Satu perubahan per putaran saat memperbaiki, supaya sebab akibatnya terbaca.
- Ukuran pixel hasil dicatat dari file yang sebenarnya, bukan dari angka yang diminta.
- Pemakaian kredit berbayar adalah tindakan ke luar: butuh izin dan berlaku hanya untuk jumlah yang disebut.
- Memperbesar gambar (upscale) boleh, tetapi catat faktornya; pembesaran menambah pixel, tidak selalu menambah detail.

## Format hasil

```
PROMPT INTI (netral alat)
...
VERSI [alat]
...
BATASAN: no frame, no wall, no border, no text, no signature, no watermark, ...
PENGATURAN: rasio .., jumlah .., model ..
RENCANA UJI: 2-4 gambar, yang dinilai: ...
```

Setelah dijalankan: tabel `file | pixel | model | catatan`, dan baris catatan generasi.

## Pemeriksaan kualitas

- Semua unsur rancangan komposisi muncul di prompt.
- Batasan standar ada.
- Tidak ada nama seniman, merek, atau karakter.
- Tiap gambar hasil punya baris catatan generasi dan ukuran pixel.

## Penanganan kesalahan

- Alat tidak terhubung: berikan prompt siap tempel dan minta pemilik mengirim hasilnya; katakan bahwa belum ada gambar yang dibuat.
- Alat menolak prompt atau hasil melenceng tiga kali: sederhanakan prompt (buang unsur paling tidak penting), jangan menambah kata.
- Teks atau tanda tangan muncul di hasil: catat sebagai cacat, perbaiki dengan prompt edit atau buat ulang.
- Kredit tidak cukup: berhenti, laporkan sisa, jangan beralih ke alat lain tanpa izin.

## Serah terima

`wall-art-artifact-retouch-reviewer` menerima gambar hasil beserta catatan generasinya untuk diperiksa cacatnya.

## Batas kemampuan alat

Alat gambar tidak selalu patuh pada letak, jumlah, dan warna yang diminta, serta lemah dalam menulis teks. Resolusi keluaran tiap alat berbeda dan menentukan ukuran cetak terbesar. Syarat pemakaian komersial bergantung pada alat dan paket.

## Contoh penggunaan

Dari rancangan "Kutilang di dahan": prompt inti menyebut "flat illustration, hand-drawn uneven umber linework, small rounded songbird perched low on a branch, centered lower third, generous empty ivory paper background, muted olive and soft terracotta, tiny turmeric yellow accent, subtle paper grain, soft even light, calm and gentle"; batasan standar; rasio 2:3; uji 4 gambar.

## Contoh kegagalan dan perbaikannya

Gagal: prompt memuat "framed print on a nursery wall", sehingga hasilnya foto bingkai di dinding, bukan karya datar yang bisa dicetak. Perbaikan: hapus kata bingkai dan dinding, tambah "flat artwork filling the entire canvas" dan batasan "no frame, no wall".

## Cara menguji skill ini

Beri rancangan komposisi lengkap dan sebut alat "Midjourney". Hasil benar: prompt inti berbahasa Inggris dengan tujuh unsur berurutan, versi Midjourney dengan rasio 2:3, batasan standar lengkap, tidak ada nama seniman, dan pernyataan jelas bahwa gambar belum dibuat karena alat itu tidak dijalankan dari sini.
