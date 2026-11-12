"""Turunan gambar baru untuk VenbeeMail Pro gaya Kong (PRD 6.3).

Mengimpor fungsi dari situs-pro/alat/olah_aset.py tanpa mengubah berkas itu,
lalu menulis ke situs-pro-kong/aset/vbkong/gambar/ dan
situs-pro-kong/seedance/sumber/. Jalankan dari akar repo, sesudah
huruf_gunting.py (og.jpg memakai huruf gunting):

    python3 situs-pro-kong/alat/olah_aset_kong.py

Butuh Python 3, Pillow, NumPy, SciPy.
"""
from pathlib import Path
import json
import sys

sys.dont_write_bytecode = True  # jangan membuat __pycache__ di situs-pro/alat/

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

AKAR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(AKAR / "situs-pro/alat"))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import olah_aset as oa  # noqa: E402
import huruf_gunting as hg  # noqa: E402

REF = AKAR / "docs/pro/referensi"
GAMBAR = AKAR / "situs-pro-kong/aset/vbkong/gambar"
SUMBER = AKAR / "situs-pro-kong/seedance/sumber"
oa.KELUAR = GAMBAR  # oa.simpan() menulis ke sini, bukan ke situs-pro

MONYET = ["merah", "biru", "cokelat", "pirang"]
# Kotak kepala tiap monyet di potongan ukuran penuh: pusat x, pusat y, sisi.
KEPALA = {"merah": (428, 150, 320), "biru": (492, 148, 310), "cokelat": (357, 132, 292), "pirang": (304, 160, 320)}
# Mata maskot di bingkai 576x955 (sama dengan situs-pro/index.html, kelopak Fase 1).
MATA = [[256, 320, 35, 41], [339.5, 331.5, 28, 32]]


def potongan_maskot():
    rgba = oa.buang_hijau(np.asarray(Image.open(REF / "03-maskot-pisang-zombie-hijau.webp").convert("RGB")))
    x0, y0, x1, y1 = oa.kotak_isi(rgba)
    return rgba[y0:y1, x0:x1]


def kotak_panjang(rgba, ekor=40):
    """Seperti oa.pisah_maskot, tetapi ekor lengan memudar 40 piksel (bukan 14).

    Badan tetap maskot-badan.webp. Kotak boleh terdorong naik sampai 3 persen
    tinggi maskot (sekitar 29 piksel) tanpa celah di lengan.
    """
    t, l = rgba.shape[:2]
    yy, xx = np.mgrid[0:t, 0:l]
    potong_y = 262
    lengan = (xx < 200) | (xx > 405)
    padat = rgba[..., 3] > 40
    bawah_kotak = np.full(l, 160)
    for x in range(l):
        kolom = np.where(~padat[:, x])[0]
        mulai = np.argmax(padat[:, x]) if padat[:, x].any() else 0
        celah = kolom[kolom > mulai]
        if celah.size and celah[0] <= 168:
            bawah_kotak[x] = celah[0] + 1
    atas = (yy < bawah_kotak[None, :]) | (lengan & (yy < potong_y))
    pudar = np.clip((potong_y + ekor - yy) / ekor, 0.0, 1.0)
    bobot = np.where(atas, 1.0, np.where(lengan & (yy < potong_y + ekor), pudar, 0.0))
    tinggi = potong_y + ekor + 2
    bagian = rgba.copy()
    bagian[..., 3] *= bobot
    img = oa.ke_gambar(bagian[:tinggi])
    img.save(GAMBAR / "maskot-kotak-panjang.webp", "WEBP", quality=84, alpha_quality=92, method=6)
    img.resize((512, round(tinggi * 512 / l)), Image.LANCZOS).save(
        GAMBAR / "maskot-kotak-panjang-512.webp", "WEBP", quality=80, alpha_quality=88, method=6)
    return {"tinggi": tinggi, "ekor": ekor, "potong_y": potong_y}


def bayang_maskot(pad=40):
    """Siluet alfa maskot diisi #000814, buram radius 18, opacity 55 persen.

    Diberi ruang `pad` piksel di tiap sisi supaya buramnya tidak terpotong.
    """
    m = Image.open(GAMBAR / "maskot.webp").convert("RGBA")
    alfa = np.zeros((m.height + pad * 2, m.width + pad * 2))
    alfa[pad:pad + m.height, pad:pad + m.width] = np.asarray(m)[..., 3] / 255.0
    alfa = ndimage.gaussian_filter(alfa, 18 / 2) * 0.55
    hasil = np.zeros(alfa.shape + (4,))
    hasil[..., 0], hasil[..., 1], hasil[..., 2] = 0x00, 0x08, 0x14
    hasil[..., 3] = alfa * 255
    img = oa.ke_gambar(hasil)
    img.save(GAMBAR / "maskot-bayang.webp", "WEBP", quality=70, alpha_quality=70, method=6)
    s = 512 / m.width
    img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS).save(
        GAMBAR / "maskot-bayang-512.webp", "WEBP", quality=66, alpha_quality=66, method=6)
    return {"pad": pad, "ukuran": [img.width, img.height]}


def bibir_podium():
    """Pinggiran depan podium dari 02-latar-panggung.png, x 420-935, y 645-700.

    Per kolom: alfa 1 mulai satu piksel di atas piksel oranye pertama dari atas
    (kalau oranye pertama di atas y 645, seluruh kolom dari 645 terisi). Kolom
    tanpa oranye sama sekali (di luar podium) transparan. Tepi atas lembut 2
    piksel, dan 6 piksel terbawah memudar ke lantai.
    """
    latar = np.asarray(Image.open(REF / "02-latar-panggung.png").convert("RGB")).astype(int)
    x0, x1, y0, y1 = 420, 935, 645, 700
    r, g, b = latar[..., 0], latar[..., 1], latar[..., 2]
    oranye = (r > 170) & (g > 60) & (g < 150) & (b < 110) & (r - g > 60)
    alfa = np.zeros((y1 - y0, x1 - x0))
    yy = np.arange(y0, y1)
    for i, x in enumerate(range(x0, x1)):
        baris = np.where(oranye[600:705, x])[0]
        if baris.size == 0:
            continue
        atas = max(600 + baris[0] - 1, y0)
        alfa[:, i] = np.clip((yy - (atas - 2)) / 2.0, 0, 1)
    alfa *= np.clip((y1 - yy) / 6.0, 0, 1)[:, None]
    alfa = ndimage.gaussian_filter1d(alfa, 0.6, axis=1)
    rgba = np.dstack([latar[y0:y1, x0:x1], alfa * 255])
    img = oa.ke_gambar(rgba)
    img.save(GAMBAR / "podium-bibir.webp", "WEBP", quality=86, alpha_quality=92, method=6)
    img.resize((round(img.width * .75), round(img.height * .75)), Image.LANCZOS).save(
        GAMBAR / "podium-bibir-1032.webp", "WEBP", quality=84, alpha_quality=90, method=6)
    return {"kotak": [x0, y0, x1, y1], "persen": {
        "kiri": round(x0 / 1376 * 100, 2), "lebar": round((x1 - x0) / 1376 * 100, 2),
        "atas": round(y0 / 768 * 100, 2), "tinggi": round((y1 - y0) / 768 * 100, 2)}}


def lubang_podium():
    (GAMBAR / "podium-lubang.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 42" preserveAspectRatio="none">'
        '<ellipse cx="110" cy="21" rx="106" ry="18" fill="#000c10"/>'
        '<ellipse cx="110" cy="21" rx="106" ry="18" fill="none" stroke="#e7663c" stroke-width="3"/>'
        '<ellipse cx="110" cy="24" rx="92" ry="11" fill="none" stroke="#1a0f08" stroke-width="2" opacity=".6"/>'
        '</svg>\n')


def tepi_monyet():
    for n in MONYET:
        m = Image.open(GAMBAR / f"monyet-{n}.webp").convert("RGBA")
        alfa = np.asarray(m)[..., 3] / 255.0
        tepi = oa.tepi_cahaya(alfa, dx=5, dy=-2, lebar=2.0)
        lapis = np.zeros(alfa.shape + (4,))
        lapis[..., 0], lapis[..., 1], lapis[..., 2] = 150, 236, 240
        lapis[..., 3] = tepi * 255
        img = oa.ke_gambar(lapis)
        img.resize((img.width // 2, img.height // 2), Image.LANCZOS).save(
            GAMBAR / f"monyet-{n}-tepi.webp", "WEBP", quality=70, alpha_quality=80, method=6)


def perangko():
    for n in MONYET:
        m = Image.open(GAMBAR / f"monyet-{n}.webp").convert("RGBA")
        cx, cy, sisi = KEPALA[n]
        kotak = (cx - sisi // 2, cy - sisi // 2, cx + sisi // 2, cy + sisi // 2)
        kanvas = Image.new("RGBA", (sisi, sisi), (0, 0, 0, 0))
        kanvas.paste(m.crop(kotak), (0, 0))
        kanvas.resize((160, 160), Image.LANCZOS).save(
            GAMBAR / f"perangko-monyet-{n}.webp", "WEBP", quality=82, alpha_quality=90, method=6)


def besar():
    """Aset resolusi asli untuk bingkai kunci Seedance (PNG, latar transparan)."""
    SUMBER.mkdir(parents=True, exist_ok=True)
    rgba = oa.buang_hijau(np.asarray(Image.open(REF / "10-amplop-dan-pesawat-kertas-hijau.png").convert("RGB")))
    hasil = {}
    for nama, (xa, xb) in {"amplop": (0, 560), "pesawat": (560, 1024)}.items():
        bagian = rgba[:, xa:xb]
        x0, y0, x1, y1 = oa.kotak_isi(bagian, pad=6)
        img = oa.ke_gambar(bagian[y0:y1, x0:x1])
        img.save(SUMBER / f"{nama}-besar.png", optimize=True)
        hasil[nama] = [img.width, img.height]
    maskot = potongan_maskot()
    oa.ke_gambar(maskot).save(SUMBER / "maskot-besar.png", optimize=True)
    hasil["maskot"] = [maskot.shape[1], maskot.shape[0]]
    berkas = {"merah": "05-monyet-rambut-merah-hijau.webp", "biru": "07-monyet-rambut-biru-hijau.webp",
              "cokelat": "08-monyet-rambut-cokelat-hijau.webp", "pirang": "09-monyet-rambut-pirang-hijau.webp"}
    for n in MONYET:  # monyet ukuran penuh tanpa kompresi, untuk bingkai kunci ref-1..4
        m = oa.buang_hijau(np.asarray(Image.open(REF / berkas[n]).convert("RGB")))
        x0, y0, x1, y1 = oa.kotak_isi(m)
        oa.ke_gambar(m[y0:y1, x0:x1]).save(SUMBER / f"monyet-{n}-besar.png", optimize=True)
    return hasil, maskot


def ukur(maskot):
    badan = np.asarray(Image.open(GAMBAR / "maskot-badan.webp"))[..., 3]
    baris = np.where((badan > 128).any(axis=1))[0]
    kaki = int(baris.max())
    # Celah surat: piksel gelap di bidang kotak surat.
    m = np.asarray(Image.open(GAMBAR / "maskot.webp")).astype(int)
    bidang = m[30:100, 140:360]
    gelap = (bidang[..., :3].mean(axis=2) < 45) & (bidang[..., 3] > 200)
    ys, xs = np.where(gelap)
    celah = [round(float(xs.mean()) + 140, 1), round(float(ys.mean()) + 30, 1)]
    celah_kotak = [int(xs.min()) + 140, int(ys.min()) + 30, int(xs.max()) + 140, int(ys.max()) + 30]
    return {"kaki_bawah": kaki, "celah": celah, "celah_kotak": celah_kotak}


def og():
    """Kartu bagikan 1200x630: latar, maskot kanan di podium, amplop melayang, wordmark kiri.

    Panggung digeser ke kanan supaya podium di bawah maskot. Celah di kiri diisi
    potongan dinding kiri latar yang direntangkan (dinding dan lantai hampir
    seragam mendatar), disambung dengan tepi lembut.
    """
    s = 0.88
    latar = Image.open(REF / "02-latar-panggung.png").convert("RGB")
    latar = latar.resize((round(1376 * s), round(768 * s)), Image.LANCZOS)
    atas = 30
    pusat_x = 860
    geser = round(pusat_x - 676 * s)
    dasar = latar.crop((0, atas, 260, atas + 630)).resize((1200, 630), Image.LANCZOS).convert("RGBA")
    lapis = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    lapis.paste(latar.crop((0, atas, min(latar.width, 1200 - geser), atas + 630)), (geser, 0))
    topeng = np.zeros((630, 1200))
    topeng[:, geser:] = 1
    topeng[:, geser:geser + 220] = np.linspace(0, 1, 220)[None, :]
    lapis.putalpha(Image.fromarray((topeng * 255).astype(np.uint8)))
    kanvas = Image.alpha_composite(dasar, lapis)

    kaki_y = round(645 * s) - atas
    tinggi = 452
    maskot = Image.open(GAMBAR / "maskot.webp").convert("RGBA")
    skala_m = tinggi / 955
    maskot = maskot.resize((round(576 * skala_m), tinggi), Image.LANCZOS)
    kaki_bawah = json.loads((GAMBAR / "ukuran-kong.json").read_text())["kaki_bawah"] if (GAMBAR / "ukuran-kong.json").exists() else 943
    mx = round(pusat_x - 0.491 * 0 - maskot.width / 2)
    my = round(kaki_y - kaki_bawah * skala_m)
    bay = Image.new("RGBA", kanvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(bay).ellipse([pusat_x - 120, kaki_y - 14, pusat_x + 120, kaki_y + 8], fill=(0, 0, 0, 80))
    kanvas = Image.alpha_composite(kanvas, bay.filter(ImageFilter.GaussianBlur(10)))
    kanvas.alpha_composite(maskot, (mx, my))
    bibir = Image.open(GAMBAR / "podium-bibir.webp").convert("RGBA")
    bibir = bibir.resize((round(bibir.width * s), round(bibir.height * s)), Image.LANCZOS)
    kanvas.alpha_composite(bibir, (round(420 * s) + geser, round(645 * s) - atas))

    amplop = Image.open(SUMBER / "amplop-besar.png").convert("RGBA")
    amplop = amplop.resize((160, round(amplop.height * 160 / amplop.width)), Image.LANCZOS)
    amplop = amplop.rotate(8, expand=True, resample=Image.BICUBIC)
    kanvas.alpha_composite(amplop, (548, 392))

    b1 = hg.gambar_teks("VENBEE", 112, "bunga")
    b2 = hg.gambar_teks("MAIL", 112, "bunga")
    pro = hg.gambar_teks("PRO", 66, "kertas", bayangan="#00141a").rotate(6, expand=True, resample=Image.BICUBIC)
    x, y = 52, 74
    kanvas.alpha_composite(b1, (x, y))
    kanvas.alpha_composite(b2, (x, y + b1.height + 4))
    kanvas.alpha_composite(pro, (x + b2.width + 16, y + b1.height + 4 + b2.height - pro.height + 10))
    kanvas.convert("RGB").save(GAMBAR / "og.jpg", "JPEG", quality=84, optimize=True, progressive=True)


def main():
    GAMBAR.mkdir(parents=True, exist_ok=True)
    catatan = {}
    besar_ukuran, maskot = besar()
    catatan["besar"] = besar_ukuran
    catatan["maskot_kotak_panjang"] = kotak_panjang(maskot)
    catatan["maskot_bayang"] = bayang_maskot()
    catatan["podium_bibir"] = bibir_podium()
    lubang_podium()
    tepi_monyet()
    perangko()
    catatan.update(ukur(maskot))
    catatan["mata"] = MATA
    catatan["maskot"] = [576, 955]
    catatan["kotak_tinggi"] = 278
    og()
    (GAMBAR / "ukuran-kong.json").write_text(json.dumps(catatan, indent=2) + "\n")
    print(json.dumps(catatan, indent=2))


if __name__ == "__main__":
    main()
