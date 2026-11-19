# Keluarga Skill Graphify

33 skill berbahasa Indonesia untuk menjalankan graphify di repo ini: memasang dan merawatnya,
membangun graph kode, dokumen, dan perpustakaan skill, serta mengekspor dan mengintegrasikannya.
Dibangun 19 November 2026 untuk graphifyy 0.9.112.

Keluarga ini dibuat komunitas (oleh pemilik repo bersama Claude). Ia tidak berafiliasi dengan dan
tidak didukung Graphify Labs. Skill resmi `graphify` (`/graphify`) tetap dipakai untuk pipeline
build; keluarga ini mengatur semua hal di sekitarnya.

## Status

| Hal | Status | Bukti |
|---|---|---|
| 33 skill ditulis lengkap | selesai | `.claude/skills/graphify-*/` |
| Uji struktur | lulus, 1.347 pemeriksaan | `python3 keluarga-graphify/tools/run_tests.py` |
| Uji unit 12 skrip | lulus, 34 uji | `python3 keluarga-graphify/tests/test_scripts.py` |
| Validator resmi skill-creator | lulus, 33 dari 33 | `quick_validate.py` |
| Uji perjalanan dengan CLI graphify asli | lulus, 18 dari 18 langkah | `python3 keluarga-graphify/tools/uji_perjalanan.py` |
| Graph utama `KRP-repo` | 1.027 node, 54 komunitas bernama, audit 0 GAGAL 0 PERINGATAN | `graphify-out/`, `graphify-kerja/audit/` |
| Graph perpustakaan skill `KRP-skill` | 79 skill, 17 komunitas bernama, audit tanpa temuan | `graphify-kerja/graph/KRP-skill/` |
| Paket `.skill` untuk claude.ai | 33 berkas + 1 bundel | `keluarga-graphify/dist/` |
| Terpasang di akun claude.ai | belum | unggah dari `dist/` (lihat bawah) |
| Pemicu diuji di percakapan sungguhan | belum | frasa pemicu sudah dicek bentrok secara otomatis; lihat `HASIL-UJI.md` |

## Mulai cepat

Ketik keinginan dengan bahasa biasa; `graphify-dirigen` memilihkan skill. Contoh:

- "Graph saya masih segar?" -> diagnosa lingkungan.
- "Petakan semua skill saya, lalu cari yang tumpang tindih." -> graph skill, tumpang tindih.
- "Saya mau PRD di docs bisa ditanya." -> rencana korpus, perkiraan biaya, graph dokumen.
- "Kalau studio-brand-memory saya ganti nama, apa yang rusak?" -> dampak ubah skill.
- "Buatkan wiki dari graph." -> ekspor pengetahuan.
- "Setiap baca berkas muncul error hook graphify." -> mode always-on.

Di sesi cloud baru, CLI graphify belum ada. Skill mana pun yang butuh CLI memanggil
`graphify-pasang-cli` lebih dulu (±1 menit).

## Enam kelompok

| Kelompok | Skill |
|---|---|
| A. Pintu masuk dan fondasi | dirigen, pasang-cli, diagnosa-lingkungan, catatan-graph, penjaga-biaya, gerbang-mutu |
| B. Membangun dan merawat graph | rencana-korpus, atur-pengecualian, bangun-graph-kode, bangun-graph-lengkap, namai-komunitas, audit-graph, perbarui-graph, banding-graph |
| C. Graph dokumen dan sumber pengetahuan | graph-dokumen, tanya-dokumen, tambah-sumber, transkrip-media, ekspor-pengetahuan, memori-jawaban |
| D. Graph perpustakaan skill | graph-skill, cari-tumpang-tindih-skill, cari-celah-skill, dampak-ubah-skill, peta-keluarga-skill |
| E. Ekspor, integrasi, dan otomasi | ekspor-visual, ekspor-database, server-mcp, otomasi-git, gabung-graph, mode-always-on |
| F. Perawatan dan pemecahan masalah | atasi-masalah, kelola-versi |

Semua nama diawali `graphify-`. Diagram lengkap: `PETA-KELUARGA.md`. Daftar dengan fungsi dan berkas
pendukung: `INDEKS-SKILL.md`. Alasan rancangan: `ARSITEKTUR.md`.

## Dua belas skrip yang benar-benar menghitung

| Skrip | Skill | Gunanya |
|---|---|---|
| `cek_lingkungan.py` | diagnosa-lingkungan | Status CLI, graph, kesegaran, hook, extra, backend |
| `catat_graph.py` | catatan-graph | Register graph; angka dibaca dari graph.json |
| `perkiraan_biaya.py` | penjaga-biaya | Token pass semantik memakai `detect()` graphify |
| `namai_komunitas.py` | namai-komunitas | Ringkas, tulis, terapkan, dan verifikasi nama komunitas tanpa LLM graphify |
| `audit_graph.py` | audit-graph | Noise, minified, path sensitif, edge tebakan, kesegaran |
| `banding_graph.py` | banding-graph | Selisih dua versi graph, termasuk dari git |
| `peta_skill.py` | graph-skill | Graph perpustakaan skill format graphify, tanpa LLM |
| `cek_tumpang_tindih.py` | cari-tumpang-tindih-skill | Skill mirip dan frasa pemicu yang berebut |
| `cek_celah_skill.py` | cari-celah-skill | Rujukan rusak, frontmatter rusak, yatim, file mati |
| `dampak_skill.py` | dampak-ubah-skill | Dampak ganti nama atau hapus skill, plus penerapannya |
| `diagram_keluarga.py` | peta-keluarga-skill | Diagram Mermaid keluarga skill |
| `bungkus_hook.py` | mode-always-on | Pembungkus aman hook agar diam tanpa CLI |

Semuanya hanya butuh Python standar; tiga di antaranya memanggil CLI graphify bila ada.

## Letak berkas

```
.claude/skills/graphify-*/           33 skill (SKILL.md, references/, assets/, scripts/)
.claude/skills/graphify/             skill resmi /graphify (jangan diedit; ditimpa graphify install)
graphify-out/                        graph utama KRP-repo (di-commit, kecuali cache)
graphify-kerja/
  register/graph-register.csv          daftar graph
  rencana/                             rencana tiap korpus
  audit/                               laporan audit bertanggal
  graph/KRP-skill/graphify-out/        graph perpustakaan skill
keluarga-graphify/
  README.md, ARSITEKTUR.md, INDEKS-SKILL.md, PETA-KELUARGA.md, HASIL-UJI.md, PROGRES.md
  skill-index.json                     sumber kebenaran arsitektur
  _shared/graphify-core.md             aturan inti; disalin ke tiap skill
  tools/                               sinkron, indeks, uji, uji perjalanan, kemas
  tests/test_scripts.py                uji unit skrip
  dist/                                33 berkas .skill dan satu bundel
docs/graphify/PANDUAN-GRAPHIFY.md    panduan pemakaian graphify
```

## Memasang di akun claude.ai

Di repo ini skill sudah aktif untuk sesi Claude Code. Agar tersedia juga di claude.ai:

1. Unduh berkas `.skill` dari `dist/` (atau bundel `keluarga-graphify-semua-skill.zip`, lalu buka ZIP-nya).
2. Di claude.ai buka pengaturan skill dan unggah tiap berkas `.skill`.
3. Bila tidak ingin semuanya, mulai dari tujuh ini: `graphify-dirigen`, `graphify-pasang-cli`,
   `graphify-diagnosa-lingkungan`, `graphify-graph-skill`, `graphify-cari-tumpang-tindih-skill`,
   `graphify-cari-celah-skill`, `graphify-dampak-ubah-skill`.

Di claude.ai tanpa repo dan CLI, skill menyusun perintah dan membaca berkas yang diunggah; skrip
dijalankan bila lingkungan mengizinkan eksekusi kode.

## Merawat keluarga

Urutan setelah mengubah skill: sinkron, indeks, uji, kemas.

```bash
python3 keluarga-graphify/tools/sync_shared.py
python3 keluarga-graphify/tools/build_index.py
python3 keluarga-graphify/tools/run_tests.py
python3 keluarga-graphify/tools/uji_perjalanan.py
python3 keluarga-graphify/tools/build_dist.py
```

Aturan inti diubah di `_shared/graphify-core.md`, bukan di salinannya.

## Batasan yang masih ada

1. **Container cloud selalu baru.** CLI graphify dan hook git hilang tiap sesi; skill memasang CLI
   bila perlu. Lingkungan "Venbeemail - Studio Wall Art (Etsy)" tidak bisa diberi skrip pemasangan
   otomatis dari sesi ini karena namanya memuat tanda kurung; ganti namanya di Settings, Environments
   bila ingin pemasangan otomatis.
2. **unpkg.com diblokir di sesi cloud**, jadi `graph.html` tampak kosong bila dibuka di container.
   Di browser Anda normal.
3. **Graph dokumen belum dibangun.** Pass semantik untuk ±165 dokumen repo diperkirakan ±325 ribu
   token; menunggu keputusan Anda (bisa dipersempit, misalnya `docs/` saja ±81 ribu token).
4. **Pemicu skill belum diuji di percakapan sungguhan secara menyeluruh.** Struktur, rujukan, frasa
   pemicu yang bentrok, dan skrip sudah diuji otomatis.
5. **Edge INFERRED tetap tebakan.** Tiga edge di graph utama menyambung `hero()` situs Pro dan Kong
   hanya karena namanya sama.
6. **33 deskripsi skill selalu termuat** di sesi repo ini, bersama skill keluarga lain dan skill akun.
   Bila pemicu terasa berebut, panggil skill dengan namanya.
