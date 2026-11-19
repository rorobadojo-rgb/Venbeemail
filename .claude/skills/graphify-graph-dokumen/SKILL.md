---
name: graphify-graph-dokumen
description: Membangun graph graphify khusus dokumen (Markdown, teks, PDF, Word, Excel, dan pintasan Google Workspace) seperti PRD, panduan, catatan rapat, riset, dan transkrip, sebagai korpus terpisah yang tidak menimpa graph kode utama. Judul bagian menjadi node, sehingga isi satu bagian bisa diambil dengan graphify section dan hubungan antardokumen terlihat. Pakai saat pengguna berkata "graph-kan dokumen saya", "PRD ini bisa ditanya?", "petakan semua panduan", "hubungkan catatan-catatan ini", atau rencana korpus memilih mode dokumen. Pass semantik memakai token, jadi selalu didahului izin biaya. Jangan dipakai untuk graph kode, itu tugas graphify-bangun-graph-kode, untuk perpustakaan skill, itu tugas graphify-graph-skill, atau untuk menjawab pertanyaan dari graph yang sudah ada, itu tugas graphify-tanya-dokumen.
---

# graphify-graph-dokumen

Satu pemilik untuk build graph dokumen. Dokumen hanya bisa dipetakan lewat pass semantik (model
membaca isinya), jadi skill ini menjaga dua hal: biaya disetujui, dan keluaran tidak menimpa graph utama.

Sebelum mulai, baca `references/graphify-core.md`. Format yang didukung dan extra yang dibutuhkan:
`references/format-dokumen.md`.

## Kapan digunakan

- Rencana korpus memilih mode `dokumen` untuk folder seperti `docs/` atau `studio-wall-art-by-nangka/`.
- Transkrip media sudah siap dan perlu dipetakan.
- Pengguna ingin dokumen bisa ditanya dengan rujukan bagian.

## Kapan tidak digunakan

- Kode: `graphify-bangun-graph-kode`. Kode dan dokumen dalam satu graph: `graphify-bangun-graph-lengkap`.
- Perpustakaan skill (`.claude/skills/`): `graphify-graph-skill` memetakannya gratis tanpa LLM.
- Bertanya ke graph dokumen yang sudah ada: `graphify-tanya-dokumen`.

## Input

- Wajib: folder dokumen, corpus_id (`KRP-dokumen-<slug>`), izin biaya.
- Opsional: jalur (model sesi atau backend API), pola pengecualian tambahan.

## Default

- Keluaran di `graphify-kerja/graph/<corpus_id>/graphify-out/`.
- Jalur model sesi (tanpa API key): jalankan skill resmi dari folder korpus agar keluarannya terpisah:
  `mkdir -p graphify-kerja/graph/<id> && cd graphify-kerja/graph/<id>`, lalu `/graphify <path absolut folder dokumen>`,
  lalu kembali ke akar repo.
- Jalur backend API: `graphify extract <folder> --out graphify-kerja/graph/<id> --backend <nama>`, lalu
  `graphify cluster-only graphify-kerja/graph/<id> --no-label`.

## Pertanyaan bila info penting belum ada

1. "Pakai model sesi Claude (tanpa API key) atau API key sendiri?"
2. Untuk PDF hasil pindai: "PDF ini berisi teks atau hasil foto halaman? Hasil foto lebih mahal dan
   kurang akurat."

## Langkah kerja

1. CLI lewat `graphify-pasang-cli` (extra `pdf` dan `office` sudah dalam pemasangan baku).
2. Perkiraan dan izin lewat `graphify-penjaga-biaya` untuk folder dokumen itu saja.
3. Pastikan pengecualian membuang gambar dan data pribadi di folder dokumen.
4. Jalankan salah satu jalur di bagian Default. Jangan menjalankan `/graphify <folder>` dari akar repo:
   skill resmi menulis ke `./graphify-out/` milik graph utama.
5. Saat skill resmi sampai tahap penamaan komunitas, tulis nama dalam bahasa Indonesia; pada jalur
   backend, penamaan diserahkan ke skill berikutnya.
6. Uji satu pertanyaan: `graphify section "<judul bagian>" --graph graphify-kerja/graph/<id>/graphify-out/graph.json`.
7. Catat lewat `graphify-catatan-graph` (`--mode dokumen --biaya-token N`).
8. Laporkan jumlah dokumen, node, komunitas, token sungguhan, dan contoh bagian yang bisa diambil.

## Aturan keputusan

- Satu korpus dokumen per tujuan; dokumen dengan pemakai berbeda (PRD produk dan panduan studio)
  sebaiknya terpisah agar komunitasnya bermakna.
- Data pribadi atau rahasia: jalur model sesi atau Ollama lokal saja, tidak lewat API pihak ketiga.
- Dokumen yang gagal diekstraksi tidak dianggap selesai; laporkan dan biarkan `--update` mengulangnya.

## Format hasil

```
Graph dokumen KRP-dokumen-prd: 5 dokumen -> X node, Y edge, Z komunitas
Token ±N (izin ±81 ribu) | keluaran graphify-kerja/graph/KRP-dokumen-prd/graphify-out/
Uji: graphify section "Paket Harga" --graph ... -> 1.240 karakter dari docs/pro/prd.md
```

## Pemeriksaan kualitas

- `graphify-out/graph.json` utama tidak berubah (cek waktu ubah atau `git status`).
- Ada izin biaya dan token sungguhan dilaporkan.
- `graphify section` mengembalikan teks untuk setidaknya satu judul.

## Penanganan kesalahan

- Graph utama tertimpa karena salah direktori: kembalikan dengan `git checkout graphify-out/`
  (graph utama di-commit), lalu ulangi dari folder korpus.
- Office tidak terbaca: extra `office` belum ada; pasang lewat skill pemasangan.
- Google Docs berupa pintasan `.gdoc`: butuh `--google-workspace` dan CLI `gws` yang sudah login.

## Serah terima

```
dari: graphify-graph-dokumen
korpus: KRP-dokumen-prd
status: selesai | perlu_tinjau (nama komunitas belum ada)
```

Berikutnya: `graphify-namai-komunitas`. Memakai `graphify-pasang-cli`, `graphify-penjaga-biaya`,
dan `graphify-catatan-graph`.

## Batas kemampuan alat

Hubungan antardokumen dibuat model dan sebagian besar `INFERRED`. Tabel rumit, diagram, dan gambar
di dalam PDF bisa hilang atau terbaca sebagian.

## Contoh penggunaan

`docs/pro/` dan `docs/pro-kong/` (5 berkas Markdown, ±48 ribu kata). Perkiraan ±81 ribu token,
disetujui. Dijalankan dari `graphify-kerja/graph/KRP-dokumen-prd/` dengan `/graphify /home/user/Venbeemail/docs`.

## Contoh kegagalan dan perbaikannya

Gagal: `/graphify docs` dari akar repo. Graph dokumen lebih besar dari graph kode, sehingga
`graphify-out/graph.json` utama tertimpa dan aturan always-on kini menunjuk graph dokumen.
Perbaikan: jalankan dari folder korpus; pulihkan graph utama dari git.

## Cara menguji skill ini

Minta "graph-kan docs/". Hasil benar: pertanyaan izin dengan angka, perintah dijalankan dari folder
korpus terpisah, `graphify-out/` akar tidak berubah, register mencatat korpus dokumen.
