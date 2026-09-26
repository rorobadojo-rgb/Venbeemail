// The Zombie Mart poster wall: nine original posters (512 x 640) in the
// doodle-burst style of the brief, plus eyes-closed frames for the posters
// that blink. All art and text here is original to this project.
import {
  G1, G2, G3, INK, PINK, WHITE,
  bolt, bone, bubbles, bunny, can, cloud, drips, drop, eyeball, ghost, hand, mug, put, rays, robot, skull, sparkle, words, worm,
} from "./art.mjs";

export const W = 512;
export const H = 640;

/**
 * name:   file / atlas key
 * blink:  also render an eyes-closed frame
 * pulse:  the pink rays pulse (shader keys on the pink, CSS uses the rays layer)
 * torn:   which edges are ripped ("t", "r", "b", "l") + a missing corner
 * art(blink, raysOnly): poster body
 */
export const posters = [
  {
    name: "harga-mati",
    pulse: true,
    torn: "br",
    art: (b, raysOnly) => {
      const r = rays(256, 330, { n: 18, R: 520, seed: 7 });
      if (raysOnly) return r;
      return `${r}
        ${put(170, 420, 1.3, -38, bone)}${put(340, 420, 1.3, 38, bone)}
        ${put(256, 330, 1.9, -6, skull, { crown: true, blink: b })}
        ${put(92, 150, 0.55, -18, bolt)}${put(430, 520, 0.6, 20, bolt, { fill: PINK })}
        ${bubbles([[70, 520, 9], [96, 548, 5], [440, 140, 7], [462, 118, 4]])}
        ${words(256, 96, "HARGA MATI", { size: 54, rot: -4 })}
        ${words(256, 590, "DISKON SAMPAI MATI", { size: 30, rot: -2, fill: PINK })}`;
    },
  },
  {
    name: "hantu-subuh",
    blink: true,
    torn: "tl",
    art: (b) => `
      ${rays(-40, 700, { n: 9, a0: -90, a1: 0, R: 900, seed: 11 })}
      ${put(270, 320, 2.5, 6, ghost, { blink: b })}
      ${put(88, 170, 0.8, -10, drop, { fill: WHITE })}${put(430, 250, 0.6, 14, drop)}${put(410, 470, 0.9, -8, drop, { fill: WHITE })}
      ${bubbles([[120, 470, 10], [140, 500, 6], [400, 110, 8]])}
      ${put(110, 560, 0.7, -30, bone)}
      ${words(256, 88, "BELANJA", { size: 58, rot: -3 })}
      ${words(256, 600, "SAMPAI SUBUH", { size: 40, rot: -3, fill: PINK })}`,
  },
  {
    name: "robot-kaleng",
    blink: true,
    pulse: true,
    torn: "r",
    art: (b, raysOnly) => {
      const r = rays(150, 330, { n: 10, a0: -80, a1: 40, R: 620, seed: 5 });
      if (raysOnly) return r;
      return `${r}
        ${put(150, 440, 1.75, -4, robot, { blink: b })}
        ${put(380, 150, 0.7, 18, bolt)}${put(430, 420, 0.5, -12, bolt, { fill: PINK })}
        ${put(360, 560, 0.9, 10, sparkle)}
        ${put(88, 150, 0.62, -14, ghost, { blink: b, tongue: false })}
        ${put(300, 610, 0.7, 70, bone)}${put(470, 560, 0.5, 0, drop, { fill: WHITE })}
        ${words(470, 80, "BATERAI", { size: 44, rot: -6, anchor: "end" })}
        ${words(470, 128, "HABIS?", { size: 44, rot: -6, anchor: "end", fill: PINK })}`;
    },
  },
  {
    name: "gigit-dulu",
    torn: "bl",
    art: () => `
      ${rays(256, 760, { n: 12, a0: -170, a1: -10, R: 800, seed: 23 })}
      ${put(256, 430, 2.6, -4, bunny)}
      ${put(80, 130, 0.6, -20, bolt)}${put(440, 180, 0.8, 16, bolt, { fill: PINK })}
      ${bubbles([[410, 310, 8], [430, 334, 5], [90, 300, 7]])}
      ${words(256, 96, "GIGIT DULU", { size: 50, rot: -5 })}
      ${words(256, 148, "BAYAR NANTI", { size: 34, rot: -5, fill: PINK })}`,
  },
  {
    name: "kopi-kuburan",
    torn: "t",
    art: () => `
      ${rays(256, 380, { n: 16, R: 520, seed: 31 })}
      <circle cx="256" cy="380" r="150" fill="${INK}"/>
      ${put(256, 400, 2.2, 3, mug)}
      ${put(90, 520, 0.9, 30, bone)}${put(430, 540, 0.9, -24, bone)}
      ${put(420, 120, 0.7, 20, sparkle)}${put(80, 200, 0.5, 0, sparkle, { fill: PINK })}
      ${words(256, 90, "KOPI KUBURAN", { size: 44, rot: -3 })}
      ${words(256, 600, "BUKA 24 JAM", { size: 38, rot: -3, fill: PINK })}`,
  },
  {
    name: "lorong-13",
    torn: "lb",
    art: () => {
      let pattern = "";
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
          const x = 70 + col * 125 + (row % 2) * 60;
          const y = 180 + row * 80;
          pattern += (row + col) % 3 === 0
            ? put(x, y, 0.5, (row * 37 + col * 53) % 60 - 30, skull, { iris: G2 })
            : put(x, y, 0.62, (row * 41 + col * 29) % 180, bone, { fill: (row + col) % 2 ? WHITE : G3 });
        }
      }
      return `<rect width="512" height="640" fill="${PINK}"/>
        <g opacity=".95">${pattern}</g>
        <rect x="40" y="40" width="432" height="112" fill="${INK}" transform="rotate(-3 256 96)"/>
        ${words(256, 124, "LORONG 13", { size: 64, rot: -3 })}`;
    },
  },
  {
    name: "awas-basah",
    blink: true,
    torn: "tr",
    art: (b) => `
      ${rays(256, -60, { n: 11, a0: 20, a1: 160, R: 820, seed: 43 })}
      ${put(256, 190, 2.4, -3, cloud, { blink: b })}
      ${put(150, 360, 0.95, -8, eyeball, { blink: b })}${put(300, 420, 1.2, 10, eyeball, { blink: b })}${put(410, 330, 0.7, 4, eyeball, { blink: b })}
      ${put(110, 470, 0.8, 0, drop, { fill: WHITE })}${put(220, 520, 0.6, 0, drop)}${put(420, 470, 0.9, 0, drop, { fill: WHITE })}
      <path d="M40 596L472 596" stroke="${G3}" stroke-width="10" stroke-dasharray="36 22"/>
      ${words(256, 585, "AWAS LANTAI BASAH", { size: 34, rot: -2, fill: PINK })}`,
  },
  {
    name: "minuman-otak",
    torn: "rb",
    art: () => `
      ${rays(256, 300, { n: 14, R: 560, seed: 59 })}
      <rect width="512" height="140" fill="${WHITE}"/>
      ${drips(0, 512, 150, WHITE, 9)}
      ${put(250, 520, 1.9, 4, hand)}
      ${put(262, 330, 1.7, 12, can)}
      ${put(90, 300, 0.7, -14, worm)}
      ${bubbles([[380, 220, 10], [404, 196, 6], [420, 250, 4], [120, 420, 7]])}
      ${words(256, 70, "MINUMAN OTAK", { size: 42, rot: -3, fill: INK, stroke: 0 })}
      ${words(256, 118, "DINGIN!", { size: 34, rot: -3, fill: INK, stroke: 0 })}`,
  },
  {
    name: "dilarang-gigit",
    torn: "l",
    art: () => `
      <rect width="512" height="640" fill="${G1}"/>
      ${rays(512, 640, { n: 8, a0: 180, a1: 270, R: 900, color: G2, seed: 61 })}
      <circle cx="256" cy="330" r="170" fill="${WHITE}" stroke="${INK}" stroke-width="10"/>
      <circle cx="256" cy="330" r="150" fill="none" stroke="${PINK}" stroke-width="30"/>
      ${put(256, 330, 1.7, -8, skull, {})}
      <path d="M150 436L362 224" stroke="${PINK}" stroke-width="30" stroke-linecap="round"/>
      ${words(256, 110, "DILARANG", { size: 52, rot: -2 })}
      ${words(256, 580, "MENGGIGIT KASIR", { size: 32, rot: -2, fill: PINK })}`,
  },
];
