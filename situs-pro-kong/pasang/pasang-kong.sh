#!/usr/bin/env bash
# Pasang VenbeeMail Pro gaya Kong (PRD 18.4). Aman diulang.
#   MODE=uji   : ke /pro/kong/ (noindex), /pro/ tidak berubah.
#   MODE=utama : mengganti index.html /pro/. Berkas lama lain (aset/01-09, aset/vbpro) tidak dihapus.
#
# Di server (aaPanel, sebagai root):
#   curl -fsSL https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/CABANG/situs-pro-kong/pasang/pasang-kong.sh \
#     | MODE=uji CABANG=CABANG bash
#
# Urutan: cari folder /pro, unduh cabang dari GitHub, periksa (siapkan.js --cek) tanpa menulis,
# cadangkan seluruh folder /pro, pasang, lalu periksa dari luar. Kalau pemeriksaan gagal,
# folder /pro dikembalikan otomatis dari cadangan yang baru dibuat.
set -euo pipefail

MODE=${MODE:-uji}
CABANG=${CABANG:-claude/epic-carson-4jmsuo}
SIMPAN=${SIMPAN:-/www/backup/venbeemail-pro-kong}
SITUS=${SITUS:-https://venbeemail.com}
SUMBER=${SUMBER:-https://codeload.github.com/rorobadojo-rgb/Venbeemail/tar.gz/refs/heads/$CABANG}
T=$(date +%Y%m%d-%H%M%S)
KERJA=/tmp/vbkong-$T
case "$MODE" in uji|utama) ;; *) echo "BERHENTI: MODE harus uji atau utama. Tidak ada yang diubah."; exit 1;; esac

# 1. Folder /pro (dikenali dari aset lama 02-maskot.webp, yang tidak pernah dihapus)
P=$(readlink -f "${PRO:-/www/wwwroot/banamail-pro}")   # folder asli, kalau jalurnya symlink
if [ ! -f "$P/index.html" ] || [ ! -f "$P/aset/02-maskot.webp" ]; then
  echo "BERHENTI: folder /pro tidak ketemu di $P (index.html dan aset/02-maskot.webp). Tidak ada yang diubah."; exit 1
fi
echo "Folder /pro : $P"

# 2. Node
N=$(command -v node || true)
if [ -z "$N" ]; then N=$(ls -1 /www/server/nodejs/*/bin/node 2>/dev/null | tail -1 || true); fi
if [ -z "$N" ]; then echo "BERHENTI: program node tidak ketemu. Tidak ada yang diubah."; exit 1; fi
echo "Node        : $N ($("$N" --version))"

# 3. Unduh dan periksa tanpa menulis ke /pro
rm -rf "$KERJA"; mkdir -p "$KERJA"; cd "$KERJA"
if ! curl -fsSL "$SUMBER" | tar xz --strip-components=1; then
  cd /; rm -rf "$KERJA"; echo "BERHENTI: unduhan cabang $CABANG gagal. Tidak ada yang diubah."; exit 1
fi
for f in situs-pro-kong/index.html situs-pro-kong/lama/index.html situs-pro-kong/pasang/siapkan.js \
         situs-pro-kong/aset/vbkong/gaya.css situs-pro-kong/aset/vbkong/halaman.js situs-pro-kong/aset/vbkong/gerak.js \
         situs-pro-kong/aset/vbkong/js/gsap.min.js situs-pro-kong/aset/vbkong/gambar/maskot-badan-512.webp \
         situs-pro-kong/aset/vbkong/film/daftar.json situs-pro-kong/aset/vbkong/video/hero-540.mp4; do
  if [ ! -s "$f" ]; then cd /; rm -rf "$KERJA"; echo "BERHENTI: unduhan tidak lengkap ($f). Tidak ada yang diubah."; exit 1; fi
done
if [ "$MODE" = uji ]; then AWAL=/pro/kong/; else AWAL=/pro/; fi
SIAP=(situs-pro-kong/pasang/siapkan.js --mode "$MODE" --awalan "$AWAL" \
  --sumber situs-pro-kong/index.html --referensi situs-pro-kong/lama/index.html --lama "$P/index.html")
if ! "$N" "${SIAP[@]}" --cek; then cd /; rm -rf "$KERJA"; exit 1; fi
"$N" "${SIAP[@]}" --keluar "$KERJA/hasil.html"

# 4. Cadangan seluruh folder /pro
mkdir -p "$SIMPAN"
cp -a "$P" "$SIMPAN/pro-$T"
if [ ! -f "$SIMPAN/pro-$T/index.html" ]; then echo "BERHENTI: cadangan gagal. Tidak ada yang diubah."; exit 1; fi
echo "Cadangan    : $SIMPAN/pro-$T"

# 5. Pasang
if [ "$MODE" = uji ]; then
  rm -rf "$P/kong"; mkdir -p "$P/kong/aset"
  cp -r situs-pro-kong/aset/vbkong "$P/kong/aset/vbkong"
  cp "$KERJA/hasil.html" "$P/kong/index.html"
  chown -R --reference="$P/index.html" "$P/kong"
  find "$P/kong" -type d -exec chmod 755 {} +; find "$P/kong" -type f -exec chmod 644 {} +
  CEK=/pro/kong/
else
  rm -rf "$P/aset/vbkong"
  cp -r situs-pro-kong/aset/vbkong "$P/aset/vbkong"
  chown -R --reference="$P/index.html" "$P/aset/vbkong"
  find "$P/aset/vbkong" -type d -exec chmod 755 {} +; find "$P/aset/vbkong" -type f -exec chmod 644 {} +
  cp "$KERJA/hasil.html" "$P/index.html"     # menimpa isi; pemilik dan izin berkas lama tetap
  rm -rf "$P/kong"                             # versi uji tidak diperlukan lagi (ada di cadangan)
  CEK=/pro/
fi

# 6. Periksa dari luar. Gagal: kembalikan otomatis.
kode() { curl -s -o /dev/null -w '%{http_code}' "$SITUS$1?v=$T" || true; }
ada() { curl -s "$SITUS$CEK?v=$T" | grep -c 'vbkong-halaman' || true; }
HAL_ADA=$(ada)
if [ "$HAL_ADA" = 0 ] && command -v systemctl >/dev/null 2>&1 && systemctl cat banamail >/dev/null 2>&1; then
  echo "Halaman baru belum terbaca, memulai ulang banamail..."; systemctl restart banamail; sleep 3; HAL_ADA=$(ada)
fi
HAL=$(kode "$CEK"); CSS=$(kode "${CEK}aset/vbkong/gaya.css"); JS=$(kode "${CEK}aset/vbkong/gerak.js")
GB=$(kode "${CEK}aset/vbkong/gambar/maskot-badan-512.webp"); FILM=$(kode "${CEK}aset/vbkong/film/h/f1_001.webp")
VID=$(kode "${CEK}aset/vbkong/video/hero-540.mp4")
echo "Periksa     : halaman $HAL, penanda $HAL_ADA, gaya.css $CSS, gerak.js $JS, gambar $GB, bingkai $FILM, video $VID"
cd /; rm -rf "$KERJA"
if [ "$HAL" = 000 ]; then
  echo "SELESAI, tapi server tidak bisa membuka $SITUS sendiri. Buka $SITUS$CEK di HP untuk memastikan."
elif [ "$HAL" = 200 ] && [ "$HAL_ADA" != 0 ] && [ "$CSS" = 200 ] && [ "$JS" = 200 ] && [ "$GB" = 200 ] && [ "$FILM" = 200 ] && [ "$VID" = 200 ]; then
  echo "BERHASIL. Buka $SITUS$CEK di HP."
else
  cp -a "$SIMPAN/pro-$T" "$P.kembali" && rm -rf "$P" && mv "$P.kembali" "$P"
  if [ "$MODE" = uji ] && [ "$HAL" = 404 ]; then
    echo "GAGAL: server tidak melayani folder /pro/kong/. Folder /pro sudah dikembalikan dari $SIMPAN/pro-$T. Tempel hasil ini ke chat."
  else
    echo "GAGAL periksa. Folder /pro sudah dikembalikan dari $SIMPAN/pro-$T. Tempel hasil ini ke chat."
  fi
  exit 1
fi
echo "Untuk mengembalikan pemasangan ini saja: rm -rf '$P' && cp -a '$SIMPAN/pro-$T' '$P'"
