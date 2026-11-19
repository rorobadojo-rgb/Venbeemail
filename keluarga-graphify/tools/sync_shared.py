#!/usr/bin/env python3
"""Salin aturan inti keluarga graphify ke setiap skill.

Sumber tunggal: keluarga-graphify/_shared/graphify-core.md
Tujuan: .claude/skills/<skill>/references/graphify-core.md untuk setiap skill di skill-index.json

Setiap skill harus bisa dipasang sendiri-sendiri (misalnya sebagai berkas .skill di claude.ai),
jadi file inti ikut di dalamnya. Jangan mengedit salinan; edit sumbernya lalu jalankan skrip ini.

Pakai:  python3 keluarga-graphify/tools/sync_shared.py [--check]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / "keluarga-graphify"
SKILLS = ROOT / ".claude" / "skills"
SOURCE = FAMILY / "_shared" / "graphify-core.md"


def main() -> int:
    check_only = "--check" in sys.argv
    index = json.loads((FAMILY / "skill-index.json").read_text(encoding="utf-8"))
    source_text = SOURCE.read_text(encoding="utf-8")
    problems = []
    for skill in index["skills"]:
        folder = SKILLS / skill["name"]
        target = folder / "references" / "graphify-core.md"
        if not folder.is_dir():
            problems.append(f"folder skill belum ada: {skill['name']}")
            continue
        current = target.read_text(encoding="utf-8") if target.exists() else None
        if current == source_text:
            continue
        if check_only:
            problems.append(f"salinan tidak sama dengan sumber: {target.relative_to(ROOT)}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(source_text, encoding="utf-8")
            print(f"disalin -> {target.relative_to(ROOT)}")
    for p in problems:
        print("MASALAH:", p)
    if not problems:
        print("OK: semua salinan graphify-core.md sama dengan sumber." if check_only else "Selesai.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
