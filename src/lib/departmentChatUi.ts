import type { DepartmentChatMemberDto, DepartmentChatMessageDto, DepartmentChatRoomSummaryDto } from "@/api/types/departmentChat.types";
import type { AdminChatGroup, AdminGroupMember, AdminGroupMessage } from "@/mocks/adminChatGroups";

export function formatChatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function departmentChatMessageToAdminMessage(m: DepartmentChatMessageDto): AdminGroupMessage {
  const datePart = m.createdAt.split("T")[0] ?? "";
  return {
    id: m.id,
    senderId: m.senderUserId,
    senderName: m.senderName,
    senderAvatar: m.senderAvatar,
    senderHospital: m.senderHospital,
    content: m.content,
    time: formatChatTime(m.createdAt),
    date: datePart,
    read: false,
  };
}

export function departmentMembersToAdminMembers(
  room: DepartmentChatRoomSummaryDto,
  members: DepartmentChatMemberDto[],
): AdminGroupMember[] {
  return members.map((m) => ({
    id: m.id,
    name: m.name,
    specialty: m.specialty || room.specialtyLabel,
    hospitalId: room.hospitalId,
    hospitalName: m.hospitalName || room.hospitalName,
    avatar: m.avatar,
    status: m.status,
    experience: 0,
  }));
}

export function roomSummaryToAdminChatGroup(
  room: DepartmentChatRoomSummaryDto,
  messages: AdminGroupMessage[],
  members: AdminGroupMember[],
): AdminChatGroup {
  return {
    id: room.id,
    name: room.name,
    specialty: room.specialtyLabel,
    hospitalId: room.hospitalId,
    hospitalName: room.hospitalName,
    description: room.description,
    members,
    messages,
    unreadCount: room.unreadCount,
    createdAt: room.lastMessageAt ?? new Date().toISOString(),
    rosterCount: room.memberCount,
    onlineCountOverride: 0,
  };
}

export function peerBubbleClassFromSender(senderId: string): string {
  const palette = ["bg-rose-600", "bg-sky-600", "bg-emerald-600", "bg-amber-600", "bg-violet-600", "bg-pink-600", "bg-indigo-600"];
  let h = 0;
  for (let i = 0; i < senderId.length; i++) h = (h * 31 + senderId.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length] ?? "bg-gray-600";
}
