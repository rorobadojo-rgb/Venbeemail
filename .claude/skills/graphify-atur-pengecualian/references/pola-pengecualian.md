# Pola pengecualian graphify: sintaks dan jebakan

## Urutan aturan

1. `.gitignore` dan `.git/info/exclude` (dilewati dengan `--no-gitignore`).
2. `.graphifyignore` di akar korpus dan di folder-folder leluhurnya (dibaca terakhir, jadi hanya bisa
   menambah pengecualian; `!pola` tidak bisa memasukkan kembali yang dibuang `.gitignore`).
3. `--exclude <pola>` untuk sekali jalan.
4. Folder bising bawaan (misalnya `node_modules`) dilewati tanpa perlu ditulis.

## Sintaks

| Pola | Arti |
|---|---|
| `*.min.js` | berkas berakhiran `.min.js` di mana saja |
| `dist/` | folder bernama `dist` di mana saja (garis miring di akhir = folder) |
| `/dist/` | hanya `dist` di akar korpus |
| `docs/**/*.png` | gambar di bawah `docs/` pada kedalaman berapa pun |
| `# teks` | komentar |

## Jebakan

- Pola folder tanpa `/` di akhir juga mencocokkan berkas bernama sama.
- Membuang folder `aset/` bisa ikut membuang kode sendiri di dalamnya. Buang per ekstensi.
- `.graphifyignore` dibaca dari akar korpus. `graphify extract docs` membaca `docs/.graphifyignore`
  dan leluhurnya, termasuk `.graphifyignore` di akar repo.
- Keluaran `graphify extract` menyebut jumlah path yang diabaikan dan tiga contoh. Periksa contoh itu.

## .graphifyrc (ekstensi ambigu dan setelan project)

```
# bahasa untuk ekstensi yang maknanya berbeda per project
language.inc=php
language.tpl=.ts
# batas node HTML untuk cluster-only, update, watch, dan hook
viz_node_limit=5000
# default perintah query
query_budget=3000
query_depth=3
```

Salah ketik dilaporkan sekali di stderr; scan tetap jalan dengan default.
