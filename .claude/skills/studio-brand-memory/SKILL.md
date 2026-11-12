---
name: studio-brand-memory
description: Menyimpan dan membacakan ingatan Studio Wall Art by Nangka dalam file, yaitu identitas, preferensi, keputusan, revisi, pelajaran, dan konteks proyek. Pakai saat pemilik berkata "ingat ini", "catat keputusan", "mulai sekarang selalu...", "saya tidak suka...", "apa yang sudah kita putuskan?", di akhir sesi kerja yang menghasilkan keputusan, atau saat skill lain perlu konteks studio. Jangan dipakai untuk menyimpan data pelanggan atau aturan Etsy.
---

# studio-brand-memory

Penjaga `studio-nangka/memori/brand-memory.md`. Karena model tidak mengingat percakapan lama, apa pun yang tidak ditulis di file ini akan hilang.

Sebelum mulai, baca `references/studio-core.md`. Template memori (sudah berisi profil awal studio): `assets/brand-memory-template.md`.

## Kapan digunakan

- Ada keputusan, preferensi, atau pelajaran baru.
- Pemilik bertanya apa yang sudah diputuskan.
- Awal sesi: skill lain butuh konteks studio.

## Kapan tidak digunakan

- Aturan visual terperinci (pemilik: `wall-art-visual-dna-builder`, file `visual-dna.md`).
- Data pesanan atau pesan pelanggan (folder `pelanggan/`).
- Biaya dan kebijakan Etsy (pemilik: `etsy-policy-fact-checker`).

## Input

- Wajib: hal yang akan dicatat atau pertanyaan tentang isi memori.
- Opsional: blok serah terima dari skill lain (field `decisions`).

## Default

- Memori belum ada: buat dari template.
- Keputusan dari skill lain dicatat sebagai "usulan" sampai pemilik menyetujui; ucapan langsung pemilik dicatat sebagai keputusan.

## Pertanyaan bila info penting belum ada

Hanya bila catatan baru bertentangan dengan catatan lama: "Sebelumnya tercatat [X] pada [tanggal]. Yang baru ini menggantikannya, atau berlaku untuk proyek ini saja?"

## Langkah kerja

1. Buka file memori. Bila tidak ada sistem file, minta pemilik menempelkannya.
2. Tentukan bagian yang tepat: Profil, Identitas, Preferensi, Catatan keputusan, Pelajaran, Proyek aktif.
3. Tulis catatan dalam satu baris: tanggal, isi, alasan singkat, asal (pemilik atau nama skill).
4. Bila menggantikan catatan lama, jangan hapus yang lama; beri tanda `(digantikan YYYY-MM-DD)`.
5. Simpan, lalu tampilkan baris yang ditambahkan dan path filenya. Tanpa sistem file, tampilkan file utuh versi baru dan katakan pemilik harus menyimpannya.
6. Untuk permintaan membaca: jawab dengan kutipan baris dan tanggalnya, bukan dari ingatan.

## Aturan keputusan

- Skill ini memiliki isi memori merek. Skill lain tidak menulis ke file ini.
- Catatan keputusan bersifat menambah, tidak menimpa, supaya riwayat alasan tetap ada.
- Yang dicatat: hal yang akan mengubah cara kerja di sesi berikutnya. Yang tidak dicatat: ringkasan pekerjaan selesai, status sementara, isi percakapan.
- Tidak ada nama, alamat, email, atau isi pesan pelanggan.
- Dugaan tentang selera pemilik ditulis sebagai "tafsiran", terpisah dari ucapan pemilik.

## Format hasil

```
MEMORI DIPERBARUI  studio-nangka/memori/brand-memory.md
Bagian   : Catatan keputusan
Ditambah : 2026-11-12 | Koleksi pertama bertema hewan tropis | alasan: paling dekat dengan selera pemilik | asal: pemilik
Diganti  : (tidak ada)
```

## Pemeriksaan kualitas

- Setiap baris baru bertanggal dan berasal jelas.
- Tidak ada pertentangan yang dibiarkan tanpa tanda.
- File tetap terbaca dalam dua menit; bila Catatan keputusan melewati 60 baris, pindahkan yang sudah digantikan ke bagian Arsip di bawah.

## Penanganan kesalahan

- File rusak atau formatnya berubah: jangan menimpa; salin isinya ke bagian yang benar dan tunjukkan perubahannya.
- Pemilik meminta menyimpan data pelanggan: tolak dengan alasan pemisahan data, arahkan ke folder `pelanggan/`.

## Serah terima

Skill layanan: mengembalikan konfirmasi ke skill pemanggil. `next_skill` diisi `null`.

## Batas kemampuan alat

Hanya bertahan bila file benar-benar disimpan (repositori, Drive, atau disimpan pemilik). Tidak ada ingatan otomatis antarpercakapan.

## Contoh penggunaan

Pemilik: "Ingat ya, saya tidak mau warna neon." Hasil: baris baru di Preferensi "2026-11-12 | Hindari warna neon | asal: pemilik", dan saran agar `wall-art-visual-dna-builder` memasukkannya ke daftar larangan.

## Contoh kegagalan dan perbaikannya

Gagal: menjawab "sudah saya ingat" tanpa menulis file. Perbaikan: tulis barisnya, sebut path, atau katakan terus terang bahwa lingkungan ini tidak bisa menyimpan dan berikan teks untuk disimpan pemilik.

## Cara menguji skill ini

1. Minta "catat: toko fokus kamar anak dulu". Hasil benar: satu baris bertanggal di Catatan keputusan, path file disebut.
2. Lalu minta "catat: toko fokus ruang tamu dulu". Hasil benar: skill bertanya apakah menggantikan, dan baris lama diberi tanda digantikan, bukan dihapus.
