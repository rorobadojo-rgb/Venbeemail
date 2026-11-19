#!/usr/bin/env python3
"""Uji perjalanan pengguna: jalankan alur keluarga graphify dari ujung ke ujung di repo ini.

Pakai:  python3 keluarga-graphify/tools/uji_perjalanan.py [--simpan-log PATH]

Memakai CLI graphify asli dan semua skrip skill. Semua keluaran ditulis ke folder sementara, sehingga
graph utama (graphify-out/) dan folder kerja (graphify-kerja/) tidak berubah. Setiap langkah dicek
dengan syarat yang jelas, lalu diringkas LULUS atau GAGAL.
Kode keluar: 0 bila semua langkah lulus.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SK = ROOT / ".claude" / "skills"


def py(script, *args, cwd=ROOT):
    return subprocess.run([sys.executable, str(script), *map(str, args)], cwd=cwd, capture_output=True, text=True, timeout=600)


def gf(*args, cwd=ROOT):
    return subprocess.run(["graphify", *map(str, args)], cwd=cwd, capture_output=True, text=True, timeout=600)


def main():
    ap = argparse.ArgumentParser(description="Uji perjalanan keluarga skill graphify.")
    ap.add_argument("--simpan-log", help="simpan ringkasan langkah ke berkas ini")
    args = ap.parse_args()
    if not shutil.which("graphify"):
        print("GAGAL: CLI graphify tidak ada. Pasang dulu (skill graphify-pasang-cli).")
        return 1
    tmp = Path(tempfile.mkdtemp(prefix="perjalanan-graphify-"))
    korpus = tmp / "KRP-uji"
    g = korpus / "graphify-out" / "graph.json"
    results = []

    def step(name, ok, detail):
        results.append((name, bool(ok), detail))
        print(f"[{'LULUS' if ok else 'GAGAL'}] {name}: {detail}")

    try:
        r = py(SK / "graphify-diagnosa-lingkungan/scripts/cek_lingkungan.py", "--json")
        rows = {x["pemeriksaan"]: x["status"] for x in json.loads(r.stdout)}
        step("01 diagnosa lingkungan", rows.get("CLI graphify") == "OK", f"CLI {rows.get('CLI graphify')}, hook {rows.get('Hook asisten')}")

        r = py(SK / "graphify-penjaga-biaya/scripts/perkiraan_biaya.py", "docs", "--json")
        est = json.loads(r.stdout)
        step("02 perkiraan biaya docs/", est["butuh_izin"] and est["token_total"] > 0,
             f"{est['file']['document']} dokumen, ±{est['token_total']} token ({est['metode']})")

        r = gf("extract", ".", "--code-only", "--out", korpus)
        step("03 build graph kode ke folder korpus", r.returncode == 0 and g.exists(), (r.stdout + r.stderr).strip().splitlines()[-2][:120])
        r = gf("cluster-only", korpus, "--no-label")
        step("04 cluster-only --no-label", r.returncode == 0 and (g.parent / "GRAPH_REPORT.md").exists(), r.stdout.strip().splitlines()[-1][:120])

        r = py(SK / "graphify-namai-komunitas/scripts/namai_komunitas.py", "ringkas", "--graph", g, "--json")
        comms = json.loads(r.stdout)
        names = {str(c["id"]): f"Komunitas Uji {c['id']}" for c in comms}
        (tmp / "nama.json").write_text(json.dumps(names), encoding="utf-8")
        r = py(SK / "graphify-namai-komunitas/scripts/namai_komunitas.py", "tulis", "--nama", tmp / "nama.json", "--graph", g, "--terapkan")
        step("05 namai dan terapkan komunitas", r.returncode == 0, r.stdout.strip().splitlines()[-1][:120])

        r = py(SK / "graphify-audit-graph/scripts/audit_graph.py", "--graph", g, "--json", "--tulis", tmp / "audit.md")
        audit = json.loads(r.stdout.split("Laporan disimpan")[0])
        fails = [f for f in audit["temuan"] if f["tingkat"] == "GAGAL"]
        step("06 audit graph", r.returncode == 0 and not fails and audit["ringkas"]["komunitas_sementara"] == 0,
             f"{audit['ringkas']['node']} node, noise {audit['ringkas']['rasio_noise']:.1%}, {len(audit['temuan'])} temuan")

        r = py(SK / "graphify-banding-graph/scripts/banding_graph.py", ROOT / "graphify-out/graph.json", g, "--json")
        diff = json.loads(r.stdout)
        step("07 banding dengan graph utama", r.returncode == 0, f"node {diff['ringkas']['node']}, edge {diff['ringkas']['edge']}")

        reg = tmp / "register.csv"
        r1 = py(SK / "graphify-catatan-graph/scripts/catat_graph.py", "tambah", "--corpus-id", "KRP-uji", "--graph", g,
                "--lingkup", "uji perjalanan", "--mode", "kode", "--register", reg)
        r2 = py(SK / "graphify-catatan-graph/scripts/catat_graph.py", "periksa", "--register", reg, "--akar", ROOT)
        step("08 register catat dan periksa", r1.returncode == 0 and r2.returncode == 0 and "OK" in r2.stdout, r1.stdout.strip()[:120])

        q = gf("query", "generate email address", "--graph", g, "--budget", "500")
        p = gf("path", "Home()", "generateLocalPart()", "--graph", g)
        e = gf("explain", "GeneratorPanel()", "--graph", g)
        step("09 query, path, explain di graph korpus", q.returncode == 0 and p.returncode == 0 and e.returncode == 0,
             (p.stdout.strip().splitlines() or [""])[1][:100])

        r = gf("export", "wiki", "--graph", g)
        step("10 ekspor wiki", r.returncode == 0 and (g.parent / "wiki" / "index.md").exists(), r.stdout.strip().splitlines()[0][:120])

        mem = tmp / "memory"
        s1 = gf("save-result", "--question", "bagaimana alamat dibuat?", "--answer", "lewat generateLocalPart", "--type", "query",
                "--nodes", "generateLocalPart()", "--outcome", "useful", "--memory-dir", mem)
        s2 = gf("reflect", "--memory-dir", mem, "--out", tmp / "LESSONS.md", "--graph", g)
        step("11 memori jawaban dan refleksi", s1.returncode == 0 and s2.returncode == 0 and (tmp / "LESSONS.md").exists(),
             f"save-result {s1.returncode}, reflect {s2.returncode}")

        skill_dir = tmp / "KRP-skill"
        r = py(SK / "graphify-graph-skill/scripts/peta_skill.py", "--keluar", skill_dir, "--cluster")
        sg = skill_dir / "graphify-out" / "graph.json"
        e = gf("explain", "graphify-namai-komunitas", "--graph", sg)
        step("12 graph perpustakaan skill + explain", r.returncode == 0 and e.returncode == 0 and "graphify-audit-graph" in e.stdout,
             r.stdout.strip().splitlines()[1].strip()[:120])
        a = gf("affected", "graphify-pasang-cli", "--graph", sg, "--depth", "1")
        step("13 affected pada graph skill", a.returncode == 0 and "graphify-dirigen" in a.stdout,
             f"{sum(1 for l in a.stdout.splitlines() if l.startswith('- '))} skill bergantung pada graphify-pasang-cli")

        r = py(SK / "graphify-cari-tumpang-tindih-skill/scripts/cek_tumpang_tindih.py", "--awalan", "graphify-", "--lawan-semua", "--json")
        pairs = json.loads(r.stdout)
        step("14 tumpang tindih skill graphify", r.returncode == 0, f"{len(pairs)} pasangan di atas ambang")

        r = py(SK / "graphify-cari-celah-skill/scripts/cek_celah_skill.py", "--awalan", "graphify-", "--json")
        gaps = json.loads(r.stdout)
        step("15 celah skill graphify", r.returncode == 0 and not [x for x in gaps if x["tingkat"] == "GAGAL"],
             f"{len(gaps)} temuan, 0 GAGAL" if r.returncode == 0 else r.stdout[:120])

        r = py(SK / "graphify-dampak-ubah-skill/scripts/dampak_skill.py", "graphify-namai-komunitas", "--json")
        hits = json.loads(r.stdout)["kemunculan"]
        high = [h for h in hits if h["tingkat"] == "TINGGI"]
        step("16 dampak ubah skill", r.returncode == 0 and high, f"{len(hits)} kemunculan, {len(high)} TINGGI")

        r = py(SK / "graphify-peta-keluarga-skill/scripts/diagram_keluarga.py", "--indeks", ROOT / "keluarga-graphify/skill-index.json")
        step("17 diagram keluarga", r.returncode == 0 and "```mermaid" in r.stdout and "graphify_dirigen" in r.stdout,
             f"{r.stdout.count('-->')} panah serah terima, {r.stdout.count('-.->')} panah layanan")

        r = py(SK / "graphify-mode-always-on/scripts/bungkus_hook.py", "--periksa")
        step("18 hook asisten terbungkus", r.returncode == 0, r.stdout.strip()[:120])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    passed = sum(1 for _, ok, _ in results if ok)
    summary = f"Uji perjalanan: {passed} dari {len(results)} langkah lulus."
    print(summary)
    if args.simpan_log:
        lines = ["| Langkah | Hasil | Rincian |", "|---|---|---|"]
        lines += [f"| {n} | {'LULUS' if ok else 'GAGAL'} | {d.replace('|', '/')} |" for n, ok, d in results]
        Path(args.simpan_log).write_text("\n".join(lines + ["", summary, ""]), encoding="utf-8")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
