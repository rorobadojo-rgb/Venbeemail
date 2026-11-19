---
name: graphify-kelola-versi
description: Menaikkan, menurunkan, atau mencopot graphify dengan aman tanpa kehilangan graph, nama komunitas, memori jawaban, dan pengaman hook, yaitu membaca catatan perubahan, mencadangkan graphify-out, memasang versi pasti lewat uv, memasang ulang skill resmi ke project, memperbarui graph karena skema cache AST bisa berubah, membungkus ulang hook, dan memverifikasi dengan diagnosa. Pakai saat pengguna berkata "upgrade graphify", "update ke versi terbaru", "turunkan versi", "versi skill dan CLI beda", "copot graphify", atau saat diagnosa melaporkan versi berbeda. Jangan dipakai untuk pemasangan pertama di sesi baru, itu tugas graphify-pasang-cli, atau untuk error tanpa urusan versi, itu tugas graphify-atasi-masalah.
---

# graphify-kelola-versi

Satu pemilik untuk naik turun versi dan pencopotan graphify. Versi baru bisa mengubah id node dan
skema cache; tanpa langkah yang benar, nama komunitas dan pengaman hook bisa hilang.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Upgrade atau downgrade versi CLI dan skill resmi.
- Diagnosa: versi CLI dan skill resmi berbeda.
- Mencopot graphify dari repo atau mesin.

## Kapan tidak digunakan

- Pemasangan pertama di sesi baru (versi baku): `graphify-pasang-cli`.
- Error yang tidak terkait versi: `graphify-atasi-masalah`.

## Input

- Wajib: versi tujuan (atau "copot").
- Opsional: alasan (fitur, perbaikan bug).

## Default

- Versi pasti, tidak pernah "terbaru" tanpa nomor: `uv tool install --force "graphifyy[mcp,watch,pdf,office,svg,sql]==<versi>"`.
- Sesudah upgrade: `graphify install --project`, lalu pembungkus hook, lalu `graphify update .`.

## Pertanyaan bila info penting belum ada

1. "Naik ke versi berapa? (saya cek daftar versi di PyPI dulu)"
2. Untuk copot: "Graph (`graphify-out/`) dan memori ikut dihapus, atau disimpan?"

## Langkah kerja

1. Diagnosa lewat `graphify-diagnosa-lingkungan`; catat versi sekarang.
2. Lihat versi tersedia: `pip index versions graphifyy`. Baca catatan perubahan versi tujuan bila ada
   (perubahan skema cache AST memaksa ekstraksi ulang).
3. Cadangkan: `cp -r graphify-out /tmp/graphify-out-cadangan` (atau pastikan sudah di-commit).
4. Pasang versi tujuan lewat `graphify-pasang-cli` dengan nomor versi pasti dan `--force`.
5. Pasang ulang skill resmi: `graphify install --project`. Ini menimpa SKILL.md resmi dan hook.
6. Bungkus ulang hook dan periksa (dikerjakan skill always-on).
7. Perbarui graph: `graphify update .`; bila id berubah besar, banding dengan cadangan dan namai ulang
   komunitas yang berubah.
8. Diagnosa ulang; semua versi harus sama.
9. Pencopotan: `graphify claude uninstall` (CLAUDE.md dan hook), `graphify uninstall` (semua platform),
   `graphify uninstall --purge` hanya bila graph juga dihapus dan pengguna setuju, lalu
   `uv tool uninstall graphifyy`.

## Aturan keputusan

- Selalu satu versi pasti untuk CLI dan skill resmi.
- Turunkan versi bila versi baru merusak; catat alasannya di serah terima.
- Jangan menghapus `graphify-out/` saat upgrade; cache lama otomatis dibuang bila skemanya berubah.
- Keluarga skill ini memakai perintah yang stabil; setelah upgrade besar, jalankan uji keluarga
  (`python3 keluarga-graphify/tools/run_tests.py`).

## Format hasil

```
Versi: 0.9.112 -> 0.9.120 (CLI dan skill resmi)
Cadangan: /tmp/graphify-out-cadangan
Hook: dibungkus ulang, --periksa OK
Graph: graphify update . -> 835 -> 841 node; 2 komunitas dinamai ulang
Diagnosa: 8 OK, 0 PERINGATAN versi
```

## Pemeriksaan kualitas

- `graphify --version` dan `.claude/skills/graphify/.graphify_version` sama.
- Hook terbungkus setelah pemasangan ulang skill.
- Nama komunitas tetap atau dinamai ulang, tidak ada "Community N".

## Penanganan kesalahan

- Versi tujuan gagal dipasang (konflik dependensi): kembali ke versi lama dengan versi pasti.
- Graph rusak setelah upgrade: pulihkan cadangan, laporkan versi bermasalah.
- Uji keluarga gagal setelah upgrade: catat perintah yang berubah; perbarui skill keluarga yang terdampak.

## Serah terima

```
dari: graphify-kelola-versi
status: selesai | gagal (dikembalikan ke versi lama)
```

Berikutnya: `graphify-mode-always-on` (bungkus ulang hook). Memakai `graphify-pasang-cli` dan
`graphify-diagnosa-lingkungan`.

## Batas kemampuan alat

Catatan perubahan graphify sangat panjang; skill membaca bagian versi yang relevan saja. Versi yang
belum ada di PyPI tidak bisa dipasang dari registri.

## Contoh penggunaan

Diagnosa: CLI 0.9.112, skill resmi 0.9.110 (dipasang dari sesi lama). `graphify install --project`
memperbarui skill resmi ke 0.9.112; hook dibungkus ulang; diagnosa OK.

## Contoh kegagalan dan perbaikannya

Gagal: upgrade dengan `uv tool install graphifyy` tanpa versi; sesi berikutnya memasang versi lain dan
graph berubah id tanpa sebab yang jelas. Perbaikan: versi pasti di setiap pemasangan.

## Cara menguji skill ini

Minta "upgrade graphify" tanpa versi. Hasil benar: daftar versi dicek, pengguna ditanya versi pasti,
cadangan dibuat sebelum pemasangan, hook dibungkus ulang, diagnosa akhir tanpa perbedaan versi.
