export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketCategory = "technical" | "billing" | "access" | "feature" | "bug" | "other";
export type SupportSenderRole = "hospital_admin" | "doctor" | "super_admin";

export type SupportMessageDto = {
  id: string;
  ticketId: string;
  senderRole: SupportSenderRole;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  date: string;
  read: boolean;
};

export type SupportTicketDto = {
  id: string;
  subject: string;
  fromRole: "hospital_admin" | "doctor";
  fromName: string;
  fromAvatar: string;
  fromHospital: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
  unreadByAdmin: number;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessageDto[];
};
