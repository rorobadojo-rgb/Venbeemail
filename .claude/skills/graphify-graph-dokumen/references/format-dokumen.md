# Format dokumen yang didukung graphify 0.9.112

| Format | Dibaca sebagai | Butuh | Catatan |
|---|---|---|---|
| `.md`, `.markdown` | dokumen | - | judul bagian (`#`, `##`) menjadi node; tautan `[[wiki]]` dan rujukan ikut |
| `.txt`, `.rst`, `.adoc`, `.org` | dokumen | - | |
| `.html`, `.htm` | dokumen | - | |
| `.pdf` | paper | extra `pdf` (pypdf, markdownify) | PDF hasil pindai tidak punya teks; dibaca seperti gambar |
| `.docx`, `.xlsx` | dikonversi ke Markdown di `graphify-out/converted/` | extra `office` | |
| `.gdoc`, `.gsheet`, `.gslides` | diekspor lewat CLI `gws` | `--google-workspace` atau `GRAPHIFY_GOOGLE_WORKSPACE=1` | butuh `gws` yang sudah login |
| `.yaml`, `.yml`, `.json` | kode (struktur kunci) | - | masuk jalur AST, gratis |
| transkrip `.txt` dari video | dokumen | extra `video` | lihat skill transkrip media |

## Perintah yang berguna setelah build

```bash
# isi satu bagian Markdown tanpa membuka berkasnya
graphify section "Paket Harga" --graph graphify-kerja/graph/KRP-dokumen-prd/graphify-out/graph.json
# bila judul sama ada di beberapa berkas, sebut berkasnya
graphify section "docs/pro/prd.md#Paket Harga" --graph ...
# batasi panjang
graphify section "Paket Harga" --max-chars 3000 --graph ...
```

## Ukuran yang wajar

- Di atas 500 berkas atau 2 juta kata, skill resmi meminta memilih subfolder.
- Pass semantik membagi dokumen per potongan (default 60.000 token per potongan pada jalur backend).
