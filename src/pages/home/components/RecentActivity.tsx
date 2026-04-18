import { mockAuditLogs } from "@/mocks/analytics";

interface RecentActivityProps {
  darkMode: boolean;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/20 text-purple-400",
  HOSPITAL_ADMIN: "bg-blue-500/20 text-blue-400",
  DOKTOR: "bg-emerald-500/20 text-emerald-400",
};

export default function RecentActivity({ darkMode }: RecentActivityProps) {
  return (
    <div className={`rounded-xl p-5 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
      <h3 className={`text-base font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>So'nggi Faoliyat</h3>
      <div className="space-y-3">
        {mockAuditLogs.slice(0, 5).map((log) => (
          <div key={log.id} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
              log.role === "SUPER_ADMIN" ? "bg-purple-500/20 text-purple-400" :
              log.role === "HOSPITAL_ADMIN" ? "bg-blue-500/20 text-blue-400" :
              "bg-emerald-500/20 text-emerald-400"
            }`}>
              {log.user.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{log.user}</span>
                <span className={`text-sm px-2.5 py-0.5 rounded-full ${roleColors[log.role] || "bg-gray-500/20 text-gray-400"}`}>{log.role}</span>
              </div>
              <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {log.action}: <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{log.target}</span>
              </p>
              <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{log.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
