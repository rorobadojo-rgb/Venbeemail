// CSS sprite helper for the baked sticker atlas (same image the WebGL stage uses).
import atlas from '../doodles/atlas.json';

const byId = Object.fromEntries(atlas.items.map((it) => [it.id, it]));

export function setSprite(el, id) {
  const it = byId[id] ?? atlas.items[0];
  el.style.setProperty('--sx', it.col);
  el.style.setProperty('--sy', it.row);
  el.dataset.sprite = it.id;
  return el;
}

/** Apply `data-sprite="id"` attributes found in static markup. */
export function hydrateSprites(root = document) {
  root.querySelectorAll('.sprite[data-sprite]').forEach((el) => setSprite(el, el.dataset.sprite));
}

export function spritesOn() {
  document.documentElement.classList.add('sprites-on');
}
