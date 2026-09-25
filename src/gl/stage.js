// The matte-black surface + instanced sticker bomb (one draw call for all stickers,
// one for their shadows, one texture atlas). Lazy-loaded after first paint.
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderMaterial,
  Mesh,
  TextureLoader,
  LinearMipmapLinearFilter,
  LinearFilter,
  DynamicDrawUsage,
  DoubleSide,
  NormalBlending,
  Vector3,
  MathUtils,
} from 'three';
import { gsap } from 'gsap';
import atlas from '../doodles/atlas.json';
import atlasUrl from '../assets/stickers.webp';
import atlasSmallUrl from '../assets/stickers-sm.webp';
import { stickerVert, stickerFrag, shadowVert, shadowFrag, surfaceVert, surfaceFrag } from './shaders.js';
import { buildLayout } from './layout.js';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { rand, shuffle } from '../lib/prefs.js';

const FOV = 30;
const LAYER = 1.2; // world px between stacked stickers

// Hit-test bitmasks are baked at build time (see scripts/build-atlas.mjs): no pixel readback.
const MASKS = new Map(atlas.items.map((it) => [it.id, Uint8Array.from(atob(it.mask), (c) => c.charCodeAt(0))]));
function opaqueAt(item, u, v) {
  const n = atlas.maskSize;
  const x = Math.min(n - 1, Math.floor(u * n));
  const y = Math.min(n - 1, Math.floor(v * n));
  return (MASKS.get(item.id)[(y * n + x) >> 3] >> (x & 7)) & 1;
}

/** Let the browser breathe between heavy init steps (keeps each task short). */
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

export async function createStage({ host, count, reduced, touch }) {
  let W = host.clientWidth;
  let H = host.clientHeight;

  // Decode the atlas off the main thread before touching WebGL.
  const texture = await new TextureLoader().loadAsync(touch ? atlasSmallUrl : atlasUrl);
  await texture.image.decode?.().catch(() => {});
  await yieldToMain();

  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x0a0a0a, 1);
  host.append(renderer.domElement);
  await yieldToMain();

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, W / H, 1, 10000);
  const placeCamera = () => {
    camera.aspect = W / H;
    camera.position.set(0, 0, H / 2 / Math.tan(MathUtils.degToRad(FOV / 2)));
    camera.far = camera.position.z * 3;
    camera.updateProjectionMatrix();
  };
  placeCamera();

  texture.premultiplyAlpha = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  // ── sticker state ──────────────────────────────────────────────
  const N = count;
  const S = buildLayout(N, W, H, atlas.items).map((l, i) => ({
    i,
    item: l.item,
    x: l.x,
    y: l.y,
    lift: 0,
    rot: l.rot,
    sx: 1,
    sy: 1,
    tiltX: 0,
    tiltY: 0,
    peelAngle: l.peelAngle,
    peel: l.rest,
    rest: l.rest,
    hover: 0,
    alpha: 0,
    layer: i + 1,
    size: l.size,
    seed: Math.random(),
    busy: false,
  }));
  let topLayer = N;

  // ── geometry: one plane, instanced ─────────────────────────────
  const plane = new PlaneGeometry(1, 1, 12, 12);
  const inst = (n) => {
    const a = new InstancedBufferAttribute(new Float32Array(N * n), n);
    a.setUsage(DynamicDrawUsage);
    return a;
  };
  const A = {
    aA: inst(4),
    aB: inst(4),
    aC: inst(4),
    aD: inst(4),
    aUV: new InstancedBufferAttribute(new Float32Array(N * 4), 4),
  };
  const aw = atlas.width;
  const ah = atlas.height;
  const cell = atlas.cell;
  S.forEach((s) =>
    A.aUV.setXYZW(s.i, (s.item.col * cell) / aw, 1 - ((s.item.row + 1) * cell) / ah, cell / aw, cell / ah),
  );
  const makeGeo = () => {
    const g = new InstancedBufferGeometry();
    g.index = plane.index;
    g.setAttribute('position', plane.getAttribute('position'));
    g.setAttribute('uv', plane.getAttribute('uv'));
    Object.entries(A).forEach(([k, v]) => g.setAttribute(k, v));
    g.instanceCount = N;
    return g;
  };

  const uniforms = {
    uMap: { value: texture },
    uLight: { value: new Vector3(-W * 0.2, H * 0.3, 700) },
    uTime: { value: 0 },
  };
  const stickers = new Mesh(
    makeGeo(),
    new ShaderMaterial({
      uniforms,
      vertexShader: stickerVert,
      fragmentShader: stickerFrag,
      side: DoubleSide,
      alphaToCoverage: true,
    }),
  );
  const shadows = new Mesh(
    makeGeo(),
    new ShaderMaterial({
      uniforms,
      vertexShader: shadowVert,
      fragmentShader: shadowFrag,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
    }),
  );
  const surface = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: { uLight: uniforms.uLight },
      vertexShader: surfaceVert,
      fragmentShader: surfaceFrag,
    }),
  );
  surface.scale.set(W + 240, H + 240, 1);
  [stickers, shadows, surface].forEach((m) => (m.frustumCulled = false));
  surface.renderOrder = 0;
  stickers.renderOrder = 1;
  shadows.renderOrder = 2;
  scene.add(surface, stickers, shadows);

  function sync() {
    for (const s of S) {
      A.aA.setXYZW(s.i, s.x, s.y, s.lift, s.rot);
      A.aB.setXYZW(s.i, s.sx, s.sy, s.tiltX, s.tiltY);
      A.aC.setXYZW(s.i, s.peelAngle, s.peel, s.hover, s.alpha);
      A.aD.setXYZW(s.i, s.layer * LAYER, s.seed, s.size, 0);
    }
    A.aA.needsUpdate = A.aB.needsUpdate = A.aC.needsUpdate = A.aD.needsUpdate = true;
  }

  // ── render loop (only draws when something changed) ────────────
  let dirty = true;
  let visible = true;
  const lightTarget = uniforms.uLight.value.clone();
  let phys = null;
  let physLoading = null;

  function frame(time, deltaMs) {
    if (!visible || document.hidden) return;
    const L = uniforms.uLight.value;
    if (L.distanceToSquared(lightTarget) > 0.5) {
      L.lerp(lightTarget, 0.14);
      dirty = true;
    }
    if (phys?.active) {
      phys.step(deltaMs / 1000, settle);
      dirty = true;
    }
    if (!dirty && !S.some((s) => s.hover > 0.01 || gsap.isTweening(s))) return;
    dirty = false;
    uniforms.uTime.value = time;
    sync();
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    dirty = true;
  }).observe(host);

  // ── slaps ──────────────────────────────────────────────────────
  function impact(s, k = 1) {
    audio.play('slap', { rate: rand(0.85, 1.2) * (150 / s.size) ** 0.25, volume: 0.2 + 0.2 * k });
    shake((0.1 + 0.1 * k) * Math.min(1.4, s.size / 150));
  }

  function intro() {
    const gap = touch ? 0.12 : 0.075;
    const camZ = camera.position.z;
    shuffle(S).forEach((s, k) => {
      s.layer = k + 1;
      if (reduced) {
        s.alpha = 1;
        return;
      }
      const ang = rand(0, Math.PI * 2);
      const home = { x: s.x, y: s.y, rot: s.rot };
      gsap
        .timeline({ delay: 0.15 + k * gap })
        .set(s, {
          alpha: 1,
          x: home.x + Math.cos(ang) * W * 0.75,
          y: home.y + Math.sin(ang) * H * 0.75,
          lift: camZ * rand(0.42, 0.58),
          rot: home.rot + rand(-3, 3),
          tiltX: rand(-1.1, 1.1),
          tiltY: rand(-1.1, 1.1),
          peel: 0.38,
        })
        .to(s, { ...home, lift: 0, tiltX: 0, tiltY: 0, duration: rand(0.36, 0.48), ease: 'power2.in' })
        .add(() => impact(s))
        .to(s, { sx: 1.12, sy: 0.88, duration: 0.05 })
        .to(s, { sx: 1, sy: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.35)' })
        .to(s, { peel: s.rest, duration: 0.55, ease: 'back.out(3)' }, '<');
    });
    dirty = true;
  }

  // ── picking ────────────────────────────────────────────────────
  const toWorld = (e) => {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: r.height / 2 - (e.clientY - r.top) };
  };
  const toLocal = (s, p) => {
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const c = Math.cos(-s.rot);
    const sn = Math.sin(-s.rot);
    return { x: dx * c - dy * sn, y: dx * sn + dy * c };
  };
  function hit(p) {
    let best = null;
    for (const s of S) {
      if (s.alpha < 0.5 || (best && s.layer < best.layer)) continue;
      const l = toLocal(s, p);
      const u = l.x / (s.size * s.sx);
      const v = l.y / (s.size * s.sy);
      if (Math.abs(u) > 0.5 || Math.abs(v) > 0.5) continue;
      if (opaqueAt(s.item, u + 0.5, 0.5 - v)) best = s;
    }
    return best;
  }

  // ── interaction ────────────────────────────────────────────────
  const canDrag = !touch && !reduced;
  let hovered = null;
  let drag = null;
  let tap = null;

  const loadPhysics = () =>
    (physLoading ||= import('./physics.js').then(({ createPhysics }) => (phys = createPhysics(W, H))));

  function setHover(s) {
    if (s === hovered) return;
    if (hovered && !hovered.busy)
      gsap.to(hovered, { hover: 0, peel: hovered.rest, duration: 0.35, ease: 'power2.out' });
    hovered = s;
    if (s && !s.busy) gsap.to(s, { hover: 1, peel: s.rest + 0.1, duration: 0.3, ease: 'back.out(2)' });
    host.classList.toggle('is-grab', !!s && canDrag);
  }

  function settle(s) {
    gsap
      .timeline({ onComplete: () => (s.busy = false) })
      .to(s, { lift: 0, sx: 1, sy: 1, duration: 0.14, ease: 'power3.in' })
      .add(() => impact(s, 0.9))
      .to(s, { sx: 1.1, sy: 0.9, duration: 0.05 })
      .to(s, { sx: 1, sy: 1, duration: 0.45, ease: 'elastic.out(1.1, 0.35)' })
      .to(s, { peel: s.rest, hover: 0, duration: 0.5, ease: 'back.out(3)' }, '<');
  }

  function flick(s) {
    if (s.busy) return;
    s.busy = true;
    s.layer = ++topLayer;
    gsap
      .timeline({ onComplete: () => (s.busy = false) })
      .add(() => audio.play('peel', { rate: 1.5, volume: 0.25, max: 0.25 }))
      .to(s, { peel: 0.5, lift: 20, duration: 0.16, ease: 'power2.out' })
      .to(s, { peel: s.rest, lift: 0, duration: 0.16, ease: 'power3.in' })
      .add(() => impact(s, 0.7))
      .fromTo(s, { sx: 1.1, sy: 0.9 }, { sx: 1, sy: 1, duration: 0.45, ease: 'elastic.out(1.1, 0.35)' });
  }

  host.addEventListener('pointermove', (e) => {
    const p = toWorld(e);
    if (e.pointerType === 'mouse') lightTarget.set(p.x, p.y, 700);
    if (drag) {
      const now = performance.now();
      const speed = (Math.hypot(p.x - drag.last.x, p.y - drag.last.y) / Math.max(1, now - drag.t)) * 1000;
      drag.last = p;
      drag.t = now;
      phys?.move(p);
      audio.peelSpeed(speed);
      return;
    }
    if (e.pointerType !== 'mouse') return;
    setHover(hit(p));
    if (canDrag) loadPhysics();
  });
  host.addEventListener('pointerleave', () => setHover(null));

  host.addEventListener('pointerdown', async (e) => {
    if (e.button !== 0) return;
    const p = toWorld(e);
    const s = hit(p);
    if (!s || s.busy) return;
    if (!canDrag) {
      tap = { s, x: e.clientX, y: e.clientY, t: performance.now() };
      return;
    }
    e.preventDefault();
    host.setPointerCapture(e.pointerId);
    s.busy = true;
    s.layer = ++topLayer;
    const local = toLocal(s, p);
    drag = { s, last: p, t: performance.now(), up: false };
    host.classList.add('is-grabbing');
    gsap.to(s, {
      lift: 40,
      sx: 1.05,
      sy: 1.05,
      hover: 0,
      peel: 0.22,
      peelAngle: Math.atan2(local.y, local.x),
      duration: 0.18,
      ease: 'power2.out',
    });
    audio.peelStart();
    await loadPhysics();
    if (drag?.s !== s) return;
    phys.grab(s, local, drag.last);
    if (drag.up) endDrag();
  });

  function endDrag() {
    if (!drag) return;
    if (!phys?.active) {
      drag.up = true; // physics still loading; finish once grabbed
      return;
    }
    phys.release(drag.s);
    audio.peelStop();
    host.classList.remove('is-grabbing');
    drag = null;
  }

  host.addEventListener('pointerup', (e) => {
    if (drag) return endDrag();
    if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10 && performance.now() - tap.t < 400) flick(tap.s);
    tap = null;
  });
  host.addEventListener('pointercancel', () => {
    tap = null;
    endDrag();
  });

  // ── resize ─────────────────────────────────────────────────────
  new ResizeObserver(() => {
    const nW = host.clientWidth;
    const nH = host.clientHeight;
    if (!nW || !nH || (nW === W && nH === H)) return;
    const kx = nW / W;
    const ky = nH / H;
    const ks = Math.sqrt(kx * ky);
    S.forEach((s) => {
      s.x *= kx;
      s.y *= ky;
      s.size *= ks;
    });
    W = nW;
    H = nH;
    renderer.setSize(W, H, false);
    placeCamera();
    surface.scale.set(W + 240, H + 240, 1);
    phys?.resize(W, H);
    dirty = true;
  }).observe(host);

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    gsap.ticker.remove(frame);
  });

  // Upload + compile in separate tasks (parallel shader compile where supported), then reveal.
  renderer.initTexture(texture);
  await yieldToMain();
  if (renderer.extensions.has('KHR_parallel_shader_compile')) await renderer.compileAsync(scene, camera);
  else renderer.compile(scene, camera);
  await yieldToMain();
  sync();
  renderer.render(scene, camera);
  host.classList.add('is-ready');
  intro();

  return { renderer };
}
