import { useNavigate } from "react-router-dom";
import type { DocPatient, RiskLevel } from "@/mocks/doc_patients";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; icon: string }> = {
  low: { label: "Past", color: "text-green-600", bg: "bg-green-100", icon: "ri-shield-check-line" },
  medium: { label: "O'rta", color: "text-amber-600", bg: "bg-amber-100", icon: "ri-shield-line" },
  high: { label: "Yuqori", color: "text-orange-600", bg: "bg-orange-100", icon: "ri-shield-flash-line" },
  critical: { label: "Kritik", color: "text-red-600", bg: "bg-red-100", icon: "ri-alarm-warning-line" },
};

const statusConfig = {
  queue: { label: "Navbatda", color: "text-blue-600", bg: "bg-blue-100" },
  in_progress: { label: "Jarayonda", color: "text-amber-600", bg: "bg-amber-100" },
  completed: { label: "Tugallandi", color: "text-green-600", bg: "bg-green-100" },
  history: { label: "Tarix", color: "text-gray-600", bg: "bg-gray-100" },
};

interface PatientCardProps {
  patient: DocPatient;
  darkMode?: boolean;
  onStatusChange?: (id: string, status: DocPatient["status"]) => void;
}

export default function PatientCard({ patient, darkMode = false, onStatusChange }: PatientCardProps) {
  const navigate = useNavigate();
  const risk = riskConfig[patient.riskLevel];
  const status = statusConfig[patient.status];

  return (
    <div
      className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
        darkMode ? "bg-[#161B22] border-[#30363D] hover:border-violet-600/50" : "bg-white border-gray-100 hover:border-violet-200"
      } ${patient.riskLevel === "critical" ? (darkMode ? "border-red-800/40" : "border-red-200") : ""}`}
      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              patient.gender === "male" ? "bg-blue-100" : "bg-pink-100"
            }`}
          >
            <i
              className={`${patient.gender === "male" ? "ri-user-3-line text-blue-600" : "ri-user-3-line text-pink-600"} text-base`}
            ></i>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{patient.name}</h3>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {patient.age} yosh • {patient.phone}
            </p>
          </div>
        </div>
        {patient.status === "queue" && (
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
              darkMode ? "bg-violet-900/40 text-violet-400" : "bg-violet-100 text-violet-700"
            }`}
          >
            {patient.queueNumber}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>
          <i className={`${risk.icon} text-xs`}></i>
          {risk.label} xavf
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
      </div>

      {/* Symptoms preview */}
      {patient.symptoms.length > 0 && (
        <div className="mb-3">
          <p className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Simptomlar:</p>
          <div className="flex flex-wrap gap-1">
            {patient.symptoms.slice(0, 2).map((s, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded-md ${darkMode ? "bg-[#21262D] text-gray-300" : "bg-gray-100 text-gray-600"}`}
              >
                {s}
              </span>
            ))}
            {patient.symptoms.length > 2 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${darkMode ? "bg-[#21262D] text-gray-400" : "bg-gray-100 text-gray-500"}`}
              >
                +{patient.symptoms.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`ri-time-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
          </div>
          <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {patient.status === "queue" ? `Navbat: ${patient.queueTime}` : `${patient.consultationDuration} daqiqa`}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/doctor/patients/${patient.id}`);
          }}
          className={`text-xs font-medium cursor-pointer whitespace-nowrap ${
            darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"
          }`}
        >
          Ko'rish →
        </button>
      </div>
    </div>
  );
}
