#!/usr/bin/env python3
"""Periksa paket listing (listing.json) sebelum terbit.

Pakai:
  python3 check_listing.py listing.json [--root <folder dasar path file>] [--plan rencana-cetak.json]
                           [--max-title 140] [--max-tags 13] [--max-tag-chars 20]
                           [--max-files 5] [--max-mb 20] [--min-first-image 635]

Yang diperiksa adalah hal yang bisa dihitung: panjang, jumlah, keberadaan file, ukuran,
kecocokan klaim ukuran dengan rencana cetak, dan kata yang wajib atau berisiko.
Batas default berasal dari catatan fakta Etsy tanggal 2026-11-12; berikan batas terbaru lewat argumen.
Pemeriksaan gambar butuh Pillow; tanpa Pillow hasilnya 'warn'.
"""
import argparse
import json
import re
import sys
from pathlib import Path

RISK_WORDS = {
    "guarantee": "janji jaminan", "guaranteed": "janji jaminan", "best seller": "klaim penjualan",
    "bestseller": "klaim penjualan", "framed": "menyiratkan barang berbingkai", "canvas": "menyiratkan kanvas fisik",
    "free shipping": "menyiratkan pengiriman barang", "hand painted": "klaim buatan tangan",
    "hand-painted": "klaim buatan tangan", "handmade": "klaim buatan tangan", "one of a kind": "klaim keunikan mutlak",
    "100% original": "klaim keunikan mutlak", "museum quality": "klaim mutu",
}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Periksa paket listing sebelum terbit.")
    parser.add_argument("listing")
    parser.add_argument("--root", default=None)
    parser.add_argument("--plan", default=None)
    parser.add_argument("--max-title", type=int, default=140)
    parser.add_argument("--max-tags", type=int, default=13)
    parser.add_argument("--max-tag-chars", type=int, default=20)
    parser.add_argument("--max-files", type=int, default=5)
    parser.add_argument("--max-mb", type=float, default=20)
    parser.add_argument("--min-first-image", type=int, default=635)
    parser.add_argument("--json", dest="json_path")
    args = parser.parse_args(argv)

    try:
        listing = json.loads(Path(args.listing).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"TIDAK BISA DIPERIKSA: {exc}")
        return 1
    root = Path(args.root) if args.root else Path(args.listing).parent
    results = []

    def add(check, result, notes=""):
        results.append({"check": check, "result": result, "notes": notes})

    title = str(listing.get("title", "")).strip()
    description = str(listing.get("description", ""))
    text = f"{title}\n{description}".lower()

    add("judul terisi dan <= batas karakter",
        "pass" if 0 < len(title) <= args.max_title else "fail", f"{len(title)} karakter (batas {args.max_title})")
    add("deskripsi terisi", "pass" if len(description.strip()) >= 200 else "fail",
        f"{len(description.strip())} karakter (minimal kerja studio 200)")

    tags = [str(t).strip() for t in listing.get("tags", []) if str(t).strip()]
    tag_issues = []
    if len(tags) > args.max_tags:
        tag_issues.append(f"{len(tags)} tag (batas {args.max_tags})")
    lowered = [t.lower() for t in tags]
    for t in tags:
        if len(t) > args.max_tag_chars:
            tag_issues.append(f"'{t}' {len(t)} karakter")
        if re.search(r"[^\w\s'\-]", t, re.UNICODE) or "_" in t or not re.match(r"^[^\W_]", t, re.UNICODE):
            tag_issues.append(f"'{t}' karakter tidak diizinkan")
    if len(set(lowered)) != len(lowered):
        tag_issues.append("ada tag ganda")
    add("tag sesuai batas", "fail" if tag_issues or not tags else "pass", "; ".join(tag_issues) or f"{len(tags)} tag")
    if tags and len(tags) < args.max_tags:
        add("semua slot tag terpakai", "warn", f"{len(tags)} dari {args.max_tags}")

    price = listing.get("price_usd")
    add("harga terisi dan lebih dari 0", "pass" if isinstance(price, (int, float)) and price > 0 else "fail", str(price))
    for field in ("category", "sku"):
        add(f"{field} terisi", "pass" if str(listing.get(field, "")).strip() else "warn", "")

    files = listing.get("digital_files") or []
    missing = [f for f in files if not (root / f).is_file()]
    add("file digital ada di disk", "fail" if missing or not files else "pass",
        ", ".join(missing) or f"{len(files)} file")
    add("jumlah file digital <= batas", "pass" if 0 < len(files) <= args.max_files else "fail",
        f"{len(files)} (batas {args.max_files})")
    big = [f"{f} ({(root / f).stat().st_size / 1048576:.1f} MB)" for f in files
           if (root / f).is_file() and (root / f).stat().st_size > args.max_mb * 1048576]
    add("ukuran tiap file digital <= batas", "fail" if big else "pass", ", ".join(big))

    images = listing.get("images") or []
    missing_img = [f for f in images if not (root / f).is_file()]
    add("gambar listing ada di disk", "fail" if missing_img or not images else "pass",
        ", ".join(missing_img) or f"{len(images)} gambar")
    if images and not missing_img:
        try:
            from PIL import Image
            with Image.open(root / images[0]) as img:
                short = min(img.size)
            state = "fail" if short < args.min_first_image else ("warn" if short < 2000 else "pass")
            add("gambar pertama cukup besar", state, f"sisi pendek {short} px (minimum {args.min_first_image}, saran 2000)")
        except ImportError:
            add("gambar pertama cukup besar", "warn", "Pillow tidak terpasang; tidak diukur")
        except OSError as exc:
            add("gambar pertama cukup besar", "fail", f"tidak bisa dibuka: {exc}")
    if len(images) < 5:
        add("jumlah gambar listing", "warn", f"{len(images)} gambar; saran kerja studio minimal 5")

    is_digital = listing.get("listing_type", "digital") == "digital"
    if is_digital:
        add("deskripsi menyebut produk digital", "pass" if re.search(r"digital (download|file|item|product)", text) else "fail", "")
        add("deskripsi menyebut tidak ada barang fisik",
            "pass" if re.search(r"no physical|nothing will be shipped|no (item|print|frame)s? will be (shipped|mailed)|not a physical", text) else "fail", "")
    if listing.get("ai_assisted") is True:
        add("deskripsi menyebut bantuan AI",
            "pass" if re.search(r"\bai\b|artificial intelligence|ai-assisted|ai assisted|ai generat", text) else "fail",
            "wajib menurut catatan fakta Etsy")
    elif listing.get("ai_assisted") is None:
        add("status bantuan AI diisi", "fail", "isi ai_assisted true atau false")

    found = [f"'{w}' ({why})" for w, why in RISK_WORDS.items() if re.search(rf"\b{re.escape(w)}\b", text)]
    tag_found = [f"tag '{t}'" for t in tags if t.lower() in RISK_WORDS]
    add("tanpa kata berisiko atau menyesatkan", "warn" if found or tag_found else "pass", "; ".join(found + tag_found))

    claimed = [str(s).lower() for s in (listing.get("claims") or {}).get("sizes", [])]
    if args.plan:
        try:
            plan = json.loads(Path(args.plan).read_text(encoding="utf-8"))
            ok_sizes = {s["size"].lower() for r in plan["ratios"] for s in r["sizes"] if s["status"] == "ok"}
            bad = [s for s in claimed if s not in ok_sizes]
            add("ukuran yang diklaim memenuhi target PPI", "fail" if bad else "pass",
                ", ".join(bad) or f"{len(claimed)} ukuran cocok dengan rencana cetak")
        except (OSError, json.JSONDecodeError, KeyError) as exc:
            add("ukuran yang diklaim memenuhi target PPI", "fail", f"rencana cetak tidak bisa dibaca: {exc}")
    else:
        add("ukuran yang diklaim memenuhi target PPI", "warn", "rencana cetak tidak diberikan (--plan)")
    claim_files = (listing.get("claims") or {}).get("file_count")
    if claim_files is not None:
        add("jumlah file yang dijanjikan sama dengan yang diunggah", "pass" if claim_files == len(files) else "fail",
            f"dijanjikan {claim_files}, diunggah {len(files)}")

    fails = [r for r in results if r["result"] == "fail"]
    warns = [r for r in results if r["result"] == "warn"]
    for r in results:
        print(f"{r['result'].upper():5} {r['check']}" + (f"  -> {r['notes']}" if r["notes"] else ""))
    verdict = "fail" if fails else ("pass_with_notes" if warns else "pass")
    print(f"\nHasil hitung: {verdict.upper()}  ({len(fails)} gagal, {len(warns)} catatan)")
    if args.json_path:
        Path(args.json_path).write_text(json.dumps({"verdict": verdict, "results": results}, indent=2, ensure_ascii=False), encoding="utf-8")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
