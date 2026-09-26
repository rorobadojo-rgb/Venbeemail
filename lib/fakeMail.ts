/**
 * Demo letters for the inbox. There is no mail server behind this page yet,
 * so the pump in lib/mailbox.ts drops one of these into the active inbox
 * every few seconds. Senders and brands are made up.
 */
export type Letter = {
  id: string;
  fromName: string;
  from: string;
  subject: string;
  body: string;
  at: number;
  spam: boolean;
  read: boolean;
  forwarded?: string;
};

function rand(n: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}
const pick = <T,>(xs: readonly T[]) => xs[rand(xs.length)];
const code = (n = 6) => Array.from({ length: n }, () => rand(10)).join("");

type Template = { fromName: string; from: string; subject: () => string; body: (to: string) => string; spam?: boolean };

const TEMPLATES: Template[] = [
  {
    fromName: "Sate Pak Kumis",
    from: "halo@satekumis.example",
    subject: () => `Kode verifikasi kamu: ${code()}`,
    body: (to) =>
      `Halo ${to},\n\nIni kode masuk kamu. Jangan kasih ke siapa-siapa, termasuk ke zombie di sebelah.\n\nKode berlaku 5 menit.\n\nSalam hangat dari arang,\nSate Pak Kumis`,
  },
  {
    fromName: "Toko Serba Ada",
    from: "noreply@tokoserbaada.example",
    subject: () => "Selamat datang! Akunmu sudah jadi",
    body: () =>
      "Terima kasih sudah daftar.\n\nKlik tautan konfirmasi di aplikasi kami untuk mulai belanja. Kalau kamu nggak merasa daftar, abaikan saja email ini.\n\nTim Toko Serba Ada",
  },
  {
    fromName: "Forum Hantu Lokal",
    from: "admin@forumhantu.example",
    subject: () => `Konfirmasi akun #${code(4)}`,
    body: () =>
      "Satu langkah lagi!\n\nMasukkan kode di bawah untuk mengaktifkan akun forum kamu:\n\n" + code() + "\n\nSampai jumpa di utas tengah malam.",
  },
  {
    fromName: "Es Campur Bu Tini",
    from: "menu@escampurtini.example",
    subject: () => "Menu baru: es campur rasa kuburan",
    body: () =>
      "Minggu ini ada topping baru: cincau hitam pekat, jelly bola mata, dan sirup hijau lendir.\n\nTunjukkan email ini di gerobak, dapat es batu gratis.",
  },
  {
    fromName: "Aplikasi Ojek Zombi",
    from: "otp@ojekzombi.example",
    subject: () => `${code(4)} adalah kode OTP kamu`,
    body: () => "Pakai kode ini untuk masuk. Driver kami jalannya pelan, tapi pasti sampai.",
  },
  {
    fromName: "Webinar Gratis",
    from: "event@webinargratis.example",
    subject: () => "Link webinar malam ini",
    body: () => "Acara mulai jam 19.00 WIB. Kamera boleh mati, asal jangan kamu yang mati.\n\nSampai ketemu!",
  },
  {
    fromName: "Pangeran Kaya Raya",
    from: "pangeran@warisan-milyaran.example",
    subject: () => "SELAMAT!!! Anda menang Rp 1.000.000.000",
    body: () => "Kirim nomor rekening dan PIN Anda sekarang juga untuk mencairkan hadiah!!!",
    spam: true,
  },
  {
    fromName: "Pinjol Kilat 24 Jam",
    from: "promo@pinjol-kilat.example",
    subject: () => "Cair 5 menit tanpa syarat!!",
    body: () => "Butuh dana? Klik sekarang. Bunga cuma sedikit (sedikit sekali, percayalah).",
    spam: true,
  },
  {
    fromName: "Obat Kuat Zombie",
    from: "sales@ramuan-ajaib.example",
    subject: () => "Bangkit lagi dalam 3 hari!",
    body: () => "Ramuan rahasia dari kuburan. Diskon 90% hanya hari ini!!!",
    spam: true,
  },
];

export function makeLetter(to: string): Letter {
  const t = pick(TEMPLATES);
  return {
    id: `${Date.now().toString(36)}-${rand(1e9).toString(36)}`,
    fromName: t.fromName,
    from: t.from,
    subject: t.subject(),
    body: t.body(to),
    at: Date.now(),
    spam: !!t.spam,
    read: false,
  };
}

/** The first letter every new address receives: a short welcome. */
export function welcomeLetter(to: string): Letter {
  return {
    id: `welcome-${Date.now().toString(36)}`,
    fromName: "Warung Venbee",
    from: "warung@venbeemail.example",
    subject: "Alamatmu sudah jadi, selamat belanja!",
    body:
      `Halo ${to}!\n\nAlamat ini milikmu selama lilin masih menyala (10 menit). ` +
      "Pakai buat daftar, terima kode OTP, lalu tinggalkan saja. Surat baru datang dibungkus daun pisang.\n\n" +
      "Mau lebih lama? Tekan \"Extend +10 min\".\n\nSalam,\nWarung Venbee",
    at: Date.now(),
    spam: false,
    read: false,
  };
}
