import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

export const LANGUAGE_STORAGE_KEY = "medcore_lang";
const SUPPORTED_LANGUAGES = ["uz", "ru"] as const;
const NAMESPACES = ["common", "auth", "admin", "hospital", "doctor", "checkin"] as const;
const DEFAULT_NAMESPACE = "common" as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return "uz";
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)) {
    return saved as SupportedLanguage;
  }

  return "uz";
}

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    fallbackLng: "uz",
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: NAMESPACES,
    defaultNS: DEFAULT_NAMESPACE,
    fallbackNS: DEFAULT_NAMESPACE,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined" && SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage)) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) {
      return;
    }

    if (SUPPORTED_LANGUAGES.includes(event.newValue as SupportedLanguage) && i18n.language !== event.newValue) {
      void i18n.changeLanguage(event.newValue);
    }
  });
}

export default i18n;