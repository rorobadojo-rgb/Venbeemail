// DOM micro-effects: slime splats, lightning bursts, camera flash, spark trails, melting buttons.
import gsap from 'gsap';
import { state } from './state.js';

function relRect(el, layer) {
  const a = el.getBoundingClientRect(), b = layer.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
}
function blob(layer, x, y, size, color, cls = 'goo-blob') {
  const d = document.createElement('div');
  d.className = cls;
  d.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${color}`;
  layer.appendChild(d);
  return d;
}

/** Blob bursts out of `el`, then drips run down the panel for ~1.5s. `layer` carries the goo filter. */
export function slimeSplat(el, layer, color) {
  const r = relRect(el, layer);
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  if (state.reduced) return;
  const parts = [];
  const core = blob(layer, cx, cy, r.h * 1.1, color);
  parts.push(core);
  gsap.fromTo(core, { scale: 0.2 }, { scale: 1.6, duration: 0.18, ease: 'power2.out' });
  gsap.to(core, { scale: 0, duration: 0.5, delay: 0.3, ease: 'power2.in' });
  for (let i = 0; i < 10; i++) {
    const s = 8 + Math.random() * 20;
    const b = blob(layer, cx, cy, s, color);
    parts.push(b);
    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    gsap.timeline()
      .to(b, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * 0.6 - 20, duration: 0.35, ease: 'power3.out' })
      .to(b, { y: '+=' + (60 + Math.random() * 90), scale: 0.3, opacity: 0, duration: 0.9, ease: 'power2.in' });
  }
  for (let i = 0; i < 3; i++) {
    const w = 10 + Math.random() * 8;
    const d = document.createElement('div');
    d.className = 'goo-drip';
    d.style.cssText = `left:${cx - r.w * 0.35 + Math.random() * r.w * 0.7}px;top:${r.y + r.h - 6}px;width:${w}px;background:${color}`;
    layer.appendChild(d);
    parts.push(d);
    const len = 90 + Math.random() * 160;
    gsap.timeline()
      .fromTo(d, { height: 6 }, { height: len, duration: 1.2 + Math.random() * 0.3, ease: 'sine.in' })
      .to(d, { opacity: 0, y: 30, duration: 0.3 }, '-=0.25');
  }
  gsap.delayedCall(1.8, () => parts.forEach((p) => p.remove()));
}

/** Lightning bolts radiating from a button. */
export function lightningBurst(el) {
  if (state.reduced) return;
  const r = el.getBoundingClientRect();
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  const size = Math.max(r.width, r.height) * 2.4;
  svg.setAttribute('viewBox', '-100 -100 200 200');
  svg.classList.add('fx-burst');
  svg.style.cssText = `left:${r.left + r.width / 2 - size / 2}px;top:${r.top + r.height / 2 - size / 2}px;width:${size}px;height:${size}px`;
  const cols = ['#B4FF1A', '#FFE81F', '#22E6FF', '#F5E6C8'];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 360 + Math.random() * 20;
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `rotate(${a})`);
    g.innerHTML = `<polygon points="42,-5 62,-9 58,-2 84,-6 60,6 64,-1 44,4" fill="${cols[i % 4]}" stroke="#0A0A0A" stroke-width="2.5" stroke-linejoin="round"/>`;
    svg.appendChild(g);
  }
  document.body.appendChild(svg);
  gsap.fromTo(svg, { scale: 0.3, opacity: 1, rotation: -10 }, { scale: 1.15, rotation: 10, duration: 0.35, ease: 'power3.out' });
  gsap.to(svg, { opacity: 0, duration: 0.25, delay: 0.25, onComplete: () => svg.remove() });
}

/** Full-screen camera flash. */
export function cameraFlash() {
  const f = document.getElementById('flash');
  if (!f) return;
  gsap.fromTo(f, { opacity: state.reduced ? 0.3 : 0.9 }, { opacity: 0, duration: 0.45, ease: 'power2.out' });
}

/** Sparks trailing around a spinning icon. */
export function sparkTrail(icon) {
  if (state.reduced) return;
  const r = icon.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width * 0.7;
  const cols = ['#FFE81F', '#FF8A1F', '#F5E6C8'];
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('div');
    d.className = 'fx-spark';
    d.style.background = cols[i % 3];
    document.body.appendChild(d);
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    gsap.set(d, { left: cx + Math.cos(a) * rad, top: cy + Math.sin(a) * rad, scale: 0 });
    gsap.timeline({ delay: (i / 14) * 0.55, onComplete: () => d.remove() })
      .to(d, { scale: 1, duration: 0.05 })
      .to(d, { x: Math.cos(a) * 18, y: Math.sin(a) * 18 + 10, scale: 0, opacity: 0, duration: 0.45, ease: 'power2.out' });
  }
}

/** A button melts into slime and re-forms. */
export function meltButton(btn, layer, color = '#FF3A1F') {
  if (state.reduced) return gsap.fromTo(btn, { opacity: 0.4 }, { opacity: 1, duration: 0.4 });
  const r = relRect(btn, layer);
  for (let i = 0; i < 5; i++) {
    const d = document.createElement('div');
    d.className = 'goo-drip';
    d.style.cssText = `left:${r.x + 8 + (i / 4) * (r.w - 26)}px;top:${r.y + r.h * 0.55}px;width:${12 + Math.random() * 8}px;background:${color}`;
    layer.appendChild(d);
    gsap.timeline({ onComplete: () => d.remove() })
      .fromTo(d, { height: 8 }, { height: 40 + Math.random() * 70, duration: 0.55, ease: 'power2.in' })
      .to(d, { height: 0, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' });
  }
  return gsap.timeline()
    .to(btn, { scaleY: 0.35, scaleX: 1.25, y: 18, borderRadius: '40% 40% 12px 12px', duration: 0.45, ease: 'power2.in', transformOrigin: '50% 100%' })
    .to(btn, { scaleY: 1.12, scaleX: 0.92, y: -4, duration: 0.25, delay: 0.25 })
    .to(btn, { scaleY: 1, scaleX: 1, y: 0, borderRadius: '14px', duration: 0.8, ease: 'elastic.out(1, 0.35)', clearProps: 'borderRadius' });
}

export function squash(btn) {
  if (state.reduced) return;
  gsap.timeline()
    .to(btn, { scaleY: 0.72, scaleX: 1.18, duration: 0.08, ease: 'power2.out', transformOrigin: '50% 100%' })
    .to(btn, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.3)' });
}
