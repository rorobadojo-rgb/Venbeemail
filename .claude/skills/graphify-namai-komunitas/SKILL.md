---
name: graphify-namai-komunitas
description: Memberi nama komunitas graph graphify dalam bahasa Indonesia yang jelas (2 sampai 6 kata), lalu menerapkannya ke graph.json, GRAPH_REPORT.md, dan graph.html tanpa memakai backend LLM graphify, dan memastikan nama bertahan saat rebuild berikutnya. Pakai saat pengguna berkata "namanya Community 0, Community 1", "beri nama komunitas", "ganti nama kelompok di graph", "komunitas baru belum bernama", atau setelah build, update, atau gabung graph. Skrip meringkas anggota tiap komunitas, memeriksa nama, menulis .graphify_labels.json, menjalankan cluster-only --no-label, lalu memverifikasi nama yang benar-benar terpasang. Jangan dipakai untuk mengubah isi atau anggota komunitas, yang ditentukan algoritma clustering graphify.
---

# graphify-namai-komunitas

Satu pemilik untuk `.graphify_labels.json`. Nama komunitas adalah cara manusia membaca graph; nama
"Community 12" membuat laporan dan peta interaktif hampir tidak berguna.

Sebelum mulai, baca `references/graphify-core.md`. Panduan memilih nama dan contohnya:
`references/panduan-nama.md`.

Skrip skill ini: `scripts/namai_komunitas.py` (dari akar repo: `.claude/skills/graphify-namai-komunitas/scripts/namai_komunitas.py`).

## Kapan digunakan

- Setelah build, update, atau gabung graph yang menghasilkan komunitas tanpa nama.
- Diagnosa atau audit melaporkan komunitas bernama sementara.
- Pengguna ingin mengganti nama yang kurang tepat.

## Kapan tidak digunakan

- Mengubah anggota komunitas atau jumlahnya: itu hasil clustering; resolusi diatur lewat
  `graphify cluster-only --resolution` dan setelah itu komunitas dinamai ulang.
- Pelabelan memakai API (`graphify label`): tidak dipakai keluarga ini karena memakai token diam-diam.

## Input

- Wajib: path `graph.json` (default `graphify-out/graph.json`).
- Opsional: nama yang diusulkan pengguna untuk komunitas tertentu.

## Default

- Nama berbahasa Indonesia, 2 sampai 6 kata, maksimal 40 karakter, unik.
- Nama lama yang masih cocok dipertahankan; hanya yang sementara atau diminta yang diganti.

## Pertanyaan bila info penting belum ada

Tidak ada untuk penamaan biasa. Bila pengguna punya istilah sendiri: "Ada istilah yang harus dipakai
untuk bagian tertentu (misalnya 'situs Kong')?"

## Langkah kerja

1. Ringkas: `python3 scripts/namai_komunitas.py ringkas --graph <graph.json>`.
2. Untuk tiap komunitas, baca file teratas dan node teratas, lalu tulis nama sesuai
   `references/panduan-nama.md`. Simpan sebagai berkas JSON `{"0": "Generator Alamat Email", ...}`
   di folder sementara.
3. Tulis dan terapkan: `python3 scripts/namai_komunitas.py tulis --nama <nama.json> --graph <graph.json> --terapkan`.
   Skrip menolak nama tidak sah (terlalu pendek atau panjang, ganda, "Community N", id tidak ada).
4. Bila skrip melaporkan nama tidak terpasang (anggota berubah saat cluster ulang), ringkas lagi dan
   ulangi untuk komunitas tersebut.
5. Laporkan jumlah nama terpasang dan lima contoh.

## Aturan keputusan

- Nama menggambarkan isi, bukan nama satu file: "Generator Alamat Email", bukan "mail.ts".
- Komunitas berisi konfigurasi diberi nama jenisnya: "Konfigurasi TypeScript", "Dependensi Runtime npm".
- Dua komunitas mirip dibedakan dengan lokasi atau peran: "Pemasang Situs Pro" dan "Pemasang Situs Kong".
- Komunitas tipis (kurang dari 3 node) tetap dinamai agar laporan rapi.

## Format hasil

```
Ringkas: 48 komunitas, 48 bernama sementara
Ditulis 48 nama baru; total 48 dari 48 komunitas bernama
Diterapkan: 48 nama terpasang di graph.json, GRAPH_REPORT.md, dan graph.html
Contoh: 12 Generator Alamat Email | 19 Dinding Doodle Three.js | 25 Navigasi Bab Komik
```

## Pemeriksaan kualitas

- Verifikasi skrip setelah `--terapkan` berhasil (kode keluar 0).
- `.graphify_labels.json.sig` ada di samping berkas nama (dibuat graphify), sehingga nama bertahan.
- Tidak ada nama yang hanya menyalin nama file.

## Penanganan kesalahan

- Nama ditolak skrip: perbaiki sesuai pesan, jangan melewati pemeriksaan.
- graphify tidak ada: nama tetap tertulis, penerapan menunggu `graphify-pasang-cli`; laporkan status
  "tertulis, belum diterapkan".
- Clustering berubah setiap kali dijalankan (tidak stabil): laporkan; komunitas dengan nama yang tidak
  cocok dinamai ulang.

## Serah terima

```
dari: graphify-namai-komunitas
status: selesai
bukti: namai_komunitas.py tulis --terapkan -> 48 nama terpasang
```

Berikutnya: `graphify-audit-graph`.

## Batas kemampuan alat

Penamaan dikerjakan model sesi yang membaca ringkasan, bukan seluruh kode. Komunitas yang anggotanya
campur aduk diberi nama paling umum yang jujur, dan dicatat sebagai kandidat penyetelan clustering.

## Contoh penggunaan

Graph `KRP-repo` baru: 48 komunitas "Community N". Ringkas menunjukkan komunitas 12 berisi
`lib/mail.ts` dan `DomainFan.tsx`, node `generateLocalPart()`, `copyText()`. Nama: "Generator Alamat
Email". 48 nama diterapkan dan terverifikasi.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan `graphify label .` agar cepat; graphify memakai CLI `claude` sebagai backend dan
menamai dalam bahasa Inggris sambil memakai token. Perbaikan: selalu lewat skrip skill ini dengan
`cluster-only --no-label`.

## Cara menguji skill ini

Beri berkas nama berisi `{"0": "Satu"}`. Hasil benar: ditolak dengan pesan "harus 2-6 kata", tidak ada
berkas yang ditulis. Lalu beri nama sah dengan `--terapkan`; nama muncul di `GRAPH_REPORT.md`.
