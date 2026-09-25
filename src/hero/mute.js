// "SHH" mute sticker — flips over to its back when muted. State persists in localStorage.
import { gsap } from 'gsap';
import { audio } from '../lib/audio.js';
import { shake } from '../lib/shake.js';
import { reducedMotion } from '../lib/prefs.js';

export function initMute(btn) {
  const card = btn.querySelector('.shh__card');
  const action = btn.querySelector('[data-shh-action]');

  const render = (muted, animate) => {
    // Name = visible face + action ("SHH — matikan suara" / "zzz — nyalakan suara"), so the
    // accessible name always contains the text you can see (WCAG 2.5.3).
    btn.querySelector('.shh__face--front').setAttribute('aria-hidden', String(muted));
    btn.querySelector('.shh__face--back').setAttribute('aria-hidden', String(!muted));
    action.textContent = muted ? ' — nyalakan suara' : ' — matikan suara';
    if (!animate || reducedMotion) {
      gsap.set(card, { rotationY: muted ? 180 : 0 });
      return;
    }
    gsap
      .timeline()
      .to(btn, { y: -12, scale: 1.18, duration: 0.14, ease: 'power2.out', overwrite: 'auto' })
      .to(card, { rotationY: muted ? 180 : 0, duration: 0.5, ease: 'back.out(1.5)' }, 0.04)
      .to(btn, { y: 0, scale: 1, duration: 0.14, ease: 'power3.in' }, 0.32)
      .add(() => {
        audio.play('slap', { rate: 1.3, volume: 0.4 });
        shake(0.14);
      });
  };

  render(audio.muted, false);
  btn.addEventListener('click', () => {
    audio.setMuted(!audio.muted);
    render(audio.muted, true);
  });
}
