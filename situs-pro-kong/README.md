# situs-pro-kong: VenbeeMail Pro gaya Kong ("Surat Sampai")

Versi kedua halaman venbeemail.com/pro, dibangun dari PRD `docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md`. Folder `situs-pro/` (PRD pertama) tidak diubah; gambar dan GSAP disalin dari sana.

## Kemajuan

| Fase | Status |
|---|---|
| 0. Persiapan | Selesai: folder, gambar, GSAP, Lenis, font, `isian.json`, cek server, isi /pro lama + inventaris |
| 1. Aset dan bingkai kunci | Selesai: turunan gambar, huruf gunting, font, og.jpg, 11 bingkai kunci + 6 referensi, paket Seedance |
| 2. Kerangka dan Bab 2 | Selesai: `sumber.html` utuh (semua bagian, tampilan diam, ID dan EN), `gaya.css`, `halaman.js`, `rakit.py`, gambar diam dari bingkai kunci. Isi teknis lama persis (`cek_teks_lama.mjs` lolos), 38/38 uji fungsi lolos, muatan awal HP 0,29 MB |
| 3, 4 | Belum |
| 5. Video | Olah web selesai (14 Oktober 2026): film V1-V5 jadi urutan WebP + `film/daftar.json`, loop hero dan sorotan MP4 + WebM + poster, komik 6 panel dan latar panel dari video. Pemutar film dan `<video>` hero/sorotan dipasang di Fase 3 |
| 6 sampai 9 | Belum |

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
| `kerja/` | Berkas antara `alat/olah_video.sh` (tidak di-commit) | Tidak |
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

## Fase 2: kerangka halaman dan Bab 2

Halaman sudah lengkap dalam **tampilan diam**: ini juga tampilan saat kurangi gerakan, saat Save-Data, dan tanpa JavaScript. Gerak (GSAP) menyusul di Fase 3 dan 4 di atas kerangka yang sama.

| Berkas | Isi |
|---|---|
| `sumber.html` | Semua bagian PRD 8.2: menu, hero, film (mode komik 6 panel), kartu penutup bab, Cara kerja, API, Semua endpoint, Domain, Tentang, Penutup, footer maskot (komposisi akhir), kaki halaman. Semua teks `<span lang="id">` + `<span lang="en">` |
| `aset/vbkong/gaya.css` | Semua gaya, kelas `vbk-`. Tanpa huruf atau skrip dari CDN |
| `aset/vbkong/halaman.js` | Bahasa (juga membaca kunci lama `bm-lang`), huruf gunting (memuat `gunting.svg` lalu merakit judul per kata), menu dan lembar HP, salin + cap tersalin, tab, pemeriksa awalan dengan aturan lama, perangko domain, label amplop AW4, cek `/api/health`, kurangi gerakan, tahun berjalan |
| `alat/rakit.py` | `sumber.html` + `isian.json` → `index.html`. Isian kosong dihapus dari HTML. `--pratinjau` menulis `pratinjau.html` (tidak di-commit) dengan tempat isian bertanda kuning |
| `alat/cek_teks_lama.mjs` | Membandingkan 44 teks lama (ID dan EN), 2 curl, 7 endpoint, 4 domain, 5 field dengan `lama/inventaris.json`, huruf demi huruf. 16 kunci lama yang tidak dipakai punya alasan tercatat |
| `alat/uji_halaman.mjs` | 38 uji fungsi di Chromium |
| `alat/ukur_muatan.mjs` | Muatan awal (PRD 16.1) |
| `alat/diam_dari_bingkai.py` | Komik 6 panel, poster hero dan sorotan, latar panel API/Endpoint/Domain dari bingkai kunci (sementara, sampai video ada) |

Catatan isi:

- Ikon sosial: X, Threads, GitHub dari Simple Icons 16.34.0 (CC0); LinkedIn dari Simple Icons 8.15.0 (rilis terakhir yang masih memuatnya, CC0). Semua ikon dihapus dari HTML sampai alamat akunnya diisi di `isian.json`.
- Pemeriksa awalan memakai aturan halaman lama, dengan "huruf" dibaca sebagai huruf Latin A-Z (besar dan kecil). Kalau server menolak huruf besar atau menerima huruf lain, sesuaikan `periksa()` di `halaman.js`.
- Nilai contoh `expiresAt` ditulis `<milidetik epoch>` (halaman lama menyebut satuannya, bukan contoh angkanya). Contoh alamat `qa-signup.62yt8v@kotak.venbeemail.com` diambil dari halaman lama; saat pengunjung mengetik awalan sendiri, akhiran ditulis `<acak>`.
- Favicon `/pro/aset/ikon.png` (absolut) supaya benar di `/pro/` dan `/pro/kong/`.
- Muatan awal (server lokal tanpa gzip, 10 Oktober 2026): HP 390x844 DPR 3: 0,29 MB / 19 berkas; desktop 1440x900 DPR 2: 0,64 MB / 25 berkas.

## Fase 5: video untuk web (PRD 7.7)

Tujuh klip mentah (semua 1920x1080, 24 fps, ada trek audio) diolah dengan satu perintah, aman diulang (sekitar 2 menit):

```bash
situs-pro-kong/alat/olah_video.sh          # film, loop, diam
situs-pro-kong/alat/olah_video.sh loop     # sebagian saja
```

Durasi diubah dengan `setpts` tanpa interpolasi: semua bingkai asli dipakai, hanya jaraknya yang diubah (V3 dan V5 yang diperlambat tetap di atas 12 fps, jadi tidak ada bingkai kembar). Audio dibuang di semua keluaran.

| Klip | Bingkai mentah | Hasil | Desktop 12 fps | HP 10 fps |
|---|---|---|---|---|
| V1 → f1 | 144 (6,00 s) | 5 s | 60 bingkai, 969 KB | 50 bingkai, 544 KB |
| V2 → f2 | 144 (6,00 s) | 5 s | 60, 1149 KB | 50, 639 KB |
| V3 → f3 | 145 (6,04 s; 6,12 s termasuk audio) | 8 s | 96, 1524 KB | 80, 464 KB |
| V4 → f4 | 144 (6,00 s) | 5 s | 60, 853 KB | 50, 380 KB |
| V5 → f5 | 121 (5,04 s; 5,16 s termasuk audio) | 7 s | 84, 1975 KB | 70, 915 KB |
| Jumlah | | 30 s | 360 bingkai, 6,3 MB (PRD: sekitar 14 MB) | 300 bingkai, 2,9 MB (PRD: sekitar 5,5 MB) |

- Potongan HP tepat 405x720 dari tengah, `GESER` 0 untuk semua adegan: subjek tetap di potongan sepanjang klip (dicek dari lembar kontak berkotak potongan). Di f4 sayap pesawat terpotong di kanan pada paruh kedua, amplop dan tempelan hantu tetap utuh. Potongan dibuat di RGB, karena di yuv420p lebarnya dibulatkan menjadi 404.
- `film/daftar.json`: `{"d":{"f1":60,"f2":60,"f3":96,"f4":60,"f5":84,"w":1280,"h":720},"h":{"f1":50,"f2":50,"f3":80,"f4":50,"f5":70,"w":405,"h":720}}`.

| Loop | Potong dan silang | Hasil | 1280 MP4 / WebM | 540 MP4 / WebM | Poster 1280 / 540 |
|---|---|---|---|---|---|
| V0 hero | Bingkai 0-142 (bingkai 143 paling mirip bingkai 0, SSIM 0,983), silang 4 bingkai | 139 bingkai, 5,79 s | 290 / 242 KB (batas 900) | 114 / 136 KB (batas 350) | 19 / 11 KB (batas 60) |
| V6 sorot | Bingkai 0-142, silang 5 bingkai | 138 bingkai, 5,75 s | 267 / 119 KB | 85 / 65 KB | 10 / 5 KB |

- **V0, silang 4 bingkai, bukan 0,5 detik:** bingkai 138-143 berbelok cepat (sekitar 6 derajat dalam 5 bingkai) ke kemiringan bingkai 0. Ini tarikan bingkai akhir Seedance, dan karena itulah bingkai 143 paling mirip bingkai 0. Silang 12 bingkai mencampur amplop tegak (bingkai 131-137) dengan amplop miring (bingkai 0-11), sehingga tepi dan jahitan amplop tampak dobel sekitar 0,25 detik. Tidak ada titik potong lain yang fasenya lebih cocok (dicari di bingkai 96-143 terhadap 12-48). Dengan silang 4 bingkai tidak ada yang dobel, dan sambungan akhir ke awal (SSIM 0,992) lebih halus dari rata-rata antarbingkai klip itu sendiri (0,983). Untuk kembali ke 0,5 detik: ubah `4` menjadi `12` di baris `hero` pada `LOOP` di `olah_video.sh`.
- **V6:** bingkai 138-143 dan 0-8 sama-sama diam (lampu padam, hanya cahaya atas bawaan latar). Silang 5 bingkai seluruhnya jatuh di bagian diam itu dan menghaluskan geseran kecil tepi podium di sambungan (SSIM sambungan 0,996, sama dengan rata-rata antarbingkai).
- Poster = bingkai pertama video hasil loop (V0: bingkai mentah 4; V6: bingkai mentah 5, lampu padam), bukan `KH.png`/`KF.png`, supaya tidak ada loncatan saat video mulai. Potongan HP 540: hero `crop=720:720:280:0` (tengah), sorot `crop=720:720:269:0` (pusat podium x 629).
- Encode sesuai 7.7 (MP4 H.264 High, `-crf 26`/`28`, `+faststart`, level 3.1/3.0; WebM VP9 `-crf 36`/`38`). Semua jauh di bawah target, jadi `-crf` tidak perlu dinaikkan. Satu-satunya tambahan: `-preset slow` juga untuk MP4 540.

**Gambar diam dari video** (menimpa versi bingkai kunci dari `diam_dari_bingkai.py`):

| Berkas | Sumber |
|---|---|
| `film/diam/*/1.webp` | f1 bingkai terakhir (panggung terang, amplop di podium) |
| `film/diam/*/2.webp` | f2 detik 2,2 (pesawat menyambar amplop) |
| `film/diam/*/3.webp` | f3 detik 4 + empat monyet dan amplop dari potongan (`diam_dari_bingkai.py --video`; garis bibir podium di V3 sama dengan K3a, selisih paling banyak 6 piksel) |
| `film/diam/*/4.webp` | f4 detik 2,0 (berguling) |
| `film/diam/*/5.webp` | f5 detik 2,4 (maskot mengangkat kotak surat) |
| `film/diam/*/6.webp` | f5 bingkai terakhir (celah menyala jingga dari videonya sendiri, tanpa cahaya tambahan) |
| `gambar/latar-api.webp`, `-endpoint`, `-domain` | f2 detik 2,5, f4 detik 1, f3 detik 4, `gblur=sigma=14,eq=brightness=-0.12`, kualitas 50 (4-5 KB). Lebih gelap dari versi Fase 2 (terang rata-rata 22-27 dibanding 45-83, karena dulu dikali 0,78), sesuai resep PRD |

**Catatan untuk Fase 3:**

- Sambungan adegan 1 ke 2: akhir V1 lebih dekat (amplop lebih besar dan lebih rendah) daripada awal V2. SSIM 0,77 (cara `cek_klip.sh`) atau 0,84 (YUV), di bawah 0,85, jadi menurut PRD 9.4 sambungan ini juga memakai sapuan kertas.
- Sambungan adegan 2 ke 3 (TR1): akhir V2 adalah amplop memenuhi layar, sesuai rencana.
- Bibir podium di V3 ada di y sekitar 490-515 dari 720 (68-72 persen) dan hampir tidak bergeser sepanjang klip. Ini pegangan untuk `--vbk-garis-lantai`. Di komik, kaki monyet ada di y 545.
- Akhir V5 sudah close-up celah surat yang menyala jingga. Zoom CSS 9.4 (kemajuan 0,94-1,00, pusat sekitar 50 persen, 46 persen) cukup pendek, karena video sudah sampai di celah.

**Ukuran total aset video** (byte sebenarnya): film/d 6,3 MB + film/h 2,9 MB + video/ 1,3 MB (MP4 757 KB, WebM 564 KB, poster 48 KB) + film/diam 238 KB + latar panel 16 KB = **10,8 MB** di server. Yang diunduh satu pengunjung kalau menonton semuanya: HP 3,1 MB (film/h + hero-540.mp4 + sorot-540.mp4), desktop 6,9 MB. WebM hanya cadangan; MP4 ditaruh lebih dulu.

**Muatan awal (PRD 16.1)**, 14 Oktober 2026, `ukur_muatan.mjs`: HP 0,29 MB / 19 berkas, desktop 0,65 MB / 25 berkas. Halaman belum memuat urutan bingkai dan video (pemutarnya Fase 3). Proyeksi HP setelah Fase 3: 0,29 MB + 20 bingkai pertama f1 HP (167 KB, perkiraan PRD 360 KB) + hero-540.mp4 sesudah `load` (114 KB, perkiraan PRD 350 KB) + GSAP dan `gerak.js` (sekitar 76 KB menurut tabel PRD) = sekitar 0,65 MB, di bawah target 1,3 MB dan batas 2,5 MB.

## Hasil cek server (PRD 18.1)

Dicek LO 10 Oktober 2026 (dua kali; blok kedua mencari letak /pro dengan cara lain).

| Hal | Hasil |
|---|---|
| Letak folder /pro | **`/www/wwwroot/banamail-pro/`** (`index.html`, `aset/02-maskot.webp`). Bukan folder bernama `pro`, jadi pencarian PRD awal gagal (`FOLDER_PRO=` kosong). Blok di PRD 18 sudah diubah memakai `PRO=/www/wwwroot/banamail-pro` |
| Pemilik berkas | `www:www` (akar proyek dan `server/`) |
| Cara /pro dilayani | nginx langsung, berkas statis (`server: nginx`, `last-modified: Thu, 08 Oct 2026 03:32:46 GMT`, `etag`, `content-length: 40830`). Tidak ada rute /pro di program Node (`server/`). Situs `venbeemail.com` di nginx: `server_name venbeemail.com www.venbeemail.com; root /www/wwwroot/venbeemail.com;`. Tidak ada `location /pro` atau tulisan `banamail-pro` di `/www/server/panel/vhost/nginx/`, jadi dugaan kuat `/www/wwwroot/venbeemail.com/pro` adalah symlink ke `banamail-pro` (pencarian `find -type d` dan `grep -r` tidak mengikuti symlink). Belum dipastikan |
| Fase 1 Panggung Pos terpasang? | **Tidak** (`vbpro-hero:mulai` 0 kali) |
| Versi Kong terpasang? | Tidak (`vbkong-halaman` 0 kali) |
| Cadangan yang ada | Belum ada (`/www/backup/venbeemail-pro*` kosong) |
| Header `Content-Security-Policy` | **Tidak ada.** Ada `strict-transport-security: max-age=31536000` |
| `/api/health` | 200 |
| Node | `/www/server/nodejs/v24.21.0/bin/node` (v24.21.0), ada di PATH |
| Layanan | `banamail.service` (BanaMail, SMTP :25 + API), aktif sejak 8 Oktober 2026 |
| Disk | 30 GB, terpakai 6 GB, sisa 24 GB |
| Akar proyek | `/www/wwwroot/venbeemail` = salinan git repo ini + `server/` (`data/`, `deploy/`, `.env`, `node_modules/`, `banamail-kantor.zip`) |
| Aset /pro lama | `aset/01-latar.webp`, `02-maskot.webp`, `03-tulisan.webp`, `04-kera-flanel.webp`, `05-kera-kepang.webp`, `06-kera-rompi.webp`, `07-kera-kupluk.webp`, `08-amplop.webp`, `09-pesawat.webp`, `ikon.png` (semua `www:www`, 8 Oktober). Tidak boleh dihapus |
| Situs lain di nginx | `banamail.venbeemail.com.conf`: `server_name banamail.venbeemail.com tempikmail.venbeemail.com pentilmail.venbeemail.com contolmail.venbeemail.com`, `root /www/wwwroot/banamail.venbeemail.com`, `proxy_pass http://127.0.0.1:3000` (program Node) |
| Halaman depan | Belum pasti. Kandidat: `/www/wwwroot/venbeemail.com/index.html` (root situs venbeemail.com) |

## Isi /pro lama (PRD 18.2)

**Diterima** (R2, 10 Oktober 2026): `lama/index.html` dan `lama/inventaris.json`. Lihat `lama/README.md` dan PRD bagian 3.

## Pratinjau lokal

```bash
cd situs-pro-kong && python3 -m http.server 8766
# buka http://localhost:8766/
```
