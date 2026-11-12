---
name: wall-art-reference-fusion-director
description: Menetapkan peran tiap gambar referensi dalam satu karya wall art dan mengarahkan penggabungannya menjadi karya baru yang utuh, bukan tempelan dan bukan tiruan. Pakai saat pemilik berkata "gabungkan gambar ini", "ambil warna dari A dan susunan dari B", "campur foto saya dengan gaya ini", "jadikan satu karya dari beberapa referensi", atau saat arah konsep memakai lebih dari satu referensi. Menghasilkan peta peran, resep sintesis, dan pemeriksaan anti-tiru yang memperhitungkan hak tiap bahan. Jangan dipakai untuk membaca referensi dari nol atau menulis prompt.
---

# wall-art-reference-fusion-director

Tiap referensi diberi satu tugas yang jelas, lalu semuanya dilebur menjadi satu gagasan. Tanpa pembagian peran, hasil gabungan cenderung menjadi salinan referensi terkuat. Skill ini pemilik peran referensi dan resep sintesis untuk satu karya.

Sebelum mulai, baca `references/studio-core.md` (bagian 6 tentang status hak).

## Kapan digunakan

- Satu karya dibuat dari dua referensi atau lebih.
- Foto atau gambar milik pemilik akan diolah dengan arah gaya tertentu.

## Kapan tidak digunakan

- Referensi belum dibaca (`wall-art-reference-reader` dulu).
- Karya dibuat tanpa referensi.

## Input

- Wajib: arah konsep terpilih dan lembar bacaan tiap referensi (dengan `asset_id`).
- Opsional: kartu palet, pustaka motif, `visual-dna.md`.

## Default

- Paling banyak empat referensi per karya. Lebih dari itu, hasilnya kabur.
- Satu referensi, satu peran utama.
- Status hak tiap referensi diambil dari `studio-asset-rights-register`; yang belum terdaftar dianggap `inspiration_only`.

## Pertanyaan bila info penting belum ada

1. "Dari tiap gambar, satu hal apa yang ingin diambil?"
2. "Gambar mana yang milik Anda sendiri?"

## Langkah kerja

1. Daftar referensi beserta status haknya.
2. Tetapkan peran tiap referensi dari enam pilihan: subjek, susunan, palet, tekstur dan bahan, cahaya, suasana.
3. Terapkan batas peran menurut hak:
   - `cleared`: boleh peran apa pun, dan boleh dipakai langsung sebagai gambar masukan alat.
   - `restricted`: seperti `cleared` bila syaratnya terpenuhi dan tercatat.
   - `inspiration_only`: hanya peran lunak (suasana, prinsip susunan seperti "subjek kecil dengan ruang kosong luas", keluarga warna), dituangkan dalam kata. Tidak diunggah ke alat.
   - `unknown` dan `blocked`: tidak dipakai.
4. Beri kekuatan tiap peran 1-3 dan tentukan siapa yang menang bila dua peran berbenturan (misalnya palet lembut melawan cahaya keras).
5. Tulis apa yang sengaja diubah dari tiap referensi luar (minimal dua hal).
6. Tulis pernyataan sintesis: satu paragraf yang menggambarkan karya baru tanpa menyebut referensinya. Bila paragraf itu tidak bisa ditulis tanpa menunjuk satu gambar, penggabungan belum berhasil.
7. Jalankan pemeriksaan anti-tiru (aturan keputusan), tetapkan `rights_status` karya, tulis blok serah terima.

## Aturan keputusan

- Tidak ada referensi luar yang menyumbang lebih dari satu peran utama. Subjek dan susunan dari gambar luar yang sama berarti menyalin.
- Minimal satu peran kuat (subjek atau susunan) berasal dari bahan milik sendiri, pustaka motif studio, atau gagasan baru.
- DNA visual mengalahkan referensi: bila referensi bertentangan dengan aturan tetap, referensi yang menyesuaikan.
- `rights_status` karya mengikuti bahan terlemah yang benar-benar masuk ke alat. Referensi `inspiration_only` yang hanya dituangkan dalam kata tidak menurunkan status, selama aturan di atas dipatuhi dan dicatat.
- Bila pemilik meminta "persis seperti gambar ini" untuk gambar luar: tolak bagian persisnya, tawarkan sifat umum yang bisa diambil.

## Format hasil

```
PETA PERAN  ART-...
| asset_id | Status hak | Peran | Kekuatan | Cara masuk (gambar masukan / kata) | Yang diubah |
Benturan dan pemenang: ...
PERNYATAAN SINTESIS: ...
ANTI-TIRU: [ ] satu peran utama per referensi luar  [ ] ada peran kuat milik sendiri  [ ] dua perubahan per referensi luar
rights_status karya: ...
```

## Pemeriksaan kualitas

- Tiap referensi punya `asset_id`, status, satu peran, dan cara masuk.
- Tiga kotak anti-tiru terisi.
- Pernyataan sintesis tidak menyebut referensi.

## Penanganan kesalahan

- Semua referensi berstatus `inspiration_only`: karya tetap bisa dibuat dari kata, dengan subjek dari pustaka motif atau gagasan baru; sarankan pemilik menambah bahan sendiri.
- Dua referensi menuntut hal berlawanan: pilih satu sebagai pemenang, jangan dicampur setengah-setengah.
- Lembar bacaan tidak ada: minta dibuat dulu, jangan menebak isi gambar.

## Serah terima

`wall-art-composition-director` menerima pernyataan sintesis dan peta peran untuk disusun menjadi rancangan komposisi.

## Batas kemampuan alat

Tidak bisa mengukur kemiripan hasil akhir dengan referensi secara otomatis; pemeriksaan visual setelah gambar jadi tetap perlu.

## Contoh penggunaan

Empat referensi: foto kutilang milik pemilik (cleared, subjek, kekuatan 3, gambar masukan), sketsa daun milik pemilik (cleared, tekstur 2), pin A (inspiration_only, suasana 2, kata), pin B (inspiration_only, prinsip susunan 1, kata). Sintesis: "burung kecil membulat bertengger rendah di bidang gading yang lapang, garis cokelat tidak rata, aksen kuning kunyit".

## Contoh kegagalan dan perbaikannya

Gagal: pin A diberi peran subjek dan susunan sekaligus lalu diunggah sebagai gambar masukan. Perbaikan: pin A hanya suasana lewat kata; subjek dari foto sendiri; karya tidak lagi bergantung pada pin.

## Cara menguji skill ini

Beri tiga referensi: satu foto sendiri dan dua `inspiration_only`, dengan permintaan "ambil susunan dan warnanya dari pin pertama". Hasil benar: pin pertama hanya mendapat satu peran lunak lewat kata, foto sendiri mendapat peran kuat, tiga kotak anti-tiru terisi, dan pernyataan sintesis tidak menyebut pin.
