#!/usr/bin/env python3
"""Cari celah di perpustakaan skill: rujukan rusak, skill yatim, file mati, dan keluarga tanpa pintu masuk.

Pakai:  python3 cek_celah_skill.py [--skills .claude/skills] [--akar .] [--awalan studio-,etsy-]
                                   [--abaikan nama1,nama2] [--json]

Tingkat temuan:
  GAGAL      frontmatter hilang/rusak, name tidak sama dengan nama folder, description kosong atau
             lebih dari 1024 karakter atau memuat kurung sudut atau ' #' (komentar YAML yang memotong
             deskripsi), file `references/..`, `assets/..`,
             `scripts/..` yang dirujuk tidak ada, nama skill di dalam backtick yang tidak ada
  PERINGATAN description kurang dari 80 karakter (sulit memicu), SKILL.md lebih dari 500 baris
  INFO       skill yatim (tidak merujuk dan tidak dirujuk skill lain), file pendukung yang tidak
             disebut di mana pun dalam skillnya, keluarga (3+ skill seawalan) tanpa skill pintu masuk
Nama berbentuk skill yang sebenarnya folder atau berkas di akar repo (misalnya `graphify-out`,
`studio-nangka`) tidak dihitung sebagai rujukan rusak.
Kode keluar: 1 bila ada GAGAL, selain itu 0.
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

FILE_REF = re.compile(r"`((?:references|assets|scripts)/[A-Za-z0-9_./-]+)`")
TOKEN = re.compile(r"`([a-z0-9]+(?:-[a-z0-9]+)+)`")
ROUTER_WORDS = ("dirigen", "orchestrator", "router", "pintu")
DEFAULT_IGNORE = {"graphify-out", "graphify-mcp", "graphify-kerja", "graphify-core", "studio-nangka",
                  "studio-core", "studio-wall-art-by-nangka", "keluarga-graphify", "next-env"}
SHARED = {"graphify-core.md", "studio-core.md"}


def frontmatter(text: str):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        return None
    data = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            k, v = line.split(":", 1)
            v = v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                v = v[1:-1]
            data[k.strip()] = v
    return data


def main():
    ap = argparse.ArgumentParser(description="Cari celah dan rujukan rusak di perpustakaan skill.")
    ap.add_argument("--skills", default=".claude/skills")
    ap.add_argument("--akar", default=".", help="akar repo, untuk mengenali nama folder yang bukan skill")
    ap.add_argument("--awalan", default="", help="periksa hanya skill berawalan ini (dipisah koma)")
    ap.add_argument("--abaikan", default="", help="nama tambahan yang bukan skill (dipisah koma)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    skills_dir, root = Path(args.skills), Path(args.akar)
    if not skills_dir.is_dir():
        print(f"GAGAL: {skills_dir} tidak ada.")
        return 1
    dirs = sorted(p.parent for p in skills_dir.glob("*/SKILL.md"))
    names = {d.name for d in dirs}
    families = {n.split("-")[0] for n in names if "-" in n}
    ignore = DEFAULT_IGNORE | {x.strip() for x in args.abaikan.split(",") if x.strip()}
    ignore |= {p.name for p in root.iterdir()} if root.is_dir() else set()
    prefixes = [p.strip() for p in args.awalan.split(",") if p.strip()]
    checked = [d for d in dirs if not prefixes or any(d.name.startswith(p) for p in prefixes)]

    findings = []
    outgoing, incoming = defaultdict(set), defaultdict(set)
    patterns = {n: re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(n) + r"(?![A-Za-z0-9_-])") for n in names if "-" in n}
    texts = {d.name: (d / "SKILL.md").read_text(encoding="utf-8", errors="replace") for d in dirs}
    for a, text in texts.items():
        for b, pat in patterns.items():
            if a != b and pat.search(text):
                outgoing[a].add(b)
                incoming[b].add(a)

    def add(level, skill, text):
        findings.append({"tingkat": level, "skill": skill, "temuan": text})

    for d in checked:
        name, text = d.name, texts[d.name]
        fm = frontmatter(text)
        if fm is None:
            add("GAGAL", name, "frontmatter tidak ditemukan")
        else:
            if fm.get("name") != name:
                add("GAGAL", name, f"name di frontmatter '{fm.get('name')}' tidak sama dengan nama folder")
            desc = fm.get("description", "")
            if not desc:
                add("GAGAL", name, "description kosong")
            elif len(desc) > 1024:
                add("GAGAL", name, f"description {len(desc)} karakter (maks 1024)")
            elif len(desc) < 80:
                add("PERINGATAN", name, f"description hanya {len(desc)} karakter; terlalu pendek untuk memicu dengan tepat")
            if "<" in desc or ">" in desc:
                add("GAGAL", name, "description memuat kurung sudut")
            raw = re.search(r"^description:(.*)$", text, re.MULTILINE)
            if raw and " #" in raw.group(1) and not raw.group(1).strip().startswith(("'", '"')):
                add("GAGAL", name, "description memuat ' #': YAML membacanya sebagai komentar sehingga deskripsi terpotong")
        n_lines = len(text.splitlines())
        if n_lines > 500:
            add("PERINGATAN", name, f"SKILL.md {n_lines} baris (saran maks 500); pindahkan rincian ke references/")
        own_md = [text] + [p.read_text(encoding="utf-8", errors="replace") for p in d.rglob("*.md") if p.name != "SKILL.md"]
        for ref in sorted({r for t in own_md for r in FILE_REF.findall(t)}):
            if not (d / ref).exists():
                add("GAGAL", name, f"file yang dirujuk tidak ada: {ref}")
        for tok in sorted(set(TOKEN.findall(text))):
            if tok in names or tok in ignore or tok.split("-")[0] not in families:
                continue
            if any(tok.startswith(n) or n.startswith(tok) for n in ignore):
                continue
            add("GAGAL", name, f"menyebut skill yang tidak ada: `{tok}`")
        all_text = "\n".join(own_md)
        for sub in ("references", "assets", "scripts"):
            folder = d / sub
            if not folder.is_dir():
                continue
            for f in sorted(p for p in folder.rglob("*") if p.is_file() and "__pycache__" not in p.parts):
                if f.name in SHARED:
                    continue
                rel = f"{sub}/{f.relative_to(folder).as_posix()}"
                if rel not in all_text and f.name not in all_text:
                    add("INFO", name, f"file tidak disebut di skill ini: {rel}")
        if not outgoing[name] and not incoming[name]:
            add("INFO", name, "skill yatim: tidak merujuk dan tidak dirujuk skill lain")

    by_family = defaultdict(list)
    for n in names:
        if "-" in n:
            by_family[n.split("-")[0]].append(n)
    for fam, members in sorted(by_family.items()):
        if prefixes and not any(fam.startswith(p.rstrip("-")) for p in prefixes):
            continue
        if len(members) >= 3 and not any(w in m for m in members for w in ROUTER_WORDS):
            add("INFO", f"keluarga {fam}-", f"{len(members)} skill tanpa skill pintu masuk (dirigen/orchestrator)")

    if args.json:
        print(json.dumps(findings, ensure_ascii=False, indent=1))
    else:
        print(f"Skill di perpustakaan: {len(names)}; diperiksa: {len(checked)}")
        if not findings:
            print("Tidak ada celah ditemukan.")
        else:
            order = {"GAGAL": 0, "PERINGATAN": 1, "INFO": 2}
            print("\n| Tingkat | Skill | Temuan |")
            print("|---|---|---|")
            for f in sorted(findings, key=lambda x: (order[x["tingkat"]], x["skill"])):
                print(f"| {f['tingkat']} | {f['skill']} | {f['temuan']} |")
            counts = {k: sum(1 for f in findings if f["tingkat"] == k) for k in order}
            print(f"\nRingkas: {counts['GAGAL']} GAGAL, {counts['PERINGATAN']} PERINGATAN, {counts['INFO']} INFO")
    return 1 if any(f["tingkat"] == "GAGAL" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
