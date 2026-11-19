---
name: graphify-transkrip-media
description: Mentranskripsi video dan audio lokal (mp4, mov, webm, mp3, wav, m4a) dengan faster-whisper di mesin sendiri agar isinya bisa masuk graph graphify sebagai dokumen, termasuk memilih model Whisper, menulis petunjuk domain agar istilah teknis benar, dan memisahkan video tanpa suara. Pakai saat pengguna berkata "masukkan rekaman rapat ke graph", "transkrip video ini", "graph-kan isi podcast", "video tutorial saya bisa ditanya?", atau saat build menemukan berkas media. Transkripsi lokal tanpa token, tetapi transkripnya ikut pass semantik dan model Whisper perlu diunduh. Jangan dipakai untuk video dari URL, itu tugas graphify-tambah-sumber, atau untuk video animasi tanpa ucapan, yang tidak menghasilkan teks.
---

# graphify-transkrip-media

Satu pemilik untuk transkrip media dan model Whisper yang dipakai. Transkripsi berjalan di mesin
sendiri (tidak ada audio yang dikirim keluar), tetapi butuh waktu dan ruang disk.

Sebelum mulai, baca `references/graphify-core.md`. Pilihan model dan perkiraan waktunya:
`references/model-whisper.md`.

## Kapan digunakan

- Ada rekaman berisi ucapan (rapat, tutorial, wawancara) yang isinya ingin bisa ditanya.

## Kapan tidak digunakan

- Video dari URL (YouTube): `graphify-tambah-sumber` mengunduh audionya lebih dulu.
- Video tanpa ucapan (loop animasi, misalnya `situs-pro-kong/video-mentah/`): tidak ada teks; kecualikan.

## Input

- Wajib: folder atau daftar berkas media, korpus tujuan.
- Opsional: model Whisper (default `base`), bahasa ucapan.

## Default

- Lewat skill resmi: `/graphify <folder> --whisper-model base` menjalankan transkripsi (langkah 2.5)
  sebelum pass semantik. Transkrip disimpan sebagai `.txt` dan diperlakukan sebagai dokumen.
- Variabel yang dibaca transkriptor: `GRAPHIFY_WHISPER_MODEL` dan `GRAPHIFY_WHISPER_PROMPT` (harus di-`export`).

## Pertanyaan bila info penting belum ada

1. "Video ini berisi ucapan atau hanya animasi/musik?"
2. "Utamakan cepat (model base) atau akurat (model medium, lebih lambat)?"

## Langkah kerja

1. Pastikan extra `video` terpasang lewat `graphify-pasang-cli` (unduhan model ratusan MB).
2. Minta izin lewat `graphify-penjaga-biaya`: waktu dan disk untuk transkripsi, token untuk pass
   semantik transkrip.
3. Tulis petunjuk domain satu kalimat dari god node graph yang ada, misalnya
   `"Diskusi produk email sementara VenbeeMail dan situs Kong. Use proper punctuation and paragraph breaks."`,
   lalu `export GRAPHIFY_WHISPER_PROMPT="..."`.
4. Jalankan build dokumen untuk folder media (skill resmi dari folder korpus) dengan
   `--whisper-model <model>`. Berkas yang gagal ditranskripsi dilaporkan dan dilewati.
5. Periksa satu transkrip: istilah penting tertulis benar, tidak kosong.
6. Laporkan jumlah berkas, durasi total bila diketahui, model, dan lokasi transkrip.

## Aturan keputusan

- Model `base` untuk percobaan; `medium` bila istilah teknis banyak salah; `large-v3` hanya untuk
  rekaman penting karena lambat di CPU.
- Video tanpa ucapan dikecualikan lewat `.graphifyignore`, bukan ditranskripsi.
- Rekaman berisi data pribadi orang lain butuh persetujuan pemiliknya sebelum masuk graph.

## Format hasil

```
Transkripsi: 3 berkas (42 menit), model base, petunjuk domain diisi
Gagal: 0 | Transkrip: graphify-kerja/graph/KRP-rapat/graphify-out/... (.txt)
Berikutnya: graph dokumen untuk 3 transkrip (±9 ribu token)
```

## Pemeriksaan kualitas

- Setiap transkrip tidak kosong dan berbahasa yang benar.
- Model dan petunjuk yang dipakai tercatat.

## Penanganan kesalahan

- `TypeError ... metadata_errors`: versi PyAV terlalu baru; graphify 0.9.112 sudah membatasi `av<19`,
  pasang ulang extra `video`.
- Transkrip berulang-ulang atau kacau: audio buruk atau model terlalu kecil; coba `medium`.
- Disk penuh saat mengunduh model: hapus model yang tidak dipakai di cache Hugging Face.

## Serah terima

```
dari: graphify-transkrip-media
status: selesai
```

Berikutnya: `graphify-graph-dokumen` (transkrip dipetakan sebagai dokumen). Memakai
`graphify-pasang-cli` dan `graphify-penjaga-biaya`.

## Batas kemampuan alat

Transkripsi CPU di container cloud lambat (bisa lebih lama dari durasi audio untuk model besar).
Pembicara tidak dibedakan. Teks di layar video tidak dibaca.

## Contoh penggunaan

Tiga rekaman rapat produk (42 menit). Model `base`, petunjuk domain dari god node repo. Transkrip
diperiksa, lalu dipetakan sebagai korpus `KRP-rapat` lewat graph dokumen.

## Contoh kegagalan dan perbaikannya

Gagal: mentranskripsi tujuh loop animasi di `situs-pro-kong/video-mentah/`; hasilnya teks kosong atau
halusinasi "Terima kasih telah menonton". Perbaikan: tanyakan isi video dulu; video tanpa ucapan dikecualikan.

## Cara menguji skill ini

Beri satu berkas audio pendek berisi ucapan. Hasil benar: extra dicek, izin diminta, petunjuk domain
di-export, transkrip tidak kosong, dan langkah berikutnya graph dokumen.
