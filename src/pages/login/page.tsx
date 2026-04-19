import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, AuthUser, UserRole } from "@/hooks/useAuth";

/** +998 dan keyingi 9 raqam (masalan 901111111) */
const UZ_PHONE_PREFIX = "+998";

const MOCK_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  "+998901111111": {
    password: "Admin@123",
    user: {
      id: "sa-001",
      name: "Akbar Toshmatov",
      email: "superadmin@medcore.uz",
      role: "SUPER_ADMIN",
      avatar: "AT",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNhLTAwMSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTcxMzQwMDAwMH0.mock_super_admin_token",
    },
  },
  "+998902222222": {
    password: "Hospital@123",
    user: {
      id: "u1",
      name: "Sardor Yusupov",
      email: "sardor@tashkent-clinic.uz",
      role: "HOSPITAL_ADMIN",
      hospitalId: "1",
      hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
      avatar: "SY",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUxIiwicm9sZSI6IkhPU1BJVEFMX0FETUlOIiwiaWF0IjoxNzEzNDAwMDAwfQ.mock_hospital_admin_token",
    },
  },
  "+998901234567": {
    password: "Doctor@123",
    user: {
      id: "u3",
      name: "Dr. Alisher Nazarov",
      email: "a.nazarov@clinic.uz",
      role: "DOCTOR",
      hospitalId: "1",
      hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
      avatar: "AN",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUzIiwicm9sZSI6IkRPQ1RPUiIsImlhdCI6MTcxMzQwMDAwMH0.mock_doctor_token",
    },
  },
};

const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: "/",
  HOSPITAL_ADMIN: "/hospital-admin",
  DOCTOR: "/doctor/patients",
};

const DEMO_ACCOUNTS = [
  { role: "Super Admin", phoneRest: "901111111", password: "Admin@123", color: "emerald", icon: "ri-shield-star-line" },
  { role: "Hospital Admin", phoneRest: "902222222", password: "Hospital@123", color: "teal", icon: "ri-hospital-line" },
  { role: "Doctor", phoneRest: "901234567", password: "Doctor@123", color: "violet", icon: "ri-stethoscope-line" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  /** +998 dan keyin 9 ta raqam */
  const [phoneRest, setPhoneRest] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const digits = phoneRest.replace(/\D/g, "").slice(0, 9);
    if (digits.length < 9) {
      setError("To'liq telefon raqamini kiriting (+998 dan keyin 9 raqam)");
      return;
    }
    if (!password.trim()) {
      setError("Parolni kiriting");
      return;
    }

    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));

    const fullPhone = `${UZ_PHONE_PREFIX}${digits}`;
    const cred = MOCK_CREDENTIALS[fullPhone];
    if (!cred || cred.password !== password) {
      setError("Telefon yoki parol noto'g'ri. Demo tugmalaridan foydalaning.");
      setLoading(false);
      return;
    }

    const auditLog = {
      id: `log-${Date.now()}`,
      userId: cred.user.id,
      userName: cred.user.name,
      role: cred.user.role,
      action: "LOGIN",
      resource: "AUTH",
      detail: "Tizimga kirdi",
      ip: "192.168.1." + Math.floor(Math.random() * 255),
      userAgent: navigator.userAgent.substring(0, 80),
      timestamp: new Date().toISOString(),
      status: "success",
    };
    const existingLogs = JSON.parse(localStorage.getItem("medcore_audit_logs") || "[]");
    localStorage.setItem("medcore_audit_logs", JSON.stringify([auditLog, ...existingLogs].slice(0, 500)));

    login(cred.user);
    navigate(ROLE_REDIRECT[cred.user.role], { replace: true });
    setLoading(false);
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setPhoneRest(acc.phoneRest);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FC]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20hospital%20interior%20with%20clean%20white%20corridors%2C%20medical%20staff%20walking%2C%20soft%20natural%20light%20streaming%20through%20large%20windows%2C%20minimalist%20healthcare%20architecture%2C%20professional%20medical%20environment%2C%20light%20teal%20and%20white%20color%20palette%2C%20high%20end%20clinic%20lobby%20with%20plants%20and%20reception%20desk&width=800&height=1000&seq=login-bg-001&orientation=portrait"
          alt="Hospital"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-800/70 to-emerald-900/80"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="https://public.readdy.ai/ai/img_res/25edf702-1bdb-4dcb-86c7-fcb2c38b87e9.png"
                alt="MedCore"
                className="w-10 h-10 object-contain rounded-xl"
              />
            </div>
            <span className="text-white text-2xl font-bold tracking-wide">MedCore</span>
          </div>

          {/* Center Content */}
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Ko'p kasalxonali<br />boshqaruv tizimi
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed mb-8">
              Shifokorlar, bemorlar va kasalxonalarni bitta platformada boshqaring. Xavfsiz, tez va ishonchli.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Kasalxonalar", value: "6+", icon: "ri-hospital-line" },
                { label: "Shifokorlar", value: "200+", icon: "ri-stethoscope-line" },
                { label: "Bemorlar", value: "28K+", icon: "ri-user-heart-line" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <i className={`${stat.icon} text-emerald-300 text-xl`}></i>
                  </div>
                  <div className="text-white text-xl font-bold">{stat.value}</div>
                  <div className="text-emerald-200 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-emerald-200 text-sm">
            &copy; 2026 MedCore. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src="https://public.readdy.ai/ai/img_res/25edf702-1bdb-4dcb-86c7-fcb2c38b87e9.png"
              alt="MedCore"
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="text-gray-900 text-xl font-bold">MedCore</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Tizimga kirish</h2>
            <p className="text-gray-500 text-sm">Hisobingizga kiring va boshqaruvni boshlang</p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Demo hisoblar</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    phoneRest === acc.phoneRest
                      ? acc.color === "emerald"
                        ? "border-emerald-500 bg-emerald-50"
                        : acc.color === "teal"
                        ? "border-teal-500 bg-teal-50"
                        : "border-violet-500 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                    acc.color === "emerald" ? "bg-emerald-100" :
                    acc.color === "teal" ? "bg-teal-100" : "bg-violet-100"
                  }`}>
                    <i className={`${acc.icon} text-sm ${
                      acc.color === "emerald" ? "text-emerald-600" :
                      acc.color === "teal" ? "text-teal-600" : "text-violet-600"
                    }`}></i>
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon raqami</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                <span
                  className="shrink-0 px-3 py-2.5 bg-gray-50 text-gray-800 text-sm font-medium border-r border-gray-200 flex items-center tabular-nums"
                  aria-hidden
                >
                  {UZ_PHONE_PREFIX}
                </span>
                <div className="relative flex-1 min-w-0 flex items-center">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <i className="ri-phone-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type="tel"
                    value={phoneRest}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setPhoneRest(d);
                      setError("");
                    }}
                    placeholder="90 123 45 67"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="tel"
                    inputMode="numeric"
                    aria-label="Telefon raqami, +998 dan keyin"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Parol</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-gray-400 text-sm`}></i>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Eslab qolish</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-red-500 text-sm"></i>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base"></i>
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line text-base"></i>
                  <span>Kirish</span>
                </>
              )}
            </button>
          </form>

          {/* Role Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Rol asosida yo'naltirish</p>
            <div className="space-y-1.5">
              {[
                { role: "Super Admin", path: "/dashboard", color: "text-emerald-600" },
                { role: "Hospital Admin", path: "/hospital-admin", color: "text-teal-600" },
                { role: "Doctor", path: "/doctor/patients", color: "text-violet-600" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${r.color}`}>{r.role}</span>
                  <span className="text-xs text-gray-400 font-mono">{r.path}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; 2026 MedCore &mdash; Xavfsiz tibbiy boshqaruv tizimi
          </p>
        </div>
      </div>
    </div>
  );
}
