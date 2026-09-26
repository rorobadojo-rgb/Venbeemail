"use client";

import { useState } from "react";
import { StickerButton } from "@/components/sticker/StickerButton";
import type { StickerColor } from "@/lib/domains";

const FAQ: { q: string; a: string; c: StickerColor }[] = [
  {
    q: "Apa itu VenbeeMail?",
    a: "Alamat email sementara sekali pakai. Pakai untuk daftar situs, ambil kode verifikasi, lalu buang. Inbox aslimu tidak pernah tahu.",
    c: "lime",
  },
  {
    q: "Berapa lama alamatnya bertahan?",
    a: "10 menit sejak dicetak. Tekan EXTEND +10 MENIT untuk menambah (maksimal satu jam ke depan). Setelah kedaluwarsa, alamat dan semua pesannya dihapus otomatis.",
    c: "pink",
  },
  {
    q: "Perlu daftar atau bayar?",
    a: "Tidak. Tanpa akun, tanpa kata sandi, Rp0. Harga di rak itu serius.",
    c: "yellow",
  },
  {
    q: "Boleh pakai username sendiri?",
    a: "Boleh. Ketik di kolom username kasir (huruf kecil, angka, titik, - dan _), atau tekan RANDOM biar mesin huruf yang memilih.",
    c: "cyan",
  },
  {
    q: "Bisa buka beberapa inbox sekaligus?",
    a: "Bisa, sampai tiga keranjang. Tiap keranjang punya alamat, hitung mundur dan paketnya sendiri.",
    c: "orange",
  },
  {
    q: "Aman untuk akun penting?",
    a: "Jangan. Siapa pun yang tahu alamatnya bisa melihat inboxnya, dan semuanya hilang setelah kedaluwarsa. Pakai untuk hal remeh saja: kupon, uji coba, forum sekali mampir.",
    c: "red",
  },
];

/** FAQ as hanging aisle signs; each sign opens its answer (accordion). */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <header className="section-head">
        <p className="section-head__aisle">Lorong 4</p>
        <h2 id="faq-title" className="section-head__title">
          Tanya kasir
        </h2>
      </header>
      <ul className="faq__aisles">
        {FAQ.map((f, i) => {
          const on = open === i;
          return (
            <li key={f.q} className={`aisle${on ? " is-open" : ""}`}>
              <span className="aisle__rods" aria-hidden="true" />
              <h3 className="aisle__q">
                <StickerButton
                  id={`faq-q-${i}`}
                  label={`LORONG ${String(i + 1).padStart(2, "0")}`}
                  color={f.c}
                  body="black"
                  size="md"
                  effect={on ? "none" : "jelly"}
                  sound={on ? "lid" : "flip"}
                  selected={on}
                  selectedLabel="DIBUKA"
                  note={f.q}
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                />
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="aisle__a" hidden={!on}>
                <p>{f.a}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
