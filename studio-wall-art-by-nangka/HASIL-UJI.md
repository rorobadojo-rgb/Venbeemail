# Hasil Uji

Tanggal: 12 November 2026. Semua angka di bawah berasal dari perintah yang benar-benar dijalankan, dan bisa diulang.

## Ringkasan

| Uji | Hasil | Cara mengulang |
|---|---|---|
| Struktur 45 skill | 1.586 pemeriksaan, lulus | `python3 studio-wall-art-by-nangka/tools/run_tests.py` |
| Unit 11 skrip | 35 uji, lulus | `python3 studio-wall-art-by-nangka/tests/test_scripts.py` |
| Validator resmi skill-creator (`quick_validate.py`) | 45 dari 45 sah | dijalankan per folder skill |
| Perjalanan brief sampai paket listing | 31 dari 31 langkah sesuai harapan | `python3 studio-wall-art-by-nangka/tools/build_example.py` |
| Pengemasan | 45 berkas `.skill` | `python3 studio-wall-art-by-nangka/tools/build_dist.py` |

## Apa yang diperiksa uji struktur

Untuk tiap skill: frontmatter sah dan nama sama dengan folder; deskripsi 1-1.024 karakter tanpa kurung sudut; 15 bagian wajib ada; paling banyak 500 baris; setiap file yang dirujuk benar-benar ada; setiap nama skill yang disebut ada di indeks; bagian "Serah terima" cocok dengan indeks; salinan aturan inti sama dengan sumbernya. Untuk keseluruhan: tidak ada ketergantungan melingkar; skill layanan tidak punya keluaran; tidak ada yang menyerahkan ke pengarah; tiap keputusan punya tepat satu pemilik.

## Uji perjalanan pengguna

Proyek contoh `PRJ-202611-satwa-tropis` di `contoh-proyek/studio-nangka/`. Yang benar-benar dijalankan:

| Tahap | Yang dijalankan | Hasil |
|---|---|---|
| Brief, rencana koleksi, konsep, komposisi, prompt | Ditulis mengikuti format skill | `brief.md`, `catatan-kreatif.md` |
| Bukti pasar | 2 pencarian web nyata (ditambah 1 untuk kurs), 5 baris bukti bertanggal | semuanya keyakinan rendah atau sedang |
| Gambar master | Digambar skrip 3600 x 5400 pixel (pengganti alat AI) | `master.jpg` |
| Ukur warna | `extract_palette.py` | 5 warna berbeda |
| Rencana rasio | `print_math.py` | 12 ukuran layak, 7 ditolak |
| Ekspor | `export_print_files.py` | 5 JPEG sRGB 300 DPI, 0,55-1,22 MB |
| Panduan cetak | `make_guide_pdf.py` | PDF 2 halaman dengan nama file sebenarnya |
| Paket | `build_package.py` | 6 file menjadi 5 (satu ZIP), verdict pass |
| Gambar listing | `make_listing_images.py` | 3 gambar 2000 x 2000 |
| Harga | `pricing_model.py` dengan kurs Rp18.069,1 (Katadata, 9 Nov 2026) | pada USD 6: bersih 4,75, impas 4,8 pesanan, 4 peringatan |
| Tag | `check_tags.py` | 13 tag lulus |
| Preflight G5 | `check_listing.py` | 0 gagal, 2 catatan |
| Katalog | `check_catalog.py` | 1 baris sah |
| Serah terima | `validate_handoff.py` pada 20 berkas | 20 valid, artefak bertanda ada benar-benar ada |
| Uji negatif | Klaim 24x36 pada master 3600 pixel | ditolak, seperti seharusnya |

Hal yang paling penting dari uji ini: sistem **menolak menjanjikan ukuran yang tidak didukung pixel**. Master 3600 x 5400 hanya layak sampai 12x18 pada 300 PPI; 24x36 butuh 7200 x 10800. Rencana cetak, panduan, deskripsi, dan preflight semuanya memakai daftar ukuran yang sama dari satu hitungan.

## Kegagalan yang ditemukan dan diperbaiki

| No | Temuan | Ditemukan oleh | Perbaikan |
|---|---|---|---|
| 1 | Pengukur warna melaporkan lima warna gading nyaris kembar pada gambar berbutir, dan melewatkan terakota, kuning, dan cokelat | Membaca keluaran uji perjalanan | Warna yang berdekatan digabung sebelum dilaporkan; ditambah uji regresi |
| 2 | Setelah perbaikan pertama, pengukur warna melaporkan 8 warna karena pengecilan gambar menciptakan warna campuran di tepi bentuk | Uji perjalanan gagal pada aturan "maksimal 5 warna" | Pengecilan tanpa pencampuran pixel |
| 3 | Karya uji melanggar aturan DNA sementara (6 warna), dua daun melayang di atas dahan, dan kaki menembus dahan, padahal serah terima awal saya menulis "lulus" | Melihat gambar | Karya digambar ulang; hasil cek gaya kini dihitung dari pengukur warna, bukan ditulis tangan |
| 4 | Catatan keputusan ukuran yang ditolak tidak lengkap (16x24 dan 20x30 tidak disebut) | Membaca berkas serah terima | Daftar dibentuk otomatis dari rencana cetak |
| 5 | Penyusun paket menggabung PDF panduan ke dalam ZIP, sehingga panduan sulit ditemukan pembeli | Uji paket 6 file | PDF dibiarkan berdiri sendiri; yang digabung dua gambar terkecil |
| 6 | Ukuran ekspor A1 meleset 1 pixel (7017, seharusnya 7016) karena pembulatan inci | Membandingkan dengan tabel acuan | Hitungan memakai inci tanpa pembulatan |
| 7 | Lima uji unit gagal karena harapan uji saya salah: saya mengira gambar 2400 pixel layak untuk A4, padahal hanya 290 PPI | Menjalankan uji | Uji diperbaiki; skripnya sudah benar |
| 8 | Contoh judul di skill penulis listing tertulis 86 karakter, padahal 84 | Menghitung ulang | Angka dikoreksi |

Temuan 3 dan 7 layak diingat: dua kali kesalahannya ada pada klaim saya, bukan pada alat. Itulah gunanya pemeriksaan yang dihitung.

## Belum diuji

1. **Pemicu skill pada percakapan nyata.** Belum ada uji apakah deskripsi tiap skill terpilih dengan tepat di antara 45 skill ini dan sekitar 170 skill akun. Skill-creator punya alat optimasi deskripsi yang belum dijalankan.
2. **Mutu keluaran skill kreatif dan operasional pada sesi terpisah.** Dokumen tahap kreatif di contoh ditulis oleh penulis skill sendiri, jadi bukan uji independen. Uji baku skill-creator (dengan dan tanpa skill, lalu dinilai) belum dilakukan untuk skill mana pun.
3. **Pembuatan gambar dengan Higgsfield, Artlist, atau Midjourney.** Tidak dijalankan karena memakai kredit berbayar dan belum ada izin. Karya contoh adalah gambar sintetis, bukan karya jual.
4. **Etsy.** Tidak ada toko, konektor belum aktif, dan halaman Etsy tidak bisa dibuka dari sesi ini. Tidak ada listing yang diterbitkan.
5. **Pemasangan di akun claude.ai.** Berkas `.skill` terbentuk dan lolos validator, tetapi belum diunggah.
6. **Skill tahap dua** (personalisasi, pesanan custom) dan skill yang butuh data toko (pembaca data, portofolio, tinjauan bulanan): hanya lulus uji struktur, karena belum ada pesanan dan data.
7. **Hasil cetak di kertas.** Tidak ada file yang dicetak.

## Yang terbukti tentang pemasangan

Setelah file ditulis ke `.claude/skills/` dan sesi dimulai ulang, daftar skill sesi Claude Code memuat skill studio (misalnya `studio-wall-art-orchestrator`, `wall-art-ratio-resolution-planner`, `etsy-listing-preflight-reviewer`). Jadi untuk repositori ini di cabang `claude/epic-carson-4jmsuo`, skill terbaca oleh lingkungan. Itu membuktikan skill termuat, belum membuktikan tiap skill terpicu pada saat yang tepat.
