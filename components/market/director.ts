import {
  Color,
  DataTexture,
  Fog,
  Group,
  HemisphereLight,
  LinearMipmapLinearFilter,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  TextureLoader,
  type Camera,
  type Scene,
  type WebGLRenderer,
} from "three";
import { FOG, Lane } from "./lane";

const LIGHTS = 6;
const LIGHT = 4.2;
const SPEED = 0.55; // metres per second: a slow stroll
const TILT = (5 * Math.PI) / 180; // mouse parallax, ±5°
export const EYE = 1.65;

export type PosterMode = "desktop" | "mobile" | null;

/**
 * Runs the walk down the lane: camera stroll + parallax, recycling slots,
 * moving the warm lights along, the "closing time" dimmer and adaptive
 * quality. Plain class so the React side only has to call `frame()`.
 */
export class Director {
  root = new Group();
  private lane: Lane | null = null;
  private lights = Array.from({ length: LIGHTS }, () => new PointLight("#FFB347", LIGHT, 7.5, 1.6));
  private ground = new Mesh(new PlaneGeometry(40, 90), new MeshLambertMaterial({ color: "#1E1B24" }));
  private pointer = { x: 0, y: 0, yaw: 0, pitch: 0 };
  private power = { now: 1, target: 1 };
  private t: number;
  private z: number;
  private frames = 0;
  private ready = false;
  private samples: number[] = [];
  private quality: 0 | 1 | 2 = 2;
  private dpr = 1.5;
  private dead = false;

  constructor(private poster: PosterMode) {
    this.t = poster ? 3.2 : 0;
    this.z = poster ? 1.4 : 2;
    this.ground.rotation.x = -Math.PI / 2;
    this.root.add(this.ground, new HemisphereLight("#3A3F7A", "#2A1A0A", 0.5), ...this.lights);
  }

  attach(scene: Scene, gl: WebGLRenderer, atlasUrl: string) {
    scene.background = new Color(FOG.color);
    scene.fog = new Fog(FOG.color, FOG.near, FOG.far);
    scene.add(this.root);
    new TextureLoader().load(
      atlasUrl,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        t.minFilter = LinearMipmapLinearFilter;
        t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        this.setLane(new Lane(t));
      },
      undefined,
      () => {
        // no atlas (offline?): plain grey banners are better than nothing
        const t = new DataTexture(new Uint8Array([90, 90, 90, 255]), 1, 1);
        t.needsUpdate = true;
        this.setLane(new Lane(t));
      },
    );
  }

  private setLane(lane: Lane) {
    if (this.dead) {
      lane.dispose();
      return;
    }
    this.lane = lane;
    this.root.add(lane.group);
  }

  detach(scene: Scene) {
    this.dead = true;
    scene.remove(this.root);
    this.lane?.dispose();
  }

  /** pointer in -1..1 (viewport) */
  look(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /** 0 = market open, 1 = closed (footer in view) */
  closing(amount: number) {
    this.power.target = 1 - amount * 0.92;
  }

  /** One frame. Calls onReady once the lane has drawn a few frames. */
  frame(camera: Camera, delta: number, gl: WebGLRenderer, setDpr: (dpr: number) => void, onReady: () => void) {
    const lane = this.lane;
    if (!lane) return;
    const dt = Math.min(delta, 0.1);
    if (!this.poster) {
      this.t += dt;
      this.z -= SPEED * dt;
    }
    const p = this.pointer;
    p.yaw += (-p.x * TILT - p.yaw) * Math.min(1, dt * 2.5);
    p.pitch += (-p.y * TILT - p.pitch) * Math.min(1, dt * 2.5);
    camera.position.set(Math.sin(this.t * 0.35) * 0.12, EYE + Math.sin(this.t * 2.3) * 0.012, this.z);
    camera.rotation.set(-0.05 + p.pitch, p.yaw + Math.sin(this.t * 0.21) * 0.03, 0, "YXZ");

    lane.update(this.z);
    const pw = this.power;
    pw.now += (pw.target - pw.now) * Math.min(1, dt * 0.9);
    const anchors = lane.lightAnchors(this.z, LIGHTS);
    this.lights.forEach((l, i) => {
      const a = anchors[i];
      if (a) l.position.set(a[0], a[1], a[2]);
      l.intensity = LIGHT * (0.08 + 0.92 * pw.now);
    });
    this.ground.position.set(0, 0, this.z - 30);
    lane.tick(this.t, pw.now, gl.getPixelRatio());

    this.frames++;
    if (!this.ready && this.frames > 3) {
      this.ready = true;
      window.__marketReady = true;
      onReady();
    }
    // keep it smooth: drop resolution, then the extras, if frames are slow
    if (!this.poster && this.frames > 60) {
      this.samples.push(delta);
      if (this.samples.length >= 90) {
        const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
        this.samples = [];
        if (avg > 1 / 38) {
          if (this.dpr > 1) {
            this.dpr = 1;
            setDpr(1);
          } else if (this.quality > 0) {
            this.quality = (this.quality - 1) as 0 | 1;
            lane.setQuality(this.quality);
          }
        }
      }
    }
  }
}

declare global {
  interface Window {
    __marketReady?: boolean;
  }
}
