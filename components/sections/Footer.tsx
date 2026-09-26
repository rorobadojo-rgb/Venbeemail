"use client";

import { useEffect, useRef, useState } from "react";
import { ZombieLogo, type ZombieLogoHandle } from "@/components/logo/ZombieLogo";
import { AISLES, setAislesOff } from "@/lib/lights";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { SITE } from "@/lib/site";

/**
 * Closing time. When the footer comes into view the lights switch off aisle
 * by aisle (3D tubes and the page), then the logo sign blinks twice and
 * closes its eyes. Scroll back up and the shop opens again.
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const logo = useRef<ZombieLogoHandle>(null);
  const [off, setOff] = useState(0);
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const close = () => {
      clear();
      const step = prefersReducedMotion() ? 0 : 480;
      for (let k = 1; k <= AISLES; k++) {
        timers.push(
          window.setTimeout(() => {
            setAislesOff(k);
            setOff(k);
            play("switch", { rate: 1 - k * 0.04 });
          }, 250 + k * step),
        );
      }
      const end = 250 + AISLES * step + 300;
      timers.push(window.setTimeout(() => logo.current?.blink(), end));
      timers.push(window.setTimeout(() => logo.current?.blink(), end + 420));
      timers.push(window.setTimeout(() => setAsleep(true), end + 900));
    };
    const open = () => {
      clear();
      setAsleep(false);
      setAislesOff(0);
      setOff(0);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? close() : open()), { threshold: 0.45 });
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
      setAislesOff(0);
    };
  }, []);

  return (
    <footer ref={root} className="footer" data-off={off} aria-labelledby="tutup-title">
      <div className="footer__tubes" aria-hidden="true">
        {Array.from({ length: AISLES }, (_, i) => (
          <span key={i} className={`ftube${AISLES - 1 - i < off ? " is-off" : ""}`}>
            <span className="ftube__lamp" />
            <span className="ftube__label">LORONG {i + 1}</span>
          </span>
        ))}
      </div>
      <div className="footer__sign">
        <span className="footer__chain" aria-hidden="true" />
        <ZombieLogo ref={logo} className="footer__logo" sleeping={asleep} blink={!asleep} />
        <span className={`footer__zzz${asleep ? " is-on" : ""}`} aria-hidden="true">
          <span>Z</span>
          <span>z</span>
          <span>z</span>
        </span>
      </div>
      <h2 id="tutup-title" className="footer__closed">
        {asleep ? "Toko tutup. Sampai besok, zombie." : "Mau tutup nih..."}
      </h2>
      <nav className="footer__nav" aria-label="Navigasi bawah">
        <a href="#toko">Rak &amp; kasir</a>
        <a href="#kenapa">Kenapa</a>
        <a href="#cara">Cara kerja</a>
        <a href="#faq">Tanya kasir</a>
      </nav>
      <ul className="footer__socials" aria-label="Media sosial">
        {SITE.socials.map((s) => (
          <li key={s.id}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
      <p className="footer__fine">
        © {new Date().getFullYear()} {SITE.name} · Zombie Mart. Semua doodle, huruf dan suara dibuat khusus untuk toko ini.
      </p>
    </footer>
  );
}
