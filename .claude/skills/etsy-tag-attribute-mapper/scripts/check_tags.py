#!/usr/bin/env python3
"""Periksa daftar tag listing terhadap batas yang berlaku.

Pakai:
  python3 check_tags.py "tag satu" "tag dua" ...
  python3 check_tags.py --file tags.txt            (satu tag per baris)
  python3 check_tags.py --file tags.txt --title "Judul listing" --max-tags 13 --max-chars 20

Batas default (13 tag, 20 karakter, huruf-angka-spasi, tanda ' dan - hanya di dalam kata)
berasal dari catatan fakta Etsy tanggal 2026-11-12. Periksa catatan terbaru sebelum mengandalkannya.
Hanya pustaka standar.
"""
import argparse
import re
import sys
from pathlib import Path


def check(tags, max_tags=13, max_chars=20, title=None):
    problems, notes, rows = [], [], []
    cleaned = [t.strip() for t in tags if t.strip()]
    if len(cleaned) > max_tags:
        problems.append(f"jumlah tag {len(cleaned)} melebihi batas {max_tags}")
    elif len(cleaned) < max_tags:
        notes.append(f"baru {len(cleaned)} dari {max_tags} tag terpakai")
    seen = {}
    for tag in cleaned:
        issues = []
        if len(tag) > max_chars:
            issues.append(f"{len(tag)} karakter (batas {max_chars})")
        if not re.match(r"^[^\W_]", tag, re.UNICODE):
            issues.append("harus diawali huruf atau angka")
        if re.search(r"[^\w\s'\-]", tag, re.UNICODE) or "_" in tag:
            issues.append("hanya huruf, angka, spasi, tanda ' dan -")
        if "  " in tag:
            issues.append("spasi ganda")
        key = tag.lower()
        if key in seen:
            issues.append("ganda")
        seen[key] = True
        rows.append((tag, len(tag), issues))
        if issues:
            problems.append(f"'{tag}': " + "; ".join(issues))
    singles = [t for t in cleaned if " " not in t]
    if len(singles) > len(cleaned) / 2 and cleaned:
        notes.append(f"{len(singles)} tag hanya satu kata; frasa beberapa kata biasanya lebih jelas niatnya")
    if title:
        low = title.lower()
        covered = [t for t in cleaned if t.lower() in low]
        notes.append(f"{len(covered)} tag muncul utuh di judul: {', '.join(covered) or '-'}")
    return rows, problems, notes


def main(argv=None):
    parser = argparse.ArgumentParser(description="Periksa tag listing.")
    parser.add_argument("tags", nargs="*")
    parser.add_argument("--file")
    parser.add_argument("--title")
    parser.add_argument("--max-tags", type=int, default=13)
    parser.add_argument("--max-chars", type=int, default=20)
    args = parser.parse_args(argv)
    tags = list(args.tags)
    if args.file:
        try:
            tags += Path(args.file).read_text(encoding="utf-8").splitlines()
        except OSError as exc:
            print(f"Berkas tag tidak bisa dibaca: {exc}")
            return 1
    if not tags:
        parser.print_usage()
        return 1
    rows, problems, notes = check(tags, args.max_tags, args.max_chars, args.title)
    for tag, length, issues in rows:
        mark = "X " if issues else "ok"
        print(f"{mark} {length:>2}  {tag}" + (f"   <- {'; '.join(issues)}" if issues else ""))
    for n in notes:
        print("CATATAN:", n)
    if problems:
        print(f"TIDAK LULUS: {len(problems)} masalah")
        for p in problems:
            print(" -", p)
        return 1
    print(f"LULUS: {len(rows)} tag sesuai batas ({args.max_tags} tag, {args.max_chars} karakter)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
