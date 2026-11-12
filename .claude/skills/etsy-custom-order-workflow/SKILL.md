---
name: etsy-custom-order-workflow
description: Mengatur jalannya satu pesanan custom wall art dari awal sampai selesai, yaitu kelengkapan input pembeli, pembuatan proof, putaran revisi, persetujuan tertulis, penyerahan file, dan penutupan, sesuai spesifikasi produk custom studio. Pakai saat pemilik berkata "ada pesanan custom masuk", "pembeli minta revisi lagi", "sudah revisi berapa kali?", "pembeli belum balas", "kirim proof", "pesanan ini sudah sampai mana?", atau saat sebuah pesanan personalisasi sedang berjalan. Menghasilkan kartu pesanan dengan status, tenggat, dan langkah berikutnya. Jangan dipakai untuk merancang produk custom baru atau memutuskan refund.
---

# etsy-custom-order-workflow

Menjaga tiap pesanan custom tetap di rel: input lengkap dulu, satu proof, revisi sesuai jatah, persetujuan tertulis, baru file akhir. Skill ini pemilik tahap dan status pesanan custom.

Sebelum mulai, baca `references/studio-core.md` (bagian 3: data pelanggan hanya di folder `pelanggan/`). Kartu pesanan: `assets/kartu-pesanan-custom.md`.

## Kapan digunakan

- Pesanan custom baru masuk.
- Ada perkembangan: input datang, proof siap, revisi diminta, pembeli diam.
- Menutup pesanan.

## Kapan tidak digunakan

- Produk custom belum punya spesifikasi (`wall-art-personalization-designer` dulu).
- Sengketa, refund, atau pembatalan bermasalah (`etsy-issue-resolution-assistant`).

## Input

- Wajib: spesifikasi produk custom yang berlaku, dan keadaan pesanan (apa yang dipesan, input yang sudah diterima).
- Opsional: kartu pesanan yang sudah ada, pesan terakhir pembeli, tanggal hari ini.

## Default

- Tahap: `diterima`, `menunggu_input`, `dikerjakan`, `proof_dikirim`, `revisi`, `disetujui`, `diserahkan`, `selesai`, `dibatalkan`.
- Jatah proof, revisi, dan tenggat diambil dari spesifikasi produk, tidak dari kebiasaan.
- Kartu disimpan di `studio-nangka/pelanggan/pesanan/<kode-pesanan>.md` dengan kode buatan studio, bukan nama pembeli.

## Pertanyaan bila info penting belum ada

1. "Produk custom mana yang dipesan, dan input apa yang sudah diberikan pembeli?"
2. "Sudah berapa proof dan revisi yang dikirim?" (bila kartu belum ada)

## Langkah kerja

1. Buka atau buat kartu pesanan. Beri kode `CUS-YYYYMM-NN`.
2. Cocokkan input pembeli dengan tabel input di spesifikasi: lengkap, dalam batas, dan tidak termasuk daftar yang ditolak.
3. Bila input kurang atau di luar batas: tahap `menunggu_input`; siapkan permintaan pelengkap lewat penulis pesan.
4. Bila lengkap: tahap `dikerjakan`; hitung tenggat proof dari tanggal input lengkap, dalam hari kerja sesuai spesifikasi.
5. Proof: periksa ejaan dan angka terhadap input, huruf demi huruf, sebelum dikirim. Proof diberi tanda air ringan atau ukuran kecil. Tahap `proof_dikirim`.
6. Permintaan revisi: nilai apakah termasuk revisi kecil menurut spesifikasi; kurangi jatah; catat. Di luar jatah atau di luar definisi: sampaikan pilihan sesuai spesifikasi (revisi tambahan berbayar atau ditolak).
7. Persetujuan: harus berupa kalimat tertulis dari pembeli yang jelas menyetujui proof terakhir. Catat tanggal dan kutipan singkatnya di kartu.
8. Produksi file akhir lewat jalur produksi studio (rasio, ekspor, paket), lalu serahkan dengan cara yang tercantum di spesifikasi. Tahap `diserahkan`, lalu `selesai` setelah pembeli mengonfirmasi atau batas waktu lewat.
9. Penutupan: jadwalkan penghapusan foto dan input pribadi sesuai spesifikasi; catat tanggal hapus di kartu.
10. Tiap perubahan tahap: perbarui kartu, tulis langkah berikut dan tenggatnya.

## Aturan keputusan

- Tidak ada pekerjaan dimulai sebelum input lengkap.
- Tidak ada file akhir tanpa persetujuan tertulis.
- Jatah revisi dihitung, bukan dirasa. Kartu adalah sumber kebenarannya.
- Permintaan yang masuk daftar ditolak (karakter, logo, tokoh, foto bukan milik pembeli) ditolak sopan sejak tahap input.
- Pembeli diam melewati batas tunggu: kirim satu pengingat; setelah batas kedua, ikuti aturan spesifikasi. Jangan menutup atau membatalkan sendiri tanpa keputusan pemilik.
- Pesan ke pembeli selalu berupa draf sampai pemilik mengirim atau mengizinkan.
- Kartu memuat seperlunya saja: tanpa alamat, tanpa email.

## Format hasil

```
PESANAN CUS-......  produk: ...
Tahap: ...  (sejak tanggal ..)
Input: lengkap / kurang: ...
Proof terkirim: .. dari ..   Revisi terpakai: .. dari ..
Tenggat berikut: .. (apa)
Langkah berikut: ... (siapa)
Draf pesan yang dibutuhkan: ...
```

## Pemeriksaan kualitas

- Tahap, jatah, dan tenggat sesuai spesifikasi dan kartu.
- Ejaan pada proof dicocokkan dengan input.
- Persetujuan tercatat sebelum tahap `diserahkan`.
- Tidak ada data pribadi di luar folder `pelanggan/`.

## Penanganan kesalahan

- Spesifikasi tidak ada: jangan mengarang aturan; hentikan dan minta spesifikasi dibuat.
- Kartu hilang: susun ulang dari riwayat pesan yang ditempel pemilik, tandai bagian yang tidak pasti.
- Pembeli menyetujui lalu meminta perubahan setelah file akhir: perlakukan sebagai revisi di luar jatah sesuai spesifikasi.
- Pembeli marah atau meminta refund: pindahkan ke penanganan masalah, tahap pesanan dibekukan.

## Serah terima

`etsy-customer-message-drafter` menulis tiap pesan yang dibutuhkan pada tahap berjalan (permintaan input, pengantar proof, pengingat, penyerahan).

## Batas kemampuan alat

Tidak membaca pesanan atau pesan dari Etsy secara langsung. Tenggat dihitung dari tanggal yang diberikan; hari libur nasional tidak diketahui kecuali disebut.

## Contoh penggunaan

Pesanan nama anak di cetakan satwa. Input "Aurelia Putri" (13 karakter, batas 12). Tahap `menunggu_input`; draf pesan menawarkan "Aurelia" atau dua baris sesuai spesifikasi. Setelah dijawab: `dikerjakan`, tenggat proof 3 hari kerja.

## Contoh kegagalan dan perbaikannya

Gagal: file akhir dikirim karena pembeli memberi tanda suka pada proof. Perbaikan: tanda suka bukan persetujuan tertulis; minta kalimat persetujuan, catat, baru serahkan.

## Cara menguji skill ini

Beri spesifikasi (1 proof, 1 revisi kecil) dan keadaan "proof sudah dikirim, pembeli minta ganti warna latar dan ejaan nama untuk kedua kalinya". Hasil benar: kartu menunjukkan revisi terpakai 1 dari 1, permintaan kedua dinilai di luar jatah, pilihan sesuai spesifikasi disiapkan sebagai draf pesan, dan tahap tidak berpindah ke `disetujui`.
