"use client";

import { useToasts } from "@/lib/toast";

/** Price-tag toasts at the bottom of the screen; read out politely. */
export function Toasts() {
  const toasts = useToasts();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <p key={t.id} className={`toast toast--${t.tone}`}>
          {t.text}
        </p>
      ))}
    </div>
  );
}
