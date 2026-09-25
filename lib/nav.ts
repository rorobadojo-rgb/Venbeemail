import { useSyncExternalStore } from "react";

/**
 * Step navigation. In cinematic mode the comic page is one pinned scene, so
 * "go to panel 2" means "scroll to the scroll position of label 2"; ComicPage
 * registers that resolver. Without it we fall back to plain anchors.
 */
export const STEPS = [
  { id: "mulai", label: "Mulai" },
  { id: "generator", label: "Mesin" },
  { id: "fitur", label: "Fitur" },
  { id: "inbox", label: "Inbox" },
  { id: "halaman", label: "Halaman" },
  { id: "tamat", label: "Tamat" },
] as const;

type Resolver = (step: number, smooth: boolean) => boolean;
let resolver: Resolver | null = null;
const listeners = new Set<(step: number) => void>();
let current = 0;

export function registerStepResolver(r: Resolver | null) {
  resolver = r;
}

export function goToStep(step: number, smooth = true) {
  if (resolver?.(step, smooth)) return;
  const el = document.getElementById(STEPS[step]?.id ?? "");
  el?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

export function setCurrentStep(step: number) {
  if (step === current) return;
  current = step;
  listeners.forEach((l) => l(step));
}

export function getCurrentStep() {
  return current;
}

export function onStepChange(l: (step: number) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Current comic step as React state. */
export function useStep() {
  return useSyncExternalStore(
    (l) => onStepChange(() => l()),
    getCurrentStep,
    () => 0,
  );
}
