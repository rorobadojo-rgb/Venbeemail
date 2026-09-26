import { useSyncExternalStore } from "react";

/** Tiny price-tag toasts ("TERSALIN!", "Paket baru!"). Also read out by a live region. */
export type Toast = { id: number; text: string; tone: "ok" | "info" | "warn" };

let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const EMPTY: Toast[] = [];

function emit() {
  listeners.forEach((l) => l());
}

export function toast(text: string, tone: Toast["tone"] = "info", ms = 2600) {
  const t = { id: ++seq, text, tone };
  toasts = [...toasts.slice(-2), t];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    emit();
  }, ms);
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    () => toasts,
    () => EMPTY,
  );
}
