/**
 * Shared pointer position, normalised to -1..1 from the viewport centre.
 * Written by one passive listener; read every frame by the 3D camera and the
 * logo's pupils, so nothing re-renders React.
 */
export const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, active: false };

let started = false;
export function trackPointer() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.active = true;
    },
    { passive: true },
  );
}
