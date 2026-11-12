#!/usr/bin/env python3
"""Uji unit untuk semua skrip di paket skill Studio Wall Art by Nangka.

Pakai:  python3 studio-wall-art-by-nangka/tests/test_scripts.py

Tiap skrip dijalankan sebagai proses terpisah, persis seperti cara skill memakainya.
Uji yang butuh Pillow dilewati bila Pillow tidak terpasang.
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".claude" / "skills"

try:
    from PIL import Image
    HAVE_PIL = True
except ImportError:
    HAVE_PIL = False

SCRIPT = {
    "handoff": SKILLS / "studio-wall-art-orchestrator/scripts/validate_handoff.py",
    "palette": SKILLS / "wall-art-reference-reader/scripts/extract_palette.py",
    "math": SKILLS / "wall-art-ratio-resolution-planner/scripts/print_math.py",
    "export": SKILLS / "wall-art-color-export-manager/scripts/export_print_files.py",
    "package": SKILLS / "wall-art-download-package-builder/scripts/build_package.py",
    "pdf": SKILLS / "wall-art-print-instruction-writer/scripts/make_guide_pdf.py",
    "pricing": SKILLS / "etsy-digital-pricing-modeler/scripts/pricing_model.py",
    "tags": SKILLS / "etsy-tag-attribute-mapper/scripts/check_tags.py",
    "listing": SKILLS / "etsy-listing-preflight-reviewer/scripts/check_listing.py",
    "mockup": SKILLS / "wall-art-mockup-art-director/scripts/make_listing_images.py",
    "catalog": SKILLS / "etsy-catalog-sku-manager/scripts/check_catalog.py",
}


def run(key, *args):
    proc = subprocess.run([sys.executable, str(SCRIPT[key]), *map(str, args)], capture_output=True, text=True)
    return proc.returncode, proc.stdout + proc.stderr


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="nangka-uji-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def image(self, name="master.png", size=(2400, 3600)):
        img = Image.new("RGB", size, (243, 235, 221))
        img.paste((138, 154, 107), (size[0] // 3, size[1] // 2, 2 * size[0] // 3, 3 * size[1] // 4))
        path = self.tmp / name
        img.save(path)
        return path


class HandoffTest(Base):
    template = SKILLS / "studio-wall-art-orchestrator/assets/handoff-template.json"

    def test_template_valid(self):
        code, out = run("handoff", self.template)
        self.assertEqual(code, 0, out)
        self.assertIn("VALID", out)

    def test_missing_field_and_bad_values(self):
        data = json.loads(self.template.read_text())
        del data["status"]
        data["project_id"] = "proyek satu"
        data["next_skill"] = "studio-wall-art-orchestrator"
        path = self.tmp / "h.json"
        path.write_text(json.dumps(data))
        code, out = run("handoff", path)
        self.assertEqual(code, 1)
        self.assertIn("field wajib hilang: status", out)
        self.assertIn("format project_id salah", out)
        self.assertIn("orchestrator", out)

    def test_passed_with_unknown_rights_rejected(self):
        data = json.loads(self.template.read_text())
        data.update(status="passed", rights_status="unknown")
        path = self.tmp / "h.json"
        path.write_text(json.dumps(data))
        code, out = run("handoff", path)
        self.assertEqual(code, 1)
        self.assertIn("tidak boleh bersama", out)

    def test_verified_artifact_must_exist(self):
        data = json.loads(self.template.read_text())
        data["output_artifacts"] = [{"path": "tidak-ada.jpg", "type": "gambar", "verified": True}]
        path = self.tmp / "h.json"
        path.write_text(json.dumps(data))
        code, out = run("handoff", path, "--root", self.tmp)
        self.assertEqual(code, 1)
        self.assertIn("file tidak ada", out)


class PrintMathTest(Base):
    def test_full_size_master(self):
        plan_path = self.tmp / "plan.json"
        code, out = run("math", "--width", 7200, "--height", 10800, "--json", plan_path)
        self.assertEqual(code, 0, out)
        plan = json.loads(plan_path.read_text())
        by_key = {r["key"]: r for r in plan["ratios"]}
        last = by_key["2x3"]["sizes"][-1]
        self.assertEqual((last["size"], last["ppi"], last["status"]), ("24x36", 300.0, "ok"))
        self.assertEqual(by_key["4x5"]["kept_height_pct"], 83.3)
        self.assertEqual(by_key["4x5"]["export_px"], [4800, 6000])
        self.assertEqual(by_key["3x4"]["export_px"], [5400, 7200])
        self.assertEqual(by_key["iso"]["export_px"], [7016, 9933])

    def test_small_master_not_claimed(self):
        plan_path = self.tmp / "plan.json"
        code, _ = run("math", "--width", 2048, "--height", 3072, "--json", plan_path)
        self.assertEqual(code, 0)
        ratio = json.loads(plan_path.read_text())["ratios"][0]
        sizes = {s["size"]: s for s in ratio["sizes"]}
        self.assertEqual(sizes["24x36"]["status"], "kurang")
        self.assertEqual(sizes["4x6"]["status"], "ok")
        self.assertEqual(sizes["8x12"]["status"], "cukup")
        self.assertEqual(ratio["largest_at_target_ppi"], "4x6")

    def test_focus_moves_crop_and_stays_inside(self):
        plan_path = self.tmp / "plan.json"
        run("math", "--width", 2000, "--height", 3000, "--focus", "0.5,0.95", "--ratios", "4x5", "--json", plan_path)
        box = json.loads(plan_path.read_text())["ratios"][0]["crop_box"]
        self.assertEqual(box, [0, 500, 2000, 3000])

    def test_landscape_swaps_sizes(self):
        plan_path = self.tmp / "plan.json"
        run("math", "--width", 10800, "--height", 7200, "--ratios", "2x3", "--json", plan_path)
        ratio = json.loads(plan_path.read_text())["ratios"][0]
        self.assertEqual(ratio["sizes"][-1]["size"], "36x24")
        self.assertEqual(ratio["sizes"][-1]["status"], "ok")

    def test_bad_input_rejected(self):
        code, out = run("math", "--width", 1000, "--height", 1500, "--ratios", "9x9")
        self.assertEqual(code, 1)
        self.assertIn("rasio tidak dikenal", out)


class PdfTest(Base):
    def test_pdf_structure(self):
        source = SKILLS / "wall-art-print-instruction-writer/assets/print-guide-template.txt"
        target = self.tmp / "guide.pdf"
        code, out = run("pdf", source, target, "--title", "Print Guide")
        self.assertEqual(code, 0, out)
        data = target.read_bytes()
        self.assertTrue(data.startswith(b"%PDF-1.4"))
        self.assertTrue(data.rstrip().endswith(b"%%EOF"))
        pages = data.count(b"/Type /Page\n")
        self.assertGreaterEqual(pages, 1)
        self.assertIn(f"{pages} halaman", out)
        xref = int(data[data.rfind(b"startxref"):].split()[1])
        lines = data[xref:].split(b"\n")
        count = int(lines[1].split()[1])
        for number in range(1, count):
            offset = int(lines[2 + number].split()[0])
            self.assertTrue(data[offset:].startswith(b"%d 0 obj" % number))

    def test_long_text_makes_more_pages(self):
        source = self.tmp / "long.txt"
        source.write_text("# Title\n" + "\n".join(f"Line number {i} of a long guide." for i in range(120)))
        target = self.tmp / "long.pdf"
        code, _ = run("pdf", source, target)
        self.assertEqual(code, 0)
        self.assertGreaterEqual(target.read_bytes().count(b"/Type /Page\n"), 3)


class PricingTest(Base):
    example = SKILLS / "etsy-digital-pricing-modeler/assets/contoh-input-harga.json"

    def test_example_numbers(self):
        out_path = self.tmp / "hasil.json"
        code, out = run("pricing", "--input", self.example, "--today", "2026-11-12", "--json", out_path)
        self.assertEqual(code, 0, out)
        rows = {r["price"]: r for r in json.loads(out_path.read_text())["rows"]}
        # 6.00: 0.065*6 + 0.045*6 + 7000/16000 + 0.20 = 1.2975
        self.assertEqual(rows[6.0]["fees_per_order"], 1.3)
        self.assertEqual(rows[6.0]["net_per_order"], 4.7)
        self.assertEqual(rows[6.0]["breakeven_orders"], 4.8)
        self.assertEqual(out.count("PERINGATAN"), 4)

    def test_missing_fx_stops(self):
        data = json.loads(self.example.read_text())
        data["fees"]["fx_local_per_usd"]["value"] = None
        path = self.tmp / "in.json"
        path.write_text(json.dumps(data))
        code, out = run("pricing", "--input", path, "--today", "2026-11-12")
        self.assertEqual(code, 1)
        self.assertIn("kurs", out)

    def test_stale_fees_warned(self):
        code, out = run("pricing", "--input", self.example, "--today", "2027-06-01")
        self.assertEqual(code, 0)
        self.assertIn("cek ulang", out)

    def test_studio_fees_template_needs_fx(self):
        fees = SKILLS / "etsy-policy-fact-checker/assets/fees-template.json"
        path = self.tmp / "in.json"
        path.write_text(json.dumps({"fees_file": str(fees), "prices": [6]}))
        code, out = run("pricing", "--input", path, "--today", "2026-11-12")
        self.assertEqual(code, 1, out)
        self.assertIn("kurs", out)


class TagsTest(Base):
    def test_valid_thirteen(self):
        tags = [f"nursery art {i}" for i in range(13)]
        code, out = run("tags", *tags)
        self.assertEqual(code, 0, out)
        self.assertIn("LULUS: 13 tag", out)

    def test_long_duplicate_and_symbol(self):
        code, out = run("tags", "nursery wall art", "this tag is far too long for etsy", "nursery wall art", "boho & chic")
        self.assertEqual(code, 1)
        self.assertIn("33 karakter", out)
        self.assertIn("ganda", out)
        self.assertIn("hanya huruf", out)

    def test_too_many(self):
        code, out = run("tags", *[f"tag {i}" for i in range(14)])
        self.assertEqual(code, 1)
        self.assertIn("melebihi batas 13", out)


class CatalogTest(Base):
    header = (SKILLS / "etsy-catalog-sku-manager/assets/katalog-template.csv").read_text()

    def write(self, *rows):
        path = self.tmp / "katalog.csv"
        path.write_text(self.header + "".join(r + "\n" for r in rows))
        return path

    def test_empty_template(self):
        code, out = run("catalog", SKILLS / "etsy-catalog-sku-manager/assets/katalog-template.csv")
        self.assertEqual(code, 0, out)
        self.assertIn("LULUS: 0 baris", out)

    def test_valid_rows_with_relation(self):
        path = self.write(
            "NGK-STRP-01,siap,satuan,Kutilang,COL-satwa-tropis,ART-satwa-tropis-01,v1,,,6,,,,NGK-STRP-SET3,",
            "NGK-STRP-SET3,ide,set,Set tiga,COL-satwa-tropis,ART-satwa-tropis-01;ART-satwa-tropis-02,v1,,,,,,,NGK-STRP-01,")
        code, out = run("catalog", path)
        self.assertEqual(code, 0, out)

    def test_duplicates_and_incomplete_published(self):
        path = self.write(
            "NGK-STRP-01,terbit,satuan,A,COL-satwa-tropis,ART-satwa-tropis-01,v1,,,,,,,,",
            "NGK-STRP-01,siap,satuan,B,COL-satwa-tropis,ART-satwa-tropis-02,1,,,,,,,NGK-XXXX-09,")
        code, out = run("catalog", path)
        self.assertEqual(code, 1)
        for text in ("SKU ganda", "status terbit tetapi listing_id_etsy kosong", "versi harus", "terkait_sku tidak ada"):
            self.assertIn(text, out)

    def test_root_checks_files(self):
        path = self.write("NGK-STRP-01,siap,satuan,A,COL-satwa-tropis,ART-satwa-tropis-01,v1,,,6,m.png,paket,listing.json,,")
        code, out = run("catalog", path, "--root", self.tmp)
        self.assertEqual(code, 1)
        self.assertIn("file_sumber tidak ditemukan", out)


@unittest.skipUnless(HAVE_PIL, "Pillow tidak terpasang")
class ImagePipelineTest(Base):
    def pipeline(self):
        master = self.image()
        plan = self.tmp / "plan.json"
        self.assertEqual(run("math", "--image", master, "--json", plan)[0], 0)
        export = self.tmp / "ekspor"
        code, out = run("export", "--image", master, "--plan", plan, "--out", export, "--name", "uji-01")
        self.assertEqual(code, 0, out)
        return master, plan, export

    def test_palette_self_test(self):
        code, out = run("palette", "--self-test")
        self.assertEqual(code, 0, out)
        self.assertIn("SELF-TEST OK", out)

    def test_palette_reads_file(self):
        code, out = run("palette", self.image(size=(300, 450)), "--colors", "2")
        self.assertEqual(code, 0, out)
        self.assertIn("#F3EBDD", json.dumps(json.loads(out)))

    def test_palette_finds_accents_on_grainy_background(self):
        img = Image.new("RGB", (900, 1350), (243, 235, 221))
        img.paste((138, 154, 107), (300, 600, 600, 1000))
        img.paste((201, 141, 107), (400, 450, 560, 610))
        img.paste((217, 164, 65), (700, 200, 760, 260))
        grain = Image.effect_noise(img.size, 10).convert("RGB")
        path = self.tmp / "berbutir.png"
        Image.blend(img, grain, 0.04).save(path)
        code, out = run("palette", path, "--colors", "6")
        self.assertEqual(code, 0, out)
        rows = json.loads(out)["warna"]
        self.assertEqual(len(rows), 4, rows)
        self.assertGreater(rows[0]["persen"], 80)

        def near(target):
            return any(sum((int(r["hex"][i:i + 2], 16) - c) ** 2 for i, c in zip((1, 3, 5), target)) ** 0.5 < 30 for r in rows)
        for target in ((138, 154, 107), (201, 141, 107), (217, 164, 65)):
            self.assertTrue(near(target), f"warna {target} tidak ditemukan: {rows}")

    def test_export_files(self):
        _, plan, export = self.pipeline()
        names = sorted(p.name for p in export.glob("*.jpg"))
        self.assertEqual(names, ["uji-01_11x14_native.jpg", "uji-01_2x3_8x12in.jpg", "uji-01_3x4_6x8in.jpg",
                                 "uji-01_4x5_8x10in.jpg", "uji-01_iso_a5.jpg"])
        with Image.open(export / "uji-01_4x5_8x10in.jpg") as img:
            self.assertEqual(img.size, (2400, 3000))
            self.assertEqual(img.mode, "RGB")
            self.assertEqual(round(img.info["dpi"][0]), 300)
            self.assertTrue(img.info.get("icc_profile"))
        report = json.loads((export / "uji-01_laporan-ekspor.json").read_text())
        native = [f for f in report["files"] if f["ratio"] == "11x14"][0]
        self.assertTrue(any("belum mencapai target" in w for w in native["warnings"]))

    def test_export_rejects_bad_name_and_mismatched_plan(self):
        master, plan, _ = self.pipeline()
        code, out = run("export", "--image", master, "--plan", plan, "--out", self.tmp / "x", "--name", "Nama Salah")
        self.assertEqual(code, 1)
        other = self.image("lain.png", size=(1000, 1500))
        code, out = run("export", "--image", other, "--plan", plan, "--out", self.tmp / "x", "--name", "uji-02")
        self.assertEqual(code, 1)
        self.assertIn("tidak sama dengan rencana", out)

    def test_export_fails_when_limit_too_small(self):
        master, plan, _ = self.pipeline()
        code, out = run("export", "--image", master, "--plan", plan, "--out", self.tmp / "kecil",
                        "--name", "uji-03", "--max-mb", "0.001")
        self.assertEqual(code, 1)
        self.assertIn("GAGAL", out)

    def test_package_zips_when_over_limit_and_keeps_pdf_apart(self):
        _, _, export = self.pipeline()
        guide = SKILLS / "wall-art-print-instruction-writer/assets/print-guide-template.txt"
        self.assertEqual(run("pdf", guide, export / "uji-01_print-guide.pdf")[0], 0)
        package = self.tmp / "paket"
        code, out = run("package", "--src", export, "--out", package, "--expect", "2x3,3x4,4x5,11x14,iso")
        self.assertEqual(code, 0, out)
        manifest = json.loads((package / "manifest.json").read_text())
        self.assertEqual(manifest["verdict"], "pass")
        self.assertEqual(len(manifest["deliverables"]), 5)
        self.assertTrue((package / "uji-01_print-guide.pdf").is_file())
        zips = list(package.glob("*.zip"))
        self.assertEqual(len(zips), 1)
        with zipfile.ZipFile(zips[0]) as archive:
            self.assertEqual(len(archive.namelist()), 2)
            self.assertFalse(any(n.endswith(".pdf") for n in archive.namelist()))

    def test_package_fails_on_bad_name_and_missing_ratio(self):
        _, _, export = self.pipeline()
        (export / "uji-01_4x5_8x10in.jpg").unlink()
        shutil.copy(export / "uji-01_iso_a5.jpg", export / "Gambar Final.jpg")
        package = self.tmp / "paket"
        code, out = run("package", "--src", export, "--out", package, "--expect", "2x3,4x5")
        self.assertEqual(code, 1)
        self.assertIn("FAIL  nama file", out)
        self.assertIn("4x5", out)
        self.assertFalse(package.exists())

    def test_package_no_zip_flag(self):
        _, _, export = self.pipeline()
        shutil.copy(export / "uji-01_iso_a5.jpg", export / "uji-01_tambahan.jpg")
        code, out = run("package", "--src", export, "--out", self.tmp / "paket", "--no-zip")
        self.assertEqual(code, 1)
        self.assertIn("--no-zip", out)

    def test_listing_images(self):
        master, plan, _ = self.pipeline()
        out_dir = self.tmp / "gambar"
        code, out = run("mockup", "--image", master, "--out", out_dir, "--name", "uji-01", "--plan", plan)
        self.assertEqual(code, 0, out)
        for suffix in ("01-bingkai", "02-ukuran", "03-detail"):
            with Image.open(out_dir / f"uji-01_{suffix}.jpg") as img:
                self.assertEqual(img.size, (2000, 2000))
        code, out = run("mockup", "--image", master, "--out", out_dir, "--name", "uji-01", "--wall", "merah")
        self.assertEqual(code, 1)

    def listing(self, **changes):
        master, plan, export = self.pipeline()
        images = self.tmp / "gambar"
        run("mockup", "--image", master, "--out", images, "--name", "uji-01", "--plan", plan)
        data = {
            "schema": "studio-nangka/listing@1", "sku": "NGK-UJI-01", "listing_type": "digital",
            "title": "Tropical Bird Nursery Wall Art, Printable Jungle Animal Print",
            "description": ("A calm tropical bird print for a nursery or kids room. THIS IS A DIGITAL DOWNLOAD. "
                            "No physical item will be shipped. Frame not included. You get high-resolution JPG files "
                            "in several ratios plus a print guide. This artwork was created with the help of AI tools "
                            "and finished by our studio. For personal use only."),
            "tags": ["nursery wall art", "tropical nursery art", "bird nursery print"],
            "category": "Digital Prints", "price_usd": 6.0, "ai_assisted": True,
            "digital_files": [f"ekspor/{p.name}" for p in sorted(export.glob("*.jpg"))],
            "images": [f"gambar/{p.name}" for p in sorted(images.glob("*.jpg"))],
            "claims": {"sizes": ["8x10", "8x12", "A5"], "file_count": 5},
        }
        data.update(changes)
        path = self.tmp / "listing.json"
        path.write_text(json.dumps(data))
        return path, plan

    def test_listing_passes_with_notes(self):
        path, plan = self.listing()
        code, out = run("listing", path, "--root", self.tmp, "--plan", plan)
        self.assertEqual(code, 0, out)
        self.assertIn("PASS_WITH_NOTES", out)
        self.assertNotIn("FAIL ", out)

    def test_listing_catches_real_problems(self):
        path, plan = self.listing(
            title="x" * 150, tags=[f"tag {i}" for i in range(14)],
            description="A lovely print. " * 20, claims={"sizes": ["24x36"], "file_count": 6},
            digital_files=["ekspor/tidak-ada.jpg"])
        code, out = run("listing", path, "--root", self.tmp, "--plan", plan)
        self.assertEqual(code, 1)
        for text in ("judul terisi", "tag sesuai batas", "deskripsi menyebut produk digital",
                     "deskripsi menyebut bantuan AI", "file digital ada di disk",
                     "ukuran yang diklaim memenuhi target PPI", "jumlah file yang dijanjikan"):
            self.assertRegex(out, rf"FAIL\s+{text}")

    def test_listing_flags_risky_words(self):
        path, plan = self.listing(title="Framed Canvas Bird Print, Guaranteed Museum Quality")
        code, out = run("listing", path, "--root", self.tmp, "--plan", plan)
        self.assertEqual(code, 0)
        self.assertRegex(out, r"WARN\s+tanpa kata berisiko")


if __name__ == "__main__":
    unittest.main(verbosity=1)
