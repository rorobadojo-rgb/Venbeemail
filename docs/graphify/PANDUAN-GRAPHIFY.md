# Panduan graphify untuk repo Venbeemail

graphify mengubah isi repo (kode, dokumen, PDF, gambar, video) menjadi **knowledge graph**: peta
berisi simbol (fungsi, komponen, file, konsep) dan hubungan di antaranya (memanggil, mengimpor,
mewarisi, dan seterusnya). Setelah graph jadi, Claude bisa **bertanya ke graph** alih-alih membuka
file satu per satu. Hasilnya jawaban lebih cepat dan jauh lebih hemat token.

Versi yang terpasang: **graphifyy 0.9.112** (dari `graphify-8.zip`, sama dengan rilis di PyPI).

---

## 1. Yang sudah terpasang di repo ini

| File | Fungsi |
|---|---|
| `.claude/skills/graphify/` | Skill resmi `/graphify` (SKILL.md + 8 referensi). Dibaca otomatis oleh Claude Code. |
| `.claude/CLAUDE.md` | Pendaftaran skill: saat Anda mengetik `/graphify`, Claude memakai skill ini. |
| `CLAUDE.md` (bagian `## graphify`) | Mode *always-on*: kalau `graphify-out/graph.json` ada, Claude bertanya ke graph dulu sebelum grep atau membaca file. |
| `.claude/settings.json` | Hook yang mengingatkan Claude memakai graph sebelum Read/Grep/Glob/Bash. Sudah dibuat **aman**: kalau CLI graphify belum terpasang, hook diam saja (tidak error). |
| `.graphifyignore` | Daftar yang tidak dimasukkan ke graph: library `*.min.js` dan ±850 gambar/video. |
| `graphify-out/` | Graph utama repo (`KRP-repo`): 1.023 node, 53 komunitas bernama Indonesia. Di-commit, kecuali cache. |
| `.claude/skills/graphify-*/` | **Keluarga 33 skill graphify** berbahasa Indonesia (lihat bagian 12). |
| `graphify-kerja/` | Register graph, rencana korpus, laporan audit, dan graph perpustakaan skill (`KRP-skill`). |
| `keluarga-graphify/` | Dokumen, indeks, alat uji, dan paket `.skill` keluarga skill graphify. |

> **Catatan sesi cloud.** Container Claude Code di web selalu mulai dari nol, jadi CLI `graphify`
> hilang setiap sesi baru. Tidak masalah: skill `/graphify` memasangnya sendiri bila belum ada
> (sekitar satu menit). Untuk memasang manual, lihat langkah 1.

---

## 2. Langkah cepat (5 langkah)

### Langkah 1. Pastikan CLI tersedia

```bash
graphify --version          # harus menampilkan: graphify 0.9.112
```

Kalau muncul `command not found`:

```bash
uv tool install "graphifyy[mcp,watch,pdf,office,svg,sql]==0.9.112"
# alternatif: pipx install graphifyy   atau   pip install graphifyy
```

Masih tidak ketemu setelah install? Jalankan `uv tool update-shell`, lalu buka terminal baru.

### Langkah 2. Bangun graph

Pilih salah satu:

| Cara | Perintah | Biaya | Isi graph |
|---|---|---|---|
| **Lewat Claude** (lengkap) | ketik `/graphify .` di chat | Kode gratis; dokumen dibaca model (makan token) | Kode + dokumen Markdown/PDF |
| **Hemat** (kode saja) | `graphify extract . --code-only` lalu `graphify cluster-only . --no-label` | Gratis, ±5 detik, tanpa internet | Kode saja |

Di repo ini, jalur hemat menghasilkan **835 node, 1.693 relasi, 48 komunitas** dari 118 file kode.
Jalur lengkap menambah ±160 dokumen Markdown (PRD, panduan, isi skill).

**Nama komunitas.** `--no-label` membuat nama sementara "Community 0", "Community 1", dan
seterusnya. Minta Claude "beri nama komunitas graph dalam bahasa Indonesia": Claude membaca anggota
tiap komunitas, menulis `graphify-out/.graphify_labels.json`, lalu menjalankan
`graphify cluster-only . --no-label` lagi. Nama yang sudah ada dipakai ulang selama anggota
komunitasnya tidak berubah. Tanpa `--no-label`, graphify mencoba menamai sendiri lewat model yang
tersedia (API key, atau CLI `claude` di sesi cloud), dan itu memakai token.

### Langkah 3. Buka hasilnya

```
graphify-out/
├── graph.html        peta interaktif: klik node, cari, filter per komunitas (buka di browser)
├── GRAPH_REPORT.md   ringkasan: god node, komunitas, koneksi mengejutkan, saran pertanyaan
└── graph.json        graph lengkap; inilah yang dibaca query/path/explain
```

### Langkah 4. Bertanya ke graph

| Perintah | Kegunaan |
|---|---|
| `graphify query "<pertanyaan>"` | Pertanyaan bebas → subgraph yang relevan |
| `graphify explain "<simbol>"` | Satu simbol beserta semua koneksinya |
| `graphify path "<A>" "<B>"` | Jalur terpendek antara dua hal |
| `graphify affected "<simbol>"` | Apa saja yang terdampak kalau simbol ini diubah |
| `graphify god-nodes --top 10` | Simbol paling terhubung (pusat arsitektur) |
| `graphify section "<judul>"` | Isi satu bagian Markdown (butuh graph yang memuat dokumen) |

Di chat, cukup tanyakan biasa ("komponen apa saja yang memakai prefersReducedMotion?"). Mode
always-on membuat Claude memakai perintah di atas sendiri.

### Langkah 5. Jaga graph tetap segar

```bash
graphify update .        # setelah mengubah kode (gratis, hanya file yang berubah)
/graphify . --update     # di chat, setelah mengubah dokumen (dokumen dibaca ulang oleh model)
graphify update . --force   # setelah menghapus/memindah banyak file (graph boleh mengecil)
```

---

## 3. Contoh nyata dari repo ini

**Menjelaskan satu komponen**

```text
$ graphify explain "GeneratorPanel()"
Node: GeneratorPanel()
  Source:    components/panels/GeneratorPanel.tsx L24
  Community: Starburst & Panel Hero
  Degree:    14
Connections (14):
  <-- ComicPage() [calls] [EXTRACTED] components/ComicPage.tsx:L334
  --> useMail() [calls] [EXTRACTED] components/panels/GeneratorPanel.tsx:L25
  --> DomainFan() [calls] [EXTRACTED] components/panels/GeneratorPanel.tsx:L142
  --> copyText() [calls] [EXTRACTED] components/panels/GeneratorPanel.tsx:L91
  --> burst() [calls] [EXTRACTED] components/panels/GeneratorPanel.tsx:L71
  ...
```

**Menelusuri alur dari halaman ke pembuat alamat email**

```text
$ graphify path "Home()" "generateLocalPart()"
Shortest path (3 hops):
  Home() --calls--> ComicPage() --calls--> loadMail() --calls--> generateLocalPart()
Path confidence: EXTRACTED (weakest hop 1: calls)
```

**Mengecek dampak sebelum mengubah fungsi**

```text
$ graphify affected "prefersReducedMotion()" --depth 1
- TypewriterBubble()  components/comic/Bubble.tsx:L46
- ComicButton()       components/comic/ComicButton.tsx:L37
- DoodleField()       components/doodles/DoodleField.tsx:L32
- Mascot()            components/mascot/Mascot.tsx:L82
- GeneratorPanel()    components/panels/GeneratorPanel.tsx:L46
- InboxPanel()        components/panels/InboxPanel.tsx:L81
- burst()             lib/burst.ts:L51
```

**Hemat token** (`graphify benchmark`): rata-rata satu pertanyaan ke graph memakai ±1.610 token,
**34,6 kali lebih sedikit** dibanding membaca file mentahnya.

---

## 4. Cara membaca hasil

- **EXTRACTED**: hubungan tertulis langsung di kode (impor, pemanggilan). Bisa dipercaya penuh.
- **INFERRED**: hubungan hasil tebakan graphify, dengan skor 0,55 sampai 0,95. Periksa dulu.
  Contoh di repo ini: `hero()` di `situs-pro/aset/vbpro/hero.js` disambungkan ke `hero()` di
  `situs-pro-kong/aset/vbkong/gerak.js` hanya karena namanya sama. Padahal dua situs itu terpisah.
- **AMBIGUOUS**: tidak pasti, ditandai di laporan untuk diperiksa manusia.
- **God node**: simbol dengan koneksi terbanyak (di sini `ComicPage()`, `prefersReducedMotion()`,
  `Mascot()`, `GeneratorPanel()`). Mengubahnya berdampak luas.
- **Komunitas**: kelompok simbol yang saling terhubung rapat, misalnya "Generator Alamat Email"
  atau "Dinding Doodle Three.js". Namanya disimpan di `graphify-out/.graphify_labels.json`.
- **Kode keluar** (untuk skrip): `0` ada jawaban, `3` nama ambigu (kandidat ditampilkan),
  `4` node tidak ditemukan.

---

## 5. Tips bertanya

1. **Pakai nama simbol** bila tahu: `"useMail()"`, `"ComicPage"`, `"doodleScene.ts"`. Kode repo ini
   berbahasa Inggris dan Indonesia campur, jadi kata kunci yang sama dengan nama di kode paling ampuh.
2. **Jawaban terpotong?** Naikkan anggaran: `--budget 3000`. Kedalaman: `--depth 3` (1 sampai 6).
3. **Mau mulai dari titik tertentu**: `--seed "lib/mail.ts"`.
4. **Menelusuri satu alur panjang**: `--dfs` (depth-first) alih-alih BFS.
5. **Hanya pemanggilan**: `--context call`.
6. **Atur default per project** di file `.graphifyrc`:
   ```ini
   query_budget=3000
   query_depth=3
   ```

---

## 6. Mengatur isi graph

- **`.graphifyignore`** (sintaks `.gitignore`): tambah pola untuk membuang file. Saat ini membuang
  `*.min.js`, gambar, video, dan `studio-wall-art-by-nangka/dist/`. Tanpa aturan ini graph berisi
  1.338 node dengan ±500 fungsi satu huruf dari GSAP/Lenis.
- **Mau menganalisis gambar referensi?** Jalankan graphify langsung pada foldernya
  (`/graphify docs/pro/referensi`) atau hapus baris ekstensinya di `.graphifyignore`.
- **`--exclude <pola>`** untuk pengecualian sekali jalan.
- **`.graphifyrc`** untuk ekstensi ambigu, misalnya `language.inc=php`.

---

## 7. Ekspor dan visualisasi

| Perintah | Hasil |
|---|---|
| `graphify export html` | `graph.html` interaktif (otomatis dibuat) |
| `graphify export wiki` | `graphify-out/wiki/`: satu artikel per komunitas + `index.md` (58 artikel di repo ini) |
| `graphify export obsidian --dir <folder>` | Vault Obsidian + canvas |
| `graphify export callflow-html` | Diagram arsitektur/alur panggilan berbasis Mermaid |
| `graphify tree` | `GRAPH_TREE.html`: pohon folder→file→simbol yang bisa dilipat |
| `graphify export svg` / `graphml` | Gambar statis / untuk Gephi, yEd |
| `graphify export neo4j` / `falkordb` | Cypher untuk database graph (`--push` untuk langsung kirim) |

---

## 8. Fitur lanjutan

| Fitur | Perintah | Catatan |
|---|---|---|
| Rebuild otomatis tiap commit/checkout | `graphify hook install` (cek: `graphify hook status`) | Hook git tinggal di `.git/hooks`, tidak ikut ter-commit |
| Pantau folder dan rebuild otomatis | `graphify watch .` | Butuh extra `watch` (sudah terpasang) |
| Server MCP untuk agen lain | `graphify-mcp --graph graphify-out/graph.json` | Tools: `query_graph`, `get_node`, `shortest_path`, `god_nodes`, dll. |
| Tambah artikel/paper/video ke korpus | `graphify add <url>` | Disimpan di `./raw`, lalu graph diperbarui |
| Gabung beberapa graph | `graphify merge-graphs a.json b.json` | Untuk lintas repo |
| Graph global semua project | `graphify global add graphify-out/graph.json --as venbeemail` | Disimpan di `~/.graphify/` |
| Memori jawaban | `graphify save-result --question ... --answer ... --outcome useful` lalu `graphify reflect` | Graph "belajar" mana jawaban yang berguna |
| Dasbor PR | `graphify prs` | Butuh akses GitHub CLI |

---

## 9. Biaya dan privasi

- **Kode** dibaca lokal dengan tree-sitter. Tidak ada yang dikirim ke luar, tidak butuh API key.
- **Dokumen, PDF, gambar** dibaca oleh model: lewat `/graphify` memakai model sesi Claude Anda;
  lewat `graphify extract` tanpa `--code-only` butuh API key (Gemini, Claude, OpenAI, dll.).
  Matikan semua backend LLM dengan `GRAPHIFY_BACKEND=none`.
- **Video/audio** ditranskripsi lokal (faster-whisper, butuh extra `video`).
- **Tanpa telemetri.** Setiap query dicatat lokal di `~/.cache/graphify-queries.log`
  (matikan dengan `GRAPHIFY_QUERY_LOG_DISABLE=1`).

---

## 10. Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| `graphify: command not found` | Sesi cloud baru / PATH | Langkah 1, atau `uv tool update-shell` |
| `refused to shrink graph.json` | Pengaman agar graph tidak hilang tak sengaja | Kalau memang menghapus file: `graphify update . --force` |
| Nama komunitas berubah jadi nama simbol atau "Community N" | Anggota komunitas berubah, nama lama tidak cocok lagi | Minta Claude menamai ulang (lihat "Nama komunitas" di langkah 2) |
| Hasil penuh fungsi aneh satu huruf | File minified ikut masuk | Tambahkan polanya ke `.graphifyignore` |
| Hubungan yang tidak masuk akal | Edge `INFERRED` salah tebak | Abaikan, atau verifikasi dengan membuka baris yang disebut |
| Jawaban terpotong (`TRUNCATED`) | Anggaran token kecil | `--budget 3000` atau persempit pertanyaan |

---

## 11. Mencopot

```bash
graphify claude uninstall      # hapus aturan always-on dari CLAUDE.md + hook
graphify uninstall             # hapus dari semua platform yang terdeteksi
graphify uninstall --purge     # sekaligus menghapus graphify-out/
uv tool uninstall graphifyy    # hapus CLI
```

Dokumentasi resmi: https://docs.graphify.com (bahasa Inggris). README berbahasa Indonesia ada di
dalam zip: `graphify-8/docs/translations/README.id-ID.md`.

---

## 12. Keluarga skill graphify (33 skill)

Selain skill resmi `/graphify`, repo ini punya 33 skill berbahasa Indonesia yang mengurus pekerjaan di
sekitarnya. Anda tidak perlu menghafal namanya: tulis keinginan dengan bahasa biasa dan
`graphify-dirigen` memilihkan skill yang tepat.

| Kelompok | Untuk apa | Contoh permintaan |
|---|---|---|
| A. Pintu masuk dan fondasi | pasang CLI, cek kesiapan, register graph, izin biaya, gerbang mutu | "graph saya masih segar?", "berapa token kalau dokumen ikut?" |
| B. Membangun dan merawat graph | rencana, pengecualian, build kode/lengkap, nama komunitas, audit, update, banding | "graph-nya penuh fungsi aneh", "beri nama komunitas", "apa bedanya dengan kemarin?" |
| C. Dokumen dan sumber pengetahuan | graph dokumen, tanya dokumen, URL, transkrip, wiki/Obsidian, memori jawaban | "PRD di docs bisa ditanya?", "buatkan wiki dari graph" |
| D. Perpustakaan skill | graph skill, skill mirip, celah, dampak ganti nama, diagram keluarga | "petakan semua skill saya", "kalau skill X diganti nama apa yang rusak?" |
| E. Ekspor dan integrasi | visual, Neo4j/FalkorDB, server MCP, hook git, gabung graph, always-on | "buat diagram arsitektur", "jadikan graph server MCP" |
| F. Perawatan | atasi error, naik/turun versi | "graphify error ...", "upgrade graphify" |

Dua belas skrip ikut di dalam skill dan bisa dijalankan langsung, misalnya:

```bash
python3 .claude/skills/graphify-diagnosa-lingkungan/scripts/cek_lingkungan.py      # status lengkap
python3 .claude/skills/graphify-audit-graph/scripts/audit_graph.py                  # kesehatan graph
python3 .claude/skills/graphify-graph-skill/scripts/peta_skill.py --cluster         # graph semua skill
python3 .claude/skills/graphify-cari-celah-skill/scripts/cek_celah_skill.py         # rujukan rusak
```

Rincian, status uji, dan cara memasang di claude.ai: `keluarga-graphify/README.md`.
