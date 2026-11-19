# Aturan Inti Keluarga Skill Graphify

File ini sama persis di setiap skill keluarga graphify (disalin otomatis dari satu sumber). Baca sekali
per percakapan, lalu kerjakan skill yang sedang aktif. Keluarga ini dibuat komunitas, bukan produk resmi
Graphify Labs. Skill resmi `graphify` (folder `.claude/skills/graphify/`) tetap dipakai untuk pipeline
`/graphify`; keluarga ini mengatur operasionalnya, graph dokumen, dan graph perpustakaan skill.

## 1. Bahasa dan cara bicara

- Bicara dalam Bahasa Indonesia yang sederhana. Nama perintah, flag, dan file ditulis apa adanya di
  dalam tanda petik terbalik, contoh `graphify update .`.
- Jelaskan istilah teknis satu kalimat saat pertama muncul. Istilah yang sering dipakai:
  - **graph** (peta pengetahuan): kumpulan simpul dan hubungan.
  - **node** (simpul): satu hal di graph, misalnya fungsi, file, judul bagian, atau skill.
  - **edge** (relasi): hubungan dua node, misalnya `calls`, `imports`, `references`.
  - **komunitas**: kelompok node yang saling terhubung rapat.
  - **god node**: node dengan koneksi terbanyak; mengubahnya berdampak luas.
  - **AST**: pembacaan struktur kode oleh tree-sitter; lokal, gratis, tanpa LLM.
  - **pass semantik**: dokumen, PDF, gambar, atau transkrip dibaca model; memakai token.

## 2. Lima label bukti

| Label | Arti | Syarat |
|---|---|---|
| FAKTA | Bisa diperiksa ulang | Sebut perintah yang dijalankan dan keluarannya, atau path file |
| PENGAMATAN | Terlihat langsung di graph, laporan, atau file yang dibuka | Sebut file dan bagiannya |
| ASUMSI | Dianggap benar agar kerja lanjut, termasuk semua angka perkiraan | Sebut cara menghitung dan risikonya bila salah |
| HIPOTESIS | Dugaan yang bisa diuji, termasuk setiap edge `INFERRED` yang belum dicek | Sebut cara mengujinya |
| KEPUTUSAN | Pilihan yang sudah diambil | Sebut siapa yang memutuskan dan kapan |

Larangan di semua skill:

- Jangan menyatakan graph sudah dibangun, diperbarui, diekspor, atau CLI sudah terpasang tanpa keluaran
  perintah yang bisa diperiksa. Sebut path hasilnya dan perintah untuk mengeceknya.
- Jangan mengarang jumlah node, edge, komunitas, token, atau waktu. Angka perkiraan diberi label ASUMSI.
- Edge `INFERRED` dan `AMBIGUOUS` bukan fakta. Sebelum dipakai sebagai dasar keputusan, buka baris
  sumbernya dan ubah labelnya menjadi PENGAMATAN.
- Jangan mengedit file skill resmi di `.claude/skills/graphify/`; isinya ditimpa setiap
  `graphify install`. Penyesuaian ditulis di skill keluarga ini.

## 3. Fakta lingkungan

- **Container cloud selalu baru.** Di Claude Code web, CLI `graphify` tidak ada di awal sesi. Pasang lewat
  `graphify-pasang-cli`. Paket resmi bernama `graphifyy` (dua huruf y); perintahnya `graphify`.
- **Perintah pasang baku:** `uv tool install "graphifyy[mcp,watch,pdf,office,svg,sql]==0.9.112"`.
- **Interpreter graphify** (untuk Python API) adalah shebang file `graphify`:
  `head -1 "$(command -v graphify)" | tr -d '#!'`.
- **Jaringan sesi cloud terbatas.** unpkg.com diblokir, jadi `graph.html` tampil kosong bila dibuka di
  container, tetapi normal di browser pemilik. Unduhan lewat `graphify add` hanya ke host yang diizinkan.
- **Cadangan pelabelan.** CLI `claude` ada di sesi cloud dan graphify memakainya untuk menamai komunitas
  bila tidak ada API key. Itu memakai token tanpa terlihat. Selalu jalankan `graphify cluster-only` dengan
  `--no-label`, lalu nama komunitas ditulis lewat `graphify-namai-komunitas`.
- **API key** hanya diperiksa namanya, tidak pernah nilainya. Jangan mencetak isi variabel lingkungan.

## 4. Lokasi file dan pemiliknya

```
graphify-out/                        graph utama repo (KRP-repo), di-commit
  graph.json, GRAPH_REPORT.md, graph.html, manifest.json
  .graphify_labels.json (+ .sig)       nama komunitas        (pemilik: graphify-namai-komunitas)
  memory/, reflections/                memori jawaban        (pemilik: graphify-memori-jawaban)
  cache/, folder cadangan bertanggal   TIDAK di-commit (lihat graphify-out/.gitignore)
graphify-kerja/
  register/graph-register.csv          daftar graph          (pemilik: graphify-catatan-graph)
  rencana/<corpus_id>.md               rencana korpus        (pemilik: graphify-rencana-korpus)
  audit/<corpus_id>-<YYYYMMDD>.md      laporan audit         (pemilik: graphify-audit-graph)
  graph/<corpus_id>/graphify-out/      graph selain graph utama (dokumen, skill, gabungan)
  raw/<corpus_id>/                     sumber luar dari URL  (pemilik: graphify-tambah-sumber)
.graphifyignore, .graphifyrc           pengecualian          (pemilik: graphify-atur-pengecualian)
CLAUDE.md bagian "## graphify", .claude/settings.json hook   (pemilik: graphify-mode-always-on)
```

Hanya skill pemilik yang mengubah file tersebut. Skill lain mengusulkan perubahan lewat baris
`keputusan` di serah terima.

## 5. ID korpus dan letak keluaran

- Format `KRP-<slug>`: `KRP-repo` (graph utama), `KRP-skill`, `KRP-dokumen-<slug>`, `KRP-gabungan-<slug>`.
- `KRP-repo` selalu di `graphify-out/` akar repo. Korpus lain di `graphify-kerja/graph/<corpus_id>/`.
- Perhatikan perbedaan dua jalur:
  - `graphify extract <path> --out <DIR>` menulis ke `<DIR>/graphify-out/`. Tanpa `--out`, ke `<path>/graphify-out/`.
  - Skill resmi `/graphify <path>` menulis ke `./graphify-out/` di direktori kerja, bukan di `<path>`.
- `graphify cluster-only <DIR>` membaca `<DIR>/graphify-out/graph.json`. Perintah tanya memakai
  `--graph <DIR>/graphify-out/graph.json` untuk graph selain graph utama.

## 6. Membaca hasil graph

- `EXTRACTED`: tertulis langsung di sumber. `INFERRED`: tebakan graphify dengan skor 0,55 sampai 0,95.
  `AMBIGUOUS`: tidak pasti.
- Kode keluar `query`, `path`, `explain`: `0` ada jawaban, `3` nama ambigu (kandidat ditampilkan),
  `4` node tidak ditemukan. Pada kode 3, pilih kandidat yang tepat; jangan menebak.
- `[!] TRUNCATED` berarti jawaban terpotong anggaran token. Naikkan `--budget` atau persempit pertanyaan.
- Graph mencerminkan isi saat dibangun. Bandingkan `built_at_commit` di `graph.json` dengan
  `git rev-parse HEAD` sebelum mempercayai graph untuk kode yang baru diubah.

## 7. Biaya, privasi, dan keamanan

Minta izin pemilik lewat `graphify-penjaga-biaya` sebelum:

1. pass semantik atas dokumen, PDF, gambar, atau transkrip (memakai token);
2. `--mode deep` atau backend API (isi file dikirim ke penyedia model);
3. `graphify add <url>` (mengambil isi dari internet);
4. mengirim graph ke Neo4j atau FalkorDB, atau membuka server MCP lewat HTTP.

Larangan:

- Data pribadi tidak boleh masuk graph. `studio-nangka/pelanggan/` dan sejenisnya harus dikecualikan;
  graph yang memuatnya gagal di gerbang G3.
- Jangan memakai `--force` atau `GRAPHIFY_FORCE=1` tanpa alasan tertulis. Penolakan mengecilkan graph
  ("refused to shrink") adalah pengaman.
- Jangan menghapus `graphify-out/`, menjalankan `graphify uninstall --purge`, atau mencopot hook tanpa
  permintaan jelas.
- Kata sandi dan token hanya lewat variabel lingkungan (`NEO4J_PASSWORD`, `FALKORDB_PASSWORD`), tidak
  di file, tidak di perintah yang tercatat.

## 8. Serah terima

Setiap skill jalur menutup pekerjaan dengan blok ini, supaya skill berikutnya tidak menebak:

```
SERAH TERIMA
dari: <nama skill>
korpus: <corpus_id>
graph: <path graph.json> (<node> node, <edge> edge, <komunitas> komunitas)
status: selesai | perlu_tinjau | gagal
bukti: <perintah yang dijalankan> -> <ringkasan keluaran>
keputusan: <keputusan, siapa, kapan>  (boleh kosong)
berikutnya: <skill berikutnya atau null>
```

- `selesai` hanya bila buktinya ada. Ada yang belum dicek: `perlu_tinjau`. Perintah gagal: `gagal`,
  beserta pesan errornya.
- Skill layanan tidak menulis `berikutnya`; skill pemanggil yang menentukan.

## 9. Bila tidak ada sistem file atau CLI

Di percakapan claude.ai biasa, repo dan CLI mungkin tidak ada. Skill tetap bisa menyusun perintah,
membaca `graph.json` atau `GRAPH_REPORT.md` yang diunggah, dan menyiapkan isi file. Katakan dengan jelas
apa yang tidak dijalankan: "ini perintah untuk Anda jalankan, saya belum menjalankannya". Bila skrip skill
perlu dijalankan, minta pemilik mengunggah file yang dibutuhkan atau menjalankannya sendiri.

## 10. Laporan akhir ke pemilik

Urutan: apa yang dikerjakan (dengan bukti), angka hasil, satu langkah berikutnya yang disarankan, lalu
apa yang belum dikerjakan beserta alasannya. Jangan menempel seluruh `GRAPH_REPORT.md`; cukup bagian
yang relevan.
