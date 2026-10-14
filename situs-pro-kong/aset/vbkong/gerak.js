/* VenbeeMail Pro gaya Kong: semua gerak GSAP (PRD 8.3, 8.7, 9, 9.7).
   Dimuat halaman.js hanya kalau gerak diizinkan, sesudah GSAP, ScrollTrigger,
   MotionPathPlugin, dan (desktop dengan mouse) Lenis. Tampilan diam di CSS
   tetap jadi dasar: berkas ini hanya menambah gerak di atasnya. */
(function () {
  "use strict";
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var html = document.documentElement;
  var VBK = window.VBK || {};
  if (!gsap || !ST) { html.classList.remove("vbk-gerak", "vbk-tunggu"); return; }
  gsap.registerPlugin(ST);
  if (window.MotionPathPlugin) gsap.registerPlugin(window.MotionPathPlugin);
  ST.config({ ignoreMobileResize: true });
  var akar = VBK.akar || "";

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function buat(tag, kelas, induk) {
    var e = document.createElement(tag);
    if (kelas) e.className = kelas;
    if (induk) induk.appendChild(e);
    return e;
  }
  function dua(id, en) { return '<span lang="id">' + id + '</span><span lang="en">' + en + "</span>"; }
  function apit(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function layarHp() { return innerWidth <= 720; }
  function acak(n) { var x = Math.sin(n * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); }

  /* ================= Lenis (desktop dengan mouse) ================= */
  var lenis = null;
  if (window.Lenis && window.matchMedia("(pointer: fine)").matches && !layarHp()) {
    lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    html.classList.add("vbk-lenis");
  }
  function gulirKe(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView();
    if (el.focus) el.focus({ preventScroll: true });
  }

  /* ================= hero (HR1) ================= */
  function hero() {
    var sec = $(".vbk-hero");
    if (!sec) return;
    var wm = $(".vbk-wordmark", sec), latar = $(".vbk-hero-latar", sec), isi = $(".vbk-hero-isi", sec);
    var lain = $$(".vbk-pembuat, .vbk-hero-gulir", sec);
    var tirai = buat("div", "vbk-hero-tirai", sec);
    tirai.setAttribute("aria-hidden", "true");
    var bagianIsi = isi ? Array.prototype.slice.call(isi.children) : [];
    gsap.set(bagianIsi.concat(lain), { autoAlpha: 0, y: 18 });
    if (wm) gsap.set(wm, { xPercent: -50, x: 0 });
    html.classList.remove("vbk-tunggu");

    var hurufSiap = false;
    function hurufTerlihat() {
      return $$(".vbk-wordmark-desktop .vbk-huruf-isi, .vbk-wordmark-hp .vbk-huruf-isi", sec).filter(function (h) {
        return h.getClientRects().length && h.closest("div").offsetParent !== null;
      });
    }
    function siapkanHuruf() {
      if (hurufSiap) return;
      hurufSiap = true;
      gsap.set(hurufTerlihat(), { autoAlpha: 0 });
      gsap.set($$(".vbk-wordmark-pro", sec), { autoAlpha: 0 });
    }
    if (html.classList.contains("vbk-gunting-siap")) siapkanHuruf();
    else document.addEventListener("vbk:gunting", siapkanHuruf, { once: true });

    var introJalan = null;
    function intro() {
      var huruf = hurufTerlihat(), pro = $$(".vbk-wordmark-pro", sec);
      var tl = gsap.timeline();
      if (huruf.length) {
        // titik putar dihitung dari huruf yang masih tegak, lalu transform dibersihkan di akhir
        gsap.set(huruf, { transformOrigin: "50% 50%" });
        gsap.set(pro, { transformOrigin: "50% 50%" });
        tl.fromTo(huruf, { autoAlpha: 0, y: 36, rotation: function (i) { return (acak(i + 3) - 0.5) * 16; } },
          { autoAlpha: 1, y: 0, rotation: 0, duration: 0.32, stagger: 0.04, ease: "back.out(1.6)", clearProps: "transform" }, 0);
        tl.fromTo(pro, { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }, ">-0.08");
      } else {
        // huruf gunting belum ada: tampilkan apa adanya
        gsap.set(pro, { autoAlpha: 1 });
      }
      tl.to(bagianIsi.concat(lain), { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }, huruf.length ? 0.35 : 0);
      introJalan = tl;
      // menggulir di tengah intro: intro langsung selesai
      var selesai = function () { tl.progress(1); removeEventListener("scroll", selesai); };
      addEventListener("scroll", selesai, { passive: true });
      tl.eventCallback("onComplete", function () { removeEventListener("scroll", selesai); });
    }
    function mulaiIntro() {
      if (html.classList.contains("vbk-gunting-siap")) { siapkanHuruf(); intro(); return; }
      // tunggu huruf gunting paling lama 0,8 detik
      var sudah = false;
      var jalan = function () { if (sudah) return; sudah = true; siapkanHuruf(); intro(); };
      document.addEventListener("vbk:gunting", jalan, { once: true });
      setTimeout(jalan, 800);
    }
    if (window.VBK_MUAT && !window.VBK_MUAT.selesai) document.addEventListener("vbk:muat-selesai", mulaiIntro, { once: true });
    else mulaiIntro();

    // keluar layar: wordmark naik, video membesar dan menggelap seperti panggung K0, tirai menebal
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: 0.6 } });
    if (wm) tl.to(wm, { yPercent: -20, scale: 0.96, ease: "none", duration: 1 }, 0);
    if (latar) tl.fromTo(latar, { scale: 1, filter: "brightness(1)" }, { scale: 1.1, filter: "brightness(0.35)", ease: "none", duration: 1 }, 0);
    tl.to([isi].concat(lain, $$(".vbk-jeda", sec)).filter(Boolean), { y: -60, opacity: 0, ease: "none", duration: 0.6 }, 0);
    tl.fromTo(tirai, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.15 }, 0.85);
    return introJalan;
  }

  /* ================= film (GL5, GL1, GL4, TR1, 9.3, 9.4) ================= */
  var ADEGAN = ["f1", "f2", "f3", "f4", "f5"];
  var BOBOT = [5, 5, 12, 5, 7];
  var BATAS = [0];
  (function () { var j = 0, t = 34; BOBOT.forEach(function (b) { j += b; BATAS.push(j / t); }); })();
  var RUTE = [0, BATAS[2], BATAS[3], 0.97];
  var MONYET = {
    // rasio lebar/tinggi potongan, tangan kanan (x, y dalam persen kotak), cermin
    merah: { r: 742 / 766, tangan: [0.92, 0.50], cermin: false },
    biru: { r: 647 / 810, tangan: [0.84, 0.54], cermin: true },
    cokelat: { r: 718 / 776, tangan: [0.94, 0.26], cermin: false },
    pirang: { r: 765 / 833, tangan: [0.92, 0.16], cermin: true }
  };
  // letak di bingkai (0-1), untuk bingkai 1280x720: garis roda di bibir podium V3,
  // amplop di akhir V4 (TR1), celah surat di akhir V5
  var LANTAI = 545 / 720;
  var AMPLOP_V4 = { x: 658 / 1280, y: 198 / 720, w: 390 / 1280 };
  var CELAH = { x: 586 / 1280, y: 316 / 720 };

  function film() {
    var sec = $("#film");
    if (!sec) return;
    var komik = $(".vbk-komik", sec), label = $(".vbk-film-label", sec);

    /* ---- DOM ---- */
    var pin = buat("div", "vbk-film-pin");
    var layar = buat("div", "vbk-film-layar", pin);
    layar.setAttribute("aria-hidden", "true");
    var zoom = buat("div", "vbk-film-zoom", layar);
    var kanvas = buat("canvas", "vbk-film-kanvas", zoom);
    var ctx = kanvas.getContext("2d");
    var estafet = buat("div", "vbk-estafet", layar);
    var monyet = {};
    Object.keys(MONYET).forEach(function (nama) {
      var m = buat("div", "vbk-monyet vbk-monyet-" + nama + (MONYET[nama].cermin ? " vbk-cermin" : ""), estafet);
      buat("span", "vbk-monyet-bayang", m);
      for (var k = 3; k >= 1; k--) { var j = buat("img", "vbk-monyet-jejak vbk-jejak-" + k, m); j.alt = ""; }
      var g = buat("img", "vbk-monyet-gambar", m); g.alt = "";
      var t = buat("img", "vbk-monyet-tepi", m); t.alt = "";
      monyet[nama] = m;
    });
    var amplop = buat("img", "vbk-estafet-amplop", estafet);
    amplop.alt = "";
    var sapuan = [buat("div", "vbk-sapuan", layar), buat("div", "vbk-sapuan", layar)];
    sapuan.forEach(function (s, n) {
      // pita kertas sobek, tepi bergerigi dari benih tetap
      var atas = [], bawah = [], x;
      for (x = 0; x <= 100; x += 2.5) atas.push(x + "," + (4 + acak(x + n * 7) * 7).toFixed(1));
      for (x = 100; x >= 0; x -= 2.5) bawah.push(x + "," + (149 + acak(x * 3 + n) * 7).toFixed(1));
      s.innerHTML = '<svg viewBox="0 0 100 160" preserveAspectRatio="none" focusable="false"><polygon points="' + atas.concat(bawah).join(" ") + '"/><polyline points="' + atas.join(" ") + '"/><polyline points="' + bawah.join(" ") + '"/></svg>';
    });
    var tr1 = buat("img", "vbk-tr1", layar);
    tr1.alt = "";
    var vinyet = buat("div", "vbk-akhir-vinyet", layar);
    var sinar = buat("div", "vbk-akhir-sinar", layar);
    var gelap = buat("div", "vbk-akhir-gelap", layar);
    if (label) pin.appendChild(label);

    var rute = buat("ol", "vbk-frute", pin);
    rute.setAttribute("data-label-id", "Kemajuan perjalanan surat");
    rute.setAttribute("data-label-en", "Letter's journey progress");
    rute.setAttribute("aria-label", html.getAttribute("data-bahasa") === "en" ? "Letter's journey progress" : "Kemajuan perjalanan surat");
    var titik = [["Dikirim", "Sent"], ["Dioper", "Passed"], ["Di udara", "In the air"], ["Sampai", "Delivered"]].map(function (t, i) {
      var li = buat("li", "vbk-frute-titik", rute);
      li.style.setProperty("--vbk-letak", RUTE[i]);
      li.innerHTML = '<span class="vbk-frute-bulat" aria-hidden="true"></span><span class="vbk-frute-label">' + dua(t[0], t[1]) + "</span>";
      return li;
    });
    var ruteAmplop = buat("span", "vbk-frute-amplop", rute);
    ruteAmplop.setAttribute("aria-hidden", "true");

    var lewati = buat("button", "vbk-lewati", pin);
    lewati.type = "button";
    lewati.innerHTML = dua("Lewati film", "Skip the film");
    lewati.addEventListener("click", function () { gulirKe(document.getElementById("bab-2")); });

    sec.insertBefore(pin, komik || null);
    sec.classList.add("vbk-film-siap");

    /* ---- urutan bingkai ---- */
    var set = layarHp() ? "h" : "d";
    var daftar = null; // { f1: n, ... , w, h }
    var tanpaVideo = false;
    var gambar = {}, antre = [], jalan = 0, MAKS = 6;
    var koneksi = navigator.connection || {};
    var langkah = /(^|-)(2g|3g)$/.test(koneksi.effectiveType || "") ? 2 : 1;
    var cadangan = {};
    function jumlah(a) { return daftar ? daftar[a] : 1; }
    function pakaiDaftar(d) {
      daftar = { w: d[set].w, h: d[set].h, _semua: d };
      ADEGAN.forEach(function (a) { daftar[a] = d[set][a]; });
    }
    function url(a, i) {
      if (tanpaVideo) return akar + "aset/vbkong/film/diam/" + set + "/" + (ADEGAN.indexOf(a) + 1) + ".webp";
      return akar + "aset/vbkong/film/" + set + "/" + a + "_" + ("00" + (i + 1)).slice(-3) + ".webp";
    }
    function pompa() {
      while (jalan < MAKS && antre.length) {
        var t = antre.shift(), a = t[0], i = t[1];
        if (!gambar[a] || gambar[a][i]) continue;
        var im = new Image();
        im.decoding = "async";
        gambar[a][i] = im;
        jalan++;
        im.onload = im.onerror = function () { jalan--; kotor = true; jadwal(); pompa(); };
        im.src = url(a, i);
      }
    }
    function muatAdegan(a, depan, sampai) {
      if (!daftar && !tanpaVideo) return;
      var n = jumlah(a), baru = [], i;
      gambar[a] = gambar[a] || [];
      var akhir = Math.min(n, sampai || n);
      for (i = 0; i < akhir; i += langkah) if (!gambar[a][i]) baru.push([a, i]);
      if (akhir === n && (n - 1) % langkah && !gambar[a][n - 1]) baru.push([a, n - 1]);
      antre = depan ? baru.concat(antre) : antre.concat(baru);
      pompa();
    }
    function lepas(k) {
      // HP: lepas bingkai adegan yang sudah lewat dua adegan
      for (var j = 0; j <= k - 2; j++) {
        var a = ADEGAN[j];
        if (gambar[a] && gambar[a].length) gambar[a] = [];
        antre = antre.filter(function (t) { return t[0] !== a; });
      }
    }
    function siap(im) { return im && im.complete && im.naturalWidth > 0; }
    function cari(a, i) {
      var g = gambar[a] || [], n = jumlah(a);
      if (siap(g[i])) return g[i];
      for (var d = 1; d < n; d++) {
        if (siap(g[i - d])) return g[i - d];
        if (siap(g[i + d])) return g[i + d];
      }
      // belum ada bingkai sama sekali: gambar diam adegan itu (adegan 3 tanpa: monyet sudah di lapisan atas)
      var k = ADEGAN.indexOf(a);
      if (k === 2) return null;
      if (!cadangan[a]) { cadangan[a] = new Image(); cadangan[a].onload = function () { kotor = true; jadwal(); }; cadangan[a].src = akar + "aset/vbkong/film/diam/" + set + "/" + (k + 1) + ".webp"; }
      return siap(cadangan[a]) ? cadangan[a] : null;
    }

    /* ---- menggambar ---- */
    var filmTerlihat = false;
    var W = 0, H = 0, dpr = 1, kotor = true, antreGambar = false, kemajuan = 0, kini = { k: -1 };
    function ukur() {
      W = layar.clientWidth; H = layar.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      kanvas.width = Math.round(W * dpr); kanvas.height = Math.round(H * dpr);
      kotor = true;
    }
    // pemetaan cover bingkai -> layar (dalam piksel CSS)
    function peta() {
      var fw = daftar ? daftar.w : (set === "h" ? 405 : 1280), fh = daftar ? daftar.h : 720;
      var s = Math.max(W / fw, H / fh);
      return { s: s, w: fw * s, h: fh * s, x: (W - fw * s) / 2, y: (H - fh * s) / 2, fw: fw, fh: fh };
    }
    // bingkai d (1280 lebar) ke koordinat layar; set h adalah potongan tengah 405 dari 1280
    function titikBingkai(fx, fy) {
      var p = peta(), x = set === "h" ? (fx * 1280 - (1280 - 405) / 2) / 405 : fx;
      return { x: p.x + x * p.w, y: p.y + fy * p.h };
    }
    function gambarCover(im, alfa, skala) {
      var s = Math.max(kanvas.width / im.naturalWidth, kanvas.height / im.naturalHeight) * (skala || 1);
      var w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.globalAlpha = alfa;
      ctx.drawImage(im, (kanvas.width - w) / 2, (kanvas.height - h) / 2, w, h);
    }
    // adegan 3: latar melambat di q 0,48-0,80 (momen nyaris jatuh), monyet tetap normal
    function waktu3(q) {
      var a = 0.48, b = 0.80, lambat = 0.4, total = a + (b - a) * lambat + (1 - b);
      if (q <= a) return q / total;
      if (q <= b) return (a + (q - a) * lambat) / total;
      return (a + (b - a) * lambat + (q - b)) / total;
    }
    function letak(p) {
      var k = 4;
      for (var j = 0; j < 5; j++) if (p < BATAS[j + 1]) { k = j; break; }
      var q = apit((p - BATAS[k]) / (BATAS[k + 1] - BATAS[k]), 0, 1);
      var a = ADEGAN[k], n = jumlah(a);
      return { k: k, a: a, q: q, pos: (k === 2 ? waktu3(q) : q) * (n - 1) };
    }
    var terakhir = "", bergerak = false, diamTimer = 0;
    function gambarSekarang() {
      antreGambar = false;
      var l = letak(kemajuan);
      // gulir berhenti di antara dua bingkai: tampilkan bingkai terdekat, bukan campuran dobel
      if (!bergerak) l.pos = Math.round(l.pos);
      var kunci = l.a + ":" + l.pos.toFixed(2) + ":" + kanvas.width;
      if (!kotor && kunci === terakhir) return;
      kotor = false;
      // sebelum film terlihat hanya 20 bingkai pertama adegan 1 yang dimuat (dari layar muat)
      if (l.k !== kini.k && filmTerlihat) {
        kini = l;
        muatAdegan(l.a, true);
        if (l.k < 4) muatAdegan(ADEGAN[l.k + 1], false);
        if (set === "h") lepas(l.k);
        if (l.k >= 1) muatGambarMonyet();
      }
      var i = Math.min(jumlah(l.a) - 1, Math.floor(l.pos)), sisa = l.pos - i;
      var im = cari(l.a, i);
      if (!im) return;
      terakhir = kunci;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#00141a";
      ctx.fillRect(0, 0, kanvas.width, kanvas.height);
      // mode tanpa video: satu gambar diam per adegan dengan gerak kamera pelan
      var skala = tanpaVideo ? 1 + l.q * 0.08 : 1;
      gambarCover(im, 1, skala);
      var lanjut = (gambar[l.a] || [])[i + 1];
      if (!tanpaVideo && sisa > 0.15 && sisa < 0.85 && siap(lanjut)) gambarCover(lanjut, sisa, 1);
      ctx.globalAlpha = 1;
    }
    function jadwal() { if (!antreGambar) { antreGambar = true; requestAnimationFrame(gambarSekarang); } }

    /* ---- garis rute ---- */
    var aktifRute = -1;
    function tulisRute(p) {
      rute.style.setProperty("--vbk-frute", p.toFixed(4));
      var a = -1;
      RUTE.forEach(function (r, i) { if (p >= r) a = i; });
      if (a === aktifRute) return;
      aktifRute = a;
      titik.forEach(function (t, i) {
        t.classList.toggle("vbk-lewat", i <= a);
        if (i === a) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
      });
    }

    /* ---- estafet monyet (9.3) dan sambungan (9.4) ---- */
    var gambarMonyetDimuat = false;
    function muatGambarMonyet() {
      if (gambarMonyetDimuat) return;
      gambarMonyetDimuat = true;
      var ukuran = layarHp() ? "-512" : "";
      Object.keys(monyet).forEach(function (nama) {
        var m = monyet[nama];
        $$(".vbk-monyet-gambar, .vbk-monyet-jejak", m).forEach(function (im) { im.src = akar + "aset/vbkong/gambar/monyet-" + nama + ukuran + ".webp"; });
        $(".vbk-monyet-tepi", m).src = akar + "aset/vbkong/gambar/monyet-" + nama + "-tepi.webp";
      });
      amplop.src = tr1.src = akar + "aset/vbkong/gambar/amplop.webp";
    }

    var M = null;
    function bangun() {
      ukur();
      var hp = layarHp();
      var lantaiY = titikBingkai(0.5, LANTAI).y;
      var mh = Math.round((hp ? 0.22 : 0.34) * H);
      var ew = (hp ? 0.22 : 0.11) * W, eh = ew * 230 / 320;
      estafet.style.setProperty("--vbk-garis-lantai", lantaiY.toFixed(1) + "px");
      // letak tiap monyet: X = jarak pusat monyet dari tengah layar, dalam lebar layar
      var L = hp
        ? { merah: -0.2, biru: 0.22, cokelat: -0.2, pirangAmbil: 0.18, merahKeluar: -0.95, puncak: 0.18 * H }
        : { merah: -0.18, biru: 0.15, cokelat: -0.1, pirangAmbil: 0.12, merahKeluar: -0.47, puncak: 0.30 * H };
      var ukuranM = {};
      Object.keys(monyet).forEach(function (nama) {
        var mw = Math.round(mh * MONYET[nama].r);
        ukuranM[nama] = mw;
        gsap.set(monyet[nama], { width: mw, height: mh, x: -mw * 2, y: lantaiY - mh, rotation: 0, skewX: 0, "--jejak": "0px", "--jejak-a": 0 });
      });
      function mx(X, nama) { return W / 2 + X * W - ukuranM[nama] / 2; }
      // tangan kanan monyet (dari sisi yang menghadap tengah), di koordinat layar
      function tangan(nama, X, putar, geserY) {
        var d = MONYET[nama], mw = ukuranM[nama];
        var hx = d.cermin ? 1 - d.tangan[0] : d.tangan[0], hy = d.tangan[1];
        var px = (hx - 0.5) * mw, py = (hy - 0.5) * mh, r = (putar || 0) * Math.PI / 180;
        var rx = px * Math.cos(r) - py * Math.sin(r), ry = px * Math.sin(r) + py * Math.cos(r);
        return { x: W / 2 + X * W + rx, y: lantaiY - mh / 2 + ry + (geserY || 0) };
      }
      var menutup = 1.8 * Math.max(W / ew, H / eh);
      gsap.set(amplop, { width: ew, xPercent: -50, yPercent: -50, x: W / 2, y: H / 2, scale: menutup, rotation: 0, autoAlpha: 1 });

      var mr = monyet.merah, bi = monyet.biru, co = monyet.cokelat, pi = monyet.pirang;
      var tMerah = tangan("merah", L.merah), tBiru = tangan("biru", L.biru), tCokelat = tangan("cokelat", L.cokelat);
      // tidak dijeda: garis waktu anak yang dijeda tidak ikut bergerak di dalam induk
      var E = gsap.timeline({ defaults: { ease: "none" } });
      // 0,00-0,12: amplop turun dari layar tertutup ke tangan merah; merah meluncur masuk + ollie
      E.fromTo(mr, { x: mx(-0.62, "merah") }, { x: mx(L.merah, "merah"), duration: 0.1, ease: "power2.out" }, 0)
        .to(mr, { y: lantaiY - mh * 1.16, duration: 0.02, ease: "power1.out" }, 0.085)
        .to(mr, { y: lantaiY - mh, duration: 0.025, ease: "power1.in" }, 0.105)
        .fromTo(amplop, { x: W / 2, y: H / 2, scale: menutup, rotation: 0 }, { x: tMerah.x, y: tMerah.y, scale: 1, rotation: -10, duration: 0.12, ease: "power2.inOut" }, 0);
      // 0,12-0,30: merah melempar ke biru; biru masuk dari kanan bergoyang lalu berputar sekali
      E.fromTo(bi, { x: mx(0.8, "biru"), rotation: -8, "--jejak": "46px", "--jejak-a": 1 }, { x: mx(L.biru, "biru"), "--jejak": "0px", "--jejak-a": 0, duration: 0.11, ease: "power2.out" }, 0.15)
        .to(bi, { skewX: 4, duration: 0.02, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0.15)
        .to(bi, { rotation: 352, duration: 0.04, ease: "power1.inOut" }, 0.26)
        .to(amplop, { motionPath: { path: [{ x: tMerah.x, y: tMerah.y }, { x: (tMerah.x + tBiru.x) / 2, y: lantaiY - mh - L.puncak }, { x: tBiru.x, y: tBiru.y }], curviness: 1.2 }, rotation: 350, duration: 0.16, ease: "power1.inOut" }, 0.13)
        .to(mr, { x: mx(L.merahKeluar, "merah"), y: lantaiY - mh * 0.82, duration: 0.08, ease: "power1.in" }, 0.22);
      // 0,30-0,48: biru melempar ke cokelat yang masuk pelan dari kiri bawah
      E.fromTo(co, { x: mx(-0.75, "cokelat"), y: lantaiY - mh * 0.7 }, { x: mx(L.cokelat, "cokelat"), y: lantaiY - mh, duration: 0.16, ease: "power1.out" }, 0.30)
        .to(amplop, { motionPath: { path: [{ x: tBiru.x, y: tBiru.y }, { x: (tBiru.x + tCokelat.x) / 2, y: lantaiY - mh - L.puncak * 0.8 }, { x: tCokelat.x, y: tCokelat.y }], curviness: 1.2 }, rotation: 710, duration: 0.14, ease: "power1.inOut" }, 0.33)
        .to(bi, { x: mx(0.85, "biru"), "--jejak": "-40px", "--jejak-a": 0.7, duration: 0.1, ease: "power1.in" }, 0.48);
      // 0,48-0,80: nyaris jatuh. Amplop meleset, jatuh berputar 540 derajat ke bibir podium,
      // cokelat menerjang di 0,70, amplop tertangkap di ujung jari di 0,76 lalu bergoyang dan tegak
      var jatuh = { x: tCokelat.x + ukuranM.cokelat * 0.32, y: lantaiY - eh * 0.6 };
      var ujungJari = tangan("cokelat", L.cokelat + 0.05, -18, eh * 0.35);
      E.to(amplop, { x: jatuh.x, y: jatuh.y, rotation: 1250, duration: 0.21, ease: "power2.in" }, 0.50)
        .to(co, { rotation: -18, x: mx(L.cokelat + 0.05, "cokelat"), duration: 0.06, ease: "power2.out" }, 0.66)
        .to(amplop, { x: ujungJari.x, y: ujungJari.y, rotation: 1475, duration: 0.06, ease: "power2.out" }, 0.70)
        .to(amplop, { keyframes: [{ rotation: 1452 }, { rotation: 1466 }, { rotation: 1446 }, { rotation: 1440 }], duration: 0.04, ease: "sine.inOut" }, 0.76);
      // 0,80-1,00: pirang melesat dari kanan, mengambil amplop, melempar lurus ke atas; semua keluar
      var tPirang = tangan("pirang", L.pirangAmbil);
      E.to(co, { rotation: 0, x: mx(L.cokelat, "cokelat"), duration: 0.04, ease: "power1.out" }, 0.80)
        .to(amplop, { x: tCokelat.x, y: tCokelat.y, duration: 0.04 }, 0.80)
        .fromTo(pi, { x: mx(0.8, "pirang"), skewX: 8, "--jejak": "60px", "--jejak-a": 1 }, { x: mx(L.pirangAmbil, "pirang"), skewX: 0, "--jejak": "0px", "--jejak-a": 0, duration: 0.06, ease: "power3.out" }, 0.80)
        .to(amplop, { x: tPirang.x, y: tPirang.y, rotation: 1440 + 20, duration: 0.03, ease: "power2.out" }, 0.85)
        .to(pi, { y: lantaiY - mh * 1.12, duration: 0.02, ease: "power1.out" }, 0.87)
        .to(pi, { y: lantaiY - mh, duration: 0.02, ease: "power1.in" }, 0.89)
        .to(amplop, { y: -eh * 2, scale: 0.6, rotation: 1440 + 200, duration: 0.11, ease: "power1.in" }, 0.89)
        .to(co, { x: mx(-0.9, "cokelat"), duration: 0.09, ease: "power1.in" }, 0.91)
        .to(mr, { x: mx(-0.95, "merah"), duration: 0.08, ease: "power1.in" }, 0.91)
        .to(pi, { x: mx(0.9, "pirang"), skewX: -8, "--jejak": "-60px", "--jejak-a": 1, duration: 0.08, ease: "power2.in" }, 0.92);

      // garis waktu induk: kemajuan pin 0-1
      var awalTr1 = titikBingkai(AMPLOP_V4.x, AMPLOP_V4.y);
      var lebarTr1 = AMPLOP_V4.w * peta().w * (set === "h" ? 1280 / 405 : 1);
      var podium = titikBingkai(629 / 1280, 600 / 720);
      var celah = titikBingkai(CELAH.x, CELAH.y);
      gsap.set(zoom, { transformOrigin: (celah.x / W * 100).toFixed(1) + "% " + (celah.y / H * 100).toFixed(1) + "%", scale: 1 });
      gsap.set(sapuan, { y: H, height: H * 1.6 });
      gsap.set(tr1, { width: lebarTr1, xPercent: -50, yPercent: -50, x: awalTr1.x, y: awalTr1.y, autoAlpha: 0, scale: 1 });
      gsap.set(sinar, { left: celah.x });
      var lewatSapuan = 0.012;
      M = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: function () {
        kemajuan = M.progress(); bergerak = true; jadwal(); tulisRute(kemajuan);
        clearTimeout(diamTimer);
        diamTimer = setTimeout(function () { bergerak = false; jadwal(); }, 140);
      } });
      M.set({}, {}, 1); // panjang tetap 1
      if (label) M.fromTo(label, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.03 }, 0.03);
      // adegan 1 ke 2: akhir V1 lebih dekat dari awal V2 (SSIM di bawah 0,85), jadi pakai sapuan kertas
      M.fromTo(sapuan[0], { y: H }, { y: -H * 1.6, duration: lewatSapuan }, BATAS[1] - lewatSapuan / 2);
      // adegan 3: lapisan estafet hanya tampil di adegannya
      M.fromTo(estafet, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.0005 }, BATAS[2] - 0.0005);
      E.duration(BATAS[3] - BATAS[2]);
      M.add(E, BATAS[2]);
      M.to(estafet, { autoAlpha: 0, duration: 0.0005 }, BATAS[3]);
      // adegan 3 ke 4: sapuan kertas dari bawah ke atas
      M.fromTo(sapuan[1], { y: H }, { y: -H * 1.6, duration: lewatSapuan }, BATAS[3] - lewatSapuan / 2);
      // adegan 4 ke 5 (TR1 versi CSS): amplop menutup layar lalu mengecil ke podium
      var tutupTr1 = 2.2 * Math.max(W, H) / lebarTr1 * 1.4;
      M.fromTo(tr1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.002 }, BATAS[4] - 0.010)
        .fromTo(tr1, { scale: 1, x: awalTr1.x, y: awalTr1.y }, { scale: tutupTr1, x: W / 2, y: H / 2, duration: 0.008, ease: "power2.in" }, BATAS[4] - 0.008)
        .to(tr1, { scale: 0.2, x: podium.x, y: podium.y, duration: 0.008, ease: "power2.out" }, BATAS[4])
        .to(tr1, { autoAlpha: 0, duration: 0.003 }, BATAS[4] + 0.005);
      // akhir adegan 5: masuk celah, gelap dengan berkas cahaya hangat, lalu #00141a penuh
      M.fromTo(zoom, { scale: 1 }, { scale: 1.8, duration: 0.06, ease: "power1.in" }, 0.94)
        .fromTo(vinyet, { opacity: 0 }, { opacity: 0.96, duration: 0.05 }, 0.94)
        .fromTo(sinar, { opacity: 0 }, { opacity: 0.55, duration: 0.017 }, 0.955)
        .to(sinar, { opacity: 0, duration: 0.016 }, 0.972)
        .fromTo(gelap, { opacity: 0 }, { opacity: 1, duration: 0.015 }, 0.985);

      ST.create({
        trigger: pin, start: "top top", end: hp ? "+=450%" : "+=600%",
        pin: true, scrub: 0.5, anticipatePin: 1, animation: M,
        // dihitung lebih dulu dari pemicu lain di bawahnya (kartu bab dibuat sebelum daftar.json datang)
        refreshPriority: 1,
        onToggle: function (self) {
          html.classList.toggle("vbk-film-aktif", self.isActive);
        }
      });
      kemajuan = M.progress();
      tulisRute(kemajuan);
      jadwal();
    }

    function mulai() {
      bangun();
      ST.sort();
      // begitu film terlihat (pengunjung mulai menggulir): sisa adegan 1 dan seluruh adegan 2.
      // Potongan monyet menyusul saat adegan 2 tercapai (lihat gambarSekarang).
      ST.create({ trigger: sec, start: "top 92%", once: true, onEnter: function () { filmTerlihat = true; kini = { k: -1 }; kotor = true; jadwal(); } });
      ST.refresh();
    }

    // bangun ulang saat ukuran berubah (lebar, atau melewati batas HP/desktop)
    var lebarLama = innerWidth, tunda = 0;
    addEventListener("resize", function () {
      clearTimeout(tunda);
      tunda = setTimeout(function () {
        if (innerWidth === lebarLama && Math.abs(layar.clientHeight - H) < 120) return;
        lebarLama = innerWidth;
        var setBaru = layarHp() ? "h" : "d";
        if (setBaru !== set) {
          set = setBaru;
          if (daftar) pakaiDaftar(daftar._semua);
          gambar = {}; antre = []; cadangan = {}; kini = { k: -1 };
          gambarMonyetDimuat = false; muatGambarMonyet();
        }
        var stLama = M && M.scrollTrigger;
        if (stLama) stLama.kill(true);
        if (M) M.kill();
        bangun();
        ST.sort();
        ST.refresh();
      }, 220);
    });

    fetch(akar + "aset/vbkong/film/daftar.json").then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) {
      pakaiDaftar(d);
      // 20 bingkai pertama adegan 1 (sudah diminta layar muat, jadi dari cache)
      muatAdegan("f1", true, 20);
    }).catch(function () {
      tanpaVideo = true;
      daftar = null;
    }).then(mulai);

  }

  /* ================= kartu penutup bab (TR5) ================= */
  function kartuBab() {
    var bab = $("#bab-2");
    if (!bab) return;
    var cap = $(".vbk-cap", bab), mono = $(".vbk-bab-mono", bab), lbl = $(".vbk-bab-label", bab);
    gsap.set(cap, { autoAlpha: 0, scale: 1.4, rotation: -14 });
    gsap.set([mono, lbl], { autoAlpha: 0, y: 8 });
    var tl = gsap.timeline({ paused: true });
    tl.to(cap, { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.35, ease: "expo.out" })
      // isi kartu yang bergetar, bukan bagiannya, supaya halaman tidak melebar 2 piksel
      .to([cap, mono, lbl], { keyframes: [{ x: 2 }, { x: -2 }, { x: 1 }, { x: 0 }], duration: 0.15, ease: "none" }, 0.3)
      .to(mono, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.55)
      .to(lbl, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.8);
    ST.create({ trigger: bab, start: "top 50%", onEnter: function () { tl.play(); }, onEnterBack: function () { tl.progress(1); } });
    if (!layarHp()) ST.create({ trigger: bab, start: "top top", end: "+=60%", pin: true, anticipatePin: 1 });
  }


  /* ================= huruf gunting: tunggu sampai dirakit ================= */
  function setelahGunting(fn) {
    if (html.classList.contains("vbk-gunting-siap")) { fn(); return; }
    var sudah = false;
    var jalan = function () { if (!sudah) { sudah = true; fn(); } };
    document.addEventListener("vbk:gunting", jalan, { once: true });
    setTimeout(jalan, 2500); // tanpa huruf gunting: gerak tetap jalan dengan teks biasa
  }

  /* ================= Penutup (PN1 + PN2, PRD 12) ================= */
  function penutup() {
    var sec = $("#penutup");
    if (!sec) return;
    var daftar = $(".vbk-manifesto", sec), kata = $$(".vbk-manifesto-kata", sec);
    var chip = $$(".vbk-manifesto-baris .vbk-chip", sec);
    var aksi = $$(".vbk-penutup-kalimat, .vbk-penutup-tombol", sec);
    var cincin = $(".vbk-penutup-cincin", sec), latar = $(".vbk-penutup-latar", sec);
    var redup = buat("div", "vbk-penutup-redup", latar);
    function isi(k) { return k.querySelector(".vbk-gunting-dua") || k; }
    setelahGunting(function () {
      var bagian = kata.map(isi);
      if (layarHp()) {
        // HP: tanpa pin, tiap kata muncul sekali saat masuk layar
        bagian.forEach(function (b, i) {
          gsap.set(b, { yPercent: 120, rotation: i % 2 ? 4 : -4 });
          gsap.set(chip[i], { autoAlpha: 0, y: 10 });
          ST.create({ trigger: kata[i], start: "top 88%", once: true, onEnter: function () {
            gsap.to(b, { yPercent: 0, rotation: 0, duration: 0.6, ease: "power3.out" });
            gsap.to(chip[i], { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.25 });
          } });
        });
        return;
      }
      var tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.set({}, {}, 1);
      bagian.forEach(function (b, i) {
        tl.fromTo(b, { yPercent: 120, rotation: i % 2 ? 4 : -4 }, { yPercent: 0, rotation: 0, duration: 0.15, ease: "power2.out" }, i * 0.15);
        if (chip[i]) tl.fromTo(chip[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, i * 0.15 + 0.1);
      });
      tl.fromTo(aksi, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.6)
        .to(daftar, { scale: 0.82, yPercent: -30, autoAlpha: 0, duration: 0.25, ease: "power1.in", transformOrigin: "50% 0%" }, 0.75)
        .fromTo(cincin, { filter: "brightness(1)" }, { filter: "brightness(1.9)", duration: 0.25 }, 0.75)
        .fromTo(redup, { opacity: 0 }, { opacity: 0.6, duration: 0.25 }, 0.75);
      ST.create({ trigger: sec, start: "top top", end: "+=200%", pin: true, scrub: 0.6, anticipatePin: 1, animation: tl });
      ST.sort();
      ST.refresh();
    });
  }

  /* ================= Tentang (TT1, PRD 13.2) ================= */
  function tentang() {
    var sec = $("#tentang");
    if (!sec) return;
    var kartu = $(".vbk-catatan-kertas", sec), polaroid = $(".vbk-polaroid", sec), img = polaroid && $("img", polaroid);
    var foto = null;
    if (img) {
      // bungkus foto supaya bernapas dari kaki bersama kelopak matanya
      foto = buat("div", "vbk-polaroid-foto");
      img.parentNode.insertBefore(foto, img);
      foto.appendChild(img);
      var svgNs = "http://www.w3.org/2000/svg", mata = document.createElementNS(svgNs, "svg");
      mata.setAttribute("class", "vbk-polaroid-mata");
      mata.setAttribute("viewBox", "0 0 576 955");
      mata.setAttribute("aria-hidden", "true");
      mata.setAttribute("focusable", "false");
      [[256, 320, 35, 41], [339.5, 331.5, 28, 32]].forEach(function (m) {
        var e = document.createElementNS(svgNs, "ellipse");
        e.setAttribute("class", "vbk-kelopak");
        e.setAttribute("cx", m[0]); e.setAttribute("cy", m[1]); e.setAttribute("rx", m[2]); e.setAttribute("ry", m[3]);
        mata.appendChild(e);
      });
      foto.appendChild(mata);
    }
    if (kartu) gsap.set(kartu, { y: 40, rotation: -3, autoAlpha: 0, "--selotip-1": 0, "--selotip-2": 0 });
    if (polaroid) gsap.set(polaroid, { "--selotip-1": 0, "--selotip-2": 0 });
    var judul = [];
    setelahGunting(function () {
      judul = $$("#judul-tentang .vbk-huruf-isi");
      gsap.set(judul, { autoAlpha: 0, transformOrigin: "50% 50%" });
    });
    ST.create({ trigger: sec, start: "top 70%", once: true, onEnter: function () {
      var tl = gsap.timeline();
      if (judul.length) tl.fromTo(judul, { autoAlpha: 0, y: 30, rotation: function (i) { return (acak(i + 40) - 0.5) * 14; } },
        { autoAlpha: 1, y: 0, rotation: 0, duration: 0.3, stagger: 0.035, ease: "back.out(1.6)", clearProps: "transform" }, 0);
      if (kartu) tl.to(kartu, { y: 0, rotation: -1, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.15)
        .to(kartu, { "--selotip-1": 1, duration: 0.2, ease: "power2.out" }, 0.7)
        .to(kartu, { "--selotip-2": 1, duration: 0.2, ease: "power2.out" }, 0.82);
      if (polaroid) tl.to(polaroid, { "--selotip-1": 1, duration: 0.2, ease: "power2.out" }, 0.3)
        .to(polaroid, { "--selotip-2": 1, duration: 0.2, ease: "power2.out" }, 0.42);
    } });
    if (foto) {
      // napas 3,2 detik dan kedip tiap 3-6 detik, hanya selama bagian ini terlihat
      var napas = gsap.to(foto, { scaleY: 1.015, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });
      var kedip = 0, terlihat = false;
      var jadwalKedip = function () {
        clearTimeout(kedip);
        kedip = setTimeout(function () {
          if (!terlihat) return;
          polaroid.classList.add("vbk-kedip-polaroid");
          setTimeout(function () { polaroid.classList.remove("vbk-kedip-polaroid"); jadwalKedip(); }, 120);
        }, 3000 + Math.random() * 3000);
      };
      ST.create({ trigger: sec, start: "top bottom", end: "bottom top", onToggle: function (st) {
        terlihat = st.isActive;
        if (terlihat) { napas.play(); jadwalKedip(); } else { napas.pause(); clearTimeout(kedip); }
      } });
    }
  }

  /* ================= footer maskot (FT1, PRD 14) ================= */
  function footer() {
    var sec = $("#kaki"), pg = sec && $(".vbk-ka-panggung", sec);
    if (!pg) return;
    var padam = $(".vbk-ka-padam", pg), satu = $(".vbk-ka-satu", pg), sorot = $(".vbk-ka-sorot", pg);
    var lubang = $(".vbk-ka-lubang", pg), sinar = $(".vbk-ka-sinar", pg), kontak = $(".vbk-ka-kontak", pg);
    var maskot = $(".vbk-maskot", pg), badan = $(".vbk-maskot-badan", pg), kotak = $(".vbk-maskot-kotak", pg);
    var kotakImg = $(".vbk-maskot-kotak > img", pg), amplopKotak = $(".vbk-ka-amplop", pg);
    var kelopak = $$(".vbk-maskot-mata .vbk-kelopak", pg), rute = $(".vbk-rute", pg), ketuk = $(".vbk-ka-ketuk", pg);
    var titikRute = rute ? $$("li", rute) : [];
    var ruteAmplop = null;
    if (rute && $("ol", rute)) { ruteAmplop = buat("span", "vbk-rute-amplop-ka", $("ol", rute)); ruteAmplop.setAttribute("aria-hidden", "true"); }
    // pesawat yang membawa amplop dari film
    var terbang = buat("div", "vbk-ka-terbang", pg);
    terbang.setAttribute("aria-hidden", "true");
    var pesawat = buat("img", "vbk-ka-terbang-pesawat", terbang), amplopTerbang = buat("img", "vbk-ka-terbang-amplop", terbang);
    pesawat.alt = amplopTerbang.alt = "";
    ST.create({ trigger: sec, start: "top 250%", once: true, onEnter: function () {
      pesawat.src = akar + "aset/vbkong/gambar/pesawat.webp";
      amplopTerbang.src = akar + "aset/vbkong/gambar/amplop.webp";
    } });
    function pendek() { return window.matchMedia("(max-width: 1024px), (max-height: 759px)").matches; }
    function huruf() {
      return $$(".vbk-ka-tulisan " + (pendek() ? ".vbk-ka-baris-hp" : ".vbk-ka-baris-desktop") + " .vbk-huruf-isi", pg);
    }
    function sampai(ya) {
      // garis rute: titik Sampai menyala dan garis jadi utuh saat amplop masuk celah
      if (!rute) return;
      rute.classList.toggle("vbk-rute-penuh", ya);
      if (titikRute[3]) titikRute[3].classList.toggle("vbk-rute-lewat", ya);
      rute.setAttribute("aria-label", ya ? (html.getAttribute("data-bahasa") === "en" ? "Letter's journey progress: delivered" : "Kemajuan perjalanan surat: sampai")
        : (html.getAttribute("data-bahasa") === "en" ? "Letter's journey progress: in the air" : "Kemajuan perjalanan surat: di udara"));
    }

    /* ---- diam yang hidup (14.5) ---- */
    var diamJalan = false, idle = [], kedipKaki = 0, kemajuan = 0;
    var miring = gsap.quickTo(maskot, "rotation", { duration: 0.6, ease: "power2.out" });
    var geserKontak = gsap.quickTo(kontak, "x", { duration: 0.6, ease: "power2.out" });
    function kedipDua() {
      gsap.timeline().set(kelopak, { opacity: 1 }).set(kelopak, { opacity: 0 }, 0.12);
    }
    function mulaiDiam() {
      if (diamJalan) return;
      diamJalan = true;
      idle.push(gsap.to(maskot, { scaleY: 1.015, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% 100%" }));
      idle.push(gsap.to(kotak, { "--angguk": "-4px", duration: 1.3, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      (function ulang() {
        kedipKaki = setTimeout(function () { kedipDua(); ulang(); }, 3000 + Math.random() * 3000);
      })();
    }
    function hentiDiam() {
      if (!diamJalan) return;
      diamJalan = false;
      idle.forEach(function (t) { t.kill(); });
      idle = [];
      clearTimeout(kedipKaki);
      gsap.set(maskot, { scaleY: 1 });
      gsap.set(kotak, { "--angguk": "0px" });
      miring(0); geserKontak(0);
    }
    if (window.matchMedia("(pointer: fine)").matches) {
      addEventListener("mousemove", function (e) {
        if (!diamJalan || pendek()) return;
        var r = maskot.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        miring(apit(dx * 6, -3, 3));
        geserKontak(apit(-dx * 30, -12, 12));
      }, { passive: true });
    }
    // ketuk kotak: amplop meloncat keluar dari celah lalu masuk lagi, jeda 0,8 detik
    var bolehKetuk = true;
    if (ketuk) ketuk.addEventListener("click", function () {
      if (!bolehKetuk || kemajuan < 0.95) return;
      bolehKetuk = false;
      setTimeout(function () { bolehKetuk = true; }, 800);
      gsap.timeline()
        .to(amplopKotak, { yPercent: -60, rotation: 100, duration: 0.25, ease: "power2.out" })
        .to(amplopKotak, { yPercent: 46, rotation: 90, duration: 0.35, ease: "power2.in" })
        .to(kotakImg, { keyframes: [{ scaleY: 0.95, scaleX: 1.03, duration: 0.08 }, { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" }] }, 0.5);
    });

    /* ---- garis waktu scrub (14.4) ---- */
    var tl = null, st = null;
    function bangun() {
      if (st) { st.kill(true); st = null; }
      if (tl) { tl.revert(); tl = null; }
      hentiDiam();
      // ukur dulu dalam komposisi akhir (tampilan diam), baru pasang keadaan awal
      var rp = pg.getBoundingClientRect(), rk = kotakImg.getBoundingClientRect();
      var celah = { x: rk.left - rp.left + rk.width * 250.5 / 576, y: rk.top - rp.top + rk.height * 63.3 / 304 };
      var W = pg.clientWidth, H = pg.clientHeight, vw = innerWidth / 100, sv = H / 100, kecil = pendek();
      var mulaiTerbang = kecil ? { x: -20 * vw, y: 10 * sv } : { x: -10 * vw, y: 8 * sv };
      var lewatTerbang = kecil ? { x: 20 * vw, y: 6 * sv } : { x: 30 * vw, y: 4 * sv };
      var hrf = huruf();
      gsap.set(hrf, { transformOrigin: "50% 50%" });
      gsap.set(sorot, { xPercent: -50, x: 0 });
      gsap.set(sinar, { xPercent: -50, x: 0, transformOrigin: "50% 100%" });
      gsap.set([lubang, kontak], { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      gsap.set(maskot, { xPercent: -50, x: 0, transformOrigin: "50% 100%" });
      gsap.set(kotakImg, { transformOrigin: "50% 100%" });
      gsap.set(badan, { transformOrigin: "50% 100%" });
      gsap.set(amplopKotak, { xPercent: -50, yPercent: 46, rotation: 90, x: 0, y: 0 });
      gsap.set(terbang, { xPercent: -50, yPercent: -100, x: mulaiTerbang.x, y: mulaiTerbang.y, autoAlpha: 0 });
      gsap.set(pesawat, { x: 0, y: 0, rotation: 0 });
      gsap.set(amplopTerbang, { autoAlpha: 1 });
      sampai(false);

      tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.set({}, {}, 1)
        // 1. lampu padam, "Satu surat lagi."
        .fromTo(padam, { opacity: 0 }, { opacity: 0.82, duration: 0.12 }, 0)
        .fromTo(satu, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.03)
        .to(satu, { autoAlpha: 0, duration: 0.03 }, 0.12);
      // 2. slogan ditempel huruf demi huruf (y dalam satuan huruf: tinggi huruf 100)
      if (hrf.length) tl.fromTo(hrf, { y: 60, rotation: function (i) { return (acak(i + 7) - 0.5) * 10; }, scale: 1.1, autoAlpha: 0 },
        { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.05, stagger: { amount: 0.17 }, ease: "back.out(2)" }, 0.12);
      // 3. sorotan jatuh, pintu lift membuka, sinar hangat naik
      tl.fromTo(sorot, { opacity: 0, scaleX: 2.3 }, { opacity: 0.85, scaleX: 1, duration: 0.10 }, 0.30)
        .fromTo(lubang, { scaleX: 0 }, { scaleX: 1, duration: 0.06 }, 0.32)
        .fromTo(sinar, { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: 0.06 }, 0.34)
        // 4-5. maskot naik, kotak tertinggal lalu terdorong dan memantul
        .fromTo(maskot, { yPercent: 100 }, { yPercent: 0, ease: "power2.out", duration: 0.36 }, 0.38)
        .fromTo(maskot, { "--geser-kotak": 4 }, { "--geser-kotak": 0, duration: 0.30 }, 0.40)
        .to(maskot, { "--geser-kotak": -3, duration: 0.04 }, 0.70)
        .to(maskot, { "--geser-kotak": 0, ease: "back.out(2)", duration: 0.04 }, 0.74)
        // 6. mendarat
        .to(sinar, { opacity: 0, duration: 0.10 }, 0.70)
        .to(lubang, { scaleX: 0, duration: 0.06 }, 0.74)
        .to(maskot, { keyframes: [{ scaleY: 0.985, duration: 0.015 }, { scaleY: 1, duration: 0.025, ease: "back.out(3)" }] }, 0.74)
        .fromTo(kontak, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.76);
      // garis rute: muncul di 0,40 dengan amplop mini di "Di udara", ke "Sampai" di 0,95
      if (rute) tl.fromTo(rute, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.40);
      if (ruteAmplop) tl.fromTo(ruteAmplop, { "--ka": 2 / 3 }, { "--ka": 1, duration: 0.05 }, 0.90);
      // 7. pesawat datang membawa amplop ke atas celah
      tl.set(terbang, { autoAlpha: 1 }, 0.80)
        .to(terbang, { motionPath: { path: [mulaiTerbang, lewatTerbang, { x: celah.x, y: celah.y - 2 }], curviness: 1.1 }, duration: 0.10, ease: "power1.inOut" }, 0.80)
        // 8. amplop lepas, pesawat naik ke kanan atas dan keluar
        .set(amplopTerbang, { autoAlpha: 0 }, 0.90)
        .to(pesawat, { x: W * 0.6, y: -H * 0.5, rotation: -18, duration: 0.10, ease: "power1.in" }, 0.90)
        // 9. amplop berputar tegak lurus celah dan turun; bagian di bawah celah terpotong
        .fromTo(amplopKotak, { autoAlpha: 0, yPercent: -230, rotation: 0 }, { autoAlpha: 1, yPercent: 46, rotation: 90, duration: 0.05, ease: "power2.in" }, 0.90)
        // 10. kotak menerima: memipih lalu memantul, badan ikut, mata berkedip dua kali
        .to(kotakImg, { keyframes: [{ scaleY: 0.93, scaleX: 1.04, duration: 0.015 }, { scaleY: 1, scaleX: 1, duration: 0.035, ease: "elastic.out(1, 0.4)" }] }, 0.95)
        .to(badan, { keyframes: [{ scaleY: 0.99, duration: 0.015 }, { scaleY: 1, duration: 0.03 }] }, 0.95)
        .to(kelopak, { keyframes: [{ opacity: 1, duration: 0.006 }, { opacity: 0, duration: 0.008 }, { opacity: 1, duration: 0.006 }, { opacity: 0, duration: 0.008 }] }, 0.955);

      st = ST.create({
        trigger: pg, start: "top top", end: kecil ? "+=130%" : "+=160%", pin: true, scrub: 0.6, anticipatePin: 1, animation: tl,
        onUpdate: function (self) {
          kemajuan = self.progress;
          sampai(kemajuan >= 0.95);
          // pesawat tiba tepat di bawah pil menu (puncak kotak sekitar 14 persen tinggi layar):
          // menu menyingkir selama pesawat datang dan pergi
          html.classList.toggle("vbk-menu-sembunyi", self.isActive && kemajuan >= 0.78 && kemajuan < 0.97);
          if (kemajuan > 0.99) mulaiDiam(); else hentiDiam();
          // gulir cepat: maskot terhuyung lalu tegak
          if (diamJalan && Math.abs(self.getVelocity()) > 2500) {
            gsap.fromTo(maskot, { rotation: self.direction > 0 ? 2 : -2 }, { rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
          }
        }
      });
    }
    setelahGunting(function () {
      bangun();
      ST.sort();
      ST.refresh();
      // bangun ulang saat ukuran berubah (letak celah dan lintasan pesawat diukur ulang)
      var lebar = innerWidth, tinggi = innerHeight, tunda = 0;
      addEventListener("resize", function () {
        clearTimeout(tunda);
        tunda = setTimeout(function () {
          if (innerWidth === lebar && Math.abs(innerHeight - tinggi) < 120) return;
          lebar = innerWidth; tinggi = innerHeight;
          bangun();
          ST.sort();
          ST.refresh();
        }, 250);
      });
      document.addEventListener("vbk:bahasa", function () { sampai(kemajuan >= 0.95); });
    });
  }

  /* ================= menu redup selama film ================= */
  // (kelas vbk-film-aktif dipasang pemicu film; CSS menurunkan opacity menu ke 0,55)

  hero();
  film();
  kartuBab();
  tentang();
  penutup();
  footer();
  VBK.gerakSiap = true;
  VBK.gsap = gsap;
  VBK.lenis = lenis;

  // jangkar di alamat (#api dan lain-lain): pin menambah jarak, jadi gulir ulang ke sasaran
  if (location.hash.length > 1) {
    var sasaran = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (sasaran) setTimeout(function () { ST.refresh(); sasaran.scrollIntoView(); }, 300);
  }
  // tautan dalam halaman: Lenis menggulir halus
  if (lenis) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1), el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "atas" ? 0 : -84, duration: 1.2 });
      try { history.pushState(null, "", "#" + id); } catch (er) {}
    });
  }
})();
