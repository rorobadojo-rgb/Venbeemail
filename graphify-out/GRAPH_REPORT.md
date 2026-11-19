# Graph Report - Venbeemail  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1027 nodes · 2214 edges · 54 communities (48 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00b5b943`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Olah Aset Pro/Kong & Bingkai Kunci
- Skrip Build Audio & Doodle
- Uji Skrip Studio Nangka
- Animasi Gerak Situs Kong
- Sistem Suara & Root Layout
- Hero Animasi Situs Pro
- Logika Halaman Situs Kong
- Gelembung Teks & Efek Suara
- Workflow Deploy GitHub Pages
- Dependensi Dev npm
- Inventaris Situs Lama Kong
- Panel Fitur & Dinding Doodle
- Generator Alamat Email
- Generator Huruf Gunting
- Konfigurasi TypeScript
- Panel Generator & Inbox
- Gambar Listing Mockup
- Indeks Skill & Penamaan Komunitas
- Halaman Utama & Kartu Akhir
- Uji Struktur Studio Nangka
- Serah Terima & Kemasan Skill
- Skrip Sisip Situs Pro/Kong
- Komponen Komik & Panel Hero
- Perakit HTML Kong
- Pembuat PDF Panduan Cetak
- Kamera & Navigasi Halaman Komik
- Dependensi Runtime npm
- Skrip npm
- Manifest Paket Contoh
- Jejak Maskot & Skrip Subproses
- Model Harga & Paket Unduhan
- Uji Skrip Keluarga Graphify
- Maskot Venbee
- Olah Video Kong
- Register Graph & Katalog CSV
- Ekspor File Cetak
- Skrip Argparse Cetak, Tag & Hook
- Ekstraksi Palet Warna
- Pembanding Graph & Pemeriksa Celah
- Pemeriksa Teks Perpustakaan Skill
- Uji Halaman Kong
- Pemasang Situs Kong
- Pemasang Situs Pro
- Cek Klip Video
- Pengukur Muatan Halaman
- Konfigurasi Next.js
- Pengembali Situs Kong
- Pengembali Situs Pro
- Pemeta Graph Skill
- Audit Kesehatan Graph
- Diagram Keluarga Skill
- Konfigurasi ESLint
- Uji Struktur Keluarga Graphify
- Tipe React DOM

## God Nodes (most connected - your core abstractions)
1. `run()` - 38 edges
2. `run()` - 36 edges
3. `film()` - 26 edges
4. `ImagePipelineTest` - 18 edges
5. `clean_graph()` - 16 edges
6. `compilerOptions` - 16 edges
7. `ComicPage()` - 15 edges
8. `prefersReducedMotion()` - 15 edges
9. `react` - 15 edges
10. `Base` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `ComicPage()`  [EXTRACTED]
  app/page.tsx → components/ComicPage.tsx
- `ComicPage()` --calls--> `initSound()`  [EXTRACTED]
  components/ComicPage.tsx → lib/sound.ts
- `setupCinematic()` --calls--> `playThrottled()`  [EXTRACTED]
  components/ComicPage.tsx → lib/sound.ts
- `setupFlow()` --calls--> `playThrottled()`  [EXTRACTED]
  components/ComicPage.tsx → lib/sound.ts
- `ChapterNav()` --calls--> `goToStep()`  [EXTRACTED]
  components/ChapterNav.tsx → lib/nav.ts

## Import Cycles
- None detected.

## Communities (54 total, 6 thin omitted)

### Community 0 - "Olah Aset Pro/Kong & Bingkai Kunci"
Cohesion: 0.06
Nodes (53): buang_hijau(), buram(), ke_gambar(), kotak_isi(), main(), pisah_maskot(), simpan(), tepi_cahaya() (+45 more)

### Community 1 - "Skrip Build Audio & Doodle"
Cohesion: 0.08
Nodes (20): AuditTest, BandingTest, Base, BiayaTest, CatatTest, CelahTest, clean_graph(), DampakTest (+12 more)

### Community 2 - "Uji Skrip Studio Nangka"
Cohesion: 0.07
Nodes (36): interpreter_of(), main(), run(), count_words(), detect_rough(), detect_with_graphify(), fmt(), graphify_python() (+28 more)

### Community 3 - "Animasi Gerak Situs Kong"
Cohesion: 0.05
Nodes (48): all, biquad(), buf(), chiptune(), crumple(), ding(), drum(), effects (+40 more)

### Community 4 - "Sistem Suara & Root Layout"
Cohesion: 0.08
Nodes (9): Base, CatalogTest, HandoffTest, ImagePipelineTest, PdfTest, PricingTest, PrintMathTest, run() (+1 more)

### Community 5 - "Hero Animasi Situs Pro"
Cohesion: 0.10
Nodes (43): acak(), apit(), bab2(), buat(), dua(), film(), bangun(), cari() (+35 more)

### Community 6 - "Logika Halaman Situs Kong"
Cohesion: 0.10
Nodes (45): arahkanPupil(), atur(), bangun(), berbahaya(), buatCincin(), buatDefinisi(), buatHuruf(), buatJalurPesawat() (+37 more)

### Community 7 - "Gelembung Teks & Efek Suara"
Cohesion: 0.09
Nodes (31): comic, display, metadata, mono, RootLayout(), viewport, SoundControls(), asset() (+23 more)

### Community 8 - "Workflow Deploy GitHub Pages"
Cohesion: 0.09
Nodes (28): acak(), buatTombolJeda(), buatWajah(), capTersalin(), el(), kunciFokus(), kunciHuruf(), letakkanTombolB() (+20 more)

### Community 9 - "Dependensi Dev npm"
Cohesion: 0.06
Nodes (32): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+24 more)

### Community 10 - "Inventaris Situs Lama Kong"
Cohesion: 0.14
Nodes (11): frontmatter(), main(), compare(), frontmatter(), load(), main(), norm(), heading_at() (+3 more)

### Community 11 - "Panel Fitur & Dinding Doodle"
Cohesion: 0.19
Nodes (20): Echoes(), ComicPage(), setupCinematic(), setupFlow(), setupReduced(), Shot, trackSteps(), EndCard() (+12 more)

### Community 12 - "Generator Alamat Email"
Cohesion: 0.13
Nodes (21): DomainFan(), Props, SHAPES, SKINS, LINES, copyText(), Domain, DOMAINS (+13 more)

### Community 13 - "Generator Huruf Gunting"
Cohesion: 0.13
Nodes (21): description, devDependencies, eslint@^9.39.5, @resvg/resvg-js@^2.6.2, sharp@^0.35.4, @types/howler@^2.2.13, @types/node@^26.6.2, @types/react@^19.3.0 (+13 more)

### Community 14 - "Konfigurasi TypeScript"
Cohesion: 0.11
Nodes (19): belum, blokT, curl, domain, endpoint, ENTITAS, field, hasil (+11 more)

### Community 15 - "Panel Generator & Inbox"
Cohesion: 0.14
Nodes (6): main(), validate(), main(), main(), main(), main()

### Community 16 - "Gambar Listing Mockup"
Cohesion: 0.18
Nodes (12): cmd_ringkas(), cmd_tulis(), is_temporary(), load(), main(), pending_names(), summarize(), validate() (+4 more)

### Community 17 - "Indeks Skill & Penamaan Komunitas"
Cohesion: 0.16
Nodes (16): Props, Variant, CAPTIONS, FakeMail, InboxPanel(), MAILS, useCountdown(), burst() (+8 more)

### Community 18 - "Halaman Utama & Kartu Akhir"
Cohesion: 0.15
Nodes (12): Props, BG, createDoodleScene(), Options, rng(), Feature, FEATURES, cameraBus (+4 more)

### Community 19 - "Uji Struktur Studio Nangka"
Cohesion: 0.18
Nodes (12): bunga_svg(), gambar_teks(), id_simbol(), _isian_pillow(), kunci_huruf(), lembar_contoh(), pola_bunga(), pola_flanel() (+4 more)

### Community 20 - "Serah Terima & Kemasan Skill"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "Skrip Sisip Situs Pro/Kong"
Cohesion: 0.17
Nodes (10): main(), check(), main(), is_graphify(), main(), walk(), clamp(), main() (+2 more)

### Community 22 - "Komponen Komik & Panel Hero"
Cohesion: 0.26
Nodes (10): check(), main(), split(), cmd_daftar(), cmd_periksa(), cmd_tambah(), graph_stats(), main() (+2 more)

### Community 23 - "Perakit HTML Kong"
Cohesion: 0.20
Nodes (8): load(), main(), model(), render(), value(), inspect_image(), main(), sha256()

### Community 24 - "Pembuat PDF Panduan Cetak"
Cohesion: 0.22
Nodes (7): blokCurl(), blokKode(), teksPolos(), urai(), ambilBlok(), gagal(), polaBlok()

### Community 25 - "Kamera & Navigasi Halaman Komik"
Cohesion: 0.30
Nodes (10): ComicButton(), Doodle(), mulberry(), Props, Starburst(), starburstPoints(), Mascot(), GeneratorPanel() (+2 more)

### Community 26 - "Dependensi Runtime npm"
Cohesion: 0.30
Nodes (7): cari_elemen(), GagalRakit, hapus_semua(), isi(), lepas_atribut(), main(), rakit()

### Community 27 - "Skrip npm"
Cohesion: 0.29
Nodes (7): Home(), jsonLd, ChapterNav(), DoodleField(), GLYPHS, SITE, SocialId

### Community 28 - "Manifest Paket Contoh"
Cohesion: 0.29
Nodes (6): build(), family_of(), find_indexes(), frontmatter(), main(), slug()

### Community 29 - "Jejak Maskot & Skrip Subproses"
Cohesion: 0.27
Nodes (5): build_pdf(), clean(), escape(), layout(), main()

### Community 30 - "Model Harga & Paket Unduhan"
Cohesion: 0.20
Nodes (10): dependencies, gsap@^3.15.0, @gsap/react@^2.1.2, howler@^2.2.4, react@^19.3.0, react-dom@^19.3.0, three@^0.186.1, @gsap/react (+2 more)

### Community 31 - "Uji Skrip Keluarga Graphify"
Cohesion: 0.20
Nodes (10): scripts, assets:audio, assets:doodles, assets:mascot, build, build:pages, dev, lint (+2 more)

### Community 32 - "Maskot Venbee"
Cohesion: 0.20
Nodes (9): checks, created, deliverables, limits, max_files, max_mb, schema, source_files (+1 more)

### Community 33 - "Olah Video Kong"
Cohesion: 0.33
Nodes (5): audit(), core_label(), git(), main(), render()

### Community 34 - "Register Graph & Katalog CSV"
Cohesion: 0.44
Nodes (6): common_prefix(), from_index(), from_prefix(), main(), mid(), short()

### Community 35 - "Ekspor File Cetak"
Cohesion: 0.36
Nodes (4): compare(), main(), parse(), render()

### Community 36 - "Skrip Argparse Cetak, Tag & Hook"
Cohesion: 0.43
Nodes (6): detail(), font(), framed(), hex_color(), main(), size_sheet()

### Community 37 - "Ekstraksi Palet Warna"
Cohesion: 0.39
Nodes (7): Bubble(), BubbleProps, Tail, TypeProps, TypewriterBubble(), play(), playThrottled()

### Community 38 - "Pembanding Graph & Pemeriksa Celah"
Cohesion: 0.36
Nodes (5): find_cycle(), visit(), main(), parse_frontmatter(), section()

### Community 39 - "Pemeriksa Teks Perpustakaan Skill"
Cohesion: 0.36
Nodes (5): find_cycle(), visit(), main(), parse_frontmatter(), section()

### Community 40 - "Uji Halaman Kong"
Cohesion: 0.33
Nodes (5): BIRD_GEOMETRY, Frame, Props, RAISED, SLEEPY

### Community 41 - "Pemasang Situs Kong"
Cohesion: 0.52
Nodes (6): batas(), bg(), jumlah_bingkai(), kb(), olah_video.sh script, tunggu()

### Community 42 - "Pemasang Situs Pro"
Cohesion: 0.60
Nodes (3): main(), save_under_limit(), to_srgb()

### Community 43 - "Cek Klip Video"
Cohesion: 0.53
Nodes (3): main(), palette(), self_test()

### Community 44 - "Pengukur Muatan Halaman"
Cohesion: 0.40
Nodes (4): longCache, nextConfig, next@^16.3.6, next

### Community 45 - "Konfigurasi Next.js"
Cohesion: 0.50
Nodes (3): config, eslint-config-next@^16.3.6, eslint-config-next

### Community 47 - "Pengembali Situs Pro"
Cohesion: 0.83
Nodes (3): ada(), kode(), pasang-kong.sh script

### Community 48 - "Pemeta Graph Skill"
Cohesion: 0.83
Nodes (3): ada(), kode(), pasang.sh script

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `satu()` connect `Konfigurasi TypeScript` to `Hero Animasi Situs Pro`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Olah Aset Pro/Kong & Bingkai Kunci` be split into smaller, more focused modules?**
  _Cohesion score 0.06101914962674456 - nodes in this community are weakly interconnected._
- **Why does `bangun()` connect `Hero Animasi Situs Pro` to `Konfigurasi TypeScript`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Skrip Build Audio & Doodle` be split into smaller, more focused modules?**
  _Cohesion score 0.07936507936507936 - nodes in this community are weakly interconnected._
- **Why does `acak()` connect `Hero Animasi Situs Pro` to `Logika Halaman Situs Kong`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Uji Skrip Studio Nangka` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._
- **Should `Animasi Gerak Situs Kong` be split into smaller, more focused modules?**
  _Cohesion score 0.05129561078794289 - nodes in this community are weakly interconnected._