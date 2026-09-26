"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Adds `is-in` once the element scrolls into view (CSS does the rest). */
export function Reveal({ as: Tag = "section", className = "", children, ...rest }: { as?: "section" | "div"; className?: string; children: ReactNode; id?: string; "aria-labelledby"?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
