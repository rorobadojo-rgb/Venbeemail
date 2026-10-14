// Ukur muatan awal halaman (PRD 16.1): Chromium headless, tanpa menggulir,
// dari awal sampai event load ditambah 3 detik. Batas HP 2,5 MB, target 1,3 MB.
//
//     cd situs-pro-kong && python3 -m http.server 8766 &
//     node alat/ukur_muatan.mjs [url]
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs");
const url = process.argv[2] || "http://127.0.0.1:8766/index.html";
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}).catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }));
const PROFIL = {
  hp: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
};
const BATAS = { hp: 2.5e6, desktop: 3e6 };
let gagal = false;
for (const [nama, profil] of Object.entries(PROFIL)) {
  const ctx = await b.newContext(profil);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Network.enable");
  const berkas = new Map();
  cdp.on("Network.responseReceived", (e) => berkas.set(e.requestId, { url: e.response.url, byte: 0 }));
  cdp.on("Network.loadingFinished", (e) => { const f = berkas.get(e.requestId); if (f) f.byte = e.encodedDataLength; });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(3000);
  const daftar = [...berkas.values()].filter((f) => f.byte > 0).sort((a, z) => z.byte - a.byte);
  const jumlah = daftar.reduce((s, f) => s + f.byte, 0);
  console.log(`\n== ${nama}: ${(jumlah / 1e6).toFixed(2)} MB dalam ${daftar.length} berkas (batas ${(BATAS[nama] / 1e6).toFixed(1)} MB)`);
  for (const f of daftar.slice(0, 12)) console.log(`${String(Math.round(f.byte / 1024)).padStart(6)} KB  ${f.url.replace(/^https?:\/\/[^/]+\//, "")}`);
  if (jumlah > BATAS[nama]) gagal = true;
  await ctx.close();
}
await b.close();
process.exit(gagal ? 1 : 0);
