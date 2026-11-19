---
name: graphify-ekspor-database
description: Mengekspor graph graphify ke database graph Neo4j atau FalkorDB, sebagai berkas Cypher (graphify-out/cypher.txt) untuk diimpor manual atau langsung dikirim dengan --push memakai MERGE sehingga aman diulang, dengan kata sandi lewat variabel lingkungan NEO4J_PASSWORD atau FALKORDB_PASSWORD, tidak lewat argumen. Pakai saat pengguna berkata "masukkan graph ke Neo4j", "ekspor Cypher", "push ke FalkorDB", "query graph pakai Cypher", atau ingin menggabungkan graph dengan data lain di database. Mengirim data ke luar, jadi butuh izin. Jangan dipakai untuk peta visual, itu tugas graphify-ekspor-visual, atau untuk server MCP, itu tugas graphify-server-mcp.
---

# graphify-ekspor-database

Satu pemilik untuk ekspor dan pengiriman ke database graph. Database berguna bila graph perlu
digabung dengan data lain atau ditanya dengan Cypher oleh banyak orang.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Pengguna punya atau ingin memakai Neo4j atau FalkorDB.
- Butuh query Cypher yang tidak tersedia di CLI graphify.

## Kapan tidak digunakan

- Hanya ingin melihat graph: `graphify-ekspor-visual`.
- Agen lain cukup bertanya lewat MCP: `graphify-server-mcp`.

## Input

- Wajib: graph, jenis database, mode (berkas Cypher atau push).
- Untuk push: URI tujuan dari pengguna (persis), nama pengguna database.

## Default

- Berkas Cypher: `graphify export neo4j --graph <g>` atau `graphify export falkordb --graph <g>`
  (keduanya menulis `cypher.txt` di folder graph).
- Push: `graphify export neo4j --push '<uri>' --user <user>` dengan `NEO4J_PASSWORD` di lingkungan;
  FalkorDB: `graphify export falkordb --push '<uri>'` dengan `FALKORDB_PASSWORD` bila perlu.
- Default lokal hanya bila pengguna minta push tanpa URI: `bolt://localhost:7687` (Neo4j),
  `falkordb://localhost:6379` (FalkorDB).

## Pertanyaan bila info penting belum ada

1. "Cukup berkas Cypher, atau langsung dikirim ke database? Bila dikirim, ke URI mana?"
2. "Database ini bisa dibaca siapa saja?" (untuk izin data keluar).

## Langkah kerja

1. Pastikan graph lulus G2 (audit bersih, tanpa path sensitif).
2. Untuk push: minta izin lewat `graphify-penjaga-biaya` (tujuan, siapa yang bisa membaca).
3. CLI lewat `graphify-pasang-cli` dengan extra `neo4j` atau `falkordb` untuk push.
4. Jalankan perintah. URI ditulis persis seperti diberikan pengguna, dikutip untuk shell.
5. Kata sandi hanya lewat variabel lingkungan; minta pengguna mengaturnya sendiri (jangan ditempel di chat).
6. Verifikasi: untuk berkas, jumlah pernyataan di `cypher.txt`; untuk push, satu query hitung node
   (misalnya `MATCH (n) RETURN count(n)`) dijalankan pengguna atau lewat klien database.
7. Laporkan tanpa mencetak URI berisi kredensial.

## Aturan keputusan

- Tidak ada izin: hanya berkas Cypher lokal.
- Jangan mengganti URI pengguna dengan localhost.
- FalkorDB menjalankan satu pernyataan per perintah; untuk memuat graph lebih baik `--push` daripada berkas.
- MERGE membuat push aman diulang; tidak perlu menghapus data lama kecuali diminta.

## Format hasil

```
Cypher: graphify-out/cypher.txt (2.528 pernyataan)
Push Neo4j: berhasil (MERGE), tujuan disebut tanpa kredensial
Verifikasi: count(n) = 835
```

## Pemeriksaan kualitas

- Tidak ada kata sandi di berkas, perintah tercatat, atau laporan.
- Jumlah node di database sama dengan graph.

## Penanganan kesalahan

- Koneksi ditolak: periksa URI, port, dan apakah host diizinkan jaringan sesi.
- Autentikasi gagal: minta pengguna memeriksa variabel lingkungan; jangan meminta kata sandi di chat.

## Serah terima

Skill ujung: hasil ekspor dilaporkan ke pengguna. Izin dari `graphify-penjaga-biaya`; CLI dari
`graphify-pasang-cli`.

## Batas kemampuan alat

Struktur node dan relasi graphify dipetakan apa adanya; skema database tidak dirancang ulang. Sesi
cloud biasanya tidak bisa menjangkau database di jaringan lokal pengguna.

## Contoh penggunaan

Pengguna ingin query Cypher atas graph repo: berkas `cypher.txt` dibuat lokal, pengguna mengimpornya
ke Neo4j Desktop di komputernya.

## Contoh kegagalan dan perbaikannya

Gagal: perintah `--password rahasia123` tercatat di riwayat shell dan log sesi. Perbaikan: kata sandi
selalu lewat `NEO4J_PASSWORD` yang diatur pengguna sendiri.

## Cara menguji skill ini

Minta "push graph ke Neo4j" tanpa URI dan tanpa izin. Hasil benar: dua pertanyaan (mode/URI dan
izin), tidak ada push sebelum dijawab, kata sandi tidak diminta di chat.
