# Pasang hero VenbeeMail Pro (Fase 1) ke halaman /pro. Aman diulang.
# Tempel seluruh blok ini ke terminal aaPanel. Berjalan di subshell, jadi
# kalau berhenti di tengah, terminal tidak tertutup.
(
set -eu
AKAR=${AKAR:-/www/wwwroot/venbeemail}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro}
SITUS=${SITUS:-https://venbeemail.com}
SUMBER=${SUMBER:-https://codeload.github.com/rorobadojo-rgb/Venbeemail/tar.gz/refs/heads/claude/epic-carson-4jmsuo}
T=$(date +%Y%m%d-%H%M%S)
KERJA=/tmp/vbpro-$T

# 1. Folder /pro: harus berisi index.html dan aset/02-maskot.webp
P=""
for d in $(find "$AKAR" -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
  if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then P=$d; break; fi
done
if [ -z "$P" ]; then echo "BERHENTI: folder /pro tidak ketemu. Tidak ada yang diubah."; exit 1; fi
echo "Folder /pro : $P"

# 2. Program node (sudah ada untuk banamail.service)
N=$(command -v node || true)
if [ -z "$N" ]; then N=$(ls -1 /www/server/nodejs/*/bin/node 2>/dev/null | tail -1 || true); fi
if [ -z "$N" ]; then echo "BERHENTI: program node tidak ketemu. Tidak ada yang diubah."; exit 1; fi
echo "Node        : $N $("$N" -v)"

# 3. Unduh dari GitHub, lalu periksa tanpa menulis
rm -rf "$KERJA"; mkdir -p "$KERJA"; cd "$KERJA"
curl -fsSL "$SUMBER" | tar xz --strip-components=1
for f in situs-pro/index.html situs-pro/pasang/sisipkan.js situs-pro/aset/vbpro/hero.js situs-pro/aset/vbpro/hero.css situs-pro/aset/vbpro/js/gsap.min.js; do
  if [ ! -s "$f" ]; then echo "BERHENTI: unduhan tidak lengkap ($f). Tidak ada yang diubah."; exit 1; fi
done
"$N" situs-pro/pasang/sisipkan.js --cek "$P/index.html" situs-pro/index.html

# 4. Cadangan seluruh folder /pro
mkdir -p "$SIMPAN"
cp -a "$P" "$SIMPAN/pro-$T"
if [ ! -f "$SIMPAN/pro-$T/index.html" ]; then echo "BERHENTI: cadangan gagal. Tidak ada yang diubah."; exit 1; fi
echo "Cadangan    : $SIMPAN/pro-$T"

# 5. Pasang: aset baru di aset/vbpro, hero disisipkan ke index.html
rm -rf "$P/aset/vbpro"
cp -r situs-pro/aset/vbpro "$P/aset/vbpro"
chown -R --reference="$P/index.html" "$P/aset/vbpro"
find "$P/aset/vbpro" -type d -exec chmod 755 {} +
find "$P/aset/vbpro" -type f -exec chmod 644 {} +
"$N" situs-pro/pasang/sisipkan.js "$P/index.html" situs-pro/index.html

# 6. Periksa dari luar. Kalau aset baru tidak terbaca, halaman lama dikembalikan.
kode() { curl -s -o /dev/null -w '%{http_code}' "$SITUS$1" || true; }
ada() { curl -s "$SITUS/pro/?v=$T" | grep -c 'vbpro-hero:mulai' || true; }
HERO=$(ada)
if [ "$HERO" = 0 ] && command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then
  echo "Hero belum terbaca, memulai ulang banamail..."
  systemctl restart banamail; sleep 3; HERO=$(ada)
fi
HAL=$(kode /pro/); JS=$(kode /pro/aset/vbpro/hero.js); CSS=$(kode /pro/aset/vbpro/hero.css); GB=$(kode /pro/aset/vbpro/gambar/maskot-badan-512.webp)
echo "Periksa     : halaman $HAL, hero $HERO, hero.js $JS, hero.css $CSS, gambar $GB"
cd /; rm -rf "$KERJA"
if [ "$HAL" = 000 ]; then
  echo "SELESAI, tapi server tidak bisa membuka $SITUS sendiri. Buka $SITUS/pro/ di HP untuk memastikan."
elif [ "$HAL" = 200 ] && [ "$HERO" != 0 ] && [ "$JS" = 200 ] && [ "$CSS" = 200 ] && [ "$GB" = 200 ]; then
  echo "BERHASIL. Buka $SITUS/pro/ di HP."
else
  cp -a "$SIMPAN/pro-$T" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
  echo "GAGAL periksa. Halaman lama sudah dikembalikan dari $SIMPAN/pro-$T. Tempel hasil ini ke chat."
  exit 1
fi
echo "Untuk mengembalikan pemasangan ini saja: rm -rf '$P' && cp -a '$SIMPAN/pro-$T' '$P'"
)
