import type { Metadata, Viewport } from "next";
import { Bangers, Bowlby_One, Space_Mono } from "next/font/google";
import { asset } from "@/lib/asset";
import { SITE } from "@/lib/site";
import "../styles/base.css";
import "../styles/comic.css";
import "../styles/panels.css";

const display = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-bowlby", display: "swap" });
const comic = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap" });
const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "VenbeeMail — Email sementara, gaya komik",
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    title: "VenbeeMail — Butuh email? Sebentar aja? Nih.",
    description: SITE.description,
    locale: "id_ID",
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image", title: "VenbeeMail", description: SITE.description },
};

export const viewport: Viewport = {
  themeColor: "#FF3A1F",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${comic.variable} ${mono.variable}`}
      style={{ "--atlas": `url("${asset("/doodles/atlas.svg")}")` } as React.CSSProperties} suppressHydrationWarning>
      <head>
        {/* flag JS before first paint so the cinematic layout never flashes */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
