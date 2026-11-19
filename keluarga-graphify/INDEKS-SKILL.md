# Indeks Skill: Keluarga Skill Graphify

File ini dibuat otomatis oleh `tools/build_index.py`. Jangan diedit tangan.

Jumlah skill: 33. Peran: pintu masuk (1), layanan (6, dipanggil skill lain), jalur (26, urutan kerja).

## Kelompok A - Pintu masuk dan fondasi

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 01 | `graphify-dirigen` | pintu masuk | Membaca keadaan graphify di repo, memilih skill yang tepat, menjalankannya berurutan, dan merangkum hasilnya. | - |
| 02 | `graphify-pasang-cli` | layanan | Memastikan CLI graphify terpasang dengan versi dan extra yang tepat, termasuk di container cloud yang selalu baru. | `references/extra-dan-platform.md` |
| 03 | `graphify-diagnosa-lingkungan` | layanan | Memeriksa kesiapan lingkungan: CLI, graph, kesegaran graph, hook, pengecualian, extra, dan backend LLM. | `scripts/cek_lingkungan.py` |
| 04 | `graphify-catatan-graph` | layanan | Mencatat setiap graph yang dibangun (lokasi, lingkup, mode, ukuran, commit, biaya) di register. | `scripts/catat_graph.py`, `assets/graph-register.csv` |
| 05 | `graphify-penjaga-biaya` | layanan | Memperkirakan token dan waktu sebelum pass semantik, lalu meminta izin sebelum isi dikirim ke model atau layanan luar. | `scripts/perkiraan_biaya.py` |
| 06 | `graphify-gerbang-mutu` | layanan | Menilai lulus atau tidaknya pekerjaan graphify di gerbang G1 rencana, G2 graph sehat, G3 siap commit, dan G4 ekspor. | `references/rubrik-gerbang.md` |

## Kelompok B - Membangun dan merawat graph

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 07 | `graphify-rencana-korpus` | jalur | Menentukan apa yang masuk ke tiap graph, mode build, lokasi keluaran, dan corpus_id. | `assets/rencana-korpus.md` |
| 08 | `graphify-atur-pengecualian` | jalur | Menyusun .graphifyignore dan .graphifyrc lalu membuktikan efeknya dengan uji kering. | `assets/graphifyignore-dasar.txt`, `references/pola-pengecualian.md` |
| 09 | `graphify-bangun-graph-kode` | jalur | Membangun graph kode secara lokal dan gratis lewat AST tree-sitter, tanpa LLM. | - |
| 10 | `graphify-bangun-graph-lengkap` | jalur | Membangun graph lengkap (kode plus dokumen, PDF, dan gambar) lewat skill resmi /graphify atau backend API. | `references/backend-llm.md` |
| 11 | `graphify-namai-komunitas` | jalur | Memberi nama komunitas graph dalam bahasa Indonesia dan menyimpannya agar bertahan saat rebuild. | `scripts/namai_komunitas.py`, `references/panduan-nama.md` |
| 12 | `graphify-audit-graph` | jalur | Mengukur kesehatan graph: noise, edge tebakan, komunitas tipis, kesegaran, dan path sensitif. | `scripts/audit_graph.py` |
| 13 | `graphify-perbarui-graph` | jalur | Memperbarui graph setelah kode atau dokumen berubah, termasuk saat graph memang harus mengecil. | - |
| 14 | `graphify-banding-graph` | jalur | Membandingkan dua versi graph: node, relasi, file, dan komunitas yang bertambah, hilang, atau pindah. | `scripts/banding_graph.py` |

## Kelompok C - Graph dokumen dan sumber pengetahuan

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 15 | `graphify-graph-dokumen` | jalur | Membangun graph khusus dokumen (Markdown, PDF, Office) seperti PRD, panduan, dan catatan. | `references/format-dokumen.md` |
| 16 | `graphify-tanya-dokumen` | jalur | Menjawab pertanyaan dari graph dokumen dengan rujukan file dan judul bagian. | `references/pola-pertanyaan.md` |
| 17 | `graphify-tambah-sumber` | jalur | Memasukkan artikel, paper, dan video dari URL ke korpus dengan penanda penulis dan penyumbang. | - |
| 18 | `graphify-transkrip-media` | jalur | Mentranskripsi video dan audio lokal dengan Whisper agar isinya bisa masuk graph. | `references/model-whisper.md` |
| 19 | `graphify-ekspor-pengetahuan` | jalur | Mengekspor graph menjadi wiki Markdown dan vault Obsidian untuk dibaca manusia dan agen. | - |
| 20 | `graphify-memori-jawaban` | layanan | Menyimpan hasil tanya-jawab yang berguna, buntu, atau dikoreksi, lalu menyarikan pelajarannya. | - |

## Kelompok D - Graph perpustakaan skill

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 21 | `graphify-graph-skill` | jalur | Membangun graph perpustakaan skill (skill, file pendukung, rujukan, serah terima) tanpa LLM. | `scripts/peta_skill.py` |
| 22 | `graphify-cari-tumpang-tindih-skill` | jalur | Menemukan skill yang fungsinya mirip atau pemicunya berebut, lalu mengusulkan gabung, persempit, atau ganti nama. | `scripts/cek_tumpang_tindih.py` |
| 23 | `graphify-cari-celah-skill` | jalur | Menemukan rujukan rusak, skill yatim, file mati, dan keluarga skill tanpa pintu masuk. | `scripts/cek_celah_skill.py` |
| 24 | `graphify-dampak-ubah-skill` | jalur | Menunjukkan apa saja yang terdampak bila sebuah skill diganti nama, diubah, atau dihapus. | `scripts/dampak_skill.py` |
| 25 | `graphify-peta-keluarga-skill` | jalur | Menggambar diagram dan tabel keluarga skill dari indeks atau dari rujukan antarskill. | `scripts/diagram_keluarga.py` |

## Kelompok E - Ekspor, integrasi, dan otomasi

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 26 | `graphify-ekspor-visual` | jalur | Membuat peta visual: HTML interaktif, pohon folder, diagram alur panggilan, SVG, dan GraphML. | - |
| 27 | `graphify-ekspor-database` | jalur | Mengekspor graph ke Neo4j atau FalkorDB, sebagai berkas Cypher atau langsung dikirim. | - |
| 28 | `graphify-server-mcp` | jalur | Menjalankan graph sebagai server MCP agar agen dan aplikasi lain bisa bertanya langsung. | `references/konfigurasi-mcp.md` |
| 29 | `graphify-otomasi-git` | jalur | Mengatur hook git, merge driver graph.json, mode watch, dan kebijakan commit graph. | `references/kebijakan-commit.md` |
| 30 | `graphify-gabung-graph` | jalur | Menggabungkan beberapa graph (kode, dokumen, skill, antarrepo) dan mengelola graph global. | - |
| 31 | `graphify-mode-always-on` | jalur | Mengatur aturan always-on di CLAUDE.md, hook asisten, mode ketat, dan pembungkus aman hook. | `scripts/bungkus_hook.py`, `references/platform-lain.md` |

## Kelompok F - Perawatan dan pemecahan masalah

| No | Skill | Peran | Fungsi | File pendukung |
|---|---|---|---|---|
| 32 | `graphify-atasi-masalah` | jalur | Mencocokkan gejala error graphify dengan penyebab dan langkah perbaikan yang sudah teruji. | `references/katalog-gejala.md` |
| 33 | `graphify-kelola-versi` | jalur | Menaikkan, menurunkan, atau mencopot graphify tanpa kehilangan graph, nama komunitas, dan pengaman hook. | - |

## Pemilik tiap keputusan

| Keputusan | Pemilik tunggal |
|---|---|
| Skill graphify mana yang dijalankan berikutnya | `graphify-dirigen` |
| Versi, extra, dan cara pasang CLI graphify | `graphify-pasang-cli` |
| Status kesiapan lingkungan graphify | `graphify-diagnosa-lingkungan` |
| Isi register graph (graph-register.csv) | `graphify-catatan-graph` |
| Izin memakai token dan mengirim isi ke layanan luar | `graphify-penjaga-biaya` |
| Lulus atau tidaknya gerbang G1-G4 | `graphify-gerbang-mutu` |
| Ruang lingkup, mode, dan lokasi tiap graph | `graphify-rencana-korpus` |
| Aturan pengecualian dan bahasa ekstensi | `graphify-atur-pengecualian` |
| Build graph kode (AST) | `graphify-bangun-graph-kode` |
| Build graph lengkap (kode dan semantik) | `graphify-bangun-graph-lengkap` |
| Nama komunitas (.graphify_labels.json) | `graphify-namai-komunitas` |
| Laporan kesehatan graph | `graphify-audit-graph` |
| Cara dan waktu pembaruan graph | `graphify-perbarui-graph` |
| Perbandingan dua versi graph | `graphify-banding-graph` |
| Build graph dokumen | `graphify-graph-dokumen` |
| Jawaban berbasis graph dokumen | `graphify-tanya-dokumen` |
| Sumber luar yang masuk korpus | `graphify-tambah-sumber` |
| Transkrip media dan model Whisper yang dipakai | `graphify-transkrip-media` |
| Wiki dan vault Obsidian dari graph | `graphify-ekspor-pengetahuan` |
| Catatan hasil jawaban dan pelajaran graph | `graphify-memori-jawaban` |
| Build graph perpustakaan skill | `graphify-graph-skill` |
| Daftar skill tumpang tindih dan usulannya | `graphify-cari-tumpang-tindih-skill` |
| Daftar celah dan rujukan rusak perpustakaan skill | `graphify-cari-celah-skill` |
| Daftar dampak perubahan sebuah skill | `graphify-dampak-ubah-skill` |
| Diagram dan peta keluarga skill | `graphify-peta-keluarga-skill` |
| Berkas visual hasil ekspor | `graphify-ekspor-visual` |
| Ekspor dan pengiriman ke database graph | `graphify-ekspor-database` |
| Konfigurasi server MCP graphify | `graphify-server-mcp` |
| Otomasi pembaruan graph dan kebijakan commit | `graphify-otomasi-git` |
| Graph gabungan dan graph global | `graphify-gabung-graph` |
| Integrasi always-on di asisten | `graphify-mode-always-on` |
| Diagnosis gejala error dan perbaikannya | `graphify-atasi-masalah` |
| Naik turun versi dan pencopotan graphify | `graphify-kelola-versi` |

## Keputusan rancangan

- **Fokus pada operasional graphify serta graph dokumen dan perpustakaan skill.** Pilihan pemilik repo pada 2026-11-19. Analisis kode dan navigator per project tidak dibuat; skill resmi graphify tetap menangani tanya-jawab kode.
- **Wiki dan vault Obsidian digabung menjadi graphify-ekspor-pengetahuan.** Keduanya mengubah graph menjadi kumpulan Markdown untuk dibaca; masukan, gerbang, dan pemeriksaannya sama.
- **Konversi PDF dan Office masuk ke graphify-graph-dokumen.** Konversi selalu dijalankan sebagai bagian build dokumen; memisahkannya hanya menambah satu serah terima.
- **Audit dan gerbang dipisah.** Audit mengukur dengan skrip; gerbang memutuskan lulus atau tidak. Sama seperti pemisahan pemeriksa dan gerbang di Studio Wall Art by Nangka.
- **Graph perpustakaan skill dibangun skrip, bukan pass semantik.** Skill adalah Markdown, yang di graphify butuh LLM. Skrip peta_skill.py membaca frontmatter dan rujukan secara pasti, gratis, dan hasilnya tetap bisa dibaca CLI graphify.
- **Pelabelan komunitas tidak memakai backend LLM graphify.** Di sesi cloud CLI claude tersedia dan graphify memakainya sebagai cadangan pelabelan, yang diam-diam memakai token. Nama ditulis oleh model sesi lewat graphify-namai-komunitas, lalu diterapkan dengan --no-label.
