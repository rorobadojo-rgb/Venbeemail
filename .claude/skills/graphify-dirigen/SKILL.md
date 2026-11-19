---
name: graphify-dirigen
description: Pintu masuk keluarga skill graphify berbahasa Indonesia. Pakai setiap kali pengguna menyebut graphify, knowledge graph, graph pengetahuan, graphify-out, GRAPH_REPORT, peta skill, atau meminta sesuatu tentang membangun, memperbarui, merawat, mengekspor, atau memeriksa graph tanpa menyebut skill tertentu, termasuk "mulai graph dari mana?", "urusan graph saya sampai mana?", "rapikan semua graph", atau "langkah graph berikutnya apa?". Membaca keadaan repo, memilih skill yang tepat, menjalankannya berurutan, lalu merangkum hasil. Jangan dipakai bila pengguna sudah menyebut satu skill graphify secara langsung, atau bila pertanyaannya tentang isi kode (itu dijawab skill resmi graphify lewat graphify query).
---

# graphify-dirigen

Pengarah keluarga skill graphify. Tugasnya membaca keadaan, memilih skill, memastikan prasyarat
terpenuhi, lalu merangkum. Dirigen tidak membangun, mengekspor, atau menilai graph sendiri.

Sebelum mulai, baca `references/graphify-core.md`. Peta lengkap 33 skill beserta pemilik tiap
keputusan ada di `references/peta-skill.md` (dibuat otomatis dari indeks).

## Kapan digunakan

- Permintaan tentang graphify atau graph pengetahuan tanpa menyebut skill tertentu.
- Permintaan yang melewati beberapa tahap, misalnya "dari nol sampai graph dokumen siap ditanya".
- Pengguna bertanya langkah berikutnya, status graph, atau ingin melanjutkan pekerjaan graph lama.

## Kapan tidak digunakan

- Pengguna menyebut satu skill langsung: jalankan skill itu saja.
- Pertanyaan tentang isi kode ("apa yang memanggil useMail?"): itu dijawab skill resmi `graphify`
  dengan `graphify query`, `path`, atau `explain`. Keluarga ini tidak memiliki tanya-jawab kode.
- Ketik `/graphify ...` secara eksplisit: skill resmi yang berjalan; dirigen hanya membantu bila diminta.
- Permintaan tentang bisnis wall art, koleksi, atau toko Etsy (termasuk "langkah berikutnya" untuk proyek
  studio): itu wilayah `studio-wall-art-orchestrator`, kecuali yang diminta adalah graph-nya.

## Input

- Wajib: permintaan pengguna.
- Opsional: corpus_id yang dimaksud, isi `graphify-kerja/register/graph-register.csv`, rencana di
  `graphify-kerja/rencana/`.

## Default

- Selalu mulai dengan membaca keadaan lewat `graphify-diagnosa-lingkungan` (skrip hanya membaca, cepat).
- Tanpa corpus_id: anggap graph utama `KRP-repo` di `graphify-out/`.
- Jalankan paling banyak tiga skill per giliran, lalu laporkan. Jalur penuh hanya bila diminta.
- CLI belum ada: `graphify-pasang-cli` dulu, apa pun permintaannya.

## Pertanyaan bila info penting belum ada

Tanyakan hanya bila jawabannya mengubah rute, paling banyak dua, dengan pilihan:

1. "Graph yang dimaksud graph utama repo, graph dokumen, atau graph perpustakaan skill?"
2. "Cukup graph kode yang gratis, atau sertakan dokumen (memakai token)?"

## Langkah kerja

1. Jalankan diagnosa: `python3 .claude/skills/graphify-diagnosa-lingkungan/scripts/cek_lingkungan.py`.
2. Cocokkan permintaan dengan tabel rute di bawah. Bila keadaan menghalangi (CLI tidak ada, graph
   belum ada, graph basi), sisipkan skill prasyarat lebih dulu.
3. Sebelum skill yang memakai token atau mengirim isi ke luar, pastikan `graphify-penjaga-biaya`
   sudah meminta izin.
4. Jalankan skill terpilih. Baca blok SERAH TERIMA-nya, lalu tentukan skill berikutnya.
5. Berhenti setelah tiga skill atau saat butuh keputusan pengguna. Laporkan sesuai aturan inti
   bagian 10.

Tabel rute:

| Permintaan | Skill |
|---|---|
| Pasang, CLI hilang, "command not found" saat pasang | `graphify-pasang-cli` |
| "Sudah siap belum?", status, cek lingkungan | `graphify-diagnosa-lingkungan` |
| Daftar graph yang pernah dibuat | `graphify-catatan-graph` |
| "Mahal tidak?", berapa token, izin kirim ke API | `graphify-penjaga-biaya` |
| "Sudah layak?", nilai hasil, boleh commit | `graphify-gerbang-mutu` |
| Rencanakan graph baru, tentukan isi graph | `graphify-rencana-korpus` |
| Hasil penuh sampah, minified, gambar ikut | `graphify-atur-pengecualian` |
| Bangun graph kode, gratis, cepat | `graphify-bangun-graph-kode` |
| Bangun graph lengkap dengan dokumen dan gambar | `graphify-bangun-graph-lengkap` |
| Komunitas bernama "Community N", ganti nama | `graphify-namai-komunitas` |
| Graph sehat tidak, kualitas, noise | `graphify-audit-graph` |
| Kode atau dokumen berubah, perbarui graph | `graphify-perbarui-graph` |
| Apa bedanya graph sekarang dan kemarin | `graphify-banding-graph` |
| Graph untuk PRD, panduan, catatan, PDF | `graphify-graph-dokumen` |
| Tanya isi dokumen lewat graph | `graphify-tanya-dokumen` |
| Tambah artikel, paper, video dari URL | `graphify-tambah-sumber` |
| Transkrip video atau audio lokal | `graphify-transkrip-media` |
| Wiki atau vault Obsidian | `graphify-ekspor-pengetahuan` |
| Catat jawaban berguna, pelajaran dari tanya-jawab | `graphify-memori-jawaban` |
| Petakan semua skill | `graphify-graph-skill` |
| Skill mana yang mirip atau berebut pemicu | `graphify-cari-tumpang-tindih-skill` |
| Rujukan rusak, skill yatim, file mati | `graphify-cari-celah-skill` |
| "Kalau skill X diganti nama, apa yang kena?" | `graphify-dampak-ubah-skill` |
| Diagram keluarga skill | `graphify-peta-keluarga-skill` |
| HTML, pohon, diagram alur, SVG, GraphML | `graphify-ekspor-visual` |
| Neo4j atau FalkorDB | `graphify-ekspor-database` |
| Server MCP untuk agen lain | `graphify-server-mcp` |
| Hook git, auto-rebuild, watch, kebijakan commit | `graphify-otomasi-git` |
| Gabung beberapa graph, graph global | `graphify-gabung-graph` |
| Always-on, CLAUDE.md, hook asisten, mode ketat | `graphify-mode-always-on` |
| Error, gagal, hasil aneh | `graphify-atasi-masalah` |
| Upgrade, downgrade, copot graphify | `graphify-kelola-versi` |

Jalur baku:

- **Graph baru:** rencana-korpus, atur-pengecualian, bangun (kode, lengkap, atau dokumen),
  namai-komunitas, audit-graph, lalu gerbang-mutu G2.
- **Perawatan:** perbarui-graph, namai-komunitas bila ada komunitas baru, audit-graph.
- **Perpustakaan skill:** graph-skill, lalu tumpang-tindih, celah, dampak, atau peta-keluarga sesuai tujuan.

## Aturan keputusan

- Prasyarat selalu menang: tanpa CLI tidak ada build; tanpa graph tidak ada audit, ekspor, atau tanya.
- Graph basi (diagnosa PERINGATAN kesegaran) dan permintaan memakai graph: tawarkan perbarui dulu
  dalam satu kalimat, lalu ikuti pilihan pengguna.
- Ada dua skill yang cocok: pilih yang lebih awal di jalur baku, sebutkan yang lain sebagai langkah berikut.
- Permintaan di luar keluarga (tanya kode, Etsy, desain): katakan bukan wilayah keluarga ini dan
  sebut skill yang lebih cocok bila tahu.

## Format hasil

```
KEADAAN: CLI 0.9.112 OK | graph KRP-repo 835 node, 48 komunitas | segar
DIJALANKAN: graphify-audit-graph -> 0 GAGAL, 0 PERINGATAN, 2 INFO
BERIKUTNYA (saran): graphify-ekspor-pengetahuan untuk wiki
BELUM: transkrip media (tidak ada berkas video)
```

## Pemeriksaan kualitas

- Setiap skill yang disebut "dijalankan" punya bukti keluaran.
- Tidak ada skill bertoken yang jalan tanpa izin tercatat.
- Laporan menyebut satu langkah berikutnya yang paling berguna, bukan daftar panjang.

## Penanganan kesalahan

- Diagnosa gagal dijalankan (tidak ada Python atau repo): lanjut dengan pertanyaan ke pengguna dan
  katakan keadaan tidak bisa dibaca.
- Skill di tengah jalur gagal: hentikan jalur, laporkan error apa adanya, arahkan ke `graphify-atasi-masalah`.
- Permintaan ambigu antara dua korpus: ajukan pertanyaan 1, jangan menebak.

## Serah terima

Pintu masuk tidak menerima serah terima balik. Dirigen membaca blok SERAH TERIMA dari skill yang
dijalankannya untuk memilih langkah berikutnya, lalu menutup giliran dengan format hasil di atas.

## Batas kemampuan alat

Dirigen hanya mengarahkan. Di claude.ai tanpa repo, diagnosa tidak bisa dijalankan; tanyakan
keadaan kepada pengguna atau minta mereka mengunggah `graph.json` dan `GRAPH_REPORT.md`.

## Contoh penggunaan

Pengguna: "Saya mau semua dokumen PRD bisa ditanya." Diagnosa: CLI OK, graph utama kode saja.
Rute: `graphify-rencana-korpus` (korpus `KRP-dokumen-prd`, folder `docs/`), `graphify-penjaga-biaya`
(±81 ribu token, pengguna setuju), lalu `graphify-graph-dokumen`. Berhenti, laporkan, sarankan
`graphify-namai-komunitas` berikutnya.

## Contoh kegagalan dan perbaikannya

Gagal: dirigen langsung menjalankan `/graphify .` untuk "bikin graph semuanya", sehingga 165 dokumen
dibaca model tanpa izin (±325 ribu token). Perbaikan: build lengkap selalu lewat
`graphify-penjaga-biaya` lebih dulu; dirigen menawarkan graph kode gratis sebagai langkah pertama.

## Cara menguji skill ini

Beri permintaan "graph saya kok isinya fungsi aneh satu huruf semua?" pada repo dengan file
`*.min.js` tanpa `.graphifyignore`. Hasil benar: diagnosa dijalankan, rute ke
`graphify-atur-pengecualian` lalu `graphify-perbarui-graph`, tanpa build lengkap dan tanpa token.
