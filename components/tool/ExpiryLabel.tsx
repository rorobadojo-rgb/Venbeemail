"use client";

import { LIFETIME_MS, MAX_LEFT_MS, type Inbox } from "@/lib/mail";
import { clock, hhmm, useNow } from "@/lib/useNow";

/**
 * Auto-delete countdown as a food "expiry date" label. The bar drains toward
 * the expiry; it turns red for the last minute.
 */
export function ExpiryLabel({ inbox }: { inbox: Inbox }) {
  const now = useNow(1000);
  const alive = !!inbox.local && inbox.expiresAt > 0 && now > 0;
  const left = alive ? Math.max(0, inbox.expiresAt - now) : 0;
  const full = Math.max(LIFETIME_MS, Math.min(MAX_LEFT_MS, inbox.expiresAt - inbox.createdAt));
  const frac = alive ? Math.min(1, left / full) : 0;
  const urgent = alive && left < 60_000;
  return (
    <div className={`expiry${urgent ? " is-urgent" : ""}${alive ? "" : " is-dead"}`}>
      <span className="expiry__head">Baik digunakan sebelum</span>
      <span className="expiry__date">{alive ? hhmm(inbox.expiresAt) : "--:--"}</span>
      <span className="expiry__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${frac})` }} />
      </span>
      <span className="expiry__left" role="timer" aria-label={alive ? `Terhapus otomatis dalam ${clock(left)}` : "Tidak ada alamat aktif"}>
        {alive ? `${clock(left)} lagi` : "KEDALUWARSA"}
      </span>
    </div>
  );
}
