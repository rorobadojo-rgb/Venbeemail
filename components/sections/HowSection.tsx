import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    title: "Pilih kantong",
    text: "Sepuluh rasa domain tergantung di tiang. Tekan satu, kantongnya dilepas dan pindah ke meja.",
  },
  {
    title: "Ketok GENERATE",
    text: "Tangan zombie menulis alamatmu di nota. COPY buat nyalin, QR CODE buat buka di HP.",
  },
  {
    title: "Terima surat daun pisang",
    text: "Surat baru datang dibungkus daun pisang dan meluncur di meja. Klik buat buka bungkusnya.",
  },
];

/** "Cara kerja": three steps chalked on the warung's blackboard menu. */
export function HowSection() {
  return (
    <Reveal className="how" aria-labelledby="how-title">
      <div className="chalkboard">
        <h2 id="how-title" className="chalk-title">
          Cara kerja
        </h2>
        <ol className="chalk-steps">
          {STEPS.map((s, k) => (
            <li key={s.title} style={{ "--k": k } as CSSProperties}>
              <span className="chalk-num" aria-hidden="true">
                {k + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <svg className="chalk-doodles" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M300 40c30-20 60-20 90 0M380 30l12 10-14 8" />
          <path d="M630 40c30-20 60-20 90 0M710 30l12 10-14 8" />
        </svg>
        <div className="chalkboard__tray" aria-hidden="true">
          <span className="chalk-stick" />
          <span className="chalk-stick chalk-stick--pink" />
          <span className="chalk-eraser" />
        </div>
      </div>
    </Reveal>
  );
}
