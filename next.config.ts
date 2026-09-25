import type { NextConfig } from "next";

// `npm run build:pages` (GitHub Pages): fully static export under a sub-path.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const longCache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(pages
    ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
    : {
        async headers() {
          return ["/audio/:path*", "/doodles/:path*", "/mascot/:path*"].map((source) => ({ source, headers: longCache }));
        },
      }),
};

export default nextConfig;
