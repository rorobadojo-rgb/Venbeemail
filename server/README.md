# BanaMail — server untuk VPS (aaPanel)

Satu proses Node.js menjalankan semuanya:

| Bagian | Tugas |
| --- | --- |
| **SMTP :25** | Menerima surat untuk `*@venbeemail.com`. Surat untuk alamat aktif **selalu disimpan**; yang terlihat seperti spam hanya masuk folder Spam. Alamat yang tidak ada ditolak saat `RCPT TO`, dan surat untuk domain lain ditolak (bukan open relay, tanpa AUTH). SPF/DKIM/DMARC pengirim diperiksa sendiri oleh server ini. |
| **HTTP 127.0.0.1:3000** | Halaman BanaMail (`public/banamail`) dan API `/api/*`. Nginx aaPanel meneruskan `https://venbeemail.com` ke sini. |
| **Pembersih** | Tiap 10 menit menghapus alamat kedaluwarsa beserta surat dan lampirannya. |

Data disimpan di satu berkas SQLite (`server/data/banamail.db`). Halaman yang sama di GitHub Pages tetap berjalan sebagai **mode demo**.

Kebutuhan: VPS dengan aaPanel, **Node.js 22.19 atau lebih baru** (disarankan 24 LTS), port **25** masuk terbuka, dan tidak ada program lain yang memakai port 25.

---

## Langkah 1 — DNS di DomaiNesia

Domain tetap di DomaiNesia; tidak perlu pindah nameserver. Di pengaturan DNS `venbeemail.com`, buat:

| Tipe | Nama | Isi | Catatan |
| --- | --- | --- | --- |
| A | `@` | IP VPS | halaman venbeemail.com |
| A | `mail` | IP VPS | server surat |
| MX | `@` | `mail.venbeemail.com` | prioritas `10` |
| TXT | `@` | `v=spf1 -all` | domain ini tidak mengirim email, jadi orang lain tidak bisa memalsukannya |
| TXT | `_dmarc` | `v=DMARC1; p=reject` | sama seperti di atas |

Hapus catatan MX lama kalau ada. Perubahan DNS biasanya aktif dalam beberapa menit sampai beberapa jam. Cek dengan `dig MX venbeemail.com +short`.

## Langkah 2 — Siapkan aaPanel

1. **Node.js:** App Store → **Node.js version manager** → pasang versi 24 (atau 22.19+). Catat lokasi `node` dengan `which node` di Terminal aaPanel. Kalau tidak ketemu, cari di `/www/server/nodejs/`.
2. **Pastikan port 25 kosong** (Terminal aaPanel):
   ```bash
   ss -ltnp | grep ':25 '        # atau: netstat -ltnp | grep ':25 '
   ```
   Kalau muncul `master` atau `postfix`, matikan: `systemctl disable --now postfix`. Sebagian sistem memasang Postfix bawaan yang hanya mendengarkan 127.0.0.1:25, tapi tetap bentrok.
3. **Firewall:** Security → pastikan **25/TCP** terbuka (juga di firewall penyedia VPS). Port 3000 **jangan** dibuka ke luar.

## Langkah 3 — Pasang aplikasinya

Di Terminal aaPanel:

```bash
cd /www/wwwroot
git clone https://github.com/rorobadojo-rgb/Venbeemail.git venbeemail   # repo privat? pakai token GitHub, atau unggah lewat File Manager aaPanel
cd venbeemail/server
npm install --omit=dev
mkdir -p data
cp .env.example .env              # sesuaikan bila perlu (lihat tabel Pengaturan)
```

Coba jalankan sekali secara langsung:

```bash
npm start
# → BanaMail siap — HTTP 127.0.0.1:3000, SMTP 0.0.0.0:25, domain venbeemail.com
```

Tekan Ctrl+C, lalu pasang sebagai layanan supaya otomatis jalan dan bangkit lagi kalau mati:

```bash
cp deploy/banamail.service /etc/systemd/system/banamail.service
nano /etc/systemd/system/banamail.service   # sesuaikan jalur node (langkah 2.1) dan folder repo
systemctl daemon-reload
systemctl enable --now banamail
systemctl status banamail                   # harus "active (running)"
journalctl -u banamail -f                   # log langsung (Ctrl+C untuk keluar)
```

## Langkah 4 — Situs + SSL di aaPanel

1. **Website → Add site**: domain `venbeemail.com`, lalu tambahkan juga `mail.venbeemail.com` sebagai domain kedua di situs yang sama. Pilih PHP: *Pure static* (tidak perlu PHP atau database).
2. Di situs itu: **SSL → Let's Encrypt**, centang kedua domain, lalu **Apply**. Aktifkan **Force HTTPS**.
3. **Reverse proxy → Add**: target `http://127.0.0.1:3000`, send domain `$host`. (Kalau lebih suka menulis konfigurasi sendiri, contohnya ada di `deploy/nginx.conf`.)
4. Buka <https://venbeemail.com/api/health>. Kalau jawabannya `{"ok":true,...}`, sambungannya sudah benar.

### STARTTLS (disarankan)

Supaya surat masuk terenkripsi, pakai sertifikat Let's Encrypt yang sama. Cek lokasi sertifikatnya; di aaPanel biasanya ada di:

```bash
ls /www/server/panel/vhost/cert/venbeemail.com/
# fullchain.pem  privkey.pem
```

Isi di `server/.env`:

```
TLS_CERT=/www/server/panel/vhost/cert/venbeemail.com/fullchain.pem
TLS_KEY=/www/server/panel/vhost/cert/venbeemail.com/privkey.pem
```

Lalu `systemctl restart banamail`. Sertifikat diperpanjang otomatis oleh aaPanel; jalankan `systemctl restart banamail` setelah perpanjangan (atau jadwalkan sebulan sekali lewat Cron di aaPanel).

## Langkah 5 — Coba

1. Buka <https://venbeemail.com>. Label di kartu alamat harus **aktif** (bukan "mode demo").
2. Salin alamatnya, lalu kirim email dari Gmail atau daftar di sebuah situs.
3. Dalam ±10 detik surat muncul. `journalctl -u banamail -f` menampilkan setiap surat masuk beserta skor spam dan hasil SPF/DKIM/DMARC-nya.

## Memperbarui & mencadangkan

```bash
cd /www/wwwroot/venbeemail && git pull && cd server && npm install --omit=dev && systemctl restart banamail
```

Cadangan cukup satu berkas. Jadwalkan di Cron aaPanel, misalnya tiap hari (butuh perintah `sqlite3`: `apt install sqlite3` atau `yum install sqlite`):

```bash
cd /www/wwwroot/venbeemail/server/data && sqlite3 banamail.db ".backup 'backup-$(date +%F).db'"
```

---

## Pengaturan (`server/.env`)

| Variabel | Bawaan | Arti |
| --- | --- | --- |
| `DOMAINS` | `venbeemail.com` | Domain alamat; pisahkan dengan koma (tiap domain butuh MX ke server ini). |
| `TTL_MINUTES` | `60` | Umur alamat. |
| `RANDOM_LENGTH` / `SUFFIX_LENGTH` | `10` / `6` | Nama acak (`ifhew8883d`) dan akhiran nama kustom (`budi.k7m2x9`). |
| `MAX_MESSAGE_BYTES` | `20971520` | Surat lebih besar ditolak (552). |
| `NEW_ADDRESS_LIMIT` | `20` | Alamat baru per IP per 10 menit. |
| `SENDING_ENABLED` | `false` | Fitur **Balas** belum aktif: tombolnya disembunyikan dan `POST /api/replies` menjawab 501. |
| `AUTH_CHECKS` | `true` | Periksa SPF/DKIM/DMARC pengirim (butuh DNS keluar). |
| `SMTP_HOSTNAME` | `mail.<domain pertama>` | Nama server di sapaan SMTP. |
| `TLS_CERT` / `TLS_KEY` | kosong | Sertifikat untuk STARTTLS. |
| `HTTP_HOST` / `HTTP_PORT` | `127.0.0.1` / `3000` | Tempat Nginx meneruskan permintaan. |
| `DB_PATH` / `STATIC_DIR` | `server/data/banamail.db` / `public/banamail` | Lokasi data dan halaman. |

## Keamanan yang sudah dipasang

- **Token akses.** Saat alamat dibuat, peramban menerima token acak 256 bit; server hanya menyimpan hash SHA-256-nya. Semua pembacaan wajib membawa token itu, jadi orang yang hanya tahu alamatnya tidak bisa membaca OTP.
- **Alamat tidak pernah dipakai ulang.** Alamat yang dihapus/kedaluwarsa disimpan sebagai batu nisan.
- **Bukan open relay.** Hanya menerima surat untuk domain sendiri, tanpa AUTH.
- **Header pengirim tidak dipercaya.** Skor spam memakai hasil SPF/DKIM/DMARC yang diperiksa server ini sendiri, bukan header `Authentication-Results` di dalam surat.
- **Lampiran** selalu dikirim sebagai unduhan (`application/octet-stream`), jadi berkas dari pengirim asing tidak pernah dirender di domain ini. Isi HTML disanitasi di halaman dan ditampilkan di iframe sandbox tanpa skrip.
- **Layanan systemd** dikurung: sistem berkas hanya-baca kecuali folder `data`.

## Pengembangan

```bash
npm install
npm test        # unit test + uji ujung-ke-ujung (SMTP sungguhan ke server di port acak, SQLite di memori)
SMTP_PORT=2525 HTTP_PORT=3000 AUTH_CHECKS=false npm start   # tanpa root
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
