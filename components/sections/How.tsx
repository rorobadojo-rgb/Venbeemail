/** "Cara kerja": three steps printed as line items on one long receipt. */
const STEPS = [
  { n: "01", t: "Pilih domain di rak", d: "Sepuluh rasa domain. Klik satu, produknya maju ke depan dan menyala." },
  { n: "02", t: "Cetak di kasir", d: "Tekan GENERATE (atau ketik username sendiri). Struk keluar dengan alamat barumu." },
  { n: "03", t: "Pakai, terima, buang", d: "COPY, tempel di situs yang rewel, tunggu paket di meja. Selesai? DELETE, atau biarkan membusuk sendiri." },
];

export function How() {
  return (
    <section className="how" id="cara" aria-labelledby="cara-title">
      <header className="section-head">
        <p className="section-head__aisle">Lorong 3</p>
        <h2 id="cara-title" className="section-head__title">
          Cara kerja
        </h2>
      </header>
      <div className="longreceipt">
        <p className="rc-c rc-b">ZOMBIE MART · STRUK PANDUAN</p>
        <p className="rc-c rc-s">Tgl: hari ini · Kasir: ZOMBI-01</p>
        <p className="rc-cut" aria-hidden="true" />
        <ol className="longreceipt__items">
          {STEPS.map((s) => (
            <li key={s.n} className="lr-item">
              <p className="rc-row">
                <span>
                  <b>{s.n}</b> {s.t.toUpperCase()}
                </span>
                <span>Rp0</span>
              </p>
              <p className="lr-item__desc">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="rc-cut" aria-hidden="true" />
        <p className="rc-row rc-total">
          <span>TOTAL</span>
          <span>Rp0</span>
        </p>
        <p className="rc-row">
          <span>TUNAI</span>
          <span>Rp0</span>
        </p>
        <p className="rc-row">
          <span>KEMBALI</span>
          <span>privasimu</span>
        </p>
        <span className="rc-barcode" aria-hidden="true" />
        <p className="rc-c rc-s">BARANG YANG SUDAH DIBUANG TIDAK DAPAT DIKEMBALIKAN</p>
      </div>
    </section>
  );
}
