interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  iconBg: string;
  darkMode: boolean;
}

export default function StatCard({ title, value, change, changeType, icon, iconBg, darkMode }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 md:p-5 ${darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
          <p className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center">
              <i className={`text-xs ${changeType === "up" ? "ri-arrow-up-line text-emerald-400" : changeType === "down" ? "ri-arrow-down-line text-red-400" : "ri-subtract-line text-gray-400"}`}></i>
            </div>
            <span className={`text-xs font-medium ${changeType === "up" ? "text-emerald-400" : changeType === "down" ? "text-red-400" : "text-gray-400"}`}>{change}</span>
          </div>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <i className={`${icon} text-base text-white`}></i>
        </div>
      </div>
    </div>
  );
}
