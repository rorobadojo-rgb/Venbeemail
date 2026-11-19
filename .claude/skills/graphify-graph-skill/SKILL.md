---
name: graphify-graph-skill
description: Membangun graph perpustakaan skill dalam format graphify, gratis dan tanpa LLM, yaitu setiap skill di .claude/skills, file pendukungnya (references, assets, scripts), rujukan antarskill yang ditulis di SKILL.md, serah terima dan pemakaian layanan dari skill-index.json, serta keluarga skill. Hasilnya bisa ditanya dengan graphify explain, path, affected, dan query, dicluster, dan dibuka sebagai peta interaktif. Pakai saat pengguna berkata "petakan semua skill saya", "skill mana saling terhubung?", "graph skill", "lihat struktur keluarga skill", atau sebelum mencari tumpang tindih, celah, dan dampak perubahan skill. Jangan dipakai untuk dokumen biasa, itu tugas graphify-graph-dokumen, atau untuk kode, itu tugas graphify-bangun-graph-kode.
---

# graphify-graph-skill

Satu pemilik untuk build graph perpustakaan skill (`KRP-skill`). Skill adalah Markdown, yang di
graphify biasa butuh pass semantik; skrip skill ini membacanya secara pasti dari teks sehingga semua
edge `EXTRACTED` dan tidak ada token terpakai.

Sebelum mulai, baca `references/graphify-core.md`.

Skrip skill ini: `scripts/peta_skill.py` (dari akar repo: `.claude/skills/graphify-graph-skill/scripts/peta_skill.py`).

## Kapan digunakan

- Pengguna ingin melihat atau menanyai struktur perpustakaan skill.
- Sebelum `graphify-cari-tumpang-tindih-skill`, `graphify-cari-celah-skill`,
  `graphify-dampak-ubah-skill`, atau `graphify-peta-keluarga-skill` ingin memakai graph.
- Setelah skill ditambah, dihapus, atau diganti nama.

## Kapan tidak digunakan

- Dokumen biasa (PRD, panduan): `graphify-graph-dokumen`.
- Kode skrip di dalam skill sebagai kode: sudah ikut graph kode utama lewat `graphify-bangun-graph-kode`.

## Input

- Opsional: folder skill (default `.claude/skills`), indeks keluarga (default otomatis: semua
  `*/skill-index.json` di akar repo), folder keluaran (default `graphify-kerja/graph/KRP-skill`).

## Default

- `python3 scripts/peta_skill.py --cluster` dari akar repo.
- Salinan aturan inti (`graphify-core.md`, `studio-core.md`) tidak dijadikan node (puluhan salinan
  sama hanya menambah noise); sertakan dengan `--sertakan-inti` bila perlu.

## Pertanyaan bila info penting belum ada

Tidak ada untuk perpustakaan di repo. Untuk skill akun claude.ai (di luar repo): "Bisa unggah berkas
.skill atau ZIP-nya? Saya buka ke folder sementara lalu dipetakan."

## Langkah kerja

1. CLI lewat `graphify-pasang-cli` (dibutuhkan untuk `--cluster` dan untuk bertanya).
2. Jalankan `scripts/peta_skill.py --cluster`. Skrip mencetak jumlah skill, file, keluarga, edge per
   relasi, dan indeks yang dipakai.
3. Beri nama komunitas (opsional, gratis) dengan skill penamaan; komunitas skill biasanya sejajar
   dengan keluarga atau kelompok.
4. Uji satu pertanyaan, misalnya
   `graphify explain "studio-quality-gate" --graph graphify-kerja/graph/KRP-skill/graphify-out/graph.json`.
5. Catat lewat `graphify-catatan-graph` (`--corpus-id KRP-skill --mode skill`).
6. Laporkan angka dan contoh pertanyaan yang kini bisa dijawab.

## Aturan keputusan

- Relasi:
  - `references`: SKILL.md menyebut nama skill lain.
  - `uses`: memakai file sendiri yang disebut di SKILL.md, atau layanan menurut indeks.
  - `hands_off_to`: "next" di indeks.
  - `contains`: keluarga ke skill, dan skill ke file miliknya.
- Nama skill tanpa tanda hubung (misalnya skill resmi `graphify`) tidak dideteksi sebagai rujukan
  teks karena terlalu umum; hubungannya hanya terlihat dari indeks.
- `graphify affected "<skill>"` mengikuti `references` dan `uses`. Untuk serah terima, tambahkan
  `--relation hands_off_to`.

## Format hasil

```
Graph skill: 79 skill, 98 file pendukung, 3 keluarga (2+ skill), 612 edge
edge per relasi: contains 177, hands_off_to 74, references 240, uses 121
cluster-only: berhasil - 12 komunitas | keluaran graphify-kerja/graph/KRP-skill/graphify-out/
```

## Pemeriksaan kualitas

- Jumlah skill sama dengan jumlah folder ber-SKILL.md.
- `graphify explain` atas satu skill mengembalikan koneksi yang sesuai teks SKILL.md-nya.

## Penanganan kesalahan

- Indeks keluarga rusak (JSON tidak sah): skrip melewatinya; laporkan indeks mana yang dilewati.
- graphify tidak ada: graph tetap ditulis; cluster dan pertanyaan menunggu pemasangan CLI.

## Serah terima

```
dari: graphify-graph-skill
korpus: KRP-skill
graph: graphify-kerja/graph/KRP-skill/graphify-out/graph.json
status: selesai
```

Berikutnya sesuai tujuan: `graphify-cari-tumpang-tindih-skill`, `graphify-cari-celah-skill`,
`graphify-dampak-ubah-skill`, atau `graphify-peta-keluarga-skill`. Memakai `graphify-pasang-cli` dan
`graphify-catatan-graph`.

## Batas kemampuan alat

Hanya membaca teks dan indeks; tidak memahami makna deskripsi (itu bagian pemeriksa tumpang tindih).
Skill akun claude.ai yang tidak ada di repo tidak terbaca kecuali diunggah.

## Contoh penggunaan

Repo ini: 45 skill Studio, 33 skill graphify, dan skill resmi graphify. `graphify affected
"studio-brand-memory"` di graph skill menunjukkan lima skill yang merujuknya beserta baris rujukannya.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan `/graphify .claude/skills` agar "lebih pintar"; 124 berkas Markdown dibaca model
(±132 ribu token) dan keluarannya menimpa graph utama. Perbaikan: perpustakaan skill selalu lewat
skrip ini, gratis dan ke folder korpus sendiri.

## Cara menguji skill ini

Tambah satu skill uji yang menyebut `studio-quality-gate`, jalankan skrip, lalu
`graphify explain "studio-quality-gate" --graph ...`. Hasil benar: skill uji muncul sebagai koneksi `references`.
