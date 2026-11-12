# Catatan Kreatif: ART-satwa-tropis-01

Gabungan hasil empat skill untuk karya contoh. Di proyek nyata tiap bagian disimpan sebagai keluaran skillnya.

## Rencana koleksi (wall-art-series-collection-builder)

Gagasan: enam satwa halaman tropis, tiap satu digambar sebagai bentuk membulat yang tenang di atas kertas gading.

Pengikat: (1) latar gading bertekstur kertas halus, (2) garis dan detail cokelat tua, (3) palet lima warna yang sama.

| artwork_id | Judul kerja | Subjek | Susunan | Aksen | Arah hadap | Peran |
|---|---|---|---|---|---|---|
| ART-satwa-tropis-01 | Kutilang di dahan | burung | memusat rendah | kuning kunyit | kanan | utama |
| ART-satwa-tropis-02 | Kupu-kupu | serangga | melayang atas | terakota | kiri | set |
| ART-satwa-tropis-03 | Katak pohon | amfibi | menempel sisi | hijau zaitun | kanan | set |
| ART-satwa-tropis-04 | Tokek | reptil | diagonal | terakota | kiri | set |
| ART-satwa-tropis-05 | Capung | serangga | pola kecil berulang | kuning kunyit | campur | pelengkap |
| ART-satwa-tropis-06 | Siput | moluska | tepi bawah | hijau zaitun | kanan | pelengkap |

Hanya karya 01 yang dikerjakan dalam contoh ini.

## Arah konsep karya 01 (wall-art-concept-divergence)

Sumbu pembeda: jenis susunan, perlakuan subjek, skala.

| Arah | Susunan | Perlakuan | Skala |
|---|---|---|---|
| 1. Kutilang di dahan (aman) | memusat rendah | bentuk sederhana utuh | sedang |
| 2. Mata kecil di balik daun (berani) | potongan dekat | sebagian tersembunyi | besar |
| 3. Barisan tiga (hening) | pola berulang | siluet | kecil |
| 4. Siluet senja (tak terduga) | tepi bawah | dua warna, hampir abstrak | sedang |

Saran: arah 1 sebagai karya utama karena paling jelas terbaca sebagai thumbnail.
KEPUTUSAN: arah 1 dipakai untuk contoh (default; di proyek nyata menunggu pemilik).

## Rancangan komposisi (wall-art-composition-director)

- Orientasi dan rasio master: tegak, 2:3
- Titik fokus: petak tengah-bawah (x 0,5; y 0,6), supaya ruang kosong di atas memberi rasa lapang
- Skala subjek: sekitar 35% tinggi bidang, utuh
- Ruang kosong: atas dan sisi, lebih dari sepertiga bidang
- Keseimbangan: aksen kuning kecil di kanan atas mengimbangi subjek
- Zona aman: burung, dahan, dan aksen berada di 80% tengah; yang boleh terpotong hanya latar

```
+---+---+---+
| . | . | a |
+---+---+---+
| . | S | . |      S = subjek, a = aksen, - = dahan, . = kosong
+---+---+---+
| - | S | - |
+---+---+---+
```

## Prompt (wall-art-image-prompt-engineer)

Prompt inti (netral alat), TIDAK dijalankan di alat AI karena tidak ada izin pemakaian kredit:

```
flat illustration, simple rounded shapes, a small songbird perched low on a thin branch,
centered in the lower half, generous empty warm ivory paper background,
muted olive green body, soft terracotta head, deep umber details, one small turmeric yellow accent,
subtle paper grain, soft even light, calm and gentle,
flat artwork filling the entire canvas, edge to edge
```

Batasan: no frame, no wall, no border, no mat, no text, no letters, no signature, no watermark, no logo.
Versi Midjourney: prompt di atas ditambah `--ar 2:3 --no frame, wall, border, text, signature, watermark`.

Pengganti untuk uji: gambar digambar skrip `tools/build_example.py` dengan komposisi yang sama, 3600 x 5400 pixel.
