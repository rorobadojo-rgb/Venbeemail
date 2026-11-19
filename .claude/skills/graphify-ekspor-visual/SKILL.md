---
name: graphify-ekspor-visual
description: Membuat peta visual dari graph graphify, yaitu graph.html interaktif (klik node, cari, filter komunitas), GRAPH_TREE.html berupa pohon folder ke file ke simbol yang bisa dilipat, diagram arsitektur dan alur panggilan berbasis Mermaid (callflow-html), graph.svg untuk ditempel di Notion atau GitHub, dan GraphML untuk Gephi atau yEd. Pakai saat pengguna berkata "tampilkan graph-nya", "buka peta interaktif", "buat diagram arsitektur", "ekspor ke SVG", "buka di Gephi", "graph.html kosong", atau "graph terlalu besar untuk dibuka". Jangan dipakai untuk wiki atau Obsidian, itu tugas graphify-ekspor-pengetahuan, atau untuk Neo4j dan FalkorDB, itu tugas graphify-ekspor-database.
---

# graphify-ekspor-visual

Satu pemilik untuk berkas visual hasil ekspor. Peta yang tepat untuk tujuan yang tepat: HTML untuk
menjelajah, pohon untuk struktur folder, Mermaid untuk menjelaskan arsitektur, SVG untuk dokumen.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Pengguna ingin melihat graph, bukan menanyainya.
- Menyiapkan gambar untuk dokumentasi atau presentasi.
- `graph.html` tampak kosong atau terlalu berat.

## Kapan tidak digunakan

- Wiki atau Obsidian: `graphify-ekspor-pengetahuan`.
- Database graph: `graphify-ekspor-database`.

## Input

- Wajib: graph (default `graphify-out/graph.json`).
- Opsional: jenis visual, batas node, folder keluaran.

## Default

| Tujuan | Perintah | Hasil |
|---|---|---|
| Jelajah interaktif | `graphify export html --graph <g>` | `graph.html` (sudah dibuat saat build) |
| Pohon struktur | `graphify tree --graph <g>` | `GRAPH_TREE.html` |
| Diagram arsitektur | `graphify export callflow-html <g>` | `<nama>-callflow.html` |
| Gambar statis | `graphify export svg --graph <g>` | `graph.svg` |
| Gephi, yEd | `graphify export graphml --graph <g>` | `graph.graphml` |

## Pertanyaan bila info penting belum ada

"Peta ini untuk dijelajah sendiri, ditempel di dokumen, atau dijelaskan ke orang lain?" (menentukan HTML, SVG, atau Mermaid).

## Langkah kerja

1. Pastikan komunitas bernama (warna dan legenda memakai nama komunitas).
2. CLI lewat `graphify-pasang-cli` (extra `svg` untuk SVG).
3. Jalankan perintah dari tabel Default.
4. Graph di atas 5.000 node: HTML otomatis menampilkan tampilan komunitas teragregasi; untuk semua node
   pakai `--node-limit N` (berat di browser). Untuk `cluster-only`, `update`, dan hook, batas diatur
   `GRAPHIFY_VIZ_NODE_LIMIT` atau `viz_node_limit` di `.graphifyrc`.
5. Kirim berkas ke pengguna untuk dibuka di browser mereka (di sesi cloud, kirim sebagai berkas).
6. Laporkan path dan cara membuka.

## Aturan keputusan

- `graph.html` memuat library vis-network dari unpkg.com. Di container cloud unpkg diblokir sehingga
  kanvas tampak kosong; di browser pemilik normal. Jangan menyimpulkan HTML rusak dari container.
- Untuk menjelaskan ke orang lain, callflow (Mermaid) lebih terbaca daripada peta penuh.
- SVG besar tidak terbaca; batasi ke satu komunitas atau gunakan HTML.

## Format hasil

```
Dibuat: graphify-out/GRAPH_TREE.html (pohon), graphify-out/Venbeemail-callflow.html (Mermaid)
Buka di browser. graph.html memuat vis-network dari unpkg.com (butuh internet).
```

## Pemeriksaan kualitas

- Berkas ada dan ukurannya wajar (bukan 0 byte).
- Legenda memakai nama komunitas, bukan "Community N".

## Penanganan kesalahan

- `export svg` gagal karena matplotlib tidak ada: pasang extra `svg`.
- Kanvas kosong di container: perilaku normal karena unpkg diblokir; untuk uji tangkapan layar, sajikan
  vis-network dari salinan npm lewat rute browser uji, bukan mengubah berkas HTML.

## Serah terima

Skill ujung: path berkas visual dikembalikan ke pengguna. CLI dari `graphify-pasang-cli`.

## Batas kemampuan alat

Visual hanya menampilkan struktur graph. Peta penuh ribuan node sulit dibaca manusia; pakai filter
komunitas atau pohon.

## Contoh penggunaan

Graph repo ini (835 node, 48 komunitas bernama): `graph.html` menampilkan legenda "Generator Alamat
Email", "Dinding Doodle Three.js", dan seterusnya; `graphify tree` membuat pohon folder untuk tinjauan
struktur.

## Contoh kegagalan dan perbaikannya

Gagal: melaporkan "graph.html rusak" karena tangkapan layar di container kosong. Perbaikan: periksa
konsol (vis-network gagal dimuat dari unpkg); berkas normal di browser pengguna.

## Cara menguji skill ini

Minta "buat diagram arsitektur". Hasil benar: `callflow-html` dijalankan, path berkas dilaporkan, dan
penjelasan cara membuka di browser.
