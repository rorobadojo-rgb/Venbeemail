---
name: graphify-perbarui-graph
description: Memperbarui graph graphify setelah kode atau dokumen berubah, dengan jalur yang tepat untuk tiap jenis perubahan, yaitu graphify update untuk kode (gratis, memakai cache), /graphify --update untuk dokumen (pass semantik hanya untuk file yang berubah), --force saat graph memang harus mengecil, dan check-update untuk penanda needs_update. Pakai saat pengguna berkata "perbarui graph", "graph-nya basi", "habis git pull", "saya baru ubah kode", "dokumen saya tambah", "refused to shrink", atau saat diagnosa melaporkan graph tertinggal dari HEAD. Jangan dipakai untuk build pertama, itu tugas skill build, atau untuk mengatur auto-rebuild tiap commit, itu tugas graphify-otomasi-git.
---

# graphify-perbarui-graph

Satu pemilik untuk cara dan waktu pembaruan graph. Pembaruan yang benar murah; pembaruan yang salah
membuang token atau menghapus nama komunitas.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Diagnosa atau audit: graph tertinggal dari HEAD.
- Setelah `git pull`, refactor, atau penambahan dokumen.
- graphify menolak menimpa karena graph baru lebih kecil.

## Kapan tidak digunakan

- Graph belum ada: `graphify-bangun-graph-kode` atau `graphify-bangun-graph-lengkap`.
- Ingin pembaruan otomatis setiap commit: `graphify-otomasi-git`.

## Input

- Wajib: corpus_id atau path graph.
- Opsional: jenis perubahan (kode, dokumen, penghapusan), daftar file.

## Default

- Kode: `graphify update <akar>` (AST, gratis).
- Dokumen: `/graphify <akar> --update` di chat, didahului perkiraan biaya untuk file yang berubah saja.
- Untuk korpus di `graphify-kerja/graph/<id>/`: `graphify update` membaca `.graphify_root`; bila
  graph dibangun dengan `--out`, ulangi `graphify extract` dengan `--out` yang sama.

## Pertanyaan bila info penting belum ada

Hanya bila graph akan mengecil: "Graph baru lebih kecil (X node menjadi Y). Itu karena file memang
dihapus atau dikecualikan? Bila ya, saya lanjutkan dengan --force."

## Langkah kerja

1. CLI lewat `graphify-pasang-cli`.
2. Tentukan jenis perubahan: `git diff --name-only <built_at_commit> HEAD` (commit ada di `graph.json`).
3. Kode berubah: `graphify update <akar>`. Keluaran "No code-graph topology changes detected" berarti
   graph tetap sama dan tidak ditulis ulang.
4. Dokumen berubah: minta izin biaya untuk file yang berubah, lalu `/graphify <akar> --update`.
5. Penanda `needs_update` (dari watch atau hook): `graphify check-update <akar>` menunjukkan apakah
   pass semantik tertunda.
6. Graph ditolak mengecil: jelaskan, tanya, lalu `graphify update <akar> --force` bila disetujui.
7. Perbarui register lewat `graphify-catatan-graph`.
8. Laporkan perubahan angka (node, edge, komunitas) dan apakah ada komunitas baru tanpa nama.

## Aturan keputusan

- Hanya kode yang berubah: tidak ada token; jalankan langsung.
- Nama komunitas: graphify memetakan ulang komunitas ke id lama dan memakai nama tersimpan; komunitas
  yang benar-benar baru diberi nama cadangan dari hub dan perlu dinamai.
- `--force` hanya dengan alasan tertulis di serah terima.
- Setelah perubahan besar (lebih dari 20% node), sarankan audit.

## Format hasil

```
Perubahan sejak 843cb24e: 6 file kode
graphify update . -> 835 -> 842 node, 1.693 -> 1.705 edge, 48 -> 49 komunitas
Komunitas baru tanpa nama: 1 (id 48)
```

## Pemeriksaan kualitas

- `built_at_commit` di `graph.json` sama dengan HEAD setelah pembaruan.
- Angka sebelum dan sesudah dari `graph.json`, bukan dari ingatan.

## Penanganan kesalahan

- `update` tanpa perubahan topologi tetapi diagnosa masih basi: graph sama, penanda commit tidak
  berubah; catat bahwa isi graph tetap valid.
- Build sebagian gagal: laporkan file yang gagal, jangan menyatakan graph lengkap.

## Serah terima

```
dari: graphify-perbarui-graph
status: selesai | perlu_tinjau (komunitas baru tanpa nama)
bukti: graphify update . -> 842 nodes
```

Berikutnya: `graphify-namai-komunitas` bila ada komunitas baru. Memakai `graphify-pasang-cli` dan
`graphify-catatan-graph`.

## Batas kemampuan alat

`graphify update` hanya menyentuh kode. Perubahan dokumen tanpa pass semantik tidak masuk graph.
Di sesi cloud, hook git tidak bertahan antarsesi, jadi pembaruan dipicu manual atau oleh diagnosa.

## Contoh penggunaan

Setelah commit keluarga skill ini, diagnosa: graph tertinggal, beberapa file `.py` dan `.json` baru.
`graphify update .` menambah node skrip baru; satu komunitas baru dinamai lewat skill penamaan.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan `/graphify . --update` untuk perubahan kode saja; skill resmi memeriksa ulang
dokumen dan pengguna kehilangan token tanpa manfaat. Perbaikan: jenis perubahan dicek dulu; kode
saja memakai `graphify update`.

## Cara menguji skill ini

Hapus satu file kode yang ada di graph, lalu minta "perbarui graph". Hasil benar: graphify menolak
mengecil, skill bertanya dengan angka, `--force` hanya setelah disetujui, dan register diperbarui.
