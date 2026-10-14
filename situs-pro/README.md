# situs-pro: halaman venbeemail.com/pro

Rombakan halaman /pro sesuai PRD di `docs/pro/prd-venbeemail-pro/SKILL.md`.
Sekarang berisi **Fase 1: hero "Panggung Pos" dan menu pil kaca** (K1 F, K2 L3 + L4 L5 L7 L9, K3 Tingkat 1 dan 2).

## Isi folder

| Berkas | Guna |
|---|---|
| `index.html` | Pratinjau. Tiga blok bertanda komentar `vbpro-kepala`, `vbpro-hero`, `vbpro-skrip` adalah bagian yang dipasang ke server. Sisanya (`pratinjau.css`, bagian `data-pratinjau`) hanya untuk pratinjau. |
| `aset/vbpro/hero.css`, `hero.js` | Gaya dan gerak hero. Semua kelas berawalan `vbp-` supaya tidak bentrok dengan halaman lama. |
| `aset/vbpro/js/` | GSAP 3.13.0, ScrollTrigger, MotionPathPlugin, disimpan lokal (aman dari CSP, tidak bergantung CDN). Dimuat hanya kalau halaman belum memuat GSAP. |
| `aset/vbpro/gambar/` | Gambar hasil olahan dari `docs/pro/referensi/`: latar hijau dibuang, tepi di-despill, versi 512 untuk HP, versi buram untuk lapisan jauh, maskot dipotong jadi badan dan kotak surat. |
| `alat/olah_aset.py` | Membuat ulang semua gambar: `python3 situs-pro/alat/olah_aset.py` (Pillow, NumPy, SciPy). |
| `pasang/sisipkan.js` | Menyisipkan tiga blok ke `index.html` lama di server. Aman diulang. `--cek` hanya memeriksa. |
| `pasang/pasang.sh`, `pasang/kembalikan.sh` | Blok perintah untuk terminal aaPanel: pasang dengan cadangan, dan kembalikan ke halaman sebelum pemasangan pertama. |

## Cara Fase 1 dipasang

Kode halaman /pro lama hanya ada di server, dan isinya belum bisa diambil dari lingkungan ini. Supaya isi teknis lama (tujuh endpoint, empat domain, dua contoh curl, kontak) tetap persis, Fase 1 **tidak mengganti** halaman lama. `pasang.sh`:

1. mencari folder /pro di `/www/wwwroot/venbeemail` (harus berisi `index.html` dan `aset/02-maskot.webp`), berhenti kalau tidak ketemu;
2. mengunduh branch ini dari GitHub dan menjalankan `sisipkan.js --cek`;
3. mencadangkan seluruh folder /pro ke `/www/backup/venbeemail-pro/pro-<waktu>`;
4. menyalin `aset/vbpro/` ke folder /pro dan menyisipkan tiga blok ke `index.html` (pemilik berkas ikut berkas lama);
5. memeriksa halaman, `hero.js`, `hero.css`, dan satu gambar lewat https. Kalau hero belum terbaca, `banamail` dimulai ulang sekali. Kalau aset tidak terbaca, folder lama dikembalikan otomatis.

Selain menyisipkan blok, `sisipkan.js` hanya mengganti nama "BanaMail Pro" menjadi "VenbeeMail Pro" di `<title>`, `og:title`, dan `twitter:title`. Isi `<body>` lama diperiksa tetap utuh sebelum ditulis.

Di browser, `hero.js` lalu:

- menyembunyikan (tidak menghapus) kepala/menu lama dan hero lama (bagian yang memuat `01-latar`, `02-maskot`, `03-tulisan`). Bagian yang memuat `pre`, `code`, tabel, formulir, `/api/`, `curl`, atau domain venbeemail tidak pernah disembunyikan;
- mengarahkan menu Cara kerja, API, Domain ke bagian yang cocok di halaman lama (dari tautan menu lama atau judul bagian). Menu Tentang muncul sendiri setelah bagian `#tentang` ada (Fase 3);
- menyalin contoh curl pertama di halaman lama ke kartu di hero. Kalau tidak ada, kartu menampilkan `POST /api/addresses`;
- menyelaraskan tombol ID/EN dengan tombol bahasa halaman lama, dua arah.

## Hero F "Panggung Pos"

- Intro di bawah 1 detik: layar gelap, sorotan menyala, huruf terlipat terbuka satu per satu (L5), tokoh muncul. Berhenti kalau pengunjung langsung menggulir.
- Hero ditahan 220 persen tinggi layar (desktop) atau 140 persen (HP), dengan scrub 0,7:
  - 0 sampai 25 persen: kamera maju (latar 8, wordmark 4, maskot 15 persen), sorotan makin terang, cahaya menyapu maskot dan kilau holografik menyapu huruf;
  - 25 sampai 50 persen: monyet melesat keluar dengan jejak bayangan dan garis kecepatan, monyet merah berhenti di tepi bawah;
  - 50 sampai 75 persen: cincin amplop berputar, satu amplop maju, tutupnya terbuka, kartu contoh curl naik;
  - 75 sampai 100 persen: tiap huruf terbang ke huruf yang sama di logo menu (L9), maskot mundur ke kanan, kartu menetap.
- Maskot: bernapas, bergoyang menahan beban, berkedip (kelopak SVG), miring mengikuti kursor, sapuan cahaya, cahaya tepi, bayangan kontak, pantulan lantai, reaksi ketuk dengan amplop meloncat dari celah, terhuyung saat gulir cepat. Kotak surat dan tangan bergerak terpisah (Tingkat 2). Tubuh, wajah, dan warna tidak diubah.
- Huruf B: dua lubang B menjadi mata, dibaca menyamping seperti emotikon `:)`. Tiap ditekan berganti kedip, melirik, nyengir, menjulurkan lidah. Berkedip sendiri, mata mengikuti kursor, tidur dengan "z" setelah 20 detik diam, kaget saat gulir sangat cepat. Huruf B di logo adalah tombol asli dengan label (bisa dengan keyboard).
- HP: wordmark dua baris, dua monyet (merah dan biru), enam amplop, tanpa serpihan kertas.
- "Kurangi gerakan": tanpa intro, tanpa penahanan, tanpa gerak berulang. Semua isi tetap tampil.

Muatan awal yang diukur dengan Chromium: sekitar 0,6 MB di HP, 0,7 MB di desktop.

## Pratinjau lokal

```bash
cd situs-pro && python3 -m http.server 8765
# buka http://localhost:8765/
```
