import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export type ChatGuruhiSidebarVariant = "emerald" | "teal" | "violet";
export type ChatGuruhiSidebarI18nNs = "admin" | "hospital" | "doctor";

const STATIC_ONLINE = 3;
const STATIC_MEMBERS = 12;
const STATIC_UNREAD = 2;

export type ChatGuruhiBadgeSummary = {
  online: number;
  members: number;
  unread: number;
};

const AVATAR_BG: Record<ChatGuruhiSidebarVariant, [string, string, string]> = {
  emerald: ["bg-rose-600", "bg-sky-600", "bg-violet-600"],
  teal: ["bg-rose-600", "bg-sky-600", "bg-violet-600"],
  violet: ["bg-violet-600", "bg-emerald-600", "bg-amber-600"],
};

const VARIANT_SHELL: Record<
  ChatGuruhiSidebarVariant,
  { dark: string; light: string; iconBg: string; dot: string; titleDark: string; titleLight: string }
> = {
  emerald: {
    dark: "bg-[#21262D] border border-[#30363D]",
    light: "bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm",
    iconBg: "bg-emerald-600",
    dot: "bg-emerald-500",
    titleDark: "text-gray-200",
    titleLight: "text-gray-900",
  },
  teal: {
    dark: "bg-[#21262D] border border-[#30363D]",
    light: "bg-white border border-gray-100 hover:border-teal-200 hover:shadow-sm",
    iconBg: "bg-teal-600",
    dot: "bg-teal-500",
    titleDark: "text-gray-200",
    titleLight: "text-gray-900",
  },
  violet: {
    dark: "bg-[#161B22] border border-[#1C2333]",
    light: "bg-white border border-gray-100 hover:border-violet-200 hover:shadow-sm",
    iconBg: "bg-violet-600",
    dot: "bg-emerald-500",
    titleDark: "text-white",
    titleLight: "text-gray-900",
  },
};

export interface ChatGuruhiSidebarCardProps {
  variant: ChatGuruhiSidebarVariant;
  i18nNamespace: ChatGuruhiSidebarI18nNs;
  darkMode: boolean;
  showExpanded: boolean;
  borderTopClassName?: string;
  /** No outer border/padding — parent supplies section chrome (e.g. DocSidebar footer stack). */
  embedded?: boolean;
  /** Super admin: navigate to mock chat page */
  linkTo?: string;
  onNavigate?: () => void;
  /** Live counts from API; falls back to static demo numbers */
  badgeSummary?: ChatGuruhiBadgeSummary | null;
}

export function ChatGuruhiSidebarCard({
  variant,
  i18nNamespace,
  darkMode,
  showExpanded,
  borderTopClassName = "border-[#30363D]",
  embedded = false,
  linkTo,
  onNavigate,
  badgeSummary,
}: ChatGuruhiSidebarCardProps) {
  const { t } = useTranslation(i18nNamespace);
  const location = useLocation();
  const shell = VARIANT_SHELL[variant];
  const avatarBgs = AVATAR_BG[variant];
  const ringBorder = darkMode ? (variant === "violet" ? "border-[#0D1117]" : "border-[#21262D]") : "border-white";
  const online = badgeSummary?.online ?? STATIC_ONLINE;
  const members = badgeSummary?.members ?? STATIC_MEMBERS;
  const unread = badgeSummary?.unread ?? STATIC_UNREAD;
  const subtitle = t("sidebar.chatGuruhiSubtitle", {
    online,
    members,
  });

  const borderLight = "border-gray-100";
  const topBorder = darkMode ? (variant === "violet" ? "border-[#1C2333]" : borderTopClassName) : borderLight;

  const isActive = Boolean(linkTo && location.pathname.startsWith(linkTo));
  const activeShell =
    linkTo && isActive
      ? darkMode
        ? "bg-emerald-900/30 border border-emerald-500/30"
        : "bg-emerald-50 border border-emerald-200"
      : null;

  const baseShell = darkMode ? shell.dark : shell.light;
  const shellClass = activeShell ?? baseShell;
  const cursorClass = linkTo ? "cursor-pointer" : "cursor-default";
  const label = t("sidebar.chatGuruhi");

  const innerClass = `block rounded-xl p-2.5 transition-all ${cursorClass} select-none no-underline outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${shellClass}`;

  const body = showExpanded ? (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div className="flex -space-x-1.5">
          <div
            className={`relative z-30 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold border-2 ${ringBorder} ${avatarBgs[0]}`}
          >
            AK
          </div>
          <div
            className={`relative z-20 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold border-2 ${ringBorder} ${avatarBgs[1]}`}
          >
            RT
          </div>
          <div
            className={`relative z-10 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold border-2 ${ringBorder} ${avatarBgs[2]}`}
          >
            BS
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className={`text-sm font-semibold truncate ${darkMode ? shell.titleDark : shell.titleLight}`}>{label}</p>
          {unread > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${shell.dot}`} />
          <span className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</span>
        </div>
      </div>
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <i className={`ri-arrow-right-s-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className={`w-8 h-8 rounded-lg ${shell.iconBg} flex items-center justify-center`}>
          <i className="ri-chat-3-line text-white text-xs" aria-hidden />
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full">
            {unread}
          </span>
        )}
      </div>
    </div>
  );

  const inner = linkTo ? (
    <Link to={linkTo} prefetch="none" onClick={onNavigate} className={innerClass} aria-label={label}>
      {body}
    </Link>
  ) : (
    <div className={innerClass} aria-label={label}>
      {body}
    </div>
  );

  if (embedded) {
    return inner;
  }

  return <div className={`px-3 py-1.5 border-t ${topBorder}`}>{inner}</div>;
}
