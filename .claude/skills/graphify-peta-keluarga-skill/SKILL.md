---
name: graphify-peta-keluarga-skill
description: Menggambar peta sebuah keluarga skill sebagai diagram Mermaid dan tabel ringkas, dari skill-index.json (kelompok sebagai subgraph, panah menyerahkan ke, panah putus-putus memakai layanan, pintu masuk dan layanan diberi warna) atau, bila tidak ada indeks, dari rujukan antarskill di SKILL.md berdasarkan awalan nama dengan skill yatim ditandai merah. Diagram tampil langsung di GitHub dan claude.ai. Pakai saat pengguna berkata "gambarkan keluarga skill saya", "diagram skill Etsy", "alur skill graphify seperti apa?", "buat ARSITEKTUR", atau saat menyusun dokumentasi keluarga skill. Jangan dipakai untuk peta seluruh perpustakaan yang bisa ditanya, itu tugas graphify-graph-skill.
---

# graphify-peta-keluarga-skill

Satu pemilik untuk diagram dan peta keluarga skill. Diagram membuat alur kerja keluarga terlihat dalam
satu layar dan memperlihatkan skill yang terputus.

Sebelum mulai, baca `references/graphify-core.md`.

Skrip skill ini: `scripts/diagram_keluarga.py` (dari akar repo: `.claude/skills/graphify-peta-keluarga-skill/scripts/diagram_keluarga.py`).

## Kapan digunakan

- Dokumentasi keluarga skill (README, ARSITEKTUR).
- Memeriksa apakah alur serah terima masuk akal.
- Melihat skill yatim dalam satu keluarga.

## Kapan tidak digunakan

- Graph seluruh perpustakaan yang bisa ditanya dan dicluster: `graphify-graph-skill`.
- Rujukan rusak: `graphify-cari-celah-skill`.

## Input

- Salah satu: path `skill-index.json`, atau awalan nama keluarga (contoh `etsy-`).
- Opsional: path keluaran Markdown.

## Default

- Dengan indeks: `python3 scripts/diagram_keluarga.py --indeks <path>`.
- Tanpa indeks: `python3 scripts/diagram_keluarga.py --awalan <awalan>`.

## Pertanyaan bila info penting belum ada

"Keluarga yang mana: graphify, Studio Wall Art, atau awalan lain?"

## Langkah kerja

1. Pilih mode (indeks bila ada, karena memuat serah terima resmi).
2. Jalankan skrip; tambahkan `--tulis <path>` bila hasil disimpan (misalnya di folder keluarga).
3. Periksa diagram: pintu masuk tidak menerima panah masuk dari skill keluarga, layanan tidak punya
   panah keluar, tidak ada skill yatim kecuali sengaja.
4. Diagram besar (lebih dari 40 skill): sarankan dipecah per kelompok agar terbaca.
5. Laporkan path hasil dan temuan (yatim, panah aneh).

## Aturan keputusan

- Mode indeks adalah sumber kebenaran; mode awalan hanya menunjukkan rujukan teks.
- Skill yatim di mode awalan perlu dicek di indeks sebelum disimpulkan terputus.

## Format hasil

```
# Peta keluarga: Keluarga Skill Graphify
33 skill: 1 pintu masuk, 6 layanan, 26 jalur.
(blok mermaid flowchart TD dengan subgraph A sampai F)
| Kelompok | Jumlah | Skill |
```

## Pemeriksaan kualitas

- Diagram tampil (sintaks Mermaid sah: id tanpa tanda hubung, label dalam tanda kutip).
- Jumlah simpul sama dengan jumlah skill di indeks.

## Penanganan kesalahan

- Indeks tidak bisa dibaca: skrip GAGAL dengan pesan; periksa JSON-nya.
- Awalan tanpa skill: skrip GAGAL dan menyebut awalannya; periksa ejaan.

## Serah terima

Skill ujung: Markdown diagram dikembalikan ke pengguna atau disimpan di path yang diminta.

## Batas kemampuan alat

Mermaid menata letak otomatis; keluarga sangat besar bisa padat. Warna hanya untuk pintu masuk,
layanan, dan yatim.

## Contoh penggunaan

`--indeks keluarga-graphify/skill-index.json --tulis keluarga-graphify/PETA-KELUARGA.md`: diagram 33
skill dalam enam kelompok, dirigen kuning, enam layanan hijau.

## Contoh kegagalan dan perbaikannya

Gagal: menyimpulkan `etsy-policy-fact-checker` terputus dari mode awalan `etsy-`, padahal ia layanan
yang dipakai lewat indeks Studio. Perbaikan: cek mode indeks sebelum menyimpulkan.

## Cara menguji skill ini

Buat indeks tiga skill (satu router, satu jalur dengan next, satu layanan). Hasil benar: subgraph
kelompok, panah tegas untuk next, panah putus-putus untuk uses, kelas router dan service.
