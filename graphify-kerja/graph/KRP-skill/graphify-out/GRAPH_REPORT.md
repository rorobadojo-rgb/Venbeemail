# Graph Report - KRP-skill  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 172 nodes · 458 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00b5b943`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Pemeriksa Listing & Analisis Skill
- Harga, Katalog & Kinerja Toko
- Penciptaan Karya Wall Art
- Perawatan & Lingkungan Graphify
- Riset Pasar & Operasional Etsy
- Graph Dokumen & Sumber
- Pintu Masuk & Brief Studio
- Perencanaan Korpus Graphify
- Skill Resmi Graphify
- Layanan Pelanggan & Pesanan Custom
- Produksi Berkas Cetak
- Audit & Gerbang Graph
- Build & Penamaan Graph
- DNA Visual & Konsistensi Gaya
- Penawaran Produk & Rasio Cetak
- Ekspor & Integrasi Graphify
- Mockup & Konten Pinterest

## God Nodes (most connected - your core abstractions)
1. `graphify-dirigen` - 35 edges
2. `studio-wall-art-orchestrator` - 26 edges
3. `graphify-pasang-cli` - 23 edges
4. `graphify-graph-dokumen` - 19 edges
5. `graphify-graph-skill` - 16 edges
6. `etsy-policy-fact-checker` - 15 edges
7. `graphify-bangun-graph-lengkap` - 15 edges
8. `graphify-catatan-graph` - 15 edges
9. `graphify-rencana-korpus` - 15 edges
10. `graphify-bangun-graph-kode` - 14 edges

## Surprising Connections (you probably didn't know these)
- `etsy-competitor-pattern-analyst` --hands_off_to--> `wall-art-product-offer-planner`  [EXTRACTED]
  .claude/skills/etsy-competitor-pattern-analyst/SKILL.md → .claude/skills/wall-art-product-offer-planner/SKILL.md
- `etsy-digital-pricing-modeler` --uses--> `etsy-policy-fact-checker`  [EXTRACTED]
  .claude/skills/etsy-digital-pricing-modeler/SKILL.md → .claude/skills/etsy-policy-fact-checker/SKILL.md
- `etsy-issue-resolution-assistant` --uses--> `etsy-policy-fact-checker`  [EXTRACTED]
  .claude/skills/etsy-issue-resolution-assistant/SKILL.md → .claude/skills/etsy-policy-fact-checker/SKILL.md
- `etsy-keyword-evidence-researcher` --hands_off_to--> `etsy-listing-copy-builder`  [EXTRACTED]
  .claude/skills/etsy-keyword-evidence-researcher/SKILL.md → .claude/skills/etsy-listing-copy-builder/SKILL.md
- `etsy-keyword-evidence-researcher` --hands_off_to--> `etsy-tag-attribute-mapper`  [EXTRACTED]
  .claude/skills/etsy-keyword-evidence-researcher/SKILL.md → .claude/skills/etsy-tag-attribute-mapper/SKILL.md

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "Pemeriksa Listing & Analisis Skill"
Cohesion: 0.13
Nodes (11): etsy-listing-preflight-reviewer, etsy-policy-fact-checker, etsy-storefront-brand-planner, etsy-tag-attribute-mapper, graphify-cari-celah-skill, graphify-cari-tumpang-tindih-skill, graphify-dampak-ubah-skill, graphify-graph-skill (+3 more)

### Community 1 - "Harga, Katalog & Kinerja Toko"
Cohesion: 0.15
Nodes (7): etsy-catalog-sku-manager, etsy-digital-pricing-modeler, etsy-listing-copy-builder, etsy-performance-data-reader, etsy-portfolio-decision-reviewer, studio-experiment-planner, studio-monthly-strategy-reviewer

### Community 2 - "Penciptaan Karya Wall Art"
Cohesion: 0.29
Nodes (6): studio-asset-rights-register, wall-art-composition-director, wall-art-concept-divergence, wall-art-image-prompt-engineer, wall-art-motif-originality-designer, wall-art-reference-fusion-director

### Community 3 - "Perawatan & Lingkungan Graphify"
Cohesion: 0.32
Nodes (6): graphify-atasi-masalah, graphify-diagnosa-lingkungan, graphify-kelola-versi, graphify-mode-always-on, graphify-otomasi-git, graphify-pasang-cli

### Community 4 - "Riset Pasar & Operasional Etsy"
Cohesion: 0.24
Nodes (6): etsy-competitor-pattern-analyst, etsy-keyword-evidence-researcher, etsy-market-evidence-researcher, etsy-micro-niche-mapper, etsy-seasonal-opportunity-planner, etsy-store-operations-planner

### Community 5 - "Graph Dokumen & Sumber"
Cohesion: 0.27
Nodes (6): graphify-catatan-graph, graphify-graph-dokumen, graphify-memori-jawaban, graphify-tambah-sumber, graphify-tanya-dokumen, graphify-transkrip-media

### Community 6 - "Pintu Masuk & Brief Studio"
Cohesion: 0.22
Nodes (4): studio-brief-interviewer, studio-wall-art-orchestrator, wall-art-reference-reader, wall-art-series-collection-builder

### Community 7 - "Perencanaan Korpus Graphify"
Cohesion: 0.33
Nodes (4): graphify-atur-pengecualian, graphify-dirigen, graphify-penjaga-biaya, graphify-rencana-korpus

### Community 9 - "Layanan Pelanggan & Pesanan Custom"
Cohesion: 0.39
Nodes (4): etsy-custom-order-workflow, etsy-customer-message-drafter, etsy-issue-resolution-assistant, wall-art-personalization-designer

### Community 10 - "Produksi Berkas Cetak"
Cohesion: 0.29
Nodes (3): wall-art-color-export-manager, wall-art-download-package-builder, wall-art-print-instruction-writer

### Community 11 - "Audit & Gerbang Graph"
Cohesion: 0.38
Nodes (4): graphify-audit-graph, graphify-banding-graph, graphify-gabung-graph, graphify-gerbang-mutu

### Community 12 - "Build & Penamaan Graph"
Cohesion: 0.57
Nodes (4): graphify-bangun-graph-kode, graphify-bangun-graph-lengkap, graphify-namai-komunitas, graphify-perbarui-graph

### Community 13 - "DNA Visual & Konsistensi Gaya"
Cohesion: 0.38
Nodes (4): wall-art-artifact-retouch-reviewer, wall-art-palette-material-director, wall-art-style-consistency-reviewer, wall-art-visual-dna-builder

### Community 14 - "Penawaran Produk & Rasio Cetak"
Cohesion: 0.29
Nodes (3): wall-art-buyer-room-profiler, wall-art-product-offer-planner, wall-art-ratio-resolution-planner

### Community 15 - "Ekspor & Integrasi Graphify"
Cohesion: 0.80
Nodes (4): graphify-ekspor-database, graphify-ekspor-pengetahuan, graphify-ekspor-visual, graphify-server-mcp

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `graphify-graph-skill` connect `Pemeriksa Listing & Analisis Skill` to `Perawatan & Lingkungan Graphify`, `Build & Penamaan Graph`, `Graph Dokumen & Sumber`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Should `Pemeriksa Listing & Analisis Skill` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Why does `graphify-rencana-korpus` connect `Perencanaan Korpus Graphify` to `Pemeriksa Listing & Analisis Skill`, `Audit & Gerbang Graph`, `Build & Penamaan Graph`, `Graph Dokumen & Sumber`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `graphify-graph-dokumen` connect `Graph Dokumen & Sumber` to `Pemeriksa Listing & Analisis Skill`, `Perawatan & Lingkungan Graphify`, `Build & Penamaan Graph`, `Perencanaan Korpus Graphify`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._