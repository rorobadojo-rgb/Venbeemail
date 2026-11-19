---
name: graphify-gerbang-mutu
description: Gerbang kualitas keluarga skill graphify. Menilai lulus, lulus dengan catatan, atau gagal pada empat gerbang, yaitu G1 rencana korpus, G2 graph sehat, G3 siap di-commit atau dibagikan, dan G4 ekspor atau integrasi siap dipakai. Pakai saat pengguna bertanya "graph ini sudah layak?", "boleh di-commit?", "aman dibagikan?", "ekspornya sudah benar?", atau saat skill rencana, audit, atau ekspor menutup pekerjaan dengan status perlu_tinjau. Setiap butir dinilai dengan bukti (keluaran skrip, file, perintah), dan perbaikan selalu menunjuk skill pemiliknya. Jangan dipakai untuk mengukur kesehatan graph secara rinci, itu tugas graphify-audit-graph yang hasilnya dipakai gerbang ini.
---

# graphify-gerbang-mutu

Satu pemilik untuk keputusan "boleh lanjut atau belum". Gerbang mencegah graph yang bocor data,
penuh noise, atau basi masuk ke git, ke agen lain, atau ke database.

Sebelum mulai, baca `references/graphify-core.md`. Rubrik tiap gerbang: `references/rubrik-gerbang.md`.

## Kapan digunakan

- Serah terima berstatus `perlu_tinjau` dari rencana korpus (G1), audit (G2), sebelum commit atau
  berbagi graph (G3), dan setelah ekspor atau integrasi (G4).
- Pengguna meminta penilaian kelayakan.

## Kapan tidak digunakan

- Mengukur noise, edge tebakan, kesegaran: `graphify-audit-graph` (gerbang memakai hasilnya).
- Memperbaiki: gerbang mengembalikan ke skill pemilik hasil.

## Input

- Wajib: gerbang yang dinilai (G1-G4) dan serah terima dari skill pembuat.
- Untuk G2/G3: laporan `audit_graph.py` terbaru (maksimal dari build yang sama).
- Untuk G4: path hasil ekspor atau konfigurasi integrasi.

## Default

- Gerbang tidak disebut: tentukan dari skill pembuat (rencana ke G1; audit ke G2; permintaan commit
  atau berbagi ke G3; ekspor, MCP, database, gabung ke G4).
- Butir yang tidak bisa diperiksa karena data tidak ada bernilai `warn`, bukan `pass`.

## Pertanyaan bila info penting belum ada

Hanya satu: "Graph mana (corpus_id) dan gerbang mana yang dinilai?" bila ada lebih dari satu kandidat.

## Langkah kerja

1. Baca serah terima; pastikan field `korpus`, `graph`, `status`, dan `bukti` ada.
2. Buka rubrik gerbang di `references/rubrik-gerbang.md`. Tiap butir bertanda WAJIB atau SARAN.
3. Nilai tiap butir `pass`, `warn`, atau `fail` dengan satu kalimat alasan yang menunjuk bukti.
4. Hitung hasil dengan aturan keputusan.
5. Untuk tiap `fail` dan `warn`, tulis perbaikan konkret dan skill pemiliknya.
6. Ubah status serah terima menjadi `selesai` (lulus) atau `gagal`.

## Aturan keputusan

- Gagal: satu saja butir WAJIB bernilai `fail`.
- Lulus dengan catatan: tidak ada `fail` WAJIB, ada `warn` atau `fail` SARAN. Boleh lanjut; catatan ikut.
- Lulus: semua WAJIB `pass`.
- Path sensitif di graph (G3) tidak bisa ditimpa oleh siapa pun; graph harus dibangun ulang tanpa path itu.
- Pengguna boleh menimpa butir lain. Catat sebagai KEPUTUSAN beserta risikonya.

## Format hasil

```
GERBANG G2 - GRAPH SEHAT   KRP-repo (graphify-out/graph.json)
Hasil: LULUS DENGAN CATATAN

| Butir | Jenis | Nilai | Alasan |
|---|---|---|---|
| Tidak ada path sensitif | WAJIB | pass | audit: 0 file sensitif |
| Noise nama pendek di bawah 5% | WAJIB | pass | audit: 13 node (1,6%) |
| Edge INFERRED antarfolder ditinjau | SARAN | warn | 3 edge hero() belum diverifikasi |

Perbaikan: 1) verifikasi 3 edge INFERRED (pemilik: graphify-audit-graph)
Boleh lanjut ke: G3 bila ingin di-commit
```

## Pemeriksaan kualitas

- Tidak ada butir yang dilewati diam-diam; setiap nilai punya alasan berbukti.
- Hasil akhir dihitung ulang sesuai aturan sebelum ditulis.

## Penanganan kesalahan

- Laporan audit tidak ada atau dari build lain (commit berbeda): G2 dan G3 `fail` pada butir
  "audit terbaru", perbaikan "jalankan graphify-audit-graph".
- Serah terima tidak lengkap: butir "serah terima lengkap" `fail`, minta skill pembuat melengkapi.

## Serah terima

Skill layanan: mengembalikan hasil gerbang ke skill pemanggil. Tidak menentukan langkah berikutnya;
"Boleh lanjut ke" hanya menyebut gerbang berikutnya.

## Batas kemampuan alat

Menilai berdasarkan bukti yang tersedia. Tidak menjalankan build atau audit sendiri. Tidak menilai
apakah isi kode atau dokumen benar, hanya kelayakan graph-nya.

## Contoh penggunaan

Pengguna ingin commit graph dokumen `KRP-dokumen-prd`. G3: audit bersih, graph dibangun dari HEAD,
nama komunitas lengkap, `cache/` dikecualikan di `graphify-out/.gitignore`. Hasil LULUS.

## Contoh kegagalan dan perbaikannya

Gagal: G3 diluluskan padahal audit menemukan `studio-nangka/pelanggan/` di graph karena "cuma satu
file". Perbaikan: path sensitif adalah butir WAJIB yang tidak bisa ditimpa; kembali ke
pengecualian, bangun ulang, audit ulang.

## Cara menguji skill ini

Beri serah terima G3 dengan laporan audit berisi satu path `pelanggan/`. Hasil benar: GAGAL, alasan
menunjuk path tersebut, perbaikan menunjuk skill pengecualian, dan tidak ada kalimat "boleh di-commit".
