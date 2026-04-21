import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { DoctorDto as HADoctor } from "@/api/types/doctor.types";

interface DoctorCardProps {
  doctor: HADoctor;
  darkMode: boolean;
  onEdit: (doc: HADoctor) => void;
  onDelete: (id: string) => void;
}

export default function DoctorCard({ doctor, darkMode, onEdit, onDelete }: DoctorCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("hospital");

  return (
    <div className={`rounded-xl overflow-hidden border transition-all hover:border-teal-300 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
      {/* Gradient banner + radial — surat shu blok ichida */}
      <div className="relative h-24 sm:h-28 bg-gradient-to-br from-teal-400 to-teal-600 shrink-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }}></div>
        </div>
        <div className="absolute top-2 right-2 z-10 sm:top-2.5 sm:right-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              doctor.status === "active" ? "bg-white/20 text-white" : "bg-red-500/20 text-red-200"
            }`}
          >
            {doctor.status === "active" ? t("doctors.card.status.active") : t("doctors.card.status.inactive")}
          </span>
        </div>
        <div className="absolute left-3 top-1/2 z-10 w-14 h-14 -translate-y-1/2 sm:left-4 sm:w-16 sm:h-16 rounded-lg border-[2.5px] border-white shadow-md overflow-hidden ring-1 ring-black/10">
          <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 sm:right-4">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-star-fill text-amber-300 text-xs drop-shadow-sm"></i>
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-sm">{doctor.rating}</span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-4">
        <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>{doctor.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <i className={`ri-phone-line text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
          </div>
          <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{doctor.phone}</span>
        </div>

        <p className="text-xs text-teal-500 font-medium mb-3">{doctor.specialty}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <i className={`ri-user-heart-line text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
          </div>
          <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {t("doctors.card.todayPatientsPrefix")} <strong className={darkMode ? "text-white" : "text-gray-900"}>{doctor.todayPatients}</strong> {t("doctors.card.patientUnit")}
          </span>
        </div>

        {/* QR preview */}
        <div className={`flex items-center gap-2 p-2 rounded-lg mb-4 ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <i className={`ri-qr-code-line text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{t("doctors.card.qrCodeLabel")}</p>
            <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>/checkin?doctor_id={doctor.id}</p>
          </div>
          <button
            onClick={() => navigate(`/hospital-admin/doctors/${doctor.id}?tab=qr`)}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer whitespace-nowrap"
          >
            {t("doctors.card.viewButton")}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/hospital-admin/doctors/${doctor.id}`)}
            className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-eye-line text-xs"></i>
            {t("doctors.card.viewButton")}
          </button>
          <button
            onClick={() => onEdit(doctor)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}
          >
            <i className="ri-edit-line text-xs"></i>
          </button>
          <button
            onClick={() => onDelete(doctor.id)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "bg-[#1A2235] text-gray-400 hover:text-red-400" : "bg-gray-100 text-gray-500 hover:text-red-500"}`}
          >
            <i className="ri-delete-bin-line text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
