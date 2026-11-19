---
name: graphify-tambah-sumber
description: Memasukkan sumber luar ke korpus graphify lewat graphify add, yaitu artikel web (diubah ke Markdown), paper arXiv, PDF, tweet, gambar, dan video atau YouTube (audio diunduh lalu ditranskripsi), lengkap dengan penanda penulis dan penyumbang, ke folder raw per korpus. Pakai saat pengguna berkata "tambahkan artikel ini ke graph", "masukkan paper arXiv ini", "graph-kan video YouTube ini", "simpan sumber ini untuk riset", atau "kumpulkan bacaan ke graph". Mengambil isi dari internet, jadi butuh izin dan host yang diizinkan jaringan sesi. Jangan dipakai untuk berkas yang sudah ada di repo, itu langsung masuk lewat graphify-graph-dokumen, atau untuk video lokal, itu tugas graphify-transkrip-media.
---

# graphify-tambah-sumber

Satu pemilik untuk sumber luar yang masuk korpus. Setiap sumber diberi asal-usul (URL, penulis,
penyumbang, tanggal), sehingga jawaban dari graph bisa dilacak ke sumbernya.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Pengguna memberi URL yang isinya ingin masuk graph pengetahuan.
- Membangun korpus riset (paper, artikel, video tutorial).

## Kapan tidak digunakan

- Berkas sudah ada di repo: `graphify-graph-dokumen` atau build lengkap.
- Video atau audio lokal: `graphify-transkrip-media`.

## Input

- Wajib: URL, corpus_id tujuan.
- Opsional: nama penulis (`--author`), nama penyumbang (`--contributor`).

## Default

- Folder simpan: `graphify-kerja/raw/<corpus_id>/` (bukan `./raw` di akar repo).
- Perintah: `graphify add <url> --dir graphify-kerja/raw/<corpus_id> --author "<nama>" --contributor "<nama>"`.

## Pertanyaan bila info penting belum ada

1. "Masuk ke korpus mana?" bila ada lebih dari satu korpus dokumen.
2. "Penulis aslinya siapa?" bila halaman tidak menyebutnya dan pengguna ingin atribusi.

## Langkah kerja

1. Minta izin lewat `graphify-penjaga-biaya`: URL dan host yang dihubungi, dan bahwa isinya nanti
   dibaca model saat pass semantik.
2. Pastikan host bisa dijangkau dari sesi (di sesi cloud hanya host yang diizinkan lingkungan). Bila
   ditolak proxy, laporkan host-nya; jangan mencari jalan pintas.
3. Jalankan `graphify add` dengan `--dir` folder korpus. graphify mengenali jenis URL sendiri:
   YouTube/video (butuh extra `video`), arXiv, PDF, tweet, gambar, atau halaman web.
4. Periksa berkas yang tersimpan (path dicetak graphify) dan buka sekilas: isi benar, bukan halaman
   login atau error.
5. Catat sumber di register lewat `graphify-catatan-graph` (kolom catatan: URL, tanggal akses).
6. Teruskan ke pembaruan agar sumber masuk graph.

## Aturan keputusan

- Hanya sumber yang boleh disimpan pengguna (konten publik atau milik sendiri). Konten berbayar,
  berlisensi tertutup, atau di balik login tidak diunduh.
- Satu sumber satu berkas; URL ganda tidak diunduh ulang.
- Video tanpa extra `video`: simpan URL di catatan, minta pemasangan extra dulu.

## Format hasil

```
Ditambahkan ke KRP-riset: arxiv.org/abs/1706.03762 -> graphify-kerja/raw/KRP-riset/attention-is-all-you-need.md
Penulis: Vaswani dkk. | penyumbang: pemilik repo | diakses 2026-11-19
Belum masuk graph: menunggu pembaruan (pass semantik, ±6 ribu token)
```

## Pemeriksaan kualitas

- Berkas ada dan isinya sesuai URL.
- Asal-usul (URL, penulis, tanggal) tercatat.

## Penanganan kesalahan

- Proxy menolak host: laporkan host dan sarankan pengguna mengizinkannya di pengaturan lingkungan.
- graphify mengembalikan error (URL tidak didukung, unduhan gagal): tampilkan pesannya, jangan lanjut diam-diam.
- Halaman berisi pemberitahuan cookie atau login: hapus berkasnya, laporkan sumber tidak bisa diambil.

## Serah terima

```
dari: graphify-tambah-sumber
korpus: KRP-riset
status: selesai
```

Berikutnya: `graphify-perbarui-graph` (pass semantik untuk berkas baru). Izin dari
`graphify-penjaga-biaya`; asal-usul dicatat lewat `graphify-catatan-graph`.

## Batas kemampuan alat

Mengunduh satu URL per perintah. Tidak merayapi situs. Kualitas Markdown dari halaman web bergantung
pada strukturnya; halaman yang dibangun JavaScript sering kosong.

## Contoh penggunaan

Korpus riset `KRP-riset`: tiga URL arXiv tentang knowledge graph. Tiap URL disimpan sebagai `.md`
berisi abstrak dan metadata, dicatat, lalu pembaruan dokumen memasukkannya ke graph.

## Contoh kegagalan dan perbaikannya

Gagal: `graphify add` tanpa `--dir` menyimpan ke `./raw/` di akar repo, yang lalu ikut ke graph kode
utama dan membuat komunitas aneh. Perbaikan: selalu `--dir graphify-kerja/raw/<corpus_id>`.

## Cara menguji skill ini

Berikan URL ke host yang tidak diizinkan jaringan sesi. Hasil benar: izin diminta, proxy menolak,
host dilaporkan, tidak ada berkas kosong yang tertinggal.
