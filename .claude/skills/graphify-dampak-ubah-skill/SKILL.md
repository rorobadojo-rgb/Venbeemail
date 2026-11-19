---
name: graphify-dampak-ubah-skill
description: Menunjukkan semua tempat yang terdampak bila sebuah skill diganti nama, diubah, atau dihapus, yaitu frontmatter dan bagian Serah terima atau Kapan tidak digunakan di skill lain, indeks keluarga, berkas pendukung, skrip, salinan aturan inti, dan dokumen, masing-masing dengan tingkat dampak TINGGI, SEDANG, atau RENDAH dan nomor barisnya. Bisa menyusun rencana ganti nama dan, setelah disetujui, menerapkannya ke semua berkas teks dan folder skill sekaligus. Pakai saat pengguna bertanya "kalau skill X saya ganti nama, apa yang rusak?", "skill ini dipakai siapa saja?", "aman dihapus?", atau "ganti nama skill ini". Jangan dipakai untuk mencari skill yang mirip, itu tugas graphify-cari-tumpang-tindih-skill.
---

# graphify-dampak-ubah-skill

Satu pemilik untuk daftar dampak perubahan sebuah skill. Mengganti nama skill tanpa memperbarui
rujukannya memutus serah terima dan membuat dirigen mengarah ke skill yang tidak ada.

Sebelum mulai, baca `references/graphify-core.md`.

Skrip skill ini: `scripts/dampak_skill.py` (dari akar repo: `.claude/skills/graphify-dampak-ubah-skill/scripts/dampak_skill.py`).

## Kapan digunakan

- Sebelum mengganti nama, mengubah fungsi, atau menghapus skill.
- Pengguna ingin tahu siapa yang bergantung pada sebuah skill.

## Kapan tidak digunakan

- Mencari kemiripan antarskill: `graphify-cari-tumpang-tindih-skill`.
- Memeriksa rujukan rusak secara umum: `graphify-cari-celah-skill`.

## Input

- Wajib: nama skill.
- Opsional: nama baru (rencana ganti nama).

## Default

- `python3 scripts/dampak_skill.py <nama>` dari akar repo; hanya membaca.
- Berkas `dist/` (ZIP) tidak dipindai; kemas ulang sesudah perubahan.

## Pertanyaan bila info penting belum ada

Untuk penerapan saja: "Rencana di atas mengubah N berkas dan mengganti nama folder. Terapkan?"

## Langkah kerja

1. Jalankan `scripts/dampak_skill.py <nama>`.
2. Baca tabel per tingkat:
   - TINGGI: frontmatter skill lain, Serah terima, Kapan tidak digunakan, indeks keluarga;
   - SEDANG: bagian lain SKILL.md, berkas pendukung, skrip, sumber aturan inti;
   - RENDAH: dokumen dan catatan.
3. Bila sebuah graph skill sudah ada, lengkapi dengan
   `graphify affected "<nama>" --graph graphify-kerja/graph/KRP-skill/graphify-out/graph.json --relation hands_off_to --relation references`.
4. Untuk ganti nama: `--ganti-nama <baru>` mencetak rencana; dengan persetujuan, tambahkan `--terapkan`.
5. Setelah menerapkan: jalankan alat keluarga yang terdampak (sync, indeks, uji), kemas ulang `dist/`,
   lalu bangun ulang graph skill.

## Aturan keputusan

- Ada dampak TINGGI di indeks: perubahan nama harus memperbarui indeks dalam commit yang sama.
- Menghapus skill yang dirujuk Serah terima skill lain: tidak boleh sebelum skill lain diubah.
- Salinan aturan inti tidak diubah satu per satu; ubah sumbernya di `_shared/` lalu sinkronkan.
- Kata yang hanya mengandung nama (misalnya `toko-hargaku` untuk `toko-harga`) tidak dihitung; pencocokan per kata utuh.

## Format hasil

```
Skill: studio-brand-memory (folder ada)
Kemunculan: 78 di 63 berkas; TINGGI 9, SEDANG 11, RENDAH 10, SENDIRI 3, SALINAN 45
| TINGGI | .claude/skills/studio-brief-interviewer/SKILL.md:87 | bagian 'Serah terima' | ... |
45 kemunculan ada di salinan aturan inti; cukup ubah sumbernya di _shared/ lalu jalankan sync.
```

## Pemeriksaan kualitas

- Setelah ganti nama, skrip dengan nama lama menemukan 0 kemunculan di luar dokumen sejarah.
- Uji struktur keluarga yang terdampak lulus.

## Penanganan kesalahan

- Folder nama baru sudah ada: skrip menolak; pilih nama lain.
- Nama tidak sah (huruf besar, spasi): skrip menolak dengan pesan.
- Penerapan setengah jalan (error di tengah): kembalikan dengan `git checkout` dan ulangi.

## Serah terima

Skill ujung: laporan dampak (dan daftar berkas yang diubah bila diterapkan) dikembalikan ke pengguna.

## Batas kemampuan alat

Mencari teks persis. Rujukan tak langsung (deskripsi fungsi tanpa menyebut nama) tidak terdeteksi.
Skill yang sudah diunggah ke akun claude.ai tidak ikut berubah; unggah ulang berkas `.skill` baru.

## Contoh penggunaan

`studio-brand-memory`: 9 dampak TINGGI (4 bagian Serah terima, 5 baris indeks), 45 di salinan aturan
inti. Kesimpulan: ganti nama butuh perubahan indeks, sumber aturan inti, dan 5 skill.

## Contoh kegagalan dan perbaikannya

Gagal: mengganti nama dengan cari-ganti manual di editor; folder skill lupa diganti, sehingga
frontmatter tidak sama dengan nama folder. Perbaikan: pakai `--terapkan` yang mengganti teks dan
folder sekaligus, lalu jalankan uji.

## Cara menguji skill ini

Di repo uji, ganti nama `toko-harga` menjadi `toko-tarif` dengan `--terapkan`. Hasil benar: folder
berganti, rujukan di skill lain berganti, kata `toko-hargaku` tidak tersentuh.
