import { forwardRef } from "react";

/** Where the marker's nib sits inside the hand's 150 x 150 box. */
export const HAND_TIP = { x: 10, y: 136, box: 150 };

/** A stitched-up zombie hand holding a blue marker. Positioned by the nota. */
export const ZombieHand = forwardRef<HTMLDivElement, { className?: string }>(function ZombieHand({ className = "" }, ref) {
  return (
    <div ref={ref} className={`zhand ${className}`} aria-hidden="true">
      <svg viewBox="0 0 150 150" focusable="false">
        {/* torn sleeve */}
        <path d="M112 36L136 4L150 8L150 52L134 64L126 54L120 60Z" fill="#8627B9" stroke="#0A0A0A" strokeWidth="4" strokeLinejoin="round" />
        <path d="M130 18l10 6M136 34l10 4" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
        {/* marker */}
        <path d="M10 136L16 118L28 130Z" fill="#1B2FD6" stroke="#0A0A0A" strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 118L28 130L84 74L72 62Z" fill="#232323" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M34 108l12 12M42 100l12 12" stroke="#2D6BFF" strokeWidth="5" />
        <path d="M24 118l38-38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        {/* hand */}
        <path d="M58 84C48 66 58 48 76 46L98 32C110 26 124 32 126 46L132 72C134 88 122 100 106 98L82 100C70 102 62 96 58 84Z"
          fill="#9BC47A" stroke="#0A0A0A" strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 80C62 68 72 64 82 68L88 78C84 86 72 88 64 86Z" fill="#AED48E" stroke="#0A0A0A" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M84 56c6 8 16 12 26 10M90 44c4 6 12 8 20 6M100 80c8 2 16 0 22-6" fill="none" stroke="#5F8A45" strokeWidth="3" strokeLinecap="round" />
        {/* stitches */}
        <path d="M96 60l22 12" stroke="#0A0A0A" strokeWidth="2.5" />
        <path d="M100 56l-2 8M106 60l-2 8M112 63l-2 8" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" />
        {/* nails */}
        <path d="M70 72l6-2 2 5-6 2Z" fill="#E7E0B8" stroke="#0A0A0A" strokeWidth="1.5" />
      </svg>
    </div>
  );
});
