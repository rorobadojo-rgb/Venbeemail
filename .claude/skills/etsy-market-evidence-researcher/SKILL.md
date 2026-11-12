---
name: etsy-market-evidence-researcher
description: Mengumpulkan sinyal pasar wall art digital dari sumber yang bisa diperiksa dan mencatatnya dengan tanggal, sumber, dan tingkat keyakinan. Pakai saat pemilik bertanya "laku tidak?", "ada pasarnya?", "tema apa yang dicari orang?", "riset pasar dulu", sebelum memilih niche atau memulai koleksi, atau saat sebuah brief berisi dugaan pasar yang belum punya bukti. Menghasilkan catatan bukti, bukan ramalan penjualan. Jangan dipakai untuk mencari keyword tag atau membedah listing pesaing satu per satu.
---

# etsy-market-evidence-researcher

Pengumpul bukti. Tugasnya memisahkan apa yang benar-benar terlihat di pasar dari apa yang hanya dirasa. Skill ini pemilik `studio-nangka/riset/bukti-pasar.csv`.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/bukti-pasar.csv`; lembar amatan untuk dikerjakan pemilik bila pencarian web tidak ada: `assets/lembar-amati-manual.md`.

## Kapan digunakan

- Menguji dugaan pasar dari brief.
- Membandingkan dua atau tiga arah tema sebelum memilih.
- Memperbarui bukti yang sudah lebih dari 90 hari.

## Kapan tidak digunakan

- Keyword untuk judul dan tag (`etsy-keyword-evidence-researcher`).
- Pola penawaran pesaing (`etsy-competitor-pattern-analyst`).
- Aturan dan biaya Etsy (`etsy-policy-fact-checker`).

## Input

- Wajib: pertanyaan pasar atau daftar tema yang ingin diuji (dari brief).
- Opsional: negara pasar, ruangan, catatan bukti lama.

## Default

- Pasar Amerika Serikat, pencarian dalam bahasa Inggris.
- Paling banyak tiga tema per putaran, supaya tiap tema punya bukti yang layak.
- Tiap kesimpulan butuh minimal dua sumber yang tidak saling mengutip.

## Pertanyaan bila info penting belum ada

1. "Tema mana yang paling ingin Anda uji dulu?" (berikan pilihan dari brief)
2. "Untuk ruangan mana?"

## Langkah kerja

1. Ubah tiap dugaan menjadi pertanyaan yang bisa dijawab bukti, contoh: "Adakah tanda orang mencari cetakan hewan tropis untuk kamar anak?"
2. Kumpulkan sinyal dari jenis sumber berikut, sesuai alat yang tersedia:
   - Publikasi resmi Etsy (laporan tren, Seller Handbook).
   - Amatan langsung halaman pencarian Etsy: jumlah hasil, label yang ditampilkan Etsy, rentang harga yang terlihat.
   - Google Trends dan Pinterest Trends untuk arah minat dari waktu ke waktu.
   - Alat pihak ketiga (misalnya eRank, Marmalead, EverBee): angka mereka adalah perkiraan, tulis demikian.
   - Artikel dan blog: hanya sebagai petunjuk untuk dicek.
3. Catat tiap sinyal sebagai satu baris bukti: apa yang terlihat, di mana, kapan, bagaimana didapat.
4. Pisahkan sinyal permintaan (minat naik, saran pencarian muncul) dari sinyal penawaran (jumlah listing, kepadatan pesaing). Jumlah hasil pencarian adalah penawaran, bukan permintaan.
5. Tulis kesimpulan per tema dengan label: FAKTA bila didukung dua sumber, HIPOTESIS bila satu sumber atau pihak ketiga saja, "belum ada bukti" bila kosong.
6. Simpan baris ke `studio-nangka/riset/bukti-pasar.csv` dan tulis blok serah terima.

## Aturan keputusan

- Tidak ada angka tanpa sumber dan tanggal. Angka perkiraan alat ditulis "perkiraan [nama alat], [tanggal]".
- Jumlah ulasan toko, label "Bestseller", atau "Popular now" dicatat sebagai PENGAMATAN; artinya bagi penjualan tidak disimpulkan sendiri.
- Bukti yang saling bertentangan ditampilkan keduanya.
- Skill ini tidak memilih niche. Ia memberi bukti; pemilihan diusulkan `etsy-micro-niche-mapper` dan diputuskan pemilik.
- Bila bukti tipis, katakan tipis. "Belum ada bukti" adalah hasil yang sah.

## Format hasil

```
BUKTI PASAR  [tanggal]  pasar: AS
Pertanyaan 1: ...
| ID | Sinyal | Jenis (permintaan/penawaran) | Sumber | Tanggal | Keyakinan |
Kesimpulan: [FAKTA/HIPOTESIS/belum ada bukti] ...
Yang belum bisa dijawab: ...
```

Kolom CSV: `bukti_id, tanggal_akses, sumber_url, jenis_sumber, jenis_sinyal, apa_yang_terlihat, angka, cara_dapat, keyakinan, berlaku_untuk, catatan`.

## Pemeriksaan kualitas

- Setiap baris punya URL atau nama alat, dan tanggal.
- Tidak ada kata "pasti laku", "permintaan tinggi", atau sejenisnya tanpa baris bukti yang dirujuk.
- Permintaan dan penawaran tidak tercampur.

## Penanganan kesalahan

- Pencarian web tidak tersedia: jangan mengisi dari ingatan. Berikan `assets/lembar-amati-manual.md` yang sudah diisi istilah pencarian, minta pemilik mengamati 15 menit, lalu olah hasilnya.
- Halaman Etsy tidak bisa dibuka: pakai kutipan mesin pencari dengan keyakinan `sedang` atau lembar amatan manual.
- Alat pihak ketiga butuh akun berbayar: sebut sebagai pilihan, jangan menganggap pemilik memilikinya.

## Serah terima

- `etsy-micro-niche-mapper` untuk memecah tema yang punya bukti.
- `etsy-competitor-pattern-analyst` untuk melihat pola penawaran di tema itu.
- `etsy-keyword-evidence-researcher` untuk bahasa pencarian pembeli.
- `etsy-seasonal-opportunity-planner` bila bukti menunjukkan pola musiman.

## Batas kemampuan alat

Tidak bisa melihat angka penjualan toko lain atau volume pencarian Etsy yang sebenarnya; Etsy tidak membukanya. Yang bisa didapat hanyalah tanda-tanda tidak langsung.

## Contoh penggunaan

Brief menduga "hewan tropis untuk kamar anak diminati". Hasil: 6 baris bukti (2 arah minat, 3 amatan penawaran, 1 perkiraan alat), kesimpulan HIPOTESIS karena sinyal permintaan baru satu sumber, dan daftar tiga amatan yang perlu dilakukan pemilik.

## Contoh kegagalan dan perbaikannya

Gagal: "Ada 50.000 hasil pencarian, jadi permintaannya besar." Perbaikan: 50.000 hasil adalah penawaran; cari sinyal permintaan terpisah, dan tulis ulang kesimpulan sebagai "penawaran padat, permintaan belum terbukti".

## Cara menguji skill ini

Minta "cek apakah poster dapur bertema kopi ada pasarnya" di lingkungan tanpa pencarian web. Hasil benar: tidak ada angka, lembar amatan manual terisi istilah pencarian bahasa Inggris, dan kesimpulan "belum ada bukti" dengan langkah mendapatkannya.
