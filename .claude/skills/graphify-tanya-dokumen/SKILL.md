---
name: graphify-tanya-dokumen
description: Menjawab pertanyaan dari graph dokumen graphify (PRD, panduan, catatan, transkrip) dengan rujukan berkas dan judul bagian, memakai graphify query, explain, path, dan section, tanpa membuka seluruh dokumen. Pakai saat pengguna bertanya tentang isi dokumen yang sudah dipetakan, misalnya "apa kata PRD soal harga?", "bagian mana yang membahas onboarding?", "apa hubungan dokumen A dan B?", "rangkum bagian X", atau "cari di dokumen saya". Jawaban memisahkan FAKTA dari isi bagian dengan HIPOTESIS dari edge INFERRED, dan jawaban yang berguna atau buntu dicatat ke memori. Jangan dipakai untuk pertanyaan tentang kode, itu dijawab skill resmi graphify, atau bila graph dokumen belum ada, itu tugas graphify-graph-dokumen.
---

# graphify-tanya-dokumen

Satu pemilik untuk jawaban berbasis graph dokumen. Graph menunjukkan di mana jawabannya; teks bagian
itu sendiri yang menjadi bukti.

Sebelum mulai, baca `references/graphify-core.md`. Pola pertanyaan dan perintah yang cocok:
`references/pola-pertanyaan.md`.

## Kapan digunakan

- Graph dokumen ada di register (mode `dokumen` atau `lengkap`) dan pengguna bertanya isi dokumen.

## Kapan tidak digunakan

- Pertanyaan tentang kode: skill resmi `graphify` (`graphify query`).
- Graph dokumen belum ada: `graphify-graph-dokumen`.

## Input

- Wajib: pertanyaan.
- Opsional: corpus_id (default: graph dokumen terbaru di register), anggaran token jawaban.

## Default

- `--graph graphify-kerja/graph/<id>/graphify-out/graph.json`, `--budget 2000`, `--depth 2`.
- Jawaban dalam bahasa Indonesia; kutipan dokumen dibiarkan dalam bahasa aslinya.

## Pertanyaan bila info penting belum ada

Hanya bila ada lebih dari satu graph dokumen: "Cari di dokumen mana: PRD, panduan studio, atau semua?"

## Langkah kerja

1. Pilih perintah sesuai pola di `references/pola-pertanyaan.md`.
2. Jalankan `graphify query "<pertanyaan>" --graph <g>`; perhatikan kode keluar (3 = nama ambigu,
   pilih kandidat; 4 = tidak ditemukan, ubah kata kunci).
3. Untuk node bagian yang relevan, ambil teksnya: `graphify section "<judul>" --graph <g>`.
4. Susun jawaban: pernyataan dari teks bagian berlabel FAKTA dengan rujukan `berkas#judul`; hubungan
   dari edge `INFERRED` berlabel HIPOTESIS sampai teksnya dibaca.
5. Catat hasil lewat `graphify-memori-jawaban`: berguna, buntu, atau dikoreksi pengguna.

## Aturan keputusan

- Tidak ada bagian yang mendukung: jawab "tidak ditemukan di dokumen yang dipetakan", jangan mengisi
  dari pengetahuan umum tanpa label.
- Jawaban terpotong (`TRUNCATED`): naikkan `--budget` sekali, lalu persempit pertanyaan.
- Graph dokumen lebih tua dari dokumennya (cek tanggal di register dan `git log` berkasnya): sebutkan
  bahwa jawaban mungkin basi.

## Format hasil

```
Jawaban: Paket Pro dijual per bulan dengan tiga tingkat ... (FAKTA, docs/pro/prd.md#Paket Harga)
Terkait: bagian "Kuota Kotak Masuk" disebut berhubungan (HIPOTESIS, edge INFERRED 0,75; belum dibaca)
Sumber yang dibaca: 2 bagian, ±1.800 karakter
```

## Pemeriksaan kualitas

- Setiap FAKTA punya rujukan berkas dan judul bagian yang benar-benar dibaca.
- Tidak ada edge INFERRED yang disajikan sebagai fakta.

## Penanganan kesalahan

- Nama ambigu (kode 3): tampilkan kandidat, pilih yang sesuai konteks, sebutkan pilihannya.
- `section` tidak menemukan judul: pakai format `berkas#judul` atau `graphify explain "<judul>"`.
- Graph rusak atau tidak ada: berhenti, arahkan ke build dokumen.

## Serah terima

Skill ujung: jawaban ke pengguna. Hasil tanya-jawab dicatat lewat `graphify-memori-jawaban`.

## Batas kemampuan alat

Hanya tahu isi dokumen yang ada di graph saat dibangun. Tabel dan gambar di PDF bisa tidak terbaca.
Pencarian kata kunci bekerja paling baik dengan istilah yang memang dipakai dokumen.

## Contoh penggunaan

"Apa beda VenbeeMail Pro dan versi Kong?" query menemukan dua node bagian; section mengambil teks
kedua bagian; jawaban tiga poin dengan rujukan `docs/pro/...` dan `docs/pro-kong/...`; dicatat berguna.

## Contoh kegagalan dan perbaikannya

Gagal: menjawab "dokumen A merujuk dokumen B" dari edge `semantically_similar_to` INFERRED tanpa membaca
keduanya. Perbaikan: buka kedua bagian dengan `section`; bila tidak ada rujukan nyata, sebut "mirip
topik, tidak saling merujuk".

## Cara menguji skill ini

Tanyakan hal yang tidak ada di dokumen. Hasil benar: "tidak ditemukan di dokumen yang dipetakan",
query yang dicoba disebut, dan hasil dicatat sebagai buntu.
