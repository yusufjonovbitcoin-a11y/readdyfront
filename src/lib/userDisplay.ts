/** API `role` qiymati → ekranda ko‘rinadigan qisqa matn */
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Kasalxona admini",
  DOCTOR: "Shifokor",
  RECEPTION: "Qabulxona",
};

export function formatAppRoleLabel(role: string | null | undefined): string {
  if (!role?.trim()) return "—";
  return ROLE_LABELS[role] ?? role;
}

export function getUserInitials(name: string | null | undefined): string {
  const t = (name ?? "").trim();
  if (!t) return "??";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return t.slice(0, 2).toUpperCase();
}
