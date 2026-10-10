"""Gambar diam dari bingkai kunci, untuk mode tanpa video (PRD 7.7 langkah 4, 9.2, 9.6).

Selama video Seedance belum ada, halaman memakai gambar ini:

- aset/vbkong/film/diam/d/1..6.webp (1280x720) dan film/diam/h/1..6.webp (405x720):
  komik 6 panel dan cadangan film. Panel 3 (estafet) diberi empat monyet dan
  amplop dari potongan yang sudah ada; panel 6 diberi cahaya hangat di celah.
- aset/vbkong/video/hero-poster-1280.webp, -540.webp (dari KH) dan
  sorot-poster-1280.webp, -540.webp (dari KF).
- aset/vbkong/gambar/latar-api.webp (K2), latar-endpoint.webp (K4),
  latar-domain.webp (K3a): buram dan digelapkan, untuk latar panel Bab 2.

Setelah video jadi, olah_video.sh menimpa berkas yang sama dari video.
Jalankan dari akar repo, sesudah bingkai_kunci.py:

    python3 situs-pro-kong/alat/diam_dari_bingkai.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

AKAR = Path(__file__).resolve().parents[2]
BINGKAI = AKAR / "situs-pro-kong/seedance/bingkai"
VBK = AKAR / "situs-pro-kong/aset/vbkong"
GAMBAR = VBK / "gambar"


def buka(nama):
    return Image.open(BINGKAI / f"{nama}.png").convert("RGBA")


def tempel(k, nama, tinggi, kaki_x, kaki_y, putar=0.0, cermin=False):
    img = Image.open(GAMBAR / f"{nama}.webp").convert("RGBA")
    img = img.resize((round(img.width * tinggi / img.height), tinggi), Image.LANCZOS)
    if cermin:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    arr = np.asarray(img).astype(np.float64)
    arr[..., :3] *= 0.9  # brightness(.9), sama dengan filter monyet di halaman (PRD 9.3)
    img = Image.fromarray(arr.round().astype(np.uint8), "RGBA")
    if putar:
        img = img.rotate(-putar, expand=True, resample=Image.BICUBIC)
    k.alpha_composite(img, (round(kaki_x - img.width / 2), round(kaki_y - img.height)))


def panel_estafet():
    k = buka("K3a")
    lantai = 545
    bay = Image.new("RGBA", k.size, (0, 0, 0, 0))
    from PIL import ImageDraw
    dr = ImageDraw.Draw(bay)
    for x in (190, 500, 800, 1110):
        dr.ellipse([x - 110, lantai - 14, x + 110, lantai + 10], fill=(0, 0, 0, 90))
    k = Image.alpha_composite(k, bay.filter(ImageFilter.GaussianBlur(10)))
    tempel(k, "monyet-merah", 250, 190, lantai)
    tempel(k, "monyet-biru", 262, 500, lantai, cermin=True)
    tempel(k, "monyet-cokelat", 250, 800, lantai, putar=-12)
    tempel(k, "monyet-pirang", 266, 1110, lantai, cermin=True)
    amplop = Image.open(GAMBAR / "amplop.webp").convert("RGBA").resize((150, 108), Image.LANCZOS).rotate(-35, expand=True, resample=Image.BICUBIC)
    k.alpha_composite(amplop, (720, 236))
    return k


def panel_celah():
    k = buka("K6")
    yy, xx = np.mgrid[0:720, 0:1280].astype(np.float64)
    d = np.sqrt(((xx - 640) / 420) ** 2 + ((yy - 330) / 60) ** 2)
    a = np.clip(1 - d, 0, 1) ** 2 * 0.5
    arr = np.asarray(k).astype(np.float64)
    for i, c in enumerate((255, 176, 112)):
        arr[..., i] = 255 - (255 - arr[..., i]) * (1 - a * c / 255)
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def simpan_panel(img, n):
    for f in ("d", "h"):
        (VBK / f"film/diam/{f}").mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(VBK / f"film/diam/d/{n}.webp", "WEBP", quality=70, method=6)
    rgb.crop(((1280 - 405) // 2, 0, (1280 - 405) // 2 + 405, 720)).save(VBK / f"film/diam/h/{n}.webp", "WEBP", quality=66, method=6)


def poster(nama, img, kiri540):
    (VBK / "video").mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(VBK / f"video/{nama}-poster-1280.webp", "WEBP", quality=70, method=6)
    rgb.crop((kiri540, 0, kiri540 + 720, 720)).resize((540, 540), Image.LANCZOS).save(
        VBK / f"video/{nama}-poster-540.webp", "WEBP", quality=68, method=6)


def latar_panel(nama, img):
    rgb = img.convert("RGB").filter(ImageFilter.GaussianBlur(14))
    rgb = ImageEnhance.Brightness(rgb).enhance(0.78)
    rgb.save(GAMBAR / f"latar-{nama}.webp", "WEBP", quality=50, method=6)


def main():
    panel = [buka("K1"), buka("K2"), panel_estafet(), buka("K4"), buka("K5"), panel_celah()]
    for n, img in enumerate(panel, 1):
        simpan_panel(img, n)
    poster("hero", buka("KH"), 280)
    poster("sorot", buka("KF"), 269)
    latar_panel("api", buka("K2"))
    latar_panel("endpoint", buka("K4"))
    latar_panel("domain", buka("K3a"))
    for p in sorted((VBK / "film/diam").rglob("*.webp")) + sorted((VBK / "video").glob("*.webp")) + sorted(GAMBAR.glob("latar-*.webp")):
        print(p.relative_to(VBK), p.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
