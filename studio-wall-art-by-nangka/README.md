# Studio Wall Art by Nangka

Sistem 45 skill untuk menjalankan bisnis wall art digital di Etsy, dari ide sampai operasional toko.
Dibangun 12 November 2026. Bahasa kerja: Indonesia. Teks untuk pembeli: Inggris.

## Status

| Hal | Status | Bukti |
|---|---|---|
| Arsitektur 45 skill | selesai | `skill-index.json`, `ARSITEKTUR.md` |
| 45 skill ditulis lengkap | selesai | `.claude/skills/` di akar repositori |
| Uji struktur | lulus, 1.586 pemeriksaan | `python3 studio-wall-art-by-nangka/tools/run_tests.py` |
| Uji unit 11 skrip | lulus, 35 uji | `python3 studio-wall-art-by-nangka/tests/test_scripts.py` |
| Validator resmi skill-creator | lulus, 45 dari 45 | `quick_validate.py` |
| Uji perjalanan brief sampai paket listing | lulus, 31 dari 31 langkah | `python3 studio-wall-art-by-nangka/tools/build_example.py` |
| Terpasang di Claude Code untuk repositori ini | ya, di cabang `claude/epic-carson-4jmsuo` | skill muncul di daftar skill sesi saat sesi dimulai ulang |
| Terpasang di akun claude.ai | belum | pasang lewat berkas di `dist/` (lihat bawah) |
| Pemicu tiap skill diuji pada percakapan nyata | belum | lihat `HASIL-UJI.md` bagian "Belum diuji" |
| Gambar dibuat dengan alat AI | belum | tidak ada izin pemakaian kredit; contoh memakai gambar uji |
| Toko Etsy | belum dibuat | konektor Etsy belum aktif |

Rincian hasil uji dan kegagalan yang diperbaiki: `HASIL-UJI.md`.

## Mulai cepat

1. Buka sesi Claude Code di repositori ini (cabang `claude/epic-carson-4jmsuo`, atau `main` setelah digabung).
2. Ketik keinginan Anda dengan bahasa biasa. Tidak perlu hafal nama skill; pengarah (`studio-wall-art-orchestrator`) memilihkan. Contoh:
   - "Saya mau mulai koleksi pertama, tema hewan untuk kamar anak."
   - "Ini 5 foto saya dan 4 gambar dari Pinterest, baca gayanya."
   - "Gambar ini cukup tidak untuk dicetak 24x36?"
   - "Siapkan listing untuk karya ini."
   - "Pembeli bilang filenya tidak bisa dibuka, balas apa?"
3. Jawab pertanyaan singkat yang diajukan. Bila dilewati, sistem memakai default dan menandainya sebagai ASUMSI.

Yang sebaiknya dikerjakan lebih dulu, berurutan:

1. **Isi kekosongan memori**: nama toko, kalimat studio, dan konfirmasi lokasi penjual. Katakan "catat: ...".
2. **Kirim bahan Anda**: foto dan gambar sendiri, plus referensi. Ini dasar DNA visual; saat ini DNA belum ada.
3. **Amatan 15 menit di Etsy**: sistem tidak bisa membuka Etsy dari sesi ini, jadi minta "lembar amatan untuk niche [tema]" lalu isi sendiri.
4. **Satu karya utama sampai lolos gerbang G3**, baru sisanya.

## Enam jalur kerja

| Jalur | Urutan skill | Hasil |
|---|---|---|
| Mulai toko | brief, bukti pasar, niche, profil pembeli, rencana toko | arah dan rencana toko |
| Identitas | baca referensi, DNA visual, palet, motif | `visual-dna.md`, kartu palet, kartu motif |
| Karya | rencana koleksi, konsep, sintesis referensi, komposisi, prompt, cek cacat, cek gaya | gambar master lolos G3 |
| Produksi | isi produk, rencana rasio, ekspor, paket, panduan cetak | paket unduhan lolos G4 |
| Listing | harga, gambar listing, judul dan deskripsi, tag, preflight, katalog | paket listing lolos G5 |
| Bulanan | baca data, portofolio atau eksperimen, tinjauan bulanan | tiga prioritas bulan depan |

Diagram dan pemilik tiap keputusan: `ARSITEKTUR.md`. Daftar lengkap skill: `INDEKS-SKILL.md`.

## Letak file

```
.claude/skills/<nama-skill>/        45 skill (SKILL.md, references/, assets/, scripts/)
studio-nangka/                      MEMORI STUDIO ANDA (dibaca dan ditulis skill)
  memori/brand-memory.md              profil dan keputusan; sudah berisi 8 jawaban Anda
  fakta/etsy-facts.md, fees.json      aturan dan biaya Etsy bertanggal 2026-11-12
  riset/bukti-pasar.csv               5 bukti pasar nyata bertanggal (keyakinan rendah-sedang)
  riset/keyword-bank.csv              14 keyword awal, sebagian besar HIPOTESIS
  register/                           hak bahan, katalog, eksperimen (masih kosong)
  pelanggan/                          data pelanggan; tidak pernah masuk git
studio-wall-art-by-nangka/
  README.md, ARSITEKTUR.md, INDEKS-SKILL.md, HASIL-UJI.md, PROGRES.md
  skill-index.json                    sumber kebenaran arsitektur
  _shared/studio-core.md              aturan inti; disalin ke tiap skill
  tools/                              sinkron, indeks, uji, kemas, bangun contoh
  tests/test_scripts.py               uji unit skrip
  contoh-proyek/                      proyek contoh lengkap dari brief sampai paket listing
  dist/                               45 berkas .skill dan satu bundel
```

## Memasang di akun claude.ai

Skill di repositori ini sudah aktif untuk sesi Claude Code pada repositori ini. Agar tersedia juga di claude.ai dan sesi lain:

1. Unduh berkas `.skill` dari `dist/` (atau bundel `studio-wall-art-by-nangka-semua-skill.zip`, lalu buka ZIP-nya).
2. Di claude.ai buka pengaturan skill dan unggah tiap berkas `.skill`.
3. Mulai dari tujuh skill ini bila tidak ingin memasang semuanya sekaligus: `studio-wall-art-orchestrator`, `studio-brief-interviewer`, `studio-asset-rights-register`, `studio-brand-memory`, `studio-quality-gate`, `etsy-policy-fact-checker`, `wall-art-ratio-resolution-planner`.

Catatan: di claude.ai tidak ada folder `studio-nangka/` yang bertahan. Skill akan meminta Anda mengunggah file memori dan memberikan versi barunya untuk Anda simpan.

## Sebelas skrip yang benar-benar menghitung

| Skrip | Skill | Gunanya |
|---|---|---|
| `validate_handoff.py` | orchestrator | Memeriksa blok serah terima |
| `extract_palette.py` | reference-reader | Mengukur warna dominan gambar |
| `print_math.py` | ratio-resolution-planner | Crop per rasio dan PPI per ukuran cetak |
| `export_print_files.py` | color-export-manager | Ekspor JPEG sRGB 300 DPI di bawah batas ukuran |
| `build_package.py` | download-package-builder | Paket unduhan, ZIP otomatis, manifest |
| `make_guide_pdf.py` | print-instruction-writer | Panduan cetak menjadi PDF |
| `make_listing_images.py` | mockup-art-director | Bingkai datar, lembar ukuran, potongan detail |
| `pricing_model.py` | digital-pricing-modeler | Biaya per pesanan dan titik impas |
| `check_tags.py` | tag-attribute-mapper | Batas jumlah dan panjang tag |
| `check_listing.py` | listing-preflight-reviewer | Pemeriksaan hitung sebelum terbit |
| `check_catalog.py` | catalog-sku-manager | SKU dan katalog |

Semuanya hanya butuh Python; lima di antaranya butuh Pillow untuk mengolah gambar.

## Merawat sistem

```bash
python3 studio-wall-art-by-nangka/tools/sync_shared.py
```

```bash
python3 studio-wall-art-by-nangka/tools/build_index.py
```

```bash
python3 studio-wall-art-by-nangka/tools/run_tests.py
```

```bash
python3 studio-wall-art-by-nangka/tools/build_dist.py
```

Urutan setelah mengubah skill: sinkron, indeks, uji, kemas. Aturan inti diubah di `_shared/studio-core.md`, bukan di salinannya.

## Batasan yang masih ada

1. **Halaman Etsy tidak bisa dibuka dari sesi ini.** Fakta Etsy diambil dari kutipan mesin pencari atas halaman resmi (keyakinan sedang) atau pihak ketiga (rendah). Tidak ada fakta berkeyakinan tinggi. Lingkungan baru "Venbeemail - Studio Wall Art (Etsy)" sudah dibuat dengan izin `www.etsy.com` dan `help.etsy.com`; aturan itu berlaku penuh pada sesi baru yang memakai lingkungan tersebut.
2. **Belum diverifikasi sama sekali**: kebijakan refund barang digital, daftar jenis file digital yang diterima, jumlah maksimal gambar per listing, biaya pembukaan toko untuk Indonesia, tarif PPN atas biaya, ukuran pin Pinterest.
3. **Biaya pemrosesan pembayaran Indonesia** (4,5% + Rp7.000) berasal dari pihak ketiga. Model harga memberi peringatan untuk itu.
4. **Lokasi penjual Indonesia adalah asumsi.** Belum ditanyakan.
5. **Konektor Etsy belum aktif** (kredensial kosong). Semua hasil listing berupa draf dan lembar unggah manual. Menyelesaikannya: https://cloud.anythingmcp.com/connectors/cmwca574t0tf301vkgk6hys2f
6. **Tidak ada alat desain** (Canva atau Photoshop). Skrip menutup crop, ekspor, paket, PDF, dan mockup datar. Mockup ruangan realistis dan penempatan teks personalisasi masih butuh alat atau template.
7. **DNA visual belum ada.** Yang ada di contoh proyek hanya versi sementara untuk menguji alur.
8. **Skill kreatif tidak bisa diuji otomatis mutu isinya.** Yang teruji otomatis adalah struktur, rujukan file, serah terima, dan skrip.
9. **Pembesaran gambar (upscale)** harus dilakukan dengan alat AI; skrip sengaja tidak memperbesar.
10. **45 deskripsi skill selalu termuat** di sesi repositori ini, bersama sekitar 170 skill akun Anda. Bila pemicu terasa saling berebut, pasang sebagian saja atau panggil skill dengan namanya.
11. Bukan nasihat hukum atau pajak.
