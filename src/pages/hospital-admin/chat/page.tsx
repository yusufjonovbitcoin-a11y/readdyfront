import { useState, useRef, useEffect, useMemo } from "react";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  haChatGroups,
  hospitalAdminMember,
  haStatusColors,
  haStatusLabels,
  haSpecialtyColors,
  haSpecialtyBadgeColors,
  haDepartments,
  type HAChatGroup,
  type HAGroupMessage,
} from "@/mocks/hospitalAdminChat";

function ChatBubble({
  msg,
  isMe,
  darkMode,
  showAvatar,
}: {
  msg: HAGroupMessage;
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
              ? "bg-teal-600"
              : msg.senderId.includes("Kardio")
              ? "bg-rose-600"
              : msg.senderId.includes("Nevro")
              ? "bg-sky-600"
              : msg.senderId.includes("Orto")
              ? "bg-teal-600"
              : msg.senderId.includes("Ped")
              ? "bg-amber-600"
              : msg.senderId.includes("Xiru")
              ? "bg-violet-600"
              : "bg-pink-600"
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
          </div>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? darkMode
                ? "bg-teal-600 text-white rounded-tr-sm"
                : "bg-teal-600 text-white rounded-tr-sm shadow-sm"
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
            <i className={`ri-check-double-line ml-1 ${msg.read ? "text-teal-400" : ""}`} />
          )}
        </span>
      </div>
    </div>
  );
}

export function HAChatContent() {
  const darkMode = useHospitalAdminDarkMode();
  const [groups, setGroups] = useState<HAChatGroup[]>([...haChatGroups]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(haChatGroups[0]?.id || "");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("Barchasi");
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const filteredGroups = useMemo(() => {
    let filtered = [...groups];
    if (filterDept !== "Barchasi") filtered = filtered.filter((g) => g.specialty === filterDept);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      return a.name.localeCompare(b.name);
    });
    return filtered;
  }, [groups, filterDept, searchQuery]);

  const totalUnread = groups.reduce((acc, g) => acc + g.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages.length]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedGroup) return;
    const newMsg: HAGroupMessage = {
      id: `msg-${Date.now()}`,
      senderId: hospitalAdminMember.id,
      senderName: hospitalAdminMember.name,
      senderAvatar: hospitalAdminMember.avatar,
      content: messageText.trim(),
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      read: false,
    };
    setGroups((prev) => prev.map((g) => g.id === selectedGroupId ? { ...g, messages: [...g.messages, newMsg], unreadCount: 0 } : g));
    setMessageText("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isMe = (senderId: string) => senderId === hospitalAdminMember.id;

  if (!selectedGroup) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Guruhlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel - Groups list */}
      <div className={`w-80 flex-shrink-0 flex flex-col border-r ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
        <div className={`p-4 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <i className="ri-chat-3-line text-white text-sm" />
              </div>
              <div>
                <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Bo'lim Guruhlari</h2>
                <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{groups.length} ta guruh · {totalUnread} ta o'qilmagan</p>
              </div>
            </div>
          </div>
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className={`ri-search-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <input type="text" placeholder="Guruh qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-teal-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-300"}`} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer">
                <i className={`ri-close-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              </button>
            )}
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className={`w-full px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors cursor-pointer appearance-none ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white" : "bg-gray-50 border border-gray-200 text-gray-700"}`}>
            {["Barchasi", ...haDepartments].map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredGroups.map((group) => {
                const isActive = group.id === selectedGroupId;
                const lastMsg = group.messages[group.messages.length - 1];
                const onlineCount = group.members.filter((m) => m.status === "online").length;
                return (
                  <button key={group.id} onClick={() => { setSelectedGroupId(group.id); setShowMembers(false); setGroups((prev) => prev.map((g) => g.id === group.id ? { ...g, unreadCount: 0 } : g)); }} className={`w-full text-left rounded-xl p-3 transition-all cursor-pointer ${isActive ? (darkMode ? "bg-teal-900/20 border border-teal-500/30" : "bg-teal-50 border border-teal-200") : darkMode ? "hover:bg-[#1E2A3A]/50" : "hover:bg-gray-50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${haSpecialtyColors[group.specialty] || "bg-gray-600"}`}>{group.specialty.slice(0, 2)}</div>
                        {group.unreadCount > 0 && !isActive && (<span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">{group.unreadCount}</span>)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{group.name}</p>
                        {lastMsg && (<p className={`text-xs truncate mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}><span className="font-medium">{lastMsg.senderName.split(" ")[1]}:</span> {lastMsg.content}</p>)}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${haSpecialtyBadgeColors[group.specialty] || "bg-gray-500/10 text-gray-500"}`}>{group.specialty}</span>
                          <span className={`text-[10px] flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}><span className="w-1 h-1 rounded-full bg-teal-500" />{onlineCount} onlayn</span>
                          <span className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>{group.members.length} a'zo</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 ${darkMode ? "bg-[#1E2130]" : "bg-gray-100"}`}><i className={`ri-chat-off-line text-xl ${darkMode ? "text-gray-600" : "text-gray-400"}`} /></div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Guruhlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${darkMode ? "bg-[#0F1117]" : "bg-white"}`}>
        <div className={`px-5 py-3.5 border-b flex items-center gap-3 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${haSpecialtyColors[selectedGroup.specialty] || "bg-gray-600"}`}>{selectedGroup.specialty.slice(0, 2)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup.name}</h2>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${haSpecialtyBadgeColors[selectedGroup.specialty] || ""}`}>{selectedGroup.specialty}</span>
            </div>
            <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedGroup.members.length} a'zo · {selectedGroup.members.filter((m) => m.status === "online").length} onlayn</p>
          </div>
          <button onClick={() => setShowMembers(!showMembers)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"} ${showMembers ? (darkMode ? "bg-[#1E2A3A] text-white" : "bg-gray-100 text-gray-900") : ""}`}>
            <i className="ri-group-line text-sm" />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-4 ${darkMode ? "bg-[#0F1117]" : "bg-gradient-to-b from-gray-50 to-white"}`}>
          <div className="flex flex-col items-center py-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-3 ${darkMode ? "bg-[#1E2130]" : "bg-teal-50"}`}><i className={`ri-chat-smile-2-line text-2xl ${darkMode ? "text-teal-400" : "text-teal-500"}`} /></div>
            <p className={`text-sm font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedGroup.name}</p>
            <p className={`text-xs text-center max-w-md mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedGroup.description}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-[#1E2130] text-gray-300" : "bg-gray-100 text-gray-600"}`}>{selectedGroup.members.length} a'zo</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-500">{selectedGroup.members.filter((m) => m.status === "online").length} onlayn</span>
            </div>
          </div>
          <div className="flex items-center gap-3 my-2">
            <div className={`flex-1 h-px ${darkMode ? "bg-[#1E2130]" : "bg-gray-200"}`} />
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-[#1E2130] text-gray-500" : "bg-gray-100 text-gray-400"}`}>Bugun</span>
            <div className={`flex-1 h-px ${darkMode ? "bg-[#1E2130]" : "bg-gray-200"}`} />
          </div>
          {selectedGroup.messages.map((msg, idx) => {
            const me = isMe(msg.senderId);
            const prevMsg = selectedGroup.messages[idx - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            return <ChatBubble key={msg.id} msg={msg} isMe={me} darkMode={darkMode} showAvatar={showAvatar} />;
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className={`px-5 py-4 border-t ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value.slice(0, 500))} onKeyDown={handleKeyDown} placeholder="Xabar yozing..." rows={1} className={`w-full text-sm px-4 py-3 rounded-2xl outline-none resize-none transition-colors ${darkMode ? "bg-[#0F1117] border border-[#1E2130] text-white placeholder-gray-600 focus:border-teal-500/50" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-300"}`} style={{ minHeight: "44px", maxHeight: "120px" }} />
              <p className={`absolute right-3 bottom-1 text-[10px] ${darkMode ? "text-gray-600" : "text-gray-300"}`}>{messageText.length}/500</p>
            </div>
            <button onClick={sendMessage} disabled={!messageText.trim()} className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 ${messageText.trim() ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm" : darkMode ? "bg-[#1E2130] text-gray-600" : "bg-gray-100 text-gray-300"}`}>
              <i className="ri-send-plane-fill text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div className={`w-72 flex-shrink-0 border-l flex flex-col ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
          <div className={`px-4 py-3.5 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Guruh a'zolari</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{selectedGroup.members.length} ta shifokor</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {selectedGroup.members.map((member) => (
              <div key={member.id} className={`flex items-center gap-3 px-4 py-2.5 ${darkMode ? "hover:bg-[#1E2A3A]" : "hover:bg-gray-50"}`}>
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${haSpecialtyColors[member.specialty] || "bg-gray-500"}`}>{member.avatar}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${darkMode ? "border-[#141824]" : "border-white"} ${haStatusColors[member.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{member.name}</p>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{member.experience} yil tajriba</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${member.status === "online" ? "bg-teal-500/10 text-teal-500" : member.status === "busy" ? "bg-amber-500/10 text-amber-500" : "bg-gray-500/10 text-gray-400"}`}>{haStatusLabels[member.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HAChatPage() {
  return <HAChatContent />;
}
