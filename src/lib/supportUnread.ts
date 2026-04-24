import type { SupportTicket } from "@/mocks/support";
import { mockSupportTickets } from "@/mocks/support";

const STORAGE_KEY = "support_tickets_ui_state_v2";
export const SUPPORT_UNREAD_EVENT = "support-unread-updated";

function safeParseTickets(raw: string | null): SupportTicket[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SupportTicket[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readSupportTicketsState(): SupportTicket[] {
  if (typeof window === "undefined") return mockSupportTickets;
  const parsed = safeParseTickets(window.localStorage.getItem(STORAGE_KEY));
  return parsed ?? mockSupportTickets;
}

export function writeSupportTicketsState(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new CustomEvent(SUPPORT_UNREAD_EVENT));
}

export function getSupportUnreadCount(tickets: SupportTicket[] = readSupportTicketsState()) {
  return tickets.reduce((acc, ticket) => acc + (ticket.unreadByAdmin ?? 0), 0);
}

