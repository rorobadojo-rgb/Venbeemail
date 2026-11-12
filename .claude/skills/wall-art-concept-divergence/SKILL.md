---
name: wall-art-concept-divergence
description: Menghasilkan beberapa arah konsep wall art yang benar-benar berbeda untuk satu karya atau satu koleksi, supaya pemilik memilih dari pilihan nyata dan bukan dari variasi tipis satu ide. Pakai saat pemilik berkata "kasih beberapa ide", "konsepnya apa saja?", "alternatif lain", "bosan, mau yang beda", "mau lihat pilihan dulu", atau sebelum komposisi dan prompt ditulis. Menghasilkan 4-5 arah berjudul dengan gambaran, alasan, perbedaan, dan risiko, lalu mencatat pilihan pemilik. Jangan dipakai untuk menulis prompt atau merancang komposisi rinci.
---

# wall-art-concept-divergence

Membuka pilihan sebelum menyempitkannya. Kegagalan paling umum adalah lima ide yang sebenarnya satu ide dengan warna berbeda; skill ini mencegahnya dengan sumbu pembeda yang jelas. Skill ini pemilik arah konsep yang ditawarkan; pilihannya keputusan pemilik studio.

Sebelum mulai, baca `references/studio-core.md`.

## Kapan digunakan

- Awal pengerjaan satu karya atau tiap karya dalam rencana koleksi.
- Arah yang ada terasa datar atau mirip toko lain.

## Kapan tidak digunakan

- Arah sudah dipilih dan tinggal dikerjakan.
- Membuat variasi kecil dari gambar yang sudah jadi.

## Input

- Wajib: brief atau baris rencana koleksi untuk karya ini.
- Opsional: kartu palet, pustaka motif, `visual-dna.md`, profil ruangan, bacaan referensi.

## Default

- Lima arah: satu aman, satu berani, satu hening, satu gabungan tak terduga, satu bebas.
- Semua arah berada di dalam DNA visual dan kartu palet. Arah yang sengaja keluar diberi tanda "di luar DNA" dan paling banyak satu.
- Tanpa DNA atau palet: arah tetap dibuat dari brief, ditandai sementara.

## Pertanyaan bila info penting belum ada

1. "Karya ini untuk ruangan dan suasana apa?" (bila brief tidak menyebut)
2. "Adakah satu hal yang wajib muncul di gambar?"

## Langkah kerja

1. Tulis inti tugas dalam satu kalimat: subjek, ruangan, suasana.
2. Pilih tiga sumbu pembeda yang paling berpengaruh untuk tugas ini dari daftar: perlakuan subjek (realistis sampai abstrak), jenis susunan (memusat, tepi, pola berulang, potongan dekat), sudut pandang, penekanan palet (warna mana yang dominan), suasana, skala subjek, ada tidaknya latar.
3. Buat arah dengan sengaja menempati titik berbeda pada sumbu itu. Tiap arah harus berbeda dari arah lain pada minimal dua sumbu.
4. Tulis tiap arah: judul kerja, satu kalimat gagasan, tiga baris "yang terlihat", mengapa cocok dengan ruangan dan pembeli, motif dan warna yang dipakai (rujuk nomor motif dan kartu palet), dan risikonya.
5. Buat tabel sumbu untuk membuktikan perbedaannya.
6. Beri satu saran pilihan beserta alasan, lalu minta pemilik memilih atau menggabungkan dua arah.
7. Catat pilihan sebagai KEPUTUSAN pemilik dan tulis blok serah terima.

## Aturan keputusan

- Dua arah yang hanya berbeda pada satu sumbu digabung atau salah satunya diganti.
- Arah tidak boleh bergantung pada meniru satu referensi tertentu, karakter, atau merek.
- Arah untuk kamar bayi dan anak harus ramah dan tenang.
- Skill ini menawarkan dan menyarankan; yang memilih adalah pemilik. Bila pemilik berkata "terserah", pakai arah yang disarankan dan catat sebagai ASUMSI yang perlu dikonfirmasi.
- Tidak ada klaim "paling laku"; alasan berupa kecocokan dengan brief dan profil.

## Format hasil

```
INTI TUGAS: ...
Sumbu pembeda: A ..., B ..., C ...

ARAH 1 - [judul]  (aman)
Gagasan: ...
Yang terlihat: 1) ... 2) ... 3) ...
Cocok karena: ...
Motif dan warna: MOT-.., palet ...
Risiko: ...

| Arah | Sumbu A | Sumbu B | Sumbu C |
Saran: Arah .. karena ...
KEPUTUSAN pemilik: (menunggu)
```

## Pemeriksaan kualitas

- Minimal tiga arah, tiap pasangan berbeda pada dua sumbu (lihat tabel).
- Tiap arah punya risiko.
- Tidak ada arah yang melanggar larangan DNA tanpa tanda.

## Penanganan kesalahan

- Brief terlalu sempit sehingga arah tidak bisa berbeda: katakan demikian dan usulkan melonggarkan satu batasan.
- Pemilik menyukai dua arah: boleh digabung bila tidak bertentangan pada sumbu susunan; bila bertentangan, jadikan dua karya.

## Serah terima

- `wall-art-reference-fusion-director` bila arah terpilih memakai lebih dari satu referensi.
- `wall-art-composition-director` bila arah terpilih langsung disusun tanpa sintesis referensi.

## Batas kemampuan alat

Arah berupa kata, bukan gambar. Rasa visualnya baru terlihat setelah gambar uji dibuat.

## Contoh penggunaan

Karya 1 koleksi satwa tropis kamar bayi. Lima arah antara lain: "Kutilang di dahan" (aman, memusat, subjek sedang), "Mata kecil di balik daun" (potongan dekat, subjek sebagian tersembunyi), "Barisan tiga" (pola berulang kecil), "Siluet senja" (hampir abstrak, dua warna). Pemilik memilih arah pertama dengan latar dari arah keempat.

## Contoh kegagalan dan perbaikannya

Gagal: lima arah semuanya "burung di dahan" dengan warna latar berbeda. Perbaikan: isi tabel sumbu; karena hanya sumbu palet yang berbeda, ganti tiga arah dengan susunan dan perlakuan subjek yang lain.

## Cara menguji skill ini

Minta konsep untuk "poster daun monstera untuk ruang tamu". Hasil benar: 4-5 arah berjudul, tabel sumbu yang menunjukkan tiap pasangan berbeda pada minimal dua sumbu, risiko per arah, satu saran beralasan, dan baris KEPUTUSAN pemilik yang masih menunggu.
