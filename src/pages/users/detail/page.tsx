import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserById } from "@/api/users";
import type { UserDto } from "@/api/types/users.types";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { getUserRoleDisplayLabel } from "@/pages/users/utils/userRoleDisplay";

type TabType = "overview" | "analytics";

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "—"
  );
}

function isLikelyAvatarUrl(avatar: string): boolean {
  const s = avatar.trim();
  if (!s) return false;
  return /^https?:\/\//i.test(s) || s.startsWith("data:") || s.startsWith("/");
}

function formatUserDetailDate(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UsersUserDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation("admin");
  const dm = useMainLayoutDarkMode();
  const [user, setUser] = useState<UserDto | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const rawTab = searchParams.get("tab");
  const activeTab: TabType = rawTab === "analytics" ? "analytics" : "overview";

  useEffect(() => {
    if (!id) {
      setUser(null);
      setError(t("users.detail.idMissing"));
      return;
    }
    let cancelled = false;
    setUser(undefined);
    setError(null);
    void (async () => {
      try {
        const u = await getUserById(id);
        if (cancelled) return;
        if (!u) {
          setUser(null);
          setError(t("users.detail.notFound"));
          return;
        }
        if (u.role === "DOCTOR") {
          navigate(`/users/doctor/${id}`, { replace: true });
          return;
        }
        setUser(u);
      } catch {
        if (!cancelled) {
          setUser(null);
          setError(t("users.detail.loadError"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, t]);

  useEffect(() => {
    if (rawTab === "overview" || rawTab === "analytics") return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", "overview");
    setSearchParams(next, { replace: true });
  }, [rawTab, searchParams, setSearchParams]);

  const handleTabChange = (next: TabType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", next);
    setSearchParams(nextParams, { replace: true });
  };

  const fakeWeek = useMemo(() => {
    const days =
      i18n.language === "ru"
        ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
        : ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
    return days.map((date) => ({ date, patients: 0 }));
  }, [i18n.language]);

  const maxPatients = Math.max(...fakeWeek.map((d) => d.patients), 1);

  const shellCard = (extra = "") =>
    `rounded-xl p-6 ${extra} ${dm ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`;

  if (user === undefined) {
    return (
      <div className="text-center py-20">
        <i className="ri-loader-4-line always-spin text-2xl text-teal-500" aria-hidden />
        <p className={`mt-3 text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("users.detail.loading")}</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-20">
        <p className={`text-sm ${dm ? "text-red-400" : "text-red-600"}`}>{error || t("users.detail.notFound")}</p>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="mt-4 text-teal-600 text-sm font-medium cursor-pointer hover:text-teal-700"
        >
          {t("users.detail.back")}
        </button>
      </div>
    );
  }

  const u = user;
  const displayName = u.name?.trim() || u.phone || "—";
  const avatarSrc = isLikelyAvatarUrl(u.avatar) ? u.avatar.trim() : null;
  const initials = initialsFromName(displayName);
  const active = u.status === "active";
  const isSuper = Boolean(u.isSuperAdmin);
  const roleDisplayLabel = getUserRoleDisplayLabel(t, u);
  const lang = i18n.language;
  const phoneDisplay = (u.phone ?? "").trim() || "—";
  const lastFmt = u.lastLogin ? formatUserDetailDate(u.lastLogin, lang) : "—";
  const createdFmt = u.createdAt ? formatUserDetailDate(u.createdAt, lang) : "—";
  const activityPct = active ? 92 : 35;
  const profilePct = u.email?.trim() ? 78 : 52;

  const personalRows: { label: string; value: string }[] = [
    { label: t("users.detail.personal.fullName"), value: displayName },
    { label: t("users.detail.fields.phone"), value: phoneDisplay },
    { label: t("users.detail.fields.role"), value: roleDisplayLabel },
  ];
  if (!isSuper) {
    personalRows.push({
      label: t("users.form.hospitalLabel").replace(/\s*\*+\s*$/, "").trim(),
      value: u.hospitalName?.trim() || "—",
    });
  }
  personalRows.push(
    { label: t("users.detail.fields.lastLogin"), value: lastFmt },
    { label: t("users.detail.fields.createdAt"), value: createdFmt },
    {
      label: t("users.detail.fields.status"),
      value: active ? t("common:status.active") : t("common:status.inactive"),
    },
  );

  const statTiles: { label: string; value: string; color: string }[] = [
    { label: t("users.detail.statTiles.role"), value: roleDisplayLabel, color: "text-indigo-600" },
    { label: t("users.detail.statTiles.contact"), value: phoneDisplay, color: "text-blue-600" },
    {
      label: t("users.detail.statTiles.accountStatus"),
      value: active ? t("common:status.active") : t("common:status.inactive"),
      color: active ? "text-emerald-600" : "text-red-600",
    },
  ];

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "overview", label: t("users.detail.tabs.overview"), icon: "ri-user-line" },
    { key: "analytics", label: t("users.detail.tabs.analytics"), icon: "ri-bar-chart-line" },
  ];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${
          dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <i className="ri-arrow-left-line text-base" aria-hidden />
        {t("users.detail.back")}
      </button>

      <div className={shellCard()}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ${
              isSuper ? "bg-purple-900/40" : "bg-teal-900/30"
            }`}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                  isSuper ? "text-purple-100" : "text-teal-200"
                }`}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-xl font-bold ${dm ? "text-white" : "text-gray-900"}`}>{displayName}</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  active
                    ? dm
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-teal-50 text-teal-700"
                    : dm
                      ? "bg-red-500/20 text-red-300"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {active ? t("common:status.active") : t("common:status.inactive")}
              </span>
            </div>
            <p
              className={`font-medium text-sm mt-0.5 ${
                isSuper ? (dm ? "text-purple-300" : "text-purple-600") : "text-teal-600"
              }`}
            >
              {roleDisplayLabel}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-phone-line text-xs ${dm ? "text-gray-400" : "text-gray-400"}`} aria-hidden />
                </div>
                <span className={`text-sm ${dm ? "text-gray-300" : "text-gray-600"}`}>{phoneDisplay}</span>
              </div>
              {u.email?.trim() ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <i className={`ri-mail-line text-xs ${dm ? "text-gray-400" : "text-gray-400"}`} aria-hidden />
                  </div>
                  <span className={`text-sm truncate ${dm ? "text-gray-300" : "text-gray-600"}`}>{u.email.trim()}</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className={`text-center px-4 py-3 rounded-xl ${dm ? "bg-[#21262D]" : "bg-gray-50"}`}>
              <p className={`text-sm font-bold leading-tight ${dm ? "text-white" : "text-gray-900"}`}>{lastFmt}</p>
              <p className={`text-xs mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("users.detail.stats.lastAccess")}</p>
            </div>
            <div className={`text-center px-4 py-3 rounded-xl ${dm ? "bg-[#21262D]" : "bg-gray-50"}`}>
              <p className={`text-sm font-bold leading-tight ${dm ? "text-white" : "text-gray-900"}`}>{createdFmt}</p>
              <p className={`text-xs mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("users.detail.stats.memberSince")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex gap-1 p-1 rounded-xl w-fit ${dm ? "bg-[#21262D]" : "bg-gray-100"}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? dm
                  ? "bg-[#21262D] text-teal-400"
                  : "bg-white text-teal-600"
                : dm
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className={`${tab.icon} text-sm`} aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={shellCard()}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>
              {t("users.detail.sectionPersonal")}
            </h3>
            <div className="space-y-3">
              {personalRows.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between gap-3 py-2 border-b last:border-0 ${
                    dm ? "border-[#30363D]" : "border-gray-50"
                  }`}
                >
                  <span className={`text-xs flex-shrink-0 ${dm ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                  <span className={`text-xs font-medium text-right min-w-0 break-words ${dm ? "text-white" : "text-gray-900"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={shellCard()}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>
              {t("users.detail.statisticsTitle")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {statTiles.map((item) => (
                <div key={item.label} className={`p-3 rounded-xl ${dm ? "bg-[#21262D]" : "bg-gray-50"}`}>
                  <p className={`text-lg font-bold truncate ${item.color}`}>{item.value}</p>
                  <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={shellCard()}>
            <h3 className={`text-sm font-semibold mb-2 ${dm ? "text-white" : "text-gray-900"}`}>
              {t("users.detail.analytics.activityTitle")}
            </h3>
            <p className={`text-xs mb-4 ${dm ? "text-gray-500" : "text-gray-400"}`}>{t("users.detail.analytics.chartHint")}</p>
            <div className="flex items-end gap-2 h-32">
              {fakeWeek.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-xs font-medium ${dm ? "text-gray-300" : "text-gray-700"}`}>{d.patients}</span>
                  <div
                    className="w-full rounded-t-md bg-teal-500"
                    style={{ height: `${(d.patients / maxPatients) * 96}px` }}
                  />
                  <span className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{d.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={shellCard()}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>
              {t("users.detail.analytics.systemTitle")}
            </h3>
            <p className={`text-sm leading-relaxed ${dm ? "text-gray-300" : "text-gray-600"}`}>
              {isSuper ? t("users.detail.analytics.systemSuper") : t("users.detail.analytics.systemHospital")}
            </p>
            <h4 className={`text-sm font-semibold mt-6 mb-3 ${dm ? "text-white" : "text-gray-900"}`}>
              {t("users.detail.analytics.metricsTitle")}
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
                    {t("users.detail.analytics.metricActivity")}
                  </span>
                  <span className={`text-xs font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{activityPct}%</span>
                </div>
                <div className={`h-2 rounded-full ${dm ? "bg-[#21262D]" : "bg-gray-100"}`}>
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${activityPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
                    {t("users.detail.analytics.metricProfile")}
                  </span>
                  <span className={`text-xs font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{profilePct}%</span>
                </div>
                <div className={`h-2 rounded-full ${dm ? "bg-[#21262D]" : "bg-gray-100"}`}>
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${profilePct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
