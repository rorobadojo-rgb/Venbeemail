# Analisis video referensi Kong

Sumber: rekaman layar dari HP yang dikirim LO pada 10 Oktober 2026 (82 detik, 832×464, 60 fps). Isinya situs **Kong Rolls** (merek tisu toilet dari bambu, www.kongrolls.com) yang dibuat studio desain MDX (mdx.so, studio animasi 3D). Rekaman dibuka dari halaman studi kasus MDX ("The challenge"), lalu situs Kong dibuka dan digulir dari atas sampai footer.

Situs aslinya tidak bisa dibuka dari lingkungan Claude Code (domain mdx.so dan kong.mdxpreview.xyz diblokir), jadi analisis ini hanya dari video. Gambar acuan ada di `referensi-kong/`: `lembar-01` sampai `lembar-06` berisi satu frame per detik dengan penanda waktu, dan `detik-*.jpg` adalah frame kunci yang diperbesar.

## Alur halaman dari atas ke bawah

Waktu di bawah adalah waktu di video rekaman, bukan durasi asli di situs.

| Waktu | Bagian | Yang terlihat | Teknik yang kemungkinan dipakai |
|---|---|---|---|
| 00:02–00:05 | Layar muat | Latar gradasi biru laut pekat, logo Kong Rolls di tengah (gorila memeluk huruf), bilah kemajuan tipis, tulisan "Loading..." | Preloader yang menunggu semua bingkai video selesai dimuat |
| 00:06–00:07 | Pembuka | Adegan hutan 3D muncul pelan di balik logo. Ikon gulir bulat kecil di tengah bawah. Menu muncul: logo kiri atas, pil kaca di tengah berisi "Wholesale, Vision & mission, About us, FAQ's" dengan tombol bulat di kedua ujungnya, tautan kecil di kanan atas | Crossfade dari preloader ke bingkai pertama film |
| 00:08–01:00 | Bab 1: film yang digulir | Satu perjalanan kamera CGI tanpa putus, maju-mundur mengikuti gulir. Logo larut, kamera terbang masuk ke pabrik di hutan, gorila membuat gulungan tisu, wajah Kong dari dekat, Kong memeriksa kertas, pesawat pengebom terbang di atas hutan, Kong berayun di rantai, pesawat menembus awan, Kong menjadi pilot dan menekan tombol merah, pintu kargo terbuka, gulungan tisu dijatuhkan dengan balon udara merah-putih, Kong jatuh dari langit ke laut, Kong berselancar memegang gulungan, Kong push-up di kolam resor, Kong bersantai di kolam dengan minuman, kamera mundur dari atas melewati hutan dan awan sampai Bumi terlihat dari angkasa. Tidak ada teks selama film, hanya titik gulir di bawah | Urutan gambar (image sequence) di canvas yang digerakkan ScrollTrigger dengan pin dan scrub. Sangat panjang, dibagi beberapa adegan |
| 01:01 | Kartu penutup bab | Layar hitam, logo Kong Rolls besar dan "WWW.KONGROLLS.COM", seperti akhir film | Bingkai terakhir urutan gambar |
| 01:02–01:13 | Bab 2: panel fitur | Adegan dari film muncul lagi sebagai gambar diam atau loop pendek, masing-masing dengan judul huruf retro tebal di kiri atau kanan bawah: "KONG'S BAMBOO, YOUR ECO CHOICE", "RIDE THE WAVE OF CHANGE" (dengan paragraf kecil), "STRENGTH IN EVERY SHEET", "ELEVATE YOUR THRONE", "EMBRACE ECO-LUXURY ANYWHERE" (dengan Bumi) | Panel layar penuh dengan crossfade dan blur di antara adegan; judul masuk bersama gambar |
| 01:14–01:16 | Produk | Latar gradasi biru dengan bayangan gulungan tisu samar, judul "100% PREMIUM BAMBOO PAPER", daftar poin (3 lapis, gulungan dua kali panjang 300 lembar, bambu terbarukan, dan lainnya), tombol pil "SHOP NOW" | Bagian biasa dengan animasi masuk |
| 01:16–01:19 | Manifesto huruf raksasa | Kalimat "SAVE THE PLANET ONE SHEET AT A TIME" memenuhi layar, baris demi baris naik, krem di atas biru. Bumi naik dari bawah | Tipografi kinetik: tiap baris digerakkan gulir |
| 01:20–01:22 | Footer | Tulisan raksasa "SAVE THE WORLD" bergaya kuas memenuhi lebar layar. **Kong naik dari tengah bawah sambil mengangkat Bumi di atas kepala**, badannya menutupi sebagian huruf ("THE W"). Tautan kecil di kiri dan kanan bawah, menu tetap terlihat | Tiga lapis: tulisan, Kong (potongan transparan) di depan tulisan, Bumi; Kong digerakkan gulir naik dari bawah |

## Ciri gaya yang membuat Kong terasa sinematik

1. **Film dulu, teks belakangan.** Bagian pertama murni tontonan: tanpa teks, tanpa tombol, hanya cerita yang digerakkan jari. Pesan produk baru muncul di bab kedua.
2. **Satu tokoh, satu dunia.** Semua adegan memakai tokoh yang sama (gorila biru) dan palet yang sama (biru laut, hijau hutan, krem). Pergantian adegan terasa seperti satu film, bukan potongan.
3. **Kamera yang terus bergerak.** Tidak pernah diam: maju, terbang, menembus awan, mundur sampai angkasa. Skala membesar dari pabrik kecil sampai planet.
4. **Adegan diulang sebagai panel.** Adegan film dipakai lagi sebagai latar panel fitur, jadi aset 3D dipakai dua kali.
5. **Huruf retro tebal dan huruf kuas.** Judul memakai huruf display bulat ala 70-an; footer memakai huruf kuas tangan.
6. **Akhir yang heroik.** Footer adalah puncak: tokoh raksasa mengangkat simbol misi (Bumi) di depan slogan.
7. **Menu pil kaca di tengah**, logo kecil di kiri, ikon gulir bulat di tengah bawah sepanjang film.

## Padanan untuk VenbeeMail

| Kong | VenbeeMail |
|---|---|
| Gorila biru | Maskot pisang zombie (gambar 03) |
| Gorila pekerja | Empat monyet origami skateboard (05, 07, 08, 09) |
| Gulungan tisu | Amplop hantu dan kotak surat kardus (10, 03) |
| Balon udara merah-putih | Pesawat kertas (10) |
| Bumi | Kotak surat yang diangkat maskot, atau bola dunia dari amplop |
| Hutan, pabrik, kolam | Panggung teal (02) dan dunia kertas origami |
| "SAVE THE WORLD" | Slogan VenbeeMail (ditentukan di PRD) |
| Huruf retro tebal | Huruf potongan kertas gaya "ADVANCED!" (06) |

## Catatan kejujuran

- Situs asli tidak dibaca langsung. Nama pustaka (GSAP, ScrollTrigger, Lenis, canvas) adalah dugaan dari perilaku di video.
- PRD tidak boleh menyalin teks, huruf, atau gambar Kong. Yang ditiru hanya cara penyajian: film yang digulir, panel fitur, tipografi kinetik, dan footer heroik.
