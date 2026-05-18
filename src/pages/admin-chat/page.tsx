import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllDepartmentChatRooms,
  getDepartmentChatRoomMembers,
  getDepartmentChatRoomMessages,
  postDepartmentChatRoomMarkRead,
  postDepartmentChatRoomMessage,
} from "@/api/adapters/departmentChat.http";
import { AdminChatShell } from "@/components/admin-chat/AdminChatShell";
import type { AdminGroupMember, AdminGroupMessage } from "@/mocks/adminChatGroups";
import { chatSenderUserId } from "@/lib/chatSpecialtyUi";
import {
  departmentChatMessageToAdminMessage,
  departmentMembersToAdminMembers,
  roomSummaryToAdminChatGroup,
} from "@/lib/departmentChatUi";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SA";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "SA";
}

export default function AdminChatPage() {
  const darkMode = useMainLayoutDarkMode();
  const { user } = useAuth();

  const { data: rooms = [] } = useQuery({
    queryKey: ["super-admin-department-chat-rooms"],
    queryFn: () => getAllDepartmentChatRooms(),
    enabled: user?.role === "SUPER_ADMIN",
  });

  const seedGroups = useMemo(
    () => rooms.map((r) => roomSummaryToAdminChatGroup(r, [], [])),
    [rooms],
  );

  const departmentFilterOptions = useMemo(() => {
    const u = new Set<string>();
    rooms.forEach((r) => u.add(r.specialtyLabel));
    return Array.from(u).sort();
  }, [rooms]);

  const groupsSyncKey = useMemo(
    () => rooms.map((r) => `${r.id}:${r.unreadCount}:${r.lastMessageAt ?? ""}`).join("|"),
    [rooms],
  );

  const selfMember: AdminGroupMember = useMemo(() => {
    if (!user) {
      return {
        id: "super-admin",
        name: "Super Admin",
        specialty: "Administrator",
        hospitalId: "0",
        hospitalName: "MedCore HQ",
        avatar: "SA",
        status: "online",
        experience: 0,
      };
    }
    const raw = user.avatar?.trim() ?? "";
    const avatar =
      raw && !raw.startsWith("http") && raw.length <= 4 ? raw.toUpperCase() : initialsFromName(user.name);
    return {
      id: chatSenderUserId(user),
      name: user.name,
      specialty: "Administrator",
      hospitalId: user.hospitalId ?? "0",
      hospitalName: user.hospitalName ?? "MedCore HQ",
      avatar,
      status: "online",
      experience: 0,
    };
  }, [user]);

  const fetchMessagesForGroup = async (groupId: string): Promise<AdminGroupMessage[]> => {
    const page = await getDepartmentChatRoomMessages(groupId);
    return page.messages.map(departmentChatMessageToAdminMessage);
  };

  const submitMessageToGroup = async (groupId: string, body: string): Promise<AdminGroupMessage> => {
    const dto = await postDepartmentChatRoomMessage(groupId, body);
    return departmentChatMessageToAdminMessage(dto);
  };

  const onRoomOpened = async (groupId: string) => {
    await postDepartmentChatRoomMarkRead(groupId);
  };

  const fetchMembersForGroup = async (groupId: string): Promise<AdminGroupMember[]> => {
    const room = rooms.find((r) => r.id === groupId);
    if (!room) return [];
    const members = await getDepartmentChatRoomMembers(groupId);
    return departmentMembersToAdminMembers(room, members);
  };

  return (
    <AdminChatShell
      darkMode={darkMode}
      selfMember={selfMember}
      seedGroups={seedGroups}
      groupsSyncKey={groupsSyncKey}
      departmentFilterOptions={departmentFilterOptions}
      leftHeaderTitle="Kasalxonalar"
      deptFilterInputId="admin-chat-dept-filter"
      fetchMessagesForGroup={user?.role === "SUPER_ADMIN" ? fetchMessagesForGroup : undefined}
      submitMessageToGroup={user?.role === "SUPER_ADMIN" ? submitMessageToGroup : undefined}
      onRoomOpened={user?.role === "SUPER_ADMIN" ? onRoomOpened : undefined}
      fetchMembersForGroup={user?.role === "SUPER_ADMIN" ? fetchMembersForGroup : undefined}
    />
  );
}
