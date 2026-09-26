"use client";

import { useState } from "react";
import { StickerButton } from "@/components/sticker/StickerButton";
import { activeInbox, addressOf, downloadEml, mailActions, useMail, type Message } from "@/lib/mail";
import { play } from "@/lib/sound";
import { hhmm } from "@/lib/useNow";

function BoxDoodle({ open, spam }: { open: boolean; spam: boolean }) {
  return (
    <svg className={`doodle box${open ? " is-open" : ""}`} viewBox="0 0 120 90" aria-hidden="true">
      <path className="box__flap box__flap--l" d="M22 34l38 0-8-14H14z" fill="#B48A52" stroke="var(--ink-line)" strokeWidth="3" strokeLinejoin="round" />
      <path className="box__flap box__flap--r" d="M60 34l38 0 8-14H68z" fill="#B48A52" stroke="var(--ink-line)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 34h76v44H22z" fill="#D4AE74" stroke="var(--ink-line)" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M54 34h12v44H54z" fill="#E9D7AE" stroke="var(--ink-line)" strokeWidth="2" />
      <rect x="28" y="50" width="22" height="16" fill="#F5E6C8" stroke="var(--ink-line)" strokeWidth="2" />
      <path d="M31 55h16M31 60h10" stroke="var(--ink-line)" strokeWidth="1.8" />
      {spam ? <path d="M72 44l18 22M90 44L72 66" stroke="#FF1F5A" strokeWidth="5" strokeLinecap="round" /> : <path d="M74 48l6 6 10-12" fill="none" stroke="var(--ink-line)" strokeWidth="3" />}
      <path className="box__paper" d="M40 34v-10h40v10" fill="#FFFDF6" stroke="var(--ink-line)" strokeWidth="2.4" />
    </svg>
  );
}

function highlight(body: string) {
  // make verification codes easy to spot (and copy)
  return body.split(/(\b\d{6}\b)/).map((part, i) => (/^\d{6}$/.test(part) ? <mark key={i}>{part}</mark> : part));
}

/** The delivery counter: every message is a parcel; click to flip the lid. */
export function Inbox() {
  const mail = useMail();
  const inbox = activeInbox(mail);
  const address = addressOf(inbox);
  const [openId, setOpenId] = useState<string | null>(null);
  const open: Message | undefined = inbox.messages.find((m) => m.id === openId);

  const onOpen = (m: Message) => {
    if (openId === m.id) {
      setOpenId(null);
      return;
    }
    setOpenId(m.id);
    if (!m.read) mailActions.markRead(m.id);
  };

  return (
    <section className="counter" id="meja-paket" role="tabpanel" aria-labelledby="meja-title">
      <div className="counter__head">
        <h3 id="meja-title" className="counter__title">
          Meja paket
        </h3>
        <p className="counter__meta">
          {address ? (
            <>
              untuk <b>{address}</b> · {inbox.messages.length} paket
              {inbox.blocked ? ` · ${inbox.blocked} spam digigit filter` : ""}
            </>
          ) : (
            "Belum ada alamat. Tekan GENERATE di kasir."
          )}
        </p>
      </div>
      <div className="counter__top">
        {inbox.messages.length ? (
          <ul className="counter__boxes" aria-label="Paket masuk">
            {inbox.messages.map((m, i) => (
              <li key={m.id} className="counter__slot" style={{ "--k": Math.min(i, 6) } as React.CSSProperties}>
                <StickerButton
                  label={m.fromName}
                  color={m.spam ? "purple" : m.read ? "grey" : "orange"}
                  body="kraft"
                  size="sm"
                  effect="none"
                  sound="lid"
                  selected={openId === m.id}
                  selectedLabel="DIBUKA"
                  note={m.spam ? `SPAM · ${m.subject}` : m.subject}
                  aria-expanded={openId === m.id}
                  aria-controls="surat"
                  onClick={() => onOpen(m)}
                  title={`${m.fromName}: ${m.subject}`}
                >
                  <BoxDoodle open={m.read} spam={m.spam} />
                </StickerButton>
                {!m.read ? <span className="counter__new" aria-label="baru">BARU</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="counter__empty">
            {address ? "Belum ada paket. Kurir zombie lagi jalan (pelan). Paket demo datang tiap 8 detik." : "Meja kosong."}
          </p>
        )}
      </div>

      <div id="surat" className="reader" aria-live="polite">
        {open ? (
          <article className="letter" aria-labelledby="surat-subj">
            <header className="letter__head">
              <p className="letter__from">
                <b>{open.fromName}</b> &lt;{open.from}&gt;
              </p>
              <p className="letter__to">
                untuk {open.to} · {hhmm(open.at)}
                {open.forwardedTo ? ` · diteruskan ke ${open.forwardedTo} (demo)` : ""}
              </p>
              <h4 id="surat-subj" className="letter__subj">
                {open.spam ? <span className="letter__spam">SPAM</span> : null}
                {open.subject}
              </h4>
            </header>
            <p className="letter__body">{highlight(open.body)}</p>
            <div className="letter__actions">
              <StickerButton label="DOWNLOAD .EML" color="white" body="grey" size="sm" effect="crush" sound="crush" onClick={() => downloadEml(open)} />
              <StickerButton
                label="BUANG PESAN"
                color="pink"
                body="grey"
                size="sm"
                effect="crumple"
                sound="crumple"
                onClick={() => {
                  window.setTimeout(() => play("bin"), 400);
                  mailActions.deleteMessage(open.id);
                  setOpenId(null);
                }}
              />
              <StickerButton label="TUTUP KARDUS" color="grey" body="cream" size="sm" effect="none" sound="lid" onClick={() => setOpenId(null)} />
            </div>
          </article>
        ) : (
          <p className="reader__hint">Klik paket di meja untuk membuka tutupnya.</p>
        )}
      </div>
    </section>
  );
}
