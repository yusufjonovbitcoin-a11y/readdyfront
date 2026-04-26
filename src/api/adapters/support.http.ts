import { apiRequest } from "@/api/client";
import type { SupportMessageDto, SupportTicketDto, SupportTicketStatus } from "@/api/types/support.types";

export async function getSupportTickets(): Promise<SupportTicketDto[]> {
  try {
    return await apiRequest<SupportTicketDto[]>("/api/support/tickets");
  } catch {
    return [];
  }
}

export async function createSupportTicket(
  input: Omit<SupportTicketDto, "id" | "messages" | "unreadByAdmin" | "createdAt" | "updatedAt">,
): Promise<SupportTicketDto | null> {
  try {
    return await apiRequest<SupportTicketDto>("/api/support/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function createSupportMessage(
  ticketId: string,
  input: Omit<SupportMessageDto, "id">,
): Promise<SupportMessageDto | null> {
  try {
    return await apiRequest<SupportMessageDto>(`/api/support/tickets/${encodeURIComponent(ticketId)}/messages`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<boolean> {
  try {
    await apiRequest<unknown>(`/api/support/tickets/${encodeURIComponent(ticketId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return true;
  } catch {
    return false;
  }
}
