---
name: etsy-catalog-sku-manager
description: Mengatur katalog produk studio, yaitu SKU, status tiap produk, versi, file sumber, paket unduhan, dan hubungan antarlisting (satuan, set, bundel), dalam satu berkas katalog yang diperiksa skrip. Pakai saat pemilik berkata "kasih SKU", "catat listing baru", "produk mana saja yang sudah terbit?", "file sumber yang ini di mana?", "versi berapa yang dijual?", "listing mana yang memakai karya ini?", setelah listing lulus preflight, atau saat status produk berubah. Menghasilkan baris katalog yang sah dan laporan pemeriksaan. Jangan dipakai untuk memutuskan produk dihentikan atau menulis listing.
---

# etsy-catalog-sku-manager

Buku induk produk. Tanpa katalog, tiga bulan lagi tidak ada yang tahu file mana yang sedang dijual di listing mana. Skill ini pemilik `studio-nangka/register/katalog.csv` dan penomoran SKU.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/katalog-template.csv`. Pemeriksa: `scripts/check_catalog.py`.

## Kapan digunakan

- Listing lulus preflight dan perlu SKU.
- Status berubah (terbit, jeda, pensiun) atau versi naik.
- Mencari produk, file sumber, atau hubungan antarlisting.

## Kapan tidak digunakan

- Memutuskan nasib produk (`etsy-portfolio-decision-reviewer`); skill ini hanya mencatat keputusannya.
- Menyusun paket file.

## Input

- Wajib: data produk (karya, bentuk jual, koleksi) atau perubahan status.
- Opsional: `listing.json`, path paket dan file sumber, nomor listing Etsy dan tanggal terbit dari pemilik.

## Default

- Format SKU: `NGK-<KODE KOLEKSI>-<NN|SETn|BDL>[-<VARIAN>]`. Kode koleksi 3-5 huruf besar; `NN` nomor karya dua digit; `SET3` untuk set tiga; `BDL` untuk bundel. Contoh: `NGK-STRP-01`, `NGK-STRP-SET3`, `NGK-STRP-BDL`.
- Status: `ide`, `produksi`, `siap`, `terbit`, `jeda`, `pensiun`.
- SKU tidak pernah dipakai ulang, walau produknya pensiun.

## Pertanyaan bila info penting belum ada

1. "Kode koleksi 3-5 huruf untuk koleksi ini?" (usulkan satu)
2. Untuk status terbit: "Nomor listing di Etsy dan tanggal terbitnya?"

## Langkah kerja

1. Buka katalog; bila belum ada, buat dari template.
2. Untuk produk baru: tentukan kode koleksi (sekali per koleksi, dicatat), beri SKU berikutnya, isi baris.
3. Isi kolom hubungan `terkait_sku`: set mencantumkan SKU satuan anggotanya, dan sebaliknya.
4. Isi path: file sumber master, folder paket, `listing.json`. Path relatif terhadap folder studio.
5. Untuk perubahan: ubah status atau naikkan versi; tulis tanggal dan alasan singkat di kolom catatan. Versi lama tetap bisa dilacak lewat catatan.
6. Tulis SKU ke `listing.json` (field `sku`).
7. Jalankan `python3 scripts/check_catalog.py <katalog.csv> --root <folder studio>`; perbaiki sampai `LULUS`.
8. Tampilkan baris yang ditambah atau diubah, lalu tulis blok serah terima.

## Aturan keputusan

- Satu baris per produk yang dijual (per listing), bukan per file.
- Status `terbit` hanya diisi bila pemilik menyatakan listing sudah terbit dan memberi nomor listing. Asisten tidak menandai terbit berdasarkan draf.
- Perubahan isi file yang sudah dijual berarti versi baru (`v2`); catat apa yang berubah, karena pembeli lama memegang versi lama.
- Produk `pensiun` tidak dihapus dari katalog.
- Keputusan mengubah status ke `jeda` atau `pensiun` berasal dari pemilik atau peninjau portofolio; skill ini mencatat dan menyebut asalnya.
- Katalog tidak memuat data pelanggan.

## Format hasil

Kolom CSV: `sku, status, bentuk, judul_kerja, collection_id, artwork_ids, versi, listing_id_etsy, tanggal_terbit, harga_usd, file_sumber, paket, listing_json, terkait_sku, catatan`.

Daftar di dalam satu sel dipisah titik koma. Hasil ditutup dengan keluaran skrip.

## Pemeriksaan kualitas

- Skrip menyatakan `LULUS`.
- Tidak ada SKU ganda atau dipakai ulang.
- Tiap set dan bundel punya `terkait_sku` yang ada di katalog.
- Baris `terbit` punya nomor listing, tanggal, dan harga.

## Penanganan kesalahan

- Katalog diubah tangan dan formatnya rusak: skrip menunjukkan barisnya; perbaiki baris itu saja.
- Nomor listing belum ada: status tetap `siap`.
- Tanpa sistem file: tampilkan baris CSV untuk disalin pemilik, dan katakan katalog belum diperbarui.

## Serah terima

Skill ujung: tidak menyerahkan ke skill lain. `next_skill` diisi `null`; katalog dibaca oleh skill analisis saat dibutuhkan.

## Batas kemampuan alat

Tidak tersambung ke Etsy, jadi nomor listing, harga yang tampil, dan status sebenarnya di toko harus diberi pemilik. Skrip memeriksa bentuk dan keberadaan file, bukan isi listing.

## Contoh penggunaan

Listing kutilang lulus preflight. Baris baru: `NGK-STRP-01, siap, satuan, Kutilang di dahan, COL-satwa-tropis, ART-satwa-tropis-01, v1, , , 6, proyek/.../master.png, proyek/.../paket, proyek/.../listing.json, NGK-STRP-SET3, `. Skrip `LULUS`.

## Contoh kegagalan dan perbaikannya

Gagal: karya direvisi dan file diganti, tetapi katalog tetap `v1`. Perbaikan: naikkan ke `v2`, tulis tanggal dan apa yang berubah, perbarui path paket.

## Cara menguji skill ini

1. Jalankan `python3 scripts/check_catalog.py assets/katalog-template.csv`. Hasil benar: `LULUS` dengan 0 baris.
2. Tambah dua baris ber-SKU sama pada salinan. Hasil benar: `TIDAK LULUS` dengan pesan SKU ganda.
