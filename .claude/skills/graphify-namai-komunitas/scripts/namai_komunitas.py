#!/usr/bin/env python3
"""Ringkas komunitas graph untuk diberi nama, lalu tulis dan terapkan nama itu tanpa LLM graphify.

Pakai:
  python3 namai_komunitas.py ringkas [--graph graphify-out/graph.json] [--contoh 8] [--json]
  python3 namai_komunitas.py tulis --nama nama.json [--graph graphify-out/graph.json] [--ganti-semua] [--terapkan]

ringkas  : tiap komunitas -> ukuran, nama sekarang, sementara atau tidak ("Community N" atau nama
           cadangan dari hub di .graphify_labels.pending.json), file sumber terbanyak, node paling terhubung.
tulis    : nama.json berisi {"0": "Generator Alamat Email", ...}. Nama diperiksa (2-6 kata, maks 40
           karakter, unik, bukan "Community N", id komunitas harus ada), lalu digabung ke
           <folder graph>/.graphify_labels.json (nama lama yang tidak diganti tetap dipakai).
--terapkan: menjalankan `graphify cluster-only <akar korpus> --no-label` agar nama masuk ke graph.json,
           GRAPH_REPORT.md, dan graph.html, lalu memeriksa nama yang benar-benar terpasang.
Kode keluar: 0 berhasil, 1 nama tidak sah atau penerapan tidak cocok, 2 graphify tidak ada.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

PLACEHOLDER = re.compile(r"^Community \d+$")


def load(graph_path: Path):
    g = json.loads(graph_path.read_text(encoding="utf-8"))
    return g, g.get("nodes", []), g.get("links", g.get("edges", []))


def pending_names(graph_path: Path) -> dict:
    """Nama cadangan dari hub yang ditulis graphify saat komunitas berubah (belum ditinjau)."""
    f = graph_path.parent / ".graphify_labels.pending.json"
    try:
        return {int(k): v for k, v in json.loads(f.read_text(encoding="utf-8")).items()} if f.exists() else {}
    except (ValueError, OSError):
        return {}


def is_temporary(cid: int, name: str, pending: dict) -> bool:
    return bool(PLACEHOLDER.match(name)) or pending.get(cid) == name


def summarize(graph_path: Path, sample: int):
    _, nodes, links = load(graph_path)
    pending = pending_names(graph_path)
    degree = Counter()
    for e in links:
        degree[e.get("source")] += 1
        degree[e.get("target")] += 1
    groups = defaultdict(list)
    for n in nodes:
        if n.get("community") is not None:
            groups[int(n["community"])].append(n)
    out = []
    for cid in sorted(groups):
        members = groups[cid]
        files = Counter(m.get("source_file") or "-" for m in members)
        top = sorted(members, key=lambda m: degree[m.get("id")], reverse=True)[:sample]
        names = Counter(str(m.get("community_name") or f"Community {cid}") for m in members)
        current = names.most_common(1)[0][0]
        out.append({
            "id": cid, "ukuran": len(members), "nama_sekarang": current,
            "sementara": is_temporary(cid, current, pending),
            "file_teratas": [f"{f} ({k})" for f, k in files.most_common(3)],
            "node_teratas": [str(m.get("label")) for m in top],
        })
    return out


def validate(names: dict, existing_ids: set):
    errors, clean = [], {}
    seen = {}
    for key, value in names.items():
        try:
            cid = int(key)
        except (TypeError, ValueError):
            errors.append(f"kunci '{key}' bukan angka id komunitas")
            continue
        name = " ".join(str(value).split())
        if cid not in existing_ids:
            errors.append(f"komunitas {cid} tidak ada di graph")
        if PLACEHOLDER.match(name):
            errors.append(f"komunitas {cid}: '{name}' adalah nama sementara, bukan nama")
        words = name.split()
        if not 2 <= len(words) <= 6:
            errors.append(f"komunitas {cid}: '{name}' harus 2-6 kata (sekarang {len(words)})")
        if len(name) > 40:
            errors.append(f"komunitas {cid}: '{name}' lebih dari 40 karakter")
        low = name.lower()
        if low in seen:
            errors.append(f"komunitas {cid}: nama '{name}' sama dengan komunitas {seen[low]}")
        seen[low] = cid
        clean[cid] = name
    return errors, clean


def cmd_ringkas(args) -> int:
    rows = summarize(Path(args.graph), args.contoh)
    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
        return 0
    print(f"Komunitas di {args.graph}: {len(rows)}\n")
    print("| id | ukuran | nama sekarang | sementara? | file teratas | node teratas |")
    print("|---|---|---|---|---|---|")
    for r in rows:
        print(f"| {r['id']} | {r['ukuran']} | {r['nama_sekarang']} | {'ya' if r['sementara'] else '-'} | "
              f"{'; '.join(r['file_teratas'])} | {', '.join(r['node_teratas'])} |")
    temporary = [str(r["id"]) for r in rows if r["sementara"]]
    print(f"\nMasih bernama sementara (\"Community N\" atau nama cadangan dari hub): {len(temporary)} dari {len(rows)} komunitas"
          + (f": {', '.join(temporary)}" if temporary else "."))
    return 0


def cmd_tulis(args) -> int:
    graph_path = Path(args.graph)
    _, nodes, _ = load(graph_path)
    ids = {int(n["community"]) for n in nodes if n.get("community") is not None}
    try:
        names = json.loads(Path(args.nama).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"GAGAL: {args.nama} tidak bisa dibaca sebagai JSON: {exc}")
        return 1
    if not isinstance(names, dict) or not names:
        print("GAGAL: isi nama harus objek JSON {\"id\": \"nama\"} yang tidak kosong.")
        return 1
    errors, clean = validate(names, ids)
    if errors:
        print("GAGAL: nama tidak sah, tidak ada yang ditulis.")
        for e in errors:
            print(" -", e)
        return 1
    labels_path = graph_path.parent / ".graphify_labels.json"
    merged = {}
    if labels_path.exists() and not args.ganti_semua:
        try:
            old = json.loads(labels_path.read_text(encoding="utf-8"))
            merged = {int(k): v for k, v in old.items()
                      if isinstance(v, str) and not PLACEHOLDER.match(v) and int(k) in ids}
        except (ValueError, OSError):
            merged = {}
    merged.update(clean)
    pending_file = graph_path.parent / ".graphify_labels.pending.json"
    if pending_file.exists():
        try:
            pend = json.loads(pending_file.read_text(encoding="utf-8"))
            left = {k: v for k, v in pend.items() if int(k) not in clean}
            pending_file.write_text(json.dumps(left, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        except (ValueError, OSError):
            pass
    labels_path.write_text(json.dumps({str(k): merged[k] for k in sorted(merged)}, ensure_ascii=False, indent=1) + "\n",
                           encoding="utf-8")
    missing = sorted(ids - set(merged))
    print(f"Ditulis {len(clean)} nama baru; total {len(merged)} dari {len(ids)} komunitas bernama -> {labels_path}")
    if missing:
        print(f"Belum bernama ({len(missing)}): {', '.join(map(str, missing[:20]))}{' ...' if len(missing) > 20 else ''}")
    if not args.terapkan:
        root = graph_path.parent.parent
        print(f"Langkah berikut: graphify cluster-only {root.as_posix()} --no-label")
        return 0
    graphify = shutil.which("graphify")
    if not graphify:
        print("GAGAL: graphify tidak ada di PATH; nama sudah tertulis tetapi belum diterapkan.")
        return 2
    root = graph_path.parent.parent
    proc = subprocess.run([graphify, "cluster-only", str(root), "--no-label"], capture_output=True, text=True)
    if proc.returncode != 0:
        print("GAGAL: cluster-only gagal:\n" + (proc.stderr or proc.stdout)[-800:])
        return 1
    _, nodes_after, _ = load(graph_path)
    applied = {}
    for n in nodes_after:
        if n.get("community") is not None:
            applied.setdefault(int(n["community"]), str(n.get("community_name")))
    mismatch = {cid: (name, applied.get(cid)) for cid, name in clean.items() if applied.get(cid) != name}
    if mismatch:
        print("PERINGATAN: sebagian nama tidak terpasang (anggota komunitas berubah saat cluster ulang):")
        for cid, (want, got) in sorted(mismatch.items()):
            print(f" - {cid}: diminta '{want}', terpasang '{got}'")
        print("Jalankan 'ringkas' lagi, lalu beri nama ulang komunitas tersebut.")
        return 1
    print(f"Diterapkan: {len(clean)} nama terpasang di graph.json, GRAPH_REPORT.md, dan graph.html.")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Ringkas, tulis, dan terapkan nama komunitas graph.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("ringkas", help="ringkasan komunitas untuk diberi nama")
    r.add_argument("--contoh", type=int, default=8, help="jumlah node teratas per komunitas")
    r.add_argument("--json", action="store_true")
    t = sub.add_parser("tulis", help="tulis nama dari berkas JSON")
    t.add_argument("--nama", required=True, help='berkas JSON {"id": "nama"}')
    t.add_argument("--ganti-semua", action="store_true", help="buang nama lama yang tidak ada di berkas")
    t.add_argument("--terapkan", action="store_true", help="jalankan graphify cluster-only --no-label lalu verifikasi")
    for p in (r, t):
        p.add_argument("--graph", default="graphify-out/graph.json")
    args = ap.parse_args()
    if not Path(args.graph).exists():
        print(f"GAGAL: {args.graph} tidak ada.")
        return 1
    return cmd_ringkas(args) if args.cmd == "ringkas" else cmd_tulis(args)


if __name__ == "__main__":
    sys.exit(main())
