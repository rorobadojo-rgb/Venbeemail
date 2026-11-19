#!/usr/bin/env python3
"""Register graph: catat, tampilkan, dan periksa daftar graph yang pernah dibangun.

Pakai:
  python3 catat_graph.py tambah --corpus-id KRP-repo --graph graphify-out/graph.json \\
          --lingkup "kode repo tanpa gambar" --mode kode [--status aktif] [--biaya-token 0] [--catatan "..."]
  python3 catat_graph.py daftar
  python3 catat_graph.py periksa [--akar .]

Semua perintah menerima --register PATH (default graphify-kerja/register/graph-register.csv).
Angka node, edge, komunitas, commit, dan tanggal dibaca langsung dari graph.json, tidak diketik tangan.
`tambah` mengganti baris dengan corpus_id yang sama (upsert).
Kode keluar: 0 berhasil; 1 ada GAGAL (periksa) atau masukan tidak sah.
"""
import argparse
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_REGISTER = "graphify-kerja/register/graph-register.csv"
COLUMNS = ["corpus_id", "lokasi_graph", "lingkup", "mode", "dibangun", "commit", "node", "edge",
           "komunitas", "nama_komunitas", "biaya_token", "status", "catatan"]
MODES = {"kode", "lengkap", "dokumen", "skill", "gabungan", "lain"}
STATUSES = {"aktif", "usang", "arsip"}
ID_RE = re.compile(r"^KRP-[a-z0-9]+(?:-[a-z0-9]+)*$")
PLACEHOLDER = re.compile(r"^Community \d+$")


def graph_stats(path: Path) -> dict:
    g = json.loads(path.read_text(encoding="utf-8"))
    nodes = g.get("nodes", [])
    links = g.get("links", g.get("edges", []))
    comms = {}
    for n in nodes:
        c = n.get("community")
        if c is not None:
            comms.setdefault(c, set()).add(str(n.get("community_name") or f"Community {c}"))
    named = sum(1 for names in comms.values() if any(not PLACEHOLDER.match(x) for x in names))
    if not comms:
        label_state = "tidak ada"
    elif named == len(comms):
        label_state = "lengkap"
    elif named == 0:
        label_state = "belum"
    else:
        label_state = f"sebagian ({named}/{len(comms)})"
    built = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).strftime("%Y-%m-%d %H:%M")
    return {"node": str(len(nodes)), "edge": str(len(links)), "komunitas": str(len(comms)),
            "nama_komunitas": label_state, "commit": (g.get("built_at_commit") or "-")[:8], "dibangun": built}


def read_rows(reg: Path):
    if not reg.exists():
        return []
    with reg.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def write_rows(reg: Path, rows):
    reg.parent.mkdir(parents=True, exist_ok=True)
    with reg.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS, lineterminator="\n")
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k, "") for k in COLUMNS})


def cmd_tambah(args) -> int:
    if not ID_RE.match(args.corpus_id):
        print(f"GAGAL: corpus_id '{args.corpus_id}' tidak sah. Format: KRP-huruf-kecil-dan-angka, contoh KRP-repo.")
        return 1
    if args.mode not in MODES:
        print(f"GAGAL: mode '{args.mode}' tidak dikenal. Pilih: {', '.join(sorted(MODES))}.")
        return 1
    if args.status not in STATUSES:
        print(f"GAGAL: status '{args.status}' tidak dikenal. Pilih: {', '.join(sorted(STATUSES))}.")
        return 1
    gpath = Path(args.graph)
    if not gpath.exists():
        print(f"GAGAL: {gpath} tidak ada. Bangun graph dulu, lalu catat.")
        return 1
    try:
        stats = graph_stats(gpath)
    except (ValueError, OSError) as exc:
        print(f"GAGAL: {gpath} tidak bisa dibaca: {exc}")
        return 1
    reg = Path(args.register)
    rows = [r for r in read_rows(reg) if r.get("corpus_id") != args.corpus_id]
    row = {"corpus_id": args.corpus_id, "lokasi_graph": gpath.as_posix(), "lingkup": args.lingkup,
           "mode": args.mode, "biaya_token": str(args.biaya_token), "status": args.status,
           "catatan": args.catatan or ""}
    row.update(stats)
    rows.append(row)
    rows.sort(key=lambda r: r["corpus_id"])
    write_rows(reg, rows)
    print(f"Tercatat {args.corpus_id}: {stats['node']} node, {stats['edge']} edge, {stats['komunitas']} komunitas, "
          f"nama komunitas {stats['nama_komunitas']}, commit {stats['commit']} -> {reg}")
    return 0


def cmd_daftar(args) -> int:
    rows = read_rows(Path(args.register))
    if not rows:
        print("Register kosong atau belum ada.")
        return 0
    print("| corpus_id | mode | node | edge | komunitas | nama | commit | status | lokasi |")
    print("|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        print(f"| {r['corpus_id']} | {r['mode']} | {r['node']} | {r['edge']} | {r['komunitas']} | "
              f"{r['nama_komunitas']} | {r['commit']} | {r['status']} | {r['lokasi_graph']} |")
    return 0


def cmd_periksa(args) -> int:
    reg = Path(args.register)
    root = Path(args.akar)
    if not reg.exists():
        print(f"INFO: register belum ada ({reg}).")
        return 0
    with reg.open(encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        header = reader.fieldnames or []
        rows = list(reader)
    findings = []
    if header != COLUMNS:
        findings.append(("GAGAL", f"kolom register tidak sesuai. Harus: {','.join(COLUMNS)}"))
    seen = set()
    for r in rows:
        cid = r.get("corpus_id", "")
        if cid in seen:
            findings.append(("GAGAL", f"{cid}: corpus_id ganda"))
        seen.add(cid)
        if not ID_RE.match(cid):
            findings.append(("GAGAL", f"{cid}: corpus_id tidak sah"))
        if r.get("mode") not in MODES:
            findings.append(("GAGAL", f"{cid}: mode tidak dikenal '{r.get('mode')}'"))
        if r.get("status") not in STATUSES:
            findings.append(("GAGAL", f"{cid}: status tidak dikenal '{r.get('status')}'"))
        gpath = Path(r.get("lokasi_graph", ""))
        if not gpath.is_absolute():
            gpath = root / gpath
        if r.get("status") == "arsip":
            continue
        if not gpath.exists():
            findings.append(("PERINGATAN", f"{cid}: graph tidak ditemukan di {r.get('lokasi_graph')}"))
            continue
        try:
            now = graph_stats(gpath)
        except (ValueError, OSError):
            findings.append(("GAGAL", f"{cid}: graph tidak bisa dibaca"))
            continue
        diff = [k for k in ("node", "edge", "komunitas", "commit", "nama_komunitas") if str(r.get(k)) != now[k]]
        if diff:
            detail = ", ".join(f"{k} {r.get(k)} -> {now[k]}" for k in diff)
            findings.append(("PERINGATAN", f"{cid}: register tertinggal ({detail}); jalankan 'tambah' lagi"))
    if not findings:
        print(f"OK: {len(rows)} baris register cocok dengan graph di disk.")
        return 0
    for level, msg in findings:
        print(f"{level}: {msg}")
    return 1 if any(level == "GAGAL" for level, _ in findings) else 0


def main():
    ap = argparse.ArgumentParser(description="Register graph keluarga graphify.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("tambah", help="catat atau perbarui satu graph")
    t.add_argument("--corpus-id", required=True)
    t.add_argument("--graph", required=True, help="path graph.json")
    t.add_argument("--lingkup", required=True, help="apa saja isi graph ini, satu kalimat")
    t.add_argument("--mode", required=True, help="kode|lengkap|dokumen|skill|gabungan|lain")
    t.add_argument("--status", default="aktif", help="aktif|usang|arsip")
    t.add_argument("--biaya-token", default=0, type=int, help="token yang dipakai saat build (0 bila AST saja)")
    t.add_argument("--catatan", default="")
    d = sub.add_parser("daftar", help="tampilkan register")
    p = sub.add_parser("periksa", help="cocokkan register dengan graph di disk")
    p.add_argument("--akar", default=".", help="akar repo untuk path relatif")
    for parser in (t, d, p):
        parser.add_argument("--register", default=DEFAULT_REGISTER)
    args = ap.parse_args()
    return {"tambah": cmd_tambah, "daftar": cmd_daftar, "periksa": cmd_periksa}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
