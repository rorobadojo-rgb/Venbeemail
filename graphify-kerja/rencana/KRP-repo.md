# Rencana korpus: KRP-repo

Pemilik berkas: `graphify-rencana-korpus`.

| Isian | Nilai |
|---|---|
| corpus_id | KRP-repo |
| Tujuan (satu kalimat) | Struktur kode seluruh repo bisa ditanya agen dan manusia tanpa membaca berkas satu per satu |
| Pemakai graph | agen (aturan always-on, `graphify query`) dan manusia (`graph.html`, `GRAPH_REPORT.md`) |
| Mode | kode |
| Lokasi keluaran | `graphify-out/` |
| Perintah build | `graphify extract . --code-only` lalu `graphify cluster-only . --no-label`; pembaruan `graphify update .` |
| Folder masuk | seluruh repo yang lolos `.gitignore` dan `.graphifyignore` |
| Folder keluar | `*.min.js`, `*.min.css`, gambar, video, audio, `studio-wall-art-by-nangka/dist/`, `node_modules/`, `.next/`, data pelanggan |
| Perkiraan biaya | 0 token (AST lokal) |
| Izin biaya | tidak perlu (tanpa pass semantik) |
| Di-commit? | ya, kecuali cache dan penanda mesin (KEPUTUSAN pemilik repo, 2026-11-19) |
| Hasil G1 | lulus |

## Catatan keputusan

- 2026-11-19: `.graphifyignore` membuang library minified (±500 node noise) dan ±850 berkas media.
  Graph turun dari 1.338 ke 835 node; god node menjadi komponen VenbeeMail sendiri.
- 2026-11-19: dokumen (±165 berkas, ±325 ribu token) tidak dimasukkan ke graph utama. Bila dibutuhkan,
  dibuat sebagai korpus dokumen terpisah lewat `graphify-graph-dokumen`.
- 2026-11-19: setelah keluarga skill graphify ditambahkan, graph dibangun ulang menjadi 1.027 node, 54
  komunitas, semua bernama Indonesia.
