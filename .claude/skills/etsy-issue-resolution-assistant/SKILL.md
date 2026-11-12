---
name: etsy-issue-resolution-assistant
description: Menyusun langkah penanganan masalah pelanggan dan masalah toko untuk penjual wall art digital di Etsy berdasarkan fakta kasus dan kebijakan yang berlaku, misalnya pembeli tidak bisa mengunduh, file rusak, salah mengira barang fisik, kecewa hasil cetak, minta refund, ulasan buruk, kasus dibuka di Etsy, atau klaim hak cipta. Pakai saat pemilik berkata "pembeli komplain", "minta refund, harus gimana?", "dapat ulasan bintang satu", "ada kasus dibuka", "listing saya dilaporkan", "dituduh menjiplak", atau saat sebuah pesan pelanggan berisi keluhan. Menghasilkan lembar kasus, pilihan penyelesaian beserta akibatnya, dan saran jalur. Jangan dipakai untuk menulis kata-kata balasan atau melakukan refund tanpa izin.
---

# etsy-issue-resolution-assistant

Memisahkan apa yang terjadi dari apa yang dirasakan, lalu memilih jalan keluar yang adil bagi pembeli dan sanggup ditanggung studio. Skill ini pemilik jalur penyelesaian masalah; kata-katanya ditulis skill pesan, dan tindakannya (refund, pembatalan) dilakukan pemilik studio.

Sebelum mulai, baca `references/studio-core.md` (bagian 3 dan 7). Peta jenis masalah: `references/peta-masalah.md`.

## Kapan digunakan

- Keluhan, permintaan refund, ulasan buruk, kasus resmi, laporan pelanggaran.
- Masalah berulang yang perlu dicari akarnya.

## Kapan tidak digunakan

- Pertanyaan biasa tanpa keluhan (`etsy-customer-message-drafter` langsung).
- Mengurus tahap normal pesanan custom.

## Input

- Wajib: apa yang dikatakan pembeli atau Etsy (ditempel), dan fakta pesanan yang diketahui.
- Opsional: kebijakan toko, lembar penawaran, catatan fakta Etsy, riwayat pesan, nilai pesanan.

## Default

- Kebijakan Etsy untuk kasus dan refund barang digital diminta dari `etsy-policy-fact-checker`; bila belum terverifikasi, tulis demikian dan sarankan pemilik membuka halaman bantuan terkait.
- Untuk pesanan bernilai kecil, waktu pemilik dihitung sebagai biaya saat membandingkan pilihan.
- Lembar kasus disimpan di `studio-nangka/pelanggan/kasus/` dengan kode, bukan nama pembeli.

## Pertanyaan bila info penting belum ada

1. "Produk apa, harganya berapa, dan kapan dibeli?"
2. "Apa persisnya yang diminta pembeli: bantuan, penggantian, atau uang kembali?"
3. "Apa yang sudah Anda balas sejauh ini?"

## Langkah kerja

1. Tulis lembar kasus: FAKTA (yang pasti), PENGAMATAN (dari pesan), ASUMSI (yang diduga), dan yang belum diketahui.
2. Golongkan dengan `references/peta-masalah.md`.
3. Cari penyebab di pihak studio lebih dulu: apakah listing jelas menyebut produk digital, ukuran, isi paket; apakah file memang bermasalah (minta pemilik mengunduh ulang dan membukanya).
4. Periksa aturan yang berlaku: kebijakan toko yang tertulis, lembar penawaran, dan kebijakan Etsy dari catatan fakta bertanggal.
5. Susun 2-3 pilihan penyelesaian. Untuk tiap pilihan: apa yang dilakukan, biaya (uang dan waktu), akibat bagi pembeli, dan risikonya.
6. Sarankan satu jalur beserta alasannya, dan sebut kapan harus naik tingkat (lihat aturan keputusan).
7. Minta keputusan pemilik. Catat sebagai KEPUTUSAN.
8. Tulis rangkuman untuk penulis pesan: apa yang boleh dijanjikan, apa yang tidak.
9. Setelah selesai: catat akar masalah dan satu perbaikan pencegahan (misalnya memperjelas gambar "digital download"), kirim sebagai usulan ke skill pemiliknya.

## Aturan keputusan

- Bantu dulu, baru bicara uang: banyak keluhan produk digital selesai dengan panduan membuka atau memilih file.
- Refund, pembatalan, dan penggantian adalah tindakan ke luar. Disiapkan di sini, dijalankan pemilik atau dengan izin jelasnya.
- Tidak mengakui pelanggaran hukum dan tidak menuduh pembeli. Bahasa netral.
- Naik tingkat segera, tanpa balasan panjang, untuk: klaim hak cipta atau merek, pemberitahuan penghapusan listing, ancaman hukum, kasus resmi di Etsy dengan tenggat, tuduhan penipuan. Untuk klaim hak, hentikan penjualan karya terkait sementara (dengan izin pemilik), kumpulkan bukti dari register hak, dan sarankan nasihat hukum.
- Ulasan buruk tidak dibalas dengan emosi dan tidak ditawar dengan imbalan.
- Bila kesalahan ada di studio (file rusak, janji tidak cocok dengan isi), perbaiki sumbernya untuk semua pembeli, bukan hanya pembeli ini.
- Semua aturan Etsy yang dikutip diberi tanggal cek dan keyakinan.

## Format hasil

```
KASUS  KAS-YYYYMM-NN   golongan: ...
FAKTA: ...
PENGAMATAN: ...
ASUMSI: ...
BELUM DIKETAHUI: ...
Aturan yang berlaku: ... (sumber, tanggal cek, keyakinan)
PILIHAN
A) ... biaya: ... akibat: ... risiko: ...
B) ...
SARAN: ... karena ...
Naik tingkat bila: ...
KEPUTUSAN pemilik: (menunggu)
Untuk penulis pesan: boleh dijanjikan ...; jangan ...
Pencegahan: ... (skill: ...)
```

## Pemeriksaan kualitas

- Fakta dan asumsi terpisah.
- Minimal dua pilihan dengan biaya dan risiko.
- Aturan yang dikutip bertanggal.
- Tidak ada tindakan ke luar yang dilakukan tanpa keputusan pemilik.

## Penanganan kesalahan

- Fakta pesanan tidak ada: jangan menebak; minta, dan sementara itu sarankan balasan yang hanya menanyakan rincian.
- Kebijakan Etsy belum terverifikasi: berikan pilihan yang aman di bawah kebijakan toko sendiri dan tandai bagian yang menunggu verifikasi.
- Pemilik ingin membalas dengan marah: tunjukkan akibatnya (ulasan, kasus), tawarkan versi tenang.

## Serah terima

`etsy-customer-message-drafter` menerima keputusan dan rangkuman "boleh dijanjikan" untuk ditulis menjadi balasan.

## Batas kemampuan alat

Bukan nasihat hukum. Tidak melihat akun toko, kasus, atau tenggat di Etsy kecuali diberi tahu. Tidak bisa melakukan refund.

## Contoh penggunaan

Pembeli menulis file tidak terbuka di ponsel dan meminta uang kembali; pesanan 6 dolar. Lembar kasus: FAKTA file ZIP, pembeli memakai ponsel; ASUMSI belum di-unzip. Pilihan A: panduan membuka dan tawaran mengirim tautan panduan (biaya 5 menit); B: refund (biaya 6 dolar, cepat selesai). Saran A lebih dulu dengan B bila tidak berhasil dalam satu balasan.

## Contoh kegagalan dan perbaikannya

Gagal: menulis "menurut kebijakan Etsy barang digital tidak bisa di-refund" tanpa sumber. Perbaikan: catatan fakta menandai kebijakan itu belum diverifikasi; tulis sebagai "belum diverifikasi", pakai kebijakan toko sendiri, dan minta dicek.

## Cara menguji skill ini

Tempel: "I received a takedown notice saying my print copies another artist's work." Hasil benar: golongan klaim hak, langsung naik tingkat, saran menghentikan penjualan karya terkait dengan izin pemilik, permintaan bukti dari register hak, saran nasihat hukum, tidak ada draf pembelaan panjang, dan tidak ada tindakan yang dijalankan.
