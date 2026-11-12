---
name: etsy-micro-niche-mapper
description: Memecah niche wall art yang luas menjadi segmen sempit yang jelas pembelinya dan bisa dilayani studio. Pakai saat pemilik berkata "niche-nya terlalu umum", "mau fokus ke mana?", "persempit tema ini", "cari celah", atau setelah bukti pasar terkumpul dan perlu diubah menjadi pilihan arah. Menghasilkan pohon niche, kandidat micro-niche dengan penilaian berbasis bukti, dan daftar pendek untuk dipilih pemilik. Jangan dipakai untuk mengumpulkan bukti pasar atau menulis keyword.
---

# etsy-micro-niche-mapper

Mengubah "poster hewan" menjadi sesuatu yang bisa dikenali pembeli tertentu, misalnya "set tiga cetakan satwa tropis bergaya ilustrasi vintage untuk kamar bayi netral gender". Skill ini pemilik usulan niche; pemilihan akhir tetap keputusan pemilik studio.

Sebelum mulai, baca `references/studio-core.md`.

## Kapan digunakan

- Tema dari brief masih luas.
- Ada bukti pasar yang perlu diterjemahkan menjadi arah.
- Peta pesaing menunjukkan celah yang ingin diperiksa.

## Kapan tidak digunakan

- Bukti pasar belum ada sama sekali dan pemilik ingin angka: jalankan pengumpul bukti dulu.
- Merancang koleksi (isi dan jumlah karya).

## Input

- Wajib: niche luas (dari brief).
- Opsional: `studio-nangka/riset/bukti-pasar.csv`, peta pola pesaing, `visual-dna.md`, profil studio di memori merek.

## Default

- Lima sumbu pemecah: subjek, gaya, ruangan, pembeli atau momen, format produk.
- Hasilkan 6-8 kandidat, daftar pendek 2-3.
- Tanpa bukti pasar: kandidat tetap dibuat, tetapi kolom bukti diisi "belum ada bukti" dan tidak diberi nilai.

## Pertanyaan bila info penting belum ada

1. "Dari ruangan yang Anda layani, mana yang didahulukan untuk niche ini?"
2. "Adakah subjek yang sangat Anda kuasai atau punya bahannya sendiri (foto, gambar)?"

## Langkah kerja

1. Tulis niche luas di puncak pohon.
2. Pecah dengan lima sumbu. Tiap sumbu 3-5 nilai yang diambil dari brief, profil studio, dan bukti, bukan dari daftar umum.
3. Gabungkan nilai antarsumbu menjadi kandidat micro-niche. Buang gabungan yang tidak punya pembeli yang bisa dibayangkan dengan jelas.
4. Tulis tiap kandidat dalam satu kalimat: untuk siapa, untuk ruangan apa, berupa apa.
5. Nilai tiap kandidat pada lima ukuran, masing-masing 0-2, hanya bila ada dasarnya:
   - Tanda permintaan (rujuk `bukti_id`).
   - Kelonggaran penawaran (rujuk `bukti_id` atau peta pesaing).
   - Kecocokan dengan estetika dan DNA studio.
   - Kemampuan produksi dengan alat dan waktu yang ada.
   - Keamanan hak (tidak bergantung pada karakter, merek, atau gaya seniman tertentu).
6. Susun daftar pendek dan jelaskan untung rugi tiap pilihan dalam dua kalimat.
7. Minta pemilik memilih; catat sebagai KEPUTUSAN.

## Aturan keputusan

- Ukuran tanpa bukti ditulis "belum ada bukti", tidak diberi nol dan tidak dijumlahkan seolah lengkap.
- Kandidat dengan keamanan hak 0 tidak masuk daftar pendek.
- Micro-niche harus cukup sempit untuk dikenali pembelinya dan cukup lebar untuk minimal satu koleksi 6 karya. Bila tidak bisa membayangkan 6 karya, terlalu sempit.
- Jangan menyebut sebuah niche "belum ada pesaing" atau "unik"; tulis "tidak terlihat pada amatan tanggal sekian".

## Format hasil

```
POHON NICHE: [niche luas]
Sumbu: subjek | gaya | ruangan | pembeli/momen | format

| Kandidat | Satu kalimat | Permintaan | Penawaran | Cocok studio | Produksi | Hak | Catatan bukti |

Daftar pendek:
1. ... untung: ... rugi: ...
KEPUTUSAN pemilik: (menunggu)
```

## Pemeriksaan kualitas

- Tiap nilai permintaan dan penawaran merujuk bukti atau bertuliskan "belum ada bukti".
- Kandidat berbeda satu sama lain pada minimal dua sumbu.
- Daftar pendek tidak melebihi tiga.

## Penanganan kesalahan

- Semua kandidat tanpa bukti: sampaikan terus terang, sarankan daftar pendek berdasarkan kecocokan studio saja dan tandai sebagai HIPOTESIS yang perlu diuji.
- Pemilik ingin semua niche sekaligus: ingatkan kapasitas mingguan, usulkan urutan.

## Serah terima

- `wall-art-buyer-room-profiler` untuk mendalami pembeli dan ruangan niche terpilih.
- `etsy-keyword-evidence-researcher` untuk bahasa pencarian niche terpilih.

## Batas kemampuan alat

Penilaian bergantung pada mutu bukti yang ada. Tidak bisa mengukur ukuran pasar sebuah niche.

## Contoh penggunaan

Niche luas "wall art hewan". Kandidat antara lain: satwa tropis ilustrasi vintage untuk kamar bayi; burung Nusantara gaya lukisan botani untuk ruang tamu; hewan abstrak garis untuk kantor rumah. Daftar pendek dua, yang pertama dipilih pemilik.

## Contoh kegagalan dan perbaikannya

Gagal: tabel memberi nilai permintaan 2 pada semua kandidat tanpa rujukan. Perbaikan: ganti dengan "belum ada bukti", kembalikan ke pengumpul bukti untuk dua kandidat teratas.

## Cara menguji skill ini

Beri niche "poster botani" tanpa file bukti. Hasil benar: pohon lima sumbu, 6-8 kandidat satu kalimat, kolom permintaan dan penawaran bertuliskan "belum ada bukti", daftar pendek paling banyak tiga, dan tidak ada kata "unik" atau "pasti".
