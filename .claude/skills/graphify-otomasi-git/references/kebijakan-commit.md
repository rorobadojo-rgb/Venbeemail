# Kebijakan commit graph di repo Venbeemail

KEPUTUSAN pemilik repo, 2026-11-19: graph di-commit agar sesi baru langsung punya graph beserta nama
komunitasnya.

| Berkas di `graphify-out/` | Di-commit | Alasan |
|---|---|---|
| `graph.json` | ya | graph yang ditanya CLI dan always-on |
| `GRAPH_REPORT.md` | ya | ringkasan untuk manusia |
| `graph.html` | ya | peta interaktif (memuat vis-network dari unpkg.com) |
| `manifest.json` | ya | memungkinkan pembaruan bertahap di clone lain |
| `.graphify_labels.json` dan `.sig` | ya | nama komunitas bertahan antarsesi |
| `.graphify_analysis.json`, `.graphify_build.json` | ya | dipakai refleksi dan watch |
| `memory/`, `reflections/` | ya | memori jawaban antarsesi |
| `wiki/` | ya, bila dibuat | navigasi agen |
| `cache/` | tidak | besar, dibuat ulang otomatis |
| folder cadangan bertanggal (`2026-11-19/`) | tidak | cadangan lokal cluster-only |
| `.graphify_python`, `.graphify_root` | tidak | path khusus mesin |
| `.graphify_labels.pending.json` | tidak | nama cadangan dari hub, belum ditinjau |
| `.graphify_detect.json`, `.graphify_extract.json`, `.graphify_chunk_*.json` | tidak | berkas antara pipeline |

Semua aturan "tidak" ada di `graphify-out/.gitignore`. Graph korpus lain di
`graphify-kerja/graph/<id>/graphify-out/` mengikuti tabel yang sama; salin `.gitignore` itu ke sana.

Sebelum commit graph: audit bersih dan gerbang G3 lulus (tidak ada path sensitif, graph segar).
