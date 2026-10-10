# lama/: salinan halaman /pro lama

Folder ini menyimpan halaman /pro **asli sebelum Fase 1 PRD pertama** (tanpa blok `vbpro-*`), sebagai sumber isi teknis yang disalin persis (PRD bagian 3 dan 18.2). Tidak dipasang ke server.

| Berkas | Isi | Status |
|---|---|---|
| `index.html` | Halaman lama apa adanya (tidak pernah memuat blok `vbpro-*`). 40.830 byte, sha256 `10fbc28e…08da` | **Ada** (dari LO lewat File Manager, 10 Oktober 2026) |
| `index.live.html` | Tidak diperlukan: `index.html` sudah halaman live (ukuran sama dengan `content-length` server) | |
| `inventaris.json` | Inventaris semua teks, `id`, tautan, skrip, meta (18.2), dibuat `alat/inventaris_lama.mjs` | **Ada** |

10 Oktober 2026: `https://venbeemail.com/pro/` diblokir oleh kebijakan jaringan lingkungan Claude Code (proxy menjawab 403 untuk `venbeemail.com:443`). Cara mengambil isi lama: lihat PRD bagian 18.2 (izinkan `venbeemail.com` di Allowed domains, atau unduh lewat File Manager aaPanel, atau `cat` dari terminal).
