#!/usr/bin/env python3
"""Buat indeks skill dari skill-index.json dan frontmatter tiap SKILL.md.

Menulis dua file dari satu sumber, supaya tidak ada daftar yang ditulis tangan dua kali:
  - studio-wall-art-by-nangka/INDEKS-SKILL.md          (untuk pemilik studio)
  - .claude/skills/studio-wall-art-orchestrator/references/peta-skill.md   (untuk orchestrator)

Pakai:  python3 studio-wall-art-by-nangka/tools/build_index.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STUDIO = ROOT / "studio-wall-art-by-nangka"
SKILLS = ROOT / ".claude" / "skills"
ROLE_LABEL = {"router": "pintu masuk", "service": "layanan", "pipeline": "jalur"}


def extras(name):
    folder = SKILLS / name
    found = []
    for sub in ("scripts", "assets", "references"):
        if (folder / sub).is_dir():
            files = sorted(p.name for p in (folder / sub).iterdir() if p.is_file() and p.name != "studio-core.md")
            found += [f"{sub}/{f}" for f in files]
    return found


def main():
    index = json.loads((STUDIO / "skill-index.json").read_text(encoding="utf-8"))
    skills = index["skills"]
    groups = index["groups"]

    owner_lines = ["# Indeks Skill: Studio Wall Art by Nangka", "",
                   "File ini dibuat otomatis oleh `tools/build_index.py`. Jangan diedit tangan.", "",
                   f"Jumlah skill: {len(skills)}. Peran: pintu masuk (1), layanan (dipanggil skill lain), jalur (urutan kerja).", ""]
    map_lines = ["# Peta Skill Studio", "",
                 "Dibuat otomatis dari indeks arsitektur. Pakai untuk memilih skill dan mengetahui siapa pemilik tiap keputusan.", ""]

    for key, title in groups.items():
        members = [s for s in skills if s["group"] == key]
        owner_lines += [f"## Kelompok {key} - {title}", "",
                        "| No | Skill | Fungsi | File pendukung |", "|---|---|---|---|"]
        map_lines += [f"## {key}. {title}", "",
                      "| Skill | Peran | Pemilik keputusan | Menyerahkan ke | Memakai layanan |", "|---|---|---|---|---|"]
        for s in members:
            files = ", ".join(f"`{f}`" for f in extras(s["name"])) or "-"
            owner_lines.append(f"| {s['id']} | `{s['name']}` | {s['function']} | {files} |")
            nxt = ", ".join(s["next"]) or "-"
            uses = ", ".join(s["uses"]) or "-"
            map_lines.append(f"| {s['name']} | {ROLE_LABEL[s['role']]} | {s['owns']} | {nxt} | {uses} |")
        owner_lines.append("")
        map_lines.append("")

    owner_lines += ["## Pemilik tiap keputusan", "", "| Keputusan | Pemilik tunggal |", "|---|---|"]
    owner_lines += [f"| {s['owns']} | `{s['name']}` |" for s in skills]
    owner_lines += ["", "## Perubahan dari rancangan awal 48 skill", "", "Digabung:", ""]
    owner_lines += [f"- `{m['absorbed']}` masuk ke `{m['kept']}`. {m['reason']}" for m in index["merged_from_original_48"]]
    owner_lines += ["", "Ditambah:", ""]
    owner_lines += [f"- `{a['name']}`. {a['reason']}" for a in index["added"]]
    owner_lines.append("")

    (STUDIO / "INDEKS-SKILL.md").write_text("\n".join(owner_lines), encoding="utf-8")
    target = SKILLS / "studio-wall-art-orchestrator" / "references" / "peta-skill.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(map_lines), encoding="utf-8")
    print("ditulis:", (STUDIO / "INDEKS-SKILL.md").relative_to(ROOT))
    print("ditulis:", target.relative_to(ROOT))


if __name__ == "__main__":
    main()
