"use client";

import { useEffect, useState, type ComponentType } from "react";
import { asset } from "@/lib/asset";
import { prefersReducedMotion, wantsStaticLane } from "@/lib/motion";
import { BulbString } from "../hero/BulbString";

type SceneProps = { onReady: () => void };

function webgl() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The night market behind everything. First paint is a poster of the lane
 * (rendered from the 3D scene). On desktop the live React Three Fiber lane
 * is code-split and only loaded on the first sign of a real visitor (mouse
 * move, scroll, key), then fades in over the poster. Phones, touch screens
 * and reduced motion keep the static lane, with swaying DOM bulbs on top.
 */
export function MarketBackdrop() {
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let dead = false;
    // scripts/poster/render-poster.mjs: render the lane alone, right away
    if (new URLSearchParams(window.location.search).has("poster")) {
      document.documentElement.setAttribute("data-poster", "");
      void import("./MarketScene").then((m) => !dead && setScene(() => m.MarketScene));
      return () => {
        dead = true;
      };
    }
    if (wantsStaticLane() || prefersReducedMotion() || !webgl()) return;
    const events = ["pointermove", "pointerdown", "wheel", "scroll", "keydown", "touchstart"] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      void import("./MarketScene").then((m) => {
        if (!dead) setScene(() => m.MarketScene);
      });
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true }));
    return () => {
      dead = true;
      events.forEach((e) => window.removeEventListener(e, go));
    };
  }, []);

  return (
    <div className={`market${live ? " is-live" : ""}`} aria-hidden="true">
      <picture>
        <source media="(max-width: 899.98px)" srcSet={asset("/market/poster-mobile.webp")} />
        <img className="market__poster" src={asset("/market/poster.webp")} alt="" width={1600} height={900} decoding="async" />
      </picture>
      {Scene && <Scene onReady={() => setLive(true)} />}
      <div className="market__garlands">
        <BulbString count={9} sag={40} className="market__garland" />
        <BulbString count={7} sag={30} className="market__garland market__garland--2" />
      </div>
      <div className="market__vignette" />
    </div>
  );
}
