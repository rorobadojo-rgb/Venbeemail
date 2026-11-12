---
name: wall-art-motif-originality-designer
description: Menciptakan motif dan bahasa bentuk baru untuk Studio Wall Art by Nangka berdasarkan identitas studio dan pengamatan sendiri, serta menguji jaraknya dari sumber inspirasi. Pakai saat pemilik berkata "bikin motif sendiri", "jangan sampai mirip punya orang", "motif khas Nusantara", "cara menggambar hewan versi studio", "bentuk yang jadi ciri khas", atau saat karya terasa generik dan mudah tertukar dengan toko lain. Menghasilkan pustaka motif dengan aturan bentuk, variasi, dan hasil uji jarak. Jangan dipakai untuk menilai hak sebuah gambar atau membuat konsep satu karya.
---

# wall-art-motif-originality-designer

Membangun kosakata bentuk milik studio: cara khas menyederhanakan daun, burung, atau bentuk abstrak, sehingga karya bisa dikenali tanpa bergantung pada gaya orang lain. Skill ini pemilik pustaka motif studio.

Sebelum mulai, baca `references/studio-core.md`. Template: `assets/kartu-motif.md`.

## Kapan digunakan

- DNA visual sudah ada dan butuh isi: motif apa saja dan bagaimana bentuknya.
- Koleksi baru membutuhkan keluarga motif.
- Hasil terasa mirip dengan banyak toko lain.

## Kapan tidak digunakan

- Menetapkan status hak (`studio-asset-rights-register`).
- Menyusun satu karya utuh.

## Input

- Wajib: `visual-dna.md` (garis dan bentuk, larangan) dan tema.
- Opsional: foto dan sketsa milik pemilik, bacaan referensi, pustaka motif yang sudah ada.

## Default

- Sumber utama motif: pengamatan langsung milik pemilik (foto, sketsa, benda di sekitar) dan alam, bukan gambar orang lain.
- Tiap keluarga motif: 1 bentuk induk, 4-6 variasi, 1 aturan pengulangan.
- Motif tradisi Nusantara diperlakukan sebagai warisan bersama yang punya makna: lihat aturan keputusan.

## Pertanyaan bila info penting belum ada

1. "Adakah tumbuhan, hewan, atau benda di sekitar Anda yang ingin dijadikan ciri?"
2. "Bentuknya lebih suka membulat dan lembut, atau bersudut dan tegas?"

## Langkah kerja

1. Tetapkan tata bentuk dari DNA: membulat atau bersudut, tebal tipis garis, tingkat penyederhanaan, cara mengisi bidang.
2. Pilih 2-3 subjek sumber. Untuk tiap subjek, tulis ciri pengenalnya (apa yang membuat burung itu burung itu) dari pengamatan, bukan dari gambar orang lain.
3. Ubah menjadi motif dengan satu atau lebih cara: sederhanakan menjadi bentuk dasar, lebih-lebihkan satu ciri, potong sebagian, ulangi dengan irama, gabungkan dua subjek, ubah sudut pandang.
4. Tulis bentuk induk dan variasinya dengan kata yang bisa digambar ulang atau dijadikan prompt.
5. Lakukan uji jarak terhadap tiap referensi `inspiration_only` yang pernah dibaca: bandingkan pada lima sisi (siluet, susunan, palet, perlakuan garis, konteks). Motif harus berbeda pada minimal tiga sisi.
6. Minta pemilik melakukan pencarian gambar terbalik pada hasil visual pertama motif (bila sudah digambar), karena asisten tidak bisa menjamin tidak ada yang mirip.
7. Catat motif ke kartu motif dengan nomor, dan simpan di `studio-nangka/memori/` sebagai lampiran DNA.

## Aturan keputusan

- Motif yang lahir dari menelusuri atau mengubah sedikit gambar orang lain bukan motif studio; ulangi dari pengamatan.
- Uji jarak kurang dari tiga sisi: ubah lagi sebelum dipakai.
- Motif tradisi (misalnya pola batik tertentu, ukiran, simbol adat): sebut asal daerahnya dengan benar, hindari simbol sakral atau yang penggunaannya terbatas pada upacara atau kalangan tertentu, dan tandai "perlu dicek pemilik" bila maknanya tidak diketahui pasti. Lebih aman mengambil ilham dari flora dan fauna Nusantara lalu mengolahnya dengan tata bentuk studio.
- Jangan menulis "orisinal 100%" atau "tidak ada duanya". Tulis hasil uji jarak dan tanggalnya.
- Hewan dan tumbuhan nyata boleh; karakter, maskot, dan logo tidak.

## Format hasil

Kartu motif per keluarga: nama, subjek sumber dan asalnya, tata bentuk, bentuk induk, variasi, aturan pengulangan, kata prompt (bahasa Inggris), hasil uji jarak (tabel lima sisi), dan catatan budaya bila ada.

## Pemeriksaan kualitas

- Tiap motif punya sumber pengamatan yang disebut.
- Uji jarak tertulis untuk tiap referensi luar yang relevan.
- Kata prompt tidak memuat nama seniman, merek, atau karakter.
- Motif mematuhi garis dan bentuk di DNA.

## Penanganan kesalahan

- Pemilik tidak punya foto atau sketsa: pakai deskripsi dari ingatan pemilik tentang subjek nyata, dan sarankan memotret sendiri untuk putaran berikut.
- Motif tradisi yang maknanya tidak jelas: jangan dipakai dulu; beri pilihan pengganti berbasis alam.

## Serah terima

`wall-art-concept-divergence` memakai pustaka motif sebagai bahan arah konsep.

## Batas kemampuan alat

Tidak bisa mencari seluruh internet untuk memastikan tidak ada yang mirip. Bukan penilaian hukum atas keaslian.

## Contoh penggunaan

Tema satwa tropis. Subjek sumber: burung kutilang dari foto pemilik, daun keladi di halaman. Tata bentuk membulat, garis tidak rata. Bentuk induk: burung sebagai satu bentuk tetes dengan ekor segitiga tumpul; variasi: menoleh, bertengger, terbang, berpasangan. Uji jarak terhadap dua pin: berbeda pada siluet, garis, konteks.

## Contoh kegagalan dan perbaikannya

Gagal: motif burung meniru susunan dan pose dari satu pin, hanya warnanya diganti (berbeda satu sisi). Perbaikan: kembali ke foto sendiri, ubah siluet dan susunan, ulangi uji sampai tiga sisi.

## Cara menguji skill ini

Minta "motif daun khas studio" dengan DNA bertata bentuk membulat dan satu referensi `inspiration_only`. Hasil benar: satu bentuk induk, 4-6 variasi, kata prompt tanpa nama seniman, tabel uji jarak lima sisi dengan minimal tiga "berbeda", dan tidak ada klaim keaslian mutlak.
