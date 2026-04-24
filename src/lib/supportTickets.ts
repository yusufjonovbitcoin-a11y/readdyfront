import type { UserRole } from "@/hooks/useAuth";

export type SupportActorRole = Extract<UserRole, "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR">;

export type SupportReply = {
  id: string;
  message: string;
  createdAt: string;
  responderId: string;
  responderName: string;
};

export type SupportTicket = {
  id: string;
  senderRole: SupportActorRole;
  senderId: string;
  senderName: string;
  senderHospitalName?: string;
  subject: string;
  message: string;
  createdAt: string;
  replies: SupportReply[];
};

const STORAGE_KEY = "support_tickets_v1";

function readAll(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SupportTicket[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items: SupportTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore localStorage write failures.
  }
}

export function getSupportTickets(): SupportTicket[] {
  return readAll().sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
}

export function createSupportTicket(input: {
  senderRole: SupportActorRole;
  senderId: string;
  senderName: string;
  senderHospitalName?: string;
  subject: string;
  message: string;
}): SupportTicket {
  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderRole: input.senderRole,
    senderId: input.senderId,
    senderName: input.senderName,
    senderHospitalName: input.senderHospitalName,
    subject: input.subject.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
    replies: [],
  };
  const all = readAll();
  all.push(ticket);
  writeAll(all);
  return ticket;
}

export function replySupportTicket(
  ticketId: string,
  input: { responderId: string; responderName: string; message: string },
): SupportTicket | null {
  const all = readAll();
  const index = all.findIndex((item) => item.id === ticketId);
  if (index < 0) return null;
  const reply: SupportReply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    responderId: input.responderId,
    responderName: input.responderName,
    createdAt: new Date().toISOString(),
    message: input.message.trim(),
  };
  all[index] = { ...all[index], replies: [...all[index].replies, reply] };
  writeAll(all);
  return all[index];
}
