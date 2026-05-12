import { useState, useRef, useEffect, useMemo } from "react";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import {
  groupChatMessages,
  currentChatDoctor,
  getDoctorsForSpecialty,
  statusColors,
  statusLabels,
  type GroupChatMessage,
  type ChatDoctor,
} from "@/mocks/doctorChat";

const CURRENT_SPECIALTY = "Kardiologiya";

function ChatBubble({
  msg,
  isMe,
  darkMode,
  showAvatar,
}: {
  msg: GroupChatMessage;
  isMe: boolean;
  darkMode: boolean;
  showAvatar: boolean;
}) {
  return (
    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && (
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 ${
            isMe
              ? "bg-green-600"
              : msg.senderId === "d-card-2"
              ? "bg-emerald-600"
              : msg.senderId === "d-card-3"
              ? "bg-sky-600"
              : msg.senderId === "d-card-4"
              ? "bg-rose-600"
              : "bg-amber-600"
          }`}
        >
          {msg.senderAvatar}
        </div>
      )}
      {!showAvatar && <div className="w-9 flex-shrink-0" />}
      <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className="flex items-center gap-1.5 mb-0.5 px-1">
            <span className={`text-[11px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {msg.senderName}
            </span>
            <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
              {msg.senderHospital}
            </span>
          </div>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? darkMode
                ? "bg-green-600 text-white rounded-tr-sm"
                : "bg-green-600 text-white rounded-tr-sm shadow-sm"
              : darkMode
              ? "bg-[#1C2333] text-gray-200 rounded-tl-sm border border-[#1C2333]"
              : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`text-[10px] px-1 mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          {msg.time}
          {isMe && (
            <i className={`ri-check-double-line ml-1 ${msg.read ? "text-emerald-400" : ""}`} />
          )}
        </span>
      </div>
    </div>
  );
}

export function DocChatContent() {
  const { darkMode } = useDoctorTheme();
  const [messages, setMessages] = useState<GroupChatMessage[]>([...groupChatMessages]);
  const [messageText, setMessageText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const allMembers = useMemo(() => {
    const specialty = getDoctorsForSpecialty(CURRENT_SPECIALTY);
    return [currentChatDoctor, ...specialty];
  }, []);

  const onlineCount = allMembers.filter((d) => d.status === "online").length;
  const unreadCount = messages.filter((m) => !m.read).length;

  const filteredMembers = useMemo(() => {
    if (!searchMembers.trim()) return allMembers;
    const q = searchMembers.toLowerCase();
    return allMembers.filter(
      (d) => d.name.toLowerCase().includes(q) || d.hospitalName.toLowerCase().includes(q),
    );
  }, [allMembers, searchMembers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const newMsg: GroupChatMessage = {
      id: `gm-${Date.now()}`,
      senderId: currentChatDoctor.id,
      senderName: currentChatDoctor.name,
      senderAvatar: currentChatDoctor.avatar,
      senderHospital: currentChatDoctor.hospitalName,
      content: messageText.trim(),
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMe = (senderId: string) => senderId === currentChatDoctor.id;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${darkMode ? "bg-[#0F1117]" : "bg-white"}`}>
        {/* Chat header */}
        <div className={`px-5 py-3.5 border-b flex items-center gap-3 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            Ka
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                {CURRENT_SPECIALTY} Guruhi
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500">
                {CURRENT_SPECIALTY}
              </span>
            </div>
            <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {allMembers.length} a'zo · {onlineCount} onlayn
            </p>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"
            } ${showMembers ? (darkMode ? "bg-[#1E2A3A] text-white" : "bg-gray-100 text-gray-900") : ""}`}
          >
            <i className="ri-group-line text-sm" />
          </button>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-4 ${darkMode ? "bg-[#0F1117]" : "bg-gradient-to-b from-gray-50 to-white"}`}>
          {/* Group welcome banner */}
          <div className="flex flex-col items-center py-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-3 ${darkMode ? "bg-[#1E2130]" : "bg-green-50"}`}>
              <i className={`ri-chat-smile-2-line text-2xl ${darkMode ? "text-green-400" : "text-green-500"}`} />
            </div>
            <p className={`text-sm font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {CURRENT_SPECIALTY} Guruhi
            </p>
            <p className={`text-xs text-center max-w-md mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Barcha shifoxonalardagi {CURRENT_SPECIALTY.toLowerCase()} mutaxassislari uchun guruh chat. Kasallik holatlari, yangi tadqiqotlar va tajriba almashish.
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-[#1E2130] text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                {allMembers.length} a'zo
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                {onlineCount} onlayn
              </span>
            </div>
          </div>

          {/* Date divider */}
          <div className="flex items-center gap-3 my-2">
            <div className={`flex-1 h-px ${darkMode ? "bg-[#1E2130]" : "bg-gray-200"}`} />
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-[#1E2130] text-gray-500" : "bg-gray-100 text-gray-400"}`}>
              Bugun
            </span>
            <div className={`flex-1 h-px ${darkMode ? "bg-[#1E2130]" : "bg-gray-200"}`} />
          </div>

          {/* Messages */}
          {messages.map((msg, idx) => {
            const me = isMe(msg.senderId);
            const prevMsg = messages[idx - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            return <ChatBubble key={msg.id} msg={msg} isMe={me} darkMode={darkMode} showAvatar={showAvatar} />;
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`px-5 py-4 border-t ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing..."
                rows={1}
                className={`w-full text-sm px-4 py-3 rounded-2xl outline-none resize-none transition-colors ${
                  darkMode
                    ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-green-500/50"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-300"
                }`}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <p className={`absolute right-3 bottom-1 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
                {messageText.length}/500
              </p>
            </div>
            <button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                messageText.trim()
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : darkMode
                  ? "bg-[#1E2130] text-gray-600"
                  : "bg-gray-100 text-gray-300"
              }`}
            >
              <i className="ri-send-plane-fill text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Members panel (togglable) */}
      {showMembers && (
        <div className={`w-72 flex-shrink-0 border-l flex flex-col ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className={`px-4 py-3.5 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Guruh a'zolari</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {allMembers.length} ta shifokor
            </p>
          </div>

          {/* Search members */}
          <div className={`px-4 py-3 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <i className={`ri-search-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <input
                type="text"
                value={searchMembers}
                onChange={(e) => setSearchMembers(e.target.value)}
                placeholder="Qidirish..."
                className={`w-full pl-7 pr-3 py-2 rounded-lg text-xs outline-none transition-colors ${
                  darkMode
                    ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-green-500/50"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-300"
                }`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-0 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            {[
              { label: "Onlayn", value: allMembers.filter((d) => d.status === "online").length, color: "text-emerald-500" },
              { label: "Band", value: allMembers.filter((d) => d.status === "busy").length, color: "text-amber-500" },
              { label: "Offlayn", value: allMembers.filter((d) => d.status === "offline").length, color: "text-gray-400" },
            ].map((s) => (
              <div key={s.label} className={`py-2 text-center ${darkMode ? "border-r border-[#1E2130]" : "border-r border-gray-100"} last:border-r-0`}>
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredMembers.map((member) => {
              const isSelf = member.id === currentChatDoctor.id;
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-2.5 ${darkMode ? "hover:bg-[#1E2A3A]" : "hover:bg-gray-50"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                        member.status === "online" ? "bg-emerald-600" : member.status === "busy" ? "bg-amber-600" : "bg-gray-500"
                      }`}
                    >
                      {member.avatar}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                        darkMode ? "border-[#141824]" : "border-white"
                      } ${statusColors[member.status]}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                      {member.name}
                      {isSelf && <span className={`ml-1 text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(siz)</span>}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {member.hospitalName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      member.status === "online"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : member.status === "busy"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {statusLabels[member.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocChatPage() {
  return <DocChatContent />;
}
