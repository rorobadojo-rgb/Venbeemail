import { StickerButton } from "@/components/sticker/StickerButton";
import { SnackDoodle } from "@/components/sticker/Doodles";
import { Title } from "@/components/title/Title";
import { NeonSign } from "./NeonSign";

export function Hero() {
  return (
    <header className="hero" id="mulai">
      <p className="hero__hours" aria-hidden="true">
        <span>BUKA 24 JAM</span>
        <span>LORONG 1–4</span>
        <span>KASIR: ZOMBI</span>
      </p>
      <NeonSign />
      <Title />
      <p className="hero__tagline">
        <span>Segar.</span> <span>Sementara.</span> <span>100% Tanpa Daftar.</span>
      </p>
      <p className="hero__lede">
        Email sekali pakai dari minimarket paling busuk se-internet. Ambil alamat, pakai, buang. Tanpa akun, tanpa spam
        ke inbox aslimu.
      </p>
      <div className="hero__cta">
        <StickerButton href="#toko" label="BELANJA SEKARANG" color="lime" body="grey" size="lg" effect="bagpop" tilt={-3} note="alamat gratis, Rp0">
          <SnackDoodle snack="bag" />
        </StickerButton>
        <StickerButton href="#kenapa" label="KENAPA KAMI?" color="purple" body="cream" size="md" effect="jelly" tilt={3} note="baca komposisi">
          <SnackDoodle snack="jelly" />
        </StickerButton>
      </div>
    </header>
  );
}
