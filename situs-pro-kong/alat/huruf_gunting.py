"""Huruf gunting (JD1) untuk VenbeeMail Pro gaya Kong.

Membuat situs-pro-kong/aset/vbkong/gunting.svg: satu sprite berisi pola isian
(kertas, flanel, kardus, bunga) dan satu <symbol id="g-X"> per huruf. Gaya
mengikuti gambar acuan 06 (potongan kertas tajam, miring, lubang segitiga).
Bentuk V, E, N, B, M, A, I, L diambil dari objek BENTUK di
situs-pro/aset/vbpro/hero.js supaya logo dua versi serasi.

Semua bentuk adalah poligon (M, L, Z) setinggi 100 satuan, lubang memakai
aturan evenodd. Tiap simbol membawa data-w (lebar), data-miring (derajat) dan
data-naik (geser tegak, satuan huruf) untuk rakitGunting() di halaman.js.

Jalankan dari akar repo:

    python3 situs-pro-kong/alat/huruf_gunting.py           # tulis gunting.svg
    python3 situs-pro-kong/alat/huruf_gunting.py --contoh F # juga lembar contoh PNG ke F

Modul ini juga dipakai olah_aset_kong.py (gambar_teks) untuk og.jpg.
"""
from pathlib import Path
import random
import re
import sys

AKAR = Path(__file__).resolve().parents[2]
KELUAR = AKAR / "situs-pro-kong/aset/vbkong/gunting.svg"

# kunci: (lebar, path, miring, naik). Dari hero.js: V E N B M A I L (+ E2, E3).
HURUF = {
    "A": (90, "M27 0L63 3L90 99L60 100L56 84L33 84L29 100L0 98ZM45 30L52 62L38 62Z", -6, -2),
    "B": (82, "M0 0L57 1L77 15L76 41L71 49L81 60L80 87L64 100L1 99ZM28 17L54 20L29 41ZM28 58L57 61L29 84Z", -9, -5),
    "C": (80, "M8 0L78 3L76 30L44 31L33 50L45 68L79 69L77 100L6 98L0 87L2 11Z", 4, 2),
    "D": (82, "M0 1L58 0L82 22L80 78L60 100L1 98ZM29 25L53 38L30 75Z", -5, -3),
    "E": (70, "M2 0L70 4L68 28L33 27L34 40L60 41L59 60L33 60L34 73L71 72L70 100L0 99Z", 5, -3),
    "E2": (70, "M0 3L68 0L70 27L34 29L33 41L58 40L60 59L34 61L33 72L69 75L68 100L2 98Z", 6, 3),
    "E3": (71, "M1 0L69 2L67 26L32 28L33 41L61 39L60 60L32 59L33 74L70 73L71 99L0 100Z", -4, -1),
    "F": (66, "M0 2L66 0L65 28L32 29L33 42L58 41L57 62L33 62L32 100L2 99Z", 6, 2),
    "G": (84, "M8 0L80 3L79 28L38 30L32 50L40 70L54 70L54 62L44 61L45 44L84 42L82 100L6 98L0 87L2 10Z", -3, 1),
    "H": (84, "M0 2L30 0L31 37L54 37L54 1L84 3L82 100L53 98L54 63L31 63L30 99L1 100Z", 3, -2),
    "I": (34, "M0 0L34 3L33 99L2 100Z", 7, 3),
    "J": (70, "M36 1L70 0L69 80L54 100L6 99L0 70L30 68L33 73L37 70Z", -5, 2),
    "K": (86, "M0 1L31 0L31 37L56 0L86 3L57 47L85 100L52 98L32 62L31 99L2 100Z", 4, -1),
    "L": (68, "M0 1L31 0L31 71L68 69L67 100L1 99Z", -4, -1),
    "M": (104, "M0 3L29 0L52 37L75 1L104 4L101 100L74 99L74 50L54 79L49 79L30 51L30 98L1 100Z", 3, 4),
    "N": (86, "M0 2L29 0L56 47L56 3L86 0L84 99L59 100L31 54L31 98L1 100Z", -3, 1),
    "O": (86, "M22 0L64 2L86 24L84 76L62 100L20 98L0 76L2 22ZM43 24L60 50L44 77L27 51Z", -2, -4),
    "P": (76, "M0 0L56 2L76 18L74 52L56 64L32 64L31 100L1 98ZM30 19L53 24L31 46Z", 5, 1),
    "Q": (88, "M22 0L64 2L86 24L85 70L74 82L88 95L77 106L64 93L60 100L20 98L0 76L2 22ZM44 24L61 49L45 74L28 50Z", -4, -2),
    "R": (82, "M0 1L58 0L78 16L77 46L63 56L82 100L50 99L38 64L31 64L31 99L1 100ZM30 18L54 22L31 44Z", 3, 2),
    "S": (76, "M10 0L74 3L72 28L36 28L36 36L66 38L78 52L77 86L64 100L2 98L4 72L42 72L42 63L12 62L0 48L1 12Z", -6, -1),
    "T": (80, "M0 2L80 0L79 30L55 30L54 100L24 98L25 31L1 30Z", 4, -3),
    "U": (84, "M0 1L31 0L31 70L53 70L53 2L84 0L82 82L66 100L16 99L1 84Z", -3, 2),
    "V": (90, "M0 4L31 0L45 52L59 2L90 6L63 100L29 98Z", -7, 2),
    "W": (116, "M0 2L28 0L36 56L48 18L68 18L80 56L88 1L116 4L100 100L70 98L58 60L46 98L16 100Z", 2, -2),
    "X": (88, "M0 1L32 0L44 28L56 2L88 4L62 50L88 98L56 100L44 72L32 99L0 98L26 50Z", 5, 1),
    "Y": (86, "M0 2L32 0L43 34L55 1L86 4L58 58L57 100L27 98L28 58Z", -5, -2),
    "Z": (78, "M2 0L76 3L75 28L37 71L78 70L77 100L0 98L1 72L40 30L3 30Z", 3, 3),
    "0": (76, "M18 0L58 2L76 20L75 80L56 100L18 98L0 80L1 20ZM38 21L50 50L39 80L27 51Z", -3, 1),
    "1": (50, "M14 0L50 2L48 100L18 98L19 32L2 36L0 12Z", 5, -2),
    "2": (76, "M6 2L58 0L76 16L75 48L43 71L76 70L75 100L0 98L1 72L44 40L44 28L32 28L30 36L2 34Z", -4, 2),
    "3": (74, "M2 0L60 2L74 16L73 40L64 50L74 60L73 86L58 100L0 98L2 72L42 72L42 62L22 62L22 38L42 38L42 28L1 28Z", 4, -1),
    "4": (80, "M36 0L70 2L69 56L80 57L79 80L69 80L68 100L38 99L39 80L0 79L2 56ZM40 26L40 56L18 56Z", -5, 2),
    "5": (76, "M4 0L74 3L72 28L34 29L34 38L60 38L76 52L75 86L60 100L0 98L2 72L42 72L42 63L3 62Z", 3, -2),
    "6": (76, "M10 0L72 2L71 28L34 28L34 38L60 38L76 54L75 86L60 100L14 98L0 84L1 14ZM32 60L51 63L33 79Z", -2, 1),
    "7": (74, "M0 2L74 0L72 26L44 100L12 98L38 30L2 30Z", 6, -1),
    "8": (76, "M12 0L64 2L74 14L73 40L66 50L76 62L75 88L62 100L12 98L0 86L1 60L10 50L2 40L3 12ZM30 15L49 20L31 38ZM30 60L51 65L31 85Z", -4, 2),
    "9": (76, "M16 0L62 2L76 16L75 86L62 100L4 98L5 72L42 72L42 62L16 62L0 46L1 14ZM28 18L50 22L30 44Z", 3, -1),
    ".": (30, "M3 70L29 72L28 100L0 98Z", 8, 0),
    ",": (32, "M4 68L30 70L28 96L12 112L4 108L10 96L2 96Z", 6, 0),
    "!": (36, "M2 0L36 3L26 70L10 68ZM8 78L32 80L30 100L6 99Z", 7, -2),
    "?": (70, "M4 2L56 0L70 14L69 40L46 54L44 68L22 66L24 44L42 34L42 26L30 26L28 34L2 32ZM22 76L46 78L45 100L21 99Z", -5, 1),
    "-": (50, "M0 40L50 38L49 62L1 63Z", -4, 2),
    "/": (60, "M38 0L60 2L22 100L0 98Z", 2, 0),
    ":": (30, "M3 20L29 22L28 46L0 44ZM2 68L28 70L27 96L1 94Z", -6, 0),
    "@": (100, "M28 0L74 2L100 26L99 72L84 82L58 80L56 72L48 80L34 78L26 64L28 40L40 28L56 28L62 34L64 30L78 30L76 66L86 66L86 32L70 14L32 14L14 32L14 70L32 88L82 88L82 100L26 99L0 76L1 24ZM42 44L60 42L58 64L42 64Z", 3, 0),
    "·": (30, "M4 38L28 40L26 62L2 60Z", 0, 0),
    "#": (84, "M18 0L40 2L38 22L50 22L52 0L74 2L72 22L84 23L82 44L70 44L68 58L80 58L79 80L66 80L64 100L42 98L44 80L32 80L30 100L8 98L10 80L0 79L2 58L14 58L16 44L4 44L5 22L18 22ZM37 44L49 44L47 58L35 58Z", -4, 1),
    "&": (90, "M14 0L54 2L66 14L65 36L54 48L64 58L72 46L90 50L76 74L90 100L60 98L54 90L44 100L10 98L0 84L1 62L14 50L6 38L7 12ZM28 15L46 18L30 36ZM24 63L44 66L30 85Z", 4, -1),
    "'": (26, "M4 0L26 2L20 34L6 32Z", -6, 0),
}
SPASI = 34
JARAK = 6  # celah antarhuruf, satuan huruf

NAMA_KHUSUS = {".": "titik", ",": "koma", "!": "seru", "?": "tanya", "-": "strip", "/": "garis",
               ":": "titik2", "@": "at", "·": "tengah", "#": "pagar", "&": "dan", "'": "petik"}

# Warna isian (PRD 6.4). Kardus diambil dengan pipet dari maskot-kotak.webp
# (median bidang kardus di x 180-320, y 80-120): rgb(204, 155, 117).
WARNA = {"kertas": "#f4f1ea", "flanel": "#31458c", "kardus": "#cc9b75", "bunga": "#31458c"}


def id_simbol(kunci):
    return "g-" + NAMA_KHUSUS.get(kunci, kunci)


def subjalur(d):
    """Pecah path menjadi daftar poligon [(x, y), ...]."""
    hasil = []
    for bagian in re.split(r"Z", d.strip()):
        angka = [float(a) for a in re.findall(r"-?\d+(?:\.\d+)?", bagian)]
        if len(angka) >= 6:
            hasil.append(list(zip(angka[0::2], angka[1::2])))
    return hasil


def kunci_huruf(teks):
    """Ubah teks menjadi daftar kunci huruf. Huruf E bergantian E, E2, E3."""
    hasil, ke_e = [], 0
    for ch in teks.upper():
        if ch == " ":
            hasil.append(" ")
        elif ch == "E":
            hasil.append(["E", "E2", "E3"][ke_e % 3])
            ke_e += 1
        elif ch in HURUF:
            hasil.append(ch)
    return hasil


# ---------- Sprite SVG ----------

def pola_kertas(acak):
    serat = []
    for _ in range(26):
        x, y = acak.uniform(0, 60), acak.uniform(0, 60)
        p, s = acak.uniform(4, 11), acak.uniform(-.5, .5)
        serat.append(f"M{x:.1f} {y:.1f}l{p:.1f} {p * s:.1f}")
    return (f'<pattern id="vbk-p-kertas" width="60" height="60" patternUnits="userSpaceOnUse">'
            f'<rect width="60" height="60" fill="{WARNA["kertas"]}"/>'
            f'<path d="{"".join(serat)}" stroke="#d9d1bf" stroke-width=".7" stroke-linecap="round" opacity=".7"/>'
            f'</pattern>')


def pola_flanel(acak):
    bintik = "".join(f'<circle cx="{acak.uniform(0, 40):.1f}" cy="{acak.uniform(0, 40):.1f}" r="{acak.uniform(.4, 1.1):.1f}"/>'
                     for _ in range(14))
    return (f'<pattern id="vbk-p-flanel" width="40" height="40" patternUnits="userSpaceOnUse">'
            f'<rect width="40" height="40" fill="{WARNA["flanel"]}"/>'
            f'<g fill="#26387a" opacity=".8">{bintik}</g>'
            f'<path d="M0 30H40" stroke="#f4f7fb" stroke-width="1.6" stroke-dasharray="4 3" opacity=".85"/>'
            f'</pattern>')


def pola_kardus():
    return (f'<pattern id="vbk-p-kardus" width="12" height="80" patternUnits="userSpaceOnUse">'
            f'<rect width="12" height="80" fill="{WARNA["kardus"]}"/>'
            f'<path d="M3 0V80" stroke="#b9875f" stroke-width="2" opacity=".55"/>'
            f'<path d="M9 0V80" stroke="#dcae89" stroke-width="1" opacity=".6"/>'
            f'</pattern>')


def bunga_svg(cx, cy, r, kelopak, putar):
    isi = "".join(f'<ellipse cx="{cx}" cy="{cy - r * .55:.2f}" rx="{r * .24:.2f}" ry="{r * .55:.2f}" '
                  f'transform="rotate({putar + 360 / kelopak * k:.1f} {cx} {cy})"/>' for k in range(kelopak))
    return isi + f'<circle cx="{cx}" cy="{cy}" r="{r * .2:.2f}" fill="{WARNA["bunga"]}"/>'


def pola_bunga():
    # Sama dengan motif vbp-p-bunga di situs-pro/aset/vbpro/hero.js.
    return (f'<pattern id="vbk-p-bunga" width="58" height="58" patternUnits="userSpaceOnUse">'
            f'<rect width="58" height="58" fill="{WARNA["bunga"]}"/>'
            f'<g fill="#f4f7fb" fill-opacity=".88">{bunga_svg(16, 17, 13, 8, 0)}{bunga_svg(44, 43, 8, 6, 20)}'
            f'<circle cx="42" cy="11" r="1.4"/><circle cx="9" cy="45" r="1.7"/><circle cx="29" cy="34" r="1"/>'
            f'<path d="M52 24l3 2-2 2z" fill-opacity=".6"/></g>'
            f'</pattern>')


def tulis_svg():
    acak = random.Random(20261010)
    bagian = ['<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" '
              'style="position:absolute;width:0;height:0;overflow:hidden">',
              "<!-- Huruf gunting VenbeeMail Pro. Dibuat oleh situs-pro-kong/alat/huruf_gunting.py. "
              f"data-spasi={SPASI} data-jarak={JARAK} -->",
              f'<defs data-spasi="{SPASI}" data-jarak="{JARAK}">',
              pola_kertas(acak), pola_flanel(acak), pola_kardus(), pola_bunga(), "</defs>"]
    for kunci, (w, d, miring, naik) in HURUF.items():
        bagian.append(f'<symbol id="{id_simbol(kunci)}" viewBox="0 0 {w} 100" overflow="visible" '
                      f'data-w="{w}" data-miring="{miring}" data-naik="{naik}">'
                      f'<path d="{d}" fill-rule="evenodd"/></symbol>')
    bagian.append("</svg>\n")
    KELUAR.write_text("\n".join(bagian))
    return KELUAR.stat().st_size


# ---------- Gambar dengan Pillow (untuk og.jpg dan lembar contoh) ----------

def _isian_pillow(nama, w, h, skala):
    """Gambar tekstur isian dengan Pillow, kira-kira sama dengan pola SVG."""
    from PIL import Image, ImageDraw
    acak = random.Random(7)
    if nama == "bunga":
        img = Image.new("RGB", (w, h), WARNA["bunga"])
        dr = ImageDraw.Draw(img)
        sel = int(58 * skala)
        import math
        for oy in range(0, h + sel, sel):
            for ox in range(0, w + sel, sel):
                for (cx, cy, r, k, p) in [(16, 17, 13, 8, 0), (44, 43, 8, 6, 20)]:
                    for i in range(k):
                        a = math.radians(p + 360 / k * i)
                        px = ox + (cx + math.sin(a) * r * .55) * skala
                        py = oy + (cy - math.cos(a) * r * .55) * skala
                        rr = r * .3 * skala
                        dr.ellipse([px - rr, py - rr, px + rr, py + rr], fill="#e8edf6")
                    rr = r * .2 * skala
                    dr.ellipse([ox + cx * skala - rr, oy + cy * skala - rr, ox + cx * skala + rr, oy + cy * skala + rr], fill=WARNA["bunga"])
        return img
    img = Image.new("RGB", (w, h), WARNA.get(nama, nama))
    dr = ImageDraw.Draw(img)
    if nama == "kertas":
        for _ in range(int(w * h / (900 * skala * skala)) + 1):
            x, y = acak.uniform(0, w), acak.uniform(0, h)
            p = acak.uniform(4, 11) * skala
            dr.line([x, y, x + p, y + p * acak.uniform(-.5, .5)], fill="#e2dccd", width=max(1, int(skala * .7)))
    return img


def gambar_teks(teks, tinggi, isian="kertas", bayangan="#e7663c", geser=0.06, skala_super=3):
    """Kembalikan PIL RGBA berisi teks huruf gunting setinggi `tinggi` piksel."""
    from PIL import Image, ImageChops, ImageDraw
    import math
    kunci = kunci_huruf(teks)
    s = tinggi / 100 * skala_super
    lebar_satuan = sum(SPASI if k == " " else HURUF[k][0] for k in kunci) + JARAK * max(len(kunci) - 1, 0)
    pad = 30
    W, H = int((lebar_satuan + pad * 2) * s), int((100 + pad * 2) * s)
    topeng = Image.new("L", (W, H), 0)
    x = pad
    for k in kunci:
        if k == " ":
            x += SPASI + JARAK
            continue
        w, d, miring, naik = HURUF[k]
        lapis = Image.new("1", (W, H), 0)
        cx, cy = x + w / 2, pad + 50
        a = math.radians(miring)
        for poli in subjalur(d):
            sub = Image.new("1", (W, H), 0)
            titik = []
            for (px, py) in poli:
                px, py = px - w / 2, py - 50
                rx = px * math.cos(a) - py * math.sin(a)
                ry = px * math.sin(a) + py * math.cos(a)
                titik.append(((cx + rx) * s, (cy + ry + naik) * s))
            ImageDraw.Draw(sub).polygon(titik, fill=1)
            lapis = ImageChops.logical_xor(lapis, sub)
        topeng = ImageChops.lighter(topeng, lapis.convert("L"))
        x += w + JARAK
    hasil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if bayangan:
        g = int(geser * 100 * s)
        bay = Image.new("RGBA", (W, H), bayangan)
        tb = Image.new("L", (W, H), 0)
        tb.paste(topeng, (g, g))
        hasil.paste(bay, (0, 0), tb)
    muka = _isian_pillow(isian, W, H, s).convert("RGBA")
    hasil.paste(muka, (0, 0), topeng)
    kotak = hasil.getbbox()
    hasil = hasil.crop(kotak)
    return hasil.resize((max(1, hasil.width // skala_super), max(1, hasil.height // skala_super)), Image.LANCZOS)


def lembar_contoh(folder):
    from PIL import Image
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    baris = [("ABCDEFGHIJKLM", "kertas"), ("NOPQRSTUVWXYZ", "bunga"), ("0123456789", "kardus"),
             (".,!?-/:@·#&'", "flanel"), ("VENBEEMAIL PRO", "bunga"), ("KOTAK MASUK UNTUK KODEMU", "kertas")]
    gambar = [gambar_teks(t, 90, i) for t, i in baris]
    W = max(g.width for g in gambar) + 60
    H = sum(g.height + 30 for g in gambar) + 30
    kanvas = Image.new("RGB", (W, H), "#01232d")
    y = 30
    for g in gambar:
        kanvas.paste(g, (30, y), g)
        y += g.height + 30
    kanvas.save(folder / "contoh-gunting.png")
    return folder / "contoh-gunting.png"


if __name__ == "__main__":
    print(f"gunting.svg: {tulis_svg()} byte, {len(HURUF)} simbol")
    if "--contoh" in sys.argv:
        print(lembar_contoh(sys.argv[sys.argv.index("--contoh") + 1]))
