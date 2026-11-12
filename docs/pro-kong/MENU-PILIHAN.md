# Menu pilihan tampilan VenbeeMail Pro gaya Kong

Disusun 10 Oktober 2026 dari analisis video Kong (`ANALISIS-VIDEO-KONG.md`). Enam sudut ide dinilai tiga juri (dampak, kelayakan dibangun, kejelasan produk), lalu disatukan menjadi menu di bawah. LO memilih satu konsep dan modulnya; pilihan itu dikunci di PRD.

## Rekomendasi

Saran saya: pilih K1 'Surat Sampai' sebagai kerangka, lalu tambahkan beberapa modul dari bank.

Isi paketnya:
- Layar muat: LM1 + LM2. Bilah kemajuan yang jujur, sekaligus cek GET /api/health dengan batas waktu 1,5 detik. Titik status di footer hanya tampil kalau API benar-benar menjawab.
- Hero: HR1, amplop di podium. Nama produk, kalimat inti, dan tombol 'Lihat API' sudah terbaca di detik pertama.
- Film dan penanda gulir: GL5 + GL1 + GL4. Film 30 detik maju-mundur mengikuti gulir dari urutan bingkai, dengan garis rute yang ikut bercerita dan tombol 'Lewati film'.
- Judul: JD1, huruf gunting ADVANCED.
- Transisi: TR1 di dalam film, TR5 di kartu penutup bab.
- Cara kerja: CK1, kartu sobek bertumpuk.
- API: API1 (kartu tiket) + AW1 + AW3 + AW4. Label 20 kotak, pratinjau alamat, dan awalan yang muncul lagi di amplop footer.
- Endpoint: EP1 papan keberangkatan. Kalau waktu mepet, pakai EP4 lembar spesifikasi.
- Domain: DM1 perangko bergerigi.
- Tentang: TT1, catatan selotip.
- Penutup: PN1 + PN2. Manifesto lalu podium dikosongkan.
- Footer: FT1, lift panggung + surat jatuh. Slogan 'SURAT SAMPAI. / MAIL DELIVERED.'
- Tombol dan suara: KT2 + KT3 + KT4, suara SR1 (hening).

Kenapa paket ini:
1) Paling dekat dengan permintaan 'lebih menarik dari Kong'. Ada satu tokoh dan satu tujuan, ada momen nyaris jatuh, ada jeda lampu padam, dan footer menutup cerita karena amplop dari film jatuh ke kotak yang diangkat maskot.
2) Masih realistis dikerjakan satu orang dari HP. Videonya cuma 42 detik (sekitar $30 dengan 3 kali ulang). Klip multi-referensi yang paling sering melenceng tidak dipakai: estafet monyet dan footer memakai potongan transparan yang sudah ada + GSAP. Jadi tidak perlu latar hijau.
3) Ringan di HP. Muatan awal sekitar 1,2 MB, jauh di bawah batas 2,5 MB. Bingkai film dimuat per adegan, dan mode kurangi gerakan lengkap.
4) Aman dari klaim palsu. Semua isi teknis berupa teks DOM yang bisa disalin. Nilai contoh diberi tanda 'contoh' dan token tidak pernah tampil utuh. Isian Tentang dan akun sosial disembunyikan sampai LO mengisinya.

Cadangan kalau waktu atau anggaran mepet: mulai dari K6 'Kamera Mundur' (videonya sekitar $15, paling cepat jadi), lalu pasang footer FT1 dan garis rute GL1. Nanti bisa naik ke K1 tanpa membongkar isi halaman, karena bagian-bagiannya sama.

Yang perlu disiapkan LO sebelum mulai dibangun, apa pun konsep yang dipilih:
(a) Teks persis dari halaman live: 4 langkah Cara kerja, keterangan 7 endpoint, dua curl, arti tiap field jawaban, arti PATCH, dan aturan huruf awalan. Teks lama tidak ada di repo.
(b) Cerita singkat, tahun, dan kota untuk bagian Tentang.
(c) Nama akun X, Threads, GitHub, LinkedIn.
(d) Keputusan apakah halaman boleh memanggil API sungguhan (bawaannya tidak).

## Konsep

### K1. Surat Sampai (Perjalanan Surat #001)

Total video: 42 detik

**Inti.**

Satu panggung teal dari atas sampai bawah halaman. Layar pertama langsung bilang ini produk apa. Lalu satu amplop hantu menempuh film 30 detik yang maju-mundur mengikuti gulir: disambar pesawat kertas, dioper empat monyet, nyaris jatuh, lalu menukik ke celah kotak surat. Di footer lampu padam, maskot pisang naik dari dalam podium mengangkat kotak surat, dan amplop yang sama jatuh ke celahnya.

**Cocok untuk.**

Untuk LO kalau ingin rasa film paling kuat tapi tetap realistis dikerjakan sendiri dari HP. Cocok untuk peninjau (misalnya Claude Startups) karena produk sudah terbaca di detik pertama, dan cocok untuk developer karena semua isi teknis ada di DOM biasa yang mudah dibaca dan disalin.

**Kenapa lebih menarik dari Kong.**

1) Ada satu tokoh dan satu tujuan: penonton mengikuti satu amplop dan penasaran apakah suratnya sampai. Film Kong berisi lelucon lepas-lepas (pabrik, pesawat, selancar, kolam). 2) Ada naik-turun rasa: adegan 'nyaris jatuh' di monyet cokelat diberi jatah gulir 1,5 kali supaya terasa gerak lambat. Film Kong datar. 3) Ceritanya sama dengan cara kerja produk: alamat dibuat, surat dikirim, surat ditangkap. 4) Ikon gulir diganti garis rute yang ikut bercerita (Dikirim, Dioper, Di udara, Sampai). 5) Footer menutup cerita: amplop dari film jatuh ke celah tepat saat maskot selesai naik, dengan jeda 'lampu padam' lebih dulu. Kong hanya menampilkan Bumi lagi. 6) Beda dengan Kong yang membuat orang menunggu: nama produk, kalimat inti, dan tombol API sudah terbaca sebelum film mulai.

**Alur lengkap.**

LAYAR MUAT (paling lama 1,2 detik): latar teal #01232d, logo VenbeeMail Pro, dan bilah kemajuan yang benar-benar menghitung bingkai adegan 1 yang sudah terunduh. Bersamaan, halaman memanggil GET /api/health dengan batas waktu 1,5 detik. Kalau berhasil, titik hijau kecil muncul di footer ('API menjawab · diperiksa saat halaman dibuka'). Kalau gagal atau lambat, halaman tetap jalan dan titiknya tidak ditampilkan.

PEMBUKA/HERO: video loop 6 detik (amplop melayang di atas podium, sorotan berkilau) diputar di belakang wordmark VENBEEMAIL PRO berhuruf gunting. Di bawahnya satu kalimat: 'Kotak masuk uji lewat API. Buat alamat, baca surat, ambil lampiran, hapus.' (EN: 'A test inbox over API...'). Dua tombol pil: 'Lihat API' (oranye, ke #api) dan 'Cara kerja' (bergaris tepi). Baris kecil: 'Dari pembuat BanaMail · oleh NongBana'. Menu pil kaca di tengah atas, logo di kiri, ID/EN di kanan. Di tengah bawah ada garis rute putus-putus kecil dengan amplop mini sebagai pengganti ikon gulir.

BAB 1 'PERJALANAN SURAT #001' (film tanpa teks, urutan bingkai di canvas, pin 600 persen tinggi layar di desktop dan 450 persen di HP, scrub 0,5). Ada tombol pil kecil 'Lewati film' di kanan bawah yang melompat ke Cara kerja.
1) Panggung bangun (0-5 detik): kamera crane turun pelan ke podium, sorotan menyala, tempelan hantu di amplop membuka mata. Garis rute: 'Dikirim'.
2) Lepas landas (5-10): pesawat kertas putih menyambar amplop dari kiri lalu naik berspiral di sekitar sorotan. Klip ini berakhir dengan amplop menutupi layar, jadi sambungan ke adegan berikutnya tidak kelihatan.
3) Estafet (10-18): latarnya video kamera yang menyusuri pinggiran podium bunga seperti bibir kolam skate, tanpa tokoh. Keempat monyet adalah potongan transparan yang sudah ada, digerakkan GSAP di atas canvas. Mereka meluncur masuk dari tepi, dan amplop dioper lewat busur MotionPath: merah, lalu biru (kepang berkibar, potongan dimiringkan), lalu cokelat. Di cokelat amplop meleset dan berputar, lalu ditangkap dengan ujung jari. Bagian ini diberi jatah gulir 1,5 kali. Terakhir pirang melempar lurus ke atas. Garis rute: 'Dioper'. Supaya potongan menyatu dengan video, tiap monyet diberi bayangan lantai lembut, filter warna yang disamakan ke cahaya teal, dan sedikit blur gerak CSS saat melesat.
4) Di atas sorotan (18-23): amplop kembali menyatu dengan pesawat dan berguling di langit teal gelap. Awan potongan kertas dibuat dengan SVG dan bergerak paralaks. Garis rute: 'Di udara'.
5) Menukik (23-27): pandangan lurus ke bawah. Panggung kecil dengan maskot yang mengangkat kotak surat makin besar.
6) Masuk celah (27-30): close-up celah kotak surat kardus, lalu gelap dengan seberkas cahaya hangat. Garis rute penuh: 'Sampai'.

KARTU PENUTUP BAB: layar teal hampir hitam. Cap pos bulat oranye 'VENBEEMAIL.COM/PRO' dihentakkan (skala 1,4 ke 1, layar bergetar 2 px selama 150 ms), dengan cap mono kecil 'SURAT UJI #001 · DITERIMA'.

BAB 2:
CARA KERJA: 4 kartu kertas bertepi sobek yang saling menumpuk saat digulir (pin + yPercent). Tiap kartu memakai satu monyet (potongan) dan angka gunting raksasa. Teks 4 langkah disalin persis dari halaman live, tidak ditulis ulang. Di samping tiap langkah ada chip endpoint yang relevan, misalnya POST /api/addresses atau DELETE /api/addresses/me.
API (#api): latarnya bingkai 'lepas landas' yang dibuat buram. Ada kartu tiket kertas putih bertepi lubang dengan tab 'Contoh 1' dan 'Contoh 2'. Isinya dua curl yang disalin persis dari halaman live, dalam kotak kode yang bisa digeser menyamping (halaman tidak ikut bergeser), plus tombol pil 'Salin' yang jelas. Di bawahnya 'Resi jawaban' bertanda 'contoh': address, local, domain, expiresAt, token, dengan keterangan pendek yang dicocokkan ke dokumentasi lama. Nilai token selalu <token>. Di sampingnya ada label alamat 20 kotak huruf (3 kotak pertama bertanda 'minimal'). Pengunjung mengetik awalan dan pesan 'Awalan 3-20 karakter' menyala oranye kalau kurang atau lebih. Ini hanya di browser, dengan catatan 'pratinjau, belum membuat alamat'.
SEMUA ENDPOINT: papan keberangkatan bergaya split-flap kertas, di atas bingkai adegan 4 yang buram. Tujuh baris METODE | JALUR | GUNA, dengan kolom GUNA dari halaman live. Kepingnya membalik sekali saat masuk layar. Teksnya tetap teks DOM asli (bisa dipilih, dicari, dibaca pembaca layar). Warna metode: GET kobalt, POST oranye, PATCH putih bergaris tepi, DELETE oranye bergaris tepi.
DOMAIN: empat perangko bergerigi (CSS mask) di sekitar maskot kecil. Ketuk untuk menyalin, lalu perangko tercap 'TERSALIN'. Domain yang dipilih juga dipakai di label alamat pada bagian API.
TENTANG: catatan kertas ditempel selotip, dengan judul gunting 'DI BALIK PANGGUNG'. Isinya: 'VenbeeMail Pro dibuat oleh NongBana, pembuat BanaMail.' Isian [cerita singkat], [tahun], dan [kota] baru tampil setelah diisi LO. Ditambah admin@venbeemail.com.
PENUTUP: latar kembali ke podium kosong. Manifesto huruf gunting naik baris demi baris: 'KIRIM.' / 'TANGKAP.' / 'BACA.' / 'BUANG.' (EN 'SEND. CATCH. READ. TOSS.'). Tiap kata memakai tekstur bahan aset yang berbeda (flanel, kardus, kertas putih, kertas bunga). Tombol 'Coba API' dan 'Lihat endpoint'. Podium sengaja kosong supaya terasa masih ada yang belum muncul.
FOOTER: lihat footer_maskot.

**Footer maskot.**

Pin 140 persen tinggi layar, scrub 0,6. (1) Lampu padam, 0-15 persen: latar Penutup menggelap ke #00141a dan muncul satu baris kecil 'Satu surat lagi.' (EN 'One more letter.'). Sengaja bukan 'One more thing' supaya tidak meniru acara Apple. (2) Tulisan raksasa, 15-35 persen: 'SURAT SAMPAI.' (EN 'MAIL DELIVERED.') selebar layar, huruf gunting putih bertekstur kertas dengan bayangan oranye. Huruf ditempel satu per satu dari bawah dengan putaran acak ±5 derajat, lalu menetap di ±2 derajat. (3) Lift panggung, 35-80 persen: sorotan jatuh tepat di podium. Maskot (potongan maskot-badan) naik dari dalam podium. Bagian yang masih di bawah permukaan disembunyikan clip-path, dan potongan bibir podium dari gambar latar ditaruh di depan kakinya supaya maskot benar-benar tampak berdiri di atas podium. Badannya menutupi huruf tengah 'T S'. Kotak surat (potongan maskot-kotak) ikut naik dengan jeda 0,12 detik, terdorong 3 persen lebih tinggi, lalu memantul kecil, jadi terasa diangkat. Kotak menembus tepi atas tulisan. (4) 80-100 persen: pesawat kertas membawa amplop masuk dari kiri atas lewat MotionPath. Amplop jatuh ke celah, kotak memipih lalu memantul, dan lidah maskot bergoyang. Kalau pengunjung tadi mengetik awalan, label kecil 'untuk: {awalan}@{domain}' sempat terlihat di amplop sebelum masuk (bertanda contoh). Garis rute dari Bab 1 muncul tipis di bawah dan berakhir penuh. Sesudah itu maskot bernapas (scaleY 1 ke 1,015, 3 detik) dan berkedip. Ketuk kotak dan amplop meloncat keluar lalu masuk lagi. Baris bawah: di kiri logo, 'VenbeeMail Pro · Kotak masuk uji lewat API · Dibuat oleh NongBana' dan admin@venbeemail.com; di tengah tautan bagian dan BanaMail; di kanan stiker kertas X, Threads, GitHub, LinkedIn. Ikon sosial disembunyikan (bukan href '#') sampai LO mengisi data-akun. Tambahan: ID/EN, tombol 'Kurangi gerakan', '© [tahun] NongBana', dan titik status health kalau ada.

**Tipografi dan warna.**

Dua keluarga huruf saja. Pertama, judul 'huruf gunting': satu set SVG per huruf A-Z, 0-9, dan tanda baca, dibuat sekali mengikuti referensi 'ADVANCED!' (potongan kertas tajam dan miring), dengan isian tekstur flanel, kardus, kertas putih, atau bunga kobalt. Isi teks tetap ada di aria-label dan teks tersembunyi untuk mesin pencari. Kedua, teks dan kode memakai sans tebal dari Google Fonts (misalnya Archivo, subset Latin) dan mono (JetBrains Mono subset). Warna: latar #01232d dan #033141 bergantian per bagian, aksen kobalt #31458c dan #77a3e4, oranye #e7663c hanya untuk aksi dan POST, putih untuk teks. Kode di panel putih atau kaca gelap pekat dengan kontras minimal 7:1.

**Video Seedance 2.5.**

Persiapan tanpa biaya: Claude merakit bingkai kunci dengan Pillow, memperluas situs-pro/alat/olah_aset.py, dari potongan transparan di atas latar panggung. Semua prompt meminta subjek di sepertiga tengah supaya bisa dipotong 9:16 untuk HP. Video tidak berisi teks. Ekspor 720p 16:9, audio mati.
L1 amplop-podium-loop, 6 dtk, first+last dengan gambar sama (latar + amplop melayang). Prompt: 'paper-craft felt envelope with ghost patch gently floating and turning above a blue floral podium, teal stage, spotlight shimmer, dust motes, static camera, seamless loop'. Dipakai di hero.
V1 panggung-bangun, 5 dtk, first+last (K0 panggung gelap ke K1 amplop dekat di podium). 'slow crane down to podium, spotlights switch on one by one, ghost patch opens its eyes'. Adegan 1.
V2 lepas-landas, 5 dtk, first+last (bingkai terakhir V1 ke K2 amplop menutupi lensa). 'white paper plane swoops in from left, carries the envelope, spirals up around the spotlight, envelope fills the frame'. Adegan 2.
V3 bowl-latar, 8 dtk, first+last (K3a dan K3b, podium dari sudut rendah dua posisi, TANPA tokoh). 'low camera dolly gliding along the orange rim of a giant blue floral podium like a skate bowl, spotlight sweeps, no characters'. Latar estafet; monyet dari potongan + GSAP.
V4 berguling, 5 dtk, first frame (K4 pesawat + amplop di langit teal). 'paper plane with envelope barrel-rolls 180 degrees in dark teal sky, white floral specks like stars'. Adegan 4.
V5 menukik, 4 dtk, first+last (K5 panggung dari atas dengan maskot kecil ke K6 close-up celah kotak surat). 'top-down dive toward banana zombie mascot holding cardboard tube mailbox overhead, pink eyes look up'. Adegan 5.
V6 masuk-celah, 3 dtk, first+last (K6 ke K7 hampir hitam dengan berkas cahaya hangat). 'camera pushes into the mailbox slot, darkness, warm light beam'. Adegan 6.
L2 sorotan-loop, 6 dtk, first+last sama (latar panggung tanpa tokoh). 'spotlights sway slowly, paper dust, static camera, seamless loop'. Latar footer dan Penutup.
Opsional V3x estafet-asli, 6 dtk, multi-referensi (4 monyet, amplop, latar). Dicoba sekali saja. Kalau kostum atau wajah melenceng, tetap pakai V3 + potongan.
Pengolahan oleh Claude: ffmpeg memotong klip film jadi bingkai WebP (desktop 1280 px, 12 fps, kualitas 60; HP 540x960 potongan tengah, 10 fps, kualitas 55). Loop dibuat MP4 H.264 8-bit (HEVC 10-bit dari Seedance tidak aman di semua browser), muted playsinline. Canvas mencampur dua bingkai berdekatan supaya scrub halus.

**Perkiraan biaya video.**

Sekitar $9,7 untuk satu putaran (42 dtk x $0,23). Dengan rata-rata 3 percobaan per klip sekitar $30, ditambah $4 kalau mencoba V3x. Tidak perlu membuat ulang dalam 9:16 karena HP memakai potongan tengah.

**Versi HP.**

Muatan awal sekitar 1,2 MB: HTML/CSS/JS sendiri sekitar 110 KB, GSAP + ScrollTrigger + MotionPath sekitar 75 KB gzip, 2 font subset sekitar 90 KB, poster hero 40 KB, loop hero 540p potongan persegi sekitar 350 KB (dimuat setelah poster), dan 40 bingkai adegan 1 sekitar 0,8 MB. Film memakai 300 bingkai 540x960 (sekitar 6 MB total) yang dimuat per adegan, hanya 1-2 adegan di depan posisi gulir. Kalau Save-Data aktif atau koneksi 2G/3G, film turun ke 6 fps. Potongan monyet versi 512 px. Pin film 450 persen. Garis rute pindah ke tepi kanan dan berdiri tegak. Wordmark hero dua baris VENBEE / MAIL PRO, tombol bertumpuk selebar layar dengan gutter 16 px. Cara kerja: kartu penuh layar bertumpuk. Endpoint: 7 kartu split-flap tegak (metode di atas, jalur di bawah, boleh patah baris). Perangko disusun 2x2. Label alamat 20 kotak dibungkus jadi 2 baris. Footer: 'SURAT / SAMPAI.' dua baris, maskot 512 menutupi tengah baris kedua. Pakai satuan svh, tanpa scroll halus buatan, dan halaman tidak boleh bergeser menyamping di lebar 360 px.

**Mode kurangi gerakan.**

Tanpa layar muat, tanpa pin, scrub, dan autoplay. Film diganti 6 gambar diam berurutan seperti komik, tiap gambar dengan satu kalimat keterangan. Kartu Cara kerja tampil sebagai daftar biasa, papan endpoint langsung terisi tanpa membalik, perangko tanpa animasi cap. Footer langsung tampil dalam komposisi akhir: maskot berdiri di podium, amplop sudah separuh di celah, tulisan utuh. Semua teks dan kode tetap tampil dan bisa disalin. Mode Save-Data juga memakai gambar diam.

**Tingkat kesulitan.**

Sedang ke berat. Tingkat kesulitannya kira-kira 60 persen dari konsep estafet asli karena film dipangkas ke 30 detik dan estafet memakai potongan + GSAP, bukan klip multi-referensi.

**Risiko.**

1) Potongan monyet di atas video bisa terlihat 'ditempel'. Penawarnya bayangan lantai, filter warna yang disamakan, blur gerak saat melesat, dan potongan selalu bergerak cepat. 2) Sambungan V2 ke V3 dan V4 ke V5 bergantung pada amplop yang menutup layar dan gelap di celah. Kalau masih kelihatan, tambahkan sapuan kertas CSS 4 bingkai. 3) Teks 4 langkah, kolom GUNA, dan dua curl belum ada di repo, jadi harus diambil dari halaman live sebelum dibangun. 4) Label awalan dan resi wajib bertanda 'contoh' atau 'pratinjau'. 5) Total film 6 MB di HP: pemuat per adegan harus diuji di HP murah.

### K2. Kamu Suratnya (POV + narator hantu)

Total video: 26 detik

**Inti.**

Penonton menjadi surat uji itu sendiri. Dari balik tutup amplop kamu dilempar, dioper, ditatap mata pink maskot, lalu jatuh ke dalam kotak surat, ditemani tempelan hantu yang berceloteh lewat subtitle dua bahasa. Di dalam kotak, seluruh isi halaman tertempel di dinding kardus, dan di akhir awalan yang kamu ketik muncul di surat balasan dan di amplop pada footer.

**Cocok untuk.**

Cocok kalau LO ingin halaman terasa paling personal dan lucu, dan pengunjung utamanya membuka dari HP (film POV paling pas dalam posisi tegak). Juga cocok kalau anggaran video ingin tetap kecil.

**Kenapa lebih menarik dari Kong.**

1) Penonton jadi tokoh utama: monyet menyeringai ke arahmu dan maskot menatap tepat ke matamu, sedangkan Kong ditonton dari luar. 2) Film punya suara: subtitle hantu yang lucu sekaligus menjelaskan produk sambil film berjalan. Film Kong bisu. 3) Cara kerja muncul sebagai 'pemberhentian' di tengah film, jadi tontonan dan penjelasan menyatu. 4) Akhirnya personal: awalan yang diketik pengunjung (sambil belajar aturan 3-20 karakter) muncul lagi di surat balasan dan di amplop footer. 5) Film lebih pendek (sekitar 24 detik) dan lebih ringan dari Kong.

**Alur lengkap.**

LAYAR MUAT: tidak ada. Hero langsung tampil supaya cepat.

PEMBUKA: gambar diam amplop flanel besar di podium, dengan judul VENBEEMAIL PRO, kalimat 'Kotak masuk uji lewat API.' dan dua tombol ('Lihat API', 'Cara kerja'). Subtitle hantu pertama sudah muncul di pita bawah: 'Psst. Gulir, nanti kuajak jalan.' Chip status kecil di menu: 'Belum dikirim'.

BAB 1 'DARI MATA SURAT' (sekitar 24 detik video POV, urutan bingkai di canvas, pin 650 persen di HP dan 600 persen di desktop termasuk 3 pemberhentian). Subtitle mono putih di pita teal transparan, paling banyak 1 kalimat per 3 detik dan maksimal 2 baris.
1) Bangun (0-4 dtk): gelap flanel, tutup amplop membuka ke arah kamera seperti kelopak mata, panggung teal terlihat. Sub: 'Halo. Aku surat uji pertamamu.'
PEMBERHENTIAN 1 (film diam 60 persen tinggi layar): cap oranye 'LANGKAH 1' menghantam pojok, label pos naik berisi langkah 1 dari halaman live + chip POST /api/addresses.
2) Berangkat (4-9): sayap pesawat kertas di kiri-kanan bawah layar, kamera melesat berspiral mengelilingi sorotan. Sub: 'Aplikasimu menekan Kirim. Pegangan.' Lalu PEMBERHENTIAN 2 berisi langkah 2. Chip status: 'Di udara'.
3) Tangan-tangan (9-13): dibuat dari potongan monyet transparan (bukan video) yang lewat sangat dekat ke kamera di atas latar bingkai akhir klip 2 yang buram. Skala maksimal 2x memakai potongan resolusi terbesar, dengan blur gerak CSS. Merah menyeringai lalu melempar (layar whip), biru menangkap dan kepangnya menyapu (potongan lewat menutupi layar), cokelat nyaris menjatuhkan (canvas berputar 20 derajat), pirang melempar tinggi. Subtitle bergiliran: 'Yang merah selalu duluan.' / 'Hampir! Hampir!' / 'Oke, terbang lagi.'
4) Mata pink (13-19): kamera turun ke maskot yang mengangkat kotak surat ke arah lensa. Sub: 'Itu dia, kotak masuk ujimu. Tenang, dia ramah.'
5) Celah (19-24): celah memenuhi layar lalu gelap dengan cahaya hangat. Sub: 'Mendarat.' PEMBERHENTIAN 3 berisi langkah 3 + chip GET /api/mailbox dan GET /api/messages/:id. Chip status: 'Di dalam kotak'.
Gulir mundur memutar film dan subtitle mundur.

BAB 2 'DI DALAM KOTAK' (gulir biasa ke bawah, tidak menyamping): latar tekstur kardus bergaris rusuk dari CSS/SVG (bukan ubin bingkai video), diterangi gradasi cahaya dari atas seperti dari celah, yang makin redup ke bawah. Ada jangkar per bagian supaya menu bisa melompat tepat.
CARA KERJA (versi lengkap): daftar utuh 4 langkah dari halaman live di atas kertas putih, dengan langkah 4 bercap 'LANGKAH 4'. Menu 'Cara kerja' melompat ke sini.
API: dua surat tergulung membuka (clip-path dari atas) berisi dua curl persis dalam panel putih polos, dengan tombol 'Salin'. Di sebelahnya label alamat 20 kotak huruf dengan pemeriksa 3-20 karakter (pratinjau, tidak memanggil API), dan resi 'Isi jawaban' bertanda 'contoh' berisi address, local, domain, expiresAt, token.
SEMUA ENDPOINT: rak loker kardus 7 kotak. Tiap loker berisi amplop kecil berlabel metode berwarna dan jalur. Keterangan dari halaman live selalu tampil sebagai teks di bawah label, dan saat diketuk amplopnya hanya menyembul sebagai hiasan.
DOMAIN: empat stiker alamat pengiriman ditempel miring. Ketuk untuk menyalin, lalu tercap 'TERSALIN'. Domain terpilih masuk ke label alamat.
TENTANG: catatan kertas ditempel selotip, ditambah foto polaroid maskot dari potongan. Isinya 'Kotak ini dirakit oleh NongBana, pembuat BanaMail.' Isian [cerita], [tahun], [kota] tersembunyi sampai diisi. Kontak admin@venbeemail.com.
PENUTUP 'SURAT BALASAN': selembar surat putih diketik mengikuti gulir: 'Untuk: {awalan}@{domain}' (bawaannya kamu@kotak.venbeemail.com, bertanda contoh), lalu satu kalimat ringkas produk dari halaman live, ditutup 'Salam, NongBana'. Tombol 'Coba API' dan 'Lihat endpoint'.

**Footer maskot.**

Peralihan: surat balasan terlipat jadi amplop dan meluncur pergi, layar berkilat putih seolah keluar dari celah. Lapis belakang: video loop panggung dengan sorotan menyapu (tidak transparan, jadi aman). Lapis tengah: tulisan raksasa 'ADA SURAT!' (EN 'MAIL'S HERE!') dari huruf gunting oranye bergaya 'ADVANCED!', tanda seru miring tajam. Lapis depan: maskot dari potongan maskot-badan naik dari tengah bawah mengikuti gulir selama 80 persen tinggi layar terakhir, badannya menutupi 'A S' di tengah. Kotak surat (maskot-kotak) naik terlambat lalu memantul. Saat maskot sampai atas, amplop milik pengunjung menyembul separuh dari celah (potongan amplop dengan topeng berbentuk celah) dengan label 'untuk: {awalan}@{domain}'. Subtitle hantu terakhir: 'Pos! Giliranmu membuat alamat.' Ketuk maskot dan amplop melompat kecil. Baris bawah: 'VenbeeMail Pro · Dibuat oleh NongBana', admin@venbeemail.com, cap bulat kecil berlogo X, Threads, GitHub, LinkedIn (tersembunyi sampai akun diisi), ID/EN, '© [tahun] NongBana'.

**Tipografi dan warna.**

Subtitle dan kode memakai mono (JetBrains Mono, 15 px di HP). Judul memakai huruf gunting oranye dan putih, dan cap 'LANGKAH' memakai cap bulat oranye bertekstur tinta. Bab 2 bertema cokelat kardus hangat (#8a6a48 yang diredupkan) dengan panel putih untuk semua kode, jadi kontrasnya aman. Teal tetap jadi warna film dan footer, dan oranye hanya untuk aksi.

**Video Seedance 2.5.**

Hanya dibuat 9:16 (720x1280). Desktop menampilkan film di bingkai tegak besar di tengah dengan sisi kiri-kanan berisi bingkai yang sama diperbesar dan diburamkan, jadi tidak perlu dua rasio. Bingkai kunci dirakit Claude dengan Pillow.
C1 bangun, 4 dtk, first frame (K1 close-up flanel amplop). 'POV from inside an envelope, felt flap opens toward the lens like an eyelid, revealing dark teal stage and spotlight, slight tilt'.
C2 berangkat, 5 dtk, first+last (K2 tepi sayap kertas putih di bawah layar dengan panggung di bawah; K3 sama, panggung jauh mengecil). 'POV riding a white paper plane, wings at frame edges, spiraling up around a spotlight'.
C4 mata-pink, 6 dtk, first+last (K4 maskot kecil jauh di bawah; K5 maskot dekat mengangkat kotak ke lensa). 'camera descends toward banana zombie mascot lifting cardboard tube mailbox toward lens, pink eyes lock on camera, tongue out'.
C5 celah, 5 dtk, first+last (K6 close-up celah; K7 hampir hitam dengan cahaya hangat). 'push into mailbox slot, darkness, warm light'.
L1 panggung-loop, 6 dtk, first+last sama. 'spotlights sweep slowly, static camera, loop'. Footer.
Adegan tangan-tangan TIDAK memakai video (potongan + GSAP), jadi klip POV multi-referensi yang paling rawan dihapus.
Pengolahan: bingkai WebP 540x960 pada 10 fps untuk HP dan 720x1280 pada 12 fps untuk desktop. Loop footer memakai MP4 H.264.

**Perkiraan biaya video.**

Sekitar $6 per putaran (26 dtk x $0,23). Anggarkan 3 putaran, sekitar $18-20.

**Versi HP.**

Ini versi utamanya. Muatan awal sekitar 0,9 MB: kode sekitar 110 KB, GSAP + ScrollTrigger sekitar 50 KB, 2 font sekitar 80 KB, poster hero 60 KB, potongan monyet 512 px x4 sekitar 120 KB, dan 40 bingkai C1 sekitar 0,5 MB. Film 20 detik video sekitar 200 bingkai x 22 KB (sekitar 4,5 MB) dimuat per adegan. Kalau Save-Data aktif, film turun ke 6 fps. Subtitle di atas area jempol. Pemberhentian memakai kartu selebar layar dikurangi gutter 16 px. Loker 2 kolom, stiker domain bertumpuk, 20 kotak huruf dibungkus 2 baris. Footer 'ADA / SURAT!' dua baris. Chip status tetap di menu. Kode di dalam kotak yang bisa digeser menyamping, halaman tidak ikut bergeser.

**Mode kurangi gerakan.**

Tanpa pin, scrub, dan mesin ketik. Film diganti 5 gambar diam bersubtitle seperti komik. Pemberhentian jadi daftar 4 langkah biasa, surat balasan tampil lengkap, dan maskot footer diam di posisi akhir dengan amplop menyembul. Semua teks dan kode tetap tampil.

**Tingkat kesulitan.**

Sedang.

**Risiko.**

1) Subtitle bisa terasa cerewet. Batasi maksimal 10 kalimat sepanjang halaman dan jaga terjemahan EN tetap pendek. 2) Gerak POV yang berputar bisa memusingkan sebagian orang, jadi putaran dibatasi 20 derajat dan dimatikan di mode kurangi gerakan. 3) Kalimat yang mengarah ke klaim (misalnya 'tanpa sisa') dihapus. Teks langkah tetap dari halaman live. 4) Awalan pengunjung harus jelas ditandai sebagai contoh. 5) Bagian tangan-tangan dari potongan harus cepat dan diberi blur supaya tidak terlihat seperti stiker diam.

### K3. Sobek, Lipat, Kirim (stop-motion kertas)

Total video: 31 detik

**Inti.**

Seluruh halaman satu lembar kertas putih panjang di atas meja teal yang terus disobek dan dilipat dengan gerak patah-patah ala stop-motion 12 fps. Film Bab 1 menceritakan hidup satu alamat tanpa kata, dari kotak datang, surat masuk, dibaca, lampiran terbang, sampai kotak diturunkan. Di footer kertas robek dari bawah dan maskot menembus sambil mengangkat kotak surat.

**Cocok untuk.**

Cocok kalau LO ingin rasa buatan tangan yang hangat dan paling ringan di HP. Gaya patah-patah sengaja membuat artefak kecil video AI dan HP yang tersendat tidak terlihat sebagai kesalahan.

**Kenapa lebih menarik dari Kong.**

1) Kong licin seperti iklan, sedangkan ini terasa dibuat tangan oleh satu orang, cocok dengan cerita pembuat tunggal. 2) Filmnya menjelaskan siklus API (buat, terima, baca, lampiran, hapus) sebelum ada satu kalimat pun. 3) Interaksinya kecil tapi memuaskan: penggaris kertas yang mengukur awalan, tiket antrean endpoint, dan pita struk curl yang bisa disobek. 4) Footer maskot menembus robekan kertas lebih dramatis dari Kong yang naik di depan tulisan biasa. 5) Muatan awal paling ringan (sekitar 0,8 MB).

**Alur lengkap.**

LAYAR MUAT: selembar kertas catatan kecil disobek dari blok dalam 4 bingkai, bertuliskan logo dan 'memuat...'. Paling lama 0,8 detik.

PEMBUKA: kertas putih dengan sobekan bundar besar di tengah. Di dalam sobekan diputar loop panggung 'parade' (maskot mengangguk di podium). Monyet potongan lewat patah-patah (posisi diganti tiap 1/12 detik) di depan lubang. Di kertas: VENBEEMAIL PRO berhuruf lipat kobalt, kalimat 'Kotak masuk uji lewat API.' dan tombol 'Lihat API' dan 'Cara kerja'.

BAB 1 'HIDUP SATU ALAMAT' (urutan bingkai 12 fps di canvas, sekitar 25 detik, pin 450 persen di desktop dan 340 persen di HP). Film tampil di lubang sobekan yang melebar penuh di 10 persen pertama.
F1 kotak datang (0-18 persen): kotak surat kardus turun dari atas ke tangan maskot yang terangkat kosong, tidak melipat sendiri. Sudut kamera rendah.
F2 surat datang (18-36): pesawat kertas yang membawa amplop flanel mendekat, amplop lepas dan meluncur ke celah, sorotan berdenyut sekali.
F3 dibaca (36-60): amplop terbuka di podium dan tempelan hantu mengintip. Empat monyet adalah potongan yang masuk patah-patah (6 posisi per monyet), berkerumun di sekeliling amplop. Dalam stop-motion, potongan yang diganti posisi memang terlihat wajar.
F4 lampiran terbang (60-80): beberapa pesawat kertas kecil keluar dari amplop, dan monyet merah serta pirang (potongan) mengejar.
F5 kotak diturunkan (80-100): maskot menurunkan kotak ke luar bingkai, tangan kembali kosong, sorotan menyempit seperti iris sampai gelap. Karena bingkai akhir F5 sama dengan awal F1, film bisa diputar sebagai lingkaran.
KARTU BAB: kertas catatan ditempel selotip oranye miring: 'Bab 2 · Cara pakainya' dengan cap pos kecil 'venbeemail.com/pro', lalu dicabut ke atas dalam 4 bingkai.

BAB 2 (transisi sobek besar hanya 3 kali: setelah film, sebelum Domain, sebelum footer; antar-bagian lain cukup lipatan kecil):
CARA KERJA: 4 kartu kertas persegi bergambar bingkai beku F1, F2, F3, F5 dengan coretan diagram origami (panah kobalt, garis lipat putus-putus). Kartu terbuka dua kali dalam 6 bingkai saat masuk layar. Teks 4 langkah persis dari halaman live.
API: celah gelap seperti mulut kotak surat mengeluarkan pita struk putih, dan curl pertama 'tercetak' huruf demi huruf (steps). Teks lengkap sudah ada di DOM sejak awal; animasi hanya membuka clip. Ada tombol 'Salin' biasa yang jelas di tiap pita. Garis perforasi 'atau sobek untuk salin' jadi bonus: diketuk, pita robek dan potongan atas terlempar berputar. Pita kedua untuk curl kedua. Pita ketiga berisi jawaban bertanda 'contoh' dengan field address, local, domain, expiresAt, token yang distabilo oranye satu per satu.
SEMUA ENDPOINT: gulungan tiket antrean kantor pos. Tiap langkah gulir menarik satu tiket bergerigi 'No. 01 · POST /api/addresses' sampai 'No. 07 · GET /api/health', dengan cap warna metode dan keterangan dari halaman live. Tiket yang sudah tertarik menumpuk miring ±3 derajat tapi tetap terbaca.
DOMAIN: penggaris kertas 20 takik dengan kolom 'coba awalan'. Takik terisi sesuai jumlah karakter. Kurang dari 3, penggaris jadi oranye dengan catatan 'minimal 3'; lebih dari 20, gunting kecil memotong sisanya dengan catatan 'maksimal 20'. Di bawahnya empat monyet masuk patah-patah membawa bendera kertas berisi satu domain. Ketuk bendera untuk memilih dan menyalin, lalu pratinjau berubah, misalnya 'tes-daftar@kotak.venbeemail.com' (pratinjau).
TENTANG: amplop flanel besar berbalik dalam 4 bingkai. Di belakangnya surat: 'VenbeeMail Pro dibuat oleh NongBana, pembuat BanaMail.' Isian [cerita], [kota], dan [tahun] baru tampil setelah diisi LO. Wordmark lama BanaMail jadi prangko di pojok, tautan ke halaman depan.
PENUTUP: kertas putih dengan sobekan bundar, loop parade diputar lagi, teks 'Kotak masukmu tinggal satu panggilan.' Tombol 'Salin curl' dan 'admin@venbeemail.com'.

**Footer maskot.**

Pin 140 persen. Dasarnya lembar kertas putih terakhir. 0-35 persen: tulisan raksasa tiga baris 'BUAT. / BACA. / BUANG.' (EN 'MAKE. / READ. / TOSS.') ditempel huruf demi huruf seperti animator stop-motion. Tiap huruf muncul dalam 3 bingkai dengan rotasi acak ±3 derajat, huruf lipat kobalt, ukuran clamp(60px, 17vw, 240px). 35-85 persen: kertas robek dari tengah bawah. Ada 6 bentuk sobekan berbentuk V terbalik yang makin tinggi, dibuat sebagai polygon clip-path oleh skrip (titik bergerigi acak dengan seed tetap), jadi tidak perlu menggambar tangan. Teal panggung terlihat di baliknya. Kotak surat (maskot-kotak) menembus lebih dulu, lalu kepala berkupluk oranye, lalu bahu berjaket denim (maskot-badan naik dari translateY 70 persen ke 0 dalam 8 bingkai). Dua sirip sobekan putih melengkung keluar di kiri-kanan badan (rotate -25 dan 25 derajat). Urutan lapis: huruf, sobekan, badan, kotak. Badan menutupi separuh baris tengah 'BACA.' dan kotak menimpa tepi bawah 'BUAT.'. 85-100 persen: mata berkedip 2 bingkai, lidah keluar-masuk sekali, dan satu pesawat kertas meluncur keluar dari celah lalu jatuh pelan di samping tautan footer. Gerak diam: badan bergeser 1 px tiap 0,25 detik bolak-balik. Slogan kecil: 'Satu alamat, satu panggilan.' Baris bawah: tab kertas sobek berlogo X, Threads, GitHub, LinkedIn (tersembunyi sampai akun diisi), admin@venbeemail.com, ID/EN, tombol 'Kurangi gerakan', '© NongBana'.

**Tipografi dan warna.**

Dasar kertas putih hangat #f6f3ec dengan bayangan lipatan, dan meja/panggung teal #01232d. Huruf judul adalah 'huruf lipat' kobalt #31458c dengan sisi gelap (SVG), dan mono untuk kode. Oranye #e7663c hanya untuk stabilo, selotip, dan tombol utama. Gerak memakai steps(), bukan easing halus, ciri khas konsep ini.

**Video Seedance 2.5.**

Semua 720p 16:9 dengan subjek di tengah, lalu diekspor ke bingkai WebP 12 fps (rasa stop-motion dan ukuran setengah). Tidak bergantung pada rasio 1:1. Bingkai kunci dirakit Claude dengan Pillow. Morfing benda yang rawan dihapus: kardus tidak melipat sendiri, dan pesawat tidak berubah jadi amplop.
P0 parade-loop, 6 dtk, first+last sama (panggung, podium, maskot memegang kotak). 'stop-motion paper-craft, mascot nods slowly, spotlights sway, static camera, loop'. Hero dan Penutup; monyet dari potongan.
F1 kotak-datang, 5 dtk, first+last (maskot tangan kosong ke maskot memegang kotak). 'cardboard tube mailbox lowers from above into the mascot's raised hands, low camera slow push-in'.
F2 surat-datang, 5 dtk, first+last (pesawat membawa amplop di kejauhan ke amplop separuh masuk celah). 'paper plane carrying felt envelope flies in, envelope slides into the slot, spotlight pulses once'.
F3 amplop-dibuka, 5 dtk, first+last (amplop tertutup di podium ke amplop terbuka dengan hantu mengintip). Tanpa monyet.
F4 lampiran, 5 dtk, first frame (amplop terbuka). 'small white paper planes flutter out of the envelope and fly off to the right'.
F5 kotak-turun, 5 dtk, first+last (maskot memegang kotak ke maskot tangan kosong, panggung lebih gelap). 'mascot lowers the mailbox out of frame, spotlight narrows'.

**Perkiraan biaya video.**

Sekitar $7,1 per putaran. Anggarkan sekitar $20-22 untuk ulang-ambil.

**Versi HP.**

Muatan awal sekitar 0,8 MB: kode sekitar 60 KB, GSAP + ScrollTrigger + MotionPath sekitar 75 KB, 2 font sekitar 80 KB, potongan maskot dan 4 monyet versi 512 sekitar 330 KB, poster parade 40 KB, polygon sobekan di JS. Loop parade (sekitar 300 KB) dimuat setelah halaman siap. Bingkai film 540 px persegi potongan tengah, 12 fps, sekitar 300 bingkai x 12 KB (sekitar 3,6 MB) dimuat per adegan. Sobekan memakai clip-path polygon, bukan mask SVG berfilter. Getar garis tepi diganti geser 1 px. Kartu Cara kerja satu kolom, pita struk selebar layar dengan geser menyamping di dalam pita saja, tiket endpoint jadi daftar tegak, penggaris 20 takik selebar layar dengan kolom ketik besar. Menu jadi tombol kertas 'Menu' di kanan atas yang membuka lembar sobek dari atas.

**Mode kurangi gerakan.**

Semua sobekan langsung terbuka, tanpa lipatan, ketikan, atau getar. Film diganti 5 gambar diam berketerangan. Kartu sudah terbuka, tiket tampil sebagai daftar biasa, tombol Salin tetap bekerja tanpa animasi sobek, dan maskot footer langsung berdiri di robekan yang sudah jadi.

**Tingkat kesulitan.**

Sedang.

**Risiko.**

1) Terlalu banyak sobekan bisa melelahkan, jadi transisi besar dibatasi 3. 2) Interaksi sobek harus selalu ditemani tombol Salin biasa. 3) Gerak patah-patah harus konsisten (semua steps 12), karena campuran halus dan patah akan terlihat seperti error. 4) Tagline 'BUAT. BACA. BUANG.' jangan dipakai bersamaan dengan konsep lain yang memakai tagline serupa. 5) Kertas putih panjang mengurangi suasana panggung teal, jadi film, footer, dan Penutup tetap teal.

### K4. Konsol Sutradara (take per endpoint)

Total video: 31 detik

**Inti.**

Pengunjung menjadi sutradara. Tiap gulir mengetik satu perintah di konsol, Enter berkedip, lalu satu 'take' pendek diputar di panggung dan jawabannya muncul. Setiap take mulai dan selesai di bingkai siaga yang sama, jadi bisa diputar dalam urutan apa pun, dan layar muatnya sungguh memeriksa apakah API hidup.

**Cocok untuk.**

Cocok kalau penonton utama LO adalah developer yang ingin langsung melihat perintah dan jawaban, dan kalau LO ingin konsep yang paling aman di Safari iPhone (klip diputar biasa, tidak di-scrub).

**Kenapa lebih menarik dari Kong.**

1) Di Kong pengunjung hanya menonton. Di sini pengunjung 'menjalankan' film: perintah terketik, Enter, adegan diputar. Rasanya seperti memakai produknya. 2) Layar muat sungguh memanggil GET /api/health, jadi animasi pertama adalah bukti jujur bahwa API hidup, bukan bilah kemajuan kosong. 3) Pola 'hub' membuat pengunjung bisa melompat ke endpoint mana pun dan film tetap menyambung. 4) Isi teknis menjadi tontonan, bukan dokumen di belakang tontonan.

**Alur lengkap.**

LAYAR MUAT: konsol kecil di tengah mengetik 'GET /api/health' dalam 0,4 detik, lalu menunggu jawaban asli dengan batas waktu 1,5 detik. Kalau berhasil: '< ok' (sesuai bentuk jawaban asli). Kalau gagal atau lambat: konsol hanya menutup diri tanpa tulisan palsu, dan halaman tetap terbuka.

PEMBUKA: panggung siaga (loop 4 detik: sorotan bergoyang, maskot bernapas memegang kotak) di atas, judul VENBEEMAIL PRO dengan 'Kotak masuk uji lewat API.' di kiri, dan konsol berkedip di kanan. Tombol 'Langsung ke curl' (#api) dan 'Tonton take'.

BAB 1 'LIMA TAKE' (bukan tujuh: take PATCH dan health digabung ke take lain supaya tidak membosankan). Tiap take: desktop pin 150 persen; HP section 100svh dengan panggung position: sticky. (a) Papan clapper kertas masuk: 'TAKE 1 · POST /api/addresses'. (b) Perintah terketik mengikuti gulir 0-60 persen. (c) Di 60 persen Enter berkedip dan klip diputar sekali dengan kecepatan normal, lalu berhenti di bingkai siaga. (d) Jawaban bertanda 'contoh' muncul di konsol. Gulir mundur menampilkan poster siaga, jadi tidak patah.
TAKE 1 POST /api/addresses: kamera menyentak maju ke kotak surat, cahaya berkedip di celah. Label kertas di kotak adalah HTML yang muncul setelah klip berhenti: 'uji-login@kotak.venbeemail.com' (contoh). Konsol: address, local, domain, expiresAt, token (<token>).
TAKE 2 GET /api/mailbox: amplop flanel dibawa pesawat kertas dan masuk celah (video). Monyet merah potongan meluncur dan kickflip di depan panggung (GSAP). Konsol: daftar 1 surat (contoh).
TAKE 3 GET /api/messages/:id + PATCH /api/messages/:id: amplop meloncat dari celah, membuka sebentar, lalu masuk lagi. Konsol menampilkan contoh isi surat, lalu baris PATCH dengan arti yang diambil dari dokumentasi live.
TAKE 4 GET /api/messages/:id/attachments/:n: pesawat kertas keluar dari celah, mengitari panggung, menukik ke kamera. Konsol bergeser menampilkan baris unduhan lampiran (contoh). Indeks lampiran mengikuti dokumentasi, tidak dianggap mulai dari 0.
TAKE 5 DELETE /api/addresses/me + GET /api/health: sorotan meredup, label HTML dicoret garis oranye, tutup kotak menutup. Lalu sorotan berdenyut tiga kali dan kembali ke siaga. Konsol menampilkan hasil health asli dari layar muat (kalau ada).

BAB 2:
CARA KERJA 'Papan storyboard': empat lembar kertas ditempel selotip di papan teal, miring tidak sama, berisi poster take, nomor gunting, dan teks 4 langkah dari halaman live. Lembar masuk dengan efek ditempel. Di HP digeser mendatar (scroll-snap).
API 'Konsol lengkap' (#api): konsol melebar selebar konten. Tab 'Contoh 1' dan 'Contoh 2' berisi curl persis dengan tombol 'Salin', panel 'Jawaban' 5 field dengan satu kalimat per field (dicocokkan ke dokumentasi), dan isian 'Coba awalan' dengan pemeriksa panjang langsung: 'terlalu pendek (minimal 3)', 'pas', 'terlalu panjang (maksimal 20)'.
SEMUA ENDPOINT 'Daftar take': tabel teks biasa berisi 7 baris dengan chip metode berwarna, jalur mono, dan keterangan dari halaman live. Ada poster kecil yang memutar loop take saat disentuh. Ketuk baris untuk melompat ke take-nya.
DOMAIN 'Empat papan skate': empat kartu berbentuk papan skate panjang (CSS, motif bunga, pinggir oranye), masing-masing dengan satu monyet potongan. Ketuk untuk menyalin domain, dan monyetnya melompat ollie (GSAP).
TENTANG 'Catatan sutradara': kertas putih miring, catatan orang pertama dengan kerangka 'Saya NongBana. Sebelum ini saya membuat BanaMail.' Kalimat lainnya diisi LO. Tanda tangan 'NongBana · [kota] · [tahun]' tersembunyi sampai diisi.
PENUTUP 'Giliranmu': konsol kosong besar dengan kursor berkedip lalu 'Sekarang giliran kodemu.' (EN 'Your code's turn.'). Tombol 'Salin perintah pertama' dan 'Tanya: admin@venbeemail.com'. Tautan kecil 'Cuma butuh email sementara? Pakai BanaMail.'

OPSIONAL NANTI, mati secara bawaan: mode 'Pakai API asli'. Hanya dinyalakan kalau server sudah punya batas pemakaian per IP, CORS jelas, dan tanpa kunci. Token hanya disimpan di memori dan disamarkan.

**Footer maskot.**

Tulisan raksasa 'BIKIN. BACA. BUANG.' (EN 'MAKE. READ. TOSS.'), huruf gunting biru kobalt bermotif bunga, tiap kata miring berbeda, dengan 'BACA.' paling besar. Lapis belakang: klip siaga yang sama diputar redup (tanpa biaya tambahan). Maskot dari potongan transparan naik dari tengah bawah mengikuti gulir, badannya menutupi sebagian 'BACA', dan kotak surat menembus batas atas tulisan. Ini kotak yang tadi ditutup di take 5, jadi saat maskot tiba konsol kecil di samping kotak mengetik ulang 'POST /api/addresses' dan label baru tercetak 'alamat-baru@surat.venbeemail.com' (contoh). Kotak terlambat sedikit lalu memantul. Ketuk kotak dan amplop meloncat keluar. Baris bawah: logo X, Threads, GitHub, LinkedIn (tersembunyi sampai diisi); di tengah titik status dari hasil health asli ('API menjawab · diperiksa saat halaman dibuka', tidak tampil kalau gagal); di kanan admin@venbeemail.com, BanaMail, ID/EN.

**Tipografi dan warna.**

Mono jadi bintang: konsol kaca gelap #00141a dengan teks putih, metode oranye/kobalt, dan kursor oranye. Judul memakai huruf gunting. Panggung tetap teal dengan sorotan. Papan clapper hitam-putih dari potongan kertas, aksen oranye.

**Video Seedance 2.5.**

Pola hub: hampir semua klip first+last ke bingkai siaga yang sama, dirakit Claude dengan Pillow. 720p 16:9, audio mati, diekspor MP4 H.264 540p sekitar 250-450 KB per klip, plus poster WebP.
S0 siaga, 4 dtk, first+last K0 ke K0. 'spotlight sway, paper dust, mascot breathing while holding mailbox overhead, static camera, loop'.
T1 alamat, 5 dtk, first+last K0 ke K0. 'quick whip push-in to the mailbox slot, warm light flickers inside, camera returns to wide'.
T2 kurir, 6 dtk, first+last K0 ke K0. 'paper plane carrying felt envelope flies in, envelope drops into the slot, mailbox wobbles, plane exits'.
T3 baca, 5 dtk, first+last K0 ke K0. 'envelope pops up from the slot, flap opens briefly, slides back in'.
T4 lampiran, 6 dtk, first frame K0, ujung diambil sebagai KP. 'white paper plane rises from the slot, circles the stage, dives toward the lens'. Kembali ke siaga lewat potongan cepat ke S0.
T5 tutup, 5 dtk, first+last K0 ke K0. 'spotlights dim, mailbox lid closes, spotlight pulses three times like a heartbeat, back to bright'.
Pose besar maskot (menurunkan kotak ke dada, kotak kempis) sengaja dihindari.

**Perkiraan biaya video.**

Sekitar $7,1 per putaran. Dengan 2-3 kali ulang untuk T2 dan T4, sekitar $18-22.

**Versi HP.**

Muatan awal sekitar 1,0 MB: kode sekitar 110 KB, GSAP + ScrollTrigger sekitar 50 KB, 2 font sekitar 90 KB, klip siaga 540p sekitar 250 KB, poster K0 40 KB, potongan monyet 512 dimuat belakangan. Panggung video selebar layar di atas dan konsol di bawah. Take memakai section 100svh dan position: sticky. Perintah panjang digeser menyamping di dalam konsol. Klip take dimuat saat take sebelumnya terlihat. Kalau Save-Data aktif, klip tidak diputar otomatis; tampil poster + tombol 'Putar take'. Storyboard dan daftar take digeser jari, papan skate disusun 2x2.

**Mode kurangi gerakan.**

Tanpa video otomatis, pengetikan bertahap, atau pin. Tiap take tampil sebagai poster + perintah lengkap + jawaban contoh, dengan tombol 'Putar' kalau pengunjung mau. Monyet tidak melompat, dan maskot footer langsung di posisi akhir.

**Tingkat kesulitan.**

Sedang ke mudah. Paling aman dari sisi teknis video.

**Risiko.**

1) Rasa sinematiknya lebih kecil dari film scrub, karena klip diputar sekali. Penawarnya transisi clapper dan whip yang tegas. 2) Pengulangan 'ketik, Enter, putar' bisa membosankan, jadi cukup 5 take dan tombol 'Langsung ke curl' selalu ada. 3) Layar muat tidak boleh menahan halaman. 4) Semua jawaban konsol harus bertanda 'contoh' dan memakai bentuk jawaban dari dokumentasi live. 5) Mode API asli jangan dirilis sebelum ada batas di server.

### K5. Film Satu Surat dengan Teks Terjemahan

Total video: 30 detik

**Inti.**

Satu film yang maju-mundur mengikuti gulir, dengan setiap adegan adalah satu panggilan API, dan di bawah layar ada bilah 'teks terjemahan' ala bioskop yang mengetik request dan jawaban mengikuti gulir. Film sekaligus dokumentasi, dengan pemeran yang punya peran teknis: kotak surat = alamat, amplop = surat, pesawat kertas = lampiran, monyet = kurir.

**Cocok untuk.**

Cocok kalau LO ingin halaman paling mendidik: developer paham alur produk hanya dengan menonton, dan peninjau melihat tujuh endpoint 'diperankan'.

**Kenapa lebih menarik dari Kong.**

1) Film Kong indah tapi tidak menjelaskan produknya. Di sini tiap adegan adalah satu panggilan API. 2) Kong bisu selama film, sedangkan di sini bilah terjemahan ikut terketik dan terhapus saat gulir mundur, seperti memutar balik request. 3) Daftar pemeran teknis gampang diingat. 4) Lingkaran tertutup: kotak ditutup di film, dan footer membawa kotak baru naik.

**Alur lengkap.**

PEMBUKA: bingkai 0 film (maskot di podium mengangkat kotak) + CSS, dengan VENBEEMAIL PRO, kalimat 'Kotak masuk uji lewat API.', tombol 'Lihat API' dan 'Tonton film'. Daftar pemeran kecil di pojok seperti poster film: 'Kotak = alamat · Amplop = surat · Pesawat = lampiran · Monyet = kurir'.

BAB 1 'FILM SATU SURAT' (urutan bingkai di canvas, pin 700 persen di desktop dan 500 persen di HP, scrub 0,5). Penanda babak di pojok: 'Babak 1/4 · Buat alamat'. Bilah terjemahan mono di bawah: baris atas request (metode oranye), baris bawah jawaban (pil kecil). Nilai contoh ditandai 'contoh', dan token selalu ••••••.
BABAK 1 BUAT ALAMAT: kamera dolly-in ke kotak di atas kepala maskot, tutup kotak terbuka dan cahaya hangat keluar. Saat kamera diam, HTML menulis label 'uji-login@kotak.venbeemail.com' di badan tabung. Bilah: '> POST /api/addresses' / '< address · local · domain · expiresAt · token'.
BABAK 2 SURAT DATANG: kamera crane mundur-naik melihat panggung dari atas. Pesawat kertas membawa amplop dan menjatuhkannya ke celah. Monyet potongan meluncur di tepi panggung sebagai kurir (GSAP). Bilah: '> GET /api/mailbox' / '< 1 surat (contoh)'. Lencana angka '1' muncul di kotak.
BABAK 3 BACA DAN AMBIL: amplop di podium, tutup terangkat, dan tempelan hantu bergoyang. Kertas surat berupa kartu HTML (bukan video) naik berisi contoh subjek dan isi. Bilah: '> GET /api/messages/:id'. Lalu centang SVG oranye digambar di amplop. Bilah: '> PATCH /api/messages/:id' dengan arti dari dokumentasi live. Lalu pesawat kertas kecil (potongan) terbang dari amplop mengitari panggung. Bilah: '> GET /api/messages/:id/attachments/:n'.
BABAK 4 SELESAI: sorotan meredup, tutup kotak menutup, label HTML dicoret dan dicap 'DIHAPUS'. Bilah: '> DELETE /api/addresses/me'. Lalu sorotan berdenyut tiga kali. Bilah: '> GET /api/health'.
KARTU PENUTUP BAB: teal hampir hitam, logo besar, 'venbeemail.com/pro', dan satu baris mono '7 endpoint · 4 domain'.

BAB 2:
CARA KERJA 'Pita film': empat kotak bingkai pita film dengan lubang sproket, berjalan mendatar sesuai gulir (HP: scroll-snap). Tiap kotak berisi poster babak, nomor gunting, dan teks 4 langkah dari halaman live. Ketuk untuk melompat ke babak itu di film.
API 'Ruang proyeksi': latar gelap dengan berkas cahaya proyektor. Kiri: dua curl persis dengan tombol Salin. Kanan: poster babak 1 (kotak berlabel). Jawaban contoh muncul satu per satu, dan tiap field ditarik garis oranye tipis ke bendanya: address ke label, local ke bagian sebelum @, domain ke sesudah @, expiresAt ke cincin hitung mundur SVG di kotak, token ke satu tempelan di jaket maskot. Penggaris kertas 20 kotak: awalan 'uji-login' mengisi 9 kotak, dengan catatan 'awalan 3-20 karakter'.
SEMUA ENDPOINT 'Adegan ulang': tujuh panel layar penuh berganti dengan pudar, masing-masing memakai bingkai diam dari babak film (bukan loop MP4, jadi hemat), dengan nama metode raksasa berhuruf gunting, jalur mono, dan keterangan resmi dari halaman live. Di bawahnya tabel teks biasa ketujuh endpoint.
DOMAIN 'Empat jalur': latar bingkai panggung dari atas, empat monyet potongan berdiri di empat jalur lantai dengan label domain. Ketuk untuk menyalin, dan monyet di jalur itu disorot dan melompat kecil.
TENTANG 'Kredit penutup': teks bergulir pelan seperti akhir film: 'Disutradarai dan dikodekan oleh NongBana' / 'Pemeran: Pisang Zombie sebagai Kotak Masuk · Empat Monyet sebagai Kurir · Amplop Hantu sebagai Surat · Pesawat Kertas sebagai Lampiran' / 'Dari pembuat BanaMail' / [cerita, kota, tahun dari LO, tersembunyi sampai diisi].
PENUTUP 'Manifesto': huruf gunting putih raksasa naik baris demi baris: 'TES EMAIL' / 'TANPA' / 'MENGOTORI' / 'KOTAK MASUKMU.' (EN 'TEST EMAIL / WITHOUT / CLUTTERING / YOUR INBOX.'), dengan label metode mono kecil berganti di kiri. Tombol 'Lihat contoh curl' dan 'Tanya: admin@venbeemail.com'.

**Footer maskot.**

Tulisan raksasa dua baris 'KOTAK MASUK' / 'UNTUK KODEMU' (EN 'AN INBOX' / 'FOR YOUR CODE'), huruf gunting kobalt bermotif bunga dengan tetesan oranye seperti wordmark lama BanaMail (tetesan CSS jatuh pelan). Lapis belakang loop sorotan. Maskot dari potongan naik dari tengah bawah mengikuti gulir (translateY 60 persen ke 0, scrub). Badannya menutupi tengah kedua baris, dan kotak surat melewati batas atas baris pertama. Kotak terlambat 0,1 lalu memantul. Ini kotak baru (di film tadi ditutup), jadi label terketik ulang 'alamat-baru@pos.venbeemail.com' (contoh) dengan teks kecil 'Alamat baru? Satu POST lagi.' Bilah terjemahan muncul sekali lagi di bawah: '> POST /api/addresses'. Baris bawah: logo sosial (tersembunyi sampai diisi), 'Dari pembuat BanaMail', admin@venbeemail.com, ID/EN.

**Tipografi dan warna.**

Bilah terjemahan mono putih di pita hitam transparan seperti subtitle bioskop. Metode oranye, jawaban kobalt muda #77a3e4. Judul huruf gunting, kredit penutup memakai sans tipis rata tengah. Bingkai pita film dan berkas proyektor menambah rasa bioskop tanpa warna baru.

**Video Seedance 2.5.**

720p 16:9, audio mati, rantai first+last. Bingkai kunci dirakit Claude dengan Pillow. Perubahan bentuk origami (kertas jadi pesawat, kotak kempis) diganti potongan + HTML.
A1 alamat, 6 dtk, first+last (K0 lebar ke K1 close-up kotak dengan tutup terbuka bercahaya). 'slow dolly-in and rise to the mailbox held overhead, lid opens, warm glow'.
A2 surat-datang, 7 dtk, first+last (K1 ke K2 panggung dari atas, amplop di celah). 'crane back and up, paper plane drops felt envelope into the slot'.
A3 amplop-podium, 5 dtk, first+last (K3 amplop tertutup di podium ke K4 tutup terbuka, hantu mengintip). 'envelope flap lifts, ghost patch wiggles'.
A4 sorot-redup, 6 dtk, first+last (K5 kotak tutup terbuka ke K6 tutup tertutup, panggung redup lalu terang). 'spotlights dim, mailbox lid closes, then spotlight pulses three times'.
L1 sorotan-loop, 6 dtk, first+last sama. Footer.

**Perkiraan biaya video.**

Sekitar $6,9 per putaran. Anggarkan sekitar $20.

**Versi HP.**

Muatan awal sekitar 1,1 MB: kode sekitar 110 KB, GSAP sekitar 50 KB, 2 font sekitar 90 KB, poster pembuka 60 KB, potongan 512 sekitar 200 KB, bingkai babak 1 sekitar 0,6 MB. Film 540x960 potongan tengah, 10 fps, sekitar 240 bingkai (sekitar 5 MB) dimuat per babak. Bilah terjemahan satu baris (request), jawaban jadi pil kecil di atasnya. Penanda babak pindah ke atas di bawah menu. Pita film digeser jari, panel endpoint jadi kartu bertumpuk, curl di kotak yang digeser menyamping (tidak dipecah \). Footer tiga baris 'KOTAK' / 'MASUK UNTUK' / 'KODEMU'.

**Mode kurangi gerakan.**

Tanpa pin dan scrub. Film diganti komik 6 panel dengan keterangan request di bawah tiap panel. Bilah terjemahan tampil lengkap, kredit tidak bergulir, panel endpoint diam, dan maskot footer langsung di posisi akhir.

**Tingkat kesulitan.**

Sedang ke berat (sinkron bilah teks dengan gulir dan babak).

**Risiko.**

1) Rasa tutorial bisa mengalahkan rasa wah, jadi gerak kamera di A1-A2 harus tegas. 2) Bilah terjemahan jangan menutupi bagian penting film di layar kecil. 3) Arti PATCH, bentuk expiresAt, dan indeks lampiran wajib dari dokumentasi live. 4) Semua nilai contoh harus diberi tanda 'contoh'. 5) Kartu HTML yang menempel di benda hanya muncul saat kamera diam.

### K6. Kamera Mundur (misteri tangan kertas)

Total video: 21 detik

**Inti.**

Hero hanya memperlihatkan kotak surat kardus yang diangkat dua tangan kertas dari bawah layar. Halaman mempelajari kotak itu: ia mengeluarkan surat, dan suratnya berubah jadi kartu teks asli. Di footer kamera mundur dan baru terlihat siapa yang sejak awal mengangkatnya: maskot pisang.

**Cocok untuk.**

Cocok kalau LO ingin yang paling cepat jadi, paling ringan, dan paling mudah dibaca, dengan rasa halaman produk premium. Bagus sebagai versi pertama yang bisa ditingkatkan nanti.

**Kenapa lebih menarik dari Kong.**

1) Ada misteri dari detik pertama: tangan siapa itu? Terjawab di footer. Kong muncul begitu saja. 2) Awal dan akhir halaman adalah satu gambar yang sama, hanya kameranya yang mundur, jadi terasa utuh. 3) Benda berubah jadi antarmuka: amplop terbuka dan isinya jadi kartu JSON yang bisa dipilih dan disalin. 4) Ritme gelap-terang membuat isi teknis jauh lebih mudah dibaca. 5) Hero terbaca dengan sekitar 0,3 MB, tanpa layar muat.

**Alur lengkap.**

LAYAR MUAT: tidak ada.

PEMBUKA: gambar diam kotak surat kardus di tengah, logo pisang terlihat jelas, dengan dua tangan kertas terpotong di tepi bawah layar. Video loop (kotak naik-turun pelan seperti dipegang orang bernapas) dimuat setelahnya. Judul VenbeeMail Pro, kalimat 'Kotak masuk uji lewat API.', tombol 'Lihat API' dan 'Cara kerja'. Tiga ubin fakta kecil: '7 endpoint · 4 domain · awalan 3-20 karakter'.

BAB 1 'STUDI BENDA' (pin 400 persen di desktop dan 260 persen di HP, scrub 0,5, urutan bingkai di canvas):
Adegan 1 'Kotaknya' (0-25 persen): kamera mengorbit 15 derajat, kilau lewat di tutup tabung. Garis penunjuk ala label spesifikasi ke celah ('tempat surat masuk') dan ke tutup ('punya waktu kedaluwarsa'). Kartu kecil bertanda 'contoh' naik di samping berisi jawaban POST: address, local, domain, expiresAt, token (<token>). Kalimat: 'Satu kotak untuk setiap tes.' Label: POST /api/addresses.
Adegan 2 'Suratnya' (25-50): tabung bergetar dan amplop flanel meluncur keluar ke arah kamera. Kalimat: 'Setiap surat yang masuk bisa dibaca lewat API.' Label: GET /api/mailbox.
Adegan 3 'Isinya' (50-75): tutup amplop terbuka, canvas memudar 40 persen dan kabur 6 px, lalu kartu surat HTML naik dari amplop. Isinya bentuk surat sesuai dokumentasi live (misalnya pengirim, subjek, isi), bertanda 'contoh'. Ini perbaikan dari konsep asli yang salah memasang field POST di adegan ini. Label: GET /api/messages/:id.
Adegan 4 'Selesai' (75-100): kartu turun ke amplop, amplop berputar keluar bingkai, dan pesawat kertas potongan terbang ke kanan atas (GSAP). Kotak kembali ke posisi hero lalu turun keluar layar seolah pemegangnya berjongkok. Label: DELETE /api/addresses/me.

BAB 2 (lembar putih bertumpuk hanya untuk Cara kerja dan Endpoint; bagian lain tetap teal):
CARA KERJA (lembar putih, position: sticky, bertumpuk di atas Bab 1): judul 'Dari buat sampai bersih, empat langkah.' Empat kartu besar bersudut 28 px, digeser menyamping (scroll-snap) dengan tombol ‹ › dan titik penanda. Tiap kartu punya satu monyet yang menyembul melewati tepi atas kartu dan masuk dengan ollie kecil. Teks 4 langkah dari halaman live.
API (teal): dua kolom. Kiri judul 'Dua perintah untuk mulai' yang menempel (sticky). Kanan dua kartu kode curl persis dengan tombol Salin. Saat digulir, baris menyala satu per satu dan jawaban contoh tercetak baris per baris dengan garis penunjuk ke penjelasan 5 field.
SEMUA ENDPOINT (lembar putih): tiga ubin fakta besar ('7', '4', '3-20') dari huruf gunting yang dirakit dari kepingan, lalu tabel spesifikasi tenang: metode mono berwarna, jalur, dan keterangan dari halaman live.
DOMAIN (teal, panggung): di HP deretan pelat kertas biru bunga digeser (scroll-snap); di desktop cincin 3D CSS 4 pelat yang berputar 90 derajat per domain. Isian awalan dengan pratinjau 'awalan@domain' dan pemeriksa 3-20. Ketuk pelat untuk menyalin.
TENTANG (teal): kartu media berisi wordmark lama BanaMail dengan tetesan oranye (loop), dan teks 'VenbeeMail Pro dibuat oleh NongBana, pembuat BanaMail.' + isian LO tersembunyi sampai diisi. Tautan 'Buka BanaMail ›' dan admin@venbeemail.com.
PENUTUP (teal): 'Kotak pertamamu tinggal satu panggilan lagi.' Tombol 'Salin contoh curl' dan 'Tanya lewat email'. Di atas judul, kotak surat yang sama dengan hero muncul kecil dengan tangan terpotong. Saat digulir, judul memudar dan kotak membesar ke tengah, menjadi awal footer.

**Footer maskot.**

'Kamera mundur', pin 150 persen, scrub 0,6. (1) 0-20 persen: kotak surat dan tangan kertas memenuhi tengah layar, persis seperti hero. (2) 20-65 persen: satu grup berisi potongan badan maskot dan potongan kotak (dipotong dari gambar yang sama, jadi posisinya pas) mengecil dari skala 1,5 ke 1 sambil naik dari bawah. Skalanya dibatasi 1,5 dan memakai potongan resolusi terbesar supaya tidak buram. Pelan-pelan terlihat kupluk oranye, mata pink, lidah keluar, jaket denim penuh tempelan, lalu kaki yang terpotong tepi bawah. (3) 40-80 persen, di belakang maskot: tulisan raksasa 'BIAR DIA' / 'YANG ANGKAT.' (EN 'LET HIM' / 'DO THE LIFTING.'). Kata 'dia' merujuk ke maskot, jadi tidak ada klaim tim. Huruf sans 900 selebar layar dengan gradasi putih ke #77a3e4, jarak huruf menyempit dari 0,2em ke -0,04em. Badan menutupi tengah 'DIA' dan 'YANG', dan kotak menembus di atas baris pertama. Empat monyet potongan kecil berdiri di lantai depan dan menoleh ke atas. (4) 80-100 persen: kotak terdorong naik 14 px lalu menetap, kemudian maskot bernapas, kotak bergoyang ±1,5 derajat, dan mata berkedip. Ketuk kotak dan pesawat kertas kecil keluar dari celah. Baris bawah: logo, 'Dibuat oleh NongBana', admin@venbeemail.com, tautan bagian dan BanaMail, ID/EN, empat tombol bulat kaca 44 px berlogo X, Threads, GitHub, LinkedIn (tersembunyi sampai diisi).

**Tipografi dan warna.**

Gelap-terang: teal #01232d untuk tontonan, lembar putih #f7f7f4 untuk dokumentasi dengan teks teal tua. Sans tebal 900 untuk judul besar, huruf gunting hanya untuk angka fakta dan nomor langkah, mono untuk kode. Oranye untuk tombol dan POST. Kesan seperti halaman produk premium.

**Video Seedance 2.5.**

720p 16:9, audio mati. Bingkai kunci dirakit Claude: bagian atas latar panggung + potongan kotak bertangan dari gambar maskot, dengan lengan terpotong tepi bawah. Tepi video dilebur ke #01232d dengan mask radial.
V1 kotak-pegang-loop, 6 dtk, first+last sama. 'cardboard tube mailbox held up by paper hands from below frame, gentle breathing bob, camera orbits 15 degrees left and back, light glint on lid, loop'. Hero + adegan 1.
V2 kotak-keluar-amplop, 6 dtk, first+last (awal V1; akhir sama + amplop besar melayang di depan tabung). 'tube shakes, felt envelope slides out of the slot and floats toward camera, push-in'. Adegan 2.
V3 amplop-buka, 5 dtk, first+last (akhir V2 ke amplop terbuka). 'envelope flap opens and holds'. Adegan 3. Lipatan jadi pesawat dihapus dan diganti potongan + GSAP.
V4 banamail-tetes-loop, 4 dtk, first+last sama (wordmark lama di teal). 'orange drips slowly ooze and wobble, paper glint, loop'. Tentang.

**Perkiraan biaya video.**

Sekitar $4,8 per putaran. Anggarkan sekitar $15.

**Versi HP.**

Hero terbaca dengan sekitar 0,3 MB (kode sekitar 100 KB, font 65 KB, gambar diam hero 720 px sekitar 50 KB, GSAP 50 KB). Loop hero persegi 720 px (sekitar 350 KB) dan bingkai studi benda (sekitar 1,8 MB, setiap bingkai ketiga) datang setelahnya; total muatan awal tetap di bawah 1 MB. Hero: kotak 92 persen lebar layar, judul 44-52 px. Studi benda pin 260 persen, kalimat di pita gelap di atas gambar, kartu JSON selebar layar dikurangi gutter 16 px dengan mono 13 px. Kartu Cara kerja 86 persen lebar layar supaya kartu berikutnya mengintip. API satu kolom. Domain pakai pelat scroll-snap. Footer 'BIAR' / 'DIA' / 'YANG' / 'ANGKAT.', maskot 512 (skala maksimal 1,4).

**Mode kurangi gerakan.**

Tanpa pin dan scrub. Hero gambar diam, studi benda jadi 4 gambar diam berurutan dengan kalimat dan kartu langsung tampil, lembar tidak bertumpuk, footer langsung dalam komposisi akhir.

**Tingkat kesulitan.**

Mudah ke sedang. Paling cepat jadi.

**Risiko.**

1) Rasa wahnya paling kalem. Bisa diangkat dengan modul footer atau gaya judul dari bank modul. 2) Potongan tangan kertas harus bisa dipisah rapi dari gambar maskot, jadi cek dulu. 3) Skala grup footer dibatasi supaya tidak buram. 4) Kartu JSON dan surat wajib bertanda 'contoh'. 5) Kalimat Tentang tunggu LO.

### K7. Buku Pop-Up Pos Pisang (versi ringan)

Total video: 27 detik

**Inti.**

Halaman tampil seperti buku pop-up raksasa di atas meja teal. Tokoh kertas berdiri dari lipatan tengah, film Bab 1 diputar di teater kertas berbingkai tirai oranye, dan di halaman terakhir maskot pisang berdiri dari lipatan seperti mekanik pop-up sambil mengangkat kotak surat, tepat saat pesawat kertas masuk ke celahnya.

**Cocok untuk.**

Cocok kalau LO ingin dunia yang paling menyatu dengan aset papercraft dan suka interaksi yang bisa disentuh, serta siap dengan pekerjaan CSS 3D yang lebih banyak.

**Kenapa lebih menarik dari Kong.**

1) Bahannya cocok: semua tokoh memang origami, jadi dunia buku (kertas, lipatan, selotip, perangko) terasa satu barang, bukan film CGI yang ditempel. 2) Ada mekanik yang bisa disentuh: roda kertas putar, kantong kartu, perangko. 3) Footer pop-up V-fold adalah versi 'tokoh naik di depan tulisan' yang paling khas dan tidak meniru Kong. 4) Video kecil di jendela teater dan 12 fps, jadi hemat.

**Alur lengkap.**

Catatan penting versi ringan: isi teknis TIDAK dibalik per halaman. Halaman digulir biasa, tiap bagian adalah 'bentangan buku' (dua halaman berdampingan di desktop, satu halaman di HP) dengan pop-up kecil, supaya curl bisa disalin, dicari dengan Ctrl+F, dan dibuka lewat tautan #api. Balik halaman 3D hanya dipakai 2 kali: setelah film dan sebelum footer.

PEMBUKA: buku terbuka di meja teal. Halaman kiri: VENBEEMAIL PRO berhuruf potong, kalimat 'Kotak masuk uji lewat API.', tombol 'Lihat API' dan 'Cara kerja'. Halaman kanan: panggung pop-up (latar + podium + amplop) yang berdiri dengan rotateX dari 60 ke 0 saat halaman dibuka, dengan loop sorotan kecil di belakang. Menu: logo kiri atas dan pil kaca di tengah, dengan tab pembatas warna-warni sebagai hiasan di tepi kanan buku.

BAB 1 'SURAT PERTAMA' (teater pop-up tanpa teks, pin 500 persen di desktop dan 380 persen di HP). Video diekspor jadi urutan bingkai 12 fps di canvas, tidak di-scrub lewat currentTime, supaya aman di iPhone. 0-8 persen tirai kertas membuka (dua panel rotateY). F1: kamera mendekat ke amplop di podium, tutup terangkat, hantu mengintip. F2: pesawat kertas lepas landas membawa amplop melintasi panggung. F3: estafet empat monyet sebagai potongan pop-up yang bergerak di rel kertas di depan layar teater, dioper dengan MotionPath (gaya buku pop-up dengan tuas tarik, jadi tidak perlu video multi-referensi). F4: pesawat menukik ke celah kotak yang diangkat maskot. F5: kamera mundur dan naik, panggung tampak kecil di halaman buku di atas meja. Lalu tirai CSS menutup dan buku dibalik (satu balikan 3D) ke Bab 2. Kejutan 'video sama persis dengan HTML' dihapus.
KARTU BAB: kertas pembatas kobalt dengan tab menyembul, cap bulat 'Bab 2 · Isi buku' dan 'venbeemail.com/pro'.

BAB 2:
CARA KERJA: roda kertas putar (volvelle). Piringan di halaman kiri berputar 90 derajat per 25 persen gulir (steps(6), seperti diputar tangan), dan jendela potongnya menampilkan ikon amplop, pesawat, monyet, kotak kosong. Halaman kanan menampilkan ke-4 langkah dari halaman live sebagai daftar penuh (yang aktif disorot), jadi semua langkah selalu terbaca.
API: kantong kertas berjahit di halaman kiri mengeluarkan dua kartu indeks bergaris kobalt berisi curl persis, masing-masing dengan tombol 'Salin' berupa label gantung yang memantul lalu berubah 'Tersalin'. Halaman kanan: surat lipat tiga membuka (rotateX) memperlihatkan jawaban contoh dengan panah kertas oranye ke address, local, domain, expiresAt, token. Ada stempel 'awalan 3-20 karakter' dan isian pratinjau awalan.
SEMUA ENDPOINT: kipas lipat (leporello) 7 panel yang membuka sekali saat masuk layar. Tiap panel berisi cap metode, jalur mono besar, dan keterangan dari halaman live. Di bawahnya tabel teks biasa.
DOMAIN: halaman berbentuk amplop besar. Empat perangko bergerigi menempel dengan efek 'tok' (scale 1,15 ke 1, rotasi acak ±4 derajat), masing-masing memuat potret satu monyet. Ketuk untuk menyalin.
TENTANG: halaman scrapbook. Wordmark lama BanaMail ditempel selotip oranye dengan label 'tempat semuanya mulai', potongan maskot di pojok, dan teks 'VenbeeMail Pro dibuat oleh NongBana, pembuat BanaMail.' + isian LO tersembunyi sampai diisi.
PENUTUP: amplop flanel pop-up di tengah membuka dan kartu naik: 'Surat pertamamu tinggal satu curl lagi.' Tombol 'Salin curl' dan 'Tanya: admin@venbeemail.com'. Lalu buku dibalik sekali lagi ke halaman terakhir.

**Footer maskot.**

Halaman terakhir buku, pin 150 persen. 0-30 persen: halaman membuka rata (rotateY 90 ke 180). Tulisan raksasa kertas potong dua baris 'SURAT / SAMPAI.' (EN 'MAIL / DELIVERED.'), huruf putih bergaris kobalt dengan bayangan oranye, clamp(64px, 19vw, 280px), berdiri baris demi baris (tiap huruf rotateX -90 ke 0, jeda 0,04). 30-80 persen: maskot naik dari lipatan tengah seperti mekanik pop-up V-fold. Dua tab penyangga kertas putih terlihat di belakang kakinya. Badan (maskot-badan) dari translateY 65 persen ke 0, rotateX 30 ke 0, skala 0,92 ke 1. Kotak (maskot-kotak) ikut naik dengan jeda 0,12 detik lalu memantul 4 px. Urutan lapis: huruf, badan, kotak. Badan menutupi separuh bawah kata 'SAMPAI'. 80-100 persen: pesawat kertas terbang dari kiri lewat MotionPath dan masuk ke celah, kotak bergetar dua kali, mata berkedip. Latar loop sorotan yang sama. Sesudah itu maskot bernapas pelan. Slogan kecil: 'Kotak masuk uji untuk kodemu. Dari pembuat BanaMail.' Baris bawah berupa tab kertas kecil berlogo X, Threads, GitHub, LinkedIn (tersembunyi sampai diisi), admin@venbeemail.com, ID/EN, 'Kurangi gerakan', '© NongBana'.

**Tipografi dan warna.**

Kertas putih hangat untuk halaman buku, meja teal #01232d, tirai dan selotip oranye, pembatas kobalt. Judul kertas potong (huruf gunting) dengan bayangan lipatan; teks isi sans; kode mono di kartu indeks bergaris.

**Video Seedance 2.5.**

720p 16:9 dengan subjek di tengah, dipotong 4:3 untuk jendela teater. Diekspor jadi bingkai WebP 12 fps. Bingkai kunci dirakit Claude.
P1 panggung-hidup, 6 dtk, first+last sama (panggung + podium kosong). Hero, Penutup, footer.
F1 amplop-terbuka, 5 dtk, first+last (amplop tertutup ke amplop terbuka, hantu mengintip). 'slow push-in, flap lifts, ghost patch peeks'.
F2 pesawat-terbang, 6 dtk, first+last (pesawat membawa amplop di podium ke pesawat di kanan jauh). 'paper plane carrying envelope takes off and glides across the stage, spotlight sweeps'.
F4 masuk-kotak, 5 dtk, first+last (maskot mengangkat kotak dengan pesawat kecil di kiri atas ke pose sama, pesawat hilang, mata menyipit). 'plane dives into the slot, mailbox wobbles, eyes squint happily'.
F5 mundur, 5 dtk, first+last (akhir F4 ke panggung kecil di halaman buku putih di atas meja teal, dirakit Claude). 'camera pulls back and up revealing the stage is a pop-up on a book page'.
Estafet F3 tanpa video (potongan pop-up).

**Perkiraan biaya video.**

Sekitar $6,2 per putaran. Anggarkan sekitar $18-20.

**Versi HP.**

Buku menjadi 'buku kalender' tegak dengan spiral di atas, satu halaman per layar. Balik halaman (hanya 2 kali) memakai rotateX dengan poros di tepi atas. Pop-up maksimal 2 lapis per halaman. Teater selebar layar dengan bingkai 540 px. Kalau deviceMemory kurang dari 4 atau Save-Data aktif, film diputar sebagai 5 gambar yang berganti saat digulir. Roda putar mengecil di separuh atas layar, kipas endpoint membentang ke bawah, perangko 2x2. Muatan awal sekitar 0,9 MB (kode 60 KB, GSAP + MotionPath 75 KB, 2 font 90 KB, potongan 512 sekitar 350 KB, poster 40 KB, bingkai pembuka teater sekitar 250 KB).

**Mode kurangi gerakan.**

Tidak ada balik halaman. Tiap bentangan tampil terbuka dan ditumpuk biasa, pop-up sudah berdiri, film diganti 5 gambar diam berketerangan, roda menampilkan 4 langkah sebagai daftar, kipas sudah terbuka, dan maskot footer langsung berdiri di depan tulisan.

**Tingkat kesulitan.**

Berat (banyak mekanik CSS 3D yang perlu disetel di Safari dan Chrome).

**Risiko.**

1) Mekanik 3D (volvelle, kantong, kipas, surat lipat tiga) masih banyak. Bisa dikurangi: buang kipas dan surat lipat tiga kalau waktu mepet. 2) rotateX dan rotateY di Safari kadang berkedip; pakai backface-visibility dan uji di iPhone asli. 3) Gambar pop-up tidak boleh membuat teks setengah terlihat saat diam. 4) Menu pil kaca dan tab pembatas jangan bersaing; tab cukup jadi hiasan dan tautan sekunder.

## Bank modul

Modul bisa dicampur ke konsep mana pun.

### Layar muat

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| LM1 | Bilah kemajuan jujur | Logo + bilah yang benar-benar menghitung bingkai adegan pertama yang sudah terunduh, paling lama 1,2 detik, dilewati di mode kurangi gerakan. | Sangat ringan (CSS + beberapa baris JS). |
| LM2 | Cek denyut API | Konsol kecil mengetik GET /api/health dan menunggu jawaban asli dengan batas waktu 1,5 detik. Kalau gagal, ditutup tanpa tulisan palsu. | Ringan, satu panggilan jaringan. |
| LM3 | Sobek blok catatan | Selembar kertas catatan bertuliskan logo dicabut dari blok dalam 4 bingkai stop-motion. | Ringan (sprite kecil atau clip-path). |
| LM4 | Tirai panggung | Dua tirai kertas oranye membuka ke samping memperlihatkan panggung teal. | Ringan (dua div + transform). |
| LM5 | Tanpa layar muat | Hero langsung tampil dari gambar diam, video menyusul. Paling cepat dan paling ramah peninjau. | Paling ringan. |

### Pembuka/hero

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| HR1 | Amplop di podium | Loop amplop melayang di atas podium di belakang wordmark huruf gunting, kalimat produk, dan dua tombol. | Sedang (loop sekitar 350 KB, dimuat setelah poster). |
| HR2 | Tangan misterius | Hanya kotak surat yang diangkat tangan terpotong tepi bawah layar, dan footer nanti mengungkap pemiliknya. | Ringan (gambar diam 50 KB, loop menyusul). |
| HR3 | Lubang sobekan | Kertas putih dengan sobekan bundar, dan di dalamnya panggung hidup. | Ringan. |
| HR4 | Panggung siaga + konsol | Panggung dengan maskot bernapas di atas, konsol berkedip di samping judul. | Sedang (klip siaga 250 KB). |
| HR5 | Daftar pemeran | Gaya poster film: judul besar dan kredit kecil 'Kotak = alamat · Amplop = surat · Pesawat = lampiran · Monyet = kurir'. | Sangat ringan (teks). |

### Menu

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| MN1 | Pil kaca tengah | Seperti referensi: logo kiri, pil kaca berisi tautan bagian di tengah, ID/EN di kanan. Di HP jadi tombol 'Menu' yang membuka lembar bawah. | Ringan (backdrop-filter; matikan blur di HP murah). |
| MN2 | Tab pembatas buku | Tab kertas warna-warni menempel di tepi kanan, dan mengetuk tab melompat ke bagian. | Ringan. |
| MN3 | Pil + chip status | Pil kaca ditambah chip kecil yang berganti mengikuti cerita ('Dikirim', 'Di udara', 'Sampai'). | Ringan. |
| MN4 | Selotip kertas | Tombol 'Menu' berupa potongan selotip yang membuka lembar sobek dari atas. | Ringan. |

### Cara menggulir dan penanda kemajuan

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| GL1 | Garis rute | Garis putus-putus di bawah layar dengan amplop mini yang melewati 4 titik (Dikirim, Dioper, Di udara, Sampai). Di HP tegak di tepi kanan. | Sangat ringan (SVG). |
| GL2 | Perangko ketinggian | Perangko di pojok yang angkanya turun (12.000 km sampai 1,2 cm) selama zoom. | Sangat ringan. |
| GL3 | Penanda babak | 'Babak 2/4 · Surat datang' di pojok, cocok untuk film yang dibagi per langkah API. | Sangat ringan. |
| GL4 | Tombol Lewati | Pil 'Lewati film' di kanan bawah selama film, langsung ke Cara kerja. | Sangat ringan. |
| GL5 | Scrub urutan bingkai | Film maju-mundur mengikuti gulir memakai urutan WebP di canvas dengan campuran dua bingkai, bukan currentTime video (lebih aman di iPhone). | Berat kalau panjang; aman bila dimuat per adegan, 10 fps, dan 6 fps saat Save-Data. |
| GL6 | Putar sekali per pemicu | Klip diputar biasa saat bagiannya mencapai titik tertentu dan berhenti di bingkai siaga. Gulir mundur menampilkan poster. | Ringan (MP4 kecil, preload none). |

### Gaya judul

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| JD1 | Huruf gunting ADVANCED | Set SVG per huruf dari referensi 'ADVANCED!' (potongan tajam, miring), dengan isian tekstur flanel, kardus, kertas, atau bunga kobalt. Teks asli tetap di aria-label. | Ringan (SVG sekitar 30-60 KB untuk satu set). |
| JD2 | Huruf lipat kobalt | Huruf seperti kertas terlipat dengan sisi terang dan gelap. | Ringan. |
| JD3 | Bunga menetes | Huruf kobalt bermotif bunga dengan tetesan oranye, menggemakan wordmark lama BanaMail. | Ringan (tetesan CSS). |
| JD4 | Sans 900 bergradasi | Sans sangat tebal dengan gradasi putih ke #77a3e4 dan jarak huruf yang menyempit saat masuk. Gaya produk premium. | Sangat ringan. |
| JD5 | Cap pos | Judul kecil sebagai cap bulat bertekstur tinta yang dihentakkan. | Sangat ringan. |

### Transisi

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| TR1 | Amplop menutup layar | Sambungan antarklip disembunyikan di balik amplop yang memenuhi layar. | Nol (di dalam video). |
| TR2 | Sobek kertas | Bagian lama disobek dari bawah ke atas dengan 6 bentuk polygon dari skrip (4-6 bingkai). Batasi 3 kali per halaman. | Ringan (clip-path). |
| TR3 | Lembar bertumpuk | Lembar berikutnya naik menutupi lembar sebelumnya dengan position: sticky dan bayangan tipis. | Sangat ringan (hampir tanpa JS). |
| TR4 | Potong ke hitam | Hitam 0,2 detik antar momen, seperti film peluncuran. | Nol. |
| TR5 | Cap dihentakkan | Kartu penutup bab dengan cap pos yang menghentak (skala 1,4 ke 1, layar bergetar 2 px selama 150 ms). | Sangat ringan. |
| TR6 | Balik halaman | Balik halaman 3D, hanya untuk 1-2 momen besar. | Sedang (transform 3D). |

### Panel fitur / Cara kerja

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| CK1 | Kartu sobek bertumpuk | 4 kartu bertepi sobek saling menutup saat digulir, tiap kartu dengan satu monyet dan angka gunting. | Ringan. |
| CK2 | Pemberhentian di film | Film berhenti dan cap 'LANGKAH n' menghantam layar. Tetap sediakan daftar 4 langkah utuh di tempat lain. | Ringan. |
| CK3 | Storyboard ditempel | Empat lembar ditempel selotip miring di papan teal. Di HP digeser mendatar. | Ringan. |
| CK4 | Pita film | Kotak berbingkai sproket berjalan mendatar. Ketuk untuk melompat ke babak di film. | Ringan (scroll-snap di HP). |
| CK5 | Roda kertas putar | Volvelle berputar 90 derajat per langkah dengan easing steps, sementara daftar 4 langkah tetap terbaca di sebelahnya. | Ringan sampai sedang. |
| CK6 | Kartu monyet menyembul | Kartu besar bersudut 28 px digeser menyamping, dan monyet menyembul melewati tepi atas lalu ollie saat masuk. | Ringan. |

### Tampilan kode API

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| API1 | Kartu tiket | Kertas putih bertepi lubang dengan tab Contoh 1/2 dan tombol Salin. Kode digeser menyamping di dalam kotak, halaman tidak ikut bergeser. | Sangat ringan. |
| API2 | Pita struk | Curl tercetak dari celah kotak surat. Ada tombol Salin, dan menyobek perforasi jadi bonus. | Ringan. |
| API3 | Konsol kaca | Terminal gelap dengan tab, kursor oranye, dan panel jawaban 5 field. | Sangat ringan. |
| API4 | Ruang proyeksi | Tiap field jawaban contoh ditarik garis oranye ke bendanya (address ke label, expiresAt ke cincin waktu, token ke tempelan jaket). | Ringan (SVG). |
| API5 | Kantong kartu indeks | Dua kartu bergaris kobalt naik dari kantong kertas berjahit, dengan label gantung 'Salin'. | Ringan. |
| API6 | Tombol Jalankan (nanti) | Memanggil POST /api/addresses sungguhan. Mati secara bawaan sampai server punya batas pemakaian. Kalau gagal, tampil jawaban bertanda 'contoh' dengan <token>. | Ringan, tapi butuh kesiapan server. |

### Pemeriksa awalan 3-20

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| AW1 | Label 20 kotak huruf | Tiap huruf mengisi satu kotak, dan 3 kotak pertama bertanda 'minimal'. | Sangat ringan. |
| AW2 | Penggaris kertas | 20 takik terisi saat mengetik. Gunting kecil memotong lebih dari 20, dan penggaris jadi oranye kalau kurang dari 3. | Sangat ringan. |
| AW3 | Pratinjau alamat | 'awalan@domain-terpilih' muncul langsung, dengan catatan 'pratinjau, belum membuat alamat'. | Sangat ringan. |
| AW4 | Gema di akhir | Awalan yang diketik muncul lagi di surat balasan Penutup dan di amplop footer. | Sangat ringan. |

### Tampilan endpoint

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| EP1 | Papan keberangkatan | Split-flap kertas yang membalik sekali per baris. Teks tetap DOM asli. | Ringan (CSS 3D, di HP jadi kartu tegak). |
| EP2 | Tiket antrean | Tiap gulir menarik satu tiket bergerigi 'No. 01 · POST /api/addresses' dengan cap warna metode. | Ringan. |
| EP3 | Rak loker | Tujuh loker kardus dengan amplop berlabel. Keterangan selalu terlihat, ketuk hanya untuk hiasan. | Ringan. |
| EP4 | Lembar spesifikasi | Tabel tenang dengan pil metode, jalur mono besar, dan keterangan dari halaman live. Paling mudah dibaca. | Paling ringan. |
| EP5 | Adegan ulang | Tujuh panel layar penuh dari bingkai film dengan nama metode raksasa, dan tabel teks di bawahnya. | Sedang (7 WebP sekitar 60-80 KB, dimuat malas). |
| EP6 | Kipas lipat | Leporello 7 panel yang membuka sekali. | Sedang. |

### Domain

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| DM1 | Perangko bergerigi | Empat perangko (CSS mask). Ketuk untuk menyalin, lalu tercap 'TERSALIN'. | Ringan. |
| DM2 | Papan skate | Empat kartu berbentuk papan skate, masing-masing dengan monyet yang ollie saat diketuk. | Ringan. |
| DM3 | Bendera monyet | Monyet masuk membawa bendera kertas domain, dan memilih bendera mengubah pratinjau alamat. | Ringan. |
| DM4 | Cincin pelat | Cincin 3D CSS di atas podium (desktop), dan deretan pelat scroll-snap di HP. | Sedang di desktop, ringan di HP. |
| DM5 | Stiker alamat | Empat stiker pengiriman ditempel miring di dinding kardus. | Sangat ringan. |

### Tentang

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| TT1 | Catatan selotip | Kertas catatan dengan judul 'DI BALIK PANGGUNG'. Isian LO tersembunyi sampai diisi. | Sangat ringan. |
| TT2 | Kredit penutup | Teks bergulir seperti akhir film: 'Disutradarai dan dikodekan oleh NongBana' + daftar pemeran. | Sangat ringan. |
| TT3 | Catatan orang pertama | 'Saya NongBana. Sebelum ini saya membuat BanaMail.' Sisanya ditulis LO. | Sangat ringan. |
| TT4 | Scrapbook BanaMail | Wordmark lama BanaMail ditempel selotip dengan label 'tempat semuanya mulai'. | Ringan. |
| TT5 | Amplop berbalik | Amplop flanel berbalik 180 derajat, dan suratnya ada di belakang. | Ringan. |

### Penutup

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| PN1 | Manifesto bahan | Kata-kata raksasa naik baris demi baris, tiap kata memakai tekstur aset yang berbeda. | Ringan. |
| PN2 | Podium kosong | Podium dibiarkan kosong dengan sorotan bernapas, membangun penantian untuk footer. | Sangat ringan. |
| PN3 | Surat balasan | Surat diketik mengikuti gulir untuk {awalan}@{domain}, ditutup 'Salam, NongBana'. | Sangat ringan. |
| PN4 | Konsol giliranmu | Konsol kosong dengan kursor, lalu 'Sekarang giliran kodemu.' | Sangat ringan. |

### Footer maskot

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| FT1 | Lift panggung + surat jatuh | Lampu padam, tulisan ditempel huruf demi huruf, maskot naik dari dalam podium (clip-path + bibir podium di depan kaki), kotak memantul, lalu amplop jatuh ke celah. | Ringan (potongan + GSAP + MotionPath). |
| FT2 | Naik klasik | Paling dekat dengan Kong: maskot naik dari tengah bawah mengikuti gulir, kotak naik terlambat lalu memantul. | Paling ringan. |
| FT3 | Menembus robekan | Kertas robek berbentuk V terbalik dan maskot menembus dengan sirip sobekan di kiri-kanan. | Ringan (clip-path patah-patah). |
| FT4 | Pop-up V-fold | Maskot berdiri dari lipatan tengah buku dengan tab penyangga terlihat. | Ringan sampai sedang (rotateX). |
| FT5 | Kamera mundur | Grup badan + kotak mengecil dari dekat (skala maksimal 1,5) sampai maskot utuh terungkap. | Ringan, tapi butuh potongan resolusi tinggi. |
| FT6 | Semburan amplop | Setelah maskot tiba, beberapa amplop (3 di HP, 7 di desktop) menyembur dari kotak lalu jatuh berputar. | Ringan. |

### Kursor dan tombol

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| KT1 | Kursor amplop | Di desktop kursor diganti amplop kecil yang miring mengikuti arah gerak. Mati di layar sentuh. | Nol di HP. |
| KT2 | Tombol pil kertas | Pil oranye dengan bayangan potongan kertas yang turun 2 px saat ditekan. | Sangat ringan. |
| KT3 | Stiker sosial | Ikon X, Threads, GitHub, LinkedIn sebagai stiker miring ±8 derajat yang menegak saat disentuh. Disembunyikan sampai akun diisi. | Sangat ringan. |
| KT4 | Cap tersalin | Setiap aksi salin memunculkan cap 'TERSALIN' oranye dan pesan aria-live. | Sangat ringan. |

### Suara

| Kode | Nama | Penjelasan | Beban di HP |
|---|---|---|---|
| SR1 | Tanpa suara | Bawaannya hening. Paling aman dan sesuai kebiasaan HP. | Nol. |
| SR2 | Bunyi kertas kecil | Tombol suara di menu (mati secara bawaan). Kalau dinyalakan, ada bunyi kertas saat sobek, cap, dan salin (beberapa OGG sekitar 5 KB). | Sangat ringan, dimuat hanya kalau dinyalakan. |
| SR3 | Suasana panggung | Dengung ruangan pelan dan derik sorotan saat film, hanya kalau pengunjung menyalakan suara. | Ringan (sekitar 100 KB, dimuat malas). |

## Usulan slogan footer

- SURAT SAMPAI. / MAIL DELIVERED.
- ADA SURAT! / MAIL'S HERE!
- KOTAK MASUK UNTUK KODEMU / AN INBOX FOR YOUR CODE
- BIKIN. BACA. BUANG. / MAKE. READ. TOSS.
- KIRIM. TANGKAP. BACA. / SEND. CATCH. READ.
- BIAR DIA YANG ANGKAT. / LET HIM DO THE LIFTING.
- SATU POST, SATU KOTAK. / ONE POST, ONE INBOX.
- UJI TANPA SAMPAH / TEST WITHOUT THE CLUTTER
- POS UNTUK KODEMU / A POST OFFICE FOR YOUR CODE
- SURATNYA MASUK, TESNYA JALAN. / MAIL IN, TESTS ON.
