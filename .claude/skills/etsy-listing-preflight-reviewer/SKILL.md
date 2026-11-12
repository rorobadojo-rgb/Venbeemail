---
name: etsy-listing-preflight-reviewer
description: Pemeriksaan terakhir sebelum sebuah listing Etsy diterbitkan, yang mencocokkan gambar, teks, file digital, harga, hak bahan, dan kebijakan agar tidak ada janji yang tidak dipenuhi isi paket. Pakai saat pemilik berkata "siap terbit belum?", "cek listing ini", "preflight", "boleh publish?", "periksa sebelum upload", atau setelah judul, tag, gambar, file, dan harga lengkap. Menghasilkan hasil periksa per butir dari skrip dan pemeriksaan mata, daftar perbaikan, serta keputusan siap atau belum. Jangan dipakai untuk menulis ulang listing atau menerbitkannya tanpa izin pemilik.
---

# etsy-listing-preflight-reviewer

Gerbang G5. Kesalahan yang lolos di sini langsung dilihat pembeli, jadi skill ini memeriksa dua lapis: yang bisa dihitung skrip, dan yang harus dilihat mata. Skill ini pemilik keputusan siap atau tidaknya listing diterbitkan; tindakan menerbitkan tetap butuh izin pemilik studio.

Sebelum mulai, baca `references/studio-core.md` (bagian 7 tentang tindakan ke luar). Pemeriksa hitung: `scripts/check_listing.py`. Daftar periksa mata: `references/daftar-preflight.md`.

## Kapan digunakan

- Paket listing lengkap dan akan diterbitkan.
- Listing yang sudah terbit diubah isinya (file, ukuran, harga).
- Audit berkala listing lama setelah aturan berubah.

## Kapan tidak digunakan

- Tahap sebelum listing (G1-G4 milik gerbang kualitas).
- Menulis atau memperbaiki teks; temuan dikembalikan ke skill pemiliknya.

## Input

- Wajib: `listing.json` lengkap, folder file digital, folder gambar listing.
- Opsional: rencana cetak JSON, manifest paket, register hak, catatan fakta Etsy, lembar penawaran.

## Default

- Batas diambil dari `studio-nangka/fakta/etsy-facts.md`. Bila lebih dari 90 hari, minta `etsy-policy-fact-checker` mengecek lebih dulu; hasil preflight dengan fakta basi paling tinggi "siap dengan catatan".
- Tanpa rencana cetak, butir klaim ukuran bernilai `warn`.
- Keputusan terbit tidak pernah diambil otomatis.

## Pertanyaan bila info penting belum ada

"Setelah lulus, saya siapkan lembar unggah manual, atau Anda memberi izin menerbitkan lewat konektor (bila aktif)?"

## Langkah kerja

1. Jalankan `python3 scripts/check_listing.py <listing.json> --root <folder proyek> --plan <rencana-cetak.json>` dengan batas dari catatan fakta (`--max-title`, `--max-tags`, `--max-tag-chars`, `--max-files`, `--max-mb`).
2. Baca tiap baris `PASS`, `WARN`, `FAIL`.
3. Kerjakan `references/daftar-preflight.md` untuk hal yang tidak bisa dihitung: gambar pertama, kejujuran mockup, keselarasan teks dengan panduan cetak, hak bahan, penyebutan AI yang wajar, kata menyesatkan dalam konteks.
4. Cek hak: semua `artwork_ids` berstatus `cleared` atau `restricted` dengan syarat terpenuhi di register hak; template mockup tercatat.
5. Cek fakta: tanggal catatan fakta, dan butir "belum bisa diverifikasi" yang menyentuh listing ini (misalnya jenis file yang diterima).
6. Gabungkan hasil dan tetapkan keputusan dengan aturan keputusan.
7. Tulis daftar perbaikan, masing-masing menunjuk skill pemiliknya.
8. Bila siap: siapkan lembar unggah (urutan gambar, teks siap tempel, daftar file, harga, kategori, atribut). Terbitkan hanya bila pemilik memberi izin jelas dan alatnya tersedia; bila tidak, serahkan lembar unggah dan katakan listing belum diterbitkan.

## Aturan keputusan

- Belum siap: ada `FAIL` dari skrip, hak bahan bukan `cleared` atau `restricted` terpenuhi, klaim ukuran tidak didukung rencana cetak, atau penyebutan AI yang wajib tidak ada.
- Siap dengan catatan: hanya `WARN`, atau fakta kebijakan basi, atau butir yang belum bisa diverifikasi; catatan ditulis dan diterima pemilik.
- Siap: semua lulus dan fakta segar.
- `WARN` kata berisiko dinilai dalam konteks: "frame not included" aman; "framed print" tidak.
- Skill ini tidak memperbaiki sendiri isi listing; ia mengembalikan. Yang boleh dilakukan langsung hanya menyusun lembar unggah.
- Lulus preflight bukan jaminan listing diterima atau tampil di pencarian.

## Format hasil

```
PREFLIGHT G5  [listing]  v..   tanggal ..   catatan fakta: .. (segar/basi)
Hasil skrip: (tempel)
Pemeriksaan mata:
| Butir | Nilai | Catatan |
Hak bahan: ...
KEPUTUSAN: SIAP | SIAP DENGAN CATATAN | BELUM SIAP
Perbaikan: 1) ... (skill: ...)
Status terbit: belum diterbitkan (menunggu izin / lembar unggah diserahkan)
```

## Pemeriksaan kualitas

- Keluaran skrip ditempel utuh.
- Semua butir daftar periksa mata dijawab.
- Tiap perbaikan menunjuk skill pemilik.
- Status terbit tertulis jujur.

## Penanganan kesalahan

- File tidak ada di disk (hanya draf teks): skrip memberi `FAIL` pada file; hasil "belum siap" dan jelaskan apa yang harus ada.
- Gambar tidak bisa dilihat: butir mata untuk gambar bernilai `warn`, keputusan paling tinggi "siap dengan catatan".
- Konektor Etsy tidak aktif: jangan menulis seolah terbit; serahkan lembar unggah.

## Serah terima

`etsy-catalog-sku-manager` menerima listing yang siap untuk diberi atau dicocokkan SKU dan dicatat statusnya.

## Batas kemampuan alat

Memeriksa berkas lokal, bukan listing di Etsy. Tidak tahu keputusan moderasi Etsy. Batas yang dipakai sebaik catatan faktanya.

## Contoh penggunaan

Listing kutilang: skrip memberi 1 `WARN` (hanya 3 gambar), sisanya `PASS`; pemeriksaan mata lulus; hak `cleared`; fakta segar. Keputusan siap dengan catatan: tambah gambar mockup ruangan. Lembar unggah diserahkan; belum diterbitkan.

## Contoh kegagalan dan perbaikannya

Gagal: preflight menyatakan siap padahal `ai_assisted` benar dan deskripsi tidak menyebut AI. Perbaikan: skrip memberi `FAIL` pada butir itu; keputusan belum siap; dikembalikan ke penulis listing untuk menambah kalimat penyebutan.

## Cara menguji skill ini

Buat `listing.json` dengan judul 150 karakter, 14 tag, `ai_assisted: true` tanpa kata AI di deskripsi, dan file digital yang tidak ada. Jalankan skrip. Hasil benar: empat `FAIL` (judul, tag, penyebutan AI, file), kode keluar 1, dan keputusan BELUM SIAP dengan perbaikan yang menunjuk skill pemilik masing-masing.
