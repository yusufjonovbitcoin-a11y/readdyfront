import { useState, useRef, useEffect, useMemo, useCallback, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  getDepartmentChatRoomMembers,
  getDepartmentChatRoomMessages,
  getHospitalDepartmentChatRooms,
  postDepartmentChatRoomMarkRead,
  postDepartmentChatRoomMessage,
} from "@/api/adapters/departmentChat.http";
import type { AdminChatGroup, AdminGroupMessage } from "@/mocks/adminChatGroups";
import { statusColors, statusLabels } from "@/mocks/adminChatGroups";
import {
  departmentChatMessageToAdminMessage,
  departmentMembersToAdminMembers,
  formatChatTime,
  roomSummaryToAdminChatGroup,
} from "@/lib/departmentChatUi";
import {
  chatSenderUserId,
  getPeerMessageAvatarClass,
  getSpecialtyBadgeClass,
  getSpecialtyColorClass,
  getSpecialtyIcon,
  normalizeSpecialtyKey,
} from "@/lib/chatSpecialtyUi";
import { hospitalAdminDark as ha } from "@/styles/hospitalAdminTheme";

const FALLBACK_ADMIN = {
  id: "ha-admin",
  name: "Aziz Rahimov",
  avatar: "AR",
  hospitalId: "1",
  hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KA";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "KA";
}

function currentAdminFromUser(user: AuthUser) {
  const raw = user.avatar?.trim() ?? "";
  const avatar =
    raw && !raw.startsWith("http") && raw.length <= 4 ? raw.toUpperCase() : initialsFromName(user.name);
  return {
    id: chatSenderUserId(user),
    name: user.name,
    avatar,
    hospitalId: user.hospitalId?.trim() || FALLBACK_ADMIN.hospitalId,
    hospitalName: user.hospitalName?.trim() || FALLBACK_ADMIN.hospitalName,
  };
}

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
  const avatarClass = isMe ? "bg-teal-600" : getPeerMessageAvatarClass(msg.senderId, false, roomSpecialty);
  return (
    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        <div
          className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${avatarClass}`}
        >
          {msg.senderAvatar}
        </div>
      )}
      {!showAvatar && <div className="w-9 flex-shrink-0" />}
      <div className={`flex max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className="mb-0.5 flex items-center gap-1.5 px-1">
            <span className={`text-[11px] font-semibold ${darkMode ? ha.textSecondary : "text-gray-700"}`}>
              {msg.senderName}
            </span>
            <span className={`text-[10px] ${darkMode ? ha.textMuted : "text-gray-400"}`}>{msg.senderHospital}</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMe
              ? "rounded-tr-sm bg-teal-600 text-white shadow-sm"
              : darkMode
                ? ha.messagePeer
                : "rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`mt-0.5 px-1 text-[10px] ${darkMode ? ha.textMuted : "text-gray-400"}`}>
          {msg.time}
          {isMe && <i className={`ri-check-double-line ml-1 ${msg.read ? "text-teal-400" : ""}`} />}
        </span>
      </div>
    </div>
  );
}

export default function HospitalAdminChatPage() {
  const { t } = useTranslation("hospital");
  const darkMode = useHospitalAdminDarkMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentAdmin = useMemo(
    () => (user?.role === "HOSPITAL_ADMIN" ? currentAdminFromUser(user) : FALLBACK_ADMIN),
    [user],
  );

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["hospital-admin-department-chat-rooms"],
    queryFn: getHospitalDepartmentChatRooms,
    enabled: user?.role === "HOSPITAL_ADMIN",
  });

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedGroupId && rooms.length > 0) {
      setSelectedGroupId(rooms[0]!.id);
    }
  }, [rooms, selectedGroupId]);

  const { data: members = [] } = useQuery({
    queryKey: ["hospital-admin-chat-members", selectedGroupId],
    queryFn: () => getDepartmentChatRoomMembers(selectedGroupId),
    enabled: Boolean(selectedGroupId) && user?.role === "HOSPITAL_ADMIN",
  });

  const { data: messagesPage, isLoading: messagesLoading } = useQuery({
    queryKey: ["hospital-admin-chat-messages", selectedGroupId],
    queryFn: () => getDepartmentChatRoomMessages(selectedGroupId),
    enabled: Boolean(selectedGroupId) && user?.role === "HOSPITAL_ADMIN",
  });

  useEffect(() => {
    if (!selectedGroupId) return;
    void postDepartmentChatRoomMarkRead(selectedGroupId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["hospital-admin-department-chat-rooms"] });
    });
  }, [selectedGroupId, queryClient]);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === selectedGroupId), [rooms, selectedGroupId]);

  const selectedGroup: AdminChatGroup | null = useMemo(() => {
    if (!selectedRoom) return null;
    const msgs = (messagesPage?.messages ?? []).map(departmentChatMessageToAdminMessage);
    const mem = departmentMembersToAdminMembers(selectedRoom, members);
    return roomSummaryToAdminChatGroup(selectedRoom, msgs, mem);
  }, [selectedRoom, messagesPage, members]);

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => r.name.toLowerCase().includes(q) || r.specialtyLabel.toLowerCase().includes(q));
  }, [rooms, searchQuery]);

  const totalUnread = rooms.reduce((acc, r) => acc + r.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages.length]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => postDepartmentChatRoomMessage(selectedGroupId, body),
    onSuccess: () => {
      setMessageText("");
      void queryClient.invalidateQueries({ queryKey: ["hospital-admin-chat-messages", selectedGroupId] });
      void queryClient.invalidateQueries({ queryKey: ["hospital-admin-department-chat-rooms"] });
      globalThis.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
  });

  const sendMessage = useCallback(() => {
    const text = messageText.trim();
    if (!text || !selectedGroupId || sendMutation.isPending) return;
    sendMutation.mutate(text);
  }, [messageText, selectedGroupId, sendMutation]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMe = (senderId: string) => senderId === currentAdmin.id;

  if (user?.role === "HOSPITAL_ADMIN" && !roomsLoading && rooms.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className={`text-sm font-medium ${darkMode ? ha.textSecondary : "text-gray-800"}`}>Chat guruhlari yo&apos;q</p>
        <p className={`max-w-sm text-xs ${darkMode ? ha.textMuted : "text-gray-500"}`}>
          Bu kasalxonada bo&apos;limlar ro&apos;yxati bo&apos;sh yoki API javob bermadi.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${darkMode ? ha.page : "bg-[#F5F7FA]"}`}>
      {/* Left — groups */}
      <div
        className={`flex h-full w-80 flex-shrink-0 flex-col border-r ${
          darkMode ? `${ha.borderR} ${ha.surface}` : "border-gray-100 bg-white"
        }`}
      >
        <div className={`border-b p-4 ${darkMode ? ha.borderB : "border-gray-100"}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <i className="ri-chat-3-line text-sm text-white" />
              </div>
              <div>
                <h2 className={`text-sm font-bold ${darkMode ? ha.textPrimary : "text-gray-900"}`}>{t("sidebar.chatGuruhi")}</h2>
                <p className={`text-[11px] ${darkMode ? ha.textSecondary : "text-gray-500"}`}>
                  {rooms.length} ta guruh · {totalUnread} ta o&apos;qilmagan
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
              <i className={`ri-search-line text-sm ${darkMode ? ha.textMuted : "text-gray-400"}`} />
            </div>
            <input
              type="text"
              placeholder="Guruh qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg py-2 pl-9 pr-8 text-sm outline-none transition-colors ${
                darkMode ? ha.input : "border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-teal-300"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center"
              >
                <i className={`ri-close-line text-xs ${darkMode ? ha.textMuted : "text-gray-400"}`} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <p className={`p-4 text-center text-xs ${darkMode ? ha.textMuted : "text-gray-500"}`}>Yuklanmoqda…</p>
          ) : filteredRooms.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredRooms.map((room) => {
                const isActive = room.id === selectedGroupId;
                const preview = room.lastMessagePreview;
                const previewTime = room.lastMessageAt ? formatChatTime(room.lastMessageAt) : undefined;
                return (
                  <button
                    type="button"
                    key={room.id}
                    onClick={() => {
                      setSelectedGroupId(room.id);
                      setShowMembers(false);
                    }}
                    className={`w-full cursor-pointer rounded-xl p-3 text-left transition-all ${
                      isActive
                        ? darkMode
                          ? ha.groupActive
                          : "border border-teal-200 bg-teal-50"
                        : darkMode
                          ? ha.hover
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${getSpecialtyColorClass(room.specialtyLabel)}`}
                        >
                          <i className={`ri-${getSpecialtyIcon(room.specialtyLabel)}-line text-sm`} />
                        </div>
                        {room.unreadCount > 0 && !isActive && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${darkMode ? ha.textPrimary : "text-gray-900"}`}>
                          {room.name}
                        </p>
                        <p className={`mt-0.5 truncate text-[11px] ${darkMode ? ha.textMuted : "text-gray-400"}`}>
                          {room.hospitalName}
                        </p>
                        {preview && (
                          <p className={`mt-1 truncate text-xs ${darkMode ? ha.textSecondary : "text-gray-500"}`}>
                            {preview}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${getSpecialtyBadgeClass(room.specialtyLabel)}`}>
                            {normalizeSpecialtyKey(room.specialtyLabel)}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] ${darkMode ? ha.textMuted : "text-gray-400"}`}>
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            {room.memberCount} a&apos;zo
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
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${darkMode ? ha.iconWell : "bg-gray-100"}`}>
                <i className={`ri-chat-off-line text-xl ${darkMode ? ha.textMuted : "text-gray-400"}`} />
              </div>
              <p className={`text-sm ${darkMode ? ha.textSecondary : "text-gray-500"}`}>Guruhlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Right — chat */}
      <div className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${darkMode ? ha.page : "bg-white"}`}>
        {selectedGroup ? (
          <>
            <div
              className={`flex items-center gap-3 border-b px-5 py-3.5 ${
                darkMode ? `${ha.borderB} ${ha.surface}` : "border-gray-100 bg-white"
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${getSpecialtyColorClass(selectedGroup.specialty)}`}
              >
                <i className={`ri-${getSpecialtyIcon(selectedGroup.specialty)}-line`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className={`truncate text-sm font-bold ${darkMode ? ha.textPrimary : "text-gray-900"}`}>
                    {selectedGroup.name}
                  </h2>
                  <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${getSpecialtyBadgeClass(selectedGroup.specialty)}`}>
                    {normalizeSpecialtyKey(selectedGroup.specialty)}
                  </span>
                </div>
                <p className={`truncate text-xs ${darkMode ? ha.textSecondary : "text-gray-500"}`}>
                  {selectedGroup.hospitalName} · {selectedGroup.rosterCount ?? selectedGroup.members.length} a&apos;zo ·{" "}
                  {selectedGroup.onlineCountOverride ?? 0} onlayn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMembers(!showMembers)}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  darkMode ? `text-gray-400 ${ha.hover}` : "text-gray-500 hover:bg-gray-100"
                } ${showMembers ? (darkMode ? `${ha.hoverActive} text-white` : "bg-gray-100 text-gray-900") : ""}`}
                aria-expanded={showMembers}
                aria-label="Guruh a'zolari"
              >
                <i className="ri-group-line text-sm" />
              </button>
            </div>

            <div
              className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 ${
                darkMode ? ha.page : "bg-gradient-to-b from-gray-50 to-white"
              }`}
            >
              <div className="flex flex-col items-center py-4">
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? ha.iconWell : "bg-teal-50"}`}>
                  <i className={`ri-chat-smile-2-line text-2xl ${darkMode ? "text-teal-400" : "text-teal-500"}`} />
                </div>
                <p className={`mb-1 text-sm font-bold ${darkMode ? ha.textPrimary : "text-gray-900"}`}>{selectedGroup.name}</p>
                <p className={`mb-2 max-w-md text-center text-xs ${darkMode ? ha.textSecondary : "text-gray-500"}`}>
                  {selectedGroup.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${darkMode ? `${ha.iconWell} text-gray-300` : "bg-gray-100 text-gray-600"}`}>
                    {selectedGroup.rosterCount ?? selectedGroup.members.length} a&apos;zo
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500">
                    {selectedGroup.onlineCountOverride ?? 0} onlayn
                  </span>
                </div>
              </div>

              <div className="my-2 flex items-center gap-3">
                <div className={`h-px flex-1 ${darkMode ? ha.divider : "bg-gray-200"}`} />
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${darkMode ? `${ha.iconWell} text-gray-500` : "bg-gray-100 text-gray-400"}`}>
                  Bugun
                </span>
                <div className={`h-px flex-1 ${darkMode ? ha.divider : "bg-gray-200"}`} />
              </div>

              {messagesLoading && (
                <p className={`text-center text-xs ${darkMode ? ha.textMuted : "text-gray-500"}`}>Xabarlar yuklanmoqda…</p>
              )}

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

            <div className={`border-t px-5 py-4 ${darkMode ? `${ha.borderT} ${ha.surface}` : "border-gray-100 bg-white"}`}>
              <div className="flex items-end gap-3">
                <div className="relative flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                    onKeyDown={handleKeyDown}
                    placeholder="Xabar yozing..."
                    rows={1}
                    className={`w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                      darkMode ? ha.input : "border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-teal-300"
                    }`}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <p className={`absolute bottom-1 right-3 text-[10px] ${darkMode ? ha.textMuted : "text-gray-300"}`}>
                    {messageText.length}/500
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className={`flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
                    messageText.trim() && !sendMutation.isPending
                      ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                      : darkMode
                        ? `${ha.iconWell} text-gray-600`
                        : "bg-gray-100 text-gray-300"
                  }`}
                >
                  <i className="ri-send-plane-fill text-base" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex flex-1 flex-col items-center justify-center ${darkMode ? ha.textMuted : "text-gray-400"}`}>
            <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${darkMode ? ha.hoverActive : "bg-gray-100"}`}>
              <i className="ri-chat-3-line text-2xl" />
            </div>
            <p className={`text-sm font-medium ${darkMode ? ha.textSecondary : "text-gray-700"}`}>Guruh tanlang</p>
            <p className={`mt-1 text-xs ${darkMode ? ha.textMuted : "text-gray-500"}`}>Chatni boshlash uchun guruhni tanlang</p>
          </div>
        )}

        {showMembers && selectedGroup && (
          <div
            className={`absolute right-0 top-0 z-20 flex h-full w-72 flex-col border-l shadow-xl ${
              darkMode ? `${ha.borderL} ${ha.surface}` : "border-gray-100 bg-white"
            }`}
          >
            <div className={`border-b px-4 py-3.5 ${darkMode ? ha.borderB : "border-gray-100"}`}>
              <h3 className={`text-sm font-bold ${darkMode ? ha.textPrimary : "text-gray-900"}`}>Guruh a&apos;zolari</h3>
              <p className={`mt-0.5 text-xs ${darkMode ? ha.textMuted : "text-gray-500"}`}>
                {selectedGroup.members.length} ta shifokor
              </p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {selectedGroup.members.length > 0 ? (
                selectedGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 px-4 py-2.5 ${darkMode ? ha.hover : "hover:bg-gray-50"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white ${getSpecialtyColorClass(member.specialty)}`}
                      >
                        {member.avatar}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                          darkMode ? "border-[#21262D]" : "border-white"
                        } ${statusColors[member.status] ?? "bg-gray-400"}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{member.name}</p>
                      <p className={`truncate text-xs ${darkMode ? ha.textMuted : "text-gray-400"}`}>
                        {member.experience} yil tajriba
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
                        member.status === "online"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : member.status === "busy"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {statusLabels[member.status] ?? member.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className={`px-4 py-3 text-xs ${darkMode ? ha.textMuted : "text-gray-400"}`}>Yuklanmoqda…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
