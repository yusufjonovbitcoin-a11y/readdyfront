import { useState, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import loginBgImage from "@/assets/login-bg.jpg";
import medcoreLogoImage from "@/assets/medcore-logo.png";

/** +998 dan keyingi 9 raqam (masalan 901111111) */
const UZ_PHONE_PREFIX = "+998";

const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard",
  HOSPITAL_ADMIN: "/hospital-admin",
  DOCTOR: "/doctor/patients",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate } = useAuth();
  const { t } = useTranslation(["auth", "common"]);

  /** +998 dan keyin 9 ta raqam */
  const [phoneRest, setPhoneRest] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const getRoleSafeRedirect = (role: UserRole, intendedPath?: string) => {
    if (!intendedPath) return ROLE_REDIRECT[role];
    const rolePrefixes: Record<UserRole, string[]> = {
      SUPER_ADMIN: ["/dashboard", "/home", "/hospitals", "/analytics", "/users", "/audit-logs", "/settings"],
      HOSPITAL_ADMIN: ["/hospital-admin"],
      DOCTOR: ["/doctor"],
    };
    const isAllowed = rolePrefixes[role].some((prefix) => intendedPath.startsWith(prefix));
    return isAllowed ? intendedPath : ROLE_REDIRECT[role];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const digits = phoneRest.replace(/\D/g, "").slice(0, 9);
    if (digits.length < 9) {
      setError(t("auth:login.errors.phoneRequired"));
      return;
    }
    if (!password.trim()) {
      setError(t("auth:login.errors.passwordRequired"));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${UZ_PHONE_PREFIX}${digits}`;
      const user = await authenticate({
        phone: fullPhone,
        password,
        rememberMe,
      });
      const intendedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(getRoleSafeRedirect(user.role, intendedPath), { replace: true });
    } catch {
      setError(t("auth:login.errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FC]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={loginBgImage}
          alt={t("auth:login.leftPanel.title")}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-800/70 to-emerald-900/80"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={medcoreLogoImage}
                alt={t("auth:login.leftPanel.title")}
                className="w-10 h-10 object-contain rounded-xl"
              />
            </div>
            <span className="text-white text-2xl font-bold tracking-wide">MedCore</span>
          </div>

          {/* Center Content */}
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              {t("auth:login.leftPanel.title")}
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed mb-8">
              {t("auth:login.leftPanel.description")}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t("auth:login.leftPanel.hospitals"), value: "6+", icon: "ri-hospital-line" },
                { label: t("auth:login.leftPanel.doctors"), value: "200+", icon: "ri-stethoscope-line" },
                { label: t("auth:login.leftPanel.patients"), value: "28K+", icon: "ri-user-heart-line" },
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
            &copy; 2026 MedCore. {t("auth:login.leftPanel.copyright")}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <LanguageSwitcher />
          </div>
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src={medcoreLogoImage}
              alt={t("auth:login.leftPanel.title")}
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="text-gray-900 text-xl font-bold">MedCore</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("auth:login.title")}</h2>
            <p className="text-gray-500 text-sm">{t("auth:login.subtitle")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Telefon */}
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-gray-700 mb-1.5">{t("auth:login.phoneLabel")}</label>
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
                    id="login-phone"
                    type="tel"
                    value={phoneRest}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setPhoneRest(d);
                      setError("");
                    }}
                    placeholder={t("auth:login.phonePlaceholder")}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="tel"
                    inputMode="numeric"
                    aria-label={t("auth:login.phoneAria")}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">{t("auth:login.passwordLabel")}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-sm"></i>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder={t("auth:login.passwordPlaceholder")}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? t("auth:login.hidePassword") : t("auth:login.showPassword")}
                >
                  <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-gray-400 text-sm`} aria-hidden="true"></i>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center">
              <label htmlFor="login-remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{t("auth:login.rememberMe")}</span>
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
                  <span>{t("auth:login.checking")}</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line text-base"></i>
                  <span>{t("auth:login.submit")}</span>
                </>
              )}
            </button>
          </form>

          {/* Role Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{t("auth:login.roleRouting")}</p>
            <div className="space-y-1.5">
              {[
                { role: t("auth:login.roles.superAdmin"), path: "/dashboard", color: "text-emerald-600" },
                { role: t("auth:login.roles.hospitalAdmin"), path: "/hospital-admin", color: "text-teal-600" },
                { role: t("auth:login.roles.doctor"), path: "/doctor/patients", color: "text-violet-600" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${r.color}`}>{r.role}</span>
                  <span className="text-xs text-gray-400 font-mono">{r.path}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; 2026 MedCore &mdash; {t("auth:login.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
