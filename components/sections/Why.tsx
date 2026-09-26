/**
 * "Kenapa VenbeeMail": three product boxes on a shelf, each with a nutrition
 * facts label ("Informasi Nilai Gizi") listing what you (don't) get.
 */
const BOXES = [
  {
    name: "Tanpa Daftar",
    color: "lime",
    blurb: "Langsung dapat alamat. Tidak ada formulir, tidak ada kata sandi, tidak ada OTP ke nomor HP.",
    serving: "1 alamat",
    facts: [
      ["Formulir pendaftaran", "0 g", "0%"],
      ["Kata sandi", "0 g", "0%"],
      ["Data pribadi", "0 mg", "0%"],
      ["Waktu tunggu", "< 1 detik", "1%"],
    ],
  },
  {
    name: "Hilang Otomatis",
    color: "pink",
    blurb: "Alamat dan isinya membusuk sendiri setelah 10 menit. Butuh lebih lama? Tambah +10 menit di konter.",
    serving: "10 menit",
    facts: [
      ["Masa simpan", "10 mnt", "100%"],
      ["Perpanjangan", "+10 mnt", "opsional"],
      ["Jejak tersisa", "0 g", "0%"],
      ["Pengawet", "0 mg", "0%"],
    ],
  },
  {
    name: "Bebas Spam",
    color: "purple",
    blurb: "Spam digigit filter sebelum sampai meja. Inbox aslimu tetap bersih dan wangi.",
    serving: "1 inbox",
    facts: [
      ["Spam ke inbox asli", "0 g", "0%"],
      ["Newsletter nyasar", "0 g", "0%"],
      ["Pangeran kaya raya", "0 ekor", "0%"],
      ["Rasa tenang", "100 g", "100%"],
    ],
  },
] as const;

export function Why() {
  return (
    <section className="why" id="kenapa" aria-labelledby="kenapa-title">
      <header className="section-head">
        <p className="section-head__aisle">Lorong 2</p>
        <h2 id="kenapa-title" className="section-head__title">
          Kenapa VenbeeMail
        </h2>
        <p className="section-head__sub">Baca komposisinya. Semua bahan tanpa daftar, tanpa jejak.</p>
      </header>
      <div className="why__shelf">
        <ul className="why__boxes">
          {BOXES.map((b, i) => (
            <li key={b.name} className={`pbox pbox--${b.color}`} style={{ "--k": i } as React.CSSProperties}>
              <div className="pbox__top" aria-hidden="true" />
              <div className="pbox__side" aria-hidden="true" />
              <div className="pbox__front">
                <p className="pbox__brand">VenbeeMail</p>
                <h3 className="pbox__name">{b.name}</h3>
                <p className="pbox__blurb">{b.blurb}</p>
                <table className="nutri">
                  <caption>Informasi nilai gizi</caption>
                  <thead>
                    <tr>
                      <th scope="col">Takaran saji: {b.serving}</th>
                      <th scope="col">Jumlah</th>
                      <th scope="col">%AKG*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.facts.map(([k, v, p]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{v}</td>
                        <td>{p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="nutri__foot">*Angka Kecukupan Gangguan, per 1 alamat.</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="shelf__plank shelf__plank--wide" aria-hidden="true">
          <span className="shelf__tag">PRODUK UNGGULAN</span>
          <span className="shelf__tag shelf__tag--price">Rp0 semua</span>
        </div>
      </div>
    </section>
  );
}
