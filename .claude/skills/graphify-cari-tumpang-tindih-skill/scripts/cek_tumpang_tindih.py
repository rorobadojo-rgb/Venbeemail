#!/usr/bin/env python3
"""Cari pasangan skill yang fungsinya mirip atau frasa pemicunya berebut.

Pakai:  python3 cek_tumpang_tindih.py [--skills .claude/skills] [--ambang 0.30] [--awalan graphify-,etsy-]
                                      [--lawan-semua] [--maks 25] [--json]

Cara menilai (semuanya dari teks description di frontmatter, tanpa LLM):
  skor      = kemiripan Jaccard kata kunci (kata >= 4 huruf, tanpa kata umum Indonesia/Inggris)
  frasa     = frasa pemicu dalam tanda kutip ("...") yang sama, atau saling memuat bila frasa yang
              lebih pendek minimal dua kata dan 8 huruf (frasa satu kata seperti judul tidak dihitung)
  batas     = description atau bagian "Kapan tidak digunakan" salah satu skill menyebut nama skill
              lainnya (misalnya "itu tugas X"): batas sudah ditulis, risikonya lebih kecil
Saran: "gabung atau persempit" (skor >= 0,5 tanpa batas), "ubah frasa pemicu" (ada frasa bentrok),
"tulis batas di Kapan tidak digunakan" (skor di atas ambang tanpa batas), "cukup" (batas sudah ada).
--awalan membatasi skill yang diperiksa; dengan --lawan-semua, skill terpilih dibandingkan dengan semua.
Kode keluar: 0 selalu (laporan, bukan vonis).
"""
import argparse
import itertools
import json
import re
import sys
from pathlib import Path

STOP = set("""
yang dan atau untuk dengan dari pada saat ini itu juga tidak bila jika akan sudah belum dalam
oleh agar sebagai seperti setiap tiap lalu atau berupa hasil pakai dipakai jangan menjadi membuat
skill pemilik memakai berkata bukan saja hanya sebelum sesudah setelah sampai lebih kurang antara
tentang bagaimana apakah mana apa siapa kapan kenapa mengapa satu dua tiga semua beberapa banyak
the and for with from that this when into your you use used using skill skills only about which
what where while also then than them they their there these those have has will would should could
""".split())
WORD = re.compile(r"[a-zA-ZÀ-ɏ][a-zA-Z0-9À-ɏ-]{3,}")
QUOTE = re.compile(r"[\"“]([^\"”]{4,120})[\"”]")


def frontmatter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    data = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line and not line.startswith((" ", "\t")):
                k, v = line.split(":", 1)
                v = v.strip()
                if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                    v = v[1:-1]
                data[k.strip()] = v
    return data


def norm(phrase: str) -> str:
    return " ".join(re.sub(r"[^\w\s]", " ", phrase.lower()).split())


def load(skills_dir: Path):
    items = {}
    for md in sorted(skills_dir.glob("*/SKILL.md")):
        text = md.read_text(encoding="utf-8", errors="replace")
        desc = frontmatter(text).get("description", "")
        m = re.search(r"^## Kapan tidak digunakan\s*\n(.*?)(?=^## |\Z)", text, re.DOTALL | re.MULTILINE)
        boundary_text = desc + "\n" + (m.group(1) if m else "")
        words = {w.lower().strip("-") for w in WORD.findall(desc)}
        name_parts = set(md.parent.name.split("-"))
        keywords = {w for w in words if w not in STOP and w not in name_parts and not w.isdigit()}
        phrases = {norm(q) for q in QUOTE.findall(desc) if len(norm(q)) >= 8}
        items[md.parent.name] = {"desc": desc, "batas": boundary_text, "kata": keywords, "frasa": phrases}
    return items


def compare(items, selected, against_all, threshold):
    names = sorted(items)
    if against_all:
        pairs = {tuple(sorted((a, b))) for a in selected for b in names if a != b}
    else:
        pairs = set(itertools.combinations(sorted(selected), 2))
    rows = []
    for a, b in sorted(pairs):
        A, B = items[a], items[b]
        union = A["kata"] | B["kata"]
        score = len(A["kata"] & B["kata"]) / len(union) if union else 0.0
        clash = sorted({p for p in A["frasa"] for q in B["frasa"] if p == q or (
            min(len(p), len(q)) >= 8 and min(len(p.split()), len(q.split())) >= 2 and (p in q or q in p))})
        boundary = b in A["batas"] or a in B["batas"]
        if score < threshold and not clash:
            continue
        if clash:
            advice = "ubah frasa pemicu"
        elif boundary:
            advice = "cukup: batas sudah tertulis, cek kejelasannya"
        elif score >= 0.5:
            advice = "gabung atau persempit"
        else:
            advice = "tulis batas di 'Kapan tidak digunakan'"
        rows.append({"a": a, "b": b, "skor": round(score, 3), "kata_bersama": sorted(A["kata"] & B["kata"])[:10],
                     "frasa_bentrok": clash, "batas_tertulis": boundary, "saran": advice})
    rows.sort(key=lambda r: (bool(r["frasa_bentrok"]), r["skor"]), reverse=True)
    return rows


def main():
    ap = argparse.ArgumentParser(description="Cari skill yang tumpang tindih atau pemicunya berebut.")
    ap.add_argument("--skills", default=".claude/skills")
    ap.add_argument("--ambang", type=float, default=0.30, help="skor Jaccard minimal untuk dilaporkan")
    ap.add_argument("--awalan", default="", help="daftar awalan nama dipisah koma, contoh graphify-,etsy-")
    ap.add_argument("--lawan-semua", action="store_true", help="bandingkan skill terpilih dengan semua skill")
    ap.add_argument("--maks", type=int, default=25)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    skills_dir = Path(args.skills)
    if not skills_dir.is_dir():
        print(f"GAGAL: {skills_dir} tidak ada.")
        return 1
    items = load(skills_dir)
    prefixes = [p.strip() for p in args.awalan.split(",") if p.strip()]
    selected = [n for n in items if not prefixes or any(n.startswith(p) for p in prefixes)]
    rows = compare(items, selected, args.lawan_semua, args.ambang)
    if args.json:
        print(json.dumps(rows[:args.maks], ensure_ascii=False, indent=1))
        return 0
    print(f"Skill dibaca: {len(items)}; diperiksa: {len(selected)}; ambang skor: {args.ambang}")
    if not rows:
        print("Tidak ada pasangan di atas ambang dan tidak ada frasa pemicu yang bentrok.")
        return 0
    print("\n| Skill A | Skill B | Skor | Kata bersama | Frasa bentrok | Batas tertulis | Saran |")
    print("|---|---|---|---|---|---|---|")
    for r in rows[:args.maks]:
        print(f"| {r['a']} | {r['b']} | {r['skor']:.2f} | {', '.join(r['kata_bersama'][:6])} | "
              f"{'; '.join(r['frasa_bentrok']) or '-'} | {'ya' if r['batas_tertulis'] else 'tidak'} | {r['saran']} |")
    if len(rows) > args.maks:
        print(f"\n... {len(rows) - args.maks} pasangan lain tidak ditampilkan (naikkan --maks).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
