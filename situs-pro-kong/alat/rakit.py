"""Rakit situs-pro-kong/index.html dari sumber.html + isian.json (PRD 13.1).

    python3 situs-pro-kong/alat/rakit.py               # untuk dipasang: gagal kalau masih ada tempat isian
    python3 situs-pro-kong/alat/rakit.py --pratinjau   # pratinjau lokal: tempat isian ditandai kuning, tidak gagal

Elemen ber-data-isian="..." dihapus utuh kalau isiannya kosong, atau diisi
(teks di-escape) kalau ada. Kunci yang dikenal:

  cerita, tahun, kota, kota-atau-tahun, kota-dan-tahun, fitur-claude,
  sosial (kelompok), sosial-x, sosial-threads, sosial-github, sosial-linkedin

Jangan mengedit index.html langsung; edit sumber.html lalu rakit ulang.
"""
from pathlib import Path
import html as h
import json
import re
import sys

AKAR = Path(__file__).resolve().parents[1]
SUMBER = AKAR / "sumber.html"
ISIAN = AKAR / "isian.json"
HASIL = AKAR / "index.html"

POLA_SOSIAL = {
    "x": ("X", [r"^https://x\.com/([A-Za-z0-9_]{1,15})/?$"]),
    "threads": ("Threads", [r"^https://www\.threads\.(?:com|net)/@([A-Za-z0-9._]{1,30})/?$"]),
    "github": ("GitHub", [r"^https://github\.com/([A-Za-z0-9-]{1,39})/?$"]),
    "linkedin": ("LinkedIn", [r"^https://www\.linkedin\.com/(?:in|company)/([A-Za-z0-9-_%]{2,100})/?$"]),
}
TERLARANG = ["[ISI", "[SALIN DARI HALAMAN LAMA", "{{"]


class GagalRakit(Exception):
    pass


def cari_elemen(teks, kunci, mulai=0):
    """Kembalikan (awal, akhir) elemen pertama yang punya data-isian="kunci"."""
    m = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\bdata-isian="' + re.escape(kunci) + r'"[^>]*>').search(teks, mulai)
    if not m:
        return None
    tag = m.group(1).lower()
    pola = re.compile(r"<(/?)" + tag + r"\b[^>]*?(/?)>", re.I)
    dalam, pos = 1, m.end()
    while dalam:
        n = pola.search(teks, pos)
        if not n:
            raise GagalRakit(f"elemen data-isian=\"{kunci}\" tidak ditutup")
        if n.group(1):
            dalam -= 1
        elif not n.group(2):
            dalam += 1
        pos = n.end()
    return m.start(), pos


def hapus_semua(teks, kunci):
    while True:
        letak = cari_elemen(teks, kunci)
        if not letak:
            return teks
        a, b = letak
        # buang juga spasi dan baris kosong sebelumnya
        while a > 0 and teks[a - 1] in " \t":
            a -= 1
        if a > 0 and teks[a - 1] == "\n" and b < len(teks) and teks[b] == "\n":
            b += 1
        teks = teks[:a] + teks[b:]


def lepas_atribut(teks, kunci):
    return teks.replace(f' data-isian="{kunci}"', "")


def isi(teks, penanda, nilai):
    return teks.replace(penanda, h.escape(nilai, quote=True))


def rakit(data, pratinjau=False):
    teks = SUMBER.read_text(encoding="utf-8")

    tahun = (data.get("tahun") or "").strip()
    kota = (data.get("kota") or "").strip()
    cerita = data.get("cerita") or {}
    fitur = data.get("fitur_claude") or {}
    sosial = data.get("sosial") or {}

    if tahun and not re.fullmatch(r"(19|20)\d\d", tahun):
        raise GagalRakit(f"tahun harus empat angka, bukan {tahun!r}")
    cerita_id, cerita_en = (cerita.get("id") or "").strip(), (cerita.get("en") or "").strip()
    if bool(cerita_id) != bool(cerita_en):
        raise GagalRakit("cerita harus diisi dalam dua bahasa (id dan en), atau dikosongkan keduanya")
    status = (fitur.get("status") or "").strip()
    if status not in ("", "tidak_ada", "sedang_dibangun"):
        raise GagalRakit("fitur_claude.status harus \"\", \"tidak_ada\", atau \"sedang_dibangun\"")
    if status == "sedang_dibangun" and not ((fitur.get("id") or "").strip() and (fitur.get("en") or "").strip()):
        raise GagalRakit("fitur_claude sedang_dibangun butuh teks id dan en")

    if pratinjau:
        # Tidak ada yang dihapus; tempat isian ditandai kuning.
        teks = re.sub(r'(<[a-zA-Z][^>]*\bdata-isian="[^"]+"[^>]*?)\sclass="([^"]*)"', r'\1 class="\2 vbk-isian-pratinjau"', teks)
        teks = re.sub(r'(<[a-zA-Z][^>]*\bdata-isian="[^"]+")(?![^>]*\bclass=)', r'\1 class="vbk-isian-pratinjau"', teks)
        return teks

    # cerita
    if cerita_id:
        teks = isi(isi(teks, "[ISI CERITA ID]", cerita_id), "[ISI CERITA EN]", cerita_en)
        teks = lepas_atribut(teks, "cerita")
    else:
        teks = hapus_semua(teks, "cerita")
    # tahun, kota, dan baris tanda tangan kecil
    if not (tahun or kota):
        teks = hapus_semua(teks, "kota-atau-tahun")
    else:
        teks = lepas_atribut(teks, "kota-atau-tahun")
    if tahun and kota:
        teks = lepas_atribut(teks, "kota-dan-tahun")
    else:
        teks = hapus_semua(teks, "kota-dan-tahun")
    if tahun:
        teks = isi(teks, "[ISI TAHUN]", tahun)
        teks = lepas_atribut(teks, "tahun")
    else:
        teks = hapus_semua(teks, "tahun")
    if kota:
        teks = isi(teks, "[ISI KOTA]", kota)
        teks = lepas_atribut(teks, "kota")
    else:
        teks = hapus_semua(teks, "kota")
    # fitur Claude
    if status == "sedang_dibangun":
        teks = isi(isi(teks, "[ISI FITUR CLAUDE ID]", fitur["id"].strip()), "[ISI FITUR CLAUDE EN]", fitur["en"].strip())
        teks = lepas_atribut(teks, "fitur-claude")
    else:
        teks = hapus_semua(teks, "fitur-claude")
    # sosial
    ada = False
    for kunci, (nama, pola) in POLA_SOSIAL.items():
        url = (sosial.get(kunci) or "").strip()
        if not url:
            teks = hapus_semua(teks, f"sosial-{kunci}")
            continue
        akun = None
        for p in pola:
            m = re.match(p, url)
            if m:
                akun = m.group(1)
        if not akun:
            raise GagalRakit(f"alamat {nama} tidak cocok dengan pola yang diizinkan: {url}")
        ada = True
        teks = isi(teks, f"[ISI SOSIAL {kunci.upper()}]", url)
        teks = isi(teks, f"[ISI AKUN {kunci.upper()}]", akun)
        teks = lepas_atribut(teks, f"sosial-{kunci}")
        if kunci == "x":
            teks = teks.replace("<!-- twitter:creator ditulis rakit.py kalau akun X sudah diisi LO -->",
                                f'<meta name="twitter:creator" content="@{h.escape(akun)}">')
    teks = lepas_atribut(teks, "sosial") if ada else hapus_semua(teks, "sosial")

    sisa = [t for t in TERLARANG if t in teks]
    if sisa:
        baris = [i + 1 for i, b in enumerate(teks.splitlines()) if any(t in b for t in sisa)]
        raise GagalRakit(f"masih ada tempat isian {sisa} di baris {baris[:10]}")
    if "data-isian=" in teks:
        raise GagalRakit("masih ada atribut data-isian yang tidak dikenal")
    return teks


def main():
    pratinjau = "--pratinjau" in sys.argv
    data = json.loads(ISIAN.read_text(encoding="utf-8"))
    try:
        teks = rakit(data, pratinjau)
    except GagalRakit as e:
        print(f"GAGAL: {e}", file=sys.stderr)
        sys.exit(1)
    keluar = AKAR / "pratinjau.html" if pratinjau else HASIL
    keluar.write_text(teks, encoding="utf-8")
    print(f"{keluar.relative_to(AKAR.parent)}: {len(teks.encode())} byte{' (pratinjau, jangan dipasang)' if pratinjau else ''}")


if __name__ == "__main__":
    main()
