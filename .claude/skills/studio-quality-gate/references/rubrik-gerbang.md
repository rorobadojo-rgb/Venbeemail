# Rubrik Gerbang G1-G4

Nilai tiap butir: `pass`, `warn`, atau `fail`, dengan alasan yang menunjuk bukti.
G5 (listing siap terbit) tidak ada di sini; pemiliknya `etsy-listing-preflight-reviewer`.

## G1 - Brief

| Butir | Jenis | Lulus bila | Diperbaiki oleh |
|---|---|---|---|
| Lima inti terisi | WAJIB | Pembeli, ruangan, tema, jenis produk, jumlah karya ada | studio-brief-interviewer |
| Label bukti | WAJIB | Tiap baris berlabel KEPUTUSAN, ASUMSI, atau HIPOTESIS | studio-brief-interviewer |
| Tanpa angka karangan | WAJIB | Tidak ada angka pasar tanpa sumber | studio-brief-interviewer |
| Tema tidak menabrak hak | WAJIB | Tidak ada karakter, merek, atau tokoh terkenal | studio-asset-rights-register |
| Muat di kapasitas | SARAN | Jumlah karya dan tenggat sesuai jam kerja mingguan | studio-brief-interviewer |
| Bahan terdaftar | SARAN | Semua bahan yang disebut ada di register hak | studio-asset-rights-register |

## G2 - Konsep

| Butir | Jenis | Lulus bila | Diperbaiki oleh |
|---|---|---|---|
| Menjawab brief | WAJIB | Ruangan, tema, dan suasana sesuai brief | wall-art-concept-divergence |
| Arah benar-benar berbeda | WAJIB | Minimal tiga arah berbeda pada dua sumbu atau lebih | wall-art-concept-divergence |
| Peran referensi jelas | WAJIB | Tiap referensi punya satu peran; tidak ada yang disalin utuh | wall-art-reference-fusion-director |
| Sesuai DNA visual | WAJIB bila `visual-dna.md` ada | Tidak melanggar aturan tetap dan larangan DNA | wall-art-visual-dna-builder |
| Komposisi tahan crop | SARAN | Titik fokus berada di zona aman semua rasio yang direncanakan | wall-art-composition-director |
| Pemilik sudah memilih | WAJIB | Ada KEPUTUSAN pemilik atas arah yang dipakai | wall-art-concept-divergence |

## G3 - Gambar master

| Butir | Jenis | Lulus bila | Diperbaiki oleh |
|---|---|---|---|
| Hak bahan | WAJIB | `rights_status` cleared, atau restricted dengan syarat tercatat terpenuhi | studio-asset-rights-register |
| Bebas cacat berat | WAJIB | Laporan cacat tidak memuat temuan tingkat "berat" yang belum diperbaiki | wall-art-artifact-retouch-reviewer |
| Tanpa teks, tanda tangan, atau tanda air nyasar | WAJIB | Tidak ada huruf acak, logo, atau tanda air | wall-art-artifact-retouch-reviewer |
| Sesuai komposisi | WAJIB | Titik fokus dan ruang kosong sesuai rancangan | wall-art-composition-director |
| Konsisten gaya | WAJIB bila `visual-dna.md` ada | Hasil pemeriksa gaya "sesuai" atau "sesuai dengan catatan" | wall-art-style-consistency-reviewer |
| Ukuran pixel tercatat | WAJIB | Lebar x tinggi pixel master diketahui dan ditulis | wall-art-image-prompt-engineer |
| Catatan generasi lengkap | SARAN | Alat, model, prompt, tanggal, dan paket tercatat | wall-art-image-prompt-engineer |
| Cacat ringan | SARAN | Temuan ringan sudah diperbaiki atau diterima pemilik | wall-art-artifact-retouch-reviewer |

## G4 - Paket cetak

| Butir | Jenis | Lulus bila | Diperbaiki oleh |
|---|---|---|---|
| Semua rasio yang dijanjikan ada | WAJIB | File untuk tiap rasio dalam rencana produk tersedia | wall-art-color-export-manager |
| Pixel cukup | WAJIB | Tiap file memenuhi target PPI pada ukuran cetak terbesar yang diklaim | wall-art-ratio-resolution-planner |
| Tidak ada bagian penting terpotong | WAJIB | Titik fokus utuh di semua rasio | wall-art-ratio-resolution-planner |
| Batas file toko | WAJIB | Jumlah dan ukuran file sesuai batas di `fakta/etsy-facts.md` | wall-art-download-package-builder |
| Nama file jelas | WAJIB | Nama memuat rasio dan ukuran terbesar, tanpa spasi atau karakter aneh | wall-art-download-package-builder |
| Manifest ada | WAJIB | Manifest paket dibuat skrip, bukan ditulis tangan | wall-art-download-package-builder |
| Warna | SARAN | sRGB, tanpa pergeseran warna terlihat dibanding master | wall-art-color-export-manager |
| File dibuka ulang | SARAN | Tiap file berhasil dibuka dan ukurannya dibaca ulang | wall-art-download-package-builder |
