import type { UserDto } from "@/api/types/users.types";

type AdminTranslate = (key: string) => string;

/** Kartada / jadvalda / tafsilotda ko‘rinadigan inson o‘qiydigan rol matni */
export function getUserRoleDisplayLabel(t: AdminTranslate, u: Pick<UserDto, "role" | "isSuperAdmin">): string {
  if (u.isSuperAdmin) return t("users.roles.display.superAdmin");
  switch (u.role) {
    case "HOSPITAL_ADMIN":
      return t("users.roles.display.hospitalAdmin");
    case "DOCTOR":
      return t("users.roles.display.doctor");
    case "RECEPTION":
      return t("users.roles.display.reception");
    default:
      return u.role;
  }
}
