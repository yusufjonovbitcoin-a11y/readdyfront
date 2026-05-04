import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { changePassword } from "@/api/auth";
import { patchUserAccount } from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import {
  HA_ADMIN_AVATAR_KEY,
  getHaAdminStoredAvatar,
  haAdminInitialsFromName,
  notifyHaAdminAvatarUpdated,
} from "@/lib/haAdminProfile";

type SettingsTab = 'profile' | 'security' | 'language' | 'notifications';

function resolveSettingsTab(value: string | null): SettingsTab {
  if (value === "profile" || value === "security" || value === "language" || value === "notifications") {
    return value;
  }
  return "profile";
}

export default function HASettingsPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.settings")}>
      <HASettingsPageContent />
    </HALayout>
  );
}

function formatPhoneDisplay(phone: string | undefined) {
  if (!phone?.trim()) return "";
  const d = phone.replace(/\s/g, "");
  if (d.startsWith("+998") && d.length >= 13) {
    return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6, 9)} ${d.slice(9, 11)} ${d.slice(11)}`.trim();
  }
  return phone;
}

export function HASettingsPageContent() {
  const { t, i18n } = useTranslation("hospital");
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const darkMode = useHospitalAdminDarkMode();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getHaAdminStoredAvatar);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => resolveSettingsTab(searchParams.get("tab")));
  const [lang, setLang] = useState<'uz' | 'ru'>(i18n.language === "ru" ? "ru" : "uz");
  const [notifications, setNotifications] = useState({
    newPatient: true, doctorUpdate: true, systemAlert: false, weeklyReport: true,
  });
  const [profile, setProfile] = useState({ name: "", phone: "", hospital: "" });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name?.trim() ?? "",
      phone: formatPhoneDisplay(user.phone) || "",
      hospital: user.hospitalName?.trim() ?? "",
    });
  }, [user?.name, user?.phone, user?.hospitalName, user]);

  useEffect(() => {
    const fromUrl = resolveSettingsTab(searchParams.get("tab"));
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) {
      setProfileError("Profilni saqlash uchun sessiya (userId) topilmadi. Qayta kiring.");
      return;
    }
    const nameTrim = profile.name.trim();
    if (!nameTrim) {
      setProfileError(t("settings.profile.nameRequired"));
      return;
    }
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      const body: { full_name: string; phone_number?: string } = { full_name: nameTrim };
      const rawPhone = profile.phone.replace(/\s/g, "");
      if (rawPhone && rawPhone !== (user.phone ?? "").replace(/\s/g, "")) {
        if (!/^\+998\d{9}$/.test(rawPhone)) {
          setProfileError(t("settings.profile.phoneInvalid"));
          setIsSavingProfile(false);
          return;
        }
        body.phone_number = rawPhone;
      }
      await patchUserAccount(user.userId, body);
      await refreshUser();
      showSaved();
    } catch (e) {
      const msg =
        typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : t("settings.profile.saveFailed");
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPasswordError("Barcha maydonlarni to'ldiring");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError(t("settings.security.passwordMismatch"));
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      await changePassword({
        oldPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirm,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      showSaved();
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Parolni yangilashda xatolik yuz berdi";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const persistAvatar = (dataUrl: string | null) => {
    try {
      if (dataUrl) localStorage.setItem(HA_ADMIN_AVATAR_KEY, dataUrl);
      else localStorage.removeItem(HA_ADMIN_AVATAR_KEY);
    } catch {
      /* ignore quota / private mode */
    }
    notifyHaAdminAvatarUpdated();
  };

  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl.length > 2_000_000) {
        alert("Fayl juda katta. Iltimos, 2 MB dan kichikroq surat tanlang.");
        return;
      }
      setAvatarUrl(dataUrl);
      persistAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setAvatarUrl(null);
    persistAvatar(null);
  };

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

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'profile', label: t("settings.tabs.profile"), icon: 'ri-user-line' },
    { key: 'security', label: t("settings.tabs.security"), icon: 'ri-shield-keyhole-line' },
    { key: 'language', label: t("settings.tabs.language"), icon: 'ri-global-line' },
    { key: 'notifications', label: t("settings.tabs.notifications"), icon: 'ri-notification-3-line' },
  ];

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${
    darkMode ? "bg-[#1A2235] border-[#1E2130] text-white placeholder-gray-500 focus:border-teal-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
  }`;
  const labelClass = `block text-xs font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const cardBase = `rounded-xl border p-6 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  return (
      <div className="max-w-3xl space-y-5">
        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl flex-wrap ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("tab", tab.key);
                  return next;
                });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? darkMode ? "bg-[#141824] text-teal-400" : "bg-white text-teal-600"
                  : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("settings.profile.title")}</h3>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 relative" ref={avatarMenuRef}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  aria-label={t("settings.profile.avatarInputAria")}
                  onChange={onAvatarFile}
                />
                <div
                  className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-offset-2 ${
                    darkMode ? "ring-offset-[#141824] ring-[#1E2130]" : "ring-offset-white ring-gray-200"
                  } ${avatarUrl ? "bg-[#1A2235]" : "bg-teal-500"}`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xl font-bold">{haAdminInitialsFromName(profile.name)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen((prev) => !prev)}
                  className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    darkMode
                      ? "bg-[#1A2235] border-[#141824] text-teal-400 hover:text-teal-300"
                      : "bg-white border-gray-100 text-teal-600 hover:text-teal-700"
                  }`}
                  aria-label={t("settings.profile.avatarInputAria")}
                  title={t("settings.profile.avatarInputAria")}
                >
                  <i className="ri-camera-line text-sm" aria-hidden="true"></i>
                </button>
                {avatarMenuOpen && (
                  <div
                    className={`absolute top-[calc(100%+8px)] left-0 z-20 min-w-[11rem] rounded-lg border p-1.5 ${
                      darkMode ? "bg-[#1A2235] border-[#1E2130]" : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        avatarInputRef.current?.click();
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                        darkMode ? "text-teal-300 hover:bg-[#141824]" : "text-teal-700 hover:bg-gray-50"
                      }`}
                    >
                      {t("settings.profile.uploadPhoto")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearAvatar();
                        setAvatarMenuOpen(false);
                      }}
                      disabled={!avatarUrl}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode ? "text-gray-300 hover:bg-[#141824]" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t("settings.profile.removePhoto")}
                    </button>
                  </div>
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{profile.name}</p>
                <p className="text-xs text-teal-600 font-medium">{t("settings.profile.roleLabel")}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{profile.hospital}</p>
                <p className={`text-[11px] mt-2 leading-snug ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {t("settings.profile.avatarHint")}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ha-settings-name" className={labelClass}>{t("settings.profile.fullName")}</label>
                  <input id="ha-settings-name" type="text" className={inputClass} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="ha-settings-hospital" className={labelClass}>{t("settings.profile.hospital")}</label>
                  <input id="ha-settings-hospital" type="text" className={inputClass} value={profile.hospital} disabled />
                </div>
              </div>
              <div>
                <label htmlFor="ha-settings-phone" className={labelClass}>{t("settings.profile.phone")}</label>
                <input id="ha-settings-phone" type="tel" className={inputClass} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              {profileError ? <p className="text-xs text-red-500">{profileError}</p> : null}
              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={isSavingProfile}
                className="min-h-[44px] px-6 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {isSavingProfile ? t("settings.profile.saving") : saved ? t("settings.saved.done") : t("common:buttons.save")}
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("settings.security.title")}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="ha-settings-current-password" className={labelClass}>{t("settings.security.currentPassword")}</label>
                <input id="ha-settings-current-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              </div>
              <div>
                <label htmlFor="ha-settings-new-password" className={labelClass}>{t("settings.security.newPassword")}</label>
                <input id="ha-settings-new-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
              </div>
              <div>
                <label htmlFor="ha-settings-confirm-password" className={labelClass}>{t("settings.security.confirmPassword")}</label>
                <input id="ha-settings-confirm-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                <p className="text-xs text-red-500">{t("settings.security.passwordMismatch")}</p>
              )}
              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
              <button
                onClick={() => {
                  void handlePasswordChange();
                }}
                disabled={
                  isChangingPassword ||
                  !passwords.current ||
                  !passwords.newPass ||
                  passwords.newPass !== passwords.confirm
                }
                className="min-h-[44px] px-6 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {isChangingPassword
                  ? "Yuborilmoqda..."
                  : saved
                    ? t("settings.saved.notSent")
                    : t("settings.security.updatePassword")}
              </button>
            </div>

            <div className={`mt-6 pt-6 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("settings.security.infoTitle")}</h4>
              <div className="space-y-2">
                {[
                  { label: t("settings.security.info.lastLogin"), value: '2026-04-18, 09:32' },
                  { label: t("settings.security.info.ipAddress"), value: '192.168.1.105' },
                  { label: t("settings.security.info.device"), value: 'Chrome / Windows 11' },
                ].map(item => (
                  <div key={item.label} className={`flex items-center justify-between py-2 border-b last:border-0 ${darkMode ? "border-[#1E2130]" : "border-gray-50"}`}>
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                    <span className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Language */}
        {activeTab === 'language' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("settings.languageAppearance")}</h3>
            <div className="space-y-5">
              <div>
                <label className={`${labelClass} mb-3`}>{t("settings.language.interfaceLanguage")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'uz', label: "O'zbek tili", flag: '🇺🇿' },
                    { code: 'ru', label: 'Русский язык', flag: '🇷🇺' },
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => { const next = l.code as "uz" | "ru"; setLang(next); void i18n.changeLanguage(next); }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        lang === l.code
                          ? darkMode
                            ? "border-teal-500/70 bg-teal-900/25"
                            : "border-teal-500 bg-teal-50"
                          : darkMode
                            ? "border-[#1E2130] hover:border-teal-500/50"
                            : "border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl">{l.flag}</span>
                      <span
                        className={`text-sm font-medium ${
                          lang === l.code
                            ? darkMode
                              ? "text-teal-200"
                              : "text-teal-700"
                            : darkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                        }`}
                      >
                        {l.label}
                      </span>
                      {lang === l.code && <div className="ml-auto w-4 h-4 flex items-center justify-center"><i className="ri-check-line text-teal-600 text-sm"></i></div>}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={showSaved} className="min-h-[44px] px-6 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                {saved ? t("settings.saved.notSent") : t("common:buttons.save")}
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("settings.notifications.title")}</h3>
            <div className="space-y-4">
              {[
                { key: 'newPatient', label: t("settings.notifications.items.newPatient.label"), desc: t("settings.notifications.items.newPatient.desc") },
                { key: 'doctorUpdate', label: t("settings.notifications.items.doctorUpdate.label"), desc: t("settings.notifications.items.doctorUpdate.desc") },
                { key: 'systemAlert', label: t("settings.notifications.items.systemAlert.label"), desc: t("settings.notifications.items.systemAlert.desc") },
                { key: 'weeklyReport', label: t("settings.notifications.items.weeklyReport.label"), desc: t("settings.notifications.items.weeklyReport.desc") },
              ].map(item => (
                <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{item.label}</p>
                    <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-teal-500' : darkMode ? 'bg-[#0F1117]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
              <button onClick={showSaved} className="min-h-[44px] px-6 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                {saved ? t("settings.saved.notSent") : t("common:buttons.save")}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
