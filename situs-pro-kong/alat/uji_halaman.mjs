// Uji fungsi halaman di Chromium (Playwright): tab, salin, awalan, perangko,
// bahasa, menu HP, kurangi gerakan, tanpa JavaScript, dan gerak Fase 3
// (layar muat, hero, video, film, estafet, Lewati film, kartu bab).
//
//     cd situs-pro-kong && python3 -m http.server 8766 &
//     node alat/uji_halaman.mjs
//
// Playwright diambil dari PLAYWRIGHT_MODULE, atau dari instalasi global.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs");
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}).catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }));
const hasil = [];
const cek = (nama, ok, info = "") => hasil.push(`${ok ? "LOLOS" : "GAGAL"}  ${nama}${info ? "  (" + info + ")" : ""}`);
async function halaman(opsi = {}) {
  const ctx = await b.newContext({ viewport: opsi.vp || { width: 1280, height: 800 }, isMobile: !!opsi.hp, hasTouch: !!opsi.hp, reducedMotion: opsi.diam ? "reduce" : "no-preference", permissions: ["clipboard-read", "clipboard-write"], javaScriptEnabled: opsi.js !== false });
  const p = await ctx.newPage(); const galat = [];
  p.on("pageerror", (e) => galat.push(String(e)));
  await p.goto("http://127.0.0.1:8766/index.html" + (opsi.q || ""), { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  return { p, ctx, galat };
}
// 1. Desktop ID: tab, salin, awalan
{
  const { p, ctx, galat } = await halaman();
  cek("tanpa galat JavaScript", galat.length === 0, galat.join("; "));
  cek("huruf gunting terpasang", await p.evaluate(() => document.documentElement.classList.contains("vbk-gunting-siap")));
  cek("panel 2 tersembunyi awal", await p.evaluate(() => document.getElementById("vbk-panel-2").hidden));
  await p.click("#vbk-tab-2");
  cek("klik tab 2 menampilkan panel 2", await p.evaluate(() => !document.getElementById("vbk-panel-2").hidden && document.getElementById("vbk-panel-1").hidden));
  await p.focus("#vbk-tab-2"); await p.keyboard.press("ArrowLeft");
  cek("panah kiri kembali ke tab 1", await p.evaluate(() => document.activeElement.id === "vbk-tab-1" && !document.getElementById("vbk-panel-1").hidden));
  await p.click('[data-salin="#vbk-curl-1"]');
  await p.waitForTimeout(150);
  const papan = await p.evaluate(() => navigator.clipboard.readText());
  const asli = await p.evaluate(() => document.getElementById("vbk-curl-1").textContent);
  cek("salin curl 1 persis", papan === asli && papan.startsWith("curl -X POST"), JSON.stringify(papan.slice(0, 40)));
  cek("tombol berubah 'Tersalin'", await p.evaluate(() => document.querySelector('[data-salin="#vbk-curl-1"]').classList.contains("vbk-tersalin")));
  cek("pengumuman aria-live", (await p.textContent("#vbk-umum")).includes("Tersalin"));
  const uji = [["ab", "pendek"], ["qa--signup", "dempet"], ["-qa", "ujung"], ["qa signup", "huruf"], ["a".repeat(21), "panjang"], ["qa-signup", "pas"], ["Uji.Login_2", "pas"]];
  for (const [v, harap] of uji) {
    await p.fill("#vbk-awalan-isi", v);
    const st = await p.evaluate(() => { const s = document.querySelector("[data-awalan-status]"); return { teks: s.querySelector('[lang="id"]').textContent, pas: s.classList.contains("vbk-pas") }; });
    const peta = { pendek: "Terlalu pendek", dempet: "Dua tanda", ujung: "Karakter pertama", huruf: "Hanya huruf", panjang: "Terlalu panjang", pas: "Panjangnya pas" };
    cek(`awalan "${v.length > 12 ? v.slice(0, 12) + "…" : v}" → ${harap}`, st.teks.startsWith(peta[harap]) && st.pas === (harap === "pas"), st.teks);
  }
  cek("kotak +n saat lebih dari 20", await p.evaluate(() => { const i = document.getElementById("vbk-awalan-isi"); i.value = "a".repeat(24); i.dispatchEvent(new Event("input")); return document.querySelector(".vbk-lebih")?.textContent === "+4"; }));
  await p.fill("#vbk-awalan-isi", "uji-login");
  cek("pratinjau memakai akhiran acak", (await p.textContent("[data-pratinjau-alamat]")) === "uji-login.<acak>@kotak.venbeemail.com", await p.textContent("[data-pratinjau-alamat]"));
  cek("resi address ikut berubah", (await p.textContent('[data-resi="address"]')) === "uji-login.<acak>@kotak.venbeemail.com");
  await p.click('.vbk-perangko[data-domain="pos.venbeemail.com"]');
  await p.waitForTimeout(150);
  cek("perangko pos dipilih", await p.evaluate(() => document.querySelector('.vbk-perangko[data-domain="pos.venbeemail.com"]').getAttribute("aria-pressed") === "true" && document.querySelectorAll('.vbk-perangko[aria-pressed="true"]').length === 1));
  cek("perangko menyalin domain", (await p.evaluate(() => navigator.clipboard.readText())) === "pos.venbeemail.com");
  cek("pratinjau ikut domain perangko", (await p.textContent("[data-pratinjau-alamat]")).endsWith("@pos.venbeemail.com"));
  cek("label amplop footer (AW4)", await p.evaluate(() => { const l = document.querySelector("[data-label-amplop]"); return !l.hidden && l.querySelector('[lang="id"] b').textContent === "uji-login.<acak>@pos.venbeemail.com"; }));
  await p.click(".vbk-pil-bahasa");
  cek("ganti ke EN: lang, judul tab, label", await p.evaluate(() => document.documentElement.lang === "en" && document.title.includes("A test inbox") && document.querySelector(".vbk-pil-bahasa").getAttribute("aria-label").startsWith("Switch")));
  cek("teks EN tampil, ID tersembunyi", await p.evaluate(() => getComputedStyle(document.querySelector('.vbk-hero-k1 [lang="en"]')).display !== "none" && getComputedStyle(document.querySelector('.vbk-hero-k1 [lang="id"]')).display === "none"));
  cek("alt polaroid EN", (await p.getAttribute(".vbk-polaroid img", "alt")).startsWith("The VenbeeMail"));
  cek("tahun berjalan", (await p.textContent("[data-tahun-berjalan]")) === String(new Date().getFullYear()));
  await ctx.close();
}
// 2. pilihan bahasa diingat, ?lang=en, kunci lama bm-lang
{
  const { p, ctx } = await halaman({ q: "?lang=en" });
  cek("?lang=en memaksa EN", await p.evaluate(() => document.documentElement.getAttribute("data-bahasa") === "en"));
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem("bm-lang", "en"); });
  await p.goto("http://127.0.0.1:8766/index.html"); await p.waitForTimeout(200);
  cek("kunci lama bm-lang dihormati", await p.evaluate(() => document.documentElement.lang === "en"));
  await ctx.close();
}
// 3. HP: lembar menu, fokus, Esc
{
  const { p, ctx } = await halaman({ vp: { width: 390, height: 844 }, hp: true });
  await p.click(".vbk-menu-buka");
  cek("lembar menu terbuka", await p.evaluate(() => !document.getElementById("vbk-lembar").hidden && document.querySelector(".vbk-menu-buka").getAttribute("aria-expanded") === "true"));
  cek("fokus pindah ke lembar", await p.evaluate(() => document.getElementById("vbk-lembar").contains(document.activeElement)));
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  cek("fokus terkunci di lembar", await p.evaluate(() => document.getElementById("vbk-lembar").contains(document.activeElement)));
  await p.keyboard.press("Escape");
  cek("Esc menutup dan fokus kembali", await p.evaluate(() => document.getElementById("vbk-lembar").hidden && document.activeElement.classList.contains("vbk-menu-buka")));
  await p.click(".vbk-menu-buka"); await p.click('#vbk-lembar a[href="#api"]'); await p.waitForTimeout(400);
  cek("pilih tautan menutup lembar", await p.evaluate(() => document.getElementById("vbk-lembar").hidden));
  const lebar = await p.evaluate(() => document.documentElement.scrollWidth);
  cek("tanpa gulir menyamping di 390", lebar === 390, String(lebar));
  await ctx.close();
}
// 4. kurangi gerakan: tombol, setelan sistem
{
  const { p, ctx } = await halaman({ diam: true });
  cek("setelan sistem: html.vbk-diam, tombol menyala", await p.evaluate(() => document.documentElement.classList.contains("vbk-diam") && document.querySelector("[data-kurangi-gerak]").getAttribute("aria-pressed") === "true"));
  await ctx.close();
  const h2 = await halaman();
  await h2.p.evaluate(() => scrollTo(0, document.getElementById("domain").offsetTop + 10));
  await h2.p.waitForTimeout(200);
  await Promise.all([h2.p.waitForNavigation(), h2.p.click(".vbk-kaki-tombol [data-kurangi-gerak]")]);
  await h2.p.waitForTimeout(300);
  cek("tombol kurangi gerakan: simpan + muat ulang di bagian", await h2.p.evaluate(() => localStorage.getItem("vbk-kurangi-gerak") === "1" && document.documentElement.classList.contains("vbk-diam") && /#/.test(location.hash)), await h2.p.evaluate(() => location.hash));
  await h2.ctx.close();
}
// 5. tanpa JavaScript: semua isi tampil
{
  const { p, ctx } = await halaman({ js: false });
  cek("tanpa JS: panel 2 tampil, judul teks tampil", await p.evaluate(() => getComputedStyle(document.getElementById("vbk-panel-2")).display !== "none" && getComputedStyle(document.querySelector("#judul-cara")).fontSize !== ""));
  cek("tanpa JS: EN tersembunyi", await p.evaluate(() => getComputedStyle(document.querySelector('.vbk-hero-k1 [lang="en"]')).display === "none"));
  await ctx.close();
}
// 6. Fase 3: layar muat, hero, film, Lewati film, kartu bab (gerak diizinkan)
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const p = await ctx.newPage(); const galat = [];
  p.on("pageerror", (e) => galat.push(String(e)));
  await p.goto("http://127.0.0.1:8766/index.html", { waitUntil: "commit" });
  await p.waitForSelector("#vbk-muat", { state: "attached" });
  cek("layar muat menutup halaman di kunjungan pertama", await p.evaluate(() => document.documentElement.classList.contains("vbk-muat") || !!window.VBK_MUAT));
  await p.waitForFunction(() => window.VBK && VBK.gerakSiap, null, { timeout: 8000 });
  await p.waitForTimeout(2500);
  cek("layar muat selesai dan tersimpan di sesi", await p.evaluate(() => document.getElementById("vbk-muat").hidden && sessionStorage.getItem("vbk-muat") === "1"));
  cek("gerak.js jalan tanpa galat", galat.length === 0, galat.join("; "));
  cek("teks hero tampil sesudah intro", await p.evaluate(() => !document.documentElement.classList.contains("vbk-tunggu") && getComputedStyle(document.querySelector(".vbk-hero-k1")).opacity === "1"));
  cek("video hero dibuat sesudah load, tanpa suara", await p.evaluate(() => { const v = document.querySelector(".vbk-hero-latar video"); return !!v && v.muted && v.hasAttribute("playsinline") && /hero-1280\.(mp4|webm)$/.test(v.currentSrc); }));
  await p.click(".vbk-hero .vbk-jeda");
  cek("tombol jeda menjeda video dan disimpan", await p.evaluate(() => document.querySelector(".vbk-hero-latar video").paused && localStorage.getItem("vbk-jeda-video") === "1" && document.querySelector(".vbk-jeda").getAttribute("aria-pressed") === "true"));
  await p.click(".vbk-hero .vbk-jeda");
  const wajah = await p.evaluate(() => document.documentElement.dataset.wajah);
  await p.click(".vbk-menu-kiri .vbk-b-tombol");
  cek("huruf B berganti wajah", await p.evaluate((w) => document.documentElement.dataset.wajah !== w, wajah));
  cek("komik jadi keterangan tersembunyi, canvas film terpasang", await p.evaluate(() => document.querySelector(".vbk-film").classList.contains("vbk-film-siap") && document.querySelectorAll(".vbk-komik figcaption").length === 6 && !!document.querySelector(".vbk-film-kanvas")));
  const pin = await p.evaluate(() => { const st = ScrollTrigger.getAll().find((t) => t.pin && t.pin.classList.contains("vbk-film-pin")); return st ? { a: st.start, z: st.end } : null; });
  cek("film di-pin 600 persen di desktop", !!pin && Math.abs(pin.z - pin.a - 900 * 6) < 2, JSON.stringify(pin));
  const ke = async (t) => { await p.evaluate((y) => (window.VBK.lenis ? VBK.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), Math.round(pin.a + (pin.z - pin.a) * t)); await p.waitForTimeout(1300); };
  await ke(0.5);
  const isi = await p.evaluate(() => { const c = document.querySelector(".vbk-film-kanvas"), x = c.getContext("2d").getImageData(c.width / 2, c.height * 0.8, 1, 1).data; return { lebar: c.width, rgb: [x[0], x[1], x[2]] }; });
  cek("canvas menggambar bingkai adegan 3", isi.lebar > 0 && isi.rgb.some((v) => v > 40), JSON.stringify(isi));
  cek("garis rute: Dioper aktif di tengah film", await p.evaluate(() => document.querySelector(".vbk-frute-titik[aria-current]")?.textContent.includes("Dioper")));
  cek("monyet dan amplop estafet tampil", await p.evaluate(() => getComputedStyle(document.querySelector(".vbk-estafet")).visibility === "visible" && document.querySelector(".vbk-monyet-gambar").complete));
  cek("menu redup dan Lewati film tampil selama film", await p.evaluate(() => document.documentElement.classList.contains("vbk-film-aktif") && getComputedStyle(document.querySelector(".vbk-lewati")).visibility === "visible"));
  await p.click(".vbk-lewati"); await p.waitForTimeout(1800);
  cek("Lewati film membawa ke kartu bab", await p.evaluate(() => { const r = document.getElementById("bab-2").getBoundingClientRect(); return Math.abs(r.top) < 120 && document.activeElement.id === "bab-2"; }));
  await p.waitForTimeout(800);
  cek("cap kartu bab dihentakkan ke posisi akhir", await p.evaluate(() => getComputedStyle(document.querySelector(".vbk-cap")).opacity === "1"));
  await ctx.close();
  // kunjungan kedua di sesi yang sama: tanpa layar muat
  const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto("http://127.0.0.1:8766/index.html", { waitUntil: "networkidle" });
  await p2.evaluate(() => sessionStorage.setItem("vbk-muat", "1"));
  await p2.reload({ waitUntil: "commit" });
  await p2.waitForSelector("#vbk-muat", { state: "attached" });
  cek("kunjungan kedua: layar muat tidak tampil", await p2.evaluate(() => !document.documentElement.classList.contains("vbk-muat")));
  await ctx2.close();
}
// 7. Fase 3 di HP: set bingkai 405x720, pin 450 persen, tanpa gulir menyamping di dalam film
{
  const { p, ctx } = await halaman({ vp: { width: 390, height: 844 }, hp: true });
  await p.waitForFunction(() => window.VBK && VBK.gerakSiap, null, { timeout: 8000 });
  await p.waitForTimeout(1500);
  const pin = await p.evaluate(() => { const st = ScrollTrigger.getAll().find((t) => t.pin && t.pin.classList.contains("vbk-film-pin")); return st ? { a: st.start, z: st.end } : null; });
  cek("HP: film di-pin 450 persen", !!pin && Math.abs(pin.z - pin.a - 844 * 4.5) < 2, JSON.stringify(pin));
  await p.evaluate((y) => scrollTo(0, y), Math.round(pin.a + (pin.z - pin.a) * 0.5));
  await p.waitForTimeout(1500);
  cek("HP: bingkai dari set h", await p.evaluate(() => performance.getEntriesByType("resource").some((r) => /film\/h\/f3_\d{3}\.webp$/.test(r.name)) && !performance.getEntriesByType("resource").some((r) => /film\/d\//.test(r.name))));
  cek("HP: paling banyak dua monyet terlihat", await p.evaluate(() => [...document.querySelectorAll(".vbk-monyet")].filter((m) => { const r = m.getBoundingClientRect(); return r.right > 0 && r.left < innerWidth; }).length <= 2));
  cek("HP: tanpa gulir menyamping di tengah film", await p.evaluate(() => document.documentElement.scrollWidth === 390));
  await ctx.close();
}
// 8. kurangi gerakan: GSAP, video, dan layar muat tidak dimuat sama sekali
{
  const { p, ctx } = await halaman({ diam: true });
  cek("kurangi gerakan: tanpa GSAP, video, layar muat; komik tampil", await p.evaluate(() => !document.querySelector('script[src*="gsap"]') && !document.querySelector("video") && document.getElementById("vbk-muat").hidden && getComputedStyle(document.querySelector(".vbk-komik img")).display !== "none"));
  await ctx.close();
}
console.log(hasil.join("\n"));
const lolos = hasil.filter((h) => h.startsWith("LOLOS")).length;
console.log(`\n${lolos}/${hasil.length} lolos`);
await b.close();
process.exit(lolos === hasil.length ? 0 : 1);
