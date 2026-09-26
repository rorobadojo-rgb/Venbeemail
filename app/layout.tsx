import type { Metadata, Viewport } from "next";
import { Bungee, Chakra_Petch, Permanent_Marker, Rubik } from "next/font/google";
import { SITE } from "@/lib/site";
import "../styles/base.css";
import "../styles/hero.css";
import "../styles/tool.css";
import "../styles/sections.css";

const sign = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee", display: "swap" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-marker", display: "swap", preload: false });
const label = Chakra_Petch({ weight: "700", subsets: ["latin"], variable: "--font-chakra", display: "swap", preload: false });
const body = Rubik({ weight: ["400", "600", "800"], subsets: ["latin"], variable: "--font-rubik", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "VenbeeMail — Email sementara dari pasar malam zombie",
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    title: "VenbeeMail — Email sementara dari pasar malam zombie",
    description: SITE.description,
    locale: "id_ID",
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image", title: "VenbeeMail", description: SITE.description },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${sign.variable} ${marker.variable} ${label.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* flag JS before first paint so JS-only states never flash */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
