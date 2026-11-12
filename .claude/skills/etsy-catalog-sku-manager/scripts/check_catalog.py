#!/usr/bin/env python3
"""Periksa berkas katalog studio (katalog.csv).

Pakai:
  python3 check_catalog.py katalog.csv [--root <folder studio untuk mengecek path>]

Yang diperiksa: kolom lengkap, SKU unik dan berformat benar, status dan bentuk sah,
versi, id koleksi dan karya, hubungan antar-SKU, kelengkapan baris 'terbit',
dan (dengan --root) keberadaan file untuk baris 'siap' dan 'terbit'.
Hanya pustaka standar.
"""
import argparse
import csv
import re
import sys
from pathlib import Path

COLUMNS = ["sku", "status", "bentuk", "judul_kerja", "collection_id", "artwork_ids", "versi",
           "listing_id_etsy", "tanggal_terbit", "harga_usd", "file_sumber", "paket", "listing_json",
           "terkait_sku", "catatan"]
STATUS = {"ide", "produksi", "siap", "terbit", "jeda", "pensiun"}
BENTUK = {"satuan", "set", "bundel", "custom"}
SKU = re.compile(r"^NGK-[A-Z]{3,5}-(\d{2}|SET\d{1,2}|BDL)(-[A-Z0-9]{1,4})?$")
COLLECTION = re.compile(r"^COL-[a-z0-9]+(?:-[a-z0-9]+)*$")
ARTWORK = re.compile(r"^ART-[a-z0-9]+(?:-[a-z0-9]+)*-\d{2}$")


def split(cell):
    return [part.strip() for part in cell.split(";") if part.strip()]


def check(path, root=None):
    problems = []
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        missing = [c for c in COLUMNS if c not in (reader.fieldnames or [])]
        if missing:
            return 0, [f"kolom hilang: {', '.join(missing)}"]
        rows = list(reader)
    skus = [r["sku"].strip() for r in rows]
    for line, row in enumerate(rows, start=2):
        sku = row["sku"].strip()
        where = f"baris {line} ({sku or 'tanpa SKU'})"
        if not SKU.match(sku):
            problems.append(f"{where}: format SKU salah (contoh benar: NGK-STRP-01, NGK-STRP-SET3)")
        if skus.count(sku) > 1:
            problems.append(f"{where}: SKU ganda")
        status = row["status"].strip()
        if status not in STATUS:
            problems.append(f"{where}: status tidak dikenal '{status}'")
        if row["bentuk"].strip() not in BENTUK:
            problems.append(f"{where}: bentuk tidak dikenal '{row['bentuk'].strip()}'")
        if not re.match(r"^v\d+$", row["versi"].strip()):
            problems.append(f"{where}: versi harus v1, v2, ...")
        if not COLLECTION.match(row["collection_id"].strip()):
            problems.append(f"{where}: collection_id salah format")
        artworks = split(row["artwork_ids"])
        if not artworks or any(not ARTWORK.match(a) for a in artworks):
            problems.append(f"{where}: artwork_ids kosong atau salah format (pisahkan dengan titik koma)")
        bentuk = row["bentuk"].strip()
        if bentuk == "satuan" and len(artworks) > 1:
            problems.append(f"{where}: bentuk satuan tetapi memuat {len(artworks)} karya")
        if bentuk in ("set", "bundel") and len(artworks) < 2:
            problems.append(f"{where}: bentuk {bentuk} harus memuat minimal 2 karya")
        for related in split(row["terkait_sku"]):
            if related not in skus:
                problems.append(f"{where}: terkait_sku tidak ada di katalog: {related}")
            if related == sku:
                problems.append(f"{where}: terkait_sku menunjuk dirinya sendiri")
        if status == "terbit":
            for field in ("listing_id_etsy", "tanggal_terbit", "harga_usd"):
                if not row[field].strip():
                    problems.append(f"{where}: status terbit tetapi {field} kosong")
        if row["tanggal_terbit"].strip() and not re.match(r"^\d{4}-\d{2}-\d{2}$", row["tanggal_terbit"].strip()):
            problems.append(f"{where}: tanggal_terbit harus YYYY-MM-DD")
        if row["harga_usd"].strip():
            try:
                if float(row["harga_usd"]) <= 0:
                    raise ValueError
            except ValueError:
                problems.append(f"{where}: harga_usd harus angka lebih dari 0")
        if root is not None and status in ("siap", "terbit"):
            for field in ("file_sumber", "paket", "listing_json"):
                value = row[field].strip()
                if not value:
                    problems.append(f"{where}: status {status} tetapi {field} kosong")
                elif not (Path(root) / value).exists():
                    problems.append(f"{where}: {field} tidak ditemukan: {value}")
    return len(rows), problems


def main(argv=None):
    parser = argparse.ArgumentParser(description="Periksa katalog studio.")
    parser.add_argument("catalog")
    parser.add_argument("--root")
    args = parser.parse_args(argv)
    try:
        count, problems = check(args.catalog, args.root)
    except OSError as exc:
        print(f"Katalog tidak bisa dibaca: {exc}")
        return 1
    if problems:
        print(f"TIDAK LULUS: {len(problems)} masalah pada {count} baris")
        for p in problems:
            print(" -", p)
        return 1
    print(f"LULUS: {count} baris katalog sah" + ("" if args.root else " (path file tidak dicek; pakai --root)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
