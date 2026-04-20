import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { currentDoctorSession } from "@/mocks/current_doctor";

type SettingsTab = 'profile' | 'security' | 'language' | 'notifications';

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
  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [language, setLanguage] = useState<'uz' | 'ru'>(i18n.language === "ru" ? "ru" : "uz");
  const [saved, setSaved] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  /** Tanlangan rasm (faqat brauzerda; serverga yuklanmaydi) */
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localAvatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localAvatarUrl);
      }
    };
  }, [localAvatarUrl]);
  const { darkMode, setDarkMode, patientDetailLayout, setPatientDetailLayout } = useDoctorTheme();

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
    bio: 'Yurak-qon tomir kasalliklari bo\'yicha mutaxassis. Toshkent Tibbiyot Akademiyasini tamomlagan.',
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

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
    const next = URL.createObjectURL(file);
    setLocalAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return next;
    });
    setAvatarFailed(false);
    e.target.value = "";
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = () => {
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
    setPassSaved(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSaved(false), 2500);
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
          {!isMockMode && (
            <p className={`text-xs mt-2 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
              Eslatma: profile/password sozlamalari uchun backend endpointlar hali ulanmagan.
            </p>
          )}
        </div>

        <div className="flex min-w-0 gap-5">
          {/* Sidebar Tabs */}
          <div className="w-48 shrink-0">
            <div className={`rounded-xl p-2 space-y-1 ${cardBase}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left whitespace-nowrap ${
                    activeTab === tab.id
                      ? darkMode
                        ? 'bg-violet-900/40 text-violet-200'
                        : 'bg-violet-50 text-violet-700'
                      : darkMode
                        ? 'text-gray-300 hover:bg-[#21262D]'
                        : 'text-gray-600 hover:bg-gray-50'
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
          <div className="min-w-0 flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className={`rounded-xl p-6 space-y-5 ${cardBase}`}>
                <h3 className={`text-base font-semibold ${cardTitle}`}>Profil Ma'lumotlari</h3>

                {saved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <i className="ri-checkbox-circle-line text-green-600"></i>
                    <span className="text-sm text-green-700 font-medium">
                      {isMockMode ? "Demo: lokal ko'rinishda saqlandi" : "Endpoint ulanmagani sababli serverga yuborilmadi"}
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
                  <div className="w-16 h-16 shrink-0 overflow-hidden rounded-full bg-violet-600 flex items-center justify-center">
                    {!avatarFailed ? (
                      <img
                        src={localAvatarUrl ?? currentDoctorSession.avatarUrl}
                        alt={profile.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">{currentDoctorSession.initials}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${cardTitle}`}>{profile.name}</p>
                    <p className="text-xs text-violet-600">{profile.specialty}</p>
                    <button
                      type="button"
                      aria-label="Profil rasmini tanlash"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className={`text-xs cursor-pointer mt-1 whitespace-nowrap ${pageMuted} ${darkMode ? "hover:text-gray-200" : "hover:text-gray-700"}`}
                    >
                      Rasmni o'zgartirish
                    </button>
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
                    <label htmlFor="doctor-settings-specialty" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Mutaxassislik</label>
                    <input
                      id="doctor-settings-specialty"
                      type="text"
                      value={profile.specialty}
                      onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-settings-phone" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Telefon</label>
                    <input
                      id="doctor-settings-phone"
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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

                <div>
                  <label htmlFor="doctor-settings-bio" className={`block text-sm font-medium mb-1.5 ${cardText}`}>Bio</label>
                  <textarea
                    id="doctor-settings-bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className={`${inputBase} resize-none`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{profile.bio.length}/500</p>
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
                      {isMockMode ? "Demo: parol o'zgarishi lokal ko'rinishda" : "Endpoint ulanmagani sababli parol serverda o'zgarmadi"}
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
                  onClick={handleChangePassword}
                  className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 cursor-pointer transition-colors whitespace-nowrap"
                >
                  Parolni o'zgartirish
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
