# VenbeeMail Pro: catatan progres PRD

Catatan kerja untuk rombakan halaman venbeemail.com/pro. PRD lengkapnya ada di skill `prd-venbeemail-pro`. File ini mencatat apa yang sudah diterima dari LO, supaya tidak hilang antar sesi.

## Lampiran gambar yang sudah diterima

Batch 1, diterima 9 Oktober 2026. Semua disimpan di `docs/pro/referensi/`.

| File | Isi | Dipakai untuk |
|---|---|---|
| `01-komposisi-hero-lama.webp` (1376×768) | Komposisi lengkap hero lama: wordmark "BanaMail" origami di atas, maskot pisang zombie memegang kotak surat tabung di atas panggung, 4 monyet origami skateboard (rambut merah, rambut biru muda dengan topi, rambut cokelat, rambut pirang dengan kupluk biru), amplop biru bergambar hantu, pesawat kertas, garis orbit | Acuan susunan dan suasana. Cocok untuk hero A (tulisan di belakang maskot) dan B (orbit surat) |
| `02-latar-panggung.png` (1376×768) | Latar teal gelap dengan sorotan dari atas, panggung bulat biru bermotif bunga putih, pinggiran oranye | Lapisan latar (lapis 1) |
| `03-maskot-pisang-zombie-hijau.webp` (1024×1024) | Maskot pisang zombie di latar hijau #00FF00: kupluk oranye, jaket denim penuh tempelan, memegang kotak surat kardus berlogo pisang biru | Lapisan tokoh (lapis 3). Tubuh, wajah, dan warna tidak boleh diubah |
| `04-wordmark-banamail-lama-hijau.webp` (1376×768) | Wordmark lama "BanaMail" dari kertas origami biru bermotif bunga putih, meneteskan cairan oranye, di latar hijau | Hanya acuan gaya dan warna. Akan diganti wordmark SVG "VENBEEMAIL" |
| `05-monyet-rambut-merah-hijau.webp` (1024×1024) | Monyet origami rambut merah, kemeja flanel merah, kaos bergambar gigi, celana jins, skateboard penuh stiker, di latar hijau | Tokoh yang meluncur di hero dan di bagian Cara kerja |

Catatan teknis:
- Gambar 03, 04, 05 masih berlatar hijau. Sebelum dipakai, latar hijaunya harus dibuang menjadi transparan (chroma key), lalu disimpan sebagai WebP transparan.
- Palet dari gambar: teal gelap `#01232d` sampai `#033141`, sorotan `#35697f`, biru kobalt panggung dan wordmark sekitar `#31458c` sampai `#77a3e4`, oranye `#e7663c`, putih motif bunga. Logo dan wordmark baru memakai palet ini, bukan merah dari referensi "ADVANCED!".

## Masih ditunggu dari LO

Gambar:
- [ ] Referensi huruf: tulisan merah "ADVANCED!" di latar hitam
- [ ] Screenshot referensi gerak Sky Estate
- [ ] Pemisah amplop (latar transparan atau hijau #00FF00)
- [ ] Pemisah tiga monyet lain (rambut biru muda, rambut cokelat, rambut pirang), kalau ingin dipakai
- [ ] Pemisah pesawat kertas (opsional)

Data dan keputusan:
- [ ] Empat data bagian Tentang: nama pendiri, tahun mulai, kota, fitur Claude (atau "tidak ada")
- [ ] Pilihan hero (A sampai E)
- [ ] Hasil cek server (letak file /pro, isi folder aset, `curl -sI https://venbeemail.com/pro/`)
