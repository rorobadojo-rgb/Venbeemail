import { gsap } from "gsap";
import type { StickerEffect } from "@/lib/domains";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Press effects for StickerButton. Each one animates the sticker's own parts:
 *   .sb__panel   the label (masks, tints)
 *   .sb__art     the printed doodle
 *   .sb__fx      overlay host that may spill outside the sticker (particles)
 *   .sb__inner   overlay host clipped to the label (frost, laser)
 * Everything injected is removed when its timeline ends.
 */
type Parts = { root: HTMLElement; panel: HTMLElement; art: HTMLElement; fx: HTMLElement; inner: HTMLElement };

const rnd = gsap.utils.random;

function spawn(host: HTMLElement, cls: string, css: Partial<CSSStyleDeclaration> = {}, text?: string) {
  const el = document.createElement("span");
  el.className = cls;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, css);
  if (text) el.textContent = text;
  host.appendChild(el);
  return el;
}

function crumbs(p: Parts, n: number, color = "var(--band)") {
  const tl = gsap.timeline();
  for (let i = 0; i < n; i++) {
    const c = spawn(p.fx, "fx-crumb", { background: color });
    const a = rnd(-Math.PI, 0);
    const d = rnd(30, 70);
    tl.fromTo(
      c,
      { left: "50%", top: "55%", x: 0, y: 0, rotation: rnd(0, 180), scale: rnd(0.6, 1.2) },
      { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, rotation: "+=180", duration: 0.35, ease: "power2.out" },
      0,
    ).to(c, { y: "+=60", autoAlpha: 0, duration: 0.45, ease: "power2.in", onComplete: () => c.remove() }, 0.35);
  }
  return tl;
}

const effects: Record<Exclude<StickerEffect, "none">, (p: Parts) => gsap.core.Timeline> = {
  crush: (p) =>
    gsap
      .timeline()
      .to(p.art, { scaleY: 0.55, scaleX: 1.18, rotation: -4, skewX: 8, duration: 0.12, ease: "power3.in", transformOrigin: "50% 100%" })
      .add(crumbs(p, 6, "#C9C4B8"), 0.1)
      .to(p.art, { scaleY: 1, scaleX: 1, rotation: 0, skewX: 0, duration: 0.7, ease: "elastic.out(1.2, 0.3)" }, 0.34),

  fizz: (p) => {
    const tl = gsap.timeline();
    for (let i = 0; i < 16; i++) {
      const s = rnd(5, 13);
      const b = spawn(p.fx, "fx-bubble", { width: `${s}px`, height: `${s}px` });
      const x = rnd(20, 80);
      tl.fromTo(
        b,
        { left: `${x}%`, top: "78%", y: 0, x: 0, scale: 0.3, autoAlpha: 1 },
        { y: rnd(-120, -70), x: rnd(-14, 14), scale: 1, duration: rnd(0.5, 0.9), ease: "power1.out" },
        rnd(0, 0.35),
      ).to(b, { scale: 1.6, autoAlpha: 0, duration: 0.12, onComplete: () => b.remove() }, ">");
    }
    tl.fromTo(p.art, { y: 0 }, { y: -3, duration: 0.05, repeat: 7, yoyo: true, ease: "none" }, 0);
    return tl;
  },

  bite: (p) => {
    // three overlapping "tooth" circles eat into the top-right corner, then regrow
    const cut = p.panel.parentElement ?? p.panel;
    const v = { r: 0 };
    const apply = () => cut.style.setProperty("--bite", `${v.r}px`);
    cut.dataset.bite = "";
    return gsap
      .timeline({
        onComplete: () => {
          cut.style.removeProperty("--bite");
          delete cut.dataset.bite;
        },
      })
      .to(v, { r: 36, duration: 0.14, ease: "back.out(3)", onUpdate: apply })
      .add(crumbs(p, 8), 0.05)
      .to(p.art, { rotation: 5, duration: 0.08, yoyo: true, repeat: 1 }, 0)
      .to(v, { r: 0, duration: 0.6, ease: "elastic.out(1, 0.5)", onUpdate: apply }, 0.9);
  },

  freeze: (p) => {
    const frost = spawn(p.inner, "fx-frost");
    const shards = [0, 1, 2, 3].map((i) => spawn(p.inner, `fx-shard fx-shard--${i}`));
    return gsap
      .timeline({ onComplete: () => [frost, ...shards].forEach((e) => e.remove()) })
      .fromTo(frost, { clipPath: "circle(0% at 10% 0%)", autoAlpha: 1 }, { clipPath: "circle(150% at 10% 0%)", duration: 0.55, ease: "power2.out" })
      .to(p.art, { filter: "saturate(.4) brightness(1.2) hue-rotate(160deg)", duration: 0.4 }, 0)
      .set(frost, { autoAlpha: 0 }, 1.0)
      .fromTo(shards, { autoAlpha: 1 }, { y: () => rnd(40, 90), x: () => rnd(-30, 30), rotation: () => rnd(-50, 50), autoAlpha: 0, duration: 0.6, ease: "power2.in", stagger: 0.04 }, 1.0)
      .to(p.art, { filter: "none", duration: 0.3 }, 1.0);
  },

  pricegun: (p) => {
    const tag = spawn(p.fx, "fx-price", {}, "Rp0");
    return gsap
      .timeline({ onComplete: () => tag.remove() })
      .fromTo(tag, { x: 90, y: -30, rotation: 40, scale: 0.6, autoAlpha: 1 }, { x: 0, y: 0, rotation: -12, scale: 1, duration: 0.16, ease: "power4.in" })
      .to(p.art, { x: -4, duration: 0.05, yoyo: true, repeat: 1 }, 0.14)
      .fromTo(tag, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(4)" }, 0.16)
      .to(tag, { autoAlpha: 0, y: 10, duration: 0.3 }, 2.2);
  },

  bagpop: (p) => {
    const tl = gsap
      .timeline()
      .to(p.art, { scale: 1.28, borderRadius: "40%", duration: 0.45, ease: "power1.in" })
      .to(p.art, { scale: 0.85, duration: 0.06, ease: "power4.out" });
    const burst = spawn(p.fx, "fx-pop");
    tl.fromTo(burst, { scale: 0.2, autoAlpha: 1 }, { scale: 1.4, autoAlpha: 0, duration: 0.35, ease: "power2.out", onComplete: () => burst.remove() }, 0.46)
      .add(crumbs(p, 10), 0.46)
      .to(p.art, { scale: 1, duration: 0.6, ease: "elastic.out(1.1, 0.35)" }, 0.52);
    return tl;
  },

  spill: (p) => {
    const puddle = spawn(p.fx, "fx-puddle");
    const drops = [0, 1, 2].map(() => spawn(p.fx, "fx-slime"));
    return gsap
      .timeline({ onComplete: () => [puddle, ...drops].forEach((e) => e.remove()) })
      .to(p.art, { rotation: 28, x: 8, duration: 0.3, ease: "back.in(2)", transformOrigin: "80% 100%" })
      .fromTo(drops, { left: "72%", top: "30%", y: 0, autoAlpha: 1, scale: 0.6 }, { y: () => rnd(40, 70), x: () => rnd(0, 26), scale: 1, duration: 0.35, ease: "power2.in", stagger: 0.07 }, 0.25)
      .fromTo(puddle, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, 0.45)
      .to(p.art, { rotation: 0, x: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }, 0.8)
      .to([puddle, ...drops], { autoAlpha: 0, duration: 0.4 }, 1.6);
  },

  jelly: (p) =>
    gsap.timeline().to(p.art, {
      keyframes: [
        { scaleX: 1.25, scaleY: 0.75, duration: 0.1 },
        { scaleX: 0.82, scaleY: 1.2, duration: 0.12 },
        { scaleX: 1.12, scaleY: 0.9, skewX: 6, duration: 0.12 },
        { scaleX: 0.94, scaleY: 1.07, skewX: -4, duration: 0.12 },
        { scaleX: 1.04, scaleY: 0.97, skewX: 2, duration: 0.12 },
        { scaleX: 1, scaleY: 1, skewX: 0, duration: 0.14 },
      ],
      transformOrigin: "50% 100%",
      ease: "sine.inOut",
    }),

  coins: (p) => {
    const tl = gsap.timeline();
    for (let i = 0; i < 9; i++) {
      const c = spawn(p.fx, "fx-coin", {}, "Rp");
      tl.fromTo(
        c,
        { left: `${rnd(18, 82)}%`, top: "-30%", y: -40, rotation: rnd(-90, 90), autoAlpha: 1 },
        { y: rnd(70, 95), rotation: "+=180", duration: 0.5, ease: "bounce.out" },
        i * 0.07,
      ).to(c, { autoAlpha: 0, duration: 0.25, onComplete: () => c.remove() }, ">0.25");
    }
    tl.to(p.art, { y: 3, duration: 0.05, yoyo: true, repeat: 9 }, 0.2);
    return tl;
  },

  scan: (p) => {
    const laser = spawn(p.inner, "fx-laser");
    return gsap
      .timeline({ onComplete: () => laser.remove() })
      .fromTo(laser, { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 0.45, ease: "none", yoyo: true, repeat: 1 })
      .to(laser, { autoAlpha: 0, duration: 0.1 })
      .fromTo(p.panel, { "--flash": 1 }, { "--flash": 0, duration: 0.5 }, 0.9);
  },

  print: (p) => gsap.timeline().to(p.art, { x: 1.5, duration: 0.04, repeat: 9, yoyo: true, ease: "none" }).set(p.art, { x: 0 }),
  tear: (p) => gsap.timeline().to(p.art, { rotation: -8, duration: 0.08 }).to(p.art, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }),
  drawer: (p) => gsap.timeline().to(p.art, { x: 10, duration: 0.14, ease: "power2.out" }).to(p.art, { x: 0, duration: 0.4, ease: "back.out(3)" }, 0.3),
  crumple: (p) =>
    gsap.timeline().to(p.art, { scale: 0.7, rotation: 20, duration: 0.12 }).to(p.art, { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }),
  flip: (p) => gsap.timeline().fromTo(p.art, { rotationY: 0 }, { rotationY: 360, duration: 0.6, ease: "power2.inOut" }),
  spin: (p) => gsap.timeline().fromTo(p.art, { rotation: 0 }, { rotation: 720, duration: 0.8, ease: "power3.inOut" }),
};

const running = new WeakMap<HTMLElement, gsap.core.Timeline>();

export function runEffect(effect: StickerEffect, root: HTMLElement) {
  if (effect === "none") return;
  const q = (s: string) => root.querySelector<HTMLElement>(s);
  const parts: Parts | null = (() => {
    const panel = q(".sb__panel");
    const art = q(".sb__art");
    const fx = q(".sb__fx");
    const inner = q(".sb__inner");
    return panel && art && fx && inner ? { root, panel, art, fx, inner } : null;
  })();
  if (!parts) return;
  if (prefersReducedMotion()) {
    gsap.fromTo(parts.panel, { "--flash": 1 }, { "--flash": 0, duration: 0.4 });
    return;
  }
  const prev = running.get(root);
  if (prev) {
    prev.progress(1).kill();
    parts.fx.replaceChildren();
    parts.inner.replaceChildren();
  }
  const tl = effects[effect](parts);
  running.set(root, tl);
}
