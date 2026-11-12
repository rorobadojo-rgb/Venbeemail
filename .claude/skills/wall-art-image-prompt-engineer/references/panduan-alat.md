# Panduan Alat Gambar

Alat gambar berubah cepat: nama model, parameter, resolusi, dan syarat lisensi bisa berbeda dari yang tertulis di sini. Perlakukan isi file ini sebagai titik awal, dan selalu cek ke alat atau dokumentasinya sebelum mengandalkan sebuah parameter.

## Prompt inti (netral alat)

Urutan yang dipakai studio, dalam bahasa Inggris:

1. Jenis karya dan teknik tampak: `flat illustration`, `gouache painting`, `linocut print`, `soft watercolor`, `minimal abstract shapes`
2. Subjek: apa, berapa, sedang apa
3. Komposisi: letak fokus, skala, ruang kosong, orientasi
4. Palet: kata palet dari kartu palet
5. Tekstur dan bahan: `subtle paper grain`, `dry brush texture`
6. Cahaya: `soft even light`, `flat lighting, no cast shadows`
7. Suasana: 2-3 kata
8. Batasan: `no frame, no wall, no border, no mat, no text, no letters, no signature, no watermark, no logo`

Kalimat pengunci agar hasil berupa karya datar: `flat artwork filling the entire canvas, edge to edge`.

## Alat yang terhubung langsung (misalnya Higgsfield, Artlist)

Sebelum membuat gambar:

1. Minta daftar model gambar dan kemampuannya kepada alat (banyak alat punya fungsi jelajah model atau konfigurasi model). Pilih model yang mendukung rasio tegak dan resolusi tertinggi.
2. Minta perkiraan biaya atau saldo kredit bila alat menyediakannya, dan tampilkan ke pemilik.
3. Kirim prompt inti. Beberapa alat memisahkan kolom batasan (negative prompt); bila tidak ada, masukkan batasan ke dalam kalimat.
4. Gambar masukan (referensi gaya atau gambar yang diedit) hanya dari bahan berstatus `cleared`.
5. Setelah selesai, ambil ukuran pixel dari file hasil yang sebenarnya.

Fungsi lanjutan yang sering tersedia, bila alatnya punya: memperbesar gambar (upscale), memperluas latar (outpaint), mengubah bingkai rasio (reframe). Pakai untuk kebutuhan cetak, dan catat di catatan generasi.

## Midjourney (dijalankan pemilik sendiri)

Bentuk siap tempel:

```
[prompt inti tanpa bagian batasan] --ar 2:3 --no frame, wall, border, text, signature, watermark
```

- `--ar` mengatur rasio; `--no` berisi hal yang tidak diinginkan.
- Parameter lain (versi model, gaya, tingkat stilisasi, referensi gaya) berubah antarversi: cek dokumentasi Midjourney saat itu sebelum ditambahkan.
- Jangan memakai nama seniman atau fitur referensi gaya dengan gambar orang lain.
- Hak pakai komersial bergantung pada paket langganan: minta pemilik mencatat paketnya di register hak.

## Alat lain

Pakai prompt inti. Tanyakan kepada pemilik: rasio apa yang didukung, resolusi keluaran berapa, ada tidaknya kolom batasan, dan syarat pemakaian komersialnya.

## Prompt perbaikan (edit)

```
Keep everything else unchanged. In the [lokasi], change [apa] to [menjadi apa]. Preserve the palette, linework, and paper texture.
```

Satu perbaikan per putaran. Bila alat mendukung penyuntingan bagian tertentu (inpaint), tandai bagiannya saja.

## Yang selalu dicatat

Alat, model, tanggal, prompt lengkap, pengaturan, paket langganan saat itu, nama file hasil, ukuran pixel, dan faktor pembesaran bila ada.
