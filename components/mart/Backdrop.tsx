"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { afterIntro } from "@/lib/intro";
import { FULL_3D } from "@/lib/motion";
import { PosterWall } from "./PosterWall";

// React Three Fiber + three.js only ever load on capable desktops
const MartScene = dynamic(() => import("./MartScene"), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The store behind everything. The CSS poster wall fades in once the page has
 * loaded (so its images never compete with the hero); on a capable desktop
 * the 3D mini-market is loaded on the first interaction (or after a few quiet
 * seconds) and fades in over it.
 */
export function Backdrop() {
  const [wall, setWall] = useState(false);
  const [load3d, setLoad3d] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let id = 0;
    const show = () => {
      const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
      id = idle(() => setWall(true), { timeout: 1500 });
    };
    if (document.readyState === "complete") show();
    else window.addEventListener("load", show, { once: true });
    return () => {
      window.removeEventListener("load", show);
      window.cancelIdleCallback?.(id);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(FULL_3D);
    if (!mq.matches || !webglOk()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    let timer = 0;
    let cancelIntro = () => {};
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
      // let the title entrance finish on a quiet main thread first
      cancelIntro = afterIntro(() => setLoad3d(true));
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    const arm = () => (timer = window.setTimeout(go, 6000));
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
      cancelIntro();
    };
  }, []);

  return (
    <div className={`mart${ready ? " is-3d" : ""}`} aria-hidden="true">
      {wall ? <PosterWall /> : null}
      {load3d ? <MartScene onReady={() => setReady(true)} /> : null}
      <div className="mart__haze" />
      <div className="mart__tubes" />
      <div className="mart__dark" />
    </div>
  );
}
