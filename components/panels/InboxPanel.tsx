"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { Bubble } from "@/components/comic/Bubble";
import { Doodle } from "@/components/comic/Doodle";
import { Mascot } from "@/components/mascot/Mascot";
import { burst } from "@/lib/burst";
import type { DoodleName } from "@/lib/doodleAtlas.generated";
import { addressOf, useMail } from "@/lib/mail";
import { prefersReducedMotion } from "@/lib/motion";
import { onStepChange } from "@/lib/nav";
import { play } from "@/lib/sound";

type FakeMail = { from: string; subject: string; body: string; sender: DoodleName; spam?: boolean; tag?: string };

const MAILS: FakeMail[] = [
  { from: "Forum Kucing Oren", subject: "Kode verifikasi: 482 913", body: "Masukin kode ini dalam 10 menit. Meong.", sender: "at-blob", tag: "OTP" },
  { from: "Toko Sendal Jepit", subject: "Selamat datang! Voucher 10% buat kamu", body: "Klik buat aktifin akun kamu…", sender: "mail-monster" },
  { from: "PANGERAN KAYA RAYA", subject: "ANDA MENANG 1 MILIAR!!! KLIK SEKARANG", body: "Transfer biaya admin dulu ya…", sender: "bomb", spam: true },
  { from: "Grup Arisan RT 05", subject: "Link arisan malam ini", body: "Jangan lupa bawa gorengan.", sender: "ghost-grin" },
];

const CAPTIONS = ["Pagi itu…", "Tak lama kemudian…", "Tiba-tiba!", "Akhirnya…"];
const LIFETIME = 10 * 60; // seconds, demo only

function useCountdown(createdAt: number, running: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [running]);
  if (!createdAt || !now) return "10:00";
  const left = LIFETIME - (Math.floor((now - createdAt) / 1000) % LIFETIME);
  return `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
}

export function InboxPanel() {
  const mail = useMail();
  const address = addressOf(mail);
  const panel = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  const timer = useCountdown(mail.createdAt, active && !!address);

  // Active = the inbox is on camera. Cinematic mode reports it through the
  // step bus (the panel is mid-flight while it intersects); flow mode uses IO.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const cinematic = () => document.documentElement.dataset.mode === "cinematic";
    const off = onStepChange((s) => {
      if (cinematic()) setActive(s >= 3);
    });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!cinematic()) setActive(e.isIntersecting);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      off();
      io.disconnect();
    };
  }, []);

  // Drop the speech bubbles in whenever the inbox comes on camera or a new
  // address is generated.
  useEffect(() => {
    const el = panel.current;
    if (!el || !active || !address) return;
    const bubbles = gsap.utils.toArray<HTMLElement>(".mailb", el);
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.set(bubbles, { clearProps: "all" });
      bubbles.forEach((b) => b.classList.remove("is-zapped"));
      if (reduce) {
        gsap.set(bubbles, { autoAlpha: 1 });
        bubbles.forEach((b) => b.dataset.spam && b.classList.add("is-zapped"));
        setCount(MAILS.length - 1);
        return;
      }
      setCount(0);
      const tl = gsap.timeline({ delay: 0.35 });
      bubbles.forEach((b, i) => {
        const at = i * 0.85;
        tl.fromTo(
          b,
          { yPercent: -190, rotation: gsap.utils.random(-14, 14), autoAlpha: 0 },
          { yPercent: 0, rotation: i % 2 ? 1.5 : -1.5, autoAlpha: 1, duration: 0.75, ease: "bounce.out" },
          at,
        ).call(
          () => {
            play("pop", { rate: 0.9 + i * 0.08 });
            setCount((c) => c + 1);
          },
          undefined,
          at + 0.12,
        );
        if (b.dataset.spam) {
          tl.call(
            () => {
              play("zap");
              burst(el, b, { text: "ZAP!", color: "blue", star: true, particles: 12, size: 110 });
              b.classList.add("is-zapped");
              setCount((c) => c - 1);
            },
            undefined,
            at + 1.1,
          );
        }
      });
    }, el);
    return () => ctx.revert();
  }, [active, address, mail.serial, run]);

  return (
    <article ref={panel} className="panel panel--inbox" aria-labelledby="inbox-title" data-fly="top-right">
      <Doodle name="crown" className="id id--1" rotate={-12} extra />
      <Doodle name="ghost-drip" className="id id--2" rotate={8} />

      <header className="inbox__head">
        <div>
          <p className="caption caption--blue">Bab 4 · Demo</p>
          <h2 id="inbox-title" className="panel-title">Kotak masuk</h2>
        </div>
        <dl className="inbox__meta">
          <div>
            <dt>Alamat</dt>
            <dd className="inbox__addr">{address ?? "— belum ada —"}</dd>
          </div>
          <div>
            <dt>Hilang dalam</dt>
            <dd className="inbox__timer">{address ? timer : "--:--"}</dd>
          </div>
          <div>
            <dt>Surat</dt>
            <dd className="inbox__count">{address ? count : 0}</dd>
          </div>
        </dl>
      </header>

      {address ? (
        <ol className="strip" aria-label="Surat masuk (contoh)">
          {MAILS.map((m, i) => (
            <li key={m.subject} className={`strip__frame strip__frame--${i}`}>
              <span className="strip__cap" aria-hidden="true">
                {CAPTIONS[i]}
              </span>
              <div className="mailb" data-spam={m.spam ? "1" : undefined}>
                <p className="mailb__from">
                  {m.from}
                  {m.tag && <span className="mailb__tag">{m.tag}</span>}
                </p>
                <p className="mailb__subject">{m.subject}</p>
                <p className="mailb__body">{m.body}</p>
                {m.spam && (
                  <span className="mailb__stamp" aria-label="Ditandai spam dan dibuang">
                    Spam dibuang
                  </span>
                )}
              </div>
              <Doodle name={m.sender} className="strip__sender" rotate={i % 2 ? 6 : -6} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="strip strip--empty">
          <p className="sfx">Sepi…</p>
          <p>Belum ada alamat. Balik ke mesin, pencet GENERATE.</p>
        </div>
      )}

      <footer className="inbox__foot">
        <div className="inbox__narrator">
          <Mascot className="inbox__bird" />
          <Bubble tail="left">Surat masuk langsung nongol di sini. Spam? Langsung ZAP!</Bubble>
        </div>
        <button type="button" className="chip" onClick={() => setRun((r) => r + 1)} disabled={!address}>
          ↻ Putar ulang
        </button>
      </footer>
    </article>
  );
}
