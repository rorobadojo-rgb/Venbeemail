---
name: wall-art-composition-director
description: Merancang komposisi sebuah karya wall art, yaitu titik fokus, skala subjek, ruang kosong, keseimbangan, alur pandang, dan zona aman agar gambar tetap utuh saat dipotong ke berbagai rasio cetak. Pakai saat pemilik berkata "susunannya gimana?", "taruh subjeknya di mana?", "kok terasa sesak", "kosong banget", "supaya tidak kepotong waktu dicetak 8x10", "atur tata letak set tiga gambar", atau sebelum prompt ditulis. Menghasilkan rancangan komposisi dengan sketsa petak dan angka yang bisa dipakai penulis prompt. Jangan dipakai untuk memilih warna atau menghitung ukuran cetak.
---

# wall-art-composition-director

Menentukan di mana mata berhenti dan bagaimana gambar bertahan saat dipotong. Karya wall art dilihat dari jauh dan dijual dalam beberapa rasio, jadi komposisi harus terbaca besar dan tahan potong. Skill ini pemilik rancangan komposisi.

Sebelum mulai, baca `references/studio-core.md`. Angka zona aman: `references/zona-aman-crop.md`.

## Kapan digunakan

- Arah konsep sudah dipilih (dengan atau tanpa sintesis referensi).
- Gambar jadi terasa sesak, kosong, atau berat sebelah dan perlu arahan perbaikan.
- Menata set dua atau tiga gambar agar serasi berdampingan.

## Kapan tidak digunakan

- Menghitung pixel dan ukuran cetak (`wall-art-ratio-resolution-planner`).
- Menulis prompt.

## Input

- Wajib: arah konsep terpilih atau pernyataan sintesis.
- Opsional: profil ruangan (jarak pandang, orientasi), rasio yang akan dijual, `visual-dna.md` (pola komposisi), rancangan karya lain dalam set.

## Default

- Orientasi tegak, rasio master 2:3, karena paling mudah diturunkan ke rasio lain.
- Semua unsur penting berada di 80% bagian tengah pada kedua arah (zona aman).
- Satu titik fokus. Subjek utama menempati 35-55% tinggi bidang.
- Ruang kosong minimal sepertiga bidang, kecuali DNA menetapkan lain.

## Pertanyaan bila info penting belum ada

1. "Karya ini tegak, mendatar, atau persegi?"
2. "Dijual sendiri atau bagian dari set berdampingan?"

## Langkah kerja

1. Tetapkan orientasi dan rasio master dari profil ruangan dan rencana produk.
2. Tentukan titik fokus pada sembilan petak (kiri atas sampai kanan bawah) dan alasannya.
3. Tentukan skala subjek sebagai persen tinggi bidang, dan apakah subjek utuh atau sengaja terpotong tepi.
4. Atur keseimbangan: apa yang mengimbangi subjek (bidang kosong, bentuk kecil, warna aksen).
5. Gambarkan alur pandang: mata masuk dari mana, berhenti di mana, keluar ke mana.
6. Tandai zona aman dengan angka dari `references/zona-aman-crop.md`. Sebut unsur mana yang boleh terpotong dan mana yang tidak.
7. Untuk set: samakan garis dasar atau cakrawala, skala subjek, dan lebar tepi; arahkan subjek di kiri dan kanan menghadap ke dalam.
8. Uji jarak: bayangkan gambar selebar ibu jari. Bila subjek tidak lagi terbaca, perbesar bentuk atau naikkan kontras.
9. Gambar sketsa petak dengan huruf dan isi rancangan. Minta `studio-quality-gate` menilai gerbang G2.

## Aturan keputusan

- Unsur yang wajib utuh (mata hewan, ujung paruh, tulisan bila ada, tanda tangan studio) tidak pernah di luar zona aman.
- Bila pemilik menginginkan komposisi tepi-ke-tepi yang tidak tahan potong, itu boleh, dengan akibat yang tertulis: tiap rasio butuh penyesuaian tersendiri atau latar diperluas.
- Pola komposisi di DNA diikuti; penyimpangan dicatat sebagai usulan, bukan dilakukan diam-diam.
- Karya untuk dilihat dari jauh (di atas sofa) memakai bentuk besar; detail halus hanya pelengkap.

## Format hasil

```
RANCANGAN KOMPOSISI  ART-...  v..
Orientasi dan rasio master : tegak, 2:3
Titik fokus                : petak tengah-bawah, karena ...
Skala subjek               : 45% tinggi, utuh
Ruang kosong               : atas dan kanan, sekitar 40%
Keseimbangan               : ...
Alur pandang               : ...
Zona aman                  : unsur wajib utuh di 80% tengah; boleh terpotong: ...
Sketsa petak:
+---+---+---+
|   |   |   |
+---+---+---+
|   | S |   |     S = subjek, a = aksen, . = kosong
+---+---+---+
| a | S |   |
+---+---+---+
Catatan set: ...
```

## Pemeriksaan kualitas

- Ada tepat satu titik fokus dengan alasan.
- Zona aman tertulis dengan angka.
- Untuk set: garis dasar, skala, dan arah hadap konsisten.

## Penanganan kesalahan

- Arah konsep belum dipilih: jangan merancang untuk semua arah; kembalikan untuk dipilih.
- Rasio yang akan dijual belum diketahui: pakai default dan tandai ASUMSI.
- Subjek dari foto sendiri berada di tepi foto: rancang perluasan latar dan catat sebagai tugas penulis prompt.

## Serah terima

- `wall-art-image-prompt-engineer` menerima rancangan komposisi untuk ditulis menjadi prompt.
- `studio-quality-gate` dipanggil untuk keputusan gerbang G2.

## Batas kemampuan alat

Rancangan berupa kata dan sketsa huruf. Alat pembuat gambar tidak selalu mematuhi letak yang diminta; hasilnya tetap harus diperiksa.

## Contoh penggunaan

"Kutilang di dahan", tegak 2:3: fokus tengah-bawah, burung 40% tinggi menghadap kanan, dahan masuk dari kiri bawah, ruang kosong luas di atas, aksen kuning kecil di kanan atas sebagai pengimbang, mata dan paruh di zona aman.

## Contoh kegagalan dan perbaikannya

Gagal: ekor burung menyentuh tepi bawah pada master 2:3, sehingga terpotong saat dijadikan 4:5. Perbaikan: naikkan subjek sampai seluruh tubuh berada di 80% tengah, tambah ruang di bawah.

## Cara menguji skill ini

Minta komposisi untuk "set tiga daun tropis tegak untuk ruang tamu". Hasil benar: tiga sketsa petak, satu titik fokus per gambar, skala dan garis dasar sama, daun kiri dan kanan menghadap ke dalam, zona aman 80% disebut, dan gerbang G2 diminta.
