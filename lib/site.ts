/** Site-wide settings. Fill in the real social links before launch. */
export const SITE = {
  name: "VenbeeMail",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  description:
    "VenbeeMail: email sementara sekali pakai. Tanpa daftar, hilang otomatis, bebas spam.",
  socials: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "x", label: "X", href: "#" },
    { id: "tiktok", label: "TikTok", href: "#" },
    { id: "youtube", label: "YouTube", href: "#" },
    { id: "telegram", label: "Telegram", href: "#" },
  ],
} as const;

export type SocialId = (typeof SITE.socials)[number]["id"];
