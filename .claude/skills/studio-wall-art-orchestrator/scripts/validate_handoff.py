#!/usr/bin/env python3
"""Periksa file serah terima studio (studio-nangka/handoff@1).

Pakai:
  python3 validate_handoff.py <file.json> [--root <folder untuk mengecek path artefak>]

Keluar 0 bila valid, 1 bila tidak. Hanya pustaka standar Python.
"""
import json
import re
import sys
from pathlib import Path

SCHEMA = "studio-nangka/handoff@1"
REQUIRED = ["schema", "skill", "date", "project_id", "version", "status", "next_skill"]
STATUS = {"draft", "needs_input", "ready_for_review", "passed", "failed", "approved", "blocked"}
RIGHTS = {"cleared", "restricted", "inspiration_only", "unknown", "blocked"}
RESULT = {"pass", "warn", "fail"}
PATTERNS = {
    "project_id": r"^PRJ-\d{6}-[a-z0-9]+(?:-[a-z0-9]+)*$",
    "collection_id": r"^COL-[a-z0-9]+(?:-[a-z0-9]+)*$",
    "artwork_id": r"^ART-[a-z0-9]+(?:-[a-z0-9]+)*-\d{2}$",
    "version": r"^v\d+$",
    "date": r"^\d{4}-\d{2}-\d{2}$",
    "skill": r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
}
LIST_FIELDS = ["input_assets", "observations", "assumptions", "decisions",
               "unresolved_questions", "output_artifacts", "quality_results"]


def validate(data, root=None):
    errors, warnings = [], []
    if not isinstance(data, dict):
        return ["isi file harus berupa objek JSON"], warnings
    for field in REQUIRED:
        if field not in data:
            errors.append(f"field wajib hilang: {field}")
    if data.get("schema") not in (None, SCHEMA):
        errors.append(f"schema harus '{SCHEMA}'")
    for field, pattern in PATTERNS.items():
        value = data.get(field)
        if value is not None and not (isinstance(value, str) and re.match(pattern, value)):
            errors.append(f"format {field} salah: {value!r}")
    if "status" in data and data["status"] not in STATUS:
        errors.append(f"status tidak dikenal: {data['status']!r} (pilihan: {', '.join(sorted(STATUS))})")
    if "rights_status" in data and data["rights_status"] not in RIGHTS:
        errors.append(f"rights_status tidak dikenal: {data['rights_status']!r}")
    for field in LIST_FIELDS:
        if field in data and not isinstance(data[field], list):
            errors.append(f"{field} harus berupa daftar")
    nxt = data.get("next_skill", None)
    if "next_skill" in data and not (nxt is None or isinstance(nxt, str)
                                     or (isinstance(nxt, list) and all(isinstance(x, str) for x in nxt))):
        errors.append("next_skill harus nama skill, daftar nama skill, atau null")
    if nxt == "studio-wall-art-orchestrator" or (isinstance(nxt, list) and "studio-wall-art-orchestrator" in nxt):
        errors.append("next_skill tidak boleh orchestrator (tidak ada serah terima balik)")
    for i, asset in enumerate(data.get("input_assets") or []):
        if not (isinstance(asset, dict) and re.match(r"^AST-\d{4}$", str(asset.get("asset_id", "")))):
            errors.append(f"input_assets[{i}] butuh asset_id berformat AST-NNNN")
    for i, dec in enumerate(data.get("decisions") or []):
        if not (isinstance(dec, dict) and dec.get("what") and dec.get("by")):
            errors.append(f"decisions[{i}] butuh 'what' dan 'by'")
    for i, res in enumerate(data.get("quality_results") or []):
        if not (isinstance(res, dict) and res.get("check") and res.get("result") in RESULT):
            errors.append(f"quality_results[{i}] butuh 'check' dan 'result' (pass/warn/fail)")
    for i, art in enumerate(data.get("output_artifacts") or []):
        if not (isinstance(art, dict) and art.get("path")):
            errors.append(f"output_artifacts[{i}] butuh 'path'")
            continue
        if art.get("verified") is True and root is not None and not (Path(root) / art["path"]).exists():
            errors.append(f"output_artifacts[{i}] ditandai verified tetapi file tidak ada: {art['path']}")
        if art.get("verified") is True and root is None:
            warnings.append(f"output_artifacts[{i}] verified tidak dicek (jalankan dengan --root)")
    status, rights = data.get("status"), data.get("rights_status")
    if status in {"passed", "approved"} and rights in {"unknown", "blocked", "inspiration_only"}:
        errors.append(f"status '{status}' tidak boleh bersama rights_status '{rights}'")
    if status == "needs_input" and not data.get("unresolved_questions"):
        warnings.append("status needs_input tanpa unresolved_questions")
    return errors, warnings


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1
    root = None
    if "--root" in argv:
        root = argv[argv.index("--root") + 1]
    try:
        data = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"TIDAK VALID: file tidak bisa dibaca sebagai JSON ({exc})")
        return 1
    errors, warnings = validate(data, root)
    for w in warnings:
        print("PERINGATAN:", w)
    if errors:
        print("TIDAK VALID")
        for e in errors:
            print(" -", e)
        return 1
    print("VALID")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
