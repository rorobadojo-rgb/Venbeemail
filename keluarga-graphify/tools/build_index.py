#!/usr/bin/env python3
"""Buat indeks skill keluarga graphify dari skill-index.json dan isi folder tiap skill.

Menulis dua file dari satu sumber, supaya tidak ada daftar yang ditulis tangan dua kali:
  - keluarga-graphify/INDEKS-SKILL.md                         (untuk pemilik repo)
  - .claude/skills/graphify-dirigen/references/peta-skill.md  (untuk dirigen)

Pakai:  python3 keluarga-graphify/tools/build_index.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / "keluarga-graphify"
SKILLS = ROOT / ".claude" / "skills"
ROLE_LABEL = {"router": "pintu masuk", "service": "layanan", "pipeline": "jalur"}
SKIP = {"graphify-core.md", "peta-skill.md"}


def extras(name):
    folder = SKILLS / name
    found = []
    for sub in ("scripts", "assets", "references"):
        if (folder / sub).is_dir():
            files = sorted(p.name for p in (folder / sub).iterdir() if p.is_file() and p.name not in SKIP)
            found += [f"{sub}/{f}" for f in files]
    return found


def main():
    index = json.loads((FAMILY / "skill-index.json").read_text(encoding="utf-8"))
    skills = index["skills"]
    groups = index["groups"]
    roles = {r: sum(1 for s in skills if s["role"] == r) for r in ROLE_LABEL}

    owner = ["# Indeks Skill: Keluarga Skill Graphify", "",
             "File ini dibuat otomatis oleh `tools/build_index.py`. Jangan diedit tangan.", "",
             f"Jumlah skill: {len(skills)}. Peran: pintu masuk ({roles['router']}), "
             f"layanan ({roles['service']}, dipanggil skill lain), jalur ({roles['pipeline']}, urutan kerja).", ""]
    peta = ["# Peta Skill Keluarga Graphify", "",
            "Dibuat otomatis dari indeks arsitektur. Pakai untuk memilih skill dan mengetahui pemilik tiap keputusan.",
            "Skill resmi `graphify` (pipeline /graphify) bukan bagian indeks ini, tetapi dipakai oleh skill build.", ""]

    for key, title in groups.items():
        members = [s for s in skills if s["group"] == key]
        owner += [f"## Kelompok {key} - {title}", "",
                  "| No | Skill | Peran | Fungsi | File pendukung |", "|---|---|---|---|---|"]
        peta += [f"## {key}. {title}", "",
                 "| Skill | Peran | Fungsi | Pemilik keputusan | Menyerahkan ke | Memakai layanan |",
                 "|---|---|---|---|---|---|"]
        for s in members:
            files = ", ".join(f"`{f}`" for f in extras(s["name"])) or "-"
            owner.append(f"| {s['id']} | `{s['name']}` | {ROLE_LABEL[s['role']]} | {s['function']} | {files} |")
            nxt = ", ".join(s["next"]) or "-"
            uses = ", ".join(s["uses"]) or "-"
            peta.append(f"| {s['name']} | {ROLE_LABEL[s['role']]} | {s['function']} | {s['owns']} | {nxt} | {uses} |")
        owner.append("")
        peta.append("")

    owner += ["## Pemilik tiap keputusan", "", "| Keputusan | Pemilik tunggal |", "|---|---|"]
    owner += [f"| {s['owns']} | `{s['name']}` |" for s in skills]
    owner += ["", "## Keputusan rancangan", ""]
    owner += [f"- **{d['decision']}.** {d['reason']}" for d in index.get("design_decisions", [])]
    owner.append("")

    (FAMILY / "INDEKS-SKILL.md").write_text("\n".join(owner), encoding="utf-8")
    target = SKILLS / "graphify-dirigen" / "references" / "peta-skill.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(peta), encoding="utf-8")
    print("ditulis:", (FAMILY / "INDEKS-SKILL.md").relative_to(ROOT))
    print("ditulis:", target.relative_to(ROOT))


if __name__ == "__main__":
    main()
