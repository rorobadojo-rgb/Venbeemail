#!/usr/bin/env python3
"""Ubah teks panduan sederhana menjadi PDF (tanpa pustaka tambahan).

Pakai:
  python3 make_guide_pdf.py panduan.txt panduan.pdf [--title "Print Guide"]

Aturan teks masukan:
  "# Judul"     -> judul besar
  "## Subjudul" -> subjudul tebal
  "- butir"     -> butir
  baris kosong  -> jarak
  lainnya       -> paragraf

Kertas Letter, huruf Helvetica standar PDF. Hanya huruf Latin dasar (Latin-1);
huruf lain diganti padanan terdekat atau tanda tanya. Tidak ada gambar.
"""
import sys
import textwrap
from pathlib import Path

PAGE_W, PAGE_H = 612, 792  # Letter, dalam point
MARGIN = 64
REPLACE = {"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-",
           "…": "...", "×": "x", "•": "-", " ": " "}
STYLES = {  # nama: (font, ukuran, jarak baris, jarak sebelum)
    "h1": ("F2", 20, 26, 0),
    "h2": ("F2", 13, 18, 10),
    "body": ("F1", 11, 15.5, 0),
    "bullet": ("F1", 11, 15.5, 0),
}


def clean(text):
    for src, dst in REPLACE.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", "replace").decode("latin-1")


def escape(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def layout(text):
    """Kembalikan daftar halaman; tiap halaman daftar (font, ukuran, x, y, teks)."""
    usable = PAGE_W - 2 * MARGIN
    pages, current = [], []
    y = PAGE_H - MARGIN

    def emit(style, line, indent=0):
        nonlocal y, current
        font, size, leading, _ = STYLES[style]
        if y - leading < MARGIN:
            pages.append(current)
            current = []
            y = PAGE_H - MARGIN
        y -= leading
        current.append((font, size, MARGIN + indent, y, line))

    for raw in clean(text).splitlines():
        line = raw.rstrip()
        if not line.strip():
            y -= 7
            continue
        if line.startswith("## "):
            style, content, indent, prefix = "h2", line[3:], 0, ""
        elif line.startswith("# "):
            style, content, indent, prefix = "h1", line[2:], 0, ""
        elif line.lstrip().startswith("- "):
            style, content, indent, prefix = "bullet", line.lstrip()[2:], 14, "- "
        else:
            style, content, indent, prefix = "body", line, 0, ""
        font, size, _, before = STYLES[style]
        y -= before
        factor = 0.60 if font == "F2" else 0.52  # perkiraan lebar rata-rata huruf Helvetica
        width = max(20, int((usable - indent) / (size * factor)))
        wrapped = textwrap.wrap(content, width=width) or [""]
        for i, part in enumerate(wrapped):
            if style == "bullet":
                emit(style, (prefix if i == 0 else "  ") + part, indent=0 if i == 0 else 0)
            else:
                emit(style, part, indent)
    if current:
        pages.append(current)
    return pages or [[]]


def build_pdf(text, title="Print Guide"):
    pages = layout(text)
    objects = []  # daftar bytes isi objek, nomor objek = indeks + 1

    def add(body):
        objects.append(body if isinstance(body, bytes) else body.encode("latin-1"))
        return len(objects)

    add("")  # 1 katalog (diisi nanti)
    add("")  # 2 pohon halaman (diisi nanti)
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    info = add(f"<< /Title ({escape(clean(title))}) /Producer (Studio Wall Art by Nangka) >>")
    page_ids = []
    for page in pages:
        parts = ["BT"]
        for font, size, x, y, line in page:
            parts.append(f"/{font} {size} Tf 1 0 0 1 {x} {y:.1f} Tm ({escape(line)}) Tj")
        parts.append("ET")
        stream = "\n".join(parts).encode("latin-1")
        content_id = add(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream")
        page_id = add(f"<< /Type /Page\n/Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                      f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_id} 0 R >>")
        page_ids.append(page_id)
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[0] = b"<< /Type /Catalog /Pages 2 0 R >>"
    objects[1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
    xref_at = len(out)
    out += f"xref\n0 {len(objects) + 1}\n".encode()
    out += b"0000000000 65535 f \n"
    for offset in offsets:
        out += f"{offset:010d} 00000 n \n".encode()
    out += (f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R /Info {info} 0 R >>\n"
            f"startxref\n{xref_at}\n%%EOF\n").encode()
    return bytes(out), len(page_ids)


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    title = "Print Guide"
    if "--title" in argv:
        title = argv[argv.index("--title") + 1]
        args = [a for a in args if a != title]
    if len(args) != 2:
        print(__doc__)
        return 1
    source, target = Path(args[0]), Path(args[1])
    try:
        text = source.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"Teks panduan tidak bisa dibaca: {exc}")
        return 1
    replaced = sum(1 for ch in text if ch not in REPLACE and ord(ch) > 255)
    data, page_count = build_pdf(text, title)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    print(f"PDF dibuat: {target}  ({page_count} halaman, {len(data) / 1024:.1f} KB)")
    if replaced:
        print(f"PERINGATAN: {replaced} huruf di luar Latin dasar diganti tanda tanya; periksa hasilnya.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
