---
name: wall-art-print-instruction-writer
description: Menulis panduan cetak berbahasa Inggris untuk pembeli unduhan wall art, yang menjelaskan file mana untuk ukuran bingkai mana, cara mencetak di rumah, di toko cetak, atau lewat layanan daring, serta apa yang boleh dan tidak boleh dilakukan dengan file, tanpa menjanjikan warna identik dengan layar. Pakai saat pemilik berkata "buatkan panduan cetak", "file readme untuk pembeli", "pembeli bingung pilih file", "cara cetaknya gimana?", atau setelah paket unduhan tersusun. Menghasilkan teks panduan dan file PDF-nya. Jangan dipakai untuk menulis deskripsi listing atau membalas pesan pelanggan.
---

# wall-art-print-instruction-writer

Panduan satu sampai dua halaman yang membuat pembeli awam berhasil mencetak tanpa bertanya. Panduan yang baik mengurangi pesan masuk dan ulasan kecewa. Skill ini pemilik panduan cetak untuk pembeli.

Sebelum mulai, baca `references/studio-core.md`. Kerangka panduan: `assets/print-guide-template.txt`. Pembuat PDF: `scripts/make_guide_pdf.py`.

## Kapan digunakan

- Paket unduhan sudah tersusun dan daftar file akhirnya diketahui.
- Isi paket berubah (rasio ditambah, file digabung ke ZIP).
- Pertanyaan pembeli yang sama berulang.

## Kapan tidak digunakan

- Deskripsi listing (`etsy-listing-copy-builder`), walau isinya harus selaras.
- Balasan pesan pelanggan.

## Input

- Wajib: daftar file akhir dari manifest paket (nama file, rasio, ukuran yang tercakup).
- Opsional: nama toko, syarat pemakaian file dari isi produk, catatan warna dari kartu palet, alamat bantuan.

## Default

- Bahasa Inggris Amerika, kalimat pendek, ukuran inci dengan sentimeter untuk seri A.
- Pemakaian pribadi saja (personal use), kecuali isi produk menetapkan lain.
- Dua halaman paling banyak.

## Pertanyaan bila info penting belum ada

1. "Nama toko yang dicantumkan di panduan?" (boleh dikosongkan dulu)
2. "File boleh dipakai untuk apa oleh pembeli: pribadi saja, atau juga hadiah cetak?"

## Langkah kerja

1. Ambil daftar file dari manifest; jangan menulis nama file dari ingatan.
2. Salin kerangka `assets/print-guide-template.txt` dan isi tabel "Which file do I use?" dengan nama file yang sebenarnya dan ukuran yang berstatus layak menurut rencana cetak.
3. Bila ada ZIP, jelaskan satu kalimat cara membukanya dan file apa di dalamnya.
4. Tulis tiga cara mencetak (rumah, toko cetak, daring) masing-masing 2-3 langkah.
5. Tulis bagian warna dengan jujur: warna cetak bisa berbeda dari layar karena layar, printer, dan kertas berbeda.
6. Tulis yang termasuk dan tidak termasuk: file digital, tidak ada barang fisik, tidak ada bingkai.
7. Tulis syarat pemakaian sesuai isi produk.
8. Simpan teks sebagai `print-guide.txt`, lalu buat PDF: `python3 scripts/make_guide_pdf.py print-guide.txt print-guide.pdf --title "Print Guide"`.
9. Periksa PDF terbentuk (skrip melaporkan jumlah halaman), masukkan ke folder sumber paket, dan minta paket disusun ulang agar manifest memuatnya.

## Aturan keputusan

- Tidak ada janji: "colors will match exactly", "museum quality", "guaranteed". Pakai "may vary slightly" dan saran uji cetak kecil.
- Ukuran yang disebut hanya yang layak menurut rencana cetak. Ukuran berstatus `kurang` tidak boleh muncul.
- Nama layanan cetak tertentu tidak direkomendasikan sebagai jaminan; sebut jenisnya (local print shop, online print service). Bila pemilik ingin menyebut nama, tulis sebagai contoh, bukan dukungan.
- Bila karya dibuat dengan bantuan AI, panduan tidak perlu mengulang penyebutan itu; tempatnya di deskripsi listing. Jangan menulis sebaliknya (misalnya "hand-painted") bila tidak benar.
- Panduan dan deskripsi listing tidak boleh bertentangan soal isi paket dan syarat pemakaian.

## Format hasil

Teks panduan utuh (bahasa Inggris), path `print-guide.txt` dan `print-guide.pdf`, jumlah halaman, serta daftar hal yang harus sama dengan deskripsi listing.

## Pemeriksaan kualitas

- Tiap nama file di panduan ada di manifest, dan sebaliknya tiap file cetak di manifest disebut.
- Tidak ada kata jaminan warna atau mutu.
- Ada pernyataan produk digital tanpa barang fisik.
- PDF ada dan bisa dibuka; paling banyak dua halaman.

## Penanganan kesalahan

- Manifest belum ada: tulis panduan sebagai draf dengan tanda `[FILE NAME]`, berstatus `needs_input`.
- Skrip PDF tidak bisa dijalankan: serahkan teksnya dan katakan PDF belum dibuat; pemilik bisa menyimpannya sebagai PDF dari pengolah kata.
- Teks memuat huruf di luar Latin dasar: skrip menggantinya; periksa hasilnya.

## Serah terima

- `wall-art-mockup-art-director` memakai daftar ukuran yang layak untuk gambar "apa yang didapat".
- `etsy-listing-copy-builder` memakai isi paket dan syarat pemakaian agar deskripsi selaras dengan panduan.

## Batas kemampuan alat

PDF buatan skrip sederhana: teks hitam, huruf standar, tanpa gambar dan tanpa logo. Untuk panduan berdesain, pemilik perlu alat tata letak.

## Contoh penggunaan

Paket lima file. Panduan memuat tabel lima baris (misalnya `satwa-tropis-01_4x5_16x20in.jpg` untuk 4x5, 8x10, 16x20), tiga cara cetak, catatan warna, pemakaian pribadi. PDF satu halaman.

## Contoh kegagalan dan perbaikannya

Gagal: panduan berbunyi "Colors are guaranteed to match your screen." Perbaikan: ganti dengan "Printed colors may vary slightly from what you see on screen, because every screen, printer, and paper is different. We recommend a small test print first."

## Cara menguji skill ini

1. Jalankan `python3 scripts/make_guide_pdf.py assets/print-guide-template.txt /tmp/uji-panduan.pdf --title "Print Guide"`. Hasil benar: pesan berisi jumlah halaman, dan file diawali `%PDF`.
2. Beri manifest berisi 3 file dan minta panduan. Hasil benar: tabel memuat tepat 3 nama file itu, tidak ada kata "guaranteed", dan ada kalimat bahwa tidak ada barang fisik yang dikirim.
