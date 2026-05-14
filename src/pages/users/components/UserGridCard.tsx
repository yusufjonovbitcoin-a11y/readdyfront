import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UserDto } from "@/api/types/users.types";
import type { DoctorDto } from "@/api/types/doctor.types";
import DoctorCard from "@/pages/hospital-admin/doctors/components/DoctorCard";
import { getUserRoleDisplayLabel } from "@/pages/users/utils/userRoleDisplay";

type User = UserDto;

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "—";
}

function isLikelyAvatarUrl(avatar: string): boolean {
  const t = avatar.trim();
  if (!t) return false;
  return /^https?:\/\//i.test(t) || t.startsWith("data:") || t.startsWith("/");
}

function roleBannerClass(role: string): { gradient: string; hoverBorder: string } {
  if (role === "HOSPITAL_ADMIN") {
    return { gradient: "from-blue-500 to-blue-600", hoverBorder: "hover:border-blue-300" };
  }
  if (role === "RECEPTION") {
    return { gradient: "from-orange-400 to-orange-600", hoverBorder: "hover:border-orange-300" };
  }
  if (role === "SUPER_ADMIN") {
    return { gradient: "from-purple-500 to-purple-700", hoverBorder: "hover:border-purple-300" };
  }
  return { gradient: "from-slate-500 to-slate-700", hoverBorder: "hover:border-slate-300" };
}

function formatCardDate(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === "ru" ? "ru-RU" : "uz-UZ";
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

function userToFallbackDoctorDto(u: User): DoctorDto {
  return {
    id: u.id,
    name: u.name,
    specialty: u.name,
    departmentName: "",
    hospitalName: u.hospitalName,
    phone: u.phone,
    email: u.email || "",
    avatar: u.avatar || "",
    todayPatients: 0,
    totalPatients: 0,
    weeklyAvgPatients: 0,
    rating: 0,
    status: u.status,
    joinDate: u.createdAt,
    hospitalId: u.hospitalId,
    qrCode: "",
  };
}

interface UserGridCardProps {
  user: User;
  /** `/api/doctors` dan kelgan shifokor — DoctorCard uchun */
  doctorDto?: DoctorDto;
  darkMode: boolean;
  isSavingUser: boolean;
  togglingUserIds: Set<string>;
  deletingUserId: string | null;
  onToggleStatus: (id: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserGridCard({
  user: u,
  doctorDto,
  darkMode,
  isSavingUser,
  togglingUserIds,
  deletingUserId,
  onToggleStatus,
  onEditUser,
  onDeleteUser,
}: UserGridCardProps) {
  const { t, i18n } = useTranslation("admin");
  const navigate = useNavigate();
  const displayName = u.name?.trim() || u.phone || "—";
  const avatarSrc = isLikelyAvatarUrl(u.avatar) ? u.avatar.trim() : null;
  const initials = initialsFromName(displayName);

  const statusActive = u.status === "active";
  const statusLabel = statusActive ? t("common:status.active") : t("common:status.inactive");

  if (u.role === "DOCTOR") {
    const doctor = doctorDto ?? userToFallbackDoctorDto(u);
    return (
      <DoctorCard
        doctor={doctor}
        darkMode={darkMode}
        onEdit={() => onEditUser(u)}
        onDelete={onDeleteUser}
        detailTo={(id) => `/users/doctor/${id}`}
      />
    );
  }

  const isSuper = Boolean(u.isSuperAdmin);
  const roleGradientKey = isSuper ? "SUPER_ADMIN" : u.role;
  const roleDisplayLabel = getUserRoleDisplayLabel(t, u);
  const { gradient, hoverBorder } = roleBannerClass(roleGradientKey);

  const goDetail = () => navigate(`/users/detail/${u.id}`);

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    goDetail();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex h-full min-h-0 cursor-pointer flex-col rounded-xl overflow-hidden border transition-all ${hoverBorder} ${
        darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"
      }`}
    >
      <div className={`relative h-24 sm:h-28 bg-gradient-to-br ${gradient} shrink-0 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="w-full h-full"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }}
          />
        </div>
        <div className="absolute top-2 right-2 z-10 sm:top-2.5 sm:right-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statusActive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-200"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="absolute left-3 top-1/2 z-10 w-14 h-14 -translate-y-1/2 sm:left-4 sm:w-16 sm:h-16 rounded-lg border-[2.5px] border-white shadow-md overflow-hidden ring-1 ring-black/10">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full bg-black/25 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
          )}
        </div>
        <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-4 max-w-[45%] text-right">
          <span className="text-[10px] sm:text-xs font-semibold text-white/95 drop-shadow-sm leading-tight line-clamp-2">
            {roleDisplayLabel}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-4">
        <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>{displayName}</h3>

        <div className={`min-h-0 flex-1 space-y-1.5 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p className="min-w-0 break-words">
            <span className={darkMode ? "text-gray-500" : "text-gray-400"}>{t("users.detail.fields.phone")}: </span>
            <span className={`font-medium tabular-nums ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {(u.phone ?? "").trim() || "—"}
            </span>
          </p>
          <p className="min-w-0 break-words">
            <span className={darkMode ? "text-gray-500" : "text-gray-400"}>{t("users.detail.fields.role")}: </span>
            <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{roleDisplayLabel}</span>
          </p>
          {u.email?.trim() ? (
            <p>
              <span className={darkMode ? "text-gray-500" : "text-gray-400"}>{t("users.form.emailLabel")}: </span>
              <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{u.email.trim()}</span>
            </p>
          ) : null}
          {!isSuper ? (
            <p>
              <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
                {t("users.form.hospitalLabel").replace(/\s*\*+\s*$/, "").trim()}:{" "}
              </span>
              <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{u.hospitalName?.trim() || "—"}</span>
            </p>
          ) : null}
          <p className="min-w-0 break-words">
            <span className={darkMode ? "text-gray-500" : "text-gray-400"}>{t("users.detail.fields.createdAt")}: </span>
            <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{formatCardDate(u.createdAt, i18n.language)}</span>
          </p>
          <p className="min-w-0 truncate" title={u.lastLogin}>
            <span className={darkMode ? "text-gray-500" : "text-gray-400"}>{t("users.detail.fields.lastLogin")}: </span>
            <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{formatCardDate(u.lastLogin, i18n.language)}</span>
          </p>
        </div>

        <div
          className={`flex shrink-0 gap-2 border-t pt-4 ${
            darkMode ? "border-[#30363D]" : "border-gray-100"
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleStatus(u.id)}
            disabled={togglingUserIds.has(u.id)}
            aria-label={`Toggle user status for ${displayName}`}
            title={t("users.actions.toggleStatusTitle")}
            className={`flex-1 h-9 flex items-center justify-center rounded-lg transition-colors ${
              darkMode ? "bg-blue-600/25 text-blue-200 hover:bg-blue-600/35" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            } ${togglingUserIds.has(u.id) ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <i className="ri-toggle-line text-sm" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onEditUser(u)}
            disabled={isSavingUser}
            aria-label={`Edit user ${displayName}`}
            title={t("users.actions.editTitle")}
            className={`flex-1 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              darkMode ? "bg-[#21262D] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700"
            } ${isSavingUser ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <i className="ri-edit-line text-sm" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDeleteUser(u.id)}
            disabled={Boolean(deletingUserId)}
            aria-label={`Delete user ${displayName}`}
            title={t("users.actions.deleteTitle")}
            className={`flex-1 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              darkMode ? "bg-[#21262D] text-gray-400 hover:text-red-400" : "bg-gray-100 text-gray-500 hover:text-red-500"
            } ${deletingUserId ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <i className="ri-delete-bin-line text-sm" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
