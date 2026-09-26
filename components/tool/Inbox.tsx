"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import type { Letter } from "@/lib/fakeMail";
import { prefersReducedMotion } from "@/lib/motion";
import { play, vary } from "@/lib/sound";

type Props = {
  id: string;
  labelledBy: string;
  letters: Letter[];
  spamFilter: boolean;
  openId: string | null;
  arrived: Set<string>;
  expired: boolean;
  hasInbox: boolean;
  onOpen: (id: string | null) => void;
  onDownload: (l: Letter) => void;
};

const time = (t: number) => new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

function Parcel({ letter, open, arriving, onOpen, onDownload }: { letter: Letter; open: boolean; arriving: boolean; onOpen: (id: string | null) => void; onDownload: (l: Letter) => void }) {
  const root = useRef<HTMLLIElement>(null);
  const leaf = useRef<HTMLSpanElement>(null);
  const [unwrapped, setUnwrapped] = useState(letter.read);

  // new letters slide across the counter
  useLayoutEffect(() => {
    if (!arriving || !root.current || prefersReducedMotion()) return;
    gsap.fromTo(root.current, { x: "105%", rotation: 5, opacity: 0.4 }, { x: 0, rotation: 0, opacity: 1, duration: 0.9, ease: "back.out(1.1)" });
  }, [arriving]);

  const toggle = () => {
    if (open) {
      onOpen(null);
      return;
    }
    if (!unwrapped) {
      play("unwrap", { rate: vary(0.15) });
      const l = leaf.current;
      if (l && !prefersReducedMotion()) {
        const flaps = l.querySelectorAll(".parcel__flap");
        gsap.timeline({ onComplete: () => setUnwrapped(true) })
          .to(l.querySelector(".parcel__pin"), { y: -30, rotation: 40, opacity: 0, duration: 0.2 })
          .to(flaps[0], { rotationY: -150, opacity: 0, duration: 0.45, ease: "power2.in", transformOrigin: "0% 50%" }, 0.1)
          .to(flaps[1], { rotationY: 150, opacity: 0, duration: 0.45, ease: "power2.in", transformOrigin: "100% 50%" }, 0.1);
      } else setUnwrapped(true);
    }
    onOpen(letter.id);
  };

  return (
    <li ref={root} className={`parcel${letter.spam ? " is-spam" : ""}${unwrapped ? " is-unwrapped" : ""}${open ? " is-open" : ""}${letter.read ? "" : " is-unread"}`}>
      <button type="button" className="parcel__wrap" onClick={toggle} aria-expanded={open} aria-controls={`letter-${letter.id}`}>
        {!unwrapped && (
          <span ref={leaf} className="parcel__leaf" aria-hidden="true">
            <span className="parcel__flap parcel__flap--l" />
            <span className="parcel__flap parcel__flap--r" />
            <span className="parcel__pin" />
          </span>
        )}
        <span className="parcel__label">
          <span className="parcel__from">{letter.fromName}</span>
          <span className="parcel__subject">{letter.subject}</span>
        </span>
        <span className="parcel__meta">
          {letter.spam && <span className="parcel__spam">SPAM</span>}
          {letter.forwarded && <span className="parcel__fwd">diteruskan</span>}
          <time dateTime={new Date(letter.at).toISOString()}>{time(letter.at)}</time>
          <span className="sr-only">{letter.read ? "" : " (belum dibuka)"}</span>
        </span>
      </button>
      {open && (
        <div className="letter" id={`letter-${letter.id}`}>
          <dl className="letter__head">
            <dt>Dari</dt>
            <dd>
              {letter.fromName} &lt;{letter.from}&gt;
            </dd>
            <dt>Perihal</dt>
            <dd>{letter.subject}</dd>
          </dl>
          <p className="letter__body">{letter.body}</p>
          <div className="letter__actions">
            <button type="button" className="tag tag--small" onClick={() => onDownload(letter)}>
              <span className="tag__hole" aria-hidden="true" />
              <span className="tag__text">Download .eml</span>
            </button>
            <button type="button" className="linkish" onClick={() => onOpen(null)}>
              bungkus lagi
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/** Letters arrive wrapped in banana leaf and slide across the counter. */
export function Inbox({ id, labelledBy, letters, spamFilter, openId, arrived, expired, hasInbox, onOpen, onDownload }: Props) {
  const shown = spamFilter ? letters.filter((l) => !l.spam) : letters;
  const binned = letters.length - shown.length;

  return (
    <div className="inbox" id={id} role={hasInbox ? "tabpanel" : undefined} aria-labelledby={hasInbox ? labelledBy : undefined}>
      <div className="inbox__head">
        <h3 className="inbox__title">
          Kotak surat <span className="inbox__count" key={shown.length}>{shown.length}</span>
        </h3>
        <span className="inbox__demo" title="Belum ada server email: surat di sini simulasi">demo</span>
        {spamFilter && binned > 0 && <span className="inbox__binned">{binned} spam dibuang</span>}
      </div>
      {!hasInbox ? (
        <p className="inbox__empty">Belum ada alamat. Ambil kantong sirup, ketok GENERATE, surat datang sendiri.</p>
      ) : shown.length === 0 ? (
        <p className="inbox__empty">Belum ada surat. Surat baru datang tiap 8 detik.</p>
      ) : (
        <ol className="inbox__list" aria-live="polite" aria-relevant="additions">
          {shown.map((l) => (
            <Parcel key={l.id} letter={l} open={openId === l.id} arriving={arrived.has(l.id)} onOpen={onOpen} onDownload={onDownload} />
          ))}
        </ol>
      )}
      {expired && <p className="inbox__expired">Lilin sudah habis, alamat ini tutup. Tambah waktu atau tulis nota baru.</p>}
    </div>
  );
}
