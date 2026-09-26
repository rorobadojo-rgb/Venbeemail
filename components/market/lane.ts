import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  DoubleSide,
  Euler,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  MeshToonMaterial,
  NearestFilter,
  PlaneGeometry,
  Points,
  Quaternion,
  RedFormat,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector3,
  type Material,
} from "three";
import { ATLAS, BANNER_COUNT } from "@/lib/doodleAtlas.generated";

/**
 * The night-market lane, built from a handful of InstancedMeshes (one draw
 * call per part, plus an ink-outline pass for the chunky ones).
 *
 * The lane is a ring of SLOTS. Each slot holds a pair of facing stalls, the
 * bulb strings across the lane, sometimes a gerobak cart and a grill. The
 * camera walks forward forever; when a slot falls behind it, the slot is
 * moved to the far end and re-dressed (new tarp colours, banners, carts), so
 * the walk never repeats exactly and no per-frame matrix work is needed.
 */
export const SPACING = 3.6;
export const SLOTS = 14;
export const FOG = { color: 0x0b0a12, near: 5, far: 31 };

const INK = new Color("#0A0A0A");
const TARPS = ["#2D6BFF", "#FF3DAE", "#2D6BFF", "#7CFF2B", "#8A2BE2", "#FF8A1F", "#2D6BFF", "#19D3C5", "#FF3A1F"];
const STOOLS = ["#FF3A1F", "#2D6BFF", "#35C21B", "#FF8A1F"];
const CARTS = ["#FF3A1F", "#19D3C5", "#FFD23F", "#FF3DAE"];
const SYRUPS = ["#FF3A1F", "#7CFF2B", "#FF3DAE", "#3D8BFF", "#FFD23F", "#19D3C5", "#8A2BE2", "#FF8A1F"];
const BULB_TINTS = ["#FFD23F", "#FFD23F", "#FFC24A", "#FFD23F", "#FF3DAE", "#FFD23F", "#7CFF2B", "#FFE08A", "#19D3C5"];

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ----------------------------------------------------------------- shaders
const fogVert = /* glsl */ `
  #include <fog_pars_vertex>
`;

const outlineMaterial = (width: number) =>
  new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uWidth: { value: width }, uColor: { value: INK } }]),
    fog: true,
    side: 1, // BackSide
    vertexShader: /* glsl */ `
      uniform float uWidth;
      ${fogVert}
      void main() {
        mat4 m = modelMatrix * instanceMatrix;
        vec3 dir = normalize(mat3(m) * normalize(position + vec3(1e-4)));
        vec4 wp = m * vec4(position, 1.0);
        wp.xyz += dir * uWidth;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      #include <fog_pars_fragment>
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <fog_fragment>
      }`,
  });

/** Unlit doodle print for the banners, sampled from the 2048 atlas. */
const bannerMaterial = (atlas: Texture) =>
  new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uAtlas: { value: atlas }, uPower: { value: 1 } }]),
    fog: true,
    vertexShader: /* glsl */ `
      attribute float aCell;
      varying vec2 vUv;
      varying float vShade;
      ${fogVert}
      void main() {
        float col = mod(aCell, ${ATLAS.cols.toFixed(1)});
        float row = floor(aCell / ${ATLAS.cols.toFixed(1)});
        vUv = vec2((col + uv.x) / ${ATLAS.cols.toFixed(1)}, (${(ATLAS.rows - 1).toFixed(1)} - row + uv.y) / ${ATLAS.rows.toFixed(1)});
        vShade = 0.72 + 0.28 * uv.y; // bulbs hang above: tops are brighter
        vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform float uPower;
      varying vec2 vUv;
      varying float vShade;
      #include <fog_pars_fragment>
      void main() {
        vec3 c = texture2D(uAtlas, vUv).rgb * vShade * mix(0.35, 1.0, uPower);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });

/** Bulb glass: bright unlit colour; each bulb switches off at its own threshold. */
const bulbMaterial = () =>
  new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uPower: { value: 1 } }]),
    fog: true,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSeed;
      uniform float uPower;
      varying vec3 vColor;
      ${fogVert}
      void main() {
        float on = step(aSeed, uPower);
        vColor = mix(vec3(0.18, 0.16, 0.1), aColor * 1.25, on);
        vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      #include <fog_pars_fragment>
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });

/** Additive camera-facing glow around each bulb (cheap fake bloom). */
const glowMaterial = () =>
  new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPower: { value: 1 }, uSize: { value: 0.44 }, uBoost: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSeed;
      uniform float uTime;
      uniform float uPower;
      uniform float uSize;
      uniform float uBoost;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 center = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        float flick = 0.86 + 0.14 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 40.0);
        vec3 wp = center + (right * position.x + up * position.y) * uSize * (0.8 + 0.3 * flick) * uBoost;
        vec4 mv = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mv;
        vUv = uv;
        vColor = aColor;
        vAlpha = step(aSeed, uPower) * flick * (1.0 - smoothstep(16.0, 31.0, -mv.z));
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - r), 2.4) * vAlpha;
        gl_FragColor = vec4(vColor * a * 0.62, 1.0);
        #include <colorspace_fragment>
      }`,
  });

/** Grill smoke: puffs rising, growing and fading in the vertex shader. */
const smokeMaterial = () =>
  new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 } }]),
    fog: true,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec3 aOrigin;
      attribute float aSeed;
      uniform float uTime;
      varying vec2 vUv;
      varying float vAlpha;
      ${fogVert}
      void main() {
        float life = fract(uTime * 0.11 + aSeed);
        vec3 c = aOrigin + vec3(sin(life * 3.0 + aSeed * 10.0) * 0.3 + life * 0.5, life * 2.8, cos(life * 2.0 + aSeed * 7.0) * 0.3);
        float size = 0.35 + life * 1.25;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 wp = c + (right * position.x + up * position.y) * size;
        vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - life) * 0.42;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vAlpha;
      #include <fog_pars_fragment>
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.1, r) * vAlpha;
        gl_FragColor = vec4(vec3(0.36, 0.32, 0.3), a);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });

/** Insects circling the bulbs. */
const insectMaterial = () =>
  new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixel: { value: 1 }, uPower: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aCenter;
      attribute float aSeed;
      uniform float uTime;
      uniform float uPixel;
      uniform float uPower;
      varying float vA;
      void main() {
        float t = uTime * (1.6 + aSeed * 2.2) + aSeed * 50.0;
        vec3 p = aCenter + vec3(cos(t) * 0.4, sin(t * 1.7) * 0.2, sin(t * 1.13) * 0.4) * (0.5 + aSeed);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uPixel * 14.0 / -mv.z, 1.0, 4.0 * uPixel);
        vA = (1.0 - smoothstep(9.0, 22.0, -mv.z)) * uPower;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        gl_FragColor = vec4(vec3(1.0, 0.92, 0.66) * (1.0 - r) * vA, 1.0);
      }`,
  });

/** Toon shading with the doodle print mixed into the tarp colour. */
function printedToon(gradient: Texture, atlas: Texture, mix: number) {
  const m = new MeshToonMaterial({ gradientMap: gradient });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uAtlas = { value: atlas };
    shader.uniforms.uMix = { value: mix };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aCell;\nvarying vec2 vCellUv;")
      .replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
         float cc = mod(aCell, ${ATLAS.cols.toFixed(1)});
         float rr = floor(aCell / ${ATLAS.cols.toFixed(1)});
         vCellUv = vec2((cc + uv.x) / ${ATLAS.cols.toFixed(1)}, (${(ATLAS.rows - 1).toFixed(1)} - rr + uv.y) / ${ATLAS.rows.toFixed(1)});`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uAtlas;\nuniform float uMix;\nvarying vec2 vCellUv;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nvec3 print = texture2D(uAtlas, vCellUv).rgb;\ndiffuseColor.rgb = mix(diffuseColor.rgb, print * diffuseColor.rgb * 1.6 + print * 0.15, uMix);",
      );
  };
  return m;
}

// ----------------------------------------------------------------- helpers
type Item = { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number]; color?: string; cell?: number };

const tmpM = new Matrix4();
const tmpQ = new Quaternion();
const tmpE = new Euler();
const tmpP = new Vector3();
const tmpS = new Vector3();
const hidden = new Matrix4().makeScale(0, 0, 0);

class Part {
  mesh: InstancedMesh;
  outline?: InstancedMesh;
  cells?: InstancedBufferAttribute;
  constructor(
    public name: string,
    geometry: BufferGeometry,
    material: Material,
    public perSlot: number,
    outline?: Material,
    cells = false,
  ) {
    const count = perSlot * SLOTS;
    if (cells) {
      this.cells = new InstancedBufferAttribute(new Float32Array(count), 1);
      geometry.setAttribute("aCell", this.cells);
    }
    this.mesh = new InstancedMesh(geometry, material, count);
    this.mesh.frustumCulled = false;
    // allocate colours up front so the shader is compiled with instance colours
    if (material instanceof MeshToonMaterial) this.mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(count * 3).fill(1), 3);
    this.mesh.instanceMatrix.setUsage(35048); // DynamicDrawUsage
    if (outline) {
      this.outline = new InstancedMesh(geometry, outline, count);
      this.outline.frustumCulled = false;
      this.outline.instanceMatrix = this.mesh.instanceMatrix; // share matrices
    }
  }
  write(slot: number, z: number, items: Item[]) {
    for (let j = 0; j < this.perSlot; j++) {
      const i = slot * this.perSlot + j;
      const it = items[j];
      if (!it) {
        this.mesh.setMatrixAt(i, hidden);
        continue;
      }
      tmpE.set(...(it.r ?? [0, 0, 0]));
      tmpQ.setFromEuler(tmpE);
      tmpP.set(it.p[0], it.p[1], it.p[2] + z);
      tmpS.set(...it.s);
      tmpM.compose(tmpP, tmpQ, tmpS);
      this.mesh.setMatrixAt(i, tmpM);
      if (it.color) this.mesh.setColorAt(i, new Color(it.color));
      if (this.cells && it.cell !== undefined) this.cells.setX(i, it.cell);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    if (this.cells) this.cells.needsUpdate = true;
  }
  addTo(g: Group) {
    g.add(this.mesh);
    if (this.outline) g.add(this.outline);
  }
}

/** Points along a sagging wire from a to b. */
function catenary(a: [number, number, number], b: [number, number, number], sag: number, n: number) {
  const pts: [number, number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]);
  }
  return pts;
}

// ------------------------------------------------------------------- lane
const BULBS_PER_SLOT = 44;
const WIRE_SEGS_PER_SLOT = 48;
const SMOKE_PER_SLOT = 7;
const INSECTS_PER_SLOT = 10;

export class Lane {
  group = new Group();
  lights: [number, number, number][] = []; // per-slot light anchors (slot-local)
  slotZ: number[] = [];
  private serial: number[] = [];
  private nextSerial = SLOTS;
  private parts: Record<string, Part>;
  private bulbs: InstancedMesh;
  private glow: InstancedMesh;
  private bulbColor: InstancedBufferAttribute;
  private bulbSeed: InstancedBufferAttribute;
  private wires: LineSegments;
  private smoke: InstancedMesh;
  private smokeOrigin: InstancedBufferAttribute;
  private insects: Points;
  private insectCenter: BufferAttribute;
  readonly materials: {
    banner: ShaderMaterial;
    bulb: ShaderMaterial;
    glow: ShaderMaterial;
    smoke: ShaderMaterial;
    insect: ShaderMaterial;
  };

  constructor(atlas: Texture) {
    const gradient = new DataTexture(new Uint8Array([70, 150, 255]), 3, 1, RedFormat);
    gradient.minFilter = gradient.magFilter = NearestFilter;
    gradient.needsUpdate = true;

    const toon = new MeshToonMaterial({ gradientMap: gradient });
    const tarp = printedToon(gradient, atlas, 0.42);
    tarp.side = DoubleSide;
    const outline = outlineMaterial(0.028);
    const banner = bannerMaterial(atlas);
    const box = new BoxGeometry(1, 1, 1);
    const cyl = new CylinderGeometry(0.5, 0.5, 1, 12);
    const stoolGeo = new CylinderGeometry(0.44, 0.5, 1, 10);
    const wheelGeo = new CylinderGeometry(0.5, 0.5, 1, 14);

    this.parts = {
      post: new Part("post", box, toon, 6, outline),
      roof: new Part("roof", box.clone(), tarp, 2, outline, true),
      valance: new Part("valance", box.clone(), banner, 2, outline, true),
      backdrop: new Part("backdrop", box.clone(), banner, 2, undefined, true),
      counter: new Part("counter", box, toon, 4, outline),
      stool: new Part("stool", stoolGeo, toon, 5, outline),
      jar: new Part("jar", cyl, toon, 8),
      grill: new Part("grill", box, toon, 2, outline),
      cart: new Part("cart", box, toon, 3, outline),
      wheel: new Part("wheel", wheelGeo, toon, 2, outline),
    };
    Object.values(this.parts).forEach((p) => p.addTo(this.group));

    // bulbs + glow share colour / threshold attributes
    const bulbCount = BULBS_PER_SLOT * SLOTS;
    this.bulbColor = new InstancedBufferAttribute(new Float32Array(bulbCount * 3), 3);
    this.bulbSeed = new InstancedBufferAttribute(new Float32Array(bulbCount).map(() => Math.random() * 0.98), 1);
    const bulbGeo = new SphereGeometry(0.055, 8, 6);
    bulbGeo.setAttribute("aColor", this.bulbColor);
    bulbGeo.setAttribute("aSeed", this.bulbSeed);
    const glowGeo = new PlaneGeometry(1, 1);
    glowGeo.setAttribute("aColor", this.bulbColor);
    glowGeo.setAttribute("aSeed", this.bulbSeed);
    const bulb = bulbMaterial();
    const glow = glowMaterial();
    this.bulbs = new InstancedMesh(bulbGeo, bulb, bulbCount);
    this.glow = new InstancedMesh(glowGeo, glow, bulbCount);
    this.glow.instanceMatrix = this.bulbs.instanceMatrix;
    this.bulbs.frustumCulled = this.glow.frustumCulled = false;
    this.glow.renderOrder = 2;
    this.group.add(this.bulbs, this.glow);

    const wireGeo = new BufferGeometry();
    wireGeo.setAttribute("position", new BufferAttribute(new Float32Array(WIRE_SEGS_PER_SLOT * SLOTS * 6), 3));
    this.wires = new LineSegments(wireGeo, new LineBasicMaterial({ color: 0x141414 }));
    this.wires.frustumCulled = false;
    this.group.add(this.wires);

    const smokeCount = SMOKE_PER_SLOT * SLOTS;
    const smokeGeo = new PlaneGeometry(1, 1);
    this.smokeOrigin = new InstancedBufferAttribute(new Float32Array(smokeCount * 3), 3);
    smokeGeo.setAttribute("aOrigin", this.smokeOrigin);
    smokeGeo.setAttribute("aSeed", new InstancedBufferAttribute(new Float32Array(smokeCount).map((_, i) => (i % SMOKE_PER_SLOT) / SMOKE_PER_SLOT + Math.random() * 0.05), 1));
    const smoke = smokeMaterial();
    this.smoke = new InstancedMesh(smokeGeo, smoke, smokeCount);
    this.smoke.frustumCulled = false;
    this.smoke.renderOrder = 3;
    this.group.add(this.smoke);

    const insectCount = INSECTS_PER_SLOT * SLOTS;
    const insectGeo = new BufferGeometry();
    insectGeo.setAttribute("position", new BufferAttribute(new Float32Array(insectCount * 3), 3));
    this.insectCenter = new BufferAttribute(new Float32Array(insectCount * 3), 3);
    insectGeo.setAttribute("aCenter", this.insectCenter);
    insectGeo.setAttribute("aSeed", new BufferAttribute(new Float32Array(insectCount).map(() => Math.random()), 1));
    const insect = insectMaterial();
    this.insects = new Points(insectGeo, insect);
    this.insects.frustumCulled = false;
    this.group.add(this.insects);

    this.materials = { banner, bulb, glow, smoke, insect };

    for (let k = 0; k < SLOTS; k++) {
      this.serial[k] = k;
      this.slotZ[k] = 2 - k * SPACING;
      this.dress(k);
    }
  }

  /** Recycle slots that fell behind the camera to the far end of the lane. */
  update(cameraZ: number) {
    for (let k = 0; k < SLOTS; k++) {
      if (this.slotZ[k] - SPACING > cameraZ + 3) {
        const far = Math.min(...this.slotZ);
        this.slotZ[k] = far - SPACING;
        this.serial[k] = this.nextSerial++;
        this.dress(k);
      }
    }
  }

  /** Per-frame uniforms: time, how lit the market is (closing time), pixel ratio. */
  tick(time: number, power: number, pixelRatio: number) {
    const m = this.materials;
    m.glow.uniforms.uTime.value = time;
    m.glow.uniforms.uPower.value = power;
    m.bulb.uniforms.uPower.value = power;
    m.banner.uniforms.uPower.value = power;
    m.smoke.uniforms.uTime.value = time;
    m.insect.uniforms.uTime.value = time;
    m.insect.uniforms.uPower.value = power;
    m.insect.uniforms.uPixel.value = pixelRatio;
  }

  setQuality(level: 0 | 1 | 2) {
    this.smoke.visible = level >= 1;
    this.insects.visible = level >= 2;
    Object.values(this.parts).forEach((p) => p.outline && (p.outline.visible = level >= 1));
  }

  /** Build every piece of slot k at its current z. */
  private dress(k: number) {
    const z = this.slotZ[k];
    const n = this.serial[k];
    const r = (i: number) => hash(n * 17.13 + i * 3.71);
    const items: Record<string, Item[]> = {};
    const push = (name: string, it: Item) => (items[name] ??= []).push(it);

    for (const s of [-1, 1] as const) {
      const sr = (i: number) => r(i + (s > 0 ? 50 : 0));
      const zc = -SPACING / 2;
      const front = s * 2.3;
      const back = s * 4.4;
      // posts
      for (const [px, pz] of [[front, -0.35], [front, -SPACING + 0.35], [back, -SPACING / 2]] as const) {
        push("post", { p: [px, 1.5, pz], s: [0.1, 3.0, 0.1], color: "#B98D3A" });
      }
      // tarp roof, sloping up towards the lane so its printed underside shows
      push("roof", {
        p: [s * 3.35, 2.62, zc], s: [2.5, 0.05, SPACING - 0.2], r: [0, 0, -s * 0.16],
        color: TARPS[Math.floor(sr(1) * TARPS.length)], cell: Math.floor(sr(2) * BANNER_COUNT),
      });
      // front banner (valance) + back banner
      push("valance", { p: [s * 2.26, 2.3, zc], s: [SPACING - 0.5, 0.62, 0.03], r: [0, -s * Math.PI / 2, 0], cell: Math.floor(sr(3) * BANNER_COUNT) });
      push("backdrop", { p: [s * 4.35, 1.55, zc], s: [SPACING - 0.6, 1.35, 0.02], r: [0, -s * Math.PI / 2, 0], cell: Math.floor(sr(4) * BANNER_COUNT) });
      // counter with a coloured skirt
      push("counter", { p: [s * 2.7, 0.47, zc], s: [0.7, 0.94, SPACING - 0.8], color: "#6B4526" });
      push("counter", { p: [s * 2.36, 0.4, zc], s: [0.04, 0.7, SPACING - 0.9], color: TARPS[Math.floor(sr(5) * TARPS.length)] });
      // glasses of syrup on the counter
      for (let j = 0; j < 4; j++) {
        push("jar", { p: [s * (2.55 + (j % 2) * 0.22), 1.06, zc - 0.9 + j * 0.55 + sr(6 + j) * 0.2], s: [0.14, 0.22, 0.14], color: SYRUPS[Math.floor(sr(10 + j) * SYRUPS.length)] });
      }
      // plastic stools
      const stools = 1 + Math.floor(sr(14) * 3);
      for (let j = 0; j < stools; j++) {
        push("stool", { p: [s * (1.8 - sr(20 + j) * 0.2), 0.2, -0.6 - j * 1.05 - sr(24 + j) * 0.3], s: [0.32, 0.4, 0.32], color: STOOLS[Math.floor(sr(28 + j) * STOOLS.length)] });
      }
      // a grill on some stalls: smoke rises from it
      if (sr(30) < 0.55) {
        push("grill", { p: [s * 1.95, 0.72, -0.75], s: [0.5, 0.2, 0.9], color: "#2A2A2E" });
        push("grill", { p: [s * 1.95, 0.84, -0.75], s: [0.44, 0.04, 0.84], color: "#FF6A1F" });
      }
    }
    // a gerobak cart parked at the lane edge every few slots
    if (r(40) < 0.45) {
      const s = r(41) < 0.5 ? -1 : 1;
      const cz = -SPACING + 0.2;
      const c = CARTS[Math.floor(r(42) * CARTS.length)];
      push("cart", { p: [s * 1.55, 0.78, cz], s: [0.62, 0.55, 1.3], color: c });
      push("cart", { p: [s * 1.55, 1.3, cz], s: [0.56, 0.5, 1.1], color: "#CFE9F2" });
      push("cart", { p: [s * 1.55, 1.62, cz], s: [0.68, 0.06, 1.4], color: c });
      push("wheel", { p: [s * 1.9, 0.3, cz], s: [0.56, 0.08, 0.56], r: [0, 0, Math.PI / 2], color: "#2A2A2E" });
      push("wheel", { p: [s * 1.2, 0.3, cz], s: [0.56, 0.08, 0.56], r: [0, 0, Math.PI / 2], color: "#2A2A2E" });
    }
    Object.values(this.parts).forEach((p) => p.write(k, z, items[p.name] ?? []));

    // ---- bulb strings: two across the lane, one along each stall front
    const strings = [
      catenary([-2.3, 3.0, -0.35], [2.3, 3.0, -0.35], 0.42, 12),
      catenary([-2.3, 2.95, -SPACING * 0.55], [2.3, 3.0, -SPACING * 0.95], 0.38, 12),
      catenary([-2.28, 2.52, -0.3], [-2.28, 2.52, -SPACING + 0.3], 0.22, 9),
      catenary([2.28, 2.52, -0.3], [2.28, 2.52, -SPACING + 0.3], 0.22, 9),
    ];
    const pos = this.wires.geometry.getAttribute("position") as BufferAttribute;
    let seg = k * WIRE_SEGS_PER_SLOT;
    let b = k * BULBS_PER_SLOT;
    const tint = Math.floor(r(60) * 3);
    for (const pts of strings) {
      for (let j = 0; j < pts.length - 1 && seg < (k + 1) * WIRE_SEGS_PER_SLOT; j++, seg++) {
        pos.setXYZ(seg * 2, pts[j][0], pts[j][1], pts[j][2] + z);
        pos.setXYZ(seg * 2 + 1, pts[j + 1][0], pts[j + 1][1], pts[j + 1][2] + z);
      }
      for (let j = 1; j < pts.length && b < (k + 1) * BULBS_PER_SLOT; j++, b++) {
        tmpM.makeTranslation(pts[j][0], pts[j][1] - 0.09, pts[j][2] + z);
        this.bulbs.setMatrixAt(b, tmpM);
        const c = new Color(BULB_TINTS[(j + tint * 3 + Math.floor(r(70 + j) * 4)) % BULB_TINTS.length]);
        this.bulbColor.setXYZ(b, c.r, c.g, c.b);
      }
    }
    for (; seg < (k + 1) * WIRE_SEGS_PER_SLOT; seg++) {
      pos.setXYZ(seg * 2, 0, -100, 0);
      pos.setXYZ(seg * 2 + 1, 0, -100, 0);
    }
    for (; b < (k + 1) * BULBS_PER_SLOT; b++) this.bulbs.setMatrixAt(b, hidden);
    pos.needsUpdate = true;
    this.bulbs.instanceMatrix.needsUpdate = true;
    this.bulbColor.needsUpdate = true;

    // ---- smoke from the grills (or tucked away under the ground)
    const grills = items.grill ?? [];
    for (let j = 0; j < SMOKE_PER_SLOT; j++) {
      const g = grills[(j % Math.max(1, grills.length / 2)) * 2];
      const i = k * SMOKE_PER_SLOT + j;
      if (g) this.smokeOrigin.setXYZ(i, g.p[0], 0.95, g.p[2] + z);
      else this.smokeOrigin.setXYZ(i, 0, -50, 0);
    }
    this.smokeOrigin.needsUpdate = true;

    // ---- insects around the first cross string
    for (let j = 0; j < INSECTS_PER_SLOT; j++) {
      const p = strings[j % 2][2 + ((j * 5) % 9)];
      this.insectCenter.setXYZ(k * INSECTS_PER_SLOT + j, p[0], p[1] - 0.1, p[2] + z);
    }
    this.insectCenter.needsUpdate = true;
  }

  /** World-space anchors for the warm point lights, nearest slots first. */
  lightAnchors(cameraZ: number, count: number): [number, number, number][] {
    const ahead = this.slotZ
      .filter((z) => z - SPACING / 2 < cameraZ + 1.5)
      .sort((a, b) => b - a)
      .slice(0, Math.ceil(count / 2));
    const out: [number, number, number][] = [];
    for (const z of ahead) {
      out.push([-1.9, 2.25, z - SPACING / 2], [1.9, 2.25, z - SPACING / 2]);
    }
    return out.slice(0, count);
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as InstancedMesh;
      m.geometry?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
  }
}
