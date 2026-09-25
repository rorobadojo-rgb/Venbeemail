"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Echoes } from "@/components/comic/Echoes";
import { EndCard } from "@/components/panels/EndCard";
import { FeaturePanels } from "@/components/panels/FeaturePanels";
import { GeneratorPanel } from "@/components/panels/GeneratorPanel";
import { HeroPanel } from "@/components/panels/HeroPanel";
import { InboxPanel } from "@/components/panels/InboxPanel";
import { writeCamera } from "@/lib/cameraBus";
import { loadMail } from "@/lib/mail";
import { CINEMATIC, FLOW, REDUCED } from "@/lib/motion";
import { STEPS, getCurrentStep, goToStep, registerStepResolver, setCurrentStep } from "@/lib/nav";
import { initSound, playThrottled } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DEG = Math.PI / 180;
const TILT = 6; // max mouse tilt, degrees
const LAST = STEPS.length - 1;

type Shot = { x: number; y: number; scale: number };

/**
 * Desktop "guided view": the four panel slots are laid out as one comic
 * spread (2x2). A pinned stage scrubs a camera from panel to panel while each
 * panel flies into its slot from a different direction, then zooms out to
 * show the finished page before the end card lands.
 */
function setupCinematic(root: HTMLElement) {
  document.documentElement.dataset.mode = "cinematic";
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const $$ = (s: string, el: ParentNode = root) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const stage = $(".stage");
  const tilt = $(".tilt");
  const cam = $(".cam");
  const page = $(".page");
  const slots = [".slot--hero", ".slot--gen", ".slot--features", ".slot--inbox"].map((s) => $(s));
  const endcard = $(".endcard");
  const stamp = $(".page-stamp");

  const vw = () => stage.clientWidth;
  const vh = () => stage.clientHeight;
  const gutter = () => parseFloat(getComputedStyle(page).paddingTop) || 24;

  const frame = (x: number, y: number, w: number, h: number, pad: number): Shot => {
    const scale = Math.min((vw() - 2 * pad) / w, (vh() - 2 * pad) / h, 1);
    return { x: vw() / 2 - (x + w / 2) * scale, y: vh() / 2 - (y + h / 2) * scale, scale };
  };
  const fit = (el: HTMLElement) => frame(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight, gutter());
  const overview = (k = 1) => {
    const f = frame(0, 0, page.offsetWidth, page.offsetHeight, 48);
    if (k === 1) return f;
    const scale = f.scale * k;
    return { x: vw() / 2 - (page.offsetWidth / 2) * scale, y: vh() / 2 - (page.offsetHeight / 2) * scale, scale };
  };
  const shots: (() => Shot)[] = [...slots.map((s) => () => fit(s)), () => overview(), () => overview(0.86)];

  // --- the scrubbed timeline: one unit per step, labels s0..s5
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  gsap.set(cam, { transformOrigin: "0 0", ...shots[0]() });
  for (let i = 0; i < LAST; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    tl.addLabel(`s${i}`, i).fromTo(
      cam,
      { x: () => a().x, y: () => a().y, scale: () => a().scale },
      { x: () => b().x, y: () => b().y, scale: () => b().scale, duration: 1, ease: "power2.inOut", immediateRender: false },
      i,
    );
  }
  tl.addLabel(`s${LAST}`, LAST);

  // fly-in start states: just outside the page on that side (page px), so
  // nothing peeks into the shot before its turn; re-evaluated on refresh
  const box = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    for (let n: HTMLElement | null = el; n && n !== page; n = n.offsetParent as HTMLElement | null) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const M = 0.25; // extra margin (x panel size) to cover the 3D rotation
  const offRight = (el: HTMLElement) => page.offsetWidth - box(el).x + box(el).w * M;
  const offTop = (el: HTMLElement) => -(box(el).y + box(el).h * (1 + M));
  const from: Record<string, (el: HTMLElement) => gsap.TweenVars> = {
    right: (el) => ({ x: () => offRight(el), y: () => vh() * 0.06, rotation: 10, rotationY: -40 }),
    left: (el) => ({ x: () => -(box(el).x + box(el).w * (1 + M)), rotation: -10, rotationY: 40 }),
    top: (el) => ({ y: () => offTop(el), rotation: -8, rotationX: -45 }),
    bottom: (el) => ({ y: () => page.offsetHeight - box(el).y + box(el).h * M, rotation: 8, rotationX: 45 }),
    "top-right": (el) => ({ x: () => offRight(el), y: () => offTop(el) * 0.6, rotation: 16, rotationY: -30 }),
  };
  const landed = { x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1 };
  const injected: HTMLElement[] = [];
  const fly = (panel: HTMLElement, at: number, dur = 0.72) => {
    const dir = panel.dataset.fly ?? "right";
    const start = from[dir](panel);
    tl.fromTo(panel, { ...start, transformPerspective: 1400 }, { ...landed, duration: dur, ease: "back.out(1.3)" }, at);
    // speed lines smeared over the trailing side while it flies
    const speed = document.createElement("div");
    speed.className = `speed speed--${dir}`;
    speed.setAttribute("aria-hidden", "true");
    panel.appendChild(speed);
    injected.push(speed);
    tl.fromTo(speed, { autoAlpha: 1 }, { autoAlpha: 0, duration: dur * 0.85, ease: "power2.in" }, at);
    // trail: frame-only copies that start later and catch up on landing
    $$(":scope > .echo", panel.parentElement!).forEach((echo, k) => {
      const lag = (k + 1) * 0.018;
      tl.fromTo(echo, { ...start, transformPerspective: 1400 }, { ...landed, duration: dur - lag, ease: "back.out(1.3)" }, at + lag);
      // stay visible while moving fast, vanish as the panel lands
      tl.fromTo(echo, { autoAlpha: 0.6 - k * 0.15 }, { autoAlpha: 0, duration: dur - lag, ease: "power3.in" }, at + lag);
    });
  };
  // each panel launches once the camera is about halfway to its slot, so the
  // flight (and its trail) happens on screen
  fly($(".panel--gen"), 0.42, 0.52);
  $$(".panel--feat").forEach((p, i) => fly(p, 1.3 + i * 0.1, 0.46));
  fly($(".panel--inbox"), 2.42, 0.52);
  tl.fromTo(stamp, { scale: 0, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.3, ease: "back.out(2.5)" }, 3.6);
  tl.fromTo(
    endcard,
    { scale: 2.8, rotation: -14, autoAlpha: 0 },
    { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.3)" },
    4.3,
  );
  tl.fromTo($(".stage__dim"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 4.3);

  let lastStep = 0;
  const st = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => `+=${vh() * LAST}`,
    pin: true,
    scrub: 0.7,
    animation: tl,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    // one panel per gesture: snap to the neighbouring label in the scroll
    // direction, measured from where we are (not from the flick's inertia)
    snap: {
      snapTo: (_value, self) => {
        const at = (self?.progress ?? 0) * LAST;
        const next = (self?.direction ?? 1) > 0 ? Math.ceil(at - 0.03) : Math.floor(at + 0.03);
        return gsap.utils.clamp(0, LAST, next) / LAST;
      },
      duration: { min: 0.25, max: 0.75 },
      delay: 0.06,
      ease: "power2.inOut",
    },
  });
  // follow the (scrubbed) timeline rather than the raw scroll position, so the
  // step flips when the camera actually arrives
  tl.eventCallback("onUpdate", () => {
    const step = Math.round(tl.time());
    if (step !== lastStep) {
      lastStep = step;
      setCurrentStep(step);
      playThrottled("flip", 250);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    // handy when tuning the choreography: __comic.tl.pause().time(1.5)
    (window as unknown as { __comic?: object }).__comic = { tl, st };
  }

  registerStepResolver((step, smooth) => {
    window.scrollTo({ top: st.labelToScroll(`s${step}`), behavior: smooth ? "smooth" : "auto" });
    return true;
  });

  // keyboard users: bring the focused panel on camera
  const onFocus = (e: FocusEvent) => {
    const slot = (e.target as HTMLElement).closest<HTMLElement>("[data-step]");
    if (!slot) return;
    const step = Number(slot.dataset.step);
    if (step !== getCurrentStep()) goToStep(step, false);
  };
  root.addEventListener("focusin", onFocus);

  // ±6° mouse parallax on the whole camera, plus depth layers in the hero
  const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
  const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
  const layers = $$("[data-depth]").map((el) => ({
    d: Number(el.dataset.depth),
    x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
  }));
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    rx(-ny * 2 * TILT);
    ry(nx * 2 * TILT);
    layers.forEach((l) => {
      l.x(-nx * l.d * 26);
      l.y(-ny * l.d * 18);
    });
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  // feed the WebGL doodle field
  let pageW = page.offsetWidth;
  const onRefresh = () => void (pageW = page.offsetWidth);
  ScrollTrigger.addEventListener("refresh", onRefresh);
  const tick = () => {
    const s = gsap.getProperty(cam, "scale") as number;
    const x = gsap.getProperty(cam, "x") as number;
    const y = gsap.getProperty(cam, "y") as number;
    const h = vh();
    writeCamera({
      panX: ((vw() / 2 - x) / s - pageW / 2) / h,
      panY: (h / 2 - y) / s / h,
      zoom: s,
      tiltX: (gsap.getProperty(tilt, "rotationX") as number) * DEG,
      tiltY: (gsap.getProperty(tilt, "rotationY") as number) * DEG,
    });
  };
  gsap.ticker.add(tick);

  return () => {
    injected.forEach((el) => el.remove());
    registerStepResolver(null);
    root.removeEventListener("focusin", onFocus);
    window.removeEventListener("pointermove", onMove);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    gsap.ticker.remove(tick);
    delete document.documentElement.dataset.mode;
  };
}

/** Phones / small screens: panels stack; simple fade + slide, no 3D tilt. */
function setupFlow(root: HTMLElement) {
  document.documentElement.dataset.mode = "flow";
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".panel:not(.panel--hero), .endcard"));
  panels.forEach((el) => {
    const dir = el.dataset.fly;
    const x = dir === "left" ? -48 : dir === "right" || dir === "top-right" ? 48 : 0;
    gsap.fromTo(
      el,
      { opacity: 0, x, y: 56 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true, onEnter: () => playThrottled("flip", 400) },
      },
    );
  });
  trackSteps(root);
  const onScroll = () => writeCamera({ panX: 0, panY: window.scrollY / window.innerHeight, zoom: 1, tiltX: 0, tiltY: 0 });
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    delete document.documentElement.dataset.mode;
  };
}

/** prefers-reduced-motion: static layout, no fly-ins, no parallax. */
function setupReduced(root: HTMLElement) {
  document.documentElement.dataset.mode = "reduced";
  trackSteps(root);
  writeCamera({ panX: 0, panY: 0, zoom: 1, tiltX: 0, tiltY: 0 });
  return () => void delete document.documentElement.dataset.mode;
}

function trackSteps(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-step]:not(.page-stamp)").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => self.isActive && setCurrentStep(Number(el.dataset.step)),
    });
  });
}

export function ComicPage() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initSound();
    loadMail();
    // in-page anchors (#generator, #mulai, ...) go through the step resolver
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const i = a ? STEPS.findIndex((s) => `#${s.id}` === a.getAttribute("href")) : -1;
      if (i < 0 || e.defaultPrevented) return;
      e.preventDefault();
      if (a?.classList.contains("skip")) {
        // keyboard skip link: jump and hand focus to the first control there
        const target = document.getElementById(STEPS[i].id);
        (target?.querySelector<HTMLElement>('[aria-checked="true"]') ?? target?.querySelector<HTMLElement>("button, a[href]"))?.focus();
        return;
      }
      goToStep(i);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(CINEMATIC, () => setupCinematic(el));
      mm.add(FLOW, () => setupFlow(el));
      mm.add(REDUCED, () => setupReduced(el));
      // fonts change panel sizes; re-measure the camera once they are in
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root },
  );

  return (
    <main ref={root} className="comic" id="comic">
      <div className="stage">
        <div className="tilt">
          <div className="cam">
            <div className="page">
              <div className="slot slot--hero" id="mulai" data-step="0">
                <HeroPanel />
              </div>
              <div className="slot slot--gen" id="generator" data-step="1">
                <Echoes theme="blue" />
                <GeneratorPanel />
              </div>
              <div className="slot slot--features" id="fitur" data-step="2">
                <FeaturePanels />
              </div>
              <div className="slot slot--inbox" id="inbox" data-step="3">
                <Echoes theme="cream" />
                <InboxPanel />
              </div>
              <div className="page-stamp" id="halaman" data-step="4" aria-hidden="true">
                <span className="page-stamp__top">Venbee Comics</span>
                <span className="page-stamp__num">#1</span>
                <span className="page-stamp__bottom">Halaman 1 · lengkap!</span>
              </div>
            </div>
          </div>
        </div>
        <div className="stage__dim" aria-hidden="true" />
        <EndCard />
      </div>
    </main>
  );
}
