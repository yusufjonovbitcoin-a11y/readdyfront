import { MeduzaAiBrandText } from "@/components/branding/MeduzaAiBrandText";

interface MeduzaAiWordmarkProps {
  darkMode: boolean;
  className?: string;
}

/** Sidebar: `meduza` + aquamarine `.ai` */
export function MeduzaAiWordmark({ darkMode, className }: MeduzaAiWordmarkProps) {
  return (
    <MeduzaAiBrandText
      variant={darkMode ? "on-dark" : "on-light"}
      size="md"
      className={`truncate font-semibold tracking-tight ${className ?? ""}`}
    />
  );
}

export { BRAND_AI_ACCENT_COLOR } from "@/config/brand";
