"use client";

import { gsap } from "gsap";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject } from "react";
import { addressOf, type Inbox } from "@/lib/mailbox";
import { prefersReducedMotion } from "@/lib/motion";
import { qrMatrix } from "@/lib/qr";
import { play, stop, vary } from "@/lib/sound";
import { HandText, type HandTextHandle } from "./HandText";
import { HAND_TIP, ZombieHand } from "./ZombieHand";

export type NotaHandle = {
  /** COPY: rip the top sheet off, stamp the carbon "SUDAH DISALIN" */
  rip: () => Promise<void>;
  /** DELETE: crumple the nota and toss it in the basket */
  toss: () => Promise<void>;
  /** QR: flip the nota and draw the code on its back. Resolves to "showing back" */
  toggleQr: () => Promise<boolean>;
};

type Props = { inbox?: Inbox; inboxLink: string; onFlip?: (back: boolean) => void };

const SESSION_START = typeof window === "undefined" ? 0 : Date.now();
const written = new Set<string>();
const SPEED = 1150; // glyph units per second

const pad2 = (n: number) => String(n).padStart(2, "0");
const dateOf = (t: number) => {
  const d = new Date(t);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const notaNo = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String((h % 9000) + 1000);
};

type HandRefs = { root: RefObject<HTMLDivElement | null>; hand: RefObject<HTMLDivElement | null> };

/** Put the zombie hand's marker nib on a client-space point. */
function placeHand({ root, hand }: HandRefs, pt: { x: number; y: number } | null) {
  const r = root.current?.getBoundingClientRect();
  const h = hand.current;
  if (!r || !h || !pt) return;
  const s = h.getBoundingClientRect().width / HAND_TIP.box || 1;
  gsap.set(h, { x: pt.x - r.left - HAND_TIP.x * s, y: pt.y - r.top - HAND_TIP.y * s });
}

// ------------------------------------------------------------------- page
type PageHandle = { rip: () => Promise<void> };

const NotaPage = forwardRef<PageHandle, { inbox: Inbox; hands: HandRefs }>(function NotaPage({ inbox, hands }, ref) {
  const key = `${inbox.id}:${inbox.serial}`;
  const [fresh] = useState(() => !written.has(key) && inbox.createdAt >= SESSION_START);
  const [ripped, setRipped] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const copied = useRef<HTMLDivElement>(null);
  const front = useRef<(HandTextHandle | null)[]>([]);
  const carbon = useRef<(HandTextHandle | null)[]>([]);

  const segments = useMemo(
    () => [
      { text: dateOf(inbox.createdAt), px: 34, slot: "date" },
      { text: "1", px: 44, slot: "qty" },
      { text: inbox.local, px: 50, slot: "local" },
      { text: `@${inbox.domain}`, px: 42, slot: "domain" },
      { text: "Rp 0", px: 34, slot: "price" },
      { text: "10 menit", px: 42, slot: "time" },
    ],
    [inbox.createdAt, inbox.local, inbox.domain],
  );

  // the zombie hand writes the nota (only for a brand-new address)
  useEffect(() => {
    written.add(key);
    if (!fresh) return;
    const reduce = prefersReducedMotion();
    if (reduce) {
      segments.forEach((_, k) => {
        front.current[k]?.setLength(Infinity);
        carbon.current[k]?.setLength(Infinity);
      });
      play("stamp");
      return;
    }
    const h = hands.hand.current;
    const tl = gsap.timeline();
    tl.fromTo(stamp.current, { scale: 2.4, opacity: 0, rotation: -16 }, { scale: 1, opacity: 0.94, rotation: -5, duration: 0.2, ease: "power4.in" }, 0.15)
      .add(() => play("stamp"), 0.35);
    if (h) {
      const start = front.current[0]?.tipAt(0);
      tl.add(() => {
        placeHand(hands, start ? { x: start.x + 160, y: start.y - 60 } : null);
      }, 0.3)
        .to(h, { opacity: 1, duration: 0.2 }, 0.3);
    }
    let at = 0.45;
    segments.forEach((_, k) => {
      const f = front.current[k];
      const c = carbon.current[k];
      if (!f) return;
      const hop = { t: 0, fx: NaN, fy: 0, tx: 0, ty: 0 };
      // lift the pen over to where this segment starts
      tl.to(hop, {
        t: 1, duration: 0.16, ease: "power1.inOut",
        onStart() {
          const from = h?.getBoundingClientRect();
          const to = f.tipAt(0);
          if (!from || !to) return;
          const s = from.width / HAND_TIP.box;
          Object.assign(hop, { fx: from.left + HAND_TIP.x * s, fy: from.top + HAND_TIP.y * s, tx: to.x, ty: to.y });
        },
        onUpdate() {
          if (Number.isNaN(hop.fx)) return;
          placeHand(hands, { x: hop.fx + (hop.tx - hop.fx) * hop.t, y: hop.fy + (hop.ty - hop.fy) * hop.t - Math.sin(Math.PI * hop.t) * 14 });
        },
      }, at);
      at += 0.16;
      const prog = { len: 0 };
      const dur = Math.min(1.8, Math.max(0.2, f.total / SPEED));
      let pen: number | undefined;
      tl.to(prog, {
        len: f.total, duration: dur, ease: "none",
        onStart: () => void (pen = play("pen", { rate: vary(0.2), volume: 0.8 })),
        onUpdate: () => {
          f.setLength(prog.len);
          c?.setLength(prog.len);
          placeHand(hands, f.tipAt(prog.len));
        },
        onComplete: () => stop(pen),
      }, at);
      at += dur + 0.08;
    });
    if (h) tl.to(h, { x: "+=180", y: "+=90", opacity: 0, duration: 0.45, ease: "power2.in" }, at + 0.1);
    return () => {
      tl.kill();
      if (h) gsap.set(h, { opacity: 0 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    rip: async () => {
      const reduce = prefersReducedMotion();
      if (!ripped) {
        play("rip", { rate: vary(0.1) });
        if (!reduce && body.current) {
          await new Promise<void>((done) =>
            gsap.timeline({ onComplete: done })
              .to(body.current, { rotation: -3, y: -5, duration: 0.1, transformOrigin: "0% 0%" })
              .to(body.current, { x: 320, y: -180, rotation: 34, opacity: 0, duration: 0.5, ease: "power2.in" }),
          );
        }
        setRipped(true);
      }
      await new Promise((r) => setTimeout(r, 30));
      if (copied.current) {
        if (reduce) gsap.set(copied.current, { opacity: 0.92, scale: 1 });
        else gsap.fromTo(copied.current, { scale: 2.2, opacity: 0, rotation: 4 }, { scale: 1, opacity: 0.92, rotation: -8, duration: 0.18, ease: "power4.in" });
      }
      setTimeout(() => play("stamp", { rate: 0.9 }), reduce ? 0 : 170);
    },
  }));

  const drawn = !fresh || prefersReducedMotion();
  const sheet = (which: "front" | "carbon") => {
    const refs = which === "front" ? front : carbon;
    const hand = (k: number) => (
      <HandText
        ref={(el) => void (refs.current[k] = el)}
        text={segments[k].text}
        px={segments[k].px}
        drawn={drawn}
        className={which === "carbon" ? "hand--carbon" : ""}
      />
    );
    return (
      <>
        <div className="nota__head">
          {which === "front" ? (
            <div ref={stamp} className="nota__stamp" style={drawn ? undefined : { opacity: 0 }}>
              <span>WARUNG VENBEE</span>
              <small>pasar malam · email sementara</small>
            </div>
          ) : (
            <div className="nota__stamp nota__stamp--carbon">
              <span>WARUNG VENBEE</span>
              <small>pasar malam · email sementara</small>
            </div>
          )}
          <div className="nota__no">
            NOTA <b>No. {notaNo(inbox.id + inbox.serial)}</b>
          </div>
        </div>
        <div className="nota__line">
          <span className="nota__print">Tgl:</span> {hand(0)}
        </div>
        <div className="nota__table" role="presentation">
          <span className="nota__print nota__th">Banyak</span>
          <span className="nota__print nota__th">Nama barang</span>
          <span className="nota__print nota__th">Jumlah</span>
          <span className="nota__td nota__td--qty">{hand(1)}</span>
          <span className="nota__td nota__td--item">
            {hand(2)}
            {hand(3)}
          </span>
          <span className="nota__td nota__td--price">{hand(4)}</span>
        </div>
        <div className="nota__line nota__line--time">
          <span className="nota__print">Sisa waktu:</span> {hand(5)}
        </div>
        <p className="nota__print nota__small">Barang yang sudah dibeli boleh dibuang.</p>
      </>
    );
  };

  const address = addressOf(inbox);
  return (
    <div className="nota__page">
      <span className="sr-only">
        Nota Warung Venbee: alamat {address}, tanggal {dateOf(inbox.createdAt)}, sisa waktu awal 10 menit.
      </span>
      <div className="nota__carbon" aria-hidden="true">
        {sheet("carbon")}
        <div ref={copied} className="nota__copied" style={{ opacity: 0 }}>
          SUDAH DISALIN
        </div>
      </div>
      <div className="nota__sheet" aria-hidden="true">
        <div className="nota__stub" />
        {!ripped && (
          <div ref={body} className="nota__body">
            {sheet("front")}
          </div>
        )}
      </div>
    </div>
  );
});

// ------------------------------------------------------------------- back
function NotaBack({ link, address, drawKey, hands, visible }: { link: string; address: string; drawKey: string; hands: HandRefs; visible: boolean }) {
  const matrix = useMemo(() => (link ? qrMatrix(link) : []), [link]);
  const n = matrix.length;
  const cells = useMemo(() => {
    const out: { x: number; y: number; j: number }[] = [];
    let seed = 17;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.12;
    matrix.forEach((row, y) => row.forEach((dark, x) => dark && out.push({ x: x + r(), y: y + r(), j: r() })));
    return out;
  }, [matrix]);
  const svg = useRef<SVGSVGElement>(null);
  const done = useRef<string | null>(null);

  useEffect(() => {
    const el = svg.current;
    if (!visible || !el || done.current === drawKey) return;
    done.current = drawKey;
    const rects = Array.from(el.querySelectorAll<SVGRectElement>("rect.qr__m"));
    if (prefersReducedMotion()) {
      rects.forEach((r) => (r.style.opacity = "1"));
      return;
    }
    rects.forEach((r) => (r.style.opacity = "0"));
    const h = hands.hand.current;
    const prog = { i: 0 };
    let shown = 0;
    const pen = play("pen", { rate: 1.2 });
    const tl = gsap.timeline({ onComplete: () => stop(pen) });
    if (h) tl.to(h, { opacity: 1, duration: 0.15 }, 0);
    tl.to(prog, {
      i: rects.length, duration: Math.min(2.4, 0.4 + rects.length * 0.0055), ease: "none",
      onUpdate: () => {
        const upto = Math.floor(prog.i);
        for (; shown < upto; shown++) rects[shown].style.opacity = "1";
        const cur = rects[Math.min(upto, rects.length - 1)]?.getBoundingClientRect();
        if (cur) placeHand(hands, { x: cur.left + cur.width / 2, y: cur.top + cur.height / 2 });
      },
    }, 0.05);
    if (h) tl.to(h, { x: "+=160", y: "+=80", opacity: 0, duration: 0.4, ease: "power2.in" });
    return () => {
      tl.kill();
      stop(pen);
      rects.forEach((r) => (r.style.opacity = "1"));
      if (h) gsap.set(h, { opacity: 0 });
    };
  }, [visible, drawKey, hands]);

  return (
    <div className="nota__back-inner">
      <p className="nota__back-title">Scan buat buka inbox di HP</p>
      {n > 0 && (
        <svg ref={svg} className="qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label={`Kode QR untuk ${address}`}>
          <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#FFFDF4" />
          {cells.map((c, k) => (
            <rect key={k} className="qr__m" x={c.x} y={c.y} width={1.02} height={1.02} rx={0.18} transform={`rotate(${c.j * 40} ${c.x + 0.5} ${c.y + 0.5})`} />
          ))}
        </svg>
      )}
      <p className="nota__back-addr">{address}</p>
    </div>
  );
}

// ------------------------------------------------------------------ basket
const Basket = forwardRef<HTMLDivElement, { balls: number }>(function Basket({ balls }, ref) {
  return (
    <div ref={ref} className="basket" aria-hidden="true">
      <div className="basket__balls">
        {Array.from({ length: Math.min(balls, 3) }, (_, k) => (
          <span key={k} className="basket__ball" style={{ ["--k" as string]: k }} />
        ))}
      </div>
      <svg viewBox="0 0 120 90" focusable="false">
        <defs>
          <pattern id="weave" width="16" height="12" patternUnits="userSpaceOnUse">
            <rect width="16" height="12" fill="#B9844A" />
            <path d="M0 3h8M8 9h8" stroke="#E1B878" strokeWidth="5" />
            <path d="M0 3h8M8 9h8" stroke="#7A4E22" strokeWidth="1" strokeDasharray="1 3" />
            <path d="M8 0v12M0 0v12" stroke="#6B421B" strokeWidth="1.2" />
          </pattern>
        </defs>
        <path d="M8 22H112L100 84C99 88 96 90 92 90H28C24 90 21 88 20 84Z" fill="url(#weave)" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="4" y="14" width="112" height="12" rx="6" fill="#D39B58" stroke="#0A0A0A" strokeWidth="3.5" />
        <path d="M14 20h92" stroke="#F0C58A" strokeWidth="3" strokeLinecap="round" />
        <text x="60" y="64" textAnchor="middle" className="basket__word">SAMPAH</text>
      </svg>
    </div>
  );
});

// -------------------------------------------------------------------- nota
/** The warung nota book with a pink carbon copy, a zombie hand and a basket. */
export const Nota = forwardRef<NotaHandle, Props>(function Nota({ inbox, inboxLink, onFlip }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<HTMLDivElement>(null);
  const hand = useRef<HTMLDivElement>(null);
  const basket = useRef<HTMLDivElement>(null);
  const page = useRef<PageHandle>(null);
  const hands = useMemo<HandRefs>(() => ({ root, hand }), []);
  const [back, setBack] = useState(false);
  const [balls, setBalls] = useState(0);
  const key = inbox ? `${inbox.id}:${inbox.serial}` : "empty";
  const [shownKey, setShownKey] = useState(key);

  // a different address: face the front again
  if (shownKey !== key) {
    setShownKey(key);
    if (back) setBack(false);
  }
  useEffect(() => {
    if (!flip.current) return;
    gsap.set(flip.current, { rotationY: 0 });
    onFlip?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const flipTo = (toBack: boolean) =>
    new Promise<void>((done) => {
      setBack(toBack);
      onFlip?.(toBack);
      const f = flip.current;
      if (!f || prefersReducedMotion()) {
        if (f) gsap.set(f, { rotationY: toBack ? 180 : 0 });
        done();
        return;
      }
      play("unwrap", { rate: 1.3, volume: 0.6 });
      gsap.to(f, { rotationY: toBack ? 180 : 0, duration: 0.6, ease: "power2.inOut", onComplete: done });
    });

  useImperativeHandle(ref, () => ({
    rip: async () => {
      if (back) await flipTo(false);
      await page.current?.rip();
    },
    toss: async () => {
      const f = flip.current;
      const b = basket.current;
      play("crumple", { rate: vary(0.1) });
      if (!f || !b || prefersReducedMotion()) {
        setBalls((n) => n + 1);
        return;
      }
      const fr = f.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const dx = br.left + br.width / 2 - (fr.left + fr.width / 2);
      const dy = br.top + br.height * 0.25 - (fr.top + fr.height / 2);
      const disp = document.querySelector("#crumple feDisplacementMap");
      await new Promise<void>((done) => {
        const tl = gsap.timeline({ onComplete: done });
        tl.set(f, { filter: "url(#crumple)" })
          .to(f, { scale: 0.92, rotation: -5, duration: 0.08 })
          .to(f, { scale: 0.22, rotation: 200, borderRadius: "46%", duration: 0.5, ease: "power2.in" }, 0.08);
        if (disp) tl.fromTo(disp, { attr: { scale: 0 } }, { attr: { scale: 70 }, duration: 0.5 }, 0.05);
        tl.add(() => play("toss", { rate: vary(0.1) }), 0.55)
          .to(f, { x: dx, duration: 0.6, ease: "none" }, 0.58)
          .to(f, { y: dy - 140, duration: 0.3, ease: "power2.out" }, 0.58)
          .to(f, { y: dy, duration: 0.3, ease: "power2.in" }, 0.88)
          .set(f, { opacity: 0 })
          .add(() => setBalls((n) => n + 1))
          .to(b, { keyframes: [{ rotation: -6, y: 3, duration: 0.08 }, { rotation: 5, duration: 0.1 }, { rotation: -2, duration: 0.1 }, { rotation: 0, y: 0, duration: 0.2 }] });
      });
      // the next sheet slides in once the store has moved on
      requestAnimationFrame(() => {
        gsap.set(f, { clearProps: "filter,borderRadius", x: 0, y: -24, scale: 1, rotation: 0, rotationY: 0 });
        gsap.to(f, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(1.6)" });
      });
      setBack(false);
    },
    toggleQr: async () => {
      const next = !back;
      await flipTo(next);
      return next;
    },
  }));

  return (
    <div className="nota-stand">
      <div ref={root} className={`nota${back ? " is-back" : ""}${inbox ? "" : " is-empty"}`}>
        <div ref={flip} className="nota__flip">
          <div className="nota__face nota__face--front" aria-hidden={back}>
            <div className="nota__pad" aria-hidden="true" />
            {inbox ? (
              <NotaPage key={key} ref={page} inbox={inbox} hands={hands} />
            ) : (
              <div className="nota__page nota__page--empty">
                <div className="nota__sheet">
                  <div className="nota__stub" />
                  <div className="nota__body">
                    <div className="nota__head">
                      <div className="nota__stamp nota__stamp--faded">
                        <span>WARUNG VENBEE</span>
                        <small>pasar malam · email sementara</small>
                      </div>
                    </div>
                    <p className="nota__hint">Belum ada nota. Pilih kantong sirup, lalu ketok papan GENERATE.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="nota__face nota__face--back" aria-hidden={!back}>
            {inbox && <NotaBack link={inboxLink} address={addressOf(inbox)} drawKey={key} hands={hands} visible={back} />}
          </div>
        </div>
        <ZombieHand ref={hand} />
      </div>
      <Basket ref={basket} balls={balls} />
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <filter id="crumple">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
});
