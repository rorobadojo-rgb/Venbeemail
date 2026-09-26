"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { MAX_LIFE_MS, type Inbox } from "@/lib/mailbox";

type Props = {
  inbox?: Inbox;
  left: number;
  spamFilter: boolean;
  notify: boolean;
  canDownload: boolean;
  onExtend: () => void;
  onChange: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
  onForward: (email: string | null) => void;
  onToggleSpam: () => void;
  onToggleNotify: () => void;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Tag({ children, onClick, disabled, pressed, ...rest }: { children: ReactNode; onClick?: () => void; disabled?: boolean; pressed?: boolean; "aria-expanded"?: boolean; "aria-controls"?: string }) {
  return (
    <button type="button" className={`tag${pressed ? " is-on" : ""}`} onClick={onClick} disabled={disabled} aria-pressed={pressed} {...rest}>
      <span className="tag__hole" aria-hidden="true" />
      {pressed !== undefined && <span className="tag__lamp" aria-hidden="true" />}
      <span className="tag__text">{children}</span>
    </button>
  );
}

/** The extra services, written on kraft-paper price tags. */
export function Services(p: Props) {
  const [fwdOpen, setFwdOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const has = !!p.inbox;
  const atMax = has && p.left >= MAX_LIFE_MS - 60_000;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL.test(v)) {
      setErr("Alamat email belum benar.");
      return;
    }
    setErr("");
    p.onForward(v);
    setFwdOpen(false);
  };

  return (
    <div className="services">
      <div className="services__tags">
        <Tag onClick={p.onExtend} disabled={!has || atMax}>Extend +10 min</Tag>
        <Tag onClick={p.onChange} disabled={!has}>Change address</Tag>
        <Tag onClick={p.onCopyLink} disabled={!has}>Copy inbox link</Tag>
        <Tag onClick={() => setFwdOpen((v) => !v)} disabled={!has} aria-expanded={fwdOpen} aria-controls="fwd-form">
          Forward to real email
        </Tag>
        <Tag onClick={p.onDownload} disabled={!p.canDownload}>Download .eml</Tag>
        <Tag onClick={p.onToggleSpam} pressed={p.spamFilter}>Spam filter</Tag>
        <Tag onClick={p.onToggleNotify} pressed={p.notify}>Notification</Tag>
      </div>
      {has && p.inbox?.forwardTo && !fwdOpen && (
        <p className="services__fwd">
          Surat diteruskan ke <b>{p.inbox.forwardTo}</b>{" "}
          <button type="button" className="linkish" onClick={() => p.onForward(null)}>
            berhenti
          </button>
        </p>
      )}
      {fwdOpen && has && (
        <form id="fwd-form" className="fwd" onSubmit={submit} noValidate>
          <label htmlFor="fwd-email">Teruskan surat baru ke email asli</label>
          <div className="fwd__row">
            <input
              id="fwd-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="kamu@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!err}
              aria-describedby="fwd-note"
            />
            <button type="submit" className="fwd__go">Teruskan</button>
          </div>
          <p id="fwd-note" className="fwd__note">
            {err || "Mode demo: surat ditandai “diteruskan”, belum dikirim sungguhan."}
          </p>
        </form>
      )}
    </div>
  );
}
