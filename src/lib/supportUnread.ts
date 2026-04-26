import type { SupportTicketDto } from "@/api/types/support.types";

const STORAGE_KEY = "support_tickets_ui_state_v2";
export const SUPPORT_UNREAD_EVENT = "support-unread-updated";

function safeParseTickets(raw: string | null): SupportTicketDto[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SupportTicketDto[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readSupportTicketsState(): SupportTicketDto[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseTickets(window.localStorage.getItem(STORAGE_KEY));
  return parsed ?? [];
}

export function writeSupportTicketsState(tickets: SupportTicketDto[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new CustomEvent(SUPPORT_UNREAD_EVENT));
}

export function getSupportUnreadCount(tickets: SupportTicketDto[] = readSupportTicketsState()) {
  return tickets.reduce((acc, ticket) => acc + (ticket.unreadByAdmin ?? 0), 0);
}

