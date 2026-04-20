import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export type CheckinLang = "uz" | "ru";

interface LanguageStepProps {
  onContinue: (lang: CheckinLang) => void;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
}

export default function LanguageStep({
  onContinue,
  doctorName,
  doctorSpecialty,
  doctorAvatar,
}: LanguageStepProps) {
  const { t } = useTranslation(["checkin", "common"]);
  const options = [
    {
      lang: "uz" as const,
      label: t("common:language.uz"),
      labelSecondary: t("checkin:languageStep.uzSecondary"),
      icon: "ri-book-2-line",
    },
    {
      lang: "ru" as const,
      label: t("common:language.ru"),
      labelSecondary: t("checkin:languageStep.ruSecondary"),
      icon: "ri-book-read-line",
    },
  ];

  const handlePick = async (lang: CheckinLang) => {
    await i18n.changeLanguage(lang);
    onContinue(lang);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <i className="ri-translate-2 text-white text-2xl" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t("checkin:languageStep.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("checkin:languageStep.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <img src={doctorAvatar} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{doctorName}</p>
            <p className="text-xs text-teal-600 font-medium">{doctorSpecialty}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          {options.map((opt) => (
            <button
              key={opt.lang}
              type="button"
              onClick={() => void handlePick(opt.lang)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                <i className={`${opt.icon} text-xl text-teal-600`} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.labelSecondary}</p>
              </div>
              <i className="ri-arrow-right-s-line text-lg text-gray-300 group-hover:text-teal-500 shrink-0 transition-colors" aria-hidden />
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          {t("checkin:languageStep.hint")}
        </p>
      </div>
    </div>
  );
}
