# graphify-kerja

Folder kerja keluarga skill graphify. Model tidak mengingat percakapan lama; yang diingat adalah
file di sini. Semua isi folder ini ikut di-commit.

```
register/graph-register.csv   daftar semua graph yang pernah dibangun   (graphify-catatan-graph)
rencana/<corpus_id>.md        rencana korpus: lingkup, mode, keluaran  (graphify-rencana-korpus)
audit/<corpus_id>-<tgl>.md    laporan kesehatan graph                  (graphify-audit-graph)
graph/<corpus_id>/graphify-out/  graph selain graph utama repo
raw/<corpus_id>/              sumber luar dari URL                     (graphify-tambah-sumber)
```

Graph utama repo (`KRP-repo`) tidak di sini, tetapi di `graphify-out/` akar repo, karena aturan
always-on di `CLAUDE.md` dan hook mencarinya di sana.

Aturan lengkap: `keluarga-graphify/_shared/graphify-core.md`.
