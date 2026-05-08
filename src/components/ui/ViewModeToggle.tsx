import type { ViewMode } from "@/hooks/useViewMode";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  darkMode: boolean;
  cardLabel?: string;
  tableLabel?: string;
}

export default function ViewModeToggle({
  mode,
  onChange,
  darkMode,
  cardLabel = "Card view",
  tableLabel = "Table view",
}: ViewModeToggleProps) {
  const wrap = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const active = darkMode ? "bg-[#30363D] text-emerald-300 shadow-sm" : "bg-white text-emerald-600 shadow-sm";
  const idle = darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700";

  return (
    <div className={`flex items-center rounded-lg p-1 ${wrap}`}>
      <button
        type="button"
        onClick={() => onChange("card")}
        aria-label={cardLabel}
        title={cardLabel}
        aria-pressed={mode === "card"}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          mode === "card" ? active : idle
        }`}
      >
        <i className="ri-layout-grid-line text-sm" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-label={tableLabel}
        title={tableLabel}
        aria-pressed={mode === "table"}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          mode === "table" ? active : idle
        }`}
      >
        <i className="ri-list-check text-sm" aria-hidden="true" />
      </button>
    </div>
  );
}
