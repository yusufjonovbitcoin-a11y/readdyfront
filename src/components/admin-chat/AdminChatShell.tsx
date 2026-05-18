import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import {
  statusColors,
  statusLabels,
  type AdminChatGroup,
  type AdminGroupMember,
  type AdminGroupMessage,
} from "@/mocks/adminChatGroups";
import { formatChatTime } from "@/lib/departmentChatUi";
import {
  getPeerMessageAvatarClass,
  getSpecialtyBadgeClass,
  getSpecialtyColorClass,
  getSpecialtyIcon,
  normalizeSpecialtyKey,
} from "@/lib/chatSpecialtyUi";
import { superAdminDark as sa } from "@/styles/superAdminTheme";

function ChatBubble({
  msg,
  isMe,
  darkMode,
  showAvatar,
  roomSpecialty,
}: {
  msg: AdminGroupMessage;
  isMe: boolean;
  darkMode: boolean;
  showAvatar: boolean;
  roomSpecialty: string;
}) {
  const peerAvatar = getPeerMessageAvatarClass(msg.senderId, isMe, roomSpecialty);
  return (
    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        <div
          className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${peerAvatar}`}
        >
          {msg.senderAvatar}
        </div>
      )}
      {!showAvatar && <div className="w-9 flex-shrink-0" />}
      <div className={`flex max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className="mb-0.5 flex items-center gap-1.5 px-1">
            <span className={`text-[11px] font-semibold ${darkMode ? sa.textSecondary : "text-gray-700"}`}>{msg.senderName}</span>
            <span className={`text-[10px] ${darkMode ? sa.textMuted : "text-gray-400"}`}>{msg.senderHospital}</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMe
              ? darkMode
                ? "rounded-tr-sm bg-emerald-600 text-white"
                : "rounded-tr-sm bg-emerald-600 text-white shadow-sm"
              : darkMode
                ? sa.messagePeer
                : "rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`mt-0.5 px-1 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          {msg.time}
          {isMe && <i className={`ri-check-double-line ml-1 ${msg.read ? "text-emerald-400" : ""}`} />}
        </span>
      </div>
    </div>
  );
}

interface HospitalData {
  hospitalId: string;
  hospitalName: string;
  groups: AdminChatGroup[];
  totalUnread: number;
  totalOnline: number;
  totalMembers: number;
}

export interface AdminChatShellProps {
  darkMode: boolean;
  selfMember: AdminGroupMember;
  /** Snapshot used when `groupsSyncKey` changes */
  seedGroups: AdminChatGroup[];
  /** Change to replace local state from `seedGroups` (e.g. after API load) */
  groupsSyncKey: string;
  /** Bo'lim filter: "Barchasi" + these names */
  departmentFilterOptions: string[];
  /** Left panel header title */
  leftHeaderTitle: string;
  /** `<select id=…>` — must be unique per page */
  deptFilterInputId: string;
  /** Load messages when user selects a department room (API mode) */
  fetchMessagesForGroup?: (groupId: string) => Promise<AdminGroupMessage[]>;
  /** Post message via API; return message row for UI */
  submitMessageToGroup?: (groupId: string, body: string) => Promise<AdminGroupMessage>;
  /** After messages load (e.g. mark-read on server) */
  onRoomOpened?: (groupId: string) => void | Promise<void>;
  /** Load roster when opening the members side panel (API mode) */
  fetchMembersForGroup?: (groupId: string) => Promise<AdminGroupMember[]>;
}

function cloneGroups(source: AdminChatGroup[]): AdminChatGroup[] {
  return source.map((g) => ({
    ...g,
    messages: g.messages.map((m) => ({ ...m })),
    members: g.members.map((m) => ({ ...m })),
  }));
}

function rosterSize(g: AdminChatGroup): number {
  return g.rosterCount ?? g.members.length;
}

function onlineSize(g: AdminChatGroup): number {
  return g.onlineCountOverride ?? g.members.filter((m) => m.status === "online").length;
}

export function AdminChatShell({
  darkMode,
  selfMember,
  seedGroups,
  groupsSyncKey,
  departmentFilterOptions,
  leftHeaderTitle,
  deptFilterInputId,
  fetchMessagesForGroup,
  submitMessageToGroup,
  onRoomOpened,
  fetchMembersForGroup,
}: AdminChatShellProps) {
  const [groups, setGroups] = useState<AdminChatGroup[]>(() => cloneGroups(seedGroups));
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => seedGroups[0]?.id ?? "");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("Barchasi");
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    seedGroups.forEach((g) => {
      if (g.unreadCount > 0) initial.add(g.hospitalId);
    });
    if (seedGroups.length && initial.size === 0) initial.add(seedGroups[0]!.hospitalId);
    return initial;
  });

  useEffect(() => {
    const next = cloneGroups(seedGroups);
    setGroups(next);
    setSelectedGroupId((prev) => (next.some((g) => g.id === prev) ? prev : (next[0]?.id ?? "")));
    setExpandedHospitals(() => {
      const initial = new Set<string>();
      next.forEach((g) => {
        if (g.unreadCount > 0) initial.add(g.hospitalId);
      });
      if (next.length && initial.size === 0) initial.add(next[0]!.hospitalId);
      return initial;
    });
  }, [groupsSyncKey, seedGroups]);

  useEffect(() => {
    if (!fetchMessagesForGroup || !selectedGroupId) return;
    let cancelled = false;
    void (async () => {
      try {
        const msgs = await fetchMessagesForGroup(selectedGroupId);
        if (cancelled) return;
        setGroups((prev) =>
          prev.map((g) => (g.id === selectedGroupId ? { ...g, messages: msgs, unreadCount: 0 } : g)),
        );
        void Promise.resolve(onRoomOpened?.(selectedGroupId)).catch(() => undefined);
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGroupId, fetchMessagesForGroup, groupsSyncKey, onRoomOpened]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const uniqueDepartmentOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const dept of departmentFilterOptions) {
      const key = dept.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(key);
    }
    return result.sort((a, b) => normalizeSpecialtyKey(a).localeCompare(normalizeSpecialtyKey(b), "uz"));
  }, [departmentFilterOptions]);

  const hospitalsData = useMemo<HospitalData[]>(() => {
    const map = new Map<string, HospitalData>();
    groups.forEach((group) => {
      if (!map.has(group.hospitalId)) {
        map.set(group.hospitalId, {
          hospitalId: group.hospitalId,
          hospitalName: group.hospitalName,
          groups: [],
          totalUnread: 0,
          totalOnline: 0,
          totalMembers: 0,
        });
      }
      const hd = map.get(group.hospitalId)!;
      hd.groups.push(group);
      hd.totalUnread += group.unreadCount;
      hd.totalOnline += onlineSize(group);
      hd.totalMembers += rosterSize(group);
    });
    return Array.from(map.values()).sort((a, b) => b.totalUnread - a.totalUnread);
  }, [groups]);

  const filteredHospitals = useMemo(() => {
    let filtered = hospitalsData.map((h) => ({ ...h }));

    if (filterDept !== "Barchasi") {
      filtered = filtered
        .map((h) => ({
          ...h,
          groups: h.groups.filter((g) => g.specialty === filterDept),
        }))
        .filter((h) => h.groups.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered
        .map((h) => ({
          ...h,
          groups: h.groups.filter(
            (g) => g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q),
          ),
        }))
        .filter((h) => h.groups.length > 0);
    }

    filtered = filtered.map((h) => ({
      ...h,
      totalUnread: h.groups.reduce((acc, g) => acc + g.unreadCount, 0),
      totalOnline: h.groups.reduce((acc, g) => acc + onlineSize(g), 0),
      totalMembers: h.groups.reduce((acc, g) => acc + rosterSize(g), 0),
    }));

    return filtered;
  }, [hospitalsData, filterDept, searchQuery]);

  const totalUnread = groups.reduce((acc, g) => acc + g.unreadCount, 0);

  const leftSubtitle = useMemo(
    () => `${hospitalsData.length} ta kasalxona · ${totalUnread} ta o'qilmagan`,
    [hospitalsData.length, totalUnread],
  );

  useEffect(() => {
    if (!showMembers || !fetchMembersForGroup || !selectedGroupId) return;
    let cancelled = false;
    void (async () => {
      try {
        const mem = await fetchMembersForGroup(selectedGroupId);
        if (cancelled) return;
        setGroups((prev) => prev.map((g) => (g.id === selectedGroupId ? { ...g, members: mem } : g)));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showMembers, selectedGroupId, fetchMembersForGroup]);

  const toggleHospital = (hospitalId: string) => {
    setExpandedHospitals((prev) => {
      const next = new Set(prev);
      if (next.has(hospitalId)) next.delete(hospitalId);
      else next.add(hospitalId);
      return next;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages.length]);

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedGroup) return;
    const text = messageText.trim();

    if (submitMessageToGroup) {
      try {
        const newMsg = await submitMessageToGroup(selectedGroupId, text);
        setGroups((prev) =>
          prev.map((g) => (g.id === selectedGroupId ? { ...g, messages: [...g.messages, newMsg], unreadCount: 0 } : g)),
        );
        setMessageText("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch {
        /* keep draft */
      }
      return;
    }

    const newMsg: AdminGroupMessage = {
      id: `msg-${Date.now()}`,
      senderId: selfMember.id,
      senderName: selfMember.name,
      senderAvatar: selfMember.avatar,
      senderHospital: selfMember.hospitalName,
      content: text,
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0]!,
      read: false,
    };

    setGroups((prev) =>
      prev.map((g) => (g.id === selectedGroupId ? { ...g, messages: [...g.messages, newMsg], unreadCount: 0 } : g)),
    );

    setMessageText("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const isMe = (senderId: string) => senderId === selfMember.id;

  if (!selectedGroup && groups.length === 0) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Guruhlar topilmadi</p>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Guruhni tanlang</p>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-0 w-full max-w-full flex-1 overflow-hidden rounded-xl border ${
        darkMode ? `${sa.border} ${sa.surface}` : "border-gray-100 bg-white"
      }`}
    >
      <div
        className={`flex w-[360px] flex-shrink-0 flex-col border-r ${
          darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"
        }`}
      >
        <div className={`border-b p-4 ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <i className="ri-chat-3-line text-sm text-white" />
              </div>
              <div>
                <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{leftHeaderTitle}</h2>
                <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{leftSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
              <i className={`ri-search-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <input
              type="text"
              placeholder="Guruh yoki bo'lim qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg py-2 pl-9 pr-8 text-sm outline-none transition-colors ${
                darkMode ? sa.input : "border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-emerald-300"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center"
              >
                <i className={`ri-close-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              </button>
            )}
          </div>

          <div className="relative">
            <label htmlFor={deptFilterInputId} className="sr-only">
              Bo&apos;lim filtri
            </label>
            <div className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
              <i className={`ri-filter-3-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
            </div>
            <select
              id={deptFilterInputId}
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className={`w-full cursor-pointer appearance-none rounded-lg py-2 pl-9 pr-9 text-sm outline-none transition-colors ${
                darkMode
                  ? `${sa.input} [&>option]:bg-[#21262D] [&>option]:text-white`
                  : "border border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-300"
              }`}
            >
              <option value="Barchasi">Barchasi bo&apos;limlar</option>
              {uniqueDepartmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {normalizeSpecialtyKey(dept)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
              <i className={`ri-arrow-down-s-line text-base ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredHospitals.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredHospitals.map((hospital) => {
                const isExpanded = expandedHospitals.has(hospital.hospitalId);
                const hasUnread = hospital.totalUnread > 0;
                return (
                  <div
                    key={hospital.hospitalId}
                    className={`overflow-hidden rounded-xl transition-all ${
                      isExpanded ? (darkMode ? "bg-[#30363D]/25" : "bg-gray-50/80") : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleHospital(hospital.hospitalId)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-all ${
                        isExpanded
                          ? darkMode
                            ? "bg-[#30363D]/40"
                            : "bg-emerald-50/60"
                          : darkMode
                            ? "hover:bg-[#30363D]/30"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${
                            hasUnread ? "bg-emerald-600" : "bg-gray-500"
                          }`}
                        >
                          <i className="ri-hospital-line" />
                        </div>
                        {hasUnread && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                            {hospital.totalUnread > 9 ? "9+" : hospital.totalUnread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{hospital.hospitalName}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{hospital.groups.length} guruh</span>
                          <span className="text-[10px] text-gray-400">·</span>
                          <span className={`flex items-center gap-1 text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            {hospital.totalOnline} onlayn
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        {hasUnread && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                            {hospital.totalUnread} yangi
                          </span>
                        )}
                        <i
                          className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          } ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-0.5 px-2 pb-2">
                        {hospital.groups.map((group) => {
                          const isActive = group.id === selectedGroupId;
                          const lastMsg = group.messages[group.messages.length - 1];
                          const previewContent = lastMsg?.content ?? group.lastMessagePreview ?? null;
                          const previewTime =
                            lastMsg?.time ?? (group.lastMessageAt ? formatChatTime(group.lastMessageAt) : undefined);
                          const onlineCount = onlineSize(group);
                          return (
                            <button
                              type="button"
                              key={group.id}
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setShowMembers(false);
                                setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, unreadCount: 0 } : g)));
                              }}
                              className={`w-full cursor-pointer rounded-lg p-2.5 text-left transition-all ${
                                isActive
                                  ? darkMode
                                    ? "border border-emerald-500/30 bg-emerald-900/20"
                                    : "border border-emerald-200 bg-emerald-50"
                                  : darkMode
                                    ? "hover:bg-[#30363D]/40"
                                    : "hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="relative flex-shrink-0">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white ${getSpecialtyColorClass(group.specialty)}`}
                                  >
                                    <i className={`ri-${getSpecialtyIcon(group.specialty)}-line`} />
                                  </div>
                                  {group.unreadCount > 0 && !isActive && (
                                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                                      {group.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className={`truncate text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                      {normalizeSpecialtyKey(group.specialty)}
                                    </p>
                                    <span className={`rounded-full px-1 py-0.5 text-[9px] ${getSpecialtyBadgeClass(group.specialty)}`}>
                                      {rosterSize(group)} a&apos;zo
                                    </span>
                                  </div>
                                  {previewContent && (
                                    <p className={`mt-0.5 truncate text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      {lastMsg ? (
                                        <>
                                          <span className="font-medium">{lastMsg.senderName.split(" ")[1]}:</span> {previewContent}
                                        </>
                                      ) : (
                                        previewContent
                                      )}
                                    </p>
                                  )}
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className={`flex items-center gap-1 text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                      {onlineCount} onlayn
                                    </span>
                                    {previewTime && (
                                      <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>{previewTime}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${darkMode ? sa.inset : "bg-gray-100"}`}>
                <i className={`ri-chat-off-line text-xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              </div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Guruhlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${darkMode ? sa.page : "bg-white"}`}>
        <div
          className={`flex items-center gap-3 border-b px-5 py-3.5 ${
            darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"
          }`}
        >
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${getSpecialtyColorClass(selectedGroup.specialty)}`}
          >
            <i className={`ri-${getSpecialtyIcon(selectedGroup.specialty)}-line`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`truncate text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup.name}</h2>
              <span
                className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${getSpecialtyBadgeClass(selectedGroup.specialty)}`}
              >
                {normalizeSpecialtyKey(selectedGroup.specialty)}
              </span>
            </div>
            <p className={`truncate text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {selectedGroup.hospitalName} · {rosterSize(selectedGroup)} a&apos;zo · {onlineSize(selectedGroup)} onlayn
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMembers(!showMembers)}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              darkMode ? `text-gray-400 ${sa.hover}` : "text-gray-500 hover:bg-gray-100"
            } ${showMembers ? (darkMode ? `${sa.hoverActive} text-white` : "bg-gray-100 text-gray-900") : ""}`}
            aria-expanded={showMembers}
            aria-label="Guruh a'zolari"
          >
            <i className="ri-group-line text-sm" />
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 ${
            darkMode ? sa.page : "bg-gradient-to-b from-gray-50 to-white"
          }`}
        >
          <div className="flex flex-col items-center py-4">
            <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? sa.inset : "bg-emerald-50"}`}>
              <i
                className={`ri-${getSpecialtyIcon(selectedGroup.specialty)}-line text-2xl ${
                  darkMode ? "text-emerald-400" : "text-emerald-500"
                }`}
              />
            </div>
            <p className={`mb-1 text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup.name}</p>
            <p className={`mb-2 max-w-md text-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedGroup.description}</p>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${darkMode ? `${sa.inset} text-gray-300` : "bg-gray-100 text-gray-600"}`}
              >
                {rosterSize(selectedGroup)} a&apos;zo
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500">
                {onlineSize(selectedGroup)} onlayn
              </span>
            </div>
          </div>

          <div className="my-2 flex items-center gap-3">
            <div className={`h-px flex-1 ${darkMode ? sa.divider : "bg-gray-200"}`} />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${darkMode ? `${sa.inset} text-gray-500` : "bg-gray-100 text-gray-400"}`}
            >
              Bugun
            </span>
            <div className={`h-px flex-1 ${darkMode ? sa.divider : "bg-gray-200"}`} />
          </div>

          {selectedGroup.messages.map((msg, idx) => {
            const me = isMe(msg.senderId);
            const prevMsg = selectedGroup.messages[idx - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            return (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isMe={me}
                darkMode={darkMode}
                showAvatar={showAvatar}
                roomSpecialty={selectedGroup.specialty}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className={`border-t px-5 py-4 ${darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"}`}>
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing..."
                rows={1}
                className={`w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                  darkMode ? sa.input : "border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-emerald-300"
                }`}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <p className={`absolute bottom-1 right-3 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
                {messageText.length}/500
              </p>
            </div>
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!messageText.trim()}
              className={`flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
                messageText.trim()
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : darkMode
                    ? `${sa.inset} text-gray-500`
                    : "bg-gray-100 text-gray-300"
              }`}
            >
              <i className="ri-send-plane-fill text-base" />
            </button>
          </div>
        </div>
      </div>

      {showMembers && selectedGroup && (
        <div
          className={`flex w-72 flex-shrink-0 flex-col border-l ${
            darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"
          }`}
        >
          <div className={`border-b px-4 py-3.5 ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Guruh a&apos;zolari</h3>
            <p className={`mt-0.5 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {rosterSize(selectedGroup)} ta shifokor
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            {selectedGroup.members.length > 0 ? (
              selectedGroup.members.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-2.5 ${darkMode ? sa.hover : "hover:bg-gray-50"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white ${getSpecialtyColorClass(m.specialty)}`}
                    >
                      {m.avatar}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                        darkMode ? "border-[#21262D]" : "border-white"
                      } ${statusColors[m.status] ?? "bg-gray-400"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{m.name}</p>
                    <p className={`truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{m.experience} yil tajriba</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
                      m.status === "online"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : m.status === "busy"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {statusLabels[m.status] ?? m.status}
                  </span>
                </div>
              ))
            ) : rosterSize(selectedGroup) > 0 ? (
              <div className={`px-4 py-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Yuklanmoqda…</div>
            ) : (
              <p className={`px-4 py-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>A&apos;zolar ro&apos;yxati bo&apos;sh</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

