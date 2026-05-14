export interface DepartmentChatMessageDto {
  id: string;
  senderUserId: string;
  senderName: string;
  senderAvatar: string;
  senderHospital: string;
  content: string;
  createdAt: string;
}

export interface DepartmentChatMessagesPageDto {
  messages: DepartmentChatMessageDto[];
  nextCursor: string | null;
}

export interface DoctorDepartmentChatSummaryDto {
  departmentId: string;
  departmentName: string;
  hospitalId: string;
  hospitalName: string;
  description: string;
  memberCount: number;
  unreadCount: number;
  onlineCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}

export interface DepartmentChatMemberDto {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  hospitalName: string;
  specialty: string;
  status: "online" | "offline" | "busy";
}

export interface DepartmentChatRoomSummaryDto {
  id: string;
  name: string;
  specialtyLabel: string;
  hospitalId: string;
  hospitalName: string;
  description: string;
  memberCount: number;
  unreadCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}
