import { useState, useRef, useEffect, useMemo, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { io, type Socket } from "socket.io-client";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { getStoredAccessToken } from "@/api/client";
import {
  getDoctorDepartmentChatMembers,
  getDoctorDepartmentChatMessages,
  getDoctorDepartmentChatSummary,
  postDoctorDepartmentChatMarkRead,
  postDoctorDepartmentChatMessage,
} from "@/api/adapters/departmentChat.http";
import type { DepartmentChatMemberDto, DepartmentChatMessageDto } from "@/api/types/departmentChat.types";
import {
  departmentChatMessageToAdminMessage,
  peerBubbleClassFromSender,
} from "@/lib/departmentChatUi";

type UiMsg = ReturnType<typeof departmentChatMessageToAdminMessage>;

function resolveSocketBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (!raw) return "http://localhost:4000";
  return raw.replace(/\/api\/?$/i, "").replace(/\/$/, "");
}

function GroupMessageBubble({
  msg,
  isMe,
  darkMode,
  showAvatar,
}: {
  msg: UiMsg;
  isMe: boolean;
  darkMode: boolean;
  showAvatar: boolean;
}) {
  const avatarClass = isMe ? "bg-violet-600" : peerBubbleClassFromSender(msg.senderId);

  return (
    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        <div
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${avatarClass}`}
        >
          {msg.senderAvatar}
        </div>
      )}
      {!showAvatar && <div className="w-9 shrink-0" />}
      <div className={`flex max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className="mb-0.5 flex items-center gap-1.5 px-1">
            <span className={`text-[11px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {msg.senderName}
            </span>
            <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{msg.senderHospital}</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMe
              ? darkMode
                ? "rounded-tr-sm bg-violet-600 text-white"
                : "rounded-tr-sm bg-violet-600 text-white shadow-sm"
              : darkMode
                ? "rounded-tl-sm border border-[#1C2333] bg-[#1C2333] text-gray-200"
                : "rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`mt-0.5 px-1 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          {msg.time}
          {isMe && <i className={`ri-check-double-line ml-1 ${msg.read ? "text-emerald-400" : ""}`} aria-hidden />}
        </span>
      </div>
    </div>
  );
}

export default function DoctorChatPage() {
  const { t } = useTranslation("doctor");
  const { darkMode } = useDoctorTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["doctor-department-chat-summary"],
    queryFn: getDoctorDepartmentChatSummary,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["doctor-department-chat-members", summary?.departmentId],
    queryFn: getDoctorDepartmentChatMembers,
    enabled: Boolean(summary?.departmentId),
  });

  const { data: messagesPage, isLoading: messagesLoading } = useQuery({
    queryKey: ["doctor-department-chat-messages", summary?.departmentId],
    queryFn: () => getDoctorDepartmentChatMessages(),
    enabled: Boolean(summary?.departmentId),
  });

  const uiMessages = useMemo(
    () => (messagesPage?.messages ?? []).map(departmentChatMessageToAdminMessage),
    [messagesPage],
  );

  useEffect(() => {
    if (!summary?.departmentId) return;
    void postDoctorDepartmentChatMarkRead().then(() => {
      void queryClient.invalidateQueries({ queryKey: ["doctor-department-chat-summary"] });
    });
  }, [summary?.departmentId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uiMessages.length]);

  const departmentId = summary?.departmentId;

  useEffect(() => {
    if (!departmentId) return;
    const token = getStoredAccessToken();
    if (!token) return;
    const socket: Socket = io(`${resolveSocketBaseUrl()}/department-chat`, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;
    const onConnect = () => {
      socket.emit("join", { departmentId });
    };
    socket.on("connect", onConnect);
    socket.on("department_chat:message", (payload: DepartmentChatMessageDto) => {
      if (payload && payload.id) {
        const ui = departmentChatMessageToAdminMessage(payload);
        queryClient.setQueryData<{ messages: DepartmentChatMessageDto[]; nextCursor: string | null }>(
          ["doctor-department-chat-messages", departmentId],
          (old) => {
            const list = old?.messages ?? [];
            const nextCursor = old?.nextCursor ?? null;
            if (list.some((m) => m.id === payload.id)) return old ?? { messages: list, nextCursor };
            return { messages: [...list, payload], nextCursor };
          },
        );
      }
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [departmentId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => postDoctorDepartmentChatMessage(body),
    onSuccess: (dto) => {
      queryClient.setQueryData<{ messages: DepartmentChatMessageDto[]; nextCursor: string | null }>(
        ["doctor-department-chat-messages", summary?.departmentId],
        (old) => {
          const list = old?.messages ?? [];
          const nextCursor = old?.nextCursor ?? null;
          if (list.some((m) => m.id === dto.id)) return old ?? { messages: list, nextCursor };
          return { messages: [...list, dto], nextCursor };
        },
      );
      setMessageText("");
      globalThis.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      void queryClient.invalidateQueries({ queryKey: ["doctor-department-chat-summary"] });
    },
  });

  const currentUserId = user?.id ?? "";
  const isMe = (senderId: string) => senderId === currentUserId;

  const sendMessage = () => {
    const text = messageText.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onlineCount = summary?.onlineCount ?? 0;
  const totalMembers = summary?.memberCount ?? members.length;
  const groupName = summary?.departmentName ?? t("chat.pageTitle");
  const groupDescription = summary?.description ?? "";

  const headerMembers: DepartmentChatMemberDto[] = members.length > 0 ? members : [];

  if (summaryLoading) {
    return (
      <div className="flex min-h-[420px] flex-1 items-center justify-center">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>…</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Guruh chatni yuklab bo&apos;lmadi
        </p>
        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>API / tizimga kirishni tekshiring.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[420px] overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className={`flex shrink-0 items-center gap-3 border-b px-5 py-3.5 ${
            darkMode ? "border-[#1C2333] bg-[#0D1117]" : "border-gray-100 bg-white"
          }`}
        >
          <div className="relative shrink-0">
            <div className="flex -space-x-2">
              {headerMembers.slice(0, 3).map((m, i) => (
                <div
                  key={m.id}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xs font-bold text-white ${
                    darkMode ? "border-[#0D1117]" : "border-white"
                  } ${i === 0 ? "z-30 bg-violet-600" : i === 1 ? "z-20 bg-emerald-600" : "z-10 bg-sky-600"}`}
                >
                  {m.avatar}
                </div>
              ))}
              {headerMembers.length > 3 && (
                <div
                  className={`z-0 flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xs font-bold ${
                    darkMode ? "border-[#0D1117] bg-[#1C2333] text-gray-400" : "border-white bg-gray-100 text-gray-500"
                  }`}
                >
                  +{headerMembers.length - 3}
                </div>
              )}
              {headerMembers.length === 0 && (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xs font-bold text-white ${
                    darkMode ? "border-[#0D1117] bg-violet-600" : "border-white bg-violet-600"
                  }`}
                >
                  {(groupName.slice(0, 2) || "DR").toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`truncate text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{groupName}</h2>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-500">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                {t("chat.onlineShort", { count: onlineCount })}
              </span>
            </div>
            <p className={`truncate text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t("chat.groupMetaLine", { count: totalMembers, description: groupDescription })}
            </p>
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 ${
            darkMode ? "bg-[#0D1117]" : "bg-gradient-to-b from-gray-50 to-white"
          }`}
        >
          <div
            className={`flex flex-col items-center py-6 ${darkMode ? "border-b border-[#1C2333]" : "border-b border-gray-100"}`}
          >
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
                darkMode ? "bg-[#1C2333]" : "bg-violet-50"
              }`}
            >
              <i className={`ri-chat-smile-2-line text-2xl ${darkMode ? "text-violet-400" : "text-violet-500"}`} />
            </div>
            <p className={`mb-1 text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{groupName}</p>
            <p className={`mb-3 max-w-md text-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {groupDescription}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${darkMode ? "bg-[#1C2333] text-gray-300" : "bg-gray-100 text-gray-600"}`}
              >
                {t("chat.memberCountBadge", { count: totalMembers })}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500">
                {t("chat.onlineShort", { count: onlineCount })}
              </span>
            </div>
          </div>

          <div className="my-2 flex items-center gap-3">
            <div className={`h-px flex-1 ${darkMode ? "bg-[#1C2333]" : "bg-gray-200"}`} />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                darkMode ? "bg-[#1C2333] text-gray-500" : "bg-gray-100 text-gray-400"
              }`}
            >
              {t("chat.today")}
            </span>
            <div className={`h-px flex-1 ${darkMode ? "bg-[#1C2333]" : "bg-gray-200"}`} />
          </div>

          {messagesLoading && (
            <p className={`text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Xabarlar yuklanmoqda…</p>
          )}

          {uiMessages.map((msg, idx) => {
            const me = isMe(msg.senderId);
            const prevMsg = uiMessages[idx - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            return (
              <GroupMessageBubble key={msg.id} msg={msg} isMe={me} darkMode={darkMode} showAvatar={showAvatar} />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div
          className={`shrink-0 border-t px-5 py-4 ${darkMode ? "border-[#1C2333] bg-[#0D1117]" : "border-gray-100 bg-white"}`}
        >
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.groupMessagePlaceholder")}
                rows={1}
                className={`w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors ${
                  darkMode
                    ? "border border-[#1C2333] bg-[#161B22] text-white placeholder:text-gray-600 focus:border-violet-500/50"
                    : "border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-violet-300"
                }`}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <p className={`absolute bottom-1 right-3 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
                {messageText.length}/500
              </p>
            </div>
            <button
              type="button"
              onClick={sendMessage}
              disabled={!messageText.trim() || sendMutation.isPending}
              className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
                messageText.trim() && !sendMutation.isPending
                  ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
                  : darkMode
                    ? "bg-[#1C2333] text-gray-600"
                    : "bg-gray-100 text-gray-300"
              }`}
            >
              <i className="ri-send-plane-fill text-base" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
