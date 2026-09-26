"use client";

import { useState } from "react";
import { StickerButton } from "@/components/sticker/StickerButton";
import { DOMAIN_NAMES, isDomain } from "@/lib/domains";
import {
  MAX_INBOXES,
  activeInbox,
  addressOf,
  copyText,
  downloadEml,
  inboxLink,
  isValidEmail,
  mailActions,
  useMail,
} from "@/lib/mail";
import { play } from "@/lib/sound";
import { toast } from "@/lib/toast";

function Basket({ count }: { count: number }) {
  return (
    <svg className="doodle" viewBox="0 0 120 90" aria-hidden="true">
      <path d="M34 34l14-22M86 34L72 12" fill="none" stroke="var(--ink-line)" strokeWidth="5" strokeLinecap="round" />
      <path d="M18 34h84l-9 44H27z" fill="var(--band)" stroke="var(--ink-line)" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M34 44v24M50 44v26M66 44v26M82 44v24M24 54h72" stroke="var(--ink-line)" strokeWidth="2.4" />
      {count ? (
        <g>
          <circle cx="98" cy="22" r="15" fill="#FF1F5A" stroke="var(--ink-line)" strokeWidth="3" />
          <text x="98" y="28" textAnchor="middle" fontFamily="var(--font-label)" fontWeight="700" fontSize="17" fill="#0A0A0A">
            {count > 9 ? "9+" : count}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

/** Shopping baskets (up to 3 inboxes) + the service counter. */
export function Services() {
  const mail = useMail();
  const inbox = activeInbox(mail);
  const address = addressOf(inbox);
  const [panel, setPanel] = useState<null | "change" | "forward">(null);
  const [newLocal, setNewLocal] = useState("");
  const [newDomain, setNewDomain] = useState<string>(DOMAIN_NAMES[0]);
  const [forward, setForward] = useState("");
  const latest = inbox.messages[0];

  const openChange = () => {
    setNewLocal(inbox.local ?? "");
    setNewDomain(inbox.domain);
    setPanel(panel === "change" ? null : "change");
  };

  const applyChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDomain(newDomain) || !mailActions.changeAddress(newLocal, newDomain)) {
      play("nope");
      toast("Username tidak valid.", "warn");
      return;
    }
    play("printer");
    setPanel(null);
    toast("Alamat diganti, struk baru dicetak.", "ok");
  };

  const applyForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forward)) {
      play("nope");
      toast("Alamat email tujuan belum benar.", "warn");
      return;
    }
    mailActions.setForward(forward);
    play("stamp");
    setPanel(null);
    toast(`Pesan baru akan diteruskan ke ${forward.trim()} (demo)`, "ok", 3200);
  };

  const copyLink = async () => {
    const link = inboxLink(inbox);
    if (!link) return;
    if (await copyText(link)) toast("Link inbox tersalin!", "ok");
  };

  return (
    <div className="services">
      <div className="baskets">
        <div className="baskets__tabs" role="tablist" aria-label="Keranjang (inbox)">
          {mail.inboxes.map((b, i) => {
            const on = b.id === inbox.id;
            const unread = b.messages.filter((m) => !m.read).length;
            return (
              <StickerButton
                key={b.id}
                role="tab"
                aria-selected={on}
                aria-controls="meja-paket"
                selected={on}
                label={`KERANJANG ${i + 1}`}
                color={(["orange", "teal", "yellow"] as const)[i % 3]}
                body="cream"
                size="sm"
                effect="jelly"
                sound="rustle"
                note={addressOf(b) ?? "kosong"}
                onClick={() => mailActions.setActive(b.id)}
                title={addressOf(b) ?? undefined}
              >
                <Basket count={on ? 0 : unread} />
              </StickerButton>
            );
          })}
        </div>
        <StickerButton
          label="+ KERANJANG"
          color="lime"
          body="grey"
          size="sm"
          effect="bagpop"
          sound="rustle"
          disabled={mail.inboxes.length >= MAX_INBOXES}
          note={`maks. ${MAX_INBOXES} inbox`}
          onClick={() => mailActions.addInbox() && toast("Keranjang baru, alamat baru.", "ok")}
        />
        {mail.inboxes.length > 1 ? (
          <StickerButton
            label="BUANG KERANJANG"
            color="black"
            body="grey"
            size="sm"
            effect="crumple"
            sound="crumple"
            note={`keranjang ${mail.inboxes.findIndex((b) => b.id === inbox.id) + 1}`}
            onClick={() => {
              mailActions.removeInbox(inbox.id);
              toast("Keranjang dikembalikan.", "info");
            }}
          />
        ) : null}
      </div>

      <h3 className="services__title">Layanan konter</h3>
      <div className="services__grid">
        <StickerButton
          label="EXTEND +10 MENIT"
          color="yellow"
          body="grey"
          size="sm"
          effect="pricegun"
          disabled={!address}
          note="tempel stiker diskon waktu"
          onClick={() => {
            mailActions.extend();
            toast("Masa simpan +10 menit!", "ok");
          }}
        />
        <StickerButton
          label="GANTI ALAMAT"
          color="orange"
          body="grey"
          size="sm"
          effect="scan"
          sound="beep"
          selected={panel === "change"}
          selectedLabel="BUKA"
          aria-expanded={panel === "change"}
          aria-controls="svc-change"
          note="username + domain"
          onClick={openChange}
        />
        <StickerButton
          label="SALIN LINK INBOX"
          color="cyan"
          body="grey"
          size="sm"
          effect="tear"
          sound="tear"
          disabled={!address}
          note="buka dari HP lain"
          onClick={copyLink}
        />
        <StickerButton
          label="TERUSKAN KE EMAIL"
          color="purple"
          body="grey"
          size="sm"
          effect="fizz"
          sound="slurp"
          selected={!!mail.forwardTo}
          selectedLabel="AKTIF"
          aria-expanded={panel === "forward"}
          aria-controls="svc-forward"
          note={mail.forwardTo ? `→ ${mail.forwardTo}` : "ke email aslimu"}
          onClick={() => {
            setForward(mail.forwardTo ?? "");
            setPanel(panel === "forward" ? null : "forward");
          }}
        />
        <StickerButton
          label="DOWNLOAD .EML"
          color="white"
          body="grey"
          size="sm"
          effect="crush"
          sound="crush"
          disabled={!latest}
          note={latest ? "pesan terbaru" : "belum ada pesan"}
          onClick={() => latest && downloadEml(latest)}
        />
        <StickerButton
          label="FILTER SPAM"
          color="red"
          body="grey"
          size="sm"
          effect="bite"
          sound="bite"
          selected={mail.spamFilter}
          selectedLabel="NYALA"
          aria-pressed={mail.spamFilter}
          note={mail.spamFilter ? `${inbox.blocked} spam digigit` : "mati: spam ikut masuk"}
          onClick={() => mailActions.setSpamFilter(!mail.spamFilter)}
        />
        <StickerButton
          label="NOTIFIKASI"
          color="pink"
          body="grey"
          size="sm"
          effect="coins"
          sound="chime"
          selected={mail.notify}
          selectedLabel="NYALA"
          aria-pressed={mail.notify}
          note={mail.notify ? "bel pintu toko" : "mati"}
          onClick={async () => {
            const on = !mail.notify;
            mailActions.setNotify(on);
            if (on && "Notification" in window && Notification.permission === "default") {
              try {
                await Notification.requestPermission();
              } catch {
                /* ignore */
              }
            }
          }}
        />
      </div>

      {panel === "change" ? (
        <form id="svc-change" className="svc-form" onSubmit={applyChange}>
          <label htmlFor="chg-local">Alamat baru</label>
          <div className="svc-form__row">
            <input id="chg-local" value={newLocal} onChange={(e) => setNewLocal(e.target.value.slice(0, 30))} autoComplete="off" spellCheck={false} />
            <span aria-hidden="true">@</span>
            <select value={newDomain} onChange={(e) => setNewDomain(e.target.value)} aria-label="Domain">
              {DOMAIN_NAMES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <StickerButton type="submit" label="CETAK ULANG" color="orange" body="cream" size="sm" sound="beep" />
        </form>
      ) : null}
      {panel === "forward" ? (
        <form id="svc-forward" className="svc-form" onSubmit={applyForward}>
          <label htmlFor="fwd">Teruskan pesan baru ke</label>
          <div className="svc-form__row">
            <input id="fwd" type="email" value={forward} onChange={(e) => setForward(e.target.value)} placeholder="kamu@email-asli.com" autoComplete="email" />
          </div>
          <p className="svc-form__note">Mode demo: penerusan disimulasikan, tidak ada email yang benar-benar dikirim.</p>
          <div className="svc-form__row">
            <StickerButton type="submit" label="SIMPAN" color="purple" body="cream" size="sm" sound={null} />
            {mail.forwardTo ? (
              <StickerButton
                label="MATIKAN"
                color="black"
                body="cream"
                size="sm"
                sound="nope"
                onClick={() => {
                  mailActions.setForward(null);
                  setPanel(null);
                  toast("Penerusan dimatikan.", "info");
                }}
              />
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
