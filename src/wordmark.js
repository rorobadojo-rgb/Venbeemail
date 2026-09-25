// Custom hand-cut block lettering for "VenbeeMail" — every letter is its own SVG path.
// "Venbee" = colourful zombie slime, "Mail" = solid red cut-paper letters.
import gsap from 'gsap';
import { sfx } from './audio.js';
import { state } from './state.js';
import { shade } from './penguins.js';

// Letter outlines: [x, y] with y=0 at the top of the letter, flat sides + chipped notches.
const GLYPHS = {
  V: { w: 96, h: 118, rings: [[[0, 6], [12, 0], [40, 2], [47, 54], [54, 1], [96, 4], [92, 18], [62, 118], [33, 116]]], drips: [[40, 9], [55, 7]], eye: [26, 22], bite: [88, 34], stitch: [[64, 28], [76, 48]] },
  E: { w: 60, h: 84, rings: [[[0, 2], [52, 0], [60, 7], [60, 22], [28, 24], [28, 32], [56, 33], [57, 50], [28, 51], [28, 59], [60, 60], [58, 84], [2, 82]]], drips: [[12, 8], [44, 10]], eye: [14, 40], bite: [2, 60], stitch: [[10, 8], [22, 14]] },
  N: { w: 72, h: 86, rings: [[[0, 3], [40, 0], [47, 54], [54, 1], [72, 0], [70, 86], [32, 85], [25, 30], [18, 86], [1, 84]]], drips: [[9, 9], [52, 10]], eye: [62, 20], bite: [70, 60], stitch: [[4, 30], [16, 44]] },
  B: { w: 66, h: 88, rings: [[[0, 0], [54, 2], [64, 12], [62, 38], [54, 44], [66, 52], [64, 88], [4, 86]], [[22, 17], [40, 18], [39, 28], [22, 28]], [[22, 57], [42, 58], [41, 70], [22, 69]]], drips: [[20, 10], [50, 8]], eye: [48, 40], bite: [2, 40], stitch: [[44, 76], [58, 64]] },
  M: { w: 104, h: 112, rings: [[[0, 4], [28, 0], [52, 44], [76, 2], [104, 0], [102, 112], [78, 110], [76, 54], [58, 82], [46, 82], [30, 56], [28, 112], [0, 110]]] },
  A: { w: 80, h: 88, rings: [[[18, 10], [26, 0], [58, 2], [80, 88], [54, 88], [50, 72], [30, 72], [26, 88], [0, 86]], [[34, 54], [41, 24], [47, 54]]] },
  I: { w: 32, h: 90, rings: [[[2, 0], [32, 3], [30, 40], [24, 44], [30, 48], [29, 90], [0, 88]]] },
  L: { w: 64, h: 88, rings: [[[0, 0], [27, 1], [26, 60], [64, 58], [62, 88], [8, 88], [0, 80]]] },
};

export const SLIME = ['#B4FF1A', '#FF3DAE', '#22E6FF', '#9B4DFF', '#FF8A1F', '#FFE81F'];
const WORD = [
  ['V', 'slime'], ['E', 'slime'], ['N', 'slime'], ['B', 'slime'], ['E', 'slime'], ['E', 'slime'],
  ['M', 'mail'], ['A', 'mail'], ['I', 'mail'], ['L', 'mail'],
];
const ROT = [-6, 4, -3, 5, -4, 3, -5, 4, -3, 6];

function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
function ringsToPath(rings, rand) {
  return rings
    .map((ring) => 'M' + ring.map(([x, y]) => `${(x + (rand() - 0.5) * 3).toFixed(1)} ${(y + (rand() - 0.5) * 3).toFixed(1)}`).join('L') + 'Z')
    .join('');
}
const dripPath = (w, L) => `M${-w / 2} -6L${-w / 2} ${L}A${w / 2} ${w / 2} 0 0 0 ${w / 2} ${L}L${w / 2} -6Z`;

let instance = 0;

export function buildWordmark(host, { interactive = true, entrance = true, glow = false } = {}) {
  const id = `wm${instance++}`;
  const rand = seeded(1234);
  let x = 20;
  const base = 172;
  let defs = `<filter id="${id}-wob" x="-10%" y="-20%" width="120%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n">${state.reduced ? '' : '<animate attributeName="baseFrequency" dur="7s" values="0.014;0.026;0.014" repeatCount="indefinite"/>'}</feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  let slime = '', mail = '';

  WORD.forEach(([ch, kind], i) => {
    const G = GLYPHS[ch];
    if (i === 6) x += 18;
    const wave = Math.sin(i * 0.95) * 7;
    const y = base - G.h + wave;
    const d = ringsToPath(G.rings, rand);
    const open = `<g class="slot" transform="translate(${x} ${y.toFixed(1)})"><g transform="rotate(${ROT[i]} ${G.w / 2} ${G.h})"><g class="ltr ltr-${kind}" data-i="${i}" data-w="${G.w}" data-h="${G.h}">`;
    const close = `</g></g></g>`;
    if (kind === 'slime') {
      const si = i;
      const c = SLIME[si];
      const dark = shade(c, -0.45);
      defs += `<linearGradient id="${id}-g${i}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${shade(c, 0.55)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.25)}"/></linearGradient>`;
      defs += `<clipPath id="${id}-c${i}"><path d="${d}" clip-rule="evenodd"/></clipPath>`;
      const [bx, by] = G.bite;
      const bites = [-7, 0, 7].map((o, k) => `<circle cx="${bx + o * 0.7}" cy="${by + o}" r="${6 - Math.abs(o) / 4 + (k === 1 ? 1 : 0)}"/>`).join('');
      defs += `<mask id="${id}-m${i}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="${G.w + 40}" height="${G.h + 60}"><rect x="-20" y="-20" width="${G.w + 40}" height="${G.h + 60}" fill="#fff"/><g fill="#000">${bites}</g></mask>`;
      const drips = G.drips
        .map(([dx, w]) => {
          const L = 10 + rand() * 18;
          return `<g class="drip" transform="translate(${dx} ${G.h - 4})"><path class="stalk" d="${dripPath(w, L)}" fill="${c}" stroke="${dark}" stroke-width="2.5"/><circle class="drop" cx="0" cy="${L + w * 0.3}" r="${w * 0.55}" fill="${c}" stroke="${dark}" stroke-width="2" opacity="0"/><ellipse cx="${-w * 0.18}" cy="${L - 2}" rx="${w * 0.14}" ry="${w * 0.3}" fill="#fff" opacity=".55"/></g>`;
        })
        .join('');
      const bubbles = [0, 1, 2]
        .map((k) => `<circle class="bub" cx="${(G.w * (0.22 + k * 0.27 + rand() * 0.06)).toFixed(1)}" cy="${(G.h * (0.55 + rand() * 0.35)).toFixed(1)}" r="${(2 + rand() * 3).toFixed(1)}" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-opacity=".75" stroke-width="1.4"/>`)
        .join('');
      const [s0, s1] = G.stitch;
      const ang = Math.atan2(s1[1] - s0[1], s1[0] - s0[0]);
      const nx = -Math.sin(ang) * 6, ny = Math.cos(ang) * 6;
      let ticks = '';
      for (let k = 0.2; k < 1; k += 0.3) {
        const px = s0[0] + (s1[0] - s0[0]) * k, py = s0[1] + (s1[1] - s0[1]) * k;
        ticks += `M${(px - nx).toFixed(1)} ${(py - ny).toFixed(1)}L${(px + nx).toFixed(1)} ${(py + ny).toFixed(1)}`;
      }
      const [ex, ey] = G.eye;
      slime += open +
        `<g class="drips">${drips}</g>` +
        `<path class="body" d="${d}" fill="url(#${id}-g${i})" fill-opacity=".93" fill-rule="evenodd" stroke="${dark}" stroke-width="3.5" stroke-linejoin="round" mask="url(#${id}-m${i})"/>` +
        `<g clip-path="url(#${id}-c${i})" mask="url(#${id}-m${i})">` +
        `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" transform="translate(-3 -3)"/>` +
        `<ellipse cx="${G.w * 0.3}" cy="${G.h * 0.18}" rx="${G.w * 0.16}" ry="${G.h * 0.07}" fill="#fff" opacity=".55" transform="rotate(-20 ${G.w * 0.3} ${G.h * 0.18})"/>` +
        `<rect x="0" y="${G.h * 0.8}" width="${G.w}" height="${G.h * 0.2}" fill="${dark}" opacity=".25"/>` +
        bubbles +
        `<g fill="none" stroke="${dark}" stroke-width="2.5">${bites.replace(/<circle /g, '<circle fill="none" ')}</g>` +
        `</g>` +
        `<path d="M${s0[0]} ${s0[1]}L${s1[0]} ${s1[1]}${ticks}" stroke="#0A0A0A" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>` +
        `<g class="eye" transform="translate(${ex} ${ey})"><g class="eyeball" transform="scale(0)"><circle r="7.5" fill="#F5E6C8" stroke="#0A0A0A" stroke-width="2.5"/><path d="M-6 3q3 -1 5 2M2 -6q3 1 4 4" stroke="#FF3A1F" stroke-width="1" fill="none"/><circle class="pupil" r="3.2" fill="#0A0A0A"/></g></g>` +
        close;
    } else {
      mail += open +
        `<path d="${d}" transform="translate(7 7)" fill="#0A0A0A" stroke="#0A0A0A" stroke-width="7" stroke-linejoin="round" fill-rule="evenodd"/>` +
        `<path class="body" d="${d}" fill="#FF3A1F" stroke="#F5E6C8" stroke-width="7" stroke-linejoin="round" paint-order="stroke" fill-rule="evenodd"/>` +
        `<path d="${d}" fill="none" stroke="#0A0A0A" stroke-width="2" stroke-linejoin="round" opacity=".9"/>` +
        close;
    }
    x += G.w + 6;
  });

  const W = x + 20;
  host.innerHTML =
    `<svg class="wm-svg${glow ? ' wm-glow' : ''}" viewBox="0 0 ${W} 250" aria-hidden="true" focusable="false"><defs>${defs}</defs>` +
    `<g class="wm-venbee"><g filter="url(#${id}-wob)">${slime}</g></g><g class="wm-mail">${mail}</g></svg>`;

  const svg = host.querySelector('svg');
  const letters = [...svg.querySelectorAll('.ltr')];
  const slimeLetters = letters.filter((l) => l.classList.contains('ltr-slime'));
  letters.forEach((l) => gsap.set(l, { transformOrigin: `${l.dataset.w / 2}px ${l.dataset.h}px` }));

  if (state.reduced) return { svg, letters };

  /* ---- idle life ---- */
  const idle = () => {
    slimeLetters.forEach((l, k) => {
      gsap.to(l, { scaleY: 1.05, scaleX: 0.96, skewX: k % 2 ? 2 : -2, duration: 1.1 + k * 0.17, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      l.querySelectorAll('.drip').forEach((drip) => dripLoop(drip, 1 + Math.random() * 4));
      l.querySelectorAll('.bub').forEach((b, j) => {
        const d = 2.6 + j * 0.7;
        gsap.timeline({ repeat: -1, delay: j * 0.9 + k * 0.3 })
          .fromTo(b, { y: 0, scale: 0.6 }, { y: -Number(l.dataset.h) * 0.6, scale: 1.2, duration: d, ease: 'sine.in', transformOrigin: '50% 50%' }, 0)
          .fromTo(b, { opacity: 0 }, { opacity: 1, duration: d * 0.3 }, 0)
          .to(b, { opacity: 0, duration: d * 0.3 }, d * 0.7);
      });
    });
    letters.filter((l) => !l.classList.contains('ltr-slime')).forEach((l, k) => {
      gsap.to(l, { y: -4, rotation: k % 2 ? 1.5 : -1.5, duration: 0.9 + k * 0.13, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    const pop = () => {
      const l = slimeLetters[Math.floor(Math.random() * slimeLetters.length)];
      const eye = l.querySelector('.eyeball'), pupil = l.querySelector('.pupil');
      gsap.timeline()
        .to(eye, { scale: 1.25, duration: 0.25, ease: 'back.out(3)', transformOrigin: '50% 50%' })
        .to(eye, { scale: 1, duration: 0.15 })
        .to(pupil, { x: 2.5, y: -1, duration: 0.2 })
        .to(pupil, { x: -2.5, y: 1, duration: 0.25, delay: 0.3 })
        .to(pupil, { x: 0, y: 0, duration: 0.2, delay: 0.3 })
        .to(eye, { scale: 0, duration: 0.25, ease: 'back.in(3)', delay: 0.2 });
      gsap.delayedCall(2.5 + Math.random() * 4, pop);
    };
    gsap.delayedCall(3.5, pop);
  };

  if (entrance) {
    const tl = gsap.timeline({ delay: 0.35, onComplete: idle });
    letters.forEach((l, k) => {
      const t0 = k * 0.08;
      const side = k % 2 ? 1 : -1;
      tl.fromTo(l, { y: -620, rotation: side * 25, scaleX: 0.8, scaleY: 1.25 }, { y: 0, rotation: 0, scaleX: 0.9, scaleY: 1.15, duration: 0.55, ease: 'power3.in' }, t0)
        .to(l, { scaleY: 0.32, scaleX: 1.55, duration: 0.09, ease: 'power2.out' }, t0 + 0.55)
        // zombie getting up: lurch, stagger, snap into shape
        .to(l, { scaleY: 0.72, scaleX: 1.18, rotation: side * 16, duration: 0.3, ease: 'power1.inOut' }, t0 + 0.72)
        .to(l, { scaleY: 1.12, scaleX: 0.9, rotation: -side * 7, duration: 0.22, ease: 'power2.out' })
        .to(l, { scaleY: 1, scaleX: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' });
    });
  } else {
    idle();
  }

  if (!interactive) return { svg, letters };

  /* ---- interaction ---- */
  const busy = new WeakSet();
  letters.forEach((l) => {
    const isSlime = l.classList.contains('ltr-slime');
    l.style.cursor = 'pointer';
    l.addEventListener('pointerenter', () => {
      if (busy.has(l)) return;
      if (isSlime) {
        sfx('glorp', { throttle: 120, rate: 0.85 + Math.random() * 0.4 });
        gsap.timeline()
          .to(l, { scaleY: 0.78, scaleX: 1.2, duration: 0.12, ease: 'power2.out', overwrite: 'auto' })
          .to(l, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.3)' });
        l.querySelectorAll('.stalk').forEach((s) => gsap.fromTo(s, { scaleY: 1 }, { scaleY: 2.3, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', transformOrigin: '50% 0%' }));
      } else {
        sfx('pop', { throttle: 90 });
        gsap.fromTo(l, { y: 0 }, { y: -14, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' });
      }
    });
    l.addEventListener('click', () => {
      if (busy.has(l)) return;
      busy.add(l);
      if (isSlime) {
        sfx('squish');
        const stalks = l.querySelectorAll('.stalk');
        gsap.timeline({ onComplete: () => busy.delete(l) })
          .to(l, { scaleY: 0.08, scaleX: 1.75, duration: 0.6, ease: 'power2.in', overwrite: 'auto' })
          .to(stalks, { scaleY: 0.2, duration: 0.3, transformOrigin: '50% 0%' }, '<')
          .to(l, { x: '+=6', duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, '+=0.35')
          .to(l, { scaleY: 0.5, scaleX: 1.3, rotation: -10, duration: 0.45, ease: 'power1.out' })
          .call(() => sfx('glorp', { rate: 0.7 }))
          .to(l, { scaleY: 1.15, scaleX: 0.9, rotation: 5, duration: 0.3 })
          .to(l, { scaleY: 1, scaleX: 1, rotation: 0, x: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
          .to(stalks, { scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, '<');
      } else {
        sfx('drum', { rate: 1.4 });
        gsap.timeline({ onComplete: () => busy.delete(l) })
          .to(l, { scaleY: 0.6, scaleX: 1.3, duration: 0.08 })
          .to(l, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1.3, 0.3)' });
      }
    });
  });
  return { svg, letters };
}

function dripLoop(drip, delay) {
  const stalk = drip.querySelector('.stalk'), drop = drip.querySelector('.drop');
  const tl = gsap.timeline({ delay, repeat: -1, repeatDelay: 1 + Math.random() * 3 });
  tl.to(stalk, { scaleY: 2.1, duration: 1.8, ease: 'sine.in', transformOrigin: '50% 0%' })
    .fromTo(drop, { opacity: 1, scale: 1, y: Number(drop.getAttribute('cy')) * 1.1, transformOrigin: '50% 50%' }, { y: '+=90', opacity: 0, scaleY: 1.3, duration: 0.6, ease: 'power2.in' })
    .to(stalk, { scaleY: 0.55, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, '<')
    .to(stalk, { scaleY: 1, duration: 1.2, ease: 'sine.inOut' });
}
