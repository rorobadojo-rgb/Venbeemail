import type { NextConfig } from "next";

const longCache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return ["/audio/:path*", "/doodles/:path*", "/mascot/:path*"].map((source) => ({ source, headers: longCache }));
  },
};

export default nextConfig;
