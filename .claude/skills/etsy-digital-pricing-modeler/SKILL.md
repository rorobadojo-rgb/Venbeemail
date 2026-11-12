---
name: etsy-digital-pricing-modeler
description: Menghitung skenario harga untuk produk wall art digital di Etsy berdasarkan biaya toko, waktu kerja, biaya alat, dan margin, memakai kalkulator yang membaca angka biaya bertanggal. Pakai saat pemilik bertanya "harganya berapa?", "untung berapa per penjualan?", "berapa potongan Etsy?", "harga set 3 berapa?", "balik modal setelah berapa pesanan?", "diskon berapa yang masih aman?", atau setelah isi produk ditetapkan. Menghasilkan tabel biaya per pesanan, titik impas, skenario, dan usulan harga dengan ketidakpastiannya. Jangan dipakai untuk mengubah harga di toko atau meramal jumlah penjualan.
---

# etsy-digital-pricing-modeler

Menunjukkan apa yang tersisa dari tiap harga setelah potongan, dan berapa pesanan yang dibutuhkan untuk menutup waktu yang dikeluarkan. Skill ini pemilik usulan harga; harga akhir adalah keputusan pemilik studio.

Sebelum mulai, baca `references/studio-core.md`. Kalkulator: `scripts/pricing_model.py`. Contoh masukan: `assets/contoh-input-harga.json`.

## Kapan digunakan

- Isi produk sudah ditetapkan dan butuh harga.
- Mempertimbangkan diskon, bundel, atau kenaikan harga.
- Biaya Etsy atau biaya alat berubah.

## Kapan tidak digunakan

- Mengubah harga langsung di toko (butuh izin; itu tindakan ke luar).
- Merancang eksperimen harga (`studio-experiment-planner`).

## Input

- Wajib: daftar harga yang ingin dibandingkan, dan berkas biaya `studio-nangka/fakta/fees.json`.
- Opsional: jam kerja per listing, nilai satu jam kerja, biaya alat per bulan, jumlah listing per bulan, dugaan jumlah pesanan, rentang harga yang terlihat dari peta pesaing.

## Default

- Berkas biaya diminta dari `etsy-policy-fact-checker` bila belum ada atau lebih dari 90 hari.
- Jam kerja per listing 4 jam; biaya alat USD 30 per bulan; 12 listing per bulan (dari profil studio; ASUMSI sampai ada catatan nyata).
- Nilai satu jam kerja wajib ditanyakan sekali; tanpa jawaban, hitung dua versi (0 dan USD 5) dan katakan demikian.
- Skenario pesanan diisi pemilik. Skill ini tidak mengarang jumlah pesanan.

## Pertanyaan bila info penting belum ada

1. "Berapa nilai satu jam kerja Anda yang ingin dihitung?" (beri 2-3 pilihan)
2. "Harga mana saja yang ingin dibandingkan?" (usulkan 3-4 titik dari rentang yang terlihat di peta pesaing, bila ada)
3. "Kurs rupiah per dolar hari ini dan sumbernya?" (dibutuhkan untuk biaya tetap pemrosesan pembayaran)

## Langkah kerja

1. Ambil berkas biaya dan lihat `verified_on` serta keyakinan tiap angka.
2. Susun berkas masukan seperti `assets/contoh-input-harga.json`: `fees` (atau `fees_file`), `prices`, jam kerja, nilai jam, biaya alat, listing per bulan, `order_scenarios` dari pemilik.
3. Jalankan `python3 scripts/pricing_model.py --input <berkas> --today <tanggal hari ini>`.
4. Baca hasil: biaya per pesanan, persen dari harga, bersih per pesanan, titik impas (jumlah pesanan untuk menutup biaya tetap satu listing), dan skenario.
5. Salin semua peringatan skrip ke hasil. Peringatan keyakinan rendah berarti angka itu perkiraan.
6. Bandingkan dengan rentang harga yang terlihat di peta pesaing bila ada (PENGAMATAN bertanggal), tanpa menyimpulkan harga "pasar".
7. Susun usulan: satu harga utama dan satu alternatif, dengan alasan dan apa yang belum pasti.
8. Untuk set dan bundel: jalankan dengan harga set, lalu bandingkan dengan jumlah harga satuannya agar hematnya terlihat dan masuk akal.

## Aturan keputusan

- Tidak ada angka biaya dari ingatan. Bila berkas biaya kosong pada satu angka, skrip berhenti atau memberi peringatan; jangan mengisi sendiri.
- Harga dengan bersih per pesanan nol atau negatif tidak diusulkan.
- Harga psikologis (berakhiran .99 dan sejenisnya) adalah pilihan gaya, bukan fakta; sebut sebagai pilihan.
- Diskon dihitung dari harga setelah diskon. Diskon yang membuat titik impas melampaui dugaan pesanan tertinggi pemilik diberi tanda bahaya.
- Usulan harga bukan janji laku. Tulis sebagai HIPOTESIS yang bisa diuji lewat eksperimen harga.
- Pajak penghasilan dan kewajiban pajak pribadi di luar cakupan; sarankan bertanya ke ahli pajak.

## Format hasil

```
MODEL HARGA  [listing]  tanggal ..  berkas biaya dicek ..
(tempel tabel skrip)
Peringatan: ...
Rentang yang terlihat di pesaing: ... (amatan tanggal ..) / belum ada
USULAN: USD .. (alasan) | alternatif USD ..
Yang belum pasti: ...
KEPUTUSAN pemilik: (menunggu)
```

## Pemeriksaan kualitas

- Tanggal berkas biaya dan semua peringatan skrip tercantum.
- Skenario pesanan berasal dari pemilik dan diberi label dugaan.
- Tidak ada kalimat yang meramal penjualan.

## Penanganan kesalahan

- Skrip berhenti karena kurs kosong: minta kurs dan sumbernya, atau cari dengan sumber dan tanggal; jangan memakai angka contoh.
- Berkas biaya basi: minta dicek ulang lebih dulu; bila pemilik ingin perkiraan cepat, jalankan dan beri tanda basi.
- Python tidak tersedia: hitung dengan rumus yang sama secara manual untuk dua harga saja dan tulis tiap langkahnya.

## Serah terima

`etsy-listing-copy-builder` menerima harga yang diputuskan pemilik untuk dimasukkan ke paket listing.

## Batas kemampuan alat

Model tidak memuat semua biaya (misalnya pajak atas biaya, biaya penarikan, konversi mata uang) bila angkanya belum ada di berkas biaya. Hasil adalah perkiraan sebaik berkas biayanya.

## Contoh penggunaan

Listing satuan, harga 4,5 / 6 / 9 / 12 dolar, 4 jam kerja bernilai 5 dolar per jam. Hasil: pada harga 6 dolar, biaya per pesanan sekitar 1,30 dolar (21,6%), bersih 4,70, impas pada 4,8 pesanan; dua biaya berkeyakinan rendah. Usulan 6 dolar untuk satuan sebagai HIPOTESIS.

## Contoh kegagalan dan perbaikannya

Gagal: "Etsy memotong sekitar 10%, jadi dari 5 dolar Anda dapat 4,50." Perbaikan: jalankan kalkulator; biaya tetap per pesanan membuat potongan pada harga rendah jauh lebih besar dari 10%, dan tabel menunjukkannya.

## Cara menguji skill ini

1. Jalankan `python3 scripts/pricing_model.py --input assets/contoh-input-harga.json --today 2026-11-12`. Hasil benar: harga 6.0 menghasilkan bersih 4.7 dan impas 4.8, dengan empat peringatan.
2. Hapus nilai `fx_local_per_usd` dari salinan berkas dan jalankan. Hasil benar: `TIDAK BISA DIHITUNG` dengan pesan kurs belum diisi.
