/* VenbeeMail Pro gaya Kong: fungsi halaman tanpa GSAP.
   Bahasa, huruf gunting, menu, salin, tab, pemeriksa awalan, perangko domain,
   cek API, dan kurangi gerakan. Ditulis tanpa sintaks baru supaya jalan di
   Safari lama. gerak.js (GSAP) dimuat terpisah dan hanya kalau gerak diizinkan. */
(function () {
  "use strict";
  var html = document.documentElement;
  var akar = html.getAttribute("data-akar") || "";
  html.classList.remove("vbk-tanpa-js");
  html.classList.add("vbk-js");

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function simpan(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ambil(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function simpanSesi(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function ambilSesi(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  var umum = $("#vbk-umum");
  function umumkan(id, en) {
    if (!umum) return;
    umum.textContent = "";
    setTimeout(function () { umum.textContent = bahasa === "en" ? en : id; }, 30);
  }

  /* ================= bahasa ================= */
  var JUDUL = { id: "VenbeeMail Pro · Kotak masuk uji lewat API", en: "VenbeeMail Pro · A test inbox over an API" };
  var bahasa = "id";
  function pasangBahasa(b, umumkanGanti) {
    bahasa = b === "en" ? "en" : "id";
    html.setAttribute("lang", bahasa);
    html.setAttribute("data-bahasa", bahasa);
    document.title = JUDUL[bahasa];
    $$("[data-label-id]").forEach(function (el) {
      var t = el.getAttribute("data-label-" + bahasa);
      if (t) el.setAttribute("aria-label", t);
    });
    $$("[data-alt-id]").forEach(function (el) {
      var t = el.getAttribute("data-alt-" + bahasa);
      if (t) el.setAttribute("alt", t);
    });
    simpan("vbk-bahasa", bahasa);
    simpan("bm-lang", bahasa); // kunci halaman /pro lama, supaya pilihan tetap sama
    if (umumkanGanti) umumkan("Bahasa: Indonesia", "Language: English");
    document.dispatchEvent(new CustomEvent("vbk:bahasa", { detail: bahasa }));
  }
  var paksa = /[?&]lang=(en|id)\b/.exec(location.search);
  pasangBahasa(paksa ? paksa[1] : (ambil("vbk-bahasa") || ambil("bm-lang") || "id"), false);
  $$("[data-ganti-bahasa]").forEach(function (b) {
    b.addEventListener("click", function () { pasangBahasa(bahasa === "id" ? "en" : "id", true); });
  });

  /* ================= kurangi gerakan ================= */
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var pilihanDiam = ambil("vbk-kurangi-gerak") === "1";
  var hemat = !!(navigator.connection && navigator.connection.saveData);
  var diam = mq.matches || pilihanDiam || hemat;
  html.classList.toggle("vbk-diam", diam);
  $$("[data-kurangi-gerak]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(pilihanDiam || mq.matches));
    b.addEventListener("click", function () {
      var nyala = b.getAttribute("aria-pressed") !== "true";
      simpan("vbk-kurangi-gerak", nyala ? "1" : "0");
      // muat ulang di bagian terdekat
      var dekat = null;
      $$("main section[id], footer section[id]").forEach(function (s) {
        if (s.getBoundingClientRect().top <= 120) dekat = s.id;
      });
      try { history.replaceState(null, "", location.pathname + location.search + (dekat ? "#" + dekat : "")); } catch (e) {}
      location.reload();
    });
  });

  /* ================= huruf gunting ================= */
  var GUNTING = null; // { k: { w, miring, naik } }
  var NAMA = { ".": "titik", ",": "koma", "!": "seru", "?": "tanya", "-": "strip", "/": "garis", ":": "titik2", "@": "at", "·": "tengah", "#": "pagar", "&": "dan", "'": "petik" };
  var SPASI = 34, JARAK = 6;
  var SVGNS = "http://www.w3.org/2000/svg";
  var ISIAN = { kertas: "url(#vbk-p-kertas)", flanel: "url(#vbk-p-flanel)", kardus: "url(#vbk-p-kardus)", bunga: "url(#vbk-p-bunga)" };

  function kunciHuruf(teks) {
    var hasil = [], ke = 0;
    teks.toUpperCase().split("").forEach(function (c) {
      if (c === " ") { hasil.push(" "); return; }
      var k = c === "E" ? ["E", "E2", "E3"][ke++ % 3] : (NAMA[c] || c);
      if (GUNTING[k]) hasil.push(k);
    });
    return hasil;
  }
  function acak(n) { var x = Math.sin(n * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); }

  // Satu SVG per kata, supaya kata membungkus sendiri di layar sempit.
  function svgKata(kunci, opsi, benih) {
    var lebar = 0, i;
    for (i = 0; i < kunci.length; i++) lebar += GUNTING[kunci[i]].w + (i ? JARAK : 0);
    var pad = 14;
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "vbk-gunting-kata");
    svg.setAttribute("viewBox", (-pad) + " " + (-pad) + " " + (lebar + pad * 2) + " " + (100 + pad * 2));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.aspectRatio = (lebar + pad * 2) + " / " + (100 + pad * 2);
    var x = 0;
    kunci.forEach(function (k, j) {
      var h = GUNTING[k];
      var miring = h.miring + (opsi.goyang ? (acak(benih + j) - .5) * 4 : 0);
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "vbk-huruf");
      g.setAttribute("transform", "translate(" + x + " " + h.naik + ") rotate(" + miring.toFixed(2) + " " + (h.w / 2) + " 50)");
      var bay = document.createElementNS(SVGNS, "use");
      bay.setAttribute("href", "#g-" + k);
      bay.setAttribute("transform", "translate(" + (opsi.geser || 6) + " " + (opsi.geser || 6) + ")");
      bay.setAttribute("fill", opsi.bayangan || "#e7663c");
      bay.setAttribute("width", h.w); bay.setAttribute("height", 100);
      var muka = document.createElementNS(SVGNS, "use");
      muka.setAttribute("href", "#g-" + k);
      muka.setAttribute("fill", ISIAN[opsi.tekstur] || ISIAN.kertas);
      muka.setAttribute("width", h.w); muka.setAttribute("height", 100);
      g.appendChild(bay); g.appendChild(muka);
      svg.appendChild(g);
      x += h.w + JARAK;
    });
    return svg;
  }
  // Satu baris utuh dalam satu SVG (wordmark, slogan): spasi ikut dihitung.
  function svgBaris(teks, opsi, benih) {
    var kunci = kunciHuruf(teks), lebar = 0;
    kunci.forEach(function (k, i) { lebar += (k === " " ? SPASI : GUNTING[k].w) + (i ? JARAK : 0); });
    var hasil = svgKata(kunci.filter(function (k) { return k !== " "; }), opsi, benih);
    // susun ulang posisi x dengan spasi
    var x = 0, gs = hasil.querySelectorAll("g"), gi = 0;
    kunci.forEach(function (k) {
      if (k === " ") { x += SPASI + JARAK; return; }
      var h = GUNTING[k], g = gs[gi++];
      var t = g.getAttribute("transform").replace(/translate\([^)]*\)/, "translate(" + x + " " + h.naik + ")");
      g.setAttribute("transform", t);
      x += h.w + JARAK;
    });
    var pad = 14;
    hasil.setAttribute("viewBox", (-pad) + " " + (-pad) + " " + (lebar + pad * 2) + " " + (100 + pad * 2));
    hasil.style.aspectRatio = (lebar + pad * 2) + " / " + (100 + pad * 2);
    hasil.style.setProperty("--rasio", ((lebar + pad * 2) / (100 + pad * 2)).toFixed(4));
    return hasil;
  }
  function rakitGunting(teks, opsi) {
    var wadah = document.createElement("span");
    wadah.className = "vbk-gunting";
    wadah.setAttribute("aria-hidden", "true");
    teks.split(/\s+/).filter(Boolean).forEach(function (kata, i) {
      wadah.appendChild(svgKata(kunciHuruf(kata), opsi, i * 17 + kata.length));
    });
    return wadah;
  }
  function perBahasa(el, buat) {
    // el berisi <span lang="id"> dan <span lang="en">; buat(teks) -> elemen
    var hasil = document.createElement("span");
    hasil.className = "vbk-gunting-dua";
    hasil.setAttribute("aria-hidden", "true");
    ["id", "en"].forEach(function (b) {
      var sumber = el.querySelector('[lang="' + b + '"]');
      var teks = sumber ? sumber.textContent : el.textContent;
      var s = document.createElement("span");
      s.setAttribute("lang", b);
      s.appendChild(buat(teks.trim()));
      hasil.appendChild(s);
    });
    return hasil;
  }

  function pasangGunting() {
    $$("[data-gunting]").forEach(function (h) {
      var teks = document.createElement("span");
      teks.className = "vbk-judul-teks";
      while (h.firstChild) teks.appendChild(h.firstChild);
      h.appendChild(teks);
      var t = h.getAttribute("data-tekstur") || "kertas";
      h.appendChild(h.querySelector('[lang]') ? perBahasa(teks, function (s) { return rakitGunting(s, { tekstur: t, goyang: true }); })
        : rakitGunting(teks.textContent.trim(), { tekstur: t, goyang: true }));
    });
    $$("[data-gunting-kata]").forEach(function (el) {
      var t = el.getAttribute("data-tekstur") || "kertas";
      el.appendChild(perBahasa(el, function (s) { return rakitGunting(s, { tekstur: t, goyang: true }); }));
    });
    $$("[data-gunting-angka]").forEach(function (el) {
      var n = el.getAttribute("data-gunting-angka");
      el.textContent = "";
      el.appendChild(rakitGunting(n, { tekstur: "kardus", bayangan: "#00141a", geser: 5 }));
    });
    $$("[data-gunting-logo]").forEach(function (el) {
      el.textContent = "";
      el.appendChild(svgKata(kunciHuruf("VENBEEMAIL"), { tekstur: "kertas", geser: 7 }, 3));
    });
    var wm = $("[data-gunting-wordmark]");
    if (wm) {
      var d = document.createElement("div");
      d.className = "vbk-wordmark-desktop";
      d.appendChild(svgBaris("VENBEEMAIL", { tekstur: "bunga", geser: 6 }, 1));
      var hp = document.createElement("div");
      hp.className = "vbk-wordmark-hp";
      hp.appendChild(svgBaris("VENBEE", { tekstur: "bunga", geser: 6 }, 1));
      hp.appendChild(svgBaris("MAIL", { tekstur: "bunga", geser: 6 }, 7));
      var pro = svgBaris("PRO", { tekstur: "kertas", bayangan: "#00141a", geser: 6 }, 5);
      pro.setAttribute("class", "vbk-gunting-kata vbk-wordmark-pro");
      wm.appendChild(d); wm.appendChild(hp); wm.appendChild(pro);
      wm.style.position = wm.style.position || "";
    }
    var sl = $("[data-gunting-slogan]");
    if (sl) {
      var BARIS = {
        id: { d: ["KOTAK MASUK", "UNTUK KODEMU"], h: ["KOTAK", "MASUK UNTUK", "KODEMU"] },
        en: { d: ["AN INBOX", "FOR YOUR CODE"], h: ["AN INBOX", "FOR YOUR", "CODE"] }
      };
      ["id", "en"].forEach(function (b) {
        ["d", "h"].forEach(function (u) {
          BARIS[b][u].forEach(function (baris, i) {
            var s = svgBaris(baris, { tekstur: "kertas", geser: 6, goyang: true }, i * 31 + (u === "h" ? 7 : 0));
            s.setAttribute("class", "vbk-gunting-kata vbk-ka-baris " + (u === "d" ? "vbk-ka-baris-desktop" : "vbk-ka-baris-hp"));
            s.setAttribute("lang", b);
            sl.appendChild(s);
          });
        });
      });
    }
    html.classList.add("vbk-gunting-siap");
    document.dispatchEvent(new CustomEvent("vbk:gunting"));
  }

  function muatGunting() {
    if (!window.fetch) return;
    fetch(akar + "aset/vbkong/gunting.svg").then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (teks) {
      var wadah = document.createElement("div");
      wadah.innerHTML = teks;
      var svg = wadah.querySelector("svg");
      if (!svg) return;
      document.body.insertBefore(svg, document.body.firstChild);
      GUNTING = {};
      $$("symbol", svg).forEach(function (s) {
        GUNTING[s.id.slice(2)] = { w: +s.getAttribute("data-w"), miring: +s.getAttribute("data-miring"), naik: +s.getAttribute("data-naik") };
      });
      var defs = svg.querySelector("defs");
      if (defs) { SPASI = +defs.getAttribute("data-spasi") || SPASI; JARAK = +defs.getAttribute("data-jarak") || JARAK; }
      pasangGunting();
    }).catch(function () { /* tanpa huruf gunting: judul teks biasa tetap tampil */ });
  }
  muatGunting();
  window.VBK = { rakitGunting: function (t, o) { return GUNTING ? rakitGunting(t, o || {}) : null; }, diam: diam, akar: akar };

  /* ================= menu ================= */
  var lembar = $("#vbk-lembar"), latar = $("#vbk-lembar-latar"), tombolBuka = $(".vbk-menu-buka");
  function tutupLembar(kembaliFokus) {
    if (!lembar || lembar.hidden) return;
    lembar.hidden = true; latar.hidden = true;
    tombolBuka.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", kunciFokus);
    if (kembaliFokus) tombolBuka.focus();
  }
  function kunciFokus(e) {
    if (e.key === "Escape") { tutupLembar(true); return; }
    if (e.key !== "Tab") return;
    var bisa = $$("a, button", lembar).filter(function (el) { return el.offsetParent !== null; });
    var awal = bisa[0], akhir = bisa[bisa.length - 1];
    if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus(); }
    else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus(); }
  }
  if (lembar && tombolBuka) {
    tombolBuka.addEventListener("click", function () {
      lembar.hidden = false; latar.hidden = false;
      tombolBuka.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", kunciFokus);
      var pertama = $("a", lembar); if (pertama) pertama.focus();
    });
    latar.addEventListener("click", function () { tutupLembar(true); });
    $(".vbk-lembar-tutup", lembar).addEventListener("click", function () { tutupLembar(true); });
    $$("a", lembar).forEach(function (a) { a.addEventListener("click", function () { tutupLembar(false); }); });
  }

  // tautan bagian yang sedang dilihat, dan cincin kemajuan gulir
  var tautanMenu = $$(".vbk-pil-tautan a");
  var bagianMenu = tautanMenu.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var semuaBagian = $$("main > section[id], footer section[id]");
  var menu = $("#vbk-menu"), antre = false, aktifLama = null;
  function kemajuan() {
    antre = false;
    var maks = document.documentElement.scrollHeight - innerHeight;
    if (menu) menu.style.setProperty("--vbk-kemajuan", maks > 0 ? Math.min(1, scrollY / maks).toFixed(4) : "0");
    // bagian yang memotong garis tengah layar; tautan menyala hanya kalau bagian itu ada di menu
    var tengah = innerHeight / 2, kini = null;
    semuaBagian.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= tengah && r.bottom > tengah) kini = s; });
    var i = bagianMenu.indexOf(kini);
    var a = i >= 0 ? tautanMenu[i] : null;
    if (a !== aktifLama) {
      tautanMenu.forEach(function (x) { x.removeAttribute("aria-current"); });
      if (a) a.setAttribute("aria-current", "true");
      aktifLama = a;
    }
  }
  addEventListener("scroll", function () { if (!antre) { antre = true; requestAnimationFrame(kemajuan); } }, { passive: true });
  addEventListener("resize", kemajuan);
  kemajuan();

  /* ================= salin + cap tersalin (KT4) ================= */
  var sentuh = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  function capTersalin(dekat) {
    var r = dekat.getBoundingClientRect();
    var cap = document.createElement("span");
    cap.className = "vbk-cap-salin";
    cap.setAttribute("aria-hidden", "true");
    cap.textContent = bahasa === "en" ? "COPIED" : "TERSALIN";
    cap.style.position = "fixed";
    cap.style.left = Math.max(8, Math.min(innerWidth - 140, r.left + r.width / 2 - 50)) + "px";
    cap.style.top = Math.max(8, r.top - 34) + "px";
    document.body.appendChild(cap);
    if (cap.animate && !diam) cap.animate([{ transform: "rotate(-9deg) scale(1.3)", opacity: 0 }, { transform: "rotate(-9deg) scale(1)", opacity: 1 }], { duration: 200, easing: "ease-out" });
    setTimeout(function () { cap.remove(); }, 1600);
  }
  function tandaiTombol(t) {
    t.classList.add("vbk-tersalin");
    clearTimeout(t._vbk);
    t._vbk = setTimeout(function () { t.classList.remove("vbk-tersalin"); }, 1600);
  }
  function pilihTeks(el) {
    if (!el) return;
    var r = document.createRange(); r.selectNodeContents(el);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function salin(teks, tombol, sumber) {
    function berhasil() {
      tandaiTombol(tombol); capTersalin(tombol);
      umumkan("Tersalin ke papan klip", "Copied to clipboard");
    }
    function gagal() {
      pilihTeks(sumber);
      if (sentuh) umumkan("Tekan lama untuk menyalin", "Long-press to copy");
      else umumkan("Tekan Ctrl+C", "Press Ctrl+C");
      var pesan = document.createElement("span");
      pesan.className = "vbk-cap-salin";
      pesan.textContent = sentuh ? (bahasa === "en" ? "Long-press to copy" : "Tekan lama untuk menyalin") : (bahasa === "en" ? "Press Ctrl+C" : "Tekan Ctrl+C");
      var r = tombol.getBoundingClientRect();
      pesan.style.position = "fixed"; pesan.style.left = Math.max(8, r.left - 40) + "px"; pesan.style.top = Math.max(8, r.top - 36) + "px";
      pesan.style.textTransform = "none"; pesan.style.letterSpacing = "0";
      document.body.appendChild(pesan);
      setTimeout(function () { pesan.remove(); }, 2400);
    }
    try {
      if (navigator.clipboard && window.isSecureContext !== false) navigator.clipboard.writeText(teks).then(berhasil, gagal);
      else gagal();
    } catch (e) { gagal(); }
  }
  $$("[data-salin]").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = $(b.getAttribute("data-salin"));
      if (src) salin(src.textContent, b, src);
    });
  });
  $$("[data-salin-teks]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.parentNode && b.parentNode.querySelector("a[href^='mailto:']");
      salin(b.getAttribute("data-salin-teks"), b, a);
    });
  });

  /* ================= tab contoh curl ================= */
  var tabs = $$('[role="tab"]');
  function pilihTab(t, fokus) {
    tabs.forEach(function (x) {
      var aktif = x === t;
      x.setAttribute("aria-selected", String(aktif));
      x.tabIndex = aktif ? 0 : -1;
      var p = document.getElementById(x.getAttribute("aria-controls"));
      if (p) p.hidden = !aktif;
    });
    if (fokus) t.focus();
  }
  if (tabs.length) {
    pilihTab(tabs[0], false);
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pilihTab(t, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") n = tabs[0];
        else if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); pilihTab(n, true); }
      });
    });
  }

  /* ================= pemeriksa awalan (AW1, AW3, AW4) ================= */
  // Aturan dari halaman /pro lama: 3 sampai 20 karakter dari huruf, angka,
  // titik, garis bawah, dan tanda hubung; karakter pertama dan terakhir huruf
  // atau angka; dua tanda tidak boleh berdampingan. Hanya pratinjau di browser.
  var PESAN = {
    kosong: ["Ketik 3 sampai 20 karakter.", "Type 3 to 20 characters."],
    pendek: ["Terlalu pendek: minimal 3 karakter.", "Too short: at least 3 characters."],
    panjang: ["Terlalu panjang: maksimal 20 karakter.", "Too long: at most 20 characters."],
    huruf: ["Hanya huruf, angka, titik, garis bawah, dan tanda hubung.", "Only letters, digits, dots, underscores, and hyphens."],
    ujung: ["Karakter pertama dan terakhir harus huruf atau angka.", "It must start and end with a letter or digit."],
    dempet: ["Dua tanda tidak boleh berdampingan.", "Two symbols cannot sit side by side."],
    pas: ["Panjangnya pas.", "That length works."]
  };
  function periksa(v) {
    if (!v.length) return "kosong";
    if (!/^[A-Za-z0-9._-]+$/.test(v)) return "huruf";
    if (v.length < 3) return "pendek";
    if (v.length > 20) return "panjang";
    if (!/^[A-Za-z0-9]/.test(v) || !/[A-Za-z0-9]$/.test(v)) return "ujung";
    if (/[._-]{2}/.test(v)) return "dempet";
    return "pas";
  }
  var isian = $("#vbk-awalan-isi"), kotak = $("[data-kotak20]"), status = $("[data-awalan-status]"), wadahAw = $("#vbk-awalan");
  var pilihDomain = $("[data-domain-pilih]");
  var keadaan = { awalan: "", domain: pilihDomain ? pilihDomain.value : "kotak.venbeemail.com" };
  if (kotak) {
    for (var i = 0; i < 20; i++) {
      var s = document.createElement("span");
      if (i < 3) s.className = "vbk-min";
      kotak.appendChild(s);
    }
    var tm = document.createElement("span"); tm.className = "vbk-tanda-min"; tm.textContent = "min";
    kotak.firstChild.appendChild(tm);
  }
  function tulisStatus(kode) {
    status.innerHTML = '<span lang="id"></span><span lang="en"></span>';
    status.firstChild.textContent = PESAN[kode][0];
    status.lastChild.textContent = PESAN[kode][1];
    status.classList.toggle("vbk-pas", kode === "pas");
    wadahAw.classList.toggle("vbk-awalan-salah", kode !== "pas" && kode !== "kosong");
  }
  function perbarui() {
    var awalan = keadaan.awalan || "qa-signup";
    $$("[data-isi-awalan]").forEach(function (el) { el.textContent = awalan; });
    $$("[data-isi-domain]").forEach(function (el) { el.textContent = keadaan.domain; });
    var resi = { address: awalan + ".62yt8v@" + keadaan.domain, local: awalan + ".62yt8v", domain: keadaan.domain };
    if (keadaan.awalan) { resi.address = awalan + ".<acak>@" + keadaan.domain; resi.local = awalan + ".<acak>"; }
    $$("[data-resi]").forEach(function (el) { el.textContent = resi[el.getAttribute("data-resi")]; });
    var label = $("[data-label-amplop]");
    if (label) {
      label.hidden = !keadaan.awalan;
      $$("[data-isi-alamat]", label).forEach(function (el) { el.textContent = keadaan.awalan + ".<acak>@" + keadaan.domain; });
    }
    $$(".vbk-perangko").forEach(function (p) { p.setAttribute("aria-pressed", String(p.getAttribute("data-domain") === keadaan.domain)); });
    if (pilihDomain && pilihDomain.value !== keadaan.domain) pilihDomain.value = keadaan.domain;
  }
  if (isian) {
    isian.addEventListener("input", function () {
      var v = isian.value.trim(), kode = periksa(v);
      var sel = kotak.children;
      for (var j = 0; j < 20; j++) {
        var c = sel[j];
        var baru = v.charAt(j);
        if (c.firstChild && c.firstChild.nodeType === 3) c.removeChild(c.firstChild);
        if (baru) c.insertBefore(document.createTextNode(baru), c.firstChild);
        c.classList.toggle("vbk-terisi", !!baru);
      }
      var lebih = kotak.querySelector(".vbk-lebih");
      if (v.length > 20) {
        if (!lebih) { lebih = document.createElement("span"); lebih.className = "vbk-lebih"; kotak.appendChild(lebih); }
        lebih.textContent = "+" + (v.length - 20);
      } else if (lebih) lebih.remove();
      tulisStatus(kode);
      keadaan.awalan = kode === "pas" ? v : "";
      if (keadaan.awalan) simpanSesi("vbk-awalan", keadaan.awalan);
      perbarui();
      if (kode !== "pas" && kode !== "kosong" && kotak.animate && !diam) {
        kotak.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }], { duration: 260 });
      }
    });
    var lama = ambilSesi("vbk-awalan");
    if (lama && periksa(lama) === "pas") { isian.value = lama; isian.dispatchEvent(new Event("input")); }
  }
  if (pilihDomain) pilihDomain.addEventListener("change", function () { keadaan.domain = pilihDomain.value; simpanSesi("vbk-domain", keadaan.domain); perbarui(); });
  var domainLama = ambilSesi("vbk-domain");
  if (domainLama && /^(kotak\.|surat\.|pos\.)?venbeemail\.com$/.test(domainLama)) keadaan.domain = domainLama;

  /* ================= perangko domain (DM1) ================= */
  $$(".vbk-perangko").forEach(function (p) {
    p.addEventListener("click", function () {
      keadaan.domain = p.getAttribute("data-domain");
      simpanSesi("vbk-domain", keadaan.domain);
      perbarui();
      salin(keadaan.domain, p, p.querySelector("code"));
    });
  });
  perbarui();
  window.VBK.keadaan = keadaan;

  /* ================= cek API (LM2) ================= */
  (function () {
    if (!window.fetch) return;
    var batal = window.AbortController ? new AbortController() : null;
    var waktu = setTimeout(function () { if (batal) batal.abort(); }, 1500);
    fetch("/api/health", { cache: "no-store", signal: batal ? batal.signal : undefined }).then(function (r) {
      clearTimeout(waktu);
      window.VBK.apiMenjawab = r.ok;
      if (r.ok) $$("[data-status-api]").forEach(function (el) { el.hidden = false; });
      document.dispatchEvent(new CustomEvent("vbk:api", { detail: r.ok }));
    }).catch(function () {
      clearTimeout(waktu);
      window.VBK.apiMenjawab = false;
      document.dispatchEvent(new CustomEvent("vbk:api", { detail: false }));
    });
  })();

  /* ================= ketuk kotak surat (tanpa gerak) ================= */
  var ketuk = $(".vbk-ka-ketuk"), balas = $("[data-ka-balas]");
  if (ketuk && balas) ketuk.addEventListener("click", function () {
    if (!html.classList.contains("vbk-gerak")) {
      balas.hidden = false;
      clearTimeout(balas._vbk);
      balas._vbk = setTimeout(function () { balas.hidden = true; }, 2600);
    }
  });

  /* ================= tahun berjalan ================= */
  $$("[data-tahun-berjalan]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
