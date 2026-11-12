#!/usr/bin/env python3
"""Kemas tiap skill menjadi berkas .skill (ZIP) untuk dipasang di akun Claude.

Pakai:  python3 studio-wall-art-by-nangka/tools/build_dist.py

Keluaran: studio-wall-art-by-nangka/dist/<nama-skill>.skill untuk 45 skill,
          dan studio-wall-art-by-nangka/dist/studio-wall-art-by-nangka-semua-skill.zip berisi semuanya.

Isi tiap .skill: folder <nama-skill>/ dengan SKILL.md, references/, assets/, scripts/.
Folder __pycache__ dan berkas .pyc tidak ikut. Jalankan run_tests.py lebih dulu; skrip ini menolak
mengemas bila salinan studio-core.md tidak sama dengan sumbernya.
"""
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STUDIO = ROOT / "studio-wall-art-by-nangka"
SKILLS = ROOT / ".claude" / "skills"
DIST = STUDIO / "dist"
FIXED_TIME = (2026, 11, 12, 0, 0, 0)  # waktu tetap agar hasil kemasan sama bila isi tidak berubah


def main():
    index = json.loads((STUDIO / "skill-index.json").read_text(encoding="utf-8"))
    core = (STUDIO / "_shared" / "studio-core.md").read_bytes()
    DIST.mkdir(exist_ok=True)
    for old in DIST.glob("*"):
        old.unlink()
    built = []
    for skill in index["skills"]:
        folder = SKILLS / skill["name"]
        if (folder / "references" / "studio-core.md").read_bytes() != core:
            print(f"DITOLAK: {skill['name']} punya studio-core.md yang tidak sama dengan sumber. Jalankan sync_shared.py.")
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
    bundle = DIST / "studio-wall-art-by-nangka-semua-skill.zip"
    with zipfile.ZipFile(bundle, "w", zipfile.ZIP_STORED) as archive:
        for target in built:
            archive.writestr(zipfile.ZipInfo(target.name, FIXED_TIME), target.read_bytes())
    total = sum(p.stat().st_size for p in built)
    print(f"{len(built)} berkas .skill dibuat di {DIST.relative_to(ROOT)} ({total / 1024:.0f} KB)")
    print(f"Bundel: {bundle.relative_to(ROOT)} ({bundle.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
