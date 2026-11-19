#!/usr/bin/env python3
"""Audit kesehatan sebuah graph graphify. Hanya membaca graph.json (dan git bila ada).

Pakai:  python3 audit_graph.py [--graph graphify-out/graph.json] [--akar .] [--ambang-noise 0.05]
                               [--json] [--tulis graphify-kerja/audit/KRP-repo-20261119.md]

Temuan dan tingkatnya:
  GAGAL      graph kosong, atau ada node dari path sensitif (pelanggan, .env, kunci, rahasia)
  PERINGATAN noise nama satu-dua huruf di atas ambang, file .min. ikut masuk, komunitas bernama
             sementara ("Community N" atau nama cadangan dari hub), graph tertinggal dari HEAD untuk
             file yang ada di graph
  INFO       edge INFERRED yang mencurigakan (nama sama di folder puncak berbeda), edge AMBIGUOUS,
             komunitas tipis (<3 node), node tanpa koneksi
Kode keluar: 1 bila ada GAGAL, selain itu 0. Keputusan lulus atau tidak dibuat graphify-gerbang-mutu.
"""
import argparse
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

SENSITIVE = re.compile(r"(^|/)(pelanggan|customers?|secrets?|credentials?|private)(/|$)|(^|/)\.env($|\.)|"
                       r"id_rsa|\.pem$|\.key$|\.p12$", re.IGNORECASE)
PLACEHOLDER = re.compile(r"^Community \d+$")
SHORT = re.compile(r"^[A-Za-z_$]{1,2}$")


def core_label(label: str) -> str:
    s = str(label).strip()
    s = re.sub(r"\(\)$", "", s)
    return s.lstrip(".")


def git(args, cwd):
    try:
        proc = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=60)
        return proc.stdout.strip() if proc.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def audit(graph_path: Path, root: Path, noise_threshold: float):
    g = json.loads(graph_path.read_text(encoding="utf-8"))
    nodes = g.get("nodes", [])
    links = g.get("links", g.get("edges", []))
    by_id = {n.get("id"): n for n in nodes}
    findings = []

    def add(level, text, fix="-"):
        findings.append({"tingkat": level, "temuan": text, "perbaikan": fix})

    if not nodes:
        add("GAGAL", "graph kosong (0 node)", "graphify-atasi-masalah")
        return {"ringkas": {"node": 0, "edge": 0}, "temuan": findings}

    degree = Counter()
    for e in links:
        degree[e.get("source")] += 1
        degree[e.get("target")] += 1
    conf = Counter(e.get("confidence", "?") for e in links)
    relations = Counter(e.get("relation", "?") for e in links)
    files = Counter(n.get("source_file") for n in nodes if n.get("source_file"))
    comms = defaultdict(list)
    for n in nodes:
        if n.get("community") is not None:
            comms[int(n["community"])].append(n)

    # Path sensitif
    sens = sorted({n.get("source_file") for n in nodes if n.get("source_file") and SENSITIVE.search(n["source_file"])})
    if sens:
        add("GAGAL", f"{len(sens)} file dari path sensitif masuk graph, contoh: {', '.join(sens[:3])}",
            "graphify-atur-pengecualian, lalu bangun ulang dengan --force")

    # Noise nama pendek dan file minified
    short = [n for n in nodes if n.get("file_type") == "code" and SHORT.match(core_label(n.get("label", "")))]
    share = len(short) / len(nodes)
    short_files = Counter(n.get("source_file") or "-" for n in short).most_common(5)
    if share > noise_threshold:
        add("PERINGATAN", f"{len(short)} node ({share:.0%}) bernama satu-dua huruf, terbanyak dari: "
            + ", ".join(f"{f} ({k})" for f, k in short_files), "graphify-atur-pengecualian")
    minified = sorted(f for f in files if ".min." in f)
    if minified:
        add("PERINGATAN", f"{len(minified)} file minified ikut masuk: {', '.join(minified[:4])}",
            "tambahkan *.min.js ke .graphifyignore (graphify-atur-pengecualian)")

    # Nama komunitas ("Community N" atau nama cadangan dari hub yang belum ditinjau)
    pending = {}
    pfile = graph_path.parent / ".graphify_labels.pending.json"
    if pfile.exists():
        try:
            pending = {int(k): v for k, v in json.loads(pfile.read_text(encoding="utf-8")).items()}
        except (ValueError, OSError):
            pending = {}
    placeholder = sorted(cid for cid, ms in comms.items()
                         if PLACEHOLDER.match(str(ms[0].get("community_name") or f"Community {cid}"))
                         or pending.get(cid) == ms[0].get("community_name"))
    if placeholder:
        add("PERINGATAN", f"{len(placeholder)} dari {len(comms)} komunitas masih bernama sementara",
            "graphify-namai-komunitas")
    thin = sorted(cid for cid, ms in comms.items() if len(ms) < 3)
    if thin:
        add("INFO", f"{len(thin)} komunitas tipis (<3 node): {', '.join(map(str, thin[:10]))}")

    # Edge tebakan yang mencurigakan
    suspicious = []
    for e in links:
        if e.get("confidence") != "INFERRED":
            continue
        a, b = by_id.get(e.get("source")), by_id.get(e.get("target"))
        if not a or not b:
            continue
        fa, fb = a.get("source_file") or "", b.get("source_file") or ""
        if fa and fb and fa.split("/")[0] != fb.split("/")[0]:
            if core_label(a.get("label", "")).lower() == core_label(b.get("label", "")).lower() or len(core_label(b.get("label", ""))) <= 2:
                suspicious.append(f"{a.get('label')} ({fa}) -{e.get('relation')}-> {b.get('label')} ({fb})")
    cross_inferred = [e for e in links if e.get("confidence") == "INFERRED"
                      and (by_id.get(e.get("source"), {}).get("source_file") or "").split("/")[0]
                      != (by_id.get(e.get("target"), {}).get("source_file") or "").split("/")[0]]
    if suspicious:
        add("INFO", f"{len(suspicious)} edge INFERRED menyambung nama sama/pendek antarfolder puncak, contoh: "
            + "; ".join(suspicious[:3]), "verifikasi baris sumber sebelum dipakai (label HIPOTESIS)")
    elif cross_inferred:
        examples = []
        for e in cross_inferred[:3]:
            a, b = by_id.get(e.get("source"), {}), by_id.get(e.get("target"), {})
            examples.append(f"{a.get('label')} ({a.get('source_file')}) -{e.get('relation')}-> "
                            f"{b.get('label')} ({b.get('source_file')})")
        add("INFO", f"{len(cross_inferred)} edge INFERRED menyeberang folder puncak, contoh: " + "; ".join(examples),
            "verifikasi baris sumber sebelum dipakai (label HIPOTESIS)")
    if conf.get("AMBIGUOUS"):
        add("INFO", f"{conf['AMBIGUOUS']} edge AMBIGUOUS perlu ditinjau manusia")

    isolates = [n for n in nodes if degree[n.get("id")] == 0]
    if isolates:
        add("INFO", f"{len(isolates)} node tanpa koneksi")

    # Kesegaran
    built = g.get("built_at_commit")
    head = git(["rev-parse", "HEAD"], root)
    stale_files = []
    if built and head and not head.startswith(built) and not built.startswith(head):
        changed = (git(["diff", "--name-only", built, "HEAD"], root) or "").splitlines()
        in_graph = set(files)
        stale_files = [f for f in changed if f in in_graph]
        if stale_files:
            add("PERINGATAN", f"graph dibangun dari {built[:8]}, HEAD {head[:8]}; {len(stale_files)} file di graph "
                f"sudah berubah, contoh: {', '.join(stale_files[:3])}", "graphify-perbarui-graph")

    summary = {
        "graph": str(graph_path), "node": len(nodes), "edge": len(links), "komunitas": len(comms),
        "file_sumber": len(files), "keyakinan": dict(conf), "relasi_teratas": relations.most_common(8),
        "file_teratas": files.most_common(8), "noise_pendek": len(short), "rasio_noise": round(share, 4),
        "inferred_antarfolder": len(cross_inferred), "komunitas_sementara": len(placeholder),
        "komunitas_tipis": len(thin), "node_terisolasi": len(isolates), "dibangun_dari": (built or "-")[:8],
        "head": (head or "-")[:8], "file_berubah_di_graph": len(stale_files),
    }
    return {"ringkas": summary, "temuan": findings}


def render(result) -> str:
    s = result["ringkas"]
    lines = [f"# Audit graph: {s.get('graph', '-')}", ""]
    lines += ["| Ukuran | Nilai |", "|---|---|"]
    for key in ("node", "edge", "komunitas", "file_sumber", "noise_pendek", "inferred_antarfolder",
                "komunitas_sementara", "komunitas_tipis", "node_terisolasi", "dibangun_dari", "head",
                "file_berubah_di_graph"):
        if key in s:
            lines.append(f"| {key} | {s[key]} |")
    if s.get("keyakinan"):
        total = sum(s["keyakinan"].values()) or 1
        lines += ["", "Keyakinan edge: " + ", ".join(f"{k} {v} ({v / total:.0%})" for k, v in sorted(s["keyakinan"].items()))]
    if s.get("file_teratas"):
        lines += ["", "File penyumbang node terbanyak: " + ", ".join(f"{f} ({k})" for f, k in s["file_teratas"])]
    lines += ["", "## Temuan", ""]
    if not result["temuan"]:
        lines.append("Tidak ada temuan.")
    else:
        lines += ["| Tingkat | Temuan | Perbaikan |", "|---|---|---|"]
        for f in result["temuan"]:
            lines.append(f"| {f['tingkat']} | {f['temuan']} | {f['perbaikan']} |")
    counts = Counter(f["tingkat"] for f in result["temuan"])
    lines += ["", f"Ringkas: {counts.get('GAGAL', 0)} GAGAL, {counts.get('PERINGATAN', 0)} PERINGATAN, "
              f"{counts.get('INFO', 0)} INFO. Keputusan lulus dibuat graphify-gerbang-mutu (G2/G3).", ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="Audit kesehatan graph graphify.")
    ap.add_argument("--graph", default="graphify-out/graph.json")
    ap.add_argument("--akar", default=".", help="akar repo git untuk cek kesegaran")
    ap.add_argument("--ambang-noise", type=float, default=0.05, help="rasio node nama pendek yang ditoleransi")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--tulis", help="simpan laporan Markdown ke path ini")
    args = ap.parse_args()
    gpath = Path(args.graph)
    if not gpath.exists():
        print(f"GAGAL: {gpath} tidak ada.")
        return 1
    try:
        result = audit(gpath, Path(args.akar).resolve(), args.ambang_noise)
    except ValueError as exc:
        print(f"GAGAL: graph.json tidak sah: {exc}")
        return 1
    text = render(result)
    if args.tulis:
        out = Path(args.tulis)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=1) if args.json else text)
    if args.tulis:
        print(f"Laporan disimpan: {args.tulis}")
    return 1 if any(f["tingkat"] == "GAGAL" for f in result["temuan"]) else 0


if __name__ == "__main__":
    sys.exit(main())
