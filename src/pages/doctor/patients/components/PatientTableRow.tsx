import { useNavigate } from "react-router-dom";
import type { DoctorPatientDto as DocPatient, DoctorPatientRiskLevel as RiskLevel } from "@/api/types/doctor.types";

type StatusHandler = (id: string, status: DocPatient["status"]) => void;

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Past", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "O'rta", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "Yuqori", color: "text-orange-600", bg: "bg-orange-100" },
  critical: { label: "Kritik", color: "text-red-600", bg: "bg-red-100" },
};

interface PatientTableRowProps {
  patient: DocPatient;
  darkMode?: boolean;
  onStatusChange?: StatusHandler;
}

export default function PatientTableRow({ patient, darkMode = false, onStatusChange }: PatientTableRowProps) {
  const navigate = useNavigate();
  const risk = riskConfig[patient.riskLevel];
  const normalizedName = patient.name.startsWith("Patient ") ? `Bemor ${patient.phone.slice(-4)}` : patient.name;
  const ageText = patient.age > 0 ? `${patient.age} yosh` : "-";
  const openDetail = () => navigate(`/doctor/patients/${patient.id}`);

  return (
    <tr
      className={`cursor-pointer transition-colors ${darkMode ? "hover:bg-[#21262D] focus-visible:bg-[#21262D]" : "hover:bg-gray-50 focus-visible:bg-gray-50"}`}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      tabIndex={0}
    >
      <td className={`px-4 py-3 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
        <span className="inline-flex items-center gap-2">
          {patient.status === "queue" && (
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                darkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {patient.queueNumber}
            </span>
          )}
          {normalizedName}
        </span>
      </td>
      <td className={`hidden sm:table-cell px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{patient.phone}</td>
      <td className={`hidden md:table-cell px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{ageText}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
      </td>
      <td className={`hidden sm:table-cell px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {patient.status === "queue"
          ? patient.queueTime
          : patient.status === "in_progress"
            ? `Taxlil ${patient.consultationDuration || 0} daq`
            : `${patient.consultationDuration} daq`}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1.5">
          {onStatusChange && patient.status === "queue" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(patient.id, "in_progress");
              }}
              className={`text-xs font-medium cursor-pointer whitespace-nowrap ${
                darkMode ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-800"
              }`}
            >
              Taxlilga
            </button>
          )}
          {onStatusChange && patient.status === "in_progress" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(patient.id, "completed");
              }}
              className={`text-xs font-medium cursor-pointer whitespace-nowrap ${
                darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-800"
              }`}
            >
              Tugallandi
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            className={`text-xs font-medium cursor-pointer whitespace-nowrap ${
              darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
            }`}
          >
            Ko'rish
          </button>
        </div>
      </td>
    </tr>
  );
}
