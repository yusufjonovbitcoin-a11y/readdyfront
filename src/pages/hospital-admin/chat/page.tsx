import { useState, useRef, useEffect, useMemo, useCallback, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import {
  getDepartmentChatRoomMembers,
  getDepartmentChatRoomMessages,
  getHospitalDepartmentChatRooms,
  postDepartmentChatRoomMarkRead,
  postDepartmentChatRoomMessage,
} from "@/api/adapters/departmentChat.http";
import type { AdminGroupMessage } from "@/mocks/adminChatGroups";
import {
  specialtyColors,
  specialtyBadgeColors,
} from "@/mocks/adminChatGroups";
import {
  departmentChatMessageToAdminMessage,
  departmentMembersToAdminMembers,
  roomSummaryToAdminChatGroup,
} from "@/lib/departmentChatUi";
import type { AdminChatGroup } from "@/mocks/adminChatGroups";

const FALLBACK_HOSPITAL_ID = "1";

const FALLBACK_ADMIN = {
  id: "ha-admin",
  name: "Aziz Rahimov",
  avatar: "AR",
  hospitalId: FALLBACK_HOSPITAL_ID,
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
    id: user.id,
    name: user.name,
    avatar,
    hospitalId: user.hospitalId?.trim() || FALLBACK_HOSPITAL_ID,
    hospitalName: user.hospitalName?.trim() || FALLBACK_ADMIN.hospitalName,
  };
}

function peerBubbleClass(senderId: string): string {
  let h = 0;
  for (let i = 0; i < senderId.length; i++) h = (h * 31 + senderId.charCodeAt(i)) | 0;
  const palette = ["bg-rose-600", "bg-sky-600", "bg-emerald-600", "bg-amber-600", "bg-violet-600", "bg-pink-600"];
  return palette[Math.abs(h) % palette.length] ?? "bg-pink-600";
}

function ChatBubble({
  msg,
  isMe,
  showAvatar,
}: {
  msg: AdminGroupMessage;
  isMe: boolean;
  showAvatar: boolean;
}) {
  return (
    <div className={"flex gap-2.5 " + (isMe ? "flex-row-reverse" : "flex-row")}>
      {showAvatar && (
        <div
          className={
            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white " +
            (isMe ? "bg-teal-600" : peerBubbleClass(msg.senderId))
          }
        >
          {msg.senderAvatar}
        </div>
      )}
      {!showAvatar && <div className={'w-9 shrink-0'} />}
      <div className={"flex max-w-[70%] flex-col " + (isMe ? "items-end" : "items-start")}>
        {showAvatar && (
          <div className={'mb-0.5 flex items-center gap-1.5 px-1'}>
            <span className={'text-[11px] font-semibold text-gray-700 dark:text-gray-300'}>{msg.senderName}</span>
            <span className={'text-[10px] text-gray-400 dark:text-gray-600'}>{msg.senderHospital}</span>
          </div>
        )}
        <div
          className={
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
            (isMe
              ? "rounded-tr-sm bg-teal-600 text-white shadow-sm"
              : "rounded-tl-sm border border-gray-200 bg-gray-50 text-gray-800 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100")
          }
        >
          {msg.content}
        </div>
        <span className={'mt-0.5 px-1 text-[10px] text-gray-400 dark:text-gray-600'}>
          {msg.time}
          {isMe && <i className={"ri-check-double-line ml-1 " + (msg.read ? "text-teal-400" : "")} />}
        </span>
      </div>
    </div>
  );
}

export default function HospitalAdminChatPage() {
  const { t } = useTranslation("hospital");
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

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const totalUnread = rooms.reduce((acc, r) => acc + r.unreadCount, 0);

  if (user?.role === "HOSPITAL_ADMIN" && !roomsLoading && rooms.length === 0) {
    return (
      <div className={'flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center w-full'}>
        <p className={'text-sm font-medium text-gray-800 dark:text-gray-200'}>Chat guruhlari yo&apos;q</p>
        <p className={'max-w-sm text-xs text-gray-500 dark:text-gray-400'}>
          Bu kasalxonada bo&apos;limlar ro&apos;yxati bo&apos;sh yoki API javob bermadi.
        </p>
      </div>
    );
  }

  const rootLayoutClass =
    "flex min-h-0 min-w-0 flex-1 w-full overflow-hidden bg-gray-100 dark:bg-zinc-900";

  return (
    <div className={rootLayoutClass}>
      <div className={'flex h-full min-h-0 w-80 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-gray-600 dark:bg-gray-800'}>
        <div className={'border-b border-gray-100 p-4 dark:border-gray-600'}>
          <div className={'mb-3 flex items-center justify-between'}>
            <div className={'flex items-center gap-2'}>
              <div className={'flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600'}>
                <i className={'ri-chat-3-line text-sm text-white'} />
              </div>
              <div>
                <h2 className={'text-sm font-bold text-gray-900 dark:text-white'}>{t("sidebar.chatGuruhi")}</h2>
                <p className={'text-[11px] text-gray-500 dark:text-gray-500'}>
                  {rooms.length} ta guruh · {totalUnread} ta o&apos;qilmagan
                </p>
              </div>
            </div>
          </div>

          <div className={'relative'}>
            <div className={'absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center'}>
              <i className={'ri-search-line text-sm text-gray-400 dark:text-gray-500'} />
            </div>
            <input
              type="text"
              placeholder="Guruh qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={'w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-neutral-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/25'}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={'absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center'}
              >
                <i className={'ri-close-line text-xs text-gray-400 dark:text-gray-500'} />
              </button>
            )}
          </div>
        </div>

        <div className={'min-h-0 flex-1 overflow-y-auto'}>
          {roomsLoading ? (
            <p className={'p-4 text-center text-xs text-gray-500'}>Yuklanmoqda…</p>
          ) : filteredRooms.length > 0 ? (
            <div className={'space-y-1 p-2'}>
              {filteredRooms.map((room) => {
                const isActive = room.id === selectedGroupId;
                const lastMsg = room.lastMessagePreview;
                const roster = room.memberCount;
                return (
                  <button
                    type="button"
                    key={room.id}
                    onClick={() => setSelectedGroupId(room.id)}
                    className={
                      "w-full cursor-pointer rounded-xl p-3 text-left transition-all " +
                      (isActive
                        ? "border border-teal-200 bg-teal-50 text-gray-900 dark:border-transparent dark:bg-teal-900/40 dark:text-teal-100 dark:ring-1 dark:ring-teal-500/30"
                        : "border border-transparent text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white")
                    }
                  >
                    <div className={'flex items-start gap-3'}>
                      <div className={'relative shrink-0'}>
                        <div
                          className={
                            "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white " +
                            (specialtyColors[room.specialtyLabel] || "bg-gray-600")
                          }
                        >
                          {room.specialtyLabel.slice(0, 2)}
                        </div>
                        {room.unreadCount > 0 && !isActive && (
                          <span className={'absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white'}>
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className={'min-w-0 flex-1'}>
                        <p className={'truncate text-sm font-semibold text-gray-900 dark:text-gray-100'}>{room.name}</p>
                        <p className={'mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500'}>{room.hospitalName}</p>
                        {lastMsg && (
                          <p className={'mt-1 truncate text-xs text-gray-500 dark:text-gray-400'}>{lastMsg}</p>
                        )}
                        <div className={'mt-1.5 flex items-center gap-2'}>
                          <span
                            className={
                              "rounded-full px-1.5 py-0.5 text-[10px] " +
                              (specialtyBadgeColors[room.specialtyLabel] || "bg-gray-500/10 text-gray-500")
                            }
                          >
                            {room.specialtyLabel}
                          </span>
                          <span className={'flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'}>
                            <span className={'h-1 w-1 rounded-full bg-emerald-500'} />0 onlayn
                          </span>
                          <span className={'text-[10px] text-gray-500 dark:text-gray-600'}>{roster} a&apos;zo</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={'flex flex-col items-center justify-center px-4 py-12'}>
              <div className={'mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/40'}>
                <i className={'ri-chat-off-line text-xl text-gray-400 dark:text-gray-500'} />
              </div>
              <p className={'text-sm text-gray-500 dark:text-gray-400'}>Guruhlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      <div className={'relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950'}>
        {selectedGroup ? (
          <>
            <div className={'flex min-w-0 items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5 dark:border-gray-600 dark:bg-gray-800'}>
              <div
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white " +
                  (specialtyColors[selectedGroup.specialty] || "bg-gray-600")
                }
              >
                {selectedGroup.specialty.slice(0, 2)}
              </div>
              <div className={'min-w-0 flex-1'}>
                <div className={'flex items-center gap-2'}>
                  <h2 className={'truncate text-sm font-bold text-gray-900 dark:text-white'}>{selectedGroup.name}</h2>
                  <span
                    className={
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] " +
                      (specialtyBadgeColors[selectedGroup.specialty] || "")
                    }
                  >
                    {selectedGroup.specialty}
                  </span>
                </div>
                <p className={'truncate text-xs text-gray-500 dark:text-gray-500'}>
                  {selectedGroup.hospitalName} · {selectedGroup.rosterCount ?? selectedGroup.members.length} a&apos;zo ·{" "}
                  {selectedGroup.onlineCountOverride ?? 0} onlayn
                </p>
              </div>
            </div>

            <div className={'min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-5 py-5 dark:from-neutral-950 dark:to-neutral-950'}>
              <div className={'flex flex-col items-center py-4'}>
                <div className={'mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-teal-50 dark:border-gray-600 dark:bg-gray-800'}>
                  <i className={'ri-chat-smile-2-line text-2xl text-teal-500 dark:text-teal-400'} />
                </div>
                <p className={'mb-1 text-sm font-bold text-gray-900 dark:text-white'}>{selectedGroup.name}</p>
                <p className={'mb-2 max-w-md text-center text-xs text-gray-500 dark:text-gray-400'}>{selectedGroup.description}</p>
                <div className={'flex items-center gap-2'}>
                  <span className={'rounded-full border border-gray-100 bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:border-gray-600/80 dark:bg-gray-800 dark:text-gray-300'}>
                    {selectedGroup.rosterCount ?? selectedGroup.members.length} a&apos;zo
                  </span>
                  <span className={'rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500'}>
                    {selectedGroup.onlineCountOverride ?? 0} onlayn
                  </span>
                </div>
              </div>

              <div className={'my-2 flex items-center gap-3'}>
                <div className={'h-px flex-1 bg-gray-200 dark:bg-gray-600'} />
                <span className={'rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:border dark:border-gray-600/60 dark:bg-gray-800 dark:text-gray-400'}>
                  Bugun
                </span>
                <div className={'h-px flex-1 bg-gray-200 dark:bg-gray-600'} />
              </div>

              {messagesLoading && <p className={'text-center text-xs text-gray-500'}>Xabarlar…</p>}

              {selectedGroup.messages.map((msg, idx) => {
                const me = isMe(msg.senderId);
                const prevMsg = selectedGroup.messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                return <ChatBubble key={msg.id} msg={msg} isMe={me} showAvatar={showAvatar} />;
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={'border-t border-gray-100 bg-white px-5 py-4 dark:border-gray-600 dark:bg-gray-800'}>
              <div className={'flex items-end gap-3'}>
                <div className={'relative flex-1'}>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                    onKeyDown={handleKeyDown}
                    placeholder="Xabar yozing..."
                    rows={1}
                    className={'w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-neutral-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/25'}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <p className={'absolute bottom-1 right-3 text-[10px] text-gray-400 dark:text-gray-500'}>
                    {messageText.length}/500
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className={
                    "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all " +
                    (messageText.trim() && !sendMutation.isPending
                      ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500")
                  }
                >
                  <i className={'ri-send-plane-fill text-base'} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={'flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white text-gray-500 dark:from-neutral-950 dark:to-neutral-950 dark:text-gray-400'}>
            <div className={'mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:border dark:border-gray-600 dark:bg-gray-800'}>
              <i className={'ri-chat-3-line text-2xl text-gray-400 dark:text-gray-500'} />
            </div>
            <p className={'text-sm font-medium text-gray-700 dark:text-gray-200'}>Guruh tanlang</p>
            <p className={'mt-1 text-xs text-gray-500 dark:text-gray-500'}>Chatni boshlash uchun guruhni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
}
