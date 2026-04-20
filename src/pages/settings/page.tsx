import { useTranslation } from "react-i18next";
import { useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutTheme } from "@/context/LayoutThemeContext";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";

type SettingsTab = "profile" | "security" | "language" | "appearance" | "notifications";

export function SettingsPageContent() {
  const { t, i18n } = useTranslation("admin");
  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";
  const { darkMode: dm, setDarkMode } = useMainLayoutTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [lang, setLang] = useState<"uz" | "ru">(i18n.language === "ru" ? "ru" : "uz");
  const [notifications, setNotifications] = useState({
    email: true,
    system: true,
    reports: false,
    security: true,
  });
  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@medcore.uz",
    phone: "+998 71 000 00 00",
    role: "SUPER_ADMIN",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const { toast, showToast } = useAppToast();

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "profile", label: t("settings.tabs.profile"), icon: "ri-user-line" },
    { key: "security", label: t("settings.tabs.security"), icon: "ri-shield-keyhole-line" },
    { key: "language", label: t("settings.tabs.language"), icon: "ri-translate-2" },
    { key: "appearance", label: t("settings.tabs.appearance"), icon: "ri-palette-line" },
    { key: "notifications", label: t("settings.tabs.notifications"), icon: "ri-notification-3-line" },
  ];

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`;

  return (
    <>
      <AppToast toast={toast} />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Tabs */}
        <div className={`lg:w-56 rounded-xl p-3 h-fit ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors text-left whitespace-nowrap ${
                  activeTab === t.key
                    ? "bg-emerald-500 text-white shadow-sm"
                    : dm ? "text-gray-400 hover:bg-[#0F1117] hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${t.icon} text-sm ${activeTab === t.key ? "text-white" : ""}`}></i>
                </div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.profile.title")}</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">SA</span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{profile.name}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">{profile.role}</p>
                  <button className={`text-xs mt-1.5 cursor-pointer ${dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                    {t("settings.profile.changePhoto")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-profile-full-name" className={labelClass}>{t("settings.profile.fields.fullName")}</label>
                  <input
                    id="settings-profile-full-name"
                    className={inputClass}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="settings-profile-email" className={labelClass}>{t("settings.profile.fields.email")}</label>
                  <input
                    id="settings-profile-email"
                    className={inputClass}
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="settings-profile-phone" className={labelClass}>{t("settings.profile.fields.phone")}</label>
                  <input
                    id="settings-profile-phone"
                    className={inputClass}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="settings-profile-role" className={labelClass}>{t("settings.profile.fields.role")}</label>
                  <input id="settings-profile-role" className={inputClass} value={profile.role} disabled />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    isMockMode
                      ? "Demo rejim: profil o'zgarishlari lokal saqlandi."
                      : "Backend profile update endpointi ulanmaguncha bu amal vaqtincha o'chirilgan.",
                    isMockMode ? "success" : "info",
                  )
                }
                className="mt-5 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap"
              >
                {t("settings.profile.saveButton")}
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.security.title")}</h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="settings-security-current-password" className={labelClass}>{t("settings.security.fields.currentPassword")}</label>
                  <input
                    id="settings-security-current-password"
                    type="password"
                    className={inputClass}
                    placeholder={t("settings.security.placeholders.maskedPassword")}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="settings-security-new-password" className={labelClass}>{t("settings.security.fields.newPassword")}</label>
                  <input
                    id="settings-security-new-password"
                    type="password"
                    className={inputClass}
                    placeholder={t("settings.security.placeholders.newPassword")}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="settings-security-confirm-password" className={labelClass}>{t("settings.security.fields.confirmPassword")}</label>
                  <input
                    id="settings-security-confirm-password"
                    type="password"
                    className={inputClass}
                    placeholder={t("settings.security.placeholders.confirmPassword")}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswords({ current: "", newPass: "", confirm: "" });
                    showToast(
                      isMockMode
                        ? "Demo rejim: parol o'zgarishi serverga yuborilmadi."
                        : "Backend password endpointi ulanmaguncha bu amal vaqtincha o'chirilgan.",
                      "info",
                    );
                  }}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap"
                >
                  {t("settings.security.changePasswordButton")}
                </button>
              </div>

              <div className={`mt-6 pt-5 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
                <h4 className={`text-sm font-semibold mb-3 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.security.activeSessionsTitle")}</h4>
                {[
                  { device: t("settings.security.sessions.chromeWindows"), ip: "10.0.0.1", time: t("settings.security.sessions.nowActive"), current: true },
                  { device: t("settings.security.sessions.safariIphone"), ip: "192.168.1.45", time: t("settings.security.sessions.twoHoursAgo"), current: false },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg mb-2 ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20">
                        <i className={`${s.device.includes("Chrome") ? "ri-chrome-line" : "ri-safari-line"} text-emerald-400 text-sm`}></i>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{s.device}</p>
                        <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{s.ip} · {s.time}</p>
                      </div>
                    </div>
                    {s.current ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">{t("settings.security.currentSessionChip")}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            "Remote session revoke endpointi hali ulanmagan.",
                            "info",
                          )
                        }
                        className="text-xs text-red-400 cursor-pointer hover:underline whitespace-nowrap"
                      >
                        {t("settings.security.signOutButton")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.languageTitle")}</h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { code: "uz" as const, label: t("settings.language.options.uz"), flag: "🇺🇿" },
                  { code: "ru" as const, label: t("settings.language.options.ru"), flag: "🇷🇺" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); void i18n.changeLanguage(l.code); showToast(t("settings.languageChanged")); }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      lang === l.code
                        ? "border-emerald-500 bg-emerald-500/10"
                        : dm ? "border-[#1E2A3A] hover:border-emerald-500/50" : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{l.label}</p>
                      {lang === l.code && <p className="text-xs text-emerald-400">{t("settings.language.selected")}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.appearance.title")}</h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { mode: false, label: t("settings.appearance.options.light.label"), icon: "ri-sun-line", desc: t("settings.appearance.options.light.description") },
                  { mode: true, label: t("settings.appearance.options.dark.label"), icon: "ri-moon-line", desc: t("settings.appearance.options.dark.description") },
                ].map((m) => (
                  <button
                    key={String(m.mode)}
                    type="button"
                    onClick={() => {
                      setDarkMode(m.mode);
                      showToast(t("settings.appearance.toastEnabled", { mode: m.label }));
                    }}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      dm === m.mode
                        ? "border-emerald-500 bg-emerald-500/10"
                        : dm ? "border-[#1E2A3A] hover:border-emerald-500/50" : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/20">
                      <i className={`${m.icon} text-emerald-400 text-xl`}></i>
                    </div>
                    <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{m.label}</p>
                    <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{m.desc}</p>
                    {dm === m.mode && <span className="text-xs text-emerald-400">{t("settings.appearance.activeChip")}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.notifications.title")}</h3>
              <div className="space-y-4">
                {[
                  { key: "email" as const, label: t("settings.notifications.channels.email.label"), desc: t("settings.notifications.channels.email.description") },
                  { key: "system" as const, label: t("settings.notifications.channels.system.label"), desc: t("settings.notifications.channels.system.description") },
                  { key: "reports" as const, label: t("settings.notifications.channels.reports.label"), desc: t("settings.notifications.channels.reports.description") },
                  { key: "security" as const, label: t("settings.notifications.channels.security.label"), desc: t("settings.notifications.channels.security.description") },
                ].map((n) => (
                  <div key={n.key} className={`flex items-center justify-between p-4 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                    <div>
                      <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{n.label}</p>
                      <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{n.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications[n.key]}
                      aria-label={n.label}
                      onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex-shrink-0 relative ${notifications[n.key] ? "bg-emerald-500" : dm ? "bg-[#1E2A3A]" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[n.key] ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`}></div>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    isMockMode
                      ? "Demo rejim: bildirishnoma sozlamalari lokal saqlandi."
                      : "Notification settings endpointi ulanmaguncha bu amal vaqtincha o'chirilgan.",
                    "info",
                  )
                }
                className="mt-5 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap"
              >
                {t("settings.notifications.saveButton")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("titles.settings")}>
      <SettingsPageContent />
    </MainLayout>
  );
}
