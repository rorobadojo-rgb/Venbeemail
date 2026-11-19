---
name: graphify-mode-always-on
description: Mengatur integrasi always-on graphify di asisten, yaitu bagian graphify di CLAUDE.md yang menyuruh asisten bertanya ke graph sebelum grep atau membaca berkas, hook PreToolUse dan SessionStart di .claude/settings.json, mode ketat (--strict, GRAPHIFY_HOOK_STRICT), batas pengingat per sesi, pembungkus aman hook agar diam di container cloud yang belum punya CLI, serta padanannya untuk Codex, Cursor, Gemini CLI, dan asisten lain. Pakai saat pengguna berkata "aktifkan graphify otomatis", "setiap baca berkas muncul error hook graphify", "matikan pengingat graphify", "mode ketat", "aktifkan graphify di Cursor", atau setelah graphify install atau upgrade menulis ulang hook. Jangan dipakai untuk hook git, itu tugas graphify-otomasi-git.
---

# graphify-mode-always-on

Satu pemilik untuk integrasi always-on di asisten. Integrasi ini membuat asisten memakai graph dengan
sendirinya; bila salah dipasang, setiap pembacaan berkas memunculkan error.

Sebelum mulai, baca `references/graphify-core.md`. Padanan untuk asisten selain Claude Code:
`references/platform-lain.md`.

Skrip skill ini: `scripts/bungkus_hook.py` (dari akar repo: `.claude/skills/graphify-mode-always-on/scripts/bungkus_hook.py`).

## Kapan digunakan

- Mengaktifkan, mematikan, atau menyetel always-on.
- Hook asisten memunculkan "graphify: command not found".
- Setelah `graphify install`, `graphify claude install`, atau upgrade (hook ditulis ulang telanjang).

## Kapan tidak digunakan

- Hook git (rebuild tiap commit): `graphify-otomasi-git`.
- Memasang CLI: `graphify-pasang-cli`.

## Input

- Opsional: mode (lunak atau ketat), asisten tujuan.

## Default

- Claude Code project: `graphify claude install` (bagian `## graphify` di CLAUDE.md + hook), lalu
  `python3 scripts/bungkus_hook.py` untuk memasang pembungkus aman.
- Mode lunak (pengingat). Mode ketat hanya bila diminta.

## Pertanyaan bila info penting belum ada

"Mode lunak (asisten diingatkan memakai graph) atau ketat (pembacaan berkas pertama per sesi ditolak
sampai asisten bertanya ke graph)?"

## Langkah kerja

1. CLI lewat `graphify-pasang-cli`.
2. Aktifkan: `graphify claude install` (tambah `--strict` untuk mode ketat, hanya untuk project).
3. Bungkus hook: `python3 scripts/bungkus_hook.py`; periksa dengan `python3 scripts/bungkus_hook.py --periksa`
   (kode keluar 0 berarti semua terbungkus).
4. Uji tanpa CLI: jalankan perintah hook dengan PATH tanpa graphify; kode keluar harus 0.
5. Penyetelan lewat variabel: `GRAPHIFY_HOOK_STRICT=1` atau `0` (menimpa pemasangan),
   `GRAPHIFY_HOOK_NUDGE_CAP` (batas pengingat per sesi, default 5).
6. Mematikan: `graphify claude uninstall` (bagian CLAUDE.md dan hook terhapus; pembungkus tetap
   dikenali karena teks `graphify hook-guard` masih ada).
7. Laporkan keadaan akhir: bagian CLAUDE.md, jumlah hook, terbungkus atau tidak, mode.

## Aturan keputusan

- Setiap kali hook ditulis ulang oleh graphify, bungkus lagi. Pembungkus meneruskan kode keluar graphify,
  sehingga mode ketat tetap bekerja saat CLI ada.
- Bagian `## graphify` di CLAUDE.md ditulis graphify; jangan diedit tangan (tertimpa saat pasang ulang).
- Repo dengan `@AGENTS.md` di CLAUDE.md: graphify menulis ke CLAUDE.md; jangan memindahkannya ke AGENTS.md
  yang dibuat ulang oleh `next dev`.
- Bila graph tidak di-commit, always-on tidak berpengaruh di sesi baru (aturannya hanya berlaku bila
  `graphify-out/graph.json` ada).

## Format hasil

```
CLAUDE.md: bagian ## graphify ada
Hook: 3 (PreToolUse Bash|Grep, Read|Glob, SessionStart compact), 3 terbungkus
Mode: lunak | batas pengingat 5 per sesi
Uji tanpa CLI: kode keluar 0
```

## Pemeriksaan kualitas

- `bungkus_hook.py --periksa` kode keluar 0.
- Uji tanpa CLI kode keluar 0, dengan CLI hook tetap mengeluarkan pengingat.

## Penanganan kesalahan

- `settings.json` bukan JSON sah: graphify menolak mengubahnya; perbaiki JSON dulu (cadangan ada di folder `.claude`).
- Pengingat terlalu sering: turunkan `GRAPHIFY_HOOK_NUDGE_CAP` atau matikan always-on.
- Mode ketat menghalangi pekerjaan mendesak: `GRAPHIFY_HOOK_STRICT=0` untuk sesi itu.

## Serah terima

Skill ujung: keadaan integrasi dilaporkan. CLI dari `graphify-pasang-cli`.

## Batas kemampuan alat

Pengingat hanya saran; asisten tetap bisa membaca berkas. Mode ketat menolak sekali per sesi untuk Read
dan Grep, sedangkan Bash dan Glob tetap hanya diingatkan.

## Contoh penggunaan

Repo ini: `graphify install --project` menulis bagian CLAUDE.md dan tiga hook telanjang. Pembungkus
dipasang; uji tanpa CLI keluar 0; di sesi berikutnya tidak ada error "command not found".

## Contoh kegagalan dan perbaikannya

Gagal: setelah upgrade lewat `graphify-kelola-versi` yang memasang ulang skill resmi, hook kembali
telanjang dan setiap Read di sesi cloud baru memunculkan error. Perbaikan: setiap pemasangan ulang diikuti `bungkus_hook.py`
dan `--periksa`.

## Cara menguji skill ini

Ubah satu hook menjadi telanjang, lalu minta "kenapa hook graphify error?". Hasil benar: `--periksa`
menemukan satu hook telanjang, pembungkus dipasang, uji tanpa CLI kode keluar 0.
