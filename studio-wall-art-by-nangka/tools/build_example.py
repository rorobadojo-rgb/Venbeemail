#!/usr/bin/env python3
"""Uji perjalanan pengguna: bangun ulang contoh proyek dari brief sampai paket listing.

Pakai:  python3 studio-wall-art-by-nangka/tools/build_example.py

Yang dilakukan (semuanya nyata, bukan tiruan keluaran):
  1. Menggambar karya uji sintetis dengan Pillow (BUKAN karya jual; pengganti hasil alat AI).
  2. Menjalankan skrip skill produksi: rencana rasio, ekspor, panduan PDF, paket, gambar listing.
  3. Menjalankan model harga, pemeriksa tag, pemeriksa listing, pemeriksa katalog.
  4. Menulis serah terima tiap tahap dan memvalidasinya dengan validate_handoff.py.
  5. Menulis log perjalanan: contoh-proyek/log-perjalanan.json

Dokumen teks tahap kreatif (brief, catatan kreatif, lembar penawaran, panduan cetak) ada di folder
contoh dan ditulis mengikuti format skill; skrip ini tidak mengubahnya.
Butuh Pillow. Keluar 0 bila semua langkah berhasil.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".claude" / "skills"
STUDIO = ROOT / "studio-wall-art-by-nangka" / "contoh-proyek" / "studio-nangka"
PROJECT_ID = "PRJ-202611-satwa-tropis"
COLLECTION_ID = "COL-satwa-tropis"
ARTWORK_ID = "ART-satwa-tropis-01"
TODAY = "2026-11-12"
PROJECT = STUDIO / "proyek" / PROJECT_ID
ART = PROJECT / "karya" / ARTWORK_ID
LISTING = PROJECT / "listing" / "kutilang-satuan"
HANDOFF = PROJECT / "serah-terima"
NAME = "satwa-tropis-01"
FOCUS = "0.5,0.6"
LOG = []

TITLE = "Tropical Bird Nursery Wall Art, Printable Jungle Animal Print, Neutral Nursery Decor"
TAGS = ["nursery wall art", "tropical nursery art", "bird nursery print", "printable wall art",
        "neutral nursery art", "jungle nursery decor", "kids room wall art", "baby room print",
        "bird wall art", "digital download", "nursery printables", "baby shower gift", "animal wall art"]


def step(label, key, *args, expect=0):
    script = {
        "math": "wall-art-ratio-resolution-planner/scripts/print_math.py",
        "export": "wall-art-color-export-manager/scripts/export_print_files.py",
        "pdf": "wall-art-print-instruction-writer/scripts/make_guide_pdf.py",
        "package": "wall-art-download-package-builder/scripts/build_package.py",
        "mockup": "wall-art-mockup-art-director/scripts/make_listing_images.py",
        "palette": "wall-art-reference-reader/scripts/extract_palette.py",
        "pricing": "etsy-digital-pricing-modeler/scripts/pricing_model.py",
        "tags": "etsy-tag-attribute-mapper/scripts/check_tags.py",
        "listing": "etsy-listing-preflight-reviewer/scripts/check_listing.py",
        "catalog": "etsy-catalog-sku-manager/scripts/check_catalog.py",
        "handoff": "studio-wall-art-orchestrator/scripts/validate_handoff.py",
    }[key]
    proc = subprocess.run([sys.executable, str(SKILLS / script), *map(str, args)], capture_output=True, text=True)
    output = (proc.stdout + proc.stderr).strip()
    ok = proc.returncode == expect
    LOG.append({"langkah": label, "skrip": script.split("/")[-1], "kode_keluar": proc.returncode,
                "sesuai_harapan": ok, "keluaran": output.replace(str(ROOT) + "/", "")})
    print(("ok   " if ok else "GAGAL") + f" {label}")
    if not ok:
        print(output)
    return ok, output


def draw_master(path):
    from PIL import Image, ImageDraw

    width, height = 3600, 5400
    ivory, olive, terracotta, umber, turmeric = (243, 235, 221), (138, 154, 107), (201, 141, 107), (74, 59, 47), (217, 164, 65)
    img = Image.new("RGB", (width, height), ivory)
    d = ImageDraw.Draw(img)
    d.line((500, 3930, 3100, 4130), fill=umber, width=46)                      # dahan
    d.ellipse((2330, 3890, 2690, 4070), fill=olive)                            # daun, menempel di atas dahan
    d.ellipse((2660, 4110, 2980, 4270), fill=olive)                            # daun, menempel di bawah dahan
    d.polygon([(1340, 3300), (760, 3760), (1420, 3640)], fill=umber)           # ekor
    d.ellipse((1240, 2560, 2300, 3960), fill=olive)                            # badan
    d.ellipse((1640, 2160, 2280, 2800), fill=terracotta)                       # kepala
    d.polygon([(2260, 2420), (2560, 2500), (2260, 2580)], fill=turmeric)       # paruh
    d.ellipse((2020, 2370, 2110, 2460), fill=umber)                            # mata
    d.line((1700, 3930, 1700, 4020), fill=umber, width=22)                     # kaki, berhenti di dahan
    d.line((1900, 3940, 1900, 4035), fill=umber, width=22)
    d.ellipse((2700, 1150, 2860, 1310), fill=turmeric)                         # aksen
    grain = Image.effect_noise((width // 3, height // 3), 10).resize((width, height), Image.Resampling.BILINEAR).convert("RGB")
    img = Image.blend(img, grain, 0.035)
    img.save(path, "JPEG", quality=93, subsampling=0)
    return width, height


def handoff(number, skill, status, next_skill, **extra):
    data = {"schema": "studio-nangka/handoff@1", "skill": skill, "date": TODAY, "project_id": PROJECT_ID,
            "collection_id": COLLECTION_ID, "version": "v1", "status": status}
    data.update(extra)
    data["next_skill"] = next_skill
    path = HANDOFF / f"{number:02d}-{skill}.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def rel(path):
    return str(Path(path).relative_to(STUDIO))


def artifact(path, kind):
    return {"path": rel(path), "type": kind, "verified": Path(path).exists()}


def main():
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Pillow tidak terpasang; contoh tidak bisa dibangun di lingkungan ini.")
        return 2
    for folder in (ART / "ekspor", ART / "paket", ART / "gambar-listing", HANDOFF):
        shutil.rmtree(folder, ignore_errors=True)
    for folder in (ART, LISTING, HANDOFF):
        folder.mkdir(parents=True, exist_ok=True)

    master = ART / "master.jpg"
    width, height = draw_master(master)
    plan = ART / "rencana-cetak.json"
    all_ok = True

    ok, palette_out = step("ukur warna karya uji", "palette", master, "--colors", 8)
    all_ok &= ok
    colors = [c for c in json.loads(palette_out)["warna"] if c["persen"] >= 0.1]
    if len(colors) > 5:
        print(f"GAGAL aturan DNA T2: {len(colors)} warna berbeda (batas 5)")
        all_ok = False
    ok, math_out = step("rencana rasio dan resolusi", "math", "--image", master, "--focus", FOCUS, "--json", plan)
    all_ok &= ok
    ok, _ = step("ekspor file cetak sRGB", "export", "--image", master, "--plan", plan, "--out", ART / "ekspor", "--name", NAME)
    all_ok &= ok

    plan_data = json.loads(plan.read_text(encoding="utf-8"))
    plan_data["master"]["file"] = rel(master)
    plan.write_text(json.dumps(plan_data, indent=2, ensure_ascii=False), encoding="utf-8")
    ok_sizes = {r["key"]: [s["size"] for s in r["sizes"] if s["status"] == "ok"] for r in plan_data["ratios"]}
    not_ok = [s["size"] for r in plan_data["ratios"] for s in r["sizes"] if s["status"] != "ok"]
    export_names = {r["key"]: p.name for r in plan_data["ratios"] for p in (ART / "ekspor").glob(f"{NAME}_{r['key']}_*.jpg")}

    # Panduan cetak: isi nama file sebenarnya ke kerangka skill, lalu jadikan PDF.
    guide_txt = ART / "print-guide.txt"
    template = (SKILLS / "wall-art-print-instruction-writer/assets/print-guide-template.txt").read_text(encoding="utf-8")
    lines = []
    labels = {"2x3": "inches", "3x4": "inches", "4x5": "inches", "11x14": "inches", "iso": "(international paper sizes)"}
    for row in template.splitlines():
        if row.startswith("- [FILE NAME"):
            continue
        if row.startswith("Pick the file that matches"):
            lines.append(row)
            lines.append("")
            for key, sizes in ok_sizes.items():
                if sizes:
                    lines.append(f"- {export_names[key]} : {', '.join(sizes)} {labels[key]}")
            continue
        lines.append(row.replace("[SHOP NAME]", "Studio Wall Art by Nangka").replace("[NUMBER]", str(len(export_names))))
    guide_txt.write_text("\n".join(lines) + "\n", encoding="utf-8")
    guide_pdf = ART / "ekspor" / f"{NAME}_print-guide.pdf"
    ok, _ = step("panduan cetak menjadi PDF", "pdf", guide_txt, guide_pdf, "--title", "Print Guide")
    all_ok &= ok

    ok, package_out = step("susun dan periksa paket unduhan", "package", "--src", ART / "ekspor", "--out", ART / "paket",
                           "--expect", ",".join(k for k, v in ok_sizes.items() if v))
    all_ok &= ok
    manifest = json.loads((ART / "paket" / "manifest.json").read_text(encoding="utf-8"))
    deliverables = [d["file"] for d in manifest["deliverables"]]
    # Hemat ruang repositori: file ekspor sudah disalin ke paket, jadi salinan di ekspor dihapus. Laporannya tetap.
    for p in (ART / "ekspor").iterdir():
        if p.suffix in (".jpg", ".pdf"):
            p.unlink()

    ok, _ = step("gambar listing dasar", "mockup", "--image", master, "--out", ART / "gambar-listing", "--name", NAME,
                 "--plan", plan, "--focus", FOCUS, "--wall", "#E8E2D6", "--frame", "#4A3B2F")
    all_ok &= ok

    pricing_in = LISTING / "harga-input.json"
    pricing_in.write_text(json.dumps({
        "_catatan": "Jam kerja dan nilai jam adalah ASUMSI contoh. Skenario pesanan sengaja kosong karena pemilik belum memberi dugaan.",
        "fees_file": "../../../../fakta/fees.json", "prices": [4.5, 6.0, 9.0],
        "hours_per_listing": 4, "hourly_value_usd": 5, "monthly_tool_cost_usd": 30, "listings_per_month": 12,
        "order_scenarios": [], "offsite_ads_share": 0}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ok, pricing_out = step("model harga", "pricing", "--input", pricing_in, "--today", TODAY, "--json", LISTING / "model-harga.json")
    all_ok &= ok
    (LISTING / "model-harga.txt").write_text(pricing_out + "\n", encoding="utf-8")

    (LISTING / "tags.txt").write_text("\n".join(TAGS) + "\n", encoding="utf-8")
    ok, _ = step("periksa 13 tag", "tags", "--file", LISTING / "tags.txt", "--title", TITLE)
    all_ok &= ok

    size_lines = []
    names = {"2x3": "2:3 ratio", "3x4": "3:4 ratio", "4x5": "4:5 ratio", "11x14": "11x14", "iso": "International A sizes"}
    for key, sizes in ok_sizes.items():
        if sizes:
            size_lines.append(f"- {names[key]}: {', '.join(sizes)}" if key != "11x14" else "- 11x14")
    description = "\n".join([
        "A calm tropical bird print for a nursery or kids room, drawn in soft olive, terracotta, and warm ivory.",
        "",
        "THIS IS A DIGITAL DOWNLOAD. No physical item will be shipped. Frame not included.",
        "",
        "WHAT YOU GET",
        f"- {len(export_names)} high-resolution JPG files (300 DPI)",
        "- A simple print guide (PDF)",
        "Two of the image files arrive together in one ZIP folder." if any(f.endswith(".zip") for f in deliverables) else "",
        "",
        "SIZES INCLUDED", *size_lines,
        "",
        "HOW IT WORKS",
        "1. Purchase and download your files from your Etsy account (Purchases and reviews).",
        "2. Choose the file that matches your frame size.",
        "3. Print at home, at a local print shop, or with an online print service.",
        "",
        "PLEASE NOTE",
        "- Colors may vary slightly between screens and printers.",
        "- This artwork was created with the help of AI tools and finished by our studio.",
        "",
        "TERMS OF USE",
        "For personal use only. Files may not be resold, shared, or used on products for sale.",
        "",
        "Questions? Send us a message, we are happy to help.",
    ])
    listing = {
        "schema": "studio-nangka/listing@1", "sku": "NGK-STRP-01", "project_id": PROJECT_ID,
        "artwork_ids": [ARTWORK_ID], "version": "v1", "status": "draft", "language": "en-US", "listing_type": "digital",
        "title": TITLE, "description": description, "tags": TAGS,
        "category": "", "attributes": {"orientation": "vertical", "subject": "bird", "room": "nursery"},
        "price_usd": 6.0, "ai_assisted": True,
        "digital_files": [f"karya/{ARTWORK_ID}/paket/{name}" for name in deliverables],
        "images": [f"karya/{ARTWORK_ID}/gambar-listing/{p.name}" for p in sorted((ART / "gambar-listing").glob("*.jpg"))],
        "claims": {"sizes": [s for sizes in ok_sizes.values() for s in sizes], "file_count": len(deliverables)},
        "notes": {"keyword_sources": "riset/keyword-bank.csv (sebagian besar HIPOTESIS)", "facts_checked_on": TODAY,
                  "contoh": "CONTOH UJI. Karya adalah gambar sintetis. Jangan diterbitkan. Kalimat penyebutan AI ditulis seolah karya dibuat alat AI, untuk menguji pemeriksaan."},
    }
    listing_path = LISTING / "listing.json"
    listing_path.write_text(json.dumps(listing, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ok, listing_out = step("preflight hitung (G5)", "listing", listing_path, "--root", PROJECT, "--plan", plan,
                           "--json", LISTING / "preflight-hitung.json")
    all_ok &= ok

    catalog = STUDIO / "register" / "katalog.csv"
    header = (SKILLS / "etsy-catalog-sku-manager/assets/katalog-template.csv").read_text(encoding="utf-8")
    row = ["NGK-STRP-01", "siap", "satuan", "Kutilang di dahan (contoh uji)", COLLECTION_ID, ARTWORK_ID, "v1", "", "", "6",
           rel(master), rel(ART / "paket"), rel(listing_path), "", "contoh uji; belum diterbitkan"]
    catalog.write_text(header + ",".join(row) + "\n", encoding="utf-8")
    ok, _ = step("periksa katalog", "catalog", catalog, "--root", STUDIO)
    all_ok &= ok

    # Uji negatif: sistem harus MENOLAK klaim ukuran yang tidak didukung pixel.
    bad = dict(listing)
    bad["claims"] = {"sizes": ["24x36"], "file_count": len(deliverables)}
    bad_path = LISTING / "_uji-negatif.json"
    bad_path.write_text(json.dumps(bad), encoding="utf-8")
    ok, _ = step("uji negatif: klaim 24x36 harus ditolak", "listing", bad_path, "--root", PROJECT, "--plan", plan, expect=1)
    all_ok &= ok
    bad_path.unlink()

    rights = [{"asset_id": "AST-0001", "role": "subjek dan susunan (gambar uji sintetis)"}]
    art_ids = {"artwork_id": ARTWORK_ID}
    files = [
        handoff(1, "studio-brief-interviewer", "passed", "etsy-market-evidence-researcher",
                assumptions=["Suasana lembut dan 6 karya adalah default, belum dikonfirmasi pemilik"],
                decisions=[{"what": "Tema hewan tropis untuk kamar bayi dan anak sebagai proyek contoh", "by": "pemilik", "date": TODAY}],
                unresolved_questions=["Rentang usia anak yang dituju?"],
                output_artifacts=[artifact(PROJECT / "brief.md", "brief")],
                quality_results=[{"check": "G1 brief", "result": "pass", "notes": "lima inti terisi, berlabel, tanpa angka pasar"}]),
        handoff(2, "studio-asset-rights-register", "passed", None, input_assets=rights, rights_status="cleared",
                observations=["AST-0001 digambar skrip Pillow di repositori ini; tidak ada bahan pihak ketiga"],
                output_artifacts=[artifact(STUDIO / "register" / "asset-rights.csv", "register hak")]),
        handoff(3, "etsy-market-evidence-researcher", "ready_for_review", "etsy-micro-niche-mapper",
                observations=["5 baris bukti dari pencarian web 2026-11-12; semuanya pihak ketiga atau kutipan tidak langsung"],
                assumptions=["Halaman Etsy tidak bisa dibuka dari sesi ini, jadi tidak ada amatan langsung hasil pencarian Etsy"],
                unresolved_questions=["Amatan manual 15 menit oleh pemilik untuk tiga istilah (lihat lembar amatan)"],
                output_artifacts=[artifact(STUDIO / "riset" / "bukti-pasar.csv", "bukti pasar")]),
        handoff(4, "wall-art-series-collection-builder", "ready_for_review", "wall-art-concept-divergence",
                decisions=[{"what": "Karya utama dikerjakan lebih dulu sebagai uji gaya", "by": "wall-art-series-collection-builder", "date": TODAY}],
                output_artifacts=[artifact(PROJECT / "catatan-kreatif.md", "rencana koleksi, konsep, komposisi, prompt")]),
        handoff(5, "wall-art-concept-divergence", "approved", "wall-art-composition-director", **art_ids,
                decisions=[{"what": "Arah 1 'Kutilang di dahan' dipakai untuk contoh", "by": "pemilik", "date": TODAY}],
                assumptions=["Pilihan arah diambil sebagai default contoh; di proyek nyata menunggu pemilik"],
                output_artifacts=[artifact(PROJECT / "catatan-kreatif.md", "arah konsep")]),
        handoff(6, "wall-art-composition-director", "passed", "wall-art-image-prompt-engineer", **art_ids,
                observations=["Fokus tengah-bawah (x 0.5, y 0.6); unsur wajib utuh di 80% tengah"],
                output_artifacts=[artifact(PROJECT / "catatan-kreatif.md", "rancangan komposisi")],
                quality_results=[{"check": "G2 konsep", "result": "warn", "notes": "DNA visual masih sementara; peran referensi tidak berlaku karena tanpa referensi"}]),
        handoff(7, "wall-art-image-prompt-engineer", "ready_for_review", "wall-art-artifact-retouch-reviewer", **art_ids,
                input_assets=rights, rights_status="cleared",
                observations=[f"Master {width} x {height} pixel dibaca dari file"],
                assumptions=["Alat AI tidak dijalankan (tidak ada izin kredit); gambar uji digambar skrip sebagai pengganti"],
                output_artifacts=[artifact(master, "gambar master (sintetis)")]),
        handoff(8, "wall-art-artifact-retouch-reviewer", "passed", "wall-art-style-consistency-reviewer", **art_ids,
                observations=["Diperiksa pada pratinjau dan potongan detail 2000 pixel: tidak ada teks, tanda air, bingkai, atau bentuk nyasar"],
                quality_results=[{"check": "cek cacat tujuh kelompok", "result": "pass", "notes": "bersih pada pemeriksaan ini; gambar vektor sederhana"}]),
        handoff(9, "wall-art-style-consistency-reviewer", "passed", "wall-art-ratio-resolution-planner", **art_ids,
                input_assets=rights, rights_status="cleared",
                observations=["Warna berbeda menurut pengukur warna: " + ", ".join(c["hex"] for c in colors)],
                quality_results=[{"check": "aturan tetap DNA sementara T1-T5", "result": "pass" if len(colors) <= 5 else "fail",
                                  "notes": f"latar polos gading, {len(colors)} warna berbeda (batas 5), satu subjek utuh, bentuk membulat"},
                                 {"check": "G3 gambar master", "result": "warn", "notes": "lulus dengan catatan: DNA sementara; karya hanya gambar uji"}]),
        handoff(10, "wall-art-ratio-resolution-planner", "passed", "wall-art-color-export-manager", **art_ids,
                observations=[f"Ukuran layak per rasio: {json.dumps(ok_sizes, ensure_ascii=False)}"],
                decisions=[{"what": "Tidak ditawarkan karena di bawah 300 PPI: " + ", ".join(not_ok), "by": "wall-art-ratio-resolution-planner", "date": TODAY}],
                output_artifacts=[artifact(plan, "rencana cetak")]),
        handoff(11, "wall-art-color-export-manager", "passed", "wall-art-download-package-builder", **art_ids,
                observations=["5 JPEG sRGB bertanda 300 DPI; salinan di folder ekspor dihapus setelah masuk paket untuk menghemat ruang repositori"],
                output_artifacts=[artifact(ART / "ekspor" / f"{NAME}_laporan-ekspor.json", "laporan ekspor")]),
        handoff(12, "wall-art-download-package-builder", "passed", "wall-art-print-instruction-writer", **art_ids,
                input_assets=rights, rights_status="cleared",
                output_artifacts=[artifact(ART / "paket" / name, "file akhir") for name in deliverables]
                + [artifact(ART / "paket" / "manifest.json", "manifest")],
                quality_results=[{"check": "G4 paket cetak", "result": "pass", "notes": f"manifest verdict {manifest['verdict']}; {len(deliverables)} file akhir"}]),
        handoff(13, "wall-art-print-instruction-writer", "passed", "wall-art-mockup-art-director", **art_ids,
                output_artifacts=[artifact(guide_txt, "teks panduan"), artifact(ART / "paket" / f"{NAME}_print-guide.pdf", "panduan PDF")]),
        handoff(14, "wall-art-product-offer-planner", "approved", "etsy-digital-pricing-modeler", **art_ids,
                decisions=[{"what": "Listing satuan: 5 rasio + panduan cetak, pemakaian pribadi, tanpa ukuran khusus", "by": "pemilik", "date": TODAY}],
                assumptions=["Persetujuan pemilik diambil sebagai default contoh"],
                output_artifacts=[artifact(LISTING / "lembar-penawaran.md", "lembar penawaran")]),
        handoff(15, "etsy-digital-pricing-modeler", "needs_input", "etsy-listing-copy-builder", **art_ids,
                assumptions=["Jam kerja 4 jam dan nilai jam USD 5 adalah asumsi", "Dua angka biaya berkeyakinan rendah"],
                unresolved_questions=["Harga akhir: USD 6 adalah usulan, menunggu keputusan pemilik",
                                      "Dugaan jumlah pesanan belum diberikan, jadi skenario tidak dihitung"],
                output_artifacts=[artifact(LISTING / "model-harga.txt", "model harga")]),
        handoff(16, "wall-art-mockup-art-director", "ready_for_review", "etsy-listing-preflight-reviewer", **art_ids,
                unresolved_questions=["Mockup ruangan (kamar bayi) belum dibuat; butuh template berlisensi atau alat gambar"],
                output_artifacts=[artifact(p, "gambar listing") for p in sorted((ART / "gambar-listing").glob("*.jpg"))]),
        handoff(17, "etsy-listing-copy-builder", "ready_for_review", "etsy-tag-attribute-mapper", **art_ids,
                observations=[f"Judul {len(TITLE)} karakter; ukuran di deskripsi dibentuk dari rencana cetak"],
                output_artifacts=[artifact(listing_path, "paket listing")]),
        handoff(18, "etsy-tag-attribute-mapper", "needs_input", "etsy-listing-preflight-reviewer", **art_ids,
                observations=["13 tag lulus pemeriksa (batas 13 tag, 20 karakter)"],
                unresolved_questions=["Kategori dan atribut harus diambil dari formulir listing Etsy (tangkapan layar dari pemilik)"],
                output_artifacts=[artifact(LISTING / "tags.txt", "tag")]),
        handoff(19, "etsy-listing-preflight-reviewer", "ready_for_review", "etsy-catalog-sku-manager", **art_ids,
                input_assets=rights, rights_status="cleared",
                unresolved_questions=["Kategori kosong", "Hanya 3 gambar listing", "Harga belum diputuskan pemilik",
                                      "Ini contoh uji: tidak untuk diterbitkan"],
                output_artifacts=[artifact(LISTING / "preflight-hitung.json", "hasil preflight hitung")],
                quality_results=[{"check": "G5 hitung", "result": "warn", "notes": "0 gagal; catatan: kategori kosong, 3 gambar"},
                                 {"check": "G5 keputusan", "result": "warn", "notes": "SIAP DENGAN CATATAN secara teknis; BELUM diterbitkan dan tidak boleh diterbitkan (karya uji)"}]),
        handoff(20, "etsy-catalog-sku-manager", "passed", None, **art_ids,
                observations=["NGK-STRP-01 dicatat berstatus siap, bukan terbit"],
                output_artifacts=[artifact(catalog, "katalog")]),
    ]
    for path in files:
        ok, _ = step(f"serah terima {path.name}", "handoff", path, "--root", STUDIO)
        all_ok &= ok

    log_path = STUDIO.parent / "log-perjalanan.json"
    summary = {"tanggal": TODAY, "project_id": PROJECT_ID, "master_pixel": [width, height],
               "ukuran_layak": ok_sizes, "file_akhir": deliverables,
               "langkah_total": len(LOG), "langkah_sesuai_harapan": sum(1 for e in LOG if e["sesuai_harapan"]),
               "langkah": LOG}
    log_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n{summary['langkah_sesuai_harapan']} dari {summary['langkah_total']} langkah sesuai harapan. Log: {log_path.relative_to(ROOT)}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
