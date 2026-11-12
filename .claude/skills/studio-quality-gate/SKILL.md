---
name: studio-quality-gate
description: Gerbang kualitas Studio Wall Art by Nangka. Menilai lulus atau tidaknya hasil sebelum diteruskan ke tahap berikut, pada empat gerbang, yaitu G1 brief, G2 konsep, G3 gambar master, dan G4 paket cetak. Pakai saat pemilik bertanya "sudah layak lanjut belum?", "cek hasil ini", "boleh diteruskan ke produksi?", atau saat sebuah skill menutup pekerjaan dengan status ready_for_review. Memberi hasil lulus, lulus dengan catatan, atau gagal, beserta perbaikan dan skill yang memperbaikinya. Jangan dipakai untuk pemeriksaan listing sebelum terbit, itu tugas etsy-listing-preflight-reviewer.
---

# studio-quality-gate

Satu pemilik untuk keputusan "boleh lanjut atau belum" pada tahap sebelum listing. Gerbang mencegah kesalahan murah di awal menjadi kesalahan mahal di toko.

Sebelum mulai, baca `references/studio-core.md`. Rubrik tiap gerbang: `references/rubrik-gerbang.md`.

## Kapan digunakan

- Serah terima berstatus `ready_for_review` dari tahap brief, konsep, gambar, atau paket cetak.
- Pemilik meminta penilaian kelayakan.

## Kapan tidak digunakan

- Listing sebelum terbit (G5 dimiliki `etsy-listing-preflight-reviewer`).
- Mencari cacat gambar secara rinci (`wall-art-artifact-retouch-reviewer`) atau menilai gaya (`wall-art-style-consistency-reviewer`); gerbang memakai hasil mereka, tidak mengulanginya.

## Input

- Wajib: hasil yang dinilai dan blok serah terimanya; gerbang mana (G1-G4).
- Opsional: brief, `visual-dna.md`, hasil pemeriksaan cacat dan gaya, manifest paket.

## Default

- Gerbang tidak disebut: tentukan dari skill pembuat serah terima (brief ke G1; konsep, sintesis, komposisi ke G2; gambar ke G3; paket unduhan ke G4).
- Pemeriksaan yang tidak bisa dilakukan karena data tidak ada dihitung `warn`, bukan `pass`.

## Pertanyaan bila info penting belum ada

Hanya satu: "Hasil mana dan versi berapa yang dinilai?" bila ada lebih dari satu kandidat.

## Langkah kerja

1. Baca serah terima; pastikan enam field wajib ada.
2. Buka rubrik gerbang yang sesuai. Setiap butir bertanda WAJIB atau SARAN.
3. Nilai tiap butir sebagai `pass`, `warn`, atau `fail`, dengan satu kalimat alasan yang menunjuk bukti (gambar, file, baris brief).
4. Periksa `rights_status`. Untuk G3 dan G4, status selain `cleared` atau `restricted` (dengan syarat dicatat terpenuhi) berarti gagal.
5. Putuskan hasil dengan aturan keputusan.
6. Untuk tiap `fail` dan `warn`: tulis perbaikan konkret dan skill yang mengerjakannya.
7. Isi `quality_results` dan ubah `status` menjadi `passed` atau `failed`.

## Aturan keputusan

- Gagal: ada satu saja butir WAJIB bernilai `fail`.
- Lulus dengan catatan: tidak ada `fail` WAJIB, ada `warn` atau `fail` SARAN. Boleh lanjut; catatan ikut ke tahap berikut.
- Lulus: semua WAJIB `pass`.
- Selera ("kurang suka warnanya") bukan alasan gagal kecuali melanggar brief atau `visual-dna.md`. Tulis sebagai catatan untuk pemilik.
- Gerbang tidak memperbaiki; ia mengembalikan ke skill pemilik hasil tersebut.
- Pemilik studio boleh menimpa hasil gerbang. Catat sebagai KEPUTUSAN pemilik beserta risikonya, kecuali untuk hak bahan: `blocked` dan `unknown` tidak bisa ditimpa.

## Format hasil

```
GERBANG G3 - GAMBAR MASTER   ART-satwa-tropis-01 v1
Hasil: LULUS DENGAN CATATAN

| Butir | Jenis | Nilai | Alasan |
|---|---|---|---|
| Hak bahan cleared | WAJIB | pass | AST-0012 cleared, bukti tercatat |
| ... | | | |

Perbaikan: 1) ... (skill: ...)
Boleh lanjut ke: ...
```

## Pemeriksaan kualitas

- Setiap nilai punya alasan yang menunjuk bukti.
- Tidak ada butir yang dilewati diam-diam.
- Hasil akhir sesuai aturan keputusan (hitung ulang sebelum menulis).

## Penanganan kesalahan

- Serah terima tidak ada: nilai tetap dilakukan, tetapi butir "serah terima lengkap" `fail` dan minta skill pembuat melengkapinya.
- Gambar tidak bisa dilihat (hanya deskripsi): semua butir visual `warn`, hasil paling tinggi "lulus dengan catatan", dan katakan gambar belum dilihat.
- Hasil pemeriksaan cacat atau gaya belum ada untuk G3: jangan menggantikannya; hasil `failed` dengan perbaikan "jalankan skill pemeriksa".

## Serah terima

Skill layanan: mengembalikan hasil ke skill pemanggil. `next_skill` diisi `null`; tahap berikutnya ditentukan skill pemanggil atau orchestrator.

## Batas kemampuan alat

Menilai gambar hanya bila gambar bisa dilihat. Tidak membuka file cetak ukuran penuh kecuali lewat laporan skrip paket. Tidak menilai peluang laku.

## Contoh penggunaan

Paket cetak `ART-satwa-tropis-01` masuk G4 dengan manifest 5 file. Hasil: semua WAJIB `pass`, satu `warn` (file 24x36 berukuran 19,4 MB, dekat batas 20 MB). Lulus dengan catatan; lanjut ke panduan cetak.

## Contoh kegagalan dan perbaikannya

Gagal: gerbang meluluskan G3 karena "gambarnya bagus" padahal bahan masukannya `inspiration_only`. Perbaikan: butir hak bahan dinilai lebih dulu; status itu membuat gagal dan dikembalikan ke `wall-art-reference-fusion-director` untuk mengganti bahan.

## Cara menguji skill ini

Beri serah terima G3 dengan `rights_status: unknown` dan gambar yang rapi. Hasil benar: GAGAL pada butir hak bahan, perbaikan menunjuk `studio-asset-rights-register`, `status: failed`, dan tidak ada kalimat yang menyebut gambar boleh lanjut.
