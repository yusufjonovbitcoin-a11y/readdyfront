import type { ReactNode } from "react";

type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  darkMode?: boolean;
  icon?: ReactNode;
  className?: string;
}

function getToneClasses(tone: StatusTone, darkMode: boolean): string {
  if (tone === "success") return darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-500/20 text-emerald-700";
  if (tone === "danger") return darkMode ? "bg-red-500/20 text-red-300" : "bg-red-500/20 text-red-700";
  if (tone === "warning") return darkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-500/20 text-amber-700";
  if (tone === "info") return darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-500/20 text-indigo-700";
  return darkMode ? "bg-gray-500/20 text-gray-300" : "bg-gray-100 text-gray-700";
}

export default function StatusChip({
  label,
  tone = "neutral",
  darkMode = false,
  icon,
  className = "",
}: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getToneClasses(
        tone,
        darkMode,
      )} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

