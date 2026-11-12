---
name: studio-brief-interviewer
description: Mengubah keinginan yang masih kabur menjadi brief proyek wall art yang bisa dikerjakan. Pakai saat pemilik studio berkata "saya mau bikin...", "ada ide koleksi", "mau jual poster tentang...", memulai proyek atau koleksi baru, atau saat skill lain kekurangan informasi dasar seperti pembeli sasaran, ruangan, gaya, jumlah karya, atau tenggat. Menghasilkan brief satu halaman dengan pertanyaan terbuka yang jelas. Jangan dipakai untuk riset pasar atau membuat konsep gambar.
---

# studio-brief-interviewer

Menyusun brief proyek: satu halaman yang menjawab untuk siapa, untuk ruangan apa, bergaya apa, berapa banyak, dari bahan apa, dan kapan. Brief yang jelas mencegah skill berikutnya menebak.

Sebelum mulai, baca `references/studio-core.md`. Template brief: `assets/brief-template.md`.

## Kapan digunakan

- Proyek atau koleksi baru.
- Permintaan yang tidak menyebut pembeli, ruangan, atau jumlah karya.
- Brief lama perlu diperbarui karena arah berubah.

## Kapan tidak digunakan

- Brief sudah ada dan lengkap: langsung ke skill tujuan.
- Pemilik hanya ingin jawaban cepat atas satu pertanyaan teknis.

## Input

- Wajib: kalimat keinginan pemilik.
- Opsional: gambar referensi, `studio-nangka/memori/brand-memory.md`, brief lama.

## Default

Ambil dari memori merek bila ada. Bila belum ada, pakai profil awal studio dan tandai sebagai ASUMSI:

- Pasar Amerika Serikat, listing bahasa Inggris, ukuran inci.
- Produk siap unduh (tanpa personalisasi).
- Satu koleksi berisi 6 karya, tiga di antaranya bisa dijual sebagai set.
- Kapasitas 5-10 jam per minggu, jadi satu koleksi direncanakan 3-4 minggu.

## Pertanyaan bila info penting belum ada

Paling banyak lima pertanyaan, masing-masing dengan 2-4 pilihan dan satu default. Lewati yang sudah terjawab di memori.

1. Ruangan utama: ruang tamu/kamar tidur, kamar bayi/anak, dapur/ruang makan, atau kantor rumah?
2. Tema: hewan, botani/alam, abstrak, Nusantara/tropis, atau campuran yang mana?
3. Suasana: tenang dan lembut, hangat dan klasik, atau cerah dan ceria?
4. Bahan: foto sendiri, gambar sendiri, dibuat dengan AI, atau gabungan?
5. Tenggat atau momen: tidak ada, atau untuk musim tertentu?

## Langkah kerja

1. Baca memori merek dan brief lama bila ada.
2. Tulis ulang keinginan pemilik dalam satu kalimat dan minta koreksi.
3. Ajukan pertanyaan yang belum terjawab. Bila pemilik melewati, pakai default dan tandai ASUMSI.
4. Isi template brief. Pisahkan dengan tegas: KEPUTUSAN pemilik, ASUMSI, dan pertanyaan terbuka.
5. Tetapkan `project_id` dan `collection_id` sesuai aturan ID.
6. Daftar semua bahan yang disebut pemilik dan tandai "perlu didaftarkan di register hak".
7. Simpan ke `studio-nangka/proyek/<project_id>/brief.md` bila ada sistem file; bila tidak, tampilkan utuh.
8. Tulis blok serah terima.

## Aturan keputusan

- Skill ini memiliki isi brief. Skill lain yang menemukan brief kurang, mengembalikan pertanyaan lewat `unresolved_questions`, bukan mengubah brief.
- Brief dianggap cukup bila lima hal terisi (pembeli, ruangan, tema, jenis produk, jumlah karya), walau sebagian berupa ASUMSI.
- Tujuan penjualan ditulis sebagai HIPOTESIS ("koleksi ini diduga cocok untuk..."), bukan janji.
- Bila tema menyentuh karakter, merek, tim olahraga, atau tokoh terkenal, tandai `blocked` pada bagian itu dan jelaskan alasannya.

## Format hasil

Isi `assets/brief-template.md` secara utuh, diakhiri blok serah terima dengan `status: ready_for_review`.

## Pemeriksaan kualitas

- Setiap baris brief berlabel KEPUTUSAN, ASUMSI, atau HIPOTESIS.
- Tidak ada angka pasar di dalam brief.
- Jumlah karya dan tenggat masuk akal untuk kapasitas mingguan pemilik.
- Semua bahan yang disebut tercantum di daftar bahan.

## Penanganan kesalahan

- Pemilik menjawab "terserah": pilih default, tandai ASUMSI, lanjutkan.
- Keinginan saling bertentangan (minimalis tetapi penuh detail): tulis keduanya, minta pilih satu sebagai utama.
- Tema terlalu luas ("hewan"): persempit dengan dua contoh arah, jangan menolak.

## Serah terima

- `etsy-market-evidence-researcher` bila arah pasar belum punya bukti.
- `wall-art-reference-reader` bila pemilik membawa gambar referensi.
- `wall-art-series-collection-builder` bila identitas visual sudah ada dan tinggal merancang koleksi.
- Keputusan baru tentang preferensi dikirim ke `studio-brand-memory` untuk dicatat.

## Batas kemampuan alat

Tidak melihat pasar dan tidak menilai gambar; hanya mencatat apa yang diinginkan. Tanpa sistem file, brief hanya ada di percakapan.

## Contoh penggunaan

Pemilik: "Mau bikin poster hewan buat kamar anak." Hasil: brief `PRJ-202611-hewan-kamar-anak`, ruangan kamar bayi/anak (KEPUTUSAN), tema hewan tropis (KEPUTUSAN), suasana lembut (ASUMSI), 6 karya (ASUMSI), bahan AI (KEPUTUSAN), satu pertanyaan terbuka tentang rentang usia anak.

## Contoh kegagalan dan perbaikannya

Gagal: brief berisi "pasar kamar anak sangat besar dan pasti laku". Perbaikan: hapus klaim, ganti dengan HIPOTESIS dan serahkan pengujiannya ke `etsy-market-evidence-researcher`.

## Cara menguji skill ini

Beri masukan "poster dapur bertema kopi" tanpa keterangan lain. Hasil benar: paling banyak lima pertanyaan berpilihan, brief terisi lengkap dengan label, tidak ada angka pasar, `project_id` berformat benar, dan `next_skill` salah satu dari tiga skill di bagian Serah terima.
