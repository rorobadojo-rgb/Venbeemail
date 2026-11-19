#!/usr/bin/env python3
"""Gambar diagram Mermaid dan tabel ringkas sebuah keluarga skill.

Pakai:
  python3 diagram_keluarga.py --indeks keluarga-graphify/skill-index.json [--tulis PATH]
  python3 diagram_keluarga.py --awalan etsy- [--skills .claude/skills] [--tulis PATH]

Mode indeks : simpul per skill dikelompokkan per kelompok (subgraph); panah tegas = "next"
              (menyerahkan ke), panah putus-putus = "uses" (memakai layanan). Pintu masuk dan
              layanan diberi gaya berbeda.
Mode awalan : tanpa indeks, panah ditarik dari nama skill lain yang disebut di SKILL.md. Skill tanpa
              panah masuk maupun keluar ditandai sebagai yatim.
Keluaran Markdown berisi blok ```mermaid yang tampil sebagai diagram di GitHub dan claude.ai.
Kode keluar: 0 berhasil, 1 masukan tidak sah.
"""
import argparse
import json
import re
import sys
from pathlib import Path


def mid(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9]", "_", name)


def short(name: str, prefix: str) -> str:
    return name[len(prefix):] if prefix and name.startswith(prefix) else name


def common_prefix(names):
    if not names:
        return ""
    first = names[0].split("-")[0] + "-"
    return first if all(n.startswith(first) for n in names) else ""


def from_index(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    skills = data["skills"]
    names = [s["name"] for s in skills]
    prefix = common_prefix(names)
    lines = ["```mermaid", "flowchart TD"]
    for key, title in data.get("groups", {}).items():
        members = [s for s in skills if s["group"] == key]
        if not members:
            continue
        lines.append(f'    subgraph G{key}["{key}. {title}"]')
        for s in members:
            lines.append(f'        {mid(s["name"])}["{short(s["name"], prefix)}"]')
        lines.append("    end")
    for s in skills:
        for n in s.get("next", []):
            lines.append(f"    {mid(s['name'])} --> {mid(n)}")
        for u in s.get("uses", []):
            lines.append(f"    {mid(s['name'])} -.-> {mid(u)}")
    lines.append("    classDef router fill:#ffe9a8,stroke:#b8860b,stroke-width:2px")
    lines.append("    classDef service fill:#dff3e4,stroke:#2e7d32")
    for s in skills:
        if s["role"] in ("router", "service"):
            lines.append(f"    class {mid(s['name'])} {s['role']}")
    lines.append("```")
    roles = {r: sum(1 for s in skills if s["role"] == r) for r in ("router", "service", "pipeline")}
    head = [f"# Peta keluarga: {data.get('system', path.parent.name)}", "",
            f"{len(skills)} skill: {roles['router']} pintu masuk, {roles['service']} layanan, {roles['pipeline']} jalur. "
            "Panah tegas = menyerahkan ke; panah putus-putus = memakai layanan.", ""]
    table = ["", "| Kelompok | Jumlah | Skill |", "|---|---|---|"]
    for key, title in data.get("groups", {}).items():
        members = [s["name"] for s in skills if s["group"] == key]
        table.append(f"| {key}. {title} | {len(members)} | {', '.join(short(m, prefix) for m in members)} |")
    return "\n".join(head + lines + table) + "\n"


def from_prefix(skills_dir: Path, prefix: str):
    dirs = sorted(p.parent for p in skills_dir.glob(f"{prefix}*/SKILL.md"))
    names = [d.name for d in dirs]
    if not names:
        return None
    pats = {n: re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(n) + r"(?![A-Za-z0-9_-])") for n in names}
    edges, touched = [], set()
    for d in dirs:
        text = (d / "SKILL.md").read_text(encoding="utf-8", errors="replace")
        for other, pat in pats.items():
            if other != d.name and pat.search(text):
                edges.append((d.name, other))
                touched.update((d.name, other))
    lines = ["```mermaid", "flowchart LR"]
    for n in names:
        lines.append(f'    {mid(n)}["{short(n, prefix)}"]')
    for a, b in edges:
        lines.append(f"    {mid(a)} --> {mid(b)}")
    orphans = [n for n in names if n not in touched]
    if orphans:
        lines.append("    classDef yatim fill:#fde2e1,stroke:#c62828")
        lines.append("    class " + ",".join(mid(n) for n in orphans) + " yatim")
    lines.append("```")
    head = [f"# Peta keluarga awalan `{prefix}`", "",
            f"{len(names)} skill, {len(edges)} rujukan antarskill (dari teks SKILL.md, bukan indeks). "
            f"Yatim (merah): {', '.join(orphans) or '-'}.", ""]
    return "\n".join(head + lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="Diagram Mermaid keluarga skill.")
    ap.add_argument("--indeks", help="path skill-index.json")
    ap.add_argument("--awalan", help="awalan nama skill, contoh etsy-")
    ap.add_argument("--skills", default=".claude/skills")
    ap.add_argument("--tulis", help="simpan Markdown ke path ini")
    args = ap.parse_args()
    if bool(args.indeks) == bool(args.awalan):
        print("GAGAL: pilih tepat satu: --indeks atau --awalan.")
        return 1
    try:
        text = from_index(Path(args.indeks)) if args.indeks else from_prefix(Path(args.skills), args.awalan)
    except (OSError, ValueError, KeyError) as exc:
        print(f"GAGAL: indeks tidak bisa dibaca: {exc}")
        return 1
    if text is None:
        print(f"GAGAL: tidak ada skill berawalan {args.awalan} di {args.skills}.")
        return 1
    if args.tulis:
        out = Path(args.tulis)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(f"Ditulis: {out}")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
