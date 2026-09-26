import { Hero } from "@/components/hero/Hero";
import { Backdrop } from "@/components/mart/Backdrop";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { How } from "@/components/sections/How";
import { Why } from "@/components/sections/Why";
import { ShopSign } from "@/components/ShopSign";
import { Toasts } from "@/components/Toasts";
import { Toko } from "@/components/tool/Toko";
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
      <Backdrop />
      <a className="skip" href="#toko">
        Langsung ke kasir email
      </a>
      <ShopSign />
      <main id="isi">
        <Hero />
        <Toko />
        <Why />
        <How />
        <Faq />
      </main>
      <Footer />
      <Toasts />
    </>
  );
}
