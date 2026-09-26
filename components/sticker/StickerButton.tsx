"use client";

import { useRef, type ReactNode, type Ref } from "react";
import { EFFECT_SOUND, STICKER_COLORS, type StickerColor, type StickerEffect } from "@/lib/domains";
import { play, type SfxName } from "@/lib/sound";
import { runEffect } from "./effects";

type Size = "sm" | "md" | "lg";

export type StickerButtonProps = {
  /** Text in the coloured top band (angular lettering). */
  label: string;
  /** Band colour. */
  color?: StickerColor;
  /** Body (label panel) colour. */
  body?: StickerColor;
  /** Press effect played on the sticker itself. */
  effect?: StickerEffect;
  size?: Size;
  /** Press sound; defaults to the effect's sound, then the scanner beep. `null` = silent. */
  sound?: SfxName | null;
  /** Resting tilt in degrees (-4..4). Defaults to a stable value derived from the label. */
  tilt?: number;
  selected?: boolean;
  loading?: boolean;
  /** Success stamp; a string replaces the default "BERES!". */
  success?: boolean | string;
  disabled?: boolean;
  /** Printed art on the body (a doodle). */
  children?: ReactNode;
  /** Small caption printed on the body under the art. */
  note?: ReactNode;
  selectedLabel?: string;
  disabledLabel?: string;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
  id?: string;
  role?: string;
  tabIndex?: number;
  title?: string;
  "aria-label"?: string;
  "aria-checked"?: boolean;
  "aria-pressed"?: boolean;
  "aria-selected"?: boolean;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-describedby"?: string;
};

function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Every button on the page is one of these: a die-cut product-label sticker.
 * 8 px cream border, 3 px ink stroke, a body in `body` colour, a `color` top
 * band with hand-cut lettering, crumbs, and a resting tilt of -4..+4 deg.
 *
 * Shared motion (CSS, see styles/sticker.css):
 *   hover   lift 6 px + straighten + shadow grows (240 ms)
 *   press   squash 0.92 + 4 px push + shadow collapses (120 ms)
 *   release spring, stiffness 400 / damping 18 (CSS linear() easing)
 * States: default, hover, pressed, selected (DIPILIH tag), loading (barcode
 * scanline), success (stamp), disabled (HABIS).
 */
export function StickerButton({
  label,
  color = "red",
  body = "grey",
  effect = "none",
  size = "md",
  sound,
  tilt,
  selected = false,
  loading = false,
  success = false,
  disabled = false,
  children,
  note,
  selectedLabel = "DIPILIH",
  disabledLabel = "HABIS",
  className = "",
  href,
  type = "button",
  onClick,
  onKeyDown,
  ref,
  ...rest
}: StickerButtonProps) {
  const local = useRef<HTMLElement | null>(null);
  const h = hash(label);
  const rot = tilt ?? ((h % 9) - 4 || 2);
  const band = STICKER_COLORS[color];
  const bodyC = STICKER_COLORS[body];

  const setRef = (n: HTMLElement | null) => {
    local.current = n;
    if (typeof ref === "function") ref(n);
    else if (ref) (ref as React.RefObject<HTMLElement | null>).current = n;
  };

  const tr = (mode: "hover" | "press" | "spring") => {
    const el = local.current;
    if (el) el.dataset.tr = mode;
  };
  const setHover = (on: boolean) => local.current?.classList.toggle("is-hover", on);
  const setDown = (on: boolean) => local.current?.classList.toggle("is-down", on);

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || disabled) return;
      tr("hover");
      setHover(true);
    },
    onPointerLeave: () => {
      tr("spring");
      setHover(false);
      setDown(false);
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0 || disabled) return;
      tr("press");
      setDown(true);
    },
    onPointerUp: () => {
      tr("spring");
      setDown(false);
    },
    onPointerCancel: () => {
      tr("spring");
      setDown(false);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat && !disabled) {
        tr("press");
        setDown(true);
      }
      onKeyDown?.(e);
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        tr("spring");
        setDown(false);
      }
    },
    onBlur: () => {
      tr("spring");
      setDown(false);
    },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      const s = sound === undefined ? (EFFECT_SOUND[effect] ?? "beep") : sound;
      if (s) play(s);
      if (local.current) runEffect(effect, local.current);
      onClick?.(e);
    },
  };

  const state = disabled ? "disabled" : loading ? "loading" : success ? "success" : selected ? "selected" : "default";
  const cls = `sb sb--${size}${selected ? " is-selected" : ""} ${className}`.trim();
  const style = {
    "--band": band.bg,
    "--band-ink": band.ink,
    "--body": bodyC.bg,
    "--body-ink": bodyC.ink,
    "--tilt": `${rot}deg`,
    // dark bodies print their doodles in cream ink
    ...(body === "black" ? { "--ink-line": "#F5E6C8", "--paper": "#2E2E2E" } : {}),
  } as React.CSSProperties;

  const chars = Array.from(label).map((c, i) => (
    <span
      key={i}
      className="sb__ch"
      style={{ "--r": `${((i * 37 + h) % 7) - 3}deg`, "--y": `${((i * 53 + h) % 5) - 2}px` } as React.CSSProperties}
    >
      {c}
    </span>
  ));

  const inner = (
    <>
      <span className="sb__shadow" aria-hidden="true" />
      <span className="sb__lift">
        <span className="sb__cut">
          <span className="sb__sheet" aria-hidden="true" />
          <span className="sb__panel">
            <span className="sb__band">
              <span className="sb__label">{chars}</span>
            </span>
            <span className="sb__body">
              {children ? <span className="sb__art">{children}</span> : <span className="sb__art sb__art--empty" />}
              {note ? <span className="sb__note">{note}</span> : null}
              <span className={`sb__crumbs sb__crumbs--${h % 4}`} aria-hidden="true" />
            </span>
            <span className="sb__inner" aria-hidden="true" />
            <span className="sb__scan" aria-hidden="true" />
          </span>
          <span className="sb__fx" aria-hidden="true" />
        </span>
        <span className="sb__tag" aria-hidden="true">
          {selectedLabel}
        </span>
        <span className="sb__ok" aria-hidden="true">
          {typeof success === "string" ? success : "BERES!"}
        </span>
        <span className="sb__habis" aria-hidden="true">
          {disabledLabel}
        </span>
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <a ref={setRef} href={href} className={cls} style={style} data-state={state} {...handlers} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={setRef}
      type={type}
      className={cls}
      style={style}
      data-state={state}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...handlers}
      {...rest}
    >
      {inner}
    </button>
  );
}
