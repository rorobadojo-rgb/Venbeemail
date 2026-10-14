# Kembalikan halaman /pro ke keadaan sebelum pemasangan PERTAMA
# (cadangan paling awal di /www/backup/venbeemail-pro).
(
set -eu
AKAR=${AKAR:-/www/wwwroot/venbeemail}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro}
SITUS=${SITUS:-https://venbeemail.com}
C=$(ls -1d "$SIMPAN"/pro-* 2>/dev/null | head -1 || true)
if [ -z "$C" ] || [ ! -f "$C/index.html" ]; then echo "BERHENTI: tidak ada cadangan di $SIMPAN."; exit 1; fi
P=""
for d in $(find "$AKAR" -path '*/node_modules' -prune -o -type d -name pro -print 2>/dev/null); do
  if [ -f "$d/index.html" ] && [ -f "$d/aset/02-maskot.webp" ]; then P=$d; break; fi
done
if [ -z "$P" ]; then echo "BERHENTI: folder /pro tidak ketemu."; exit 1; fi
cp -a "$C" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
echo "Dikembalikan: $P sekarang sama dengan $C"
if curl -s "$SITUS/pro/?v=$(date +%s)" | grep -q 'vbpro-hero:mulai' && command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then
  systemctl restart banamail; sleep 3
fi
echo "Halaman: $(curl -s -o /dev/null -w '%{http_code}' "$SITUS/pro/" || true)"
echo "Semua cadangan:"; ls -1d "$SIMPAN"/pro-*
)
