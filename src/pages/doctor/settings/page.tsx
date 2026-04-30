import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getCurrentDoctorSession } from "@/api/services/doctorSession.service";
import { changePassword } from "@/api/auth";
import { updateDoctorAvatar } from "@/api/doctor";

type SettingsTab = 'profile' | 'security' | 'language' | 'notifications';

function resolveSettingsTab(value: string | null): SettingsTab {
  if (value === "profile" || value === "security" || value === "language" || value === "notifications") {
    return value;
  }
  return "profile";
}

export default function DocSettingsPage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("sidebar.settings")}>
      <DocSettingsContent />
    </DocLayout>
  );
}

export function DocSettingsContent() {
  const { t, i18n } = useTranslation("doctor");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => resolveSettingsTab(searchParams.get("tab")));
  const [language, setLanguage] = useState<'uz' | 'ru'>(i18n.language === "ru" ? "ru" : "uz");
  const [saved, setSaved] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  useEffect(() => {
    const fromUrl = resolveSettingsTab(searchParams.get("tab"));
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [searchParams]);
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
  const { darkMode, setDarkMode, patientDetailLayout, setPatientDetailLayout } = useDoctorTheme();
  const currentDoctorSession = getCurrentDoctorSession();
  const fallbackAvatar = currentDoctorSession?.avatar ?? "";
  const fallbackInitials = (currentDoctorSession?.name ?? "Doctor")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const cardTitle = darkMode ? "text-white" : "text-gray-900";
  const cardText = darkMode ? "text-gray-300" : "text-gray-700";
  const cardTextMuted = darkMode ? "text-gray-400" : "text-gray-600";
  const divider = darkMode ? "border-[#30363D]" : "border-gray-100";
  const inputBase = darkMode
    ? "w-full text-sm border border-[#30363D] rounded-lg px-3 py-2.5 bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
    : "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400";

  const [profile, setProfile] = useState({
    name: 'Dr. Alisher Karimov',
    specialty: 'Kardiologiya',
    phone: '+998 90 123 45 67',
    experience: '8 yil',
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notifs, setNotifs] = useState({
    newPatient: true,
    criticalAlert: true,
    dailySummary: false,
    systemUpdates: true,
  });

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    setAvatarUploadError("");
    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        setAvatarUploadError("Suratni o'qib bo'lmadi");
        setIsUploadingAvatar(false);
        return;
      }
      void (async () => {
        try {
          const uploadedAvatar = await updateDoctorAvatar(dataUrl);
          setLocalAvatarUrl(uploadedAvatar || dataUrl);
          setAvatarFailed(false);
        } catch (error) {
          const message =
            typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message?: unknown }).message === "string"
              ? (error as { message: string }).message
              : "Suratni serverga saqlab bo'lmadi";
          setAvatarUploadError(message);
        } finally {
          setIsUploadingAvatar(false);
        }
      })();
    };
    reader.onerror = () => {
      setAvatarUploadError("Suratni o'qishda xatolik");
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassError('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassError('Yangi parollar mos kelmaydi');
      return;
    }
    if (passwords.newPass.length < 8) {
      setPassError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    setPassError('');
    try {
      setIsChangingPassword(true);
      await changePassword({
        oldPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirm,
      });
      setPassSaved(true);
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPassSaved(false), 2500);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Parolni yangilashda xatolik yuz berdi";
      setPassError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: t("settings.tabs.profile"), icon: 'ri-user-settings-line' },
    { id: 'security', label: t("settings.tabs.security"), icon: 'ri-shield-keyhole-line' },
    { id: 'language', label: t("settings.tabs.languageTheme"), icon: 'ri-translate-2' },
    { id: 'notifications', label: t("settings.tabs.notifications"), icon: 'ri-notification-3-line' },
  ];

  return (
      <div className="w-full min-w-0 space-y-5">
        <div>
          <h2 className={`text-xl font-bold ${pageTitle}`}>{t("settings.title")}</h2>
          <p className={`text-sm mt-0.5 ${pageMuted}`}>{t("settings.subtitle")}</p>
        </div>

        <div className="min-w-0 space-y-4">
          <div className={`rounded-xl p-2 ${cardBase}`}>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", tab.id);
                      return next;
                    });
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? darkMode
                        ? "bg-violet-900/40 text-violet-200"
                        : "bg-violet-50 text-violet-700"
                      : darkMode
                        ? "text-gray-300 hover:bg-[#21262D]"
                        : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${tab.icon} text-base`}></i>
                  </div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className={`rounded-xl p-6 space-y-5 ${cardBase}`}>
                <h3 className={`text-base font-semibold ${cardTitle}`}>Profil Ma'lumotlari</h3>

                {saved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <i className="ri-checkbox-circle-line text-green-600"></i>
                    <span className="text-sm text-green-700 font-medium">
                      Endpoint ulanmagani sababli serverga yuborilmadi
                    </span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={handleAvatarFileChange}
                  />
                  <div className="relative" ref={avatarMenuRef}>
                    <div className="w-16 h-16 shrink-0 overflow-hidden rounded-full bg-violet-600 flex items-center justify-center">
                      {!avatarFailed ? (
                        <img
                          src={localAvatarUrl ?? fallbackAvatar}
                          alt={profile.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarFailed(true)}
                        />
                      ) : (
                        <span className="text-white text-xl font-bold">{fallbackInitials || "DR"}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvatarMenuOpen((prev) => !prev)}
                      className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        darkMode
                          ? "bg-[#21262D] border-[#161B22] text-violet-300 hover:text-violet-200"
                          : "bg-white border-gray-100 text-violet-600 hover:text-violet-700"
                      }`}
                      aria-label="Profil rasmini boshqarish"
                      title="Profil rasmini boshqarish"
                    >
                      <i className="ri-camera-line text-sm" aria-hidden="true"></i>
                    </button>
                    {avatarMenuOpen && (
                      <div
                        className={`absolute top-[calc(100%+8px)] left-0 z-20 min-w-[11rem] rounded-lg border p-1.5 ${
                          darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            avatarFileInputRef.current?.click();
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                            darkMode ? "text-violet-300 hover:bg-[#161B22]" : "text-violet-700 hover:bg-gray-50"
                          }`}
                        >
                          Rasmni o'zgartirish
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalAvatarUrl((prev) => {
                              if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                              return null;
                            });
                            setAvatarFailed(false);
                            setAvatarMenuOpen(false);
                          }}
                          disabled={!localAvatarUrl}
                          className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            darkMode ? "text-gray-300 hover:bg-[#161B22]" : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Suratni olib tashlash
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${cardTitle}`}>{profile.name}</p>
                    <p className="text-xs text-violet-600">{profile.specialty}</p>
                    <p className={`text-xs mt-0.5 ${cardTextMuted}`}>{profile.phone}</p>
                    {isUploadingAvatar && <p className={`text-xs mt-1 ${cardTextMuted}`}>Surat yuklanmoqda...</p>}
                    {avatarUploadError && <p className="text-xs mt-1 text-red-500">{avatarUploadError}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doctor-settings-name" className={`block text-sm font-medium mb-1.5 ${cardText}`}>To'liq ism</label>
                    <input
                      id="doctor-settings-name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-settings-experience" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Tajriba</label>
                    <input
                      id="doctor-settings-experience"
                      type="text"
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
                >
                  Saqlash
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={`rounded-xl p-6 space-y-5 ${cardBase}`}>
                <h3 className={`text-base font-semibold ${cardTitle}`}>Xavfsizlik</h3>

                {passSaved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <i className="ri-checkbox-circle-line text-green-600"></i>
                    <span className="text-sm text-green-700 font-medium">
                      Endpoint ulanmagani sababli parol serverda o'zgarmadi
                    </span>
                  </div>
                )}

                {passError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <i className="ri-error-warning-line text-red-600"></i>
                    <span className="text-sm text-red-700">{passError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="doctor-settings-current-password" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Joriy parol</label>
                    <input
                      id="doctor-settings-current-password"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      placeholder="••••••••"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-settings-new-password" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Yangi parol</label>
                    <input
                      id="doctor-settings-new-password"
                      type="password"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      placeholder="Kamida 8 ta belgi"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-settings-confirm-password" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Yangi parolni tasdiqlang</label>
                    <input
                      id="doctor-settings-confirm-password"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="••••••••"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-shield-check-line text-amber-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Xavfsizlik tavsiyalari</p>
                      <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                        <li>Kamida 8 ta belgi ishlatish</li>
                        <li>Katta va kichik harflar, raqamlar qo'shish</li>
                        <li>Parolni hech kim bilan ulashmang</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    void handleChangePassword();
                  }}
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
                >
                  {isChangingPassword ? "Yuborilmoqda..." : "Parolni o'zgartirish"}
                </button>
              </div>
            )}

            {/* Language & Theme Tab */}
            {activeTab === 'language' && (
              <div className={`rounded-xl p-6 space-y-6 ${cardBase}`}>
                <h3 className={`text-base font-semibold ${cardTitle}`}>Til va Interfeys</h3>

                <div>
                  <p className={`text-sm font-medium mb-3 ${cardText}`}>Interfeys tili</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'uz', label: "O'zbek tili", flag: '🇺🇿' },
                      { id: 'ru', label: 'Русский язык', flag: '🇷🇺' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          const next = lang.id as "uz" | "ru";
                          setLanguage(next);
                          void i18n.changeLanguage(next);
                        }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          language === lang.id
                            ? darkMode
                              ? 'border-violet-500/70 bg-violet-900/30'
                              : 'border-violet-500 bg-violet-50'
                            : darkMode
                              ? 'border-[#30363D] hover:border-gray-500/60'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className={`text-sm font-medium ${
                          language === lang.id
                            ? (darkMode ? 'text-violet-200' : 'text-violet-700')
                            : (darkMode ? 'text-gray-200' : 'text-gray-700')
                        }`}>
                          {lang.label}
                        </span>
                        {language === lang.id && (
                          <div className="ml-auto w-5 h-5 flex items-center justify-center">
                            <i className="ri-checkbox-circle-fill text-violet-600"></i>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`text-sm font-medium mb-3 ${cardText}`}>Bemor tafsiloti ko&apos;rinishi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "scroll" as const,
                        label: "Bitta sahifa",
                        desc: "Barcha bloklar pastga scroll",
                        icon: "ri-layout-bottom-line",
                      },
                      {
                        id: "tabs" as const,
                        label: "Bo'limlar (tablar)",
                        desc: "Kasalxona kartasiga o'xshash yuqori varaqlar",
                        icon: "ri-layout-top-line",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPatientDetailLayout(opt.id)}
                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          patientDetailLayout === opt.id
                            ? darkMode
                              ? "border-violet-500/70 bg-violet-900/30"
                              : "border-violet-500 bg-violet-50"
                            : darkMode
                              ? "border-[#30363D] hover:border-gray-500/60"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <i
                              className={`${opt.icon} text-xl ${
                                patientDetailLayout === opt.id
                                  ? darkMode
                                    ? "text-violet-300"
                                    : "text-violet-600"
                                  : darkMode
                                    ? "text-gray-400"
                                    : "text-gray-500"
                              }`}
                            ></i>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              patientDetailLayout === opt.id
                                ? darkMode
                                  ? "text-violet-200"
                                  : "text-violet-700"
                                : darkMode
                                  ? "text-gray-200"
                                  : "text-gray-700"
                            }`}
                          >
                            {opt.label}
                          </span>
                        </div>
                        <p className={`text-xs ${pageMuted}`}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`text-sm font-medium mb-3 ${cardText}`}>Interfeys rejimi</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: false, label: 'Yorug\' rejim', icon: 'ri-sun-line' },
                      { id: true, label: 'Qorong\'u rejim', icon: 'ri-moon-line' },
                    ].map((mode) => (
                      <button
                        key={String(mode.id)}
                        onClick={() => setDarkMode(mode.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          darkMode === mode.id
                            ? darkMode
                              ? 'border-violet-500/70 bg-violet-900/30'
                              : 'border-violet-500 bg-violet-50'
                            : darkMode
                              ? 'border-[#30363D] hover:border-gray-500/60'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <i className={`${mode.icon} text-xl ${
                            darkMode === mode.id
                              ? (darkMode ? 'text-violet-300' : 'text-violet-600')
                              : (darkMode ? 'text-gray-400' : 'text-gray-500')
                          }`}></i>
                        </div>
                        <span className={`text-sm font-medium ${
                          darkMode === mode.id
                            ? (darkMode ? 'text-violet-200' : 'text-violet-700')
                            : (darkMode ? 'text-gray-200' : 'text-gray-700')
                        }`}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className={`rounded-xl p-6 space-y-5 ${cardBase}`}>
                <h3 className={`text-base font-semibold ${cardTitle}`}>Bildirishnomalar</h3>
                <div className="space-y-4">
                  {[
                    { key: 'newPatient', label: 'Yangi bemor', desc: 'Navbatga yangi bemor qo\'shilganda' },
                    { key: 'criticalAlert', label: 'Kritik ogohlantirish', desc: 'Kritik xavf darajasidagi bemorlar uchun' },
                    { key: 'dailySummary', label: 'Kunlik hisobot', desc: 'Har kuni kechqurun kunlik statistika' },
                    { key: 'systemUpdates', label: 'Tizim yangilanishlari', desc: 'Tizim xabarlari va yangilanishlar' },
                  ].map((item) => (
                    <div key={item.key} className={`flex items-center justify-between py-3 border-b last:border-0 ${divider}`}>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{item.label}</p>
                        <p className={`text-xs mt-0.5 ${pageMuted}`}>{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifs[item.key as keyof typeof notifs]}
                        aria-label={`${item.label}: bildirishnoma`}
                        onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key as keyof typeof notifs] })}
                        className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                          darkMode ? "focus-visible:ring-offset-[#161B22]" : "focus-visible:ring-offset-white"
                        } ${
                          notifs[item.key as keyof typeof notifs]
                            ? "justify-end bg-violet-600"
                            : darkMode
                              ? "justify-start bg-[#30363D]"
                              : "justify-start bg-gray-300"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-[transform] duration-200 ease-out"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
