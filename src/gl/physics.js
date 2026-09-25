// cannon-es drag physics (lazy-loaded on desktop only).
// Only the sticker in your hand (or still sliding after a throw) is a dynamic body;
// everything else stays stuck. Stickers overlap freely and only bounce off the edges.
import { World, Body, Box, Plane, Vec3, PointToPointConstraint } from 'cannon-es';

const K = 0.01; // px → metres (keeps the solver in a comfortable range)
const WALLS = 1;
const STICKERS = 2;

export function createPhysics(W, H) {
  const world = new World({ gravity: new Vec3(0, 0, 0) });
  world.defaultContactMaterial.friction = 0;
  world.defaultContactMaterial.restitution = 0.5;

  const hand = new Body({ mass: 0 });
  hand.collisionFilterGroup = 0;
  hand.collisionFilterMask = 0;
  world.addBody(hand);

  let walls = [];
  function buildWalls(w, h) {
    walls.forEach((b) => world.removeBody(b));
    const wall = (x, y, ex, ey) => {
      const b = new Body({ mass: 0, shape: new Plane() });
      b.quaternion.setFromEuler(ex, ey, 0);
      b.position.set(x * K, y * K, 0);
      b.collisionFilterGroup = WALLS;
      b.collisionFilterMask = STICKERS;
      world.addBody(b);
      return b;
    };
    walls = [
      wall(-w / 2, 0, 0, Math.PI / 2),
      wall(w / 2, 0, 0, -Math.PI / 2),
      wall(0, -h / 2, -Math.PI / 2, 0),
      wall(0, h / 2, Math.PI / 2, 0),
    ];
  }
  buildWalls(W, H);

  const live = new Map(); // sticker → { body, constraint, releasedAt }

  function grab(s, local, p) {
    const [x0, y0, x1, y1] = s.item.bounds;
    const body = new Body({ mass: 1, linearDamping: 0.85, angularDamping: 0.9 });
    body.addShape(
      new Box(new Vec3(((x1 - x0) * s.size * K) / 2, ((y1 - y0) * s.size * K) / 2, 0.3)),
      new Vec3(((x0 + x1) / 2 - 0.5) * s.size * K, -((y0 + y1) / 2 - 0.5) * s.size * K, 0),
    );
    body.position.set(s.x * K, s.y * K, 0);
    body.quaternion.setFromEuler(0, 0, s.rot);
    body.linearFactor.set(1, 1, 0);
    body.angularFactor.set(0, 0, 1);
    body.collisionFilterGroup = STICKERS;
    body.collisionFilterMask = WALLS;
    world.addBody(body);
    hand.position.set(p.x * K, p.y * K, 0);
    const constraint = new PointToPointConstraint(body, new Vec3(local.x * K, local.y * K, 0), hand, new Vec3(0, 0, 0));
    world.addConstraint(constraint);
    live.set(s, { body, constraint, releasedAt: 0 });
  }

  function move(p) {
    hand.position.set(p.x * K, p.y * K, 0);
  }

  function release(s) {
    const st = live.get(s);
    if (!st?.constraint) return;
    world.removeConstraint(st.constraint);
    st.constraint = null;
    st.releasedAt = performance.now();
    st.body.linearDamping = 0.93;
    st.body.angularDamping = 0.9;
  }

  /** Advance the sim and write positions back; `onSettle(s)` fires once a thrown sticker stops. */
  function step(dt, onSettle) {
    world.step(1 / 60, Math.min(dt, 0.05), 4);
    for (const [s, st] of live) {
      const b = st.body;
      s.x = b.position.x / K;
      s.y = b.position.y / K;
      s.rot = 2 * Math.atan2(b.quaternion.z, b.quaternion.w);
      if (st.constraint) continue;
      const slow = b.velocity.length() / K < 35 && Math.abs(b.angularVelocity.z) < 0.8;
      if (slow || performance.now() - st.releasedAt > 1600) {
        world.removeBody(b);
        live.delete(s);
        onSettle(s);
      }
    }
  }

  return {
    grab,
    move,
    release,
    step,
    resize: buildWalls,
    get active() {
      return live.size > 0;
    },
  };
}
