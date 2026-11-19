# Rubrik gerbang keluarga graphify

WAJIB: `fail` membuat gerbang gagal. SARAN: `fail` atau `warn` hanya menjadi catatan.

## G1 - Rencana korpus

| Butir | Jenis | Bukti yang dicari |
|---|---|---|
| corpus_id sah dan unik | WAJIB | rencana di `graphify-kerja/rencana/`, register tidak punya id sama |
| Lingkup folder tertulis jelas | WAJIB | daftar folder masuk dan keluar |
| Mode build dipilih (kode, lengkap, dokumen, skill, gabungan) | WAJIB | kolom mode di rencana |
| Lokasi keluaran sesuai aturan inti bagian 5 | WAJIB | `graphify-out/` untuk KRP-repo, `graphify-kerja/graph/<id>/` lainnya |
| Data pribadi dikecualikan | WAJIB | pola pengecualian mencakup folder seperti `studio-nangka/pelanggan/` |
| Izin biaya tercatat bila ada pass semantik | WAJIB | KEPUTUSAN dari penjaga biaya dengan angka token |
| Perkiraan ukuran wajar (di bawah 5.000 node untuk HTML penuh) | SARAN | perkiraan file kode dan dokumen |

## G2 - Graph sehat

| Butir | Jenis | Bukti yang dicari |
|---|---|---|
| Graph tidak kosong | WAJIB | audit: node lebih dari 0 |
| Tidak ada path sensitif | WAJIB | audit: tidak ada temuan "path sensitif" |
| Noise nama satu-dua huruf di bawah 5% | WAJIB | audit: rasio_noise |
| Tidak ada file `.min.` di graph | WAJIB | audit: temuan minified |
| Laporan audit dari build yang sama | WAJIB | audit: dibangun_dari sama dengan commit di graph |
| Komunitas bernama (tidak ada "Community N") | SARAN | audit: komunitas_sementara = 0 |
| Edge INFERRED antarfolder sudah ditinjau | SARAN | catatan verifikasi baris sumber |
| Edge AMBIGUOUS ditinjau | SARAN | catatan tinjauan |

## G3 - Siap di-commit atau dibagikan

| Butir | Jenis | Bukti yang dicari |
|---|---|---|
| Lulus G2 | WAJIB | hasil G2 |
| Tidak ada path sensitif (tidak bisa ditimpa) | WAJIB | audit terbaru |
| Graph segar terhadap HEAD untuk file di graph | WAJIB | audit: file_berubah_di_graph = 0 |
| `cache/` dan penanda mesin tidak ikut | WAJIB | `graphify-out/.gitignore` atau `git status` |
| Nama komunitas tersimpan dengan `.sig` | SARAN | `.graphify_labels.json` dan `.graphify_labels.json.sig` ada |
| Register diperbarui | SARAN | `catat_graph.py periksa` OK |
| Ukuran wajar untuk git (graph.json di bawah 10 MB) | SARAN | ukuran berkas |

## G4 - Ekspor atau integrasi siap

| Butir | Jenis | Bukti yang dicari |
|---|---|---|
| Berkas hasil ada di path yang dilaporkan | WAJIB | `ls` path hasil |
| Hasil dibuat dari graph yang lulus G2 | WAJIB | commit graph sama dengan saat G2 |
| Tidak ada kata sandi atau token di berkas hasil atau perintah tercatat | WAJIB | pencarian teks "password", "api_key", "token" |
| Tujuan luar (database, MCP HTTP) diizinkan pengguna | WAJIB | KEPUTUSAN izin dari penjaga biaya |
| Hasil bisa dibuka atau ditanya (uji satu kali) | SARAN | contoh: buka `wiki/index.md`, `graphify-mcp --help`, satu query Cypher |
