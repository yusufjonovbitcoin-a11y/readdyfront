/** Brenddagi meduza (jellyfish) aksenti — `.ai` qismi */
export const MEDUZA_AI_ACCENT = "#00AAFF";

interface MeduzaAiWordmarkProps {
  darkMode: boolean;
  className?: string;
}

/**
 * Sidebar va boshqa joylarda bir xil: `meduza` + rangli `.ai`
 */
export function MeduzaAiWordmark({ darkMode, className }: MeduzaAiWordmarkProps) {
  return (
    <span className={`truncate text-lg font-semibold tracking-tight leading-none ${className ?? ""}`}>
      <span className={darkMode ? "text-white" : "text-gray-900"}>meduza</span>
      <span style={{ color: MEDUZA_AI_ACCENT }}>.ai</span>
    </span>
  );
}
