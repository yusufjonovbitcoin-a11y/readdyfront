import { BRAND_AI_ACCENT_COLOR } from "@/config/brand";

export type MeduzaAiBrandVariant = "on-dark" | "on-light" | "on-muted" | "on-subtle";
export type MeduzaAiBrandSize = "sm" | "md" | "lg" | "xl";

const MEDUZA_CLASS: Record<MeduzaAiBrandVariant, string> = {
  "on-dark": "text-white",
  "on-light": "text-gray-900",
  "on-muted": "text-emerald-200",
  "on-subtle": "text-gray-500",
};

const SIZE_CLASS: Record<MeduzaAiBrandSize, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

type MeduzaAiBrandTextProps = {
  variant?: MeduzaAiBrandVariant;
  size?: MeduzaAiBrandSize;
  className?: string;
};

/** `meduza` + cyan `.ai` */
export function MeduzaAiBrandText({
  variant = "on-light",
  size = "md",
  className = "",
}: MeduzaAiBrandTextProps) {
  return (
    <span
      className={`inline font-bold tracking-wide leading-none ${SIZE_CLASS[size]} ${className}`.trim()}
    >
      <span className={MEDUZA_CLASS[variant]}>meduza</span>
      <span style={{ color: BRAND_AI_ACCENT_COLOR }}>.ai</span>
    </span>
  );
}

/** Qisqa: `m` + cyan `.ai` (grafik pill va hokazo) */
export function MeduzaAiBrandShort({
  className = "",
  letterClassName = "text-white",
}: {
  className?: string;
  letterClassName?: string;
}) {
  return (
    <span className={`inline font-bold leading-none ${className}`.trim()}>
      <span className={letterClassName}>m</span>
      <span style={{ color: BRAND_AI_ACCENT_COLOR }}>.ai</span>
    </span>
  );
}
