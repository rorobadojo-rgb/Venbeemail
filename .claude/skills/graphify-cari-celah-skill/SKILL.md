---
name: graphify-cari-celah-skill
description: Memeriksa perpustakaan skill untuk menemukan celah dan kerusakan, yaitu frontmatter hilang atau rusak, name yang tidak sama dengan nama folder, description kosong, terlalu pendek, lebih dari 1024 karakter, atau memuat kurung sudut, file references, assets, atau scripts yang dirujuk tetapi tidak ada, nama skill di dalam backtick yang tidak ada, SKILL.md lebih dari 500 baris, file pendukung yang tidak pernah disebut, skill yatim, dan keluarga skill tanpa pintu masuk. Pakai saat pengguna berkata "cek skill saya", "ada rujukan rusak?", "skill mana yang tidak terpakai?", "kenapa skill ini gagal diunggah?", atau setelah menambah, menghapus, atau mengganti nama skill. Jangan dipakai untuk mencari skill yang mirip, itu tugas graphify-cari-tumpang-tindih-skill.
---

# graphify-cari-celah-skill

Satu pemilik untuk daftar celah dan rujukan rusak perpustakaan skill. Rujukan rusak membuat skill
gagal di tengah jalan; frontmatter rusak membuat skill gagal diunggah atau tidak pernah terpicu.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Setelah perubahan skill (tambah, hapus, ganti nama, pindah file).
- Sebelum mengemas skill ke berkas `.skill` untuk claude.ai.
- Peninjauan berkala.

## Kapan tidak digunakan

- Skill yang mirip atau pemicu berebut: `graphify-cari-tumpang-tindih-skill`.
- Uji struktur penuh keluarga graphify (15 bagian wajib, indeks, serah terima): jalankan
  `python3 keluarga-graphify/tools/run_tests.py`.

## Input

- Opsional: folder skill (default `.claude/skills`), awalan keluarga, nama tambahan yang bukan skill.

## Default

- `python3 scripts/cek_celah_skill.py --akar .` atas seluruh perpustakaan.
- Nama berbentuk skill yang sebenarnya folder di akar repo (misalnya `graphify-out`, `studio-nangka`)
  tidak dihitung rusak.

## Pertanyaan bila info penting belum ada

Tidak ada.

## Langkah kerja

1. Jalankan `scripts/cek_celah_skill.py` (tambahkan `--awalan` untuk satu keluarga).
2. Kelompokkan temuan: GAGAL (harus diperbaiki), PERINGATAN (sebaiknya), INFO (pertimbangkan).
3. Untuk tiap GAGAL, tulis perbaikan konkret: path yang benar, nama skill yang benar, atau
   pemangkasan description.
4. Untuk skill yatim dan file mati, tanyakan pengguna apakah sengaja (skill mandiri boleh yatim).
5. Perbaiki setelah disetujui, lalu jalankan skrip lagi sampai tidak ada GAGAL.

## Aturan keputusan

- GAGAL wajib diperbaiki sebelum pengemasan atau unggah.
- Skill yatim di keluarga yang punya pintu masuk biasanya berarti pintu masuk lupa menyebutnya.
- File mati dihapus hanya setelah dipastikan tidak dipakai skrip lain (cari namanya di seluruh repo).

## Format hasil

```
Skill di perpustakaan: 79; diperiksa: 79
| GAGAL | toko-listing | file yang dirujuk tidak ada: references/tidak-ada.md |
| INFO | keluarga etsy- | 18 skill tanpa skill pintu masuk (dirigen/orchestrator) |
Ringkas: 1 GAGAL, 0 PERINGATAN, 1 INFO
```

## Pemeriksaan kualitas

- Setelah perbaikan, skrip kembali dengan 0 GAGAL (kode keluar 0).
- Tidak ada file yang dihapus tanpa persetujuan.

## Penanganan kesalahan

- Banyak GAGAL palsu untuk nama yang bukan skill: tambahkan `--abaikan nama1,nama2`.
- Folder tanpa SKILL.md: tidak dihitung sebagai skill; laporkan bila tampak seperti skill yang rusak.

## Serah terima

Skill ujung: daftar temuan dan perbaikan dikembalikan ke pengguna.

## Batas kemampuan alat

Memeriksa bentuk dan rujukan, bukan mutu isi. "Keluarga tanpa pintu masuk" ditebak dari awalan nama;
keluarga Etsy di repo ini memakai pintu masuk `studio-wall-art-orchestrator` yang awalannya berbeda,
jadi temuan INFO itu wajar.

## Contoh penggunaan

Perpustakaan Studio: 0 GAGAL, 0 PERINGATAN, 1 INFO (keluarga `etsy-` tanpa pintu masuk sendiri; wajar
karena dirigennya `studio-wall-art-orchestrator`).

## Contoh kegagalan dan perbaikannya

Gagal: menghapus berkas skrip lama.py karena tercatat "tidak disebut", padahal dipanggil skrip skill lain.
Perbaikan: sebelum menghapus, cari nama berkas di seluruh repo; hapus hanya bila memang tidak dipakai.

## Cara menguji skill ini

Buat skill uji yang merujuk berkas references/tidak-ada.md dan menyebut skill yang tidak ada. Hasil benar: dua
GAGAL dengan path dan nama persis, kode keluar 1.
