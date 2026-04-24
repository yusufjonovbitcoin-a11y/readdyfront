import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockNotifications, type Notification } from "@/mocks/notifications";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { useAuth } from "@/hooks/useAuth";

const NOTIFICATIONS_STORAGE_KEY = "medcore_notifications_v1";

const typeConfig = {
  info: { bg: "bg-sky-50", icon: "ri-information-line", iconColor: "text-sky-500", border: "border-sky-100" },
  warning: { bg: "bg-amber-50", icon: "ri-alert-line", iconColor: "text-amber-500", border: "border-amber-100" },
  success: { bg: "bg-emerald-50", icon: "ri-checkbox-circle-line", iconColor: "text-emerald-500", border: "border-emerald-100" },
  error: { bg: "bg-red-50", icon: "ri-error-warning-line", iconColor: "text-red-500", border: "border-red-100" },
  system: { bg: "bg-gray-50", icon: "ri-settings-3-line", iconColor: "text-gray-500", border: "border-gray-100" },
};

const priorityConfig = {
  low: { label: "Past", color: "text-gray-500 bg-gray-100", dot: "bg-gray-400" },
  medium: { label: "O'rta", color: "text-amber-600 bg-amber-50", dot: "bg-amber-400" },
  high: { label: "Yuqori", color: "text-orange-600 bg-orange-50", dot: "bg-orange-400" },
  critical: { label: "Kritik", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
};

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  patient: { label: "Bemor", icon: "ri-user-heart-line", color: "text-rose-500 bg-rose-50" },
  doctor: { label: "Shifokor", icon: "ri-stethoscope-line", color: "text-violet-500 bg-violet-50" },
  hospital: { label: "Kasalxona", icon: "ri-hospital-line", color: "text-teal-500 bg-teal-50" },
  system: { label: "Tizim", icon: "ri-server-line", color: "text-gray-500 bg-gray-100" },
  security: { label: "Xavfsizlik", icon: "ri-shield-line", color: "text-red-500 bg-red-50" },
  appointment: { label: "Navbat", icon: "ri-calendar-check-line", color: "text-sky-500 bg-sky-50" },
};

export function SuperAdminNotificationsPageContent() {
  const dm = useMainLayoutDarkMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return mockNotifications;
    try {
      const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!raw) return mockNotifications;
      const parsed = JSON.parse(raw) as Notification[];
      return Array.isArray(parsed) ? parsed : mockNotifications;
    } catch {
      return mockNotifications;
    }
  });
  const persistNotifications = (next: Notification[]) => {
    setNotifications(next);
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeType, setComposeType] = useState<Notification["type"]>("info");
  const [composePriority, setComposePriority] = useState<Notification["priority"]>("high");
  const [composeCategory, setComposeCategory] = useState<Notification["category"]>("system");

  const sendBroadcastMessage = () => {
    if (user?.role !== "SUPER_ADMIN") return;
    if (!composeTitle.trim() || !composeMessage.trim()) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const date = now.toISOString().slice(0, 10);
    const time = `${hh}:${mm}`;

    const targets: Array<"hospital_admin" | "doctor"> = ["hospital_admin", "doctor"];
    const created: Notification[] = targets.map((target, index) => ({
      id: `n-broadcast-${now.getTime()}-${target}-${index}`,
      role: target,
      senderRole: "super_admin",
      senderName: user.name || "Super Admin",
      type: composeType,
      priority: composePriority,
      category: composeCategory,
      title: composeTitle.trim(),
      message: composeMessage.trim(),
      date,
      time,
      read: false,
    }));

    persistNotifications([...created, ...notifications]);
    setComposeTitle("");
    setComposeMessage("");
    setComposeType("info");
    setComposePriority("high");
    setComposeCategory("system");
    setComposerOpen(false);
  };

  const scopedNotifications = useMemo(() => {
    if (!user) return [];

    if (user.role === "SUPER_ADMIN") return notifications;

    if (user.role === "HOSPITAL_ADMIN") {
      return notifications.filter(
        (n) =>
          n.senderRole === "super_admin" ||
          (Boolean(user.hospitalId) && n.hospitalId === user.hospitalId),
      );
    }

    return notifications.filter(
      (n) =>
        n.senderRole === "super_admin" ||
        (n.senderRole === "hospital_admin" &&
          (!user.hospitalId || !n.hospitalId || n.hospitalId === user.hospitalId)),
    );
  }, [notifications, user]);

  const filtered = useMemo(
    () =>
      scopedNotifications.filter((n) => {
        const readMatch = filter === "all" || (filter === "unread" ? !n.read : n.read);
        const typeMatch = typeFilter === "all" || n.type === typeFilter;
        const priorityMatch = priorityFilter === "all" || n.priority === priorityFilter;
        return readMatch && typeMatch && priorityMatch;
      }),
    [scopedNotifications, filter, typeFilter, priorityFilter],
  );

  const unreadCount = scopedNotifications.filter((n) => !n.read).length;
  const criticalCount = scopedNotifications.filter((n) => n.priority === "critical").length;
  const todayCount = scopedNotifications.filter((n) => n.date === "2026-04-24").length;

  const markAllRead = () => {
    persistNotifications(notifications.map((n) => ({ ...n, read: true })));
  };
  const markRead = (id: string) => {
    persistNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const deleteNotif = (id: string) => {
    persistNotifications(notifications.filter((n) => n.id !== id));
  };

  const renderCard = (n: Notification) => {
    const tc = typeConfig[n.type];
    const pc = priorityConfig[n.priority];
    const cc = categoryConfig[n.category];
    return (
      <div
        key={n.id}
        onClick={() => markRead(n.id)}
        className={`relative group flex gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          n.read
            ? dm
              ? "bg-[#121826] border-[#273041] hover:border-[#334155]"
              : "bg-white border-gray-100 hover:border-gray-200"
            : `${tc.bg} ${tc.border} hover:border-opacity-80`
        }`}
      >
        <div className={`w-11 h-11 flex items-center justify-center rounded-2xl flex-shrink-0 ${tc.bg} border ${tc.border}`}>
          <i className={`${tc.icon} text-lg ${tc.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${n.read ? (dm ? "text-gray-200" : "text-gray-700") : "text-gray-900"}`}>{n.title}</span>
              {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
            </div>
            <span className={`text-xs whitespace-nowrap flex-shrink-0 font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>{n.time}</span>
          </div>

          <p className={`text-sm leading-relaxed mb-3 ${dm ? "text-gray-400" : "text-gray-500"}`}>{n.message}</p>
          <p className={`text-xs mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>Yuborgan: {n.senderName}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${cc.color}`}>
              <i className={`${cc.icon} text-xs`} />
              {cc.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${pc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
              {pc.label}
            </span>
            {n.actionLabel && n.actionPath ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(n.actionPath!);
                }}
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {n.actionLabel}
                <i className="ri-arrow-right-line text-xs" />
              </button>
            ) : null}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotif(n.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 cursor-pointer"
        >
          <i className="ri-delete-bin-line text-sm" />
        </button>
      </div>
    );
  };

  return (
    <div
      className={`h-[calc(100vh-4rem)] w-full overflow-y-auto ${dm ? "bg-[#0F1117]" : ""}`}
      style={dm ? undefined : { background: "linear-gradient(135deg, #f0fdf4 0%, #f9fafb 50%, #f0f9ff 100%)" }}
    >
      <div className="w-full py-8 px-6">
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500 rounded-2xl">
              <i className="ri-notification-3-line text-white text-lg" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${dm ? "text-white" : "text-gray-900"}`}>Bildirishnomalar</h1>
              <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
                {user?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : user?.role === "HOSPITAL_ADMIN"
                    ? "Hospital Admin"
                    : "Doctor"}{" "}
                · MedCore tizimi
              </p>
            </div>
          </div>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2 rounded-xl hover:bg-emerald-50 border border-emerald-100 transition-all cursor-pointer whitespace-nowrap">
              <i className="ri-check-double-line" />
              Hammasini o'qilgan deb belgilash
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Jami", value: scopedNotifications.length, icon: "ri-notification-3-line", bg: dm ? "bg-[#121826]" : "bg-white", iconBg: dm ? "bg-[#1A2235]" : "bg-gray-50", iconColor: dm ? "text-gray-300" : "text-gray-600", valueColor: dm ? "text-white" : "text-gray-900" },
            { label: "O'qilmagan", value: unreadCount, icon: "ri-mail-unread-line", bg: "bg-emerald-500", iconBg: "bg-emerald-400", iconColor: "text-white", valueColor: "text-white", labelColor: "text-emerald-100" },
            { label: "Kritik", value: criticalCount, icon: "ri-error-warning-line", bg: dm ? "bg-[#121826]" : "bg-white", iconBg: "bg-red-50", iconColor: "text-red-500", valueColor: "text-red-600" },
            { label: "Bugun", value: todayCount, icon: "ri-calendar-line", bg: dm ? "bg-[#121826]" : "bg-white", iconBg: "bg-sky-50", iconColor: "text-sky-500", valueColor: "text-sky-600" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border ${dm ? "border-[#273041]" : "border-gray-100"} p-4 text-center`}>
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2 ${s.iconBg}`}>
                <i className={`${s.icon} text-base ${s.iconColor}`} />
              </div>
              <p className={`text-2xl font-bold ${s.valueColor}`}>{s.value}</p>
              <p className={`text-xs mt-0.5 ${(s as { labelColor?: string }).labelColor || (dm ? "text-gray-500" : "text-gray-400")}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={`flex flex-wrap gap-2 mb-6 p-3 rounded-2xl border ${dm ? "bg-[#121826] border-[#273041]" : "bg-white border-gray-100"}`}>
          <div className={`${dm ? "bg-[#1A2235]" : "bg-gray-100"} flex rounded-xl p-1`}>
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filter === f ? (dm ? "bg-[#0F1117] text-white" : "bg-white text-gray-900") : (dm ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
                }`}
              >
                {f === "all" ? "Barchasi" : f === "unread" ? "O'qilmagan" : "O'qilgan"}
              </button>
            ))}
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`text-sm border rounded-xl px-3 py-1.5 cursor-pointer ${dm ? "border-[#273041] text-gray-300 bg-[#0F1117]" : "border-gray-200 text-gray-600 bg-white"}`}>
            <option value="all">Barcha turlar</option>
            <option value="info">Ma'lumot</option>
            <option value="warning">Ogohlantirish</option>
            <option value="success">Muvaffaqiyat</option>
            <option value="error">Xato</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`text-sm border rounded-xl px-3 py-1.5 cursor-pointer ${dm ? "border-[#273041] text-gray-300 bg-[#0F1117]" : "border-gray-200 text-gray-600 bg-white"}`}>
            <option value="all">Barcha ustuvorlik</option>
            <option value="critical">Kritik</option>
            <option value="high">Yuqori</option>
            <option value="medium">O'rta</option>
            <option value="low">Past</option>
          </select>
          {user?.role === "SUPER_ADMIN" ? (
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className={`inline-flex items-center gap-1 justify-center h-9 px-3 rounded-xl border transition-colors cursor-pointer text-sm font-medium ${
                dm
                  ? "border-[#273041] bg-[#0F1117] text-emerald-400 hover:bg-[#1A2235]"
                  : "border-gray-200 bg-white text-emerald-600 hover:bg-emerald-50"
              }`}
              title="Barcha admin va shifokorlarga xabar yuborish"
              aria-label="Barcha admin va shifokorlarga xabar yuborish"
            >
              <i className="ri-send-plane-2-line text-sm" />
              Xabar jo'natish
            </button>
          ) : null}
          <div className={`ml-auto flex items-center gap-1 text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
            <i className="ri-filter-3-line" />
            {filtered.length} ta natija
          </div>
        </div>
        {composerOpen && user?.role === "SUPER_ADMIN" ? (
          <div className={`mb-6 rounded-2xl border p-4 ${dm ? "bg-[#121826] border-[#273041]" : "bg-white border-gray-100"}`}>
            <div className="grid grid-cols-1 gap-3">
              <input
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
                placeholder="Xabar sarlavhasi"
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                  dm ? "bg-[#0F1117] border-[#273041] text-gray-200" : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              <textarea
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Xabar matni"
                rows={3}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${
                  dm ? "bg-[#0F1117] border-[#273041] text-gray-200" : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value as Notification["category"])}
                  className={`w-full px-3 py-2 rounded-xl border text-sm cursor-pointer ${dm ? "bg-[#0F1117] border-[#273041] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}
                >
                  <option value="system">Tizim</option>
                  <option value="security">Xavfsizlik</option>
                  <option value="hospital">Kasalxona</option>
                  <option value="doctor">Shifokor</option>
                  <option value="patient">Bemor</option>
                  <option value="appointment">Navbat</option>
                </select>
                <select
                  value={composePriority}
                  onChange={(e) => setComposePriority(e.target.value as Notification["priority"])}
                  className={`w-full px-3 py-2 rounded-xl border text-sm cursor-pointer ${dm ? "bg-[#0F1117] border-[#273041] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}
                >
                  <option value="critical">Kritik</option>
                  <option value="high">Yuqori</option>
                  <option value="medium">O'rta</option>
                  <option value="low">Past</option>
                </select>
                <select
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value as Notification["type"])}
                  className={`w-full px-3 py-2 rounded-xl border text-sm cursor-pointer ${dm ? "bg-[#0F1117] border-[#273041] text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}
                >
                  <option value="info">Ma'lumot</option>
                  <option value="warning">Ogohlantirish</option>
                  <option value="success">Muvaffaqiyat</option>
                  <option value="error">Xato</option>
                  <option value="system">Tizim</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={sendBroadcastMessage}
                  disabled={!composeTitle.trim() || !composeMessage.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                  Yuborish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposerOpen(false);
                    setComposeTitle("");
                    setComposeMessage("");
                    setComposeType("info");
                    setComposePriority("high");
                    setComposeCategory("system");
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${dm ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border ${dm ? "bg-[#121826] border-[#273041]" : "bg-white border-gray-100"}`}>
            <div className={`w-20 h-20 flex items-center justify-center rounded-3xl mx-auto mb-4 ${dm ? "bg-[#1A2235]" : "bg-gray-50"}`}>
              <i className={`ri-notification-off-line text-3xl ${dm ? "text-gray-600" : "text-gray-200"}`} />
            </div>
            <p className={dm ? "text-gray-300 font-medium" : "text-gray-500 font-medium"}>Bildirishnomalar topilmadi</p>
            <p className={`text-sm mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Filtrlarni o'zgartiring yoki barchasi ko'rsatilsin</p>
          </div>
        ) : (
          <div className="space-y-3">{filtered.map(renderCard)}</div>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminNotificationsPage() {
  return <SuperAdminNotificationsPageContent />;
}

