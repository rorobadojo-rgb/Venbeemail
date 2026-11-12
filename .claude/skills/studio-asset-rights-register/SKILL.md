---
name: studio-asset-rights-register
description: Mencatat asal, pemilik, izin, batas pakai, dan bukti untuk setiap bahan gambar studio, lalu menetapkan status haknya. Pakai setiap kali ada bahan baru masuk (foto sendiri, gambar sendiri, hasil AI, gambar Pinterest, stok, font), saat pemilik bertanya "boleh dijual tidak?", "ini aman dipakai?", "hak ciptanya bagaimana?", atau sebelum sebuah karya masuk produksi dan listing. Jangan dipakai untuk menilai mutu gambar atau membaca gaya referensi.
---

# studio-asset-rights-register

Buku catatan hak bahan. Satu baris per bahan, dengan bukti. Skill ini satu-satunya pemilik `rights_status`; skill lain hanya membaca.

Sebelum mulai, baca `references/studio-core.md` (bagian 6 berisi arti tiap status). Template register: `assets/asset-rights-register.csv`.

Ini pencatatan dan pemilahan risiko, bukan nasihat hukum. Untuk kasus bernilai besar atau meragukan, sarankan pemilik bertanya ke ahli hukum.

## Kapan digunakan

- Bahan baru disebut atau diunggah.
- Sebelum gerbang G3 dan sebelum preflight listing.
- Syarat layanan alat AI berubah atau paket langganan berganti.

## Kapan tidak digunakan

- Membaca gaya gambar (itu `wall-art-reference-reader`).
- Memeriksa aturan Etsy (itu `etsy-policy-fact-checker`).

## Input

- Wajib: bahan (file, tautan, atau deskripsi) dan jawaban "dari mana asalnya".
- Opsional: nama alat AI dan paket langganan saat gambar dibuat, tangkapan layar syarat lisensi, tanggal pembuatan.

## Default

- Asal tidak diketahui: `unknown`.
- Gambar dari Pinterest, toko lain, mesin pencari, atau karya seniman: `inspiration_only`, apa pun alasannya. Pinterest bukan pemberi izin; pemilik gambarnya orang lain.
- Hasil AI tanpa bukti syarat komersial alatnya: `restricted` sampai bukti dicatat.

## Pertanyaan bila info penting belum ada

1. "Siapa yang membuat atau memotret ini?" (saya sendiri / orang lain / alat AI / tidak tahu)
2. Untuk AI: "Alat apa, paket apa, dan kapan dibuat?"
3. Untuk foto sendiri: "Adakah orang yang wajahnya dikenali, logo, atau karya orang lain di dalam foto?"

## Langkah kerja

1. Beri `asset_id` berikutnya (lihat baris terakhir register).
2. Catat asal dengan kata pemilik sendiri; jangan menebak.
3. Tetapkan status dengan aturan keputusan di bawah.
4. Catat bukti: path file atau URL syarat lisensi + tanggal dilihat. Tanpa bukti, tulis "belum ada bukti".
5. Tulis batas pakai dalam kalimat biasa ("hanya untuk dipelajari suasananya").
6. Bila bahan dipakai di sebuah karya, isi kolom `dipakai_di` dan hitung status karya: mengikuti bahan terlemah.
7. Simpan ke `studio-nangka/register/asset-rights.csv` dan tulis blok serah terima yang memuat status tiap bahan.

## Aturan keputusan

| Bahan | Status awal | Naik menjadi `cleared` bila |
|---|---|---|
| Foto milik sendiri | cleared | Sudah. Turun ke `restricted` bila ada wajah dikenali, logo, atau karya seni orang lain yang menonjol |
| Gambar buatan sendiri | cleared | Sudah. Bila dibuat dengan menelusuri gambar orang lain, ikuti status gambar itu |
| Hasil AI dari prompt sendiri | restricted | Syarat layanan alat pada paket yang dipakai mengizinkan pemakaian komersial, dan buktinya dicatat |
| Hasil AI dengan gambar masukan | status gambar masukan | Gambar masukan `cleared` dan syarat alat terpenuhi |
| Stok, tekstur, font | unknown | Lisensinya jelas mengizinkan dijual sebagai bagian produk digital, bukti dicatat |
| Pinterest, toko lain, seniman | inspiration_only | Tidak bisa naik, kecuali ada izin tertulis dari pemiliknya |
| Karakter, merek, tim, selebritas | blocked | Tidak bisa naik |

- Prompt yang menyebut nama seniman hidup, merek, atau karakter membuat hasilnya `blocked` untuk produk.
- Catat sebagai ASUMSI yang perlu dicek berkala: perlindungan hak cipta atas karya yang sepenuhnya dibuat AI bisa terbatas di beberapa negara. Ini memengaruhi kemampuan menuntut peniru, bukan izin menjual.

## Format hasil

Baris CSV dengan kolom: `asset_id, tanggal_catat, nama_atau_url, jenis, pembuat_atau_pemilik, alat_dan_paket, dasar_izin, bukti, batas_pakai, rights_status, dipakai_di, catatan`.

Lalu ringkasan untuk pemilik: tabel bahan, status, dan satu kalimat "artinya untuk Anda".

## Pemeriksaan kualitas

- Tidak ada baris `cleared` dengan kolom `bukti` kosong, kecuali jenis foto atau gambar sendiri (buktinya pernyataan pemilik, tulis demikian).
- Tidak ada bahan Pinterest berstatus selain `inspiration_only` atau `blocked` tanpa izin tertulis.
- Status karya sama dengan bahan terlemahnya.

## Penanganan kesalahan

- Pemilik tidak ingat asal gambar: `unknown`, sarankan pencarian gambar terbalik, jangan dipakai untuk produk.
- Syarat alat AI tidak bisa dibuka dari sini: tetap `restricted`, minta pemilik membuka halaman syarat dan mengirim tangkapan layar.
- Register belum ada: buat dari template.

## Serah terima

Skill layanan: mengembalikan status ke skill pemanggil. `next_skill` diisi `null`.

## Batas kemampuan alat

Tidak bisa membuktikan kepemilikan, hanya mencatat pernyataan dan bukti yang diberikan. Tidak bisa menjamin sebuah gambar AI tidak mirip karya yang sudah ada.

## Contoh penggunaan

Pemilik mengirim 3 foto burung milik sendiri dan 5 pin Pinterest. Hasil: `AST-0001` sampai `AST-0003` `cleared` (bukti: pernyataan pemilik), `AST-0004` sampai `AST-0008` `inspiration_only` dengan batas "pelajari suasana dan susunan, jangan disalin atau diunggah ke alat AI".

## Contoh kegagalan dan perbaikannya

Gagal: gambar AI dicatat `cleared` karena "semua AI boleh dijual". Perbaikan: turunkan ke `restricted`, catat alat dan paket, minta bukti syarat komersial, baru naikkan.

## Cara menguji skill ini

Beri tiga bahan: foto sendiri berisi logo toko di latar, gambar Midjourney tanpa keterangan paket, dan satu pin Pinterest. Hasil benar: `restricted`, `restricted`, `inspiration_only`, masing-masing dengan alasan satu kalimat, dan sebuah karya yang memakai ketiganya berstatus `inspiration_only`.
