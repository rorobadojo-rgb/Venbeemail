#!/usr/bin/env python3
"""Periksa kesiapan lingkungan graphify di sebuah repo. Hanya membaca; tidak mengubah apa pun.

Pakai:  python3 cek_lingkungan.py [--akar .] [--versi 0.9.112] [--json]

Yang diperiksa:
  CLI graphify dan versinya, extra yang terpasang, skill resmi, graph utama dan kesegarannya
  terhadap HEAD git, nama komunitas, aturan always-on, hook asisten dan pembungkus amannya,
  .graphifyignore dan .graphifyrc, hook git, register graph, serta backend LLM yang terdeteksi
  (hanya nama variabel, nilainya tidak pernah dibaca).

Kode keluar: 0 bila tidak ada GAGAL, 1 bila ada.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

EXTRAS = {
    "mcp": "mcp", "watch": "watchdog", "pdf": "pypdf", "office": "docx",
    "svg": "matplotlib", "sql": "tree_sitter_sql", "video": "faster_whisper",
    "leiden": "graspologic_native",
}
BACKEND_VARS = ["GEMINI_API_KEY", "GOOGLE_API_KEY", "MOONSHOT_API_KEY", "ANTHROPIC_API_KEY",
                "OPENAI_API_KEY", "DEEPSEEK_API_KEY", "AZURE_OPENAI_API_KEY", "OLLAMA_BASE_URL"]
WRAP = "command -v graphify"
CODE_EXT = {".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".go", ".rs", ".java", ".rb", ".php",
            ".cs", ".kt", ".swift", ".c", ".h", ".cpp", ".hpp", ".sh", ".sql", ".yml", ".yaml", ".toml",
            ".json", ".lua", ".dart", ".scala", ".zig", ".ex", ".exs", ".jl", ".r", ".ps1"}


def run(cmd, cwd=None, timeout=60):
    try:
        proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return proc.returncode, (proc.stdout or "") + (proc.stderr or "")
    except (OSError, subprocess.TimeoutExpired) as exc:
        return 127, str(exc)


def interpreter_of(binary):
    try:
        first = Path(binary).read_text(encoding="utf-8", errors="replace").splitlines()[0]
    except (OSError, IndexError):
        return None
    if not first.startswith("#!"):
        return None
    parts = first[2:].strip().split()
    if not parts:
        return None
    if Path(parts[0]).name == "env" and len(parts) > 1:
        return shutil.which(parts[1])
    return parts[0]


def main():
    ap = argparse.ArgumentParser(description="Periksa kesiapan lingkungan graphify (hanya membaca).")
    ap.add_argument("--akar", default=".", help="akar repo (default: direktori kerja)")
    ap.add_argument("--versi", default="0.9.112", help="versi graphify yang diharapkan")
    ap.add_argument("--json", action="store_true", help="keluaran JSON")
    args = ap.parse_args()
    root = Path(args.akar).resolve()
    rows = []

    def add(item, status, detail, fix="-"):
        rows.append({"pemeriksaan": item, "status": status, "rincian": detail, "perbaikan": fix})

    # 1. CLI
    binary = shutil.which("graphify")
    cli_version = None
    if not binary:
        add("CLI graphify", "GAGAL", "perintah graphify tidak ditemukan di PATH", "graphify-pasang-cli")
    else:
        code, out = run([binary, "--version"])
        m = re.search(r"graphify\s+([0-9][^\s]*)", out)
        cli_version = m.group(1) if m else None
        if code != 0 or not cli_version:
            add("CLI graphify", "GAGAL", f"graphify ada di {binary} tetapi --version gagal", "graphify-atasi-masalah")
        elif cli_version != args.versi:
            add("CLI graphify", "PERINGATAN", f"versi {cli_version}, diharapkan {args.versi}", "graphify-kelola-versi")
        else:
            add("CLI graphify", "OK", f"versi {cli_version} di {binary}")
        py = interpreter_of(binary)
        if py and Path(py).name.startswith("python"):
            snippet = ("import importlib.util as u, json; "
                       f"print(json.dumps({{k: bool(u.find_spec(v)) for k, v in {EXTRAS!r}.items()}}))")
            code, out = run([py, "-I", "-c", snippet])
            try:
                found = json.loads(out.strip().splitlines()[-1])
                have = sorted(k for k, v in found.items() if v)
                miss = sorted(k for k, v in found.items() if not v)
                add("Extra terpasang", "INFO", f"ada: {', '.join(have) or '-'}; tidak ada: {', '.join(miss) or '-'}",
                    "graphify-pasang-cli bila butuh extra yang tidak ada")
            except (ValueError, IndexError):
                add("Extra terpasang", "INFO", "tidak bisa diperiksa dari interpreter graphify")
        else:
            add("Extra terpasang", "INFO", "interpreter graphify bukan Python; extra tidak diperiksa")

    # 2. Skill resmi
    skill = root / ".claude" / "skills" / "graphify" / "SKILL.md"
    vfile = skill.parent / ".graphify_version"
    if not skill.exists():
        add("Skill resmi /graphify", "PERINGATAN", "belum ada di .claude/skills/graphify", "graphify-pasang-cli")
    else:
        sv = vfile.read_text(encoding="utf-8").strip() if vfile.exists() else "?"
        status = "OK" if (cli_version is None or sv == cli_version) else "PERINGATAN"
        add("Skill resmi /graphify", status, f"terpasang (versi skill {sv})",
            "-" if status == "OK" else "graphify-kelola-versi")

    # 3. Graph utama dan kesegarannya
    gpath = root / "graphify-out" / "graph.json"
    if not gpath.exists():
        add("Graph utama", "INFO", "graphify-out/graph.json belum ada", "graphify-bangun-graph-kode")
    else:
        try:
            g = json.loads(gpath.read_text(encoding="utf-8"))
            nodes = g.get("nodes", [])
            links = g.get("links", g.get("edges", []))
            comms = {n.get("community") for n in nodes if n.get("community") is not None}
            add("Graph utama", "OK", f"{len(nodes)} node, {len(links)} edge, {len(comms)} komunitas")
            built = g.get("built_at_commit")
            code, head = run(["git", "rev-parse", "HEAD"], cwd=root)
            head = head.strip() if code == 0 else None
            if not built or not head:
                add("Kesegaran graph", "INFO", "commit pembuatan atau HEAD tidak diketahui")
            elif head.startswith(built) or built.startswith(head):
                add("Kesegaran graph", "OK", f"dibangun dari HEAD ({head[:8]})")
            else:
                code, diff = run(["git", "diff", "--name-only", built, "HEAD"], cwd=root)
                changed = [l.strip() for l in diff.splitlines() if l.strip()] if code == 0 else []
                sources = {n.get("source_file") for n in nodes}
                outputs = ("graphify-out/", "graphify-kerja/")  # hasil graph sendiri bukan sumber
                relevant = [f for f in changed if not f.startswith(outputs) and "/graphify-out/" not in f
                            and (f in sources or Path(f).suffix in CODE_EXT)]
                if relevant:
                    add("Kesegaran graph", "PERINGATAN",
                        f"dibangun dari {built[:8]}, HEAD {head[:8]}; {len(relevant)} file kode/graph berubah "
                        f"(dari {len(changed)} file)", "graphify-perbarui-graph")
                else:
                    add("Kesegaran graph", "OK",
                        f"dibangun dari {built[:8]}, HEAD {head[:8]}; {len(changed)} file berubah tetapi bukan kode")
            pending = {}
            pfile = gpath.parent / ".graphify_labels.pending.json"
            if pfile.exists():
                try:
                    pending = {int(k): v for k, v in json.loads(pfile.read_text(encoding="utf-8")).items()}
                except (ValueError, OSError):
                    pending = {}
            placeholder = sum(1 for n in nodes if re.fullmatch(r"Community \d+", str(n.get("community_name", "")))
                              or (n.get("community") is not None and pending.get(int(n["community"])) == n.get("community_name")))
            labels = gpath.parent / ".graphify_labels.json"
            if labels.exists():
                status = "OK" if placeholder == 0 else "PERINGATAN"
                add("Nama komunitas", status,
                    f"tersimpan; {placeholder} node masih di komunitas bernama sementara (Community N atau nama cadangan hub)",
                    "-" if status == "OK" else "graphify-namai-komunitas")
            else:
                add("Nama komunitas", "PERINGATAN", "belum ada .graphify_labels.json", "graphify-namai-komunitas")
        except (ValueError, OSError) as exc:
            add("Graph utama", "GAGAL", f"graph.json tidak bisa dibaca: {exc}", "graphify-atasi-masalah")

    # 4. Always-on dan hook asisten
    md_files = [root / "CLAUDE.md", root / ".claude" / "CLAUDE.md", root / "AGENTS.md"]
    on = [p.name for p in md_files if p.exists() and "## graphify" in p.read_text(encoding="utf-8", errors="replace")]
    add("Aturan always-on", "OK" if on else "INFO",
        f"bagian ## graphify ada di {', '.join(on)}" if on else "belum aktif", "-" if on else "graphify-mode-always-on")
    settings = root / ".claude" / "settings.json"
    if settings.exists():
        try:
            data = json.loads(settings.read_text(encoding="utf-8"))
            cmds = [h.get("command", "") for groups in data.get("hooks", {}).values() if isinstance(groups, list)
                    for grp in groups if isinstance(grp, dict) for h in grp.get("hooks", []) if isinstance(h, dict)]
            ours = [c for c in cmds if "graphify" in c and "hook-guard" in c]
            bare = [c for c in ours if WRAP not in c]
            if not ours:
                add("Hook asisten", "INFO", "tidak ada hook graphify", "graphify-mode-always-on")
            elif bare:
                add("Hook asisten", "PERINGATAN", f"{len(bare)} dari {len(ours)} hook belum dibungkus pengaman",
                    "graphify-mode-always-on (bungkus_hook.py)")
            else:
                add("Hook asisten", "OK", f"{len(ours)} hook, semuanya dibungkus pengaman")
        except ValueError:
            add("Hook asisten", "GAGAL", ".claude/settings.json bukan JSON yang sah", "graphify-mode-always-on")
    else:
        add("Hook asisten", "INFO", "tidak ada .claude/settings.json", "graphify-mode-always-on")

    # 5. Pengecualian dan konfigurasi
    ign = root / ".graphifyignore"
    if ign.exists():
        pats = [l for l in ign.read_text(encoding="utf-8").splitlines() if l.strip() and not l.lstrip().startswith("#")]
        add(".graphifyignore", "OK", f"{len(pats)} pola")
    else:
        add(".graphifyignore", "INFO", "belum ada; library minified dan gambar bisa ikut masuk", "graphify-atur-pengecualian")
    rc = root / ".graphifyrc"
    add(".graphifyrc", "INFO", "ada" if rc.exists() else "belum ada (memakai default)")

    # 6. Hook git dan register
    hook = root / ".git" / "hooks" / "post-commit"
    has_git_hook = hook.exists() and "graphify" in hook.read_text(encoding="utf-8", errors="replace")
    add("Hook git", "INFO", "post-commit graphify terpasang" if has_git_hook else "tidak terpasang", "graphify-otomasi-git")
    reg = root / "graphify-kerja" / "register" / "graph-register.csv"
    if reg.exists():
        n = max(0, len([l for l in reg.read_text(encoding="utf-8").splitlines() if l.strip()]) - 1)
        add("Register graph", "OK", f"{n} graph tercatat")
    else:
        add("Register graph", "INFO", "belum ada", "graphify-catatan-graph")

    # 7. Backend LLM (nama variabel saja)
    present = [v for v in BACKEND_VARS if os.environ.get(v)]
    backend = os.environ.get("GRAPHIFY_BACKEND")
    detail = f"variabel ada: {', '.join(present) or '-'}"
    if backend:
        detail += f"; GRAPHIFY_BACKEND={backend}"
    add("Backend LLM", "INFO", detail, "graphify-penjaga-biaya")
    if shutil.which("claude") and backend != "none":
        add("Cadangan pelabelan", "PERINGATAN",
            "CLI claude ada: cluster-only tanpa --no-label akan memakai token untuk menamai komunitas",
            "selalu pakai --no-label, nama lewat graphify-namai-komunitas")

    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
    else:
        print(f"Diagnosa graphify untuk {root}\n")
        print("| Pemeriksaan | Status | Rincian | Perbaikan |")
        print("|---|---|---|---|")
        for r in rows:
            print(f"| {r['pemeriksaan']} | {r['status']} | {r['rincian']} | {r['perbaikan']} |")
        counts = {s: sum(1 for r in rows if r["status"] == s) for s in ("OK", "PERINGATAN", "GAGAL", "INFO")}
        print(f"\nRingkas: {counts['OK']} OK, {counts['PERINGATAN']} PERINGATAN, {counts['GAGAL']} GAGAL, {counts['INFO']} INFO")
    return 1 if any(r["status"] == "GAGAL" for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
