#!/usr/bin/env python3
"""Ekspor file cetak dari gambar master menurut rencana rasio.

Masukan: gambar master + rencana JSON buatan print_math.py (skill wall-art-ratio-resolution-planner).
Keluaran: satu JPEG per rasio (sRGB, tag DPI, di bawah batas ukuran file) + laporan JSON.

Pakai:
  python3 export_print_files.py --image master.png --plan rencana.json --out ekspor/ --name satwa-tropis-01
  ... [--max-mb 20] [--quality 95] [--min-quality 82] [--allow-upscale 1.0]

Butuh Pillow. Skrip tidak pernah memperbesar gambar melebihi --allow-upscale (default 1.0 = tidak sama sekali);
pembesaran dengan cara ini hanya menambah pixel, bukan detail.
"""
import argparse
import io
import json
import re
import sys
from pathlib import Path


def to_srgb(img, warnings):
    from PIL import Image, ImageCms

    srgb = ImageCms.createProfile("sRGB")
    srgb_bytes = ImageCms.ImageCmsProfile(srgb).tobytes()
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        if rgba.getextrema()[3][0] < 255:
            warnings.append("gambar punya bagian tembus pandang; diratakan di atas putih")
        base = Image.new("RGB", rgba.size, (255, 255, 255))
        base.paste(rgba, mask=rgba.split()[3])
        img = base
    embedded = img.info.get("icc_profile")
    if embedded:
        try:
            source = ImageCms.ImageCmsProfile(io.BytesIO(embedded))
            img = ImageCms.profileToProfile(img, source, srgb, outputMode="RGB")
        except Exception as exc:  # profil rusak atau tidak didukung
            warnings.append(f"profil warna bawaan tidak bisa dikonversi ({exc}); dianggap sRGB")
            img = img.convert("RGB")
    else:
        if img.mode == "CMYK":
            warnings.append("gambar CMYK tanpa profil; dikonversi kasar ke RGB, periksa warnanya")
        elif img.mode != "RGB":
            warnings.append(f"mode {img.mode} dikonversi ke RGB")
        img = img.convert("RGB")
    return img, srgb_bytes


def save_under_limit(img, path, ppi, icc, max_bytes, quality, min_quality):
    q = quality
    while True:
        buffer = io.BytesIO()
        img.save(buffer, "JPEG", quality=q, dpi=(ppi, ppi), icc_profile=icc,
                 subsampling=0 if q >= 90 else 2, optimize=True)
        if buffer.tell() <= max_bytes or q <= min_quality:
            path.write_bytes(buffer.getvalue())
            return q, buffer.tell()
        q = max(min_quality, q - 3)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Ekspor file cetak per rasio dari gambar master.")
    parser.add_argument("--image", required=True)
    parser.add_argument("--plan", required=True, help="JSON dari print_math.py")
    parser.add_argument("--out", required=True, help="folder keluaran")
    parser.add_argument("--name", required=True, help="nama dasar file, huruf kecil-angka-tanda hubung")
    parser.add_argument("--max-mb", type=float, default=20, help="batas ukuran per file (cek catatan fakta Etsy)")
    parser.add_argument("--quality", type=int, default=95)
    parser.add_argument("--min-quality", type=int, default=82)
    parser.add_argument("--allow-upscale", type=float, default=1.0)
    args = parser.parse_args(argv)

    if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", args.name):
        print("Nama dasar harus huruf kecil, angka, dan tanda hubung (contoh: satwa-tropis-01).")
        return 1
    try:
        from PIL import Image
    except ImportError:
        print("Pillow tidak terpasang; ekspor tidak bisa dijalankan di lingkungan ini.")
        return 2
    Image.MAX_IMAGE_PIXELS = 400_000_000
    try:
        plan = json.loads(Path(args.plan).read_text(encoding="utf-8"))
        master = Image.open(args.image)
        master.load()
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Masukan tidak bisa dibaca: {exc}")
        return 1
    if list(master.size) != [plan["master"]["width"], plan["master"]["height"]]:
        print(f"Ukuran gambar {master.size} tidak sama dengan rencana "
              f"({plan['master']['width']} x {plan['master']['height']}). Buat ulang rencana untuk gambar ini.")
        return 1

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    ppi = int(round(plan["target_ppi"]))
    max_bytes = int(args.max_mb * 1024 * 1024)
    global_warnings = []
    rgb, icc = to_srgb(master, global_warnings)
    report = {"master": args.image, "ppi_tag": ppi, "max_mb": args.max_mb, "warnings": global_warnings, "files": []}
    failed = False
    for ratio in plan["ratios"]:
        warnings = []
        crop = rgb.crop(tuple(ratio["crop_box"]))
        target_w, target_h = ratio["export_px"]
        factor = target_w / crop.width
        if factor > args.allow_upscale + 1e-6:
            target_w, target_h = crop.size
            warnings.append(f"butuh pembesaran {factor:.2f}x; tidak dilakukan, memakai pixel asli crop")
        if (target_w, target_h) != crop.size:
            crop = crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
        label = ratio.get("export_for_size")
        if label is None:
            label = "native"
            warnings.append("belum mencapai target PPI di ukuran mana pun; jangan diklaim untuk ukuran besar")
        suffix = f"{label.lower()}in" if re.match(r"^\d+x\d+$", label) else label.lower()
        filename = f"{args.name}_{ratio['key']}_{suffix}.jpg"
        path = out_dir / filename
        used_q, size = save_under_limit(crop, path, ppi, icc, max_bytes, args.quality, args.min_quality)
        over = size > max_bytes
        if over:
            failed = True
            warnings.append(f"masih {size / 1048576:.1f} MB pada kualitas {used_q}; di atas batas {args.max_mb} MB")
        elif used_q < args.quality:
            warnings.append(f"kualitas diturunkan ke {used_q} agar di bawah batas ukuran")
        report["files"].append({"file": filename, "ratio": ratio["key"], "for_size": label,
                                "pixel": [crop.width, crop.height], "mb": round(size / 1048576, 2),
                                "jpeg_quality": used_q, "over_limit": over, "warnings": warnings})
        flag = "GAGAL" if over else "ok"
        print(f"{flag:5} {filename}  {crop.width} x {crop.height} px  {size / 1048576:.2f} MB  q{used_q}"
              + ("  | " + "; ".join(warnings) if warnings else ""))
    for w in global_warnings:
        print("PERINGATAN:", w)
    report_path = out_dir / f"{args.name}_laporan-ekspor.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Laporan: {report_path}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
