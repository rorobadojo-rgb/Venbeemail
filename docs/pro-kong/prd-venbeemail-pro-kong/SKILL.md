---
name: prd-venbeemail-pro-kong
description: PRD kedua (versi 1, 10 Oktober 2026) untuk halaman venbeemail.com/pro, alternatif dari PRD pertama "Panggung Pos". Berisi konsep K1 "Surat Sampai" gaya situs Kong (film yang digulir, panel huruf gunting, footer maskot pisang naik dari podium dengan slogan "KOTAK MASUK UNTUK KODEMU"), spesifikasi video Seedance 2.5, teks lengkap dua bahasa, bagian Tentang, footer dengan sosial media, urutan kerja per fase, dan cara pasang ke server dengan cadangan. Hasilnya dibangun di folder repo situs-pro-kong/. Pakai saat LO minta membangun, melanjutkan, atau memasang versi Kong dari halaman /pro.
---

# PRD VenbeeMail Pro gaya Kong: "Surat Sampai" (versi 1)

File ini ada di repo `rorobadojo-rgb/Venbeemail`, folder `docs/pro-kong/prd-venbeemail-pro-kong/`. Ditulis 10 Oktober 2026. PRD ini berdiri sendiri: chat baru bisa membangun seluruh halaman hanya dari file ini dan file yang disebut di dalamnya.

Bahan yang dipakai saat menulis PRD ini (boleh dibaca ulang kalau perlu rincian):

- `docs/pro-kong/ANALISIS-VIDEO-KONG.md`: analisis rekaman situs referensi Kong Rolls. Frame acuan di `docs/pro-kong/referensi-kong/`.
- `docs/pro-kong/MENU-PILIHAN.md`: tujuh konsep, bank modul, dan usulan slogan. LO memilih K1.
- `docs/pro/prd-venbeemail-pro/SKILL.md`: PRD pertama ("Panggung Pos"). Aturan tetap, isi teknis wajib, cek server, dan pola pasang diambil dari sana.
- `situs-pro/`: hasil Fase 1 PRD pertama. Potongan gambar transparan, alat olah gambar, dan alat pasang dipakai ulang di sini. **Folder `situs-pro/` tidak boleh diubah.**
- `docs/pro/referensi/`: gambar asli dari LO.

---

## 0. Cara memakai PRD ini

LO bekerja dari HP. Perintah server ia jalankan sendiri di terminal aaPanel, lalu menempel hasilnya ke chat. Karena itu:

- Beri perintah server dalam **satu blok siap salin per langkah**, dan jelaskan dengan bahasa sederhana apa yang dilakukan blok itu.
- Setiap blok yang mengubah server harus: berhenti tanpa mengubah apa pun kalau ada yang tidak cocok, membuat cadangan dulu, memeriksa hasil dari luar, dan mengembalikan sendiri kalau pemeriksaan gagal.
- Keputusan yang belum ada di bagian 4 ditanyakan dengan satu pertanyaan pilihan ganda per keputusan. Pilihan pertama adalah rekomendasi.
- Keputusan di bagian 4 sudah dikunci LO. Jangan ditanyakan lagi kecuali LO sendiri ingin mengubahnya. Kalau LO mengubah atau menambah keputusan, perbarui tabel di bagian 4 dan 5 di file ini, lalu commit, supaya chat berikutnya tidak bertanya lagi.
- **Jangan pernah mengarang fakta**: tahun, kota, cerita pendiri, nama akun sosial media, angka pengguna, testimoni, fitur yang belum ada, atau teks teknis lama. Yang belum diberikan LO ditulis sebagai tempat isian `[ISI ...]` dan tidak tampil di halaman sampai diisi (bagian 13).
- Kerjakan per fase (bagian 17). Tiap fase punya syarat mulai sendiri. Fase yang syaratnya belum terpenuhi jangan dikerjakan setengah jalan dengan isi karangan.
- Kalau ada yang bertentangan antara PRD ini dan PRD pertama: untuk versi Kong, PRD ini yang berlaku, kecuali aturan di bagian 2.2 (aturan tetap) yang selalu berlaku untuk dua versi.

Arti istilah yang sering muncul:

| Istilah | Arti |
|---|---|
| LO | Pemilik proyek, yang memberi keputusan dan menjalankan perintah server |
| NongBana | Nama pembuat yang ditampilkan di halaman |
| Pin | Bagian halaman ditahan di layar sementara pengunjung menggulir, dan gulirannya dipakai untuk menggerakkan animasi |
| Scrub | Animasi maju-mundur persis mengikuti posisi gulir |
| Jarak pin 600 persen | Bagian ditahan selama pengunjung menggulir sejauh 6 kali tinggi layar |
| Potongan | Gambar tokoh dengan latar transparan (WebP) |
| Bingkai kunci | Gambar diam 1280x720 yang dirakit dari aset, dipakai sebagai gambar awal atau akhir video Seedance |
| Urutan bingkai | Video yang dipotong menjadi banyak gambar WebP, lalu digambar ke canvas sesuai posisi gulir |
| Kurangi gerakan | Setelan sistem `prefers-reduced-motion: reduce`, atau tombol "Kurangi gerakan" di halaman |

---

## 1. Latar belakang dan tujuan

- Situs: venbeemail.com. Halaman depan adalah BanaMail (email sementara). Halaman /pro adalah produk untuk developer: kotak masuk uji lewat API.
- Pendaftaran Claude Startups atas nama BanaMail ditolak pada 9 Oktober 2026 (alasan di email: perusahaan di luar batas usia, atau tidak bisa diverifikasi dari data pendaftaran). PRD pertama dibuat untuk membuat /pro tampil sebagai produk sungguhan yang jelas pembuatnya.
- Pada 10 Oktober 2026 LO mengirim rekaman situs Kong Rolls dan meminta versi kedua yang penyajiannya seperti Kong, tetapi lebih menarik. PRD ini adalah versi kedua itu. PRD pertama tetap ada sebagai pilihan lain.

Tujuan versi Kong:

1. Halaman terasa seperti film: satu cerita, satu tokoh, kamera yang terus bergerak, dan akhir yang heroik di footer.
2. Produk tetap terbaca di detik pertama: nama, kalimat inti, dan tombol API sudah tampil sebelum film mulai. Ini perbedaan paling penting dengan Kong.
3. Semua isi teknis lama tetap persis, bisa dipilih, dicari, disalin, dan dibaca pembaca layar.
4. Pembuatnya jelas: NongBana, kontak admin@venbeemail.com, dan bagian Tentang yang jujur.
5. Ringan dan aman di HP: muatan awal di bawah 2,5 MB (target 1,3 MB), mode kurangi gerakan lengkap, rapi di lebar 360 piksel, sudah diuji di Safari iPhone.

Bukan tujuan:

- Mengubah fungsi email sementara atau fungsi API.
- Menambah klaim, angka, testimoni, logo klien, atau penghargaan.
- Menyalin teks, huruf, gambar, atau merek Kong Rolls. Yang ditiru hanya cara penyajian.

---

## 2. Hubungan dengan PRD pertama dan aturan tetap

### 2.1 Yang sama dan yang berbeda

| Hal | PRD pertama (Panggung Pos) | PRD ini (Surat Sampai, gaya Kong) |
|---|---|---|
| Folder hasil di repo | `situs-pro/` | `situs-pro-kong/` |
| Awalan kelas CSS dan nama berkas | `vbp-`, `aset/vbpro/` | `vbk-`, `aset/vbkong/` |
| Cara pasang | Menyisipkan hero ke `index.html` lama, isi lama tetap di bawah | Halaman utuh baru dengan isi teknis lama disalin persis (bagian 18). Diuji dulu di `/pro/kong/`, baru menggantikan `/pro/` setelah LO setuju |
| Hero | Panggung Pos, tokoh hidup, wordmark origami | Amplop melayang di podium (video loop), wordmark huruf gunting |
| Bagian lain | Gaya PRD pertama (Fase 2 belum dibangun) | Semua bagian bergaya Kong: film yang digulir, panel berjudul huruf gunting, footer maskot naik |
| Aset gambar | Hasil olahan di `situs-pro/aset/vbpro/gambar/` | Sama persis, disalin ke `situs-pro-kong/aset/vbkong/gambar/`, ditambah beberapa turunan baru (bagian 6.3) |
| Video | Tidak ada (Tingkat 3 opsional) | Seedance 2.5, sekitar 42 detik total (bagian 7) |
| Cadangan di server | `/www/backup/venbeemail-pro/` | `/www/backup/venbeemail-pro-kong/` (folder terpisah supaya `kembalikan.sh` milik PRD pertama tidak salah ambil) |
| Halaman depan BanaMail | Hanya footer ditambah tautan | Sama: hanya footer ditambah tautan |

### 2.2 Aturan tetap (berlaku untuk dua versi, tidak boleh dilanggar)

1. **Isi teknis persis.** Tujuh endpoint, empat domain, dua contoh curl, aturan awalan 3 sampai 20 karakter, daftar field jawaban, arti tiap field, arti PATCH, dan teks langkah Cara kerja disalin persis dari halaman /pro lama (bagian 3). Tidak ditulis ulang, tidak dirapikan, tidak diterjemahkan sendiri kalau halaman lama sudah punya versi EN.
2. **Endpoint yang belum aktif tidak ditampilkan** (misalnya /api/replies).
3. **Dua bahasa.** Semua teks tampil dalam Bahasa Indonesia dan Inggris lewat tombol ID/EN.
4. **Maskot tidak diubah.** Tubuh, wajah, dan warna maskot pisang tidak berubah. Gerak hanya berupa transformasi, cahaya, bayangan, dan potongan yang sudah ada. Di video, maskot tidak boleh berubah wajah atau warna (cara cek di bagian 7.6).
5. **Tanpa klaim palsu.** Tidak ada testimoni, jumlah pengguna, logo klien, penghargaan, "dipercaya oleh", atau angka lain yang tidak nyata. Semua nilai contoh diberi tanda "contoh" atau "pratinjau". Token tidak pernah tampil utuh: selalu `<token>`.
6. **Teks penting bukan di gambar.** Judul huruf gunting adalah SVG hiasan, teks aslinya tetap ada di HTML. Video tidak berisi teks.
7. **Tanpa merek pihak lain.** Tidak memakai teks, huruf, gambar, warna khas, atau nama Kong Rolls dan MDX. Ikon sosial media hanya dipakai sebagai tautan ke akun yang alamatnya diberikan LO (bagian 15.4), satu warna, tanpa kesan kerja sama.
8. **Muatan awal HP di bawah 2,5 MB.** Target 1,3 MB (bagian 16).
9. **Mode kurangi gerakan wajib** dan lengkap: semua isi tetap tampil dan bisa disalin (bagian 16.4).
10. **Uji di Safari iPhone** sebelum pasang utama.
11. **Cadangan dan cara mengembalikan** selalu ada sebelum server diubah.
12. **Kontak yang ditampilkan hanya admin@venbeemail.com.** Bukan email pribadi.

---

## 3. Keadaan sekarang dan isi teknis wajib

Dicek 9 Oktober 2026 (PRD pertama):

- Judul halaman lama: "BanaMail Pro". Menu: Cara kerja, API, Domain. Tombol bahasa ID/EN.
- Aset lama di server: `/pro/aset/01-latar.webp`, `02-maskot.webp`, `03-tulisan.webp`. Berkas-berkas ini **tidak boleh dihapus**, karena alat pasang mengenali folder /pro dari keberadaan `aset/02-maskot.webp`.
- Server: VPS DomaiNesia dengan aaPanel. Program di `/www/wwwroot/venbeemail/server`, systemd `banamail.service`, port 3000, reverse proxy aaPanel. Mulai ulang: `systemctl restart banamail`.
- Fase 1 PRD pertama (hero Panggung Pos) sudah dirakit di `situs-pro/` dan dipasang dengan cara menyisipkan blok bertanda `vbpro-kepala`, `vbpro-hero`, `vbpro-skrip` ke `index.html` lama. Belum pasti apakah sudah dipasang di server; cek server (bagian 18.1) akan menjawabnya.

Isi teknis yang WAJIB tampil persis:

- **7 endpoint:**
  1. `POST /api/addresses`
  2. `GET /api/mailbox`
  3. `GET /api/messages/:id`
  4. `PATCH /api/messages/:id`
  5. `GET /api/messages/:id/attachments/:n`
  6. `DELETE /api/addresses/me`
  7. `GET /api/health`
- **4 domain:** `venbeemail.com`, `kotak.venbeemail.com`, `surat.venbeemail.com`, `pos.venbeemail.com`
- **Dua contoh curl**, teks persis dari halaman lama.
- **Aturan awalan:** 3 sampai 20 karakter. Kalau halaman lama menyebut huruf apa saja yang boleh dipakai, salin persis. Kalau tidak menyebut, halaman ini hanya memeriksa panjang dan tidak mengarang aturan huruf.
- **Field jawaban:** `address`, `local`, `domain`, `expiresAt`, `token`, beserta keterangannya kalau ada di halaman lama.
- **Kontak:** admin@venbeemail.com

Yang belum ada di repo dan harus diambil dari halaman live sebelum Fase 2 (bagian 18.2):

- teks 4 langkah Cara kerja (ID dan EN),
- kolom keterangan (GUNA) tiap endpoint (ID dan EN),
- teks persis dua contoh curl,
- arti tiap field jawaban, arti PATCH, bentuk nilai `expiresAt`, dan cara penomoran lampiran `:n`,
- aturan huruf awalan,
- semua teks lain, tautan, `id` bagian, skrip, dan fungsi yang ada di halaman lama (inventaris, bagian 18.2).

Selama teks lama belum ada, di kode ditulis tempat isian yang jelas, misalnya `[SALIN DARI HALAMAN LAMA: langkah 1 ID]`. Halaman tidak boleh dipasang ke server selama masih ada tempat isian seperti ini (alat `siapkan.js --cek` menolaknya, bagian 18.3).

---

## 4. Keputusan yang sudah dikunci

Dikunci LO pada 10 Oktober 2026. Jangan ditanyakan lagi.

| No | Keputusan | Pilihan yang dikunci |
|---|---|---|
| D1 | Bentuk PRD | Skill terpisah `prd-venbeemail-pro-kong`, alternatif dari PRD pertama. Hasil situs di folder repo `situs-pro-kong/`, tidak menimpa `situs-pro/` |
| D2 | Konsep | K1 "Surat Sampai (Perjalanan Surat #001)" |
| D3 | Paket modul | LM1+LM2, HR1, GL5+GL1+GL4, JD1, TR1+TR5, CK1, API1+AW1+AW3+AW4, EP1 (cadangan EP4), DM1, TT1, PN1+PN2, FT1, KT2+KT3+KT4, SR1 |
| D4 | Footer | FT1 Lift panggung: lampu padam, tulisan raksasa, maskot naik dari podium menutupi huruf tengah, pesawat kertas menjatuhkan amplop ke celah kotak |
| D5 | Slogan raksasa footer | **"KOTAK MASUK UNTUK KODEMU"**, EN **"AN INBOX FOR YOUR CODE"**. "Surat Sampai" tetap dipakai sebagai nama film dan bab, bukan slogan footer |
| D6 | Video | Seedance 2.5, paket standar sekitar 40 detik: hero loop 6 detik, film utama 30 detik dari 5 klip 5 sampai 8 detik yang disambung, latar footer 6 detik. 720p, `generate_audio` false |
| D7 | Pembuat dan kontak | Pembuat: NongBana. Kontak yang ditampilkan: admin@venbeemail.com |
| D8 | Sosial media | Footer memuat logo X, Threads, GitHub, LinkedIn sebagai SVG di dalam HTML. Nama akun diisi LO belakangan. Ikon yang akunnya belum diisi tidak ditampilkan. Jangan mengarang nama akun |
| D9 | Fakta pendiri | Tahun mulai, kota, dan cerita pribadi belum diberikan. Pakai `[ISI ...]`, dan bagian itu tidak tampil sampai diisi |
| D10 | Cakupan perubahan | Semua bagian halaman /pro berubah ke gaya Kong. Aset gambar tetap sama. Halaman depan BanaMail hanya footer yang ditambah tautan |

Rekomendasi tambahan yang dipakai sebagai bawaan selama LO tidak meminta lain (boleh diubah tanpa membongkar halaman):

| No | Hal | Bawaan |
|---|---|---|
| B1 | Gulir halus | Lenis hanya di desktop dengan mouse. Mati di layar sentuh dan saat kurangi gerakan |
| B2 | Logo menu | Logo VENBEEMAIL dengan lencana PRO dan wajah huruf B dari PRD pertama (7.1), digambar ulang dengan huruf gunting |
| B3 | Favicon | Pakai favicon yang sedang dipakai /pro. Keputusan favicon baru (K5 PRD pertama) masih terbuka dan tidak dikerjakan di sini kecuali LO minta |
| B4 | API sungguhan | Halaman tidak memanggil API kecuali `GET /api/health` di layar muat. Pemeriksa awalan hanya di browser |
| B5 | Tambahan opsional | KT1 kursor amplop dan FT6 semburan amplop dibuat tetapi mati secara bawaan (bagian 10) |

---

## 5. Yang masih ditunggu dari LO

| No | Yang ditunggu | Wajib sebelum | Kalau belum ada |
|---|---|---|---|
| R1 | Hasil cek server (bagian 18.1) | Fase 0 | Tidak ada pekerjaan server |
| R2 | Isi /pro lama secara persis (izin jaringan ke venbeemail.com, atau `cat` dari server, bagian 18.2) | Fase 2 | Bagian teknis memakai tempat isian, halaman tidak boleh dipasang |
| R3 | Tautan akun X | Fase 4 | Ikon X tidak tampil |
| R4 | Tautan akun Threads | Fase 4 | Ikon Threads tidak tampil |
| R5 | Tautan akun GitHub | Fase 4 | Ikon GitHub tidak tampil |
| R6 | Tautan akun LinkedIn (pribadi `/in/...` atau halaman `/company/...`) | Fase 4 | Ikon LinkedIn tidak tampil |
| R7 | Tahun mulai dibuat | Tidak wajib | Baris tahun tidak tampil |
| R8 | Kota | Tidak wajib | Baris kota tidak tampil |
| R9 | Cerita singkat pendiri (2 sampai 4 kalimat, ID dan EN, atau ID saja lalu diterjemahkan dan disetujui LO) | Tidak wajib | Paragraf cerita tidak tampil |
| R10 | Fitur Claude: "tidak ada", atau satu fitur yang sungguh akan dibangun (aturan PRD pertama bagian 6) | Tidak wajib | Bagian fitur Claude tidak tampil |
| R11 | Tujuh hasil video Seedance (bagian 7), diunggah ke `situs-pro-kong/video-mentah/` lewat GitHub web, atau dilampirkan ke chat | Fase 5 | Halaman memakai bingkai kunci diam sebagai film (mode tanpa video) |
| R12 | Penyedia Seedance yang dipakai (BytePlus ModelArk, Volcengine, fal.ai, atau aplikasi Dreamina) | Sebelum membuat video | Prompt tetap sama; hanya nama parameter yang berbeda |
| R13 | Uji di iPhone (LO sendiri atau orang lain dengan iPhone) | Pasang utama | Pasang utama ditunda |
| R14 | Persetujuan setelah melihat versi uji di `/pro/kong/` | Pasang utama | Versi uji tetap di `/pro/kong/`, `/pro/` tidak diubah |
| R15 | (Opsional) Latar panggung resolusi besar 2752x1536 | Tidak wajib | Bingkai kunci close-up sedikit lembut |

Data R3 sampai R10 disimpan di satu berkas `situs-pro-kong/isian.json` (bagian 13.1). LO cukup mengirim isinya di chat; Claude yang menulis berkas itu.

---

## 6. Aset

### 6.1 Gambar asli (di `docs/pro/referensi/`)

| File | Isi | Dipakai untuk |
|---|---|---|
| `01-komposisi-hero-lama.webp` (1376x768) | Hero lama utuh: wordmark BanaMail origami, maskot mengangkat kotak surat, 4 monyet, amplop, pesawat, pantulan lantai | Acuan suasana dan susunan |
| `02-latar-panggung.png` (1376x768) | Latar teal gelap, sorotan dari atas, podium bulat biru bermotif bunga putih, pinggiran oranye | Latar semua adegan, bingkai kunci, bibir podium |
| `03-maskot-pisang-zombie-hijau.webp` (1024x1024) | Maskot pisang zombie mengangkat kotak surat tabung kardus berlogo pisang biru | Tokoh utama. Tidak boleh diubah |
| `04-wordmark-banamail-lama-hijau.webp` (1376x768) | Wordmark lama BanaMail origami biru bermotif bunga, tetesan oranye | Acuan bahan. Tidak dipakai langsung |
| `05`, `07`, `08`, `09` (1024x1024) | Empat monyet origami skateboard: rambut merah, biru, cokelat, pirang | Estafet di film, kartu Cara kerja |
| `06-referensi-huruf-advanced.png` (1179x1474) | Huruf "ADVANCED!" potongan kertas tajam, miring, garis dasar bergelombang, lubang segitiga | Acuan bentuk huruf gunting. Hanya gayanya |
| `10-amplop-dan-pesawat-kertas-hijau.png` (1024x1024) | Amplop flanel biru dengan tempelan hantu, dan pesawat kertas putih | Amplop dan pesawat |
| `11-screenshot-sky-estate.jpg` | Template Sky Estate | Tidak dipakai di versi ini |

### 6.2 Potongan yang sudah ada (di `situs-pro/aset/vbpro/gambar/`, dibuat oleh `situs-pro/alat/olah_aset.py`)

Disalin apa adanya ke `situs-pro-kong/aset/vbkong/gambar/`. Jangan diubah di tempat asalnya.

| File | Ukuran | Isi |
|---|---|---|
| `latar.webp`, `latar-1032.webp` | 1376x768, 1032x576 | Latar panggung |
| `maskot.webp`, `maskot-512.webp` | 576x955, 512x849 | Maskot utuh |
| `maskot-badan.webp`, `maskot-badan-512.webp` | 576x955, 512x849 | Maskot tanpa kotak surat dan lengan bawah (bidang atas kosong) |
| `maskot-kotak.webp`, `maskot-kotak-512.webp` | 576x278, 512x247 | Kotak surat dengan kedua tangan dan lengan bawah. Sejajar dengan bagian atas `maskot-badan` (y=0 sama). Garis potong y=262, ekor pudar 14 piksel |
| `maskot-tepi-badan.webp`, `maskot-tepi-kotak.webp` | setengah ukuran | Cahaya tepi teal muda |
| `monyet-merah`, `-biru`, `-cokelat`, `-pirang` (+ `-512`) | sekitar 650 sampai 765 lebar | Monyet transparan |
| `amplop.webp`, `amplop-jauh.webp` | 320x230, 178x133 | Amplop, dan versi buram untuk jauh |
| `pesawat.webp` | 240x160 | Pesawat kertas |
| `butir.svg` | 200x200 | Butir film |

Ukuran asal dan titik potong ada di `situs-pro/alat/ukuran-aset.json`.

### 6.3 Turunan baru untuk versi Kong

Dibuat oleh `situs-pro-kong/alat/olah_aset_kong.py`. Skrip ini **mengimpor** fungsi dari `situs-pro/alat/olah_aset.py` (misalnya `buang_hijau`, `ke_gambar`, `kotak_isi`, `simpan`, `buram`, `tepi_cahaya`) lewat `sys.path`, tanpa mengubah berkas itu, lalu menulis ke `situs-pro-kong/aset/vbkong/gambar/` dan `situs-pro-kong/seedance/sumber/`.

| File baru | Cara membuat | Dipakai di |
|---|---|---|
| `maskot-kotak-panjang.webp` (+ `-512`) | Sama seperti `pisah_maskot` di `olah_aset.py`, tetapi ekor pudar 40 piksel (bukan 14). Badan tetap `maskot-badan.webp` | Footer: kotak boleh terdorong naik sampai 3 persen tinggi maskot tanpa celah di lengan |
| `maskot-bayang.webp` (+ `-512`) | Siluet alfa `maskot.webp` diisi `#000814`, diburamkan radius 18, opacity 55 persen | Bayangan maskot di tulisan footer (lebih ringan dari `filter: drop-shadow`) |
| `podium-bibir.webp` (+ `-1032`) | Dari `02-latar-panggung.png`: kotak x 420 sampai 935, y 645 sampai 700. Per kolom, alfa 1 mulai dari piksel oranye pertama dari atas (pinggiran atas bibir) dikurangi 1 piksel; di atasnya transparan, dengan tepi lembut 2 piksel | Footer: ditaruh di depan kaki maskot supaya ia tampak berdiri di atas podium |
| `podium-lubang.svg` | Elips gelap `#000c10` dengan cincin oranye `#e7663c` tipis, digambar SVG | Footer: pintu lift di permukaan podium |
| `monyet-*-tepi.webp` | Seperti `tepi_cahaya` untuk maskot, satu per monyet, setengah ukuran | Film: cahaya tepi supaya monyet menyatu dengan video |
| `amplop-besar.png` | Kunci ulang amplop dari gambar 10 pada resolusi asli (tanpa diperkecil) | Bingkai kunci Seedance |
| `pesawat-besar.png` | Kunci ulang pesawat dari gambar 10 pada resolusi asli | Bingkai kunci Seedance |
| `maskot-besar.png` | Maskot dari gambar 03 pada resolusi asli, latar transparan | Bingkai kunci Seedance |
| `perangko-monyet-*.webp` | Potongan kepala tiap monyet, persegi 160x160, untuk isi perangko | Bagian Domain |
| `og.jpg` | 1200x630: latar panggung, maskot di kanan, amplop melayang, wordmark VENBEEMAIL PRO huruf gunting di kiri | Kartu bagikan Open Graph dan Twitter |

Ukuran piksel podium di `02-latar-panggung.png` (diukur 10 Oktober 2026, dipakai untuk menempatkan maskot dan bibir):

| Titik | Koordinat di 1376x768 | Persen |
|---|---|---|
| Pusat podium (x) | 676 | 49,1 persen lebar |
| Tepi kiri dan kanan podium | 431 dan 922 | 31,3 dan 67,0 persen |
| Tepi belakang permukaan atas | y 604 | 78,6 persen tinggi |
| Tepi depan permukaan atas (pinggiran oranye, di tengah) | y 657 | 85,5 persen |
| Bawah podium | y 690 | 89,8 persen |
| Garis kaki maskot (dipakai di footer) | y 645 | 84,0 persen |
| Warna pojok kiri atas, tengah, lantai | `#001d25`, `#033141`, `#0b212e` | |

### 6.4 Huruf gunting (JD1)

- Satu set SVG huruf A sampai Z, angka 0 sampai 9, dan tanda `. , ! ? - / : @ · # & '`, digambar sendiri mengikuti gaya gambar 06: kapital tebal, potongan kertas bersudut tajam, tiap huruf miring berbeda, garis dasar bergelombang, lubang huruf segitiga.
- Pakai ulang bentuk huruf V, E, N, B, M, A, I, L dari objek `BENTUK` di `situs-pro/aset/vbpro/hero.js` (tinggi 100 satuan, lebar per huruf, `miring`, `naik`), supaya logo dua versi serasi. Huruf lain digambar baru dengan aturan yang sama.
- Dibuat oleh `situs-pro-kong/alat/huruf_gunting.py`, keluaran `aset/vbkong/gunting.svg` berisi `<symbol id="g-A">` dan seterusnya. Target ukuran 30 sampai 60 KB sebelum gzip.
- Isian tekstur lewat `<pattern>` SVG: `kertas` (putih hangat `#f4f1ea` dengan serat halus), `flanel` (biru `#31458c` dengan jahitan putus-putus), `kardus` (cokelat dari kotak surat, diambil dengan pipet dari `maskot-kotak.webp`), `bunga` (kobalt dengan bunga putih seperti podium).
- Bayangan potongan: salinan huruf bergeser 4 sampai 8 piksel ke kanan bawah berwarna oranye `#e7663c` (judul utama) atau teal gelap `#00141a` (judul kecil).
- Fungsi rakit `rakitGunting(teks, opsi)` di `halaman.js` membuat `<svg aria-hidden="true">` dengan `<use href="#g-X">` per huruf. Teks aslinya selalu ada di elemen judul (`<h2>`) sebagai teks biasa yang disembunyikan secara visual (kelas `vbk-sr`), jadi mesin pencari dan pembaca layar membaca teks utuh.
- Huruf B di logo dan di wordmark hero punya wajah (dua lubang menjadi mata) seperti PRD pertama 7.1: tombol asli berlabel "Ganti wajah huruf B" / "Change the B's face", berganti kedip, melirik, nyengir, menjulurkan lidah.

### 6.5 Huruf teks dan kode

- Teks: Archivo (berat 500, 700, 900), subset Latin, WOFF2, disimpan sendiri di `aset/vbkong/font/` (lisensi OFL). Tanpa memuat dari Google Fonts saat halaman dibuka, supaya aman dari Content-Security-Policy dan lebih cepat.
- Kode: JetBrains Mono (berat 500), subset Latin, WOFF2, OFL.
- `font-display: swap`. Cadangan: `system-ui, sans-serif` dan `ui-monospace, monospace`.
- Hanya dua keluarga huruf ini ditambah huruf gunting SVG. Tidak ada huruf lain.

### 6.6 Warna

| Token CSS | Nilai | Guna |
|---|---|---|
| `--vbk-hitam` | `#00141a` | Kartu penutup bab, lampu padam, konsol |
| `--vbk-teal-1` | `#01232d` | Latar utama |
| `--vbk-teal-2` | `#033141` | Latar bagian berselang |
| `--vbk-sorot` | `#35697f` | Sorotan, garis halus |
| `--vbk-kobalt` | `#31458c` | Aksen, metode GET (latar) |
| `--vbk-kobalt-muda` | `#77a3e4` | Teks aksen, chip GET |
| `--vbk-oranye` | `#e7663c` | Hanya aksi utama, POST, cap, bayangan huruf |
| `--vbk-kertas` | `#f4f1ea` | Kartu kertas, tiket |
| `--vbk-tinta` | `#0d1b22` | Teks di atas kertas |
| `--vbk-putih` | `#ffffff` | Teks di atas teal |

Kontras: teks biasa minimal 4,5:1, kode minimal 7:1. Putih di `#01232d` sekitar 15:1. `#00141a` di atas oranye sekitar 6,6:1 (dipakai untuk teks tombol oranye).

---

## 7. Video Seedance 2.5

### 7.1 Ringkasan paket

Total 42 detik dalam 7 klip. Semua 16:9 720p, 24 fps (tetap, Seedance tidak punya pilihan lain), tanpa suara, tanpa teks di dalam video. Semua klip memakai mode gambar awal atau gambar awal + akhir dari bingkai kunci yang dirakit Claude, supaya tokoh dan panggung mulai persis seperti aset asli.

| No | Nama file mentah | Detik | Mode | Gambar awal | Gambar akhir | Dipakai di |
|---|---|---|---|---|---|---|
| V0 | `vk-hero-loop.mp4` | 6 | Awal + akhir (gambar sama) | `KH.png` | `KH.png` | Hero (loop) |
| V1 | `vk-f1-panggung-bangun.mp4` | 5 | Awal + akhir | `K0.png` | `K1.png` | Film adegan 1 |
| V2 | `vk-f2-lepas-landas.mp4` | 5 | Awal + akhir | `K1.png` | `K2.png` | Film adegan 2 |
| V3 | `vk-f3-bibir-podium.mp4` | 8 | Awal + akhir | `K3a.png` | `K3b.png` | Film adegan 3 (latar estafet, tanpa tokoh) |
| V4 | `vk-f4-di-udara.mp4` | 5 | Awal + akhir | `K4.png` | `K4b.png` | Film adegan 4 |
| V5 | `vk-f5-menukik.mp4` | 7 | Awal + akhir | `K5.png` | `K6.png` | Film adegan 5 |
| V6 | `vk-ft-sorotan-loop.mp4` | 6 | Awal + akhir (gambar sama) | `KF.png` | `KF.png` | Latar Penutup dan footer (loop) |
| V3x | `vk-f3x-estafet-asli.mp4` (opsional) | 6 | Referensi (multi gambar) | 6 gambar referensi | | Dicoba sekali. Dipakai hanya kalau lolos semua cek |

Film utama: V1 sampai V5 = 5 + 5 + 8 + 5 + 7 = 30 detik.

Perubahan dari MENU-PILIHAN: klip "menukik" (4 detik) dan "masuk celah" (3 detik) digabung menjadi V5 (7 detik), karena durasi minimum Seedance 2.5 yang pasti diterima adalah 4 detik. Bagian akhir "masuk ke celah sampai gelap dengan berkas cahaya hangat" dibuat dengan CSS di atas canvas (bagian 9.4), bukan di video, supaya lebih terkendali dan murah. Klip V2 (lepas landas) dan klip loop sorotan dari MENU tetap ada.

### 7.2 Parameter umum

| Parameter | Nilai | Catatan |
|---|---|---|
| Model | Seedance 2.5. Di BytePlus ModelArk: `dreamina-seedance-2-5-260628`. Di Volcengine: `doubao-seedance-2-5-260628`. Di fal.ai: `bytedance/seedance-2.5/image-to-video` (V3x: `bytedance/seedance-2.5/reference-to-video`) | Nama model dicek ulang di konsol penyedia saat membuat |
| `resolution` | `720p` | 1080p tidak dipakai (bagian 7.8) |
| `duration` | Sesuai tabel (5, 6, 7, atau 8) | Jangan di bawah 4 |
| Rasio | Tidak dikirim. Mode gambar awal dan akhir hanya menerima `adaptive`, jadi rasio ikut gambar awal (semua bingkai kunci tepat 1280x720) | Beberapa penyedia menolak parameter rasio di mode ini (HTTP 400) |
| `generate_audio` | `false` | Bawaannya `true`. Kalau tetap ada suara, dibuang saat diolah (`-an`) |
| `watermark` | `false` | |
| `return_last_frame` | `true` | Bingkai terakhir dipakai untuk memeriksa sambungan (bagian 7.6) |
| `seed` | Sesuai tabel di 7.4 | Belum pasti dihormati Seedance 2.x. Tetap dikirim dan dicatat |
| `output_format` | `mp4` | Panduan Volcengine menyarankan `mov`; boleh dipakai kalau tersedia, diolah sama |
| Draft | Boleh: `draft: true` (480p murah) untuk mencoba gerak, lalu render akhir dari draft yang terpilih | Hemat hanya kalau banyak percobaan dibuang |

Contoh permintaan (BytePlus ModelArk, tugas tidak langsung jadi: kirim, lalu tanya status tugas sampai selesai):

```json
POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
{
  "model": "dreamina-seedance-2-5-260628",
  "content": [
    { "type": "text", "text": "<PROMPT KLIP, BAGIAN 7.4>" },
    { "type": "image_url", "role": "first_frame",
      "image_url": { "url": "https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/<CABANG>/situs-pro-kong/seedance/bingkai/K0.png" } },
    { "type": "image_url", "role": "last_frame",
      "image_url": { "url": "https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/<CABANG>/situs-pro-kong/seedance/bingkai/K1.png" } }
  ],
  "resolution": "720p",
  "duration": 5,
  "generate_audio": false,
  "watermark": false,
  "return_last_frame": true,
  "seed": 2510101
}
```

Nama field di atas diambil dari ringkasan dokumentasi resmi, bukan dari membaca halaman resmi langsung (situsnya diblokir dari lingkungan Claude Code). Cocokkan dengan konsol penyedia sebelum dipakai. Model Seedance lama memakai bendera di dalam teks prompt (misalnya `--rs 720p --dur 5`); kalau konsol meminta cara itu, pakai cara itu dengan nilai yang sama.

Kalau LO memakai aplikasi (Dreamina atau Jimeng): pilih Seedance 2.5, mode "first and last frame" (atau "gambar awal dan akhir"), unggah dua bingkai kunci, tempel prompt, pilih 720p, durasi sesuai tabel, matikan suara. Kalau aplikasi hanya punya pilihan durasi tertentu (misalnya 5 atau 10 detik), pakai yang paling dekat dan beri tahu Claude; pemutar menyesuaikan jumlah bingkai sendiri (bagian 9.2).

### 7.3 Bingkai kunci

Dirakit Claude dengan Pillow oleh `situs-pro-kong/alat/bingkai_kunci.py`, keluaran PNG tepat 1280x720 di `situs-pro-kong/seedance/bingkai/`. Gambar ini di-commit (repo publik), jadi Seedance bisa mengambilnya lewat URL raw GitHub, dan LO bisa mengunduhnya ke HP untuk aplikasi. Claude juga mengirim semua bingkai ke LO sebagai satu lembar pratinjau.

Aturan umum:

- Latar dari `02-latar-panggung.png` (1376x768) diskalakan ke tinggi 720 (lebar 1290), lalu dipotong 5 piksel kiri dan kanan. Di bingkai ini pusat podium ada di x 629, permukaan atas y 566 sampai 616, bawah podium y 647, tepi podium x 399 sampai 859.
- Tokoh dan benda diambil dari versi resolusi asli (`amplop-besar.png`, `pesawat-besar.png`, `maskot-besar.png`, potongan monyet ukuran penuh), supaya tidak buram.
- Subjek selalu di sepertiga tengah (x 427 sampai 853), karena versi HP memotong bagian tengah 9:16 (bagian 7.7).
- Tidak ada teks di bingkai.
- Setiap benda yang berdiri di podium diberi bayangan kontak: elips `#000` opacity 30 persen, diburamkan radius 12.
- Benda yang digabung diberi sedikit penyesuaian warna ke cahaya teal (kecerahan 0,92, sedikit biru di bayangan) supaya tidak terlihat ditempel.

| Bingkai | Isi dan cara merakit |
|---|---|
| `KH.png` | Latar terang. Amplop lebar 300 piksel, pusat x 629, tepi bawah amplop di y 470 (melayang sekitar 100 piksel di atas podium), miring -6 derajat. Bayangan kontak 220x26 di y 598 |
| `K0.png` | Panggung hampir gelap: latar dikalikan 0,35, sorotan atas dibiarkan samar (lingkaran cahaya opacity 15 persen). Seluruh bingkai diperkecil 0,9 (kamera lebih tinggi dan lebar), tepi diisi gradien `#001d25`. Amplop lebar 230 piksel berdiri tegak di tengah permukaan podium |
| `K1.png` | Latar terang, diperbesar 1,6 kali dengan pusat di amplop. Amplop lebar sekitar 420 piksel berdiri di podium, sorotan menyinari dari atas |
| `K2.png` | Amplop memenuhi bingkai: lebar sekitar 1500 piksel, miring 8 derajat, tempelan hantu terlihat di tengah. Ujung pesawat kertas tampak di pojok kanan atas. Sedikit buram (radius 1,5) supaya terasa bergerak |
| `K3a.png` | Sudut rendah di pinggiran podium: potongan latar 688x387 mulai dari (300, 380) di gambar 1376x768, diperbesar ke 1280x720. Tanpa tokoh |
| `K3b.png` | Sama, potongan mulai dari (388, 380). Tanpa tokoh |
| `K4.png` | Langit: gradien tegak `#00141a` (atas) ke `#033141` (bawah), 60 bunga putih kecil 6 kelopak (4 sampai 14 piksel, opacity 0,3 sampai 0,9, posisi acak dengan seed tetap), cahaya sorotan samar di tengah bawah. Pesawat lebar 520 piksel di tengah, miring -10 derajat, amplop lebar 300 piksel menempel di bawahnya |
| `K4b.png` | Langit yang sama. Pesawat dan amplop terbalik 180 derajat, 1,5 kali lebih besar, bergeser 80 piksel ke kanan |
| `K5.png` | Latar terang. Maskot utuh tinggi 400 piksel berdiri di podium (kaki y 630, pusat x 629). Vignette lebih gelap di tepi |
| `K6.png` | Close-up kotak surat: potongan kotak dari `maskot-besar.png` diperbesar sampai lebar kotak sekitar 1100 piksel, celah surat di tengah bingkai (y sekitar 330). Latar teal gelap buram di belakangnya |
| `KF.png` | Latar terang tanpa tokoh, sama dengan latar asli yang diskalakan |
| `ref-1.png` sampai `ref-6.png` (V3x) | Monyet merah, biru, cokelat, pirang, amplop, masing-masing di atas latar polos `#01232d`, dan `K3a.png` sebagai panggung |

Kalau LO mengirim latar resolusi besar (R15), skrip memakainya untuk `K1`, `K3a`, `K3b`, dan `K6`, sehingga close-up lebih tajam.

### 7.4 Prompt per klip

Prompt dalam Bahasa Inggris, dengan kode waktu per detik. Tiap prompt punya bagian "keep" (yang tidak boleh berubah) dan "Avoid" (yang dihindari). Seedance tidak punya kolom prompt negatif terpisah; baris "Avoid" ditulis di akhir prompt.

**V0 `vk-hero-loop.mp4`** (6 detik, awal + akhir `KH.png`, seed 2510001)

```text
The first frame and the last frame are the same image. Handmade papercraft diorama: a blue felt envelope with white stitching and a white ghost patch floats above a round blue podium with white flower motifs and an orange rim, on a dark teal stage lit by one soft spotlight from above.
0-2 s: static wide shot, camera locked. The envelope drifts upward a few centimetres and tilts slightly to the right. Tiny paper dust motes float slowly through the spotlight beam.
2-4 s: the envelope turns gently about 10 degrees and tilts back. The spotlight shimmers softly. Dust keeps drifting.
4-6 s: the envelope drifts back down to exactly its starting position and angle. The motion slows smoothly into the first frame.
Keep the envelope, the ghost patch, the podium pattern, the colours and the framing exactly as in the image. Consistent paper and felt textures, soft cinematic lighting, smooth continuous seamless loop.
Avoid: camera movement, cuts, text, letters, logos, watermark, extra objects, characters, flicker, colour shift.
```

**V1 `vk-f1-panggung-bangun.mp4`** (5 detik, `K0.png` ke `K1.png`, seed 2510101)

```text
Papercraft diorama on a dark teal stage: a round blue podium with white flower motifs and an orange rim, and a blue felt envelope with a white ghost patch standing upright on the podium.
0-2 s: the stage is almost dark. Slow crane down from a high wide shot toward the podium.
2-4 s: soft spotlights switch on one after another from left to right and pools of light spread across the podium. The camera keeps descending and slowly pushes in.
4-5 s: medium shot of the envelope on the podium, fully lit. The ghost patch blinks once.
One continuous take, slow and steady camera, no cuts. Keep the envelope design and the podium pattern exactly as in the first image, and end exactly on the composition of the last image.
Avoid: text, letters, logos, watermark, new characters, people, fast motion, flicker.
```

**V2 `vk-f2-lepas-landas.mp4`** (5 detik, `K1.png` ke `K2.png`, seed 2510201)

```text
Same papercraft stage. A plain white folded paper plane swoops in, picks up the blue felt envelope and climbs.
0-1.5 s: medium shot. The paper plane enters from the left edge and slides under the envelope.
1.5-3.5 s: the plane and the envelope lift off together and spiral upward around the spotlight beam. The camera tilts up and follows them.
3.5-5 s: the envelope swings toward the lens and fills the whole frame, ending on the felt texture and the ghost patch as in the last image.
Smooth continuous camera, no cuts. The plane stays plain white paper. The envelope keeps its stitches and its ghost patch.
Avoid: text, letters, logos, watermark, extra planes, the plane turning into the envelope, any morphing, heavy motion blur in the final second.
```

**V3 `vk-f3-bibir-podium.mp4`** (8 detik, `K3a.png` ke `K3b.png`, seed 2510301)

```text
Empty papercraft stage with no characters. A low camera close to the floor glides along the orange rim of a giant round blue podium with white flower motifs, like a camera moving along the lip of a skate bowl.
0-3 s: low-angle tracking shot moving from left to right along the rim. One spotlight sweeps slowly across the podium surface.
3-6 s: the camera keeps the same height and the same speed. The curved rim stays in the lower third of the frame. Paper dust drifts through the light.
6-8 s: the camera slows down and settles on the composition of the last image.
Steady constant speed, no shake, no cuts. Keep the middle of the frame clear and evenly lit.
Avoid: people, animals, monkeys, envelopes, paper planes, any characters, text, letters, logos, watermark, fast motion.
```

**V4 `vk-f4-di-udara.mp4`** (5 detik, `K4.png` ke `K4b.png`, seed 2510401)

```text
A plain white paper plane carrying a blue felt envelope with a white ghost patch flies through a dark teal night sky dotted with small white paper flowers like stars.
0-2 s: medium shot. The plane glides forward toward the camera while small paper clouds drift past in the foreground.
2-4 s: the plane and the envelope do one slow 180-degree barrel roll together.
4-5 s: they come out of the roll larger and slightly to the right, matching the last image.
The camera follows smoothly in one continuous take.
Avoid: text, letters, logos, watermark, ground, buildings, extra planes, characters, morphing.
```

**V5 `vk-f5-menukik.mp4`** (7 detik, `K5.png` ke `K6.png`, seed 2510501)

```text
Papercraft diorama: on a round blue podium with white flower motifs on a dark teal stage stands a banana zombie mascot in an orange beanie and a patched denim jacket, holding a cardboard tube mailbox with a blue banana logo above its head.
0-3 s: high wide shot. The camera tilts down and dives toward the mascot.
3-6 s: the camera rises past the mascot's head to the mailbox and pushes in toward the dark mail slot.
6-7 s: close-up of the mail slot on the cardboard tube, as in the last image. A faint warm light glows inside the slot.
The mascot stays still in the same pose. Its face, eyes, tongue, colours and clothing stay exactly as in the first image. One continuous take, no cuts.
Avoid: changing the mascot's face, eyes or colours, extra limbs, new characters, text, letters, any logo other than the existing blue banana, watermark, cuts.
```

**V6 `vk-ft-sorotan-loop.mp4`** (6 detik, awal + akhir `KF.png`, seed 2510601)

```text
The first frame and the last frame are the same image. Empty papercraft stage: dark teal backdrop, a round blue podium with white flower motifs and an orange rim, no characters.
0-3 s: static wide shot, camera locked. The top spotlight sways slowly to the left and paper dust drifts through the beam.
3-6 s: the spotlight sways back to its starting position and the light settles exactly as in the first frame.
Seamless loop, smooth and slow.
Avoid: camera movement, characters, objects on the podium, text, letters, logos, watermark, flicker.
```

**V3x `vk-f3x-estafet-asli.mp4`** (opsional, 6 detik, mode referensi, seed 2510351)

```text
@image1 is the red-haired origami monkey on a skateboard, @image2 the blue-haired monkey with braids, @image3 the brown-haired monkey in a pinned denim vest, @image4 the blond monkey in a blue beanie, @image5 the blue felt envelope with a white ghost patch, @image6 the stage and podium. Use the images for identity only and ignore their backgrounds.
0-2 s: low tracking shot along the orange rim of the podium from @image6. @image1 skates in from the left holding @image5 and tosses it in an arc to @image2.
2-4 s: @image2 catches it, spins once, and tosses it to @image3, who almost drops it: the envelope tumbles and @image3 catches it at the last moment with one fingertip.
4-6 s: @image4 skates in fast and throws the envelope straight up out of the top of the frame.
Keep every monkey's face, hair, clothes, skateboard and colours exactly as in the reference images. Papercraft textures, one continuous take.
Avoid: text, letters, logos, watermark, extra characters, people, merged characters, changing costumes.
```

V3x dicoba sekali saja. Kalau satu monyet saja wajah, rambut, baju, atau papannya melenceng, V3x dibuang dan adegan 3 memakai V3 + potongan + GSAP (bagian 9.3). Itu rencana utamanya.

### 7.5 Jumlah percobaan dan biaya

Biaya dihitung dari rumus token resmi (16:9, 24 fps, tanpa video masukan): 720p = 21.600 token per detik. Harga per penyedia diambil dari ringkasan pihak ketiga dan bisa berubah, jadi anggap sebagai perkiraan.

| Klip | Detik | Percobaan direncanakan | Detik total |
|---|---|---|---|
| V0 hero loop | 6 | 3 | 18 |
| V1 panggung bangun | 5 | 3 | 15 |
| V2 lepas landas | 5 | 3 | 15 |
| V3 bibir podium | 8 | 2 | 16 |
| V4 di udara | 5 | 3 | 15 |
| V5 menukik | 7 | 4 | 28 |
| V6 sorotan loop | 6 | 2 | 12 |
| Jumlah | 42 | 20 | 119 |
| V3x (opsional) | 6 | 1 | 6 |

| Penyedia (720p) | Per detik | Satu putaran (42 dtk) | Rencana 119 dtk | + V3x |
|---|---|---|---|---|
| BytePlus ModelArk | sekitar $0,231 | sekitar $9,7 | sekitar $27,5 | + $1,4 |
| Volcengine | sekitar 1,51 RMB | sekitar 63 RMB | sekitar 180 RMB | + 9 RMB |
| fal.ai | sekitar $0,473 | sekitar $19,9 | sekitar $56 | + $2,8 |

Cara hemat: coba tiap percobaan dulu sebagai draft 480p (sekitar $0,103 per detik di BytePlus), lalu render 720p hanya untuk yang terpilih. Untuk rencana di atas: 119 detik draft (sekitar $12,3) + 42 detik akhir (sekitar $9,7) = sekitar $22. Penghematan ini hanya terjadi kalau memang banyak percobaan yang dibuang.

Urutan membuat: V0 dulu (paling mudah, langsung dipakai di hero), lalu V6, V1, V2, V4, V5, terakhir V3 dan V3x. Setelah tiap klip, LO mengirim hasilnya dan Claude memeriksa (7.6) sebelum klip berikutnya dibuat, supaya kesalahan prompt tidak berulang.

### 7.6 Cara memeriksa hasil

Claude memeriksa setiap klip dengan ffmpeg sebelum dipakai. Hasil cek ditulis singkat ke LO: lolos, atau gagal karena apa dan prompt mana yang diubah.

```bash
f=situs-pro-kong/video-mentah/vk-f1-panggung-bangun.mp4
# 1. Ukuran, durasi, codec, suara
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate -show_entries format=duration -of compact "$f"
# 2. Lembar kontak: 12 gambar dari klip, untuk dilihat sekilas
ffmpeg -v error -y -i "$f" -vf "fps=12/$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"),scale=320:-1,tile=6x2" /tmp/lembar.jpg
# 3. Bingkai terakhir dibanding bingkai kunci tujuan (SSIM, 1 = sama persis)
ffmpeg -v error -y -sseof -0.05 -i "$f" -frames:v 1 /tmp/akhir.png
ffmpeg -v error -i /tmp/akhir.png -i situs-pro-kong/seedance/bingkai/K1.png -lavfi "[0]scale=1280:720[a];[1]scale=1280:720[b];[a][b]ssim" -f null - 2>&1 | grep -o "All:[0-9.]*"
# 4. Untuk loop: bingkai pertama dibanding bingkai terakhir
ffmpeg -v error -y -i "$f" -frames:v 1 /tmp/awal.png
ffmpeg -v error -i /tmp/awal.png -i /tmp/akhir.png -lavfi ssim -f null - 2>&1 | grep -o "All:[0-9.]*"
```

Syarat lolos:

| Cek | Syarat |
|---|---|
| Ukuran | 1280x720 (atau sangat dekat, misalnya 1280x720 dari 1248x704 yang diskalakan), 24 fps, durasi sesuai tabel plus minus 0,2 detik |
| Identitas | Maskot, monyet, amplop, pesawat, dan podium sama dengan aset asli: warna, wajah, tempelan, motif. Untuk V5, wajah maskot dibandingkan berdampingan dengan `maskot.webp` pada bingkai 0, tengah, dan akhir. Ada keraguan sedikit saja: gagal |
| Tanpa tambahan | Tidak ada teks, huruf, logo baru, tanda air, tokoh baru, tangan manusia, atau benda yang berubah bentuk |
| Kamera | Gerak halus, tanpa loncatan atau potongan. Bingkai di tengah klip tidak terlalu buram (karena film bisa berhenti di bingkai mana pun saat digulir) |
| Sambungan akhir | SSIM bingkai terakhir terhadap bingkai kunci tujuan minimal 0,85. Di bawah itu, sambungan ke klip berikut memakai penutup (bagian 9.4) |
| Loop (V0, V6) | SSIM bingkai pertama terhadap terakhir minimal 0,95. Kalau 0,90 sampai 0,95: dipotong di bingkai paling mirip lalu disilangkan 0,5 detik (7.7). Di bawah 0,90: ulang |
| Area HP | Subjek tetap di sepertiga tengah sepanjang klip (lihat lembar kontak) |
| Kedip | Tidak ada perubahan warna atau terang yang berkedip antarbingkai |

### 7.7 Cara mengolah untuk web

Semua dikerjakan Claude dengan `situs-pro-kong/alat/olah_video.sh` (ffmpeg sudah ada di lingkungan Claude Code: `/usr/bin/ffmpeg`). Video mentah tidak ikut dipasang ke server.

**Langkah 1, seragamkan.** Ubah ke H.264 8-bit 1280x720 tanpa suara (aman juga kalau masukan HEVC 10-bit dari 1080p):

```bash
ffmpeg -y -i video-mentah/vk-f1-panggung-bangun.mp4 -an -vf "scale=1280:720:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -preset slow kerja/f1.mp4
```

**Langkah 2, urutan bingkai film (V1 sampai V5).** Desktop 12 fps, HP 10 fps dengan potongan tengah 9:16 tanpa pembesaran (405x720):

```bash
# Desktop: 1280x720, 12 fps, WebP kualitas 60
ffmpeg -y -i kerja/f1.mp4 -vf "fps=12" -c:v libwebp -quality 60 -compression_level 6 aset/vbkong/film/d/f1_%03d.webp
# HP: potongan tengah 405x720, 10 fps, kualitas 55. GESER = geser potongan dalam piksel kalau subjek tidak di tengah (bawaan 0)
GESER=0
ffmpeg -y -i kerja/f1.mp4 -vf "fps=10,crop=405:720:(iw-405)/2+$GESER:0" -c:v libwebp -quality 55 -compression_level 6 aset/vbkong/film/h/f1_%03d.webp
```

Jumlah bingkai yang diharapkan:

| Adegan | Desktop (12 fps) | HP (10 fps) |
|---|---|---|
| F1 | 60 | 50 |
| F2 | 60 | 50 |
| F3 | 96 | 80 |
| F4 | 60 | 50 |
| F5 | 84 | 70 |
| Jumlah | 360 (sekitar 14 MB, dimuat per adegan) | 300 (sekitar 5,5 MB, dimuat per adegan) |

Skrip lalu menulis `aset/vbkong/film/daftar.json` berisi jumlah bingkai per adegan dan ukurannya, misalnya `{"d":{"f1":60,...,"w":1280,"h":720},"h":{"f1":50,...,"w":405,"h":720}}`. Pemutar membaca berkas ini, jadi kalau durasi klip berubah, kode tidak perlu diubah.

**Langkah 3, loop hero dan sorotan (V0, V6).** Cari bingkai terakhir yang paling mirip bingkai 0, potong di sana, silangkan 0,5 detik kalau perlu, lalu buat MP4 dan WebM untuk desktop dan HP, plus poster:

```bash
D=6.0   # durasi setelah dipotong
# Silang 0,5 detik antara akhir dan awal (hasil D-0.5 detik, menyambung mulus)
ffmpeg -y -i kerja/hero.mp4 -filter_complex "[0]split[a][b];[a]trim=0.5,setpts=PTS-STARTPTS[isi];[b]trim=0:0.5,setpts=PTS-STARTPTS[kepala];[isi][kepala]xfade=transition=fade:duration=0.5:offset=$(awk "BEGIN{print $D-1.0}")" -an kerja/hero-mulus.mp4
# Desktop
ffmpeg -y -i kerja/hero-mulus.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart aset/vbkong/video/hero-1280.mp4
ffmpeg -y -i kerja/hero-mulus.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -pix_fmt yuv420p aset/vbkong/video/hero-1280.webm
# HP: potongan tengah persegi 540x540
ffmpeg -y -i kerja/hero-mulus.mp4 -an -vf "crop=720:720,scale=540:540" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 28 -movflags +faststart aset/vbkong/video/hero-540.mp4
ffmpeg -y -i kerja/hero-mulus.mp4 -an -vf "crop=720:720,scale=540:540" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 aset/vbkong/video/hero-540.webm
# Poster
ffmpeg -y -i kerja/hero-mulus.mp4 -frames:v 1 -c:v libwebp -quality 70 aset/vbkong/video/hero-poster-1280.webp
ffmpeg -y -i kerja/hero-mulus.mp4 -frames:v 1 -vf "crop=720:720,scale=540:540" -c:v libwebp -quality 68 aset/vbkong/video/hero-poster-540.webp
```

Cadangan kalau sambungan tetap terlihat: loop bolak-balik (maju lalu mundur), panjang jadi dua kali:

```bash
ffmpeg -y -i kerja/hero.mp4 -filter_complex "[0]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0" -an kerja/hero-mulus.mp4
```

V6 diolah sama menjadi `sorot-1280.mp4/.webm`, `sorot-540.mp4/.webm`, dan `sorot-poster-1280.webp/-540.webp`. Untuk HP, potongan tengah persegi diambil dengan podium tetap terlihat (`crop=720:720:269:0`, karena pusat podium ada di x 629).

Target ukuran: `hero-1280.mp4` di bawah 900 KB, `hero-540.mp4` di bawah 350 KB, poster di bawah 60 KB. Kalau lebih, naikkan `-crf` 2 angka.

Di HTML, MP4 ditaruh lebih dulu (paling aman di iPhone), WebM sesudahnya:

```html
<video class="vbk-hero-video" autoplay muted loop playsinline preload="none" poster="aset/vbkong/video/hero-poster-1280.webp" aria-hidden="true">
  <source src="aset/vbkong/video/hero-1280.mp4" type="video/mp4">
  <source src="aset/vbkong/video/hero-1280.webm" type='video/webm; codecs="vp9"'>
</video>
```

Pemilihan versi HP atau desktop dilakukan oleh skrip (lebar layar 720 piksel ke bawah memakai 540), karena atribut `media` di `<source>` tidak bisa diandalkan di semua browser. Video baru mulai dimuat setelah halaman selesai dimuat (`load`), bukan di awal.

**Langkah 4, gambar diam untuk mode tanpa video dan latar panel.** Dari tiap klip film diambil satu bingkai terbaik (atau dari bingkai kunci kalau video belum ada):

- `film/diam/d/1.webp` sampai `6.webp` (1280x720, kualitas 70) dan `film/diam/h/1.webp` sampai `6.webp` (405x720), untuk komik 6 panel (bagian 9.6).
- `latar-api.webp` (dari F2 detik 2,5), `latar-endpoint.webp` (dari F4 detik 1), `latar-domain.webp` (dari F3 detik 4): 1280x720, sudah diburamkan (`gblur=sigma=14`) dan digelapkan (`eq=brightness=-0.12`), kualitas 50, sekitar 30 KB. Ini cara Kong memakai ulang adegan film sebagai latar panel.

### 7.8 Ketidakpastian yang harus diketahui

| Hal | Yang diketahui | Keputusan di PRD ini |
|---|---|---|
| 1080p | Dokumentasi Volcengine mendaftar 480p, 720p, 1080p (1080p berupa HEVC 10-bit). Sebagian halaman BytePlus menyebut 2.5 hanya 480p dan 720p. Laporan pihak ketiga menyebut 1080p mulai pertengahan Agustus 2026 | Pakai 720p. 1080p boleh dicoba untuk V5 dan V3 saja kalau penyedia menerimanya (biaya sekitar 2,25 kali), lalu diubah ke H.264 8-bit (langkah 1) |
| Durasi minimum | Satu halaman Volcengine menyebut 2 sampai 30 detik, halaman lain dan BytePlus menyebut 4 sampai 30 detik | Semua klip 5 detik atau lebih. Tidak ada klip di bawah 4 detik |
| Durasi bawaan | Dokumentasi resmi: -1 (otomatis). Pihak ketiga: 5 detik | Durasi selalu dikirim jelas |
| Saluran alfa | Tidak ada keluaran transparan. Keluaran hanya MP4 atau MOV | Tidak ada tokoh yang dipotong dari video. Semua tokoh yang perlu transparan memakai potongan gambar yang sudah ada. Latar hijau tidak dipakai |
| Bingkai akhir | Bingkai akhir adalah target, bukan salinan piksel persis | Sambungan antarklip disembunyikan dengan amplop menutup layar (TR1) atau penutup CSS (bagian 9.4) |
| Seed | Belum pasti dihormati Seedance 2.x | Tetap dikirim dan dicatat bersama hasil |
| Rasio | Mode gambar awal/akhir hanya `adaptive`. Gambar akhir yang beda rasio akan ditarik | Semua bingkai kunci tepat 1280x720 |
| Gabung mode | Gambar awal/akhir tidak bisa digabung dengan gambar referensi dalam satu permintaan | V3x memakai mode referensi saja |
| Harga | Harga BytePlus dan fal dari pihak ketiga. Harga Volcengine dari halaman resmi lewat ringkasan | Anggap perkiraan. LO melihat harga di konsol sebelum membuat |
| Suara | Bawaannya menyala | Selalu `generate_audio: false`, dan suara dibuang saat diolah |
| Format `mov` | Disarankan panduan Volcengine, isi format belum pasti | Boleh dipakai; diolah sama |

---

## 8. Gaya Kong, peta halaman, kerangka, layar muat, menu, dan hero

### 8.1 Yang ditiru dari Kong dan cara melampauinya

Situs Kong Rolls (rekaman 82 detik, lihat `ANALISIS-VIDEO-KONG.md`) punya tujuh ciri. Semua dipakai, dengan cara kita sendiri:

| Ciri Kong | Di halaman ini | Lebih baik karena |
|---|---|---|
| Layar muat dengan bilah kemajuan | LM1 + LM2: bilah yang benar-benar menghitung berkas adegan 1, ditambah cek `GET /api/health` | Paling lama 1,2 detik, hanya sekali per sesi, dan cek API-nya jujur (tidak menampilkan apa pun kalau gagal) |
| Film dulu, teks belakangan | Hero dengan nama, kalimat inti, dan tombol API tampil dulu. Film 30 detik baru mulai setelahnya | Peninjau dan developer langsung tahu ini produk apa |
| Satu tokoh, satu dunia | Satu amplop (Surat Uji #001) diikuti dari podium sampai celah kotak surat. Satu panggung teal dari atas sampai bawah | Ada tujuan dan rasa penasaran ("sampai tidak?"), bukan lelucon lepas-lepas |
| Kamera terus bergerak | Crane turun, spiral naik, menyusuri bibir podium, berguling di langit, menukik ke celah | Ada momen nyaris jatuh yang diberi gulir lebih panjang (gerak lambat), jadi ada naik-turun rasa |
| Ikon gulir bulat | Garis rute (GL1) dengan amplop mini dan empat titik: Dikirim, Dioper, Di udara, Sampai | Penanda gulir ikut bercerita, dan muncul lagi di footer sampai penuh |
| Adegan diulang sebagai panel | Bingkai film yang diburamkan menjadi latar API, Semua endpoint, dan Domain | Aset video dipakai dua kali tanpa tambahan berkas besar |
| Huruf retro tebal dan huruf kuas | Huruf gunting buatan sendiri (JD1) dengan tekstur bahan aset | Milik sendiri, menyambung gaya origami, bukan meniru huruf Kong |
| Akhir heroik: tokoh raksasa mengangkat simbol misi | FT1: lampu padam, slogan raksasa, maskot naik dari dalam podium lewat pintu lift, amplop dari film jatuh ke celah kotak yang ia angkat | Footer menutup cerita film. Ada jeda gelap sebelum klimaks, dan pengunjung yang mengetik awalan melihat namanya di amplop |
| Menu pil kaca di tengah | MN1 dengan tombol bulat di dua ujung: kiri cincin kemajuan halaman, kanan tombol bahasa | Fungsinya berguna, bukan hiasan |
| Film tanpa teks dan tanpa alternatif | Film punya keterangan tersembunyi untuk pembaca layar, tombol Lewati film, dan versi komik 6 panel saat kurangi gerakan | Bisa diakses semua orang |

### 8.2 Peta halaman

Urutan dari atas ke bawah. "Pin" adalah jarak tahan dalam persen tinggi layar.

| No | Bagian | `id` | Latar | Pin desktop | Pin HP | Modul |
|---|---|---|---|---|---|---|
| 0 | Layar muat | | `#01232d` | | | LM1, LM2 |
| 1 | Menu (tetap di atas) | | Kaca | | | MN1 |
| 2 | Hero | `atas` | Video V0 | Tidak di-pin, scrub saat keluar layar | Sama | HR1 |
| 3 | Bab 1: film "Surat Sampai (Perjalanan Surat #001)" | `film` | Urutan bingkai V1 sampai V5 di canvas | 600 persen | 450 persen | GL5, GL1, GL4, TR1 |
| 4 | Kartu penutup bab | `bab-2` | `#00141a` | 60 persen | Tanpa pin | TR5 |
| 5 | Cara kerja | `cara-kerja` | `#033141` + tepi sobek | 300 persen | Tanpa pin, kartu `position: sticky` | CK1 |
| 6 | API | `api` | `latar-api.webp` buram | Tanpa pin | Tanpa pin | API1, AW1, AW3, AW4 |
| 7 | Semua endpoint | `endpoint` | `latar-endpoint.webp` buram | Tanpa pin | Tanpa pin | EP1 (cadangan EP4) |
| 8 | Domain | `domain` | `latar-domain.webp` buram | Tanpa pin | Tanpa pin | DM1 |
| 9 | Tentang | `tentang` | `#01232d` | Tanpa pin | Tanpa pin | TT1 |
| 10 | Penutup | `penutup` | Video V6 (dibagi dengan footer) | 200 persen | Tanpa pin | PN1, PN2 |
| 11 | Footer maskot | `kaki` | Video V6, lampu padam | 160 persen | 130 persen | FT1 |
| 12 | Kaki halaman (tautan, kontak, sosial, hak cipta) | | `#00141a` | | | KT3 |

Kalau halaman lama memakai `id` lain untuk bagian yang sama (misalnya `#domains`), `id` lama ditambahkan sebagai jangkar tambahan (`<span id="domains"></span>` di awal bagian), supaya tautan lama tetap bekerja.

### 8.3 Kerangka teknis

**Berkas di repo** (folder baru `situs-pro-kong/`):

```text
situs-pro-kong/
  README.md                 cara pratinjau, cara olah, cara pasang
  sumber.html               sumber halaman yang diedit (tempat isian ditulis di sini)
  index.html                hasil rakit.py dari sumber.html + isian.json, yang dipasang
  isian.json                data dari LO (bagian 13.1)
  aset/vbkong/
    gaya.css                semua gaya, kelas berawalan vbk-
    halaman.js              bahasa, menu, salin, awalan, domain, cek API, isian, kurangi gerakan (tanpa GSAP)
    gerak.js                semua animasi GSAP, pemutar film, footer (dimuat hanya kalau gerak diizinkan)
    gunting.svg             huruf gunting
    js/                     gsap.min.js, ScrollTrigger.min.js, MotionPathPlugin.min.js (3.13.0, disalin dari situs-pro/aset/vbpro/js/), lenis.min.js
    font/                   Archivo dan JetBrains Mono WOFF2 subset
    gambar/                 potongan dari situs-pro + turunan baru (bagian 6)
    film/d/, film/h/        urutan bingkai desktop dan HP
    film/diam/d/, film/diam/h/   6 gambar komik
    film/daftar.json
    video/                  hero-*, sorot-*, poster
  seedance/                 tidak dipasang: bingkai/ (bingkai kunci), sumber/
  video-mentah/             tidak dipasang: hasil Seedance dari LO
  lama/                     tidak dipasang: salinan /pro lama
  alat/                     olah_aset_kong.py, huruf_gunting.py, bingkai_kunci.py, olah_video.sh, rakit.py, ukur_muatan.mjs
  pasang/                   pasang-kong.sh, kembalikan-kong.sh, siapkan.js, kaki-depan.sh, sisip-kaki.js
```

**Teknologi:**

- HTML, CSS, dan JavaScript biasa, tanpa framework dan tanpa langkah build wajib. Repo ini juga berisi aplikasi Next.js (folder `app/`), tetapi halaman /pro **tidak** dibangun dengan Next.js dan tidak menyentuh folder itu.
- GSAP 3.13.0 + ScrollTrigger + MotionPathPlugin, disimpan lokal (sekitar 56 KB setelah gzip untuk ketiganya). Tidak memakai CDN saat halaman dibuka.
- Lenis (gulir halus) hanya di desktop dengan `pointer: fine`, versi tetap yang dicek ada (`npm view lenis versions`), disimpan lokal, disambung ke GSAP: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)`. Mati di layar sentuh dan saat kurangi gerakan.
- `halaman.js` memuat GSAP dan `gerak.js` hanya kalau gerak diizinkan dan layar bukan mode Save-Data. Kalau tidak, halaman tetap lengkap dalam tampilan diam.
- `ScrollTrigger.config({ ignoreMobileResize: true })`. Tidak memakai `normalizeScroll` (berisiko di iOS).
- Semua animasi hanya mengubah `transform`, `opacity`, `clip-path`, dan `filter` ringan. `will-change: transform` hanya pada lapisan yang sedang bergerak.
- `gsap.matchMedia()` dengan kondisi `gerak: (prefers-reduced-motion: no-preference)`, `hp: (max-width: 720px)`, `mouse: (pointer: fine)`.
- Satuan tinggi `svh` (dengan cadangan `vh`).

**Bahasa:**

- Setiap teks punya dua pasang `<span lang="id">` dan `<span lang="en">` (pola yang sama dengan Fase 1). CSS menyembunyikan yang tidak aktif berdasarkan `data-bahasa` di `<html>`.
- Bawaan Bahasa Indonesia (`<html lang="id">`). Pilihan disimpan di `localStorage` (dibungkus `try/catch`). `?lang=en` di alamat memaksa EN.
- Saat berganti bahasa: atribut `lang` di `<html>` ikut berganti, `document.title` berganti, label `aria-label` berganti dari `data-label-id` / `data-label-en`, dan judul huruf gunting dirakit ulang.
- Teks teknis lama yang tidak punya versi EN di halaman lama tetap tampil apa adanya di dua bahasa.

**Data dari LO** (`isian.json`) dimasukkan ke `index.html` oleh `alat/rakit.py` sebelum dipasang (bagian 13.1). Bagian yang isiannya kosong **dihapus dari HTML**, bukan hanya disembunyikan.

### 8.4 Kepala halaman: judul tab, meta, dan kartu bagikan

| Unsur | ID | EN |
|---|---|---|
| Judul tab (`<title>`) | VenbeeMail Pro · Kotak masuk uji lewat API | VenbeeMail Pro · A test inbox over an API |
| `meta description` | VenbeeMail Pro: kotak masuk uji lewat API dari pembuat BanaMail. Buat alamat email sementara, baca surat, ambil lampiran, lalu hapus dari kode tesmu. | VenbeeMail Pro: a test inbox over an API from the maker of BanaMail. Create a temporary address, read mail, fetch attachments, then delete it from your tests. |
| `og:title` / `twitter:title` | VenbeeMail Pro | VenbeeMail Pro |
| `og:description` / `twitter:description` | Kotak masuk uji lewat API. Buat alamat, baca surat, ambil lampiran, hapus. Dari pembuat BanaMail. | A test inbox over an API. Create an address, read mail, fetch attachments, delete. From the maker of BanaMail. |
| `og:image:alt` / `twitter:image:alt` | Maskot pisang VenbeeMail mengangkat kotak surat di atas panggung teal, dengan amplop melayang | The VenbeeMail banana mascot holding up a mailbox on a teal stage, with an envelope floating nearby |

`<head>` yang ditulis (meta dalam Bahasa Indonesia sebagai bahasa utama halaman; JS hanya mengganti `<title>` saat EN dipilih):

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>VenbeeMail Pro · Kotak masuk uji lewat API</title>
<meta name="description" content="VenbeeMail Pro: kotak masuk uji lewat API dari pembuat BanaMail. Buat alamat email sementara, baca surat, ambil lampiran, lalu hapus dari kode tesmu.">
<link rel="canonical" href="https://venbeemail.com/pro/">
<meta name="theme-color" content="#01232d">
<meta name="author" content="NongBana">
<meta property="og:type" content="website">
<meta property="og:site_name" content="VenbeeMail">
<meta property="og:url" content="https://venbeemail.com/pro/">
<meta property="og:title" content="VenbeeMail Pro">
<meta property="og:description" content="Kotak masuk uji lewat API. Buat alamat, baca surat, ambil lampiran, hapus. Dari pembuat BanaMail.">
<meta property="og:image" content="https://venbeemail.com/pro/aset/vbkong/gambar/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Maskot pisang VenbeeMail mengangkat kotak surat di atas panggung teal, dengan amplop melayang">
<meta property="og:locale" content="id_ID">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="VenbeeMail Pro">
<meta name="twitter:description" content="Kotak masuk uji lewat API. Buat alamat, baca surat, ambil lampiran, hapus. Dari pembuat BanaMail.">
<meta name="twitter:image" content="https://venbeemail.com/pro/aset/vbkong/gambar/og.jpg">
<meta name="twitter:image:alt" content="Maskot pisang VenbeeMail mengangkat kotak surat di atas panggung teal, dengan amplop melayang">
<!-- twitter:creator hanya ditulis rakit.py kalau akun X sudah diisi LO -->
```

- Favicon: tautan favicon yang ada di halaman lama disalin apa adanya (B3).
- Data terstruktur (opsional, tanpa rating atau angka):
  ```html
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebPage","name":"VenbeeMail Pro","url":"https://venbeemail.com/pro/","inLanguage":["id","en"],"description":"Kotak masuk uji lewat API dari pembuat BanaMail.","author":{"@type":"Person","name":"NongBana"},"publisher":{"@type":"Organization","name":"VenbeeMail","url":"https://venbeemail.com/","email":"admin@venbeemail.com"}}
  </script>
  ```
- Versi uji di `/pro/kong/` mendapat tambahan `<meta name="robots" content="noindex, nofollow">` (ditulis `siapkan.js --mode uji`), supaya tidak masuk mesin pencari. Versi utama tidak.

### 8.5 Layar muat (LM1 + LM2)

- **Tujuan:** menyiapkan berkas adegan pertama tanpa membuat orang menunggu lama, sekaligus memeriksa API secara jujur.
- **Kapan tampil:** hanya kunjungan pertama dalam satu sesi (`sessionStorage`), tidak tampil kalau alamat punya jangkar (misalnya `/pro/#api`), tidak tampil saat kurangi gerakan atau Save-Data.
- **Tampilan:** latar `#01232d`, logo VENBEEMAIL huruf gunting dengan lencana PRO di tengah (lebar `min(70vw, 520px)`), bilah tipis 2 piksel selebar logo di bawahnya (isi oranye), satu baris kecil di bawah bilah, dan satu baris mono kecil di bawahnya lagi.
- **Teks:**

| Kunci | ID | EN |
|---|---|---|
| Baris muat | Menyiapkan panggung | Setting the stage |
| Baris API (sedang) | GET /api/health … | GET /api/health … |
| Baris API (berhasil) | GET /api/health · menjawab | GET /api/health · responding |
| Label pembaca layar | Memuat halaman | Loading the page |

- **Bilah jujur (LM1):** daftar berkas yang dihitung: `gunting.svg`, dua font, poster hero, dan 20 bingkai pertama adegan 1 (versi HP atau desktop). Bilah = jumlah selesai dibagi jumlah berkas. Selesai saat semua terunduh atau setelah 1,2 detik, mana yang lebih dulu. Sisa berkas terus dimuat di belakang.
- **Cek API (LM2):** `fetch('/api/health', { cache: 'no-store' })` dengan batas waktu 1,5 detik (`AbortController` + `setTimeout`, karena `AbortSignal.timeout` belum ada di Safari lama). Jawaban dianggap berhasil kalau status 2xx; isi jawaban tidak ditampilkan. Hasilnya disimpan di variabel halaman untuk titik status di kaki halaman (bagian 15). Kalau gagal atau lewat batas waktu: baris API memudar tanpa tulisan apa pun, dan titik status tidak ditampilkan. Cek ini tetap berjalan walau layar muat dilewati.
- **Keluar:** logo dan bilah memudar 0,3 detik, lalu layar muat terbelah ke atas (`clip-path: inset(0 0 100% 0)`), memperlihatkan hero.
- **Lewati:** ketuk, klik, tombol Esc, atau mulai menggulir langsung menutup layar muat.
- **Aksesibilitas:** `role="status"` dengan `aria-live="polite"`. Isi halaman sudah ada di DOM di belakangnya. Fokus keyboard tidak ditahan.

### 8.6 Menu (MN1)

**Desktop (lebar di atas 900 piksel):**

- Tetap di atas, 16 piksel dari tepi atas.
- Kiri: logo kecil (VENBEEMAIL huruf gunting tinggi 22 piksel + lencana PRO 3D seperti PRD pertama + wajah huruf B). Logo adalah tautan ke `#atas`; huruf B adalah tombol tersendiri.
- Tengah: pil kaca (`backdrop-filter: blur(14px)`, latar `rgba(1, 35, 45, .55)`, garis tepi `rgba(255, 255, 255, .12)`, tinggi 52 piksel). Di ujung kiri pil ada tombol bulat 44 piksel berisi amplop mini dengan cincin kemajuan gulir seluruh halaman (lingkaran SVG, `stroke-dashoffset`); tombol ini membawa ke atas. Lalu tautan bagian. Di ujung kanan pil ada tombol bulat 44 piksel bertuliskan bahasa yang akan dipilih ("EN" saat ID aktif, "ID" saat EN aktif).
- Kanan: tombol pil oranye "Coba API" (KT2), ke `#api`.
- Tautan bagian yang sedang dilihat diberi garis bawah bertepi sobek oranye.
- Selama film diputar, menu turun ke opacity 0,55 dan kembali penuh saat disentuh mouse atau fokus keyboard. Di bagian lain opacity penuh.

**HP (900 piksel ke bawah):**

- Kiri: logo. Kanan: tombol pil "Menu".
- "Menu" membuka lembar dari bawah (tinggi sesuai isi, sudut atas 24 piksel, latar `#01232d`): tautan bagian setinggi 52 piksel, tombol ID/EN, tombol "Coba API" selebar lembar, tombol "Kurangi gerakan".
- Lembar menutup dengan tombol "Tutup", tombol Esc, ketuk di luar lembar, atau memilih tautan. Fokus dikunci di dalam lembar selama terbuka, lalu kembali ke tombol "Menu".
- `backdrop-filter` dimatikan di HP; pil memakai latar padat `rgba(1, 35, 45, .92)`.

**Teks:**

| Kunci | ID | EN |
|---|---|---|
| Menu 1 | Cara kerja | How it works |
| Menu 2 | API | API |
| Menu 3 | Endpoint | Endpoints |
| Menu 4 | Domain | Domains |
| Menu 5 | Tentang | About |
| Tombol utama | Coba API | Try the API |
| Tombol HP | Menu | Menu |
| Tutup | Tutup | Close |
| Tombol atas (label) | Kembali ke atas | Back to top |
| Tombol bahasa (label) | Ganti bahasa ke English | Switch language to Bahasa Indonesia |
| Huruf B (label) | Ganti wajah huruf B | Change the B's face |
| Navigasi (label) | Bagian halaman | Page sections |

- Menu "Tentang" selalu tampil (bagian Tentang selalu ada, minimal berisi kalimat pembuat dan kontak).

### 8.7 Hero (HR1, amplop di podium)

- **Tujuan:** dalam 1 detik pengunjung tahu: nama produk, gunanya, siapa pembuatnya, dan tombol ke API.

**Tata letak desktop:**

- Tinggi 100svh. Lapis belakang: video V0 (`object-fit: cover`, `object-position: 49% 60%`), poster tampil sampai video siap.
- Gradien bawah: dari transparan di 50 persen tinggi ke `rgba(1, 35, 45, .92)` di bawah, supaya teks terbaca di atas podium.
- Wordmark VENBEEMAIL PRO huruf gunting, lebar `min(92vw, 1180px)`, tepi atas 16svh, rata tengah. Isian tekstur `bunga` dengan bayangan oranye. Kata PRO lebih kecil, isian `kertas`, miring 6 derajat, menempel di kanan bawah kata VENBEEMAIL seperti stiker. Amplop di video tampak melayang di bawah wordmark, sedikit menutupi tepi bawahnya.
- Kiri bawah (24 piksel dari kiri, 72 piksel dari bawah, lebar maksimal 36ch): label kecil, kalimat 1 (Archivo 700, `clamp(22px, 2.2vw, 30px)`), kalimat 2 (17 piksel), lalu dua tombol berdampingan.
- Kanan bawah: baris pembuat (mono 13 piksel).
- Tengah bawah: garis rute mini (amplop kecil di garis putus-putus 120 piksel) dengan label gulir di bawahnya.
- Tombol kecil "Jeda video" di pojok kanan bawah, di atas baris pembuat (bagian 10.5).

**Tata letak HP:**

- Video 540 persegi, `object-fit: cover`, amplop di 50 persen tinggi.
- Wordmark dua baris: VENBEE / MAIL PRO, lebar 92vw, tepi atas 13svh.
- Teks di bawah dengan jarak tepi 16 piksel: label, kalimat 1 (22 piksel), kalimat 2 (16 piksel), tombol bertumpuk selebar layar (tinggi 52 piksel), baris pembuat di bawah tombol, label gulir di atas area aman bawah (`env(safe-area-inset-bottom)`).

**Teks:**

| Kunci | ID | EN |
|---|---|---|
| Label kecil | Untuk developer | For developers |
| Judul (`<h1>`, teks tersembunyi di balik wordmark) | VenbeeMail Pro | VenbeeMail Pro |
| Kalimat 1 | Kotak masuk uji lewat API. | A test inbox over an API. |
| Kalimat 2 | Buat alamat, baca surat, ambil lampiran, lalu hapus, langsung dari kode tesmu. | Create an address, read mail, fetch attachments, then delete it, right from your test code. |
| Tombol 1 (oranye, ke `#api`) | Lihat API | See the API |
| Tombol 2 (bergaris tepi, ke `#cara-kerja`) | Cara kerja | How it works |
| Baris pembuat | Dari pembuat BanaMail · oleh NongBana | From the maker of BanaMail · by NongBana |
| Label gulir | Gulir untuk mengikuti surat | Scroll to follow the letter |

Kalimat 2 sesuai endpoint yang ada: buat (`POST /api/addresses`), baca (`GET /api/mailbox`, `GET /api/messages/:id`), lampiran (`GET /api/messages/:id/attachments/:n`), hapus (`DELETE /api/addresses/me`). Kalau halaman lama memakai istilah lain untuk hal yang sama, pakai istilah halaman lama.

**Gerak:**

- Intro setelah layar muat (atau langsung kalau layar muat dilewati), total 0,8 detik: huruf wordmark ditempel satu per satu dari bawah (`y: 30%` ke 0, putaran acak plus minus 8 derajat ke sudut akhirnya, jeda 0,04 detik), kata PRO ditempel terakhir dengan hentakan kecil (skala 1,2 ke 1), lalu kalimat dan tombol naik pelan. Kalau pengunjung menggulir di tengah intro, intro langsung selesai.
- Saat hero digulir keluar (tanpa pin, scrub 0,6, dari `top top` sampai `bottom top`): wordmark `yPercent -20` dan skala 0,96; video skala 1 ke 1,1 dan makin gelap sampai kecerahan 0,35 (menyamai panggung gelap di bingkai kunci K0); blok teks naik dan memudar habis di 60 persen; tirai `#00141a` menebal di 85 sampai 100 persen. Jadi film mulai dari panggung gelap tanpa sambungan yang terasa.
- Wajah huruf B: berkedip sendiri tiap 3 sampai 6 detik, mata mengikuti kursor (desktop), berganti wajah saat ditekan.
- Video dijeda saat hero tidak terlihat (`IntersectionObserver`).

**Interaksi:** dua tombol, tombol huruf B, tombol Jeda video.

**Aksesibilitas:** `<h1>` berisi teks "VenbeeMail Pro". Wordmark SVG `aria-hidden`. Video `aria-hidden`, tanpa suara. Tombol minimal 44x44 piksel dengan cincin fokus oranye 3 piksel.

**Kurangi gerakan:** tanpa intro, tanpa scrub, poster diam sebagai pengganti video, semua teks langsung tampil.

---

## 9. Bab 1: film "Surat Sampai (Perjalanan Surat #001)"

### 9.1 Tujuan, tata letak, dan alur

- **Tujuan:** tontonan murni seperti Kong, tanpa teks, digerakkan jari. Ceritanya sama dengan cara kerja produk: surat dikirim, dioper, terbang, lalu ditangkap kotak masuk.
- **Tata letak:** satu `<canvas>` memenuhi layar (100vw x 100svh), urutan bingkai digambar dengan cara `cover`. Di atasnya: lapisan potongan monyet dan amplop (adegan 3), lapisan penutup sambungan, garis rute (GL1), tombol Lewati film (GL4), dan label bab.
- **Pin:** desktop `end: "+=600%"`, HP `end: "+=450%"`, `scrub: 0.5`, `anticipatePin: 1`.
- **Label bab:** di kiri atas di bawah menu, mono 13 piksel huruf kapital, tampil di 0 sampai 6 persen lalu memudar.

| Kunci | ID | EN |
|---|---|---|
| Label bab | BAB 1 · PERJALANAN SURAT #001 | CHAPTER 1 · THE JOURNEY OF LETTER #001 |
| Judul tersembunyi (`<h2 class="vbk-sr">`) | Surat Sampai: perjalanan surat uji #001 | Delivered: the journey of test letter #001 |

**Pembagian gulir.** Tiap adegan mendapat jatah sesuai panjang klip, kecuali adegan 3 yang diberi 1,5 kali supaya momen nyaris jatuh terasa lambat (bobot 5, 5, 12, 5, 7; jumlah 34).

| Adegan | Klip | Kemajuan pin | Yang terjadi | Garis rute |
|---|---|---|---|---|
| 1 Panggung bangun | V1 | 0,000 sampai 0,147 | Kamera turun ke podium, lampu menyala satu per satu, tempelan hantu di amplop berkedip | "Dikirim" menyala di 0,00 |
| 2 Lepas landas | V2 | 0,147 sampai 0,294 | Pesawat kertas menyambar amplop dari kiri, naik berspiral di sekitar sorotan, amplop menutupi layar | |
| 3 Estafet | V3 + potongan | 0,294 sampai 0,647 | Kamera menyusuri bibir podium. Empat monyet (potongan) mengoper amplop: merah, biru, cokelat (nyaris jatuh), pirang (lempar ke atas) | "Dioper" menyala di 0,294 |
| 4 Di atas sorotan | V4 | 0,647 sampai 0,794 | Pesawat dan amplop berguling 180 derajat di langit teal berbintang bunga | "Di udara" menyala di 0,647 |
| 5 Menukik | V5 + CSS | 0,794 sampai 1,000 | Kamera menukik ke maskot, naik ke kotak surat, masuk ke celah. Layar gelap dengan berkas cahaya hangat | "Sampai" menyala di 0,970 |

### 9.2 Pemutar urutan bingkai (GL5)

- Membaca `film/daftar.json`. Memilih set `h` (lebar layar 720 ke bawah) atau `d`.
- **Memuat per adegan:** saat halaman siap, muat 20 bingkai pertama adegan 1 (sudah dihitung layar muat). Begitu film terlihat, muat sisa adegan 1 dan seluruh adegan 2. Setelah itu selalu muat adegan yang sedang dilihat dan satu adegan di depannya. Paling banyak 6 unduhan berjalan bersamaan. Di HP, bingkai dari adegan yang sudah lewat dua adegan dilepas dari memori (referensi `Image` dihapus).
- **Koneksi hemat:** kalau `navigator.connection.saveData` aktif, film diganti mode komik (9.6). Kalau `effectiveType` adalah `2g` atau `3g`, hanya setiap bingkai kedua yang dimuat (HP jadi 5 fps).
- **Menggambar:** ukuran canvas = ukuran CSS dikali `min(devicePixelRatio, 2)`. Gambar `cover`. Untuk scrub halus, gambar bingkai `i`, lalu bingkai `i+1` dengan `globalAlpha` sama dengan sisa pecahan (hanya kalau pecahan di antara 0,15 dan 0,85). Gambar ulang hanya saat indeks atau pecahan berubah (`requestAnimationFrame`, bukan di setiap event gulir).
- **Bingkai belum datang:** gambar bingkai terdekat yang sudah ada. Kalau satu adegan belum punya bingkai sama sekali, gambar `film/diam/` adegan itu.
- **Waktu lambat di adegan 3:** kemajuan lokal adegan 3 (`q`, 0 sampai 1) dipetakan ke indeks bingkai V3 dengan kurva yang melambat di `q` 0,48 sampai 0,80 (momen nyaris jatuh), sehingga latar bergerak lebih pelan sementara potongan monyet bergerak normal.
- **Mode tanpa video:** kalau `daftar.json` belum ada (video belum dibuat), film memakai 6 gambar diam dari bingkai kunci (`K0`, `K1`, `K2`, `K3a`, `K4`, `K5`) dengan perpindahan silang dan gerak kamera pelan GSAP (skala 1 ke 1,08 dan geser 3 persen per gambar), tetap digerakkan gulir dengan pin yang sama. Ini membuat seluruh halaman bisa dibangun dan dipasang sebelum video selesai.

Kerangka kode pemutar:

```js
function pemutarFilm(canvas, daftar, set) {
  const ctx = canvas.getContext("2d");
  const adegan = ["f1", "f2", "f3", "f4", "f5"];
  const gambar = {}; // gambar["f3"][i] = HTMLImageElement
  let terakhir = "";
  function url(a, i) { return `aset/vbkong/film/${set}/${a}_${String(i + 1).padStart(3, "0")}.webp`; }
  function muat(a) {
    if (gambar[a]) return;
    gambar[a] = [];
    for (let i = 0; i < daftar[set][a]; i++) { const im = new Image(); im.decoding = "async"; im.src = url(a, i); gambar[a][i] = im; }
  }
  function siap(im) { return im && im.complete && im.naturalWidth > 0; }
  function gambarCover(im, alfa) {
    const s = Math.max(canvas.width / im.naturalWidth, canvas.height / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = alfa;
    ctx.drawImage(im, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }
  return function tampil(a, posisi) { // posisi = indeks pecahan di dalam adegan a
    const kunci = a + ":" + posisi.toFixed(2);
    if (kunci === terakhir) return; terakhir = kunci;
    muat(a);
    const n = daftar[set][a], i = Math.min(n - 1, Math.floor(posisi)), sisa = posisi - i;
    const daftarAda = gambar[a];
    let im = daftarAda[i];
    if (!siap(im)) im = daftarAda.slice(0, i).reverse().find(siap) || daftarAda.find(siap);
    if (!im) return; // gambar diam sudah ada di bawah canvas sebagai cadangan
    gambarCover(im, 1);
    const lanjut = daftarAda[i + 1];
    if (sisa > 0.15 && sisa < 0.85 && siap(lanjut)) gambarCover(lanjut, sisa);
    ctx.globalAlpha = 1;
  };
}
```

### 9.3 Adegan 3: estafet monyet (potongan + GSAP di atas V3)

V3 hanya latar (bibir podium tanpa tokoh). Empat monyet adalah potongan transparan yang sudah ada, amplop adalah `amplop.webp`. Semua digerakkan GSAP mengikuti kemajuan lokal `q` (0 sampai 1) di adegan 3.

**Ukuran dan lapisan:**

- Tinggi monyet: desktop 34svh (gambar ukuran penuh), HP 22svh (versi 512). Amplop: desktop 11vw, HP 22vw.
- Urutan lapisan dari belakang: canvas, bayangan lantai monyet (elips `rgba(0, 0, 0, .35)` buram, di garis bibir podium), jejak bayangan (3 salinan samar seperti Fase 1, hanya saat bergerak cepat), monyet, cahaya tepi (`monyet-*-tepi.webp`, `mix-blend-mode: screen`), amplop.
- Penyatuan warna: monyet diberi `filter: brightness(.9) saturate(.92) contrast(1.04)` (tetap, tidak dianimasikan), cahaya tepi teal, dan bayangan lantai. Saat melesat, monyet dimiringkan (`skewX` sampai 8 derajat ke arah gerak) dan jejak bayangan muncul, sebagai pengganti blur gerak (filter blur yang dianimasikan terlalu berat di HP).
- Garis lantai: semua monyet "berdiri" di garis bibir podium yang ada di video, kira-kira 72 persen tinggi layar (dicocokkan setelah video jadi; disimpan sebagai variabel `--vbk-garis-lantai`).

**Ketukan (watak dari PRD pertama S7: merah sigap memimpin, biru suka trik, cokelat santai, pirang paling cepat):**

| `q` | Gerak |
|---|---|
| 0,00 sampai 0,12 | Amplop (potongan) turun dari skala 3 (seolah baru lepas dari layar tertutup di akhir V2) ke skala 1, mendarat di tangan monyet merah yang meluncur masuk dari kiri (`x` dari -60vw ke -18vw dari tengah), dengan lompatan kecil (S1 ollie) saat menangkap |
| 0,12 sampai 0,30 | Merah melempar: amplop terbang di busur MotionPath dari tangan merah ke tangan biru (puncak 30svh di atas garis lantai), berputar 360 derajat. Biru masuk dari kanan di `q` 0,15 sampai 0,28, potongannya dimiringkan -8 derajat dan bergoyang `skewX` plus minus 4 derajat (kepang berkibar). Biru menangkap sambil berputar penuh sekali (S2 trik putar). Merah keluar ke kiri bawah dan berhenti separuh terlihat di tepi kiri |
| 0,30 sampai 0,48 | Biru melempar ke cokelat yang masuk pelan dari kiri bawah (paling lambat) |
| 0,48 sampai 0,80 | Nyaris jatuh (latar diperlambat, 9.2): amplop meleset dari tangan cokelat, jatuh berputar 540 derajat ke arah bibir podium. Di `q` 0,70 cokelat menerjang (putar -18 derajat, geser ke arah amplop), di `q` 0,76 amplop tertangkap di ujung jari dan tergantung miring 35 derajat, lalu bergoyang dua kali dan tegak |
| 0,80 sampai 1,00 | Pirang melesat dari kanan (paling cepat, jejak bayangan penuh), mengambil amplop, lalu melempar lurus ke atas. Amplop naik keluar dari tepi atas layar sambil mengecil ke skala 0,6. Semua monyet meluncur keluar ke tepi terdekat |

Lintasan busur dibuat dengan MotionPathPlugin (`path` dari tiga titik: tangan pelempar, puncak, tangan penerima; `curviness: 1.2`; `autoRotate: false`, putaran diatur sendiri). Titik tangan disimpan sebagai persen dari kotak potongan masing-masing monyet (diukur sekali dari gambar dan disimpan di `gerak.js`).

**HP:** keempat monyet tetap muncul, tetapi paling banyak dua yang terlihat bersamaan. Busur lebih pendek (puncak 18svh). Jejak bayangan hanya 2 salinan.

### 9.4 Sambungan antaradegan

| Sambungan | Cara menyembunyikan |
|---|---|
| Hero ke adegan 1 | Hero menggelap ke `#00141a` (8.7), adegan 1 mulai dari panggung gelap (K0) |
| Adegan 1 ke 2 | V1 berakhir dan V2 mulai di bingkai kunci yang sama (K1) |
| Adegan 2 ke 3 | TR1: akhir V2 adalah amplop memenuhi layar. Di awal adegan 3, potongan amplop besar (skala 3) sudah menutupi layar lalu mengecil, sehingga potongan video tidak terlihat |
| Adegan 3 ke 4 | Amplop dilempar keluar dari tepi atas. Bersamaan, sapuan kertas: pita kertas sobek (SVG polygon warna `#f4f1ea`, tepi bergerigi dibuat skrip dengan seed tetap) menyapu dari bawah ke atas selama 1,2 persen kemajuan pin, menutupi potongan. Di baliknya adegan 4 mulai |
| Adegan 4 ke 5 | TR1 versi CSS: potongan amplop di posisi amplop video membesar sampai menutupi layar (0,8 persen kemajuan pin), lalu mengecil ke arah pusat podium dan menghilang, memperlihatkan V5 |
| Akhir adegan 5 (masuk celah) | Di kemajuan 0,94 sampai 1,00: canvas diperbesar 1 ke 1,8 dengan pusat di celah surat (sekitar 50 persen, 46 persen), vignette radial hitam menebal sampai opacity 0,96, lalu satu berkas cahaya hangat tegak (gradien `#ffb070`, opacity 0 ke 0,55, `mix-blend-mode: screen`) menyala di tengah dan meredup. Akhirnya layar `#00141a` penuh, menyambung ke kartu penutup |

Kalau SSIM sambungan V1 ke V2 di bawah 0,85 (7.6), pakai juga sapuan kertas di sambungan itu.

### 9.5 Garis rute (GL1) dan tombol Lewati film (GL4)

**Garis rute desktop:** di tengah bawah, 28 piksel dari bawah, lebar `min(560px, 60vw)`. Garis putus-putus putih opacity 0,5, empat titik bulat 10 piksel dengan label kecil di bawahnya (mono 12 piksel). Amplop mini (24 piksel) berjalan di garis mengikuti kemajuan film. Titik yang sudah dilewati terisi oranye dan labelnya menjadi putih penuh. Bagian garis yang sudah dilewati menjadi garis utuh.

**Garis rute HP:** tegak di tepi kanan, 12 piksel dari tepi, tinggi 46svh, di tengah tegak. Hanya label titik yang aktif yang tampil, di kiri titiknya.

| Kunci | ID | EN |
|---|---|---|
| Titik 1 | Dikirim | Sent |
| Titik 2 | Dioper | Passed |
| Titik 3 | Di udara | In the air |
| Titik 4 | Sampai | Delivered |
| Label garis (pembaca layar) | Kemajuan perjalanan surat | Letter's journey progress |

Garis rute juga dipakai di hero (versi mini sebagai ajakan gulir) dan muncul lagi di footer (14.4).

**Tombol Lewati film:** pil kecil kaca di kanan bawah (24 piksel dari kanan dan bawah; di HP 16 piksel, di kiri garis rute), tampil selama film di-pin. Membawa ke `#bab-2` (dengan Lenis `scrollTo` di desktop, langsung lompat di HP). Bisa dicapai dengan keyboard; urutan fokusnya tepat setelah tautan terakhir di menu saat film aktif.

| Kunci | ID | EN |
|---|---|---|
| Tombol | Lewati film | Skip the film |

### 9.6 Keterangan film dan mode komik

Keterangan enam adegan dipakai di dua tempat: daftar tersembunyi untuk pembaca layar (`<ol class="vbk-sr">` di dalam bagian film, canvas `aria-hidden`), dan teks di bawah gambar pada mode komik.

| No | ID | EN |
|---|---|---|
| 1 | Panggung menyala. Surat Uji #001 menunggu di podium. | The stage lights up. Test Letter #001 waits on the podium. |
| 2 | Pesawat kertas menyambar suratnya dan membawanya terbang. | A paper plane swoops in and carries the letter off. |
| 3 | Empat monyet mengoper surat. Yang cokelat nyaris menjatuhkannya. | Four monkeys pass the letter along. The brown one almost drops it. |
| 4 | Surat berguling di langit teal. | The letter rolls across the teal sky. |
| 5 | Menukik ke kotak surat yang diangkat maskot pisang. | It dives toward the mailbox the banana mascot holds up. |
| 6 | Masuk lewat celah. Sampai. | In through the slot. Delivered. |

**Mode komik** (kurangi gerakan, Save-Data, atau JavaScript gagal): bagian film tidak di-pin. Enam gambar `film/diam/` tersusun 3x2 di desktop (masing-masing 16:9) atau satu kolom di HP (masing-masing 9:16 potongan tengah, lebar penuh dikurangi 16 piksel di tiap sisi), tiap gambar dengan bingkai kertas tipis, nomor panel huruf gunting kecil, dan keterangan di bawahnya. Gambar dimuat malas (`loading="lazy"`).

### 9.7 Kartu penutup bab (TR5)

- **Tujuan:** jeda seperti akhir film, lalu masuk ke bagian isi.
- **Tata letak:** 100svh, latar `#00141a`. Di tengah: cap pos bulat oranye diameter `min(56vw, 360px)` (desktop) atau 70vw (HP), bertepi ganda, tekstur tinta tidak rata (SVG `feTurbulence` statis dirender sekali), teks melingkar. Di bawahnya baris mono kecil. Di bawah lagi label bab 2 sebagai pengantar.

| Kunci | ID | EN |
|---|---|---|
| Teks melingkar cap | VENBEEMAIL.COM/PRO | VENBEEMAIL.COM/PRO |
| Tengah cap (huruf gunting) | #001 | #001 |
| Baris mono | SURAT UJI #001 · DITERIMA | TEST LETTER #001 · RECEIVED |
| Label bab 2 | BAB 2 · CARA PAKAINYA | CHAPTER 2 · HOW TO USE IT |

- **Gerak:** saat bagian 50 persen terlihat, cap dihentakkan sekali (skala 1,4 ke 1, putaran -14 ke -8 derajat, 0,35 detik, `expo.out`), lalu bagian ini (bukan seluruh halaman) bergetar 2 piksel selama 150 ms. Baris mono muncul 0,2 detik kemudian, label bab 2 sesudahnya. Desktop: bagian di-pin 60 persen supaya cap sempat dinikmati. HP: tanpa pin.
- **Aksesibilitas:** teks cap juga ada sebagai teks biasa (`aria-label` pada gambar cap: "Cap pos: Surat uji nomor 001 diterima di venbeemail.com/pro").
- **Kurangi gerakan:** cap langsung dalam posisi akhir, tanpa getar.

---

## 10. Tombol, kursor, suara, dan tambahan opsional

### 10.1 Tombol pil kertas (KT2)

- Tombol utama: pil oranye `#e7663c`, teks `#00141a` Archivo 700 16 piksel, tinggi 48 piksel (52 di HP), padding 0 22 piksel. Di belakangnya "bayangan potongan kertas": salinan pil berwarna `#9c3f1f` bergeser 0 4 piksel, tepinya sedikit tidak rata (`clip-path` polygon 12 titik).
- Tombol kedua: pil bergaris tepi putih 2 piksel, teks putih, bayangan potongan teal gelap.
- Disentuh mouse: naik 1 piksel dan miring 1 derajat. Ditekan: turun 3 piksel (menutup bayangan), lalu memantul saat dilepas (`back.out`, 0,25 detik).
- Fokus keyboard: cincin oranye 3 piksel berjarak 3 piksel.

### 10.2 Stiker sosial (KT3)

Lihat 15.4. Ikon sebagai stiker kertas putih kecil miring plus minus 8 derajat, menegak saat disentuh atau fokus.

### 10.3 Cap tersalin (KT4)

- Setiap tombol Salin (curl, domain, email) memunculkan cap oranye miring "TERSALIN" / "COPIED" di dekat tombol (skala 1,3 ke 1, 0,2 detik), hilang setelah 1,6 detik.
- Teks tombol berubah dari "Salin" ke "Tersalin" dengan ikon centang selama 1,6 detik (tanda berhasil bukan hanya warna).
- Satu wilayah `aria-live="polite"` di halaman mengumumkan "Tersalin ke papan klip" / "Copied to clipboard".
- Penyalinan memakai `navigator.clipboard.writeText`. Kalau gagal (misalnya bukan https atau ditolak browser), teks yang akan disalin dipilih (`select()`) dan pesan "Tekan lama untuk menyalin" / "Long-press to copy" ditampilkan. Tidak pernah diam tanpa tanda.

### 10.4 Suara (SR1)

Halaman hening. Tidak ada berkas suara, tidak ada tombol suara.

### 10.5 Tombol jeda video

Video latar yang terus berulang (hero dan sorotan) wajib bisa dijeda. Satu tombol kecil "Jeda video" / "Pause video" (ikon dua garis + teks, 40 piksel) di pojok kanan bawah hero dan di pojok kanan bawah Penutup. Menekan salah satu menjeda semua video latar dan berganti menjadi "Putar video" / "Play video". Pilihan disimpan di `localStorage`.

### 10.6 Tambahan opsional (dibuat, mati secara bawaan)

| Kode | Nama | Cara menyalakan | Penjelasan |
|---|---|---|---|
| KT1 | Kursor amplop | `data-kursor-amplop` di `<html>` | Desktop dengan mouse saja: kursor diganti amplop kecil yang miring mengikuti arah gerak. Kursor asli tetap di atas tautan dan isian teks. Mati di layar sentuh dan saat kurangi gerakan |
| FT6 | Semburan amplop | `data-semburan` di `<html>` | Setelah footer selesai, ketuk dua kali kotak surat: beberapa amplop (3 di HP, 7 di desktop) menyembur dari celah dan jatuh berputar keluar layar |

LO bisa meminta salah satu dinyalakan; tidak perlu membangun ulang.

---

## 11. Bab 2: bagian isi

Aturan umum Bab 2 (gaya panel Kong):

- Tiap bagian dibuka dengan judul huruf gunting raksasa (`clamp(56px, 11vw, 168px)`) yang bergantian rata kiri dan rata kanan, seperti panel fitur Kong. Teks judul asli ada di `<h2>` (kelas `vbk-sr` untuk teks, SVG `aria-hidden`).
- Saat judul masuk layar (tepi atas bagian di 80 persen tinggi layar), huruf ditempel satu per satu (`y: 40%` ke 0, putaran acak ke sudut akhir plus minus 3 derajat, jeda 0,03 detik). Sekali saja.
- Antarbagian: tepi bawah tiap bagian bergerigi seperti kertas sobek (SVG diam, polygon dari skrip dengan seed tetap). Tidak ada transisi besar lain (cadangan TR2 dan TR3 di bagian 19).
- Teks isi dan kode selalu di atas panel polos dengan kontras tinggi. Gerak ramai hanya di lapisan latar.
- Isi teknis di bagian ini disalin persis dari halaman lama (bagian 3). Di tabel teks di bawah, baris bertanda "dari halaman lama" tidak boleh ditulis sendiri.

### 11.1 Cara kerja (CK1, kartu sobek bertumpuk)

- **Tujuan:** menjelaskan alur dalam empat langkah singkat, dengan tokoh yang sama dengan film.
- **Isi:** judul, kalimat pengantar, lalu empat kartu. Tiap kartu: angka gunting raksasa (01 sampai 04, isian `kardus`), satu monyet (urutan: merah, biru, cokelat, pirang) yang menyembul melewati tepi atas kartu, teks langkah dari halaman lama, dan chip endpoint yang relevan.
- **Kartu:** kertas `#f4f1ea`, teks `#0d1b22`, tepi sobek (`clip-path` polygon bergerigi dari skrip), bayangan lembut, miring sedikit berbeda (-2, 1,5, -1, 2 derajat). Desktop lebar `min(760px, 62vw)`, tinggi sekitar 440 piksel. HP lebar penuh dikurangi 32 piksel.
- **Chip endpoint bawaan** (disesuaikan dengan isi langkah lama; teks langkah tidak boleh diubah supaya cocok dengan chip):

| Langkah | Chip |
|---|---|
| 1 | `POST /api/addresses` |
| 2 | `GET /api/mailbox` |
| 3 | `GET /api/messages/:id`, `PATCH /api/messages/:id`, `GET /api/messages/:id/attachments/:n` |
| 4 | `DELETE /api/addresses/me` |

- **Teks:**

| Kunci | ID | EN |
|---|---|---|
| Judul | Cara kerja | How it works |
| Pengantar | Empat langkah, sama seperti perjalanan surat tadi. | Four steps, the same trip the letter just took. |
| Langkah 1 sampai 4 | dari halaman lama, persis | dari halaman lama, persis |

Kalau halaman lama ternyata punya jumlah langkah selain empat, kata "Empat" diganti angka yang benar, dan jumlah kartu mengikuti.

- **Gerak desktop:** bagian di-pin `+=300%`, scrub 0,6. Kartu 1 sudah tampil. Kartu 2, 3, 4 naik dari `yPercent: 110` ke 0 di 0 sampai 25, 25 sampai 50, 50 sampai 75 persen. Kartu di bawahnya mengecil ke 0,94, naik 4 persen, dan lapisan gelap di atasnya naik ke opacity 0,15. Saat kartu mendarat, monyetnya melompat kecil (ollie) dan mendarat di tepi atas kartu. 75 sampai 100 persen: jeda, keempat kartu tetap bertumpuk.
- **HP:** tanpa pin. Kartu memakai `position: sticky; top: calc(72px + n * 10px)`, sehingga kartu berikut menutupi kartu sebelumnya secara alami saat digulir. Monyet melompat sekali saat kartunya masuk layar.
- **Interaksi:** chip endpoint adalah tautan ke baris yang sama di bagian Semua endpoint.
- **Aksesibilitas:** kartu adalah `<ol>` dan `<li>`. Angka gunting `aria-hidden` (urutan sudah dibacakan daftar). Monyet `aria-hidden`.
- **Kurangi gerakan:** daftar biasa, kartu tidak bertumpuk, tanpa lompatan.

### 11.2 API (API1 kartu tiket + AW1 + AW3 + AW4)

- **Tujuan:** dua contoh curl yang bisa langsung disalin, isi jawaban yang jelas, dan cara mudah memahami aturan awalan.
- **Latar:** `latar-api.webp` (bingkai lepas landas yang diburamkan) dengan lapisan `#01232d` opacity 0,72.

**Tata letak desktop** (dua kolom, lebar isi maksimal 1200 piksel):

- Kiri (5 dari 12 kolom): judul gunting "API", kalimat pengantar, label alamat 20 kotak (AW1), pratinjau alamat (AW3).
- Kanan (7 dari 12 kolom): kartu tiket, lalu "Resi jawaban" di bawahnya.

**Tata letak HP** (satu kolom, jarak tepi 16 piksel): judul, pengantar, kartu tiket, resi jawaban, label alamat (20 kotak dibungkus 2 baris x 10), pratinjau.

**Kartu tiket (API1):**

- Kertas putih hangat `#f4f1ea`, tepi kiri dan kanan berlubang-lubang (mask `radial-gradient` berulang), sobekan tiket di kiri dengan tulisan tegak "TIKET API · No. 001" / "API TICKET · No. 001" (hiasan, `aria-hidden`).
- Dua tab kertas di atas: "Contoh 1" dan "Contoh 2". Tab aktif lebih tinggi dan menyatu dengan kartu.
- Kotak kode: `<pre><code>` JetBrains Mono 14 piksel (13 di HP), teks `#0d1b22`, kontras minimal 7:1. Isinya **teks curl persis dari halaman lama**, termasuk pindah baris dan garis miring terbalik. Kotak bisa digeser menyamping di dalamnya (`overflow-x: auto`), halaman tidak ikut bergeser. Kotak bisa difokus (`tabindex="0"`) dengan label "Contoh curl 1" / "Curl example 1".
- Tombol pil "Salin" di kanan atas kotak kode (KT2 + KT4). Menyalin `textContent` persis.

**Resi jawaban:**

- Kartu kecil bergaya struk dengan lencana "contoh".
- Tabel tiga kolom: field (mono), nilai contoh (mono), keterangan (dari halaman lama).

| Field | Nilai contoh | Keterangan |
|---|---|---|
| `address` | `{awalan}@{domain}`, bawaan `uji-login@venbeemail.com` | dari halaman lama |
| `local` | `{awalan}`, bawaan `uji-login` | dari halaman lama |
| `domain` | `{domain}`, bawaan `venbeemail.com` | dari halaman lama |
| `expiresAt` | Bentuk nilai mengikuti dokumentasi lama. Kalau dokumentasi lama tidak menunjukkan bentuknya: `<waktu kedaluwarsa>` | dari halaman lama |
| `token` | `<token>` (selalu, tidak pernah nilai yang tampak asli) | dari halaman lama |

Kalau halaman lama tidak punya keterangan per field, kolom keterangan dihilangkan (bukan diisi karangan).

**Label alamat 20 kotak (AW1) dan pratinjau (AW3):**

- Isian teks "Coba awalan". Di bawahnya 20 kotak huruf bertepi tipis; tiap karakter yang diketik mengisi satu kotak (jatuh kecil `y: -8px` ke 0). Tiga kotak pertama diberi garis bawah oranye kecil bertanda "min". Kalau lebih dari 20, kotak ke-21 muncul berwarna oranye berisi "+n".
- Pemeriksaan hanya panjang (3 sampai 20). Kalau halaman lama menyebut huruf yang boleh dipakai, aturan itu ditambahkan dengan kalimat persis dari halaman lama.
- Pratinjau di bawahnya: `{awalan}@{domain}` dalam mono besar, dengan pilihan domain (empat domain, sama dengan pilihan di bagian Domain) dan catatan pratinjau.
- Awalan yang valid disimpan di memori dan `sessionStorage` untuk AW4 (dipakai lagi di amplop footer, bagian 14.3).
- Atribut isian: `autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40"`. Pesan status memakai `aria-live="polite"` dan dihubungkan dengan `aria-describedby`.

**Teks:**

| Kunci | ID | EN |
|---|---|---|
| Judul | API | API |
| Pengantar | Dua perintah untuk mulai. | Two commands to get started. |
| Tab 1 | Contoh 1 | Example 1 |
| Tab 2 | Contoh 2 | Example 2 |
| Tombol salin | Salin | Copy |
| Setelah salin | Tersalin | Copied |
| Judul resi | Resi jawaban | Response receipt |
| Lencana | contoh | example |
| Kepala kolom resi | Field · Nilai · Keterangan | Field · Value · Description |
| Label isian | Coba awalan | Try a prefix |
| Tanda kotak | min | min |
| Status kosong | Ketik 3 sampai 20 karakter. | Type 3 to 20 characters. |
| Status kurang | Terlalu pendek: minimal 3 karakter. | Too short: at least 3 characters. |
| Status lebih | Terlalu panjang: maksimal 20 karakter. | Too long: at most 20 characters. |
| Status pas | Panjangnya pas. | That length works. |
| Label domain | Domain | Domain |
| Catatan pratinjau | Pratinjau, belum membuat alamat. | Preview only. No address is created. |
| Contoh curl | dari halaman lama, persis | dari halaman lama, persis |
| Keterangan field | dari halaman lama, persis | dari halaman lama, persis |

- **Gerak:** judul ditempel. Kartu tiket naik dari `y: 60px`, miring 4 derajat ke 0 (`expo.out`, 0,8 detik) saat bagian 75 persen terlihat. Ganti tab: kode lama bergeser keluar ke kiri dan kode baru masuk (0,25 detik). Status salah: kotak huruf bergetar 4 piksel dua kali dan tepinya oranye. Amplop kecil melintas pelan di tepi kanan latar (hiasan, desktop saja).
- **Aksesibilitas:** tab memakai `role="tablist"`, `role="tab"`, `role="tabpanel"`, panah kiri-kanan untuk pindah tab. Kode adalah teks asli. Tombol Salin berlabel "Salin contoh 1" / "Copy example 1".
- **Kurangi gerakan:** semua tampil diam, tab berganti tanpa geser.

### 11.3 Semua endpoint (EP1 papan keberangkatan, cadangan EP4)

- **Tujuan:** tujuh endpoint terbaca sekilas, seperti papan keberangkatan.
- **Latar:** `latar-endpoint.webp` (bingkai langit adegan 4 yang diburamkan) dengan lapisan `#00141a` opacity 0,6.
- **Papan:** bingkai gelap `#00141a` dengan baut di sudut, kepala papan bertuliskan judul kecil, lalu tujuh baris. Tiap sel adalah satu "keping" (dua bidang atas-bawah dengan garis tengah tipis, seperti split-flap kertas). Teks tetap teks DOM utuh di dalam keping (bisa dipilih, dicari, dibaca pembaca layar); keping yang membalik, bukan per huruf.
- **Struktur:** `<ol class="vbk-papan">` dengan satu `<li>` per endpoint berisi `<span class="vbk-metode">`, `<code class="vbk-jalur">`, `<p class="vbk-guna">`. Kepala kolom adalah hiasan `aria-hidden`. Daftar dipakai (bukan tabel) supaya tampilan HP bisa berubah tanpa merusak struktur. Tiap `<li>` punya `id` (misalnya `ep-post-addresses`) untuk tautan dari chip di Cara kerja.
- **Warna metode:** GET latar `#77a3e4` teks `#00141a`; POST latar `#e7663c` teks `#00141a`; PATCH garis tepi putih teks putih; DELETE garis tepi oranye teks oranye.
- **Urutan baris:** sama dengan bagian 3.
- **Desktop:** lebar `min(1100px, 92vw)`, kolom 120 piksel | 1fr | 1,4fr. Jalur mono 17 piksel putih, guna Archivo 16 piksel `#cfe0e6`.
- **HP:** tujuh kartu tegak: chip metode di atas, jalur di bawahnya (boleh patah baris di garis miring), guna di bawah.

| Kunci | ID | EN |
|---|---|---|
| Judul gunting | Semua endpoint | All endpoints |
| Judul papan | Keberangkatan · /api | Departures · /api |
| Kepala kolom | Metode · Jalur · Guna | Method · Path · Purpose |
| Kolom guna | dari halaman lama, persis | dari halaman lama, persis |

- **Gerak:** saat papan 70 persen terlihat, keping tiap baris membalik sekali (`rotateX: -90` ke 0, poros atas, 0,45 detik, jeda 0,07 detik per baris), lalu chip metode dicap (skala 1,25 ke 1). Sekali saja.
- **Cadangan EP4 (lembar spesifikasi):** kelas `vbk-papan--lembar` mengganti tampilan menjadi lembar putih tenang tanpa balik keping, data dan struktur sama. Dipakai kalau waktu mepet atau balik keping bermasalah di Safari.
- **Kurangi gerakan:** papan langsung terisi.

### 11.4 Domain (DM1 perangko bergerigi)

- **Tujuan:** empat domain mudah disalin dan dipilih untuk pratinjau alamat.
- **Latar:** `latar-domain.webp` (bibir podium adegan 3 diburamkan) dengan lapisan `#033141` opacity 0,7.
- **Desktop:** maskot kecil (`maskot-512.webp`, tinggi 38svh) di tengah di atas podium mini CSS (elips biru bermotif bunga), bernapas dan berkedip. Empat perangko di sekitarnya (dua di kiri, dua di kanan), miring plus minus 4 derajat.
- **HP:** maskot 24svh di atas, perangko 2x2 di bawahnya.
- **Perangko:** 220x260 piksel (HP: setengah lebar layar dikurangi jarak), tepi bergerigi lewat mask `radial-gradient`, bingkai dalam tipis, potret monyet di atas (`perangko-monyet-*.webp`), domain di bawah (mono 16 piksel, boleh patah baris di titik), angka kecil di pojok (1 sampai 4). Pasangan: venbeemail.com dengan merah, kotak dengan biru, surat dengan cokelat, pos dengan pirang.
- **Interaksi:** tiap perangko adalah `<button>`. Ketuk: domain disalin (KT4), perangko dicap "TERSALIN" (cap pos bergaris gelombang oranye menimpa pojok), dan domain itu menjadi domain terpilih (`aria-pressed="true"`) yang juga dipakai di pratinjau bagian API.

| Kunci | ID | EN |
|---|---|---|
| Judul gunting | Domain | Domains |
| Pengantar | Kalimat pengantar dari halaman lama kalau ada. Kalau tidak ada: Ketuk perangko untuk menyalin domain. | Same rule. Fallback: Tap a stamp to copy the domain. |
| Label tombol | Salin domain {domain} | Copy domain {domain} |
| Cap | TERSALIN | COPIED |
| Penanda terpilih | Dipakai di pratinjau | Used in the preview |

- **Gerak:** perangko ditempel dengan bunyi visual "tok" saat masuk layar (skala 1,15 ke 1, putaran acak plus minus 4 derajat, jeda 0,1 detik). Disentuh mouse: perangko menegak dan naik 4 piksel.
- **Aksesibilitas:** label tombol menyebut domain lengkap. Domain juga tertulis sebagai teks biasa.
- **Kurangi gerakan:** diam, cap muncul tanpa animasi.

---

## 12. Penutup (PN1 manifesto bahan + PN2 podium kosong)

- **Tujuan:** merangkum produk dalam empat kata, memberi tombol aksi terakhir, dan membangun penantian untuk footer.
- **Latar:** video V6 (sorotan bergoyang di panggung kosong). Penutup dan footer berbagi satu lapisan video: keduanya dibungkus elemen `.vbk-panggung-akhir`, dan videonya ada di lapisan `position: sticky` di dalamnya, sehingga hanya satu video yang diputar.
- **Podium kosong (PN2):** podium di video sengaja kosong. Di atas podium ada cincin cahaya tipis (CSS) yang bernapas (opacity 0,5 ke 0,9, 4 detik), seperti tempat yang menunggu seseorang.
- **Manifesto (PN1):** empat kata raksasa, satu baris per kata, `clamp(64px, 14vw, 220px)`, masing-masing dengan isian tekstur berbeda, rata kiri dan kanan bergantian. Di bawah tiap kata ada chip mono kecil.

| Baris | ID | EN | Tekstur | Chip |
|---|---|---|---|---|
| 1 | KIRIM. | SEND. | flanel | dari aplikasimu / from your app |
| 2 | TANGKAP. | CATCH. | kardus | `GET /api/mailbox` |
| 3 | BACA. | READ. | kertas | `GET /api/messages/:id` |
| 4 | BUANG. | TOSS. | bunga | `DELETE /api/addresses/me` |

| Kunci | ID | EN |
|---|---|---|
| Judul tersembunyi (`<h2>`) | Kirim, tangkap, baca, buang | Send, catch, read, toss |
| Kalimat | Mulai dari satu panggilan: POST /api/addresses. | Start with one call: POST /api/addresses. |
| Tombol 1 (oranye, `#api`) | Coba API | Try the API |
| Tombol 2 (bergaris tepi, `#endpoint`) | Lihat endpoint | See endpoints |

- **Gerak desktop:** pin `+=200%`, scrub 0,6. Tiap kata naik dari balik garis potong (`yPercent: 120` ke 0, putaran plus minus 4 derajat ke 0) di 0 sampai 15, 15 sampai 30, 30 sampai 45, 45 sampai 60 persen. Chip muncul sesudah katanya. 60 sampai 75 persen: kalimat dan tombol naik. 75 sampai 100 persen: kata-kata mengecil dan naik keluar, cincin podium makin terang, lampu mulai meredup (menyambung ke footer).
- **HP:** tanpa pin. Tiap kata muncul sekali saat masuk layar.
- **Aksesibilitas:** kata raksasa SVG `aria-hidden`, teks di `<h2>` tersembunyi dan di chip.
- **Kurangi gerakan:** semua langsung tampil, video diganti poster.

---

## 13. Tentang (TT1 catatan selotip) dan data isian

### 13.1 Data dari LO: `isian.json` dan `rakit.py`

Semua fakta yang belum diberikan LO disimpan di satu berkas. Bentuknya:

```json
{
  "tahun": "",
  "kota": "",
  "cerita": { "id": "", "en": "" },
  "fitur_claude": { "status": "", "id": "", "en": "" },
  "sosial": { "x": "", "threads": "", "github": "", "linkedin": "" }
}
```

- `tahun`: empat angka, misalnya yang diberikan LO. Kosong berarti belum diberikan.
- `kota`: nama kota saja. Halaman menulis "{kota}, Indonesia".
- `cerita`: 2 sampai 4 kalimat dari LO. Kalau LO hanya memberi versi ID, Claude menerjemahkan ke EN dan menunjukkan terjemahannya ke LO sebelum dipakai.
- `fitur_claude.status`: `""` (belum dijawab, tidak tampil), `"tidak_ada"` (tidak tampil), atau `"sedang_dibangun"` (tampil dengan label "Sedang dibangun", tanpa tanggal rilis, tanpa gambar layar palsu, sesuai PRD pertama bagian 6).
- `sosial`: alamat lengkap akun. Diperiksa oleh `rakit.py`:
  - X: diawali `https://x.com/`
  - Threads: diawali `https://www.threads.com/@` atau `https://www.threads.net/@`
  - GitHub: diawali `https://github.com/`
  - LinkedIn: diawali `https://www.linkedin.com/in/` atau `https://www.linkedin.com/company/`
  - Alamat yang tidak cocok membuat `rakit.py` berhenti dengan pesan jelas.

Cara kerja `alat/rakit.py`:

- Sumber yang diedit adalah `situs-pro-kong/sumber.html`. Hasilnya `situs-pro-kong/index.html` (yang dipasang). README menjelaskan: jangan mengedit `index.html` langsung.
- Elemen yang bergantung pada isian diberi atribut `data-isian="tahun"` (atau `kota`, `cerita`, `fitur-claude`, `sosial-x`, dan seterusnya). Kalau isiannya kosong, seluruh elemen itu **dihapus** dari hasil. Kalau terisi, teksnya dimasukkan dengan karakter HTML di-escape.
- Kalau akun X terisi, `rakit.py` menambahkan `<meta name="twitter:creator" content="@nama">` (nama diambil dari alamat).
- `rakit.py` gagal kalau di hasil masih ada `[ISI` atau `[SALIN DARI HALAMAN LAMA`. Untuk pratinjau lokal boleh dijalankan dengan `--pratinjau`, yang tidak gagal tetapi menandai tempat isian dengan kotak kuning putus-putus (tidak pernah dipasang ke server).

### 13.2 Bagian Tentang

- **Tujuan:** menjawab "siapa yang membuat ini, apa hubungannya dengan BanaMail, dan bagaimana menghubunginya", dengan jujur dan tanpa angka karangan.
- **Latar:** `#01232d` polos dengan butir film halus.

**Tata letak desktop** (lebar isi maksimal 1100 piksel, dua kolom):

- Kiri (4 dari 12): foto polaroid maskot (bingkai putih, `maskot-512.webp`, miring -4 derajat, dua potong selotip oranye di sudut atas), keterangan di bawah foto. Di bawahnya kartu kecil "BanaMail" dengan tautan ke halaman depan.
- Kanan (8 dari 12): judul gunting, lalu kartu catatan kertas bergaris samar dengan selotip oranye di dua sudut, berisi semua teks.

**Tata letak HP:** judul, polaroid (lebar 60vw, di tengah), kartu catatan selebar layar dikurangi 32 piksel, kartu BanaMail.

**Urutan isi kartu catatan:**

1. Kalimat pembuat.
2. Kalimat hubungan nama.
3. Kalimat untuk siapa.
4. Paragraf cerita (`data-isian="cerita"`, hilang kalau kosong).
5. Daftar fakta singkat (`<dl>`): Pembuat, Mulai dibuat (`data-isian="tahun"`), Dari (`data-isian="kota"`), Kontak, Layanan lain. Baris yang isiannya kosong hilang.
6. Blok fitur Claude (`data-isian="fitur-claude"`, hilang kecuali status `sedang_dibangun`).
7. Catatan kejujuran (boleh dihapus kalau LO tidak suka).
8. Ajakan menghubungi + tombol.
9. Tanda tangan: "NongBana", lalu baris kecil "{kota} · {tahun}" (tiap bagian hilang kalau kosong; kalau keduanya kosong, baris kecil hilang).

**Teks:**

| Kunci | ID | EN |
|---|---|---|
| Label kecil | Tentang | About |
| Judul gunting | Di balik panggung | Behind the stage |
| Kalimat pembuat | VenbeeMail Pro dibuat oleh NongBana, pembuat BanaMail. | VenbeeMail Pro is made by NongBana, the maker of BanaMail. |
| Kalimat hubungan | BanaMail adalah layanan email sementara dari VenbeeMail. VenbeeMail Pro adalah versi untuk developer. | BanaMail is VenbeeMail's temporary email service. VenbeeMail Pro is the version for developers. |
| Untuk siapa | Dibuat untuk developer dan penguji yang butuh alamat email sungguhan di dalam tes: pendaftaran akun, kode OTP, tautan verifikasi, dan lampiran. | Made for developers and testers who need a real email address inside their tests: sign-ups, OTP codes, verification links and attachments. |
| Cerita | `[ISI CERITA ID]` | `[ISI CERITA EN]` |
| Fakta: Pembuat | Pembuat: NongBana | Maker: NongBana |
| Fakta: Mulai dibuat | Mulai dibuat: `[ISI TAHUN]` | Started: `[ISI TAHUN]` |
| Fakta: Dari | Dari: `[ISI KOTA]`, Indonesia | Based in: `[ISI KOTA]`, Indonesia |
| Fakta: Kontak | Kontak: admin@venbeemail.com | Contact: admin@venbeemail.com |
| Fakta: Layanan lain | Layanan lain: BanaMail, email sementara | Also by the maker: BanaMail, temporary email |
| Label fitur Claude | Sedang dibangun | In progress |
| Isi fitur Claude | `[ISI FITUR CLAUDE ID]` | `[ISI FITUR CLAUDE EN]` |
| Catatan kejujuran | Semua contoh di halaman ini ditandai "contoh". Halaman ini tidak memuat testimoni atau angka pengguna. | Every sample on this page is marked "example". This page has no testimonials or user numbers. |
| Ajakan | Ada pertanyaan, laporan masalah, atau ide? Tulis ke admin@venbeemail.com. | Questions, bug reports or ideas? Write to admin@venbeemail.com. |
| Tombol 1 (`mailto:admin@venbeemail.com`) | Kirim email | Send an email |
| Tombol 2 (salin) | Salin alamat email | Copy email address |
| Tombol 3 (`/`) | Buka BanaMail | Open BanaMail |
| Tanda tangan | NongBana | NongBana |
| Keterangan polaroid | Penjaga kotak surat: si pisang zombie. | Keeper of the mailbox: the zombie banana. |
| Kartu BanaMail | Butuh email sementara saja? Pakai BanaMail. | Just need a temporary email? Use BanaMail. |

**Kerangka cerita untuk LO** (hanya untuk membantu LO menulis; jangan dipasang, jangan diisi sendiri):

```text
ID: Saya mulai membuat BanaMail pada [tahun] di [kota] karena [alasan, satu kalimat]. [Apa yang terjadi sesudahnya, satu kalimat.] VenbeeMail Pro lahir dari [kebutuhan yang dilihat, satu kalimat].
EN: I started building BanaMail in [year] in [city] because [reason]. [What happened next.] VenbeeMail Pro grew out of [the need you saw].
```

- **Gerak:** judul ditempel. Kartu catatan naik dari `y: 40px` dan berputar dari -3 ke -1 derajat (0,7 detik). Selotip ditempel (`scaleX` 0 ke 1, jeda 0,12 detik). Maskot di polaroid hanya bernapas (memanjang 1,5 persen dari kaki, 3,2 detik) dan berkedip (kelopak SVG seperti Fase 1, tiap 3 sampai 6 detik).
- **Aksesibilitas:** `<section id="tentang" aria-labelledby>`, fakta dalam `<dl>`, polaroid `alt="Maskot pisang zombie VenbeeMail mengangkat kotak surat"` / EN `alt="The VenbeeMail zombie banana mascot holding up a mailbox"` (alt ikut berganti bahasa lewat skrip).
- **Kurangi gerakan:** diam, tanpa napas dan kedip.

---

## 14. Footer maskot (FT1 lift panggung + surat jatuh)

Ini puncak halaman, padanan Kong mengangkat Bumi. Maskot pisang naik dari dalam podium lewat pintu lift sambil mengangkat kotak surat, menutupi huruf tengah slogan raksasa, lalu amplop dari film jatuh ke celah kotaknya.

### 14.1 Panggung dan ukuran

Semua posisi tokoh dihitung di dalam satu kotak "set" yang memuat video V6 (16:9), supaya maskot berdiri tepat di podium yang ada di video.

| Ukuran | Desktop (lebar di atas 1024 dan tinggi 760 ke atas) | HP dan layar pendek |
|---|---|---|
| Tinggi panggung | 100svh, di-pin | 100svh, di-pin |
| Lebar set (W) | `min(100vw, 150svh)`, di tengah | `200vw`, pusat podium di tengah layar (`left: calc(50vw - 0.491 * W)`) |
| Tinggi set (H) | `0.5625 * W` | `0.5625 * W` |
| Letak set | Bawah podium (89,8 persen H) berada di 66svh | Bawah podium berada di 70svh |
| Tinggi maskot (dengan kotak) | `0.56 * H` | `min(0.8 * H, 46svh)` |
| Lebar maskot | `0.603 * tinggi` (rasio 576:955) | sama |
| Garis kaki | 84,0 persen H dari atas set, x pusat 49,1 persen W | sama |
| Sisi kiri-kanan di luar set | Gradien `#001d25` ke `#0b212e`; video di dalam set memudar 8 persen di tepi kiri dan kanan (`mask-image`) supaya sambungannya tidak terlihat | sama |

Contoh di layar 1440x900: W 1350, H 759, garis kaki di y 550, maskot tinggi 425 dan lebar 256, puncak kotak di y 125.

`olah_aset_kong.py` mengukur baris piksel terbawah yang tidak transparan di `maskot-badan.webp` dan menulisnya ke `aset/vbkong/gambar/ukuran-kong.json` (`"kaki_bawah": n`), supaya telapak kaki (bukan tepi gambar) yang diletakkan tepat di garis kaki. Titik celah surat di gambar kotak (sekitar x 252 dari 576, y 62 dari 955 di bingkai maskot) juga diukur dan disimpan di sana (`"celah": [x, y]`).

### 14.2 Lapisan

Dari belakang ke depan:

| z | Kelas | Isi | Catatan |
|---|---|---|---|
| 0 | `.vbk-ka-video` | Video V6 (dibagi dengan Penutup) atau poster `sorot-poster` | Di dalam set |
| 1 | `.vbk-ka-padam` | Lapisan `#00141a` selebar panggung | Opacity dianimasikan (lampu padam) |
| 2 | `.vbk-ka-sorot` | Kerucut sorotan dari tengah atas ke podium (gradien, `mix-blend-mode: screen`) | |
| 3 | `.vbk-ka-tulisan` | Slogan raksasa huruf gunting (SVG) selebar panggung | Tidak boleh menimpa podium: tepi bawah tulisan paling rendah 2svh di atas tepi belakang permukaan podium |
| 4 | `.vbk-ka-lubang`, `.vbk-ka-sinar`, `.vbk-ka-kontak` | Pintu lift (elips `podium-lubang.svg` di pusat permukaan podium, x 49,1 persen, y 82,1 persen H, lebar sampai 22 persen W, tinggi 4,2 persen H), sinar hangat yang naik dari lubang, bayangan kontak di bawah kaki | Di dalam set |
| 5 | `.vbk-ka-lift` | Wadah lift: `position: absolute; left: 0; width: 100%; top: -60%; bottom: 16%` dari set (tepi bawahnya tepat di garis kaki 84,0 persen), `overflow: hidden`. Berisi `.vbk-maskot` (bawahnya menempel ke tepi bawah wadah), yang berisi berurutan: `maskot-bayang` (geser 2 persen ke kanan, 1,5 persen ke bawah, opacity 0,45), `maskot-badan`, `maskot-kotak-panjang`, kelopak mata SVG | Bagian maskot yang masih di bawah permukaan podium otomatis tersembunyi karena berada di bawah tepi wadah. Inilah "clip-path" lift-nya. Dipakai `overflow: hidden` (bukan `clip-path` dengan nilai negatif) supaya pasti jalan di Safari |
| 6 | `.vbk-ka-bibir` | `podium-bibir.webp` di koordinat set: kiri 30,52 persen, lebar 37,43 persen, atas 83,98 persen, tinggi 7,16 persen | Menutup ujung bawah sinar lift dan bayangan kontak, sehingga pinggiran depan podium tetap di depan. Kaki maskot berdiri di permukaan, di belakang pinggiran |
| 7 | `.vbk-ka-amplop` | Amplop (`amplop.webp`), di lapisan selebar panggung dengan `clip-path: inset(0 0 calc(100% - var(--y-celah)) 0)` | Bagian amplop di bawah garis celah tidak terlihat, jadi amplop tampak masuk ke celah |
| 8 | `.vbk-ka-pesawat` | Pesawat kertas (`pesawat.webp`) | Tidak dipotong |
| 9 | `.vbk-ka-depan` | Kalimat "Satu surat lagi.", garis rute (GL1), tombol tak terlihat di atas kotak surat | |
| 10 | `.vbk-kaki-panel` | Panel kaki halaman (bagian 15), hanya desktop dengan tinggi 760 ke atas; di layar lain panel berada di bawah panggung | Gradien dari transparan di 62svh ke `#00141a` di 75svh |

### 14.3 Slogan raksasa

| Versi | Baris |
|---|---|
| Desktop ID | KOTAK MASUK / UNTUK KODEMU |
| Desktop EN | AN INBOX / FOR YOUR CODE |
| HP ID | KOTAK / MASUK UNTUK / KODEMU |
| HP EN | AN INBOX / FOR YOUR / CODE |

- Tiap baris diskalakan supaya lebarnya 92vw (lebar `viewBox` = jumlah lebar huruf), dengan batas tinggi huruf 26svh di desktop dan 13svh di HP.
- Desktop: baris 1 mulai di 18svh, baris 2 tepat di bawahnya (jarak 4 persen tinggi huruf). HP: baris 1 mulai di 14svh.
- Isian `kertas` putih hangat, bayangan potongan oranye 6 piksel ke kanan bawah, sudut akhir tiap huruf acak plus minus 2 derajat (seed tetap per huruf, jadi selalu sama).
- Maskot di tengah menutupi huruf tengah tiap baris (desktop ID kira-kira "K M" di baris 1 dan "K K" di baris 2), dan kotak suratnya menembus tepi atas baris 1, seperti Kong menutupi "THE W".
- Teks utuh tetap ada: `<h2 class="vbk-sr">Kotak masuk untuk kodemu</h2>` (EN "An inbox for your code"), dan slogan kecil yang terbaca penuh di panel kaki halaman (bagian 15).
- **AW4:** kalau pengunjung tadi mengetik awalan yang valid di bagian API, amplop membawa label kertas kecil "untuk: {awalan}@{domain}" dengan tanda "(contoh)". Kalau tidak, amplop tanpa label.

| Kunci | ID | EN |
|---|---|---|
| Kalimat lampu padam | Satu surat lagi. | One more letter. |
| Label amplop | untuk: {awalan}@{domain} (contoh) | to: {awalan}@{domain} (example) |
| Judul tersembunyi | Kotak masuk untuk kodemu | An inbox for your code |
| Tombol kotak (label) | Ketuk kotak surat | Tap the mailbox |

("Satu surat lagi." sengaja bukan "One more thing", supaya tidak meniru acara pihak lain.)

### 14.4 Urutan gerak (scrub mengikuti gulir)

Pin desktop `end: "+=160%"`, HP `end: "+=130%"`, `scrub: 0.6`, `invalidateOnRefresh: true`. Angka di bawah adalah kemajuan pin (0 sampai 1). Satu timeline GSAP untuk semua ukuran layar; hanya ukuran dan lintasan yang berbeda.

| Kemajuan | Langkah | Rincian |
|---|---|---|
| 0,00 sampai 0,12 | 1. Lampu padam | `.vbk-ka-padam` opacity 0 ke 0,82. Kalimat "Satu surat lagi." muncul di tengah layar (Archivo 700, 24 piksel desktop, 20 piksel HP) di 0,03 sampai 0,10, lalu memudar di 0,12 sampai 0,15 |
| 0,12 sampai 0,34 | 2. Tulisan ditempel | Huruf demi huruf (baris 1 dulu, lalu baris 2): dari `y: 60%` tinggi huruf, putaran awal acak plus minus 5 derajat, skala 1,1, opacity 0, ke posisi akhir (putaran plus minus 2 derajat, skala 1, opacity 1). Tiap huruf diakhiri hentakan turun 2 piksel lalu kembali, dan bayangan oranyenya muncul. Jeda dibagi rata di rentang ini |
| 0,30 sampai 0,40 | 3. Sorotan jatuh dan pintu lift membuka | Kerucut sorotan opacity 0 ke 0,85 sambil menyempit dari 60 ke 26 persen W, tepat ke podium. Di 0,32 sampai 0,38 lubang lift membuka (`scaleX` 0 ke 1). Di 0,34 sampai 0,40 sinar hangat naik dari lubang (opacity 0 ke 1, `scaleY` 0,4 ke 1 dari bawah) |
| 0,38 sampai 0,74 | 4. Maskot naik | `.vbk-maskot` `yPercent: 100` ke 0 (`power2.out` di dalam rentang). Kotak muncul pertama (karena paling atas), lalu tangan, kupluk, mata, jaket, dan terakhir kaki. Bayangan maskot di dinding ikut naik |
| 0,40 sampai 0,78 | 5. Kotak terasa diangkat | Kotak bergerak terhadap badan lewat variabel `--geser-kotak` (persen tinggi maskot): +4 (tertinggal, sedikit lebih rendah) di 0,40, ke 0 di 0,70, ke -3 (terdorong lebih tinggi) di 0,74, lalu kembali 0 dengan pantulan (`back.out(2)`) di 0,78. Batas aman: tidak lebih tinggi dari -3 (ekor lengan 40 piksel pada `maskot-kotak-panjang`) dan tidak lebih rendah dari +4. Kotak menembus tepi atas baris 1 slogan sekitar 0,62 |
| 0,70 sampai 0,80 | 6. Mendarat | Sinar lift memudar (0,70 sampai 0,80). Lubang menutup di bawah kaki (`scaleX` 1 ke 0, 0,74 sampai 0,80). Bayangan kontak muncul (0,76 sampai 0,80). Badan memipih 1,5 persen lalu tegak (pegas) saat kaki menyentuh permukaan di 0,74 |
| 0,40 sampai 1,00 | Garis rute | Garis rute tipis muncul di bawah (desktop: di atas panel; HP: tegak di kanan) dengan amplop mini di titik "Di udara", lalu bergerak ke "Sampai" di 0,95 |
| 0,80 sampai 0,92 | 7. Pesawat datang | Pesawat membawa amplop (amplop menggantung di bawah pesawat, label AW4 kalau ada) terbang lewat MotionPath dari luar kiri atas (-10vw, 8svh) melengkung lewat (30vw, 4svh) ke titik tepat di atas celah surat (dihitung dari `getBoundingClientRect` kotak + `ukuran-kong.json` setiap refresh). Lebar pesawat 9vw desktop, 18vw HP; amplop 6vw dan 12vw |
| 0,90 sampai 1,00 | 8. Pesawat pergi | Di 0,90 amplop lepas. Pesawat naik ke kanan atas sambil miring dan keluar layar |
| 0,90 sampai 0,95 | 9. Amplop masuk celah | Amplop berputar ke tegak lurus celah dan turun; bagian di bawah garis celah terpotong `clip-path`, jadi amplop tampak masuk |
| 0,95 sampai 1,00 | 10. Kotak menerima | Kotak memipih (`scaleY` 0,93, `scaleX` 1,04, poros bawah tengah) lalu memantul (`elastic.out(1, .4)`), badan ikut memantul kecil 1 persen, mata berkedip dua kali cepat. Titik "Sampai" di garis rute menyala oranye |

Lidah maskot tidak dipotong dan tidak digerakkan terpisah, karena itu bagian wajah. Pantulan badan dan kedip sudah cukup. Kalau LO kelak meminta lidah bergoyang, itu keputusan baru (potongan lidah sebagai Tingkat 2b, dengan izin LO).

Kerangka timeline:

```js
const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
  trigger: "#kaki", start: "top top", end: hp ? "+=130%" : "+=160%", pin: true, scrub: 0.6, invalidateOnRefresh: true,
  onUpdate: (st) => diam(st.progress > 0.99) } });
tl.to(".vbk-ka-padam", { opacity: 0.82, duration: 0.12 }, 0)
  .fromTo(".vbk-ka-satu", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.07 }, 0.03)
  .to(".vbk-ka-satu", { opacity: 0, duration: 0.03 }, 0.12)
  .fromTo(".vbk-ka-huruf", { yPercent: 60, rotation: (i) => acak(i, 5), scale: 1.1, opacity: 0 },
          { yPercent: 0, rotation: (i) => acak(i + 99, 2), scale: 1, opacity: 1, duration: 0.05, stagger: { amount: 0.17 } }, 0.12)
  .fromTo(".vbk-ka-sorot", { opacity: 0, scaleX: 2.3 }, { opacity: 0.85, scaleX: 1, duration: 0.10 }, 0.30)
  .fromTo(".vbk-ka-lubang", { scaleX: 0 }, { scaleX: 1, duration: 0.06 }, 0.32)
  .fromTo(".vbk-ka-sinar", { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: 0.06 }, 0.34)
  .fromTo(".vbk-maskot", { yPercent: 100 }, { yPercent: 0, ease: "power2.out", duration: 0.36 }, 0.38)
  .fromTo(".vbk-maskot", { "--geser-kotak": 4 }, { "--geser-kotak": 0, duration: 0.30 }, 0.40)
  .to(".vbk-maskot", { "--geser-kotak": -3, duration: 0.04 }, 0.70)
  .to(".vbk-maskot", { "--geser-kotak": 0, ease: "back.out(2)", duration: 0.04 }, 0.74)
  .to(".vbk-ka-sinar", { opacity: 0, duration: 0.10 }, 0.70)
  .to(".vbk-ka-lubang", { scaleX: 0, duration: 0.06 }, 0.74)
  .fromTo(".vbk-ka-kontak", { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.76)
  .to(".vbk-ka-pesawat-grup", { motionPath: () => jalurPesawat(), duration: 0.12 }, 0.80)
  // ... pesawat pergi, amplop masuk celah, kotak memipih, titik Sampai (lihat tabel)
```

`--geser-kotak` dipakai di CSS: `.vbk-kotak { transform: translateY(calc(var(--geser-kotak) * 1% * var(--rasio-kotak))); }`, dengan `--rasio-kotak` = tinggi maskot dibagi tinggi gambar kotak (supaya persen dihitung dari tinggi maskot).

### 14.5 Setelah sampai: diam yang hidup dan interaksi

Berjalan hanya selama kemajuan pin di atas 0,99 dan footer terlihat. Berhenti saat digulir mundur.

- Bernapas: `.vbk-maskot` `scaleY` 1 ke 1,015 dari kaki, 3 detik, bolak-balik `sine.inOut`.
- Kotak naik-turun 4 piksel berirama 2,6 detik, terpisah dari napas (Tingkat 2 PRD pertama).
- Kedip: kelopak SVG berwarna kulit maskot menutup kedua mata pink 120 ms, tiap 3 sampai 6 detik acak. Posisi mata diukur sekali di `maskot-badan.webp` (sama dengan cara Fase 1 di `situs-pro/aset/vbpro/hero.js`) dan disimpan di `ukuran-kong.json`.
- Desktop: maskot miring maksimal 3 derajat mengikuti kursor, bayangan kontak bergeser berlawanan.
- Gulir cepat (kecepatan ScrollTrigger di atas 2500): maskot terhuyung 2 derajat lalu tegak dengan pegas.
- Ketuk kotak (tombol tak terlihat seukuran kotak, bisa ditekan Enter atau Spasi): amplop meloncat keluar dari celah (naik 40 persen tinggi kotak, miring 10 derajat), lalu masuk lagi (0,6 detik total), kotak memipih kecil. Diberi jeda 0,8 detik supaya tidak bisa ditekan beruntun.
- FT6 (kalau dinyalakan, bagian 10.6): ketuk dua kali, semburan amplop.

### 14.6 HP

- Aset versi 512: `maskot-badan-512`, `maskot-kotak-panjang-512`, `maskot-bayang-512`, `podium-bibir-1032`.
- Slogan tiga baris (14.3).
- Pin 130 persen. Urutan dan persentase sama.
- Lintasan pesawat lebih pendek: dari (-20vw, 10svh) lewat (20vw, 6svh) ke celah.
- Garis rute tegak di kanan.
- Panel kaki halaman berada di bawah panggung (bukan menimpa). Di dalam panggung hanya ada baris kecil di bawah: logo mini dan baris hak cipta.
- Tanpa miring mengikuti kursor. Ketuk kotak tetap ada.

### 14.7 Kurangi gerakan, Save-Data, dan tanpa JavaScript

- Tanpa pin, tanpa scrub, tanpa gerak diam.
- Footer langsung tampil dalam komposisi akhir: lampu sudah padam (0,82), kalimat "Satu surat lagi." tampil kecil di atas slogan, slogan utuh, sorotan menyala, maskot berdiri di podium, amplop sudah separuh masuk celah, pesawat tidak tampil, garis rute penuh di "Sampai".
- Video diganti poster `sorot-poster`.
- Ketuk kotak tidak menganimasikan apa pun (tombol tetap ada tetapi hanya memberi umpan balik teks kecil "Surat sudah sampai." / "The letter has arrived.").
- Aturan umum halaman: keadaan awal animasi (tersembunyi, di bawah, transparan) hanya dipasang oleh JavaScript. Kalau JavaScript gagal atau mati, semua bagian tampil dalam posisi akhirnya.

---

## 15. Kaki halaman

### 15.1 Tata letak

- **Desktop dengan tinggi layar 760 piksel ke atas:** panel menimpa bagian bawah panggung footer (14.2 lapis 10), mulai sekitar 68svh, empat kolom dalam satu baris (lebar isi maksimal 1200 piksel), lalu satu baris bawah. Maskot tetap terlihat di atas panel di akhir halaman.
- **Layar lain:** panel berada di bawah panggung sebagai blok biasa `#00141a`, kolom bertumpuk (dua kolom di tablet, satu kolom di HP), jarak tepi 16 piksel.

### 15.2 Isi kolom

| Kolom | Isi |
|---|---|
| 1. Merek | Logo VENBEEMAIL PRO kecil (huruf gunting), baris "VenbeeMail Pro · Kotak masuk uji lewat API", baris "Dibuat oleh NongBana", slogan kecil yang terbaca utuh |
| 2. Halaman ini | Cara kerja, API, Semua endpoint, Domain, Tentang (tautan jangkar) |
| 3. VenbeeMail | BanaMail · email sementara (`/`), VenbeeMail Pro (`/pro/`), Tentang (`/pro/#tentang`) |
| 4. Kontak | `admin@venbeemail.com` (tautan `mailto:`) dengan tombol kecil Salin, lalu titik status API (hanya kalau cek di layar muat berhasil) |
| Baris bawah | Stiker sosial (hanya yang terisi), tombol ID/EN, tombol "Kurangi gerakan", tautan "Kembali ke atas", hak cipta |

### 15.3 Teks

| Kunci | ID | EN |
|---|---|---|
| Baris merek | VenbeeMail Pro · Kotak masuk uji lewat API | VenbeeMail Pro · A test inbox over an API |
| Pembuat | Dibuat oleh NongBana | Made by NongBana |
| Slogan kecil | Kotak masuk untuk kodemu. | An inbox for your code. |
| Judul kolom 2 | Halaman ini | On this page |
| Tautan kolom 2 | Cara kerja · API · Semua endpoint · Domain · Tentang | How it works · API · All endpoints · Domains · About |
| Judul kolom 3 | VenbeeMail | VenbeeMail |
| Tautan kolom 3 | BanaMail · email sementara · VenbeeMail Pro · Tentang | BanaMail · temporary email · VenbeeMail Pro · About |
| Judul kolom 4 | Kontak | Contact |
| Tombol salin email | Salin | Copy |
| Titik status | API menjawab · diperiksa saat halaman dibuka | API responding · checked when this page opened |
| Judul sosial (tersembunyi visual) | Akun sosial media | Social media accounts |
| Tombol bahasa | English | Bahasa Indonesia |
| Tombol gerak (mati) | Kurangi gerakan | Reduce motion |
| Tombol gerak (nyala) | Gerakan dikurangi | Motion reduced |
| Ke atas | Kembali ke atas | Back to top |
| Hak cipta | © {tahun berjalan} VenbeeMail · dibuat oleh NongBana | © {current year} VenbeeMail · made by NongBana |

- `{tahun berjalan}` diisi `new Date().getFullYear()` oleh skrip; di HTML ditulis tahun saat dirakit (2026) sebagai cadangan tanpa JavaScript.
- Titik status: lingkaran 8 piksel hijau-teal `#3fd0a0` dengan cincin, ditambah teks (tidak hanya warna). Tidak tampil kalau cek gagal, lambat, atau tidak dijalankan.
- Tombol "Kurangi gerakan": tombol beralih (`aria-pressed`). Saat ditekan, pilihan disimpan di `localStorage`, lalu halaman dimuat ulang di bagian yang sama (`location.hash` bagian terdekat), dalam tampilan diam. Setelan sistem `prefers-reduced-motion: reduce` selalu dihormati walau tombol tidak ditekan.

### 15.4 Ikon sosial media (KT3, D8)

- Empat ikon, urutan: X, Threads, GitHub, LinkedIn. Masing-masing SVG di dalam HTML (bukan berkas gambar), 22 piksel, satu warna `#0d1b22`, di atas stiker kertas putih bulat 44 piksel yang miring plus minus 8 derajat dan menegak saat disentuh atau difokus.
- Bentuk ikon diambil dari aset merek resmi masing-masing (halaman brand resources X, Meta untuk Threads, GitHub logos, LinkedIn brand guidelines). Untuk X, Threads, dan GitHub boleh memakai jalur SVG dari Simple Icons (lisensi CC0); LinkedIn tidak tersedia di Simple Icons, jadi diambil dari panduan merek LinkedIn. Bentuk tidak diubah, satu warna, ada ruang kosong di sekelilingnya.
- Ikon hanya dirender kalau `isian.json` punya alamat akunnya. Yang kosong **dihapus dari HTML** oleh `rakit.py` (bukan `href="#"`, bukan disembunyikan). Kalau keempatnya kosong, seluruh kelompok sosial dan judulnya hilang.
- Tautan: `<a href="{alamat}" rel="me noopener" target="_blank" aria-label="{Platform}: {nama akun} (buka tab baru)">`. Nama akun diambil dari alamat (misalnya bagian setelah `x.com/`). EN: "{Platform}: {account} (opens in a new tab)". Tidak menganggap akun itu milik siapa; label hanya menyebut platform dan nama akun.
- Jangan pernah menebak atau mengisi nama akun sendiri.

### 15.5 Aksesibilitas kaki halaman

`<footer>` dengan `<nav aria-label="Tautan kaki halaman">`. Semua tautan dan tombol minimal 44x44 piksel area sentuh. Teks `#cfe0e6` di atas `#00141a` (kontras di atas 12:1).

### 15.6 Halaman depan BanaMail: hanya footer yang ditambah

- Fungsi kotak surat, tombol, dan tampilan lain di halaman depan **tidak disentuh**.
- Yang ditambahkan satu baris kecil di footer halaman depan:

| Kunci | ID | EN |
|---|---|---|
| Baris | BanaMail adalah layanan dari VenbeeMail · VenbeeMail Pro untuk developer · Tentang | BanaMail is a VenbeeMail service · VenbeeMail Pro for developers · About |
| Tautan | "VenbeeMail Pro untuk developer" ke `/pro/`, "Tentang" ke `/pro/#tentang` | sama |

- Bahasa mengikuti cara halaman depan berganti bahasa. Kalau halaman depan tidak punya tombol bahasa, baris ID ditampilkan dan baris EN ditaruh tepat di bawahnya dengan huruf lebih kecil (`lang="en"`).
- Dipasang dengan blok bertanda `<!-- vbkong-kaki-depan:mulai -->` ... `<!-- vbkong-kaki-depan:selesai -->` oleh `pasang/sisip-kaki.js`: disisipkan tepat sebelum `</footer>` pertama kalau ada, kalau tidak sebelum `</body>`. Aman diulang (blok lama diganti). Isi lain berkas diperiksa tetap utuh sebelum ditulis. Cadangan dibuat dulu (bagian 18.6).
- File halaman depan di server belum diketahui. Cek server (18.1) mencarinya. `public/banamail/index.html` di repo ini adalah halaman lain dan **tidak** dianggap sebagai halaman depan live sebelum dicek.

---

## 16. Kinerja, HP, aksesibilitas, dan kurangi gerakan

### 16.1 Muatan awal di HP

Diukur dengan Chromium headless (seperti Fase 1): layar 390x844, DPR 3, agen pengguna iPhone, tanpa menggulir, dari awal sampai event `load` ditambah 3 detik. Alat: `situs-pro-kong/alat/ukur_muatan.mjs`. Batas: **2,5 MB**. Target: **1,3 MB**.

| Berkas | Perkiraan (setelah gzip bila teks) |
|---|---|
| `index.html` | 25 KB |
| `gaya.css` | 18 KB |
| `halaman.js` | 12 KB |
| `gerak.js` | 20 KB |
| GSAP + ScrollTrigger + MotionPath | 56 KB |
| Font (Archivo 2 berat + JetBrains Mono 1 berat) | 90 KB |
| `gunting.svg` | 20 KB |
| Poster hero 540 | 40 KB |
| 20 bingkai pertama adegan 1 (HP) | 360 KB |
| Video hero 540 (dimuat setelah `load`) | 350 KB |
| **Jumlah** | **sekitar 1,0 MB** |

Yang tidak termasuk muatan awal (dimuat malas): sisa bingkai film (per adegan), gambar latar panel (saat bagian berjarak satu layar), potongan monyet (saat film terlihat), potongan maskot footer, video sorotan, dan `bibir` (saat Penutup berjarak 1,5 layar, `IntersectionObserver` dengan `rootMargin: "150% 0px"`).

Desktop diukur juga (1440x900, DPR 2): target di bawah 3 MB sebelum menggulir.

### 16.2 Aturan HP

- Gambar versi 512 dan bingkai 405x720.
- Pin lebih pendek: film 450, footer 130, tanpa pin di kartu penutup, Cara kerja, dan Penutup.
- Paling banyak dua monyet terlihat bersamaan.
- Tanpa Lenis, tanpa `backdrop-filter`, tanpa kursor amplop, tanpa partikel.
- Halaman rapi di lebar 360 piksel tanpa gulir menyamping. Kode panjang hanya bergeser di dalam kotaknya.
- Tombol penting selebar layar dengan tinggi 52 piksel, jarak tepi 16 piksel.
- Area aman bawah (`env(safe-area-inset-bottom)`) dihormati oleh garis rute, tombol Lewati film, dan lembar menu.

### 16.3 Aksesibilitas umum

- Tautan lompat pertama di halaman: "Langsung ke isi" / "Skip to content" menuju `#bab-2`, terlihat saat difokus.
- Struktur: `<header>` (menu), `<main>` (hero sampai Penutup), `<footer>` (footer maskot dan kaki halaman). Satu `<h1>` di hero, `<h2>` per bagian.
- Semua judul huruf gunting punya teks asli di HTML. Semua SVG hiasan `aria-hidden="true" focusable="false"`.
- Kontras teks minimal 4,5:1, kode minimal 7:1. Informasi tidak hanya lewat warna (status awalan, tersalin, titik API selalu disertai teks).
- Cincin fokus oranye 3 piksel di semua elemen yang bisa difokus. Area sentuh minimal 44x44 piksel.
- Satu wilayah `aria-live="polite"` untuk pesan salin, pesan awalan, dan pesan bahasa.
- Atribut `lang` benar di `<html>` dan pada teks berbahasa lain.
- Canvas film dan video `aria-hidden`, dengan keterangan tersembunyi (9.6).
- Pin tidak mengunci fokus. Bisa digulir dengan tombol panah, Page Down, dan Spasi (Lenis mendukung).
- Halaman tetap terbaca saat diperbesar 200 persen.
- Gerak di atas 5 detik yang berulang (video latar, napas maskot) bisa dihentikan lewat tombol Jeda video dan tombol Kurangi gerakan.
- Tidak ada yang berkedip lebih dari 3 kali per detik (getar kartu bab hanya 150 ms, sekali).

### 16.4 Kurangi gerakan (wajib)

Aktif kalau `prefers-reduced-motion: reduce` atau tombol "Kurangi gerakan" ditekan. Dalam mode ini GSAP, `gerak.js`, Lenis, dan video tidak dimuat sama sekali.

| Bagian | Tampilan |
|---|---|
| Layar muat | Tidak tampil (cek API tetap jalan) |
| Menu | Sama, tanpa transisi |
| Hero | Poster diam, semua teks langsung tampil |
| Film | Komik 6 panel berketerangan (9.6) |
| Kartu penutup | Cap dalam posisi akhir |
| Cara kerja | Daftar biasa |
| API | Diam, semua fungsi (tab, salin, awalan) tetap jalan |
| Semua endpoint | Papan langsung terisi |
| Domain | Diam, salin dan pilih tetap jalan |
| Tentang | Diam |
| Penutup | Empat kata dan tombol langsung tampil, poster diam |
| Footer | Komposisi akhir (14.7) |

Semua teks, kode, dan tombol salin tetap ada dan bekerja.

### 16.5 Safari iPhone

Wajib diuji di iPhone asli (bukan hanya emulasi Chromium) sebelum pasang utama. Yang dicek:

- Pin film, Cara kerja (desktop saja), Penutup, dan footer tidak melompat saat bilah alamat muncul atau hilang (`ignoreMobileResize`, satuan `svh`).
- Video hero dan sorotan berputar otomatis (atribut `muted playsinline autoplay`), poster tampil sebelum siap.
- Canvas film tidak kehabisan memori di akhir film (bingkai lama dilepas).
- Balik keping papan endpoint tidak berkedip (`backface-visibility: hidden`, awalan `-webkit-`).
- `position: sticky` kartu Cara kerja di HP bekerja.
- Salin ke papan klip bekerja dari ketukan.
- MotionPath pesawat footer tepat ke celah setelah layar diputar.
- Lebar 360 dan 390 piksel tanpa gulir menyamping.
- Kurangi gerakan (Pengaturan > Aksesibilitas > Gerakan > Kurangi Gerakan) menghasilkan tampilan diam.

---

## 17. Urutan kerja per fase

Setiap fase diakhiri commit dan push ke cabang kerja, dengan ringkasan singkat ke LO (apa yang jadi, apa yang ditunggu). Tandai kemajuan di bagian "Kemajuan" di akhir bagian ini.

| Fase | Isi | Syarat mulai | Hasil |
|---|---|---|---|
| 0. Persiapan | Minta LO menjalankan cek server (18.1). Buat folder `situs-pro-kong/` sesuai 8.3. Salin gambar dari `situs-pro/aset/vbpro/gambar/` dan GSAP dari `situs-pro/aset/vbpro/js/`. Tulis `isian.json` kosong dan README. Ambil isi /pro lama ke `situs-pro-kong/lama/` (18.2) dan buat inventarisnya | Tidak ada | Folder siap, hasil cek server dicatat di README, isi lama tersimpan (atau dicatat masih ditunggu) |
| 1. Aset dan bingkai kunci | `olah_aset_kong.py` (6.3), `huruf_gunting.py` (6.4), font subset (6.5), `bingkai_kunci.py` (7.3). Kirim lembar pratinjau bingkai kunci dan prompt (7.4) ke LO, supaya LO bisa mulai membuat video sambil Claude lanjut | Fase 0 | Semua turunan gambar, huruf gunting, bingkai kunci di repo. LO menerima paket Seedance |
| 2. Kerangka dan Bab 2 | `sumber.html` utuh dengan semua teks ID dan EN, `gaya.css`, `halaman.js` (bahasa, menu, salin, awalan, domain, cek API, kurangi gerakan). Bagian Cara kerja, API, Semua endpoint, Domain dengan isi teknis persis | Isi lama (R2) untuk isi teknis. Tanpa R2 boleh dirakit dengan tempat isian, tetapi tidak boleh dipasang | Halaman lengkap dalam tampilan diam, sudah dua bahasa, sudah lolos kurangi gerakan |
| 3. Pembuka dan film | Layar muat, menu, hero (dengan poster atau bingkai kunci kalau V0 belum ada), film dalam mode tanpa video, estafet monyet, garis rute, Lewati film, kartu penutup. `gerak.js` dasar | Fase 2 | Bab 1 bisa digulir dari awal sampai kartu penutup |
| 4. Akhir halaman | Penutup, footer FT1 lengkap, kaki halaman, Tentang, `rakit.py` dan aturan isian | Fase 3 | Halaman utuh dari atas sampai bawah, isian kosong tidak tampil |
| 5. Video | Periksa (7.6) dan olah (7.7) tiap klip dari LO, isi `film/`, `video/`, `film/diam/`, latar panel | Hasil video LO (R11), boleh bertahap per klip | Film memakai urutan bingkai asli; mode tanpa video tetap jadi cadangan |
| 6. Periksa | Muatan HP (16.1), lebar 360, kurangi gerakan, aksesibilitas (16.3), `siapkan.js --cek` lolos, Chromium desktop dan HP, pratinjau untuk LO, uji Safari iPhone (16.5) | Fase 4 (dan Fase 5 kalau video sudah ada) | Daftar syarat selesai (bagian 20) tercentang kecuali yang bergantung pada server |
| 7. Pasang uji | `pasang-kong.sh` dengan `MODE=uji` ke `/pro/kong/` (18.4). LO membuka di HP dan memberi pendapat | Fase 6, hasil cek server | Versi uji hidup di `https://venbeemail.com/pro/kong/` (noindex) |
| 8. Pasang utama | `pasang-kong.sh` dengan `MODE=utama`, lalu footer halaman depan (18.6) | Persetujuan LO (R14), uji iPhone (R13), tidak ada tempat isian teknis | `/pro/` adalah versi Kong, cadangan tersedia, cara mengembalikan sudah diberikan ke LO |
| 9. Sesudah pasang | Isi data sosial, tahun, kota, cerita kalau LO mengirimnya (rakit ulang dan pasang ulang, aman diulang). Perbarui bagian 4, 5, dan "Kemajuan" di file ini. Pengajuan ulang Claude Startups mengikuti PRD pertama bagian 15 | Fase 8 | |

**Pratinjau untuk LO** (sebelum pasang uji, dan setiap ada perubahan besar): terbitkan sebagai Artifact multi-berkas. Batas Artifact: paling banyak 255 berkas per sekali terbit dan 511 berkas per versi. Jadi pratinjau memakai mode tanpa video, atau urutan bingkai desktop setiap bingkai ketiga (sekitar 120 berkas) ditambah video hero dan sorotan. Pratinjau tidak boleh dipakai sebagai bukti uji Safari iPhone.

**Kemajuan:**

- 10 Oktober 2026: PRD ditulis. Belum ada pekerjaan di `situs-pro-kong/`.

---

## 18. Server: cek, ambil isi lama, rakit, pasang, kembalikan

Semua blok di bawah ditempel LO ke terminal aaPanel. Tiap blok berjalan di dalam `( ... )` (subshell), jadi kalau berhenti di tengah, terminal tidak tertutup.

### 18.1 Cek server (sekali, di Fase 0)

```bash
(
cd /www/wwwroot/venbeemail && ls -la
P=""
for d in $(find /www/wwwroot/venbeemail -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
  if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then P=$d; break; fi
done
echo "FOLDER_PRO=$P"
ls -la "$P" "$P/aset"
echo "--- Fase 1 Panggung Pos terpasang? (angka > 0 berarti ya)"
grep -c 'vbpro-hero:mulai' "$P/index.html" || true
echo "--- Versi Kong terpasang? (angka > 0 berarti ya)"
grep -c 'vbkong-halaman' "$P/index.html" || true
echo "--- Cadangan yang ada"
ls -1d /www/backup/venbeemail-pro/pro-* /www/backup/venbeemail-pro-kong/* 2>/dev/null || echo "belum ada"
echo "--- Cara server melayani /pro"
grep -rn --include=*.js -e "/pro" -e "express.static" -e "sendFile" /www/wwwroot/venbeemail/server 2>/dev/null | grep -v node_modules | head -30
echo "--- Kandidat file halaman depan"
grep -rl --include=index.html -i "banamail" /www/wwwroot/venbeemail 2>/dev/null | grep -v node_modules | grep -v "/pro/" | head
echo "--- Header"
curl -sI https://venbeemail.com/pro/ | head -20
curl -sI https://venbeemail.com/pro/aset/02-maskot.webp | head -3
curl -s -o /dev/null -w 'health: %{http_code}\n' https://venbeemail.com/api/health
echo "--- Node dan layanan"
command -v node || ls -1 /www/server/nodejs/*/bin/node 2>/dev/null | tail -1
systemctl status banamail --no-pager | head -5
df -h /www | tail -1
)
```

Dari hasilnya catat di `situs-pro-kong/README.md`: letak folder /pro, pemilik berkas, apakah Fase 1 atau versi Kong sudah terpasang, daftar cadangan, apakah server mengirim header `Content-Security-Policy` (kalau ya, catat isinya; semua berkas halaman ini lokal, tanpa CDN), cara Node melayani /pro (folder statis atau berkas tertentu), letak halaman depan, dan apakah `/api/health` menjawab.

### 18.2 Ambil isi /pro lama (sebelum Fase 2)

Halaman baru harus memakai isi teknis lama persis. Yang diambil adalah halaman **asli sebelum Fase 1** (tanpa blok `vbpro-*`). Pilih cara yang tersedia, urut dari yang terbaik:

1. **Lingkungan Claude Code bisa membuka venbeemail.com.** Unduh `https://venbeemail.com/pro/` ke `situs-pro-kong/lama/index.live.html`. Kalau Fase 1 sudah terpasang, buang blok `vbpro-kepala`, `vbpro-hero`, `vbpro-skrip` dengan pola yang sama seperti `situs-pro/pasang/sisipkan.js` (`siapkan.js --bersihkan`), lalu simpan sebagai `situs-pro-kong/lama/index.html`. Kalau diblokir, minta LO menambahkan `venbeemail.com` di Allowed domains pengaturan jaringan environment.
2. **Unduh dari File Manager aaPanel.** LO membuka berkas di bawah (hasil blok ini) lewat File Manager, mengunduh, lalu melampirkannya ke chat.
3. **Salin dari terminal.** LO menjalankan blok ini dan menempel hasilnya (kalau panjang, per 200 baris dengan `sed -n '1,200p'`, `sed -n '201,400p'`, dan seterusnya).

```bash
(
S=$(ls -1d /www/backup/venbeemail-pro/pro-* 2>/dev/null | head -1 || true)
if [ -n "$S" ] && [ -f "$S/index.html" ]; then F="$S/index.html"; echo "Dari cadangan paling awal (sebelum Fase 1): $F"
else
  for d in $(find /www/wwwroot/venbeemail -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
    if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then F="$d/index.html"; break; fi
  done
  echo "Dari halaman yang sedang dipakai: $F"
fi
wc -lc "$F"
grep -c 'vbpro-hero:mulai' "$F" || true
echo "=== MULAI ==="; cat "$F"; echo "=== SELESAI ==="
)
```

**Inventaris isi lama** (Claude menulisnya ke `situs-pro-kong/lama/inventaris.json`, dan semua butir harus punya tempat di halaman baru atau dicatat alasan tidak dipakai, disetujui LO):

- Semua teks ID dan EN, per bagian.
- `id` bagian dan tautan jangkar.
- Dua contoh curl (teks persis), langkah Cara kerja, kolom guna endpoint, keterangan field, arti PATCH, aturan awalan.
- Semua tautan keluar dan masuk.
- Semua skrip (termasuk skrip analitik kalau ada, yang disalin apa adanya), formulir, atau demo interaktif. Fungsi yang ada di halaman lama tidak boleh hilang tanpa persetujuan LO.
- Meta, favicon, gambar.

### 18.3 Rakit dan periksa sebelum pasang: `rakit.py` dan `siapkan.js`

1. `python3 situs-pro-kong/alat/rakit.py` membuat `index.html` dari `sumber.html` + `isian.json` (13.1).
2. `pasang/siapkan.js` dijalankan di server oleh skrip pasang (dan bisa dijalankan lokal). Ditulis untuk Node lama juga (tanpa sintaks baru), seperti `sisipkan.js`.

```text
node siapkan.js [--cek] --mode uji|utama --awalan /pro/kong/|/pro/ \
  --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html \
  --lama <index.html yang sedang dipakai di server> --keluar <berkas hasil>
node siapkan.js --bersihkan <masuk> <keluar>     # buang blok vbpro-* dari halaman lama
```

Yang diperiksa (berhenti dengan pesan jelas kalau ada yang gagal, tanpa menulis apa pun):

- Sumber punya penanda `<meta name="vbkong-halaman" content="...">` dan tidak mengandung `[ISI`, `[SALIN DARI HALAMAN LAMA`, atau `{{`.
- Ketujuh endpoint, keempat domain, kelima nama field, `admin@venbeemail.com`, dan `NongBana` ada di sumber.
- Setiap blok kode berisi `curl` di referensi (setelah blok `vbpro-*` dibuang dan entitas HTML diurai) ada persis sama di salah satu blok kode sumber. Hanya akhir baris (`\r\n` dan `\n`) yang disamakan.
- Kalau halaman yang sedang dipakai di server bukan halaman Kong (tidak ada penanda `vbkong-halaman`), blok curl di sana dibandingkan dengan referensi. Kalau berbeda: berhenti dengan pesan "Halaman live berubah sejak diambil. Ambil ulang isi lama (18.2)."

Yang dikerjakan setelah semua lolos:

- Mengganti alamat `aset/vbkong/` menjadi `{awalan}aset/vbkong/` di `src`, `href`, `srcset`, `poster`, dan `url(...)` di dalam `<style>`, serta mengisi `<html data-akar="{awalan}">` (JavaScript menyusun alamat bingkai film dari `data-akar`).
- `--mode uji`: menambahkan `<meta name="robots" content="noindex, nofollow">`. `--mode utama`: memastikan tidak ada.
- Menulis hasil ke `--keluar` dan mencetak ringkasan (mode, awalan, jumlah endpoint, domain, dan blok curl yang cocok).

### 18.4 Pasang: `pasang-kong.sh`

Repo `rorobadojo-rgb/Venbeemail` publik, jadi server mengunduh langsung dari GitHub. Setelah `situs-pro-kong/` di-push ke cabang kerja, beri LO blok ini dengan `CABANG` diisi nama cabang. Versi uji dulu (`MODE=uji`), lalu versi utama (`MODE=utama`) setelah LO setuju.

```bash
# Pasang VenbeeMail Pro gaya Kong. Aman diulang.
# MODE=uji  : ke /pro/kong/ (noindex), /pro/ tidak berubah.
# MODE=utama: mengganti index.html /pro/. Berkas lama lain (aset/01-03, aset/vbpro) tidak dihapus.
(
set -eu
MODE=${MODE:-uji}
CABANG=${CABANG:-ISI_NAMA_CABANG}
AKAR=${AKAR:-/www/wwwroot/venbeemail}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro-kong}
SITUS=${SITUS:-https://venbeemail.com}
SUMBER=https://codeload.github.com/rorobadojo-rgb/Venbeemail/tar.gz/refs/heads/$CABANG
T=$(date +%Y%m%d-%H%M%S)
KERJA=/tmp/vbkong-$T
case "$MODE" in uji|utama) ;; *) echo "BERHENTI: MODE harus uji atau utama. Tidak ada yang diubah."; exit 1;; esac

# 1. Folder /pro
P=""
for d in $(find "$AKAR" -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
  if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then P=$d; break; fi
done
if [ -z "$P" ]; then echo "BERHENTI: folder /pro tidak ketemu. Tidak ada yang diubah."; exit 1; fi
echo "Folder /pro : $P"

# 2. Node
N=$(command -v node || true)
if [ -z "$N" ]; then N=$(ls -1 /www/server/nodejs/*/bin/node 2>/dev/null | tail -1 || true); fi
if [ -z "$N" ]; then echo "BERHENTI: program node tidak ketemu. Tidak ada yang diubah."; exit 1; fi

# 3. Unduh dan periksa tanpa menulis
rm -rf "$KERJA"; mkdir -p "$KERJA"; cd "$KERJA"
curl -fsSL "$SUMBER" | tar xz --strip-components=1
for f in situs-pro-kong/index.html situs-pro-kong/lama/index.html situs-pro-kong/pasang/siapkan.js \
         situs-pro-kong/aset/vbkong/gaya.css situs-pro-kong/aset/vbkong/halaman.js situs-pro-kong/aset/vbkong/gerak.js \
         situs-pro-kong/aset/vbkong/js/gsap.min.js situs-pro-kong/aset/vbkong/gambar/maskot-badan-512.webp; do
  if [ ! -s "$f" ]; then echo "BERHENTI: unduhan tidak lengkap ($f). Tidak ada yang diubah."; exit 1; fi
done
if [ "$MODE" = uji ]; then AWAL=/pro/kong/; else AWAL=/pro/; fi
"$N" situs-pro-kong/pasang/siapkan.js --cek --mode "$MODE" --awalan "$AWAL" \
  --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html --lama "$P/index.html" --keluar "$KERJA/hasil.html"
"$N" situs-pro-kong/pasang/siapkan.js --mode "$MODE" --awalan "$AWAL" \
  --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html --lama "$P/index.html" --keluar "$KERJA/hasil.html"

# 4. Cadangan seluruh folder /pro
mkdir -p "$SIMPAN"
cp -a "$P" "$SIMPAN/pro-$T"
if [ ! -f "$SIMPAN/pro-$T/index.html" ]; then echo "BERHENTI: cadangan gagal. Tidak ada yang diubah."; exit 1; fi
echo "Cadangan    : $SIMPAN/pro-$T"

# 5. Pasang
if [ "$MODE" = uji ]; then
  rm -rf "$P/kong"; mkdir -p "$P/kong/aset"
  cp -r situs-pro-kong/aset/vbkong "$P/kong/aset/vbkong"
  cp "$KERJA/hasil.html" "$P/kong/index.html"
  chown -R --reference="$P/index.html" "$P/kong"
  find "$P/kong" -type d -exec chmod 755 {} +; find "$P/kong" -type f -exec chmod 644 {} +
  CEK=/pro/kong/
else
  rm -rf "$P/aset/vbkong"
  cp -r situs-pro-kong/aset/vbkong "$P/aset/vbkong"
  chown -R --reference="$P/index.html" "$P/aset/vbkong"
  find "$P/aset/vbkong" -type d -exec chmod 755 {} +; find "$P/aset/vbkong" -type f -exec chmod 644 {} +
  cp "$KERJA/hasil.html" "$P/index.html"     # menimpa isi, pemilik dan izin berkas lama tetap
  rm -rf "$P/kong"                             # versi uji tidak diperlukan lagi (ada di cadangan)
  CEK=/pro/
fi

# 6. Periksa dari luar. Gagal: kembalikan otomatis.
kode() { curl -s -o /dev/null -w '%{http_code}' "$SITUS$1" || true; }
ada() { curl -s "$SITUS$CEK?v=$T" | grep -c 'vbkong-halaman' || true; }
HAL_ADA=$(ada)
if [ "$HAL_ADA" = 0 ] && command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then
  echo "Halaman baru belum terbaca, memulai ulang banamail..."; systemctl restart banamail; sleep 3; HAL_ADA=$(ada)
fi
HAL=$(kode "$CEK"); CSS=$(kode "${CEK}aset/vbkong/gaya.css"); JS=$(kode "${CEK}aset/vbkong/halaman.js"); GB=$(kode "${CEK}aset/vbkong/gambar/maskot-badan-512.webp")
echo "Periksa     : halaman $HAL, penanda $HAL_ADA, gaya.css $CSS, halaman.js $JS, gambar $GB"
cd /; rm -rf "$KERJA"
if [ "$HAL" = 000 ]; then
  echo "SELESAI, tapi server tidak bisa membuka $SITUS sendiri. Buka $SITUS$CEK di HP untuk memastikan."
elif [ "$HAL" = 200 ] && [ "$HAL_ADA" != 0 ] && [ "$CSS" = 200 ] && [ "$JS" = 200 ] && [ "$GB" = 200 ]; then
  echo "BERHASIL. Buka $SITUS$CEK di HP."
else
  cp -a "$SIMPAN/pro-$T" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
  if [ "$MODE" = uji ] && [ "$HAL" = 404 ]; then
    echo "GAGAL: server tidak melayani folder /pro/kong/. Folder /pro sudah dikembalikan. Uji lewat pratinjau saja, lalu pasang utama dengan pemeriksaan ketat."
  else
    echo "GAGAL periksa. Folder /pro sudah dikembalikan dari $SIMPAN/pro-$T. Tempel hasil ini ke chat."
  fi
  exit 1
fi
echo "Untuk mengembalikan pemasangan ini saja: rm -rf '$P' && cp -a '$SIMPAN/pro-$T' '$P'"
)
```

Cara memakai: Claude memberikan blok yang baris `MODE=` dan `CABANG=`-nya sudah terisi, jadi LO cukup menempel. Cara lain: ketik dulu `MODE=utama; CABANG=nama-cabang` di terminal, tekan Enter, lalu tempel blok apa adanya (subshell mewarisi nilai itu).

Catatan:

- Folder /pro dikenali dari `aset/02-maskot.webp`. Karena itu berkas aset lama tidak pernah dihapus.
- Cadangan disimpan di `/www/backup/venbeemail-pro-kong/`, terpisah dari cadangan PRD pertama (`/www/backup/venbeemail-pro/`), supaya `situs-pro/pasang/kembalikan.sh` tetap mengembalikan ke keadaan sebelum Fase 1 dan tidak salah ambil cadangan Kong.
- Kalau Fase 1 Panggung Pos sedang terpasang, `MODE=utama` menggantinya dengan versi Kong (berkas `aset/vbpro/` tetap ada, hanya tidak dipakai). Mengembalikan ke Panggung Pos cukup dengan `kembalikan-kong.sh` (18.5) memakai cadangan sebelum pasang utama.
- Kalau Content-Security-Policy dari 18.1 melarang skrip sebaris (`'unsafe-inline'` tidak ada), semua JavaScript harus di berkas terpisah (memang begitu rancangannya), dan `<script type="application/ld+json">` boleh dihapus.

### 18.5 Kembalikan: `kembalikan-kong.sh`

```bash
# Kembalikan folder /pro dari cadangan versi Kong.
# Bawaan: cadangan TERAKHIR (keadaan tepat sebelum pemasangan Kong terakhir).
# Pilih cadangan lain dengan PILIH=pro-YYYYMMDD-HHMMSS (lihat daftar di akhir).
(
set -eu
AKAR=${AKAR:-/www/wwwroot/venbeemail}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro-kong}
SITUS=${SITUS:-https://venbeemail.com}
PILIH=${PILIH:-}
if [ -n "$PILIH" ]; then C="$SIMPAN/$PILIH"; else C=$(ls -1d "$SIMPAN"/pro-* 2>/dev/null | tail -1 || true); fi
if [ -z "$C" ] || [ ! -f "$C/index.html" ]; then echo "BERHENTI: cadangan tidak ada di $SIMPAN."; exit 1; fi
P=""
for d in $(find "$AKAR" -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
  if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then P=$d; break; fi
done
if [ -z "$P" ]; then echo "BERHENTI: folder /pro tidak ketemu."; exit 1; fi
cp -a "$C" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
echo "Dikembalikan: $P sekarang sama dengan $C"
if command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then systemctl restart banamail; sleep 3; fi
echo "Halaman: $(curl -s -o /dev/null -w '%{http_code}' "$SITUS/pro/" || true)"
echo "Semua cadangan Kong:"; ls -1d "$SIMPAN"/pro-*
)
```

Untuk kembali ke keadaan sebelum versi Kong pernah dipasang: pakai cadangan Kong yang paling awal (`PILIH=` nama paling atas di daftar). Untuk kembali ke sebelum Fase 1 PRD pertama: `situs-pro/pasang/kembalikan.sh`.

### 18.6 Footer halaman depan: `kaki-depan.sh`

Dijalankan setelah pasang utama berhasil. `DEPAN` diisi letak berkas halaman depan dari hasil cek server (18.1).

```bash
(
set -eu
DEPAN=${DEPAN:-ISI_LETAK_INDEX_HTML_HALAMAN_DEPAN}
CABANG=${CABANG:-ISI_NAMA_CABANG}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro-kong}
SITUS=${SITUS:-https://venbeemail.com}
T=$(date +%Y%m%d-%H%M%S); KERJA=/tmp/vbkong-depan-$T
if [ ! -f "$DEPAN" ]; then echo "BERHENTI: $DEPAN tidak ada. Tidak ada yang diubah."; exit 1; fi
N=$(command -v node || ls -1 /www/server/nodejs/*/bin/node 2>/dev/null | tail -1 || true)
if [ -z "$N" ]; then echo "BERHENTI: node tidak ketemu."; exit 1; fi
rm -rf "$KERJA"; mkdir -p "$KERJA"; cd "$KERJA"
curl -fsSL "https://codeload.github.com/rorobadojo-rgb/Venbeemail/tar.gz/refs/heads/$CABANG" | tar xz --strip-components=1
"$N" situs-pro-kong/pasang/sisip-kaki.js --cek "$DEPAN"
mkdir -p "$SIMPAN"; cp -a "$DEPAN" "$SIMPAN/depan-$T.html"
echo "Cadangan    : $SIMPAN/depan-$T.html"
"$N" situs-pro-kong/pasang/sisip-kaki.js "$DEPAN"
ADA=$(curl -s "$SITUS/?v=$T" | grep -c 'vbkong-kaki-depan:mulai' || true)
if [ "$ADA" = 0 ] && command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then systemctl restart banamail; sleep 3; ADA=$(curl -s "$SITUS/?v=$T" | grep -c 'vbkong-kaki-depan:mulai' || true); fi
cd /; rm -rf "$KERJA"
if [ "$ADA" != 0 ]; then echo "BERHASIL. Buka $SITUS di HP dan pastikan membuat alamat email sementara masih jalan.";
else cp -a "$SIMPAN/depan-$T.html" "$DEPAN"; echo "GAGAL: baris footer tidak terbaca. Halaman depan sudah dikembalikan."; exit 1; fi
echo "Untuk mengembalikan: cp -a '$SIMPAN/depan-$T.html' '$DEPAN'"
)
```

`sisip-kaki.js` mengikuti pola `situs-pro/pasang/sisipkan.js`: satu blok bertanda, aman diulang, `--cek` hanya memeriksa, memastikan isi lain berkas utuh, dan menulis di berkas yang sama (pemilik dan izin tetap).

### 18.7 Setelah pasang

- Buka `/pro/` (atau `/pro/kong/`) di HP dalam dua bahasa, gulir dari atas sampai footer, uji tombol Salin, pemeriksa awalan, perangko domain, Lewati film, ketuk kotak surat di footer, dan tombol Kurangi gerakan.
- Buka halaman depan: membuat alamat email sementara dan menerima surat masih jalan, baris footer baru tampil.
- Centang bagian 20.
- Beri LO ringkasan: alamat yang sudah hidup, letak cadangan, dan blok kembalikan.

---

## 19. Bank pilihan lengkap (cadangan)

Semua modul dari `MENU-PILIHAN.md`. **DIPILIH** = paket yang dikunci LO (D3). Yang lain adalah cadangan: bisa ditukar per bagian tanpa membongkar halaman, karena isi dan `id` bagian tetap sama. Penukaran modul adalah keputusan baru LO (catat di bagian 4).

### 19.1 Konsep lain (kalau LO kelak ingin berganti kerangka)

| Kode | Konsep | Inti | Video | Kapan cocok |
|---|---|---|---|---|
| **K1** | **Surat Sampai (DIPILIH)** | Satu amplop menempuh film 30 detik sampai ke celah kotak surat; footer lift panggung | 42 dtk | Rasa film paling kuat yang masih realistis |
| K2 | Kamu Suratnya | Film dari mata surat (POV), tempelan hantu bicara lewat subtitle, isi halaman di dalam kotak kardus | 26 dtk | Paling personal dan lucu, paling cocok HP tegak |
| K3 | Sobek, Lipat, Kirim | Stop-motion kertas 12 fps, halaman satu lembar kertas panjang, maskot menembus robekan di footer | 31 dtk | Rasa buatan tangan, paling ringan |
| K4 | Konsol Sutradara | Tiap gulir mengetik satu perintah di konsol lalu memutar satu "take" | 31 dtk | Developer yang ingin langsung melihat perintah; paling aman di Safari |
| K5 | Film dengan Teks Terjemahan | Tiap adegan satu panggilan API, bilah subtitle mengetik request dan jawaban | 30 dtk | Paling mendidik |
| K6 | Kamera Mundur | Hero hanya kotak surat dengan tangan misterius; footer mengungkap maskot | 21 dtk | Paling cepat jadi, paling murah (sekitar $15). Jalur cadangan resmi kalau waktu atau anggaran mepet: mulai dari K6 + FT1 + GL1, lalu naik ke K1 |
| K7 | Buku Pop-Up | Halaman seperti buku pop-up, maskot berdiri dari lipatan | 27 dtk | Paling menyatu dengan papercraft, CSS 3D paling banyak |

### 19.2 Modul per bagian

**Layar muat**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| LM1 | Bilah kemajuan jujur | Bilah menghitung berkas adegan pertama, paling lama 1,2 detik | Sangat ringan | **DIPILIH** |
| LM2 | Cek denyut API | `GET /api/health` dengan batas 1,5 detik, tanpa tulisan palsu kalau gagal | Ringan | **DIPILIH** |
| LM3 | Sobek blok catatan | Kertas catatan berlogo dicabut dalam 4 bingkai stop-motion | Ringan | cadangan |
| LM4 | Tirai panggung | Dua tirai kertas oranye membuka | Ringan | cadangan |
| LM5 | Tanpa layar muat | Hero langsung dari gambar diam | Paling ringan | cadangan (dipakai otomatis saat kurangi gerakan) |

**Pembuka/hero**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| HR1 | Amplop di podium | Loop amplop melayang di belakang wordmark, kalimat, dua tombol | Sedang | **DIPILIH** |
| HR2 | Tangan misterius | Kotak surat diangkat tangan terpotong, footer mengungkap pemiliknya | Ringan | cadangan |
| HR3 | Lubang sobekan | Kertas putih dengan sobekan bundar, panggung hidup di dalamnya | Ringan | cadangan |
| HR4 | Panggung siaga + konsol | Maskot bernapas, konsol berkedip di samping judul | Sedang | cadangan |
| HR5 | Daftar pemeran | Gaya poster film: "Kotak = alamat · Amplop = surat · Pesawat = lampiran · Monyet = kurir" | Sangat ringan | cadangan (bisa jadi hiasan kecil di hero) |

**Menu**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| MN1 | Pil kaca tengah | Logo kiri, pil kaca berisi tautan, tombol di kanan; HP lembar bawah | Ringan | **DIPILIH** (bawaan rekomendasi) |
| MN2 | Tab pembatas buku | Tab kertas di tepi kanan | Ringan | cadangan |
| MN3 | Pil + chip status | Chip kecil berganti mengikuti cerita | Ringan | cadangan |
| MN4 | Selotip kertas | Tombol Menu berupa selotip | Ringan | cadangan |

**Cara menggulir dan penanda kemajuan**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| GL1 | Garis rute | Amplop mini melewati Dikirim, Dioper, Di udara, Sampai | Sangat ringan | **DIPILIH** |
| GL2 | Perangko ketinggian | Angka ketinggian turun selama zoom | Sangat ringan | cadangan |
| GL3 | Penanda babak | "Babak 2/4 · Surat datang" | Sangat ringan | cadangan |
| GL4 | Tombol Lewati | Pil "Lewati film" | Sangat ringan | **DIPILIH** |
| GL5 | Scrub urutan bingkai | WebP di canvas dengan campuran dua bingkai | Berat kalau panjang; aman per adegan | **DIPILIH** |
| GL6 | Putar sekali per pemicu | Klip diputar biasa saat bagian mencapai titik tertentu | Ringan | cadangan (pengganti GL5 kalau scrub bermasalah di iPhone) |

**Gaya judul**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| JD1 | Huruf gunting ADVANCED | SVG per huruf dengan tekstur bahan | Ringan | **DIPILIH** |
| JD2 | Huruf lipat kobalt | Kertas terlipat sisi terang-gelap | Ringan | cadangan |
| JD3 | Bunga menetes | Kobalt bermotif bunga dengan tetesan oranye | Ringan | cadangan (boleh dipakai sebagai isian `bunga` di JD1) |
| JD4 | Sans 900 bergradasi | Gaya produk premium | Sangat ringan | cadangan |
| JD5 | Cap pos | Judul kecil sebagai cap tinta | Sangat ringan | dipakai sebagian di kartu penutup |

**Transisi**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| TR1 | Amplop menutup layar | Sambungan klip disembunyikan di balik amplop | Nol | **DIPILIH** |
| TR2 | Sobek kertas | Bagian disobek dari bawah ke atas, maksimal 3 kali per halaman | Ringan | cadangan (versi diam dipakai sebagai tepi bagian) |
| TR3 | Lembar bertumpuk | `position: sticky` dengan bayangan | Sangat ringan | dipakai di Cara kerja versi HP |
| TR4 | Potong ke hitam | Hitam 0,2 detik antar momen | Nol | cadangan |
| TR5 | Cap dihentakkan | Kartu penutup bab | Sangat ringan | **DIPILIH** |
| TR6 | Balik halaman | Balik halaman 3D | Sedang | cadangan |

**Cara kerja**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| CK1 | Kartu sobek bertumpuk | 4 kartu bertumpuk saat digulir, monyet dan angka gunting | Ringan | **DIPILIH** |
| CK2 | Pemberhentian di film | Film berhenti, cap "LANGKAH n" | Ringan | cadangan |
| CK3 | Storyboard ditempel | Lembar ditempel selotip di papan teal | Ringan | cadangan |
| CK4 | Pita film | Kotak bingkai sproket berjalan mendatar | Ringan | cadangan |
| CK5 | Roda kertas putar | Volvelle berputar per langkah | Ringan sampai sedang | cadangan |
| CK6 | Kartu monyet menyembul | Kartu digeser menyamping, monyet ollie | Ringan | cadangan |

**Tampilan kode API**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| API1 | Kartu tiket | Kertas berlubang, tab Contoh 1/2, tombol Salin | Sangat ringan | **DIPILIH** |
| API2 | Pita struk | Curl tercetak dari celah kotak surat | Ringan | cadangan |
| API3 | Konsol kaca | Terminal gelap, panel jawaban 5 field | Sangat ringan | cadangan |
| API4 | Ruang proyeksi | Garis oranye dari field ke bendanya | Ringan | cadangan |
| API5 | Kantong kartu indeks | Kartu naik dari kantong berjahit | Ringan | cadangan |
| API6 | Tombol Jalankan | Memanggil API sungguhan; mati sampai server punya batas pemakaian | Ringan | cadangan, butuh keputusan LO dan kesiapan server |

**Pemeriksa awalan 3 sampai 20**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| AW1 | Label 20 kotak huruf | Tiap huruf satu kotak, 3 kotak pertama "min" | Sangat ringan | **DIPILIH** |
| AW2 | Penggaris kertas | 20 takik, gunting memotong kelebihan | Sangat ringan | cadangan |
| AW3 | Pratinjau alamat | `awalan@domain` langsung, bertanda pratinjau | Sangat ringan | **DIPILIH** |
| AW4 | Gema di akhir | Awalan muncul lagi di amplop footer | Sangat ringan | **DIPILIH** |

**Tampilan endpoint**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| EP1 | Papan keberangkatan | Split-flap kertas, teks DOM asli | Ringan | **DIPILIH** |
| EP2 | Tiket antrean | Tiket bergerigi per endpoint | Ringan | cadangan |
| EP3 | Rak loker | Tujuh loker kardus | Ringan | cadangan |
| EP4 | Lembar spesifikasi | Tabel tenang paling mudah dibaca | Paling ringan | **cadangan resmi** (kelas `vbk-papan--lembar`) |
| EP5 | Adegan ulang | Tujuh panel layar penuh dari bingkai film | Sedang | cadangan |
| EP6 | Kipas lipat | Leporello 7 panel | Sedang | cadangan |

**Domain**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| DM1 | Perangko bergerigi | Ketuk untuk menyalin, tercap TERSALIN | Ringan | **DIPILIH** |
| DM2 | Papan skate | Kartu papan skate, monyet ollie | Ringan | cadangan |
| DM3 | Bendera monyet | Monyet membawa bendera domain | Ringan | cadangan |
| DM4 | Cincin pelat | Cincin 3D CSS di desktop | Sedang | cadangan |
| DM5 | Stiker alamat | Stiker miring di dinding kardus | Sangat ringan | cadangan |

**Tentang**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| TT1 | Catatan selotip | Kertas catatan "DI BALIK PANGGUNG", isian tersembunyi sampai diisi | Sangat ringan | **DIPILIH** |
| TT2 | Kredit penutup | Teks bergulir seperti akhir film | Sangat ringan | cadangan |
| TT3 | Catatan orang pertama | "Saya NongBana. Sebelum ini saya membuat BanaMail." | Sangat ringan | cadangan (cocok kalau LO memberi cerita orang pertama) |
| TT4 | Scrapbook BanaMail | Wordmark lama ditempel selotip | Ringan | cadangan |
| TT5 | Amplop berbalik | Surat di balik amplop | Ringan | cadangan |

**Penutup**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| PN1 | Manifesto bahan | Kata raksasa bertekstur berbeda | Ringan | **DIPILIH** |
| PN2 | Podium kosong | Sorotan bernapas di podium kosong | Sangat ringan | **DIPILIH** |
| PN3 | Surat balasan | Surat diketik untuk `{awalan}@{domain}` | Sangat ringan | cadangan |
| PN4 | Konsol giliranmu | Konsol kosong, "Sekarang giliran kodemu." | Sangat ringan | cadangan |

**Footer maskot**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| FT1 | Lift panggung + surat jatuh | Lampu padam, tulisan ditempel, maskot naik dari podium, kotak memantul, amplop jatuh ke celah | Ringan | **DIPILIH** |
| FT2 | Naik klasik | Maskot naik dari tengah bawah, paling dekat Kong | Paling ringan | cadangan (dipakai otomatis kalau pintu lift bermasalah) |
| FT3 | Menembus robekan | Kertas robek V terbalik | Ringan | cadangan |
| FT4 | Pop-up V-fold | Berdiri dari lipatan buku | Ringan sampai sedang | cadangan |
| FT5 | Kamera mundur | Grup badan + kotak mengecil dari dekat | Ringan | cadangan |
| FT6 | Semburan amplop | Amplop menyembur dari kotak | Ringan | dibuat, mati secara bawaan (10.6) |

**Kursor dan tombol**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| KT1 | Kursor amplop | Kursor amplop di desktop | Nol di HP | dibuat, mati secara bawaan (10.6) |
| KT2 | Tombol pil kertas | Pil oranye dengan bayangan kertas | Sangat ringan | **DIPILIH** |
| KT3 | Stiker sosial | Ikon miring yang menegak saat disentuh | Sangat ringan | **DIPILIH** |
| KT4 | Cap tersalin | Cap TERSALIN + pesan `aria-live` | Sangat ringan | **DIPILIH** |

**Suara**

| Kode | Nama | Penjelasan | Beban HP | Status |
|---|---|---|---|---|
| SR1 | Tanpa suara | Hening | Nol | **DIPILIH** |
| SR2 | Bunyi kertas kecil | Tombol suara, mati secara bawaan | Sangat ringan | cadangan |
| SR3 | Suasana panggung | Dengung ruangan saat film | Ringan | cadangan |

### 19.3 Slogan footer

| Slogan | Status |
|---|---|
| **KOTAK MASUK UNTUK KODEMU / AN INBOX FOR YOUR CODE** | **DIPILIH (D5)** |
| SURAT SAMPAI. / MAIL DELIVERED. | Dipakai sebagai nama film dan bab, bukan slogan footer |
| ADA SURAT! / MAIL'S HERE! | cadangan |
| BIKIN. BACA. BUANG. / MAKE. READ. TOSS. | cadangan |
| KIRIM. TANGKAP. BACA. / SEND. CATCH. READ. | Dipakai (diperpanjang dengan BUANG.) sebagai manifesto Penutup |
| BIAR DIA YANG ANGKAT. / LET HIM DO THE LIFTING. | cadangan |
| SATU POST, SATU KOTAK. / ONE POST, ONE INBOX. | cadangan |
| UJI TANPA SAMPAH / TEST WITHOUT THE CLUTTER | cadangan |
| POS UNTUK KODEMU / A POST OFFICE FOR YOUR CODE | cadangan |
| SURATNYA MASUK, TESNYA JALAN. / MAIL IN, TESTS ON. | cadangan |

---

## 20. Yang tidak boleh berubah dan syarat selesai

### 20.1 Tidak boleh

- Mengubah atau menulis ulang isi teknis di bagian 3. Menampilkan endpoint yang belum aktif.
- Mengubah atau menghapus apa pun di folder `situs-pro/` (PRD pertama).
- Menghapus berkas aset lama di folder /pro di server.
- Menghilangkan versi ID atau EN dari teks apa pun.
- Mengubah tubuh, wajah, atau warna maskot, termasuk lewat video yang wajahnya melenceng.
- Menambah testimoni, angka pengguna, logo klien, penghargaan, atau klaim lain yang tidak nyata.
- Mengarang tahun, kota, cerita, nama akun sosial media, atau fitur.
- Menampilkan email selain admin@venbeemail.com.
- Menaruh teks penting di dalam gambar atau video.
- Memakai teks, huruf, gambar, atau nama Kong Rolls, MDX, atau merek lain, selain ikon sosial media sebagai tautan akun.
- Memuat skrip atau huruf dari CDN saat halaman dibuka.
- Memasang ke server tanpa cadangan dan tanpa cara mengembalikan.
- Memasang versi utama sebelum LO melihat versi uji dan sebelum diuji di iPhone.

### 20.2 Syarat selesai

Isi dan kejujuran:

- [ ] Judul tab, meta, Open Graph, Twitter card, dan logo menulis "VenbeeMail Pro" (8.4)
- [ ] Tujuh endpoint, empat domain, dua contoh curl, aturan awalan, dan field jawaban sama persis dengan halaman lama (`siapkan.js --cek` lolos)
- [ ] Langkah Cara kerja, kolom guna, dan keterangan field disalin persis dari halaman lama, ID dan EN
- [ ] Semua nilai contoh bertanda "contoh" atau "pratinjau", token selalu `<token>`
- [ ] Nama pembuat NongBana tampil di hero, Tentang, dan kaki halaman
- [ ] Kontak yang tampil hanya admin@venbeemail.com
- [ ] Bagian Tentang lengkap; isian yang kosong (tahun, kota, cerita, fitur Claude) tidak ada di HTML
- [ ] Ikon sosial hanya tampil untuk akun yang diisi LO; tanpa `href="#"`
- [ ] Hak cipta "© {tahun berjalan} VenbeeMail · dibuat oleh NongBana" (EN "made by NongBana")
- [ ] Tidak ada testimoni, angka pengguna, atau klaim lain
- [ ] Tidak ada teks, huruf, atau gambar Kong Rolls

Tampilan dan gerak:

- [ ] Layar muat jujur, paling lama 1,2 detik, sekali per sesi; titik status API hanya tampil kalau API menjawab
- [ ] Hero: nama, kalimat inti, dan tombol "Lihat API" terbaca di detik pertama, video loop tanpa sambungan terlihat
- [ ] Film 30 detik maju-mundur mengikuti gulir, estafet monyet, momen nyaris jatuh terasa lambat, sambungan antaradegan tidak terlihat
- [ ] Garis rute bergerak sesuai film dan muncul lagi di footer sampai "Sampai"
- [ ] Tombol "Lewati film" bekerja dengan jari dan keyboard
- [ ] Kartu penutup dengan cap yang dihentakkan
- [ ] Setiap bagian Bab 2 punya judul huruf gunting dan gerak masuk sendiri
- [ ] Footer FT1: lampu padam, tulisan ditempel, maskot naik dari pintu lift tanpa terlihat di bawah permukaan podium, kaki tepat di podium, kotak menembus tepi atas tulisan tanpa celah di lengan, amplop jatuh ke celah, kotak memantul
- [ ] Label AW4 di amplop footer tampil kalau pengunjung mengetik awalan yang valid
- [ ] Maskot di footer bernapas, berkedip, dan bereaksi saat kotaknya diketuk
- [ ] Wajah huruf B bereaksi tiap ditekan, dengan jari maupun keyboard
- [ ] Semua tombol punya gerak saat disentuh dan ditekan; Salin memberi tanda berhasil yang terlihat dan diumumkan

Video:

- [ ] Ketujuh klip lolos cek 7.6 (atau mode tanpa video dipakai dan dicatat)
- [ ] Wajah dan warna maskot di V5 sama dengan aset asli
- [ ] Urutan bingkai HP 405x720 dan desktop 1280x720 dimuat per adegan
- [ ] Video loop MP4 H.264 + WebM, tanpa suara, dengan poster, dan bisa dijeda

HP, kinerja, aksesibilitas:

- [ ] Muatan awal HP di bawah 2,5 MB (target 1,3 MB), diukur dengan `ukur_muatan.mjs`, angkanya dicatat di README
- [ ] Rapi di lebar 360 dan 390 piksel, tanpa gulir menyamping
- [ ] Mode kurangi gerakan (setelan sistem dan tombol): semua isi tampil, semua tombol bekerja, film jadi komik, footer dalam komposisi akhir
- [ ] Tanpa JavaScript, semua bagian tampil dalam posisi akhir
- [ ] Tautan "Langsung ke isi", satu `<h1>`, `<h2>` per bagian, fokus terlihat, area sentuh 44 piksel, kontras sesuai 16.3
- [ ] Dua bahasa lengkap, atribut `lang` ikut berganti
- [ ] Diuji di Safari iPhone asli (16.5)

Server:

- [ ] Versi uji hidup di `/pro/kong/` dengan `noindex`, sudah dilihat LO
- [ ] Versi utama terpasang di `/pro/`, pemeriksaan otomatis lolos
- [ ] Cadangan ada di `/www/backup/venbeemail-pro-kong/`, blok kembalikan sudah diberikan ke LO
- [ ] Footer halaman depan punya tautan ke /pro dan Tentang; fungsi email sementara tetap jalan; cadangan halaman depan ada
- [ ] Bagian 4, 5, dan "Kemajuan" di file ini diperbarui dan di-commit

---

## 21. Prompt siap salin untuk chat baru

Tempel ini di chat Claude Code baru (di repo `rorobadojo-rgb/Venbeemail`):

```text
Bangun versi Kong halaman venbeemail.com/pro sesuai PRD di docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md (skill prd-venbeemail-pro-kong). Baca file itu sampai habis dulu, termasuk bagian 4 (keputusan yang sudah dikunci, jangan ditanyakan lagi) dan bagian 5 (yang masih ditunggu dariku).

Aturan penting: hasil di folder situs-pro-kong/, jangan ubah situs-pro/. Isi teknis lama disalin persis. Dua bahasa ID/EN. Maskot tidak diubah. Jangan mengarang tahun, kota, cerita, akun sosial media, atau angka; yang belum kuberikan jadi [ISI ...] dan tidak tampil. Kontak hanya admin@venbeemail.com, pembuat NongBana.

Mulai dari Fase 0 di bagian 17: beri aku blok cek server (bagian 18.1) untuk kutempel di terminal aaPanel, lalu siapkan folder dan aset. Kerjakan per fase, commit dan push tiap fase, dan beri aku ringkasan singkat plus apa yang kamu tunggu dariku. Setelah Fase 1, kirim lembar bingkai kunci dan prompt Seedance supaya aku bisa mulai membuat video. Jangan pasang ke server sebelum aku melihat versi uji di /pro/kong/.
```
