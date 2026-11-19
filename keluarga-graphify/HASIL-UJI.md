# Hasil Uji Keluarga Skill Graphify

Tanggal: 2026-11-19. Lingkungan: container Claude Code cloud, Python 3.13, graphifyy 0.9.112.

## Ringkasan

| Uji | Hasil | Cara mengulang |
|---|---|---|
| Uji struktur | 1.347 pemeriksaan, LULUS | `python3 keluarga-graphify/tools/run_tests.py` |
| Uji unit skrip | 34 uji, OK (3 di antaranya memakai CLI graphify asli) | `python3 keluarga-graphify/tests/test_scripts.py` |
| Validator resmi skill-creator | 33 dari 33 sah | `python3 <skill-creator>/scripts/quick_validate.py .claude/skills/graphify-<nama>` |
| Uji perjalanan | 18 dari 18 langkah LULUS | `python3 keluarga-graphify/tools/uji_perjalanan.py` |
| Pemeriksa celah atas seluruh 79 skill repo | 0 GAGAL, 1 PERINGATAN (skill resmi graphify 824 baris), 3 INFO | `python3 .claude/skills/graphify-cari-celah-skill/scripts/cek_celah_skill.py` |
| Pemeriksa tumpang tindih keluarga ini lawan semua skill | 1 pasangan di atas ambang, batas sudah tertulis | `python3 .claude/skills/graphify-cari-tumpang-tindih-skill/scripts/cek_tumpang_tindih.py --awalan graphify- --lawan-semua` |
| Audit graph utama KRP-repo | 0 GAGAL, 0 PERINGATAN, 2 INFO | `graphify-kerja/audit/KRP-repo-20261119.md` |
| Audit graph skill KRP-skill | tanpa temuan | `graphify-kerja/audit/KRP-skill-20261119.md` |

## Isi uji struktur

Setiap skill di indeks: folder dan SKILL.md ada; frontmatter sah (nama sama dengan folder, deskripsi
1-1024 karakter, tanpa kurung sudut, tanpa ` #` yang memotong deskripsi); 15 bagian wajib; maksimal
500 baris; setiap rujukan `references/`, `assets/`, `scripts/` ada; setiap berkas di `scripts/` dan
`assets/` disebut; setiap skrip punya petunjuk "Pakai:" dan `--help` keluar 0; nama skill yang disebut
ada di indeks; bagian Serah terima cocok dengan `next`/`uses`; tidak ada ketergantungan melingkar;
layanan tidak punya keluaran; pintu masuk tunggal dan bukan tujuan; setiap keputusan punya tepat satu
pemilik; salinan `graphify-core.md` sama dengan sumbernya; dirigen menyebut ke-32 skill lain.

## Uji perjalanan (CLI graphify asli, keluaran di folder sementara)

| Langkah | Hasil | Rincian |
|---|---|---|
| 01 diagnosa lingkungan | LULUS | CLI OK, hook OK |
| 02 perkiraan biaya `docs/` | LULUS | 5 dokumen, ±81 ribu token (via `detect()` graphify) |
| 03 build graph kode ke folder korpus | LULUS | `graphify extract . --code-only --out` |
| 04 cluster-only --no-label | LULUS | 55 komunitas |
| 05 namai dan terapkan komunitas | LULUS | 55 nama terpasang dan terverifikasi |
| 06 audit graph | LULUS | 1.027 node, noise 1,5% |
| 07 banding dengan graph utama | LULUS | selisih node dan edge terhitung |
| 08 register catat dan periksa | LULUS | angka dari graph.json |
| 09 query, path, explain | LULUS | `Home() -> ComicPage() -> loadMail() -> generateLocalPart()` |
| 10 ekspor wiki | LULUS | 65 artikel |
| 11 memori jawaban dan refleksi | LULUS | `save-result` dan `reflect` keluar 0 |
| 12 graph perpustakaan skill + explain | LULUS | 79 skill, 91 berkas pendukung, 673 edge |
| 13 affected pada graph skill | LULUS | 18 skill bergantung pada `graphify-pasang-cli` |
| 14 tumpang tindih skill graphify | LULUS | 1 pasangan, batas tertulis |
| 15 celah skill graphify | LULUS | 0 temuan |
| 16 dampak ubah skill | LULUS | 12 kemunculan berdampak TINGGI untuk `graphify-namai-komunitas` |
| 17 diagram keluarga | LULUS | 17 panah serah terima, 34 panah layanan |
| 18 hook asisten terbungkus | LULUS | 3 dari 3 hook |

## Temuan yang ditemukan lalu diperbaiki

| Temuan | Ditemukan oleh | Perbaikan |
|---|---|---|
| `perkiraan_biaya.py` mencetak 60 KB daftar path karena `detect()` mengembalikan list untuk "ignored" | uji manual | dihitung `len()`; uji unit `test_graphifyignore_dihormati` |
| Deskripsi `graphify-pasang-cli` tidak sah YAML (`"graphify: command not found"`) | uji struktur (parser YAML) | titik dua dihapus |
| Tujuh skrip tidak disebut dalam bentuk yang dikenali | uji struktur | baris "Skrip skill ini" ditambahkan |
| Contoh path fiktif terbaca sebagai rujukan rusak | uji struktur | contoh ditulis tanpa backtick |
| 13 pasangan frasa pemicu bentrok di keluarga ini, termasuk lawan orkestrator Studio | pemeriksa tumpang tindih | 11 frasa diganti; batas ditulis di dirigen; pemeriksa tidak lagi menghitung frasa satu kata |
| Deskripsi `graphify-mode-always-on` terpotong setelah "bagian" karena ` #` dibaca sebagai komentar YAML | daftar skill sesi Claude Code | diperbaiki; pemeriksaan ` #` ditambahkan ke uji struktur dan pemeriksa celah (uji unit baru) |
| `graphify update` memberi 20 komunitas nama cadangan dari hub ("json", "argparse") yang tidak dianggap sementara | uji manual setelah pembaruan | skrip penamaan, audit, dan diagnosa membaca `.graphify_labels.pending.json`; 23 komunitas dinamai |
| Diagnosa akan menganggap graph basi karena `graph.json` sendiri berubah di commit | tinjauan | keluaran graph dikecualikan dari hitungan kesegaran |
| `detect()` graphify menulis `graphify-out/cache/` ke folder yang dipindai, sehingga perkiraan biaya meninggalkan folder liar di `docs/` | `git status` sebelum commit | cache diarahkan ke folder sementara; uji unit `test_detect_tanpa_jejak_di_folder` |
| Hook graphify memunculkan error di container tanpa CLI | uji manual (exit 127) | pembungkus `command -v graphify`; uji unit memastikan kode keluar 0 tanpa CLI |

## Belum diuji

- Pemicu tiap skill di percakapan sungguhan (apakah deskripsi memanggil skill yang tepat). Yang sudah
  diuji: frasa pemicu yang bentrok antarskill dan panjang/format deskripsi.
- Jalur yang memakai token atau layanan luar: build lengkap, graph dokumen, `graphify add`, transkripsi
  video, push Neo4j/FalkorDB, server MCP HTTP. Perintahnya diambil dari CLI graphify 0.9.112 dan
  referensi skill resmi, tetapi tidak dijalankan karena butuh izin biaya atau layanan luar.
- Pemasangan berkas `.skill` di akun claude.ai.
