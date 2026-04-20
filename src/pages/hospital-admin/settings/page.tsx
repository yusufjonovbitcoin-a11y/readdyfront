import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  HA_ADMIN_AVATAR_KEY,
  getHaAdminStoredAvatar,
  haAdminInitialsFromName,
  notifyHaAdminAvatarUpdated,
} from "@/lib/haAdminProfile";

type SettingsTab = 'profile' | 'security' | 'language' | 'notifications';

export default function HASettingsPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.settings")}>
      <HASettingsPageContent />
    </HALayout>
  );
}

export function HASettingsPageContent() {
  const { t, i18n } = useTranslation("hospital");
  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";
  const darkMode = useHospitalAdminDarkMode();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getHaAdminStoredAvatar);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [lang, setLang] = useState<'uz' | 'ru'>(i18n.language === "ru" ? "ru" : "uz");
  const [notifications, setNotifications] = useState({
    newPatient: true, doctorUpdate: true, systemAlert: false, weeklyReport: true,
  });
  const [profile, setProfile] = useState({
    name: 'Aziz Rahimov', email: 'a.rahimov@medcore.uz', phone: '+998 90 123 45 67', hospital: 'Toshkent Klinikasi',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

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
        {!isMockMode && (
          <p className={`text-xs ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
            Eslatma: settings bo'limidagi saqlash amallari uchun backend endpointlar hali ulanmagan.
          </p>
        )}
        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl flex-wrap ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>Profil ma'lumotlari</h3>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  aria-label="Profil surati"
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
                <div className="mt-2 flex flex-col gap-1 items-center max-w-[5.5rem]">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className={`text-xs font-medium transition-colors cursor-pointer underline-offset-2 hover:underline ${
                      darkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"
                    }`}
                  >
                    Surat qo‘yish
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className={`text-xs transition-colors cursor-pointer ${
                        darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Suratni olib tashlash
                    </button>
                  )}
                </div>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{profile.name}</p>
                <p className="text-xs text-teal-600 font-medium">HOSPITAL_ADMIN</p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{profile.hospital}</p>
                <p className={`text-[11px] mt-2 leading-snug ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Surat ixtiyoriy. Brauzerda saqlanadi (demo).
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ha-settings-name" className={labelClass}>To'liq ism</label>
                  <input id="ha-settings-name" type="text" className={inputClass} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="ha-settings-hospital" className={labelClass}>Kasalxona</label>
                  <input id="ha-settings-hospital" type="text" className={inputClass} value={profile.hospital} disabled />
                </div>
              </div>
              <div>
                <label htmlFor="ha-settings-email" className={labelClass}>Email</label>
                <input id="ha-settings-email" type="email" className={inputClass} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div>
                <label htmlFor="ha-settings-phone" className={labelClass}>Telefon</label>
                <input id="ha-settings-phone" type="tel" className={inputClass} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <button onClick={showSaved} className="h-10 px-6 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                {saved ? (isMockMode ? "Demo: lokal saqlandi" : "Serverga yuborilmadi") : "Saqlash"}
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>Parolni o'zgartirish</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="ha-settings-current-password" className={labelClass}>Joriy parol</label>
                <input id="ha-settings-current-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              </div>
              <div>
                <label htmlFor="ha-settings-new-password" className={labelClass}>Yangi parol</label>
                <input id="ha-settings-new-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
              </div>
              <div>
                <label htmlFor="ha-settings-confirm-password" className={labelClass}>Yangi parolni tasdiqlang</label>
                <input id="ha-settings-confirm-password" type="password" className={inputClass} placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                <p className="text-xs text-red-500">Parollar mos kelmaydi</p>
              )}
              <button
                onClick={showSaved}
                disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}
                className="h-10 px-6 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {saved ? (isMockMode ? "Demo: lokal saqlandi" : "Serverga yuborilmadi") : "Parolni yangilash"}
              </button>
            </div>

            <div className={`mt-6 pt-6 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Xavfsizlik ma'lumotlari</h4>
              <div className="space-y-2">
                {[
                  { label: 'So\'nggi kirish', value: '2026-04-18, 09:32' },
                  { label: 'IP manzil', value: '192.168.1.105' },
                  { label: 'Qurilma', value: 'Chrome / Windows 11' },
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
                <label className={`${labelClass} mb-3`}>Interfeys tili</label>
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
                          ? 'border-teal-500 bg-teal-50'
                          : darkMode ? 'border-[#1E2130] hover:border-teal-500/50' : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <span className="text-2xl">{l.flag}</span>
                      <span className={`text-sm font-medium ${lang === l.code ? 'text-teal-700' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{l.label}</span>
                      {lang === l.code && <div className="ml-auto w-4 h-4 flex items-center justify-center"><i className="ri-check-line text-teal-600 text-sm"></i></div>}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={showSaved} className="h-10 px-6 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                {saved ? (isMockMode ? "Demo: lokal saqlandi" : "Serverga yuborilmadi") : "Saqlash"}
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className={cardBase}>
            <h3 className={`text-sm font-bold mb-5 ${darkMode ? "text-white" : "text-gray-900"}`}>Xabarnoma sozlamalari</h3>
            <div className="space-y-4">
              {[
                { key: 'newPatient', label: 'Yangi bemor', desc: 'Yangi bemor qo\'shilganda xabar olish' },
                { key: 'doctorUpdate', label: 'Shifokor yangilanishi', desc: 'Shifokor ma\'lumotlari o\'zgarganda' },
                { key: 'systemAlert', label: 'Tizim ogohlantirishlari', desc: 'Muhim tizim xabarlari' },
                { key: 'weeklyReport', label: 'Haftalik hisobot', desc: 'Har dushanba haftalik statistika' },
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
              <button onClick={showSaved} className="h-10 px-6 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                {saved ? (isMockMode ? "Demo: lokal saqlandi" : "Serverga yuborilmadi") : "Saqlash"}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
