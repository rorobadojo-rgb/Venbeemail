"use client";

import { useEffect } from "react";
import { asset } from "@/lib/asset";
import { onMailEvent, startMail, useMail } from "@/lib/mail";
import { play } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { DomainShelf } from "./DomainShelf";
import { Inbox } from "./Inbox";
import { Register } from "./Register";
import { Services } from "./Services";

/** Hero tool: domain shelf, register, service counter and the parcel counter. */
export function Toko() {
  const mail = useMail();

  useEffect(() => {
    startMail();
  }, []);

  // arrivals: parcel sound when the counter is in view, bell + system
  // notification when notifications are on
  useEffect(() => {
    const counter = () => document.getElementById("meja-paket");
    const inView = () => {
      const r = counter()?.getBoundingClientRect();
      return !!r && r.top < window.innerHeight && r.bottom > 0;
    };
    return onMailEvent((e) => {
      if (e.type === "expired") {
        play("crumple");
        toast("Alamat kedaluwarsa & dihapus otomatis. GENERATE lagi!", "warn", 3600);
        return;
      }
      const { message: m, filtered } = e;
      if (filtered) {
        if (inView()) play("bite", { volume: 0.5 });
        toast(`Spam dari ${m.fromName} digigit filter.`, "info", 1800);
        return;
      }
      if (inView()) play("box");
      if (mail.notify) {
        play("chime");
        toast(`Paket baru dari ${m.fromName}!`, "ok");
        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(`VenbeeMail · ${m.fromName}`, { body: m.subject, icon: asset("/icon.png"), tag: m.id });
          } catch {
            /* some browsers only allow notifications from a service worker */
          }
        }
      }
    });
  }, [mail.notify]);

  return (
    <section className="toko" id="toko" aria-labelledby="toko-title">
      <header className="section-head">
        <p className="section-head__aisle">Lorong 1</p>
        <h2 id="toko-title" className="section-head__title">
          Rak domain &amp; kasir
        </h2>
        <p className="section-head__sub">Pilih produk di rak, cetak alamatnya di kasir, tunggu paket datang di meja.</p>
      </header>
      <DomainShelf />
      <div className="toko__desk">
        <Register />
        <Services />
      </div>
      <Inbox />
      <p className="toko__demo">
        Mode demo: alamat dibuat di browsermu, paket yang datang hanyalah contoh, dan semuanya tersimpan di perangkat ini saja.
      </p>
    </section>
  );
}
