import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QrCodeImage from "@/components/QrCodeImage";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { copyTextWithFallback } from "@/utils/clipboard";

export default function DocProfilePage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("profile.title")}>
      <DocProfileContent />
    </DocLayout>
  );
}

export function DocProfileContent() {
  const { t } = useTranslation("doctor");
  const { darkMode } = useDoctorTheme();
  const navigate = useNavigate();
  const [qrCopied, setQrCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bodyText = darkMode ? "text-gray-300" : "text-gray-600";
  const labelMuted = darkMode ? "text-gray-500" : "text-gray-400";
  const valueText = darkMode ? "text-gray-200" : "text-gray-800";
  const iconBox = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const backBtn = darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700";
  const editBtn = darkMode
    ? "border border-[#30363D] text-gray-400 hover:text-gray-200 hover:bg-[#21262D]"
    : "border border-gray-200 text-gray-500 hover:text-gray-700";
  const starEmpty = darkMode ? "text-gray-600" : "text-gray-200";
  const qrFrame = darkMode ? "p-3 bg-white border-2 border-[#30363D] rounded-xl inline-block" : "p-3 bg-white border-2 border-gray-200 rounded-xl inline-block";
  const copyIdle = darkMode
    ? "border-[#30363D] text-gray-200 hover:bg-[#21262D]"
    : "border-gray-200 text-gray-700 hover:bg-gray-50";
  const quickLink = darkMode ? "hover:bg-[#21262D] text-gray-200" : "hover:bg-gray-50 text-gray-700";
  const quickIcon = darkMode ? "text-violet-400" : "text-violet-500";
  const quickArrow = darkMode ? "text-gray-500" : "text-gray-400";
  const sectionTitle = darkMode ? "text-gray-200" : "text-gray-700";

  const doctor = {
    id: "doc-001",
    name: "Dr. Alisher Karimov",
    specialty: "Kardiologiya",
    phone: "+998 90 123 45 67",
    email: "a.karimov@medcore.uz",
    experience: "8 yil",
    hospital: "Toshkent Klinikasi",
    joinDate: "2021-03-15",
    totalPatients: 1240,
    todayPatients: 7,
    rating: 4.9,
    bio: "Yurak-qon tomir kasalliklari bo'yicha mutaxassis. Toshkent Tibbiyot Akademiyasini tamomlagan. Kardiologiya sohasida 8 yillik tajribaga ega.",
    checkinUrl: "/checkin?doctor_id=doc-001",
  };

  const checkinFullUrl = useMemo(
    () =>
      typeof window !== "undefined" ? `${window.location.origin}${doctor.checkinUrl}` : "",
    [doctor.checkinUrl],
  );

  const handleCopyLink = () => {
    if (!checkinFullUrl) return;
    void (async () => {
      const copied = await copyTextWithFallback(checkinFullUrl);
      setQrCopied(copied);
      setCopyError(!copied);
      setTimeout(() => {
        setQrCopied(false);
        setCopyError(false);
      }, 2000);
    })();
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${backBtn}`}>
        <i className="ri-arrow-left-line"></i>
        {t("common:buttons.back")}
      </button>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <div className={`rounded-xl p-6 ${cardBase}`}>
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">AK</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={`text-xl font-bold ${pageTitle}`}>{doctor.name}</h2>
                <p className="text-violet-500 font-medium">{doctor.specialty}</p>
                <p className={`text-sm mt-1 ${pageMuted}`}>{doctor.hospital}</p>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                      <i
                        className={`ri-star-fill text-sm ${i < Math.floor(doctor.rating) ? "text-amber-400" : starEmpty}`}
                      ></i>
                    </div>
                  ))}
                  <span className={`text-sm font-semibold ml-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{doctor.rating}</span>
                </div>
              </div>
              <button onClick={() => navigate("/doctor/settings")} className={`w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${editBtn}`}>
                <i className="ri-edit-2-line text-base"></i>
              </button>
            </div>

            <p className={`text-sm mt-4 leading-relaxed ${bodyText}`}>{doctor.bio}</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              {[
                { icon: "ri-phone-line", label: "Telefon", value: doctor.phone },
                { icon: "ri-mail-line", label: "Email", value: doctor.email },
                { icon: "ri-time-line", label: "Tajriba", value: doctor.experience },
                { icon: "ri-calendar-line", label: "Qo'shilgan", value: doctor.joinDate },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${iconBox}`}>
                    <i className={`${item.icon} text-gray-500 text-sm`}></i>
                  </div>
                  <div>
                    <p className={`text-xs ${labelMuted}`}>{item.label}</p>
                    <p className={`text-sm font-medium ${valueText}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Jami bemorlar", value: doctor.totalPatients, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50" },
              { label: "Bugun", value: doctor.todayPatients, icon: "ri-calendar-check-line", color: "text-green-600", bg: "bg-green-50" },
              { label: "Reyting", value: doctor.rating, icon: "ri-star-line", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl p-4 text-center ${cardBase}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg} mx-auto mb-2`}>
                  <i className={`${stat.icon} text-lg ${stat.color}`}></i>
                </div>
                <p className={`text-2xl font-bold ${pageTitle}`}>{stat.value}</p>
                <p className={`text-xs mt-0.5 ${pageMuted}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className={`rounded-xl p-5 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-1 ${pageTitle}`}>{t("profile.qrTitle")}</h3>
            <p className={`text-xs mb-4 ${pageMuted}`}>{t("profile.qrSubtitle")}</p>

            <div className="mb-4 flex justify-center">
              <div className={qrFrame}>
                <QrCodeImage value={checkinFullUrl} size={200} alt="Navbatga yozilish QR kodi" />
              </div>
            </div>

            <p className={`mb-4 break-all text-center text-xs ${pageMuted}`}>{checkinFullUrl || "…"}</p>

            <div className="space-y-2">
              {copyError && (
                <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg bg-red-500 text-white">
                  Nusxalab bo'lmadi
                </div>
              )}
              {qrCopied && (
                <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg bg-emerald-500 text-white">
                  Nusxalandi
                </div>
              )}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  qrCopied ? "border-green-300 bg-green-50 text-green-700" : copyError ? "border-red-300 bg-red-50 text-red-700" : copyIdle
                }`}
              >
                <i className={`${qrCopied ? "ri-checkbox-circle-line" : copyError ? "ri-close-circle-line" : "ri-link"} text-sm`}></i>
                {qrCopied ? t("profile.copied") : copyError ? "Nusxalab bo'lmadi" : t("profile.copyLink")}
              </button>
              <button
                onClick={() => navigate(doctor.checkinUrl)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
              >
                <i className="ri-external-link-line text-sm"></i>
                {t("profile.openCheckin")}
              </button>
            </div>
          </div>

          <div className={`rounded-xl p-4 ${cardBase}`}>
            <h4 className={`text-sm font-semibold mb-3 ${sectionTitle}`}>{t("profile.quickLinks")}</h4>
            <div className="space-y-2">
              {[
                { label: "Bugungi bemorlar", path: "/doctor/patients", icon: "ri-user-add-line" },
                { label: "Tahlil", path: "/doctor/analytics", icon: "ri-bar-chart-2-line" },
                { label: "Sozlamalar", path: "/doctor/settings", icon: "ri-settings-3-line" },
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors text-left ${quickLink}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${link.icon} ${quickIcon}`}></i>
                  </div>
                  {link.label}
                  <i className={`ri-arrow-right-s-line ml-auto ${quickArrow}`}></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
