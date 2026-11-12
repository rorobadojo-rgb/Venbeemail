#!/usr/bin/env python3
"""Buat tiga gambar listing dasar dari karya, tanpa mengubah karyanya.

  1. <nama>_01-bingkai.jpg  karya di dalam bingkai datar pada dinding polos (tanpa teks)
  2. <nama>_02-ukuran.jpg   daftar rasio dan ukuran yang termasuk (butuh --plan dari print_math.py)
  3. <nama>_03-detail.jpg   potongan dekat pada titik fokus, memperlihatkan tekstur sebenarnya

Pakai:
  python3 make_listing_images.py --image karya.jpg --out gambar-listing/ --name satwa-tropis-01
        [--plan rencana-cetak.json] [--focus 0.5,0.5] [--wall "#E8E2D6"] [--frame "#3A2E25"] [--size 2000]

Butuh Pillow. Ini mockup datar buatan skrip, bukan foto ruangan. Karya ditempel apa adanya
(hanya diperkecil), sehingga warna dan bentuknya tidak berubah. Teks pada gambar 2 berbahasa Inggris.
"""
import argparse
import json
import re
import sys
from pathlib import Path


def font(size):
    from PIL import ImageFont
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow lama: hanya huruf bitmap kecil
        return ImageFont.load_default()


def hex_color(value):
    if not re.match(r"^#[0-9A-Fa-f]{6}$", value):
        raise ValueError(f"warna harus berformat #RRGGBB: {value}")
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5))


def framed(art, size, wall, frame):
    from PIL import Image, ImageDraw, ImageFilter

    canvas = Image.new("RGB", (size, size), wall)
    max_h, max_w = int(size * 0.66), int(size * 0.56)
    scale = min(max_w / art.width, max_h / art.height)
    aw, ah = int(art.width * scale), int(art.height * scale)
    art_small = art.resize((aw, ah), Image.Resampling.LANCZOS)
    mat, bar = int(size * 0.035), int(size * 0.014)
    fw, fh = aw + 2 * (mat + bar), ah + 2 * (mat + bar)
    fx, fy = (size - fw) // 2, int((size - fh) * 0.42)
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle((fx + bar, fy + bar * 2, fx + fw + bar, fy + fh + bar * 2), fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.012))
    canvas.paste(shadow, (0, 0), shadow)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((fx, fy, fx + fw, fy + fh), fill=frame)
    draw.rectangle((fx + bar, fy + bar, fx + fw - bar, fy + fh - bar), fill=(250, 248, 243))
    canvas.paste(art_small, (fx + bar + mat, fy + bar + mat))
    floor = int(size * 0.90)
    draw.rectangle((0, floor, size, size), fill=tuple(max(0, c - 22) for c in wall))
    return canvas


def size_sheet(plan, size, wall):
    from PIL import Image, ImageDraw

    canvas = Image.new("RGB", (size, size), (250, 248, 243))
    draw = ImageDraw.Draw(canvas)
    ink = (58, 46, 37)
    draw.text((size * 0.07, size * 0.06), "WHAT'S INCLUDED", font=font(int(size * 0.05)), fill=ink)
    rows = []
    for ratio in plan["ratios"]:
        ok = [s["size"] for s in ratio["sizes"] if s["status"] == "ok"]
        if ok:
            rows.append((ratio, ok))
    draw.text((size * 0.07, size * 0.135),
              f"{len(rows)} high-resolution JPG files, {int(plan['target_ppi'])} DPI", font=font(int(size * 0.028)), fill=ink)
    top, row_h = size * 0.22, (size * 0.62) / max(1, len(rows))
    for i, (ratio, ok) in enumerate(rows):
        y = top + i * row_h
        cw, ch = ratio["crop_px"]
        box_h = row_h * 0.74
        box_w = box_h * cw / ch
        x = size * 0.07 + (size * 0.14 - box_w) / 2
        draw.rectangle((x, y, x + box_w, y + box_h), outline=ink, width=max(2, size // 400), fill=wall)
        label = "ISO A-series" if ratio["key"] == "iso" else f"Ratio {ratio['label']}"
        draw.text((size * 0.25, y + box_h * 0.08), label, font=font(int(size * 0.032)), fill=ink)
        sizes = ", ".join(s if s.upper().startswith("A") else f'{s}"' for s in ok)
        draw.text((size * 0.25, y + box_h * 0.52), sizes, font=font(int(size * 0.024)), fill=ink)
    draw.text((size * 0.07, size * 0.90), "Digital download. No physical item is shipped. Frame not included.",
              font=font(int(size * 0.024)), fill=ink)
    return canvas


def detail(art, size, focus):
    from PIL import Image

    side = min(art.width, art.height, size)
    left = int(max(0, min(art.width - side, focus[0] * art.width - side / 2)))
    top = int(max(0, min(art.height - side, focus[1] * art.height - side / 2)))
    crop = art.crop((left, top, left + side, top + side))
    if side != size:
        crop = crop.resize((size, size), Image.Resampling.LANCZOS)
    return crop, side


def main(argv=None):
    parser = argparse.ArgumentParser(description="Buat gambar listing dasar.")
    parser.add_argument("--image", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--plan")
    parser.add_argument("--focus", default="0.5,0.5")
    parser.add_argument("--wall", default="#E8E2D6")
    parser.add_argument("--frame", default="#3A2E25")
    parser.add_argument("--size", type=int, default=2000)
    args = parser.parse_args(argv)
    try:
        from PIL import Image
    except ImportError:
        print("Pillow tidak terpasang; gambar listing tidak bisa dibuat di lingkungan ini.")
        return 2
    Image.MAX_IMAGE_PIXELS = 400_000_000
    try:
        wall, frame = hex_color(args.wall), hex_color(args.frame)
        focus = tuple(float(v) for v in args.focus.split(","))
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", args.name):
            raise ValueError("nama dasar harus huruf kecil, angka, dan tanda hubung")
        art = Image.open(args.image).convert("RGB")
    except (OSError, ValueError) as exc:
        print(f"Masukan salah: {exc}")
        return 1
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    made = []

    path = out / f"{args.name}_01-bingkai.jpg"
    framed(art, args.size, wall, frame).save(path, "JPEG", quality=88, optimize=True)
    made.append((path, "karya dalam bingkai datar, tanpa teks"))

    if args.plan:
        try:
            plan = json.loads(Path(args.plan).read_text(encoding="utf-8"))
            path = out / f"{args.name}_02-ukuran.jpg"
            size_sheet(plan, args.size, wall).save(path, "JPEG", quality=88, optimize=True)
            made.append((path, "rasio dan ukuran yang berstatus ok di rencana cetak"))
        except (OSError, json.JSONDecodeError, KeyError) as exc:
            print(f"PERINGATAN: gambar ukuran dilewati, rencana cetak tidak bisa dibaca ({exc})")
    else:
        print("CATATAN: tanpa --plan, gambar ukuran tidak dibuat.")

    crop, side = detail(art, args.size, focus)
    path = out / f"{args.name}_03-detail.jpg"
    crop.save(path, "JPEG", quality=88, optimize=True)
    made.append((path, f"potongan {side} x {side} pixel dari karya"
                       + ("" if side == args.size else f", diperbesar ke {args.size} (karya lebih kecil dari {args.size} pixel)")))

    for path, note in made:
        print(f"dibuat: {path}  {path.stat().st_size / 1024:.0f} KB  ({note})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
