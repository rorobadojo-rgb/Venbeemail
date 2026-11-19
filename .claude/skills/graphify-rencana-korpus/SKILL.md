---
name: graphify-rencana-korpus
description: Merencanakan graph graphify sebelum dibangun, yaitu folder yang masuk dan keluar, mode build (kode gratis, lengkap, dokumen, skill, atau gabungan), lokasi keluaran, corpus_id, dan perkiraan biaya. Pakai saat pengguna berkata "mau bikin graph untuk ...", "graph-kan folder ini", "sebaiknya satu graph atau beberapa?", "dokumen PRD dan kode digabung atau dipisah?", atau sebelum build pertama di repo atau folder baru. Menghasilkan rencana tertulis di graphify-kerja/rencana/ yang lalu dinilai gerbang G1. Jangan dipakai untuk menulis pola .graphifyignore, itu tugas graphify-atur-pengecualian, atau untuk langsung membangun graph, itu tugas skill build.
---

# graphify-rencana-korpus

Satu pemilik untuk ruang lingkup, mode, dan lokasi tiap graph. Rencana yang jelas mencegah tiga
kesalahan mahal: graph penuh sampah, token terbuang untuk folder yang tidak perlu, dan graph yang
saling menimpa di folder keluaran yang sama.

Sebelum mulai, baca `references/graphify-core.md`. Template rencana: `assets/rencana-korpus.md`.

## Kapan digunakan

- Graph pertama untuk sebuah folder atau tujuan baru.
- Pengguna ragu menggabung atau memisah kode, dokumen, dan skill.
- Lingkup graph lama ingin diubah besar-besaran.

## Kapan tidak digunakan

- Pola pengecualian rinci: `graphify-atur-pengecualian`.
- Membangun: `graphify-bangun-graph-kode`, `graphify-bangun-graph-lengkap`, `graphify-graph-dokumen`,
  atau `graphify-graph-skill`.

## Input

- Wajib: tujuan graph dalam satu kalimat ("supaya PRD bisa ditanya", "supaya struktur kode terlihat").
- Opsional: folder yang dimaksud, batas token, apakah graph akan di-commit.

## Default

- Graph utama repo `KRP-repo` = kode saja (gratis) di `graphify-out/`.
- Dokumen besar dan perpustakaan skill dijadikan korpus terpisah di `graphify-kerja/graph/<corpus_id>/`.
- Gambar dan video tidak masuk kecuali tujuan menuntutnya.

## Pertanyaan bila info penting belum ada

Paling banyak dua, dengan pilihan:

1. "Graph ini untuk kode, dokumen, skill, atau semuanya?"
2. "Batas biaya: gratis (kode saja), sampai ±100 ribu token, atau tanpa batas?"

## Langkah kerja

1. Tulis tujuan dan pemakai graph (manusia lewat HTML/wiki, agen lewat query/MCP).
2. Pilih mode:
   - `kode`: tujuan struktural, tanpa biaya.
   - `dokumen`: Markdown/PDF/Office, butuh pass semantik.
   - `lengkap`: kode dan dokumen dalam satu graph, untuk hubungan dokumen ke kode.
   - `skill`: perpustakaan skill (skrip `peta_skill.py`, tanpa LLM).
   - `gabungan`: beberapa graph yang sudah ada digabung.
3. Tentukan corpus_id (`KRP-<slug>`) dan lokasi keluaran sesuai aturan inti bagian 5. Pastikan id
   belum dipakai di register lewat `graphify-catatan-graph` (`catat_graph.py daftar`).
4. Daftar folder masuk dan folder keluar. Folder data pribadi selalu keluar.
5. Untuk mode dengan pass semantik, minta perkiraan dan izin lewat `graphify-penjaga-biaya`.
6. Isi `assets/rencana-korpus.md` dan simpan ke `graphify-kerja/rencana/<corpus_id>.md`.
7. Minta penilaian G1 ke `graphify-gerbang-mutu`.

## Aturan keputusan

- Ragu antara satu atau dua graph: pisahkan. Menggabung nanti mudah (`graphify-gabung-graph`);
  memisahkan graph yang terlanjur tercampur butuh build ulang.
- Dua korpus tidak boleh menulis ke folder keluaran yang sama.
- Mode `lengkap` hanya bila tujuan menuntut hubungan dokumen ke kode; selain itu mode `kode` plus
  graph dokumen terpisah lebih murah.
- Lingkup yang melebihi izin biaya dipersempit, bukan dijalankan sebagian diam-diam.

## Format hasil

Isi template, contoh ringkas:

```
corpus_id: KRP-dokumen-prd
tujuan: PRD VenbeeMail Pro dan Kong bisa ditanya dengan rujukan bagian
mode: dokumen | keluaran: graphify-kerja/graph/KRP-dokumen-prd/
masuk: docs/pro/, docs/pro-kong/ | keluar: gambar referensi (*.png, *.webp)
biaya: ±81 ribu token (ASUMSI), izin pengguna 2026-11-19
```

## Pemeriksaan kualitas

- Setiap folder masuk benar-benar ada (`ls`).
- corpus_id unik dan sah.
- Ada izin biaya bila mode memakai token.

## Penanganan kesalahan

- Folder tidak ada: tanyakan path yang benar, jangan menebak.
- Izin biaya ditolak: turunkan ke mode `kode` atau persempit folder, catat sebagai KEPUTUSAN.

## Serah terima

```
dari: graphify-rencana-korpus
korpus: KRP-dokumen-prd
status: perlu_tinjau (menunggu G1)
berikutnya: graphify-atur-pengecualian
```

Berikutnya: `graphify-atur-pengecualian`. Izin biaya dari `graphify-penjaga-biaya`, hasil G1 dari
`graphify-gerbang-mutu`, dan cek id di register lewat `graphify-catatan-graph` disertakan.

## Batas kemampuan alat

Merencanakan, tidak membangun. Ukuran graph akhir hanya bisa diperkirakan; angka pasti muncul saat build.

## Contoh penggunaan

Pengguna: "Saya mau perpustakaan skill dan dokumen Studio Nangka bisa ditanya." Rencana: dua korpus,
`KRP-skill` (mode skill, gratis) dan `KRP-dokumen-studio` (mode dokumen, folder
`studio-wall-art-by-nangka/` tanpa `dist/`, ±12 ribu token).

## Contoh kegagalan dan perbaikannya

Gagal: graph dokumen dibangun dengan `/graphify docs` sehingga menimpa `graphify-out/` milik graph
kode utama. Perbaikan: lokasi keluaran ditetapkan di rencana; korpus non-utama memakai
`graphify extract docs --out graphify-kerja/graph/<id>`.

## Cara menguji skill ini

Minta "graph-kan docs dan .claude/skills". Hasil benar: dua korpus terpisah dengan id, mode, lokasi
berbeda, izin biaya hanya untuk korpus dokumen, dan rencana tersimpan di `graphify-kerja/rencana/`.
