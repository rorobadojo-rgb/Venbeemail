// Section 3 — fake emails slap onto the board every 8 seconds (only while it's on screen).
import { gsap } from 'gsap';
import { audio } from '../lib/audio.js';
import { setSprite } from '../lib/sprite.js';
import { on, rand, shuffle, reducedMotion } from '../lib/prefs.js';

const EVERY = 8000;
const code = () => `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`;

const WELCOME = {
  from: 'Venbee Bot',
  addr: 'halo@venbeemail.id',
  subj: 'Selamat datang! Inbox ini hangus sendiri.',
  tag: 'INFO',
  icon: 'mailbox',
  color: 'var(--blue)',
};
const MAILS = [
  {
    from: 'Streamflix',
    addr: 'no-reply@streamflix.tv',
    subj: () => `Kode verifikasi kamu: ${code()}`,
    tag: 'KODE',
    icon: 'key',
    color: 'var(--blue)',
  },
  {
    from: 'Pangeran Kaya Raya',
    addr: 'prince@royal-kingdom.biz',
    subj: 'Saya butuh bantuan transfer $10 juta',
    tag: 'SPAM',
    icon: 'crown',
    color: 'var(--red)',
  },
  {
    from: 'Toko Serba Ada',
    addr: 'promo@diskon-gila.biz',
    subj: 'SELAMAT!!! Kamu menang voucher 99%',
    tag: 'SPAM',
    icon: 'bubble-spam',
    color: 'var(--red)',
  },
  {
    from: 'Forum Seblak',
    addr: 'admin@forumseblak.id',
    subj: () => `Konfirmasi akun: ${code()}`,
    tag: 'KODE',
    icon: 'key',
    color: 'var(--blue)',
  },
  {
    from: 'Mantan',
    addr: 'mantan@masalalu.id',
    subj: 'Kamu apa kabar? :)',
    tag: 'BAPER',
    icon: 'heart',
    color: 'var(--red)',
  },
  {
    from: 'Newsletter Kucing',
    addr: 'meong@kucing.news',
    subj: '10 alasan kucingmu mengabaikanmu',
    tag: 'INFO',
    icon: 'snail-mail',
    color: 'var(--grey)',
  },
  {
    from: 'Pinjol Kilat',
    addr: 'tawaran@cair-kilat.co',
    subj: 'Cair 5 menit tanpa syarat!!!',
    tag: 'SPAM',
    icon: 'bomb',
    color: 'var(--red)',
  },
  {
    from: 'Gacha Plus',
    addr: 'reward@gachaplus.gg',
    subj: 'Login sekarang, dapat 3000 gems',
    tag: 'PROMO',
    icon: 'star',
    color: 'var(--grey)',
  },
  {
    from: 'Bank Abal-Abal',
    addr: 'cs@bank-abal.xyz',
    subj: 'Akun kamu diblokir! Klik di sini',
    tag: 'BAHAYA',
    icon: 'skull-star',
    color: 'var(--black)',
  },
  {
    from: 'Arisan RT 05',
    addr: 'arisan@rt05.id',
    subj: 'Giliran kamu bayar ya, bestie',
    tag: 'INFO',
    icon: 'env-monster',
    color: 'var(--grey)',
  },
  {
    from: 'Unduh Gratis',
    addr: 'verify@unduhgratis.net',
    subj: 'Klik link untuk verifikasi email',
    tag: 'KODE',
    icon: 'plane',
    color: 'var(--blue)',
  },
  {
    from: 'Webinar Cuan',
    addr: 'sukses@mindset.biz',
    subj: 'Jadi sultan dalam 7 hari (serius)',
    tag: 'SPAM',
    icon: 'bolt',
    color: 'var(--red)',
  },
];

export function initInbox() {
  const board = document.querySelector('.board');
  const slots = [...board.querySelectorAll('.slot')];
  const addrEls = document.querySelectorAll('[data-inbox-address]');
  const countEl = board.querySelector('[data-inbox-count]');
  const emptyEl = board.querySelector('[data-inbox-empty]');

  let address = document.querySelector('[data-address-text]')?.textContent || '';
  if (address === 'kosong') address = '';
  let deck = [];
  let count = 0;
  let inView = false;
  let timer = 0;
  let first = 0;
  const order = []; // slots in the order they were filled (oldest first)

  const nextMail = () => {
    if (!count) return WELCOME;
    if (!deck.length) deck = shuffle(MAILS);
    return deck.pop();
  };

  function render() {
    addrEls.forEach((el) => (el.textContent = address || '—'));
    countEl.textContent = `${count} pesan`;
    emptyEl.textContent = address ? 'Menunggu email masuk…' : 'Belum ada alamat — tekan GENERATE di atas.';
  }

  function peelOff(el, done) {
    if (reducedMotion) {
      el.remove();
      return done?.();
    }
    audio.play('whoosh', { rate: rand(1.2, 1.5), volume: 0.25 });
    gsap.to(el, {
      x: rand(-260, 260),
      y: rand(-260, -140),
      rotation: rand(-70, 70),
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        el.remove();
        done?.();
      },
    });
  }

  function deliver() {
    if (!address) return;
    const visible = slots.filter((s) => s.offsetParent !== null);
    const occupant = (s) => s.querySelector('.mail:not(.is-leaving)');
    let slot = visible.find((s) => !occupant(s));
    if (!slot) {
      // board full → the oldest sticker peels off to make room
      slot = order.find((s) => visible.includes(s) && occupant(s)) ?? visible[0];
      const old = occupant(slot);
      if (old) {
        old.classList.add('is-leaving');
        peelOff(old);
      }
    }
    if (order.includes(slot)) order.splice(order.indexOf(slot), 1);
    order.push(slot);

    const m = nextMail();
    const el = document.createElement('article');
    el.className = 'mail';
    el.style.setProperty('--tag', m.color);
    el.innerHTML = `<span class="sprite" aria-hidden="true"></span>
      <p class="mail__from"></p><p class="mail__subj"></p><p class="mail__meta"></p><span class="mail__tag"></span>`;
    setSprite(el.querySelector('.sprite'), m.icon);
    el.querySelector('.mail__from').textContent = m.from;
    el.querySelector('.mail__subj').textContent = typeof m.subj === 'function' ? m.subj() : m.subj;
    el.querySelector('.mail__meta').textContent = `dari ${m.addr} · baru saja`;
    el.querySelector('.mail__tag').textContent = m.tag;
    slot.append(el);
    count++;
    board.classList.add('has-mail');
    render();

    const rot = rand(-5, 5);
    if (reducedMotion) {
      gsap.set(el, { rotation: rot });
      return;
    }
    gsap
      .timeline()
      .fromTo(
        el,
        { scale: 1.9, y: -34, rotation: rot + rand(-25, 25), opacity: 0 },
        { scale: 1, y: 0, rotation: rot, opacity: 1, duration: 0.3, ease: 'power3.in' },
      )
      .add(() => {
        audio.play('slap', { rate: rand(0.95, 1.15), volume: 0.45 });
        gsap.fromTo(board, { x: rand(-4, 4), y: 3 }, { x: 0, y: 0, duration: 0.35, ease: 'elastic.out(1.6, 0.2)' });
      })
      .to(el, { scaleX: 1.08, scaleY: 0.92, duration: 0.05 })
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.35)' });
  }

  function clearBoard() {
    order.length = 0;
    count = 0;
    deck = [];
    board.querySelectorAll('.mail:not(.is-leaving)').forEach((el, i) => {
      el.classList.add('is-leaving');
      gsap.delayedCall(i * 0.06, () =>
        peelOff(el, () => board.classList.toggle('has-mail', !!board.querySelector('.mail'))),
      );
    });
    render();
  }

  function schedule() {
    clearInterval(timer);
    clearTimeout(first);
    if (!inView || !address || document.hidden) return;
    if (!count) first = setTimeout(deliver, 700);
    timer = setInterval(deliver, EVERY);
  }

  on('address', (a) => {
    if (a === address) return;
    const hadAddress = !!address;
    address = a;
    if (hadAddress) clearBoard();
    render();
    schedule();
  });

  new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      schedule();
    },
    { threshold: 0.25 },
  ).observe(board);
  document.addEventListener('visibilitychange', schedule);
  render();
}
