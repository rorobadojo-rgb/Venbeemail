#!/usr/bin/env python3
"""Tunjukkan semua tempat yang menyebut sebuah skill, beserta tingkat dampaknya bila skill itu diubah.

Pakai:  python3 dampak_skill.py NAMA-SKILL [--akar .] [--ganti-nama NAMA-BARU [--terapkan]] [--json]

Yang dipindai: berkas teks (.md .json .py .txt .csv .yml .yaml .toml .sh) di seluruh repo, kecuali
.git, node_modules, cache graphify, dan folder dist (berkas .skill adalah ZIP; kemas ulang sesudahnya).
Tingkat dampak:
  TINGGI  frontmatter skill lain, bagian "Serah terima" atau "Kapan tidak digunakan", skill-index.json
  SEDANG  bagian lain di SKILL.md skill lain, berkas references/ skill lain, skrip
  RENDAH  dokumen dan catatan di luar folder skill
  SENDIRI berkas di dalam folder skill itu sendiri
  SALINAN salinan aturan inti (graphify-core.md, studio-core.md) di tiap skill; cukup ubah sumbernya
--ganti-nama tanpa --terapkan hanya mencetak rencana. Dengan --terapkan: semua kemunculan (kata utuh)
diganti, folder skill di .claude/skills/ diganti nama, lalu daftar berkas yang berubah dicetak.
Setelah itu jalankan ulang sync/indeks/uji keluarga yang terdampak dan kemas ulang dist.
Kode keluar: 0 berhasil, 1 masukan tidak sah.
"""
import argparse
import json
import re
import signal
import sys
from collections import Counter
from pathlib import Path

TEXT_EXT = {".md", ".json", ".py", ".txt", ".csv", ".yml", ".yaml", ".toml", ".sh"}
SKIP_PARTS = {".git", "node_modules", "cache", "dist", "__pycache__", ".next"}
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)+$")
HIGH_SECTIONS = ("Serah terima", "Kapan tidak digunakan")
SHARED_CORES = {"graphify-core.md", "studio-core.md"}


def heading_at(lines, idx):
    for j in range(idx, -1, -1):
        if lines[j].startswith("## "):
            return lines[j][3:].strip()
    return None


def in_frontmatter(lines, idx):
    if not lines or lines[0].strip() != "---":
        return False
    for j in range(1, len(lines)):
        if lines[j].strip() == "---":
            return idx < j
    return False


def scan(root: Path, name: str):
    pat = re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(name) + r"(?![A-Za-z0-9_-])")
    own = root / ".claude" / "skills" / name
    hits = []
    for f in sorted(root.rglob("*")):
        if not f.is_file() or f.suffix not in TEXT_EXT or SKIP_PARTS & set(f.relative_to(root).parts):
            continue
        try:
            lines = f.read_text(encoding="utf-8").splitlines()
        except (UnicodeDecodeError, OSError):
            continue
        rel = f.relative_to(root).as_posix()
        for i, line in enumerate(lines):
            if not pat.search(line):
                continue
            if f.name in SHARED_CORES and "_shared" not in f.parts:
                level, where = "SALINAN", "salinan aturan inti (ubah sumbernya di _shared/, lalu sync)"
            elif f.name in SHARED_CORES:
                level, where = "SEDANG", "sumber aturan inti keluarga"
            elif own in f.parents:
                level, where = "SENDIRI", "folder skill sendiri"
            elif f.name == "skill-index.json":
                level, where = "TINGGI", "indeks keluarga"
            elif f.name == "SKILL.md" and ".claude" in f.parts:
                if in_frontmatter(lines, i):
                    level, where = "TINGGI", "frontmatter (description)"
                else:
                    h = heading_at(lines, i)
                    level = "TINGGI" if h in HIGH_SECTIONS else "SEDANG"
                    where = f"bagian '{h}'" if h else "SKILL.md"
            elif ".claude" in f.parts and "skills" in f.parts:
                level, where = "SEDANG", "berkas pendukung skill lain"
            elif f.suffix in (".py", ".sh"):
                level, where = "SEDANG", "skrip"
            else:
                level, where = "RENDAH", "dokumen"
            hits.append({"tingkat": level, "file": rel, "baris": i + 1, "lokasi": where, "isi": line.strip()[:160]})
    return hits


def main():
    ap = argparse.ArgumentParser(description="Analisis dampak perubahan sebuah skill.")
    ap.add_argument("nama", help="nama skill, contoh studio-brand-memory")
    ap.add_argument("--akar", default=".")
    ap.add_argument("--ganti-nama", help="nama baru (rencana ganti nama)")
    ap.add_argument("--terapkan", action="store_true", help="benar-benar mengganti nama (hanya bersama --ganti-nama)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    root = Path(args.akar).resolve()
    if not NAME_RE.match(args.nama):
        print(f"GAGAL: '{args.nama}' bukan nama skill yang sah (huruf kecil, angka, tanda hubung).")
        return 1
    if args.ganti_nama and not NAME_RE.match(args.ganti_nama):
        print(f"GAGAL: nama baru '{args.ganti_nama}' tidak sah.")
        return 1
    if args.terapkan and not args.ganti_nama:
        print("GAGAL: --terapkan hanya bersama --ganti-nama.")
        return 1
    hits = scan(root, args.nama)
    folder = root / ".claude" / "skills" / args.nama
    if args.json and not args.terapkan:
        print(json.dumps({"skill": args.nama, "folder_ada": folder.is_dir(), "kemunculan": hits}, ensure_ascii=False, indent=1))
        return 0
    order = {"TINGGI": 0, "SEDANG": 1, "RENDAH": 2, "SENDIRI": 3, "SALINAN": 4}
    counts = Counter(h["tingkat"] for h in hits)
    files = sorted({h["file"] for h in hits})
    print(f"Skill: {args.nama} (folder {'ada' if folder.is_dir() else 'TIDAK ADA'})")
    print(f"Kemunculan: {len(hits)} di {len(files)} berkas; " +
          ", ".join(f"{k} {counts.get(k, 0)}" for k in order))
    if hits:
        print("\n| Tingkat | Berkas:baris | Lokasi | Isi |")
        print("|---|---|---|---|")
        for h in sorted(hits, key=lambda x: (order[x["tingkat"]], x["file"], x["baris"])):
            if h["tingkat"] in ("SENDIRI", "SALINAN"):
                continue
            print(f"| {h['tingkat']} | {h['file']}:{h['baris']} | {h['lokasi']} | {h['isi'].replace('|', '/')} |")
    if counts.get("SALINAN"):
        print(f"\n{counts['SALINAN']} kemunculan ada di salinan aturan inti; cukup ubah sumbernya di _shared/ lalu jalankan sync.")
    if not args.ganti_nama:
        return 0
    new = args.ganti_nama
    target_folder = root / ".claude" / "skills" / new
    print(f"\nRencana ganti nama {args.nama} -> {new}:")
    print(f"  1. ganti teks di {len(files)} berkas ({len(hits)} kemunculan)")
    print(f"  2. ganti nama folder .claude/skills/{args.nama} -> .claude/skills/{new}" if folder.is_dir() else "  2. (tidak ada folder skill)")
    print("  3. jalankan ulang alat keluarga (sync, indeks, uji) dan kemas ulang dist/")
    if target_folder.exists():
        print(f"GAGAL: folder {target_folder} sudah ada; pilih nama lain.")
        return 1
    if not args.terapkan:
        print("Belum ada yang diubah. Tambahkan --terapkan setelah pemilik setuju.")
        return 0
    pat = re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(args.nama) + r"(?![A-Za-z0-9_-])")
    changed = []
    for rel in files:
        p = root / rel
        text = p.read_text(encoding="utf-8")
        new_text = pat.sub(new, text)
        if new_text != text:
            p.write_text(new_text, encoding="utf-8")
            changed.append(rel)
    if folder.is_dir():
        folder.rename(target_folder)
    print(f"Diterapkan: {len(changed)} berkas diubah" + (f", folder diganti nama ke {target_folder.relative_to(root)}" if target_folder.exists() else ""))
    for rel in changed:
        print(f"  - {rel}")
    return 0


if __name__ == "__main__":
    if hasattr(signal, "SIGPIPE"):
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # aman dipipa ke head
    sys.exit(main())
