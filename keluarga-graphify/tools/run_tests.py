#!/usr/bin/env python3
"""Uji struktur seluruh keluarga skill graphify.

Pakai:  python3 keluarga-graphify/tools/run_tests.py [--skip-scripts]

Yang diperiksa:
  1. Setiap skill di skill-index.json punya folder dan SKILL.md.
  2. Frontmatter sah (name = nama folder, description 1-1024 karakter, tanpa kurung sudut).
  3. Lima belas bagian wajib ada di tiap SKILL.md, dan panjangnya <= 500 baris.
  4. Setiap file yang dirujuk (references/, assets/, scripts/) benar-benar ada.
  5. Setiap file di scripts/ dan assets/ disebut di SKILL.md (tidak ada file mati).
  6. Setiap skrip punya docstring "Pakai:" dan `--help` berjalan dengan kode keluar 0.
  7. Setiap nama skill keluarga yang disebut ada di indeks.
  8. Bagian "Serah terima" cocok dengan next/uses di indeks.
  9. Graf ketergantungan tidak melingkar; skill layanan tidak punya keluaran; router bukan tujuan.
 10. Setiap jenis keputusan punya tepat satu pemilik.
 11. Salinan graphify-core.md sama dengan sumbernya.
 12. Uji unit skrip (tests/test_scripts.py), kecuali --skip-scripts.

Keluar 0 bila semua lulus.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / "keluarga-graphify"
SKILLS = ROOT / ".claude" / "skills"

REQUIRED_HEADINGS = [
    "Kapan digunakan", "Kapan tidak digunakan", "Input", "Default",
    "Pertanyaan bila info penting belum ada", "Langkah kerja", "Aturan keputusan",
    "Format hasil", "Pemeriksaan kualitas", "Penanganan kesalahan", "Serah terima",
    "Batas kemampuan alat", "Contoh penggunaan", "Contoh kegagalan dan perbaikannya",
    "Cara menguji skill ini",
]
ALLOWED_KEYS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
SKILL_TOKEN = re.compile(r"`(graphify-[a-z0-9-]+)`")
FILE_REF = re.compile(r"`((?:references|assets|scripts)/[A-Za-z0-9_./-]+)`")
NOT_SKILLS = {"graphify-out", "graphify-mcp", "graphify-kerja", "graphify-core", "graphify-8"}
SHARED_FILES = {"graphify-core.md"}


def parse_frontmatter(text):
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        return None, "frontmatter tidak ditemukan"
    block = match.group(1)
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(block)
        if not isinstance(data, dict):
            return None, "frontmatter bukan kamus YAML"
        return data, None
    except ImportError:
        data = {}
        for line in block.splitlines():
            if ":" in line and not line.startswith(" "):
                key, value = line.split(":", 1)
                data[key.strip()] = value.strip()
        return data, None
    except Exception as exc:  # YAML rusak
        return None, f"YAML tidak sah: {exc}"


def section(text, heading):
    match = re.search(rf"^## {re.escape(heading)}\s*\n(.*?)(?=^## |\Z)", text, re.DOTALL | re.MULTILINE)
    return match.group(1) if match else None


def find_cycle(graph):
    state, stack = {}, []

    def visit(node):
        state[node] = 1
        stack.append(node)
        for nxt in graph.get(node, []):
            if state.get(nxt) == 1:
                return stack[stack.index(nxt):] + [nxt]
            if state.get(nxt) is None:
                found = visit(nxt)
                if found:
                    return found
        stack.pop()
        state[node] = 2
        return None

    for node in graph:
        if state.get(node) is None:
            found = visit(node)
            if found:
                return found
    return None


def main():
    failures, checks = [], 0

    def check(condition, message):
        nonlocal checks
        checks += 1
        if not condition:
            failures.append(message)

    index = json.loads((FAMILY / "skill-index.json").read_text(encoding="utf-8"))
    skills = index["skills"]
    names = [s["name"] for s in skills]
    name_set = set(names)
    check(len(names) == len(name_set), "ada nama skill ganda di indeks")
    check(len({s["id"] for s in skills}) == len(skills), "ada id skill ganda di indeks")
    check(set(s["group"] for s in skills) <= set(index["groups"]), "ada kelompok yang tidak terdaftar")

    owners = {}
    for s in skills:
        owners.setdefault(s["owns"], []).append(s["name"])
    for decision, who in owners.items():
        check(len(who) == 1, f"keputusan '{decision}' punya lebih dari satu pemilik: {who}")

    graph = {}
    for s in skills:
        targets = list(s["next"]) + list(s["uses"])
        graph[s["name"]] = targets
        for t in targets:
            check(t in name_set, f"{s['name']}: tujuan tidak ada di indeks: {t}")
        if s["role"] in ("service", "router"):
            check(not targets, f"{s['name']}: skill {s['role']} tidak boleh punya next/uses")
        for u in s["uses"]:
            role = next((x["role"] for x in skills if x["name"] == u), None)
            check(role == "service", f"{s['name']}: 'uses' harus skill layanan: {u}")
    routers = [s["name"] for s in skills if s["role"] == "router"]
    check(len(routers) == 1, f"harus tepat satu pintu masuk, ada {len(routers)}")
    for s in skills:
        for r in routers:
            check(r not in graph[s["name"]], f"{s['name']}: tidak boleh menyerahkan ke router {r}")
    cycle = find_cycle(graph)
    check(cycle is None, f"ketergantungan melingkar: {' -> '.join(cycle or [])}")

    core = (FAMILY / "_shared" / "graphify-core.md").read_text(encoding="utf-8")
    on_disk = sorted(p.name for p in SKILLS.iterdir() if p.is_dir()) if SKILLS.is_dir() else []
    for extra in sorted(set(on_disk) - name_set):
        if extra.startswith("graphify-"):
            failures.append(f"folder skill tidak ada di indeks: {extra}")

    for s in skills:
        name = s["name"]
        folder = SKILLS / name
        skill_md = folder / "SKILL.md"
        if not skill_md.exists():
            failures.append(f"{name}: SKILL.md belum ada")
            checks += 1
            continue
        text = skill_md.read_text(encoding="utf-8")
        front, err = parse_frontmatter(text)
        check(front is not None, f"{name}: {err}")
        if front:
            check(front.get("name") == name, f"{name}: name di frontmatter tidak sama dengan nama folder")
            desc = str(front.get("description", ""))
            check(0 < len(desc) <= 1024, f"{name}: panjang description {len(desc)} (harus 1-1024)")
            check("<" not in desc and ">" not in desc, f"{name}: description memuat kurung sudut")
            raw = re.search(r"^description:(.*)$", text, re.MULTILINE)
            check(not raw or " #" not in raw.group(1),
                  f"{name}: description memuat ' #' yang dibaca YAML sebagai awal komentar (deskripsi terpotong)")
            check(set(front) <= ALLOWED_KEYS, f"{name}: kunci frontmatter tidak dikenal: {set(front) - ALLOWED_KEYS}")
        check(len(text.splitlines()) <= 500, f"{name}: SKILL.md lebih dari 500 baris")
        check("references/graphify-core.md" in text, f"{name}: tidak merujuk references/graphify-core.md")
        for heading in REQUIRED_HEADINGS:
            check(section(text, heading) is not None, f"{name}: bagian wajib hilang: '{heading}'")

        refs = set(FILE_REF.findall(text))
        for ref in sorted(refs):
            check((folder / ref).exists(), f"{name}: file yang dirujuk tidak ada: {ref}")
        for sub in ("scripts", "assets"):
            if (folder / sub).is_dir():
                for f in sorted(p for p in (folder / sub).rglob("*") if p.is_file() and "__pycache__" not in p.parts):
                    rel = f"{sub}/{f.relative_to(folder / sub).as_posix()}"
                    check(rel in refs, f"{name}: file tidak disebut di SKILL.md: {rel}")
        if (folder / "references").is_dir():
            for f in sorted((folder / "references").glob("*.md")):
                if f.name in SHARED_FILES:
                    continue
                check(f"references/{f.name}" in refs, f"{name}: referensi tidak disebut di SKILL.md: references/{f.name}")
                for ref in sorted(set(FILE_REF.findall(f.read_text(encoding="utf-8")))):
                    check((folder / ref).exists(), f"{name}/{f.name}: file yang dirujuk tidak ada: {ref}")

        if (folder / "scripts").is_dir():
            for script in sorted((folder / "scripts").glob("*.py")):
                body = script.read_text(encoding="utf-8")
                check("Pakai:" in body, f"{name}: {script.name} tidak punya petunjuk 'Pakai:' di docstring")
                proc = subprocess.run([sys.executable, str(script), "--help"], capture_output=True, text=True, timeout=60)
                check(proc.returncode == 0, f"{name}: {script.name} --help gagal: {(proc.stderr or proc.stdout).strip()[-200:]}")

        mentioned = set(SKILL_TOKEN.findall(text)) - NOT_SKILLS
        for m in sorted(mentioned):
            check(m in name_set, f"{name}: menyebut skill yang tidak ada: {m}")

        handoff = section(text, "Serah terima") or ""
        in_handoff = (set(SKILL_TOKEN.findall(handoff)) - NOT_SKILLS) & name_set
        allowed = set(s["next"]) | set(s["uses"])
        if s["role"] != "router":
            check(in_handoff <= allowed, f"{name}: 'Serah terima' menyebut skill di luar indeks: {sorted(in_handoff - allowed)}")
            check(set(s["next"]) <= in_handoff, f"{name}: 'Serah terima' belum menyebut: {sorted(set(s['next']) - in_handoff)}")
        for u in s["uses"]:
            check(u in mentioned, f"{name}: skill layanan '{u}' tidak disebut di SKILL.md")

        copy = folder / "references" / "graphify-core.md"
        check(copy.exists() and copy.read_text(encoding="utf-8") == core,
              f"{name}: references/graphify-core.md tidak sama dengan sumber (jalankan sync_shared.py)")
        check(len(list(folder.rglob("SKILL.md"))) == 1, f"{name}: harus tepat satu SKILL.md")

    dirigen = SKILLS / "graphify-dirigen" / "SKILL.md"
    if dirigen.exists():
        routed = set(SKILL_TOKEN.findall(dirigen.read_text(encoding="utf-8"))) - NOT_SKILLS
        missing = sorted(name_set - routed - {"graphify-dirigen"})
        check(not missing, f"graphify-dirigen belum menyebut skill: {missing}")

    script_result = "dilewati"
    if "--skip-scripts" not in sys.argv:
        test_file = FAMILY / "tests" / "test_scripts.py"
        if test_file.exists():
            proc = subprocess.run([sys.executable, str(test_file)], capture_output=True, text=True)
            tail = (proc.stderr or proc.stdout).strip().splitlines()[-3:]
            script_result = " | ".join(tail)
            check(proc.returncode == 0, f"uji unit skrip gagal: {script_result}")
        else:
            failures.append("tests/test_scripts.py belum ada")

    print(f"Skill di indeks       : {len(skills)}")
    print(f"Pemeriksaan dijalankan: {checks}")
    print(f"Uji unit skrip        : {script_result}")
    if failures:
        print(f"GAGAL: {len(failures)} masalah")
        for f in failures:
            print(" -", f)
        return 1
    print("LULUS: semua pemeriksaan struktur terpenuhi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
