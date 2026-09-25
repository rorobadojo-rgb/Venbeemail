#!/usr/bin/env python3
"""
Convert the official VenbeeMail bird (assets/mascot/venbee-bird-source.png)
into web assets:

  public/mascot/venbee-bird.png         transparent PNG, black background removed
                                        (venbee-bird@2x.png is this SVG rendered at 1600 px)
  public/mascot/venbee-bird.svg         layered vector trace (logo / static use)
  public/mascot/venbee-bird-raised.svg  frame 2: eyebrow (eye-mask bar) raised
  public/mascot/venbee-bird-blink.svg   frame 3: blink
  public/mascot/venbee-bird-body.svg    body *without* the eye + eye-mask bar,
      so the React mascot can animate those two parts on top (blink / eyebrow)
  components/mascot/birdGeometry.generated.ts  eye + eye-mask geometry

Requires: python3, pillow, numpy and the `potrace` CLI (apt install potrace).
Run from the repo root:  python3 scripts/mascot/trace_mascot.py
"""
import json
import math
import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "assets", "mascot", "venbee-bird-source.png")
OUT_PUBLIC = os.path.join(ROOT, "public", "mascot")
OUT_TS = os.path.join(ROOT, "components", "mascot", "birdGeometry.generated.ts")

INK = "#0A0A0A"
CREAM = "#FCE8C3"
GREY = "#978B75"
RED = "#FF2A0C"
PALETTE = np.array([(0, 0, 0), (151, 139, 117), (252, 232, 195), (255, 42, 12)])
K, G, C, R = 0, 1, 2, 3

UP = 2  # trace at 2x for smoother curves
MARGIN = 8

# --- eye + eye-mask geometry, measured on the 1179x1474 source (see README) ---
BAR_ANGLE = 4.7  # degrees, clockwise
BAR = {"x0": 455.0, "x1": 709.0, "top_y_at_x0": 503.5, "h": 32.0}
EYE = {"cx": 580.5, "cy": 546.0, "rx": 110.5, "ry": 81.5, "stroke": 8.0}
# pupil split line (source px)
SPLIT = ((592.5, 547.0), (575.5, 622.0))


def rot(px, py, cx, cy, deg):
    a = math.radians(deg)
    dx, dy = px - cx, py - cy
    return cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)


def bar_polygon(grow=0.0):
    s = math.tan(math.radians(BAR_ANGLE))
    x0, x1, h = BAR["x0"] - grow, BAR["x1"] + grow, BAR["h"] + 2 * grow
    y0 = BAR["top_y_at_x0"] - grow - s * grow
    return [(x0, y0), (x1, y0 + s * (x1 - x0)), (x1, y0 + s * (x1 - x0) + h), (x0, y0 + h)]


def split_local():
    """Pupil split line in the eye's rotated frame, extended up to the top of the ellipse."""
    (ax, ay), (bx, by) = SPLIT
    a = rot(ax, ay, EYE["cx"], EYE["cy"], -BAR_ANGLE)
    b = rot(bx, by, EYE["cx"], EYE["cy"], -BAR_ANGLE)
    ax, ay = a[0] - EYE["cx"], a[1] - EYE["cy"]
    bx, by = b[0] - EYE["cx"], b[1] - EYE["cy"]
    k = (bx - ax) / (by - ay)
    top_y = -EYE["ry"] - 4
    return (round(ax + k * (top_y - ay), 1), round(top_y, 1), round(bx, 1), round(by, 1))


def classify(rgb):
    d = ((rgb[:, :, None, :].astype(np.int32) - PALETTE[None, None, :, :]) ** 2).sum(-1)
    return d.argmin(-1)


def background_mask(rgb):
    """Black area connected to the image border (the plate around the sticker)."""
    lum = rgb.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    dark = Image.fromarray(np.where(lum < 110, 0, 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(dark, (0, 0), 128)
    return np.array(dark) == 128, lum


def transparent_png(rgb, bg, lum, box):
    h, w = bg.shape
    cream_l = float(np.dot(PALETTE[C], [0.299, 0.587, 0.114]))
    alpha = np.where(bg, 0.0, 1.0)
    # soften the fringe: pixels near the cut become cream with fractional alpha
    near = np.array(Image.fromarray((~bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    near &= np.array(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    frac = np.clip(lum / cream_l, 0, 1)
    alpha = np.where(near, frac, alpha)
    out = rgb.astype(np.float32).copy()
    out[near] = PALETTE[C]
    rgba = np.dstack([out, alpha * 255]).astype(np.uint8)
    x0, y0, x1, y1 = box
    return Image.fromarray(rgba, "RGBA").crop((x0, y0, x1, y1))


def dilate(mask, px):
    img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(px * 2 + 1))
    return np.array(img) > 0


def potrace_paths(mask):
    """Trace a boolean mask with potrace, return absolute path data in mask px."""
    h, w = mask.shape
    with tempfile.TemporaryDirectory() as tmp:
        pbm = os.path.join(tmp, "m.pbm")
        svg = os.path.join(tmp, "m.svg")
        Image.fromarray(((~mask) * 255).astype(np.uint8)).convert("1").save(pbm)
        subprocess.run(
            ["potrace", pbm, "-b", "svg", "-o", svg, "--turdsize", "12", "--alphamax", "1.1",
             "--opttolerance", "0.4", "-u", "2", "--flat"],
            check=True,
        )
        text = open(svg).read()
    m = re.search(r'<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', text)
    tx, ty, sx, sy = map(float, m.groups())
    ds = re.findall(r' d="([^"]+)"', text)
    return [to_absolute(d, tx, ty, sx, sy) for d in ds]


def fmt(v):
    t = f"{v:.1f}"
    return t[:-2] if t.endswith(".0") else t


def to_absolute(d, tx, ty, sx, sy):
    toks = re.findall(r"[MmCcLlZz]|-?\d+(?:\.\d+)?", d)
    out, i, cmd = [], 0, None
    cx = cy = 0.0
    sx0 = sy0 = 0.0

    def P(x, y):
        return f"{fmt((tx + x * sx) / UP)} {fmt((ty + y * sy) / UP)}"

    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                cx, cy = sx0, sy0
            continue
        nums = lambda n: [float(v) for v in toks[i:i + n]]
        if cmd in "Mm":
            x, y = nums(2)
            if cmd == "m":
                x, y = cx + x, cy + y
            out.append("M" + P(x, y))
            cx, cy, sx0, sy0 = x, y, x, y
            i += 2
            cmd = "l" if cmd == "m" else "L"
        elif cmd in "Ll":
            x, y = nums(2)
            if cmd == "l":
                x, y = cx + x, cy + y
            out.append("L" + P(x, y))
            cx, cy = x, y
            i += 2
        elif cmd in "Cc":
            v = nums(6)
            if cmd == "c":
                v = [cx + v[0], cy + v[1], cx + v[2], cy + v[3], cx + v[4], cy + v[5]]
            out.append("C" + P(v[0], v[1]) + " " + P(v[2], v[3]) + " " + P(v[4], v[5]))
            cx, cy = v[4], v[5]
            i += 6
        else:
            raise ValueError(cmd)
    return "".join(out)


def under_ink(region, black, other):
    """Grow a colour region underneath adjacent ink so no seams show, and fill
    ink-only holes (scribble marks) so the fill is one clean shape."""
    grown = region | (dilate(region, 5 * UP) & black)
    holes, n = ndimage.label(ndimage.binary_fill_holes(grown) & ~grown)
    if n:
        has_other = ndimage.maximum(other, holes, index=np.arange(1, n + 1))
        keep = np.concatenate([[False], ~has_other.astype(bool)])
        grown |= keep[holes]
    return grown


def build_layers(lab, sil):
    lab = np.array(Image.fromarray(lab.astype(np.uint8)).filter(ImageFilter.ModeFilter(5)))
    black = (lab == K) & sil
    grey = (lab == G) & sil
    red = (lab == R) & sil
    cream = (lab == C) & sil
    grey_x = under_ink(grey, black, cream | red)
    red_x = under_ink(red, black, cream | grey)
    return {
        "cream": potrace_paths(sil),
        "grey": potrace_paths(grey_x),
        "red": potrace_paths(red_x),
        "ink": potrace_paths(black),
    }


def eye_overlay_svg(lid, bar_dy, bar_rot, off):
    """SVG markup for the animated eye + eye-mask (mirrors components/mascot/Mascot.tsx)."""
    ox, oy = off
    cx, cy = EYE["cx"] - ox, EYE["cy"] - oy
    rx, ry, sw = EYE["rx"], EYE["ry"], EYE["stroke"]
    x1, y1, x2, y2 = split_local()
    half = math.sqrt(max(0.0, 1 - (lid / ry) ** 2)) * rx if abs(lid) < ry else 0
    poly = bar_polygon()
    pts = " ".join(f"{x - ox:.1f},{y - oy:.1f}" for x, y in poly)
    bcx = (BAR["x0"] + BAR["x1"]) / 2 - ox
    return f"""
  <clipPath id="lid"><rect x="{-rx - 20:.1f}" y="{lid:.1f}" width="{2 * rx + 40:.1f}" height="{ry + 30 - lid:.1f}"/></clipPath>
  <g transform="translate({cx:.1f} {cy:.1f}) rotate({BAR_ANGLE})">
    <g clip-path="url(#lid)">
      <ellipse rx="{rx}" ry="{ry}" fill="{CREAM}" stroke="{INK}" stroke-width="{sw}"/>
      <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="{sw}"/>
    </g>
    <line x1="{-half:.1f}" y1="{lid:.1f}" x2="{half:.1f}" y2="{lid:.1f}" stroke="{INK}" stroke-width="{sw + 2}" stroke-linecap="round"/>
  </g>
  <polygon points="{pts}" fill="{INK}" transform="translate(0 {bar_dy}) rotate({bar_rot} {bcx:.1f} {BAR['top_y_at_x0'] - oy:.1f})"/>"""


def svg_doc(w, h, layers, extra=""):
    def grp(name, fill):
        return "".join(f'<path d="{d}"/>' for d in layers[name]), fill
    body = ""
    for name, fill in (("cream", CREAM), ("grey", GREY), ("red", RED), ("ink", INK)):
        ps, f = grp(name, fill)
        body += f'\n  <g fill="{f}">{ps}</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<title>VenbeeMail bird</title>{body}{extra}\n</svg>\n')


def main():
    src = Image.open(SRC).convert("RGB")
    rgb = np.array(src)
    bg, lum = background_mask(rgb)
    ys, xs = np.where(~bg)
    box = (int(xs.min()) - MARGIN, int(ys.min()) - MARGIN, int(xs.max()) + MARGIN + 1, int(ys.max()) + MARGIN + 1)
    ox, oy = box[0], box[1]
    W, H = box[2] - box[0], box[3] - box[1]
    os.makedirs(OUT_PUBLIC, exist_ok=True)
    png = transparent_png(rgb, bg, lum, box)
    # flat-colour art: a 128-colour palette is visually lossless and ~8x smaller
    png.quantize(colors=128, method=Image.FASTOCTREE, dither=Image.NONE).save(
        os.path.join(OUT_PUBLIC, "venbee-bird.png"), optimize=True)

    # upscale for tracing
    crop = src.crop(box).resize((W * UP, H * UP), Image.BICUBIC)
    crgb = np.array(crop)
    cbg, _ = background_mask(np.pad(crgb, ((2, 2), (2, 2), (0, 0))))
    sil = ~cbg[2:-2, 2:-2]
    lab = classify(crgb)

    full = build_layers(lab, sil)

    # body without eye + bar: paint that area grey before tracing
    mask_img = Image.new("L", (W * UP, H * UP), 0)
    dr = ImageDraw.Draw(mask_img)
    grow = 4.0
    dr.polygon([((x - ox) * UP, (y - oy) * UP) for x, y in bar_polygon(grow)], fill=255)
    ell = []
    for k in range(180):
        t = math.pi * 2 * k / 180
        ex = EYE["cx"] + (EYE["rx"] + EYE["stroke"] / 2 + grow) * math.cos(t)
        ey = EYE["cy"] + (EYE["ry"] + EYE["stroke"] / 2 + grow) * math.sin(t)
        if math.sin(t) < 0:  # upper half hides under the bar; keep inside the bar area
            ey = EYE["cy"] + 2
        ex, ey = rot(ex, ey, EYE["cx"], EYE["cy"], BAR_ANGLE)
        ell.append(((ex - ox) * UP, (ey - oy) * UP))
    dr.polygon(ell, fill=255)
    hole = np.array(mask_img) > 0
    lab2 = lab.copy()
    lab2[hole & sil] = G
    body = build_layers(lab2, sil)

    open(os.path.join(OUT_PUBLIC, "venbee-bird.svg"), "w").write(svg_doc(W, H, full))
    open(os.path.join(OUT_PUBLIC, "venbee-bird-body.svg"), "w").write(svg_doc(W, H, body))
    open(os.path.join(OUT_PUBLIC, "venbee-bird-raised.svg"), "w").write(
        svg_doc(W, H, body, eye_overlay_svg(-24, -24, -5, (ox, oy))))
    open(os.path.join(OUT_PUBLIC, "venbee-bird-blink.svg"), "w").write(
        svg_doc(W, H, body, eye_overlay_svg(EYE["ry"] * 0.72, 0, 0, (ox, oy))))

    # geometry for the React overlay, relative to the cropped viewBox
    poly = [(round(x - ox, 1), round(y - oy, 1)) for x, y in bar_polygon()]
    geo = {
        "width": W, "height": H,
        "barAngle": BAR_ANGLE,
        "bar": poly,
        "barPivot": [round((BAR["x0"] + BAR["x1"]) / 2 - ox, 1), round(BAR["top_y_at_x0"] - oy, 1)],
        "eye": {"cx": round(EYE["cx"] - ox, 1), "cy": round(EYE["cy"] - oy, 1),
                "rx": EYE["rx"], "ry": EYE["ry"], "stroke": EYE["stroke"]},
        "split": list(split_local()),
    }
    os.makedirs(os.path.dirname(OUT_TS), exist_ok=True)
    with open(OUT_TS, "w") as f:
        f.write("// Generated by scripts/mascot/trace_mascot.py. Do not edit by hand.\n")
        f.write(f"export const BIRD_GEOMETRY = {json.dumps(geo, indent=2)} as const;\n")
    sizes = {k: len("".join(v)) for k, v in body.items()}
    print("viewBox", W, H, "offset", ox, oy, "path chars", sizes)


if __name__ == "__main__":
    main()
