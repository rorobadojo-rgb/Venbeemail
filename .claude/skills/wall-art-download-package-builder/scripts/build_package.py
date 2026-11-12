#!/usr/bin/env python3
"""Susun dan periksa paket unduhan untuk satu listing digital.

Masukan: folder berisi file cetak (dan panduan cetak bila ada).
Keluaran: folder paket berisi file akhir (digabung ke ZIP bila jumlahnya melebihi batas),
          manifest.json, dan hasil pemeriksaan.

Pakai:
  python3 build_package.py --src ekspor/ --out paket/ [--max-files 5] [--max-mb 20]
                           [--expect 2x3,3x4,4x5,11x14,iso] [--no-zip]

Batas default (5 file, 20 MB per file) berasal dari catatan fakta Etsy; periksa catatan itu sebelum memakai.
Pemeriksaan gambar butuh Pillow; tanpa Pillow, ukuran pixel tidak dibaca dan ditandai 'warn'.
"""
import argparse
import hashlib
import json
import re
import shutil
import sys
import zipfile
from datetime import date
from pathlib import Path

NAME_RULE = re.compile(r"^[a-z0-9]+(?:[-_][a-z0-9]+)*\.(jpg|jpeg|png|pdf|zip)$")
IMAGE_EXT = {".jpg", ".jpeg", ".png"}
SKIP_SUFFIX = ("_laporan-ekspor.json", "manifest.json")


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_image(path):
    try:
        from PIL import Image
    except ImportError:
        return None
    Image.MAX_IMAGE_PIXELS = 400_000_000
    try:
        with Image.open(path) as img:
            dpi = img.info.get("dpi")
            return {"pixel": list(img.size), "mode": img.mode,
                    "dpi": [round(float(dpi[0])), round(float(dpi[1]))] if dpi else None,
                    "icc_profile": bool(img.info.get("icc_profile"))}
    except OSError as exc:
        return {"error": str(exc)}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Susun dan periksa paket unduhan.")
    parser.add_argument("--src", required=True, help="folder file hasil ekspor")
    parser.add_argument("--out", required=True, help="folder paket akhir")
    parser.add_argument("--max-files", type=int, default=5)
    parser.add_argument("--max-mb", type=float, default=20)
    parser.add_argument("--expect", default="", help="token rasio yang wajib ada di nama file, dipisah koma")
    parser.add_argument("--no-zip", action="store_true", help="jangan menggabung ke ZIP; gagal bila file terlalu banyak")
    args = parser.parse_args(argv)

    src, out = Path(args.src), Path(args.out)
    if not src.is_dir():
        print(f"Folder sumber tidak ada: {src}")
        return 1
    files = sorted(p for p in src.iterdir() if p.is_file() and not p.name.endswith(SKIP_SUFFIX))
    checks = []

    def add(check, result, notes=""):
        checks.append({"check": check, "result": result, "notes": notes})

    if not files:
        print("Tidak ada file di folder sumber.")
        return 1
    max_bytes = int(args.max_mb * 1024 * 1024)

    bad_names = [p.name for p in files if not NAME_RULE.match(p.name)]
    add("nama file (huruf kecil, angka, - dan _, tanpa spasi; jpg/png/pdf/zip)",
        "fail" if bad_names else "pass", ", ".join(bad_names))

    oversize = [f"{p.name} ({p.stat().st_size / 1048576:.1f} MB)" for p in files if p.stat().st_size > max_bytes]
    add(f"ukuran tiap file <= {args.max_mb} MB", "fail" if oversize else "pass", ", ".join(oversize))

    near = [p.name for p in files if max_bytes * 0.95 < p.stat().st_size <= max_bytes]
    if near:
        add("file mendekati batas ukuran", "warn", ", ".join(near))

    expected = [t.strip() for t in args.expect.split(",") if t.strip()]
    missing = [t for t in expected if not any(f"_{t}_" in p.name or f"_{t}." in p.name for p in files)]
    if expected:
        add("semua rasio yang dijanjikan ada", "fail" if missing else "pass", ", ".join(missing))

    entries, unreadable, no_pillow = [], [], False
    for p in files:
        entry = {"file": p.name, "bytes": p.stat().st_size, "mb": round(p.stat().st_size / 1048576, 2), "sha256": sha256(p)}
        if p.suffix.lower() in IMAGE_EXT:
            info = inspect_image(p)
            if info is None:
                no_pillow = True
            elif "error" in info:
                unreadable.append(p.name)
            else:
                entry.update(info)
        entries.append(entry)
    add("tiap gambar bisa dibuka ulang", "fail" if unreadable else ("warn" if no_pillow else "pass"),
        ", ".join(unreadable) or ("Pillow tidak terpasang; pixel tidak dibaca" if no_pillow else ""))
    not_rgb = [e["file"] for e in entries if e.get("mode") not in (None, "RGB")]
    add("gambar bermode RGB", "warn" if not_rgb else "pass", ", ".join(not_rgb))
    no_dpi = [e["file"] for e in entries if "pixel" in e and not e.get("dpi")]
    add("gambar punya tag DPI", "warn" if no_dpi else "pass", ", ".join(no_dpi))

    # Kelompokkan agar jumlah file akhir <= batas: gabungkan dua kelompok terkecil yang masih muat.
    groups = [[p] for p in files]
    blocked = any(c["result"] == "fail" for c in checks)
    if len(groups) > args.max_files and args.no_zip:
        add(f"jumlah file <= {args.max_files}", "fail", f"{len(groups)} file dan --no-zip dipakai")
    else:
        while len(groups) > args.max_files:
            groups.sort(key=lambda g: sum(p.stat().st_size for p in g))
            merged = None
            # Putaran pertama: jangan menyentuh PDF (panduan cetak) agar tetap mudah ditemukan pembeli.
            for keep_pdf_apart in (True, False):
                for i in range(len(groups)):
                    for j in range(i + 1, len(groups)):
                        pair = groups[i] + groups[j]
                        if keep_pdf_apart and any(p.suffix.lower() == ".pdf" for p in pair):
                            continue
                        if sum(p.stat().st_size for p in pair) <= max_bytes * 0.98:
                            merged = (i, j)
                            break
                    if merged:
                        break
                if merged:
                    break
            if not merged:
                add(f"jumlah file <= {args.max_files}", "fail",
                    "tidak ada dua file yang muat digabung dalam satu ZIP di bawah batas ukuran")
                break
            i, j = merged
            groups[i] = groups[i] + groups[j]
            del groups[j]
        else:
            add(f"jumlah file akhir <= {args.max_files}", "pass", f"{len(groups)} file")

    blocked = any(c["result"] == "fail" for c in checks)
    deliverables = []
    if not blocked:
        out.mkdir(parents=True, exist_ok=True)
        zip_no = 0
        for group in groups:
            if len(group) == 1:
                target = out / group[0].name
                shutil.copy2(group[0], target)
                deliverables.append({"file": target.name, "contains": [group[0].name],
                                     "mb": round(target.stat().st_size / 1048576, 2)})
            else:
                zip_no += 1
                base = files[0].name.split("_")[0]
                target = out / f"{base}_bundle-{zip_no}.zip"
                with zipfile.ZipFile(target, "w", zipfile.ZIP_STORED) as archive:
                    for p in group:
                        archive.write(p, p.name)
                size = target.stat().st_size
                deliverables.append({"file": target.name, "contains": [p.name for p in group],
                                     "mb": round(size / 1048576, 2)})
                if size > max_bytes:
                    add("ukuran ZIP <= batas", "fail", f"{target.name} {size / 1048576:.1f} MB")
        blocked = any(c["result"] == "fail" for c in checks)

    verdict = "fail" if blocked else ("pass_with_notes" if any(c["result"] == "warn" for c in checks) else "pass")
    manifest = {"schema": "studio-nangka/package-manifest@1", "created": date.today().isoformat(),
                "limits": {"max_files": args.max_files, "max_mb": args.max_mb},
                "source_files": entries, "deliverables": deliverables, "checks": checks, "verdict": verdict}
    manifest_dir = out if not blocked else src
    manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = manifest_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    for c in checks:
        print(f"{c['result'].upper():5} {c['check']}" + (f"  -> {c['notes']}" if c["notes"] else ""))
    if deliverables:
        print("\nFile akhir untuk diunggah ke listing:")
        for d in deliverables:
            inside = "" if d["contains"] == [d["file"]] else "  berisi: " + ", ".join(d["contains"])
            print(f"  {d['file']}  {d['mb']} MB{inside}")
    print(f"\nHasil: {verdict.upper()}   manifest: {manifest_path}")
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main())
