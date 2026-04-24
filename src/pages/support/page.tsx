import { useState, useRef, useEffect } from "react";
import { mockSupportTickets, type SupportTicket, type SupportMessage } from "@/mocks/support";
import { useAnyDarkMode } from "@/context/useAnyDarkMode";
import { readSupportTicketsState, writeSupportTicketsState } from "@/lib/supportUnread";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  open: { label: "Ochiq", color: "text-sky-600 bg-sky-50 border-sky-100", dot: "bg-sky-500" },
  in_progress: { label: "Jarayonda", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  resolved: { label: "Hal qilindi", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  closed: { label: "Yopildi", color: "text-gray-500 bg-gray-100 border-gray-200", dot: "bg-gray-400" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Past", color: "text-gray-500 bg-gray-100" },
  medium: { label: "O'rta", color: "text-amber-600 bg-amber-50" },
  high: { label: "Yuqori", color: "text-orange-600 bg-orange-50" },
  urgent: { label: "Shoshilinch", color: "text-red-600 bg-red-50" },
};

const categoryLabels: Record<string, string> = {
  technical: "Texnik",
  billing: "To'lov",
  access: "Kirish",
  feature: "Funksiya",
  bug: "Xato",
  other: "Boshqa",
};

const roleConfig: Record<string, { label: string; color: string }> = {
  hospital_admin: { label: "Hospital Admin", color: "text-teal-600 bg-teal-50" },
  doctor: { label: "Shifokor", color: "text-violet-600 bg-violet-50" },
};

const fallbackStatus = { label: "Noma'lum", color: "text-gray-500 bg-gray-100 border-gray-200", dot: "bg-gray-400" };
const fallbackPriority = { label: "Noma'lum", color: "text-gray-500 bg-gray-100" };
const fallbackRole = { label: "Foydalanuvchi", color: "text-gray-600 bg-gray-100" };

export function SupportPageContent() {
  const darkMode = useAnyDarkMode();
  const { user, role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [tickets, setTickets] = useState<SupportTicket[]>(() => readSupportTicketsState());
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = tickets.reduce((acc, t) => acc + t.unreadByAdmin, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [activeTicket]);

  useEffect(() => {
    writeSupportTicketsState(tickets);
  }, [tickets]);

  useEffect(() => {
    if (!user || isSuperAdmin) return;
    const roleForChat = user.role === "DOCTOR" ? "doctor" : "hospital_admin";
    const existing = tickets.find((ticket) => ticket.id === `chat-${user.id}`);
    if (existing) {
      setActiveTicket(existing);
      return;
    }
    const personalTicket: SupportTicket = {
      id: `chat-${user.id}`,
      subject: "Super Admin bilan chat",
      fromRole: roleForChat,
      fromName: user.name,
      fromAvatar: user.avatar,
      fromHospital: user.hospitalName ?? "Noma'lum klinika",
      status: "open",
      priority: "medium",
      category: "other",
      unreadByAdmin: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setTickets((prev) => [...prev, personalTicket]);
    setActiveTicket(personalTicket);
  }, [isSuperAdmin, tickets, user]);

  const filtered = tickets.filter((t) => {
    const statusMatch = statusFilter === "all" || t.status === statusFilter;
    const roleMatch = roleFilter === "all" || t.fromRole === roleFilter;
    const searchMatch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.fromName.toLowerCase().includes(search.toLowerCase());
    return statusMatch && roleMatch && searchMatch;
  });

  const openTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, unreadByAdmin: 0 } : t
      )
    );
  };

  const sendReply = () => {
    if (!reply.trim() || !activeTicket) return;
    const senderRole: SupportMessage["senderRole"] = isSuperAdmin
      ? "super_admin"
      : user?.role === "DOCTOR"
        ? "doctor"
        : "hospital_admin";
    const msg: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId: activeTicket.id,
      senderRole,
      senderName: isSuperAdmin ? "Super Admin" : (user?.name ?? "User"),
      senderAvatar: isSuperAdmin ? "SA" : (user?.avatar ?? "U"),
      content: reply.trim(),
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      date: "2026-04-24",
      read: false,
    };
    const updated = tickets.map((t) =>
      t.id === activeTicket.id
        ? {
            ...t,
            messages: [...t.messages, msg],
            status: "in_progress" as const,
            updatedAt: new Date().toISOString(),
            unreadByAdmin: isSuperAdmin ? t.unreadByAdmin : t.unreadByAdmin + 1,
          }
        : t
    );
    setTickets(updated);
    setActiveTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, msg], status: "in_progress" } : prev
    );
    setReply("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const changeStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    setActiveTicket((prev) => prev && prev.id === ticketId ? { ...prev, status } : prev);
  };

  const userChatTicket = !isSuperAdmin && user
    ? tickets.find((ticket) => ticket.id === `chat-${user.id}`) ?? activeTicket
    : null;

  if (!isSuperAdmin) {
    return (
      <div className={`flex h-[calc(100vh-4rem)] w-full overflow-hidden ${darkMode ? "bg-[#0F1117]" : "bg-white"}`}>
        {userChatTicket ? (
          <div className={`h-full flex-1 flex flex-col min-w-0 ${darkMode ? "bg-[#0F1117]" : ""}`}>
            <div className={`px-6 py-4 border-b flex items-center gap-4 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-emerald-500">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-base font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>Super Admin bilan chat</h2>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Xabarlaringiz to'g'ridan-to'g'ri Super Adminga yuboriladi
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              style={{ background: darkMode ? "linear-gradient(180deg, #0F1117 0%, #121826 100%)" : "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)" }}
            >
              {userChatTicket.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Chatni boshlash uchun birinchi xabarni yuboring
                  </p>
                </div>
              ) : (
                userChatTicket.messages.map((msg, idx) => {
                  const isCurrentUser = msg.senderRole !== "super_admin";
                  const showDate = idx === 0 || userChatTicket.messages[idx - 1].date !== msg.date;
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-xs text-gray-400 px-2">{msg.date}</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      )}
                      <div className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isCurrentUser ? "bg-violet-500" : "bg-emerald-500"}`}>
                          {isCurrentUser ? (user?.avatar ?? "U") : "SA"}
                        </div>
                        <div className={`max-w-[65%] flex flex-col gap-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                          <span className="text-xs text-gray-400 px-1">{msg.senderName}</span>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isCurrentUser
                              ? "bg-violet-500 text-white rounded-tr-sm"
                              : darkMode
                                ? "bg-[#121826] border border-[#273041] text-gray-200 rounded-tl-sm"
                                : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`px-6 py-4 border-t ${darkMode ? "border-[#1E2130] bg-[#121826]" : "border-gray-100 bg-white"}`}>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
                    rows={2}
                    className={`w-full text-sm px-4 py-3 border rounded-2xl outline-none resize-none ${
                      darkMode
                        ? "bg-[#0F1117] border-[#273041] focus:border-[#334155] text-gray-200 placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 focus:border-gray-300 text-gray-800 placeholder-gray-400"
                    }`}
                  />
                  <p className={`text-[10px] text-right mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{reply.length}/500</p>
                </div>
                <button
                  onClick={sendReply}
                  disabled={!reply.trim()}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 mb-5 ${
                    reply.trim()
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : darkMode
                        ? "bg-[#1A2235] text-gray-600"
                        : "bg-gray-100 text-gray-300"
                  }`}
                >
                  <i className="ri-send-plane-fill text-base" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Chat yuklanmoqda...</p>
          </div>
        )}
      </div>
    );
  }

  return (
      <div className={`flex h-[calc(100vh-4rem)] w-full overflow-hidden ${darkMode ? "bg-[#0F1117]" : "bg-white"}`}>
        <div className={`h-full w-80 flex-shrink-0 border-r flex flex-col ${darkMode ? "bg-[#121826] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className={`px-4 pt-5 pb-3 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Support Inbox</h1>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{tickets.length} ta murojaat</p>
              </div>
              {totalUnread > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
                  {totalUnread} yangi
                </span>
              )}
            </div>
            <div className="relative mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className={`w-full pl-3 pr-3 py-2 text-sm border rounded-xl outline-none ${
                  darkMode
                    ? "bg-[#0F1117] border-[#273041] focus:border-[#334155] text-gray-200 placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 focus:border-gray-300 text-gray-700 placeholder-gray-400"
                }`}
              />
            </div>
            <div className="flex gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`flex-1 text-xs border rounded-lg px-2 py-1.5 cursor-pointer ${
                  darkMode ? "border-[#273041] text-gray-300 bg-[#0F1117]" : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                <option value="all">Barcha holat</option>
                <option value="open">Ochiq</option>
                <option value="in_progress">Jarayonda</option>
                <option value="resolved">Hal qilindi</option>
                <option value="closed">Yopildi</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`flex-1 text-xs border rounded-lg px-2 py-1.5 cursor-pointer ${
                  darkMode ? "border-[#273041] text-gray-300 bg-[#0F1117]" : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                <option value="all">Barcha rol</option>
                <option value="hospital_admin">Hospital Admin</option>
                <option value="doctor">Shifokor</option>
              </select>
            </div>
          </div>

          <div className={`grid grid-cols-3 gap-0 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            {[
              { label: "Ochiq", value: tickets.filter((t) => t.status === "open").length, color: "text-sky-600" },
              { label: "Jarayonda", value: tickets.filter((t) => t.status === "in_progress").length, color: "text-amber-600" },
              { label: "Hal qilindi", value: tickets.filter((t) => t.status === "resolved").length, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className={`py-2.5 text-center border-r last:border-r-0 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <i className="ri-inbox-line text-3xl text-gray-200 block mb-2" />
                <p className="text-sm text-gray-400">Murojaat topilmadi</p>
              </div>
            ) : (
              filtered.map((ticket) => {
                const isActive = activeTicket?.id === ticket.id;
                const safeMessages = Array.isArray(ticket.messages) ? ticket.messages : [];
                const lastMsg = safeMessages[safeMessages.length - 1];
                const sc = statusConfig[ticket.status] ?? fallbackStatus;
                const rc = roleConfig[ticket.fromRole] ?? fallbackRole;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className={`w-full text-left px-4 py-3.5 border-b transition-all cursor-pointer ${
                      darkMode ? "border-[#1E2130]" : "border-gray-50"
                    } ${
                      isActive
                        ? darkMode
                          ? "bg-emerald-500/10 border-l-2 border-l-emerald-400"
                          : "bg-emerald-50 border-l-2 border-l-emerald-500"
                        : darkMode
                          ? "hover:bg-[#1A2235]"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        ticket.fromRole === "hospital_admin" ? "bg-teal-500" : "bg-violet-500"
                      }`}>
                        {ticket.fromAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-sm font-semibold truncate ${
                            darkMode
                              ? "text-white"
                              : isActive
                                ? "text-emerald-700"
                                : "text-gray-800"
                          }`}>
                            {ticket.fromName}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {ticket.unreadByAdmin > 0 && (
                              <span className="w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                                {ticket.unreadByAdmin}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs font-medium truncate mb-1 ${
                          darkMode
                            ? "text-gray-200"
                            : isActive
                              ? "text-emerald-600"
                              : "text-gray-600"
                        }`}>
                          {ticket.subject}
                        </p>
                        <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{lastMsg?.content ?? ""}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${sc.color}`}>
                            {sc.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rc.color}`}>
                            {rc.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {activeTicket ? (
          <div className={`h-full flex-1 flex flex-col min-w-0 ${darkMode ? "bg-[#0F1117]" : ""}`}>
            <div className={`px-6 py-4 border-b flex items-center gap-4 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                activeTicket.fromRole === "hospital_admin" ? "bg-teal-500" : "bg-violet-500"
              }`}>
                {activeTicket.fromAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-base font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{activeTicket.subject}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${(statusConfig[activeTicket.status] ?? fallbackStatus).color}`}>
                    {(statusConfig[activeTicket.status] ?? fallbackStatus).label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(priorityConfig[activeTicket.priority] ?? fallbackPriority).color}`}>
                    {(priorityConfig[activeTicket.priority] ?? fallbackPriority).label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <span className="font-medium">{activeTicket.fromName}</span>
                    {" · "}{activeTicket.fromHospital}
                  </p>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <i className="ri-time-line mr-0.5" />
                    {new Date(activeTicket.createdAt).toLocaleDateString("uz-UZ")}
                  </span>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <i className="ri-folder-line mr-0.5" />
                    {categoryLabels[activeTicket.category] ?? "Boshqa"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={activeTicket.status}
                  onChange={(e) => changeStatus(activeTicket.id, e.target.value as SupportTicket["status"])}
                  className={`text-xs border rounded-lg px-2.5 py-1.5 cursor-pointer ${
                    darkMode ? "border-[#273041] text-gray-300 bg-[#121826]" : "border-gray-200 text-gray-600 bg-white"
                  }`}
                >
                  <option value="open">Ochiq</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="resolved">Hal qilindi</option>
                  <option value="closed">Yopildi</option>
                </select>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              style={{ background: darkMode ? "linear-gradient(180deg, #0F1117 0%, #121826 100%)" : "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)" }}
            >
              {(Array.isArray(activeTicket.messages) ? activeTicket.messages : []).map((msg, idx) => {
                const isAdmin = msg.senderRole === "super_admin";
                const prev = (Array.isArray(activeTicket.messages) ? activeTicket.messages : [])[idx - 1];
                const showDate = idx === 0 || prev?.date !== msg.date;
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 px-2">{msg.date}</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                    <div className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isAdmin ? "bg-emerald-500" : msg.senderRole === "hospital_admin" ? "bg-teal-500" : "bg-violet-500"
                      }`}>
                        {msg.senderAvatar}
                      </div>
                      <div className={`max-w-[65%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-400 px-1">{msg.senderName}</span>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isAdmin
                            ? "bg-emerald-500 text-white rounded-tr-sm"
                            : darkMode
                              ? "bg-[#121826] border border-[#273041] text-gray-200 rounded-tl-sm"
                              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {activeTicket.status !== "closed" && activeTicket.status !== "resolved" ? (
              <div className={`px-6 py-4 border-t ${darkMode ? "border-[#1E2130] bg-[#121826]" : "border-gray-100 bg-white"}`}>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value.slice(0, 500))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      placeholder="Javob yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
                      rows={2}
                      className={`w-full text-sm px-4 py-3 border rounded-2xl outline-none resize-none ${
                        darkMode
                          ? "bg-[#0F1117] border-[#273041] focus:border-[#334155] text-gray-200 placeholder-gray-500"
                          : "bg-gray-50 border-gray-200 focus:border-gray-300 text-gray-800 placeholder-gray-400"
                      }`}
                    />
                    <p className={`text-[10px] text-right mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{reply.length}/500</p>
                  </div>
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 mb-5 ${
                      reply.trim()
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : darkMode
                          ? "bg-[#1A2235] text-gray-600"
                          : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    <i className="ri-send-plane-fill text-base" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`px-6 py-4 border-t text-center ${darkMode ? "border-[#1E2130] bg-[#121826]" : "border-gray-100 bg-gray-50"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
                  <i className="ri-lock-line mr-1" />
                  Bu murojaat {(statusConfig[activeTicket.status] ?? fallbackStatus).label.toLowerCase()} — javob yozib bo'lmaydi
                </p>
                <button
                  onClick={() => changeStatus(activeTicket.id, "in_progress")}
                  className={`mt-2 text-xs font-medium cursor-pointer ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"}`}
                >
                  Qayta ochish
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
            <div className="text-center">
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4 border ${
                darkMode ? "bg-[#121826] border-[#273041]" : "bg-white border-gray-100"
              }`}>
                <i className={`ri-customer-service-2-line text-2xl ${darkMode ? "text-gray-500" : "text-gray-300"}`} />
              </div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}>Murojaat tanlang</p>
            </div>
          </div>
        )}
      </div>
  );
}

export default function SupportPage() {
  return <SupportPageContent />;
}
