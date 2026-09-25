// Procedural canvas textures for the skatepark — no image downloads needed.
import * as THREE from 'three';

const SLIME = ['#B4FF1A', '#FF3DAE', '#22E6FF', '#9B4DFF', '#FF8A1F', '#FFE81F', '#FF3A1F'];

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}
function tex(c, { repeat, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  t.anisotropy = 4;
  return t;
}
function speckle(ctx, w, h, r, n, alpha) {
  for (let i = 0; i < n; i++) {
    const v = Math.floor(r() * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

export function concreteTexture(repeat = [8, 8], seed = 3, base = '#8f8a82') {
  const [c, ctx] = canvas(512, 512);
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 40 + r() * 120);
    g.addColorStop(0, `rgba(${r() > 0.5 ? '255,240,220' : '40,35,30'},${0.05 + r() * 0.07})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  }
  speckle(ctx, 512, 512, r, 9000, 0.35);
  ctx.strokeStyle = 'rgba(30,26,22,.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 510, 510); // expansion joints
  ctx.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    let x = r() * 512, y = r() * 512;
    ctx.moveTo(x, y);
    for (let s = 0; s < 12; s++) {
      x += (r() - 0.5) * 50;
      y += (r() - 0.3) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return tex(c, { repeat });
}

export function woodTexture() {
  const [c, ctx] = canvas(512, 256);
  const r = rng(9);
  ctx.fillStyle = '#b8864f';
  ctx.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 2) {
    ctx.strokeStyle = `rgba(90,50,20,${0.08 + r() * 0.16})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 512; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(40,20,10,.7)';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  // stickers + gaffer tape
  ['#B4FF1A', '#FF3DAE', '#22E6FF', '#FFE81F'].forEach((col, i) => {
    ctx.save();
    ctx.translate(60 + i * 120 + r() * 30, 60 + r() * 140);
    ctx.rotate((r() - 0.5) * 0.8);
    ctx.fillStyle = col;
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-22, -14, 44, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
  ctx.fillStyle = 'rgba(20,20,20,.85)';
  ctx.fillRect(0, 118, 512, 16);
  return tex(c);
}

function doodle(ctx, r, x, y, s) {
  const col = SLIME[Math.floor(r() * SLIME.length)];
  const k = Math.floor(r() * 9);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((r() - 0.5) * 0.6);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#0A0A0A';
  ctx.fillStyle = col;
  ctx.beginPath();
  switch (k) {
    case 0: { // star
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 22 : 50;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      break;
    }
    case 1: // lightning bolt
      [[10, -60], [-26, 6], [-2, 6], [-14, 60], [28, -10], [4, -10], [18, -60]].forEach(([a, b]) => ctx.lineTo(a, b));
      ctx.closePath();
      break;
    case 2: { // dripping blob
      ctx.moveTo(-50, 0);
      ctx.bezierCurveTo(-55, -60, 55, -60, 50, 0);
      for (let i = 0; i < 5; i++) {
        const dx = 50 - i * 22;
        ctx.lineTo(dx, 10 + (i % 2) * 30);
        ctx.arc(dx - 6, 10 + (i % 2) * 30, 6, 0, Math.PI);
      }
      ctx.closePath();
      break;
    }
    case 3: // eye
      ctx.ellipse(0, 0, 60, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = '#0A0A0A';
      ctx.arc(8, 0, 16, 0, Math.PI * 2);
      break;
    case 4: // crown
      [[-50, 30], [-50, -20], [-25, 5], [0, -40], [25, 5], [50, -20], [50, 30]].forEach(([a, b]) => ctx.lineTo(a, b));
      ctx.closePath();
      break;
    case 5: { // spiral
      ctx.lineWidth = 10;
      ctx.strokeStyle = col;
      for (let a = 0; a < 16; a += 0.2) ctx.lineTo(Math.cos(a) * a * 3.5, Math.sin(a) * a * 3.5);
      ctx.stroke();
      ctx.restore();
      return;
    }
    case 6: // angry face blob (nods to the logo)
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath();
      ctx.moveTo(-34, -24); ctx.lineTo(-6, -8); ctx.lineTo(-10, 2); ctx.lineTo(-34, -10); ctx.closePath();
      ctx.moveTo(34, -24); ctx.lineTo(6, -8); ctx.lineTo(10, 2); ctx.lineTo(34, -10); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#F5E6C8';
      ctx.beginPath();
      ctx.rect(-26, 14, 52, 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    case 7: // arrow
      [[-60, -10], [20, -10], [20, -34], [60, 0], [20, 34], [20, 10], [-60, 10]].forEach(([a, b]) => ctx.lineTo(a, b));
      ctx.closePath();
      break;
    default: // bubbles
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(i * 26 - 40 + 18, (i % 2) * 20);
        ctx.arc(i * 26 - 40, (i % 2) * 20, 18, 0, Math.PI * 2);
      }
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function graffitiTexture(seed) {
  const [c, ctx] = canvas(1024, 256);
  const r = rng(seed);
  ctx.fillStyle = '#7d766c';
  ctx.fillRect(0, 0, 1024, 256);
  speckle(ctx, 1024, 256, r, 6000, 0.3);
  // painted background swaths
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = SLIME[Math.floor(r() * SLIME.length)] + '55';
    ctx.beginPath();
    ctx.ellipse(r() * 1024, 90 + r() * 90, 120 + r() * 120, 50 + r() * 40, r(), 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 9; i++) doodle(ctx, r, 60 + i * 110 + (r() - 0.5) * 40, 70 + r() * 110, 0.7 + r() * 0.6);
  // paint drips running down
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = SLIME[Math.floor(r() * SLIME.length)];
    const x = r() * 1024, y = 60 + r() * 120, l = 20 + r() * 60;
    ctx.fillRect(x, y, 3, l);
    ctx.beginPath();
    ctx.arc(x + 1.5, y + l, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // grime at the bottom
  const g = ctx.createLinearGradient(0, 180, 0, 256);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(20,15,10,.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 256);
  return tex(c);
}

export function fenceTexture() {
  const [c, ctx] = canvas(128, 128);
  ctx.strokeStyle = '#c9cbc9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(128, 128);
  ctx.moveTo(128, 0); ctx.lineTo(0, 128);
  ctx.moveTo(64, -64); ctx.lineTo(192, 64);
  ctx.moveTo(-64, 64); ctx.lineTo(64, 192);
  ctx.moveTo(64, -64); ctx.lineTo(-64, 64);
  ctx.moveTo(192, 64); ctx.lineTo(64, 192);
  ctx.stroke();
  const t = tex(c, { repeat: [30, 5] });
  return t;
}

export function ampTexture() {
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#262626';
  for (let y = 40; y < 250; y += 6) for (let x = 12; x < 244; x += 6) ctx.fillRect(x, y, 3, 3);
  ctx.fillStyle = '#F5E6C8';
  ctx.fillRect(0, 0, 256, 32);
  ctx.fillStyle = '#0A0A0A';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(30 + i * 36, 16, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FF3A1F';
  ctx.beginPath();
  ctx.arc(236, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#F5E6C8';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);
  return tex(c);
}

export function glowTexture() {
  const [c, ctx] = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return tex(c, { srgb: false });
}

export function streakTexture() {
  const [c, ctx] = canvas(512, 32);
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 32);
  const v = ctx.getImageData(0, 0, 512, 32);
  for (let y = 0; y < 32; y++) {
    const f = Math.pow(1 - Math.abs(y - 15.5) / 16, 3);
    for (let x = 0; x < 512; x++) v.data[(y * 512 + x) * 4 + 3] *= f;
  }
  ctx.putImageData(v, 0, 0);
  return tex(c, { srgb: false });
}

export function boltTexture() {
  const [c, ctx] = canvas(512, 128);
  for (let k = 0; k < 4; k++) {
    ctx.save();
    ctx.translate(k * 128 + 64, 4);
    for (const [w, col] of [[10, 'rgba(180,255,26,.35)'], [4, '#B4FF1A'], [1.5, '#F9FFE0']]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.lineJoin = 'miter';
      const r2 = rng(k + 11);
      ctx.beginPath();
      let x = 0;
      ctx.moveTo(0, 0);
      for (let y = 12; y < 120; y += 12) {
        x += (r2() - 0.5) * 40;
        x = Math.max(-50, Math.min(50, x));
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  return tex(c, { srgb: false });
}

export function speedTexture() {
  const [c, ctx] = canvas(256, 128);
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      const f = x / 256;
      const rr = 3.2 * f * (0.6 + 0.4 * Math.sin(y * 0.3));
      ctx.fillStyle = `rgba(255,255,255,${0.9 * f})`;
      ctx.beginPath();
      ctx.arc(x + 4, y + 4, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const r = rng(7);
  ctx.strokeStyle = 'rgba(255,255,255,.95)';
  for (let i = 0; i < 14; i++) {
    const y = r() * 128, x = r() * 120;
    ctx.lineWidth = 1 + r() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 90 + r() * 60, y);
    ctx.stroke();
  }
  return tex(c, { srgb: false });
}

export function dotTexture() {
  const [c, ctx] = canvas(32, 32);
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return tex(c, { srgb: false });
}
