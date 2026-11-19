---
name: graphify-cari-tumpang-tindih-skill
description: Menemukan skill yang fungsinya mirip atau frasa pemicunya berebut di perpustakaan skill, lalu mengusulkan gabung, persempit, ubah frasa pemicu, atau tulis batas di bagian Kapan tidak digunakan. Skrip membandingkan kata kunci description setiap pasangan skill, mendeteksi frasa pemicu dalam tanda kutip yang sama, dan mengecek apakah batas antarskill sudah tertulis. Pakai saat pengguna berkata "skill mana yang mirip?", "kenapa skill yang salah yang terpanggil?", "ada yang dobel tidak?", "rapikan skill saya", atau sebelum menambah skill baru ke keluarga. Jangan dipakai untuk mencari rujukan rusak atau skill yatim, itu tugas graphify-cari-celah-skill.
---

# graphify-cari-tumpang-tindih-skill

Satu pemilik untuk daftar skill yang tumpang tindih dan usulan penyelesaiannya. Pemicu yang berebut
membuat skill yang salah terpanggil; fungsi yang dobel membuat dua skill memutuskan hal yang sama.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Skill yang salah sering terpanggil.
- Sebelum menambah skill baru: cek apakah fungsinya sudah ada.
- Peninjauan berkala perpustakaan skill.

## Kapan tidak digunakan

- Rujukan rusak, skill yatim, file mati: `graphify-cari-celah-skill`.
- Akibat mengganti nama skill: `graphify-dampak-ubah-skill`.

## Input

- Opsional: folder skill (default `.claude/skills`), awalan keluarga, ambang skor (default 0,30).

## Default

- `python3 scripts/cek_tumpang_tindih.py` atas seluruh perpustakaan.
- Untuk skill baru atau satu keluarga: `--awalan graphify- --lawan-semua` (keluarga itu dibandingkan
  dengan semua skill).

## Pertanyaan bila info penting belum ada

Tidak ada. Bila pengguna menyebut gejala ("yang terpanggil malah X"), pakai X sebagai awalan.

## Langkah kerja

1. Jalankan `scripts/cek_tumpang_tindih.py` dengan opsi yang sesuai.
2. Untuk tiap pasangan teratas, buka kedua SKILL.md: bandingkan Kapan digunakan, Input, dan keluaran.
3. Putuskan usulan per pasangan:
   - fungsi dan keluaran sama: gabung (satu menjadi pemilik keputusan);
   - fungsi beda tetapi deskripsi mirip: persempit deskripsi, tambah "Jangan dipakai untuk ..., itu tugas X";
   - frasa pemicu sama: ganti frasa di salah satu skill.
4. Tulis usulan; perubahan berkas dilakukan setelah pengguna setuju (pakai skill dampak bila ganti nama).

## Aturan keputusan

- Skor tinggi dengan batas sudah tertulis: periksa kejelasan batas, biasanya cukup.
- Frasa pemicu yang sama selalu diselesaikan, apa pun skornya.
- Gabung hanya bila masukan dan keluaran sama; kemiripan kata saja tidak cukup.
- Skill dari keluarga berbeda yang mirip (misalnya Etsy dan graphify): persempit, jangan gabung.

## Format hasil

```
| Skill A | Skill B | Skor | Kata bersama | Frasa bentrok | Batas tertulis | Saran |
| etsy-customer-message-drafter | etsy-issue-resolution-assistant | 0.23 | balasan, cetak, digital | - | ya | cukup: batas sudah tertulis |
Usulan: tidak ada perubahan; batas sudah jelas di "Kapan tidak digunakan" keduanya.
```

## Pemeriksaan kualitas

- Setiap usulan gabung didukung perbandingan isi SKILL.md, bukan skor saja.
- Frasa pemicu yang bentrok disebut persis.

## Penanganan kesalahan

- Deskripsi kosong atau frontmatter rusak: skill itu dilewati skrip; laporkan dan arahkan ke pemeriksa celah.
- Terlalu banyak pasangan: naikkan ambang atau batasi awalan.

## Serah terima

Skill ujung: usulan dikembalikan ke pengguna. Perubahan nama, bila disetujui, dikerjakan dengan alat
dampak perubahan sebelum berkas diubah.

## Batas kemampuan alat

Kemiripan dihitung dari kata, bukan makna. Dua skill bisa berebut walau kata-katanya berbeda
(sinonim); uji pemicu sungguhan tetap perlu untuk kasus penting.

## Contoh penggunaan

Perpustakaan Studio (45 skill), ambang 0,2: tiga pasangan, semuanya dengan batas tertulis di
"Kapan tidak digunakan". Usulan: tidak ada perubahan.

## Contoh kegagalan dan perbaikannya

Gagal: mengusulkan gabung `wall-art-color-export-manager` dan `wall-art-ratio-resolution-planner`
karena skor 0,23 dan kata "cetak, ekspor". Perbaikan: isi dibandingkan; yang satu menghitung rasio,
yang lain mengekspor berkas, keluarannya berbeda; batas sudah tertulis.

## Cara menguji skill ini

Buat dua skill dengan deskripsi hampir sama dan frasa pemicu "harganya berapa?" yang sama. Hasil
benar: pasangan muncul paling atas dengan saran "ubah frasa pemicu".
