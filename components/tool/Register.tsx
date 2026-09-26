"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { KeyDoodle } from "@/components/sticker/Doodles";
import { StickerButton } from "@/components/sticker/StickerButton";
import { Vending } from "@/components/title/Vending";
import { activeInbox, addressOf, cleanLocalPart, copyText, generateLocalPart, inboxLink, mailActions, useMail } from "@/lib/mail";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { ExpiryLabel } from "./ExpiryLabel";

type Busy = null | "print" | "copy" | "drawer" | "delete" | "qr" | "random";
const LED: Record<Exclude<Busy, null> | "idle" | "empty", string> = {
  idle: "SIAP · Rp0",
  empty: "KOSONG · TEKAN GENERATE",
  print: "MENCETAK...",
  copy: "TERSALIN!",
  drawer: "CEK PAKET...",
  delete: "DIBUANG!",
  qr: "QR DICETAK",
  random: "MENGACAK...",
};

/** QR modules -> one SVG path (lazy: uqr is only loaded when QR is pressed). */
async function qrPath(text: string) {
  const { encode } = await import("uqr");
  const { data, size } = encode(text, { ecc: "M", border: 1 });
  let d = "";
  data.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return { d, size };
}

/**
 * The cash register: receipt printer, keypad of sticker keys, cash drawer,
 * a tiny vending machine for RANDOM and a bin for DELETE.
 */
export function Register() {
  const mail = useMail();
  const inbox = activeInbox(mail);
  const address = addressOf(inbox);
  const [busy, setBusy] = useState<Busy>(null);
  const [custom, setCustom] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [qr, setQr] = useState<{ d: string; size: number } | null>(null);
  const [status, setStatus] = useState("");
  const receipt = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const bin = useRef<HTMLDivElement>(null);
  const vending = useRef<HTMLDivElement>(null);
  const ticket = useRef<HTMLSpanElement>(null);
  const printed = useRef<string | null>(null);
  const reduce = () => prefersReducedMotion();

  const customValid = !custom || !!cleanLocalPart(custom);

  // a new address (or another basket) turns the receipt back to its front
  const printKey = `${inbox.id}:${inbox.serial}`;
  const [shownKey, setShownKey] = useState(printKey);
  if (shownKey !== printKey) {
    setShownKey(printKey);
    setFlipped(false);
    setQr(null);
  }

  // ...and feeds a fresh receipt out of the printer slot
  useEffect(() => {
    const el = receipt.current;
    if (!el || !mail.ready) return;
    const first = printed.current === null;
    if (printed.current === printKey) return;
    printed.current = printKey;
    if (first || reduce()) return;
    gsap.fromTo(el, { yPercent: -100 }, { yPercent: 0, duration: 0.9, ease: "steps(14)" });
  }, [printKey, mail.ready]);

  const done = (ms = 900) => window.setTimeout(() => setBusy(null), ms);

  const onGenerate = () => {
    if (custom && !customValid) {
      play("nope");
      toast("Username cuma boleh huruf, angka, titik, - dan _", "warn");
      return;
    }
    setBusy("print");
    mailActions.generate(custom || null);
    setCustom("");
    setStatus("Alamat baru dicetak.");
    done(1000);
  };

  const onCopy = async () => {
    if (!address) {
      play("nope");
      toast("Struknya kosong. GENERATE dulu!", "warn");
      return;
    }
    const ok = await copyText(address);
    if (!ok) {
      toast("Gagal menyalin, salin manual ya", "warn");
      return;
    }
    setBusy("copy");
    window.setTimeout(() => play("stamp"), 260);
    toast("TERSALIN!", "ok", 1600);
    setStatus(`${address} disalin ke clipboard.`);
    const el = receipt.current;
    const st = stamp.current;
    if (el && st && !reduce()) {
      gsap
        .timeline()
        .to(el, { y: 14, rotation: -3, duration: 0.12, ease: "power2.in" })
        .to(el, { y: 0, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })
        .fromTo(st, { scale: 2.4, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: -14, autoAlpha: 1, duration: 0.22, ease: "power4.in" }, 0.24)
        .to(st, { autoAlpha: 0, duration: 0.4 }, 1.8);
    } else if (st) {
      gsap.fromTo(st, { autoAlpha: 1 }, { autoAlpha: 0, delay: 1.4, duration: 0.3 });
    }
    done(1400);
  };

  const onRefresh = () => {
    setBusy("drawer");
    const d = drawer.current;
    if (d && !reduce()) gsap.timeline().to(d, { y: 26, duration: 0.25, ease: "power2.out" }).to(d, { y: 0, duration: 0.3, ease: "back.in(2)" }, 0.55);
    window.setTimeout(() => {
      const got = mailActions.refresh();
      if (!got) toast(address ? "Belum ada paket baru. Sabar, kurirnya zombie." : "Belum ada alamat. GENERATE dulu!", "info");
    }, 600);
    done(1000);
  };

  const onDelete = () => {
    if (!address) {
      play("nope");
      toast("Sudah kosong kok.", "info");
      return;
    }
    setBusy("delete");
    window.setTimeout(() => play("bin"), 520);
    const el = receipt.current;
    const b = bin.current;
    const finish = () => {
      mailActions.trash();
      setStatus("Alamat dibuang.");
      toast("Alamat dibuang ke tong sampah.", "info");
    };
    if (!el || !b || reduce()) {
      finish();
      done(600);
      return;
    }
    const er = el.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const dx = br.left + br.width / 2 - (er.left + er.width / 2);
    const dy = br.top + br.height * 0.3 - (er.top + er.height / 2);
    gsap
      .timeline({
        onComplete: () => {
          finish();
          gsap.set(el, { clearProps: "transform,borderRadius,opacity,filter" });
          gsap.fromTo(el, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: "steps(8)" });
        },
      })
      .to(el, { scaleX: 0.7, scaleY: 0.55, rotation: -8, skewX: 10, duration: 0.14, ease: "power2.in" })
      .to(el, { scaleX: 0.3, scaleY: 0.32, rotation: 30, skewX: -14, borderRadius: "40%", filter: "brightness(.85)", duration: 0.14 })
      .to(el, { scale: 0.12, rotation: 220, duration: 0.14 })
      .to(el, { x: dx, duration: 0.45, ease: "power1.inOut" })
      .to(el, { keyframes: [{ y: dy - 90, duration: 0.2, ease: "power2.out" }, { y: dy, duration: 0.25, ease: "power2.in" }] }, "<")
      .set(el, { opacity: 0 })
      .to(b, { keyframes: [{ rotation: -8, duration: 0.08 }, { rotation: 6, duration: 0.1 }, { rotation: 0, duration: 0.3, ease: "elastic.out(1, 0.3)" }] });
    done(1600);
  };

  const onQr = async () => {
    if (!address) {
      play("nope");
      toast("Belum ada alamat untuk di-QR-kan.", "warn");
      return;
    }
    if (flipped) {
      setFlipped(false);
      return;
    }
    setBusy("qr");
    const link = inboxLink(inbox) ?? address;
    setQr(await qrPath(link));
    setFlipped(true);
    setStatus("QR kode inbox dicetak di balik struk.");
    done(900);
  };

  const onRandom = () => {
    setBusy("random");
    const v = vending.current;
    v?.classList.add("is-spinning");
    const name = generateLocalPart();
    window.setTimeout(() => {
      v?.classList.remove("is-spinning");
      setCustom(name);
      setStatus(`Username acak: ${name}`);
      const t = ticket.current;
      if (t && !reduce()) gsap.fromTo(t, { y: -40, autoAlpha: 1, rotation: -30 }, { y: 0, rotation: 0, duration: 0.45, ease: "bounce.out" }).then(() => gsap.to(t, { autoAlpha: 0, duration: 0.3, delay: 0.4 }));
      toast(`Keluar dari mesin: ${name}`, "ok", 1800);
    }, 850);
    done(1300);
  };

  const led = busy ? LED[busy] : address ? LED.idle : LED.empty;

  return (
    <div className="register" aria-labelledby="kasir-title">
      <div className="register__top">
        <h3 id="kasir-title" className="register__title">
          Kasir 01
        </h3>
        <output className="register__led" aria-live="polite">
          {led}
        </output>
      </div>

      <div className="register__print">
        <div className="printer" role="group" aria-label="Struk alamat email">
          <span className="printer__slot" aria-hidden="true" />
          <div className="printer__feed">
            <div ref={receipt} className={`receipt${flipped ? " is-flipped" : ""}${address ? "" : " is-empty"}`}>
              <div className="receipt__card">
                <div className="receipt__face receipt__face--front" aria-hidden={flipped}>
                  <p className="rc-c rc-b">ZOMBIE MART · VENBEEMAIL</p>
                  <p className="rc-c rc-s">Jl. Kuburan Raya 13 · Buka 24 jam</p>
                  <p className="rc-row">
                    <span>KASIR</span>
                    <span>ZOMBI-01</span>
                  </p>
                  <p className="rc-row">
                    <span>STRUK</span>
                    <span>#{String(inbox.serial).padStart(5, "0")}</span>
                  </p>
                  <p className="rc-cut" aria-hidden="true" />
                  <p className="rc-label">ALAMAT SEMENTARA</p>
                  <p className="rc-address" data-testid="address">
                    {address ? (
                      <>
                        <span className="rc-local">{inbox.local}</span>
                        <span className="rc-domain">@{inbox.domain}</span>
                      </>
                    ) : (
                      <span className="rc-none">— kosong —</span>
                    )}
                  </p>
                  <p className="rc-cut" aria-hidden="true" />
                  <p className="rc-row">
                    <span>1x EMAIL SEMENTARA</span>
                    <span>Rp0</span>
                  </p>
                  <p className="rc-row">
                    <span>1x PRIVASI UTUH</span>
                    <span>Rp0</span>
                  </p>
                  <p className="rc-row rc-total">
                    <span>TOTAL</span>
                    <span>Rp0</span>
                  </p>
                  <span className="rc-barcode" aria-hidden="true" />
                  <p className="rc-c rc-s">TERIMA KASIH · JANGAN BALIK LAGI</p>
                </div>
                <div className="receipt__face receipt__face--back" aria-hidden={!flipped}>
                  <p className="rc-c rc-b">PINDAI = BUKA INBOX</p>
                  {qr ? (
                    <svg className="rc-qr" viewBox={`0 0 ${qr.size} ${qr.size}`} role="img" aria-label={`Kode QR untuk ${address}`} shapeRendering="crispEdges">
                      <rect width={qr.size} height={qr.size} fill="#FFFDF6" />
                      <path d={qr.d} fill="#0A0A0A" />
                    </svg>
                  ) : null}
                  <p className="rc-c rc-s">{address}</p>
                </div>
              </div>
              <span ref={stamp} className="receipt__stamp" aria-hidden="true">
                TERSALIN!
              </span>
            </div>
          </div>
        </div>
        <div className="register__side">
          <ExpiryLabel inbox={inbox} />
          <div ref={bin} className="bin" aria-hidden="true">
            <span className="bin__lid" />
            <span className="bin__can" />
          </div>
        </div>
      </div>

      <div className="register__custom">
        <label htmlFor="username" className="register__label">
          Username sendiri <span>(opsional)</span>
        </label>
        <div className="register__input-row">
          <span className="register__input-wrap">
            <input
              id="username"
              className="register__input"
              value={custom}
              onChange={(e) => setCustom(e.target.value.slice(0, 30))}
              onKeyDown={(e) => {
                if (e.key === "Enter") onGenerate();
              }}
              placeholder="mis. cilok.galak"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!customValid}
              aria-describedby="username-hint"
            />
            <span className="register__at">@{inbox.domain}</span>
            <span ref={ticket} className="register__ticket" aria-hidden="true" />
          </span>
          <div ref={vending} className="register__vm" aria-hidden="true">
            <Vending />
          </div>
        </div>
        <p id="username-hint" className={`register__hint${customValid ? "" : " is-bad"}`}>
          {customValid ? "Kosongkan untuk username acak. Enter = GENERATE." : "Huruf kecil, angka, titik, - dan _ saja (maks. 30)."}
        </p>
      </div>

      <div className="keypad" role="group" aria-label="Tombol kasir">
        <StickerButton label="GENERATE" color="red" effect="print" sound="printer" loading={busy === "print"} onClick={onGenerate} note="cetak alamat">
          <KeyDoodle icon="print" />
        </StickerButton>
        <StickerButton
          label="COPY"
          color="lime"
          effect="tear"
          sound="tear"
          success={busy === "copy" ? "TERSALIN!" : false}
          disabled={!address}
          onClick={onCopy}
          note="sobek & salin"
          aria-label={address ? `Copy ${address}` : "Copy"}
        >
          <KeyDoodle icon="copy" />
        </StickerButton>
        <StickerButton label="REFRESH" color="cyan" effect="drawer" sound="drawer" loading={busy === "drawer"} onClick={onRefresh} note="cek paket">
          <KeyDoodle icon="refresh" />
        </StickerButton>
        <StickerButton label="DELETE" color="pink" effect="crumple" sound="crumple" disabled={!address} onClick={onDelete} note="remas & buang">
          <KeyDoodle icon="delete" />
        </StickerButton>
        <StickerButton
          label="QR CODE"
          color="yellow"
          effect="flip"
          sound="flip"
          selected={flipped}
          selectedLabel="DIBALIK"
          disabled={!address}
          onClick={onQr}
          note={flipped ? "balik lagi" : "cetak di balik struk"}
          aria-pressed={flipped}
        >
          <KeyDoodle icon="qr" />
        </StickerButton>
        <StickerButton label="RANDOM" color="purple" effect="spin" sound="vending" loading={busy === "random"} onClick={onRandom} note="username acak">
          <KeyDoodle icon="random" />
        </StickerButton>
      </div>

      <div ref={drawer} className="register__drawer" aria-hidden="true">
        <span className="register__drawer-handle" />
        <span className="register__coins">Rp0 · Rp0 · Rp0</span>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </div>
  );
}
