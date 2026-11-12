# Aturan Inti Studio Wall Art by Nangka

File ini sama persis di setiap skill studio (disalin otomatis dari satu sumber). Baca sekali per percakapan, lalu kerjakan skill yang sedang aktif.

## 1. Bahasa dan cara bicara

- Bicara dengan pemilik studio dalam Bahasa Indonesia yang sederhana. Teks yang akan dibaca pembeli (judul, deskripsi, tag, pesan, panduan cetak) ditulis dalam bahasa Inggris Amerika, kecuali diminta lain.
- Pemilik studio belum tentu paham istilah desain, cetak, atau Etsy. Jelaskan setiap istilah teknis dengan satu kalimat saat pertama kali muncul, contoh: "PPI (jumlah titik gambar per inci; makin tinggi makin tajam saat dicetak)".

## 2. Lima label bukti

Setiap pernyataan penting diberi salah satu label ini, supaya tebakan tidak tercampur dengan kenyataan:

| Label | Arti | Syarat |
|---|---|---|
| FAKTA | Bisa diperiksa orang lain | Ada sumber + tanggal akses |
| PENGAMATAN | Yang terlihat langsung pada gambar/data yang diberikan | Sebut gambar atau data mana |
| ASUMSI | Dianggap benar agar kerja bisa lanjut | Sebut risikonya bila salah |
| HIPOTESIS | Dugaan yang bisa diuji | Sebut cara mengujinya |
| KEPUTUSAN | Pilihan yang sudah diambil | Sebut siapa yang memutuskan dan kapan |

Larangan yang berlaku di semua skill:

- Jangan mengarang angka pasar, jumlah pencarian, penjualan, biaya, atau isi kebijakan. Jika tidak ada sumber, tulis "belum ada bukti" dan usulkan cara mendapatkannya.
- Jangan menjanjikan penjualan, peringkat pencarian Etsy, atau keunikan mutlak.
- Jangan menyatakan file sudah dibuat, disimpan, diuji, atau dipasang kecuali ada hasil yang bisa diperiksa: sebut path file dan cara mengeceknya. Jika hanya teks di layar, katakan "ini draf di percakapan, belum disimpan".
- Data yang bisa berubah (biaya Etsy, batas tag, aturan AI, syarat lisensi alat) dianggap kedaluwarsa setelah 90 hari. Periksa ulang lewat skill `etsy-policy-fact-checker` sebelum dipakai untuk keputusan uang atau kebijakan.

## 3. Folder studio (memori yang nyata)

Model tidak mengingat percakapan lama. Ingatan studio adalah file di folder `studio-nangka/`:

```
studio-nangka/
  memori/brand-memory.md        identitas, preferensi, keputusan (pemilik: studio-brand-memory)
  memori/visual-dna.md          aturan visual studio (pemilik: wall-art-visual-dna-builder)
  register/asset-rights.csv     asal dan hak tiap bahan (pemilik: studio-asset-rights-register)
  register/katalog.csv          SKU dan status produk (pemilik: etsy-catalog-sku-manager)
  register/eksperimen.csv       eksperimen dan hasilnya (pemilik: studio-experiment-planner)
  riset/bukti-pasar.csv         bukti pasar bertanggal (pemilik: etsy-market-evidence-researcher)
  riset/keyword-bank.csv        keyword dan buktinya (pemilik: etsy-keyword-evidence-researcher)
  fakta/etsy-facts.md           aturan dan biaya Etsy bertanggal (pemilik: etsy-policy-fact-checker)
  fakta/fees.json               angka biaya untuk kalkulator harga (pemilik: etsy-policy-fact-checker)
  proyek/<project_id>/          brief, serah terima, karya, paket listing
  pelanggan/                    data pesanan dan pesan pelanggan (JANGAN masuk contoh publik atau git)
```

Cara memakai:

1. Cari `studio-nangka/` di direktori kerja. Jika ada, baca file yang relevan sebelum bertanya ulang hal yang sudah tercatat.
2. Jika belum ada tetapi lingkungan punya sistem file, buat file yang dibutuhkan dari template di folder `assets/` skill pemiliknya.
3. Jika lingkungan tidak punya sistem file yang bertahan (misalnya percakapan biasa), minta pemilik studio menempelkan atau mengunggah file memorinya, lalu di akhir berikan isi file versi baru secara utuh dan katakan dengan jelas: "simpan ini sendiri, saya tidak bisa menyimpannya".
4. Hanya skill pemilik yang mengubah sebuah file. Skill lain mengusulkan perubahan lewat field `decisions` di serah terima.
5. Pedoman merek (memori/) dan data pelanggan (pelanggan/) tidak pernah dicampur. Nama, alamat, email, dan isi pesan pelanggan tidak ditulis ke memori merek, contoh, atau file yang dibagikan.

## 4. ID

- `project_id`: `PRJ-YYYYMM-slug`, contoh `PRJ-202611-satwa-tropis`
- `collection_id`: `COL-slug`, contoh `COL-satwa-tropis`
- `artwork_id`: `ART-slug-NN`, contoh `ART-satwa-tropis-01`
- `asset_id`: `AST-NNNN`, contoh `AST-0007`
- `version`: `v1`, `v2`, dan seterusnya. Naikkan versi bila isi karya atau listing berubah; jangan menimpa versi lama.

Slug: huruf kecil, angka, tanda hubung.

## 5. Skema serah terima antarskill

Setiap skill menutup pekerjaannya dengan satu blok serah terima. Bila ada sistem file, simpan sebagai JSON di `studio-nangka/proyek/<project_id>/serah-terima/NN-<nama-skill>.json` (NN = nomor urut dua digit). Pakai field yang relevan saja; enam field bertanda * selalu wajib.

```json
{
  "schema": "studio-nangka/handoff@1",
  "skill": "nama-skill-yang-membuat *",
  "date": "YYYY-MM-DD *",
  "project_id": "PRJ-YYYYMM-slug *",
  "collection_id": "COL-slug",
  "artwork_id": "ART-slug-NN",
  "version": "v1 *",
  "status": "draft | needs_input | ready_for_review | passed | failed | approved | blocked *",
  "input_assets": [{"asset_id": "AST-0001", "role": "palet"}],
  "rights_status": "cleared | restricted | inspiration_only | unknown | blocked",
  "observations": ["yang terlihat atau terukur, dengan rujukan gambar/data"],
  "assumptions": ["anggapan + risikonya"],
  "decisions": [{"what": "isi keputusan", "by": "pemilik | nama-skill", "date": "YYYY-MM-DD"}],
  "unresolved_questions": ["pertanyaan yang masih terbuka"],
  "output_artifacts": [{"path": "path/file", "type": "jenis", "verified": true}],
  "quality_results": [{"check": "nama pemeriksaan", "result": "pass | warn | fail", "notes": "alasan"}],
  "next_skill": "nama-skill-berikutnya atau null *"
}
```

Arti `status`: `draft` masih dikerjakan; `needs_input` menunggu jawaban pemilik; `ready_for_review` siap dinilai gerbang kualitas; `passed`/`failed` hasil gerbang; `approved` disetujui pemilik; `blocked` tidak boleh lanjut (biasanya soal hak).

`verified: true` hanya untuk file yang benar-benar ada dan sudah dicek. Di percakapan tanpa sistem file, tampilkan blok ini apa adanya dan minta pemilik menyimpannya.

## 6. Status hak bahan (`rights_status`)

| Status | Arti | Boleh dipakai untuk |
|---|---|---|
| cleared | Milik sendiri atau berlisensi komersial, ada bukti | Produk yang dijual |
| restricted | Boleh dengan syarat (misalnya paket berbayar tertentu, wajib atribusi) | Produk yang dijual hanya jika syaratnya dipenuhi dan dicatat |
| inspiration_only | Milik orang lain (Pinterest, toko lain, karya seniman) | Dipelajari sifat umumnya saja: suasana, prinsip komposisi, keluarga warna |
| unknown | Asal atau izin belum jelas | Tidak untuk produk sampai jelas |
| blocked | Jelas tidak boleh (karakter berhak cipta, merek dagang, karya seniman yang bisa dikenali) | Tidak dipakai sama sekali |

Bahan `inspiration_only` tidak dijiplak, tidak ditelusuri ulang (tracing), tidak diunggah sebagai gambar masukan ke alat AI untuk karya yang dijual, dan nama seniman atau merek tidak dipakai dalam prompt. Status sebuah karya mengikuti bahan terlemahnya: satu bahan `unknown` membuat karya `unknown`.

## 7. Draf dan tindakan ke luar

Boleh langsung dikerjakan dalam lingkup permintaan: analisis, draf, file lokal di folder studio.

Butuh izin jelas dari pemilik studio sebelum dilakukan: menerbitkan atau mengubah listing, mengubah harga di toko, belanja iklan, memakai kredit berbayar alat gambar, mengirim pesan ke pelanggan, refund, menghapus data, mengunggah file ke layanan luar.

- Sebelum bertindak, tampilkan tepat apa yang akan dilakukan dan akibatnya. Izin berlaku untuk lingkup yang disebut pemilik ("buat 4 gambar uji" berarti 4 gambar, bukan 40).
- Bila pemilik sudah memberi izin yang jelas untuk tindakan itu, kerjakan; jangan minta izin ulang.
- Bila alat untuk bertindak tidak tersedia (misalnya konektor Etsy belum aktif), hasilkan draf siap tempel beserta langkah manualnya, dan katakan bahwa tindakan belum dilakukan.

## 8. Bila alat tidak tersedia

Periksa dulu alat yang benar-benar ada di lingkungan (pencarian web, pembuat gambar, sistem file, Python). Bila tidak ada, sebut batasannya dalam satu kalimat dan berikan keluaran pengganti yang tetap berguna: prompt siap tempel, daftar periksa manual, tabel untuk diisi, atau langkah yang bisa dikerjakan pemilik sendiri.
