# Peta Skill Keluarga Graphify

Dibuat otomatis dari indeks arsitektur. Pakai untuk memilih skill dan mengetahui pemilik tiap keputusan.
Skill resmi `graphify` (pipeline /graphify) bukan bagian indeks ini, tetapi dipakai oleh skill build.

## A. Pintu masuk dan fondasi

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-dirigen | pintu masuk | Membaca keadaan graphify di repo, memilih skill yang tepat, menjalankannya berurutan, dan merangkum hasilnya. | Skill graphify mana yang dijalankan berikutnya | - | - |
| graphify-pasang-cli | layanan | Memastikan CLI graphify terpasang dengan versi dan extra yang tepat, termasuk di container cloud yang selalu baru. | Versi, extra, dan cara pasang CLI graphify | - | - |
| graphify-diagnosa-lingkungan | layanan | Memeriksa kesiapan lingkungan: CLI, graph, kesegaran graph, hook, pengecualian, extra, dan backend LLM. | Status kesiapan lingkungan graphify | - | - |
| graphify-catatan-graph | layanan | Mencatat setiap graph yang dibangun (lokasi, lingkup, mode, ukuran, commit, biaya) di register. | Isi register graph (graph-register.csv) | - | - |
| graphify-penjaga-biaya | layanan | Memperkirakan token dan waktu sebelum pass semantik, lalu meminta izin sebelum isi dikirim ke model atau layanan luar. | Izin memakai token dan mengirim isi ke layanan luar | - | - |
| graphify-gerbang-mutu | layanan | Menilai lulus atau tidaknya pekerjaan graphify di gerbang G1 rencana, G2 graph sehat, G3 siap commit, dan G4 ekspor. | Lulus atau tidaknya gerbang G1-G4 | - | - |

## B. Membangun dan merawat graph

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-rencana-korpus | jalur | Menentukan apa yang masuk ke tiap graph, mode build, lokasi keluaran, dan corpus_id. | Ruang lingkup, mode, dan lokasi tiap graph | graphify-atur-pengecualian | graphify-penjaga-biaya, graphify-catatan-graph, graphify-gerbang-mutu |
| graphify-atur-pengecualian | jalur | Menyusun .graphifyignore dan .graphifyrc lalu membuktikan efeknya dengan uji kering. | Aturan pengecualian dan bahasa ekstensi | graphify-bangun-graph-kode, graphify-bangun-graph-lengkap, graphify-graph-dokumen | graphify-pasang-cli |
| graphify-bangun-graph-kode | jalur | Membangun graph kode secara lokal dan gratis lewat AST tree-sitter, tanpa LLM. | Build graph kode (AST) | graphify-namai-komunitas | graphify-pasang-cli, graphify-catatan-graph |
| graphify-bangun-graph-lengkap | jalur | Membangun graph lengkap (kode plus dokumen, PDF, dan gambar) lewat skill resmi /graphify atau backend API. | Build graph lengkap (kode dan semantik) | graphify-namai-komunitas | graphify-pasang-cli, graphify-penjaga-biaya, graphify-catatan-graph |
| graphify-namai-komunitas | jalur | Memberi nama komunitas graph dalam bahasa Indonesia dan menyimpannya agar bertahan saat rebuild. | Nama komunitas (.graphify_labels.json) | graphify-audit-graph | - |
| graphify-audit-graph | jalur | Mengukur kesehatan graph: noise, edge tebakan, komunitas tipis, kesegaran, dan path sensitif. | Laporan kesehatan graph | - | graphify-gerbang-mutu |
| graphify-perbarui-graph | jalur | Memperbarui graph setelah kode atau dokumen berubah, termasuk saat graph memang harus mengecil. | Cara dan waktu pembaruan graph | graphify-namai-komunitas | graphify-pasang-cli, graphify-catatan-graph |
| graphify-banding-graph | jalur | Membandingkan dua versi graph: node, relasi, file, dan komunitas yang bertambah, hilang, atau pindah. | Perbandingan dua versi graph | - | - |

## C. Graph dokumen dan sumber pengetahuan

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-graph-dokumen | jalur | Membangun graph khusus dokumen (Markdown, PDF, Office) seperti PRD, panduan, dan catatan. | Build graph dokumen | graphify-namai-komunitas | graphify-pasang-cli, graphify-penjaga-biaya, graphify-catatan-graph |
| graphify-tanya-dokumen | jalur | Menjawab pertanyaan dari graph dokumen dengan rujukan file dan judul bagian. | Jawaban berbasis graph dokumen | - | graphify-memori-jawaban |
| graphify-tambah-sumber | jalur | Memasukkan artikel, paper, dan video dari URL ke korpus dengan penanda penulis dan penyumbang. | Sumber luar yang masuk korpus | graphify-perbarui-graph | graphify-penjaga-biaya, graphify-catatan-graph |
| graphify-transkrip-media | jalur | Mentranskripsi video dan audio lokal dengan Whisper agar isinya bisa masuk graph. | Transkrip media dan model Whisper yang dipakai | graphify-graph-dokumen | graphify-pasang-cli, graphify-penjaga-biaya |
| graphify-ekspor-pengetahuan | jalur | Mengekspor graph menjadi wiki Markdown dan vault Obsidian untuk dibaca manusia dan agen. | Wiki dan vault Obsidian dari graph | - | graphify-pasang-cli |
| graphify-memori-jawaban | layanan | Menyimpan hasil tanya-jawab yang berguna, buntu, atau dikoreksi, lalu menyarikan pelajarannya. | Catatan hasil jawaban dan pelajaran graph | - | - |

## D. Graph perpustakaan skill

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-graph-skill | jalur | Membangun graph perpustakaan skill (skill, file pendukung, rujukan, serah terima) tanpa LLM. | Build graph perpustakaan skill | graphify-cari-tumpang-tindih-skill, graphify-cari-celah-skill, graphify-dampak-ubah-skill, graphify-peta-keluarga-skill | graphify-pasang-cli, graphify-catatan-graph |
| graphify-cari-tumpang-tindih-skill | jalur | Menemukan skill yang fungsinya mirip atau pemicunya berebut, lalu mengusulkan gabung, persempit, atau ganti nama. | Daftar skill tumpang tindih dan usulannya | - | - |
| graphify-cari-celah-skill | jalur | Menemukan rujukan rusak, skill yatim, file mati, dan keluarga skill tanpa pintu masuk. | Daftar celah dan rujukan rusak perpustakaan skill | - | - |
| graphify-dampak-ubah-skill | jalur | Menunjukkan apa saja yang terdampak bila sebuah skill diganti nama, diubah, atau dihapus. | Daftar dampak perubahan sebuah skill | - | - |
| graphify-peta-keluarga-skill | jalur | Menggambar diagram dan tabel keluarga skill dari indeks atau dari rujukan antarskill. | Diagram dan peta keluarga skill | - | - |

## E. Ekspor, integrasi, dan otomasi

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-ekspor-visual | jalur | Membuat peta visual: HTML interaktif, pohon folder, diagram alur panggilan, SVG, dan GraphML. | Berkas visual hasil ekspor | - | graphify-pasang-cli |
| graphify-ekspor-database | jalur | Mengekspor graph ke Neo4j atau FalkorDB, sebagai berkas Cypher atau langsung dikirim. | Ekspor dan pengiriman ke database graph | - | graphify-pasang-cli, graphify-penjaga-biaya |
| graphify-server-mcp | jalur | Menjalankan graph sebagai server MCP agar agen dan aplikasi lain bisa bertanya langsung. | Konfigurasi server MCP graphify | - | graphify-pasang-cli |
| graphify-otomasi-git | jalur | Mengatur hook git, merge driver graph.json, mode watch, dan kebijakan commit graph. | Otomasi pembaruan graph dan kebijakan commit | - | graphify-pasang-cli |
| graphify-gabung-graph | jalur | Menggabungkan beberapa graph (kode, dokumen, skill, antarrepo) dan mengelola graph global. | Graph gabungan dan graph global | graphify-namai-komunitas | graphify-pasang-cli, graphify-catatan-graph |
| graphify-mode-always-on | jalur | Mengatur aturan always-on di CLAUDE.md, hook asisten, mode ketat, dan pembungkus aman hook. | Integrasi always-on di asisten | - | graphify-pasang-cli |

## F. Perawatan dan pemecahan masalah

| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|---|
| graphify-atasi-masalah | jalur | Mencocokkan gejala error graphify dengan penyebab dan langkah perbaikan yang sudah teruji. | Diagnosis gejala error dan perbaikannya | - | graphify-diagnosa-lingkungan |
| graphify-kelola-versi | jalur | Menaikkan, menurunkan, atau mencopot graphify tanpa kehilangan graph, nama komunitas, dan pengaman hook. | Naik turun versi dan pencopotan graphify | graphify-mode-always-on | graphify-pasang-cli, graphify-diagnosa-lingkungan |
