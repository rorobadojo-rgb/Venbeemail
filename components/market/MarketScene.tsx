"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { bus } from "@/lib/bus";
import { Director, EYE, type PosterMode } from "./director";

type Props = { onReady: () => void };

function LaneRig({ onReady, poster }: Props & { poster: PosterMode }) {
  const { scene, camera, gl, setDpr } = useThree();
  const director = useRef<Director | null>(null);

  useEffect(() => {
    const d = new Director(poster);
    director.current = d;
    d.attach(scene, gl, asset("/doodles/atlas.webp"));
    if (poster) return () => d.detach(scene);
    const onMove = (e: PointerEvent) => d.look((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    const off = bus.on("closing", ({ amount }) => d.closing(amount));
    return () => {
      window.removeEventListener("pointermove", onMove);
      off();
      d.detach(scene);
      director.current = null;
    };
  }, [scene, gl, poster]);

  useFrame((_, delta) => director.current?.frame(camera, delta, gl, setDpr, onReady));
  return null;
}

/**
 * The live 3D lane (React Three Fiber). Loaded lazily by MarketBackdrop.
 * `?poster=desktop|mobile` freezes it for scripts/poster/render-poster.mjs.
 */
export function MarketScene({ onReady }: Props) {
  const [poster] = useState<PosterMode>(() => {
    const v = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("poster");
    return v === "desktop" || v === "mobile" ? v : null;
  });
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={poster ? 1 : [1, 1.5]}
      flat
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!poster }}
      camera={{ fov: poster === "mobile" ? 70 : 58, near: 0.1, far: 45, position: [0, EYE, 2] }}
    >
      <LaneRig onReady={onReady} poster={poster} />
    </Canvas>
  );
}
