import type { Metadata, Viewport } from "next";
import { Bungee, Chakra_Petch, Space_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import { SPRING_MS, springLinear } from "@/lib/spring";
import "../styles/base.css";
import "../styles/sticker.css";
import "../styles/hero.css";
import "../styles/toko.css";
import "../styles/sections.css";
import "../styles/mart.css";

const display = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee", display: "swap" });
const label = Chakra_Petch({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-chakra", display: "swap" });
const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "VenbeeMail — Zombie Mart: email sementara, 100% tanpa daftar",
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    title: "VenbeeMail — Segar. Sementara. 100% Tanpa Daftar.",
    description: SITE.description,
    locale: "id_ID",
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image", title: "VenbeeMail · Zombie Mart", description: SITE.description },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${display.variable} ${label.variable} ${mono.variable}`}
      style={{ "--spring": springLinear(), "--spring-dur": `${SPRING_MS}ms` } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        {/* flag JS before first paint so the title letters wait for their vending-machine entrance */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
