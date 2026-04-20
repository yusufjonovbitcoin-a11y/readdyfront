export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "SETTINGS_CHANGE"
  | "PASSWORD_CHANGE"
  | "ROLE_CHANGE";

export type AuditResource =
  | "AUTH"
  | "DOCTOR"
  | "PATIENT"
  | "HOSPITAL"
  | "USER"
  | "QUESTION"
  | "ANALYTICS"
  | "SETTINGS";

export type AuditRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";
export type AuditStatus = "success" | "failed" | "warning";

export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  role: AuditRole;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  detail: string;
  ip: string;
  userAgent: string;
  hospitalId?: string;
  hospitalName?: string;
  timestamp: string;
  status: AuditStatus;
}

export interface AuditQuery {
  userId?: string;
  role?: AuditRole;
  action?: AuditAction;
  status?: AuditStatus;
  dateFrom?: string;
  dateTo?: string;
}
