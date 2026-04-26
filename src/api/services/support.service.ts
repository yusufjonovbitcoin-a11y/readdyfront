import * as supportHttp from "@/api/adapters/support.http";
import type { SupportMessageDto, SupportTicketDto, SupportTicketStatus } from "@/api/types/support.types";

export type SupportTicket = SupportTicketDto;
export type SupportMessage = SupportMessageDto;

export function getSupportTickets(): Promise<SupportTicket[]> {
  return supportHttp.getSupportTickets();
}

export function createSupportTicket(
  input: Omit<SupportTicket, "id" | "messages" | "unreadByAdmin" | "createdAt" | "updatedAt">,
): Promise<SupportTicket | null> {
  return supportHttp.createSupportTicket(input);
}

export function createSupportMessage(
  ticketId: string,
  input: Omit<SupportMessage, "id">,
): Promise<SupportMessage | null> {
  return supportHttp.createSupportMessage(ticketId, input);
}

export function updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<boolean> {
  return supportHttp.updateSupportTicketStatus(ticketId, status);
}
