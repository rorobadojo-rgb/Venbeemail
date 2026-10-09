---
name: prd-venbeemail-pro
description: PRD lengkap rombak halaman venbeemail.com/pro jadi VenbeeMail Pro (versi 2, 9 Oktober 2026), berisi daftar aset, bank ide gerak sinematik, maskot hidup, logo origami 3D, dan urutan kerja per fase sampai pasang ke server. Pakai saat LO minta mengerjakan atau melanjutkan halaman /pro.
---

# PRD VenbeeMail Pro: rombak halaman /pro (versi 2)

Versi 2 menggantikan versi 1 (skill `prd-venbeemail-pro` di akun LO). Kalau ada yang berbeda, versi di repo ini yang berlaku. File ini ada di repo `rorobadojo-rgb/Venbeemail`, folder `docs/pro/prd-venbeemail-pro/`. Gambar acuan ada di `docs/pro/referensi/`.

## 0. Cara memakai PRD ini

LO bekerja dari HP. Perintah server ia jalankan sendiri di terminal aaPanel, lalu menempel hasilnya. Beri perintah dalam satu blok siap salin per langkah, dan jelaskan dengan bahasa sederhana.

Pekerjaan dibagi per fase (bagian 11). Tiap fase hanya butuh syaratnya sendiri:

- **Fase 1, Hero:** keputusan di bagian 4 sudah dipilih LO, dan hasil cek server (bagian 12, langkah 1) sudah ditempel.
- **Fase 3, Tentang:** empat data Tentang (bagian 6) sudah diisi LO. Jangan pernah mengarang nama, tahun, kota, atau fitur.

Keputusan yang belum dipilih ditanyakan dalam satu pertanyaan pilihan ganda per keputusan, dengan pilihan pertama sebagai rekomendasi.

## 1. Latar belakang dan tujuan

- Situs: venbeemail.com. Halaman depan adalah BanaMail (email sementara). Halaman /pro adalah produk untuk developer: kotak masuk uji lewat API.
- Pendaftaran Claude Startups atas nama BanaMail ditolak pada 9 Oktober 2026. Alasan di email: perusahaan di luar batas usia, atau tidak bisa diverifikasi dari data pendaftaran.
- Tujuan rombakan: (a) halaman /pro tampil sebagai produk sungguhan yang jelas siapa pembuatnya, (b) nama konsisten dengan domain, (c) tampilan sinematik dengan tokoh yang terasa hidup dan 3D, tanpa mengorbankan keterbacaan.
- Bukan tujuan: mengubah fungsi email sementara, menambah klaim, atau membuat halaman tempelan supaya lolos.

## 2. Keadaan sekarang (dicek 9 Oktober 2026)

- Judul halaman: "BanaMail Pro". Menu: Cara kerja, API, Domain. Tombol bahasa ID/EN.
- Aset di server: /pro/aset/01-latar.webp, 02-maskot.webp, 03-tulisan.webp.
- Isi teknis yang WAJIB dipertahankan persis:
  - 7 endpoint: POST /api/addresses, GET /api/mailbox, GET /api/messages/:id, PATCH /api/messages/:id, GET /api/messages/:id/attachments/:n, DELETE /api/addresses/me, GET /api/health
  - 4 domain: venbeemail.com, kotak.venbeemail.com, surat.venbeemail.com, pos.venbeemail.com
  - Dua contoh curl, aturan awalan 3 sampai 20 karakter, daftar field jawaban (address, local, domain, expiresAt, token)
  - Kontak admin@venbeemail.com
- Belum ada: bagian Tentang, nama pendiri, tahun, lokasi, kaitan dengan Claude.
- Server: VPS DomaiNesia dengan aaPanel. Program di /www/wwwroot/venbeemail/server, systemd banamail.service, port 3000, reverse proxy aaPanel. Restart: systemctl restart banamail.
- Kode halaman /pro hanya ada di server, tidak ada di repo. Isi lama (terutama teks dua contoh curl) harus diambil dari situs live atau dari LO sebelum halaman baru dirakit. Lihat bagian 12.

## 3. Aset yang sudah diterima

Semua di `docs/pro/referensi/`. Diterima 9 Oktober 2026.

| File | Isi | Dipakai untuk |
|---|---|---|
| `01-komposisi-hero-lama.webp` (1376×768) | Hero lama utuh: wordmark "BanaMail" origami, maskot memegang kotak surat tabung di atas panggung, 4 monyet skateboard, amplop hantu, pesawat kertas, garis orbit, pantulan di lantai | Acuan susunan dan suasana |
| `02-latar-panggung.png` (1376×768) | Latar teal gelap, sorotan dari atas, panggung bulat biru bermotif bunga putih, pinggiran oranye | Lapis latar |
| `03-maskot-pisang-zombie-hijau.webp` (1024×1024) | Maskot pisang zombie: kupluk oranye, jaket denim penuh tempelan, mata pink, lidah keluar, mengangkat kotak surat kardus berlogo pisang | Tokoh utama. Tubuh, wajah, dan warna tidak boleh diubah |
| `04-wordmark-banamail-lama-hijau.webp` (1376×768) | Wordmark lama dari kertas origami biru bermotif bunga putih, meneteskan cairan oranye | Acuan bahan dan warna logo baru. Tidak dipakai langsung |
| `05-monyet-rambut-merah-hijau.webp` (1024×1024) | Monyet rambut merah, flanel merah, skateboard penuh stiker | Tokoh |
| `06-referensi-huruf-advanced.png` (1179×1474) | "ADVANCED!" merah di latar hitam: kapital tebal, potongan kertas bersudut tajam, tiap huruf miring berbeda, garis dasar bergelombang, lubang huruf segitiga | Acuan bentuk huruf. Hanya gayanya, bukan jiplakan, bukan warnanya |
| `07-monyet-rambut-biru-hijau.webp` (1024×1024) | Monyet rambut biru dikepang, topi denim, stoking belang, skateboard biru bergambar mulut bergigi | Tokoh |
| `08-monyet-rambut-cokelat-hijau.webp` (1024×1024) | Monyet rambut cokelat, rompi denim penuh pin, skateboard kardus bercoretan | Tokoh |
| `09-monyet-rambut-pirang-hijau.webp` (1024×1024) | Monyet rambut pirang, kupluk biru, sweter belang biru-putih, skateboard oranye | Tokoh |
| `10-amplop-dan-pesawat-kertas-hijau.png` (1024×1024) | Amplop flanel biru berjahitan dengan tempelan hantu, dan pesawat kertas putih | Dipotong menjadi dua file |
| `11-screenshot-sky-estate.jpg` (738×1600) | Screenshot template Sky Estate ("Galaxy Home") di motionsites.ai, tampilan HP | Acuan susunan hero (bagian 5.1) |

Pengolahan wajib sebelum dipakai:
- Gambar 03, 04, 05, 07, 08, 09, 10 berlatar hijau (sekitar 75 sampai 86 persen bidang). Buang latar hijau menjadi transparan, lalu hilangkan sisa hijau di tepi tokoh (despill). Simpan sebagai WebP transparan, ukuran asli dan versi HP (lebar 512).
- Gambar 10 dipotong menjadi `amplop.webp` dan `pesawat.webp`.
- Palet dari gambar: teal gelap `#01232d` sampai `#033141`, sorotan `#35697f`, biru kobalt `#31458c` sampai `#77a3e4`, oranye `#e7663c`, putih motif bunga. Semua warna halaman, logo, dan tombol mengambil dari palet ini.

## 4. Keputusan yang harus dipilih LO

| No | Keputusan | Rekomendasi | Status |
|---|---|---|---|
| K1 | Hero (bagian 5.3) | F. Panggung Pos | **dipilih: F. Panggung Pos** |
| K2 | Bahan logo dan wordmark (bagian 7) | L3. Origami biru dengan kilau holografik | **dipilih: L3, dengan L4, L5, L7, L9** |
| K3 | Tingkat gerak maskot (bagian 8.1) | Tingkat 1 dan 2 | **dipilih: Tingkat 1 dan 2** |
| K4 | Latar bagian lain (bagian 9) | Digambar SVG gaya kertas, kecuali kotak surat kardus | **dipilih: SVG, kotak surat kardus dibuat LO dengan AI (R4)** |
| K5 | Variasi favicon (bagian 7.1) | Dipilih dari 3 pratinjau | belum dipilih, ditanyakan di Fase 3 |

K1 sampai K4 dipilih LO pada 9 Oktober 2026. Jangan ditanyakan lagi kecuali LO sendiri ingin mengubahnya. Setelah LO memilih keputusan lain, ubah kolom Status di file ini menjadi pilihannya, lalu commit, supaya chat berikutnya tidak bertanya lagi.

## 5. Hero

### 5.1 Pelajaran dari Sky Estate (gambar 11)

Kode template Sky Estate terkunci. Dari screenshot terlihat:
- Judul raksasa ("Galaxy Home") memenuhi lebar layar, dan bangunan di tengah menutupi sebagian hurufnya. Artinya judul diapit dua lapis: latar di belakang, potongan tokoh di depan.
- Menu berbentuk pil kaca tipis di atas, dengan satu tombol berbentuk pil di kanan.
- Dua tagline kecil di bawah judul, satu rata kiri dan satu rata kanan.
- Satu warna dominan menyatukan seluruh adegan (di sana ungu senja, di kita teal gelap dengan aksen biru dan oranye).

Yang dipakai untuk VenbeeMail:
- Wordmark VENBEEMAIL raksasa di belakang maskot.
- Menu pil kaca teal gelap: logo kiri, menu tengah (Cara kerja, API, Domain, Tentang), tombol bahasa ID/EN dan tombol "Coba API" di kanan.
- Tagline kiri: "Kotak masuk uji lewat API". Tagline kanan: "Dari pembuat BanaMail". Dua bahasa.

### 5.2 Tiga lapis

1. Latar (gambar 02, diperluas dengan gradien CSS supaya pas di layar mana pun)
2. Wordmark besar
3. Potongan tokoh transparan, di depan wordmark

Tiap lapis bergerak dengan kecepatan dan skala berbeda. Itu yang memberi kesan 3D tanpa model 3D.

### 5.3 Pilihan hero

Untuk tiap pilihan, jelaskan ke LO apa yang terlihat pertama kali, apa yang terjadi saat digulir, aset yang dibutuhkan, dan seberapa berat di HP. Semua aset untuk A, B, D, F, G, H, I, dan J sudah ada.

**F. Panggung Pos (rekomendasi, gabungan A, B, dan G)**
- Pertama terlihat: layar gelap, hanya sorotan tipis. Dalam 1 detik pertama sorotan menyala, dan tampak panggung, maskot mengangkat kotak surat, wordmark VENBEEMAIL raksasa di belakangnya, empat monyet melayang di sekitar, cincin amplop yang miring mengorbit, dan pesawat kertas meninggalkan garis putus-putus. Intro ini tidak menahan isi dan berhenti kalau pengunjung langsung menggulir.
- Saat digulir (hero ditahan sekitar 220 persen tinggi layar di desktop, 140 persen di HP):
  - 0 sampai 25 persen: kamera maju. Latar membesar 8 persen, wordmark 4 persen, maskot 15 persen. Sorotan makin terang.
  - 25 sampai 50 persen: empat monyet melesat keluar layar ke arah berbeda dengan jejak bayangan dan garis kecepatan. Monyet merah berhenti di tepi bawah, karena ia muncul lagi di Cara kerja.
  - 50 sampai 75 persen: cincin amplop berputar, satu amplop maju ke kamera, tutupnya terbuka, dan kartu contoh curl naik keluar dari dalamnya.
  - 75 sampai 100 persen: wordmark mengecil dan terbang menjadi logo di menu, maskot mundur ke sisi kanan, kartu curl menetap. Lalu masuk ke Cara kerja.
- HP: wordmark dua baris (VENBEE / MAIL) di belakang maskot, hanya dua monyet, enam amplop.
- Berat: sedang di desktop, ringan sampai sedang di HP.

**A. Tulisan di Belakang Maskot**
- Wordmark raksasa, maskot di depannya. Saat digulir wordmark mengecil menjadi logo pojok, maskot membesar, monyet meluncur masuk dari kiri dan kanan. Paling ringan.

**B. Orbit Surat**
- Maskot di tengah, amplop mengelilinginya dalam cincin miring. Saat digulir cincin berputar, satu amplop maju, terbuka, dan isinya menjadi contoh curl. Ringan sampai sedang.

**C. Lintasan Skate**
- Adegan gudang skate melebar ke samping. Gulir ke bawah menggeser adegan ke samping, monyet melewati ramp dan rail. Sedang. Butuh gambar latar lebar yang belum ada.

**D. Terminal Hidup**
- Kiri: judul dan terminal yang mengetik perintah curl asli. Kanan: maskot memegang kotak surat. Saat digulir surat terbang dari terminal ke kotak surat, lalu jawaban API muncul. Ringan, paling cepat dipahami developer.

**E. Scrub Video Sinematik**
- Video adegan skatepark memenuhi layar, maju mundur mengikuti gulir. Butuh video 4 sampai 8 detik buatan AI dari LO. Paling berat.

**G. Lampu Satu per Satu**
- Pertama terlihat: panggung gelap, hanya siluet. Tiap gulir menyalakan satu sorotan: maskot, lalu wordmark, lalu tiap monyet bergiliran, dengan suara visual "klik" berupa kilatan kecil. Terakhir semua lampu menyala. Ringan. Paling dramatis untuk biaya paling kecil.

**H. Kamera Mengorbit**
- Kamera seolah berjalan setengah lingkaran mengitari maskot. Lapis depan bergeser ke kiri lebih cepat dari lapis belakang, motif panggung berputar, monyet berpindah dari belakang wordmark ke depannya. Kesan 3D paling kuat dari gambar datar. Sedang.

**I. Jejak Pesawat Kertas**
- Pesawat kertas masuk dari kiri atas dan menggambar garis putus-putus mengikuti gulir, melewati tiap monyet, lalu masuk ke celah kotak surat maskot. Kamera ikut masuk ke celah itu (layar menjadi gelap), lalu bagian API muncul dari dalam. Sedang.

**J. Amplop Raksasa Terbuka**
- Layar pertama adalah amplop flanel biru raksasa yang tertutup. Gulir membuka tutupnya, panggung naik dari dalam amplop seperti kartu ucapan pop-up. Sedang. Tepi amplop dibuat dengan CSS; gambar 10 hanya untuk tekstur.

## 6. Bagian "Tentang"

Tanyakan empat hal ini ke LO, lalu tulis apa adanya:

- Nama yang ditampilkan sebagai pendiri: [ISI]
- Tahun mulai dibuat: [ISI]
- Kota: [ISI], Indonesia
- Fitur Claude: [ISI: "tidak ada", ATAU satu fitur yang sungguh akan dibangun]

Isi tetap:
- Kontak: admin@venbeemail.com
- Kalimat hubungan nama: "BanaMail adalah layanan email sementara dari VenbeeMail. VenbeeMail Pro adalah versi untuk developer."

Aturan fitur Claude: kalau LO memilih satu fitur, tulis dengan label "sedang dibangun", tanpa tanggal rilis, tanpa tangkapan layar palsu. Kalau LO menjawab tidak ada, bagian itu dihilangkan. Contoh fitur yang cocok dengan produk: Claude membaca email uji lalu mengeluarkan kode OTP dan tautan verifikasi sebagai data siap pakai.

## 7. Logo, wordmark, dan favicon

### 7.1 Aturan tetap (dari versi 1)
- Logo pojok: "VENBEEMAIL" dengan lencana "PRO" 3D (ketebalan, bayangan berlapis, kilau menyapu saat disentuh, miring mengikuti jari atau kursor).
- Bentuk huruf mengikuti gaya gambar 06: kapital, tebal, potongan kertas bersudut tajam, tiap huruf miring berbeda, garis dasar bergelombang, lubang huruf segitiga atau celah. Digambar sendiri sebagai SVG, satu path per huruf. Bukan font, bukan jiplakan.
- Huruf B punya wajah kartun: dua lubang B menjadi mata, ditambah hidung dan mulut. Tiap ditekan, wajah berganti bergiliran: kedip, melirik, nyengir, menjulurkan lidah. Saat diam berkedip sendiri. Bisa ditekan dengan keyboard (tombol asli dengan label).
- Favicon: wajah huruf B, sederhana, terbaca di 16 dan 32 piksel. SVG, PNG 32, PNG 180. Berkedip di browser yang mendukung, diam di Safari, berhenti saat tab tidak aktif. Titik merah di halaman depan saat ada surat baru. Tunjukkan 3 variasi.

### 7.2 Pilihan bahan (keputusan K2)
- **L3. Origami dengan kilau holografik (rekomendasi).** Dasar biru kobalt dengan motif bunga putih seperti wordmark lama (pola SVG), tiap huruf dibagi beberapa bidang lipatan terang dan gelap, tetesan oranye di bawah beberapa huruf. Kilau pelangi tipis menyapu permukaan saat digulir dan disentuh. Menyambung identitas BanaMail dan tetap terlihat baru.
- L1. Origami saja, tanpa kilau.
- L2. Holografik penuh (pelangi bergeser mengikuti gulir dan kursor), seperti versi 1.

### 7.3 Bank ide gerak logo dan wordmark
- L4. Ketebalan 3D: 8 sampai 12 salinan huruf berlapis di belakangnya, sehingga huruf terlihat tebal saat miring.
- L5. Masuk huruf demi huruf: tiap huruf terlipat terbuka dari posisi rebah, bergiliran 50 ms.
- L6. Tetesan oranye memanjang pelan selama hero digulir, lalu satu tetes jatuh ke panggung di akhir hero.
- L7. Mata huruf B mengikuti kursor. Setelah 20 detik diam, mata tertutup dan muncul "z" kecil. Saat digulir sangat cepat, mata membelalak kaget.
- L8. Logo pojok: saat disentuh, huruf bergoyang kecil bergantian seperti ombak.
- L9. Wordmark besar terbang dan mengecil tepat menjadi logo pojok (teknik FLIP), jadi pengunjung melihat keduanya satu benda.
- L10 (bonus). Huruf L terakhir miring lalu jatuh, dan monyet merah menendangnya kembali ke tempatnya. Hanya sekali per kunjungan.

Rekomendasi: L3 dengan L4, L5, L7, dan L9.

## 8. Tokoh: maskot, monyet, amplop

### 8.1 Maskot pisang zombie (keputusan K3)

Aturan: tubuh, wajah, dan warna tidak berubah. Semua gerak berupa transformasi, cahaya, dan bayangan.

**Tingkat 1, cukup dengan gambar yang ada:**
- M1. Bernapas: memanjang 1,5 persen dari titik kaki, loop 3,2 detik.
- M2. Menahan beban: bergoyang 1 derajat kiri-kanan dari titik kaki, seolah kotak suratnya berat.
- M3. Kedip: kelopak SVG berwarna kulit maskot menutup kedua mata pink selama 120 ms, tiap 3 sampai 6 detik secara acak.
- M4. Miring perspektif: berputar maksimal 8 derajat mengikuti kursor, jari, atau gulir. Bayangan di panggung bergeser ke arah sebaliknya.
- M5. Sapuan cahaya: lapisan gradien terang yang dipotong mengikuti bentuk maskot (mask dari gambar maskot sendiri) bergerak melintasi tubuhnya saat digulir. Ini yang paling membuat gambar datar terasa bervolume.
- M6. Cahaya tepi: garis cahaya teal muda tipis di sisi yang berlawanan dengan sorotan.
- M7. Bayangan kontak: elips gelap di panggung yang mengecil saat maskot terangkat.
- M8. Reaksi ketuk: maskot ditekan, tubuhnya memipih sedikit lalu memantul, kotak surat terangkat, dan satu amplop meloncat keluar dari celahnya.
- M9. Reaksi kecepatan gulir: gulir cepat membuat maskot terhuyung sedikit lalu kembali tegak dengan efek pegas.
- M10. Pantulan lantai: salinan maskot terbalik di bawah panggung, samar dan memudar, seperti di gambar 01.

**Tingkat 2, memotong gambar yang ada:**
- Kotak surat beserta kedua tangan dipisah dari badan dengan garis potong di lengan bawah. Kotak surat bisa naik-turun 4 sampai 6 piksel berirama, terpisah dari napas badan. Kepala tetap menyatu dengan badan supaya wajah tidak berubah.

**Tingkat 3, butuh video dari LO (pilihan, nanti):**
- LO membuat video loop 3 sampai 4 detik dari gambar 03 dengan generator video AI, latar tetap hijau: maskot bernapas, mengangkat kotak surat, lidah bergoyang. Video dibersihkan dari hijau, lalu disimpan sebagai WebM transparan (Chrome, Firefox, Android) dan HEVC transparan (Safari), atau sebagai urutan gambar WebP. Periksa bahwa wajah dan warna tidak berubah sebelum dipakai.

**Tingkat 4, model 3D (tidak direkomendasikan sekarang):**
- Model 3D dari gambar (image-to-3D) dan three.js. Berat untuk HP, dan bentuk wajah sering melenceng sehingga melanggar aturan maskot.

Rekomendasi: Tingkat 1 dan 2 sekarang. Tingkat 3 sebagai peningkatan nanti.

### 8.2 Monyet skateboard

- S1. Melompat (ollie): bergerak di lintasan busur, papan miring ke atas saat naik, memipih sedikit saat mendarat.
- S2. Trik putar: satu putaran penuh di udara, hanya monyet rambut biru.
- S3. Jejak bayangan: tiga salinan samar mengikuti di belakang saat bergerak cepat.
- S4. Garis kecepatan SVG di belakang papan.
- S5. Melayang saat diam: naik-turun 6 piksel dengan fase berbeda tiap monyet.
- S6. Kedalaman: monyet jauh lebih kecil, sedikit buram, dan lebih gelap. Monyet dekat lebih besar dan tajam. Monyet bisa pindah dari belakang wordmark ke depannya.
- S7. Watak gerak: merah paling sigap dan memimpin di Cara kerja, biru suka trik, cokelat santai dan paling lambat, pirang paling cepat.

### 8.3 Amplop dan pesawat kertas

- E1. Cincin 3D miring yang berputar. Amplop selalu menghadap kamera. Amplop yang jauh lebih buram dan redup.
- E2. Amplop terbuka: tutup segitiga dibuat dari salinan gambar amplop yang dipotong, lalu dilipat ke atas.
- E3. Pesawat kertas menggambar garis putus-putus di belakangnya mengikuti gulir.
- E4. Di demo atau contoh curl: setiap tombol "Buat alamat" atau "Salin" ditekan, satu amplop kecil jatuh ke celah kotak surat maskot.

## 9. Latar dan gerak per bagian (keputusan K4)

| Bagian | Adegan latar | Gerak saat digulir |
|---|---|---|
| Pembuka | Sesuai hero pilihan LO | Sesuai hero pilihan LO |
| Cara kerja | Lintasan skate SVG gaya kertas, empat langkah jadi empat pemberhentian | Garis lintasan tergambar mengikuti gulir, monyet merah meluncur dari langkah ke langkah, tiap pemberhentian menyala saat dilewati |
| API | Tenang dan gelap, satu lampu redup | Kotak kode naik sebagai kartu miring lalu rata; amplop melintas pelan di tepi |
| Semua endpoint | Rail panjang | Baris endpoint meluncur masuk bergantian dari kiri dan kanan; label metode (POST, GET, PATCH, DELETE) dicap seperti perangko |
| Domain | Empat kotak surat kardus | Kotak jatuh dan memantul satu per satu; bendera kotak terangkat saat disentuh |
| Tentang | Maskot besar di sisi, tenang | Maskot hanya bernapas dan berkedip; kartu pendiri naik pelan |
| Penutup | Panggung, semua tokoh berkumpul | Wordmark kembali membesar, tokoh masuk dari tepi dan mendarat di sekitar panggung |

Pilihan K4:
- Rekomendasi: lintasan skate dan rail digambar sebagai SVG gaya kertas dengan palet halaman. Kotak surat kardus dibuat LO dengan AI di latar hijau (lihat bagian 10), karena bagian Domain butuh benda yang terlihat nyata.
- Alternatif: semua digambar SVG.
- Alternatif: semua dibuat LO dengan AI.

Aturan: gerak ramai hanya di lapisan latar. Di bagian API, Semua endpoint, dan Tentang, teks berada di atas panel polos dengan kontras tinggi.

### 9.1 Transisi antar bagian
- T1. Sobekan kertas: tepi bawah bagian bergerigi seperti kertas disobek, dan bagian berikut muncul dari baliknya. Cocok dengan tema origami.
- T2. Lipatan: bagian berikut datang terlipat lalu membuka seperti kertas.
- T3. Masuk celah kotak surat: kamera mendekat ke celah kotak surat maskot, layar gelap, lalu bagian API muncul. Dipakai dari hero ke API kalau hero I dipilih.
- T4. Monyet menyeberang layar sebagai tirai.
- T5. Sorotan berpindah dari maskot ke judul bagian berikut.

Rekomendasi: T1 sebagai transisi umum, T5 dari hero ke Cara kerja.

### 9.2 Sentuhan sinematik
- C1. Penyatuan warna: lapisan teal tipis dan vignette di tepi layar.
- C2. Butir film halus (noise SVG, opacity sekitar 0,04).
- C3. Debu dan serpihan kertas melayang di canvas: maksimal 40 partikel di desktop, 15 di HP.
- C4. Kedalaman fokus: lapisan jauh memakai gambar yang sudah dibuat buram sebelumnya, bukan filter blur langsung (lebih ringan di HP).
- C5. Sinar sorot berbentuk kerucut dengan blend screen.
- C6. Easing: power2.inOut untuk gerak kamera, expo.out untuk benda yang masuk. Nilai scrub 0,6 sampai 0,8.
- C7. Intro maksimal 1 detik, tidak menahan isi, berhenti kalau pengunjung menggulir.

Rekomendasi: C1, C2, C4, C5, C6, C7. C3 hanya di desktop.

### 9.3 Tombol
- Semua tombol 3D: ketebalan dari bayangan berlapis, turun saat ditekan, memantul saat dilepas, miring tipis saat disentuh.
- Tombol Salin memberi tanda berhasil yang terlihat (ikon dan teks "Tersalin"), bukan hanya warna.

### 9.4 Halaman depan (email sementara)
- Hanya footer yang ditambah: tautan ke /pro, tautan ke bagian Tentang, dan kalimat "BanaMail adalah layanan dari VenbeeMail".
- Fungsi kotak surat, tombol, dan tampilan lain tidak disentuh.

## 10. Kekurangan dan permintaan ke LO

| No | Yang kurang | Wajib? | Untuk |
|---|---|---|---|
| R1 | Latar panggung resolusi lebih besar (2752×1536 atau sebesar mungkin) | Tidak. Tanpa ini, latar diperluas dengan gradien CSS dan sedikit lembut di layar besar | Hero desktop |
| R2 | Latar panggung versi tegak untuk HP (1080×1920), panggung di sepertiga bawah | Tidak, tapi sangat membantu | Hero HP |
| R3 | Tokoh resolusi 2048 | Tidak. 1024 cukup untuk HP | Desktop retina |
| R4 | Kotak surat kardus di latar hijau (satu gambar berisi empat, atau satu kotak) | Ya, kalau K4 memakai rekomendasi | Bagian Domain |
| R5 | Video loop maskot di latar hijau | Hanya untuk Tingkat 3 | Maskot hidup |
| R6 | Rekaman layar saat menggulir demo Sky Estate | Tidak | Acuan tempo gerak |
| R7 | Empat data Tentang | Ya, sebelum Fase 3 | Tentang |
| R8 | Hasil cek server | Ya, sebelum Fase 1 | Semua fase |
| R9 | Akses jaringan ke venbeemail.com dari Claude Code | Disarankan | Mengambil isi /pro lama secara persis (bagian 12) |

Isi prompt gambar AI untuk R1, R2, dan R4 harus menyebut: gaya papercraft origami, palet teal gelap, biru kobalt bermotif bunga putih, dan oranye, pencahayaan sorotan dari atas, latar hijau polos #00FF00 untuk benda yang akan dipotong.

## 11. Fase kerja

1. **Fase 1, Hero dan menu.** Hero sesuai K1, menu pil kaca dengan logo, wordmark sesuai K2, maskot sesuai K3, monyet, amplop. Bagian lain halaman lama dibiarkan apa adanya di bawah hero. Isi teknis lama tidak berubah sedikit pun.
2. **Fase 2, Bagian lain.** Cara kerja, API, Semua endpoint, Domain, Penutup, transisi, tombol 3D.
3. **Fase 3, Tentang, favicon, footer halaman depan.**
4. **Fase 4, Periksa dan ajukan ulang** (bagian 14 dan 15).

## 12. Urutan kerja dan pemasangan

### 12.1 Cek server (sekali, sebelum Fase 1)

Minta LO menjalankan ini di terminal aaPanel dan menempel hasilnya:

```bash
cd /www/wwwroot/venbeemail && ls -la
P=$(find /www/wwwroot/venbeemail -path '*/node_modules' -prune -o -type d -name pro -print | head -1); echo "FOLDER_PRO=$P"
ls -la "$P" "$P/aset"
grep -rn --include=*.js -e "/pro" server | grep -v node_modules | head -20
curl -sI https://venbeemail.com/pro/ | head -20
systemctl status banamail --no-pager | head -5
```

Dari hasilnya catat: letak folder /pro, pemilik file (root atau www), apakah server mengirim header Content-Security-Policy, dan cara server Node melayani /pro.

### 12.2 Ambil isi /pro lama

Halaman baru harus memakai isi teknis lama persis. Cara mengambilnya, pilih yang tersedia:
- Kalau lingkungan Claude Code bisa membuka venbeemail.com: unduh `https://venbeemail.com/pro/` beserta asetnya, simpan di repo `situs-pro/lama/`.
- Kalau diblokir: minta LO menambahkan `venbeemail.com` di Allowed domains pada pengaturan jaringan environment (menu environment di judul sesi, lalu Edit). Panduan: https://code.claude.com/docs/en/cloud-environments#network-access
- Kalau tetap tidak bisa: minta LO menjalankan `cat FOLDER_PRO/index.html` dan menempel hasilnya, atau mengunduh file itu dari File Manager aaPanel lalu melampirkannya.

### 12.3 Rakit

- HTML, CSS, dan JavaScript biasa, tanpa framework. Hasil di repo folder `situs-pro/` (index.html, aset/). Aset hasil olahan disimpan di `situs-pro/aset/`.
- GSAP dan ScrollTrigger versi tetap (misalnya 3.13.0; semua plugin, termasuk MotionPathPlugin, gratis). Unduh sekali dan simpan di `situs-pro/aset/js/`, supaya tidak bergantung ke situs lain dan aman dari Content-Security-Policy.
- Beri pratinjau ke LO sebelum dipasang (misalnya sebagai Artifact).

### 12.4 Pasang

Repo `rorobadojo-rgb/Venbeemail` publik, jadi server bisa mengunduh langsung dari GitHub. Setelah `situs-pro/` di-push, beri LO satu blok seperti ini, dengan `FOLDER_PRO` dan `BRANCH` diisi:

```bash
P=FOLDER_PRO; B=BRANCH; T=$(date +%Y%m%d-%H%M)
if [ -d "$P" ] && [ "${#P}" -gt 20 ]; then
  rm -rf /tmp/vbpro && mkdir /tmp/vbpro && cd /tmp/vbpro \
  && curl -fsSL "https://codeload.github.com/rorobadojo-rgb/Venbeemail/tar.gz/refs/heads/$B" | tar xz --strip-components=1 \
  && [ -f situs-pro/index.html ] \
  && cp -a "$P" "$P-cadangan-$T" && echo "Cadangan: $P-cadangan-$T" \
  && rm -rf "$P"/* && cp -a situs-pro/. "$P"/ && rm -rf "$P/lama" \
  && echo "Terpasang. Untuk mengembalikan: rm -rf $P && mv $P-cadangan-$T $P"
  # chown -R www:www "$P"   # hanya kalau pemilik file lama adalah www
  curl -sI https://venbeemail.com/pro/ | head -5
else
  echo "Folder /pro tidak ditemukan, tidak ada yang diubah"
fi
```

Blok ini hanya menghapus isi folder /pro setelah unduhan berhasil dan cadangan dibuat, dan tidak berjalan kalau `FOLDER_PRO` kosong atau salah.

Kalau hasil cek server menunjukkan Node perlu dimulai ulang supaya file baru terbaca, tambahkan `systemctl restart banamail`.

### 12.5 Periksa

Buka halaman di HP, uji kedua bahasa, uji tombol Salin, centang daftar di bagian 14.

## 13. Resep teknis gerak gulir

### 13.1 Hero ditahan dan digerakkan gulir

```js
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add({ gerak: "(prefers-reduced-motion: no-preference)", hp: "(max-width: 720px)" }, (ctx) => {
  if (!ctx.conditions.gerak) return;
  const jarak = ctx.conditions.hp ? "+=140%" : "+=220%";
  gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: jarak, pin: true, scrub: 0.7 } })
    .to(".lapis-latar",   { scale: 1.08 }, 0)
    .to(".lapis-tulisan", { scale: 1.04, yPercent: -3 }, 0)
    .to(".lapis-maskot",  { scale: 1.15, yPercent: 4 }, 0)
    .to(".lapis-monyet",  { xPercent: (i) => [-160, 160, -140, 150][i % 4], yPercent: (i) => [-60, -40, 50, 70][i % 4], stagger: 0.04 }, 0.25)
    .to(".lapis-tulisan", { yPercent: -45, scale: 0.18, transformOrigin: "0% 0%" }, 0.75);
});
```

- Hanya animasikan transform dan opacity. Beri `will-change: transform` pada lapisan yang bergerak.
- Bagian lain cukup animasi masuk biasa: mulai saat tepi atas bagian mencapai 80 persen tinggi layar.

### 13.2 Video mengikuti gulir (hanya untuk hero E)

```bash
ffmpeg -i adegan.mp4 -vf "fps=24,scale=1280:-2" -c:v libwebp -quality 78 aset/adegan/f_%04d.webp
ffmpeg -i adegan.mp4 -vf "fps=18,scale=720:-2"  -c:v libwebp -quality 72 aset/adegan-hp/f_%04d.webp
```

Gambar bingkai di canvas dan majukan indeksnya dengan ScrollTrigger (scrub 0,5). 60 sampai 120 bingkai cukup. Muat bingkai pertama dulu sebagai poster.

### 13.3 Video maskot transparan (hanya untuk Tingkat 3)

```bash
ffmpeg -i maskot-hijau.mp4 -vf "chromakey=0x00FF00:0.18:0.08,despill=type=green,scale=720:-2" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -an maskot.webm
```

Untuk Safari, sediakan HEVC dengan alfa, atau pakai urutan gambar WebP transparan.

### 13.4 Batas yang harus dipatuhi
- Setelan "kurangi gerakan" aktif: semua gerak mati, hero tidak ditahan, intro dilewati, video diganti poster, isi tetap lengkap.
- HP: jarak tahan lebih pendek, gambar versi 512, jumlah tokoh bergerak dikurangi, tanpa partikel.
- Muatan awal di HP di bawah 2,5 MB. Gambar di bawah layar pertama dimuat bertahap.
- Halaman rapi di lebar 360 piksel, tanpa gulir menyamping.
- Uji di Safari iPhone sebelum dipasang, karena di sana penahanan dan video paling sering bermasalah.

## 14. Yang tidak boleh berubah dan syarat selesai

Tidak boleh:
- Mengubah isi teknis di bagian 2. Endpoint yang belum aktif (misalnya /api/replies) tidak ditampilkan.
- Menghilangkan dua bahasa ID/EN pada teks apa pun.
- Mengubah tubuh, wajah, atau warna maskot.
- Menambah testimoni, jumlah pengguna, logo klien, penghargaan, atau klaim lain yang tidak nyata.
- Menaruh teks penting di dalam gambar.
- Memakai logo atau merek pihak lain.

Syarat selesai:
- [ ] Judul tab, meta, dan logo menulis "VenbeeMail Pro"
- [ ] Wajah huruf B bereaksi tiap ditekan, dengan jari maupun keyboard
- [ ] Maskot bernapas, berkedip, dan bereaksi saat disentuh
- [ ] Tiap bagian punya latar dan gerak gulir yang berbeda
- [ ] Semua tombol punya gerak saat disentuh dan ditekan
- [ ] Tujuh endpoint, empat domain, dan dua contoh curl sama persis dengan versi lama
- [ ] Bagian Tentang terisi data dari LO, dalam dua bahasa
- [ ] Favicon baru tampil; versi diam muncul di Safari
- [ ] Halaman rapi di lebar 360 piksel, tanpa gulir menyamping
- [ ] Dengan "kurangi gerakan" aktif, semua isi tetap terbaca
- [ ] Footer halaman depan punya tautan ke /pro dan Tentang; fungsi email sementara tetap jalan
- [ ] Cadangan halaman lama ada, dan cara mengembalikannya sudah diberikan ke LO

## 15. Setelah halaman terpasang: pengajuan ulang Claude Startups

- Baca dulu panduan pengajuan ulang di bagian bawah email penolakan.
- Kolom website diisi https://venbeemail.com/pro, nama perusahaan sama persis dengan yang tampil di halaman.
- Deskripsi hanya memuat hal yang sudah ada di halaman.
- Tawaran Claude Team dan kredit API sedang dijeda sejak awal Oktober 2026, jadi lolos pun belum tentu langsung mendapat keduanya. Keputusan sepenuhnya di Anthropic.
