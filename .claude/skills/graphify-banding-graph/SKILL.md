---
name: graphify-banding-graph
description: Membandingkan dua versi graph graphify, yaitu jumlah node, edge, komunitas, dan file sumber, daftar node dan edge yang bertambah atau hilang, file yang masuk atau keluar graph, komunitas yang muncul atau hilang, dan node yang pindah komunitas. Versi lama bisa dari berkas atau langsung dari git (misalnya HEAD~1). Pakai saat pengguna bertanya "apa bedanya graph sekarang dan kemarin?", "perubahan pengecualian ini menghapus apa?", "refactor ini mengubah struktur apa?", "kenapa jumlah node turun?", atau sebelum menyetujui --force. Jangan dipakai untuk menilai kesehatan satu graph, itu tugas graphify-audit-graph.
---

# graphify-banding-graph

Satu pemilik untuk perbandingan dua versi graph. Membandingkan memberi bukti apa yang benar-benar
berubah, daripada menebak dari jumlah node saja.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Sebelum dan sesudah perubahan pengecualian, update, atau gabung.
- Graph mengecil dan pengguna perlu tahu apa yang hilang sebelum `--force`.
- Meninjau dampak struktural sebuah commit.

## Kapan tidak digunakan

- Kesehatan satu graph: `graphify-audit-graph`.
- Perbedaan isi baris kode: pakai `git diff`; graph hanya menunjukkan struktur.

## Input

- Wajib: dua berkas `graph.json`, atau satu revisi git plus path graph.
- Opsional: jumlah contoh per daftar (`--maks`, default 15).

## Default

- Dari git: `python3 scripts/banding_graph.py --rev HEAD~1 --graph graphify-out/graph.json`.
- Dari berkas: `python3 scripts/banding_graph.py lama.json baru.json`.

## Pertanyaan bila info penting belum ada

"Bandingkan dengan versi mana: commit sebelumnya, atau berkas graph tertentu?"

## Langkah kerja

1. Siapkan versi lama: salin `graph.json` sebelum perubahan, atau pakai `--rev`.
2. Jalankan `scripts/banding_graph.py`.
3. Baca ringkasan; untuk node atau file yang hilang, cek apakah memang diinginkan (dihapus atau
   dikecualikan) atau kehilangan tak sengaja (gagal parse, pola terlalu lebar).
4. Laporkan selisih angka, tiga sampai lima contoh terpenting, dan kesimpulan berlabel.

## Aturan keputusan

- File hilang yang masih ada di disk: tanda pengecualian terlalu lebar atau gagal parse; PERINGATAN.
- Komunitas "hilang" yang hanya berganti nama dari "Community N": wajar setelah penamaan.
- Banyak node pindah komunitas setelah ganti algoritma (Louvain ke Leiden): wajar; perlu namai ulang.

## Format hasil

```
| node | 1338 | 835 | -503 |
| edge | 2700 | 1693 | -1007 |
Node hilang (503): Aa() [situs-pro/aset/vbpro/js/gsap.min.js] ...
File hilang dari graph (4): situs-pro-kong/aset/vbkong/js/gsap.min.js ...
Kesimpulan (PENGAMATAN): semua yang hilang berasal dari *.min.js; tidak ada kode sendiri yang hilang.
```

## Pemeriksaan kualitas

- Kesimpulan menyebut berkas mana yang hilang dan alasannya.
- Versi lama dan baru disebut jelas (commit atau path).

## Penanganan kesalahan

- `git show` gagal (graph belum di-commit di revisi itu): pakai berkas salinan.
- Graph format berbeda (dari versi graphify lama): perbandingan tetap berjalan per id; sebutkan bahwa
  perubahan skema bisa mengganti id.

## Serah terima

Skill ujung: hasil perbandingan dikembalikan ke pemanggil atau pengguna, tanpa skill berikutnya tetap.

## Batas kemampuan alat

Membandingkan per id node dan per (sumber, tujuan, relasi) edge. Bila id dibentuk ulang oleh versi
graphify baru, node yang sama bisa terlihat hilang lalu muncul.

## Contoh penggunaan

Setelah `.graphifyignore` repo ini ditambah `*.min.js`: 503 node dan 1.007 edge hilang, semuanya dari
tujuh file minified; empat file hilang dari graph; tidak ada kode sendiri yang hilang.

## Contoh kegagalan dan perbaikannya

Gagal: menyetujui `--force` karena "cuma turun 10 node", ternyata `lib/mail.ts` gagal di-parse.
Perbaikan: banding dulu; file hilang yang masih ada di disk dilaporkan sebagai PERINGATAN.

## Cara menguji skill ini

Commit sebuah graph, tambahkan satu node, lalu minta "apa bedanya dengan commit terakhir?". Hasil
benar: `--rev HEAD`, satu node baru dengan nama dan file sumbernya, selisih +1.
