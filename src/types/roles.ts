export type AppRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "RECEPTION";

const LEGACY_TO_CANONICAL: Record<string, AppRole> = {
  DOKTOR: "DOCTOR",
  QABULXONA: "RECEPTION",
};

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  if (value === "SUPER_ADMIN" || value === "HOSPITAL_ADMIN" || value === "DOCTOR" || value === "RECEPTION") {
    return value;
  }
  return LEGACY_TO_CANONICAL[value] ?? null;
}

export function toLegacyUserRole(role: Extract<AppRole, "HOSPITAL_ADMIN" | "DOCTOR" | "RECEPTION">): "HOSPITAL_ADMIN" | "DOKTOR" | "QABULXONA" {
  if (role === "DOCTOR") return "DOKTOR";
  if (role === "RECEPTION") return "QABULXONA";
  return role;
}
