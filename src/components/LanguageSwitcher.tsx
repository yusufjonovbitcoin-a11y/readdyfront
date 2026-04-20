import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { memo, useMemo } from "react";

const LANGUAGES = [
  { code: "uz", labelKey: "language.uz" },
  { code: "ru", labelKey: "language.ru" },
] as const;

function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const activeLanguage = i18n.language;
  const labels = useMemo(
    () => ({
      uz: t("language.uz", { defaultValue: "O'zbekcha" }),
      ru: t("language.ru", { defaultValue: "Русский" }),
    }),
    [activeLanguage],
  );

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
      {LANGUAGES.map((lang) => {
        const active = activeLanguage === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void i18n.changeLanguage(lang.code)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? "bg-teal-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {labels[lang.code]}
          </button>
        );
      })}
    </div>
  );
}

export default memo(LanguageSwitcher);
