#!/usr/bin/env python3
"""Rencana rasio, crop, dan kecukupan pixel untuk file cetak wall art.

Masukan: ukuran pixel gambar master (atau filenya), target PPI, titik fokus.
Keluaran: untuk tiap rasio, kotak crop, bagian yang tersisa, PPI pada tiap ukuran cetak,
ukuran terbesar yang layak, dan ukuran pixel file yang akan diekspor.

Pakai:
  python3 print_math.py --width 7200 --height 10800
  python3 print_math.py --image master.png --ppi 300 --min-ppi 150 --focus 0.5,0.6 --json rencana.json
  python3 print_math.py --width 4000 --height 6000 --ratios 2x3,4x5,iso

Hanya pustaka standar; Pillow hanya dibutuhkan untuk --image.
PPI = pixel per inci pada ukuran cetak. Semua angka adalah hitungan, bukan janji mutu cetak.
"""
import argparse
import json
import sys

MM_PER_INCH = 25.4

# Rasio ditulis untuk gambar tegak: (lebar, tinggi). Ukuran dalam inci, kecuali seri A dalam mm.
RATIOS = {
    "2x3": {"label": "2:3", "aspect": (2, 3),
            "sizes": [("4x6", 4, 6), ("8x12", 8, 12), ("12x18", 12, 18), ("16x24", 16, 24), ("20x30", 20, 30), ("24x36", 24, 36)]},
    "3x4": {"label": "3:4", "aspect": (3, 4),
            "sizes": [("6x8", 6, 8), ("9x12", 9, 12), ("12x16", 12, 16), ("18x24", 18, 24)]},
    "4x5": {"label": "4:5", "aspect": (4, 5),
            "sizes": [("4x5", 4, 5), ("8x10", 8, 10), ("16x20", 16, 20)]},
    "11x14": {"label": "11:14", "aspect": (11, 14),
              "sizes": [("11x14", 11, 14)]},
    "iso": {"label": "Seri A (ISO)", "aspect": (210, 297),
            "sizes": [("A5", 148 / MM_PER_INCH, 210 / MM_PER_INCH), ("A4", 210 / MM_PER_INCH, 297 / MM_PER_INCH),
                      ("A3", 297 / MM_PER_INCH, 420 / MM_PER_INCH), ("A2", 420 / MM_PER_INCH, 594 / MM_PER_INCH),
                      ("A1", 594 / MM_PER_INCH, 841 / MM_PER_INCH)]},
    "5x7": {"label": "5:7", "aspect": (5, 7),
            "sizes": [("5x7", 5, 7)]},
}
DEFAULT_RATIOS = ["2x3", "3x4", "4x5", "11x14", "iso"]


def clamp(value, low, high):
    return max(low, min(high, value))


def plan(width, height, ppi=300, min_ppi=150, focus=(0.5, 0.5), ratios=None):
    if width <= 0 or height <= 0:
        raise ValueError("lebar dan tinggi pixel harus lebih dari 0")
    if not (0 <= focus[0] <= 1 and 0 <= focus[1] <= 1):
        raise ValueError("titik fokus harus antara 0 dan 1")
    if min_ppi > ppi:
        raise ValueError("min-ppi tidak boleh lebih besar dari ppi")
    ratios = ratios or DEFAULT_RATIOS
    landscape = width > height
    out = {"master": {"width": width, "height": height, "orientation": "mendatar" if landscape else "tegak"},
           "target_ppi": ppi, "min_ppi": min_ppi, "focus": list(focus), "ratios": []}
    for key in ratios:
        if key not in RATIOS:
            raise ValueError(f"rasio tidak dikenal: {key} (pilihan: {', '.join(RATIOS)})")
        spec = RATIOS[key]
        aw, ah = spec["aspect"]
        if landscape:
            aw, ah = ah, aw
        target = aw / ah
        master = width / height
        if master > target:  # master lebih lebar: potong lebar
            crop_h = height
            crop_w = int(round(height * target))
        else:  # master lebih tinggi: potong tinggi
            crop_w = width
            crop_h = int(round(width / target))
        crop_w, crop_h = min(crop_w, width), min(crop_h, height)
        left = int(round(clamp(focus[0] * width - crop_w / 2, 0, width - crop_w)))
        top = int(round(clamp(focus[1] * height - crop_h / 2, 0, height - crop_h)))
        sizes, raw = [], {}
        for name, sw, sh in spec["sizes"]:
            if landscape:
                sw, sh = sh, sw
                if "x" in name:
                    a, b = name.split("x")
                    name = f"{b}x{a}"
            raw[name] = (sw, sh)
            actual = min(crop_w / sw, crop_h / sh)
            status = "ok" if actual >= ppi else ("cukup" if actual >= min_ppi else "kurang")
            sizes.append({"size": name, "width_in": round(sw, 2), "height_in": round(sh, 2),
                          "ppi": round(actual, 1), "status": status,
                          "upscale_needed": round(max(1.0, ppi / actual), 2)})
        ok_sizes = [s for s in sizes if s["status"] == "ok"]
        usable = [s for s in sizes if s["status"] in ("ok", "cukup")]
        claim = ok_sizes[-1] if ok_sizes else None
        if claim:
            export_w = int(round(raw[claim["size"]][0] * ppi))
            export_h = int(round(raw[claim["size"]][1] * ppi))
            export_w, export_h = min(export_w, crop_w), min(export_h, crop_h)
        else:
            export_w, export_h = crop_w, crop_h
        out["ratios"].append({
            "key": key, "label": spec["label"],
            "crop_box": [left, top, left + crop_w, top + crop_h],
            "crop_px": [crop_w, crop_h],
            "kept_width_pct": round(100 * crop_w / width, 1),
            "kept_height_pct": round(100 * crop_h / height, 1),
            "sizes": sizes,
            "largest_at_target_ppi": claim["size"] if claim else None,
            "largest_at_min_ppi": usable[-1]["size"] if usable else None,
            "export_px": [export_w, export_h],
            "export_for_size": claim["size"] if claim else None,
        })
    return out


def render(result):
    m = result["master"]
    lines = [f"MASTER {m['width']} x {m['height']} px ({m['orientation']})  target {result['target_ppi']} PPI, minimum {result['min_ppi']} PPI",
             f"Titik fokus: x={result['focus'][0]}, y={result['focus'][1]} (0 = kiri/atas, 1 = kanan/bawah)", ""]
    for r in result["ratios"]:
        lines.append(f"RASIO {r['label']}  crop {r['crop_px'][0]} x {r['crop_px'][1]} px  "
                     f"tersisa lebar {r['kept_width_pct']}%, tinggi {r['kept_height_pct']}%  kotak {r['crop_box']}")
        for s in r["sizes"]:
            note = "" if s["status"] == "ok" else f"  (perlu pembesaran {s['upscale_needed']}x untuk target)"
            lines.append(f"   {s['size']:>7}  {s['ppi']:>7} PPI  {s['status']}{note}")
        target = r["largest_at_target_ppi"] or "tidak ada"
        lines.append(f"   Terbesar pada target PPI: {target}; pada PPI minimum: {r['largest_at_min_ppi'] or 'tidak ada'}")
        lines.append(f"   File ekspor: {r['export_px'][0]} x {r['export_px'][1]} px"
                     + (f" untuk {r['export_for_size']}" if r["export_for_size"] else " (pixel asli crop; belum mencapai target di ukuran mana pun)"))
        lines.append("")
    lines.append("Arti status: ok = memenuhi target PPI; cukup = di antara minimum dan target (layak untuk dilihat dari jauh); kurang = di bawah minimum.")
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Rencana rasio dan resolusi cetak wall art.")
    parser.add_argument("--image", help="file gambar master (butuh Pillow)")
    parser.add_argument("--width", type=int, help="lebar pixel master")
    parser.add_argument("--height", type=int, help="tinggi pixel master")
    parser.add_argument("--ppi", type=float, default=300, help="target PPI (default 300)")
    parser.add_argument("--min-ppi", type=float, default=150, help="PPI minimum yang masih diterima (default 150)")
    parser.add_argument("--focus", default="0.5,0.5", help="titik fokus x,y antara 0 dan 1 (default tengah)")
    parser.add_argument("--ratios", default=",".join(DEFAULT_RATIOS), help="daftar rasio dipisah koma")
    parser.add_argument("--json", dest="json_path", help="simpan rencana sebagai JSON")
    args = parser.parse_args(argv)

    width, height = args.width, args.height
    if args.image:
        try:
            from PIL import Image
            Image.MAX_IMAGE_PIXELS = 400_000_000
            with Image.open(args.image) as img:
                width, height = img.size
        except ImportError:
            print("Pillow tidak terpasang. Berikan --width dan --height.")
            return 2
        except OSError as exc:
            print(f"Gambar tidak bisa dibuka: {exc}")
            return 1
    if not width or not height:
        parser.print_usage()
        print("Butuh --image, atau --width dan --height.")
        return 1
    try:
        fx, fy = (float(v) for v in args.focus.split(","))
        result = plan(width, height, args.ppi, args.min_ppi, (fx, fy),
                      [r.strip() for r in args.ratios.split(",") if r.strip()])
    except ValueError as exc:
        print(f"Masukan salah: {exc}")
        return 1
    if args.image:
        result["master"]["file"] = args.image
    print(render(result))
    if args.json_path:
        with open(args.json_path, "w", encoding="utf-8") as handle:
            json.dump(result, handle, indent=2, ensure_ascii=False)
        print(f"\nRencana disimpan: {args.json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
