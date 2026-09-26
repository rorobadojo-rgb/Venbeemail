import { useEffect, useState } from "react";

/** Current time, refreshed every `ms` on the client (0 during SSR). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, ms);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [ms]);
  return now;
}

export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
export function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(s / 60)}:${pad2(s % 60)}`;
}
export function hhmm(t: number) {
  const d = new Date(t);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
