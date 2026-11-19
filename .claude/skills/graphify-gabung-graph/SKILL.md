---
name: graphify-gabung-graph
description: Menggabungkan beberapa graph graphify menjadi satu, misalnya graph kode, graph dokumen, dan graph perpustakaan skill, atau graph dari beberapa repo, dengan graphify merge-graphs, lalu mengelompokkan ulang dan memberi nama komunitas gabungan, serta mengelola graph global lintas project di ~/.graphify lewat graphify global add, list, dan remove. Pakai saat pengguna berkata "gabungkan graph kode dan dokumen", "satu graph untuk semua", "hubungkan dua repo", "graph global semua project saya", atau "--previous agar nama komunitas tidak hilang". Jangan dipakai untuk membandingkan dua versi graph, itu tugas graphify-banding-graph, atau untuk membangun graph sumbernya, itu tugas skill build.
---

# graphify-gabung-graph

Satu pemilik untuk graph gabungan dan graph global. Penggabungan memperlihatkan hubungan yang tidak
terlihat di graph terpisah, misalnya skill yang merujuk berkas kode atau dokumen yang menyebut komponen.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Rencana korpus memilih mode `gabungan`.
- Pertanyaan lintas korpus (kode, dokumen, skill) atau lintas repo.
- Mengelola graph global di `~/.graphify/global-graph.json`.

## Kapan tidak digunakan

- Membandingkan versi: `graphify-banding-graph`.
- Graph sumber belum ada: bangun dulu lewat skill build.

## Input

- Wajib: dua atau lebih path `graph.json`, corpus_id gabungan (`KRP-gabungan-<slug>`).
- Opsional: graph gabungan sebelumnya (untuk `--previous`).

## Default

- `graphify merge-graphs <g1> <g2> [...] --out graphify-kerja/graph/<id>/graphify-out/graph.json`.
- Penggabungan ulang: tambahkan `--previous <graph gabungan lama>` agar id komunitas lama dipakai
  ulang dan nama yang tersimpan tetap cocok.
- Lalu `graphify cluster-only graphify-kerja/graph/<id> --no-label`.

## Pertanyaan bila info penting belum ada

"Graph mana saja yang digabung, dan untuk pertanyaan apa?" (tujuan menentukan apakah gabungan perlu).

## Langkah kerja

1. Pastikan setiap graph sumber lulus audit (sampah ikut tergabung).
2. CLI lewat `graphify-pasang-cli`.
3. Jalankan `merge-graphs` dengan `--out` ke folder korpus gabungan (dan `--previous` bila ada versi lama).
4. `cluster-only --no-label` untuk laporan dan peta.
5. Catat lewat `graphify-catatan-graph` (`--mode gabungan`, catatan berisi daftar sumber).
6. Graph global (opsional): `graphify global add <graph.json> --as <tag>`, `graphify global list`,
   `graphify global remove <tag>`, lokasi `graphify global path`.
7. Laporkan jumlah node per sumber, edge penghubung antarsumber bila ada, dan komunitas baru.

## Aturan keputusan

- Gabungan hanya bila ada pertanyaan lintas korpus; selain itu graph terpisah lebih jelas.
- Graph sumber tidak diubah; gabungan selalu berkas baru.
- Id node yang sama di dua graph dianggap node yang sama. Graph skill buatan skrip memakai id
  `skill_*` dan `file_*`, sehingga tidak bertabrakan dengan id graph kode.
- Graph global hanya di mesin sendiri (di sesi cloud hilang saat container baru).

## Format hasil

```
Gabungan KRP-gabungan-repo-skill: KRP-repo (835) + KRP-skill (300) -> 1.135 node, Z komunitas
Edge antarsumber: N (contoh: skill -> berkas skrip yang sama)
Keluaran: graphify-kerja/graph/KRP-gabungan-repo-skill/graphify-out/graph.json
```

## Pemeriksaan kualitas

- Jumlah node gabungan tidak lebih dari jumlah node sumber (sama atau lebih kecil bila ada id bersama).
- Komunitas diberi nama sebelum graph dipakai.

## Penanganan kesalahan

- Versi skema graph berbeda: perbarui graph lama dengan versi graphify yang sama, lalu gabung lagi.
- Nama komunitas hilang setelah gabung ulang: lupa `--previous`; gabung ulang dengan `--previous`.

## Serah terima

```
dari: graphify-gabung-graph
korpus: KRP-gabungan-repo-skill
status: perlu_tinjau (nama komunitas belum ada)
```

Berikutnya: `graphify-namai-komunitas`. Memakai `graphify-pasang-cli` dan `graphify-catatan-graph`.

## Batas kemampuan alat

Penggabungan tidak membuat hubungan baru antargraph; hanya menyatukan node dan edge yang ada. Hubungan
lintas sumber muncul bila id node sama atau bila graph lengkap dibangun dari awal.

## Contoh penggunaan

Pengguna ingin tahu skill mana yang memakai skrip yang juga ada di graph kode. Gabungan `KRP-repo` dan
`KRP-skill` ke `KRP-gabungan-repo-skill`, lalu penamaan komunitas.

## Contoh kegagalan dan perbaikannya

Gagal: menggabungkan ke `--out graphify-out/graph.json`, menimpa graph utama. Perbaikan: gabungan
selalu ke folder korpus sendiri di `graphify-kerja/graph/`.

## Cara menguji skill ini

Gabungkan dua graph kecil berbeda, lalu gabungkan ulang dengan `--previous`. Hasil benar: jumlah node
sama dengan jumlah sumber, dan nama komunitas tetap setelah penggabungan ulang.
