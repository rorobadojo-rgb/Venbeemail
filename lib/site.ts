/** Site-wide settings. */
export const SITE = {
  name: "VenbeeMail",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  description:
    "VenbeeMail: email sementara sekali pakai dari pasar malam zombie. Tanpa daftar, hilang sendiri dalam 10 menit, spam langsung dibuang.",
} as const;
