#!/usr/bin/env python3
"""Perkirakan biaya pass semantik graphify sebelum dijalankan (tanpa memanggil model apa pun).

Pakai:  python3 perkiraan_biaya.py PATH [--json] [--kasar] [--token-per-gambar 1500]
                                        [--rasio-keluaran 0.25] [--harga-per-juta 0]

Cara kerja:
  1. Daftar file diambil dari detect() milik graphify lewat interpreter CLI graphify, jadi aturan
     .gitignore, .graphifyignore, dan file sensitif sama persis dengan build sungguhan.
     Bila graphify tidak terpasang (atau --kasar), dipakai pemindai sederhana berdasarkan ekstensi.
  2. Kode tidak dihitung: AST lokal dan gratis.
  3. Token dokumen = jumlah kata x 1,35 (ASUMSI campuran Indonesia-Inggris). PDF tanpa teks terbaca
     diperkirakan dari ukuran berkas. Gambar = jumlah x --token-per-gambar (ASUMSI). Video dan audio
     ditranskripsi lokal (tanpa token) tetapi transkripnya ikut pass semantik setelahnya.
Semua angka keluaran adalah ASUMSI dan harus dilaporkan begitu.
"""
import argparse
import fnmatch
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

DOC_EXT = {".md", ".markdown", ".txt", ".rst", ".html", ".htm", ".adoc", ".org", ".docx", ".xlsx"}
PAPER_EXT = {".pdf"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".tiff"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".mkv", ".avi", ".mp3", ".wav", ".m4a", ".ogg", ".flac"}
CODE_EXT = {".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".go", ".rs", ".java", ".rb", ".php", ".cs",
            ".kt", ".swift", ".c", ".h", ".cpp", ".hpp", ".sh", ".sql", ".json", ".yml", ".yaml", ".toml", ".lua"}
SKIP_DIRS = {".git", "node_modules", ".next", "out", "dist", "build", "__pycache__", "graphify-out", ".venv", "venv"}
WORDS_TO_TOKENS = 1.35
PDF_BYTES_PER_WORD = 30  # ASUMSI kasar untuk PDF yang teksnya tidak bisa dibaca di sini

DETECT_SNIPPET = r"""
import json, shutil, sys, tempfile
from pathlib import Path
from graphify.detect import detect
# detect() menyimpan indeks stat di <cache_root>/graphify-out/cache; arahkan ke folder sementara
# supaya perkiraan tidak meninggalkan folder graphify-out di folder yang dipindai.
tmp = tempfile.mkdtemp(prefix="perkiraan-biaya-")
try:
    r = detect(Path(sys.argv[1]), cache_root=Path(tmp))
finally:
    shutil.rmtree(tmp, ignore_errors=True)
print(json.dumps({"files": r["files"], "skipped_sensitive": r.get("skipped_sensitive") or [],
                  "ignored": r.get("ignored", 0), "scan_root": r.get("scan_root")}))
"""


def graphify_python():
    binary = shutil.which("graphify")
    if not binary:
        return None
    try:
        first = Path(binary).read_text(encoding="utf-8", errors="replace").splitlines()[0]
    except (OSError, IndexError):
        return None
    if not first.startswith("#!"):
        return None
    parts = first[2:].strip().split()
    py = shutil.which(parts[1]) if parts and Path(parts[0]).name == "env" and len(parts) > 1 else (parts[0] if parts else None)
    return py if py and Path(py).name.startswith("python") else None


def detect_with_graphify(path: Path):
    py = graphify_python()
    if not py:
        return None
    try:
        proc = subprocess.run([py, "-I", "-c", DETECT_SNIPPET, str(path)], capture_output=True, text=True, timeout=300)
    except (OSError, subprocess.TimeoutExpired):
        return None
    if proc.returncode != 0:
        return None
    try:
        return json.loads(proc.stdout.strip().splitlines()[-1])
    except (ValueError, IndexError):
        return None


def load_ignore(root: Path):
    patterns = []
    for name in (".gitignore", ".graphifyignore"):
        f = root / name
        if f.exists():
            for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and not line.startswith("!"):
                    patterns.append(line)
    return patterns


def ignored(rel: str, patterns) -> bool:
    name = rel.rsplit("/", 1)[-1]
    for p in patterns:
        p2 = p.rstrip("/")
        anchored = p2.startswith("/")
        p2 = p2.lstrip("/")
        if p.endswith("/"):
            parts = rel.split("/")[:-1]
            if any(fnmatch.fnmatch(part, p2) for part in parts) or fnmatch.fnmatch(rel, p2 + "/*") or rel.startswith(p2 + "/"):
                return True
        elif fnmatch.fnmatch(rel, p2) or (not anchored and "/" not in p2 and fnmatch.fnmatch(name, p2)):
            return True
        elif rel.startswith(p2 + "/"):
            return True
    return False


def detect_rough(root: Path):
    patterns = load_ignore(root)
    files = {"code": [], "document": [], "paper": [], "image": [], "video": []}
    skipped = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".") or d in (".claude",)]
        for fn in filenames:
            full = Path(dirpath) / fn
            rel = full.relative_to(root).as_posix()
            if ignored(rel, patterns):
                skipped += 1
                continue
            ext = full.suffix.lower()
            kind = ("document" if ext in DOC_EXT else "paper" if ext in PAPER_EXT else "image" if ext in IMAGE_EXT
                    else "video" if ext in VIDEO_EXT else "code" if ext in CODE_EXT else None)
            if kind:
                files[kind].append(str(full))
    return {"files": files, "skipped_sensitive": [], "ignored": skipped, "scan_root": str(root)}


def fmt(n: int) -> str:
    """Angka dengan titik pemisah ribuan, gaya Indonesia."""
    return f"{n:,}".replace(",", ".")


def count_words(path: Path) -> int:
    if path.suffix.lower() in (".docx", ".xlsx"):
        return max(1, path.stat().st_size // 60)  # ASUMSI: berkas Office terkompresi
    try:
        return len(path.read_text(encoding="utf-8", errors="replace").split())
    except OSError:
        return 0


def main():
    ap = argparse.ArgumentParser(description="Perkiraan biaya pass semantik graphify (semua angka ASUMSI).")
    ap.add_argument("path", help="folder yang akan dibangun graph-nya")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--kasar", action="store_true", help="paksa pemindai sederhana, tanpa graphify")
    ap.add_argument("--token-per-gambar", type=int, default=1500)
    ap.add_argument("--rasio-keluaran", type=float, default=0.25, help="token keluaran per token masukan")
    ap.add_argument("--harga-per-juta", type=float, default=0.0, help="harga USD per sejuta token (opsional)")
    args = ap.parse_args()
    root = Path(args.path).resolve()
    if not root.is_dir():
        print(f"GAGAL: {root} bukan folder.")
        return 1

    result = None if args.kasar else detect_with_graphify(root)
    method = "detect() graphify" if result else "pemindai kasar (graphify tidak dipakai)"
    if result is None:
        result = detect_rough(root)
    files = result["files"]

    doc_words, folder_tokens = 0, {}
    for cat in ("document", "paper"):
        for f in files.get(cat, []):
            p = Path(f)
            if not p.is_absolute():
                p = root / p
            if cat == "paper":
                words = max(1, p.stat().st_size // PDF_BYTES_PER_WORD) if p.exists() else 0
            else:
                words = count_words(p) if p.exists() else 0
            doc_words += words
            try:
                top = p.relative_to(root).parts[0] if len(p.relative_to(root).parts) > 1 else "(akar)"
            except ValueError:
                top = "(luar)"
            folder_tokens[top] = folder_tokens.get(top, 0) + int(words * WORDS_TO_TOKENS)

    n_img = len(files.get("image", []))
    n_vid = len(files.get("video", []))
    doc_tokens = int(doc_words * WORDS_TO_TOKENS)
    img_tokens = n_img * args.token_per_gambar
    input_tokens = doc_tokens + img_tokens
    output_tokens = int(input_tokens * args.rasio_keluaran)
    total = input_tokens + output_tokens
    cost = round(total / 1_000_000 * args.harga_per_juta, 2) if args.harga_per_juta else None
    top_folders = sorted(folder_tokens.items(), key=lambda kv: kv[1], reverse=True)[:5]
    sensitive = result.get("skipped_sensitive") or []
    ignored_raw = result.get("ignored", 0)
    n_ignored = len(ignored_raw) if isinstance(ignored_raw, (list, dict)) else int(ignored_raw or 0)

    report = {
        "folder": str(root), "metode": method, "label": "ASUMSI",
        "file": {k: len(v) for k, v in files.items()},
        "kata_dokumen": doc_words, "token_dokumen": doc_tokens, "token_gambar": img_tokens,
        "token_masukan": input_tokens, "token_keluaran": output_tokens, "token_total": total,
        "biaya_usd": cost, "media_untuk_transkripsi": n_vid, "diabaikan": n_ignored,
        "file_sensitif_dilewati": len(sensitive), "folder_terbesar": top_folders,
        "butuh_izin": input_tokens > 0 or n_vid > 0,
    }
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=1))
        return 0

    print(f"PERKIRAAN BIAYA PASS SEMANTIK (label: ASUMSI)   folder: {root}")
    print(f"Metode daftar file: {method}\n")
    print("| Jenis | File | Masuk pass semantik? | Perkiraan token |")
    print("|---|---|---|---|")
    print(f"| Kode | {report['file'].get('code', 0)} | tidak (AST lokal, gratis) | 0 |")
    print(f"| Dokumen | {report['file'].get('document', 0)} | ya | {fmt(doc_tokens)} |")
    print(f"| PDF | {report['file'].get('paper', 0)} | ya | (termasuk di atas) |")
    print(f"| Gambar | {n_img} | ya | {fmt(img_tokens)} |")
    print(f"| Video/audio | {n_vid} | ditranskripsi lokal dulu | tergantung durasi |")
    print(f"\nToken masukan ±{fmt(input_tokens)}, keluaran ±{fmt(output_tokens)}, total ±{fmt(total)}")
    if cost is not None:
        print(f"Biaya API ±USD {cost} (harga {args.harga_per_juta} per sejuta token; ASUMSI)")
    print(f"File diabaikan aturan ignore: {report['diabaikan']}; file sensitif dilewati: {len(sensitive)}")
    if top_folders:
        print("\nFolder penyumbang token terbesar (untuk mempersempit):")
        for name, tok in top_folders:
            print(f"  - {name}: ±{fmt(tok)} token")
    if report["butuh_izin"]:
        n_docs = report["file"].get("document", 0) + report["file"].get("paper", 0)
        print("\nButuh izin pemilik sebelum dijalankan. Pertanyaan yang diajukan:")
        print(f'  "Pass semantik akan membaca {n_docs} dokumen, {n_img} gambar, dan {n_vid} media; '
              f'perkiraan ±{fmt(total)} token. Lanjut, persempit folder, atau kode saja?"')
    else:
        print("\nTidak ada yang masuk pass semantik: build kode saja, gratis, tidak perlu izin biaya.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
