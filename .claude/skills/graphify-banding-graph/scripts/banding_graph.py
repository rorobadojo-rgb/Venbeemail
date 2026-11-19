#!/usr/bin/env python3
"""Bandingkan dua versi graph graphify: node, edge, file sumber, dan komunitas.

Pakai:
  python3 banding_graph.py LAMA.json BARU.json [--maks 15] [--json]
  python3 banding_graph.py --rev HEAD~1 [--graph graphify-out/graph.json] [--akar .] [--maks 15] [--json]

Dengan --rev, versi lama diambil dari git (`git show REV:path`) dan versi baru dari disk.
Node dibandingkan per id, edge per (source, target, relation), komunitas per nama.
Kode keluar: 0 berhasil (ada atau tidak ada perbedaan), 1 masukan tidak bisa dibaca.
"""
import argparse
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path


def parse(text: str):
    g = json.loads(text)
    nodes = {n.get("id"): n for n in g.get("nodes", [])}
    links = g.get("links", g.get("edges", []))
    edges = {(e.get("source"), e.get("target"), e.get("relation")): e for e in links}
    return g, nodes, edges


def compare(old_text: str, new_text: str, limit: int):
    g_old, n_old, e_old = parse(old_text)
    g_new, n_new, e_new = parse(new_text)
    added_n = sorted(set(n_new) - set(n_old))
    removed_n = sorted(set(n_old) - set(n_new))
    added_e = sorted(set(e_new) - set(e_old), key=str)
    removed_e = sorted(set(e_old) - set(e_new), key=str)
    files_old = {n.get("source_file") for n in n_old.values() if n.get("source_file")}
    files_new = {n.get("source_file") for n in n_new.values() if n.get("source_file")}
    comm_old = Counter(str(n.get("community_name")) for n in n_old.values() if n.get("community") is not None)
    comm_new = Counter(str(n.get("community_name")) for n in n_new.values() if n.get("community") is not None)
    moved = [nid for nid in set(n_old) & set(n_new)
             if n_old[nid].get("community_name") != n_new[nid].get("community_name")]
    conf_old = Counter(e.get("confidence") for e in e_old.values())
    conf_new = Counter(e.get("confidence") for e in e_new.values())

    def label(nodes, nid):
        n = nodes.get(nid, {})
        return f"{n.get('label', nid)} [{n.get('source_file') or '-'}]"

    return {
        "ringkas": {
            "node": [len(n_old), len(n_new)], "edge": [len(e_old), len(e_new)],
            "komunitas": [len(comm_old), len(comm_new)], "file": [len(files_old), len(files_new)],
            "commit": [(g_old.get("built_at_commit") or "-")[:8], (g_new.get("built_at_commit") or "-")[:8]],
            "keyakinan_lama": dict(conf_old), "keyakinan_baru": dict(conf_new),
        },
        "node_baru": [label(n_new, x) for x in added_n[:limit]], "jumlah_node_baru": len(added_n),
        "node_hilang": [label(n_old, x) for x in removed_n[:limit]], "jumlah_node_hilang": len(removed_n),
        "edge_baru": [f"{n_new.get(s, {}).get('label', s)} -{r}-> {n_new.get(t, {}).get('label', t)}" for s, t, r in added_e[:limit]],
        "jumlah_edge_baru": len(added_e),
        "edge_hilang": [f"{n_old.get(s, {}).get('label', s)} -{r}-> {n_old.get(t, {}).get('label', t)}" for s, t, r in removed_e[:limit]],
        "jumlah_edge_hilang": len(removed_e),
        "file_baru": sorted(files_new - files_old)[:limit], "file_hilang": sorted(files_old - files_new)[:limit],
        "komunitas_baru": sorted(set(comm_new) - set(comm_old))[:limit],
        "komunitas_hilang": sorted(set(comm_old) - set(comm_new))[:limit],
        "node_pindah_komunitas": len(moved),
    }


def render(d) -> str:
    s = d["ringkas"]
    out = ["| Ukuran | Lama | Baru | Selisih |", "|---|---|---|---|"]
    for key in ("node", "edge", "komunitas", "file"):
        a, b = s[key]
        out.append(f"| {key} | {a} | {b} | {b - a:+d} |")
    out.append(f"| commit | {s['commit'][0]} | {s['commit'][1]} | |")
    out.append("")

    def block(title, items, total):
        if total:
            out.append(f"**{title}** ({total}):")
            out.extend(f"- {x}" for x in items)
            if total > len(items):
                out.append(f"- ... dan {total - len(items)} lagi")
            out.append("")

    block("Node baru", d["node_baru"], d["jumlah_node_baru"])
    block("Node hilang", d["node_hilang"], d["jumlah_node_hilang"])
    block("Edge baru", d["edge_baru"], d["jumlah_edge_baru"])
    block("Edge hilang", d["edge_hilang"], d["jumlah_edge_hilang"])
    block("File baru di graph", d["file_baru"], len(d["file_baru"]))
    block("File hilang dari graph", d["file_hilang"], len(d["file_hilang"]))
    block("Komunitas baru (nama)", d["komunitas_baru"], len(d["komunitas_baru"]))
    block("Komunitas hilang (nama)", d["komunitas_hilang"], len(d["komunitas_hilang"]))
    out.append(f"Node yang pindah komunitas: {d['node_pindah_komunitas']}")
    if not any((d["jumlah_node_baru"], d["jumlah_node_hilang"], d["jumlah_edge_baru"], d["jumlah_edge_hilang"])):
        out.append("Struktur graph sama persis (node dan edge).")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Bandingkan dua versi graph graphify.")
    ap.add_argument("lama", nargs="?", help="graph.json versi lama")
    ap.add_argument("baru", nargs="?", help="graph.json versi baru")
    ap.add_argument("--rev", help="ambil versi lama dari git, contoh HEAD~1")
    ap.add_argument("--graph", default="graphify-out/graph.json", help="path graph (dipakai bersama --rev)")
    ap.add_argument("--akar", default=".", help="akar repo git (dipakai bersama --rev)")
    ap.add_argument("--maks", type=int, default=15, help="contoh maksimal per daftar")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    try:
        if args.rev:
            root = Path(args.akar).resolve()
            gpath = Path(args.graph)
            rel = (gpath.resolve().relative_to(root)).as_posix()
            proc = subprocess.run(["git", "show", f"{args.rev}:{rel}"], cwd=root, capture_output=True, text=True)
            if proc.returncode != 0:
                print(f"GAGAL: git show {args.rev}:{rel} gagal: {proc.stderr.strip()}")
                return 1
            old_text, new_text = proc.stdout, gpath.read_text(encoding="utf-8")
        elif args.lama and args.baru:
            old_text = Path(args.lama).read_text(encoding="utf-8")
            new_text = Path(args.baru).read_text(encoding="utf-8")
        else:
            print("GAGAL: beri dua berkas (LAMA BARU) atau --rev REV.")
            return 1
        result = compare(old_text, new_text, args.maks)
    except (OSError, ValueError) as exc:
        print(f"GAGAL: graph tidak bisa dibaca: {exc}")
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=1) if args.json else render(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
