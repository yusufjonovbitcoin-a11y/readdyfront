import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutTheme } from "@/context/LayoutThemeContext";
import AppToast from "@/components/ui/AppToast";
import { useAppToast } from "@/hooks/useAppToast";
import { changePassword, getLoginHistory } from "@/api/auth";
import type { LoginHistoryEntry } from "@/api/types/auth.types";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { patchUserAccount } from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import { formatAppRoleLabel, getUserInitials } from "@/lib/userDisplay";

type SettingsTab = "profile" | "security" | "language" | "appearance" | "notifications";
type NotificationPreferences = {
  email: boolean;
  system: boolean;
  reports: boolean;
  security: boolean;
};
const NOTIFICATION_PREFS_KEY = "medcore_admin_notification_prefs";

function resolveSettingsTab(value: string | null): SettingsTab {
  if (
    value === "profile" ||
    value === "security" ||
    value === "language" ||
    value === "appearance" ||
    value === "notifications"
  ) {
    return value;
  }
  return "profile";
}

function sessionRowIcon(deviceLabel: string): string {
  const d = deviceLabel.toLowerCase();
  if (d.includes("chrome")) return "ri-chrome-line";
  if (d.includes("safari")) return "ri-safari-line";
  if (d.includes("edge")) return "ri-edge-line";
  if (d.includes("firefox")) return "ri-firefox-line";
  if (d.includes("android")) return "ri-android-line";
  if (d.includes("iphone") || d.includes("ipad") || d.includes("ios")) return "ri-smartphone-line";
  return "ri-global-line";
}

function formatPhoneDisplay(phone: string | undefined) {
  if (!phone?.trim()) return "";
  const d = phone.replace(/\s/g, "");
  if (d.startsWith("+998") && d.length >= 13) {
    return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6, 9)} ${d.slice(9, 11)} ${d.slice(11)}`.trim();
  }
  return phone;
}

export function SettingsPageContent() {
  const { t, i18n } = useTranslation("admin");
  const { user, refreshUser, isBootstrapping } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { darkMode: dm, setDarkMode } = useMainLayoutTheme();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => resolveSettingsTab(searchParams.get("tab")));
  const [lang, setLang] = useState<"uz" | "ru">(i18n.language === "ru" ? "ru" : "uz");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>(() => {
    if (typeof window === "undefined") {
      return { email: true, system: true, reports: false, security: true };
    }
    try {
      const raw = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (!raw) return { email: true, system: true, reports: false, security: true };
      const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
      return {
        email: Boolean(parsed.email ?? true),
        system: Boolean(parsed.system ?? true),
        reports: Boolean(parsed.reports ?? false),
        security: Boolean(parsed.security ?? true),
      };
    } catch {
      return { email: true, system: true, reports: false, security: true };
    }
  });
  const [profile, setProfile] = useState({ name: "", phone: "", role: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const { toast, showToast } = useAppToast();
  const relTimeLang = i18n.language === "ru" ? "ru" : "uz";

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name?.trim() ?? "",
      phone: formatPhoneDisplay(user.phone) || "",
      role: user.role ?? "",
    });
  }, [user]);

  useEffect(() => {
    const fromUrl = resolveSettingsTab(searchParams.get("tab"));
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "security") return;
    let cancelled = false;
    setLoginHistoryLoading(true);
    void (async () => {
      try {
        const rows = await getLoginHistory();
        if (!cancelled) setLoginHistory(rows);
      } catch {
        if (!cancelled) setLoginHistory([]);
      } finally {
        if (!cancelled) setLoginHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (avatarMenuRef.current?.contains(target)) return;
      setAvatarMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [avatarMenuOpen]);

  const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    const next = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return next;
    });
    e.target.value = "";
  };

  const saveNotificationPreferences = () => {
    try {
      window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notifications));
      showToast("Xabarnoma sozlamalari saqlandi", "success");
    } catch {
      showToast("Sozlamalarni saqlashda xatolik yuz berdi", "error");
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "profile", label: t("settings.tabs.profile"), icon: "ri-user-line" },
    { key: "security", label: t("settings.tabs.security"), icon: "ri-shield-keyhole-line" },
    { key: "language", label: t("settings.tabs.language"), icon: "ri-translate-2" },
    { key: "appearance", label: t("settings.tabs.appearance"), icon: "ri-palette-line" },
    { key: "notifications", label: t("settings.tabs.notifications"), icon: "ri-notification-3-line" },
  ];

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`;

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast("Barcha maydonlarni to'ldiring.", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast("Yangi parollar mos kelmaydi.", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      showToast("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.", "error");
      return;
    }
    try {
      setIsChangingPassword(true);
      await changePassword({
        oldPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirm,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      showToast("Parol muvaffaqiyatli yangilandi.", "success");
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Parolni yangilashda xatolik yuz berdi.";
      showToast(message, "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) {
      showToast(t("settings.profile.noSession"), "error");
      return;
    }
    const nameTrim = profile.name.trim();
    if (!nameTrim) {
      showToast(t("settings.profile.nameRequired"), "error");
      return;
    }
    setIsSavingProfile(true);
    try {
      const body: { full_name: string; phone_number?: string } = { full_name: nameTrim };
      const rawPhone = profile.phone.replace(/\s/g, "");
      if (rawPhone && rawPhone !== (user.phone ?? "").replace(/\s/g, "")) {
        if (!/^\+998\d{9}$/.test(rawPhone)) {
          showToast(t("settings.profile.phoneInvalid"), "error");
          return;
        }
        body.phone_number = rawPhone;
      }
      await patchUserAccount(user.userId, body);
      await refreshUser();
      showToast(t("settings.profile.toastUpdated"), "success");
    } catch (e) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : t("settings.profile.saveFailed");
      showToast(msg, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <AppToast toast={toast} />

      <div className="space-y-5">
        {/* Top Tabs */}
        <div className={`rounded-xl p-3 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("tab", t.key);
                    return next;
                  });
                }}
                className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
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
        <div>
          {activeTab === "profile" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>{t("settings.profile.title")}</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative" ref={avatarMenuRef}>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={handleAvatarFile}
                  />
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {getUserInitials(profile.name || user?.name)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen((prev) => !prev)}
                    className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      dm
                        ? "bg-[#1A2235] border-[#0F1117] text-emerald-400 hover:text-emerald-300"
                        : "bg-white border-gray-100 text-emerald-600 hover:text-emerald-700"
                    }`}
                    aria-label={t("settings.profile.changePhoto")}
                    title={t("settings.profile.changePhoto")}
                  >
                    <i className="ri-camera-line text-sm" aria-hidden="true"></i>
                  </button>
                  {avatarMenuOpen && (
                    <div
                      className={`absolute top-[calc(100%+8px)] left-0 z-20 min-w-[11rem] rounded-lg border p-1.5 ${
                        dm ? "bg-[#1A2235] border-[#1E2130]" : "bg-white border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          avatarInputRef.current?.click();
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                          dm ? "text-emerald-300 hover:bg-[#0F1117]" : "text-emerald-700 hover:bg-gray-50"
                        }`}
                      >
                        {t("settings.profile.changePhoto")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl((prev) => {
                            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                            return null;
                          });
                          setAvatarMenuOpen(false);
                        }}
                        disabled={!avatarUrl}
                        className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          dm ? "text-gray-300 hover:bg-[#0F1117]" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {t("settings.profile.removePhoto", { defaultValue: "Suratni olib tashlash" })}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{profile.name}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">{profile.role}</p>
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
                  <input
                    id="settings-profile-role"
                    className={inputClass}
                    value={formatAppRoleLabel(profile.role)}
                    disabled
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleSaveProfile();
                }}
                disabled={isBootstrapping || isSavingProfile || !user}
                className="mt-5 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? t("settings.profile.saving") : t("settings.profile.saveButton")}
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
                    void handleChangePassword();
                  }}
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap"
                >
                  {isChangingPassword ? "Yuborilmoqda..." : t("settings.security.changePasswordButton")}
                </button>
              </div>

              <div className={`mt-6 pt-5 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
                <h4 className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>
                  {t("settings.security.activeSessionsTitle")}
                </h4>
                <p className={`text-xs mt-1 mb-3 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  {t("settings.security.activeSessionsSubtitle")}
                </p>
                {loginHistoryLoading ? (
                  <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
                    {t("settings.security.sessionsLoading")}
                  </p>
                ) : loginHistory.length === 0 ? (
                  <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
                    {t("settings.security.sessionsEmpty")}
                  </p>
                ) : (
                  loginHistory.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-3 rounded-lg mb-2 ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}
                      title={s.userAgent}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20 flex-shrink-0">
                          <i className={`${sessionRowIcon(s.deviceLabel)} text-emerald-400 text-sm`} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${dm ? "text-white" : "text-gray-900"}`}>
                            {s.deviceLabel}
                          </p>
                          <p className={`text-xs truncate ${dm ? "text-gray-500" : "text-gray-400"}`}>
                            {s.ip} · {formatRelativeTime(s.signedInAt, relTimeLang)}
                          </p>
                        </div>
                      </div>
                      {s.isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                          {t("settings.security.currentSessionChip")}
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
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
                      onClick={() => {
                        const next = !notifications[n.key];
                        const updated = { ...notifications, [n.key]: next };
                        setNotifications(updated);
                        try {
                          window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
                        } catch {
                          // ignore storage failures
                        }
                        const toggleLabel = i18n.language === "ru"
                          ? (next ? "включено" : "выключено")
                          : (next ? "yoqildi" : "o'chirildi");
                        showToast(
                          `${n.label}: ${toggleLabel}`,
                          "success",
                        );
                      }}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex-shrink-0 relative ${notifications[n.key] ? "bg-emerald-500" : dm ? "bg-[#1E2A3A]" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[n.key] ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`}></div>
                    </button>
                  </div>
                ))}
              </div>
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
