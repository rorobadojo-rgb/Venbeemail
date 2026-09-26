#!/usr/bin/env python3
"""
Turn the official VenbeeMail zombie logo (assets/logo/venbee-zombie-source.jpg)
into layered vector art.

  public/logo/venbee-zombie.svg        the full logo, one <g> per layer:
                                       sticker > fills (purple, lime, slime, strap)
                                       > eyes (iris vectors) > ink
  public/logo/venbee-zombie.png        transparent PNG, black plate removed (512 px)
  public/logo/zombie-under.svg         sticker + fills with EMPTY eye whites
  public/logo/zombie-ink.svg           the ink layer on its own
      The animated React logo stacks  under.svg > live eyes > ink.svg, so the
      irises can follow the cursor and the lids can blink under the brows.
  components/logo/logoGeometry.generated.ts   eye centres, iris radii, eye-white
                                       clip paths and brow lines

Requires python3 + pillow + numpy + scipy and the `potrace` CLI.
Run from the repo root:  npm run assets:logo
"""
import json
import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "assets", "logo", "venbee-zombie-source.jpg")
OUT = os.path.join(ROOT, "public", "logo")
OUT_TS = os.path.join(ROOT, "components", "logo", "logoGeometry.generated.ts")

# measured on the source (median colour of each cluster)
COLORS = {
    "ink": "#0A0A0A",
    "cream": "#FBE8C8",
    "purple": "#8627B9",
    "lime": "#A8EF2A",
    "slime": "#66F72B",
    "strap": "#3A3734",
}
PALETTE = np.array([(0, 0, 0), (251, 232, 200), (134, 39, 185), (168, 239, 42), (102, 247, 43), (58, 55, 52)])
K, C, P, L, G, D = range(6)

UP = 2  # trace at 2x for smoother curves
MARGIN = 6

# Irises, measured on the 1024 px source: centre and the four radii of the
# target pattern (inner disc, black ring, green annulus, black outline).
EYES = {
    "left": {"c": (349.3, 538.8), "r": (17.5, 26.5, 45.5, 54.0)},
    "right": {"c": (630.5, 487.8), "r": (21.5, 31.0, 52.5, 61.0)},
}


def classify(rgb):
    d = ((rgb[:, :, None, :].astype(np.int32) - PALETTE[None, None, :, :]) ** 2).sum(-1)
    return d.argmin(-1).astype(np.uint8)


def background_mask(rgb):
    """Dark area connected to the border: the black plate around the sticker."""
    lum = rgb.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    cc, _ = ndimage.label(lum < 90)
    edge = np.unique(np.concatenate([cc[0], cc[-1], cc[:, 0], cc[:, -1]]))
    return np.isin(cc, edge[edge > 0]), lum


def dilate(mask, px):
    return ndimage.binary_dilation(mask, iterations=px)


def fit_brow(lab, comp, disc, cx, cy, ro):
    """The brow bar's lower edge is straight: RANSAC a line through the points
    where the eye white meets a thick run of black above it."""
    pts = []
    for x in range(int(cx - ro - 60), int(cx + ro + 60)):
        for y in np.where(comp[:, x] & ~disc[:, x])[0]:
            if y > 0 and not comp[y - 1, x] and y < cy:
                run = 0
                while y - 1 - run >= 0 and lab[y - 1 - run, x] == K:
                    run += 1
                if run >= 16:
                    pts.append((x, y - 0.5))
    pts = np.array(pts, float)
    rng = np.random.default_rng(1)
    best = None
    for _ in range(400):
        i, j = rng.choice(len(pts), 2, replace=False)
        if pts[i, 0] == pts[j, 0]:
            continue
        k = (pts[j, 1] - pts[i, 1]) / (pts[j, 0] - pts[i, 0])
        b = pts[i, 1] - k * pts[i, 0]
        inl = np.abs(pts[:, 1] - (k * pts[:, 0] + b)) < 1.5
        if best is None or inl.sum() > best.sum():
            best = inl
    q = pts[best]
    k, b = np.linalg.lstsq(np.c_[q[:, 0], np.ones(len(q))], q[:, 1], rcond=None)[0]
    return float(k), float(b)


def potrace_paths(mask, scale=UP):
    """Trace a boolean mask with potrace, return absolute path data in source px."""
    with tempfile.TemporaryDirectory() as tmp:
        pbm = os.path.join(tmp, "m.pbm")
        svg = os.path.join(tmp, "m.svg")
        Image.fromarray(((~mask) * 255).astype(np.uint8)).convert("1").save(pbm)
        subprocess.run(
            ["potrace", pbm, "-b", "svg", "-o", svg, "--turdsize", "10", "--alphamax", "1.0",
             "--opttolerance", "0.3", "-u", "4", "--flat"],
            check=True,
        )
        text = open(svg).read()
    m = re.search(r'<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', text)
    tx, ty, sx, sy = map(float, m.groups())
    return [to_absolute(d, tx, ty, sx, sy, scale) for d in re.findall(r' d="([^"]+)"', text)]


def fmt(v):
    t = f"{v:.1f}"
    return t[:-2] if t.endswith(".0") else t


def to_absolute(d, tx, ty, sx, sy, scale):
    toks = re.findall(r"[MmCcLlZz]|-?\d+(?:\.\d+)?", d)
    out, i, cmd = [], 0, None
    cx = cy = sx0 = sy0 = 0.0

    def pt(x, y):
        return f"{fmt((tx + x * sx) / scale)} {fmt((ty + y * sy) / scale)}"

    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                cx, cy = sx0, sy0
            continue
        nums = [float(v) for v in toks[i:i + 6] if not v.isalpha()]
        if cmd in "Mm":
            x, y = nums[:2]
            if cmd == "m":
                x, y = cx + x, cy + y
            out.append("M" + pt(x, y))
            cx, cy, sx0, sy0 = x, y, x, y
            i += 2
            cmd = "l" if cmd == "m" else "L"
        elif cmd in "Ll":
            x, y = nums[:2]
            if cmd == "l":
                x, y = cx + x, cy + y
            out.append("L" + pt(x, y))
            cx, cy = x, y
            i += 2
        elif cmd in "Cc":
            v = nums
            if cmd == "c":
                v = [cx + v[0], cy + v[1], cx + v[2], cy + v[3], cx + v[4], cy + v[5]]
            out.append("C" + pt(v[0], v[1]) + " " + pt(v[2], v[3]) + " " + pt(v[4], v[5]))
            cx, cy = v[4], v[5]
            i += 6
        else:
            raise ValueError(cmd)
    return "".join(out)


def under_ink(region, black, others):
    """Grow a fill underneath adjacent ink so no seams show, and close
    ink-only holes (scratch marks) so each fill is one clean shape."""
    grown = region | (dilate(region, 4 * UP) & black)
    holes, n = ndimage.label(ndimage.binary_fill_holes(grown) & ~grown)
    if n:
        has_other = ndimage.maximum(others, holes, index=np.arange(1, n + 1))
        keep = np.concatenate([[False], ~has_other.astype(bool)])
        grown |= keep[holes]
    return grown


def drop_specks(mask, min_area):
    cc, n = ndimage.label(mask)
    if not n:
        return mask
    areas = ndimage.sum(mask, cc, index=np.arange(1, n + 1))
    keep = np.concatenate([[False], areas >= min_area])
    return keep[cc]


def iris_svg(eye, dx=0.0, dy=0.0):
    (cx, cy), (ri, rr, ra, ro) = eye["c"], eye["r"]
    x, y = fmt(cx + dx), fmt(cy + dy)
    return (f'<circle cx="{x}" cy="{y}" r="{fmt(ro)}" fill="{COLORS["ink"]}"/>'
            f'<circle cx="{x}" cy="{y}" r="{fmt(ra)}" fill="{COLORS["slime"]}"/>'
            f'<circle cx="{x}" cy="{y}" r="{fmt(rr)}" fill="{COLORS["ink"]}"/>'
            f'<circle cx="{x}" cy="{y}" r="{fmt(ri)}" fill="{COLORS["slime"]}"/>')


def group(layer_id, fill, paths):
    return f'\n  <g id="{layer_id}" fill="{fill}">' + "".join(f'<path d="{d}"/>' for d in paths) + "</g>"


def main():
    src = Image.open(SRC).convert("RGB")
    rgb = np.array(src)
    bg, _ = background_mask(rgb)
    bg = ndimage.binary_opening(bg, iterations=1) | bg
    ys, xs = np.where(~bg)
    x0, y0 = int(xs.min()) - MARGIN, int(ys.min()) - MARGIN
    x1, y1 = int(xs.max()) + MARGIN + 1, int(ys.max()) + MARGIN + 1
    W, H = x1 - x0, y1 - y0

    # ---- eyes, measured on the source grid
    lab_src = np.array(Image.fromarray(classify(rgb)).filter(ImageFilter.ModeFilter(3)))
    hh, ww = lab_src.shape
    yy, xx = np.mgrid[0:hh, 0:ww]
    eye_masks, geo_eyes = {}, {}
    for name, eye in EYES.items():
        (cx, cy), radii = eye["c"], eye["r"]
        ro = radii[3]
        disc = (xx - cx) ** 2 + (yy - cy) ** 2 <= (ro + 1.5) ** 2
        cc, _ = ndimage.label((lab_src != K) | disc)
        comp = cc == cc[int(cy), int(cx)]
        k, b = fit_brow(lab_src, comp, disc, cx, cy, ro)
        opening = comp & (yy > k * xx + b)  # the brow covers everything above its edge
        opening = ndimage.binary_fill_holes(opening)
        eye_masks[name] = opening
        oy_, ox_ = np.where(opening)
        geo_eyes[name] = {
            "cx": round(cx - x0, 1), "cy": round(cy - y0, 1),
            "r": list(radii),
            # brow edge in viewBox coords: y = k x + b
            "brow": [round(k, 4), round(b + k * x0 - y0, 2)],
            "box": [int(ox_.min() - x0), int(oy_.min() - y0), int(ox_.max() - x0), int(oy_.max() - y0)],
        }

    # ---- transparent PNG
    os.makedirs(OUT, exist_ok=True)
    alpha = (~bg).astype(np.float32)
    alpha = ndimage.gaussian_filter(alpha, 0.6)
    rgba = np.dstack([rgb, np.clip(alpha * 255, 0, 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").crop((x0, y0, x1, y1)).resize((512, round(512 * H / W)), Image.LANCZOS).quantize(
        colors=96, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(OUT, "venbee-zombie.png"), optimize=True)

    # ---- trace at UP x
    crop = src.crop((x0, y0, x1, y1)).resize((W * UP, H * UP), Image.BICUBIC)
    crgb = np.array(crop)
    cbg, _ = background_mask(np.pad(crgb, ((2, 2), (2, 2), (0, 0))))
    sil = ~cbg[2:-2, 2:-2]
    sil = ndimage.binary_fill_holes(sil)
    lab = np.array(Image.fromarray(classify(crgb)).filter(ImageFilter.ModeFilter(5)))

    def up(mask):
        m = mask[y0:y1, x0:x1]
        return np.array(Image.fromarray((m * 255).astype(np.uint8)).resize((W * UP, H * UP), Image.BILINEAR)) > 127

    eyes_up = {n: up(m) for n, m in eye_masks.items()}
    empty = lab.copy()
    for m in eyes_up.values():
        empty[m] = C  # erase the irises: plain eye whites

    def layers(lb):
        black = (lb == K) & sil
        purple = drop_specks((lb == P) & sil, 40 * UP * UP)
        lime = drop_specks((lb == L) & sil, 30 * UP * UP)
        slime = drop_specks((lb == G) & sil, 30 * UP * UP)
        strap = drop_specks(ndimage.binary_opening((lb == D) & sil, iterations=2), 12 * UP * UP)
        cream = (lb == C) & sil
        # stray anti-alias pixels that belong to no fill fall back to ink
        return {
            "sticker": potrace_paths(sil),
            "fill-purple": potrace_paths(under_ink(purple, black, cream | lime | slime | strap)),
            "fill-lime": potrace_paths(under_ink(lime, black, cream | purple | slime | strap)),
            "fill-slime": potrace_paths(under_ink(slime, black, cream | purple | lime | strap)),
            "fill-strap": potrace_paths(under_ink(strap, black, cream | purple | lime | slime)),
            "ink": potrace_paths(black),
        }

    body = layers(empty)
    fills = [("sticker", COLORS["cream"]), ("fill-purple", COLORS["purple"]), ("fill-lime", COLORS["lime"]),
             ("fill-slime", COLORS["slime"]), ("fill-strap", COLORS["strap"])]

    clips = {}
    for name, m in eyes_up.items():
        # grow the clip a little so the irises and lids tuck under the ink
        clips[name] = potrace_paths(dilate(m, 3 * UP))
        geo_eyes[name]["clip"] = " ".join(clips[name])

    head = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
    under = head + "<title>VenbeeMail</title>" + "".join(group(i, f, body[i]) for i, f in fills) + "\n</svg>\n"
    ink = head + group("ink", COLORS["ink"], body["ink"]) + "\n</svg>\n"
    eye_defs = "".join(f'<clipPath id="eye-{n}-clip"><path d="{geo_eyes[n]["clip"]}"/></clipPath>'
                       for n in EYES)
    eyes_markup = "".join(
        f'<g id="eye-{n}" clip-path="url(#eye-{n}-clip)">{iris_svg({"c": (geo_eyes[n]["cx"], geo_eyes[n]["cy"]), "r": EYES[n]["r"]})}</g>'
        for n in EYES)
    full = (head + "<title>VenbeeMail</title><desc>Official VenbeeMail zombie logo, layered: sticker, "
            "fills, eyes (iris vectors), ink.</desc>"
            f"<defs>{eye_defs}</defs>" + "".join(group(i, f, body[i]) for i, f in fills)
            + f'\n  <g id="eyes">{eyes_markup}</g>' + group("ink", COLORS["ink"], body["ink"]) + "\n</svg>\n")

    open(os.path.join(OUT, "zombie-under.svg"), "w").write(under)
    open(os.path.join(OUT, "zombie-ink.svg"), "w").write(ink)
    open(os.path.join(OUT, "venbee-zombie.svg"), "w").write(full)

    geo = {"width": W, "height": H, "colors": COLORS, "eyes": geo_eyes}
    os.makedirs(os.path.dirname(OUT_TS), exist_ok=True)
    with open(OUT_TS, "w") as f:
        f.write("// Generated by scripts/logo/trace_logo.py. Do not edit by hand.\n")
        f.write(f"export const LOGO = {json.dumps(geo, indent=2)} as const;\n")
    sizes = {k: len("".join(v)) for k, v in body.items()}
    print("viewBox", W, H, "offset", x0, y0, "path chars", sizes)


if __name__ == "__main__":
    main()
