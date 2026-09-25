// The official logo as a floating, extruded 3D sticker (stacked CSS 3D layers).
import gsap from 'gsap';
import { SIL, RED, GREY, BLACK, ANGER_GREY, ANGER_BLACK, LOGO_W, LOGO_H } from './logo-data.js';
import { state } from './state.js';
import { sfx } from './audio.js';

export function logoSVG(cls = '') {
  return `<svg class="${cls}" viewBox="0 0 ${LOGO_W} ${LOGO_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<path fill="#F5E6C8" d="${SIL}"/><path fill="#FF3A1F" fill-rule="evenodd" d="${RED}"/>` +
    `<path fill="#9A9082" fill-rule="evenodd" d="${GREY}"/><path fill="#0A0A0A" fill-rule="evenodd" d="${BLACK}"/>` +
    `<g class="anger"><path fill="#9A9082" fill-rule="evenodd" d="${ANGER_GREY}"/><path fill="#0A0A0A" fill-rule="evenodd" d="${ANGER_BLACK}"/></g></svg>`;
}

const silSVG = (fill) =>
  `<svg viewBox="0 0 ${LOGO_W} ${LOGO_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="${fill}" d="${SIL}"/></svg>`;

export function buildLogoSticker(host) {
  const depth = 12;
  let edges = '';
  for (let i = 0; i < depth; i++) {
    const k = i / (depth - 1);
    const shadeC = `hsl(38 ${30 + k * 22}% ${38 + k * 34}%)`;
    edges += `<div class="stk-layer" style="transform:translateZ(${(-(depth - i) * 1.6).toFixed(1)}px)">${silSVG(shadeC)}</div>`;
  }
  const mask = `url("data:image/svg+xml,${encodeURIComponent(silSVG('#000'))}")`;
  host.innerHTML =
    `<div class="stk-float"><div class="stk">${edges}` +
    `<div class="stk-layer stk-face">${logoSVG('stk-art')}</div>` +
    `<div class="stk-layer stk-gloss" style="-webkit-mask-image:${mask};mask-image:${mask}"></div>` +
    `</div></div>`;

  const stk = host.querySelector('.stk');
  const float = host.querySelector('.stk-float');
  const anger = host.querySelector('.anger');
  const gloss = host.querySelector('.stk-gloss');

  if (state.reduced) return;

  gsap.set(stk, { rotationY: -14, rotationX: 6 });
  gsap.to(stk, { rotationY: 16, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(stk, { rotationX: -6, duration: 2.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(float, { y: -12, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(gloss, { backgroundPosition: '220% 0', duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  const pulse = gsap.to(anger, { scale: 1.12, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' });

  gsap.from(float, { scale: 0, rotation: -40, duration: 1.1, ease: 'back.out(2)', delay: 0.1 });

  let shaking = null;
  host.addEventListener('pointerenter', () => {
    sfx('drum', { throttle: 400, rate: 0.8 });
    pulse.timeScale(4);
    gsap.to(anger, { scale: 1.45, duration: 0.15, overwrite: false });
    shaking?.kill();
    shaking = gsap.timeline({ repeat: -1 })
      .to(host, { x: -5, rotation: -4, duration: 0.05 })
      .to(host, { x: 5, rotation: 4, duration: 0.05 })
      .to(host, { x: -3, rotation: -2, duration: 0.05 })
      .to(host, { x: 3, rotation: 3, duration: 0.05 });
  });
  host.addEventListener('pointerleave', () => {
    shaking?.kill();
    pulse.timeScale(1);
    gsap.to(host, { x: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
}
