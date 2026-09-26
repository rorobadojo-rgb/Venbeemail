"use client";

import { useRef, type KeyboardEvent } from "react";
import { MAX_INBOXES, type Inbox } from "@/lib/mailbox";
import { play } from "@/lib/sound";

type Props = {
  inboxes: Inbox[];
  active: number;
  panelId: string;
  onSwitch: (i: number) => void;
  onAdd: () => void;
};

/** Up to three inboxes, shown as numbered enamel stall plates on nails. */
export function StallPlates({ inboxes, active, panelId, onSwitch, onAdd }: Props) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, k: number) => {
    const n = inboxes.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (k + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (k - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onSwitch(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="plates">
      {inboxes.length > 0 && (
        <div className="plates__row" role="tablist" aria-label="Kotak masuk (maks. 3)">
          {inboxes.map((ib, k) => (
            <button
              key={ib.id}
              ref={(el) => void (tabs.current[k] = el)}
              type="button"
              role="tab"
              id={`plate-${ib.id}`}
              aria-selected={k === active}
              aria-controls={panelId}
              tabIndex={k === active ? 0 : -1}
              className={`plate${k === active ? " is-active" : ""}`}
              onClick={() => {
                if (k !== active) play("click", { rate: 0.8 + k * 0.1 });
                onSwitch(k);
              }}
              onKeyDown={(e) => onKey(e, k)}
            >
              <span className="plate__num" aria-hidden="true">{k + 1}</span>
              <span className="plate__addr">
                <span className="sr-only">Kotak {k + 1}: </span>
                {ib.local}
              </span>
            </button>
          ))}
        </div>
      )}
      {inboxes.length < MAX_INBOXES && (
        <button type="button" className="plate plate--add" onClick={onAdd}>
          <span className="plate__num" aria-hidden="true">+</span>
          <span className="plate__addr">{inboxes.length ? "kotak baru" : "buka lapak"}</span>
        </button>
      )}
    </div>
  );
}
