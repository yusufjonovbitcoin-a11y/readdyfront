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
    <div className={`rounded-xl p-5 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-base font-medium uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
          <p className={`text-4xl font-bold mt-2 tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`text-sm ${changeType === "up" ? "ri-arrow-up-line text-emerald-400" : changeType === "down" ? "ri-arrow-down-line text-red-400" : "ri-subtract-line text-gray-400"}`}></i>
            </div>
            <span className={`text-sm font-medium ${changeType === "up" ? "text-emerald-400" : changeType === "down" ? "text-red-400" : "text-gray-400"}`}>{change}</span>
          </div>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${iconBg}`}>
          <i className={`${icon} text-xl text-white`}></i>
        </div>
      </div>
    </div>
  );
}
