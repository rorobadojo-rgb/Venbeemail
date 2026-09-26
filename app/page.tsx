import { SyrupTitle } from "@/components/hero/SyrupTitle";
import { WarungBanner } from "@/components/hero/WarungBanner";
import { Kentongan } from "@/components/Kentongan";
import { MarketBackdrop } from "@/components/market/MarketBackdrop";
import { ClosingFooter } from "@/components/sections/ClosingFooter";
import { FaqSection } from "@/components/sections/FaqSection";
import { HowSection } from "@/components/sections/HowSection";
import { WhySection } from "@/components/sections/WhySection";
import { MailTool } from "@/components/tool/MailTool";
import { SITE } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  inLanguage: "id",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketBackdrop />
      <a className="skip" href="#alat">
        Langsung ke alat email
      </a>
      <Kentongan />
      <main>
        <section className="warung" aria-labelledby="judul">
          <div className="warung__roof" aria-hidden="true" />
          <div className="warung__frame">
            <WarungBanner
              title={
                <h1 id="judul" className="banner__title">
                  <span className="sr-only">VenbeeMail, email sementara</span>
                  <SyrupTitle />
                </h1>
              }
              tagline={
                <p className="banner__tag">
                  Email sementara dari <b>pasar malam zombie</b>. Ambil kantong, tulis nota, pakai, buang.
                </p>
              }
            />
            <MailTool />
          </div>
        </section>
        <WhySection />
        <HowSection />
        <FaqSection />
      </main>
      <ClosingFooter />
    </>
  );
}
