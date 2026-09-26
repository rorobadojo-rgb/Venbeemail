"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
 * The store behind everything. The CSS poster wall paints immediately; on a
 * capable desktop the 3D mini-market is loaded on the first interaction (or
 * after a few quiet seconds) and fades in over it.
 */
export function Backdrop() {
  const [load3d, setLoad3d] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(FULL_3D);
    if (!mq.matches || !webglOk()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    let timer = 0;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
      setLoad3d(true);
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    const arm = () => (timer = window.setTimeout(go, 6000));
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`mart${ready ? " is-3d" : ""}`} aria-hidden="true">
      <PosterWall />
      {load3d ? <MartScene onReady={() => setReady(true)} /> : null}
      <div className="mart__haze" />
      <div className="mart__tubes" />
      <div className="mart__dark" />
    </div>
  );
}
