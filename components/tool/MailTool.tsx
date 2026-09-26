"use client";

import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { domainInfo, type Domain } from "@/lib/domains";
import { copyText, downloadEml } from "@/lib/eml";
import {
  activeInbox,
  addressOf,
  getMarket,
  isExpired,
  isValidLocal,
  loadMarket,
  market,
  onLetter,
  pumpOnce,
  startMailPump,
  timeLeft,
  useMarket,
  useNow,
} from "@/lib/mailbox";
import { prefersReducedMotion } from "@/lib/motion";
import { initSound, play, vary } from "@/lib/sound";
import { BagChip } from "./BagChip";
import { BagRack } from "./BagRack";
import { Candle } from "./Candle";
import { IconBin, IconCopy, IconDice, IconPen, IconQr, IconRefresh } from "./icons";
import { Inbox } from "./Inbox";
import { Nota, type NotaHandle } from "./Nota";
import { Services } from "./Services";
import { StallPlates } from "./StallPlates";
import { WoodSign } from "./WoodSign";

/** This page's URL with `?inbox=` set: opens that address (see loadMarket). */
function inboxLink(address: string) {
  const u = new URL(window.location.href);
  u.search = `?inbox=${encodeURIComponent(address)}`;
  u.hash = "";
  return u.href;
}

/** ids of letters that arrived this session (they slide in instead of just appearing) */
const arrivedIds = new Set<string>();

/** The warung counter: bags on the pole, signs, the nota, candle and inbox. */
export function MailTool() {
  const m = useMarket();
  const now = useNow();
  const inbox = activeInbox(m);
  const nota = useRef<NotaHandle>(null);
  const notaWrap = useRef<HTMLDivElement>(null);
  const counterBag = useRef<HTMLDivElement>(null);
  const flight = useRef<{ domain: Domain; from: DOMRect } | null>(null);
  const autoDone = useRef(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState({ text: "", n: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [rolled, setRolled] = useState(0);

  const say = (text: string) => setToast((t) => ({ text, n: t.n + 1 }));

  useEffect(() => {
    initSound();
    loadMarket();
    const stopPump = startMailPump();
    const off = onLetter((l) => {
      arrivedIds.add(l.id);
      if (!document.hidden && !(l.spam && getMarket().spamFilter)) play("mail", { rate: vary(0.1) });
    });
    return () => {
      stopPump();
      off();
    };
  }, []);

  useEffect(() => {
    if (!toast.text) return;
    const t = setTimeout(() => setToast((x) => ({ ...x, text: "" })), 2800);
    return () => clearTimeout(t);
  }, [toast.n, toast.text]);

  // first visit: the zombie writes a first nota once the counter is in view
  useEffect(() => {
    if (!m.ready || !m.firstVisit || m.inboxes.length || autoDone.current) return;
    const el = notaWrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || autoDone.current) return;
        autoDone.current = true;
        io.disconnect();
        setTimeout(() => market.generate(), 400);
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [m.ready, m.firstVisit, m.inboxes.length]);

  // the picked bag flies from its hook to the counter
  useLayoutEffect(() => {
    const f = flight.current;
    const el = counterBag.current;
    if (!f || f.domain !== m.domain || !el) return;
    flight.current = null;
    if (prefersReducedMotion()) return;
    const to = el.getBoundingClientRect();
    const dx = f.from.left + f.from.width / 2 - (to.left + to.width / 2);
    const dy = f.from.top + f.from.height / 2 - (to.top + to.height / 2);
    gsap.killTweensOf(el);
    gsap.set(el, { x: dx, y: dy, scale: f.from.width / to.width, rotation: -14 });
    gsap.timeline()
      .to(el, { x: 0, scale: 1, rotation: 0, duration: 0.8, ease: "power2.inOut" }, 0)
      .to(el, { y: Math.min(dy, 0) - 80, duration: 0.38, ease: "power2.out" }, 0)
      .to(el, { y: 0, duration: 0.5, ease: "bounce.out" }, 0.38)
      .add(() => play("squish", { rate: 1.3, volume: 0.5 }), 0.8);
  }, [m.domain]);

  const address = inbox ? addressOf(inbox) : null;
  const left = inbox ? timeLeft(inbox, now) : 0;
  const expired = inbox ? isExpired(inbox, now) : false;
  const link = address && typeof window !== "undefined" ? inboxLink(address) : "";
  const wanted = isValidLocal(m.username) ? m.username : null;
  const preview = `${wanted ?? "nama-acak"}@${m.domain}`;
  const orderChanged = !inbox || inbox.domain !== m.domain || (wanted !== null && wanted !== inbox.local);
  const info = domainInfo(m.domain);
  const letters = inbox?.letters ?? [];
  const shownLetters = m.spamFilter ? letters.filter((l) => !l.spam) : letters;

  // ------------------------------------------------------------ actions
  const onGenerate = () => {
    market.generate();
    setOpenId(null);
    const a = activeInbox(getMarket());
    say(a ? `Nota baru ditulis: ${addressOf(a)}` : "Nota baru ditulis");
  };
  const onCopy = async () => {
    if (!address) return say("Belum ada alamat. Ketok GENERATE dulu.");
    const ok = await copyText(address);
    say(ok ? `SUDAH DISALIN: ${address}` : "Gagal menyalin, salin manual ya.");
    if (ok) await nota.current?.rip();
  };
  const onRefresh = () => {
    if (!inbox) return say("Belum ada alamat buat dicek.");
    if (expired) return say("Lilin sudah habis. Tambah waktu dulu.");
    setRefreshing(true);
    say("Cek kotak surat…");
    setTimeout(() => {
      pumpOnce();
      setRefreshing(false);
    }, 700);
  };
  const onDelete = async () => {
    if (!inbox) return say("Tidak ada nota untuk dibuang.");
    const gone = addressOf(inbox);
    await nota.current?.toss();
    market.removeActive();
    setOpenId(null);
    say(`Nota ${gone} dibuang ke keranjang.`);
  };
  const onQr = async () => {
    if (!inbox) return say("Belum ada alamat untuk dibikin QR.");
    const back = await nota.current?.toggleQr();
    say(back ? "QR digambar di balik nota. Scan pakai HP." : "Nota dibalik lagi.");
  };
  const onRandom = () => {
    market.randomUsername();
    setRolled((r) => r + 1);
    say("Nama acak siap. Ketok GENERATE buat nulis nota.");
  };
  const onSelectBag = (d: Domain, from: DOMRect | null) => {
    if (from) flight.current = { domain: d, from };
    market.setDomain(d);
    say(`Kantong @${d} ditaruh di meja.`);
  };
  const onDownload = (l = shownLetters.find((x) => x.id === openId) ?? shownLetters[0]) => {
    if (!l || !address) return;
    downloadEml(l, address);
    say("File .eml diunduh.");
  };

  return (
    <div className="tool" id="alat">
      <h2 className="sr-only">Alat email sementara</h2>
      <BagRack selected={m.domain} onSelect={onSelectBag} />

      <div className="counter">
        <div className="counter__grid">
          <div className="counter__order">
            <StallPlates
              inboxes={m.inboxes}
              active={m.active}
              panelId="kotak-surat"
              onSwitch={(i) => {
                market.switchInbox(i);
                setOpenId(null);
              }}
              onAdd={() => {
                if (market.addInbox()) say("Kotak baru dibuka.");
              }}
            />
            <div className="order">
              <label className="order__label" htmlFor="uname">
                Nama alamat <span>(opsional)</span>
              </label>
              <div className="order__row">
                <input
                  id="uname"
                  key={rolled}
                  className={`order__input${rolled ? " is-rolled" : ""}`}
                  value={m.username}
                  onChange={(e) => market.setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onGenerate()}
                  placeholder="cilok.galak123"
                  maxLength={24}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby="order-preview"
                />
                <span className="order__at" aria-hidden="true">@</span>
                <div id="counter-bag" ref={counterBag} className="order__bag">
                  <BagChip
                    key={m.domain}
                    mode="counter"
                    label={`@${info.domain}`}
                    flavor={info.flavor}
                    syrup={info.syrup}
                    deep={info.deep}
                    effect={info.effect}
                    selected
                  />
                </div>
              </div>
              <p className="order__preview" id="order-preview">
                Bakal jadi: <b>{preview}</b>
              </p>
            </div>
            <div className="signs">
              <WoodSign label="GENERATE" caption="tulis nota" color="red" icon={<IconPen />} onClick={onGenerate} nudge={orderChanged} />
              <WoodSign label="COPY" caption="salin alamat" color="green" icon={<IconCopy />} onClick={onCopy} />
              <WoodSign label="REFRESH" caption="cek surat" color="blue" icon={<IconRefresh />} onClick={onRefresh} className={refreshing ? "is-spinning" : ""} />
              <WoodSign label="DELETE" caption="buang nota" color="pink" icon={<IconBin />} onClick={onDelete} />
              <WoodSign label="QR CODE" caption="balik nota" color="yellow" icon={<IconQr />} onClick={onQr} />
              <WoodSign label="RANDOM" caption="nama acak" color="purple" icon={<IconDice />} onClick={onRandom} />
            </div>
          </div>

          <div className="counter__nota" ref={notaWrap}>
            <Nota ref={nota} inbox={inbox} inboxLink={link} />
          </div>

          <div className="counter__side">
            <Candle left={left} life={inbox?.lifeMs ?? 1} active={!!inbox} />
            <Services
              inbox={inbox}
              left={left}
              spamFilter={m.spamFilter}
              notify={m.notify}
              canDownload={shownLetters.length > 0}
              onExtend={() => {
                market.extend();
                say("Lilin ditambah 10 menit.");
              }}
              onChange={() => {
                market.changeAddress();
                setOpenId(null);
                const a = activeInbox(getMarket());
                say(a ? `Alamat diganti: ${addressOf(a)}` : "Alamat diganti.");
              }}
              onCopyLink={async () => {
                const ok = link && (await copyText(link));
                say(ok ? "Link inbox disalin." : "Gagal menyalin link.");
              }}
              onDownload={() => onDownload()}
              onForward={(email) => {
                market.setForward(email);
                say(email ? `Surat baru diteruskan ke ${email} (demo).` : "Penerusan dihentikan.");
              }}
              onToggleSpam={() => {
                market.toggleSpamFilter();
                say(getMarket().spamFilter ? "Filter spam nyala." : "Filter spam mati: spam ikut tampil.");
              }}
              onToggleNotify={async () => {
                const r = await market.toggleNotify();
                say(r === "on" ? "Notifikasi nyala." : r === "off" ? "Notifikasi mati." : "Notifikasi diblokir browser.");
              }}
            />
          </div>
        </div>

        <Inbox
          id="kotak-surat"
          labelledBy={inbox ? `plate-${inbox.id}` : "alat"}
          letters={letters}
          spamFilter={m.spamFilter}
          openId={openId}
          arrived={arrivedIds}
          expired={expired}
          hasInbox={!!inbox}
          onOpen={(id) => {
            setOpenId(id);
            if (id) market.markRead(id);
          }}
          onDownload={(l) => onDownload(l)}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {toast.text}
      </p>
      <div className={`toast${toast.text ? " is-on" : ""}`} key={toast.n} aria-hidden="true">
        {toast.text}
      </div>
    </div>
  );
}
