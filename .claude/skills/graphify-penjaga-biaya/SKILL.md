---
name: graphify-penjaga-biaya
description: Penjaga biaya dan privasi graphify. Memperkirakan token dan isi yang akan dibaca model sebelum pass semantik, lalu meminta izin pengguna sebelum dokumen, PDF, gambar, atau transkrip dibaca model, sebelum isi file dikirim ke backend API (Gemini, Claude, OpenAI, Kimi, DeepSeek), sebelum graphify add mengambil URL, dan sebelum graph dikirim ke Neo4j, FalkorDB, atau server MCP HTTP. Pakai saat pengguna bertanya "mahal tidak?", "berapa token?", "aman tidak dikirim ke API?", "boleh pakai mode deep?", atau saat skill build dokumen atau lengkap akan berjalan. Skrip memakai detect() graphify sehingga daftar file sama dengan build sungguhan. Jangan dipakai untuk membangun graph, itu tugas skill build, atau untuk memilih isi korpus, itu tugas graphify-rencana-korpus.
---

# graphify-penjaga-biaya

Satu pemilik untuk izin memakai token dan mengirim isi ke layanan luar. Kode dibaca gratis dan
lokal; semua selain itu punya harga atau risiko privasi, dan pengguna harus tahu sebelumnya.

Sebelum mulai, baca `references/graphify-core.md`, terutama bagian 7.

Skrip skill ini: `scripts/perkiraan_biaya.py` (dari akar repo: `.claude/skills/graphify-penjaga-biaya/scripts/perkiraan_biaya.py`).

## Kapan digunakan

- Sebelum `/graphify <path>` tanpa `--code-only`, `graphify extract` dengan backend, `--mode deep`.
- Sebelum `graphify add <url>`, `graphify export neo4j --push`, `graphify export falkordb --push`,
  atau `graphify-mcp --transport http`.
- Pengguna menanyakan biaya atau keamanan data.

## Kapan tidak digunakan

- Build kode saja (`--code-only`): gratis dan lokal, tidak perlu izin biaya.
- Memilih folder mana yang masuk graph: `graphify-rencana-korpus`.

## Input

- Wajib: folder yang akan dibangun graph-nya, atau jenis tindakan keluar (push, add, MCP HTTP).
- Opsional: harga per sejuta token (USD) bila memakai backend API.

## Default

- `python3 scripts/perkiraan_biaya.py <folder>` (memakai `detect()` graphify bila CLI ada).
- Token per gambar 1.500 dan rasio keluaran 0,25 (keduanya ASUMSI, bisa diubah lewat opsi).
- Lewat skill resmi `/graphify`, token dipakai dari sesi Claude; lewat `graphify extract` dengan
  backend, isi file dikirim ke penyedia dan ditagih di akun API.

## Pertanyaan bila info penting belum ada

Satu pertanyaan izin, selalu dengan angka dari skrip:
"Pass semantik akan membaca 5 dokumen, 0 gambar, dan 0 media; perkiraan ±81.060 token. Lanjut,
persempit folder, atau kode saja?"

## Langkah kerja

1. Jalankan `scripts/perkiraan_biaya.py <folder>` (tambahkan `--harga-per-juta` bila backend API).
2. Baca tabel: jumlah dokumen, PDF, gambar, media, token masukan dan keluaran, folder penyumbang terbesar.
3. Bila `file_sensitif_dilewati` lebih dari 0, laporkan; itu tanda ada data rahasia di folder.
4. Ajukan pertanyaan izin. Tawarkan penyempitan dengan folder penyumbang terbesar sebagai contoh.
5. Untuk tindakan keluar (push, add, MCP HTTP), sebut tujuan (host), apa yang dikirim, dan siapa
   yang bisa membacanya; minta izin eksplisit.
6. Catat jawaban sebagai KEPUTUSAN (siapa, kapan, angka) di serah terima.

## Aturan keputusan

- Tidak ada izin, tidak ada pass semantik; tawarkan build kode sebagai jalan aman.
- Izin berlaku untuk angka yang ditanyakan. Bila lingkup bertambah lebih dari 25%, tanya lagi.
- Backend API untuk data berisi informasi pribadi atau rahasia: tolak, sarankan Ollama lokal
  (`--backend ollama`) atau kode saja.
- `GRAPHIFY_BACKEND=none` dipakai untuk memastikan tidak ada LLM yang terpanggil.

## Format hasil

```
PERKIRAAN BIAYA (ASUMSI)  folder: docs
| Jenis | File | Masuk pass semantik? | Perkiraan token |
| Dokumen | 5 | ya | 64.848 |
Token masukan ±64.848, keluaran ±16.212, total ±81.060
KEPUTUSAN: pengguna setuju 2026-11-19, batas 81 ribu token
```

## Pemeriksaan kualitas

- Semua angka berlabel ASUMSI dan berasal dari skrip.
- Pertanyaan izin menyebut jumlah file dan token, bukan sekadar "boleh?".

## Penanganan kesalahan

- CLI tidak ada: skrip memakai pemindai kasar (metode tercantum di keluaran); katakan bahwa angka
  lebih kasar dan daftar file bisa sedikit berbeda.
- PDF hasil pindai (gambar): token sesungguhnya bisa jauh berbeda; sebutkan risikonya.

## Serah terima

Skill layanan: mengembalikan perkiraan dan KEPUTUSAN izin ke skill pemanggil. Tanpa izin, status
`gagal` dengan alasan "izin biaya tidak diberikan".

## Batas kemampuan alat

Perkiraan, bukan tagihan. Tidak tahu harga model sesi Claude. Tidak menghitung durasi video
(transkripsi lokal tidak memakai token, tetapi transkripnya ikut pass semantik).

## Contoh penggunaan

Pengguna: "graph-kan semua dokumen repo". Skrip: 165 dokumen, ±325 ribu token; penyumbang terbesar
`.claude` (±132 ribu). Pengguna memilih persempit ke `docs/` (±81 ribu) dan setuju.

## Contoh kegagalan dan perbaikannya

Gagal: menjalankan `graphify extract . --backend gemini` atas folder berisi data pelanggan karena
"cuma kode". Perbaikan: tindakan keluar selalu dicek di sini; folder sensitif ditolak untuk backend API.

## Cara menguji skill ini

Minta build lengkap atas folder berisi 1 dokumen 1.000 kata dan 3 gambar. Hasil benar: ±1.350 token
dokumen, 4.500 token gambar, pertanyaan izin dengan angka, dan tidak ada build yang berjalan sebelum dijawab.
