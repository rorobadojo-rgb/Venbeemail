---
name: graphify-audit-graph
description: Mengaudit kesehatan sebuah graph graphify dengan skrip, yaitu path sensitif yang bocor ke graph, noise nama satu-dua huruf dari kode minified, file .min. yang ikut masuk, komunitas bernama sementara atau tipis, edge INFERRED yang menyeberang folder atau menyambung nama yang sama, edge AMBIGUOUS, node terisolasi, dan kesegaran terhadap HEAD git. Pakai saat pengguna bertanya "graph-nya sehat?", "kualitas graph", "kok banyak node aneh?", "aman di-commit?", atau setelah build, update, penamaan, atau gabung. Hasilnya laporan bertingkat GAGAL, PERINGATAN, INFO yang bisa disimpan di graphify-kerja/audit/ dan dipakai gerbang G2 atau G3. Jangan dipakai untuk memutuskan lulus atau tidak, itu tugas graphify-gerbang-mutu, atau untuk status CLI dan hook, itu tugas graphify-diagnosa-lingkungan.
---

# graphify-audit-graph

Satu pemilik untuk laporan kesehatan graph. Audit mengukur; gerbang memutuskan.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Setelah build, update, penamaan komunitas, atau penggabungan graph.
- Sebelum graph di-commit, dibagikan, diekspor, atau dibuka lewat MCP.
- Pengguna curiga graph berisi sampah atau hubungan yang salah.

## Kapan tidak digunakan

- Memutuskan lulus atau tidak: `graphify-gerbang-mutu` memakai laporan ini.
- Status CLI, hook, extra: `graphify-diagnosa-lingkungan`.
- Membandingkan dua versi graph: `graphify-banding-graph`.

## Input

- Wajib: path `graph.json`.
- Opsional: corpus_id (untuk nama berkas laporan), ambang noise (default 0,05).

## Default

- `python3 scripts/audit_graph.py --graph <graph.json> --akar . --tulis graphify-kerja/audit/<corpus_id>-<YYYYMMDD>.md`.

## Pertanyaan bila info penting belum ada

Tidak ada. Bila corpus_id tidak diketahui, laporan disimpan memakai nama folder graph.

## Langkah kerja

1. Jalankan `scripts/audit_graph.py` dengan `--tulis` ke folder audit.
2. Baca temuan per tingkat. Untuk tiap edge INFERRED yang disebut, buka baris sumbernya dan tentukan
   apakah hubungan itu nyata; tulis hasilnya di laporan (PENGAMATAN).
3. Untuk temuan GAGAL dan PERINGATAN, sebut skill perbaikan dari kolom perbaikan.
4. Minta penilaian G2 (atau G3 bila tujuannya commit) ke `graphify-gerbang-mutu`, sertakan path laporan.
5. Laporkan ringkasan angka dan temuan terpenting.

## Aturan keputusan

- GAGAL: graph kosong, atau path sensitif ada di graph.
- PERINGATAN: noise di atas ambang, file minified, komunitas bernama sementara, file di graph berubah sejak build.
- INFO: edge INFERRED antarfolder, AMBIGUOUS, komunitas tipis, node terisolasi.
- Edge INFERRED yang sudah diverifikasi nyata tetap INFO; yang salah dicatat sebagai bahan pengecualian
  atau laporan bug, bukan dihapus manual dari `graph.json`.

## Format hasil

```
# Audit graph: graphify-out/graph.json
| node | 835 | edge | 1693 | komunitas | 48 | noise_pendek | 13 | inferred_antarfolder | 3 |
Keyakinan edge: EXTRACTED 1659 (98%), INFERRED 34 (2%)
| INFO | 3 edge INFERRED menyeberang folder puncak: buatJalurPesawat() (situs-pro/...) -indirect_call-> hero() (situs-pro-kong/...) |
Ringkas: 0 GAGAL, 0 PERINGATAN, 2 INFO
```

## Pemeriksaan kualitas

- Laporan berasal dari skrip pada graph yang sama dengan yang dinilai (cek `dibangun_dari`).
- Setiap edge INFERRED yang disebut di kesimpulan sudah diverifikasi atau berlabel HIPOTESIS.

## Penanganan kesalahan

- `graph.json` rusak: skrip GAGAL; arahkan ke `graphify-perbarui-graph` dengan build ulang.
- Bukan repo git: kesegaran tidak dihitung; sebutkan.

## Serah terima

```
dari: graphify-audit-graph
korpus: KRP-repo
status: perlu_tinjau (menunggu G2)
bukti: audit_graph.py -> 0 GAGAL, 0 PERINGATAN, 2 INFO; laporan graphify-kerja/audit/KRP-repo-20261119.md
```

Penilaian lulus diminta ke `graphify-gerbang-mutu`. Skill ujung: tidak ada `berikutnya` tetap;
dirigen memilih langkah setelah gerbang.

## Batas kemampuan alat

Mendeteksi pola yang bisa dihitung. Tidak tahu apakah sebuah hubungan EXTRACTED benar secara makna,
dan tidak menilai kelengkapan (kode yang tidak ada di graph karena gagal di-parse hanya terlihat dari
keluaran build).

## Contoh penggunaan

Graph lama repo ini: 1.338 node, 418 di antaranya (31%) bernama satu-dua huruf dari `gsap.min.js`,
86 komunitas sementara. Temuan PERINGATAN mengarah ke pengecualian dan penamaan. Setelah perbaikan:
835 node, noise 1,6%, 0 PERINGATAN.

## Contoh kegagalan dan perbaikannya

Gagal: kesimpulan audit menyatakan "situs Pro memanggil situs Kong" berdasarkan edge INFERRED.
Perbaikan: baris `hero.js` dibuka; dua situs terpisah, hubungan hanya kesamaan nama `hero()`. Dicatat
sebagai PENGAMATAN "salah sambung", kesimpulan dihapus.

## Cara menguji skill ini

Beri graph berisi satu node dari `studio-nangka/pelanggan/`. Hasil benar: temuan GAGAL path sensitif,
kode keluar 1, laporan tersimpan, dan permintaan G3 menghasilkan GAGAL dari gerbang.
