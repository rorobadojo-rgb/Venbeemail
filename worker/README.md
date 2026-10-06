# BanaMail — backend (Cloudflare Worker)

Satu Worker melayani semuanya di **venbeemail.com**:

| Bagian | Tugas |
| --- | --- |
| `email()` | Menerima semua surat untuk `*@venbeemail.com` (Email Routing catch-all → Worker ini). Surat untuk alamat aktif **selalu disimpan**; yang terlihat seperti spam hanya masuk folder Spam. Surat untuk alamat yang tidak ada/kedaluwarsa ditolak. |
| `fetch()` | Halaman BanaMail (`public/banamail`) di `/`, dan API di `/api/*`. |
| `scheduled()` | Tiap 10 menit menghapus alamat kedaluwarsa beserta surat dan lampirannya. |

Data: **D1** (alamat + metadata surat) dan **R2** (isi surat + lampiran).

Halaman yang sama di GitHub Pages tetap berjalan sebagai **mode demo** (surat contoh). Di venbeemail.com halaman otomatis memakai API ini, karena `/api/health` menjawab.

---

## Langkah 1 — Domain dari DomaiNesia ke Cloudflare (sekali saja)

Domain tetap terdaftar dan diperpanjang di DomaiNesia. Yang dipindah hanya **nameserver**, supaya DNS dan email masuk diurus Cloudflare (Email Routing mewajibkan DNS di Cloudflare).

1. Buat akun gratis di <https://dash.cloudflare.com>.
2. Pilih **Add a domain**, isi `venbeemail.com`, lalu pilih paket **Free**.
3. Cloudflare membaca catatan DNS lama. Periksa daftarnya. Hapus catatan **A/AAAA/CNAME untuk `venbeemail.com` (root)** dan **MX** lama, karena keduanya akan diganti Worker dan Email Routing.
4. Cloudflare menampilkan **dua nameserver** (mis. `xxx.ns.cloudflare.com`). Catat keduanya.
5. Masuk ke member area **DomaiNesia**, buka domain `venbeemail.com`, lalu bagian **Nameserver**. Ganti semua nameserver dengan dua nameserver dari Cloudflare, lalu simpan.
6. Tunggu sampai Cloudflare menandai domain **Active**. Biasanya beberapa menit, paling lama sekitar 24 jam, dan Cloudflare mengirim email saat selesai.

## Langkah 2 — Pasang Worker

Butuh Node.js 20+ di komputermu.

```bash
cd worker
npm install
npx wrangler login                      # buka browser, izinkan akses ke akun Cloudflare

npx wrangler d1 create banamail          # salin "database_id" dari keluarannya…
#   …lalu tempel ke wrangler.toml, menggantikan 00000000-0000-0000-0000-000000000000

npx wrangler r2 bucket create banamail-mail
npm run db:migrate                       # buat tabel di D1
```

> R2 perlu diaktifkan sekali di dashboard (menu **R2**). Cloudflare bisa meminta metode pembayaran walaupun pemakaian kecil masih masuk kuota gratis.

Di `wrangler.toml`, aktifkan domain kustom dengan menghapus tanda `#` di depan baris ini:

```toml
routes = [{ pattern = "venbeemail.com", custom_domain = true }]
```

Lalu deploy:

```bash
npm run deploy
```

Buka <https://venbeemail.com/api/health>. Kalau jawabannya `{"ok":true,...}`, Worker sudah jalan.

## Langkah 3 — Arahkan semua email ke Worker

Di dashboard Cloudflare, buka `venbeemail.com` → **Email** → **Email Routing**:

1. Pilih **Get started / Enable Email Routing**. Cloudflare akan menambahkan catatan MX dan SPF sendiri; setujui.
2. Buka tab **Routing rules** → **Catch-all address** → **Edit**.
3. Action: **Send to a Worker**, Destination: **banamail**. Simpan, lalu pastikan statusnya **Enabled**.

## Langkah 4 — Coba

1. Buka <https://venbeemail.com>. Label di kartu alamat harus **aktif** (bukan "mode demo").
2. Salin alamatnya, lalu kirim email dari Gmail atau daftar di sebuah situs.
3. Dalam ±10 detik surat muncul. Kalau isinya kode OTP dan masuk Spam, ledakan kuning "Kode kamu nyasar ke Spam!" muncul.

Log langsung dari Worker: `npx wrangler tail`.

---

## Pengaturan (`[vars]` di `wrangler.toml`)

| Variabel | Bawaan | Arti |
| --- | --- | --- |
| `DOMAINS` | `venbeemail.com` | Domain alamat; pisahkan dengan koma kalau lebih dari satu (tiap domain harus punya Email Routing). |
| `TTL_MINUTES` | `60` | Umur alamat. |
| `RANDOM_LENGTH` | `10` | Panjang nama acak (`ifhew8883d`). |
| `SUFFIX_LENGTH` | `6` | Akhiran acak untuk nama kustom (`budi.k7m2x9`). |
| `MAX_MESSAGE_BYTES` | `20971520` | Surat lebih besar dari ini ditolak. |
| `NEW_ADDRESS_LIMIT` | `20` | Alamat baru per IP per 10 menit. |
| `SENDING_ENABLED` | `false` | Fitur **Balas** belum aktif: tombolnya disembunyikan dan `POST /api/replies` menjawab 501. Mengirim email butuh layanan pengirim (mis. Amazon SES, Resend, Postmark) dan catatan DKIM; itu langkah terpisah. |

## Keamanan yang sudah dipasang

- **Token akses.** `POST /api/addresses` memberi token acak 256 bit; hanya hash SHA-256-nya yang disimpan. Semua pembacaan wajib membawa token itu, jadi orang yang hanya tahu alamatnya tidak bisa membaca OTP.
- **Alamat tidak pernah dipakai ulang.** Alamat yang dihapus/kedaluwarsa disimpan sebagai batu nisan, sehingga nama yang sama tidak bisa dibuat lagi oleh orang lain.
- **Pembatas laju** pembuatan alamat per IP.
- **Lampiran** selalu dikirim sebagai `application/octet-stream` + `Content-Disposition: attachment`, jadi berkas dari pengirim asing tidak pernah dirender di domain ini. Isi HTML disanitasi di halaman dan ditampilkan di iframe sandbox tanpa skrip.

## Kuota (perkiraan, cek halaman harga Cloudflare)

Halaman menyegarkan satu kali per 10 detik (`GET /api/mailbox`, satu permintaan untuk ketiga tab), jadi ±360 permintaan per jam untuk setiap pengunjung yang membuka halaman. Paket Workers gratis kira-kira 100 ribu permintaan per hari.

## Pengembangan lokal

```bash
npm run db:migrate:local
npm run dev -- --test-scheduled          # http://localhost:8787 (halaman + API, D1/R2 lokal)
npm test                                 # unit test (generator nama, pemindai OTP, skor spam)
node test/e2e.mjs                        # uji ujung-ke-ujung terhadap server lokal di atas
```

Kirim surat uji ke server lokal:

```bash
curl -X POST "http://localhost:8787/cdn-cgi/handler/email?from=a%40example.com&to=ALAMAT%40venbeemail.com" \
  --data-binary $'Message-ID: <1@example.com>\r\nFrom: a@example.com\r\nTo: ALAMAT@venbeemail.com\r\nSubject: Kode verifikasi\r\n\r\nKode kamu: 482913\r\n'
```

## API

Semua JSON. Selain `/api/health` dan `POST /api/addresses`, wajib `Authorization: Bearer <token>`.

| Metode | Jalur | Hasil |
| --- | --- | --- |
| GET | `/api/health` | `{ok, domains, ttlMinutes, sending}` |
| POST | `/api/addresses` | body `{prefix?, domain?}` → `{address, local, domain, expiresAt, token}` |
| GET | `/api/mailbox` | `{inbox[], spam[], sent[], expiresAt}`. Metadata saja: `id, folder, from, to, subject, date, snippet, rescue, attachments` |
| GET | `/api/messages/:id` | metadata + `text` + `html` (gambar inline `cid:` kecil ikut sebagai `data`) |
| PATCH | `/api/messages/:id` | body `{folder: "inbox" \| "spam"}` → metadata |
| GET | `/api/messages/:id/attachments/:n` | berkas lampiran (unduhan) |
| POST | `/api/replies` | 501 selama `SENDING_ENABLED=false` |
| DELETE | `/api/addresses/me` | hapus alamat + semua isinya |
