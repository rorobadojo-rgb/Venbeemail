// Uji fungsi halaman di Chromium (Playwright): tab, salin, awalan, perangko,
// bahasa, menu HP, kurangi gerakan, tanpa JavaScript.
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
console.log(hasil.join("\n"));
const lolos = hasil.filter((h) => h.startsWith("LOLOS")).length;
console.log(`\n${lolos}/${hasil.length} lolos`);
await b.close();
process.exit(lolos === hasil.length ? 0 : 1);
