---
name: graphify-catatan-graph
description: Register semua graph graphify yang pernah dibangun di repo, yaitu corpus_id, lokasi graph.json, lingkup, mode build, jumlah node, edge, dan komunitas, status nama komunitas, commit, biaya token, dan status. Pakai saat pengguna bertanya "graph apa saja yang sudah ada?", "catat graph ini", "graph dokumen saya di mana?", "graph mana yang sudah usang?", atau setiap kali skill build, update, atau gabung selesai. Angka dibaca skrip langsung dari graph.json, tidak diketik tangan, dan register bisa diperiksa terhadap graph di disk. Jangan dipakai untuk menilai kesehatan graph, itu tugas graphify-audit-graph, atau untuk merencanakan graph baru, itu tugas graphify-rencana-korpus.
---

# graphify-catatan-graph

Satu pemilik untuk `graphify-kerja/register/graph-register.csv`. Model tidak mengingat graph apa saja
yang pernah dibuat; register inilah ingatannya.

Sebelum mulai, baca `references/graphify-core.md`. Skrip skill ini: `scripts/catat_graph.py` (jalankan dari akar repo dengan path
`.claude/skills/graphify-catatan-graph/scripts/catat_graph.py`). Kolom register sama dengan template
`assets/graph-register.csv`.

## Kapan digunakan

- Setelah graph dibangun, diperbarui, digabung, atau dipindah.
- Pengguna menanyakan daftar graph, lokasinya, atau mana yang usang.
- Sebelum audit berkala: `periksa` menunjukkan baris register yang tidak cocok lagi dengan disk.

## Kapan tidak digunakan

- Menilai mutu graph: `graphify-audit-graph`.
- Menentukan isi graph baru: `graphify-rencana-korpus`.

## Input

- Untuk `tambah`: corpus_id, path `graph.json`, lingkup (satu kalimat), mode
  (`kode|lengkap|dokumen|skill|gabungan|lain`), biaya token bila ada, catatan.
- Untuk `daftar` dan `periksa`: tidak ada.

## Default

- Register di `graphify-kerja/register/graph-register.csv`; dibuat otomatis dari kolom template bila belum ada.
- Status baru `aktif`. Biaya token 0 untuk build AST.

## Pertanyaan bila info penting belum ada

Hanya bila lingkup tidak diketahui: "Satu kalimat, graph ini berisi apa saja?"

## Langkah kerja

1. Mencatat: `python3 scripts/catat_graph.py tambah --corpus-id KRP-repo --graph graphify-out/graph.json --lingkup "..." --mode kode`.
2. Menampilkan: `python3 scripts/catat_graph.py daftar`.
3. Mencocokkan: `python3 scripts/catat_graph.py periksa`. Baris "tertinggal" dicatat ulang dengan `tambah`.
4. Graph yang sengaja tidak dipakai lagi: `tambah` ulang dengan `--status usang` atau `--status arsip`
   (arsip tidak dicek keberadaan graph-nya).
5. Laporkan baris yang ditambah atau diubah beserta angkanya.

## Aturan keputusan

- Satu corpus_id satu baris; `tambah` mengganti baris lama (upsert).
- corpus_id harus `KRP-huruf-kecil` (lihat aturan inti bagian 5); selain itu ditolak.
- Angka node, edge, komunitas, commit, dan tanggal selalu dari skrip.
- `biaya_token` diisi dari angka yang dilaporkan skill build (ASUMSI bila perkiraan).

## Format hasil

```
Tercatat KRP-repo: 835 node, 1693 edge, 48 komunitas, nama komunitas lengkap, commit 843cb24e
| corpus_id | mode | node | edge | komunitas | nama | commit | status | lokasi |
```

## Pemeriksaan kualitas

- `periksa` mengembalikan OK setelah pencatatan.
- Tidak ada dua baris dengan corpus_id sama.

## Penanganan kesalahan

- `graph.json` tidak ada: tolak pencatatan; minta build dulu.
- Register rusak (kolom salah): `periksa` melapor GAGAL; perbaiki header sesuai `assets/graph-register.csv`
  tanpa menghapus baris.

## Serah terima

Skill layanan: mengembalikan baris yang dicatat ke skill pemanggil. Tidak menentukan langkah berikutnya.

## Batas kemampuan alat

Hanya membaca `graph.json` dan menulis satu berkas CSV. Tidak tahu biaya token sesungguhnya; itu
diisi pemanggil.

## Contoh penggunaan

Setelah graph perpustakaan skill dibuat: `tambah --corpus-id KRP-skill --graph
graphify-kerja/graph/KRP-skill/graphify-out/graph.json --lingkup "79 skill di .claude/skills" --mode skill`.

## Contoh kegagalan dan perbaikannya

Gagal: register menulis "48 komunitas" untuk graph yang sudah diperbarui menjadi 50. Perbaikan:
`periksa` mendeteksi "register tertinggal (komunitas 48 -> 50)"; jalankan `tambah` lagi.

## Cara menguji skill ini

Catat sebuah graph, ubah graph-nya (tambah satu node), lalu jalankan `periksa`. Hasil benar: baris
PERINGATAN "tertinggal" dengan angka lama dan baru, kode keluar 0.
