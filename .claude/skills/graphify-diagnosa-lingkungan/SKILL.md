---
name: graphify-diagnosa-lingkungan
description: Memeriksa kesiapan lingkungan graphify dalam satu tabel, tanpa mengubah apa pun. Pakai saat pengguna bertanya "graphify sudah siap belum?", "cek graphify", "graph saya masih segar?", "status graph", atau sebelum skill graphify lain bekerja. Skrip memeriksa CLI dan versinya, extra yang terpasang, skill resmi, graph utama dan kesegarannya terhadap HEAD git, nama komunitas, aturan always-on, hook asisten dan pembungkus amannya, .graphifyignore, hook git, register, dan backend LLM yang terdeteksi (nama variabel saja). Jangan dipakai untuk memperbaiki temuan, itu tugas skill yang ditunjuk di kolom perbaikan, atau untuk menilai mutu isi graph, itu tugas graphify-audit-graph.
---

# graphify-diagnosa-lingkungan

Satu pemilik untuk status kesiapan lingkungan graphify. Hasilnya dipakai dirigen untuk memilih rute
dan oleh skill lain untuk memeriksa prasyarat.

Sebelum mulai, baca `references/graphify-core.md`.

## Kapan digunakan

- Awal sesi atau awal pekerjaan graph apa pun.
- Pengguna bertanya kesiapan, kesegaran, atau keadaan hook.
- Skill lain butuh tahu apakah CLI, graph, atau nama komunitas sudah ada.

## Kapan tidak digunakan

- Memperbaiki: setiap baris hasil menunjuk skill perbaikannya.
- Mengukur noise, edge tebakan, atau path sensitif di dalam graph: `graphify-audit-graph`.

## Input

- Opsional: akar repo (default direktori kerja), versi yang diharapkan (default 0.9.112).

## Default

- Jalankan `python3 scripts/cek_lingkungan.py` dari akar repo (path skrip relatif ke folder skill ini:
  `.claude/skills/graphify-diagnosa-lingkungan/scripts/cek_lingkungan.py`).
- Pakai `--json` bila hasil dibaca skill lain.

## Pertanyaan bila info penting belum ada

Tidak ada. Diagnosa selalu bisa dijalankan; yang tidak bisa diperiksa dilaporkan sebagai INFO.

## Langkah kerja

1. Jalankan `scripts/cek_lingkungan.py` (tambahkan `--akar` bila bukan di akar repo).
2. Baca tabel. Urutkan tindak lanjut: GAGAL dulu, lalu PERINGATAN.
3. Untuk tiap GAGAL atau PERINGATAN, sebut skill di kolom perbaikan sebagai langkah berikut.
4. Laporkan ringkasan satu baris plus baris yang bukan OK.

## Aturan keputusan

- GAGAL: CLI tidak ada atau rusak, `graph.json` tidak bisa dibaca, `settings.json` rusak.
- PERINGATAN: versi berbeda, graph tertinggal dari HEAD untuk file kode/graph, nama komunitas belum
  lengkap, hook telanjang, cadangan pelabelan `claude` aktif.
- INFO: hal opsional (hook git, `.graphifyrc`, register, extra yang tidak dipasang).
- File yang berubah tetapi bukan kode (misalnya `README.md`) tidak membuat graph kode basi.

## Format hasil

```
| Pemeriksaan | Status | Rincian | Perbaikan |
|---|---|---|---|
| CLI graphify | OK | versi 0.9.112 di /root/.local/bin/graphify | - |
| Kesegaran graph | PERINGATAN | dibangun dari 843cb24e, HEAD cf5d4607; 6 file kode/graph berubah | graphify-perbarui-graph |
Ringkas: 7 OK, 2 PERINGATAN, 0 GAGAL, 5 INFO
```

## Pemeriksaan kualitas

- Laporan berasal dari keluaran skrip, bukan dari ingatan sesi sebelumnya.
- Nilai variabel lingkungan tidak pernah tampil, hanya namanya.

## Penanganan kesalahan

- Bukan repo git: kesegaran dilaporkan INFO "tidak diketahui", pemeriksaan lain tetap jalan.
- Skrip tidak bisa dijalankan (tidak ada Python): periksa manual `command -v graphify`,
  `ls graphify-out/`, dan laporkan bahwa diagnosa penuh tidak tersedia.

## Serah terima

Skill layanan: mengembalikan tabel (atau JSON) ke pemanggil. Tidak menentukan langkah berikutnya;
kolom perbaikan hanya saran.

## Batas kemampuan alat

Tidak membuka jaringan, tidak memanggil LLM, tidak mengubah berkas. Hook git hanya dicek
`post-commit`. Kesegaran berdasarkan git, jadi perubahan yang belum di-commit tidak terhitung.

## Contoh penggunaan

Awal sesi: diagnosa menunjukkan CLI GAGAL (container baru). Dirigen memanggil `graphify-pasang-cli`,
lalu diagnosa diulang: 7 OK, 2 PERINGATAN (graph tertinggal 6 file, cadangan pelabelan aktif).

## Contoh kegagalan dan perbaikannya

Gagal: melaporkan "graph segar" karena `graph.json` ada, padahal dibangun tiga commit lalu.
Perbaikan: status kesegaran selalu dari skrip yang membandingkan `built_at_commit` dengan HEAD.

## Cara menguji skill ini

Hapus sementara `graphify` dari PATH lalu minta "cek graphify". Hasil benar: baris CLI GAGAL,
perbaikan `graphify-pasang-cli`, kode keluar 1, dan pemeriksaan lain tetap dilaporkan.
