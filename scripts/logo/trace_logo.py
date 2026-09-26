#!/usr/bin/env python3
"""
Convert the official VenbeeMail zombie logo (assets/logo/venbee-zombie-source.jpg)
into a layered vector logo plus the pieces the animated neon sign needs:

  public/logo/venbee-zombie.svg       full layered logo, black plate removed.
                                      Groups: sticker, cap, head, drips, teeth,
                                      anger, ink, eyes, pupils, brows
  public/logo/venbee-zombie-body.svg  the same without eyes / pupils / brows
                                      (the area under them is filled in), so the
                                      React sign can animate those on top
  components/logo/logoGeometry.generated.ts
                                      eye shapes, pupil rings and brow bars

Requires python3 + pillow + numpy + scipy and the `potrace` CLI.
Run from the repo root:  npm run assets:logo
"""
import json
import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "assets", "logo", "venbee-zombie-source.jpg")
OUT = os.path.join(ROOT, "public", "logo")
OUT_TS = os.path.join(ROOT, "components", "logo", "logoGeometry.generated.ts")

# colours sampled from the source art (medians of each class)
COLORS = {
    "ink": "#0A0A0A",
    "lime": "#B5E961",
    "purple": "#872AB9",
    "cream": "#FAE8C8",
    "green": "#5FFA2D",
    "grey": "#2E2E2E",
}
NAMES = ["ink", "lime", "purple", "cream", "green", "grey"]
PALETTE = np.array([(0, 0, 0), (181, 233, 97), (135, 42, 185), (250, 232, 200), (95, 250, 45), (60, 60, 60)])
K, LIME, PURPLE, CREAM, GREEN, GREY = range(6)

UP = 2  # trace at 2x for smoother curves
MARGIN = 6

# seeds (source px) for the two eye whites; pupils are concentric rings
EYE_SEEDS = {"left": (272, 550), "right": (552, 505)}
PUPILS = {
    # centre, radii: outer ink, green ring, inner ink, green core (source px)
    "left": {"cx": 349.3, "cy": 539.0, "r": [55, 45, 28, 17.5]},
    "right": {"cx": 630.5, "cy": 487.8, "r": [62, 51, 32, 21]},
}
EYE_OUTLINE = 10  # ink ring around each eye white, source px


def classify(rgb):
    d = ((rgb[:, :, None, :].astype(np.int32) - PALETTE[None, None, :, :]) ** 2).sum(-1)
    return d.argmin(-1)


def background_mask(rgb):
    """Dark area connected to the image border (the plate around the sticker)."""
    lum = rgb.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    dark = Image.fromarray(np.where(lum < 90, 0, 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(dark, (0, 0), 128)
    return np.array(dark) == 128


def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def dilate(mask, r):
    return ndimage.binary_dilation(mask, structure=disk(r)) if r > 0 else mask


def potrace_paths(mask):
    """Trace a boolean mask (at UP scale) with potrace -> absolute path data in source px."""
    if not mask.any():
        return []
    with tempfile.TemporaryDirectory() as tmp:
        pbm = os.path.join(tmp, "m.pbm")
        svg = os.path.join(tmp, "m.svg")
        Image.fromarray(((~mask) * 255).astype(np.uint8)).convert("1").save(pbm)
        subprocess.run(
            ["potrace", pbm, "-b", "svg", "-o", svg, "--turdsize", "10", "--alphamax", "1.05",
             "--opttolerance", "0.35", "-u", "2", "--flat"],
            check=True,
        )
        text = open(svg).read()
    m = re.search(r'<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', text)
    tx, ty, sx, sy = map(float, m.groups())
    return [to_absolute(d, tx, ty, sx, sy) for d in re.findall(r' d="([^"]+)"', text)]


def fmt(v):
    t = f"{v:.1f}"
    return t[:-2] if t.endswith(".0") else t


def to_absolute(d, tx, ty, sx, sy):
    toks = re.findall(r"[MmCcLlZz]|-?\d+(?:\.\d+)?", d)
    out, i, cmd = [], 0, None
    cx = cy = sx0 = sy0 = 0.0

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
        nums = [float(v) for v in toks[i:i + (6 if cmd in "Cc" else 2)]]
        if cmd in "Mm":
            x, y = nums
            if cmd == "m":
                x, y = cx + x, cy + y
            out.append("M" + P(x, y))
            cx, cy, sx0, sy0 = x, y, x, y
            i += 2
            cmd = "l" if cmd == "m" else "L"
        elif cmd in "Ll":
            x, y = nums
            if cmd == "l":
                x, y = cx + x, cy + y
            out.append("L" + P(x, y))
            cx, cy = x, y
            i += 2
        else:
            v = nums
            if cmd == "c":
                v = [cx + v[0], cy + v[1], cx + v[2], cy + v[3], cx + v[4], cy + v[5]]
            out.append("C" + P(v[0], v[1]) + " " + P(v[2], v[3]) + " " + P(v[4], v[5]))
            cx, cy = v[4], v[5]
            i += 6
    return "".join(out)


def under_ink(region, black, others):
    """Grow a colour region underneath adjacent ink so no seams show, and fill
    ink-only holes (scratch marks) so the fill is one clean shape."""
    grown = region | (dilate(region, 5 * UP) & black)
    holes, n = ndimage.label(ndimage.binary_fill_holes(grown) & ~grown)
    if n:
        has_other = ndimage.maximum(others, holes, index=np.arange(1, n + 1))
        keep = np.concatenate([[False], ~has_other.astype(bool)])
        grown |= keep[holes]
    return grown


def components(mask, min_px=40):
    lab, n = ndimage.label(mask)
    out = []
    for k in range(1, n + 1):
        m = lab == k
        ys, xs = np.nonzero(m)
        if len(xs) < min_px * UP * UP:
            continue
        out.append((m, xs.mean() / UP, ys.mean() / UP))
    return out


def fit_brow(mask):
    """Oriented trapezoid (4 corners, source px) around a thick ink bar."""
    ys, xs = np.nonzero(mask)
    pts = np.stack([xs, ys], 1).astype(float) / UP
    c = pts.mean(0)
    _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
    ax = vt[0] if vt[0][0] > 0 else -vt[0]
    nrm = np.array([-ax[1], ax[0]])
    t = (pts - c) @ ax
    q = (pts - c) @ nrm
    t0, t1 = t.min(), t.max()

    def band(tt):
        sel = np.abs(t - tt) < 2.5
        return np.percentile(q[sel], 4), np.percentile(q[sel], 96)

    a0, b0 = band(t0 + 6)
    a1, b1 = band(t1 - 6)
    corners = [c + ax * t0 + nrm * a0, c + ax * t1 + nrm * a1, c + ax * t1 + nrm * b1, c + ax * t0 + nrm * b0]
    return [[round(float(x), 1), round(float(y), 1)] for x, y in corners]


def polygon_mask(shape, pts, grow=0):
    img = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).polygon([(x * UP, y * UP) for x, y in pts], fill=255)
    m = np.array(img) > 0
    return dilate(m, grow) if grow else m


def svg_group(gid, fill, paths, extra=""):
    body = "".join(f'<path d="{d}"/>' for d in paths)
    return f'\n  <g id="{gid}" fill="{fill}"{extra}>{body}</g>'


def main():
    src = Image.open(SRC).convert("RGB")
    rgb0 = np.array(src)
    bg0 = background_mask(rgb0)
    ys, xs = np.nonzero(~bg0)
    x0, y0 = int(xs.min()) - MARGIN, int(ys.min()) - MARGIN
    x1, y1 = int(xs.max()) + MARGIN + 1, int(ys.max()) + MARGIN + 1
    W, H = x1 - x0, y1 - y0

    crop = src.crop((x0, y0, x1, y1)).resize((W * UP, H * UP), Image.LANCZOS)
    rgb = np.array(crop)
    padded = np.pad(rgb, ((2, 2), (2, 2), (0, 0)))
    sil = ~background_mask(padded)[2:-2, 2:-2]
    sil = ndimage.binary_fill_holes(sil)
    lab = classify(rgb)
    lab = np.array(Image.fromarray(lab.astype(np.uint8)).filter(ImageFilter.ModeFilter(5)))
    lab[~sil] = K
    black = (lab == K) & sil

    def at(x, y):  # source px -> label-space index
        return int((y - y0) * UP), int((x - x0) * UP)

    # ---- brows: the two thick ink bars (ink that survives a wide opening)
    thick = ndimage.binary_opening(black, structure=np.ones((21 * UP, 21 * UP)))
    thick_l, n = ndimage.label(thick)
    brows = {}
    for k in range(1, n + 1):
        m = thick_l == k
        cnt = m.sum() / (UP * UP)
        if not (5000 < cnt < 40000):
            continue
        full = dilate(m, 4 * UP) & black
        ys_, xs_ = np.nonzero(m)
        side = "left" if xs_.mean() / UP + x0 < 480 else "right"
        corners = fit_brow(full)
        brows[side] = [[x + x0, y + y0] for x, y in corners]  # source px for now
    assert set(brows) == {"left", "right"}, brows.keys()
    brow_mask = np.zeros_like(black)
    for side, pts in brows.items():
        brow_mask |= polygon_mask(black.shape, [(x - x0, y - y0) for x, y in pts], grow=6 * UP) & black

    # ---- eyes: cream white + pupil, then the ink ring around it
    eye_masks = {}
    for side, (sx, sy) in EYE_SEEDS.items():
        cream_l, _ = ndimage.label(lab == CREAM)
        assert cream_l[at(sx, sy)], f"eye seed {side} is not on the eye white"
        white = cream_l == cream_l[at(sx, sy)]
        p = PUPILS[side]
        yy, xx = np.ogrid[: lab.shape[0], : lab.shape[1]]
        pcx, pcy = (p["cx"] - x0) * UP, (p["cy"] - y0) * UP
        pupil = (xx - pcx) ** 2 + (yy - pcy) ** 2 <= (p["r"][0] * UP) ** 2
        region = ndimage.binary_fill_holes(white | (pupil & ~brow_mask))
        region = ndimage.binary_opening(region, structure=disk(3 * UP))
        eye_masks[side] = region
    eyes_all = eye_masks["left"] | eye_masks["right"]
    eye_rings = {s: dilate(m, EYE_OUTLINE * UP) & black & ~brow_mask for s, m in eye_masks.items()}
    rings_all = eye_rings["left"] | eye_rings["right"]

    # ---- "under" label map: what sits beneath brows + eyes (nearest colour)
    # eyes sit inside the face, so lime goes under them; under the brows take
    # the nearest face / cap colour so the cap edge carries on underneath
    hidden = brow_mask | eyes_all | rings_all
    known = sil & ~hidden & ((lab == LIME) | (lab == PURPLE))
    _, (iy, ix) = ndimage.distance_transform_edt(~known, return_indices=True)
    under = lab.copy()
    under[hidden] = lab[iy[hidden], ix[hidden]]
    under[dilate(eyes_all | rings_all, 2 * UP) & ~brow_mask] = LIME
    ink_static = black & ~hidden

    # ---- semantic colour regions (from the under map)
    lime_parts = {"head": np.zeros_like(black), "drips": np.zeros_like(black), "cap": np.zeros_like(black)}
    for m, cx, cy in components((under == LIME) & sil):
        cx, cy = cx + x0, cy + y0
        if cy < 172:
            lime_parts["cap"] |= m  # the cap button
        elif cy < 260 and m.sum() / UP / UP < 20000:
            lime_parts["drips"] |= m  # slime running over the cap
        else:
            lime_parts["head"] |= m
    purple = {"cap": np.zeros_like(black), "anger": np.zeros_like(black), "teeth": np.zeros_like(black)}
    for m, cx, cy in components((under == PURPLE) & sil, min_px=8):
        cx, cy = cx + x0, cy + y0
        if cx > 740 and cy < 470:
            purple["anger"] |= m
        elif cy > 600:
            purple["teeth"] |= m  # rot flecks on the teeth
        else:
            purple["cap"] |= m
    # dark grey / bright green also show up as anti-aliasing along ink edges;
    # only the snapback strap and the slime running down the teeth are real
    grey = np.zeros_like(black)
    for m, cx, cy in components((under == GREY) & sil, min_px=1500):
        grey |= m
    green_drips = np.zeros_like(black)
    for m, cx, cy in components((under == GREEN) & sil, min_px=150):
        if cy + y0 > 640:
            green_drips |= m
    # the outer cream ring is the sticker; any other cream is a tooth
    cream_l, _ = ndimage.label((under == CREAM) & sil)
    ring_id = cream_l[at(x0 + W / 2, y0 + MARGIN + 3)] or np.bincount(cream_l[cream_l > 0]).argmax()
    teeth = ((under == CREAM) & sil) & (cream_l != ring_id)

    def grow(region, others):
        return under_ink(region, ink_static, others)

    colours = {
        "cap_purple": grow(purple["cap"], lime_parts["head"] | teeth),
        "cap_grey": grow(grey, lime_parts["head"]),
        "cap_lime": grow(lime_parts["cap"], purple["cap"]),
        "head": grow(lime_parts["head"], teeth | purple["cap"]),
        "drips": grow(lime_parts["drips"], purple["cap"]),
        "teeth": grow(teeth, lime_parts["head"]),
        "teeth_rot": purple["teeth"],
        "drips_green": grow(green_drips, teeth),
        "anger": grow(purple["anger"], np.zeros_like(black)),
    }
    traced = {k: potrace_paths(v) for k, v in colours.items()}
    traced["sticker"] = potrace_paths(sil)
    traced["ink"] = potrace_paths(ink_static)

    # ---- eyes as their own traced shapes (white + ink ring), pupils as rings
    eyes = {}
    for side in ("left", "right"):
        white = eye_masks[side]
        outer = white | eye_rings[side]
        outer = ndimage.binary_closing(outer, structure=disk(3 * UP))
        ys_, xs_ = np.nonzero(white)
        eyes[side] = {
            "white": potrace_paths(white),
            "ring": potrace_paths(outer),
            "cx": round(xs_.mean() / UP, 1),
            "cy": round(ys_.mean() / UP, 1),
            "top": round(ys_.min() / UP, 1),
            "bottom": round(ys_.max() / UP, 1),
        }

    ox, oy = x0, y0
    pupils = {s: {"cx": round(p["cx"] - ox, 1), "cy": round(p["cy"] - oy, 1), "r": p["r"]} for s, p in PUPILS.items()}
    brows_local = {s: [[round(x - ox, 1), round(y - oy, 1)] for x, y in pts] for s, pts in brows.items()}

    def pupil_svg(p):
        c = f'cx="{p["cx"]}" cy="{p["cy"]}"'
        r = p["r"]
        return (f'<circle {c} r="{r[0]}" fill="{COLORS["ink"]}"/><circle {c} r="{r[1]}" fill="{COLORS["green"]}"/>'
                f'<circle {c} r="{r[2]}" fill="{COLORS["ink"]}"/><circle {c} r="{r[3]}" fill="{COLORS["green"]}"/>')

    def eyes_svg():
        out = '\n  <g id="eyes">'
        for s in ("left", "right"):
            e = eyes[s]
            out += (f'<g id="eye-{s}"><path fill="{COLORS["ink"]}" d="{"".join(e["ring"])}"/>'
                    f'<path fill="{COLORS["cream"]}" d="{"".join(e["white"])}"/></g>')
        out += "</g>"
        out += '\n  <defs>' + "".join(
            f'<clipPath id="eye-{s}-clip"><path d="{"".join(eyes[s]["white"])}"/></clipPath>' for s in ("left", "right")
        ) + "</defs>"
        out += '\n  <g id="pupils">' + "".join(
            f'<g id="pupil-{s}" clip-path="url(#eye-{s}-clip)">{pupil_svg(pupils[s])}</g>' for s in ("left", "right")
        ) + "</g>"
        out += '\n  <g id="brows" fill="%s">' % COLORS["ink"] + "".join(
            f'<polygon id="brow-{s}" points="{" ".join(f"{x},{y}" for x, y in brows_local[s])}"/>' for s in ("left", "right")
        ) + "</g>"
        return out

    def doc(with_face):
        vb = f"0 0 {W} {H}"
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{W}" height="{H}">'
                f"<title>VenbeeMail</title>")
        body = svg_group("sticker", COLORS["cream"], traced["sticker"])
        body += (f'\n  <g id="cap">' + svg_group("cap-crown", COLORS["purple"], traced["cap_purple"])
                 + svg_group("cap-strap", COLORS["grey"], traced["cap_grey"])
                 + svg_group("cap-button", COLORS["lime"], traced["cap_lime"]) + "</g>")
        body += svg_group("head", COLORS["lime"], traced["head"])
        body += (f'\n  <g id="teeth">' + svg_group("teeth-enamel", COLORS["cream"], traced["teeth"])
                 + svg_group("teeth-rot", COLORS["purple"], traced["teeth_rot"]) + "</g>")
        body += (f'\n  <g id="drips">' + svg_group("drips-cap", COLORS["lime"], traced["drips"])
                 + svg_group("drips-teeth", COLORS["green"], traced["drips_green"]) + "</g>")
        body += svg_group("anger", COLORS["purple"], traced["anger"])
        body += svg_group("ink", COLORS["ink"], traced["ink"])
        if with_face:
            body += eyes_svg()
        return head + body + "\n</svg>\n"

    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, "venbee-zombie.svg"), "w").write(doc(True))
    open(os.path.join(OUT, "venbee-zombie-body.svg"), "w").write(doc(False))

    geo = {
        "viewBox": [0, 0, W, H],
        "eyes": {s: {k: v for k, v in e.items() if k not in ("white", "ring")} | {
            "white": "".join(e["white"]), "ring": "".join(e["ring"])} for s, e in eyes.items()},
        "pupils": pupils,
        "brows": brows_local,
        "colors": COLORS,
    }
    os.makedirs(os.path.dirname(OUT_TS), exist_ok=True)
    with open(OUT_TS, "w") as f:
        f.write("// Generated by scripts/logo/trace_logo.py. Do not edit by hand.\n")
        f.write("// Coordinates are in the cropped logo's px; LOGO_GEOMETRY.viewBox is the SVG viewBox.\n")
        f.write(f"export const LOGO_GEOMETRY = {json.dumps(geo)} as const;\n")
    sizes = {k: sum(len(p) for p in v) for k, v in traced.items()}
    print("viewBox", geo["viewBox"], "path chars", sizes)


if __name__ == "__main__":
    main()
