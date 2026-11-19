#!/usr/bin/env python3
"""Kemas tiap skill keluarga graphify menjadi berkas .skill (ZIP) untuk diunggah ke claude.ai.

Pakai:  python3 keluarga-graphify/tools/build_dist.py

Keluaran: keluarga-graphify/dist/<nama-skill>.skill untuk setiap skill di indeks,
          dan keluarga-graphify/dist/keluarga-graphify-semua-skill.zip berisi semuanya.

Isi tiap .skill: folder <nama-skill>/ dengan SKILL.md, references/, assets/, scripts/.
Folder __pycache__ dan berkas .pyc tidak ikut. Skrip menolak mengemas bila salinan
graphify-core.md tidak sama dengan sumbernya (jalankan sync_shared.py dulu).
"""
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / "keluarga-graphify"
SKILLS = ROOT / ".claude" / "skills"
DIST = FAMILY / "dist"
BUNDLE = "keluarga-graphify-semua-skill.zip"
FIXED_TIME = (2026, 11, 19, 0, 0, 0)  # waktu tetap agar kemasan sama bila isi tidak berubah


def main():
    index = json.loads((FAMILY / "skill-index.json").read_text(encoding="utf-8"))
    core = (FAMILY / "_shared" / "graphify-core.md").read_bytes()
    DIST.mkdir(exist_ok=True)
    for old in DIST.glob("*"):
        if old.suffix in (".skill", ".zip"):
            old.unlink()
    built = []
    for skill in index["skills"]:
        folder = SKILLS / skill["name"]
        copy = folder / "references" / "graphify-core.md"
        if not copy.exists() or copy.read_bytes() != core:
            print(f"DITOLAK: {skill['name']} punya graphify-core.md yang tidak sama dengan sumber. Jalankan sync_shared.py.")
            return 1
        target = DIST / f"{skill['name']}.skill"
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in sorted(folder.rglob("*")):
                if path.is_dir() or "__pycache__" in path.parts or path.suffix == ".pyc":
                    continue
                info = zipfile.ZipInfo(str(Path(skill["name"]) / path.relative_to(folder)), FIXED_TIME)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o755 if path.suffix == ".py" else 0o644) << 16
                archive.writestr(info, path.read_bytes())
        built.append(target)
    bundle = DIST / BUNDLE
    with zipfile.ZipFile(bundle, "w", zipfile.ZIP_STORED) as archive:
        for target in built:
            archive.writestr(zipfile.ZipInfo(target.name, FIXED_TIME), target.read_bytes())
    total = sum(p.stat().st_size for p in built)
    print(f"{len(built)} berkas .skill dibuat di {DIST.relative_to(ROOT)} ({total / 1024:.0f} KB)")
    print(f"Bundel: {bundle.relative_to(ROOT)} ({bundle.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
