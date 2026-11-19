---
name: graphify-ekspor-pengetahuan
description: Mengekspor graph graphify menjadi kumpulan Markdown untuk dibaca, yaitu wiki (index.md plus satu artikel per komunitas, cocok untuk agen dan untuk dijelajah di GitHub) dan vault Obsidian beserta canvas-nya. Pakai saat pengguna berkata "buatkan wiki dari graph", "ekspor ke Obsidian", "saya mau baca graph seperti buku catatan", "agen perlu peta yang bisa dijelajah", atau setelah graph sehat dan bernama. Dengan wiki, aturan always-on mengarahkan agen ke graphify-out/wiki/index.md. Jangan dipakai untuk peta visual interaktif, pohon, atau diagram, itu tugas graphify-ekspor-visual, atau untuk database graph, itu tugas graphify-ekspor-database.
---

# graphify-ekspor-pengetahuan

Satu pemilik untuk wiki dan vault Obsidian yang dibuat dari graph. Keduanya mengubah graph menjadi
Markdown, sehingga bisa dibaca tanpa CLI.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Pengguna ingin menjelajah graph sebagai halaman, bukan sebagai gambar.
- Agen lain (tanpa CLI graphify) perlu peta pengetahuan yang bisa dibaca.
- Graph sudah sehat (G2) dan komunitasnya bernama.

## Kapan tidak digunakan

- Peta interaktif, pohon, diagram alur, SVG: `graphify-ekspor-visual`.
- Neo4j atau FalkorDB: `graphify-ekspor-database`.

## Input

- Wajib: graph (default `graphify-out/graph.json`).
- Opsional: folder vault Obsidian (untuk vault yang sudah ada).

## Default

- Wiki: `graphify export wiki --graph <g>` menulis ke `<folder graph>/wiki/` (index.md + artikel per
  komunitas, nama berkas dari nama komunitas).
- Obsidian: `graphify export obsidian --graph <g> --dir <folder>`; tanpa `--dir`, ke `graphify-out/obsidian`.

## Pertanyaan bila info penting belum ada

"Vault Obsidian ditulis ke folder baru, atau ke vault yang sudah ada? (vault yang ada bisa bercampur
dengan catatan lama)"

## Langkah kerja

1. Pastikan nama komunitas sudah ada; artikel wiki memakai nama itu sebagai judul dan nama berkas.
2. CLI lewat `graphify-pasang-cli`.
3. Jalankan ekspor yang diminta. Untuk vault, gunakan folder baru kecuali pengguna memilih vault lama.
4. Periksa hasil: jumlah artikel (keluaran graphify mencetaknya), buka `wiki/index.md` dan satu
   artikel; untuk vault, cek ada berkas `.canvas`.
5. Bila wiki akan di-commit, pastikan nama berkas wajar (tanpa karakter aneh) dan ukurannya kecil.
6. Laporkan path, jumlah berkas, dan cara membukanya.

## Aturan keputusan

- Wiki dibuat ulang setiap graph berubah besar; jangan mengedit wiki tangan (tertimpa).
- Vault di dalam repo hanya bila diminta; vault Obsidian biasanya di luar repo pengguna.
- Graph di atas beberapa ribu node: wiki per komunitas tetap kecil; vault Obsidian membuat satu berkas
  per node dan bisa sangat banyak, jadi sebutkan jumlahnya sebelum menulis.

## Format hasil

```
Wiki: 58 artikel di graphify-out/wiki/ (masuk: index.md)
Obsidian: 835 catatan + 1 canvas di /path/vault (buka folder ini sebagai vault)
```

## Pemeriksaan kualitas

- `index.md` ada dan merujuk artikel yang ada.
- Judul artikel memakai nama komunitas, bukan "Community N".

## Penanganan kesalahan

- Artikel berjudul "Community N": penamaan belum dijalankan; namai dulu lalu ekspor ulang.
- Folder vault sudah berisi catatan lain: hentikan dan tanyakan, jangan menimpa.

## Serah terima

Skill ujung: path hasil dilaporkan ke pengguna. CLI dipastikan lewat `graphify-pasang-cli`.

## Batas kemampuan alat

Isi artikel berasal dari struktur graph (node, relasi, komunitas), bukan ringkasan tulisan bebas.
Vault Obsidian tidak menyinkron otomatis saat graph berubah.

## Contoh penggunaan

Graph `KRP-repo` bernama lengkap: `graphify export wiki` menulis 58 artikel; `index.md` mendaftar
"Generator Alamat Email", "Dinding Doodle Three.js", dan seterusnya. Aturan always-on di CLAUDE.md
membuat agen membaca wiki ini untuk navigasi luas.

## Contoh kegagalan dan perbaikannya

Gagal: ekspor Obsidian ke vault pribadi pengguna dan menimpa catatan bernama sama. Perbaikan: vault
selalu ke folder baru kecuali pengguna menunjuk vault lama dan setuju.

## Cara menguji skill ini

Pada graph dengan komunitas bernama, minta "buatkan wiki". Hasil benar: `index.md` dan satu artikel
per komunitas, jumlah sesuai keluaran graphify, judul berbahasa Indonesia.
