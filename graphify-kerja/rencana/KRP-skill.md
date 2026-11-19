# Rencana korpus: KRP-skill

Pemilik berkas: `graphify-rencana-korpus`.

| Isian | Nilai |
|---|---|
| corpus_id | KRP-skill |
| Tujuan (satu kalimat) | Hubungan antarskill (rujukan, serah terima, layanan, file pendukung) bisa ditanya, dicari tumpang tindih dan celahnya, serta dianalisis dampaknya |
| Pemakai graph | skill keluarga D (tumpang tindih, celah, dampak, peta keluarga) dan pemilik repo |
| Mode | skill |
| Lokasi keluaran | `graphify-kerja/graph/KRP-skill/graphify-out/` |
| Perintah build | `python3 .claude/skills/graphify-graph-skill/scripts/peta_skill.py --cluster` |
| Folder masuk | `.claude/skills/` (79 skill) + `keluarga-graphify/skill-index.json` + `studio-wall-art-by-nangka/skill-index.json` |
| Folder keluar | salinan aturan inti (`graphify-core.md`, `studio-core.md`), `__pycache__` |
| Perkiraan biaya | 0 token (skrip membaca teks secara pasti, tanpa LLM) |
| Izin biaya | tidak perlu |
| Di-commit? | ya (aturan sama dengan `graphify-out/.gitignore`) |
| Hasil G1 | lulus |

## Catatan keputusan

- 2026-11-19: dipilih skrip, bukan `/graphify .claude/skills`. Jalur graphify biasa akan membaca 124
  berkas Markdown lewat model (±132 ribu token) dan menulis ke `graphify-out/` utama.
- 2026-11-19: 172 node, 673 edge, 17 komunitas bernama; audit tanpa temuan.
