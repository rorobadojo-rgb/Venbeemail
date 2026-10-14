"""Bingkai kunci Seedance 2.5 untuk VenbeeMail Pro gaya Kong (PRD 7.3).

Merakit PNG tepat 1280x720 dari aset asli ke situs-pro-kong/seedance/bingkai/,
ditambah gambar referensi V3x (ref-1..ref-6) dan satu lembar pratinjau
(lembar-bingkai.jpg). Tidak ada teks di bingkai mana pun; label hanya ada di
lembar pratinjau.

Jalankan dari akar repo, sesudah olah_aset_kong.py:

    python3 situs-pro-kong/alat/bingkai_kunci.py

Kalau LO mengirim latar resolusi besar (R15), taruh di
situs-pro-kong/seedance/sumber/latar-besar.png; skrip memakainya untuk
K1, K3a, K3b, dan K6.
"""
from pathlib import Path
import json
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

AKAR = Path(__file__).resolve().parents[2]
REF = AKAR / "docs/pro/referensi"
SUMBER = AKAR / "situs-pro-kong/seedance/sumber"
GAMBAR = AKAR / "situs-pro-kong/aset/vbkong/gambar"
KELUAR = AKAR / "situs-pro-kong/seedance/bingkai"
W, H = 1280, 720

# Latar 1376x768 diskalakan ke tinggi 720 (lebar 1290), dipotong 5 piksel kiri-kanan.
S = 720 / 768
POTONG = 5
PUSAT_X = round(676 * S) - POTONG          # 629
PERMUKAAN = (round(604 * S), round(657 * S))  # 566, 616
BAWAH_PODIUM = round(690 * S)               # 647
KAKI_Y = round(645 * S)                     # 605, garis kaki yang sama dengan footer


def latar_asli():
    besar = SUMBER / "latar-besar.png"
    return Image.open(besar if besar.exists() else REF / "02-latar-panggung.png").convert("RGB")


def latar_dasar():
    img = Image.open(REF / "02-latar-panggung.png").convert("RGB")
    img = img.resize((round(1376 * S), H), Image.LANCZOS)
    return img.crop((POTONG, 0, POTONG + W, H)).convert("RGBA")


def sesuaikan(img):
    """Samakan benda tempelan dengan cahaya teal: kecerahan 0,92, bayangan sedikit biru."""
    arr = np.asarray(img.convert("RGBA")).astype(np.float64)
    rgb = arr[..., :3] * 0.92
    lum = rgb.mean(axis=2, keepdims=True) / 255.0
    gelap = np.clip(1.0 - lum * 1.6, 0, 1)
    rgb[..., 0:1] -= gelap * 6
    rgb[..., 2:3] += gelap * 10
    arr[..., :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def muat(nama, lebar=None, tinggi=None, putar=0.0, sesuai=True):
    img = Image.open(SUMBER / nama).convert("RGBA")
    if lebar:
        img = img.resize((round(lebar), round(img.height * lebar / img.width)), Image.LANCZOS)
    elif tinggi:
        img = img.resize((round(img.width * tinggi / img.height), round(tinggi)), Image.LANCZOS)
    if sesuai:
        img = sesuaikan(img)
    if putar:
        # PIL memutar berlawanan jarum jam untuk sudut positif; PRD memakai sudut layar (positif = searah jarum jam).
        img = img.rotate(-putar, expand=True, resample=Image.BICUBIC)
    return img


def tempel_tengah(kanvas, img, cx, cy):
    kanvas.alpha_composite(img, (round(cx - img.width / 2), round(cy - img.height / 2)))


def bayangan_kontak(kanvas, cx, cy, lebar, tinggi):
    lapis = Image.new("RGBA", kanvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(lapis).ellipse([cx - lebar / 2, cy - tinggi / 2, cx + lebar / 2, cy + tinggi / 2], fill=(0, 0, 0, 77))
    return Image.alpha_composite(kanvas, lapis.filter(ImageFilter.GaussianBlur(12)))


def cahaya(kanvas, cx, cy, r, kuat, warna=(170, 225, 235)):
    """Lingkaran cahaya lembut, ditambahkan (screen) ke kanvas."""
    yy, xx = np.mgrid[0:kanvas.height, 0:kanvas.width]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    a = np.clip(1 - d, 0, 1) ** 2 * kuat
    arr = np.asarray(kanvas).astype(np.float64)
    for i, c in enumerate(warna):
        arr[..., i] = 255 - (255 - arr[..., i]) * (1 - a * c / 255)
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def kerucut(kanvas, puncak_x, lebar_bawah, y_bawah, kuat):
    """Kerucut sorotan dari tepi atas ke y_bawah."""
    yy, xx = np.mgrid[0:kanvas.height, 0:kanvas.width].astype(np.float64)
    t = np.clip(yy / y_bawah, 0, 1)
    setengah = 30 + (lebar_bawah / 2 - 30) * t
    d = np.abs(xx - puncak_x) / setengah
    a = np.clip(1 - d, 0, 1) ** 1.6 * (0.35 + 0.65 * t) * (yy <= y_bawah * 1.04) * kuat
    a = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))
    a = np.asarray(a) / 255.0
    arr = np.asarray(kanvas).astype(np.float64)
    for i, c in enumerate((175, 228, 238)):
        arr[..., i] = 255 - (255 - arr[..., i]) * (1 - a * c / 255)
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def vignette(kanvas, kuat=0.5):
    yy, xx = np.mgrid[0:kanvas.height, 0:kanvas.width]
    d = np.sqrt(((xx - kanvas.width / 2) / (kanvas.width / 2)) ** 2 + ((yy - kanvas.height / 2) / (kanvas.height / 2)) ** 2)
    f = 1 - np.clip((d - 0.55) / 0.85, 0, 1) * kuat
    arr = np.asarray(kanvas).astype(np.float64)
    arr[..., :3] *= f[..., None]
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def perbesar(img, skala, cx, cy):
    """Perbesar img dengan pusat (cx, cy) tetap di tempat yang sama, ukuran tetap."""
    w, h = img.size
    besar = img.resize((round(w * skala), round(h * skala)), Image.LANCZOS)
    x0 = round(cx * skala - cx)
    y0 = round(cy * skala - cy)
    return besar.crop((x0, y0, x0 + w, y0 + h))


def simpan(img, nama):
    img.convert("RGB").save(KELUAR / nama, optimize=True)
    return KELUAR / nama


# ---------- Bingkai ----------

AMPLOP_BIASA = 262          # lebar amplop di podium pada skala dasar (K1 = 1,6 x 262 = 420)
AMPLOP_BAWAH = 596          # tepi bawah amplop yang berdiri di permukaan podium


def kh():
    k = latar_dasar()
    k = bayangan_kontak(k, PUSAT_X, 598, 220, 26)
    amplop = muat("amplop-besar.png", lebar=300, putar=-6)
    tinggi_amplop = 300 * 301 / 418
    tempel_tengah(k, amplop, PUSAT_X, 470 - tinggi_amplop / 2)
    return k


def k0():
    k = latar_dasar()
    k = bayangan_kontak(k, PUSAT_X, AMPLOP_BAWAH + 2, 230, 24)
    amplop = muat("amplop-besar.png", lebar=AMPLOP_BIASA)
    k.alpha_composite(amplop, (round(PUSAT_X - amplop.width / 2), AMPLOP_BAWAH - amplop.height))
    arr = np.asarray(k).astype(np.float64)
    arr[..., :3] *= 0.35
    k = Image.fromarray(arr.round().astype(np.uint8), "RGBA")
    k = cahaya(k, W / 2 - 15, -40, 420, 0.15)
    kecil = k.resize((round(W * .9), round(H * .9)), Image.LANCZOS)
    # Tepi diisi gradien dari warna panggung gelap itu sendiri (#001d25 dikali
    # 0,35 di dinding, lantai di bawah), supaya bingkai yang diperkecil tidak
    # terlihat sebagai kotak.
    dasar = k.resize((W // 16, H // 16), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.LANCZOS)
    topeng = Image.new("L", kecil.size, 0)
    ImageDraw.Draw(topeng).rectangle([40, 40, kecil.width - 40, kecil.height - 40], fill=255)
    topeng = topeng.filter(ImageFilter.GaussianBlur(30))
    dasar.paste(kecil, ((W - kecil.width) // 2, (H - kecil.height) // 2), topeng)
    return dasar


def k1():
    pusat_y = AMPLOP_BAWAH - AMPLOP_BIASA * 301 / 418 / 2
    k = latar_dasar()
    k = bayangan_kontak(k, PUSAT_X, AMPLOP_BAWAH + 2, 230, 24)
    k = perbesar(k, 1.6, PUSAT_X, pusat_y)
    k = kerucut(k, PUSAT_X, 760, 600, 0.22)
    amplop = muat("amplop-besar.png", lebar=AMPLOP_BIASA * 1.6)
    bawah = pusat_y + (AMPLOP_BAWAH - pusat_y) * 1.6
    k.alpha_composite(amplop, (round(PUSAT_X - amplop.width / 2), round(bawah - amplop.height)))
    return k


def k2():
    k = perbesar(latar_dasar(), 2.4, PUSAT_X, 420)
    pesawat = muat("pesawat-besar.png", lebar=520, putar=-24)
    k.alpha_composite(pesawat, (W - 300, -170))
    amplop = muat("amplop-besar.png", lebar=1500, putar=8)
    tempel_tengah(k, amplop, W / 2 + 10, H / 2 + 40)
    return k.filter(ImageFilter.GaussianBlur(1.5))


def k3(x):
    asal = latar_asli()
    sk = asal.width / 1376
    potong = asal.crop((round(x * sk), round(380 * sk), round((x + 688) * sk), round((380 + 387) * sk)))
    return potong.resize((W, H), Image.LANCZOS).convert("RGBA")


def langit(acak_benih=4104):
    yy = np.linspace(0, 1, H)[:, None]
    atas, bawah = np.array([0x00, 0x14, 0x1a]), np.array([0x03, 0x31, 0x41])
    warna = atas * (1 - yy[..., None]) + bawah * yy[..., None]
    arr = np.repeat(warna, W, axis=1)
    k = Image.fromarray(np.dstack([arr, np.full((H, W, 1), 255.0)]).round().astype(np.uint8), "RGBA")
    k = cahaya(k, W / 2, H + 120, 520, 0.18)
    lapis = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(lapis)
    acak = random.Random(acak_benih)
    for _ in range(60):
        cx, cy = acak.uniform(0, W), acak.uniform(0, H)
        r = acak.uniform(4, 14) / 2
        a = round(acak.uniform(.3, .9) * 255)
        putar = acak.uniform(0, 60)
        for i in range(6):
            t = math.radians(putar + i * 60)
            px, py = cx + math.sin(t) * r * .55, cy - math.cos(t) * r * .55
            rr = r * .34
            dr.ellipse([px - rr, py - rr, px + rr, py + rr], fill=(244, 247, 251, a))
        dr.ellipse([cx - r * .22, cy - r * .22, cx + r * .22, cy + r * .22], fill=(49, 69, 140, a))
    return Image.alpha_composite(k, lapis)


def pesawat_amplop(skala):
    """Pesawat dengan amplop menempel di bawahnya, sebagai satu gambar."""
    pesawat = muat("pesawat-besar.png", lebar=520 * skala)
    amplop = muat("amplop-besar.png", lebar=300 * skala)
    gw = max(pesawat.width, amplop.width)
    gh = round(pesawat.height * .62 + amplop.height)
    g = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    g.alpha_composite(amplop, ((gw - amplop.width) // 2 + round(10 * skala), gh - amplop.height))
    g.alpha_composite(pesawat, ((gw - pesawat.width) // 2, 0))
    return g


def k4():
    k = langit()
    g = pesawat_amplop(1).rotate(10, expand=True, resample=Image.BICUBIC)  # -10 derajat layar
    tempel_tengah(k, g, W / 2, H / 2)
    return k


def k4b():
    k = langit()
    g = pesawat_amplop(1.5).rotate(10 - 180, expand=True, resample=Image.BICUBIC)
    tempel_tengah(k, g, W / 2 + 80, H / 2)
    return k


def k5():
    k = latar_dasar()
    data = json.loads((GAMBAR / "ukuran-kong.json").read_text())
    tinggi = 400
    sk = tinggi / 955
    k = bayangan_kontak(k, PUSAT_X, KAKI_Y - 4, 200, 22)
    maskot = muat("maskot-besar.png", tinggi=tinggi)
    k.alpha_composite(maskot, (round(PUSAT_X - maskot.width / 2), round(KAKI_Y - data["kaki_bawah"] * sk)))
    bibir = Image.open(GAMBAR / "podium-bibir.webp").convert("RGBA")
    bibir = bibir.resize((round(bibir.width * S), round(bibir.height * S)), Image.LANCZOS)
    k.alpha_composite(bibir, (round(420 * S) - POTONG, round(645 * S)))
    return vignette(k, 0.55)


def k6():
    data = json.loads((GAMBAR / "ukuran-kong.json").read_text())
    maskot = Image.open(SUMBER / "maskot-besar.png").convert("RGBA")
    kotak = maskot.crop((60, 0, 516, 240))      # kotak surat dan tangan, sampai melewati tepi bawah bingkai
    cx, cy = data["celah"]
    sk = 1100 / 420                              # tabung kardus sekitar 420 piksel di bingkai maskot
    besar = sesuaikan(kotak.resize((round(kotak.width * sk), round(kotak.height * sk)), Image.LANCZOS))
    dasar = perbesar(latar_dasar(), 2.2, PUSAT_X, 200).filter(ImageFilter.GaussianBlur(16))
    arr = np.asarray(dasar).astype(np.float64)
    arr[..., :3] *= 0.7
    k = Image.fromarray(arr.round().astype(np.uint8), "RGBA")
    k.alpha_composite(besar, (round(W / 2 - (cx - 60) * sk), round(330 - cy * sk)))
    return vignette(k, 0.35)


def kf():
    return latar_dasar()


def referensi():
    hasil = []
    isi = ["monyet-merah-besar.png", "monyet-biru-besar.png", "monyet-cokelat-besar.png", "monyet-pirang-besar.png", "amplop-besar.png"]
    for i, nama in enumerate(isi, 1):
        k = Image.new("RGBA", (1024, 1024), (0x01, 0x23, 0x2d, 255))
        img = Image.open(SUMBER / nama).convert("RGBA")
        sk = min(870 / img.width, 870 / img.height)
        if nama.startswith("amplop"):
            sk = min(sk, 700 / img.width)
        img = img.resize((round(img.width * sk), round(img.height * sk)), Image.LANCZOS)
        tempel_tengah(k, img, 512, 512)
        hasil.append(simpan(k, f"ref-{i}.png"))
    hasil.append(simpan(k3(300), "ref-6.png"))
    return hasil


def lembar(daftar):
    """Lembar pratinjau: semua bingkai kecil dengan label (label hanya di lembar ini)."""
    kolom, lw = 3, 420
    lh = round(lw * 9 / 16)
    baris = math.ceil(len(daftar) / kolom)
    k = Image.new("RGB", (kolom * (lw + 20) + 20, baris * (lh + 56) + 20), "#00141a")
    dr = ImageDraw.Draw(k)
    try:
        huruf = ImageFont.load_default(size=20)
    except TypeError:
        huruf = ImageFont.load_default()
    for i, (label, berkas) in enumerate(daftar):
        x, y = 20 + (i % kolom) * (lw + 20), 20 + (i // kolom) * (lh + 56)
        img = Image.open(berkas).convert("RGB")
        img.thumbnail((lw, lh), Image.LANCZOS)
        k.paste(img, (x + (lw - img.width) // 2, y))
        dr.text((x, y + lh + 8), label, fill="#f4f1ea", font=huruf)
    k.save(KELUAR / "lembar-bingkai.jpg", quality=86)
    return KELUAR / "lembar-bingkai.jpg"


def main():
    KELUAR.mkdir(parents=True, exist_ok=True)
    bingkai = [("KH", kh), ("K0", k0), ("K1", k1), ("K2", k2), ("K3a", lambda: k3(300)), ("K3b", lambda: k3(388)),
               ("K4", k4), ("K4b", k4b), ("K5", k5), ("K6", k6), ("KF", kf)]
    daftar = []
    for nama, fungsi in bingkai:
        img = fungsi()
        assert img.size == (W, H), (nama, img.size)
        daftar.append((f"{nama}.png", simpan(img, f"{nama}.png")))
    refs = referensi()
    daftar_lembar = [("KH  V0 hero loop (awal = akhir)", daftar[0][1]),
                     ("K0  V1 awal", daftar[1][1]), ("K1  V1 akhir / V2 awal", daftar[2][1]),
                     ("K2  V2 akhir", daftar[3][1]), ("K3a  V3 awal", daftar[4][1]), ("K3b  V3 akhir", daftar[5][1]),
                     ("K4  V4 awal", daftar[6][1]), ("K4b  V4 akhir", daftar[7][1]), ("K5  V5 awal", daftar[8][1]),
                     ("K6  V5 akhir", daftar[9][1]), ("KF  V6 sorotan loop (awal = akhir)", daftar[10][1])]
    daftar_lembar += [(f"ref-{i}  V3x referensi", p) for i, p in enumerate(refs, 1)]
    print(lembar(daftar_lembar))
    for nama, p in daftar:
        print(nama, p.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
