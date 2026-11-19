#!/usr/bin/env python3
"""Bangun graph perpustakaan skill dalam format graph.json graphify, tanpa LLM dan tanpa biaya token.

Pakai:  python3 peta_skill.py [--skills .claude/skills] [--indeks auto] [--keluar graphify-kerja/graph/KRP-skill]
                              [--tanpa-keluarga] [--sertakan-inti] [--cluster]

Node : skill (dari SKILL.md), file pendukung (references/, assets/, scripts/), dan keluarga skill.
Edge : contains   keluarga -> skill, skill -> file miliknya
       references skill -> skill lain yang namanya disebut di SKILL.md
       uses       skill -> file miliknya yang disebut di SKILL.md; juga "uses" dari skill-index.json
       hands_off_to skill -> skill berikutnya menurut "next" di skill-index.json
Semua edge EXTRACTED (dibaca langsung dari teks), keyakinan 1,0.
--indeks auto mencari semua skill-index.json di akar repo (misalnya keluarga-graphify/ dan
studio-wall-art-by-nangka/); keluarga diambil dari "system" di indeks, sisanya dari awalan nama.
--cluster menjalankan `graphify cluster-only <keluar> --no-label` sesudahnya (butuh CLI graphify).
Hasil: <keluar>/graphify-out/graph.json, bisa ditanya dengan graphify explain/path/query --graph.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

SHARED_CORES = {"graphify-core.md", "studio-core.md"}
CODE_SUFFIX = {".py", ".sh", ".js", ".mjs", ".ts"}


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def frontmatter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    data = {}
    if not m:
        return data
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            key, value = line.split(":", 1)
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                value = value[1:-1]
            data[key.strip()] = value
    return data


def find_indexes(root: Path, spec):
    if spec != ["auto"]:
        return [Path(p) for p in spec]
    found = []
    for p in sorted(root.glob("*/skill-index.json")):
        if "node_modules" not in p.parts:
            found.append(p)
    return found


def family_of(name: str, index_family: dict) -> str:
    if name in index_family:
        return index_family[name]
    head = name.split("-")[0]
    return f"awalan {head}" if "-" in name else name


def build(skills_dir: Path, root: Path, indexes, with_family: bool, include_core: bool):
    skill_dirs = sorted(p.parent for p in skills_dir.glob("*/SKILL.md") if not p.parent.name.startswith("."))
    names = [d.name for d in skill_dirs]
    hyphenated = [n for n in names if "-" in n]
    patterns = {n: re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(n) + r"(?![A-Za-z0-9_-])") for n in hyphenated}

    index_family, index_next, index_uses, index_role, index_group = {}, {}, {}, {}, {}
    for idx in indexes:
        try:
            data = json.loads(idx.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        system = data.get("system") or idx.parent.name
        for s in data.get("skills", []):
            index_family[s["name"]] = system
            index_next[s["name"]] = list(s.get("next", []))
            index_uses[s["name"]] = list(s.get("uses", []))
            index_role[s["name"]] = s.get("role")
            index_group[s["name"]] = f"{s.get('group')}: {data.get('groups', {}).get(s.get('group'), '')}"

    nodes, links = [], []

    def rel(p: Path) -> str:
        try:
            return p.relative_to(root).as_posix()
        except ValueError:
            return p.as_posix()

    def link(src, dst, relation, source_file, line=None, weight=1.0):
        e = {"source": src, "target": dst, "relation": relation, "confidence": "EXTRACTED",
             "confidence_score": 1.0, "source_file": source_file, "weight": weight}
        if line:
            e["source_location"] = f"L{line}"
        links.append(e)

    families = {}
    for d in skill_dirs:
        text = (d / "SKILL.md").read_text(encoding="utf-8", errors="replace")
        fm = frontmatter(text)
        sid = "skill_" + slug(d.name)
        fam = family_of(d.name, index_family)
        families.setdefault(fam, []).append(sid)
        meta = {"keluarga": fam, "baris": len(text.splitlines()), "deskripsi": fm.get("description", "")[:300]}
        if d.name in index_role:
            meta["peran"] = index_role[d.name]
            meta["kelompok"] = index_group[d.name]
        nodes.append({"id": sid, "label": d.name, "file_type": "document", "source_file": rel(d / "SKILL.md"),
                      "source_location": "L1", "metadata": meta})
        lines = text.splitlines()
        for other, pat in patterns.items():
            if other == d.name:
                continue
            hits = [i + 1 for i, line in enumerate(lines) if pat.search(line)]
            if hits:
                link(sid, "skill_" + slug(other), "references", rel(d / "SKILL.md"), hits[0], float(len(hits)))
        for sub in ("references", "assets", "scripts"):
            folder = d / sub
            if not folder.is_dir():
                continue
            for f in sorted(p for p in folder.rglob("*") if p.is_file() and "__pycache__" not in p.parts):
                if f.name in SHARED_CORES and not include_core:
                    continue
                relpath = f"{sub}/{f.relative_to(folder).as_posix()}"
                fid = "file_" + slug(d.name + "_" + relpath)
                mentioned = relpath in text
                nodes.append({"id": fid, "label": f"{d.name}/{relpath}",
                              "file_type": "code" if f.suffix in CODE_SUFFIX else "document",
                              "source_file": rel(f), "source_location": "L1",
                              "metadata": {"milik": d.name, "disebut_di_skill": mentioned}})
                link(sid, fid, "contains", rel(d / "SKILL.md"))
                if mentioned:
                    line_no = next((i + 1 for i, line in enumerate(lines) if relpath in line), None)
                    link(sid, fid, "uses", rel(d / "SKILL.md"), line_no)
        for nxt in index_next.get(d.name, []):
            if nxt in names:
                link(sid, "skill_" + slug(nxt), "hands_off_to", rel(d / "SKILL.md"))
        for use in index_uses.get(d.name, []):
            if use in names:
                link(sid, "skill_" + slug(use), "uses", rel(d / "SKILL.md"))

    if with_family:
        for fam, members in sorted(families.items()):
            if len(members) < 2:
                continue
            fid = "family_" + slug(fam)
            nodes.append({"id": fid, "label": f"Keluarga: {fam}", "file_type": "concept", "source_file": "",
                          "metadata": {"anggota": len(members)}})
            for sid in members:
                link(fid, sid, "contains", "")

    graph = {"directed": True, "multigraph": False,
             "graph": {"schema_version": 1, "graphify_version": "0.9.112", "dibuat_oleh": "peta_skill.py"},
             "nodes": nodes, "links": links, "hyperedges": []}
    return graph, families


def main():
    ap = argparse.ArgumentParser(description="Bangun graph perpustakaan skill (format graphify), tanpa LLM.")
    ap.add_argument("--skills", default=".claude/skills", help="folder berisi folder-folder skill")
    ap.add_argument("--akar", default=".", help="akar repo (untuk path relatif dan pencarian indeks)")
    ap.add_argument("--indeks", nargs="*", default=["auto"], help="skill-index.json; 'auto' mencari di akar repo")
    ap.add_argument("--keluar", default="graphify-kerja/graph/KRP-skill", help="folder korpus; graph ditulis ke <keluar>/graphify-out/")
    ap.add_argument("--tanpa-keluarga", action="store_true", help="jangan buat node keluarga")
    ap.add_argument("--sertakan-inti", action="store_true", help="ikutkan salinan aturan inti (graphify-core.md, studio-core.md)")
    ap.add_argument("--cluster", action="store_true", help="jalankan graphify cluster-only --no-label sesudahnya")
    args = ap.parse_args()
    root = Path(args.akar).resolve()
    skills_dir = Path(args.skills)
    if not skills_dir.is_absolute():
        skills_dir = root / skills_dir
    if not skills_dir.is_dir():
        print(f"GAGAL: folder skill {skills_dir} tidak ada.")
        return 1
    indexes = find_indexes(root, args.indeks)
    graph, families = build(skills_dir, root, indexes, not args.tanpa_keluarga, args.sertakan_inti)
    out_dir = Path(args.keluar)
    if not out_dir.is_absolute():
        out_dir = root / out_dir
    target = out_dir / "graphify-out" / "graph.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(graph, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    rel_counts = {}
    for e in graph["links"]:
        rel_counts[e["relation"]] = rel_counts.get(e["relation"], 0) + 1
    skills = sum(1 for n in graph["nodes"] if n["id"].startswith("skill_"))
    files = sum(1 for n in graph["nodes"] if n["id"].startswith("file_"))
    print(f"Graph skill ditulis: {target}")
    fams = sum(1 for members in families.values() if len(members) >= 2)
    print(f"  {skills} skill, {files} file pendukung, {fams} keluarga (2+ skill), {len(graph['links'])} edge")
    print("  edge per relasi: " + ", ".join(f"{k} {v}" for k, v in sorted(rel_counts.items())))
    print("  indeks dipakai: " + (", ".join(p.as_posix() for p in indexes) or "-"))
    if args.cluster:
        exe = shutil.which("graphify")
        if not exe:
            print("PERINGATAN: graphify tidak ada di PATH; cluster dilewati (graph.json tetap bisa ditanya setelah CLI dipasang).")
            return 0
        proc = subprocess.run([exe, "cluster-only", str(out_dir), "--no-label"], capture_output=True, text=True)
        tail = (proc.stdout + proc.stderr).strip().splitlines()[-1:] or [""]
        print(f"  cluster-only: {'berhasil' if proc.returncode == 0 else 'gagal'} - {tail[0]}")
        if proc.returncode != 0:
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
