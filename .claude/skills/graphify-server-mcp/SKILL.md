---
name: graphify-server-mcp
description: Menjalankan graph graphify sebagai server MCP (graphify-mcp) agar agen dan aplikasi lain seperti Claude Code, Claude Desktop, atau orkestrator agen bisa bertanya langsung lewat alat query_graph, get_node, get_neighbors, get_section, get_community, god_nodes, graph_stats, dan shortest_path. Mencakup mode stdio untuk satu mesin, mode HTTP dengan --api-key, pendaftaran di .mcp.json project atau konfigurasi Claude Desktop, dan uji jabat tangan. Pakai saat pengguna berkata "jadikan graph server MCP", "agen lain perlu akses graph", "hubungkan graph ke Claude Desktop", atau "graph lewat MCP". Jangan dipakai untuk ekspor ke database, itu tugas graphify-ekspor-database.
---

# graphify-server-mcp

Satu pemilik untuk konfigurasi server MCP graphify. MCP membuat graph bisa ditanya agen yang tidak
punya CLI graphify, tanpa menyalin isinya.

Sebelum mulai, baca `references/graphify-core.md`. Contoh konfigurasi lengkap:
`references/konfigurasi-mcp.md`.

## Kapan digunakan

- Agen atau aplikasi lain perlu bertanya ke graph.
- Claude Desktop di komputer pengguna ingin memakai graph repo.

## Kapan tidak digunakan

- Sesi Claude Code ini sendiri: CLI dan aturan always-on sudah cukup; MCP tidak diperlukan.
- Database graph: `graphify-ekspor-database`.

## Input

- Wajib: graph yang akan dilayani, klien yang akan memakai.
- Untuk HTTP: host, port, API key (diatur pengguna lewat `GRAPHIFY_API_KEY`).

## Default

- stdio: `graphify-mcp --graph <path absolut graph.json>` (klien yang menjalankan prosesnya).
- HTTP hanya bila diminta: `graphify-mcp --graph <g> --transport http --host 127.0.0.1 --port 8765`
  dengan `GRAPHIFY_API_KEY` diatur.

## Pertanyaan bila info penting belum ada

1. "Klien mana yang akan memakai: Claude Code project ini, Claude Desktop, atau agen lain?"
2. Untuk HTTP: "Perlu diakses dari jaringan lain? Bila ya, wajib API key."

## Langkah kerja

1. CLI lewat `graphify-pasang-cli` (extra `mcp`).
2. Uji: `graphify-mcp --help`, lalu jalankan stdio sebentar untuk memastikan graph termuat.
3. Tulis konfigurasi klien dari `references/konfigurasi-mcp.md` dengan path absolut.
4. Untuk HTTP: izin lewat `graphify-penjaga-biaya` (graph terbuka di jaringan); tanpa API key server
   mencetak peringatan, jangan diabaikan.
5. Minta pengguna memuat ulang klien, lalu panggil `graph_stats` sebagai uji.
6. Laporkan konfigurasi (tanpa API key) dan hasil uji.

## Aturan keputusan

- Path graph selalu absolut di konfigurasi klien.
- HTTP ke `0.0.0.0` tanpa API key ditolak.
- Di sesi cloud, server stdio dalam `.mcp.json` hanya jalan bila CLI sudah terpasang saat sesi
  dimulai; container baru tidak punya CLI, jadi catat keterbatasan ini.
- Panduan untuk klien MCP diambil dari alat yang ditawarkan server, bukan dari aturan CLI di CLAUDE.md.

## Format hasil

```
Server: graphify-mcp --graph /home/user/Venbeemail/graphify-out/graph.json (stdio)
Klien: .mcp.json project | uji graph_stats -> 835 node, 1.693 edge
```

## Pemeriksaan kualitas

- Uji `graph_stats` berhasil dari klien.
- API key tidak muncul di berkas yang di-commit.

## Penanganan kesalahan

- Klien tidak menemukan perintah: pakai path absolut biner (`command -v graphify-mcp`).
- Claude Desktop tidak bisa menjalankan `$(...)`: tulis path interpreter absolut sesuai referensi.
- Port terpakai: pilih port lain.

## Serah terima

Skill ujung: konfigurasi dan hasil uji dilaporkan. CLI dan extra dari `graphify-pasang-cli`.

## Batas kemampuan alat

Server hanya membaca graph; tidak membangun ulang. Graph basi tetap dilayani apa adanya; perbarui
graph lalu mulai ulang server.

## Contoh penggunaan

Pengguna ingin Claude Desktop di laptopnya menanyai graph repo yang di-clone di sana. Konfigurasi
stdio dengan path interpreter dan graph absolut di laptop; uji `graph_stats` berhasil.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan HTTP di `0.0.0.0` tanpa API key agar "gampang diakses"; graph terbuka untuk siapa
saja di jaringan. Perbaikan: HTTP hanya dengan `GRAPHIFY_API_KEY` dan host seminimal mungkin.

## Cara menguji skill ini

Minta "jadikan graph server MCP untuk Claude Desktop". Hasil benar: konfigurasi stdio dengan path
absolut, tanpa HTTP, tanpa API key di berkas, dan uji `graph_stats`.
