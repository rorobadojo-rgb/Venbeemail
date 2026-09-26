"use client";

import { gsap } from "gsap";
import { useEffect, useRef, type ReactNode } from "react";
import { asset } from "@/lib/asset";
import { bus } from "@/lib/bus";
import { prefersReducedMotion } from "@/lib/motion";
import { ZombieLogo } from "../logo/ZombieLogo";
import { BulbString } from "./BulbString";

const DRIPS = [8, 19, 31, 44, 57, 69, 82, 93];

/**
 * The main warung's banner, hung under the tarp: the logo painted on the
 * left, the syrup title on the right. Clicking the logo makes the zombie
 * laugh; the banner flaps like it was hit by wind and slime drips off its
 * bottom edge.
 */
export function WarungBanner({ title, tagline }: { title: ReactNode; tagline: ReactNode }) {
  const cloth = useRef<HTMLDivElement>(null);
  const drips = useRef<HTMLDivElement>(null);
  const wave = useRef<SVGFEDisplacementMapElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);

  useEffect(
    () =>
      bus.on("laugh", ({ variant }) => {
        const c = cloth.current;
        if (!c) return;
        if (prefersReducedMotion()) return;
        const strength = variant === 1 ? 1.3 : 1;
        const tl = gsap.timeline();
        tl.set(c, { transformOrigin: "50% 0%" })
          .to(c, { rotationX: -24 * strength, skewX: 3, duration: 0.12, ease: "power2.out" })
          .to(c, { rotationX: 15 * strength, skewX: -2.5, duration: 0.18, ease: "sine.inOut" })
          .to(c, { rotationX: -9 * strength, skewX: 1.5, duration: 0.2, ease: "sine.inOut" })
          .to(c, { rotationX: 5, skewX: -1, duration: 0.22, ease: "sine.inOut" })
          .to(c, { rotationX: 0, skewX: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        // ripples running through the cloth
        if (wave.current && turb.current) {
          c.classList.add("is-flapping");
          gsap.timeline({ onComplete: () => c.classList.remove("is-flapping") })
            .fromTo(wave.current, { attr: { scale: 0 } }, { attr: { scale: 26 * strength }, duration: 0.15 })
            .to(wave.current, { attr: { scale: 0 }, duration: 1.1, ease: "power2.out" })
            .fromTo(turb.current, { attr: { seed: 1 } }, { attr: { seed: 9 }, duration: 1.25, ease: "steps(9)" }, 0);
        }
        // slime drips off the bottom edge
        const d = drips.current;
        if (d) {
          d.querySelectorAll<HTMLElement>(".slime").forEach((el, k) => {
            const goo = el.querySelector<HTMLElement>(".slime__goo");
            const drop = el.querySelector(".slime__drop");
            if (!goo) return;
            const len = 1.8 + Math.random() * 2.2;
            const stretch = goo.offsetHeight * (len - 1);
            gsap.timeline({ delay: 0.15 + k * 0.05 + Math.random() * 0.2 })
              .to(goo, { scaleY: len, duration: 0.6, ease: "power2.in" })
              .fromTo(drop, { y: stretch, opacity: 1, scale: 1 }, { y: stretch + 150 + Math.random() * 90, opacity: 0, scale: 0.7, duration: 0.7, ease: "power2.in" })
              .to(goo, { scaleY: 1, duration: 2.2, ease: "power1.out" }, "<");
          });
        }
      }),
    [],
  );

  return (
    <div className="banner">
      <BulbString count={13} sag={34} listen className="banner__bulbs" />
      <div className="banner__ropes" aria-hidden="true" />
      <div ref={cloth} className="banner__cloth">
        <img className="banner__print" src={asset("/doodles/banner-0.svg")} alt="" width={1024} height={512} fetchPriority="high" draggable={false} />
        <div className="banner__shade" aria-hidden="true" />
        <div className="banner__content">
          <ZombieLogo interactive className="banner__logo" />
          <div className="banner__text">
            {title}
            {tagline}
          </div>
        </div>
        <span className="banner__eyelet banner__eyelet--l" aria-hidden="true" />
        <span className="banner__eyelet banner__eyelet--r" aria-hidden="true" />
      </div>
      <div ref={drips} className="banner__drips" aria-hidden="true">
        {DRIPS.map((x, k) => (
          <span key={k} className="slime" style={{ left: `${x}%`, ["--s" as string]: 0.6 + ((k * 37) % 5) / 8 }}>
            <span className="slime__goo" />
            <span className="slime__drop" />
          </span>
        ))}
      </div>
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <filter id="flap" x="-5%" y="-5%" width="110%" height="120%">
          <feTurbulence ref={turb} type="turbulence" baseFrequency="0.006 0.035" numOctaves="1" seed="1" />
          <feDisplacementMap ref={wave} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
