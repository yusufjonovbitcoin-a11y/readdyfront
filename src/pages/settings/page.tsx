import { useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutTheme } from "@/context/LayoutThemeContext";

type SettingsTab = "profile" | "security" | "language" | "appearance" | "notifications";

function SettingsPageContent() {
  const { darkMode: dm, setDarkMode } = useMainLayoutTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [lang, setLang] = useState<"uz" | "ru">("uz");
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
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "profile", label: "Profil", icon: "ri-user-line" },
    { key: "security", label: "Xavfsizlik", icon: "ri-shield-keyhole-line" },
    { key: "language", label: "Til", icon: "ri-translate-2" },
    { key: "appearance", label: "Ko'rinish", icon: "ri-palette-line" },
    { key: "notifications", label: "Xabarnomalar", icon: "ri-notification-3-line" },
  ];

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors ${dm ? "bg-[#0F1117] border border-[#1E2A3A] text-white placeholder-gray-600 focus:border-emerald-500" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"}`;
  const labelClass = `block text-xs font-medium mb-1.5 ${dm ? "text-gray-400" : "text-gray-600"}`;

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium bg-emerald-500 text-white shadow-lg">
          {toast}
        </div>
      )}

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
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Profil Ma'lumotlari</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">SA</span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{profile.name}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">{profile.role}</p>
                  <button className={`text-xs mt-1.5 cursor-pointer ${dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                    Rasm o'zgartirish
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>To'liq Ism</label>
                  <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input className={inputClass} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Rol</label>
                  <input className={inputClass} value={profile.role} disabled />
                </div>
              </div>

              <button onClick={() => showToast("Profil muvaffaqiyatli yangilandi!")} className="mt-5 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                Saqlash
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Xavfsizlik</h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className={labelClass}>Joriy Parol</label>
                  <input type="password" className={inputClass} placeholder="••••••••" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Yangi Parol</label>
                  <input type="password" className={inputClass} placeholder="Kamida 8 ta belgi" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Parolni Tasdiqlash</label>
                  <input type="password" className={inputClass} placeholder="Parolni qayta kiriting" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <button onClick={() => { setPasswords({ current: "", newPass: "", confirm: "" }); showToast("Parol muvaffaqiyatli o'zgartirildi!"); }} className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                  Parolni O'zgartirish
                </button>
              </div>

              <div className={`mt-6 pt-5 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
                <h4 className={`text-sm font-semibold mb-3 ${dm ? "text-white" : "text-gray-900"}`}>Faol Sessiyalar</h4>
                {[
                  { device: "Chrome — Windows 11", ip: "10.0.0.1", time: "Hozir faol", current: true },
                  { device: "Safari — iPhone 15", ip: "192.168.1.45", time: "2 soat oldin", current: false },
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
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Joriy</span>
                    ) : (
                      <button className="text-xs text-red-400 cursor-pointer hover:underline whitespace-nowrap">Chiqarish</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Til Sozlamalari</h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { code: "uz" as const, label: "O'zbek", flag: "🇺🇿" },
                  { code: "ru" as const, label: "Русский", flag: "🇷🇺" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); showToast(`Til ${l.label} ga o'zgartirildi!`); }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      lang === l.code
                        ? "border-emerald-500 bg-emerald-500/10"
                        : dm ? "border-[#1E2A3A] hover:border-emerald-500/50" : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{l.label}</p>
                      {lang === l.code && <p className="text-xs text-emerald-400">Tanlangan</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Ko'rinish</h3>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { mode: false, label: "Yorug' Rejim", icon: "ri-sun-line", desc: "Och fon" },
                  { mode: true, label: "Qorong'u Rejim", icon: "ri-moon-line", desc: "Qorong'u fon" },
                ].map((m) => (
                  <button
                    key={String(m.mode)}
                    type="button"
                    onClick={() => {
                      setDarkMode(m.mode);
                      showToast(`${m.label} yoqildi!`);
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
                    {dm === m.mode && <span className="text-xs text-emerald-400">Faol</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={`rounded-xl p-6 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <h3 className={`text-base font-semibold mb-5 ${dm ? "text-white" : "text-gray-900"}`}>Xabarnoma Sozlamalari</h3>
              <div className="space-y-4">
                {[
                  { key: "email" as const, label: "Email Xabarnomalar", desc: "Muhim yangiliklar emailga yuboriladi" },
                  { key: "system" as const, label: "Tizim Ogohlantirishlari", desc: "Xatolar va muhim tizim xabarlari" },
                  { key: "reports" as const, label: "Hisobotlar", desc: "Haftalik va oylik hisobotlar" },
                  { key: "security" as const, label: "Xavfsizlik Ogohlantirishlari", desc: "Noma'lum kirish urinishlari" },
                ].map((n) => (
                  <div key={n.key} className={`flex items-center justify-between p-4 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                    <div>
                      <p className={`text-sm font-medium ${dm ? "text-white" : "text-gray-900"}`}>{n.label}</p>
                      <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex-shrink-0 relative ${notifications[n.key] ? "bg-emerald-500" : dm ? "bg-[#1E2A3A]" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[n.key] ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`}></div>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => showToast("Xabarnoma sozlamalari saqlandi!")} className="mt-5 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-600 whitespace-nowrap">
                Saqlash
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <MainLayout title="Sozlamalar">
      <SettingsPageContent />
    </MainLayout>
  );
}
