import { Bubble } from "@/components/comic/Bubble";
import { Mascot } from "@/components/mascot/Mascot";
import { SITE, type SocialId } from "@/lib/site";

// Simple original glyphs, drawn for the comic badges (24x24, stroke based).
const GLYPHS: Record<SocialId, React.ReactNode> = {
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r="0.6" fill="currentColor" />
    </>
  ),
  x: <path d="M5 5l14 14M19 5L5 19" />,
  tiktok: <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.6 2.6 2.4 4 5 4.2" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" />
    </>
  ),
  telegram: <path d="M20.5 4.5L3.5 11l6 2 2 6 3-4.2 4.5 3.2zM9.5 13l8-6" />,
};

export function EndCard() {
  return (
    <footer className="endcard" id="tamat" data-step="5" aria-labelledby="tbc-title">
      <div className="film">
        <span className="film__sprockets film__sprockets--top" aria-hidden="true" />
        <span className="film__sprockets film__sprockets--bottom" aria-hidden="true" />
        <span className="film__grain" aria-hidden="true" />
        <span className="film__scratch" aria-hidden="true" />
        <span className="film__vignette" aria-hidden="true" />

        <div className="film__content">
          <p className="film__eyebrow">Venbee Comics · Episode #1</p>
          <h2 id="tbc-title" className="tbc">
            <span className="tbc__arrow" aria-hidden="true" />
            <span className="tbc__text">
              To be continued<span className="tbc__dots">…</span>
            </span>
          </h2>

          <div className="film__row">
            <div className="film__narrator">
              <Mascot className="film__bird" />
              <Bubble tail="left">Dadah! Sampai episode berikutnya.</Bubble>
            </div>
            <nav aria-label="Media sosial">
              <ul className="socials">
                {SITE.socials.map((s, i) => (
                  <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
                    <a className="badge" href={s.href} aria-label={s.label}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        {GLYPHS[s.id]}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="film__fine" suppressHydrationWarning>
            © {new Date().getFullYear()} {SITE.name} · Email sekali pakai, tanpa drama. <a href="#mulai">Balik ke halaman 1 ↑</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
