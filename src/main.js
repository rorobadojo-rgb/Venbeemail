import '@fontsource/bangers/latin-400.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import './styles.css';
import gsap from 'gsap';
import { state, store } from './state.js';
import { buildWordmark } from './wordmark.js';
import { buildLogoSticker } from './logo.js';
import { buildStaticPark } from './mobile-bg.js';
import { initTool } from './tool.js';
import { initSections } from './sections.js';
import { initAudio, setMuted, isMuted, sfx } from './audio.js';

const root = document.documentElement;
const $ = (s) => document.querySelector(s);

/* ---------- preferences ---------- */
const params = new URLSearchParams(location.search);
if (store('vm-motion') === 'reduced' || params.has('still')) state.reduced = true;
root.classList.toggle('reduced', state.reduced);
let theme = store('vm-theme') === 'night' ? 'night' : 'golden';
root.dataset.theme = theme;

/* ---------- film grain tile ---------- */
(() => {
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 22;
  }
  ctx.putImageData(img, 0, 0);
  root.style.setProperty('--grain', `url(${c.toDataURL('image/webp', 0.6)})`);
})();

/* ---------- toast ---------- */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  if (!state.reduced) gsap.fromTo(toastEl, { y: 30, rotation: -3, scale: 0.9 }, { y: 0, rotation: 0, scale: 1, duration: 0.5, ease: 'back.out(2.5)' });
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

/* ---------- build the page (split into short tasks to keep the main thread free) ---------- */
let scene = null;
const nextTask = () => new Promise((r) => setTimeout(r, 0));
(async () => {
  buildLogoSticker($('#logo3d'));
  buildWordmark($('#wordmark'));
  await nextTask();
  initTool({ toast });
  await nextTask();
  buildStaticPark($('#static-park'));
  await nextTask();
  initSections({
    onLights(f) {
      scene?.setLightsOn(Math.round(f * scene.lightCount));
      const lights = document.querySelectorAll('.sp-light');
      const on = Math.round(f * lights.length);
      lights.forEach((l, i) => l.classList.toggle('off', i >= on));
    },
  });
  // the footer's glowing title is only built when it is about to scroll into view
  const footerMark = $('#footer-wordmark');
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      buildWordmark(footerMark, { interactive: false, entrance: false, glow: true });
    },
    { rootMargin: '900px 0px' }
  );
  io.observe(footerMark);
})();

/* ---------- audio: only after the first interaction ---------- */
const unlock = () => initAudio();
addEventListener('pointerdown', unlock, { once: true, passive: true });
addEventListener('keydown', unlock, { once: true });
document.addEventListener('pointerover', (e) => {
  const b = e.target.closest('.btn, .chip, .svc');
  if (b && !b.contains(e.relatedTarget)) sfx('pop', { throttle: 70, rate: 0.9 + Math.random() * 0.3 });
});

/* ---------- amp-knob mute toggle ---------- */
const knob = $('#amp-knob');
const soundBox = $('#set-sound');
function renderMute(animate = true) {
  const m = isMuted();
  knob.setAttribute('aria-pressed', String(!m));
  knob.setAttribute('aria-label', m ? 'VOL: suara mati — klik untuk menyalakan' : 'VOL: suara nyala — klik untuk mematikan');
  knob.classList.toggle('muted', m);
  soundBox.checked = !m;
  gsap.to('.knob-dial', { rotation: m ? -135 : 135, duration: animate && !state.reduced ? 0.5 : 0, ease: 'back.out(2)', transformOrigin: '50% 50%' });
}
knob.addEventListener('click', () => {
  initAudio();
  setMuted(!isMuted());
  renderMute();
  if (!isMuted()) sfx('drum');
});
soundBox.addEventListener('change', () => {
  initAudio();
  setMuted(!soundBox.checked);
  renderMute();
});
renderMute(false);

/* ---------- settings drawer ---------- */
const drawer = $('#drawer');
const panel = $('.drawer-panel');
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  drawer.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');
  gsap.fromTo(panel, { xPercent: 105, rotation: 3 }, { xPercent: 0, rotation: 0, duration: state.reduced ? 0 : 0.55, ease: 'back.out(1.4)' });
  gsap.fromTo(drawer, { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: 'rgba(0,0,0,.45)', duration: 0.3 });
  $('#drawer-close').focus();
}
function closeDrawer() {
  gsap.to(panel, {
    xPercent: 105, duration: state.reduced ? 0 : 0.35, ease: 'power2.in',
    onComplete: () => {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
      lastFocus?.focus();
    },
  });
}
$('#open-settings').addEventListener('click', openDrawer);
$('#svc-settings').addEventListener('click', openDrawer);
$('#drawer-close').addEventListener('click', closeDrawer);
drawer.addEventListener('click', (e) => e.target === drawer && closeDrawer());
addEventListener('keydown', (e) => e.key === 'Escape' && !drawer.hidden && closeDrawer());

function setTheme(t) {
  theme = t;
  root.dataset.theme = t;
  store('vm-theme', t);
  document.querySelectorAll('[data-theme-set]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeSet === t)));
  $('meta[name="theme-color"]').content = t === 'night' ? '#07060f' : '#0A0A0A';
  scene?.setTheme(t);
}
document.querySelectorAll('[data-theme-set]').forEach((b) =>
  b.addEventListener('click', () => {
    setTheme(b.dataset.themeSet);
    sfx('rewind');
    toast(b.dataset.themeSet === 'night' ? 'Mode malam: lampu sorot nyala penuh.' : 'Golden hour: matahari kembali.');
  })
);
setTheme(theme);

const motionBox = $('#set-motion');
motionBox.checked = state.reduced;
motionBox.addEventListener('change', () => {
  store('vm-motion', motionBox.checked ? 'reduced' : 'full');
  location.reload();
});

/* ---------- scroll + pointer → scene ---------- */
function onScroll() {
  const max = root.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  root.style.setProperty('--scroll', p.toFixed(3));
  scene?.setScroll(p);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
addEventListener('pointermove', (e) => scene?.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
document.addEventListener('visibilitychange', () => (document.hidden ? scene?.stop() : scene?.start()));

/* ---------- lazy-load the 3D skatepark (desktop only) ---------- */
// WebGL2 on a real GPU only: software rasterisers (SwiftShader, llvmpipe…) get the illustrated park instead.
function hardwareWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return params.has('force3d') || !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
if (!state.mobile && !params.has('flat') && hardwareWebGL()) {
  const load = () =>
    import('./scene/skatepark.js')
      .then(({ createSkatepark }) =>
        createSkatepark($('#scene'), {
          theme,
          still: state.reduced,
          // GPU can't hold a decent frame rate → hand back to the illustrated backdrop
          onSlow() {
            scene?.stop();
            scene = null;
            root.classList.remove('has-3d');
          },
        })
      )
      .then((s) => {
        scene = s;
        onScroll();
        root.classList.add('has-3d');
      })
      .catch((err) => console.warn('[VenbeeMail] 3D skatepark unavailable, using the illustrated backdrop.', err));
  // wait for the page to finish loading and go idle before pulling in three.js
  const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 2000 }) : setTimeout(load, 800));
  if (document.readyState === 'complete') whenIdle();
  else addEventListener('load', whenIdle, { once: true });
}
