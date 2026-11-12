---
name: wall-art-artifact-retouch-reviewer
description: Memeriksa gambar wall art, terutama hasil AI, untuk mencari cacat visual seperti anatomi aneh, objek nyasar, teks atau tanda tangan palsu, tepi rusak, tekstur berulang, garis putus, noda, dan detail yang hancur saat diperbesar. Pakai saat pemilik berkata "cek gambar ini", "ada yang aneh tidak?", "layak cetak belum?", "periksa hasil generate", setelah gambar dibuat atau diperbesar, dan sebelum pemeriksaan gaya. Menghasilkan daftar cacat berlokasi dengan tingkat keparahan dan perintah perbaikan. Jangan dipakai untuk menilai kesesuaian gaya studio atau menghitung ukuran cetak.
---

# wall-art-artifact-retouch-reviewer

Mencari kesalahan yang akan terlihat jelas setelah dicetak besar dan digantung. Cacat kecil di layar ponsel bisa menjadi alasan ulasan buruk di cetakan 24x36 inci. Skill ini pemilik daftar cacat dan perintah perbaikannya.

Sebelum mulai, baca `references/studio-core.md`. Daftar periksa lengkap: `references/daftar-cacat.md`.

## Kapan digunakan

- Gambar baru dari alat AI, atau setelah diperbesar dan diperluas.
- Sebelum gerbang G3.
- Pembeli melaporkan sesuatu yang aneh pada gambar.

## Kapan tidak digunakan

- Menilai kesesuaian dengan DNA visual (`wall-art-style-consistency-reviewer`).
- Menghitung pixel dan ukuran cetak.

## Input

- Wajib: gambar yang bisa dilihat, sebaiknya file ukuran penuh.
- Opsional: rancangan komposisi, catatan generasi, ukuran cetak terbesar yang direncanakan.

## Default

- Periksa dalam tiga jarak: keseluruhan, per perempat bidang, dan potongan diperbesar di titik fokus serta keempat tepi.
- Ukuran cetak terbesar dianggap 24x36 inci bila belum ditentukan.
- Bila hanya pratinjau kecil yang tersedia, laporan diberi tanda "belum diperiksa pada ukuran penuh".

## Pertanyaan bila info penting belum ada

"Ini file ukuran penuh atau pratinjau? Bila pratinjau, bisa kirim file aslinya atau potongan diperbesar dari bagian subjek dan tepi?"

## Langkah kerja

1. Catat ukuran pixel file yang diperiksa dan dari mana (catatan generasi atau baca langsung).
2. Lihat keseluruhan: komposisi sesuai rancangan, tidak ada benda yang tidak diminta, tidak ada bingkai, dinding, atau tepi kertas.
3. Telusuri dengan `references/daftar-cacat.md`, tujuh kelompok: anatomi dan bentuk, benda nyasar, teks dan tanda, tepi dan sudut, tekstur dan pola, garis dan warna, ketajaman.
4. Bila ada sistem file dan Pillow, buat potongan diperbesar di titik fokus dan keempat sudut untuk dilihat pada skala 100%. Bila tidak, minta pemilik mengirim potongan itu.
5. Catat tiap temuan: lokasi (sembilan petak atau deskripsi), apa yang salah, tingkat (berat, sedang, ringan), dan cara memperbaiki.
6. Tentukan jalur perbaikan tiap temuan: prompt edit, buat ulang, potong saat crop, atau terima.
7. Tetapkan hasil dan tulis blok serah terima.

## Aturan keputusan

- Berat: langsung terlihat atau menyesatkan (anatomi salah pada subjek utama, teks atau tanda tangan palsu, tanda air, benda nyasar besar, tepi rusak yang tidak bisa dipotong). Harus diperbaiki sebelum lanjut.
- Sedang: terlihat pada cetakan besar atau dari dekat (tekstur berulang, garis putus, noda). Diperbaiki, atau diterima pemilik dengan batas ukuran cetak yang lebih kecil.
- Ringan: hanya terlihat bila dicari. Dicatat; boleh diterima.
- Lebih dari tiga temuan berat: sarankan membuat ulang, bukan menambal.
- Bersih berarti "tidak ditemukan pada pemeriksaan ini", bukan jaminan tanpa cacat. Tulis apa yang tidak sempat diperiksa.
- Soal suka atau tidak suka bukan cacat.

## Format hasil

```
CEK CACAT  ART-...  v..   file: ...  pixel: ... x ...   diperiksa pada: ukuran penuh / pratinjau
| No | Lokasi | Temuan | Tingkat | Perbaikan | Jalur |
Belum diperiksa: ...
Hasil: BERSIH | PERLU PERBAIKAN (n berat, n sedang) | BUAT ULANG
```

## Pemeriksaan kualitas

- Ketujuh kelompok cacat dijawab, termasuk yang "tidak ditemukan".
- Tiap temuan punya lokasi dan jalur perbaikan.
- Ukuran file yang diperiksa tertulis.

## Penanganan kesalahan

- Gambar tidak bisa dilihat: jangan menilai dari prompt atau deskripsi; minta gambar.
- File terlalu besar untuk ditampilkan: periksa lewat potongan; sebut bagian yang dicakup.
- Temuan tidak pasti (bentuk ambigu): catat sebagai "perlu dilihat pemilik" dengan lokasinya.

## Serah terima

`wall-art-style-consistency-reviewer` menerima gambar yang bersih atau sudah diperbaiki, beserta laporan cacatnya.

## Batas kemampuan alat

Pemeriksaan visual bisa melewatkan cacat halus, terutama pada pratinjau. Tidak bisa memperbaiki gambar sendiri; perbaikan dikerjakan lewat penulis prompt atau penyunting gambar milik pemilik.

## Contoh penggunaan

Gambar kutilang 2400x3600. Temuan: kaki kanan berjari empat ke depan (berat, tengah-bawah, prompt edit), coretan mirip tanda tangan di kanan bawah (berat, potong atau edit), butir tekstur berpola kotak di latar atas (sedang). Hasil: perlu perbaikan, 2 berat 1 sedang.

## Contoh kegagalan dan perbaikannya

Gagal: laporan "gambar bersih" dari pratinjau 512 pixel. Perbaikan: beri tanda belum diperiksa pada ukuran penuh, minta file asli atau potongan, baru tetapkan hasil.

## Cara menguji skill ini

Beri gambar berisi coretan mirip huruf di sudut dan minta "cek layak cetak". Hasil benar: tabel temuan memuat coretan itu dengan lokasi dan tingkat berat, ketujuh kelompok dijawab, ukuran pixel tertulis, dan hasilnya bukan BERSIH.
