#!/usr/bin/env bash
# Cek klip Seedance sesuai PRD 7.6: ukuran, fps, durasi, suara, SSIM akhir,
# SSIM loop, bingkai paling mirip (untuk loop), kedip, dan lembar kontak.
# Pakai: situs-pro-kong/alat/cek_klip.sh situs-pro-kong/video-mentah/vk-hero-loop.mp4 [folder-keluaran]
set -euo pipefail

f="$1"
keluar="${2:-/tmp/cek-klip}"
akar="$(cd "$(dirname "$0")/.." && pwd)"
bingkai="$akar/seedance/bingkai"
mkdir -p "$keluar"
nama="$(basename "$f")"

# nama berkas -> bingkai tujuan, detik, loop (1/0)
case "$nama" in
  vk-hero-loop.mp4)          tujuan=KH;  detik=6; loop=1 ;;
  vk-ft-sorotan-loop.mp4)    tujuan=KF;  detik=6; loop=1 ;;
  vk-f1-panggung-bangun.mp4) tujuan=K1;  detik=5; loop=0 ;;
  vk-f2-lepas-landas.mp4)    tujuan=K2;  detik=5; loop=0 ;;
  vk-f4-di-udara.mp4)        tujuan=K4b; detik=5; loop=0 ;;
  vk-f5-menukik.mp4)         tujuan=K6;  detik=7; loop=0 ;;
  vk-f3-bibir-podium.mp4)    tujuan=K3b; detik=8; loop=0 ;;
  vk-f3x-estafet-asli.mp4)   tujuan=;    detik=6; loop=0 ;;
  *) echo "Nama berkas tidak dikenal: $nama" >&2; exit 2 ;;
esac

ssim() {
  ffmpeg -nostats -v info -i "$1" -i "$2" -lavfi "[0]scale=1280:720[a];[1]scale=1280:720[b];[a][b]ssim" -f null - 2>&1 \
    | grep -o "All:[0-9.]*" | cut -d: -f2
}

echo "== $nama (tujuan ${tujuan:-tidak ada}, ${detik} detik, loop=$loop)"

# 1. Ukuran, durasi, codec, suara
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate \
  -show_entries format=duration -of compact "$f"
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
awk -v d="$dur" -v t="$detik" 'BEGIN{x=d-t; if(x<0)x=-x; printf "Durasi %.2f s (target %d, selisih %.2f): %s\n", d, t, x, (x<=0.2?"LOLOS":"GAGAL")}'
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | grep -q .; then
  echo "Suara: ADA trek audio (harus mati, dibuang saat olah web)"
else
  echo "Suara: tidak ada, LOLOS"
fi

# 2. Lembar kontak 12 gambar
ffmpeg -v error -y -i "$f" -vf "fps=12/$dur,scale=320:-1,tile=6x2" -frames:v 1 "$keluar/lembar.jpg"
echo "Lembar kontak: $keluar/lembar.jpg"

# 3. Bingkai awal, tengah, akhir
ffmpeg -v error -y -i "$f" -frames:v 1 "$keluar/awal.png"
ffmpeg -v error -y -ss "$(awk -v d="$dur" 'BEGIN{print d/2}')" -i "$f" -frames:v 1 "$keluar/tengah.png"
ffmpeg -v error -y -sseof -0.05 -i "$f" -frames:v 1 "$keluar/akhir.png"

if [ -n "$tujuan" ]; then
  s="$(ssim "$keluar/akhir.png" "$bingkai/$tujuan.png")"
  awk -v s="$s" -v k="$tujuan" 'BEGIN{printf "SSIM akhir vs %s: %s (min 0,85): %s\n", k, s, (s>=0.85?"LOLOS":"GAGAL, pakai penutup 9.4")}'
  s0="$(ssim "$keluar/awal.png" "$bingkai/$tujuan.png")"
  echo "SSIM awal vs $tujuan (info): $s0"
fi

# 4. Loop: awal vs akhir, plus bingkai paling mirip dengan awal di sepertiga akhir
if [ "$loop" = 1 ]; then
  s="$(ssim "$keluar/awal.png" "$keluar/akhir.png")"
  awk -v s="$s" 'BEGIN{printf "SSIM loop awal vs akhir: %s: %s\n", s, (s>=0.95?"LOLOS":(s>=0.90?"POTONG + SILANG 0,5 s (7.7)":"GAGAL, ulang"))}'
  ffmpeg -v error -i "$f" -loop 1 -i "$keluar/awal.png" \
    -lavfi "[0]scale=1280:720,setpts=PTS-STARTPTS[a];[1]scale=1280:720[b];[a][b]ssim=stats_file=$keluar/ssim-loop.txt:shortest=1" -f null - 2>/dev/null || true
  awk -v d="$dur" '{split($0,x," "); for(i in x){ if(x[i]~/^n:/)n=substr(x[i],3)+0; if(x[i]~/^All:/)a=substr(x[i],5)+0} r[n]=a; m=n}
       END{best=0; bn=0; for(i=int(m*2/3);i<=m;i++) if(r[i]>best){best=r[i]; bn=i}
           printf "Bingkai paling mirip awal (sepertiga akhir): no %d dari %d, SSIM %s\n", bn, m, best}' "$keluar/ssim-loop.txt"
fi

# 5. Kedip: lonjakan rata-rata terang antarbingkai
ffmpeg -v error -i "$f" -vf "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$keluar/yavg.txt" -f null - || true
awk -F= '/YAVG/{y=$2; if(p!=""){d=y-p; if(d<0)d=-d; if(d>mx)mx=d} p=y; s+=y; n++}
  END{printf "Terang rata-rata %.1f, lompatan terbesar antarbingkai %.2f: %s\n", s/n, mx, (mx<3?"LOLOS":"PERIKSA (mungkin kedip)")}' "$keluar/yavg.txt"

echo "Bingkai untuk dilihat: $keluar/awal.png $keluar/tengah.png $keluar/akhir.png"
