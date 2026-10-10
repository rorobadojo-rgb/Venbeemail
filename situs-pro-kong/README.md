# situs-pro-kong: VenbeeMail Pro gaya Kong ("Surat Sampai")

Versi kedua halaman venbeemail.com/pro, dibangun dari PRD `docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md`. Folder `situs-pro/` (PRD pertama) tidak diubah; gambar dan GSAP disalin dari sana.

## Kemajuan

| Fase | Status |
|---|---|
| 0. Persiapan | Selesai: folder, gambar, GSAP, Lenis, font, `isian.json`. Menunggu hasil cek server (R1) dan isi /pro lama (R2) |
| 1. Aset dan bingkai kunci | Lihat bagian "Fase 1" di bawah |
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

## Hasil cek server (PRD 18.1)

**Menunggu LO** (R1). Setelah LO menempel hasilnya, catat di sini:

| Hal | Hasil |
|---|---|
| Letak folder /pro | |
| Pemilik berkas | |
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
