"use client";

import { useRef } from "react";
import { SnackDoodle } from "@/components/sticker/Doodles";
import { StickerButton } from "@/components/sticker/StickerButton";
import { DOMAINS } from "@/lib/domains";
import { activeInbox, mailActions, useMail } from "@/lib/mail";
import { toast } from "@/lib/toast";

/**
 * The ten domains as products on a two-row shelf. It is a radiogroup: arrow
 * keys move the selection. The selected product slides forward and stays lit.
 */
export function DomainShelf() {
  const mail = useMail();
  const current = activeInbox(mail).domain;
  const refs = useRef<(HTMLElement | null)[]>([]);

  const pick = (i: number) => {
    const d = DOMAINS[i].domain;
    if (d === current) return;
    mailActions.setDomain(d);
    toast(`Produk dipilih: @${d}`, "info", 1600);
  };

  const onKey = (e: React.KeyboardEvent<HTMLElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 5, ArrowLeft: -1, ArrowUp: -5 };
    const step = map[e.key];
    if (!step) return;
    e.preventDefault();
    const n = (i + step + DOMAINS.length) % DOMAINS.length;
    refs.current[n]?.focus();
    refs.current[n]?.click();
  };

  return (
    <div className="shelf" role="radiogroup" aria-label="Pilih domain (produk di rak)">
      {[0, 1].map((row) => (
        <div className="shelf__row" key={row}>
          <div className="shelf__items">
            {DOMAINS.slice(row * 5, row * 5 + 5).map((d, j) => {
              const i = row * 5 + j;
              const on = d.domain === current;
              return (
                <div key={d.domain} className={`shelf__slot${on ? " is-on" : ""}`}>
                  <span className="shelf__spot" aria-hidden="true" />
                  <StickerButton
                    ref={(n) => void (refs.current[i] = n)}
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    selected={on}
                    label={`@${d.domain}`}
                    color={d.band}
                    body={d.body}
                    effect={d.effect}
                    size="md"
                    onClick={() => pick(i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <SnackDoodle snack={d.snack} />
                  </StickerButton>
                </div>
              );
            })}
          </div>
          <div className="shelf__plank" aria-hidden="true">
            <span className="shelf__tag">{row ? "LORONG 2 · DOMAIN SEGAR" : "LORONG 1 · DOMAIN PILIHAN"}</span>
            <span className="shelf__tag shelf__tag--price">Rp0 / alamat</span>
          </div>
        </div>
      ))}
    </div>
  );
}
