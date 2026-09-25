#!/usr/bin/env python3
"""
Convert the VenbeeMail bird logo (JPG on black) into:
  public/brand/venbee-bird.svg   – clean layered vector (cream die-cut, black line, grey-brown body, red beak)
  public/brand/venbee-bird.png   – high-res transparent PNG (rendered separately, see README)

Pipeline
  1. Flood-fill the black background from the image border → sticker silhouette
     (the cream die-cut border stops the fill, so inner black line-art is kept).
  2. Upsample 2x and classify every pixel to the nearest palette colour.
  3. Trace stacked layers with potrace (each layer = union of itself and every layer
     painted above it, so no hairline seams show between colours).

Requires: pip install numpy pillow scipy opencv-python-headless potracer
"""
import sys
from pathlib import Path

import cv2
import numpy as np
import potrace
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "venbee-bird-source.jpg"
OUT_SVG = ROOT / "src" / "assets" / "brand" / "venbee-bird.svg"
OUT_META = ROOT / "src" / "assets" / "brand" / "venbee-bird.json"

PALETTE = {
    "cream": (250, 233, 197),
    "black": (10, 10, 10),
    "body": (151, 139, 117),
    "red": (252, 43, 13),
}
# Official hex values used in the page CSS
HEX = {"cream": "#F5E6C8", "black": "#0A0A0A", "body": "#8C7B6B", "red": "#FF3A1F"}
# Keep the logo's own tones (slightly warmer than the page palette) so it stays faithful
LOGO_HEX = {"cream": "#FAE9C5", "black": "#0A0A0A", "body": "#978B75", "red": "#FC2B0D"}

SCALE = 2


def main():
    img = np.array(Image.open(SRC).convert("RGB")).astype(np.float32)
    h, w, _ = img.shape
    lum = img.mean(axis=2)

    # 1. background = dark pixels connected to the border
    dark = lum < 70
    labels, _ = ndimage.label(dark)
    border_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])))
    border_labels.discard(0)
    bg = np.isin(labels, list(border_labels))
    sil = ~bg
    sil = ndimage.binary_fill_holes(sil)

    ys, xs = np.where(sil)
    pad = 24
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h)
    img = img[y0:y1, x0:x1]
    sil = sil[y0:y1, x0:x1]
    h, w = sil.shape

    # 2. upsample + classify
    big = cv2.resize(img, (w * SCALE, h * SCALE), interpolation=cv2.INTER_CUBIC)
    big = cv2.bilateralFilter(big, 5, 30, 5)
    silf = cv2.resize(sil.astype(np.float32), (w * SCALE, h * SCALE), interpolation=cv2.INTER_LINEAR)
    silf = cv2.GaussianBlur(silf, (0, 0), 3.2)  # smooth the die-cut edge
    sil_big = silf > 0.5

    names = list(PALETTE)
    pal = np.array([PALETTE[n] for n in names], dtype=np.float32)
    d = ((big[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    cls = d.argmin(-1)
    cls = cv2.medianBlur(cls.astype(np.uint8), 5)
    cls[~sil_big] = 255

    def mask(*keep):
        m = np.isin(cls, [names.index(k) for k in keep])
        return m & sil_big

    layers = [
        ("cream", sil_big),
        ("black", mask("black", "body", "red")),
        ("body", mask("body")),
        ("red", mask("red")),
    ]

    paths = []
    for name, m in layers:
        m = ndimage.binary_opening(m, iterations=1) if name in ("body", "red") else m
        bm = potrace.Bitmap(~m)  # potracer treats True as paper (white)
        try:
            plist = bm.trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.2)
        except ValueError:  # potracer's curve optimiser occasionally hits a math domain error
            plist = bm.trace(turdsize=12, alphamax=1.0, opticurve=False)
        d = []
        for curve in plist:
            sp = curve.start_point
            d.append(f"M{sp.x / SCALE:.1f} {sp.y / SCALE:.1f}")
            for seg in curve.segments:
                if seg.is_corner:
                    d.append(f"L{seg.c.x / SCALE:.1f} {seg.c.y / SCALE:.1f}L{seg.end_point.x / SCALE:.1f} {seg.end_point.y / SCALE:.1f}")
                else:
                    d.append(
                        f"C{seg.c1.x / SCALE:.1f} {seg.c1.y / SCALE:.1f} {seg.c2.x / SCALE:.1f} {seg.c2.y / SCALE:.1f} "
                        f"{seg.end_point.x / SCALE:.1f} {seg.end_point.y / SCALE:.1f}"
                    )
            d.append("Z")
        paths.append((name, "".join(d)))
        print(f"traced {name}: {len(plist)} curves", file=sys.stderr)

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
        "<title>VenbeeMail bird</title>",
    ]
    for name, d in paths:
        svg.append(f'<path id="{name}" fill="{LOGO_HEX[name]}" fill-rule="evenodd" d="{d}"/>')
    svg.append("</svg>")
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text("\n".join(svg))
    # offset of the crop in the source image — used to place the blink eyelid
    OUT_META.write_text(f'{{"width":{w},"height":{h},"cropX":{x0},"cropY":{y0}}}\n')
    print(f"wrote {OUT_SVG} ({OUT_SVG.stat().st_size // 1024} KB) viewBox {w}x{h}, crop offset {x0},{y0}", file=sys.stderr)


if __name__ == "__main__":
    main()
