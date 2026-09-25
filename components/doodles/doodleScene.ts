import {
  InstancedBufferAttribute,
  InstancedMesh,
  LinearMipmapLinearFilter,
  Matrix4,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { asset } from "@/lib/asset";
import { cameraBus } from "@/lib/cameraBus";
import { ATLAS_COLS, DOODLES } from "@/lib/doodleAtlas.generated";

/**
 * The background doodle wall: every doodle is one instance of a single
 * InstancedMesh (one draw call) sampling one 2048px atlas texture. All idle
 * motion happens in the vertex shader, so a frame only updates a handful of
 * uniforms. The camera follows the comic camera (pan / zoom / ±6° tilt)
 * with real perspective, so near doodles slide faster than far ones.
 */

const FOV = 40;
const BASE_Z = 20;
const FOCUS_Z = -4;
const WORLD_PER_VH = 5.1; // camera travel per viewport-height of page movement
const BG = [1, 58 / 255, 31 / 255]; // #FF3A1F in sRGB, matches the CSS backdrop

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCenter;
  uniform float uCamZ;
  uniform float uTanHalf;
  uniform float uAspect;
  attribute float aCell;
  attribute vec4 aSeed; // phase, speed, spin, wobble
  varying vec2 vUv;
  varying float vFog;

  void main() {
    vec3 base = instanceMatrix[3].xyz;          // xy: spread in [-1,1], z: depth
    float size = length(instanceMatrix[0].xyz);
    float dist = uCamZ - base.z;
    vec2 halfBox = vec2(uTanHalf * dist * uAspect, uTanHalf * dist) * 1.3 + size;

    // wrap around the camera so the wall never ends
    vec2 rel = base.xy * halfBox - uCenter.xy;
    rel = mod(rel + halfBox, 2.0 * halfBox) - halfBox;

    float t = uTime * aSeed.y + aSeed.x * 6.2831;
    rel += vec2(cos(t * 0.7) * 0.12, sin(t) * 0.2) * aSeed.w;

    // hand-drawn "line boil": tiny rotation steps 6x a second
    float step = floor(uTime * 6.0 + aSeed.x * 10.0);
    float jitter = fract(sin(step * 12.9898 + aSeed.x * 78.233) * 43758.5453) - 0.5;
    float ang = aSeed.z + sin(t * 0.8) * 0.12 * aSeed.w + jitter * 0.05;
    vec2 corner = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * (position.xy * size);

    vec3 world = vec3(uCenter.xy + rel + corner, base.z);
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);

    float cols = ${ATLAS_COLS.toFixed(1)};
    vec2 cell = vec2(mod(aCell, cols), cols - 1.0 - floor(aCell / cols));
    vUv = (cell + uv) / cols;
    vFog = clamp((dist - 12.0) / 26.0, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uBg;
  varying vec2 vUv;
  varying float vFog;
  void main() {
    vec4 c = texture2D(uAtlas, vUv);
    if (c.a < 0.04) discard;
    gl_FragColor = vec4(mix(c.rgb, uBg, vFog * 0.3), c.a);
  }
`;

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Options = { count: number; animate: boolean; onReady?: () => void };

export function createDoodleScene(canvas: HTMLCanvasElement, { count: instances, animate: animateOpt, onReady }: Options) {
  let animate = animateOpt;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0xff3a1f, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = BASE_Z;

  const texture = new Texture();
  texture.minFilter = LinearMipmapLinearFilter;

  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uCenter: { value: new Vector3() },
      uCamZ: { value: BASE_Z },
      uTanHalf: { value: Math.tan(((FOV / 2) * Math.PI) / 180) },
      uAspect: { value: 1 },
      uAtlas: { value: texture },
      uBg: { value: new Vector3(...BG) },
    },
  });

  const geometry = new PlaneGeometry(1, 1);
  const mesh = new InstancedMesh(geometry, material, instances);
  mesh.frustumCulled = false;

  // scatter, then sort far → near so alpha blending layers correctly
  const r = rng(20260925);
  const order = DOODLES.map((_, i) => i);
  const items = Array.from({ length: instances }, (_, i) => ({
    x: r() * 2 - 1,
    y: r() * 2 - 1,
    z: -14 + r() * 21,
    size: 1.3 + r() * 1.5,
    cell: order[(i * 7 + Math.floor(r() * 3)) % order.length],
    seed: [r(), 0.4 + r() * 0.8, (r() - 0.5) * 0.9, 0.5 + r()],
  })).sort((a, b) => a.z - b.z);

  const cells = new Float32Array(instances);
  const seeds = new Float32Array(instances * 4);
  const m = new Matrix4();
  const q = new Quaternion();
  const p = new Vector3();
  const s = new Vector3();
  items.forEach((it, i) => {
    m.compose(p.set(it.x, it.y, it.z), q, s.set(it.size, it.size, 1));
    mesh.setMatrixAt(i, m);
    cells[i] = it.cell;
    seeds.set(it.seed, i * 4);
  });
  geometry.setAttribute("aCell", new InstancedBufferAttribute(cells, 1));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 4));
  scene.add(mesh);

  let width = 0;
  let height = 0;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // ignore mobile URL-bar jitter
    if (w === width && Math.abs(h - height) < 140) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.uAspect.value = camera.aspect;
    dirty = true;
  };
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  };

  let dirty = true;
  let seen = -1;
  let ready = false;
  const start = performance.now();
  const focus = new Vector3();

  // Adaptive quality: if frames keep arriving slower than ~38 fps, drop the
  // pixel ratio, then stop the idle animation (camera moves still render).
  let quality = 0;
  let last = 0;
  let slow = 0;
  let count = 0;
  const degrade = () => {
    quality++;
    if (quality === 1) renderer.setPixelRatio(1);
    else if (quality === 2) renderer.setPixelRatio(0.7);
    else animate = false;
    width = 0; // force a resize with the new ratio
    resize();
  };
  const watch = (now: number) => {
    const dt = now - last;
    last = now;
    if (quality > 2 || dt > 250) return;
    count++;
    if (dt > 26) slow++;
    if (count === 45) {
      if (slow > 30) degrade();
      count = 0;
      slow = 0;
    }
  };

  const frame = (now: number) => {
    if (!ready) return;
    if (animate) watch(now);
    if (!animate && !dirty && seen === cameraBus.version) return;
    seen = cameraBus.version;
    dirty = false;

    const { panX, panY, zoom, tiltX, tiltY } = cameraBus;
    const cx = panX * WORLD_PER_VH;
    const cy = -panY * WORLD_PER_VH;
    const camZ = BASE_Z + (1 / Math.max(zoom, 0.2) - 1) * 6;
    const orbit = camZ - FOCUS_Z;
    camera.position.set(cx + Math.sin(tiltY) * orbit * 0.9, cy - Math.sin(tiltX) * orbit * 0.9, camZ);
    camera.lookAt(focus.set(cx, cy, FOCUS_Z));

    const u = material.uniforms;
    u.uTime.value = animate ? (performance.now() - start) / 1000 : 0;
    u.uCenter.value.set(cx, cy, 0);
    u.uCamZ.value = camZ;
    renderer.render(scene, camera);
  };

  const image = new Image();
  image.decoding = "async";
  image.src = asset("/doodles/atlas.webp");
  let disposed = false;
  image
    .decode()
    .then(() => {
      if (disposed) return;
      texture.image = image;
      texture.needsUpdate = true;
      ready = true;
      resize();
      frame(performance.now());
      onReady?.();
    })
    .catch(() => undefined);

  window.addEventListener("resize", onResize);
  renderer.setAnimationLoop(frame);

  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", onResize);
    clearTimeout(resizeTimer);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}
