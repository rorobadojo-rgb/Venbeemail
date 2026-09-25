/**
 * Shared, mutable camera state. The comic camera (GSAP) writes it every tick
 * and the WebGL doodle field reads it every frame, so neither side re-renders
 * React.
 *
 * panX / panY: centre of the view in page coordinates, in viewport heights.
 * zoom:        comic camera scale (1 = one panel fills the screen).
 * tiltX/tiltY: mouse parallax in radians (max ±6°).
 */
export const cameraBus = {
  panX: 0,
  panY: 0,
  zoom: 1,
  tiltX: 0,
  tiltY: 0,
  version: 0,
};

export function writeCamera(next: Partial<Omit<typeof cameraBus, "version">>) {
  Object.assign(cameraBus, next);
  cameraBus.version++;
}
