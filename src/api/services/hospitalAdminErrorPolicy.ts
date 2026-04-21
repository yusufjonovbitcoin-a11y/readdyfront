import { ApiContractError } from "@/api/errors";

export function toHospitalAdminUserMessage(error: unknown): string {
  if (error instanceof ApiContractError && error.area === "hospital-admin") {
    return "Server javobi kutilgan formatda emas. Iltimos, keyinroq qayta urinib ko'ring yoki qo'llab-quvvatlashga murojaat qiling.";
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status === 0) {
      return "Tarmoq bilan bog'lanishda muammo yuz berdi. Internet ulanishini tekshirib qayta urinib ko'ring.";
    }
    if (status >= 500) {
      return "Serverda vaqtinchalik xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.";
    }
  }
  return "";
}
