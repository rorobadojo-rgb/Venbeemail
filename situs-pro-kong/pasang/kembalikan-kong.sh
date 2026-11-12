#!/usr/bin/env bash
# Kembalikan folder /pro dari cadangan versi Kong (PRD 18.5).
# Bawaan: cadangan TERAKHIR (keadaan tepat sebelum pemasangan Kong terakhir).
# Pilih cadangan lain dengan PILIH=pro-YYYYMMDD-HHMMSS (daftar dicetak di akhir).
#
#   curl -fsSL https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/CABANG/situs-pro-kong/pasang/kembalikan-kong.sh | bash
#   ... | PILIH=pro-20261014-120000 bash
#
# Untuk kembali ke keadaan sebelum versi Kong pernah dipasang: PILIH= nama paling atas di daftar.
# Untuk kembali ke sebelum Fase 1 PRD pertama: situs-pro/pasang/kembalikan.sh.
set -euo pipefail

SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro-kong}
SITUS=${SITUS:-https://venbeemail.com}
PILIH=${PILIH:-}
if [ -n "$PILIH" ]; then C="$SIMPAN/$PILIH"; else C=$(ls -1d "$SIMPAN"/pro-* 2>/dev/null | tail -1 || true); fi
if [ -z "$C" ] || [ ! -f "$C/index.html" ]; then echo "BERHENTI: cadangan tidak ada di $SIMPAN."; exit 1; fi
P=$(readlink -f "${PRO:-/www/wwwroot/banamail-pro}")   # folder asli, kalau jalurnya symlink
if [ ! -f "$P/index.html" ] || [ ! -f "$P/aset/02-maskot.webp" ]; then echo "BERHENTI: folder /pro tidak ketemu di $P."; exit 1; fi
cp -a "$C" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
echo "Dikembalikan: $P sekarang sama dengan $C"
if command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then systemctl restart banamail; sleep 3; fi
echo "Halaman /pro/: $(curl -s -o /dev/null -w '%{http_code}' "$SITUS/pro/" || true)"
echo "Halaman /pro/kong/: $(curl -s -o /dev/null -w '%{http_code}' "$SITUS/pro/kong/" || true) (404 = versi uji tidak ada)"
echo "Semua cadangan Kong:"; ls -1d "$SIMPAN"/pro-*
