# Pola pertanyaan ke graph dokumen

| Jenis pertanyaan | Perintah | Contoh |
|---|---|---|
| Topik umum | `graphify query "<kata kunci>" --graph G` | `graphify query "harga paket pro" --graph G` |
| Isi satu bagian | `graphify section "<judul>" --graph G` | `graphify section "Kuota Kotak Masuk" --graph G` |
| Judul sama di banyak berkas | `graphify section "<berkas>#<judul>" --graph G` | `graphify section "docs/pro/prd.md#Ringkasan" --graph G` |
| Satu konsep dan hubungannya | `graphify explain "<konsep>" --graph G` | `graphify explain "Onboarding" --graph G` |
| Hubungan dua hal | `graphify path "<A>" "<B>" --graph G` | `graphify path "Paket Pro" "Kong" --graph G` |
| Dari titik tertentu | `graphify query "<q>" --seed "<node>" --graph G` | |
| Alur panjang | `graphify query "<q>" --dfs --graph G` | |
| Jawaban terpotong | tambah `--budget 4000` atau `--depth 3` | |

Kode keluar: 0 ada jawaban, 3 nama ambigu (kandidat dicetak), 4 tidak ditemukan.

Tips kata kunci:

1. Pakai istilah persis seperti di dokumen (judul bagian, nama fitur).
2. Dokumen campuran Indonesia-Inggris: coba kedua bahasa bila hasil kosong.
3. Kalimat panjang tidak lebih baik; dua sampai empat kata kunci paling stabil.
