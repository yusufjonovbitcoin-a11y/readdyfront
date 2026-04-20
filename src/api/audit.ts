import { auditAdapter } from "@/api";
import type { AuditLogDto, AuditQuery } from "@/api/types/audit.types";

export function getAuditLogs(query?: AuditQuery): Promise<AuditLogDto[]> {
  return auditAdapter.getAuditLogs(query);
}

export function getAuditLogById(id: string): Promise<AuditLogDto | null> {
  return auditAdapter.getAuditLogById(id);
}

export function appendAuditLog(payload: Omit<AuditLogDto, "id" | "timestamp">): Promise<AuditLogDto> {
  return auditAdapter.appendAuditLog(payload);
}
