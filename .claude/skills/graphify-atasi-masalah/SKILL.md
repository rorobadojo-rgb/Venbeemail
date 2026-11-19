---
name: graphify-atasi-masalah
description: Mencocokkan gejala error atau hasil aneh graphify dengan penyebab dan langkah perbaikan yang sudah teruji, misalnya graphify command not found, refused to shrink graph.json, Incompatible Language version, graph kosong atau penuh fungsi satu huruf, nama komunitas hilang, jawaban TRUNCATED, kode keluar 3 atau 4, graph.html kosong, hook command not found, Whisper error metadata_errors, backend tidak terdeteksi, atau unduhan diblokir proxy. Pakai saat pengguna berkata "graphify error", "kok gagal?", "hasilnya aneh", "kenapa begini?", atau menempelkan pesan error graphify. Selalu mulai dari diagnosa lingkungan, lalu katalog gejala. Jangan dipakai untuk naik turun versi, itu tugas graphify-kelola-versi, atau untuk pemeriksaan kualitas rutin, itu tugas graphify-audit-graph.
---

# graphify-atasi-masalah

Satu pemilik untuk diagnosis gejala error dan perbaikannya. Perbaikan selalu dimulai dari bukti
(pesan error persis dan keadaan lingkungan), bukan dari tebakan.

Sebelum mulai, baca `references/graphify-core.md`. Katalog gejala, penyebab, dan perbaikan:
`references/katalog-gejala.md`.

## Kapan digunakan

- Perintah graphify gagal atau keluarannya tidak masuk akal.
- Pengguna menempelkan pesan error.

## Kapan tidak digunakan

- Upgrade, downgrade, copot: `graphify-kelola-versi`.
- Pemeriksaan kualitas rutin tanpa gejala: `graphify-audit-graph`.

## Input

- Wajib: gejala (pesan error persis atau perilaku yang terlihat) dan perintah yang dijalankan.

## Default

- Selalu jalankan diagnosa lebih dulu lewat `graphify-diagnosa-lingkungan`.

## Pertanyaan bila info penting belum ada

"Perintah persis apa yang dijalankan, dan apa pesan errornya? (tempel apa adanya)"

## Langkah kerja

1. Jalankan diagnosa lingkungan; catat baris GAGAL dan PERINGATAN.
2. Cocokkan pesan error dengan `references/katalog-gejala.md` (cari kata kunci pesannya).
3. Bila cocok: jelaskan penyebab dalam satu kalimat, jalankan perbaikan, lalu ulangi perintah asal
   untuk membuktikan perbaikannya.
4. Bila tidak cocok: kumpulkan bukti (versi, perintah, pesan lengkap, berkas yang terlibat), coba
   satu hipotesis paling mungkin, dan laporkan hasilnya dengan label HIPOTESIS.
5. Bila tetap gagal dan tampak seperti bug graphify: siapkan laporan untuk repositori graphify (versi,
   perintah, keluaran, contoh minimal), tanpa data pribadi; jangan mengirimnya tanpa izin.

## Aturan keputusan

- Perbaikan yang menghapus data (`--force`, hapus `graphify-out/`, `uninstall --purge`) butuh izin
  pengguna dan alasan tertulis.
- Satu perubahan per percobaan, supaya penyebab jelas.
- Perbaikan dinyatakan berhasil hanya setelah perintah asal berjalan benar.

## Format hasil

```
Gejala: "refused to shrink graphify-out/graph.json" saat graphify update .
Penyebab: 12 berkas kode dihapus di commit terakhir; graph baru lebih kecil (FAKTA: git diff)
Perbaikan: graphify update . --force (disetujui pengguna) -> 823 node
Bukti: perintah asal berjalan, diagnosa kesegaran OK
```

## Pemeriksaan kualitas

- Penyebab didukung bukti, bukan dugaan.
- Perintah asal diulang setelah perbaikan.

## Penanganan kesalahan

- Diagnosa sendiri gagal: periksa manual `command -v graphify`, `python3 --version`, `ls graphify-out`.
- Gejala muncul lagi setelah perbaikan: kembali ke langkah 2 dengan bukti baru; jangan mengulang
  perbaikan yang sama.

## Serah terima

Skill ujung: hasil perbaikan atau laporan bug dikembalikan ke pengguna. Keadaan dibaca lewat
`graphify-diagnosa-lingkungan`.

## Batas kemampuan alat

Tidak bisa memperbaiki bug di dalam graphify; hanya menghindarinya atau menyiapkan laporan. Masalah
jaringan sesi cloud hanya bisa diubah pengguna lewat pengaturan lingkungan.

## Contoh penggunaan

"Setiap kali Claude membaca berkas muncul graphify: command not found." Diagnosa: CLI tidak ada, hook
telanjang. Katalog: hook tanpa pembungkus. Perbaikan: bungkus hook lewat skill always-on; diulang,
tidak ada error lagi.

## Contoh kegagalan dan perbaikannya

Gagal: menjawab "refused to shrink" dengan `--force` langsung; ternyata `.graphifyignore` baru salah
membuang folder kode sendiri dan graph kehilangan 300 node. Perbaikan: banding graph dulu, temukan
pola yang terlalu lebar, perbaiki pola, baru build ulang.

## Cara menguji skill ini

Tempel pesan "Incompatible Language version 15". Hasil benar: diagnosa dijalankan, katalog menunjuk
bentrok versi tree-sitter, perbaikan pasang ulang CLI dengan versi pasti, perintah asal diulang.
