#!/usr/bin/env python3
"""Ukur warna dominan sebuah gambar (hex + persentase luas).

Pakai:
  python3 extract_palette.py <gambar> [--colors 6]
  python3 extract_palette.py --self-test

Butuh Pillow. Hasil adalah pengamatan terukur atas FILE yang diberikan;
gambar yang sudah dikompres atau diperkecil bisa berbeda dari aslinya.
"""
import json
import sys


def palette(image, colors=6):
    from PIL import Image

    img = image.convert("RGB")
    img.thumbnail((400, 400))
    quant = img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    pal = quant.getpalette()
    total = img.width * img.height
    rows = []
    for count, index in sorted(quant.getcolors(), reverse=True):
        r, g, b = pal[index * 3: index * 3 + 3]
        lum = round((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, 2)
        rows.append({"hex": f"#{r:02X}{g:02X}{b:02X}", "persen": round(100 * count / total, 1), "terang_0_1": lum})
    return rows


def self_test():
    from PIL import Image

    img = Image.new("RGB", (100, 100), (200, 30, 30))
    img.paste((30, 30, 200), (0, 0, 100, 25))
    rows = palette(img, colors=2)
    assert len(rows) == 2, rows
    assert rows[0]["hex"] == "#C81E1E" and abs(rows[0]["persen"] - 75.0) < 1, rows
    assert rows[1]["hex"] == "#1E1EC8" and abs(rows[1]["persen"] - 25.0) < 1, rows
    print("SELF-TEST OK")
    return 0


def main(argv):
    if "--self-test" in argv:
        try:
            return self_test()
        except ImportError:
            print("Pillow tidak terpasang; skrip tidak bisa dijalankan di lingkungan ini.")
            return 2
    if len(argv) < 2:
        print(__doc__)
        return 1
    colors = int(argv[argv.index("--colors") + 1]) if "--colors" in argv else 6
    try:
        from PIL import Image
    except ImportError:
        print("Pillow tidak terpasang; tulis warna sebagai perkiraan mata.")
        return 2
    try:
        with Image.open(argv[1]) as img:
            size = img.size
            rows = palette(img, colors)
    except OSError as exc:
        print(f"Gambar tidak bisa dibuka: {exc}")
        return 1
    print(json.dumps({"file": argv[1], "pixel": list(size), "warna": rows}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
