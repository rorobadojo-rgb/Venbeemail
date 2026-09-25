// Client-only entry for the Claude Artifact build (see build-artifact.mjs).
// Renders the same tree as app/page.tsx, without the Next.js runtime.
import { createRoot } from "react-dom/client";
import { ChapterNav } from "@/components/ChapterNav";
import { ComicPage } from "@/components/ComicPage";
import { DoodleField } from "@/components/doodles/DoodleField";
import { SoundControls } from "@/components/SoundControls";
import "../../styles/base.css";
import "../../styles/comic.css";
import "../../styles/panels.css";

createRoot(document.getElementById("venbee")!).render(
  <>
    <div className="backdrop" aria-hidden="true" />
    <DoodleField />
    <div className="backdrop-dots" aria-hidden="true" />
    <a className="skip" href="#generator">
      Langsung ke generator email
    </a>
    <SoundControls />
    <ChapterNav />
    <ComicPage />
  </>,
);
