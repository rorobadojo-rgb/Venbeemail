# Model Whisper untuk transkripsi graphify

graphify memakai faster-whisper (extra `video`). Model diunduh saat pertama dipakai.

| Model | Ukuran unduhan (perkiraan) | Kecepatan di CPU | Cocok untuk |
|---|---|---|---|
| `tiny` | ±75 MB | sangat cepat | uji alur saja |
| `base` (default) | ±145 MB | cepat | rekaman jelas, satu bahasa |
| `small` | ±480 MB | sedang | campuran istilah teknis |
| `medium` | ±1,5 GB | lambat | istilah teknis banyak, aksen |
| `large-v3` | ±3 GB | sangat lambat di CPU | rekaman penting, butuh akurasi tertinggi |

Ukuran dan kecepatan adalah ASUMSI kasar; cek ruang disk sebelum memilih model besar.

Cara memilih model:

- Lewat skill resmi: `/graphify <folder> --whisper-model small`.
- Lewat variabel: `export GRAPHIFY_WHISPER_MODEL=small` (harus `export`, bukan hanya diisi).

Petunjuk domain (`GRAPHIFY_WHISPER_PROMPT`):

- Satu kalimat berisi topik dan istilah kunci, ditutup "Use proper punctuation and paragraph breaks."
- Ambil istilah dari god node graph yang sudah ada (`graphify god-nodes --top 10`).
- Korpus hanya video tanpa graph lain: pakai petunjuk umum "Use proper punctuation and paragraph breaks."
