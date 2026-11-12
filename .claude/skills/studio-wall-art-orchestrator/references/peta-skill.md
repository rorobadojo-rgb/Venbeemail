# Peta Skill Studio

Dibuat otomatis dari indeks arsitektur. Pakai untuk memilih skill dan mengetahui siapa pemilik tiap keputusan.

## A. Pengarah sistem dan pengetahuan studio

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| studio-wall-art-orchestrator | pintu masuk | Skill mana yang dijalankan berikutnya | - | - |
| studio-brief-interviewer | jalur | Isi brief proyek | etsy-market-evidence-researcher, wall-art-reference-reader, wall-art-series-collection-builder | studio-brand-memory |
| studio-asset-rights-register | layanan | Status hak tiap bahan (rights_status) | - | - |
| studio-brand-memory | layanan | Isi memori merek (brand-memory.md) | - | - |
| studio-experiment-planner | jalur | Rancangan eksperimen dan cara mengukurnya | studio-monthly-strategy-reviewer | - |
| studio-quality-gate | layanan | Lulus/tidaknya tahap G1-G4 | - | - |
| etsy-policy-fact-checker | layanan | Fakta biaya dan kebijakan Etsy yang dipakai studio | - | - |

## B. Riset pasar dan pembeli

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| etsy-market-evidence-researcher | jalur | Catatan bukti pasar (bukti-pasar.csv) | etsy-micro-niche-mapper, etsy-competitor-pattern-analyst, etsy-keyword-evidence-researcher, etsy-seasonal-opportunity-planner | - |
| etsy-micro-niche-mapper | jalur | Niche yang diusulkan untuk dipilih | wall-art-buyer-room-profiler, etsy-keyword-evidence-researcher | - |
| wall-art-buyer-room-profiler | jalur | Profil pembeli dan ruangan | wall-art-series-collection-builder, wall-art-product-offer-planner | - |
| etsy-competitor-pattern-analyst | jalur | Peta pola pesaing dan celah | etsy-micro-niche-mapper, wall-art-product-offer-planner | - |
| etsy-seasonal-opportunity-planner | jalur | Kalender musiman studio | wall-art-series-collection-builder, etsy-store-operations-planner | - |
| etsy-keyword-evidence-researcher | jalur | Bank keyword (keyword-bank.csv) | etsy-listing-copy-builder, etsy-tag-attribute-mapper | - |

## C. Identitas artistik

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| wall-art-reference-reader | jalur | Bacaan visual tiap referensi | wall-art-visual-dna-builder, wall-art-reference-fusion-director | studio-asset-rights-register |
| wall-art-visual-dna-builder | jalur | Aturan visual studio (visual-dna.md) | wall-art-palette-material-director, wall-art-motif-originality-designer | studio-brand-memory |
| wall-art-palette-material-director | jalur | Palet dan bahan visual per koleksi | wall-art-concept-divergence | - |
| wall-art-motif-originality-designer | jalur | Pustaka motif studio | wall-art-concept-divergence | - |
| wall-art-style-consistency-reviewer | jalur | Penilaian konsistensi gaya | wall-art-ratio-resolution-planner | studio-quality-gate |

## D. Penciptaan karya dan koleksi

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| wall-art-concept-divergence | jalur | Arah konsep yang ditawarkan | wall-art-reference-fusion-director, wall-art-composition-director | - |
| wall-art-reference-fusion-director | jalur | Peran tiap referensi dan resep sintesis | wall-art-composition-director | studio-asset-rights-register |
| wall-art-composition-director | jalur | Rancangan komposisi karya | wall-art-image-prompt-engineer | - |
| wall-art-image-prompt-engineer | jalur | Prompt dan catatan generasi | wall-art-artifact-retouch-reviewer | studio-asset-rights-register |
| wall-art-series-collection-builder | jalur | Rencana koleksi | wall-art-palette-material-director, wall-art-concept-divergence, wall-art-product-offer-planner | - |
| wall-art-personalization-designer | jalur | Spesifikasi produk custom | wall-art-product-offer-planner, etsy-custom-order-workflow | - |

## E. Produksi file dan pemeriksaan cetak

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| wall-art-artifact-retouch-reviewer | jalur | Daftar cacat dan perintah perbaikan | wall-art-style-consistency-reviewer | - |
| wall-art-ratio-resolution-planner | jalur | Rencana rasio, crop, dan ukuran cetak | wall-art-color-export-manager | - |
| wall-art-color-export-manager | jalur | Pengaturan warna dan ekspor | wall-art-download-package-builder | - |
| wall-art-download-package-builder | jalur | Isi dan struktur paket unduhan | wall-art-print-instruction-writer | studio-quality-gate |
| wall-art-print-instruction-writer | jalur | Panduan cetak untuk pembeli | wall-art-mockup-art-director, etsy-listing-copy-builder | - |

## F. Produk dan listing Etsy

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| wall-art-product-offer-planner | jalur | Isi produk, variasi, bundel, batas layanan | etsy-digital-pricing-modeler, wall-art-ratio-resolution-planner | - |
| etsy-digital-pricing-modeler | jalur | Usulan harga dan skenario margin | etsy-listing-copy-builder | etsy-policy-fact-checker |
| wall-art-mockup-art-director | jalur | Daftar dan arahan gambar listing | etsy-listing-preflight-reviewer | - |
| etsy-listing-copy-builder | jalur | Judul dan deskripsi listing | etsy-tag-attribute-mapper | - |
| etsy-tag-attribute-mapper | jalur | Tag, kategori, dan atribut listing | etsy-listing-preflight-reviewer | etsy-policy-fact-checker |
| etsy-listing-preflight-reviewer | jalur | Siap/tidaknya listing diterbitkan (G5) | etsy-catalog-sku-manager | etsy-policy-fact-checker |

## G. Operasional toko

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| etsy-storefront-brand-planner | jalur | Identitas dan struktur toko | etsy-store-operations-planner | studio-brand-memory, etsy-policy-fact-checker |
| etsy-catalog-sku-manager | jalur | SKU dan status katalog (katalog.csv) | - | - |
| etsy-customer-message-drafter | jalur | Kata-kata pesan pelanggan | - | - |
| etsy-custom-order-workflow | jalur | Tahap dan status pesanan custom | etsy-customer-message-drafter | - |
| etsy-issue-resolution-assistant | jalur | Jalur penyelesaian masalah pelanggan | etsy-customer-message-drafter | etsy-policy-fact-checker |
| etsy-store-operations-planner | jalur | Rutinitas dan rencana mingguan | - | - |

## H. Analisis dan pertumbuhan

| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |
|---|---|---|---|---|
| etsy-performance-data-reader | jalur | Pembacaan data toko | studio-experiment-planner, etsy-portfolio-decision-reviewer, studio-monthly-strategy-reviewer | - |
| etsy-portfolio-decision-reviewer | jalur | Usulan pertahankan/revisi/hentikan/kembangkan | studio-monthly-strategy-reviewer | etsy-catalog-sku-manager |
| wall-art-pinterest-content-planner | jalur | Rencana konten Pinterest | etsy-store-operations-planner | studio-asset-rights-register |
| studio-monthly-strategy-reviewer | jalur | Prioritas bulan berikutnya | - | studio-brand-memory |
