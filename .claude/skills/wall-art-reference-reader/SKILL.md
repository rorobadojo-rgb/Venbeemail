---
name: wall-art-reference-reader
description: Membaca gambar referensi secara terstruktur, yaitu komposisi, palet, tekstur, pencahayaan, motif, dan karakter, lalu menemukan benang merah antarbeberapa referensi. Pakai saat pemilik mengirim foto sendiri, gambar buatan sendiri, hasil AI, atau gambar dari Pinterest dan berkata "saya suka yang seperti ini", "baca gaya gambar ini", "apa yang bikin ini bagus?", "ambil nuansanya", atau ingin merumuskan gaya studio dari kumpulan contoh. Menghasilkan lembar bacaan per gambar dan ringkasan pola. Jangan dipakai untuk menentukan aturan gaya studio atau menyalin sebuah gambar.
---

# wall-art-reference-reader

Mengubah "saya suka ini" menjadi kata-kata yang bisa dipakai ulang. Skill ini hanya mengamati; ia tidak memutuskan gaya studio dan tidak membuat karya.

Sebelum mulai, baca `references/studio-core.md`. Lembar bacaan: `assets/lembar-bacaan-referensi.md`. Pengukur warna: `scripts/extract_palette.py`.

## Kapan digunakan

- Ada gambar referensi baru.
- Akan merumuskan atau memperbarui DNA visual.
- Sebuah karya akan dibuat dari beberapa referensi.

## Kapan tidak digunakan

- Memutuskan aturan gaya (`wall-art-visual-dna-builder`).
- Menetapkan peran referensi dalam satu karya (`wall-art-reference-fusion-director`).
- Memeriksa cacat gambar jadi.

## Input

- Wajib: satu atau lebih gambar yang bisa dilihat (file atau unggahan).
- Opsional: kata pemilik tentang apa yang disukai, status hak tiap gambar.

## Default

- Tiap gambar didaftarkan dulu ke `studio-asset-rights-register`. Gambar tanpa keterangan asal dianggap `inspiration_only`.
- Pola hanya disimpulkan bila ada minimal tiga gambar.
- Warna diukur dengan skrip bila file tersedia; bila tidak, warna ditulis dengan nama dan diberi tanda "perkiraan mata".

## Pertanyaan bila info penting belum ada

1. "Dari gambar ini, apa yang paling Anda suka: warnanya, susunannya, teksturnya, atau subjeknya?"
2. "Gambar ini buatan Anda, hasil AI Anda, atau dari tempat lain?"

## Langkah kerja

1. Daftarkan tiap gambar dan catat `asset_id` serta status haknya.
2. Bila file ada di sistem file, jalankan `python3 scripts/extract_palette.py <gambar> --colors 6` untuk mendapat warna dominan (hex dan persentase). Ini PENGAMATAN terukur.
3. Isi lembar bacaan per gambar pada enam aspek:
   - Komposisi: orientasi, letak titik fokus (pakai sembilan petak: kiri atas sampai kanan bawah), keseimbangan, porsi ruang kosong.
   - Palet: 4-6 warna, suhu (hangat atau dingin), kejenuhan, rentang terang gelap.
   - Tekstur dan bahan: rata, berbutir, goresan kuas, serat kertas, dan seberapa kuat.
   - Pencahayaan: arah, keras atau lembut, kontras.
   - Motif: subjek, bentuk yang berulang, tingkat penyederhanaan.
   - Karakter: tiga kata suasana.
4. Pisahkan yang khas dari gambar itu dan yang umum di genrenya.
5. Untuk gambar `inspiration_only`, catat sifat umum saja. Jangan menulis susunan rinci yang bisa dipakai menyalin ulang gambar tersebut, dan jangan mencatat nama pembuatnya sebagai kata gaya.
6. Bila ada tiga gambar atau lebih, buat ringkasan pola: sifat yang muncul di sebagian besar gambar, sifat yang saling bertentangan, dan dugaan apa yang sebenarnya disukai pemilik (HIPOTESIS, minta konfirmasi).

## Aturan keputusan

- Yang ditulis adalah PENGAMATAN. Tafsiran selera pemilik berlabel HIPOTESIS sampai dikonfirmasi.
- Karya dan foto milik pemilik diberi bobot lebih besar daripada referensi luar saat menyimpulkan pola, karena itulah yang paling aman menjadi dasar identitas.
- Bila kata pemilik dan pengamatan berbeda (pemilik bilang suka warnanya, padahal yang konsisten adalah susunannya), tampilkan keduanya.
- Skill ini memiliki bacaan referensi; aturan studio dimiliki pembangun DNA.

## Format hasil

Lembar bacaan terisi per gambar, lalu:

```
RINGKASAN POLA  (N gambar: x milik sendiri, y inspirasi)
Muncul di sebagian besar: ...
Bertentangan: ...
HIPOTESIS selera pemilik: ...  (menunggu konfirmasi)
```

## Pemeriksaan kualitas

- Tiap gambar punya `asset_id` dan status hak.
- Warna terukur dibedakan dari perkiraan mata.
- Tidak ada nama seniman atau merek sebagai deskripsi gaya.
- Pola tidak disimpulkan dari kurang dari tiga gambar.

## Penanganan kesalahan

- Gambar tidak bisa dilihat (hanya tautan yang tidak terbuka): minta unggah; jangan membaca dari nama file atau ingatan.
- Gambar sangat kecil atau buram: baca komposisi dan warna saja, tandai tekstur "tidak terbaca".
- Skrip gagal karena Pillow tidak ada: lanjut dengan perkiraan mata dan katakan demikian.

## Serah terima

- `wall-art-visual-dna-builder` memakai ringkasan pola untuk merumuskan aturan studio.
- `wall-art-reference-fusion-director` memakai lembar bacaan untuk menetapkan peran referensi dalam satu karya.

## Batas kemampuan alat

Membaca hanya gambar yang benar-benar terlihat. Tidak bisa memastikan siapa pembuat gambar. Warna di layar bisa berbeda dari file aslinya bila gambar dikompres.

## Contoh penggunaan

Pemilik mengirim 3 foto burung milik sendiri dan 4 pin. Hasil: 7 lembar bacaan; pola "latar polos terang, subjek di tengah agak ke bawah, palet tanah dengan satu aksen hijau"; HIPOTESIS: pemilik menyukai ketenangan latar, bukan jenis burungnya.

## Contoh kegagalan dan perbaikannya

Gagal: bacaan berbunyi "gaya ala [nama ilustrator terkenal]". Perbaikan: ganti dengan sifat yang terlihat ("garis tipis tidak rata, warna cat air pudar, bentuk disederhanakan") tanpa nama.

## Cara menguji skill ini

1. Jalankan `python3 scripts/extract_palette.py --self-test`. Hasil benar: `SELF-TEST OK`.
2. Beri dua gambar saja dan minta "simpulkan gayaku". Hasil benar: dua lembar bacaan lengkap, dan pernyataan bahwa pola belum bisa disimpulkan dari dua gambar.
