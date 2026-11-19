---
name: graphify-bangun-graph-lengkap
description: Membangun graph graphify lengkap, yaitu kode lewat AST ditambah dokumen, PDF, gambar, dan transkrip lewat pass semantik, sehingga hubungan dokumen ke kode ikut terpetakan. Dua jalur, yaitu skill resmi /graphify di Claude Code yang memakai subagent sesi, atau graphify extract dengan backend API (Gemini, Claude, OpenAI, Kimi, DeepSeek, Ollama lokal). Pakai saat pengguna berkata "graph lengkap", "sertakan dokumen dan gambar", "graph lengkap dengan mode deep", "hubungkan PRD dengan kode", atau rencana korpus memilih mode lengkap. Selalu didahului perkiraan dan izin biaya. Jangan dipakai untuk graph kode saja yang gratis, itu tugas graphify-bangun-graph-kode, atau untuk korpus dokumen terpisah, itu tugas graphify-graph-dokumen.
---

# graphify-bangun-graph-lengkap

Satu pemilik untuk build lengkap (kode dan semantik). Jalur ini paling kaya, paling lambat, dan satu-
satunya yang memakai token untuk membangun.

Sebelum mulai, baca `references/graphify-core.md`. Pilihan backend, variabel lingkungannya, dan
risiko privasinya: `references/backend-llm.md`.

## Kapan digunakan

- Rencana korpus memilih mode `lengkap`.
- Pertanyaan yang ingin dijawab menuntut hubungan dokumen ke kode ("bagian PRD mana yang
  diimplementasikan komponen ini?").

## Kapan tidak digunakan

- Kode saja: `graphify-bangun-graph-kode`.
- Dokumen saja, korpus terpisah: `graphify-graph-dokumen`.
- Memperbarui graph lengkap yang sudah ada: `graphify-perbarui-graph` (mode `--update`).

## Input

- Wajib: akar korpus, izin biaya dengan angka.
- Opsional: jalur (skill resmi atau backend), `--mode deep`, `--directed`, model Whisper bila ada video.

## Default

- Jalur skill resmi di Claude Code: ketik `/graphify .` (keluaran ke `./graphify-out/`).
- Jalur headless: `graphify extract . --backend <nama>` (keluaran ke `<path>/graphify-out/` atau `--out`).
- `--mode deep` hanya bila diminta (lebih banyak edge INFERRED, lebih banyak token).

## Pertanyaan bila info penting belum ada

1. "Pakai model sesi Claude ini (lewat /graphify) atau API key sendiri (lewat graphify extract)?"
2. "Mode biasa atau deep (lebih banyak hubungan tebakan, token lebih besar)?"

## Langkah kerja

1. CLI lewat `graphify-pasang-cli`; extra yang dibutuhkan (`pdf`, `office`, `video`) disebut jelas.
2. Perkiraan dan izin lewat `graphify-penjaga-biaya` (`perkiraan_biaya.py <path>`). Tanpa izin, berhenti.
3. Jalur skill resmi: jalankan `/graphify <path>` sesuai skill `graphify`, yang mendeteksi file,
   mentranskripsi video, membagi dokumen ke subagent, menggabungkan, lalu clustering. Saat skill
   resmi sampai tahap penamaan komunitas (Step 5), tulis nama dalam bahasa Indonesia.
4. Jalur headless: `graphify extract <path> --backend <nama> [--model M] [--mode deep] [--out DIR]`,
   lalu `graphify cluster-only <dir> --no-label`. graphify mencetak variabel lingkungan yang memilih
   backend; salin ke laporan.
5. Bandingkan token sungguhan dengan izin. Bila melebihi lebih dari 25%, laporkan.
6. Catat ke register lewat `graphify-catatan-graph` (`--mode lengkap --biaya-token N`).
7. Laporkan angka, god node, koneksi mengejutkan, dan path hasil.

## Aturan keputusan

- Data yang tidak boleh keluar mesin: hanya `--backend ollama` (lokal) atau kode saja.
- Korpus lebih dari 500 file atau 2 juta kata: persempit dulu (skill resmi akan meminta memilih subfolder).
- Build gagal di tengah: jangan mengulang penuh; `--update` memakai cache dan hanya menjalankan yang belum.
- Dokumen yang gagal diekstraksi tidak ditandai selesai; build berikutnya mengantrikannya lagi.

## Format hasil

```
Graph lengkap KRP-repo: 118 kode + 165 dokumen -> X node, Y edge, Z komunitas
Jalur: /graphify (model sesi) | token sungguhan ±N (izin ±325 ribu)
EXTRACTED 91% | INFERRED 8% | AMBIGUOUS 1%
Hasil: graphify-out/graph.json, GRAPH_REPORT.md, graph.html
```

## Pemeriksaan kualitas

- Ada KEPUTUSAN izin sebelum build.
- Token sungguhan dilaporkan dari keluaran (bukan diulang dari perkiraan).
- Edge INFERRED dan AMBIGUOUS disebut proporsinya.

## Penanganan kesalahan

- Backend tidak terdeteksi: graphify meminta API key; jangan meminta pengguna menempel key di chat,
  arahkan ke variabel lingkungan atau fitur kredensial lingkungan.
- Endpoint menolak `cache_control`: `GRAPHIFY_CLAUDE_PROMPT_CACHE=0`.
- Model lokal kehabisan konteks: `--token-budget` lebih kecil dan `--max-concurrency 1`.

## Serah terima

```
dari: graphify-bangun-graph-lengkap
status: selesai | perlu_tinjau (token melebihi izin)
keputusan: izin ±325 ribu token, pengguna, 2026-11-19
```

Berikutnya: `graphify-namai-komunitas`. Memakai `graphify-pasang-cli`, `graphify-penjaga-biaya`,
dan `graphify-catatan-graph`.

## Batas kemampuan alat

Mutu hubungan semantik bergantung pada model. Gambar dibaca seperti foto oleh model, bukan OCR
pasti. Di sesi cloud, akses API terbatas pada host yang diizinkan lingkungan.

## Contoh penggunaan

Pengguna ingin PRD Pro terhubung ke komponen. Perkiraan `docs/` + kode: ±81 ribu token, disetujui.
`/graphify .` dengan pengecualian repo; skill resmi menamai komunitas dalam bahasa Indonesia; register
mencatat `KRP-repo` mode lengkap.

## Contoh kegagalan dan perbaikannya

Gagal: `graphify extract . --backend kimi` atas repo berisi catatan internal tanpa bertanya. Kimi
mengirim isi ke server di luar negeri. Perbaikan: pilihan backend selalu ditanyakan dan diberi
catatan lokasi data dari `references/backend-llm.md`.

## Cara menguji skill ini

Minta "graph lengkap repo ini" tanpa izin sebelumnya. Hasil benar: berhenti di perkiraan dan
pertanyaan izin dengan angka; tidak ada `/graphify` atau `extract --backend` yang berjalan.
