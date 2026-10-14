/* VenbeeMail Pro, Fase 1: hero "Panggung Pos" dan menu pil kaca.
 *
 * Blok ini disisipkan di atas halaman /pro lama. Isi lama (cara kerja, API,
 * endpoint, domain, contoh curl) tidak disentuh: skrip hanya menyembunyikan
 * kepala dan hero lama, mengarahkan tautan menu ke bagian lama, dan menyalin
 * contoh curl pertama ke kartu di hero.
 *
 * GSAP 3.13 (gsap, ScrollTrigger, MotionPathPlugin) dimuat dari folder yang
 * sama kalau halaman belum memuatnya.
 */
(() => {
  "use strict";

  const akar = document.getElementById("vbp");
  if (!akar || akar.dataset.vbpJalan) return;
  akar.dataset.vbpJalan = "1";

  const skrip = document.currentScript;
  const DASAR = ((skrip && skrip.src) || location.href).replace(/[^/]*$/, "");
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (s, el = akar) => el.querySelector(s);
  const $$ = (s, el = akar) => Array.from(el.querySelectorAll(s));
  const mqHP = matchMedia("(max-width: 720px)");
  const mqKursor = matchMedia("(hover: hover) and (pointer: fine)");
  const mqGerak = matchMedia("(prefers-reduced-motion: no-preference)");

  const hero = $("#vbp-hero");
  const adegan = $("#vbp-adegan");
  const acak = (a, b) => a + Math.random() * (b - a);
  const batas = (v, a, b) => Math.min(b, Math.max(a, v));
  const normal = (t) => (t || "").replace(/\s+/g, " ").trim().toLowerCase();

  /* ------------------------------------------------------------------ *
   * 1. Bentuk huruf VENBEEMAIL
   *    Potongan kertas bersudut tajam, tinggi kapital 100 satuan. Tiap
   *    huruf miring dan naik-turun berbeda (garis dasar bergelombang),
   *    lubang huruf segitiga. Puncak = titik lipatan origami.
   * ------------------------------------------------------------------ */
  const BENTUK = {
    V: { w: 90, d: "M0 4L31 0L45 52L59 2L90 6L63 100L29 98Z", puncak: [[18, 20], [72, 22], [46, 82]], miring: -7, naik: 2, tetes: [] },
    E1: { w: 70, d: "M2 0L70 4L68 28L33 27L34 40L60 41L59 60L33 60L34 73L71 72L70 100L0 99Z", puncak: [[17, 18], [17, 84], [46, 50]], miring: 5, naik: -3, tetes: [[19, 26]] },
    N: { w: 86, d: "M0 2L29 0L56 47L56 3L86 0L84 99L59 100L31 54L31 98L1 100Z", puncak: [[15, 25], [71, 75], [44, 50]], miring: -3, naik: 1, tetes: [[72, 15]] },
    B: { w: 82, d: "M0 0L57 1L77 15L76 41L71 49L81 60L80 87L64 100L1 99ZM28 17L54 20L29 41ZM28 58L57 61L29 84Z", puncak: [[14, 50], [64, 28], [66, 74]], miring: -9, naik: -5, tetes: [[40, 34], [69, 18]] },
    E2: { w: 70, d: "M0 3L68 0L70 27L34 29L33 41L58 40L60 59L34 61L33 72L69 75L68 100L2 98Z", puncak: [[17, 20], [17, 84], [46, 50]], miring: 6, naik: 3, tetes: [] },
    E3: { w: 71, d: "M1 0L69 2L67 26L32 28L33 41L61 39L60 60L32 59L33 74L70 73L71 99L0 100Z", puncak: [[16, 16], [16, 86], [46, 50]], miring: -4, naik: -1, tetes: [[50, 22]] },
    M: { w: 104, d: "M0 3L29 0L52 37L75 1L104 4L101 100L74 99L74 50L54 79L49 79L30 51L30 98L1 100Z", puncak: [[15, 45], [88, 45], [52, 58]], miring: 3, naik: 4, tetes: [[15, 28], [88, 20]] },
    A: { w: 90, d: "M27 0L63 3L90 99L60 100L56 84L33 84L29 100L0 98ZM45 30L52 62L38 62Z", puncak: [[45, 16], [16, 90], [74, 90]], miring: -6, naik: -2, tetes: [[74, 30]] },
    I: { w: 34, d: "M0 0L34 3L33 99L2 100Z", puncak: [[17, 30], [17, 75]], miring: 7, naik: 3, tetes: [] },
    L: { w: 68, d: "M0 1L31 0L31 71L68 69L67 100L1 99Z", puncak: [[15, 35], [15, 85], [50, 86]], miring: -4, naik: -1, tetes: [[52, 24]] },
  };
  const KATA = [["V", "E1", "N", "B", "E2", "E3"], ["M", "A", "I", "L"]];
  const TINGGI_VB = 160;
  const CAHAYA = [-0.55, -0.83]; // sorotan dari kiri atas

  function el(nama, atribut = {}, induk) {
    const n = document.createElementNS(SVGNS, nama);
    for (const k in atribut) n.setAttribute(k, atribut[k]);
    if (induk) induk.appendChild(n);
    return n;
  }

  function titikLuar(d) {
    const luar = d.split(/Z/i)[0];
    const angka = luar.match(/-?\d+(\.\d+)?/g).map(Number);
    const titik = [];
    for (let i = 0; i < angka.length; i += 2) titik.push([angka[i], angka[i + 1]]);
    return titik;
  }

  function bunga(induk, cx, cy, r, kelopak, putar) {
    for (let k = 0; k < kelopak; k++) {
      el("ellipse", {
        cx, cy: cy - r * .55, rx: r * .24, ry: r * .55,
        transform: `rotate(${putar + (360 / kelopak) * k} ${cx} ${cy})`,
      }, induk);
    }
    el("circle", { cx, cy, r: r * .2, fill: "#31458c" }, induk);
  }

  // Definisi bersama: bentuk, potongan, gradien, motif bunga.
  function buatDefinisi() {
    const svg = el("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false" });
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    const defs = el("defs", {}, svg);

    const biru = el("linearGradient", { id: "vbp-g-biru", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    [["0", "#7598e0"], [".45", "#4a64b4"], [".8", "#34489a"], ["1", "#2b3d86"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, biru));

    const holo = el("linearGradient", { id: "vbp-g-holo", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    [["0", "#fff", "0"], [".28", "#7affe6", ".55"], [".42", "#ff96e6", ".6"], [".56", "#fff596", ".55"], [".7", "#8cbeff", ".5"], ["1", "#fff", "0"]]
      .forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, holo));

    const tetes = el("linearGradient", { id: "vbp-g-tetes", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    [["0", "#c4532c"], [".45", "#f08a63"], ["1", "#b04726"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, tetes));

    const motif = el("pattern", { id: "vbp-p-bunga", width: "58", height: "58", patternUnits: "userSpaceOnUse" }, defs);
    const g = el("g", { fill: "#f4f7fb", "fill-opacity": ".88" }, motif);
    bunga(g, 16, 17, 13, 8, 0);
    bunga(g, 44, 43, 8, 6, 20);
    el("circle", { cx: 42, cy: 11, r: 1.4 }, g);
    el("circle", { cx: 9, cy: 45, r: 1.7 }, g);
    el("circle", { cx: 29, cy: 34, r: 1 }, g);
    el("path", { d: "M52 24l3 2-2 2z", "fill-opacity": ".6" }, g);

    for (const kunci in BENTUK) {
      el("path", { id: `vbp-b-${kunci}`, d: BENTUK[kunci].d, "fill-rule": "evenodd", "clip-rule": "evenodd" }, defs);
      const cp = el("clipPath", { id: `vbp-k-${kunci}` }, defs);
      el("use", { href: `#vbp-b-${kunci}` }, cp);
    }
    return svg;
  }

  function jalurTetes(x, panjang) {
    const y = 96, r = 3.4 + panjang * .07, w = r * .62;
    const ujung = y + panjang;
    return `M${x - w - 3.5} ${y}C${x - w} ${y + panjang * .35} ${x - r * .9} ${ujung - r * 1.6} ${x - r} ${ujung - r}` +
      `A${r} ${r} 0 1 0 ${x + r} ${ujung - r}C${x + r * .9} ${ujung - r * 1.6} ${x + w} ${y + panjang * .35} ${x + w + 3.5} ${y}Z`;
  }

  let nomorWajah = 0;
  function buatWajah(induk) {
    const n = ++nomorWajah;
    const g = el("g", { class: "vbp-wajah" }, induk);
    const mata = [
      { d: "M31 20.5L50.5 23L31.5 37.5Z", px: 37.5, py: 26.5 },
      { d: "M31 61.5L53 64L31.5 80.5Z", px: 38.5, py: 68.5 },
    ];
    mata.forEach((m, i) => {
      const gm = el("g", { class: `vbp-mata ${i ? "vbp-mata-bawah" : "vbp-mata-atas"}` }, g);
      el("path", { class: "vbp-mata-putih", d: m.d }, gm);
      const cp = el("clipPath", { id: `vbp-cm-${n}-${i}` }, gm);
      el("path", { d: m.d }, cp);
      const gp = el("g", { "clip-path": `url(#vbp-cm-${n}-${i})` }, gm);
      el("circle", { class: "vbp-pupil", cx: m.px, cy: m.py, r: 4.4 }, gp);
      el("path", { class: `vbp-kelopak-b ${i ? "vbp-kelopak-bawah" : "vbp-kelopak-atas"}`, d: m.d.replace(/(\d+(\.\d+)?)/g, (a) => a) }, gm);
    });
    el("path", { class: "vbp-hidung", d: "M54 46.5L61 50.5L54 54.5Z" }, g);
    const senyum = el("g", { class: "vbp-wajah-senyum" }, g);
    el("path", { class: "vbp-mulut", d: "M62 34Q73.5 50.5 62 67" }, senyum);
    const lebar = el("g", { class: "vbp-wajah-lebar" }, g);
    el("path", { class: "vbp-mulut-lebar", d: "M59 32Q76 50 59 68Z" }, lebar);
    el("path", { class: "vbp-gigi", d: "M59 36L63.5 39L59 42ZM59 45L63.5 48L59 51ZM59 54L63.5 57L59 60Z" }, lebar);
    const lidah = el("g", { class: "vbp-wajah-lidah" }, g);
    el("path", { class: "vbp-lidah", d: "M64 44.5L84 42.5Q93 50 84 57.5L64 55.5Z" }, lidah);
    el("path", { class: "vbp-mulut", d: "M70 50L83 50", "stroke-width": "1.6" }, lidah);
    [["vbp-z1", 72, 8, 1], ["vbp-z2", 80, -2, .8], ["vbp-z3", 88, -12, .65]].forEach(([k, x, y, s]) => {
      const t = el("text", { class: `vbp-z ${k}`, x, y, "font-size": 15 * s }, g);
      t.textContent = "z";
    });
    return g;
  }

  function buatHuruf(kunci, opsi) {
    const b = BENTUK[kunci];
    const lebarVB = b.w + 28;
    const wadah = document.createElement(opsi.tombol ? "button" : "span");
    wadah.className = "vbp-huruf" + (kunci === "B" ? " vbp-huruf-b" : "");
    wadah.style.aspectRatio = `${lebarVB} / ${TINGGI_VB}`;
    if (opsi.tombol) {
      wadah.type = "button";
      wadah.classList.add("vbp-wajah-b");
      wadah.dataset.labelId = "Huruf B: tekan untuk ganti wajah";
      wadah.dataset.labelEn = "Letter B: press to change its face";
      wadah.setAttribute("aria-label", wadah.dataset.labelId);
    } else {
      wadah.setAttribute("aria-hidden", "true");
    }
    const dalam = document.createElement("span");
    dalam.className = "vbp-huruf-dalam";
    wadah.appendChild(dalam);

    const svg = el("svg", { viewBox: `-12 -12 ${lebarVB} ${TINGGI_VB}`, focusable: "false", "aria-hidden": "true" }, dalam);

    // L4: lapisan tebal di belakang huruf.
    const tebal = el("g", { class: "vbp-tebal" }, svg);
    for (let i = opsi.lapis; i >= 1; i--) {
      const n = Math.round(i * 10 / opsi.lapis);
      el("use", { href: `#vbp-b-${kunci}`, class: `vbp-t vbp-t${n}` }, tebal);
    }

    // Muka: biru kobalt, motif bunga, bidang lipatan, kilau holografik.
    const muka = el("g", { "clip-path": `url(#vbp-k-${kunci})` }, svg);
    el("rect", { x: -12, y: -12, width: lebarVB, height: 130, fill: "url(#vbp-g-biru)" }, muka);
    const ox = (kunci.charCodeAt(0) * 7) % 40, oy = (b.w * 3) % 31, rot = (kunci.charCodeAt(0) % 5) * 9 - 18;
    el("rect", { class: "vbp-pola", x: -80, y: -80, width: 260, height: 260, fill: "url(#vbp-p-bunga)", transform: `rotate(${rot} ${b.w / 2} 50) translate(${ox} ${oy})` }, muka);

    const titik = titikLuar(b.d);
    let luas = 0;
    for (let i = 0; i < titik.length; i++) {
      const [x1, y1] = titik[i], [x2, y2] = titik[(i + 1) % titik.length];
      luas += x1 * y2 - x2 * y1;
    }
    const arah = luas > 0 ? 1 : -1;
    const faset = el("g", { class: "vbp-faset" }, muka);
    const lipat = el("g", { class: "vbp-lipat" }, muka);
    for (let i = 0; i < titik.length; i++) {
      const p1 = titik[i], p2 = titik[(i + 1) % titik.length];
      const tx = (p1[0] + p2[0]) / 2, ty = (p1[1] + p2[1]) / 2;
      let puncak = b.puncak[0], jarak = Infinity;
      for (const p of b.puncak) {
        const j = (p[0] - tx) ** 2 + (p[1] - ty) ** 2;
        if (j < jarak) { jarak = j; puncak = p; }
      }
      const ex = p2[0] - p1[0], ey = p2[1] - p1[1];
      const pj = Math.hypot(ex, ey) || 1;
      const nx = (ey / pj) * arah, ny = (-ex / pj) * arah;
      const s = -(nx * CAHAYA[0] + ny * CAHAYA[1]);
      const isi = s > 0 ? `rgba(255,255,255,${(s * .26).toFixed(3)})` : `rgba(6,10,40,${(-s * .34).toFixed(3)})`;
      el("path", { d: `M${puncak[0]} ${puncak[1]}L${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}Z`, fill: isi }, faset);
      el("path", { d: `M${puncak[0]} ${puncak[1]}L${p1[0]} ${p1[1]}` }, lipat);
    }
    const geser = el("g", { class: "vbp-kilau-geser" }, muka);
    el("rect", { class: "vbp-kilau", x: -150, y: -20, width: 90, height: 170, fill: "url(#vbp-g-holo)", transform: "skewX(-16)" }, geser);

    el("use", { href: `#vbp-b-${kunci}`, class: "vbp-tepi-huruf" }, svg);

    if (opsi.tetes) {
      for (const [x, pj] of b.tetes) {
        const g = el("g", {}, svg);
        el("path", { class: "vbp-tetes", d: jalurTetes(x, pj), fill: "url(#vbp-g-tetes)" }, g);
        el("ellipse", { class: "vbp-tetes-kilap", cx: x - 1.2, cy: 96 + pj - (3.4 + pj * .07) * 1.15, rx: 1, ry: 1.6 }, g);
      }
    }
    if (kunci === "B") buatWajah(svg);

    return { wadah, dalam, kunci, svg };
  }

  function rakitKata(induk, opsi) {
    const daftar = [];
    for (const baris of KATA) {
      const elBaris = document.createElement("span");
      elBaris.className = "vbp-baris";
      for (const kunci of baris) {
        const h = buatHuruf(kunci, { ...opsi, tombol: opsi.tombolB && kunci === "B" });
        elBaris.appendChild(h.wadah);
        daftar.push(h);
      }
      induk.appendChild(elBaris);
    }
    return daftar;
  }

  /* ------------------------------------------------------------------ *
   * 2. Wajah huruf B: kedip, melirik, nyengir, menjulurkan lidah
   * ------------------------------------------------------------------ */
  const wajah = {
    svg: [],
    urutan: ["kedip", "lirik", "nyengir", "lidah"],
    ke: 0,
    aktif: null,
    pewaktu: 0,
    tidur: false,
    atur(nama, lama) {
      clearTimeout(this.pewaktu);
      for (const s of this.svg) {
        s.classList.remove(...["kedip", "lirik", "nyengir", "lidah", "kaget", "pejam", "tidur"].map((k) => `vbp-ekspresi-${k}`));
        if (nama) s.classList.add(`vbp-ekspresi-${nama}`);
      }
      this.aktif = nama;
      if (nama && lama) this.pewaktu = setTimeout(() => this.atur(this.tidur ? "tidur" : null), lama);
    },
    tekan() {
      this.tidur = false;
      const nama = this.urutan[this.ke % this.urutan.length];
      this.ke++;
      this.atur(nama, 1500);
      if (nama === "lirik") this.lirik(3.2, -1.4, 1500);
    },
    kedipSendiri() {
      if (!this.aktif) this.atur("pejam", 130);
    },
    kaget() {
      if (this.aktif === "kaget") return;
      this.tidur = false;
      this.atur("kaget", 700);
    },
    lirikSampai: 0,
    lirik(dx, dy, lama) {
      this.lirikSampai = performance.now() + (lama || 0);
      this.arahkanPupil(dx, dy, true);
    },
    arahkanPupil(dx, dy, paksa) {
      if (!paksa && performance.now() < this.lirikSampai) return;
      for (const s of this.svg) {
        s.querySelectorAll(".vbp-pupil").forEach((p) => { p.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`; });
      }
    },
  };

  /* ------------------------------------------------------------------ *
   * 3. Bahasa ID/EN, selaras dengan tombol bahasa halaman lama
   * ------------------------------------------------------------------ */
  const KUNCI_BAHASA = "vbpro-bahasa";
  const lama = { ada: false, per: { id: null, en: null }, tunggal: null };

  function isiLamaAda() {
    return Array.from(document.body.children).some((n) => n !== akar && !n.matches("script, style, link, noscript, template, [data-pratinjau], svg[aria-hidden]"));
  }

  function cariTombolBahasaLama() {
    const calon = Array.from(document.querySelectorAll("button, a, [role='button']")).filter((n) => !akar.contains(n));
    for (const n of calon) {
      const t = normal(n.textContent).toUpperCase();
      if (/^(ID|IND|INDONESIA|BAHASA INDONESIA)$/.test(t)) lama.per.id = lama.per.id || n;
      else if (/^(EN|ENG|ENGLISH)$/.test(t)) lama.per.en = lama.per.en || n;
      else if (/^(ID|EN)\s*[/|·•-]\s*(ID|EN)$/.test(t)) lama.tunggal = lama.tunggal || n;
    }
  }

  const bahasaHtml = () => (normal(document.documentElement.getAttribute("lang")).startsWith("en") ? "en" : "id");
  const adaTombolLama = () => !!(lama.per.id || lama.per.en || lama.tunggal);

  function pasangBahasa(b, dariKita) {
    akar.dataset.bahasa = b;
    $$("[data-pilih]").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.pilih === b)));
    $$("[data-label-id]").forEach((n) => n.setAttribute("aria-label", b === "en" ? n.dataset.labelEn : n.dataset.labelId));
    try { localStorage.setItem(KUNCI_BAHASA, b); } catch (e) { /* penyimpanan diblokir */ }
    if (dariKita && adaTombolLama()) {
      if (lama.per[b]) lama.per[b].click();
      else if (lama.tunggal && bahasaHtml() !== b) lama.tunggal.click();
    }
    if (!lama.ada) document.documentElement.setAttribute("lang", b);
  }

  function siapkanBahasa() {
    cariTombolBahasaLama();
    let awal = "id";
    if (adaTombolLama()) awal = bahasaHtml();
    else {
      try { const s = localStorage.getItem(KUNCI_BAHASA); if (s === "en" || s === "id") awal = s; } catch (e) { /* abaikan */ }
    }
    pasangBahasa(awal, false);
    $$("[data-pilih]").forEach((t) => t.addEventListener("click", () => pasangBahasa(t.dataset.pilih, true)));
    if (lama.ada) {
      new MutationObserver(() => {
        const b = bahasaHtml();
        if (b !== akar.dataset.bahasa) pasangBahasa(b, false);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. Penyambung ke halaman /pro lama
   * ------------------------------------------------------------------ */
  function berbahaya(n) {
    if (!n || n === document.body || n === document.documentElement) return true;
    if (n.contains(akar) || akar.contains(n) || n.matches("main")) return true;
    if (n.querySelector("pre, code, table, form, textarea, input, select")) return true;
    return /\/api\/|\bcurl\b|@venbeemail\.com|(kotak|surat|pos)\.venbeemail/i.test(n.textContent || "");
  }

  function naikAman(n) {
    if (berbahaya(n)) return null;
    let x = n;
    while (x.parentElement && !berbahaya(x.parentElement)) x = x.parentElement;
    return x;
  }

  function sembunyikanBagianLama() {
    const tanda = /(^|\/)0[123]-(latar|maskot|tulisan)\.(webp|png|jpe?g|avif)/i;
    const benih = new Set();
    document.querySelectorAll("img, source").forEach((n) => {
      if (akar.contains(n)) return;
      const src = `${n.getAttribute("src") || ""} ${n.getAttribute("srcset") || ""}`;
      if (tanda.test(src) || /0[123]-(latar|maskot|tulisan)\./i.test(src)) benih.add(n.closest("picture") || n);
    });
    Array.from(document.body.querySelectorAll("*")).slice(0, 800).forEach((n) => {
      if (akar.contains(n) || n === akar) return;
      const bg = getComputedStyle(n).backgroundImage;
      if (bg && bg !== "none" && /0[123]-(latar|maskot|tulisan)\./i.test(bg)) benih.add(n);
    });
    const sembunyi = new Set();
    benih.forEach((n) => { const x = naikAman(n); if (x) sembunyi.add(x); });

    // Kepala lama: header/nav di luar hero baru, atau elemen tetap di atas layar.
    document.querySelectorAll("body > header, body > nav, body > div > header, [role='banner']").forEach((n) => {
      if (!akar.contains(n) && !berbahaya(n)) sembunyi.add(n);
    });
    Array.from(document.body.querySelectorAll("*")).slice(0, 800).forEach((n) => {
      if (akar.contains(n) || n === akar || sembunyi.has(n)) return;
      const gaya = getComputedStyle(n);
      if (gaya.position !== "fixed" && gaya.position !== "sticky") return;
      const r = n.getBoundingClientRect();
      if (r.top < 90 && r.height > 20 && r.height < 200 && n.querySelector("a, button") && !berbahaya(n)) sembunyi.add(n);
    });
    sembunyi.forEach((n) => n.classList.add("vbp-lama-sembunyi"));
    return sembunyi.size;
  }

  function petakanTautan() {
    const tautanLama = Array.from(document.querySelectorAll("a[href^='#']")).filter((a) => !akar.contains(a) && a.getAttribute("href").length > 1);
    const judulLama = Array.from(document.querySelectorAll("h1, h2, h3")).filter((h) => !akar.contains(h));
    const sasaranAda = (id) => { const t = id && document.getElementById(id); return t && !akar.contains(t) ? t : null; };

    $$("[data-cari]").forEach((a) => {
      const pola = a.dataset.cari.split("|");
      let id = a.getAttribute("href").slice(1);
      let sasaran = sasaranAda(id);
      if (!sasaran) {
        const cocok = tautanLama.find((l) => pola.includes(normal(l.textContent))) ||
          tautanLama.find((l) => pola.some((p) => normal(l.textContent).includes(p)));
        if (cocok && sasaranAda(cocok.getAttribute("href").slice(1))) {
          id = cocok.getAttribute("href").slice(1);
          sasaran = sasaranAda(id);
        }
      }
      if (!sasaran) {
        const judul = judulLama.find((h) => pola.includes(normal(h.textContent))) ||
          judulLama.find((h) => pola.some((p) => normal(h.textContent).includes(p)));
        if (judul) {
          const bagian = judul.closest("section[id], article[id], div[id]");
          if (bagian && bagian !== document.body && !akar.contains(bagian)) id = bagian.id;
          else {
            if (!judul.id) judul.id = `vbp-ke-${pola[0].replace(/\s+/g, "-")}`;
            id = judul.id;
          }
          sasaran = sasaranAda(id);
        }
      }
      if (sasaran) a.setAttribute("href", `#${id}`);
      if (pola[0] === "tentang") a.hidden = !sasaran;
    });
  }

  function isiKartuCurl() {
    const kode = Array.from(document.querySelectorAll("pre, code"))
      .filter((n) => !akar.contains(n))
      .find((n) => /\bcurl\s/.test(n.textContent || ""));
    if (kode) $("#vbp-kartu-kode").textContent = (kode.closest("pre") || kode).textContent.trim();
  }

  function namaJudul() {
    const ganti = () => {
      if (/BanaMail Pro/.test(document.title)) document.title = document.title.replace(/BanaMail Pro/g, "VenbeeMail Pro");
    };
    ganti();
    const t = document.querySelector("title");
    if (t) new MutationObserver(ganti).observe(t, { childList: true, characterData: true, subtree: true });
  }

  // Hero selalu selebar layar dan menempel di atas walau body halaman lama
  // punya margin atau padding.
  function lebarPenuh() {
    akar.style.marginLeft = "";
    akar.style.marginTop = "";
    akar.style.width = "";
    const r = akar.getBoundingClientRect();
    const lebar = document.documentElement.clientWidth;
    if (Math.abs(r.left) > .5 || Math.abs(r.width - lebar) > .5) {
      akar.style.marginLeft = `${-r.left}px`;
      akar.style.width = `${lebar}px`;
    }
    const atas = r.top + scrollY;
    if (document.body.firstElementChild === akar && atas > .5 && atas < 60) akar.style.marginTop = `${-atas}px`;
  }

  /* ------------------------------------------------------------------ *
   * 5. Menu HP dan logo pojok
   * ------------------------------------------------------------------ */
  function siapkanMenu() {
    const menu = $("#vbp-menu");
    const tombol = $("#vbp-buka-menu");
    const tutup = () => { menu.classList.remove("vbp-menu-terbuka"); tombol.setAttribute("aria-expanded", "false"); };
    tombol.addEventListener("click", () => {
      const buka = !menu.classList.contains("vbp-menu-terbuka");
      menu.classList.toggle("vbp-menu-terbuka", buka);
      tombol.setAttribute("aria-expanded", String(buka));
      if (buka) { const a = $("#vbp-nav a:not([hidden])"); if (a) a.focus(); }
    });
    $$("#vbp-nav a").forEach((a) => a.addEventListener("click", tutup));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("vbp-menu-terbuka")) { tutup(); tombol.focus(); } });
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) tutup(); });
  }

  /* ------------------------------------------------------------------ *
   * 6. Pemuat GSAP (dari folder sendiri, aman dari CSP)
   * ------------------------------------------------------------------ */
  function muatGsap() {
    const perlu = [];
    if (!window.gsap) perlu.push("gsap.min.js");
    if (!window.ScrollTrigger) perlu.push("ScrollTrigger.min.js");
    if (!window.MotionPathPlugin) perlu.push("MotionPathPlugin.min.js");
    return Promise.all(perlu.map((f) => new Promise((ok, gagal) => {
      const s = document.createElement("script");
      s.src = `${DASAR}js/${f}`;
      s.async = false;
      s.onload = ok;
      s.onerror = () => gagal(new Error(f));
      document.head.appendChild(s);
    })));
  }

  /* ------------------------------------------------------------------ *
   * 7. Mulai
   * ------------------------------------------------------------------ */
  const waktuMulai = performance.now();
  let hurufBesar = [], hurufLogo = [];

  function bangun() {
    document.body.appendChild(buatDefinisi());
    hurufBesar = rakitKata($("#vbp-tulisan-huruf"), { lapis: 10, tetes: true, tombolB: false });
    hurufLogo = rakitKata($("#vbp-logo-huruf"), { lapis: 5, tetes: false, tombolB: true });
    [...hurufBesar, ...hurufLogo].forEach((h) => {
      const b = BENTUK[h.kunci];
      h.dalam.style.transform = `translateY(${b.naik}%) rotate(${b.miring}deg)`;
      if (h.kunci === "B") wajah.svg.push(h.svg);
    });
    akar.classList.add("vbp-siap");

    lama.ada = isiLamaAda();
    if (lama.ada) {
      sembunyikanBagianLama();
      petakanTautan();
      isiKartuCurl();
      namaJudul();
    }
    lebarPenuh();
    siapkanBahasa();
    siapkanMenu();
    siapkanWajah();
  }

  function siapkanWajah() {
    const bLogo = hurufLogo.find((h) => h.kunci === "B").wadah;
    const bBesar = hurufBesar.find((h) => h.kunci === "B").wadah;
    bLogo.addEventListener("click", () => wajah.tekan());
    bBesar.addEventListener("click", () => wajah.tekan());

    let diam = 0;
    const bangunkan = () => {
      diam = performance.now();
      if (wajah.tidur) { wajah.tidur = false; wajah.atur(null); }
    };
    ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, bangunkan, { passive: true }));
    bangunkan();

    const gerak = () => mqGerak.matches;
    setInterval(() => {
      if (document.hidden) return;
      if (!wajah.tidur && performance.now() - diam > 20000 && !wajah.aktif) {
        wajah.tidur = true;
        wajah.atur("tidur");
      }
    }, 1000);
    (function kedipBerikut() {
      setTimeout(() => { if (gerak() && !document.hidden) wajah.kedipSendiri(); kedipBerikut(); }, acak(3000, 6000));
    })();

    // L7: mata huruf B mengikuti kursor.
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      for (const h of [...hurufBesar, ...hurufLogo]) {
        if (h.kunci !== "B") continue;
        const r = h.wadah.getBoundingClientRect();
        if (!r.width) continue;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const j = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, j / 300);
        h.svg.querySelectorAll(".vbp-pupil").forEach((p) => {
          if (performance.now() < wajah.lirikSampai) return;
          p.style.transform = `translate(${(dx / j * 3.4 * k).toFixed(2)}px, ${(dy / j * 3 * k).toFixed(2)}px)`;
        });
      }
    }, { passive: true });
  }

  function statis() {
    // Tanpa GSAP atau dengan "kurangi gerakan": susunan diam, isi lengkap.
    hurufLogo.forEach((h) => { h.wadah.style.opacity = "1"; });
    const daftar = buatCincin(mqHP.matches ? 6 : 12);
    const ukur = ukurCincin();
    daftar.forEach((a) => gambarSatuAmplop(a, ukur, .5, 1));
    const p = $("#vbp-pesawat");
    p.style.opacity = "1";
    const jalur = buatJalurPesawat();
    const t = .62;
    if (jalur.raw) {
      const pos = MotionPathPlugin.getPositionOnPath(jalur.raw, t, true);
      p.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}deg) scale(.72)`;
      p.style.zIndex = "9";
      $("#vbp-jejak-buka").setAttribute("stroke-dashoffset", String(-(t * jalur.panjang - jalur.seg)));
    } else {
      p.style.transform = `translate(${adegan.clientWidth * .78}px, ${adegan.clientHeight * .3}px) rotate(-14deg)`;
    }
  }

  /* ---------- Cincin amplop (E1) ---------- */
  function buatCincin(n) {
    const wadah = $("#vbp-cincin");
    wadah.textContent = "";
    const daftar = [];
    for (let i = 0; i < n; i++) {
      const a = document.createElement("span");
      a.className = "vbp-amplop";
      const jauh = new Image();
      jauh.src = `${DASAR}gambar/amplop-jauh.webp`;
      jauh.alt = "";
      const tajam = new Image();
      tajam.src = `${DASAR}gambar/amplop.webp`;
      tajam.alt = "";
      tajam.decoding = "async";
      a.append(jauh, tajam);
      wadah.appendChild(a);
      daftar.push({ el: a, tajam, sudut: (i / n) * Math.PI * 2 + (i % 2) * .12, z: -1 });
    }
    return daftar;
  }

  function ukurCincin() {
    const W = adegan.clientWidth, H = adegan.clientHeight;
    const hp = mqHP.matches;
    const rx = hp ? W * .44 : Math.min(W * .37, H * .78);
    return { rx, ry: rx * (hp ? .26 : .2), miring: -.13 };
  }

  function gambarSatuAmplop(a, ukur, putar, redup) {
    const t = a.sudut + putar;
    const x0 = Math.cos(t) * ukur.rx, y0 = Math.sin(t) * ukur.ry;
    const c = Math.cos(ukur.miring), s = Math.sin(ukur.miring);
    const x = x0 * c - y0 * s, y = x0 * s + y0 * c;
    const d = Math.sin(t);
    const k = (d + 1) / 2;
    const skala = .55 + .5 * k;
    a.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${skala.toFixed(3)}) rotate(${(Math.cos(t) * -9).toFixed(1)}deg)`;
    a.el.style.opacity = ((.4 + .6 * k) * redup).toFixed(3);
    a.tajam.style.opacity = (k * k).toFixed(3);
    const z = d > .02 ? 24 : 4;
    if (z !== a.z) { a.el.style.zIndex = String(z); a.z = z; }
  }

  /* ---------- Jalur pesawat (E3) ---------- */
  function jalurHalus(titik) {
    const n = titik.length;
    let d = `M${titik[0][0].toFixed(1)} ${titik[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = titik[(i - 1 + n) % n], p1 = titik[i], p2 = titik[(i + 1) % n], p3 = titik[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return `${d}Z`;
  }

  function buatJalurPesawat() {
    const W = adegan.clientWidth, H = adegan.clientHeight;
    const hp = mqHP.matches;
    const maskot = posisiDi($("#vbp-maskot"), hero);
    const cx = W / 2, cy = maskot.y + maskot.h * (hp ? .42 : .45);
    const rx = hp ? W * .5 : Math.min(W * .45, H * .95), ry = H * (hp ? .2 : .25), th = -.2;
    const titik = [];
    for (let i = 0; i < 28; i++) {
      const t = (i / 28) * Math.PI * 2;
      const x0 = Math.cos(t) * rx * (1 + .06 * Math.sin(3 * t)), y0 = Math.sin(t) * ry + Math.sin(2 * t) * H * .02;
      titik.push([cx + x0 * Math.cos(th) - y0 * Math.sin(th), cy + x0 * Math.sin(th) + y0 * Math.cos(th)]);
    }
    const d = jalurHalus(titik);
    const svg = $("#vbp-jejak");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    ["#vbp-jalur", "#vbp-jejak-buka", "#vbp-jejak-garis"].forEach((s) => $(s).setAttribute("d", d));
    const panjang = $("#vbp-jalur").getTotalLength();
    const buka = $("#vbp-jejak-buka");
    const seg = panjang * .3;
    buka.setAttribute("stroke-dasharray", `${seg.toFixed(1)} ${(panjang - seg).toFixed(1)}`);
    return { panjang, seg, raw: window.MotionPathPlugin ? MotionPathPlugin.cacheRawPathMeasurements(MotionPathPlugin.getRawPath($("#vbp-jalur"))) : null };
  }

  function posisiDi(n, hingga) {
    let x = 0, y = 0, k = n;
    while (k && k !== hingga && k !== document.body) {
      x += k.offsetLeft;
      y += k.offsetTop;
      k = k.offsetParent;
    }
    return { x, y, w: n.offsetWidth, h: n.offsetHeight };
  }

  /* ---------- Serpihan kertas melayang (C3, hanya desktop) ---------- */
  function serpihan(gsap) {
    const kanvas = $("#vbp-serpih");
    const ctx = kanvas.getContext("2d");
    if (!ctx) return () => {};
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const warna = ["#f4f7fb", "#77a3e4", "#e7663c", "#a4c4ce"];
    let W = 0, H = 0;
    const ukur = () => { W = adegan.clientWidth; H = adegan.clientHeight; kanvas.width = W * dpr; kanvas.height = H * dpr; };
    ukur();
    const daftar = Array.from({ length: 36 }, () => ({
      x: Math.random(), y: Math.random(), z: acak(.3, 1), r: acak(0, 6.28), vr: acak(-.6, .6),
      s: acak(2, 5.5), c: warna[(Math.random() * warna.length) | 0], a: acak(.12, .4),
    }));
    let terakhir = performance.now();
    const gambar = () => {
      if (!terlihat) return;
      const kini = performance.now(), dt = Math.min(.05, (kini - terakhir) / 1000);
      terakhir = kini;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const p of daftar) {
        p.y += dt * .018 * p.z;
        p.x += dt * .006 * Math.sin(kini / 1700 + p.r);
        p.r += dt * p.vr;
        if (p.y > 1.05) { p.y = -.05; p.x = Math.random(); }
        ctx.save();
        ctx.translate(p.x * W, p.y * H);
        ctx.rotate(p.r);
        ctx.globalAlpha = p.a * p.z;
        ctx.fillStyle = p.c;
        const s = p.s * p.z;
        ctx.beginPath();
        ctx.moveTo(-s, -s * .6);
        ctx.lineTo(s, -s * .3);
        ctx.lineTo(s * .4, s * .7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    };
    gsap.ticker.add(gambar);
    addEventListener("resize", ukur);
    return () => { gsap.ticker.remove(gambar); removeEventListener("resize", ukur); ctx.clearRect(0, 0, kanvas.width, kanvas.height); };
  }

  let terlihat = true;

  function hidup() {
    const gsap = window.gsap;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.addEventListener("refreshInit", lebarPenuh);

    new IntersectionObserver((e) => { terlihat = e[0].isIntersecting; }, { rootMargin: "80px" }).observe(hero);

    const mm = gsap.matchMedia();
    mm.add({ gerak: "(prefers-reduced-motion: no-preference)", hp: "(max-width: 720px)", kursor: "(hover: hover) and (pointer: fine)" }, (konteks) => {
      const { gerak, hp, kursor } = konteks.conditions;
      if (!gerak) {
        statis();
        return () => { hurufLogo.forEach((h) => { h.wadah.style.opacity = ""; }); };
      }
      return jalankan(gsap, hp, kursor);
    });

    addEventListener("load", () => ScrollTrigger.refresh());
  }

  function jalankan(gsap, hp, kursor) {
    const bersih = [];
    const elLatar = $(".vbp-latar");
    const elSorot = $(".vbp-sorot");
    const elTulisan = $(".vbp-tulisan");
    const elTulisanHuruf = $("#vbp-tulisan-huruf");
    const elMaskot = $("#vbp-maskot");
    const elTombolMaskot = $("#vbp-maskot-tombol");
    const elMiring = $(".vbp-maskot-miring");
    const elNapas = $(".vbp-maskot-napas");
    const elKotak = $(".vbp-maskot-kotak");
    const elBayang = $(".vbp-maskot-bayang");
    const elSapuan = $(".vbp-maskot-sapuan");
    const elPesawat = $("#vbp-pesawat");
    const elKartu = $("#vbp-kartu");
    const elAU = $("#vbp-amplop-utama");
    const bagianAU = $$(".vbp-au", elAU);
    const elLipat = $(".vbp-au-lipat", elAU);
    const elTutup = $(".vbp-au-tutup", elAU);
    const elBalik = $(".vbp-au-tutup-balik", elAU);
    const monyet = $$(".vbp-monyet").filter((m) => getComputedStyle(m).display !== "none");
    const besarDalam = hurufBesar.map((h) => h.dalam);
    const besarWadah = hurufBesar.map((h) => h.wadah);
    const kilau = $$(".vbp-tulisan .vbp-kilau-geser");

    hurufLogo.forEach((h) => { h.wadah.style.opacity = ""; });
    besarDalam.forEach((d) => { d.style.transform = ""; });
    gsap.set(besarDalam, { transformOrigin: "50% 70%", transformPerspective: 700 });
    hurufBesar.forEach((h) => gsap.set(h.dalam, { yPercent: BENTUK[h.kunci].naik, rotation: BENTUK[h.kunci].miring }));

    /* --- Cincin amplop dan pesawat: digambar tiap frame --- */
    const daftarAmplop = buatCincin(hp ? 6 : 12);
    let ukurC = ukurCincin();
    const cincin = { waktu: 0, gulir: 0, redup: 1 };
    let jalur = buatJalurPesawat();
    const pesawat = { p: .58, bonus: 0 };
    let kecepatanGulir = 0;
    const buka = $("#vbp-jejak-buka");

    const tiapFrame = (waktu, dt) => {
      if (!terlihat) return;
      const detik = Math.min(dt, 50) / 1000;
      cincin.waktu += detik * .2;
      for (const a of daftarAmplop) gambarSatuAmplop(a, ukurC, cincin.waktu + cincin.gulir, cincin.redup);

      pesawat.bonus += (Math.min(Math.abs(kecepatanGulir), 4000) / 4000 * .12 - pesawat.bonus) * .08;
      pesawat.p = (pesawat.p + detik * (1 / 13 + pesawat.bonus)) % 1;
      if (jalur.raw) {
        const pos = MotionPathPlugin.getPositionOnPath(jalur.raw, pesawat.p, true);
        const depan = Math.sin(pesawat.p * Math.PI * 2) > 0;
        const s = depan ? 1 : .72;
        elPesawat.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.angle.toFixed(1)}deg) scale(${s})`;
        elPesawat.style.zIndex = depan ? "26" : "9";
        buka.setAttribute("stroke-dashoffset", (-(pesawat.p * jalur.panjang - jalur.seg)).toFixed(1));
      }
    };
    gsap.ticker.add(tiapFrame);
    bersih.push(() => gsap.ticker.remove(tiapFrame));

    const ukurUlang = () => { ukurC = ukurCincin(); jalur = buatJalurPesawat(); };
    ScrollTrigger.addEventListener("refresh", ukurUlang);
    bersih.push(() => ScrollTrigger.removeEventListener("refresh", ukurUlang));

    if (!hp) bersih.push(serpihan(gsap));

    /* --- Maskot hidup (Tingkat 1 dan 2) --- */
    gsap.to(elNapas, { scaleY: 1.015, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.fromTo(elNapas, { rotation: -1 }, { rotation: 1, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(elKotak, { y: () => -batas(elMaskot.offsetHeight * .009, 4, 6), duration: .72, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(elBayang, { scaleX: .96, opacity: .9, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

    const kelopak = $$(".vbp-kelopak");
    gsap.set(kelopak, { scaleY: 0, transformOrigin: "50% 0%", opacity: 1 });
    let pewaktuKedip;
    const kedipMaskot = () => {
      gsap.timeline().to(kelopak, { scaleY: 1, duration: .06, ease: "power1.in" }).to(kelopak, { scaleY: 0, duration: .06, ease: "power1.out" });
      pewaktuKedip = gsap.delayedCall(acak(3, 6), kedipMaskot);
    };
    pewaktuKedip = gsap.delayedCall(acak(1.5, 3), kedipMaskot);
    bersih.push(() => pewaktuKedip && pewaktuKedip.kill());

    // M4 miring mengikuti kursor; M9 terhuyung saat gulir cepat.
    const miringY = gsap.quickTo(elMiring, "rotationY", { duration: .7, ease: "power3.out" });
    const miringX = gsap.quickTo(elMiring, "rotationX", { duration: .7, ease: "power3.out" });
    const huyung = gsap.quickTo(elMiring, "rotation", { duration: 1.1, ease: "elastic.out(1, 0.35)" });
    const bayangX = gsap.quickTo(elBayang, "xPercent", { duration: .7, ease: "power3.out" });
    gsap.set(elMiring, { transformPerspective: 900 });
    const tulisanY = gsap.quickTo(elTulisanHuruf, "rotationY", { duration: .8, ease: "power3.out" });
    const tulisanX = gsap.quickTo(elTulisanHuruf, "rotationX", { duration: .8, ease: "power3.out" });
    const tebal = { ex: .55, ey: .85 };
    const tulisTebal = () => {
      elTulisan.style.setProperty("--vbp-ex", tebal.ex.toFixed(3));
      elTulisan.style.setProperty("--vbp-ey", tebal.ey.toFixed(3));
    };

    let progres = 0;
    if (kursor) {
      const gerakKursor = (e) => {
        if (!terlihat) return;
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        miringY(nx * 16);
        miringX(-ny * 6);
        bayangX(-nx * 18);
        const redam = progres > .7 ? 0 : 1;
        tulisanY(nx * 9 * redam);
        tulisanX(-ny * 6 * redam);
        gsap.to(tebal, { ex: .55 - nx * 1.1 * redam, ey: .85 - ny * .8 * redam, duration: .8, ease: "power3.out", overwrite: true, onUpdate: tulisTebal });
      };
      addEventListener("pointermove", gerakKursor, { passive: true });
      bersih.push(() => removeEventListener("pointermove", gerakKursor));
    }

    // M8 reaksi ketuk: memipih, memantul, kotak surat terangkat, amplop meloncat.
    const elLoncat = $(".vbp-amplop-loncat");
    const ketuk = () => {
      gsap.timeline()
        .to(elTombolMaskot, { scaleY: .9, scaleX: 1.06, transformOrigin: "50% 100%", duration: .1, ease: "power2.out" })
        .to(elTombolMaskot, { scaleY: 1, scaleX: 1, duration: .8, ease: "elastic.out(1.1, 0.35)" })
        .fromTo(elKotak, { yPercent: 0 }, { yPercent: -9, duration: .18, ease: "power2.out", yoyo: true, repeat: 1 }, .08)
        .to(elBayang, { scaleX: .8, duration: .18, yoyo: true, repeat: 1 }, .08)
        .fromTo(elLoncat, { opacity: 1, xPercent: 0, yPercent: 0, rotation: 0, scale: .6 },
          { opacity: 0, xPercent: acak(-160, 160), yPercent: -420, rotation: acak(-40, 40), scale: 1.25, duration: 1, ease: "power2.out" }, .14);
      sapuSekali();
    };
    elTombolMaskot.addEventListener("click", ketuk);
    bersih.push(() => elTombolMaskot.removeEventListener("click", ketuk));

    const sapuan = { x: -110 };
    const tulisSapuan = () => elSapuan.style.setProperty("--vbp-sapu", `${sapuan.x}%`);
    const sapuSekali = () => gsap.fromTo(sapuan, { x: -110 }, { x: 260, duration: .9, ease: "power2.inOut", onUpdate: tulisSapuan });

    // Kilau holografik menyapu huruf saat disentuh.
    const kilauSentuh = () => gsap.fromTo($$(".vbp-tulisan .vbp-kilau"), { x: 0 }, { x: 320, duration: .9, stagger: .04, ease: "power2.inOut" });
    const sentuhTulisan = (e) => { if (e.target.closest(".vbp-huruf-b")) kilauSentuh(); };
    elTulisan.addEventListener("pointerdown", sentuhTulisan);
    bersih.push(() => elTulisan.removeEventListener("pointerdown", sentuhTulisan));

    /* --- Logo pojok: miring mengikuti kursor, kilau saat disentuh --- */
    const elLogo = $("#vbp-logo");
    const elPro = $(".vbp-pro", elLogo);
    const logoMiring = (e) => {
      const r = elLogo.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      gsap.to(elPro, { rotationY: nx * 30, rotationX: -ny * 30, transformPerspective: 300, duration: .4, overwrite: true });
    };
    const logoLepas = () => gsap.to(elPro, { rotationY: 0, rotationX: 0, duration: .6, ease: "elastic.out(1, 0.4)", overwrite: true });
    const logoSentuh = () => { elLogo.classList.remove("vbp-pro-kilau"); void elLogo.offsetWidth; elLogo.classList.add("vbp-pro-kilau"); };
    elLogo.addEventListener("pointermove", logoMiring);
    elLogo.addEventListener("pointerleave", logoLepas);
    elLogo.addEventListener("pointerdown", logoSentuh);
    bersih.push(() => {
      elLogo.removeEventListener("pointermove", logoMiring);
      elLogo.removeEventListener("pointerleave", logoLepas);
      elLogo.removeEventListener("pointerdown", logoSentuh);
    });

    /* --- Monyet skateboard (S1 sampai S7) --- */
    const WATAK = {
      merah: { apung: 2.6, jeda: [3.2, 5], lama: .6, putar: false },
      biru: { apung: 3.1, jeda: [4.5, 7], lama: .8, putar: true },
      cokelat: { apung: 4.4, jeda: [8, 12], lama: 1, putar: false },
      pirang: { apung: 2, jeda: [3.4, 5.5], lama: .48, putar: false },
    };
    const pewaktuOllie = [];
    monyet.forEach((m, i) => {
      const w = WATAK[m.dataset.watak];
      const badan = $(".vbp-monyet-badan", m);
      const garis = $(".vbp-kecepatan", m);
      gsap.fromTo(badan, { y: 3 }, { y: -6, duration: w.apung / 2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * .37 });
      const ollie = () => {
        if (terlihat && progres < .25) {
          const naik = w.lama * .45, turun = w.lama * .4;
          const tl = gsap.timeline({ defaults: { transformOrigin: "50% 85%" } })
            .to(badan, { scaleY: .93, scaleX: 1.04, duration: .1, ease: "power2.out" })
            .to(badan, { yPercent: -20, rotation: w.putar ? 0 : -9, scaleY: 1.03, scaleX: .98, duration: naik, ease: "power2.out" })
            .to(garis, { opacity: .7, duration: .08 }, "<")
            .to(badan, { yPercent: 0, rotation: w.putar ? 0 : 2, scaleY: 1, scaleX: 1, duration: turun, ease: "power2.in" })
            .to(garis, { opacity: 0, duration: .15 }, "<")
            .to(badan, { scaleY: .9, scaleX: 1.06, duration: .07, ease: "power2.out" })
            .to(badan, { scaleY: 1, scaleX: 1, rotation: 0, duration: .45, ease: "elastic.out(1, 0.4)" });
          if (w.putar) tl.fromTo(badan, { rotation: 0 }, { rotation: 360, duration: naik + turun, ease: "power1.inOut", immediateRender: false }, .1);
        }
        pewaktuOllie[i] = gsap.delayedCall(acak(...w.jeda), ollie);
      };
      pewaktuOllie[i] = gsap.delayedCall(acak(1.2, 3) + i * .6, ollie);
    });
    bersih.push(() => pewaktuOllie.forEach((p) => p && p.kill()));

    /* --- Intro (C7): maksimal sekitar 1 detik, berhenti saat digulir --- */
    let intro = null;
    if (performance.now() - waktuMulai < 1500 && scrollY < innerHeight * .2) {
      intro = gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(elSorot, { opacity: .2, scaleX: .35, duration: .55, ease: "power2.inOut" }, 0)
        .from($(".vbp-latar-gambar"), { scale: 1.05, duration: .9 }, 0)
        .from(besarDalam, { rotationX: -96, opacity: 0, duration: .42, stagger: .045 }, .08)
        .from(elTombolMaskot, { y: 34, opacity: 0, duration: .5 }, .12)
        .from(monyet.map((m) => $(".vbp-monyet-gambar", m)), { scale: .55, opacity: 0, duration: .45, stagger: .07 }, .28)
        .from(cincin, { redup: 0, duration: .55, ease: "power2.out" }, .25)
        .to(elPesawat, { opacity: 1, duration: .3 }, .4)
        .from($$(".vbp-tagline"), { opacity: 0, y: 12, duration: .45, stagger: .08 }, .45)
        .add(sapuSekali, .35);
      const lewati = () => {
        if (intro && intro.isActive()) intro.progress(1);
        akar.classList.add("vbp-gelap-lewati");
      };
      addEventListener("wheel", lewati, { passive: true, once: true });
      addEventListener("touchmove", lewati, { passive: true, once: true });
      addEventListener("keydown", lewati, { once: true });
      bersih.push(() => { removeEventListener("wheel", lewati); removeEventListener("touchmove", lewati); removeEventListener("keydown", lewati); });
    } else {
      gsap.set(elPesawat, { opacity: 1 });
      akar.classList.add("vbp-gelap-lewati");
    }

    /* --- Ukuran untuk FLIP (L9) dan amplop utama --- */
    let flip = [];
    let au = { dx: 0, dy: 0 }, kartu = { dx: 0, dy: 0, s: .5, naik: 0 };
    const ukurGeometri = () => {
      flip = hurufBesar.map((h, i) => {
        const b = posisiDi(h.wadah, hero);
        const l = hurufLogo[i].wadah.getBoundingClientRect();
        const s = l.height / (b.h || 1);
        return { dx: l.left + l.width / 2 - (b.x + b.w / 2), dy: l.top + l.height / 2 - (b.y + b.h / 2), s };
      });
      const kotakAU = posisiDi(elAU, hero);
      const kotakKartu = posisiDi(elKartu, hero);
      const kotakCincin = posisiDi($("#vbp-cincin"), hero);
      const titikDepan = { x: kotakCincin.x, y: kotakCincin.y + ukurC.ry };
      au = { dx: titikDepan.x - (kotakAU.x + kotakAU.w / 2), dy: titikDepan.y - (kotakAU.y + kotakAU.h / 2) };
      const s = (kotakAU.w * .84) / (kotakKartu.w || 1);
      const pusatX = kotakAU.x + kotakAU.w / 2;
      const pusatY = kotakAU.y + kotakAU.h * .08 + (kotakKartu.h * s) / 2;
      kartu = {
        s,
        dx: pusatX - (kotakKartu.x + kotakKartu.w / 2),
        dy: pusatY - (kotakKartu.y + kotakKartu.h / 2),
        naik: kotakKartu.h * s * .78 + kotakAU.h * .12,
      };
    };
    ukurGeometri();
    ScrollTrigger.addEventListener("refreshInit", ukurGeometri);
    bersih.push(() => ScrollTrigger.removeEventListener("refreshInit", ukurGeometri));

    /* --- Linimasa gulir: hero ditahan, kamera maju, tokoh beraksi --- */
    gsap.set(elAU, { visibility: "hidden" });
    gsap.set(elKartu, { visibility: "hidden" });
    const W = () => adegan.clientWidth, H = () => adegan.clientHeight;
    const tenang = gsap.delayedCall(.15, () => { huyung(0); kecepatanGulir = 0; }).pause();
    let diratakan = false;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: () => `+=${(hp ? 1.4 : 2.2) * innerHeight}`,
        pin: true,
        scrub: .7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progres = self.progress;
          kecepatanGulir = self.getVelocity();
          if (Math.abs(kecepatanGulir) > 2600) wajah.kaget();
          huyung(batas(kecepatanGulir / 450, -6, 6));
          tenang.restart(true);
          if (!kursor) miringY((self.progress - .3) * 14);
          if (progres > .7 && !diratakan) {
            diratakan = true;
            tulisanY(0);
            tulisanX(0);
            gsap.to(tebal, { ex: .55, ey: .85, duration: .4, overwrite: true, onUpdate: tulisTebal });
          } else if (progres <= .7) diratakan = false;
        },
      },
    });

    // 0 sampai 25 persen: kamera maju.
    tl.to(elLatar, { scale: 1.08, duration: .25, ease: "power2.inOut" }, 0)
      .to(elTulisan, { scale: 1.04, yPercent: -3, duration: .25, ease: "power2.inOut" }, 0)
      .to(elMaskot, { scale: 1.15, yPercent: 4, duration: .25, ease: "power2.inOut" }, 0)
      .fromTo(elSorot, { opacity: .82, scaleX: 1 }, { opacity: 1, scaleX: 1.18, duration: .25, ease: "power2.inOut" }, 0)
      .fromTo(sapuan, { x: -110 }, { x: 260, duration: .6, onUpdate: tulisSapuan }, .05)
      .fromTo(kilau, { x: -40 }, { x: 300, duration: .5, stagger: .012 }, 0);

    // 25 sampai 50 persen: monyet melesat keluar, monyet merah berhenti di tepi bawah.
    monyet.forEach((m, i) => {
      const watak = m.dataset.watak;
      const badan = $(".vbp-monyet-badan", m);
      const bayang = $$(".vbp-bayang-gerak", m);
      const garis = $(".vbp-kecepatan", m);
      const gambar = $(".vbp-monyet-gambar", m);
      const mulai = .25 + ({ pirang: 0, merah: .02, biru: .04, cokelat: .07 }[watak] || 0);
      const lama = { pirang: .14, merah: .17, biru: .18, cokelat: .2 }[watak] || .18;
      let tujuan;
      if (watak === "merah") {
        tujuan = {
          x: () => W() * (hp ? .02 : .04) - m.offsetLeft,
          y: () => H() - m.offsetHeight * .5 - m.offsetTop,
          rotation: -6,
          scale: hp ? .9 : .85,
        };
      } else {
        const arah = { biru: [-1.35, -.12], cokelat: [1.25, -.9], pirang: [1.4, .3] }[watak];
        tujuan = { x: () => W() * arah[0], y: () => H() * arah[1], rotation: arah[0] * 12, scale: watak === "cokelat" ? 1.5 : 1.1 };
      }
      tl.set(m, { zIndex: 30 }, mulai)
        .set(gambar, { filter: "none" }, mulai)
        .to(m, { ...tujuan, duration: lama, ease: watak === "merah" ? "power2.inOut" : "power2.in" }, mulai)
        .fromTo(garis, { opacity: 0 }, { opacity: .85, duration: lama * .3 }, mulai)
        .to(garis, { opacity: 0, duration: lama * .3 }, mulai + lama * .7);
      bayang.forEach((g, j) => {
        const k = (j + 1) * .07;
        const ke = watak === "merah" ? [1, -1] : { biru: [1.3, .1], cokelat: [-1.2, .9], pirang: [-1.4, -.3] }[watak];
        tl.fromTo(g, { opacity: 0, x: 0, y: 0 }, { opacity: .32 / (j + 1), x: () => ke[0] * k * m.offsetWidth * 2.2, y: () => ke[1] * k * m.offsetHeight, duration: lama * .5, ease: "power1.out" }, mulai)
          .to(g, { opacity: 0, x: 0, y: 0, duration: lama * .5, ease: "power1.in" }, mulai + lama * .5);
      });
      if (watak === "biru") tl.fromTo(badan, { rotation: 0 }, { rotation: -360, duration: lama, ease: "power1.inOut", immediateRender: false }, mulai);
    });

    // 50 sampai 75 persen: cincin berputar, satu amplop maju, tutupnya terbuka, kartu curl naik.
    tl.to($$(".vbp-tagline"), { opacity: 0, y: -10, duration: .06 }, .46)
      .to(cincin, { gulir: Math.PI * 1.25, duration: .25, ease: "power2.inOut" }, .5)
      .set(elAU, { visibility: "visible" }, .5)
      .set(elKartu, { visibility: "visible" }, .5)
      .fromTo(bagianAU, { x: () => au.dx, y: () => au.dy, scale: .3, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: .1, ease: "power3.out", immediateRender: false }, .5)
      .fromTo(elKartu, { x: () => kartu.dx + au.dx, y: () => kartu.dy + au.dy, scale: () => kartu.s * .3 },
        { x: () => kartu.dx, y: () => kartu.dy, scale: () => kartu.s, duration: .1, ease: "power3.out", immediateRender: false }, .5)
      .fromTo(elLipat, { rotationX: 0 }, { rotationX: -178, transformPerspective: 600, duration: .07, ease: "power2.inOut", immediateRender: false }, .6)
      .set(elTutup, { zIndex: 29 }, .635)
      .set(elBalik, { opacity: .85 }, .635)
      .to(elKartu, { y: () => kartu.dy - kartu.naik, duration: .09, ease: "power2.out" }, .66);

    // 75 sampai 100 persen: wordmark terbang jadi logo, maskot mundur ke kanan, kartu menetap.
    tl.to(elTulisan, { scale: 1, yPercent: 0, duration: .2, ease: "power2.inOut" }, .75)
      .to(besarWadah, { x: (i) => flip[i].dx, y: (i) => flip[i].dy, scale: (i) => flip[i].s, duration: .22, stagger: .004, ease: "power2.inOut" }, .76)
      .set(hurufLogo.map((h) => h.wadah), { opacity: 1 }, .992)
      .set(besarWadah, { opacity: 0 }, .992)
      .to(elMaskot, { x: () => W() * (hp ? .2 : .25), scale: hp ? .78 : .84, yPercent: 0, duration: .22, ease: "power2.inOut" }, .76)
      .to(elKartu, { x: 0, y: 0, scale: 1, duration: .18, ease: "power2.inOut" }, .77)
      .to(bagianAU, { y: () => H() * .25, opacity: 0, duration: .12, ease: "power2.in" }, .79)

      .to(cincin, { redup: .5, duration: .2 }, .78)
      .to(elSorot, { opacity: .7, duration: .2 }, .8);

    bersih.push(() => { if (intro) intro.kill(); });

    return () => bersih.forEach((f) => f());
  }

  function mulai() {
    bangun();
    muatGsap()
      .then(() => {
        if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) throw new Error("GSAP tidak termuat");
        hidup();
      })
      .catch(() => statis());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
  else mulai();
})();
