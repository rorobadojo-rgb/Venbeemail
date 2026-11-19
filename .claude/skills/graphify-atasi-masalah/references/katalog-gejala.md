# Katalog gejala graphify 0.9.112

| Gejala (kata kunci pesan) | Penyebab | Perbaikan |
|---|---|---|
| `graphify: command not found` di awal sesi | container cloud baru, CLI belum dipasang | `uv tool install "graphifyy[mcp,watch,pdf,office,svg,sql]==0.9.112"` |
| `command not found` setelah dipasang | `~/.local/bin` belum di PATH | `uv tool update-shell` atau path penuh `~/.local/bin/graphify` |
| hook memunculkan `command not found` setiap Read/Grep | hook telanjang di sesi tanpa CLI | `bungkus_hook.py` milik skill always-on |
| `refused to shrink` / graph tidak ditulis | pengaman: graph baru lebih kecil | banding dulu; bila memang dihapus, `graphify update . --force` dengan alasan |
| `Incompatible Language version 15` | runtime tree-sitter lebih tua dari grammar | pasang ulang CLI dengan versi pasti (uv memilih paket yang cocok) |
| graph 0 node | pengecualian terlalu lebar atau folder salah | baca baris "path(s) ignored" dan "not classified" di keluaran extract |
| ratusan node `a()`, `Cc()`, `fe()` | berkas minified ikut | `*.min.js` di `.graphifyignore`, lalu update `--force` |
| bahasa `.inc`, `.h`, `.m` salah | ekstensi ambigu | `.graphifyrc`: `language.inc=php` |
| nama komunitas kembali "Community N" atau nama simbol | anggota komunitas berubah, nama lama tidak cocok | namai ulang komunitas yang berubah |
| `[!] TRUNCATED` | anggaran token jawaban kecil | `--budget 3000` atau persempit pertanyaan |
| kode keluar 3 | nama ambigu, kandidat dicetak | pilih kandidat, ulangi dengan nama lengkap atau id |
| kode keluar 4 | node tidak ditemukan | cek ejaan, pakai `graphify query` dengan kata kunci |
| `graph.html` kosong di container | unpkg.com diblokir jaringan sesi | normal; buka di browser pemilik |
| `TypeError ... metadata_errors` saat transkripsi | PyAV terlalu baru | pasang ulang extra `video` (0.9.112 membatasi `av<19`) |
| backend tidak terdeteksi / meminta API key | tidak ada variabel API key | pakai `/graphify` (model sesi) atau atur variabel; jangan tempel key di chat |
| cluster-only diam-diam memakai token | cadangan pelabelan CLI `claude` | selalu `--no-label` |
| endpoint menolak `cache_control` | gateway Anthropic tanpa dukungan cache | `GRAPHIFY_CLAUDE_PROMPT_CACHE=0` |
| `graphify add` gagal, `403` / `CONNECT tunnel failed` | host tidak diizinkan jaringan sesi | pengguna mengizinkan host di pengaturan lingkungan |
| `/graphify docs` menimpa graph utama | skill resmi menulis ke `./graphify-out/` | pulihkan dari git; jalankan dari folder korpus |
| `settings.json` tidak bisa diubah graphify | JSON rusak | perbaiki JSON (graphify menyimpan cadangan) |
| diagnosa: graph basi padahal hanya README berubah | versi lama pemeriksaan | `cek_lingkungan.py` terbaru hanya menghitung berkas kode/graph |

Bila gejala tidak ada di tabel: kumpulkan versi (`graphify --version`), perintah, keluaran lengkap, dan
contoh minimal, lalu laporkan sebagai HIPOTESIS.
