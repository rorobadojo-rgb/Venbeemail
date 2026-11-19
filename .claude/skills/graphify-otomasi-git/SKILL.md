---
name: graphify-otomasi-git
description: Mengatur otomasi pembaruan graph graphify dan kebijakan commit-nya, yaitu hook git (post-commit, post-checkout, post-merge, post-rewrite) yang membangun ulang graph kode di latar belakang tanpa LLM, merge driver yang menggabungkan graph.json saat konflik, mode graphify watch yang memantau folder, serta aturan apa saja dari graphify-out yang di-commit dan apa yang diabaikan. Pakai saat pengguna berkata "graph otomatis diperbarui tiap commit", "pasang hook graphify", "graph.json konflik saat merge", "jalankan watch", "graph perlu di-commit tidak?", atau "kenapa hook hilang di sesi baru?". Jangan dipakai untuk hook asisten Claude (PreToolUse), itu tugas graphify-mode-always-on, atau untuk pembaruan manual sekali jalan, itu tugas graphify-perbarui-graph.
---

# graphify-otomasi-git

Satu pemilik untuk otomasi pembaruan graph dan kebijakan commit graph. Graph yang diperbarui otomatis
tidak pernah basi; graph yang di-commit dengan benar bisa dipakai siapa saja yang meng-clone repo.

Sebelum mulai, baca `references/graphify-core.md`. Kebijakan commit repo ini dan alasannya:
`references/kebijakan-commit.md`.

## Kapan digunakan

- Pengguna ingin graph diperbarui tanpa perintah manual.
- Konflik `graph.json` saat merge atau rebase.
- Menentukan atau meninjau apa yang di-commit dari `graphify-out/`.

## Kapan tidak digunakan

- Hook asisten (PreToolUse, always-on): `graphify-mode-always-on`.
- Pembaruan sekali jalan: `graphify-perbarui-graph`.

## Input

- Opsional: jenis otomasi (hook git, watch), kebijakan commit yang diinginkan.

## Default

- Hook git: `graphify hook install`, cek `graphify hook status`, lepas `graphify hook uninstall`.
- Watch (sesi kerja panjang): `graphify watch .` sebagai proses latar belakang.
- Kebijakan commit repo ini: `graphify-out/.gitignore` (hasil dibagikan di-commit; cache dan penanda
  mesin tidak).

## Pertanyaan bila info penting belum ada

"Bekerja di komputer sendiri (hook git bertahan) atau di sesi cloud (hook hilang tiap sesi baru)?"

## Langkah kerja

1. CLI lewat `graphify-pasang-cli`.
2. Hook git: `graphify hook install`. graphify menambahkan blok miliknya ke hook yang sudah ada (tidak
   menimpa) dan mendaftarkan merge driver. Periksa dengan `graphify hook status`.
3. Uji: buat commit kecil di berkas kode; rebuild berjalan terpisah di latar belakang, lognya di
   `~/.cache/graphify-rebuild.log` (atau `GRAPHIFY_REBUILD_LOG`).
4. Setelah `git pull`: hook tidak membangun ulang untuk semua kasus; jalankan `graphify update .`.
5. Watch: `graphify watch .`; kode memicu rebuild otomatis, dokumen hanya menulis penanda
   `needs_update` (pass semantik tetap manual).
6. Kebijakan commit: pastikan `graphify-out/.gitignore` sesuai `references/kebijakan-commit.md`, lalu
   periksa `git status graphify-out/`.
7. Laporkan yang terpasang dan cara mematikannya.

## Aturan keputusan

- Sesi cloud: hook git dan konfigurasi merge driver ada di `.git/` yang tidak ikut di-commit, jadi
  hilang di sesi baru. Andalkan diagnosa dan pembaruan manual; jangan berjanji "otomatis selamanya".
- Lewati rebuild satu commit: `GRAPHIFY_SKIP_HOOK=1 git commit ...`.
- Hook hanya membangun ulang kode. Perubahan dokumen tetap butuh `/graphify . --update`.
- `graph.json` yang di-commit ditulis ulang utuh tiap build; diff besar di pull request adalah wajar.

## Format hasil

```
Hook git: post-commit, post-checkout, post-merge, post-rewrite terpasang; merge driver terdaftar
Log rebuild: ~/.cache/graphify-rebuild.log
Kebijakan commit: graphify-out/.gitignore (cache/, penanda mesin, cadangan bertanggal diabaikan)
Catatan: di sesi cloud hook hilang saat container baru; jalankan graphify update . bila diagnosa basi
```

## Pemeriksaan kualitas

- `graphify hook status` menunjukkan hook terpasang setelah pemasangan.
- `git status graphify-out/` tidak menampilkan `cache/`.

## Penanganan kesalahan

- Hook lain sudah ada (misalnya husky): graphify menambah bloknya; bila pengguna memakai pengelola hook,
  tambahkan `graphify` lewat konfigurasi pengelola itu.
- Rebuild di hook melebihi batas waktu: atur `GRAPHIFY_REBUILD_TIMEOUT` (detik, default 600).
- Konflik `graph.json` tanpa merge driver: ambil salah satu versi, lalu `graphify update .`.

## Serah terima

Skill ujung: status otomasi dan kebijakan commit dilaporkan. CLI dari `graphify-pasang-cli`.

## Batas kemampuan alat

Tidak bisa membuat hook git bertahan di container cloud yang baru. Watch berhenti saat sesi berakhir.

## Contoh penggunaan

Pengguna bekerja di laptop sendiri: `graphify hook install`, commit kecil, log rebuild menunjukkan graph
diperbarui dalam beberapa detik; `graphify hook status` semua terpasang.

## Contoh kegagalan dan perbaikannya

Gagal: meng-commit `graphify-out/cache/` (puluhan MB, berbeda per mesin) sehingga setiap pull konflik.
Perbaikan: `graphify-out/.gitignore` mengabaikan `cache/`; hapus dari indeks dengan `git rm -r --cached graphify-out/cache`.

## Cara menguji skill ini

Di repo uji, pasang hook, ubah satu fungsi, commit. Hasil benar: log rebuild bertambah, `graph.json`
berubah, dan laporan menyebut cara melewati hook untuk satu commit.
