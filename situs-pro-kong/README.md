# situs-pro-kong: VenbeeMail Pro gaya Kong ("Surat Sampai")

Versi kedua halaman venbeemail.com/pro, dibangun dari PRD `docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md`. Folder `situs-pro/` (PRD pertama) tidak diubah; gambar dan GSAP disalin dari sana.

## Kemajuan

| Fase | Status |
|---|---|
| 0. Persiapan | Selesai: folder, gambar, GSAP, Lenis, font, `isian.json`, cek server, isi /pro lama + inventaris |
| 1. Aset dan bingkai kunci | Selesai: turunan gambar, huruf gunting, font, og.jpg, 11 bingkai kunci + 6 referensi, paket Seedance |
| 2. Kerangka dan Bab 2 | Selesai: `sumber.html` utuh (semua bagian, tampilan diam, ID dan EN), `gaya.css`, `halaman.js`, `rakit.py`, gambar diam dari bingkai kunci. Isi teknis lama persis (`cek_teks_lama.mjs` lolos), 38/38 uji fungsi lolos, muatan awal HP 0,29 MB |
| 3. Pembuka dan film | Selesai (14 Oktober 2026): layar muat, intro dan scrub hero, video hero + tombol jeda, wajah huruf B, film canvas dari urutan bingkai, estafet monyet, sambungan antaradegan, garis rute, Lewati film, kartu penutup bab. 59/59 uji fungsi, muatan awal HP 0,93 MB |
| 4. Akhir halaman | Selesai (14 Oktober 2026): gerak Tentang, Penutup (pin 200 persen), footer maskot FT1 (pin 160/130 persen, lift, pesawat, amplop ke celah, diam yang hidup, ketuk kotak), video sorotan V6 malas dengan tombol jeda. 75/75 uji fungsi, muatan awal HP 0,96 MB |
| 5. Video | Olah web selesai (14 Oktober 2026): film V1-V5 jadi urutan WebP + `film/daftar.json`, loop hero dan sorotan MP4 + WebM + poster, komik 6 panel dan latar panel dari video. Pemutar film dan `<video>` hero/sorotan dipasang di Fase 3 |
| 6. Periksa | Sebagian (14 Oktober 2026): gerak Bab 2, `pasang/siapkan.js`, audit aksesibilitas (axe-core tanpa pelanggaran), area sentuh 44 piksel, fokus keyboard, 83/83 uji. Tinggal uji Safari iPhone asli dan pratinjau untuk LO |
| 7 sampai 9 | Belum |

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
| `pasang/` | `siapkan.js` (cek + siapkan untuk pasang, PRD 18.3); alat pasang dan kembalikan menyusul di Fase 7 | Dipakai dari unduhan, tidak disalin ke /pro |

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
| `aset/vbkong/gerak.js` | Semua gerak GSAP (Fase 3): Lenis, hero, pemutar film, estafet, sambungan, garis rute, Lewati film, kartu bab. Dimuat `halaman.js` hanya kalau gerak diizinkan |
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

## Fase 3: pembuka dan film

Gerak dipasang di atas tampilan diam Fase 2. Tanpa JavaScript, saat kurangi gerakan, atau saat Save-Data, halaman tetap tampilan diam: GSAP, `gerak.js`, video, dan layar muat tidak dimuat sama sekali. Kalau GSAP gagal dimuat, halaman kembali ke tampilan diam.

| Bagian | Isi |
|---|---|
| Skrip kecil di `<head>` (`sumber.html`) | Sebelum CSS: memasang `vbk-gerak` (gambar komik tidak diunduh), `vbk-tunggu` (teks hero ditahan sampai intro), dan `vbk-muat` (layar muat, kunjungan pertama per sesi tanpa jangkar) |
| Layar muat (8.5) | Logo gunting + lencana PRO, bilah yang menghitung 24 berkas (gunting.svg, Archivo 700 dan 900, poster hero, 20 bingkai pertama adegan 1), paling lama 1,2 detik, bisa dilewati (ketuk, Esc, gulir). Baris `GET /api/health` berubah jadi "menjawab" kalau 2xx, memudar tanpa tulisan kalau gagal |
| Hero (8.7) | Intro 0,8 detik (huruf ditempel satu per satu, PRO dihentakkan, teks naik), langsung selesai kalau pengunjung menggulir. Saat keluar: wordmark naik dan mengecil, video membesar dan menggelap ke kecerahan 0,35, teks memudar, tirai `#00141a` di 85-100 persen |
| Video hero (8.7, 10.5) | Dibuat sesudah event `load` (`halaman.js`), 540 untuk lebar 720 ke bawah, MP4 lalu WebM dengan codec ditulis lengkap (browser tanpa H.264 tidak mengunduh MP4), dijeda saat hero tidak terlihat. Tombol "Jeda video" / "Putar video", pilihan disimpan di `localStorage`. `window.VBK_VIDEO.pasang()` dan `.tombolJeda()` siap dipakai Penutup (Fase 4) |
| Wajah huruf B (8.6, 8.7) | Dua lubang huruf B gunting jadi mata (seperti PRD pertama), mulut di kanan; empat wajah (senyum, nyengir, lidah, kaget) bergantian saat tombol B ditekan (logo dan wordmark hero). Berkedip tiap 3-6 detik dan mata melirik kursor, hanya saat gerak diizinkan |
| Film (9.1, 9.2) | Canvas `cover` di-pin `+=600%` (HP `+=450%`), `scrub: 0.5`, bobot adegan 5/5/12/5/7. Membaca `film/daftar.json`, set `h` di lebar 720 ke bawah. Memuat per adegan (adegan yang dilihat + satu di depan, 6 unduhan bersamaan), HP melepas adegan yang sudah lewat dua adegan, koneksi 2g/3g hanya setiap bingkai kedua. Campuran dua bingkai hanya selama bergerak; saat gulir berhenti digambar bingkai terdekat (campuran diam tampak dobel). Bingkai belum datang: bingkai terdekat, lalu `film/diam`. Tanpa `daftar.json`: gambar diam per adegan dengan zoom pelan. Adegan 3: latar melambat di q 0,48-0,80 |
| Estafet monyet (9.3) | Empat potongan (desktop ukuran penuh 34svh, HP versi 512 22svh) dengan cahaya tepi, bayangan lantai, jejak bayangan (2 di HP), miring saat melesat; amplop dengan busur MotionPath. Garis roda = garis bibir podium V3 (y 545 dari 720) dihitung dari pemetaan cover dan disimpan di `--vbk-garis-lantai`. HP: paling banyak dua monyet terlihat. Monyet baru dimuat saat adegan 2 tercapai |
| Sambungan (9.4) | 1→2 sapuan kertas (SSIM V1→V2 di bawah 0,85), 2→3 amplop menutup layar lalu mengecil ke tangan merah, 3→4 sapuan kertas, 4→5 TR1 versi CSS dari letak amplop di akhir V4, akhir adegan 5 zoom 1,8 ke celah (46 %, 44 %), vinyet, berkas cahaya hangat, lalu `#00141a` |
| Garis rute dan Lewati film (9.5) | Desktop di bawah tengah, HP tegak di kanan dengan label titik aktif saja. Kelas `vbk-frute` (nama `vbk-rute` sudah dipakai garis rute footer). Tombol Lewati film tampil selama film di-pin, ke `#bab-2` (Lenis di desktop) dan memindah fokus ke sana. Menu turun ke opacity 0,55 selama film |
| Kartu penutup bab (9.7) | Cap dihentakkan (skala 1,4 ke 1, -14 ke -8 derajat, 0,35 detik), isi kartu bergetar 2 piksel 150 ms, baris mono dan label menyusul. Desktop di-pin 60 persen |
| Lenis | Desktop dengan mouse saja, disambung ke ScrollTrigger; tautan `#` digulir halus |

Uji (`alat/uji_halaman.mjs`, sekarang 59 uji, 21 di antaranya untuk Fase 3): layar muat dan sesi, intro, video dan tombol jeda, wajah B, pin 600/450 persen, canvas menggambar adegan 3, garis rute, estafet, menu redup, Lewati film, cap kartu bab, set bingkai `h` di HP, paling banyak dua monyet di HP, tanpa gulir menyamping di tengah film, dan kurangi gerakan tanpa GSAP/video/layar muat.

Muatan awal (14 Oktober 2026, `ukur_muatan.mjs`): **HP 0,93 MB / 44 berkas** (target 1,3 MB, batas 2,5 MB), **desktop 1,18 MB / 46 berkas** (batas 3 MB). Termasuk video hero 540/1280 setelah `load`, GSAP + ScrollTrigger + MotionPath, `gerak.js`, dan 20 bingkai pertama. Di Chromium uji (tanpa H.264) yang termuat versi WebM; di Safari dan Chrome biasa versi MP4 yang lebih kecil. Tiga potongan monyet 512 di daftar HP berasal dari kartu Cara kerja (sebelum ruang pin film dipasang, kartu itu masuk jangkauan muat malas browser).

Belum dikerjakan atau berbeda dari PRD:

- Urutan fokus tombol Lewati film "tepat setelah tautan terakhir di menu" belum diatur; tombol ada di dalam bagian film.
- Wajah huruf B dibuat ulang lebih sederhana (bentuk B gunting berbeda dari B PRD pertama).
- Kalimat 2 hero tetap teks halaman lama (keputusan Fase 2).
- Uji Safari iPhone asli (16.5) masuk Fase 6.

## Fase 6: periksa

**Gerak Bab 2 (PRD 11)** yang belum dikerjakan di fase lain, sekarang di `gerak.js` (`bab2()`):

| Bagian | Gerak |
|---|---|
| Judul Bab 2 | Huruf gunting ditempel satu per satu saat bagian masuk 80 persen layar (sekali) |
| Cara kerja | Desktop: empat kartu bertumpuk di satu sel, di-pin `+=300%`; kartu 2-4 naik dari bawah, kartu di bawahnya mengecil, naik sedikit, dan menggelap (`--gelap`), monyetnya melompat saat kartunya mendarat. HP: kartu `position: sticky` (kartu berikut menutupi yang sebelumnya), monyet melompat sekali |
| API | Tiket naik dari 60 px dan berputar 4 ke 0 derajat (`expo.out`), panel tab yang dibuka bergeser masuk, amplop kecil melintas di tepi kanan latar (desktop) |
| Semua endpoint | Keping tiap baris membalik sekali (`rotateX` -90 ke 0, poros atas, jeda 0,07 detik), lalu chip metode dicap |
| Domain | Perangko ditempel (skala 1,15 ke 1, jeda 0,1 detik); maskot kecil bernapas dan berkedip (fungsi bersama dengan polaroid Tentang) |

**Aksesibilitas dan fokus.** Isi yang bertulisan atau bisa difokus (tombol hero, tiket API, perangko, kartu Tentang, chip dan tombol Penutup, kartu bab) sekarang disembunyikan sebelum masuk dengan `opacity` saja, bukan `visibility`, supaya tetap bisa difokus keyboard dan dibaca pembaca layar. Fokus keyboard di dalamnya langsung menyelesaikan animasi masuk; di bagian yang di-pin (kartu Cara kerja, tombol Penutup) fokus menggulir ke titik pin tempat elemen itu terlihat.

**Audit** (axe-core 4.10.2 dijalankan dari scratchpad, tidak ikut repo; aturan WCAG 2 A/AA dan praktik terbaik termasuk kontras warna) di desktop 1440 dan HP 360, mode diam dan mode gerak, setelah semua bagian digulir: **tanpa pelanggaran**. Pemeriksaan sendiri: satu `<h1>`, `<h2>` di setiap bagian lain, tautan "Langsung ke isi" ke `#bab-2`, tanpa gulir menyamping di 360 piksel, semua tombol dan tautan minimal 44x44 piksel (tombol Salin kode, Jeda video, dan tautan pendek di menu dan kaki halaman diperbesar).

**`pasang/siapkan.js`** (PRD 18.3, Node lama juga bisa): memeriksa penanda `vbkong-halaman`, tanpa tempat isian, tujuh endpoint di papan, empat domain, lima field, kontak dan nama pembuat, lalu setiap blok curl halaman lama harus ada persis sama di sumber (tag dibuang, entitas diurai, akhir baris disamakan), dan blok curl halaman live harus sama dengan referensi kalau halaman live bukan halaman Kong. Lalu memberi awalan pada alamat aset, mengisi `data-akar`, dan menambah `noindex` untuk mode uji. Juga `--bersihkan` untuk membuang blok `vbpro-*`.

```bash
node situs-pro-kong/pasang/siapkan.js --cek --mode uji --awalan /pro/kong/ \
  --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html
# Endpoint: 7, domain: 4, field: 5, blok curl cocok: 2/2 ... CEK LOLOS
```

Dicoba juga dengan dua kerusakan sengaja (satu jalur endpoint diganti, satu baris curl diubah): keduanya berhenti dengan pesan jelas tanpa menulis apa pun.

**Uji** (`alat/uji_halaman.mjs`): 83 uji, termasuk 8 baru untuk Fase 6 (pin kartu 300 persen, kartu 4 di bawah tumpukan di awal dan bertumpuk di akhir, keping papan membalik, perangko dan maskot Domain, fokus keyboard ke tombol Penutup terlihat, fokus ke perangko yang belum masuk langsung tampil). Uji klik tab sekarang menggulir ke bagian API dan menunggu dulu, karena Playwright mengklik saat tiket masih dalam animasi masuk.

Muatan awal tetap: HP 0,96 MB / 44 berkas, desktop 1,21 MB / 46 berkas.

**Pratinjau untuk LO** (PRD 17): https://claude.ai/artifact/8EoWEARu2mSaGfLEjdLozk (pribadi). Halaman pembuka dengan daftar cek, situs lengkap di `situs/index.html`. Semua 300 bingkai HP ikut; desktop hanya setiap bingkai ketiga (120 bingkai, `daftar.json` pratinjau 21/21/33/21/29), karena batas 511 berkas per versi Artifact. Bukan pengganti uji Safari iPhone.

**Status syarat selesai (PRD 20.2):**

| Kelompok | Status |
|---|---|
| Isi dan kejujuran | Lolos: nama VenbeeMail Pro di kepala halaman, isi teknis persis (`cek_teks_lama.mjs`, `siapkan.js --cek`), NongBana di hero/Tentang/kaki, satu kontak, isian kosong tidak ada di HTML, ikon sosial dihapus selama akun kosong, hak cipta dengan tahun berjalan, tanpa testimoni atau aset Kong |
| Tampilan dan gerak | Lolos semua yang bisa diuji otomatis (layar muat, hero, film, garis rute, Lewati film, kartu bab, gerak Bab 2, footer FT1, label AW4, wajah B, tombol). Penilaian rasa "sambungan tidak terlihat" dan "nyaris jatuh terasa lambat" perlu dilihat LO di pratinjau |
| Video | Lolos (Fase 5) |
| HP, kinerja, aksesibilitas | Lolos, kecuali **uji di Safari iPhone asli (16.5)**: harus dilakukan LO |
| Server | Fase 7 dan 8 |

## Fase 4: akhir halaman

Markup dan tampilan diam Tentang, Penutup, footer maskot, dan kaki halaman sudah ada sejak Fase 2 (itu juga komposisi akhir saat kurangi gerakan). Fase 4 menambah gerak di `gerak.js` dan video sorotan di `halaman.js`.

| Bagian | Isi |
|---|---|
| Video sorotan V6 (12, 14.2) | Dibuat saat Penutup atau footer berjarak 1,5 layar (`IntersectionObserver`, `rootMargin: 150%`). Tombol "Jeda video" kedua di Penutup; satu tombol menjeda semua video latar |
| Tentang (13.2) | Judul ditempel huruf demi huruf, kartu catatan naik dari 40 px dan berputar -3 ke -1 derajat (0,7 detik), selotip ditempel (`--selotip-1/2`, karena pseudo-elemen tidak bisa dianimasikan langsung). Foto polaroid bernapas dari kaki (3,2 detik) dan berkedip tiap 3-6 detik (kelopak dari koordinat mata `ukuran-kong.json`), hanya selama bagian terlihat |
| Penutup (12) | Desktop di-pin `+=200%`: empat kata naik dari balik garis potong satu per satu (0-60 persen), chip menyusul, kalimat dan tombol 60-75 persen, lalu kata mengecil dan naik keluar, cincin podium makin terang, lampu meredup. Di desktop ukuran kata diperkecil ke `min(12vw, 13svh)` supaya semua isi muat dalam satu layar selama di-pin. HP tanpa pin: tiap kata muncul sekali saat masuk layar. Cincin podium bernapas (4 detik) |
| Footer maskot (14.4) | Satu garis waktu scrub (`+=160%`, layar pendek dan HP `+=130%`): lampu padam dan "Satu surat lagi.", slogan ditempel huruf demi huruf, sorotan jatuh, pintu lift membuka, maskot naik dengan kotak tertinggal lalu terdorong (`--geser-kotak`), mendarat, garis rute muncul dengan amplop mini di "Di udara", pesawat membawa amplop lewat MotionPath ke atas celah (diukur dari kotak di komposisi akhir, diukur ulang saat ukuran layar berubah), amplop berputar dan masuk celah, kotak memipih dan memantul, mata berkedip dua kali, titik "Sampai" menyala di 0,95 |
| Diam yang hidup (14.5) | Mulai di kemajuan di atas 0,99, berhenti saat digulir mundur: napas 3 detik, kotak mengangguk 4 piksel (`--angguk`), kedip 3-6 detik, miring maksimal 3 derajat mengikuti kursor (desktop, bayangan kontak bergeser berlawanan), terhuyung saat gulir cepat (kecepatan di atas 2500). Ketuk kotak: amplop meloncat keluar celah lalu masuk lagi, jeda 0,8 detik |

Berbeda dari PRD:

- **Satu video untuk Penutup dan footer:** PRD meminta satu lapisan `position: sticky` di pembungkus `.vbk-panggung-akhir`. Penutup ada di `<main>` dan footer di `<footer>`, dan video footer harus ada di dalam kotak set 16:9 supaya podium tepat di bawah maskot. Jadi dipakai dua elemen video dengan berkas yang sama (diunduh sekali, dari cache); yang tidak terlihat selalu dijeda, jadi paling banyak satu yang diputar (diuji).
- **Menu menyingkir saat pesawat tiba (0,78-0,97):** puncak kotak surat ada di sekitar 14 persen tinggi layar (14.1: y 125 di layar 1440x900), jadi pesawat dan amplop tiba tepat di belakang pil menu. Menu meluncur naik selama itu dan kembali sesudahnya (tetap muncul kalau difokus keyboard).
- Amplop yang dibawa pesawat belum membawa label AW4; label tampil di amplop yang sudah masuk celah (seperti Fase 2).
- Kalimat Penutup tetap "Mulai dari satu alamat." (keputusan Fase 2).

Uji (`alat/uji_halaman.mjs`, sekarang 75): 16 uji baru untuk Fase 4, antara lain video sorotan malas, kartu Tentang dan selotip, kelopak polaroid, pin Penutup 200 persen dan kata masih tersembunyi di awal, kalimat dan tombol muat dalam layar, pin footer 160/130 persen, maskot di bawah podium di awal dan di podium di akhir, menu menyingkir di 0,85, rute sampai, hanya satu video diputar, ketuk kotak, dan tanpa gulir menyamping di akhir halaman HP.

Muatan awal (14 Oktober 2026): HP 0,96 MB / 44 berkas, desktop 1,21 MB / 46 berkas.

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
