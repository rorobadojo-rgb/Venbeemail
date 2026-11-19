#!/usr/bin/env python3
"""Bungkus hook graphify di .claude/settings.json agar diam bila CLI graphify belum terpasang.

Pakai:  python3 bungkus_hook.py [--settings .claude/settings.json] [--periksa | --lepas]

Masalah yang diatasi: `graphify install` menulis hook berbentuk `graphify hook-guard read`. Di sesi
cloud baru CLI belum ada, sehingga setiap Read/Grep/Glob/Bash memunculkan error "command not found".
Bentuk terbungkus:  if command -v graphify >/dev/null 2>&1; then graphify hook-guard read; fi
Kode keluar graphify tetap diteruskan bila CLI ada (mode ketat tetap bekerja), dan 0 bila tidak ada.
`graphify uninstall` tetap mengenali hook terbungkus karena teks "graphify hook-guard" masih ada.

--periksa  hanya melapor; kode keluar 1 bila masih ada hook telanjang.
--lepas    kembalikan ke bentuk asli (misalnya sebelum melapor bug ke graphify).
Tanpa opsi : bungkus semua hook graphify yang belum terbungkus (aman diulang).
"""
import argparse
import json
import re
import sys
from pathlib import Path

PREFIX = "if command -v graphify >/dev/null 2>&1; then "
SUFFIX = "; fi"
WRAPPED = re.compile(r"^if command -v graphify >/dev/null 2>&1; then (.+); fi$")


def is_graphify(cmd: str) -> bool:
    return "graphify" in cmd and "hook-guard" in cmd


def walk(data):
    hooks = data.get("hooks", {}) if isinstance(data, dict) else {}
    for event, groups in hooks.items():
        if not isinstance(groups, list):
            continue
        for group in groups:
            if not isinstance(group, dict):
                continue
            for entry in group.get("hooks", []):
                if isinstance(entry, dict) and entry.get("type") == "command" and isinstance(entry.get("command"), str):
                    yield event, entry


def main():
    ap = argparse.ArgumentParser(description="Bungkus hook graphify dengan pengaman 'command -v'.")
    ap.add_argument("--settings", default=".claude/settings.json")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--periksa", action="store_true", help="hanya laporkan, jangan ubah")
    mode.add_argument("--lepas", action="store_true", help="kembalikan ke perintah asli")
    args = ap.parse_args()
    path = Path(args.settings)
    if not path.exists():
        print(f"GAGAL: {path} tidak ada. Pasang hook dulu lewat graphify install --project atau graphify claude install.")
        return 1
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as exc:
        print(f"GAGAL: {path} bukan JSON yang sah: {exc}")
        return 1

    ours = [(ev, e) for ev, e in walk(data) if is_graphify(e["command"])]
    bare = [(ev, e) for ev, e in ours if not WRAPPED.match(e["command"])]
    if not ours:
        print("Tidak ada hook graphify di berkas ini.")
        return 0
    if args.periksa:
        print(f"{len(ours)} hook graphify; {len(ours) - len(bare)} terbungkus, {len(bare)} telanjang.")
        for ev, e in bare:
            print(f"  - telanjang ({ev}): {e['command']}")
        return 1 if bare else 0

    changed = 0
    for ev, e in ours:
        m = WRAPPED.match(e["command"])
        if args.lepas and m:
            e["command"] = m.group(1)
            changed += 1
        elif not args.lepas and not m:
            e["command"] = PREFIX + e["command"] + SUFFIX
            changed += 1
    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    verb = "dilepas" if args.lepas else "dibungkus"
    print(f"{changed} hook {verb}; total hook graphify {len(ours)}. Berkas: {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
