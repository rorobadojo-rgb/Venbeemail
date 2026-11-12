# Rasio, Ukuran Cetak, dan PPI

## Istilah

- Rasio: perbandingan lebar dan tinggi. 2:3 berarti tiap 2 bagian lebar ada 3 bagian tinggi. Bingkai 8x12 dan 24x36 inci sama-sama 2:3, jadi satu file bisa dipakai untuk keduanya.
- Pixel: titik gambar. File 7200x10800 berarti 7200 titik ke samping dan 10800 titik ke bawah.
- PPI (pixel per inch): pixel dibagi inci ukuran cetak. File 7200 pixel dicetak selebar 24 inci menghasilkan 300 PPI. DPI sering dipakai untuk maksud yang sama pada file gambar.
- Upscale (pembesaran): menambah jumlah pixel dengan alat. Menambah pixel, tidak selalu menambah detail.

## Lima rasio yang lazim untuk unduhan cetak

Kebiasaan penjual cetakan digital untuk pasar AS dan internasional. Ini kebiasaan, bukan aturan Etsy.

| Rasio | Ukuran yang tercakup (inci) | Pixel untuk ukuran terbesar pada 300 PPI |
|---|---|---|
| 2:3 | 4x6, 8x12, 12x18, 16x24, 20x30, 24x36 | 7200 x 10800 |
| 3:4 | 6x8, 9x12, 12x16, 18x24 | 5400 x 7200 |
| 4:5 | 4x5, 8x10, 16x20 | 4800 x 6000 |
| 11:14 | 11x14 | 3300 x 4200 |
| Seri A | A5, A4, A3, A2, A1 (ukuran internasional, dalam mm) | 7016 x 9933 untuk A1 |

Tambahan opsional: 5:7 (5x7 inci, 1500 x 2100 pixel), lazim untuk bingkai kecil dan kartu.

## Patokan PPI

Patokan umum percetakan, bukan jaminan mutu:

| PPI pada ukuran cetak | Arti praktis |
|---|---|
| 300 atau lebih | Tajam dilihat dari dekat. Target studio. |
| 200-299 | Umumnya masih baik untuk poster. |
| 150-199 | Layak untuk karya besar yang dilihat dari jarak beberapa langkah. |
| di bawah 150 | Pixel atau keburaman mulai terlihat. Tidak diklaim. |

Mutu akhir juga bergantung pada printer, kertas, dan jenis gambar. Karya bergaris halus lebih menuntut daripada karya abstrak lembut.

## Dari mana resolusi master didapat

- Alat gambar AI sering menghasilkan sisi panjang 1024-4096 pixel. Itu belum cukup untuk 24x36 pada 300 PPI, yang butuh 10800 pixel.
- Jalur yang biasa: buat pada resolusi tertinggi alat, perbesar dengan fitur upscale alat, periksa cacat lagi, baru hitung ulang.
- Hitung kebutuhan sebelum membuat gambar: sisi panjang yang dibutuhkan = inci sisi panjang ukuran terbesar x target PPI.

## Menjalankan penghitung

```
python3 scripts/print_math.py --width 7200 --height 10800
python3 scripts/print_math.py --image master.png --focus 0.5,0.6 --json rencana-cetak.json
python3 scripts/print_math.py --width 4096 --height 6144 --ratios 2x3,4x5,5x7 --ppi 300 --min-ppi 150
```

Pilihan rasio: `2x3`, `3x4`, `4x5`, `11x14`, `iso`, `5x7`.
