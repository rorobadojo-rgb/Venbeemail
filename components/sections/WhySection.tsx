import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { BulbString } from "../hero/BulbString";
import { Reveal } from "./Reveal";

const SIGNS = [
  {
    title: "Tanpa daftar",
    text: "Nggak perlu nama asli, nomor HP, atau password. Ambil kantong sirup, alamat langsung jadi.",
    tone: "tarp",
    doodle: "ghost",
  },
  {
    title: "Hilang sendiri",
    text: "Satu alamat hidup selama lilin 10 menit menyala. Lilin habis, alamat tutup sendiri. Mau lama? Tambah lilin.",
    tone: "pink",
    doodle: "glass",
  },
  {
    title: "Spam kena buang",
    text: "Surat sampah langsung dilempar ke keranjang, inbox aslimu tetap bersih dan wangi.",
    tone: "green",
    doodle: "skull",
  },
];

/** "Kenapa VenbeeMail": three painted stall signs hanging from a pole. */
export function WhySection() {
  return (
    <Reveal className="why" aria-labelledby="why-title">
      <h2 id="why-title" className="section-title">
        Kenapa <span>VenbeeMail</span>
      </h2>
      <div className="why__pole" aria-hidden="true" />
      <ul className="why__signs">
        {SIGNS.map((s, k) => (
          <li key={s.title} className={`stallsign stallsign--${s.tone}`} style={{ "--k": k } as CSSProperties}>
            <span className="stallsign__ropes" aria-hidden="true" />
            <div className="stallsign__board">
              <BulbString count={5} sag={10} colorEvery={0} className="stallsign__bulbs" />
              <img className="stallsign__doodle" src={asset(`/doodles/${s.doodle}.svg`)} alt="" width={224} height={224} loading="lazy" decoding="async" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
