# Panduan memberi nama komunitas

Pola: **[apa yang dikerjakan] + [objeknya] + [lokasi bila perlu pembeda]**, 2 sampai 6 kata.

| Isi komunitas (file teratas, node teratas) | Nama buruk | Nama baik |
|---|---|---|
| `lib/mail.ts`, `DomainFan.tsx`; `generateLocalPart()`, `copyText()` | mail.ts | Generator Alamat Email |
| `doodleScene.ts`, `doodleAtlas.generated.ts`; `createDoodleScene()` | Doodle | Dinding Doodle Three.js |
| `tsconfig.json`; `compilerOptions`, `strict` | Config | Konfigurasi TypeScript |
| `package.json`; `gsap`, `react`, `three` | Packages | Dependensi Runtime npm |
| `situs-pro/pasang/pasang.sh`; `ada()`, `kode()` | Script | Pemasang Situs Pro |
| `situs-pro-kong/pasang/pasang-kong.sh`; `ada()`, `kode()` | Script 2 | Pemasang Situs Kong |
| `test_scripts.py`; `CatalogTest`, `PricingTest` | Tests | Uji Skrip Studio Nangka |
| SKILL.md keluarga Etsy saling merujuk | Etsy | Skill Listing dan Toko Etsy |
| Judul bagian PRD tentang harga dan paket | PRD part 3 | Paket Harga VenbeeMail Pro |

Aturan:

1. Kata kerja benda ("Generator", "Pemasang", "Uji", "Model") lebih jelas daripada kata sifat.
2. Pakai istilah yang dipakai pemilik repo ("situs Kong", "Studio Nangka"), bukan terjemahan baru.
3. Hindari "dan lain-lain", "misc", "utilitas" kecuali isinya memang campuran; bila campuran,
   tulis dua hal terbesar: "Olah Gambar Maskot & Aset".
4. Nama unik di satu graph; tambahkan lokasi bila dua komunitas mirip.
5. Bahasa Indonesia; nama produk dan pustaka tetap ditulis aslinya (Three.js, GitHub Pages, npm).
