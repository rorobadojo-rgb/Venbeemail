#!/usr/bin/env python3
"""Model harga produk digital: biaya per pesanan, titik impas, dan skenario.

Pakai:
  python3 pricing_model.py --input harga-input.json [--today 2026-11-12]

Isi harga-input.json (lihat assets/contoh-input-harga.json):
  fees                     isi fees.json dari etsy-policy-fact-checker (atau "fees_file": "path")
  prices                   daftar harga yang dibandingkan (USD)
  hours_per_listing        jam kerja sampai satu listing terbit
  hourly_value_usd         nilai satu jam kerja pemilik (USD)
  monthly_tool_cost_usd    biaya alat per bulan
  listings_per_month       listing baru per bulan (untuk membagi biaya alat)
  order_scenarios          jumlah pesanan per listing selama satu masa listing; ini DUGAAN pemilik, bukan ramalan
  offsite_ads_share        porsi pesanan lewat Offsite Ads, 0-1 (default 0)

Skrip tidak mengarang angka: biaya diambil dari berkas biaya, dan bila ada yang kosong skrip berhenti atau memberi peringatan.
Hanya pustaka standar.
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path

STALE_DAYS = 90


def value(fees, key, required=True):
    node = fees.get(key)
    val = node.get("value") if isinstance(node, dict) else node
    if val is None and required:
        raise ValueError(f"biaya '{key}' belum diisi di berkas biaya")
    return val


def load(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if "fees_file" in data and "fees" not in data:
        fees_path = Path(data["fees_file"])
        if not fees_path.is_absolute():
            fees_path = Path(path).parent / fees_path
        data["fees"] = json.loads(fees_path.read_text(encoding="utf-8"))
    return data


def model(data, today=None):
    fees = data["fees"]
    warnings = []
    today = today or date.today()
    verified = fees.get("verified_on")
    if not verified:
        warnings.append("berkas biaya tanpa tanggal cek (verified_on)")
    else:
        age = (today - date.fromisoformat(verified)).days
        if age > STALE_DAYS:
            warnings.append(f"berkas biaya berumur {age} hari (lebih dari {STALE_DAYS}); cek ulang lewat etsy-policy-fact-checker")
    for key, node in fees.items():
        if isinstance(node, dict) and node.get("value") is not None and node.get("confidence") == "rendah":
            warnings.append(f"biaya '{key}' berkeyakinan rendah; hasil bersifat perkiraan")

    listing_fee = value(fees, "listing_fee")
    transaction_rate = value(fees, "transaction_fee_rate")
    processing_rate = value(fees, "payment_processing_rate")
    fixed_usd = value(fees, "payment_processing_fixed_usd", required=False)
    if fixed_usd is None:
        local = value(fees, "payment_processing_fixed_local", required=False)
        fx = value(fees, "fx_local_per_usd", required=False)
        if local is None:
            fixed_usd = 0.0
            warnings.append("biaya tetap pemrosesan pembayaran tidak ada; dihitung 0")
        elif not fx:
            raise ValueError("kurs (fx_local_per_usd) belum diisi, padahal biaya tetap pemrosesan dalam mata uang lokal. "
                             "Isi kurs beserta sumber dan tanggalnya.")
        else:
            fixed_usd = local / fx
    ads_rate = value(fees, "offsite_ads_rate", required=False) or 0.0
    vat_rate = value(fees, "vat_on_fees_rate", required=False)
    if vat_rate is None:
        vat_rate = 0.0
        warnings.append("pajak atas biaya penjual (vat_on_fees_rate) belum diketahui; dihitung 0, biaya nyata bisa lebih tinggi")
    renewal = value(fees, "renewal_fee_per_sale", required=False)
    if renewal is None:
        renewal = listing_fee
        warnings.append("biaya perpanjangan saat terjual dianggap sama dengan biaya listing; cek di catatan fakta")

    ads_share = float(data.get("offsite_ads_share", 0))
    hours = float(data.get("hours_per_listing", 0))
    hour_value = float(data.get("hourly_value_usd", 0))
    tool_share = float(data.get("monthly_tool_cost_usd", 0)) / max(1, float(data.get("listings_per_month", 1)))
    fixed_per_listing = hours * hour_value + tool_share + listing_fee
    scenarios = data.get("order_scenarios") or []

    rows = []
    for price in data["prices"]:
        price = float(price)
        per_order_fees = (transaction_rate * price + processing_rate * price + fixed_usd + renewal
                          + ads_rate * price * ads_share)
        per_order_fees *= (1 + vat_rate)
        net = price - per_order_fees
        breakeven = None if net <= 0 else fixed_per_listing / net
        rows.append({
            "price": round(price, 2),
            "fees_per_order": round(per_order_fees, 2),
            "fees_pct_of_price": round(100 * per_order_fees / price, 1),
            "net_per_order": round(net, 2),
            "breakeven_orders": None if breakeven is None else round(breakeven, 1),
            "scenarios": [{"orders": n, "result_usd": round(n * net - fixed_per_listing, 2)} for n in scenarios],
        })
    return {"currency": "USD", "fixed_cost_per_listing": round(fixed_per_listing, 2),
            "fixed_cost_parts": {"time": round(hours * hour_value, 2), "tools": round(tool_share, 2),
                                 "listing_fee": round(listing_fee, 2)},
            "per_order_fixed_processing_usd": round(fixed_usd, 3), "rows": rows, "warnings": warnings}


def render(result):
    parts = result["fixed_cost_parts"]
    lines = [f"Biaya tetap per listing: USD {result['fixed_cost_per_listing']} "
             f"(waktu {parts['time']} + alat {parts['tools']} + biaya listing {parts['listing_fee']})", "",
             f"{'Harga':>7} {'Biaya/pesanan':>14} {'% harga':>8} {'Bersih/pesanan':>15} {'Impas (pesanan)':>16}"]
    for r in result["rows"]:
        be = "tidak pernah" if r["breakeven_orders"] is None else r["breakeven_orders"]
        lines.append(f"{r['price']:>7} {r['fees_per_order']:>14} {r['fees_pct_of_price']:>8} {r['net_per_order']:>15} {be:>16}")
    if result["rows"] and result["rows"][0]["scenarios"]:
        lines += ["", "Skenario (jumlah pesanan adalah dugaan pemilik, bukan ramalan):"]
        for r in result["rows"]:
            cells = ", ".join(f"{s['orders']} pesanan -> USD {s['result_usd']}" for s in r["scenarios"])
            lines.append(f"  harga {r['price']}: {cells}")
    for w in result["warnings"]:
        lines.append(f"PERINGATAN: {w}")
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Model harga produk digital.")
    parser.add_argument("--input", required=True)
    parser.add_argument("--today", help="tanggal hari ini YYYY-MM-DD (default: tanggal sistem)")
    parser.add_argument("--json", dest="json_path")
    args = parser.parse_args(argv)
    try:
        data = load(args.input)
        today = date.fromisoformat(args.today) if args.today else None
        result = model(data, today)
    except (OSError, json.JSONDecodeError, KeyError, ValueError) as exc:
        print(f"TIDAK BISA DIHITUNG: {exc}")
        return 1
    print(render(result))
    if args.json_path:
        Path(args.json_path).write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Hasil disimpan: {args.json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
