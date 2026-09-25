"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { Bubble } from "@/components/comic/Bubble";
import { ComicButton } from "@/components/comic/ComicButton";
import { Doodle } from "@/components/comic/Doodle";
import { Mascot } from "@/components/mascot/Mascot";
import { DomainFan } from "@/components/panels/DomainFan";
import { burst } from "@/lib/burst";
import { addressOf, copyText, mailActions, useMail, type Domain } from "@/lib/mail";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789.";
const LINES = {
  idle: "Pilih domain, terus pencet GENERATE!",
  generated: ["Nih, masih anget!", "Alamat baru, siap dipakai.", "Mantap. Kasih ke situs yang rewel itu."],
  copied: "Udah kesalin! Tempel di mana aja.",
  trashed: "Kresek! Udah dibuang. Bikin lagi?",
  empty: "Kosong nih. GENERATE dulu dong.",
};

export function GeneratorPanel() {
  const mail = useMail();
  const address = addressOf(mail);
  const panel = useRef<HTMLElement>(null);
  const localEl = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(LINES.idle);
  const [status, setStatus] = useState("");
  const lastSerial = useRef(0);

  // Draw the local part imperatively so the scramble never fights React.
  useEffect(() => {
    const el = localEl.current;
    if (!el) return;
    const final = mail.local ?? "";
    el.classList.toggle("is-empty", !mail.local);
    if (!mail.local) {
      el.textContent = "(kosong)";
      return;
    }
    const isNew = mail.serial !== lastSerial.current;
    lastSerial.current = mail.serial;
    if (!isNew || prefersReducedMotion()) {
      el.textContent = final;
      return;
    }
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const settled = Math.floor((frame / 14) * final.length);
      el.textContent = Array.from(final, (c, i) =>
        i < settled || c === "." ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0],
      ).join("");
      if (frame >= 14) {
        clearInterval(id);
        el.textContent = final;
      }
    }, 32);
    return () => {
      clearInterval(id);
      el.textContent = final;
    };
  }, [mail.local, mail.serial]);

  const onDomain = (d: Domain, from: HTMLElement) => {
    if (d !== mail.domain) mailActions.setDomain(d);
    play("klik");
    if (panel.current) burst(panel.current, from, { text: "KLIK!", color: "cream", particles: 8, size: 70 });
  };

  const onGenerate = (e: React.MouseEvent<HTMLElement>) => {
    mailActions.generate();
    play("pow");
    if (panel.current) burst(panel.current, e.currentTarget, { text: "POW!", star: true, color: "red", particles: 14, size: 120 });
    if (caption.current && !prefersReducedMotion()) {
      gsap.fromTo(caption.current, { scale: 0.92, rotation: -2 }, { scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1.2, 0.35)" });
    }
    setLine(LINES.generated[(Math.random() * LINES.generated.length) | 0]);
    setStatus("Alamat baru dibuat.");
  };

  const onCopy = async (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (!address) {
      setLine(LINES.empty);
      return;
    }
    const ok = await copyText(address);
    if (!ok) {
      setStatus("Gagal menyalin. Salin manual ya.");
      return;
    }
    play("ding");
    if (panel.current) burst(panel.current, target, { text: "TING!", color: "blue", particles: 10, size: 90 });
    caption.current?.classList.remove("is-copied");
    void caption.current?.offsetWidth;
    caption.current?.classList.add("is-copied");
    setLine(LINES.copied);
    setStatus(`${address} disalin ke clipboard.`);
  };

  const onTrash = (e: React.MouseEvent<HTMLElement>) => {
    if (!address) {
      setLine(LINES.empty);
      return;
    }
    play("crumple");
    if (panel.current) burst(panel.current, e.currentTarget, { text: "KRESEK!", color: "ink", particles: 12, size: 100 });
    const done = () => {
      mailActions.trash();
      setLine(LINES.trashed);
      setStatus("Alamat dibuang.");
    };
    const box = caption.current;
    if (!box || prefersReducedMotion()) return done();
    gsap
      .timeline({ onComplete: () => void gsap.set(box, { clearProps: "transform,opacity,filter" }) })
      .to(box, { scaleX: 0.7, scaleY: 0.55, rotation: -7, skewX: 8, duration: 0.12, ease: "power2.in" })
      .to(box, { scaleX: 0.35, scaleY: 0.4, rotation: 16, skewX: -12, filter: "brightness(.85)", duration: 0.12 })
      .to(box, { scale: 0.08, rotation: 190, y: 50, opacity: 0, duration: 0.22, ease: "power2.in" })
      .add(done)
      .fromTo(box, { scale: 0.6, rotation: 0, y: 0, opacity: 0, skewX: 0, filter: "none" }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" });
  };

  return (
    <article ref={panel} className="panel panel--gen" aria-labelledby="gen-title" data-fly="right">
      <div className="gen__lines" aria-hidden="true" />
      <Doodle name="lightning" className="gd gd--1" rotate={-12} />
      <Doodle name="at-blob" className="gd gd--2" rotate={10} extra />
      <Doodle name="eyeball" className="gd gd--3" rotate={-4} extra />
      <Doodle name="bone" className="gd gd--4" rotate={20} extra />

      <header className="gen__head">
        <p className="caption caption--red">Bab 2</p>
        <h2 id="gen-title" className="panel-title">Mesin Email Kilat</h2>
      </header>

      <div className="gen__machine">
        <DomainFan value={mail.domain} onChange={onDomain} />

        <div className="gadget">
          <span className="gadget__screw gadget__screw--tl" aria-hidden="true" />
          <span className="gadget__screw gadget__screw--tr" aria-hidden="true" />
          <span className="gadget__screw gadget__screw--bl" aria-hidden="true" />
          <span className="gadget__screw gadget__screw--br" aria-hidden="true" />
          <span className="gadget__antenna" aria-hidden="true" />

          <div className="gadget__top">
            <span className="gadget__plate">Venbee-o-matic 3000</span>
            <span className="gadget__led" aria-hidden="true" />
          </div>

          <div className="gadget__screen">
            <span className="gadget__screen-label" aria-hidden="true">
              Alamat kamu
            </span>
            <div ref={caption} className="address">
              <span ref={localEl} className="address__local" />
              <span key={mail.domain} className="address__domain">
                @{mail.domain}
              </span>
            </div>
          </div>

          <div className="gadget__buttons">
            <ComicButton variant="red" onClick={onGenerate}>
              Generate
            </ComicButton>
            <ComicButton variant="blue" onClick={onCopy} aria-label={address ? `Copy ${address}` : "Copy"}>
              Copy
            </ComicButton>
            <ComicButton variant="ink" onClick={onTrash}>
              Trash
            </ComicButton>
          </div>

          <div className="gadget__bottom" aria-hidden="true">
            <span className="gadget__grill" />
            <span className="gadget__model">Model VB-3000 · sekali pakai</span>
            <span className="gadget__knob" />
            <span className="gadget__knob gadget__knob--b" />
          </div>
        </div>
      </div>

      <aside className="gen__side">
        <div className="gen__narrator">
          <Bubble tail="bottom-right" className="gen__bubble">
            <span key={line} className="pop-in">
              {line}
            </span>
          </Bubble>
          <Mascot className="gen__bird" flip />
        </div>
        <ol className="steps">
          <li>
            <b>1.</b> Pilih stiker domain
          </li>
          <li>
            <b>2.</b> Pencet <em>GENERATE</em>
          </li>
          <li>
            <b>3.</b> <em>COPY</em>, tempel, beres
          </li>
        </ol>
      </aside>
      <p className="sr-only" role="status">
        {status}
      </p>
    </article>
  );
}
