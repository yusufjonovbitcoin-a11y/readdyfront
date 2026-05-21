import { APP_BRAND_NAME } from "@/config/brand";

/** `public/app-logo.png` — Vite dev/prod va subpath (`BASE_URL`) bilan */
const APP_LOGO_SRC = `${import.meta.env.BASE_URL}app-logo.png`;

export type AppLogoMarkProps = {
  /** Piksel — layout/joylashuv uchun quti (width/height atributlari) */
  size?: number;
  className?: string;
  alt?: string;
  /**
   * Faqat chizilgan logoni kattalashtirish (1 = o‘lcham bo‘yicha).
   * Layout `size` bo‘yicha qoladi, `transform: scale` bilan grafika kattaroq ko‘rinadi.
   */
  graphicScale?: number;
};

/** Barcha rollar uchun meduza.ai belgisi (`public/app-logo.png`) */
export function AppLogoMark({
  size = 32,
  className = "",
  alt = APP_BRAND_NAME,
  graphicScale = 1,
}: AppLogoMarkProps) {
  const scaled = graphicScale > 1 && graphicScale < 3;
  return (
    <img
      src={APP_LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      style={
        scaled
          ? { transform: `scale(${graphicScale})`, transformOrigin: "left center" }
          : undefined
      }
      draggable={false}
    />
  );
}
