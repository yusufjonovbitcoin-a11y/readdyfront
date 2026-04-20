import { mockAuditLogs } from "@/mocks/audit_logs";
import type { AuditLogDto, AuditQuery } from "@/api/types/audit.types";

let auditState: AuditLogDto[] = [...mockAuditLogs];

function applyFilters(list: AuditLogDto[], query?: AuditQuery): AuditLogDto[] {
  if (!query) return list;
  return list.filter((item) => {
    if (query.userId && item.userId !== query.userId) return false;
    if (query.role && item.role !== query.role) return false;
    if (query.action && item.action !== query.action) return false;
    if (query.status && item.status !== query.status) return false;
    if (query.dateFrom && item.timestamp < query.dateFrom) return false;
    if (query.dateTo && item.timestamp > query.dateTo) return false;
    return true;
  });
}

export async function getAuditLogs(query?: AuditQuery): Promise<AuditLogDto[]> {
  return applyFilters([...auditState], query);
}

export async function getAuditLogById(id: string): Promise<AuditLogDto | null> {
  return auditState.find((item) => item.id === id) ?? null;
}

export async function appendAuditLog(payload: Omit<AuditLogDto, "id" | "timestamp">): Promise<AuditLogDto> {
  const next: AuditLogDto = {
    ...payload,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditState = [next, ...auditState];
  return next;
}
