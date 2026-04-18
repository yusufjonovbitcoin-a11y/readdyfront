import { useNavigate } from "react-router-dom";
import type { DocPatient, RiskLevel } from "@/mocks/doc_patients";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Past", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "O'rta", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "Yuqori", color: "text-orange-600", bg: "bg-orange-100" },
  critical: { label: "Kritik", color: "text-red-600", bg: "bg-red-100" },
};

interface PatientTableRowProps {
  patient: DocPatient;
  darkMode?: boolean;
}

export default function PatientTableRow({ patient, darkMode = false }: PatientTableRowProps) {
  const navigate = useNavigate();
  const risk = riskConfig[patient.riskLevel];

  return (
    <tr
      className={`cursor-pointer transition-colors ${darkMode ? "hover:bg-[#21262D]" : "hover:bg-gray-50"}`}
      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
    >
      <td className={`px-4 py-3 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
        <div className="flex items-center gap-2">
          {patient.status === "queue" && (
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                darkMode ? "bg-violet-900/40 text-violet-400" : "bg-violet-100 text-violet-700"
              }`}
            >
              {patient.queueNumber}
            </span>
          )}
          {patient.name}
        </div>
      </td>
      <td className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{patient.phone}</td>
      <td className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{patient.age} yosh</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
      </td>
      <td className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {patient.status === "queue" ? patient.queueTime : `${patient.consultationDuration} daq`}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/doctor/patients/${patient.id}`);
          }}
          className={`text-xs font-medium cursor-pointer whitespace-nowrap ${
            darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"
          }`}
        >
          Ko'rish
        </button>
      </td>
    </tr>
  );
}
