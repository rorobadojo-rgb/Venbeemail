# situs-pro-kong: VenbeeMail Pro gaya Kong ("Surat Sampai")

Versi kedua halaman venbeemail.com/pro, dibangun dari PRD `docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md`. Folder `situs-pro/` (PRD pertama) tidak diubah; gambar dan GSAP disalin dari sana.

## Kemajuan

| Fase | Status |
|---|---|
| 0. Persiapan | Selesai: folder, gambar, GSAP, Lenis, font, `isian.json`. Menunggu hasil cek server (R1) dan isi /pro lama (R2) |
| 1. Aset dan bingkai kunci | Selesai: turunan gambar, huruf gunting, font, og.jpg, 11 bingkai kunci + 6 referensi, paket Seedance |
| 2 sampai 9 | Belum |

## Isi folder

| Berkas | Guna | Dipasang ke server? |
|---|---|---|
| `sumber.html` | Sumber halaman yang diedit (Fase 2). **Jangan edit `index.html` langsung** | Tidak |
| `index.html` | Hasil `alat/rakit.py` dari `sumber.html` + `isian.json` | Ya |
| `isian.json` | Data dari LO: tahun, kota, cerita, fitur Claude, akun sosial (PRD 13.1). Kosong berarti tidak tampil | Tidak (dirakit ke `index.html`) |
| `aset/vbkong/` | Semua gaya, skrip, huruf, gambar, film, video | Ya |
| `aset/vbkong/js/` | GSAP 3.13.0, ScrollTrigger, MotionPathPlugin (disalin dari `situs-pro/aset/vbpro/js/`), Lenis 1.3.26 (`lenis.min.js` dari npm) | Ya |
| `aset/vbkong/font/` | Archivo 500/700/900 dan JetBrains Mono 500, subset Latin WOFF2 dari paket Fontsource 5.3.0, lisensi OFL (berkas LICENSE ikut) | Ya |
| `aset/vbkong/gambar/` | Potongan dari `situs-pro/aset/vbpro/gambar/` (disalin apa adanya) + turunan baru dari `alat/olah_aset_kong.py` | Ya |
| `seedance/bingkai/` | Bingkai kunci 1280x720 untuk Seedance (repo publik, bisa diambil lewat URL raw GitHub) | Tidak |
| `seedance/sumber/` | Aset resolusi asli untuk bingkai kunci | Tidak |
| `video-mentah/` | Hasil Seedance dari LO (R11) | Tidak |
| `lama/` | Salinan /pro lama dan inventarisnya (R2) | Tidak |
| `alat/` | Alat olah gambar, huruf gunting, bingkai kunci, video, rakit | Tidak |
| `pasang/` | Alat pasang dan kembalikan (Fase 7) | Dipakai dari unduhan, tidak disalin ke /pro |

## Fase 1: aset dan bingkai kunci

Urutan menjalankan ulang (dari akar repo, butuh Pillow, NumPy, SciPy):

```bash
python3 situs-pro-kong/alat/huruf_gunting.py      # aset/vbkong/gunting.svg (50 simbol, sekitar 14 KB)
python3 situs-pro-kong/alat/olah_aset_kong.py     # turunan gambar + og.jpg + ukuran-kong.json
python3 situs-pro-kong/alat/bingkai_kunci.py      # seedance/bingkai/*.png + lembar-bingkai.jpg
```

| Hasil | Isi |
|---|---|
| `aset/vbkong/gunting.svg` | Sprite huruf gunting A-Z, 0-9, `. , ! ? - / : @ · # & '`, plus pola isian `vbk-p-kertas`, `vbk-p-flanel`, `vbk-p-kardus`, `vbk-p-bunga`. Simbol `g-A`, `g-E2`, `g-titik`, dan seterusnya, dengan `data-w`, `data-miring`, `data-naik`. Bentuk V, E, N, B, M, A, I, L dari `situs-pro/aset/vbpro/hero.js`. Huruf E bergantian `E`, `E2`, `E3` |
| `gambar/maskot-kotak-panjang*.webp` | Kotak surat dengan ekor lengan 40 piksel (304 piksel tinggi) |
| `gambar/maskot-bayang*.webp` | Bayangan maskot, ruang 40 piksel di tiap sisi (656x1035) |
| `gambar/podium-bibir*.webp` | Pinggiran depan podium x 420-935, y 645-700 dari latar (kiri 30,52 %, lebar 37,43 %, atas 83,98 %, tinggi 7,16 %) |
| `gambar/podium-lubang.svg` | Pintu lift |
| `gambar/monyet-*-tepi.webp` | Cahaya tepi tiap monyet |
| `gambar/perangko-monyet-*.webp` | Kepala tiap monyet 160x160 |
| `gambar/og.jpg` | Kartu bagikan 1200x630 (88 KB) |
| `gambar/ukuran-kong.json` | `kaki_bawah` 943, `celah` [250,5, 63,3], mata, ukuran bayangan dan bibir |
| `seedance/sumber/*-besar.png` | Maskot, amplop, pesawat, empat monyet resolusi asli tanpa kompresi |
| `seedance/bingkai/` | KH, K0, K1, K2, K3a, K3b, K4, K4b, K5, K6, KF (1280x720), ref-1 sampai ref-6, `lembar-bingkai.jpg` |
| `seedance/PAKET-SEEDANCE.md` | Prompt, setelan, urutan, tautan bingkai |

## Hasil cek server (PRD 18.1)

**Sebagian** (R1, 10 Oktober 2026). Percobaan pertama: `/www/wwwroot/venbeemail` berisi salinan git repo ini (`app`, `components`, `public`, `scripts`, `.git`, dan seterusnya) ditambah folder `server/` dan `banamail-kantor.zip`, pemilik `www:www`. Pencarian folder /pro (folder bernama `pro` berisi `index.html` dan `aset/02-maskot.webp`) **tidak menemukan apa pun** (`FOLDER_PRO=` kosong), jadi letak /pro harus dicari dengan cara lain. Sisa keluaran belum terbaca.

| Hal | Hasil |
|---|---|
| Letak folder /pro | |
| Pemilik berkas | `www:www` (akar proyek) |
| Fase 1 Panggung Pos terpasang? | |
| Versi Kong terpasang? | |
| Cadangan yang ada | |
| Header `Content-Security-Policy` | |
| Cara Node melayani /pro | |
| Letak halaman depan | |
| `/api/health` | |
| Node, layanan `banamail`, sisa disk | |

## Isi /pro lama (PRD 18.2)

**Menunggu** (R2). `venbeemail.com` diblokir dari lingkungan Claude Code (10 Oktober 2026). Lihat `lama/README.md`.

## Pratinjau lokal

```bash
cd situs-pro-kong && python3 -m http.server 8766
# buka http://localhost:8766/
```
