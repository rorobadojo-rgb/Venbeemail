---
name: graphify-bangun-graph-kode
description: Membangun graph kode graphify secara lokal, gratis, dan tanpa LLM, memakai AST tree-sitter untuk sekitar 40 bahasa, lalu clustering tanpa pelabelan otomatis. Pakai saat pengguna berkata "bikin graph kode", "graph-kan repo ini", "build graph gratis", "graph tanpa token", "graph-nya belum ada", atau sebagai langkah pertama yang aman sebelum memutuskan build lengkap. Hasilnya graph.json, GRAPH_REPORT.md, dan graph.html dalam hitungan detik, lalu dicatat di register. Jangan dipakai bila dokumen, PDF, atau gambar harus ikut, itu tugas graphify-bangun-graph-lengkap atau graphify-graph-dokumen, atau untuk memperbarui graph yang sudah ada, itu tugas graphify-perbarui-graph.
---

# graphify-bangun-graph-kode

Satu pemilik untuk build graph kode (jalur AST). Jalur ini tidak mengirim apa pun ke luar dan tidak
memakai token, jadi selalu boleh dijalankan tanpa izin biaya.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Graph kode belum ada atau ingin dibangun ulang dari nol.
- Pengguna ingin graph yang gratis dan cepat.
- Rencana korpus memilih mode `kode`.

## Kapan tidak digunakan

- Dokumen atau gambar harus masuk: `graphify-bangun-graph-lengkap` atau `graphify-graph-dokumen`.
- Graph sudah ada dan hanya kode yang berubah: `graphify-perbarui-graph` (lebih cepat, memakai cache).

## Input

- Wajib: akar korpus (default `.`).
- Opsional: corpus_id dan lokasi keluaran dari rencana (default `KRP-repo` di `graphify-out/`).

## Default

- Graph utama: `graphify extract . --code-only` lalu `graphify cluster-only . --no-label`.
- Korpus lain: `graphify extract <path> --code-only --out graphify-kerja/graph/<id>` lalu
  `graphify cluster-only graphify-kerja/graph/<id> --no-label`.
- Selalu `--no-label` (lihat aturan inti bagian 3: cadangan pelabelan memakai token).

## Pertanyaan bila info penting belum ada

Tidak ada untuk graph utama. Untuk korpus lain tanpa rencana: "corpus_id dan folder keluarannya apa?"

## Langkah kerja

1. Pastikan CLI tersedia lewat `graphify-pasang-cli`.
2. Pastikan `.graphifyignore` sudah ditinjau (rencana atau audit sebelumnya); bila belum ada dan repo
   punya `*.min.js` atau banyak gambar, hentikan dan arahkan ke pengecualian lebih dulu.
3. Jalankan `graphify extract <path> --code-only [--out <dir>]`. Catat baris "found N code",
   "path(s) ignored", dan "wrote ... graph.json: X nodes, Y edges, Z communities".
4. Jalankan `graphify cluster-only <dir> --no-label` untuk `GRAPH_REPORT.md` dan `graph.html`.
5. Bila graph lama ada dan build baru lebih kecil, graphify menolak menimpa ("refused to shrink").
   Laporkan; jangan memaksa tanpa alasan (lihat aturan inti bagian 7).
6. Catat ke register lewat `graphify-catatan-graph` (`--mode kode --biaya-token 0`).
7. Laporkan angka, god node teratas (`graphify god-nodes --top 5`), dan path hasil.

## Aturan keputusan

- Build kode tidak butuh izin biaya, tetapi tetap butuh pengecualian yang benar.
- Penolakan mengecil adalah pengaman. Graph memang harus mengecil (file dihapus, pengecualian baru):
  jalankan ulang dengan `--force` dan tulis alasannya di serah terima.
- Komunitas bernama "Community N" setelah build adalah normal; penamaan dikerjakan skill berikutnya.

## Format hasil

```
Graph kode KRP-repo: 118 file kode -> 835 node, 1.693 edge, 48 komunitas (5 detik, 0 token)
Diabaikan aturan ignore: 849 path
God node: ComicPage() 15, prefersReducedMotion() 15, Mascot() 14
Hasil: graphify-out/graph.json, GRAPH_REPORT.md, graph.html
```

## Pemeriksaan kualitas

- Angka diambil dari keluaran graphify, bukan perkiraan.
- `graph.json` baru punya `built_at_commit` sama dengan HEAD.
- Tidak ada pemanggilan LLM (keluaran tidak menyebut backend).

## Penanganan kesalahan

- "Incompatible Language version": versi grammar tree-sitter bentrok; pasang ulang CLI (`graphify-pasang-cli`).
- 0 node: periksa pengecualian yang terlalu lebar dan baris "not classified".
- Sebagian file gagal di-parse: build tetap jadi; sebutkan file tersebut sebagai catatan.

## Serah terima

```
dari: graphify-bangun-graph-kode
korpus: KRP-repo
graph: graphify-out/graph.json (835 node, 1693 edge, 48 komunitas)
status: selesai
bukti: graphify extract . --code-only -> 835 nodes
```

Berikutnya: `graphify-namai-komunitas`. CLI dari `graphify-pasang-cli`; baris register oleh
`graphify-catatan-graph`.

## Batas kemampuan alat

Hanya kode dan berkas konfigurasi terstruktur (JSON, YAML). Komentar `# NOTE:`/`# WHY:` ikut sebagai
node rasional; isi Markdown tidak. Hubungan `INFERRED` tetap perlu diverifikasi.

## Contoh penggunaan

Repo VenbeeMail: `graphify extract . --code-only` menulis 835 node dari 118 file dalam ±5 detik,
`cluster-only --no-label` membuat laporan dan peta. Register mencatat `KRP-repo`.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan `graphify cluster-only .` tanpa `--no-label` di sesi cloud; graphify memakai CLI
`claude` untuk menamai 48 komunitas dan menghabiskan token tanpa diminta. Perbaikan: `--no-label`
selalu, nama ditulis lewat skill penamaan.

## Cara menguji skill ini

Di folder dua berkas Python yang saling memanggil, minta "bikin graph kode". Hasil benar: perintah
`--code-only`, `cluster-only --no-label`, angka dari keluaran, register terisi, dan rekomendasi
langkah penamaan.
