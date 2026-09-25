import { ChapterNav } from "@/components/ChapterNav";
import { ComicPage } from "@/components/ComicPage";
import { DoodleField } from "@/components/doodles/DoodleField";
import { SoundControls } from "@/components/SoundControls";
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
      <div className="backdrop" aria-hidden="true" />
      <DoodleField />
      <div className="backdrop-dots" aria-hidden="true" />
      <a className="skip" href="#generator">
        Langsung ke generator email
      </a>
      <SoundControls />
      <ChapterNav />
      <ComicPage />
    </>
  );
}
