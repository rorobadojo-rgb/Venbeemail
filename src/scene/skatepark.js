// Cinematic golden-hour / night skatepark with a penguin punk show — Three.js.
import * as THREE from 'three';
import { CAST, penguinSVG } from '../penguins.js';
import * as T from './textures.js';

const BOWL = { x: 0, z: -1, r: 7.5, flat: 4.5, depth: 1.6 };
const STAGE_TOP = -0.3;
const BPM = 150;
const BEAT = 60 / BPM;

const FLOODS = [
  { pos: [-13, 9, -13], spot: true },
  { pos: [-6, 10.5, -19], spot: false },
  { pos: [6, 10.5, -19], spot: false },
  { pos: [13, 9, -13], spot: true },
  { pos: [17, 9.5, 7], spot: true },
  { pos: [-17, 9.5, 7], spot: true },
];

const lerp = (a, b, t) => a + (b - a) * t;
const nextTask = () => new Promise((r) => setTimeout(r, 0));
const col = (h) => new THREE.Color(h);

/* ---------------- sprite atlas from the SVG cast ---------------- */
async function buildAtlas() {
  const cell = 256, cols = 8;
  const c = document.createElement('canvas');
  c.width = c.height = cell * cols; // 2048 max
  const ctx = c.getContext('2d');
  const imgs = [];
  CAST.forEach((ch, ci) =>
    ch.frames.forEach((pose, fi) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(penguinSVG(ch.spec, pose, `a${ci * 4 + fi}`, { size: cell }));
      imgs.push(img);
    })
  );
  // decode off-thread, then rasterise a handful per task so the page stays responsive
  for (let i = 0; i < imgs.length; i++) {
    await imgs[i].decode();
    ctx.drawImage(imgs[i], (i % cols) * cell, Math.floor(i / cols) * cell, cell, cell);
    if (i % 6 === 5) await nextTask();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, cols };
}

export async function createSkatepark(canvas, { theme = 'golden', still = false, onSlow } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);
  const env = { night: theme === 'night' ? 1 : 0, target: theme === 'night' ? 1 : 0 };
  const uTime = { value: 0 };

  /* ---------- sky ---------- */
  const sunDir = new THREE.Vector3(-0.5, 0.1, -0.86).normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uNight: { value: env.night }, uSun: { value: sunDir }, uTime },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `
      uniform float uNight; uniform vec3 uSun; uniform float uTime; varying vec3 vDir;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
      void main(){
        vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0);
        vec3 g = mix(vec3(1.0,0.74,0.42), vec3(0.98,0.42,0.2), smoothstep(0.0, 0.1, h));
        g = mix(g, vec3(0.42,0.2,0.36), smoothstep(0.08, 0.35, h));
        g = mix(g, vec3(0.12,0.08,0.22), smoothstep(0.3, 0.8, h));
        float sd = max(dot(d, uSun), 0.0);
        g = mix(g, vec3(1.0,0.5,0.18), pow(sd, 24.0) * 0.55) + vec3(0.35,0.12,0.0) * pow(sd, 6.0);
        g = mix(g, vec3(1.0,0.86,0.55), smoothstep(0.9982, 0.9992, sd));
        vec3 n = mix(vec3(0.12,0.06,0.18), vec3(0.015,0.018,0.05), smoothstep(0.0, 0.45, h));
        vec3 cell = floor(d * 260.0);
        float s = step(0.9965, hash(cell)) * smoothstep(0.04, 0.3, h);
        n += s * (0.55 + 0.45 * sin(uTime * 2.5 + hash(cell) * 60.0));
        gl_FragColor = vec4(mix(g, n, uNight), 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat));
  scene.fog = new THREE.Fog(0xd98a5a, 30, 110);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0xffcf9a, 0x4a3a30, 1.3);
  const sun = new THREE.DirectionalLight(0xffa860, 2.4);
  sun.position.set(-30, 12, 6);
  scene.add(hemi, sun);

  await nextTask();
  /* ---------- materials ---------- */
  const concrete = T.concreteTexture([1 / 8, 1 / 8]);
  const groundMat = new THREE.MeshLambertMaterial({ map: concrete });
  const bowlMat = new THREE.MeshLambertMaterial({ map: T.concreteTexture([10, 2], 11, '#a39d93'), side: THREE.DoubleSide });
  const rampMat = new THREE.MeshLambertMaterial({ map: T.concreteTexture([1 / 4, 1 / 4], 17, '#9d978d') });
  const metal = new THREE.MeshLambertMaterial({ color: 0xc8ccd0 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x151515 });
  const wood = new THREE.MeshLambertMaterial({ map: T.woodTexture() });

  /* ---------- ground with the bowl cut out ---------- */
  const gShape = new THREE.Shape();
  gShape.moveTo(-90, -90); gShape.lineTo(90, -90); gShape.lineTo(90, 90); gShape.lineTo(-90, 90); gShape.closePath();
  const hole = new THREE.Path();
  hole.absarc(BOWL.x, -BOWL.z, BOWL.r, 0, Math.PI * 2, true);
  gShape.holes.push(hole);
  const ground = new THREE.Mesh(new THREE.ShapeGeometry(gShape, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const prof = [new THREE.Vector2(0, -BOWL.depth), new THREE.Vector2(BOWL.flat, -BOWL.depth)];
  for (let i = 1; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    prof.push(new THREE.Vector2(BOWL.flat + (BOWL.r - BOWL.flat) * Math.sin(a), -BOWL.depth + BOWL.depth * (1 - Math.cos(a))));
  }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), bowlMat);
  bowl.position.set(BOWL.x, 0, BOWL.z);
  scene.add(bowl);
  const coping = new THREE.Mesh(new THREE.TorusGeometry(BOWL.r, 0.1, 8, 128), metal);
  coping.rotation.x = Math.PI / 2;
  coping.position.set(BOWL.x, 0.03, BOWL.z);
  scene.add(coping);

  await nextTask();
  /* ---------- plywood stage in the bowl ---------- */
  const stage = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.3, 2.4), wood);
  stage.position.set(0, -BOWL.depth + 0.65, -3.2);
  scene.add(stage);
  const ampTex = T.ampTexture();
  const ampFront = new THREE.MeshLambertMaterial({ map: ampTex });
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const amp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.6), [dark, dark, dark, dark, ampFront, dark]);
      amp.position.set(sx * 2.65, STAGE_TOP + 0.43 + k * 0.86, -4.0);
      amp.rotation.y = -sx * 0.18;
      scene.add(amp);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.5), [dark, dark, dark, dark, ampFront, dark]);
    head.position.set(sx * 2.65, STAGE_TOP + 1.9, -4.0);
    head.rotation.y = -sx * 0.18;
    scene.add(head);
  }
  const cableMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  [
    [[-2.6, STAGE_TOP + 0.02, -3.6], [-2.1, STAGE_TOP + 0.02, -2.6], [-1.2, STAGE_TOP + 0.02, -2.9], [-1.6, STAGE_TOP + 0.02, -2.3]],
    [[2.6, STAGE_TOP + 0.02, -3.6], [2.3, STAGE_TOP + 0.02, -2.4], [1.4, STAGE_TOP + 0.02, -2.2], [1.8, STAGE_TOP + 0.02, -2.6]],
  ].forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.025, 5), cableMat));
  });

  // slime oozing over the stage edge
  const slimeCols = ['#B4FF1A', '#B4FF1A', '#FF3DAE', '#22E6FF', '#B4FF1A', '#9B4DFF', '#FFE81F', '#B4FF1A', '#FF8A1F', '#B4FF1A', '#22E6FF', '#B4FF1A'];
  const slimeStrip = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.07, 0.18), new THREE.MeshLambertMaterial({ color: 0xb4ff1a, emissive: 0x3a5a00 }));
  slimeStrip.position.set(0, STAGE_TOP + 0.02, -2.02);
  scene.add(slimeStrip);
  const dripGeo = new THREE.CapsuleGeometry(0.065, 0.35, 4, 8);
  dripGeo.translate(0, -0.22, 0);
  const drips = slimeCols.map((c, i) => {
    const m = new THREE.Mesh(dripGeo, new THREE.MeshLambertMaterial({ color: c, emissive: new THREE.Color(c).multiplyScalar(0.25) }));
    m.position.set(-3.0 + i * 0.55 + Math.sin(i * 7) * 0.1, STAGE_TOP + 0.02, -1.98);
    m.userData.phase = i * 1.7;
    scene.add(m);
    return m;
  });

  /* ---------- half-pipe ---------- */
  const hp = new THREE.Shape();
  hp.moveTo(-4.8, 0); hp.lineTo(-4.8, 2.5); hp.lineTo(-4, 2.5);
  hp.absarc(-1.5, 2.5, 2.5, Math.PI, 1.5 * Math.PI, false);
  hp.lineTo(1.5, 0);
  hp.absarc(1.5, 2.5, 2.5, 1.5 * Math.PI, 2 * Math.PI, false);
  hp.lineTo(4.8, 2.5); hp.lineTo(4.8, 0); hp.closePath();
  const halfpipe = new THREE.Mesh(new THREE.ExtrudeGeometry(hp, { depth: 6, bevelEnabled: false, curveSegments: 16 }), rampMat);
  halfpipe.position.set(-16, 0, -11);
  halfpipe.rotation.y = 0.55;
  scene.add(halfpipe);
  for (const sx of [-4, 4]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 8), metal);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(sx, 2.5, 3);
    halfpipe.add(pipe);
  }

  /* ---------- rail ---------- */
  const RAIL = { x0: 3, x1: 6.6, z: 7.2, y: 0.55 };
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, RAIL.x1 - RAIL.x0, 8), metal);
  rail.rotation.z = Math.PI / 2;
  rail.position.set((RAIL.x0 + RAIL.x1) / 2, RAIL.y, RAIL.z);
  scene.add(rail);
  for (const x of [RAIL.x0 + 0.3, RAIL.x1 - 0.3]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, RAIL.y, 6), metal);
    leg.position.set(x, RAIL.y / 2, RAIL.z);
    scene.add(leg);
  }

  await nextTask();
  /* ---------- graffiti walls + chain-link fence ---------- */
  const wallGeo = new THREE.BoxGeometry(16, 4, 0.4);
  const wallSide = new THREE.MeshLambertMaterial({ color: 0x6e675e });
  for (const [x, z, ry, seed] of [[-16.5, -16, 0.18, 21], [0, -17, 0, 42], [16.5, -16, -0.18, 63], [-24, -4, 1.1, 84], [24, -4, -1.1, 105]]) {
    await nextTask();
    const face = new THREE.MeshLambertMaterial({ map: T.graffitiTexture(seed) });
    const w = new THREE.Mesh(wallGeo, [wallSide, wallSide, wallSide, wallSide, face, wallSide]);
    w.position.set(x, 2, z);
    w.rotation.y = ry;
    scene.add(w);
  }
  const fenceTex = T.fenceTexture();
  const fenceMat = new THREE.MeshLambertMaterial({ map: fenceTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: false });
  const fence = new THREE.Mesh(new THREE.PlaneGeometry(90, 6), fenceMat);
  fence.position.set(0, 3, -22);
  scene.add(fence);
  for (let x = -45; x <= 45; x += 6) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 6.2, 6), metal);
    post.position.set(x, 3.1, -22);
    scene.add(post);
  }
  for (const sx of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), fenceMat);
    f.position.set(sx * 30, 3, -2);
    f.rotation.y = Math.PI / 2;
    scene.add(f);
  }

  await nextTask();
  /* ---------- floodlights, volumetric shafts, anamorphic flares ---------- */
  const glowTex = T.glowTexture(), streakTex = T.streakTexture();
  const aim = new THREE.Vector3(0, -0.6, -2);
  const shaftMat = () =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
      uniforms: { uLevel: { value: 0 }, uColor: { value: col('#ffe2b0') }, uTime },
      vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uLevel; uniform vec3 uColor; uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){
          float edge = pow(abs(dot(vN, vV)), 2.0);
          float along = vUv.y;
          float dust = 0.8 + 0.2 * sin(vUv.x * 50.0 + uTime * 0.6) * sin(along * 18.0 - uTime * 0.9);
          float a = along * along * edge * uLevel * 0.45 * dust;
          gl_FragColor = vec4(uColor, a);
        }`,
    });
  const floods = FLOODS.map((f, i) => {
    const p = new THREE.Vector3(...f.pos);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, p.y, 8), dark);
    pole.position.set(p.x, p.y / 2, p.z);
    scene.add(pole);
    const head = new THREE.Group();
    head.position.copy(p);
    head.lookAt(aim);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.35), dark);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x222222, fog: false });
    const bulbs = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), bulbMat);
    bulbs.position.z = 0.18;
    head.add(housing, bulbs);
    scene.add(head);

    const dist = p.distanceTo(aim) * 1.05;
    const coneGeo = new THREE.ConeGeometry(4.2, dist, 32, 1, true);
    coneGeo.translate(0, -dist / 2, 0);
    coneGeo.rotateX(-Math.PI / 2);
    const cone = new THREE.Mesh(coneGeo, shaftMat());
    cone.position.copy(p);
    cone.lookAt(aim);
    cone.renderOrder = 2;
    scene.add(cone);

    let spot = null;
    if (f.spot) {
      spot = new THREE.SpotLight(0xfff0d6, 0, 70, 0.52, 0.65, 1);
      spot.position.copy(p);
      spot.target.position.copy(aim);
      scene.add(spot, spot.target);
    }
    const flareCol = i % 2 ? '#8fd3ff' : '#ffc88a';
    const streak = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, color: flareCol, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 }));
    streak.scale.set(22, 0.55, 1);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff1d0', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 }));
    glow.scale.set(4, 4, 1);
    const fp = p.clone().add(new THREE.Vector3().subVectors(aim, p).normalize().multiplyScalar(0.4));
    streak.position.copy(fp);
    glow.position.copy(fp);
    scene.add(streak, glow);
    return { bulbMat, cone, spot, streak, glow, level: 0, target: 0, flicker: 0 };
  });

  // sun flare (golden hour)
  const sunPos = sunDir.clone().multiplyScalar(250);
  const sunStreak = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, color: '#ffb36b', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, fog: false }));
  sunStreak.scale.set(260, 5, 1);
  sunStreak.position.copy(sunPos);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff9a4a', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, fog: false }));
  sunGlow.scale.set(46, 46, 1);
  sunGlow.position.copy(sunPos);
  scene.add(sunStreak, sunGlow);

  await nextTask();
  /* ---------- dust motes ---------- */
  const N = 900;
  const dpos = new Float32Array(N * 3), dseed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    dpos[i * 3] = (Math.random() - 0.5) * 40;
    dpos[i * 3 + 1] = Math.random() * 10;
    dpos[i * 3 + 2] = -18 + Math.random() * 28;
    dseed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dseed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime, uMap: { value: T.dotTexture() }, uColor: { value: col('#ffd9a0') }, uAmt: { value: 0.55 }, uScale: { value: innerHeight * 0.5 } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uScale; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.05 + aSeed * 0.12), 10.0);
        p.x += sin(uTime * 0.25 + aSeed * 40.0) * 0.8;
        p.z += cos(uTime * 0.2 + aSeed * 30.0) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (0.04 + aSeed * 0.06) * uScale / -mv.z;
        vA = (0.4 + 0.6 * sin(uTime * (0.6 + aSeed) + aSeed * 20.0) * 0.5 + 0.3) * smoothstep(0.0, 1.5, p.y) * smoothstep(10.0, 8.0, p.y);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uColor; uniform float uAmt; varying float vA;
      void main(){ float a = texture2D(uMap, gl_PointCoord).a; gl_FragColor = vec4(uColor, a * vA * uAmt); }`,
  });
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ---------- lightning sparks around the stage ---------- */
  const boltTex = T.boltTexture();
  const bolts = [[-3.5, 0.9, -2.4], [3.5, 1.1, -2.5], [-1.2, 2.6, -3.8], [1.6, 2.4, -3.6], [0, 3.0, -4.2]].map(([x, y, z], i) => {
    const t = boltTex.clone();
    t.repeat.set(0.25, 1);
    t.offset.x = (i % 4) * 0.25;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    s.scale.set(0.8, 1.6, 1);
    s.position.set(x, y, z);
    s.material.rotation = (Math.random() - 0.5) * 1.2;
    s.visible = false;
    scene.add(s);
    return { s, t, next: 0 };
  });

  await nextTask();
  /* ---------- penguins: one instanced draw call ---------- */
  const { tex: atlas, cols } = await buildAtlas();
  const pGeo = new THREE.PlaneGeometry(1, 1);
  pGeo.translate(0, 0.39, 0);
  const cells = new Float32Array(CAST.length * 2);
  const cellAttr = new THREE.InstancedBufferAttribute(cells, 2);
  cellAttr.setUsage(THREE.DynamicDrawUsage);
  pGeo.setAttribute('aCell', cellAttr);
  const uTint = { value: new THREE.Color(1, 1, 1) };
  const uFlash = { value: 0 };
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: atlas }, uCols: { value: cols }, uTint, uFlash },
    side: THREE.DoubleSide,
    vertexShader: `attribute vec2 aCell; uniform float uCols; varying vec2 vUv;
      void main(){ vUv = vec2((aCell.x + uv.x) / uCols, 1.0 - (aCell.y + 1.0 - uv.y) / uCols);
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uTint; uniform float uFlash; varying vec2 vUv;
      void main(){ vec4 c = texture2D(uMap, vUv); if (c.a < 0.5) discard;
        gl_FragColor = vec4(c.rgb * uTint + uFlash * vec3(0.18, 0.28, 0.02), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const penguins = new THREE.InstancedMesh(pGeo, pMat, CAST.length);
  penguins.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  penguins.frustumCulled = false;
  scene.add(penguins);

  const crowdSpots = [[-3.1, 1.6], [-2.0, 0.4], [-1.0, 2.1], [0.1, 0.9], [1.1, 2.3], [2.1, 0.5], [3.1, 1.6], [-0.4, -0.4]];
  let ci = 0;
  const actors = CAST.map((c, i) => {
    const a = { id: c.id, role: c.role, scale: c.scale, idx: i, pos: new THREE.Vector3(), lean: 0, frame: 0, phase: Math.random() * 10, facing: 1 };
    if (c.id === 'vocalist') a.pos.set(-1.9, STAGE_TOP, -2.5);
    if (c.id === 'guitarist') a.pos.set(1.9, STAGE_TOP, -2.6);
    if (c.id === 'drummer') a.pos.set(0, STAGE_TOP, -3.7);
    if (c.id === 'filmer') {
      const ang = 0.72;
      a.pos.set(BOWL.x + Math.cos(ang) * (BOWL.r + 0.1), -0.32, BOWL.z + Math.sin(ang) * (BOWL.r + 0.1));
    }
    if (c.role === 'crowd') {
      const [x, z] = crowdSpots[ci++];
      a.pos.set(x, -BOWL.depth, z);
    }
    return a;
  });
  const byId = Object.fromEntries(actors.map((a) => [a.id, a]));

  // halftone speed lines behind the skaters
  const speedTex = T.speedTexture();
  const speedLines = ['kickflip', 'cruiser'].map((id) => {
    const t = speedTex.clone();
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.6, color: id === 'kickflip' ? '#FFE81F' : '#22E6FF', fog: false }));
    s.scale.set(2.4, 1.0, 1);
    scene.add(s);
    return { id, s, t };
  });

  const seqs = {
    vocalist: [0, 1, 1, 2, 1, 3, 1, 2],
    guitarist: [0, 1, 2, 1, 3, 1, 2, 1],
    drummer: [0, 1, 2, 3],
    filmer: [0, 0, 1, 1, 2, 2, 0, 3],
  };

  const right = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  function updateActors(t) {
    const beat = t / BEAT;
    for (const a of actors) {
      let frame = 0;
      let yOff = 0;
      if (seqs[a.id]) {
        const s = seqs[a.id];
        const rate = a.id === 'filmer' ? 0.5 : a.id === 'drummer' ? 2 : 1;
        frame = s[Math.floor(beat * rate + a.phase) % s.length];
      } else if (a.role === 'crowd') {
        const hype = Math.sin(t * 0.3 + a.phase) > 0.35;
        if (hype) {
          frame = 2 + (Math.floor(beat + a.phase) % 2);
          yOff = Math.abs(Math.sin((beat + a.phase) * Math.PI)) * 0.25;
        } else {
          frame = Math.floor(beat + a.phase) % 2;
          yOff = Math.abs(Math.sin((beat + a.phase) * Math.PI)) * 0.05;
        }
      } else if (a.id === 'cruiser') {
        const ang = t * 0.32 + 1.8;
        const R = BOWL.r + 1.1;
        a.pos.set(BOWL.x + Math.cos(ang) * R, 0, BOWL.z + Math.sin(ang) * R);
        (a.vel ||= new THREE.Vector3()).set(-Math.sin(ang), 0, Math.cos(ang));
        a.lean = 0.12;
        frame = Math.floor(t * 4) % 4;
      } else if (a.id === 'kickflip') {
        const u = (t % 5.2) / 5.2;
        const x = -4 + u * 17;
        let y = 0;
        frame = 0;
        const j0 = RAIL.x0 - 1.4, j1 = RAIL.x0 + 0.3, d1 = RAIL.x1 + 1.2;
        if (x >= j0 && x < j1) {
          const k = (x - j0) / (j1 - j0);
          y = lerp(0, RAIL.y, k) + Math.sin(k * Math.PI) * 0.9;
          frame = k < 0.2 ? 1 : k < 0.85 ? 2 : 3;
        } else if (x >= j1 && x < RAIL.x1) {
          y = RAIL.y;
          frame = 0;
          a.grind = true;
        } else if (x >= RAIL.x1 && x < d1) {
          const k = (x - RAIL.x1) / (d1 - RAIL.x1);
          y = lerp(RAIL.y, 0, k) + Math.sin(k * Math.PI) * 0.35;
          frame = k > 0.8 ? 3 : 1;
        }
        a.grind = x >= j1 && x < RAIL.x1;
        a.pos.set(x, y, RAIL.z + 0.05);
        (a.vel ||= new THREE.Vector3()).set(1, 0, 0);
      }
      a.frame = frame;
      a.yOff = yOff;
    }
  }

  function writeInstances() {
    for (const a of actors) {
      const cell = a.idx * 4 + a.frame;
      cells[a.idx * 2] = cell % cols;
      cells[a.idx * 2 + 1] = Math.floor(cell / cols);
      tmp.copy(a.pos);
      tmp.y += a.yOff || 0;
      const yaw = Math.atan2(camera.position.x - tmp.x, camera.position.z - tmp.z);
      e.set(0, yaw, a.lean || 0);
      q.setFromEuler(e);
      sc.set(a.scale, a.scale, a.scale);
      m4.compose(tmp, q, sc);
      penguins.setMatrixAt(a.idx, m4);
    }
    penguins.instanceMatrix.needsUpdate = true;
    cellAttr.needsUpdate = true;
  }

  function updateSpeedLines() {
    for (const L of speedLines) {
      const a = byId[L.id];
      if (!a.vel) continue;
      // trail behind the skater in screen space
      tmp.copy(a.pos).project(camera);
      tmp2.copy(a.pos).add(a.vel).project(camera);
      const dir = Math.sign(tmp2.x - tmp.x) || 1;
      L.t.repeat.x = dir;
      L.t.offset.x = dir > 0 ? 0 : 1;
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      L.s.position.copy(a.pos).addScaledVector(right, -dir * 1.5);
      L.s.position.y += a.scale * 0.35;
      L.s.material.opacity = L.id === 'kickflip' && a.pos.x > 11 ? 0 : 0.55;
    }
  }

  /* ---------- theme ---------- */
  const C = {
    fogG: col('#c98458'), fogN: col('#0c0a18'),
    hemiSkyG: col('#ffcf9a'), hemiSkyN: col('#4050a0'),
    hemiGndG: col('#4a3a30'), hemiGndN: col('#07070c'),
    tintG: col('#fff1dc'), tintN: col('#a8b4e8'),
    dustG: col('#ffd9a0'), dustN: col('#bfd4ff'),
  };
  const tc = new THREE.Color();
  function applyTheme() {
    const n = env.night;
    skyMat.uniforms.uNight.value = n;
    scene.fog.color.copy(tc.copy(C.fogG).lerp(C.fogN, n));
    scene.fog.near = lerp(30, 20, n);
    scene.fog.far = lerp(110, 80, n);
    hemi.color.copy(tc.copy(C.hemiSkyG).lerp(C.hemiSkyN, n));
    hemi.groundColor.copy(tc.copy(C.hemiGndG).lerp(C.hemiGndN, n));
    hemi.intensity = lerp(1.3, 0.35, n);
    sun.intensity = lerp(2.4, 0.15, n);
    sun.color.set(n > 0.5 ? '#8aa0ff' : '#ffa860');
    uTint.value.copy(tc.copy(C.tintG).lerp(C.tintN, n));
    dustMat.uniforms.uColor.value.copy(tc.copy(C.dustG).lerp(C.dustN, n));
    dustMat.uniforms.uAmt.value = lerp(0.6, 0.45, n);
    sunStreak.material.opacity = (1 - n) * 0.55;
    sunGlow.material.opacity = (1 - n) * 0.35;
    renderer.toneMappingExposure = lerp(1.05, 1.2, n);
  }

  function updateFloods(t, dt) {
    const n = env.night;
    for (const f of floods) {
      if (still) {
        f.level = f.target;
      } else if (f.flicker > 0) {
        f.flicker -= dt;
        f.level = Math.random() > 0.45 ? f.target : 0.1;
      } else {
        f.level += (f.target - f.level) * Math.min(1, dt * 10);
      }
      const L = f.level;
      f.bulbMat.color.setRGB(0.15 + 2.2 * L, 0.15 + 2.0 * L, 0.15 + 1.6 * L);
      f.cone.material.uniforms.uLevel.value = L * lerp(0.75, 1.3, n);
      if (f.spot) f.spot.intensity = L * lerp(40, 85, n);
      f.streak.material.opacity = L * lerp(0.35, 0.9, n);
      f.glow.material.opacity = L * lerp(0.5, 0.95, n);
    }
  }

  /* ---------- camera rig ---------- */
  const rig = { yaw: 0, pitch: 0, px: 0, py: 0, scroll: 0 };
  const lookAt = new THREE.Vector3(0, 0.9, -1);
  function updateCamera(t) {
    rig.yaw += (rig.px * THREE.MathUtils.degToRad(5) - rig.yaw) * 0.05;
    rig.pitch += (rig.py * THREE.MathUtils.degToRad(3) - rig.pitch) * 0.05;
    const dolly = still ? 0 : Math.sin((t / 40) * Math.PI * 2) * 1.3;
    const D = 16.5 + dolly + rig.scroll * 3;
    const pitch = THREE.MathUtils.degToRad(12 + rig.scroll * 7) + rig.pitch;
    const yaw = rig.yaw + (still ? 0 : Math.sin(t * 0.05) * 0.03);
    camera.position.set(lookAt.x + Math.sin(yaw) * Math.cos(pitch) * D, lookAt.y + Math.sin(pitch) * D, lookAt.z + Math.cos(yaw) * Math.cos(pitch) * D);
    camera.lookAt(lookAt);
  }

  /* ---------- loop ---------- */
  let raf = 0, running = false, last = performance.now(), t = 0;
  let slowFrames = 0, frames = 0, benchStart = 0;
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!still) t += dt;
    uTime.value = t;
    env.night += (env.target - env.night) * Math.min(1, dt * 2.5);
    applyTheme();
    updateFloods(t, dt);
    updateCamera(t);
    updateActors(still ? 1.3 : t);
    writeInstances();
    updateSpeedLines();
    drips.forEach((d) => (d.scale.y = 1 + 0.6 * Math.sin(t * 1.3 + d.userData.phase) + 0.3));
    let flash = 0;
    for (const b of bolts) {
      if (t > b.next) {
        b.s.visible = !still && Math.random() > 0.55;
        b.t.offset.x = Math.floor(Math.random() * 4) * 0.25;
        b.s.material.rotation = (Math.random() - 0.5) * 1.2;
        b.next = t + 0.05 + Math.random() * 0.15;
      }
      if (b.s.visible) flash += 0.2;
    }
    uFlash.value = Math.min(flash, 0.4);
    renderer.render(scene, camera);
    // adaptive resolution: drop pixel ratio if we keep missing 60fps
    if (dt > 0.024) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 90 && dpr > 1) {
      dpr = 1;
      renderer.setPixelRatio(dpr);
      slowFrames = 0;
    }
    // sustained sub-25fps even at 1x → give up on 3D
    if (!still) frames++;
    if (frames === 30) benchStart = now;
    if (frames === 150 && (now - benchStart) / 120 > 40) {
      stop();
      onSlow?.();
      return;
    }
    if (running) raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running) return;
    running = true;
    frames = 0;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  const renderOnce = () => requestAnimationFrame(tick);

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = camera.aspect < 1.3 ? 60 : 50;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    dustMat.uniforms.uScale.value = innerHeight * 0.5;
    if (!running) renderOnce();
  }
  // compile programs (parallel where supported) and upload textures ahead of the first frame
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  updateCamera(0);
  await renderer.compileAsync(scene, camera);
  const textures = new Set();
  scene.traverse((o) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => [m.map, m.uniforms?.uMap?.value].forEach((t) => t && textures.add(t)));
  });
  for (const t of textures) {
    renderer.initTexture(t);
    await nextTask();
  }

  addEventListener('resize', resize);
  resize();
  if (!still) start();

  // floodlights power up one by one
  floods.forEach((f, i) => {
    setTimeout(() => {
      f.target = 1;
      f.flicker = still ? 0 : 0.35;
      if (still) renderOnce();
    }, still ? 0 : 400 + i * 380);
  });

  return {
    start: () => !still && start(),
    stop,
    setTheme(name) {
      env.target = name === 'night' ? 1 : 0;
      if (still) {
        env.night = env.target;
        renderOnce();
      }
    },
    setPointer(x, y) {
      rig.px = x;
      rig.py = y;
    },
    setScroll(p) {
      rig.scroll = p;
      if (still) renderOnce();
    },
    // lights switched off from the last one backwards (used by the footer)
    setLightsOn(count) {
      floods.forEach((f, i) => (f.target = i < count ? 1 : 0));
      if (still) renderOnce();
    },
    lightCount: floods.length,
  };
}
