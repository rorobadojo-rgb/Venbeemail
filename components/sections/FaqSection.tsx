import { Reveal } from "./Reveal";

const FAQ: [string, string][] = [
  [
    "Apa itu email sementara?",
    "Alamat email sekali pakai. Pakai buat daftar, terima kode OTP atau link konfirmasi, lalu tinggalkan. Inbox aslimu tetap bersih.",
  ],
  [
    "Berapa lama alamatnya hidup?",
    "Selama lilin menyala: 10 menit. Tekan “Extend +10 min” buat menambah waktu, maksimal 60 menit.",
  ],
  [
    "Bisa pilih nama sendiri?",
    "Bisa. Ketik nama di kolom “Nama alamat”, pilih kantong domain, lalu ketok GENERATE. Kosongkan kolomnya atau ketok RANDOM buat nama acak.",
  ],
  [
    "Bisa punya lebih dari satu alamat?",
    "Bisa sampai tiga sekaligus. Tiap alamat punya piring nomor sendiri di atas meja; tekan “+” buat buka kotak baru.",
  ],
  [
    "Bisa dipakai buat kirim email?",
    "Tidak, VenbeeMail cuma menerima. Jangan pakai buat akun penting seperti bank atau email kerja.",
  ],
  [
    "Suratnya aman dan rahasia?",
    "Anggap saja papan pengumuman: siapa pun yang tahu alamatnya bisa melihat isinya. Jangan terima data rahasia di sini.",
  ],
  [
    "Kok suratnya contoh semua?",
    "Halaman ini masih versi demo: surat yang masuk disimulasikan di browser, dan “Forward to real email” belum benar-benar mengirim.",
  ],
  ["Suaranya bisa dimatikan?", "Bisa. Ketok kentongan di pojok kanan atas. Pilihanmu diingat browser."],
];

/** FAQ, painted on the warung's menu board. */
export function FaqSection() {
  return (
    <Reveal className="faq" aria-labelledby="faq-title">
      <div className="menuboard">
        <div className="menuboard__hooks" aria-hidden="true" />
        <h2 id="faq-title" className="menuboard__title">
          Daftar menu <small>tanya-jawab</small>
        </h2>
        <ul className="menuboard__list">
          {FAQ.map(([q, a]) => (
            <li key={q}>
              <details className="menu-item">
                <summary>
                  <span className="menu-item__q">{q}</span>
                  <span className="menu-item__dots" aria-hidden="true" />
                  <span className="menu-item__price" aria-hidden="true">
                    gratis
                  </span>
                </summary>
                <p>{a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
