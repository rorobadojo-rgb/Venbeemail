/**
 * Tiny event bus between parts of the market that don't share a React tree:
 * the logo banner, the DOM bulb strings, the 3D lane and the footer.
 */
type Events = {
  /** the logo was clicked: the banner flaps, bulbs sway, slime drips */
  laugh: { variant: number };
  /** pointer is over the logo banner: nearby bulbs brighten */
  "banner-hover": { on: boolean };
  /** 0..1 how "closed" the market is (footer in view => 1) */
  closing: { amount: number };
  /** a new letter arrived in the active inbox */
  mail: { id: string };
};

type Handler<K extends keyof Events> = (payload: Events[K]) => void;
const handlers = new Map<keyof Events, Set<(payload: never) => void>>();

export const bus = {
  on<K extends keyof Events>(event: K, fn: Handler<K>) {
    let set = handlers.get(event);
    if (!set) handlers.set(event, (set = new Set()));
    set.add(fn);
    return () => {
      set.delete(fn);
    };
  },
  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    handlers.get(event)?.forEach((fn) => (fn as Handler<K>)(payload));
  },
};
