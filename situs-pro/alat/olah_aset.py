"""Olah gambar acuan /pro menjadi aset hero.

Buang latar hijau (chroma key + despill di tepi), potong ke isi, simpan WebP
transparan ukuran asli dan lebar 512. Jalankan dari akar repo:

    python3 situs-pro/alat/olah_aset.py

Butuh Python 3, Pillow, NumPy, SciPy.
"""
from pathlib import Path
import json

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

AKAR = Path(__file__).resolve().parents[2]
REF = AKAR / "docs/pro/referensi"
KELUAR = AKAR / "situs-pro/aset/vbpro/gambar"
KUNCI = np.array([3.0, 248.0, 2.0])


def buang_hijau(rgb):
    """Kembalikan RGBA float (0..255) dengan latar hijau transparan."""
    rgb = rgb.astype(np.float64)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dominan = g - np.maximum(r, b)
    # 25 ke bawah: tokoh penuh; 205 ke atas: latar penuh.
    alfa = np.clip((205.0 - dominan) / 180.0, 0.0, 1.0)

    # Buang bintik kecil yang lepas dari tokoh.
    padat = alfa > 0.5
    label, n = ndimage.label(padat)
    if n > 1:
        ukuran = ndimage.sum(padat, label, range(1, n + 1))
        buang = np.isin(label, np.where(ukuran < 400)[0] + 1)
        alfa[buang] = 0.0

    # Pisahkan warna tokoh dari campuran hijau di piksel setengah tembus.
    a = alfa[..., None]
    murni = np.where(a > 0.05, (rgb - (1.0 - a) * KUNCI) / np.maximum(a, 0.05), rgb)
    murni = np.clip(murni, 0, 255)

    # Despill hanya dekat tepi supaya warna bagian dalam tidak berubah.
    jarak = ndimage.distance_transform_edt(alfa > 0.5)
    bobot = np.clip((7.0 - jarak) / 5.0, 0.0, 1.0)
    batas_g = np.maximum(murni[..., 0], murni[..., 2])
    g_baru = np.where(murni[..., 1] > batas_g, batas_g + (murni[..., 1] - batas_g) * 0.15, murni[..., 1])
    murni[..., 1] = murni[..., 1] * (1 - bobot) + g_baru * bobot

    # Tepi dirapikan sedikit.
    alfa = np.clip(alfa, 0, 1)
    return np.dstack([murni, alfa * 255.0])


def ke_gambar(rgba):
    return Image.fromarray(np.clip(rgba, 0, 255).round().astype(np.uint8), "RGBA")


def kotak_isi(rgba, pad=10):
    ys, xs = np.where(rgba[..., 3] > 6)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, rgba.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, rgba.shape[1])
    return x0, y0, x1, y1


def simpan(img, nama, hp=True, mutu=84):
    img.save(KELUAR / f"{nama}.webp", "WEBP", quality=mutu, alpha_quality=92, method=6)
    if hp and img.width > 512:
        tinggi = round(img.height * 512 / img.width)
        img.resize((512, tinggi), Image.LANCZOS).save(
            KELUAR / f"{nama}-512.webp", "WEBP", quality=mutu - 4, alpha_quality=88, method=6)


def buram(img, radius):
    """Versi buram untuk lapisan jauh (C4); alfa ikut diburamkan."""
    pad = radius * 3
    kanvas = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    kanvas.paste(img, (pad, pad))
    arr = np.asarray(kanvas).astype(np.float64)
    a = arr[..., 3:4] / 255.0
    pra = np.dstack([arr[..., :3] * a, a * 255.0])
    pra = np.dstack([ndimage.gaussian_filter(pra[..., i], radius) for i in range(4)])
    a2 = np.maximum(pra[..., 3:4] / 255.0, 1e-4)
    hasil = np.dstack([pra[..., :3] / a2, pra[..., 3:4]])
    return ke_gambar(hasil)


def tepi_cahaya(alfa, dx, dy, lebar=3.0):
    """Garis cahaya tipis di sisi tokoh yang menjauhi sorotan (M6)."""
    geser = ndimage.shift(alfa, (dy, dx), order=1, mode="constant", cval=0.0)
    tepi = np.clip(alfa - geser, 0.0, 1.0) * alfa
    return np.clip(ndimage.gaussian_filter(tepi, lebar / 3), 0.0, 1.0) ** 1.3


def pisah_maskot(rgba):
    """Tingkat 2: kotak surat beserta tangan dan lengan bawah dipisah dari badan.

    Garis potong di lengan bawah (y=262 di potongan maskot). Kepala tetap
    menyatu dengan badan. Potongan atas punya ekor 14 piksel yang memudar,
    menumpuk di atas lengan badan, supaya tidak ada celah saat kotak surat
    naik sampai 6 piksel.
    """
    t, l = rgba.shape[:2]
    yy, xx = np.mgrid[0:t, 0:l]
    potong_y, ekor = 262, 14
    lengan = (xx < 200) | (xx > 405)
    # Tepi bawah kotak surat per kolom: akhir bagian buram pertama dari atas.
    # Di kolom tempat topi menempel ke kotak surat, potong di y=160.
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
    bobot_atas = np.where(atas, 1.0, np.where(lengan & (yy < potong_y + ekor), pudar, 0.0))
    bobot_badan = np.where(atas & ~(lengan & (yy >= potong_y - 6)), 0.0, 1.0)

    tinggi_atas = potong_y + ekor + 2
    alfa = rgba[..., 3] / 255.0
    bagian_atas = rgba.copy()
    bagian_atas[..., 3] *= bobot_atas
    bagian_badan = rgba.copy()
    bagian_badan[..., 3] *= bobot_badan
    ke_gambar(bagian_atas[:tinggi_atas]).save(KELUAR / "maskot-kotak.webp", "WEBP", quality=84, alpha_quality=92, method=6)
    simpan(ke_gambar(bagian_badan), "maskot-badan")
    kecil = ke_gambar(bagian_atas[:tinggi_atas]).resize((512, round(tinggi_atas * 512 / l)), Image.LANCZOS)
    kecil.save(KELUAR / "maskot-kotak-512.webp", "WEBP", quality=80, alpha_quality=88, method=6)

    # Cahaya tepi teal muda, sisi kiri bawah (sorotan dari atas kanan).
    tepi = tepi_cahaya(alfa, dx=5, dy=-2, lebar=2.0)
    warna = np.zeros_like(rgba)
    warna[..., 0], warna[..., 1], warna[..., 2] = 150, 236, 240
    for nama, bobot in {"maskot-tepi-kotak": bobot_atas, "maskot-tepi-badan": bobot_badan}.items():
        lapis = warna.copy()
        lapis[..., 3] = tepi * bobot * 255.0
        if nama.endswith("kotak"):
            lapis = lapis[:tinggi_atas]
        img = ke_gambar(lapis)
        img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
        img.save(KELUAR / f"{nama}.webp", "WEBP", quality=70, alpha_quality=80, method=6)
    return {"potong_y": potong_y, "tinggi_kotak": tinggi_atas}


def main():
    KELUAR.mkdir(parents=True, exist_ok=True)
    catatan = {}

    # Latar panggung: ukuran asli dan versi HP (potong tengah).
    latar = Image.open(REF / "02-latar-panggung.png").convert("RGB")
    latar.save(KELUAR / "latar.webp", "WEBP", quality=82, method=6)
    latar.resize((1032, 576), Image.LANCZOS).save(KELUAR / "latar-1032.webp", "WEBP", quality=78, method=6)

    tokoh = {
        "maskot": "03-maskot-pisang-zombie-hijau.webp",
        "monyet-merah": "05-monyet-rambut-merah-hijau.webp",
        "monyet-biru": "07-monyet-rambut-biru-hijau.webp",
        "monyet-cokelat": "08-monyet-rambut-cokelat-hijau.webp",
        "monyet-pirang": "09-monyet-rambut-pirang-hijau.webp",
    }
    for nama, berkas in tokoh.items():
        rgba = buang_hijau(np.asarray(Image.open(REF / berkas).convert("RGB")))
        x0, y0, x1, y1 = kotak_isi(rgba)
        potong = rgba[y0:y1, x0:x1]
        catatan[nama] = {"asal": [int(x0), int(y0)], "ukuran": [int(x1 - x0), int(y1 - y0)]}
        img = ke_gambar(potong)
        simpan(img, nama)
        if nama == "maskot":
            catatan["maskot"]["potongan"] = pisah_maskot(potong)
        if nama.startswith("monyet"):
            kecil = img.resize((256, round(img.height * 256 / img.width)), Image.LANCZOS)
            buram(kecil, 3).save(KELUAR / f"{nama}-jauh.webp", "WEBP", quality=72, alpha_quality=80, method=6)

    # Amplop dan pesawat dari satu gambar.
    rgba = buang_hijau(np.asarray(Image.open(REF / "10-amplop-dan-pesawat-kertas-hijau.png").convert("RGB")))
    for nama, (xa, xb) in {"amplop": (0, 560), "pesawat": (560, 1024)}.items():
        bagian = rgba[:, xa:xb]
        x0, y0, x1, y1 = kotak_isi(bagian, pad=6)
        img = ke_gambar(bagian[y0:y1, x0:x1])
        catatan[nama] = {"ukuran": [img.width, img.height]}
        lebar = 320 if nama == "amplop" else 240
        img = img.resize((lebar, round(img.height * lebar / img.width)), Image.LANCZOS)
        img.save(KELUAR / f"{nama}.webp", "WEBP", quality=84, alpha_quality=92, method=6)
        if nama == "amplop":
            kecil = img.resize((160, round(img.height * 160 / img.width)), Image.LANCZOS)
            buram(kecil, 3).save(KELUAR / "amplop-jauh.webp", "WEBP", quality=72, alpha_quality=80, method=6)

    (AKAR / "situs-pro/alat/ukuran-aset.json").write_text(json.dumps(catatan, indent=2) + "\n")
    print(json.dumps(catatan, indent=2))


if __name__ == "__main__":
    main()
