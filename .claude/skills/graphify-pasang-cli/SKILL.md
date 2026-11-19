---
name: graphify-pasang-cli
description: Memasang dan memastikan CLI graphify siap pakai dengan versi dan extra yang tepat, termasuk di container Claude Code cloud yang selalu mulai dari nol. Pakai saat pengguna berkata "pasang graphify", "install graphify", "graphify command not found", "graphify belum ada", "butuh extra pdf/video/mcp", atau saat skill graphify lain menemukan CLI tidak tersedia. Memakai paket resmi graphifyy (dua huruf y) lewat uv, menyalin skill resmi /graphify ke project bila belum ada, lalu memverifikasi versi. Jangan dipakai untuk naik atau turun versi yang sudah terpasang, itu tugas graphify-kelola-versi, atau untuk mengatasi error saat graphify sudah jalan, itu tugas graphify-atasi-masalah.
---

# graphify-pasang-cli

Satu pemilik untuk cara memasang CLI graphify. Semua skill lain yang butuh CLI memanggil skill ini
lebih dulu, sehingga versi dan extra tidak berbeda-beda antarsesi.

Sebelum mulai, baca `references/graphify-core.md`. Daftar extra dan platform asisten ada di
`references/extra-dan-platform.md`.

## Kapan digunakan

- `graphify` tidak ditemukan di PATH (biasa terjadi di awal setiap sesi cloud).
- Butuh extra yang belum terpasang (misalnya `video` untuk transkripsi, `leiden` untuk komunitas Leiden).
- Skill resmi `/graphify` belum ada di `.claude/skills/graphify/`.

## Kapan tidak digunakan

- Graphify sudah ada dan versinya ingin dinaikkan atau diturunkan: `graphify-kelola-versi`.
- Graphify ada tetapi perintahnya error: `graphify-atasi-masalah`.
- Memasang aturan always-on dan hook: `graphify-mode-always-on`.

## Input

- Opsional: versi yang diminta (default 0.9.112), daftar extra tambahan.

## Default

- Perintah baku: `uv tool install "graphifyy[mcp,watch,pdf,office,svg,sql]==0.9.112"`.
- Tanpa `uv`: `pipx install "graphifyy[...]==0.9.112"`; tanpa keduanya: `pip install --user`.
- Extra `video` (faster-whisper, model ratusan MB) dan `leiden` hanya bila diminta.

## Pertanyaan bila info penting belum ada

Tidak ada untuk pemasangan baku. Untuk extra besar, satu pertanyaan: "Extra video mengunduh model
Whisper sekitar ratusan MB. Pasang sekarang?"

## Langkah kerja

1. Cek: `command -v graphify && graphify --version`. Bila versi sudah sesuai, lanjut ke langkah 5.
2. Pasang dengan perintah default (paket resmi `graphifyy`, bukan paket lain yang namanya mirip).
3. Bila setelah pasang `graphify` belum ditemukan: `uv tool update-shell`, lalu pakai path penuh
   `~/.local/bin/graphify` untuk sesi ini.
4. Verifikasi: `graphify --version` harus mencetak versi yang diminta.
5. Bila `.claude/skills/graphify/SKILL.md` belum ada: `graphify install --project`. Perintah ini juga
   menulis hook telanjang; catat di serah terima bahwa hook perlu dibungkus (pemiliknya
   `graphify-mode-always-on`), supaya pemanggil yang meneruskannya.
6. Untuk extra tambahan: ulangi `uv tool install` dengan daftar extra lengkap (uv mengganti, bukan
   menambah), misalnya `"graphifyy[mcp,watch,pdf,office,svg,sql,video]==0.9.112"`.
7. Laporkan versi, lokasi binari, dan extra yang terpasang.

## Aturan keputusan

- Selalu sebut versi pasti (`==0.9.112`) agar hasil antarsesi sama; versi lain lewat `graphify-kelola-versi`.
- `graphify install --project` hanya bila skill resmi belum ada; menjalankannya ulang menimpa hook
  (pembungkus aman hilang).
- Gagal unduh dari PyPI karena jaringan: jangan mencoba sumber lain; laporkan pesan proxy.

## Format hasil

```
CLI graphify: 0.9.112 di /root/.local/bin/graphify
Extra: mcp, watch, pdf, office, svg, sql (video, leiden tidak)
Skill resmi: ada (.claude/skills/graphify, versi 0.9.112)
Bukti: graphify --version -> "graphify 0.9.112"
```

## Pemeriksaan kualitas

- Versi dilaporkan dari keluaran `graphify --version`, bukan dari perintah pasang.
- Extra dicek dengan import di interpreter graphify, bukan diasumsikan.

## Penanganan kesalahan

- `uv` tidak ada: pakai pipx atau pip, sebutkan pilihan yang dipakai.
- Konflik versi grammar tree-sitter ("Incompatible Language version"): pasang ulang dengan
  `uv tool install --force "graphifyy[...]==0.9.112"`.
- Pemasangan tidak diizinkan (izin ditolak): berhenti dan laporkan; jangan memakai `sudo` tanpa izin.

## Serah terima

Skill layanan: mengembalikan hasil ke skill pemanggil dengan blok SERAH TERIMA tanpa `berikutnya`.
Bila langkah 5 memasang skill resmi, sebutkan bahwa hook perlu dibungkus ulang.

## Batas kemampuan alat

Butuh akses ke registri paket Python (PyPI). Di claude.ai tanpa terminal, skill hanya memberi
perintah untuk dijalankan pengguna. Tidak memasang Python itu sendiri.

## Contoh penggunaan

Sesi cloud baru, pengguna meminta audit graph. `command -v graphify` kosong. Dijalankan
`uv tool install "graphifyy[mcp,watch,pdf,office,svg,sql]==0.9.112"` (±40 detik), lalu
`graphify --version` mencetak `graphify 0.9.112`. Skill resmi sudah ada di repo. Kembali ke audit.

## Contoh kegagalan dan perbaikannya

Gagal: memasang `pip install graphify` (satu huruf y), paket lain yang tidak berafiliasi.
Perbaikan: nama paket selalu `graphifyy`; verifikasi dengan `graphify --version` yang mencetak
"graphify" diikuti nomor versi resmi.

## Cara menguji skill ini

Di container tanpa graphify, minta "pasang graphify". Hasil benar: perintah default dengan versi
pasti, verifikasi `--version`, laporan extra, dan tidak menjalankan `graphify install --project`
bila skill resmi sudah ada.
