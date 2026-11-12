---
name: studio-wall-art-orchestrator
description: Pintu masuk Studio Wall Art by Nangka. Pakai setiap kali pemilik studio menyebut studio, Nangka, wall art, printable, poster digital, toko Etsy, koleksi, listing, atau meminta sesuatu tentang bisnis wall art digital tanpa menyebut skill tertentu, termasuk "mulai dari mana", "lanjutkan proyek", "apa langkah berikutnya", atau "kerjakan dari ide sampai listing". Skill ini membaca keadaan studio, memilih skill yang tepat, menjalankannya berurutan, dan menyatukan hasilnya. Jangan dipakai bila pemilik sudah menyebut satu skill studio secara langsung.
---

# studio-wall-art-orchestrator

Pengarah sistem. Tugasnya memilih skill yang tepat untuk permintaan saat ini, memastikan prasyaratnya terpenuhi, lalu merangkum hasil. Skill ini tidak mengerjakan isi (riset, desain, listing) sendiri.

Sebelum mulai, baca `references/studio-core.md` (label bukti, folder studio, skema serah terima, izin tindakan ke luar). Peta lengkap 45 skill ada di `references/peta-skill.md`.

## Kapan digunakan

- Permintaan tentang studio tanpa menyebut skill tertentu.
- Permintaan yang melewati beberapa tahap ("dari ide sampai paket listing").
- Pemilik bertanya langkah berikutnya atau ingin melanjutkan proyek lama.

## Kapan tidak digunakan

- Pemilik menyebut satu skill secara langsung: jalankan skill itu saja.
- Pertanyaan umum di luar bisnis wall art.

## Input

- Wajib: permintaan pemilik.
- Opsional: `project_id`, file serah terima terakhir, isi `studio-nangka/memori/brand-memory.md`.

## Default

- Tanpa `project_id`: cari proyek terbaru di `studio-nangka/proyek/`. Jika tidak ada, mulai dari `studio-brief-interviewer`.
- Jalankan paling banyak tiga skill per giliran, lalu laporkan. Jalur penuh hanya bila diminta.
- Profil studio dibaca dari memori merek, bukan ditanyakan ulang.

## Pertanyaan bila info penting belum ada

Tanyakan hanya bila jawabannya mengubah rute, paling banyak dua pertanyaan dengan pilihan:

1. "Ini proyek baru atau lanjutan proyek [nama terakhir]?"
2. "Anda ingin satu langkah dulu atau jalur penuh sampai [tujuan]?"

## Langkah kerja

1. Baca keadaan: memori merek, serah terima terakhir proyek (field `status`, `next_skill`, `unresolved_questions`).
2. Tentukan tahap permintaan dengan tabel rute di bawah. Bila cocok dengan lebih dari satu, pilih yang paling awal dalam urutan kerja.
3. Periksa prasyarat (tabel prasyarat). Bila belum terpenuhi, jalankan skill prasyaratnya dulu dan katakan alasannya dalam satu kalimat.
4. Umumkan rencana singkat: skill apa, urutannya, hasil apa yang akan muncul.
5. Jalankan tiap skill dengan membuka `SKILL.md` miliknya (lewat alat Skill bila tersedia). Bila skill itu tidak terpasang, katakan namanya dan minta pemilik memasangnya; jangan menirukan isinya dari ingatan.
6. Setelah tiap skill, periksa blok serah terimanya. Bila ada sistem file, jalankan `python3 scripts/validate_handoff.py <file.json>`.
7. Tutup dengan Ringkasan Studio (format di bawah) dan usulkan satu langkah berikutnya.

### Tabel rute

| Permintaan tentang | Mulai dari |
|---|---|
| Ide belum jelas, proyek baru | studio-brief-interviewer |
| Pasar, niche, pesaing, musim, keyword | etsy-market-evidence-researcher (lalu skill kelompok B yang sesuai) |
| Gambar referensi, gaya studio, palet, motif | wall-art-reference-reader, wall-art-visual-dna-builder |
| Koleksi baru | wall-art-series-collection-builder |
| Satu karya: konsep, komposisi, prompt | wall-art-concept-divergence |
| Gambar sudah jadi: cek cacat, gaya | wall-art-artifact-retouch-reviewer |
| Ukuran cetak, rasio, ekspor, paket file | wall-art-ratio-resolution-planner |
| Isi produk, harga, mockup, judul, tag | wall-art-product-offer-planner |
| Cek sebelum terbit | etsy-listing-preflight-reviewer |
| Buka atau tata toko | etsy-storefront-brand-planner |
| Pesan pelanggan, komplain, pesanan custom | etsy-customer-message-drafter, etsy-issue-resolution-assistant, etsy-custom-order-workflow |
| Data toko, eksperimen, portofolio, bulanan | etsy-performance-data-reader |
| Aturan atau biaya Etsy | etsy-policy-fact-checker |
| Hak pakai sebuah bahan | studio-asset-rights-register |
| "Ingat ini", "catat keputusan" | studio-brand-memory |

### Jalur siap pakai

- Mulai toko: brief, bukti pasar, niche, profil pembeli, rencana toko.
- Identitas: baca referensi, DNA visual, palet, motif.
- Karya: rencana koleksi, konsep, sintesis referensi, komposisi, prompt, cek cacat, cek gaya, gerbang G3.
- Produksi: isi produk, rencana rasio, ekspor, paket unduhan, panduan cetak, gerbang G4.
- Listing: harga, gambar listing, judul dan deskripsi, tag, preflight G5, katalog.
- Bulanan: baca data, portofolio atau eksperimen, tinjauan bulanan.

## Aturan keputusan

- Skill ini memutuskan urutan. Isi keputusan tetap milik skill pemiliknya (lihat kolom "Pemilik keputusan" di peta skill).
- Prasyarat keras: bahan untuk produk harus tercatat di register hak; tahap produksi butuh G3 lulus; tahap listing butuh G4 lulus; terbit butuh G5 lulus dan izin pemilik.
- Bila dua skill tampak cocok, pilih yang memiliki keputusan terkait, bukan yang kata kuncinya mirip.
- Tidak ada skill yang menyerahkan balik ke orchestrator. Putaran baru (misalnya revisi bulan depan) dimulai sebagai versi atau proyek baru.

## Format hasil

```
RINGKASAN STUDIO  [project_id, tanggal]
Dikerjakan     : skill A -> skill B
Hasil          : (1-3 baris per skill, dengan path file bila ada)
Keputusan      : (yang sudah diambil dan oleh siapa)
Masih terbuka  : (pertanyaan atau izin yang ditunggu)
Langkah berikut: (satu skill + alasan)
```

## Pemeriksaan kualitas

- Setiap skill yang dijalankan menghasilkan blok serah terima dengan enam field wajib.
- Tidak ada pernyataan "sudah dibuat" tanpa path yang bisa dicek.
- Ringkasan tidak menambah klaim baru di luar hasil skill.

## Penanganan kesalahan

- Serah terima tidak valid: perbaiki field yang disebut skrip, jangan lanjut ke skill berikutnya.
- Skill tujuan tidak terpasang: berhenti di situ, sebut nama skill, tawarkan mengerjakan bagian lain yang tidak bergantung padanya.
- Permintaan menabrak prasyarat (ingin terbit tanpa preflight): jelaskan risikonya, jalankan prasyarat.

## Serah terima

Menyerahkan ke skill mana pun sesuai tabel rute; `next_skill` diisi nama skill itu. Skill ini sendiri tidak pernah menjadi `next_skill`.

## Batas kemampuan alat

- Tanpa alat Skill, skill lain harus dibuka sebagai file atau dipanggil pemilik.
- Tanpa sistem file, keadaan proyek harus ditempelkan pemilik.
- Konektor Etsy mungkin belum aktif; semua hasil listing berupa draf.

## Contoh penggunaan

Pemilik: "Saya punya 12 foto burung dari kebun, bisa jadi produk?" Rute: studio-brief-interviewer (tujuan dan ruangan), studio-asset-rights-register (foto sendiri, cleared), lalu wall-art-reference-reader. Ringkasan menyebut tiga hasil dan mengusulkan wall-art-series-collection-builder.

## Contoh kegagalan dan perbaikannya

Gagal: langsung menulis judul listing karena pemilik berkata "buatkan listing", padahal file cetak belum ada. Perbaikan: cek serah terima terakhir; G4 belum lulus, jadi jalankan jalur produksi dulu atau jelaskan bahwa yang dibuat baru draf teks tanpa pemeriksaan file.

## Cara menguji skill ini

1. Beri permintaan "apa langkah berikutnya?" dengan folder studio berisi serah terima berstatus `passed` dari `wall-art-download-package-builder`. Hasil benar: mengusulkan `wall-art-print-instruction-writer`.
2. Jalankan `python3 scripts/validate_handoff.py assets/handoff-template.json`. Hasil benar: `VALID`.
3. Hapus field `status` dari salinan template dan jalankan lagi. Hasil benar: `TIDAK VALID` dengan nama field yang hilang.
