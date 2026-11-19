---
name: graphify-atur-pengecualian
description: Menyusun aturan apa yang tidak masuk graph graphify, yaitu .graphifyignore (sintaks gitignore), opsi --exclude, dan .graphifyrc untuk ekstensi ambigu seperti .inc, .h, atau .m, lalu membuktikan efeknya dengan uji kering ke folder sementara sebelum graph utama disentuh. Pakai saat pengguna berkata "graph-nya penuh fungsi aneh", "jangan masukkan gambar", "kecualikan folder ini", "file .inc dibaca salah bahasa", "kenapa node_modules ikut?", atau saat audit menemukan noise, file minified, atau path sensitif. Jangan dipakai untuk menentukan tujuan dan lingkup graph secara umum, itu tugas graphify-rencana-korpus, atau untuk membangun graph sungguhan, itu tugas skill build.
---

# graphify-atur-pengecualian

Satu pemilik untuk `.graphifyignore` dan `.graphifyrc`. Aturan yang tepat membuat graph kecil, cepat,
dan bermakna; aturan yang salah diam-diam membuang kode penting.

Sebelum mulai, baca `references/graphify-core.md`. Pola siap pakai: `assets/graphifyignore-dasar.txt`.
Cara kerja sintaks dan jebakannya: `references/pola-pengecualian.md`.

## Kapan digunakan

- Sebelum build pertama sesuai rencana korpus.
- Audit menemukan noise nama pendek, file `.min.`, atau path sensitif.
- Bahasa sebuah ekstensi salah dibaca (graph terlihat terisi tetapi simbol aslinya hilang).

## Kapan tidak digunakan

- Menentukan tujuan dan folder korpus: `graphify-rencana-korpus`.
- Membangun graph: `graphify-bangun-graph-kode`, `graphify-bangun-graph-lengkap`, `graphify-graph-dokumen`.

## Input

- Wajib: akar korpus.
- Opsional: temuan audit, rencana korpus, daftar folder yang harus keluar.

## Default

- `.graphifyignore` di akar korpus; untuk repo ini sudah ada (membuang `*.min.js`, gambar, video, `dist/`).
- graphify juga membaca `.gitignore`; `.graphifyignore` hanya menambah pengecualian.
- Uji kering selalu ke folder sementara: `graphify extract <akar> --code-only --out <folder-sementara>`.

## Pertanyaan bila info penting belum ada

Hanya bila sebuah folder meragukan: "Folder X berisi kode yang Anda tulis sendiri atau salinan pihak
ketiga?" (pihak ketiga dikecualikan).

## Langkah kerja

1. Baca `.graphifyignore` dan `.graphifyrc` yang ada (jangan menimpa tanpa membaca).
2. Kumpulkan sumber noise: dari audit (`file_teratas`, temuan minified) atau dari uji kering pertama.
3. Tulis pola baru di bagian yang sesuai (pihak ketiga, media, hasil build, data pribadi), dengan
   komentar alasan dan angka bukti, mengambil dari `assets/graphifyignore-dasar.txt` bila cocok.
4. Untuk ekstensi ambigu, tulis di `.graphifyrc`: `language.inc=php` atau `language.tpl=.ts`.
5. Uji kering ke folder sementara, lalu bandingkan sebelum dan sesudah: jumlah node, komunitas,
   dan baris "path(s) ignored by ignore rules" dari keluaran graphify.
6. Pastikan tidak ada kode milik sendiri yang ikut hilang: periksa contoh path yang diabaikan.
7. Laporkan perubahan pola dan dampaknya dengan angka.

## Aturan keputusan

- Pola sesempit mungkin: `*.min.js` lebih baik daripada `situs-pro/aset/` bila folder itu juga berisi kode sendiri.
- Data pribadi (contoh `studio-nangka/pelanggan/`) selalu dikecualikan walau sudah ada di `.gitignore`.
- `--no-gitignore` hanya untuk kasus khusus; `.graphifyignore` tetap berlaku.
- Pola yang menghapus lebih dari 20% file kode sendiri butuh persetujuan pengguna.

## Format hasil

```
.graphifyignore: +1 pola (*.min.js), alasan: 503 dari 1.338 node berasal dari 7 file minified
Uji kering: 1.338 -> 835 node, 86 -> 48 komunitas, 849 path diabaikan
Kode sendiri yang hilang: tidak ada (contoh path diabaikan: app/icon.png, ...)
```

## Pemeriksaan kualitas

- Setiap pola punya komentar alasan.
- Angka sebelum dan sesudah berasal dari uji kering nyata.
- Graph utama tidak tersentuh selama uji.

## Penanganan kesalahan

- Pola tidak berpengaruh: cek sintaks (pola folder diakhiri `/`, pola berakar diawali `/`), lihat
  `references/pola-pengecualian.md`.
- Bahasa ekstensi salah ketik di `.graphifyrc`: graphify mencetak peringatan sekali di stderr dan
  memakai default; perbaiki ejaannya.

## Serah terima

```
dari: graphify-atur-pengecualian
status: selesai
bukti: graphify extract . --code-only --out <sementara> -> 835 node
berikutnya: graphify-bangun-graph-kode | graphify-bangun-graph-lengkap | graphify-graph-dokumen (sesuai mode rencana)
```

Berikutnya sesuai mode di rencana: `graphify-bangun-graph-kode` (kode), `graphify-bangun-graph-lengkap`
(lengkap), atau `graphify-graph-dokumen` (dokumen). CLI untuk uji kering dipastikan lewat `graphify-pasang-cli`.

## Batas kemampuan alat

Uji kering memakai jalur kode (AST). Efek pola pada dokumen dan gambar dihitung lewat
`perkiraan_biaya.py` milik penjaga biaya, bukan lewat build.

## Contoh penggunaan

Audit graph lama: 31% node bernama satu-dua huruf dari `gsap.min.js` dan `lenis.min.js`. Ditambah
`*.min.js` dan `*.min.css`. Uji kering: 1.338 menjadi 835 node; god node menjadi `ComicPage()`,
`Mascot()`, `GeneratorPanel()`.

## Contoh kegagalan dan perbaikannya

Gagal: menulis `aset/` untuk membuang gambar, ternyata ikut membuang `hero.js` dan `halaman.js`
yang ditulis sendiri. Perbaikan: buang per ekstensi (`*.webp`, `*.png`) dan per pola `*.min.js`, lalu
periksa contoh path yang diabaikan sebelum menyimpan.

## Cara menguji skill ini

Pada folder berisi `app.js` dan `vendor.min.js`, minta "graph saya penuh fungsi aneh". Hasil benar:
pola `*.min.js` dengan komentar, uji kering di folder sementara, angka sebelum-sesudah, dan
`app.js` tetap ada di graph.
