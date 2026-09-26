"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { asset } from "@/lib/asset";
import { AISLES, lights } from "@/lib/lights";
import { pointer, trackPointer } from "@/lib/pointer";
import { POSTER_ATLAS, POSTERS } from "@/lib/posters.generated";

/**
 * The Zombie Mart at night: flickering fluorescent tubes (one row per aisle),
 * metal gondola shelves full of instanced products, a glowing drinks fridge,
 * a back wall of torn doodle posters that flap in the AC draught, floating
 * dust, haze, a slow push-in and ±5° mouse parallax.
 *
 * Reads lib/lights every frame (logo click flicker, footer lights-off).
 */

const ROOM = { w: 14, floor: -2.4, ceil: 3.6, back: -8, front: 11 };
const AISLE_Z = [4.5, 1.2, -2.1, -5.4];
const PALETTE = ["#A6F23A", "#FF1F5A", "#8A2BE2", "#FF3A1F", "#FFD23F", "#2BD9F0", "#FF8A1F", "#F5E6C8", "#17B8A6", "#FFFFFF"];
const DEG = Math.PI / 180;

// deterministic randomness so the store looks the same every visit
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** Per-aisle brightness (0..1): footer switches aisles off from the back. */
function aisleLevel(i: number) {
  const offFromBack = AISLES - 1 - i < lights.off;
  return offFromBack ? 0 : lights.level;
}

// ---------------------------------------------------------------- textures
function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

function Room() {
  const floor = useMemo(
    () =>
      canvasTexture(
        256,
        (g, s) => {
          const h = s / 2;
          g.fillStyle = "#1b1f1d";
          g.fillRect(0, 0, s, s);
          g.fillStyle = "#262b28";
          g.fillRect(0, 0, h, h);
          g.fillRect(h, h, h, h);
          g.strokeStyle = "#0b0d0c";
          g.lineWidth = 4;
          g.strokeRect(0, 0, h, h);
          g.strokeRect(h, h, h, h);
          g.strokeRect(h, 0, h, h);
          g.strokeRect(0, h, h, h);
          // grime
          const r = rng(9);
          for (let i = 0; i < 90; i++) {
            g.fillStyle = `rgba(0,0,0,${r() * 0.25})`;
            g.beginPath();
            g.arc(r() * s, r() * s, r() * 10, 0, Math.PI * 2);
            g.fill();
          }
        },
        12,
      ),
    [],
  );
  const wall = useMemo(
    () =>
      canvasTexture(
        256,
        (g, s) => {
          g.fillStyle = "#222a27";
          g.fillRect(0, 0, s, s);
          const r = rng(4);
          for (let i = 0; i < 400; i++) {
            g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.05})`;
            g.fillRect(r() * s, r() * s, 2 + r() * 6, 2 + r() * 6);
          }
          // old tape marks
          for (let i = 0; i < 6; i++) {
            g.fillStyle = "rgba(233,225,200,.12)";
            g.fillRect(r() * s, r() * s, 26, 9);
          }
        },
        3,
      ),
    [],
  );
  useEffect(() => () => [floor, wall].forEach((t) => t.dispose()), [floor, wall]);
  const depth = ROOM.front - ROOM.back;
  const midZ = (ROOM.front + ROOM.back) / 2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, ROOM.floor, midZ]}>
        <planeGeometry args={[ROOM.w, depth]} />
        <meshLambertMaterial map={floor} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM.ceil, midZ]}>
        <planeGeometry args={[ROOM.w, depth]} />
        <meshLambertMaterial color="#141816" />
      </mesh>
      <mesh position={[0, (ROOM.floor + ROOM.ceil) / 2, ROOM.back]}>
        <planeGeometry args={[ROOM.w, ROOM.ceil - ROOM.floor]} />
        <meshLambertMaterial map={wall} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * ROOM.w) / 2, (ROOM.floor + ROOM.ceil) / 2, midZ]} rotation-y={(-side * Math.PI) / 2}>
          <planeGeometry args={[depth, ROOM.ceil - ROOM.floor]} />
          <meshLambertMaterial map={wall} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- shelves
const SHELF = { x: 5.1, z0: -6.8, z1: 5.5, depth: 1.1, levels: [-2.0, -1.2, -0.4, 0.4, 1.2], top: 1.9 };

function Shelves() {
  const { metal, products, labels } = useMemo(() => {
    const m = new THREE.Object3D();
    const metalMats: THREE.Matrix4[] = [];
    const len = SHELF.z1 - SHELF.z0;
    for (const side of [-1, 1]) {
      const x = side * SHELF.x;
      // back panel + uprights + boards
      m.position.set(x + side * (SHELF.depth / 2), (ROOM.floor + SHELF.top) / 2, (SHELF.z0 + SHELF.z1) / 2);
      m.scale.set(0.06, SHELF.top - ROOM.floor, len);
      m.updateMatrix();
      metalMats.push(m.matrix.clone());
      for (let u = 0; u <= 3; u++) {
        m.position.set(x - side * (SHELF.depth / 2 - 0.03), (ROOM.floor + SHELF.top) / 2, SHELF.z0 + (len * u) / 3);
        m.scale.set(0.06, SHELF.top - ROOM.floor, 0.08);
        m.updateMatrix();
        metalMats.push(m.matrix.clone());
      }
      for (const y of SHELF.levels) {
        m.position.set(x, y, (SHELF.z0 + SHELF.z1) / 2);
        m.scale.set(SHELF.depth, 0.05, len);
        m.updateMatrix();
        metalMats.push(m.matrix.clone());
        // price rail
        m.position.set(x - side * (SHELF.depth / 2), y - 0.02, (SHELF.z0 + SHELF.z1) / 2);
        m.scale.set(0.02, 0.1, len);
        m.updateMatrix();
        metalMats.push(m.matrix.clone());
      }
    }
    // products: boxes + cans on every board
    const r = rng(42);
    const prod: { mat: THREE.Matrix4; label: THREE.Matrix4; color: THREE.Color; can: boolean }[] = [];
    for (const side of [-1, 1]) {
      for (const y of SHELF.levels) {
        let z = SHELF.z0 + 0.25;
        while (z < SHELF.z1 - 0.3) {
          const can = r() < 0.45;
          const w = can ? 0.22 + r() * 0.08 : 0.3 + r() * 0.25;
          const h = can ? 0.3 + r() * 0.22 : 0.4 + r() * 0.3;
          const d = can ? w : 0.25 + r() * 0.3;
          const gap = r() < 0.08 ? 0.35 : 0.04; // a few empty spots: the zombies ate them
          m.position.set(side * SHELF.x - side * (0.25 - r() * 0.1), y + 0.025 + h / 2, z + w / 2);
          m.rotation.set(0, (r() - 0.5) * 0.4, (r() - 0.5) * (r() < 0.1 ? 0.6 : 0.05));
          m.scale.set(d, h, w);
          m.updateMatrix();
          const mat = m.matrix.clone();
          m.scale.set(d * 1.02, h * 0.34, w * 1.02);
          m.position.y += h * (r() - 0.5) * 0.2;
          m.updateMatrix();
          prod.push({ mat, label: m.matrix.clone(), color: new THREE.Color(PALETTE[Math.floor(r() * PALETTE.length)]), can });
          z += w + gap;
        }
      }
    }
    return { metal: metalMats, products: prod, labels: prod };
  }, []);

  const metalRef = useRef<THREE.InstancedMesh>(null);
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const canRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);
  const boxes = products.filter((p) => !p.can);
  const cans = products.filter((p) => p.can);

  useEffect(() => {
    metal.forEach((mt, i) => metalRef.current?.setMatrixAt(i, mt));
    boxes.forEach((p, i) => {
      boxRef.current?.setMatrixAt(i, p.mat);
      boxRef.current?.setColorAt(i, p.color);
    });
    cans.forEach((p, i) => {
      canRef.current?.setMatrixAt(i, p.mat);
      canRef.current?.setColorAt(i, p.color);
    });
    const cream = new THREE.Color("#EDE3CB");
    const ink = new THREE.Color("#161616");
    labels.forEach((p, i) => {
      labelRef.current?.setMatrixAt(i, p.label);
      labelRef.current?.setColorAt(i, i % 3 ? cream : ink);
    });
    [metalRef, boxRef, canRef, labelRef].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
      r.current.computeBoundingSphere();
    });
  }, [metal, boxes, cans, labels]);

  return (
    <group>
      <instancedMesh ref={metalRef} args={[undefined, undefined, metal.length]}>
        <boxGeometry />
        <meshLambertMaterial color="#6d726f" />
      </instancedMesh>
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={canRef} args={[undefined, undefined, cans.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={labelRef} args={[undefined, undefined, labels.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
    </group>
  );
}

// ---------------------------------------------------------------- fridge
function Fridge() {
  const glass = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const bottles = useMemo(() => {
    const r = rng(7);
    const m = new THREE.Object3D();
    const out: { mat: THREE.Matrix4; color: THREE.Color }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 7; k++) {
        m.position.set(-0.78 + k * 0.26, -1.55 + row * 0.78, 0);
        m.scale.set(0.2, 0.45 + r() * 0.15, 0.2);
        m.updateMatrix();
        out.push({ mat: m.matrix.clone(), color: new THREE.Color(PALETTE[Math.floor(r() * PALETTE.length)]) });
      }
    }
    return out;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    bottles.forEach((b, i) => {
      ref.current?.setMatrixAt(i, b.mat);
      ref.current?.setColorAt(i, b.color);
    });
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    }
  }, [bottles]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // compressor shimmer
    const hum = 0.92 + Math.sin(t * 13) * 0.02 + Math.sin(t * 0.7) * 0.04;
    if (glass.current) glass.current.color.setRGB(0.55 * hum, 0.95 * hum, 0.9 * hum);
    if (light.current) light.current.intensity = 9 * hum;
  });
  return (
    <group position={[2.6, -0.3, ROOM.back + 0.7]}>
      <mesh>
        <boxGeometry args={[2.3, 4.2, 1.2]} />
        <meshLambertMaterial color="#d9ddd8" />
      </mesh>
      <mesh position={[0, 0.05, 0.61]}>
        <planeGeometry args={[2.0, 3.8]} />
        <meshBasicMaterial ref={glass} color="#8ef3e6" toneMapped={false} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, bottles.length]} position={[0, 0.3, 0.64]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {[-1.1, -0.35, 0.4, 1.15].map((y) => (
        <mesh key={y} position={[0, y, 0.66]}>
          <boxGeometry args={[2.0, 0.03, 0.02]} />
          <meshBasicMaterial color="#e6fff9" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 2.25, 0.62]}>
        <boxGeometry args={[2.3, 0.35, 0.05]} />
        <meshBasicMaterial color="#FF1F5A" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.3, 1.6]} color="#9ff7ea" intensity={9} distance={7} decay={1.6} />
    </group>
  );
}

// ---------------------------------------------------------------- tubes + haze
const TUBE_X = [-1.3, 1.3];
const TMP_COLOR = new THREE.Color();
const TMP_LOOK = new THREE.Vector3();

function Tubes() {
  const tubes = useRef<THREE.InstancedMesh>(null);
  const cones = useRef<THREE.Group>(null);
  const glows = useRef<THREE.Group>(null);
  const glowTex = useMemo(
    () =>
      canvasTexture(128, (g, s) => {
        const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        grd.addColorStop(0, "rgba(240,255,245,1)");
        grd.addColorStop(0.25, "rgba(225,255,238,.5)");
        grd.addColorStop(1, "rgba(200,255,230,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, s, s);
      }),
    [],
  );
  useEffect(() => () => glowTex.dispose(), [glowTex]);
  const lamps = useRef<(THREE.PointLight | null)[]>([]);
  const coneMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uLevel: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uLevel; varying vec2 vUv;
          void main(){
            float x = abs(vUv.x - 0.5) * 2.0;
            float w = mix(0.25, 1.0, 1.0 - vUv.y);
            float a = smoothstep(w, 0.0, x) * pow(vUv.y, 1.6) * 0.075 * uLevel;
            gl_FragColor = vec4(vec3(0.85, 1.0, 0.93) * a, a);
          }`,
      }),
    [],
  );
  const coneMats = useMemo(() => AISLE_Z.map(() => coneMat.clone()), [coneMat]);
  useEffect(() => () => coneMats.forEach((m) => m.dispose()), [coneMats]);

  const matrices = useMemo(() => {
    const m = new THREE.Object3D();
    return AISLE_Z.flatMap((z) =>
      TUBE_X.map((x) => {
        m.position.set(x, ROOM.ceil - 0.18, z);
        m.scale.set(1.9, 0.07, 0.12);
        m.updateMatrix();
        return m.matrix.clone();
      }),
    );
  }, []);
  useEffect(() => {
    matrices.forEach((mt, i) => tubes.current?.setMatrixAt(i, mt));
    if (tubes.current) tubes.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  const broken = useRef({ until: 0, on: 1 });
  const levels = useRef(AISLE_Z.map(() => 1)).current;
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    // one tube in aisle 3 is dying: random stutters
    const b = broken.current;
    if (t > b.until) {
      b.on = Math.random() < 0.12 ? 0.15 + Math.random() * 0.4 : 1;
      b.until = t + (b.on < 1 ? 0.05 + Math.random() * 0.12 : 0.4 + Math.random() * 2.5);
    }
    AISLE_Z.forEach((_, a) => {
      const lvl = aisleLevel(a);
      TUBE_X.forEach((__, k) => {
        const i = a * TUBE_X.length + k;
        const v = lvl * (a === 2 && k === 1 ? b.on : 1) * (0.97 + Math.sin(t * 120 + i) * 0.03);
        TMP_COLOR.setRGB(0.94 * v * 1.6 + 0.05, 1.0 * v * 1.6 + 0.05, 0.96 * v * 1.6 + 0.05);
        tubes.current?.setColorAt(i, TMP_COLOR);
      });
      const lamp = lamps.current[a];
      if (lamp) lamp.intensity = 7 * lvl * (a === 2 ? 0.75 + 0.25 * b.on : 1);
      levels[a] = lvl * (a === 2 ? 0.6 + 0.4 * b.on : 1);
    });
    if (tubes.current?.instanceColor) tubes.current.instanceColor.needsUpdate = true;
    glows.current?.children.forEach((g, i) => {
      (g as THREE.Sprite).material.opacity = 0.85 * levels[Math.floor(i / TUBE_X.length)];
    });
    // haze cones face the camera around the vertical axis
    cones.current?.children.forEach((c, i) => {
      c.rotation.y = Math.atan2(camera.position.x - c.position.x, camera.position.z - c.position.z);
      const m = (c as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material;
      m.uniforms.uLevel.value = levels[Math.floor(i / TUBE_X.length)];
    });
  });

  return (
    <group>
      <instancedMesh ref={tubes} args={[undefined, undefined, AISLE_Z.length * TUBE_X.length]}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {AISLE_Z.map((z, a) => (
        <pointLight
          key={z}
          ref={(n) => void (lamps.current[a] = n)}
          position={[0, ROOM.ceil - 0.5, z]}
          color="#eafff4"
          intensity={7}
          distance={9}
          decay={1.5}
        />
      ))}
      <group ref={glows}>
        {AISLE_Z.flatMap((z) =>
          TUBE_X.map((x) => (
            <sprite key={`${z}${x}`} position={[x, ROOM.ceil - 0.24, z]} scale={[3.6, 0.95, 1]}>
              <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
            </sprite>
          )),
        )}
      </group>
      <group ref={cones}>
        {AISLE_Z.flatMap((z, a) =>
          TUBE_X.map((x) => (
            <mesh key={`${z}${x}`} position={[x, (ROOM.ceil + ROOM.floor) / 2 + 0.2, z]} material={coneMats[a]}>
              <planeGeometry args={[3.2, ROOM.ceil - ROOM.floor - 0.4]} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- posters
const POSTER_VERT = /* glsl */ `
  uniform float uTime; uniform float uSeed; uniform float uFlap; uniform float uPeel; uniform vec2 uCorner;
  varying vec2 vUv; varying float vShade;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec3 p = position;
    float hang = 1.0 - uv.y;
    float wave = sin(uTime * 1.6 + uSeed * 6.0 + uv.x * 3.2) * 0.6 + sin(uTime * 2.7 + uSeed * 3.0 + uv.y * 5.0) * 0.3;
    p.z += wave * uFlap * pow(hang, 1.7) * 0.09;
    float d = max(0.0, 1.0 - distance(uv, uCorner) / 0.5);
    float lift = d * d * uPeel * (0.8 + 0.2 * sin(uTime * 2.2 + uSeed * 9.0));
    p.z += lift * 0.55;
    p.xy += (vec2(0.5) - uCorner) * lift * 0.18;
    vShade = 1.0 - lift * 0.5 + wave * uFlap * 0.12 * hang;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const POSTER_FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform vec4 uCell; uniform vec2 uBlinkCell; uniform float uBlink; uniform float uPulse;
  uniform float uLight; uniform float uTime;
  varying vec2 vUv; varying float vShade;
  #include <fog_pars_fragment>
  void main() {
    vec2 base = uBlink > 0.5 ? uBlinkCell : uCell.xy;
    vec4 t = texture2D(uMap, base + vUv * uCell.zw);
    if (t.a < 0.5) discard;
    vec3 col = t.rgb;
    float pink = 1.0 - smoothstep(0.12, 0.3, distance(col, vec3(1.0, 0.12, 0.35)));
    float beat = 0.5 + 0.5 * sin(uTime * 4.2);
    col += pink * uPulse * beat * vec3(0.55, 0.05, 0.18);
    if (!gl_FrontFacing) col = vec3(0.62, 0.58, 0.5);
    col *= vShade * uLight;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;

// back-wall layout: [x, y, rotation deg, scale, peel corner]
const WALL: [number, number, number, number, [number, number]][] = [
  [-4.6, 1.35, -5, 1.0, [1, 0]],
  [-2.55, 1.6, 3, 1.05, [0, 0]],
  [-0.45, 1.3, -2, 1.0, [1, 0]],
  [1.55, 1.7, 4, 0.95, [0, 0]],
  [-3.7, -0.7, 4, 0.95, [1, 0]],
  [-1.5, -0.55, -4, 1.05, [0, 0]],
  [0.6, -0.8, 3, 0.9, [1, 0]],
  [-5.5, -0.9, -3, 0.85, [1, 0]],
  [3.9, 1.95, -3, 0.8, [0, 0]],
];

function Posters({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(asset("/posters/atlas.webp"), () => onReady());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const materials = useMemo(() => {
    const { cols, rows } = POSTER_ATLAS;
    const cell = (i: number) => new THREE.Vector2((i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows);
    return POSTERS.map((p, i) => {
      const c = cell(p.cell);
      const b = p.blinkCell >= 0 ? cell(p.blinkCell) : c;
      return new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        fog: true,
        uniforms: {
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          uMap: { value: texture },
          uCell: { value: new THREE.Vector4(c.x, c.y, 1 / cols, 1 / rows) },
          uBlinkCell: { value: b },
          uBlink: { value: 0 },
          uPulse: { value: p.pulse ? 1 : 0 },
          uLight: { value: 1 },
          uTime: { value: 0 },
          uSeed: { value: i * 0.37 },
          uFlap: { value: 0.6 + (i % 3) * 0.25 },
          uPeel: { value: i % 2 ? 0.35 : 0.18 },
          uCorner: { value: new THREE.Vector2(...WALL[i % WALL.length][4]) },
        },
        vertexShader: POSTER_VERT,
        fragmentShader: POSTER_FRAG,
      });
    });
  }, [texture]);
  useEffect(
    () => () => {
      texture.dispose();
      materials.forEach((m) => m.dispose());
    },
    [texture, materials],
  );

  const nextBlink = useRef(POSTERS.map((_, i) => 2 + i * 1.3));
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const back = aisleLevel(AISLES - 1);
    const light = 0.35 + 0.65 * Math.max(back, lights.off >= AISLES ? 0 : 0.3);
    materials.forEach((m, i) => {
      m.uniforms.uTime.value = t;
      m.uniforms.uLight.value = light * (0.92 + (i % 3) * 0.04);
      if (POSTERS[i].blinkCell >= 0) {
        // doodles blink every 3-5 s for ~150 ms
        const nb = nextBlink.current;
        if (t > nb[i] + 0.15) nb[i] = t + 3 + Math.random() * 2;
        m.uniforms.uBlink.value = t >= nb[i] ? 1 : 0;
      }
    });
  });

  const aspect = POSTER_ATLAS.cellH / POSTER_ATLAS.cellW;
  return (
    <group position={[0, 0, ROOM.back + 0.04]}>
      {POSTERS.map((p, i) => {
        const [x, y, r, s] = WALL[i % WALL.length];
        const w = 1.75 * s;
        return (
          <mesh key={p.name} position={[x, y, i * 0.004]} rotation-z={r * DEG} material={materials[i]}>
            <planeGeometry args={[w, w * aspect, 14, 16]} />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------- dust
function Dust({ count = 520 }: { count?: number }) {
  const geo = useMemo(() => {
    const r = rng(3);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 10;
      pos[i * 3 + 1] = ROOM.floor + r() * (ROOM.ceil - ROOM.floor);
      pos[i * 3 + 2] = ROOM.back + 1 + r() * 13;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uLight: { value: 1 }, uScale: { value: 1 } },
        vertexShader: `uniform float uTime; uniform float uScale; attribute float aSeed; varying float vA;
          void main(){
            vec3 p = position;
            float t = uTime * (0.04 + aSeed * 0.05);
            p.x += sin(t * 6.0 + aSeed * 40.0) * 0.35;
            p.y = ${ROOM.floor.toFixed(2)} + mod(p.y - ${ROOM.floor.toFixed(2)} + t * 1.2, ${(ROOM.ceil - ROOM.floor).toFixed(2)});
            p.z += cos(t * 5.0 + aSeed * 17.0) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (2.0 + aSeed * 3.5) * uScale * (6.0 / -mv.z);
            vA = (0.25 + 0.75 * fract(aSeed * 13.0)) * smoothstep(14.0, 3.0, -mv.z) * smoothstep(0.4, 1.4, -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `uniform float uLight; varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA * 0.55 * uLight;
            gl_FragColor = vec4(vec3(1.0, 0.97, 0.88) * a, a);
          }`,
      }),
    [],
  );
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  const dpr = useThree((s) => s.viewport.dpr);
  const ref = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  useFrame(({ clock }) => {
    const u = ref.current?.material.uniforms;
    if (!u) return;
    u.uTime.value = clock.elapsedTime;
    u.uScale.value = dpr;
    u.uLight.value = 0.3 + 0.7 * lights.level * (1 - lights.off / AISLES);
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

// ---------------------------------------------------------------- camera
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const cur = useRef({ yaw: 0, pitch: 0, scroll: 0 });
  useEffect(() => trackPointer(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const c = cur.current;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const s = max > 0 ? window.scrollY / max : 0;
    const k = 1 - Math.exp(-dt * 3);
    c.scroll += (s - c.scroll) * k;
    c.yaw += (-pointer.x * 5 * DEG - c.yaw) * (1 - Math.exp(-dt * 2.5));
    c.pitch += (-pointer.y * 3.5 * DEG - c.pitch) * (1 - Math.exp(-dt * 2.5));
    // slow push-in over the first ~30 s, then a gentle breath; scrolling walks down the aisle
    const intro = 1 - Math.pow(1 - Math.min(1, t / 30), 3);
    const z = 9.6 - intro * 2.2 - c.scroll * 4.2 + Math.sin(t * 0.25) * 0.08;
    const y = 0.25 - c.scroll * 0.35 + Math.sin(t * 0.33) * 0.03;
    camera.position.set(Math.sin(t * 0.12) * 0.12, y, z);
    TMP_LOOK.set(0, 0.35 - c.scroll * 0.2, ROOM.back);
    camera.lookAt(TMP_LOOK);
    camera.rotateY(c.yaw);
    camera.rotateX(c.pitch);
  });
  return null;
}

/** Drops the pixel ratio once if frames get slow. */
function Budget() {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ t: 0, n: 0, dropped: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.dropped) return;
    a.t += dt;
    a.n++;
    if (a.t > 2) {
      if (a.t / a.n > 1 / 40) {
        setDpr(1);
        a.dropped = true;
      }
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

export default function MartScene({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      className="mart__canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 44, near: 0.1, far: 40, position: [0, 0.25, 9.6] }}
    >
      <color attach="background" args={["#070b09"]} />
      <fogExp2 attach="fog" args={["#0a110e", 0.052]} />
      <hemisphereLight args={["#bfe9d8", "#1a1410", 0.35]} />
      <Room />
      <Shelves />
      <Fridge />
      <Tubes />
      <Posters onReady={onReady} />
      <Dust />
      <CameraRig />
      <Budget />
    </Canvas>
  );
}
