"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { bus } from "@/lib/bus";
import { SITE } from "@/lib/site";
import { BulbString } from "../hero/BulbString";
import { ZombieLogo } from "../logo/ZombieLogo";

const KIOSKS = ["SATE", "ES CAMPUR", "CILOK", "MARTABAK"];

/**
 * Closing time. When the footer comes into view the stalls roll their
 * shutters down one by one, the bulbs switch off, and the logo banner blinks
 * and closes its eyes. Scroll back up and the market opens again.
 */
export function ClosingFooter() {
  const ref = useRef<HTMLElement>(null);
  const [closed, setClosed] = useState(false);
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const shut = e.intersectionRatio >= 0.45;
        setClosed(shut);
        if (!shut) setAsleep(false);
      },
      { threshold: [0, 0.45, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    bus.emit("closing", { amount: closed ? 1 : 0 });
    if (!closed) return;
    const t = setTimeout(() => setAsleep(true), 1900);
    return () => clearTimeout(t);
  }, [closed]);

  return (
    <footer ref={ref} className={`closing${closed ? " is-closed" : ""}`}>
      <BulbString count={18} sag={34} off={closed} className="closing__bulbs" />
      <div className="closing__row" aria-hidden="true">
        {KIOSKS.slice(0, 2).map((name, k) => (
          <div key={name} className="kiosk" style={{ "--k": k } as CSSProperties}>
            <div className="kiosk__roof" />
            <div className="kiosk__sign">{name}</div>
            <div className="kiosk__body">
              <div className="kiosk__shutter" />
            </div>
          </div>
        ))}
        <div className="kiosk kiosk--main" style={{ "--k": 4 } as CSSProperties}>
          <div className="kiosk__roof" />
          <div className="closing__banner">
            <ZombieLogo sleeping={asleep} label="Logo VenbeeMail" />
          </div>
        </div>
        {KIOSKS.slice(2).map((name, k) => (
          <div key={name} className="kiosk" style={{ "--k": k + 2 } as CSSProperties}>
            <div className="kiosk__roof" />
            <div className="kiosk__sign">{name}</div>
            <div className="kiosk__body">
              <div className="kiosk__shutter" />
            </div>
          </div>
        ))}
      </div>
      <div className="closing__text">
        <p className="closing__big">{closed ? "Pasar sudah tutup." : "Pasar masih buka."}</p>
        <p>Lilin padam, lapak digulung. Sampai jumpa besok malam, bawa alamat baru.</p>
        <nav className="closing__nav" aria-label="Tautan bawah">
          <a href="#alat">Ambil alamat</a>
          <a href="#how-title">Cara kerja</a>
          <a href="#faq-title">Tanya-jawab</a>
        </nav>
        <p className="closing__copy">© 2026 {SITE.name}. Email sementara, dijual di pasar malam.</p>
      </div>
    </footer>
  );
}
