import { apiRequest } from "@/api/client";
import type { AuditLogDto, AuditQuery } from "@/api/types/audit.types";

function toQueryString(query?: AuditQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export async function getAuditLogs(query?: AuditQuery): Promise<AuditLogDto[]> {
  return apiRequest<AuditLogDto[]>(`/api/audit-logs${toQueryString(query)}`);
}

export async function getAuditLogById(id: string): Promise<AuditLogDto | null> {
  return apiRequest<AuditLogDto | null>(`/api/audit-logs/${encodeURIComponent(id)}`);
}

export async function appendAuditLog(payload: Omit<AuditLogDto, "id" | "timestamp">): Promise<AuditLogDto> {
  return apiRequest<AuditLogDto>("/api/audit-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
