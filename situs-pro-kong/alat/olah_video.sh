#!/usr/bin/env bash
# Olah video Seedance untuk web (PRD 7.7). Aman diulang; menimpa hasil lama.
#
#   1. Seragamkan: H.264 1280x720 tanpa suara, durasi film disesuaikan dengan
#      setpts (tanpa interpolasi: semua bingkai asli dipakai, hanya jaraknya diubah).
#   2. Film V1-V5: urutan WebP film/d (1280x720, 12 fps, q60) dan film/h
#      (potongan 405x720, 10 fps, q55), lalu film/daftar.json.
#   3. Loop V0 dan V6: potong di bingkai paling mirip bingkai 0, silang, lalu
#      MP4 + WebM 1280 dan 540, poster 1280 dan 540 dari bingkai pertama loop.
#   4. Gambar diam dari video: komik 6 panel (film/diam) dan latar panel Bab 2.
#
# Pakai (butuh ffmpeg dengan libx264, libvpx-vp9, libwebp; Python + Pillow + NumPy):
#   situs-pro-kong/alat/olah_video.sh            # semua langkah
#   situs-pro-kong/alat/olah_video.sh film loop  # sebagian: film, loop, diam
# Berkas antara ada di situs-pro-kong/kerja/ (tidak di-commit).
set -euo pipefail

akar="$(cd "$(dirname "$0")/.." && pwd)"
cd "$akar"
mentah=video-mentah
kerja=kerja
vbk=aset/vbkong
langkah="${*:-film loop diam}"

# Film: kunci, berkas mentah, detik target, GESER (geser potongan HP dalam piksel,
# + ke kanan). Semua 0: subjek tetap di potongan tengah sepanjang klip (dicek dari
# lembar kontak berkotak potongan, 14 Oktober 2026).
FILM="f1 vk-f1-panggung-bangun 5 0
f2 vk-f2-lepas-landas 5 0
f3 vk-f3-bibir-podium 8 0
f4 vk-f4-di-udara 5 0
f5 vk-f5-menukik 7 0"

# Loop: kunci, berkas mentah, POTONG, SILANG, kiri potongan HP 720x720.
# POTONG = nomor bingkai (mulai 0) yang paling mirip bingkai 0; bingkai 0 sampai
# POTONG-1 dipakai. cek_klip.sh mencetak nomor mulai 1, jadi "no 144" = 143.
# SILANG = panjang silang dalam bingkai 24 fps (hasil: POTONG-SILANG bingkai).
#  - hero: bingkai 143 paling mirip bingkai 0 (SSIM 0,983), tetapi itu karena
#    bingkai 138-143 berbelok cepat ke kemiringan bingkai 0 (tarikan bingkai
#    akhir Seedance). Silang 12 bingkai (0,5 s) mencampur amplop tegak dengan
#    amplop miring sehingga tepinya tampak dobel sekitar 0,25 s; tidak ada titik
#    potong lain yang fasenya lebih cocok. Silang 4 bingkai tidak dobel dan
#    sambungannya (SSIM 0,992) lebih halus dari rata-rata antarbingkai (0,983).
#  - sorot: bingkai 138-143 dan 0-8 sama-sama diam (lampu padam). Silang 5
#    bingkai seluruhnya jatuh di bagian diam itu, menghaluskan geseran kecil
#    tepi podium di sambungan.
LOOP="hero vk-hero-loop 143 4 280
sorot vk-ft-sorotan-loop 143 5 269"

mkdir -p "$kerja" "$vbk/film/d" "$vbk/film/h" "$vbk/video"

jumlah_bingkai() {
  ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$1" < /dev/null
}
jalan=()
bg() { "$@" & jalan+=("$!"); }
tunggu() { local p; for p in "${jalan[@]}"; do wait "$p"; done; jalan=(); }
kb() { echo $(( $(stat -c %s "$1") / 1024 )); }
batas() { # berkas, batas KB
  local k; k="$(kb "$1")"
  if [ "$k" -gt "$2" ]; then echo "  MELEBIHI: $1 $k KB (batas $2 KB, naikkan -crf 2 angka)"; else echo "  $1 $k KB (batas $2 KB)"; fi
}

if [[ " $langkah " == *" film "* ]]; then
  echo "== Film V1-V5"
  while read -r k nama detik geser; do
    n="$(jumlah_bingkai "$mentah/$nama.mp4")"
    # Langkah 1: setpts meratakan n bingkai asli ke detik target (n/detik fps), tanpa bingkai baru.
    ffmpeg -nostdin -v error -y -i "$mentah/$nama.mp4" -an \
      -vf "setpts=N*$detik/$n/TB,scale=1280:720:flags=lanczos,format=yuv420p" \
      -r "$n/$detik" -c:v libx264 -crf 16 -preset slow "$kerja/$k.mp4"
    rm -f "$vbk/film/d/${k}_"*.webp "$vbk/film/h/${k}_"*.webp
    # Langkah 2. HP dipotong di RGB supaya lebarnya tepat 405 (di yuv420p dibulatkan ke 404).
    bg ffmpeg -nostdin -v error -y -i "$kerja/$k.mp4" -vf "fps=12" -c:v libwebp -quality 60 -compression_level 6 "$vbk/film/d/${k}_%03d.webp"
    bg ffmpeg -nostdin -v error -y -i "$kerja/$k.mp4" -vf "fps=10,format=bgra,crop=405:720:(iw-405)/2+$geser:0" -c:v libwebp -quality 55 -compression_level 6 "$vbk/film/h/${k}_%03d.webp"
    tunggu
    printf "  %s: %s bingkai mentah -> %s s (%s fps). d %s bingkai, h %s bingkai, GESER %s\n" "$k" "$n" "$detik" \
      "$(awk -v n="$n" -v d="$detik" 'BEGIN{printf "%.2f", n/d}')" \
      "$(find "$vbk/film/d" -name "${k}_*.webp" | wc -l)" "$(find "$vbk/film/h" -name "${k}_*.webp" | wc -l)" "$geser"
  done <<< "$FILM"
  {
    printf '{"d":{'
    for k in f1 f2 f3 f4 f5; do printf '"%s":%s,' "$k" "$(find "$vbk/film/d" -name "${k}_*.webp" | wc -l)"; done
    printf '"w":1280,"h":720},"h":{'
    for k in f1 f2 f3 f4 f5; do printf '"%s":%s,' "$k" "$(find "$vbk/film/h" -name "${k}_*.webp" | wc -l)"; done
    printf '"w":405,"h":720}}\n'
  } > "$vbk/film/daftar.json"
  echo "  daftar.json: $(cat "$vbk/film/daftar.json")"
  echo "  film/d $(du -ck "$vbk/film/d/"*.webp | tail -1 | cut -f1) KB, film/h $(du -ck "$vbk/film/h/"*.webp | tail -1 | cut -f1) KB"
fi

if [[ " $langkah " == *" loop "* ]]; then
  echo "== Loop V0, V6"
  while read -r k nama potong silang kiri; do
    ffmpeg -nostdin -v error -y -i "$mentah/$nama.mp4" -an -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
      -c:v libx264 -crf 16 -preset slow "$kerja/$k.mp4"
    # Silang (rumus 7.7 dengan satuan bingkai): isi = bingkai SILANG..POTONG-1, ekornya
    # memudar ke kepala = bingkai 0..SILANG-1, sehingga akhir loop menyambung ke awalnya.
    ffmpeg -nostdin -v error -y -i "$kerja/$k.mp4" -filter_complex \
      "[0]trim=end_frame=$potong,setpts=PTS-STARTPTS,split[a][b];[a]trim=start_frame=$silang,setpts=PTS-STARTPTS[isi];[b]trim=end_frame=$silang,setpts=PTS-STARTPTS[kepala];[isi][kepala]xfade=transition=fade:duration=$(awk -v s="$silang" 'BEGIN{printf "%.6f", s/24}'):offset=$(awk -v p="$potong" -v s="$silang" 'BEGIN{printf "%.6f", (p-2*s)/24}'),format=yuv420p" \
      -an -c:v libx264 -crf 16 -preset slow "$kerja/$k-mulus.mp4"
    m="$kerja/$k-mulus.mp4"; v="$vbk/video/$k"; hp="crop=720:720:$kiri:0,scale=540:540:flags=lanczos"
    bg ffmpeg -nostdin -v error -y -i "$m" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart "$v-1280.mp4"
    bg ffmpeg -nostdin -v error -y -i "$m" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -pix_fmt yuv420p "$v-1280.webm"
    bg ffmpeg -nostdin -v error -y -i "$m" -an -vf "$hp" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 28 -preset slow -movflags +faststart "$v-540.mp4"
    bg ffmpeg -nostdin -v error -y -i "$m" -an -vf "$hp" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -pix_fmt yuv420p "$v-540.webm"
    bg ffmpeg -nostdin -v error -y -i "$m" -frames:v 1 -c:v libwebp -quality 70 "$v-poster-1280.webp"
    bg ffmpeg -nostdin -v error -y -i "$m" -frames:v 1 -vf "$hp" -c:v libwebp -quality 68 "$v-poster-540.webp"
    tunggu
    echo "  $k: bingkai 0-$((potong - 1)), silang $silang bingkai -> $(jumlah_bingkai "$m") bingkai, $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$m" < /dev/null) s"
    batas "$v-1280.mp4" 900; batas "$v-540.mp4" 350; batas "$v-1280.webm" 900; batas "$v-540.webm" 350
    batas "$v-poster-1280.webp" 60; batas "$v-poster-540.webp" 60
  done <<< "$LOOP"
fi

if [[ " $langkah " == *" diam "* ]]; then
  echo "== Gambar diam dari video"
  for k in f1 f2 f3 f4 f5; do
    [ -f "$kerja/$k.mp4" ] || { echo "Tidak ada $kerja/$k.mp4: jalankan langkah film dulu" >&2; exit 1; }
  done
  mkdir -p "$kerja/diam"
  # Komik 6 panel: kunci film, detik (dari durasi target; "akhir" = bingkai terakhir).
  i=0
  for pilih in f1:akhir f2:2.2 f3:4 f4:2.0 f5:2.4 f5:akhir; do
    i=$((i + 1)); k="${pilih%%:*}"; t="${pilih#*:}"
    if [ "$t" = akhir ]; then
      ffmpeg -nostdin -v error -y -sseof -0.3 -i "$kerja/$k.mp4" -update 1 "$kerja/diam/$i.png"
    else
      ffmpeg -nostdin -v error -y -ss "$t" -i "$kerja/$k.mp4" -frames:v 1 "$kerja/diam/$i.png"
    fi
  done
  python3 alat/diam_dari_bingkai.py --video "$kerja/diam" | sed 's/^/  /'
  # Latar panel Bab 2: buram dan digelapkan, kualitas 50.
  for pilih in api:f2:2.5 endpoint:f4:1 domain:f3:4; do
    IFS=: read -r nama k t <<< "$pilih"
    ffmpeg -nostdin -v error -y -ss "$t" -i "$kerja/$k.mp4" -frames:v 1 -vf "gblur=sigma=14,eq=brightness=-0.12" \
      -c:v libwebp -quality 50 "$vbk/gambar/latar-$nama.webp"
    echo "  gambar/latar-$nama.webp ($k detik $t) $(kb "$vbk/gambar/latar-$nama.webp") KB"
  done
fi
