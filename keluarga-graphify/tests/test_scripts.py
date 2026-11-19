#!/usr/bin/env python3
"""Uji unit untuk 12 skrip keluarga skill graphify.

Pakai:  python3 keluarga-graphify/tests/test_scripts.py

Tiap skrip dijalankan sebagai proses terpisah, persis seperti cara skill memakainya, pada data contoh
di folder sementara. Uji yang butuh CLI graphify asli dilewati bila graphify tidak terpasang.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".claude" / "skills"
HAVE_GRAPHIFY = shutil.which("graphify") is not None

SCRIPT = {
    "lingkungan": SKILLS / "graphify-diagnosa-lingkungan/scripts/cek_lingkungan.py",
    "catat": SKILLS / "graphify-catatan-graph/scripts/catat_graph.py",
    "biaya": SKILLS / "graphify-penjaga-biaya/scripts/perkiraan_biaya.py",
    "namai": SKILLS / "graphify-namai-komunitas/scripts/namai_komunitas.py",
    "audit": SKILLS / "graphify-audit-graph/scripts/audit_graph.py",
    "banding": SKILLS / "graphify-banding-graph/scripts/banding_graph.py",
    "peta": SKILLS / "graphify-graph-skill/scripts/peta_skill.py",
    "tumpang": SKILLS / "graphify-cari-tumpang-tindih-skill/scripts/cek_tumpang_tindih.py",
    "celah": SKILLS / "graphify-cari-celah-skill/scripts/cek_celah_skill.py",
    "dampak": SKILLS / "graphify-dampak-ubah-skill/scripts/dampak_skill.py",
    "diagram": SKILLS / "graphify-peta-keluarga-skill/scripts/diagram_keluarga.py",
    "hook": SKILLS / "graphify-mode-always-on/scripts/bungkus_hook.py",
}


def run(name, *args, cwd=None, env=None):
    return subprocess.run([sys.executable, str(SCRIPT[name]), *map(str, args)], cwd=cwd, env=env,
                          capture_output=True, text=True, timeout=300)


def node(nid, label, src, community=0, cname="Komunitas Uji", ftype="code"):
    return {"id": nid, "label": label, "source_file": src, "source_location": "L1", "file_type": ftype,
            "community": community, "community_name": cname}


def edge(s, t, rel="calls", conf="EXTRACTED"):
    return {"source": s, "target": t, "relation": rel, "confidence": conf, "confidence_score": 1.0}


def write_graph(path: Path, nodes, links, commit=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    g = {"directed": True, "multigraph": False, "graph": {}, "nodes": nodes, "links": links, "hyperedges": []}
    if commit:
        g["built_at_commit"] = commit
    path.write_text(json.dumps(g), encoding="utf-8")
    return path


def clean_graph(path: Path, commit=None):
    nodes = [node("a", "loadMail()", "lib/mail.ts", 0, "Generator Alamat"),
             node("b", "generateLocalPart()", "lib/mail.ts", 0, "Generator Alamat"),
             node("c", "copyText()", "lib/mail.ts", 0, "Generator Alamat"),
             node("d", "ComicPage()", "components/ComicPage.tsx", 1, "Halaman Komik"),
             node("e", "Home()", "app/page.tsx", 1, "Halaman Komik"),
             node("f", "ChapterNav()", "components/ChapterNav.tsx", 1, "Halaman Komik")]
    links = [edge("a", "b"), edge("a", "c"), edge("d", "a"), edge("e", "d"), edge("d", "f")]
    return write_graph(path, nodes, links, commit)


def make_skill(root: Path, name: str, desc: str, body: str = "", files=None):
    d = root / name
    d.mkdir(parents=True, exist_ok=True)
    (d / "SKILL.md").write_text(f"---\nname: {name}\ndescription: {desc}\n---\n\n# {name}\n\n{body}\n", encoding="utf-8")
    for rel, content in (files or {}).items():
        p = d / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
    return d


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="uji-graphify-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)


class LingkunganTest(Base):
    def fake_bin(self, version="0.9.112"):
        bindir = self.tmp / "bin"
        bindir.mkdir()
        exe = bindir / "graphify"
        exe.write_text(f"#!/bin/sh\necho 'graphify {version}'\n", encoding="utf-8")
        exe.chmod(0o755)
        env = dict(os.environ)
        env["PATH"] = f"{bindir}:/usr/bin:/bin"
        return env

    def test_tanpa_cli_gagal(self):
        env = dict(os.environ)
        env["PATH"] = "/usr/bin:/bin"
        res = run("lingkungan", "--akar", self.tmp, "--json", env=env)
        self.assertEqual(res.returncode, 1, res.stdout)
        rows = json.loads(res.stdout)
        self.assertEqual(rows[0]["status"], "GAGAL")

    def test_siap_dan_hook_terbungkus(self):
        env = self.fake_bin()
        clean_graph(self.tmp / "graphify-out/graph.json")
        (self.tmp / "graphify-out/.graphify_labels.json").write_text('{"0": "A B"}', encoding="utf-8")
        (self.tmp / ".claude").mkdir()
        cmd = "if command -v graphify >/dev/null 2>&1; then graphify hook-guard read; fi"
        (self.tmp / ".claude/settings.json").write_text(json.dumps(
            {"hooks": {"PreToolUse": [{"matcher": "Read", "hooks": [{"type": "command", "command": cmd}]}]}}), encoding="utf-8")
        res = run("lingkungan", "--akar", self.tmp, "--json", env=env)
        self.assertEqual(res.returncode, 0, res.stdout)
        status = {r["pemeriksaan"]: r["status"] for r in json.loads(res.stdout)}
        self.assertEqual(status["CLI graphify"], "OK")
        self.assertEqual(status["Hook asisten"], "OK")
        self.assertEqual(status["Graph utama"], "OK")

    def test_hook_telanjang_dan_versi_beda(self):
        env = self.fake_bin("0.9.100")
        (self.tmp / ".claude").mkdir()
        (self.tmp / ".claude/settings.json").write_text(json.dumps(
            {"hooks": {"PreToolUse": [{"matcher": "Read", "hooks": [{"type": "command", "command": "graphify hook-guard read"}]}]}}), encoding="utf-8")
        status = {r["pemeriksaan"]: r["status"] for r in json.loads(run("lingkungan", "--akar", self.tmp, "--json", env=env).stdout)}
        self.assertEqual(status["Hook asisten"], "PERINGATAN")
        self.assertEqual(status["CLI graphify"], "PERINGATAN")


class CatatTest(Base):
    def test_tambah_daftar_periksa(self):
        g = clean_graph(self.tmp / "graphify-out/graph.json", commit="abcdef1234567")
        reg = self.tmp / "reg.csv"
        res = run("catat", "tambah", "--corpus-id", "KRP-repo", "--graph", g, "--lingkup", "kode uji",
                  "--mode", "kode", "--register", reg)
        self.assertEqual(res.returncode, 0, res.stdout)
        rows = reg.read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(rows), 2)
        self.assertIn("KRP-repo", rows[1])
        self.assertIn(",6,5,2,", rows[1])
        self.assertIn("abcdef12", rows[1])
        self.assertIn("KRP-repo", run("catat", "daftar", "--register", reg).stdout)
        self.assertEqual(run("catat", "periksa", "--register", reg, "--akar", self.tmp).returncode, 0)

    def test_id_tidak_sah(self):
        g = clean_graph(self.tmp / "g/graph.json")
        res = run("catat", "tambah", "--corpus-id", "repo utama", "--graph", g, "--lingkup", "x", "--mode", "kode",
                  "--register", self.tmp / "reg.csv")
        self.assertEqual(res.returncode, 1)
        self.assertFalse((self.tmp / "reg.csv").exists())

    def test_periksa_tertinggal_dan_ganda(self):
        g = clean_graph(self.tmp / "g/graph.json")
        reg = self.tmp / "reg.csv"
        run("catat", "tambah", "--corpus-id", "KRP-a", "--graph", g, "--lingkup", "x", "--mode", "kode", "--register", reg)
        write_graph(g, [node("z", "Z()", "z.py")], [])
        res = run("catat", "periksa", "--register", reg, "--akar", self.tmp)
        self.assertEqual(res.returncode, 0)
        self.assertIn("tertinggal", res.stdout)
        lines = reg.read_text(encoding="utf-8").splitlines()
        reg.write_text("\n".join(lines + [lines[1]]) + "\n", encoding="utf-8")
        res = run("catat", "periksa", "--register", reg, "--akar", self.tmp)
        self.assertEqual(res.returncode, 1)
        self.assertIn("ganda", res.stdout)


class BiayaTest(Base):
    def corpus(self):
        (self.tmp / "docs").mkdir()
        (self.tmp / "docs/a.md").write_text("kata " * 1000, encoding="utf-8")
        (self.tmp / "img").mkdir()
        for i in range(3):
            (self.tmp / f"img/g{i}.png").write_bytes(b"\x89PNG")
        (self.tmp / "v.mp4").write_bytes(b"0" * 10)
        (self.tmp / "app.py").write_text("print('hi')\n", encoding="utf-8")

    def test_angka_kasar(self):
        self.corpus()
        data = json.loads(run("biaya", self.tmp, "--kasar", "--json").stdout)
        self.assertEqual(data["file"]["document"], 1)
        self.assertEqual(data["file"]["image"], 3)
        self.assertEqual(data["token_dokumen"], int(1000 * 1.35))
        self.assertEqual(data["token_gambar"], 3 * 1500)
        self.assertEqual(data["media_untuk_transkripsi"], 1)
        self.assertTrue(data["butuh_izin"])
        self.assertEqual(data["label"], "ASUMSI")

    def test_kode_saja_tanpa_izin(self):
        (self.tmp / "app.py").write_text("x = 1\n", encoding="utf-8")
        data = json.loads(run("biaya", self.tmp, "--kasar", "--json").stdout)
        self.assertFalse(data["butuh_izin"])
        self.assertEqual(data["token_total"], 0)

    @unittest.skipUnless(HAVE_GRAPHIFY, "butuh CLI graphify")
    def test_detect_tanpa_jejak_di_folder(self):
        self.corpus()
        data = json.loads(run("biaya", self.tmp, "--json").stdout)
        self.assertEqual(data["metode"], "detect() graphify")
        self.assertEqual(data["file"]["document"], 1)
        self.assertFalse((self.tmp / "graphify-out").exists(), "detect() meninggalkan graphify-out di folder")

    def test_graphifyignore_dihormati(self):
        self.corpus()
        (self.tmp / ".graphifyignore").write_text("*.png\n*.mp4\n", encoding="utf-8")
        data = json.loads(run("biaya", self.tmp, "--kasar", "--json").stdout)
        self.assertEqual(data["file"]["image"], 0)
        self.assertEqual(data["media_untuk_transkripsi"], 0)
        self.assertEqual(data["diabaikan"], 4)


class NamaiTest(Base):
    def test_ringkas(self):
        g = clean_graph(self.tmp / "graphify-out/graph.json")
        rows = json.loads(run("namai", "ringkas", "--graph", g, "--json").stdout)
        self.assertEqual([r["ukuran"] for r in rows], [3, 3])
        self.assertIn("lib/mail.ts (3)", rows[0]["file_teratas"])

    def test_nama_tidak_sah_tidak_ditulis(self):
        g = clean_graph(self.tmp / "graphify-out/graph.json")
        names = self.tmp / "nama.json"
        names.write_text(json.dumps({"0": "Satu", "1": "Community 1", "9": "Nama Yang Sah"}), encoding="utf-8")
        res = run("namai", "tulis", "--nama", names, "--graph", g)
        self.assertEqual(res.returncode, 1)
        self.assertIn("2-6 kata", res.stdout)
        self.assertIn("nama sementara", res.stdout)
        self.assertIn("tidak ada di graph", res.stdout)
        self.assertFalse((g.parent / ".graphify_labels.json").exists())

    def test_gabung_dengan_nama_lama(self):
        g = clean_graph(self.tmp / "graphify-out/graph.json")
        (g.parent / ".graphify_labels.json").write_text(json.dumps({"0": "Nama Lama Nol", "1": "Nama Lama Satu"}), encoding="utf-8")
        names = self.tmp / "nama.json"
        names.write_text(json.dumps({"1": "Halaman Komik Baru"}), encoding="utf-8")
        self.assertEqual(run("namai", "tulis", "--nama", names, "--graph", g).returncode, 0)
        saved = json.loads((g.parent / ".graphify_labels.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, {"0": "Nama Lama Nol", "1": "Halaman Komik Baru"})

    def test_nama_bentrok_dengan_nama_tersimpan(self):
        g = clean_graph(self.tmp / "graphify-out/graph.json")
        (g.parent / ".graphify_labels.json").write_text(json.dumps({"0": "Generator Alamat Email"}), encoding="utf-8")
        names = self.tmp / "nama.json"
        names.write_text(json.dumps({"1": "Generator Alamat Email"}), encoding="utf-8")
        res = run("namai", "tulis", "--nama", names, "--graph", g)
        self.assertEqual(res.returncode, 1)
        self.assertIn("bentrok", res.stdout)
        self.assertEqual(json.loads((g.parent / ".graphify_labels.json").read_text()), {"0": "Generator Alamat Email"})

    @unittest.skipUnless(HAVE_GRAPHIFY, "butuh CLI graphify")
    def test_terapkan_dengan_graphify_asli(self):
        src = self.tmp / "proyek"
        src.mkdir()
        (src / "mail.py").write_text("def buat():\n    return pecah()\n\ndef pecah():\n    return 1\n\ndef salin():\n    return buat()\n", encoding="utf-8")
        (src / "nav.py").write_text("from mail import buat\n\ndef langkah():\n    return buat()\n\ndef pergi():\n    return langkah()\n", encoding="utf-8")
        subprocess.run(["graphify", "extract", str(src), "--code-only"], capture_output=True, text=True, timeout=300, check=True)
        subprocess.run(["graphify", "cluster-only", str(src), "--no-label"], capture_output=True, text=True, timeout=300, check=True)
        g = src / "graphify-out/graph.json"
        rows = json.loads(run("namai", "ringkas", "--graph", g, "--json").stdout)
        names = {str(r["id"]): f"Komunitas Uji {chr(65 + i)}" for i, r in enumerate(rows)}
        (self.tmp / "nama.json").write_text(json.dumps(names), encoding="utf-8")
        res = run("namai", "tulis", "--nama", self.tmp / "nama.json", "--graph", g, "--terapkan")
        self.assertEqual(res.returncode, 0, res.stdout)
        applied = {str(n["community"]): n["community_name"] for n in json.loads(g.read_text())["nodes"] if n.get("community") is not None}
        self.assertEqual(applied, names)
        self.assertIn("Komunitas Uji A", (src / "graphify-out/GRAPH_REPORT.md").read_text(encoding="utf-8"))


class AuditTest(Base):
    def test_graph_bersih(self):
        g = clean_graph(self.tmp / "graph.json")
        res = run("audit", "--graph", g, "--akar", self.tmp, "--json")
        self.assertEqual(res.returncode, 0)
        data = json.loads(res.stdout)
        self.assertFalse([f for f in data["temuan"] if f["tingkat"] in ("GAGAL", "PERINGATAN")])
        self.assertEqual(data["ringkas"]["node"], 6)

    def test_path_sensitif_gagal(self):
        nodes = [node("a", "simpan()", "studio-nangka/pelanggan/pesanan.py"), node("b", "x()", "a.py"), node("c", "y()", "a.py")]
        g = write_graph(self.tmp / "graph.json", nodes, [edge("a", "b"), edge("b", "c")])
        res = run("audit", "--graph", g, "--akar", self.tmp)
        self.assertEqual(res.returncode, 1)
        self.assertIn("path sensitif", res.stdout)

    def test_noise_minified_dan_nama_sementara(self):
        nodes = [node(f"n{i}", f"{chr(97 + i)}()", "vendor/gsap.min.js", 0, "Community 0") for i in range(8)]
        nodes += [node("ok", "ComicPage()", "src/page.tsx", 0, "Community 0")]
        links = [edge(f"n{i}", f"n{i + 1}") for i in range(7)]
        g = write_graph(self.tmp / "graph.json", nodes, links)
        out = self.tmp / "audit/KRP-uji.md"
        res = run("audit", "--graph", g, "--akar", self.tmp, "--tulis", out)
        self.assertEqual(res.returncode, 0)
        self.assertIn("satu-dua huruf", res.stdout)
        self.assertIn("minified", res.stdout)
        self.assertIn("bernama sementara", res.stdout)
        self.assertTrue(out.exists())

    def test_inferred_nama_sama_antarfolder(self):
        nodes = [node("a", "hero()", "situs-pro/hero.js"), node("b", "hero()", "situs-kong/gerak.js"),
                 node("c", "x()", "situs-pro/hero.js")]
        g = write_graph(self.tmp / "graph.json", nodes, [edge("a", "b", "indirect_call", "INFERRED"), edge("c", "a")])
        self.assertIn("nama sama/pendek antarfolder", run("audit", "--graph", g, "--akar", self.tmp).stdout)


class BandingTest(Base):
    def test_dua_berkas(self):
        old = clean_graph(self.tmp / "lama.json")
        g = json.loads(old.read_text())
        g["nodes"].append(node("g", "baru()", "lib/baru.ts", 2, "Komunitas Baru"))
        g["links"].append(edge("g", "a"))
        g["nodes"] = [n for n in g["nodes"] if n["id"] != "f"]
        g["links"] = [e for e in g["links"] if "f" not in (e["source"], e["target"])]
        new = self.tmp / "baru.json"
        new.write_text(json.dumps(g), encoding="utf-8")
        data = json.loads(run("banding", old, new, "--json").stdout)
        self.assertEqual(data["jumlah_node_baru"], 1)
        self.assertEqual(data["jumlah_node_hilang"], 1)
        self.assertEqual(data["jumlah_edge_baru"], 1)
        self.assertEqual(data["jumlah_edge_hilang"], 1)
        self.assertEqual(data["file_baru"], ["lib/baru.ts"])
        self.assertEqual(data["komunitas_baru"], ["Komunitas Baru"])

    def test_mode_rev_git(self):
        repo = self.tmp / "repo"
        g = clean_graph(repo / "graphify-out/graph.json")
        git = lambda *a: subprocess.run(["git", *a], cwd=repo, capture_output=True, text=True, check=True)
        git("init", "-q")
        git("-c", "user.email=u@x", "-c", "user.name=u", "add", ".")
        git("-c", "user.email=u@x", "-c", "user.name=u", "commit", "-qm", "v1")
        data = json.loads(g.read_text())
        data["nodes"].append(node("h", "tambahan()", "lib/t.ts"))
        g.write_text(json.dumps(data), encoding="utf-8")
        res = run("banding", "--rev", "HEAD", "--graph", g, "--akar", repo, "--json")
        self.assertEqual(res.returncode, 0, res.stdout)
        self.assertEqual(json.loads(res.stdout)["jumlah_node_baru"], 1)


class SkillLibraryFixture(Base):
    def library(self):
        lib = self.tmp / "skills"
        make_skill(lib, "toko-dirigen", "Pintu masuk keluarga toko. Mengarahkan ke toko-harga dan toko-listing.",
                   "Pakai `toko-harga` lalu `toko-listing`.\n\n## Serah terima\n\nKe `toko-harga`.")
        make_skill(lib, "toko-harga", "Menghitung harga produk digital, potongan, dan titik impas untuk listing toko daring.",
                   "Baca `references/rumus.md`.\n\n## Serah terima\n\nKe `toko-listing`.",
                   {"references/rumus.md": "rumus", "references/studio-core.md": "inti", "scripts/lama.py": "print(1)"})
        make_skill(lib, "toko-listing", "Menulis judul dan deskripsi listing toko daring untuk produk digital.",
                   "Lihat `references/tidak-ada.md` dan `toko-foto`.")
        make_skill(lib, "toko-sendiri", "Skill yang tidak terhubung dengan skill lain mana pun di perpustakaan ini sama sekali.")
        return lib


class PetaSkillTest(SkillLibraryFixture):
    def test_graph_skill(self):
        lib = self.library()
        idx = self.tmp / "keluarga/skill-index.json"
        idx.parent.mkdir()
        idx.write_text(json.dumps({"system": "Keluarga Toko", "groups": {"A": "Inti"}, "skills": [
            {"name": "toko-dirigen", "group": "A", "role": "router", "next": [], "uses": []},
            {"name": "toko-harga", "group": "A", "role": "pipeline", "next": ["toko-listing"], "uses": []},
            {"name": "toko-listing", "group": "A", "role": "pipeline", "next": [], "uses": []}]}), encoding="utf-8")
        res = run("peta", "--skills", lib, "--akar", self.tmp, "--indeks", idx, "--keluar", self.tmp / "KRP-skill")
        self.assertEqual(res.returncode, 0, res.stdout)
        g = json.loads((self.tmp / "KRP-skill/graphify-out/graph.json").read_text())
        ids = {n["id"] for n in g["nodes"]}
        self.assertIn("skill_toko_harga", ids)
        self.assertIn("family_keluarga_toko", ids)
        self.assertFalse(any("studio_core" in i for i in ids))
        rels = {(e["source"], e["target"], e["relation"]) for e in g["links"]}
        self.assertIn(("skill_toko_dirigen", "skill_toko_harga", "references"), rels)
        self.assertIn(("skill_toko_harga", "skill_toko_listing", "hands_off_to"), rels)
        self.assertIn(("skill_toko_harga", "file_toko_harga_references_rumus_md", "uses"), rels)
        self.assertTrue(all(e["confidence"] == "EXTRACTED" for e in g["links"]))

    @unittest.skipUnless(HAVE_GRAPHIFY, "butuh CLI graphify")
    def test_bisa_dibaca_graphify(self):
        lib = self.library()
        run("peta", "--skills", lib, "--akar", self.tmp, "--indeks", "--keluar", self.tmp / "KRP-skill", "--cluster")
        gpath = self.tmp / "KRP-skill/graphify-out/graph.json"
        proc = subprocess.run(["graphify", "explain", "toko-harga", "--graph", str(gpath)], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("toko-dirigen", proc.stdout)


class TumpangTest(Base):
    def test_mirip_dan_frasa_bentrok(self):
        lib = self.tmp / "skills"
        make_skill(lib, "a-hitung", 'Menghitung harga produk digital, biaya potongan, titik impas, margin penjualan. Pakai saat "harganya berapa?"')
        make_skill(lib, "b-harga", 'Menghitung harga produk digital, biaya potongan, titik impas, margin penjualan toko. Pakai saat "harganya berapa?"')
        make_skill(lib, "c-foto", "Membuat foto mockup ruangan untuk listing dengan bingkai dan cahaya alami.")
        rows = json.loads(run("tumpang", "--skills", lib, "--json").stdout)
        self.assertEqual(len(rows), 1)
        self.assertEqual({rows[0]["a"], rows[0]["b"]}, {"a-hitung", "b-harga"})
        self.assertEqual(rows[0]["saran"], "ubah frasa pemicu")
        self.assertGreater(rows[0]["skor"], 0.5)

    def test_batas_tertulis(self):
        lib = self.tmp / "skills"
        make_skill(lib, "a-hitung", "Menghitung harga produk digital, biaya potongan, titik impas, margin penjualan.",
                   "## Kapan tidak digunakan\n\nMenulis listing: itu tugas b-harga.\n")
        make_skill(lib, "b-harga", "Menghitung harga produk digital, biaya potongan, titik impas, margin penjualan toko.")
        rows = json.loads(run("tumpang", "--skills", lib, "--json").stdout)
        self.assertTrue(rows[0]["batas_tertulis"])
        self.assertTrue(rows[0]["saran"].startswith("cukup"))

    def test_frasa_satu_kata_bukan_bentrok(self):
        lib = self.tmp / "skills"
        make_skill(lib, "a-hook", 'Mengatur bagian "## graphify" di CLAUDE.md dan hook asisten untuk mode selalu aktif.')
        make_skill(lib, "b-git", 'Memasang hook git agar graph diperbarui. Pakai saat "pasang hook graphify" diminta pengguna.')
        make_skill(lib, "c-cli", 'Memasang CLI. Pakai saat "pasang graphify" atau "graphify command not found" muncul.')
        make_skill(lib, "d-mcp", 'Server MCP. Pakai saat "pasang graphify di Claude Desktop" diminta pengguna.')
        rows = json.loads(run("tumpang", "--skills", lib, "--ambang", "0.9", "--json").stdout)
        pairs = {frozenset((r["a"], r["b"])) for r in rows}
        self.assertNotIn(frozenset(("a-hook", "b-git")), pairs)
        self.assertIn(frozenset(("c-cli", "d-mcp")), pairs)


class CelahTest(SkillLibraryFixture):
    def test_temuan(self):
        lib = self.library()
        res = run("celah", "--skills", lib, "--akar", self.tmp, "--json")
        self.assertEqual(res.returncode, 1)
        found = {(f["tingkat"], f["skill"], f["temuan"]) for f in json.loads(res.stdout)}
        texts = " | ".join(t for _, _, t in found)
        self.assertIn(("GAGAL", "toko-listing", "file yang dirujuk tidak ada: references/tidak-ada.md"), found)
        self.assertIn(("GAGAL", "toko-listing", "menyebut skill yang tidak ada: `toko-foto`"), found)
        self.assertIn(("INFO", "toko-sendiri", "skill yatim: tidak merujuk dan tidak dirujuk skill lain"), found)
        self.assertIn("file tidak disebut di skill ini: scripts/lama.py", texts)
        self.assertNotIn("studio-core.md", texts)

    def test_deskripsi_terpotong_komentar_yaml(self):
        lib = self.tmp / "skills"
        make_skill(lib, "y-satu", "Mengatur bagian ## graphify di CLAUDE.md agar asisten memakai graph sebelum membaca berkas.", "Ke `y-dua`.")
        make_skill(lib, "y-dua", "Skill dua yang cukup panjang deskripsinya untuk memicu dengan tepat dan jelas sekali.", "Dari `y-satu`.")
        res = run("celah", "--skills", lib, "--akar", self.tmp, "--json")
        self.assertEqual(res.returncode, 1)
        self.assertIn("komentar", res.stdout)

    def test_perpustakaan_bersih(self):
        lib = self.tmp / "skills"
        make_skill(lib, "x-satu", "Skill satu yang cukup panjang deskripsinya untuk memicu dengan tepat dan jelas sekali.", "Ke `x-dua`.")
        make_skill(lib, "x-dua", "Skill dua yang cukup panjang deskripsinya untuk memicu dengan tepat dan jelas sekali.", "Dari `x-satu`.")
        self.assertEqual(run("celah", "--skills", lib, "--akar", self.tmp).returncode, 0)


class DampakTest(Base):
    def repo(self):
        root = self.tmp / "repo"
        make_skill(root / ".claude/skills", "toko-harga", "Menghitung harga.", "Isi.")
        make_skill(root / ".claude/skills", "toko-listing", "Menulis listing. Jangan dipakai untuk harga, itu tugas toko-harga.",
                   "## Langkah kerja\n\nPanggil `toko-harga`.\n\n## Serah terima\n\nKe `toko-harga`.\n")
        (root / "docs").mkdir()
        (root / "docs/catatan.md").write_text("Catatan: toko-harga dipakai bulan ini. toko-hargaku bukan.\n", encoding="utf-8")
        return root

    def test_klasifikasi(self):
        root = self.repo()
        data = json.loads(run("dampak", "toko-harga", "--akar", root, "--json").stdout)
        levels = sorted((h["tingkat"], h["lokasi"]) for h in data["kemunculan"])
        self.assertIn(("TINGGI", "frontmatter (description)"), levels)
        self.assertIn(("TINGGI", "bagian 'Serah terima'"), levels)
        self.assertIn(("SEDANG", "bagian 'Langkah kerja'"), levels)
        self.assertIn(("RENDAH", "dokumen"), levels)
        self.assertEqual(sum(1 for h in data["kemunculan"] if h["file"] == "docs/catatan.md"), 1)

    def test_ganti_nama(self):
        root = self.repo()
        dry = run("dampak", "toko-harga", "--akar", root, "--ganti-nama", "toko-tarif")
        self.assertIn("Belum ada yang diubah", dry.stdout)
        self.assertTrue((root / ".claude/skills/toko-harga").exists())
        res = run("dampak", "toko-harga", "--akar", root, "--ganti-nama", "toko-tarif", "--terapkan")
        self.assertEqual(res.returncode, 0, res.stdout)
        self.assertTrue((root / ".claude/skills/toko-tarif/SKILL.md").exists())
        self.assertFalse((root / ".claude/skills/toko-harga").exists())
        self.assertIn("toko-tarif", (root / ".claude/skills/toko-listing/SKILL.md").read_text())
        self.assertIn("toko-hargaku", (root / "docs/catatan.md").read_text())


class DiagramTest(Base):
    def test_dari_indeks(self):
        idx = self.tmp / "skill-index.json"
        idx.write_text(json.dumps({"system": "Uji", "groups": {"A": "Satu"}, "skills": [
            {"name": "u-dirigen", "group": "A", "role": "router", "next": [], "uses": []},
            {"name": "u-kerja", "group": "A", "role": "pipeline", "next": ["u-akhir"], "uses": ["u-layanan"]},
            {"name": "u-akhir", "group": "A", "role": "pipeline", "next": [], "uses": []},
            {"name": "u-layanan", "group": "A", "role": "service", "next": [], "uses": []}]}), encoding="utf-8")
        out = run("diagram", "--indeks", idx).stdout
        self.assertIn("```mermaid", out)
        self.assertIn('subgraph GA["A. Satu"]', out)
        self.assertIn("u_kerja --> u_akhir", out)
        self.assertIn("u_kerja -.-> u_layanan", out)
        self.assertIn("class u_dirigen router", out)

    def test_dari_awalan_tandai_yatim(self):
        lib = self.tmp / "skills"
        make_skill(lib, "q-satu", "Satu.", "Ke q-dua.")
        make_skill(lib, "q-dua", "Dua.")
        make_skill(lib, "q-tiga", "Tiga.")
        out = run("diagram", "--awalan", "q-", "--skills", lib).stdout
        self.assertIn("q_satu --> q_dua", out)
        self.assertIn("class q_tiga yatim", out)


class HookTest(Base):
    def test_bungkus_idempoten_dan_lepas(self):
        s = self.tmp / "settings.json"
        s.write_text(json.dumps({"hooks": {
            "PreToolUse": [{"matcher": "Read|Glob", "hooks": [{"type": "command", "command": "graphify hook-guard read", "timeout": 10},
                                                              {"type": "command", "command": "echo lain"}]}],
            "SessionStart": [{"matcher": "compact", "hooks": [{"type": "command", "command": "graphify hook-guard compact"}]}]}}), encoding="utf-8")
        self.assertEqual(run("hook", "--settings", s, "--periksa").returncode, 1)
        self.assertIn("2 hook dibungkus", run("hook", "--settings", s).stdout)
        self.assertIn("0 hook dibungkus", run("hook", "--settings", s).stdout)
        self.assertEqual(run("hook", "--settings", s, "--periksa").returncode, 0)
        data = json.loads(s.read_text())
        cmds = [h["command"] for h in data["hooks"]["PreToolUse"][0]["hooks"]]
        self.assertEqual(cmds[0], "if command -v graphify >/dev/null 2>&1; then graphify hook-guard read; fi")
        self.assertEqual(cmds[1], "echo lain")
        proc = subprocess.run(["/bin/sh", "-c", cmds[0]], env={"PATH": "/nonexistent"}, capture_output=True)
        self.assertEqual(proc.returncode, 0)
        run("hook", "--settings", s, "--lepas")
        self.assertEqual(json.loads(s.read_text())["hooks"]["PreToolUse"][0]["hooks"][0]["command"], "graphify hook-guard read")


if __name__ == "__main__":
    unittest.main(verbosity=1)
