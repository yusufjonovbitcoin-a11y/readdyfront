import type { AdminChatGroup } from "@/mocks/adminChatGroups";

/** API / UI bo'lim nomi bilan mock chatdagi `specialty` moslashuvi */
export function deptNameMatchesSpecialty(deptName: string, specialty: string): boolean {
  const d = deptName.trim().toLowerCase();
  const s = specialty.trim().toLowerCase();
  if (!d || !s) return false;
  if (d === s) return true;
  if (d.includes(s) || s.includes(d)) return true;
  const norm = (x: string) => x.normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, "");
  const nd = norm(d);
  const ns = norm(s);
  return nd.includes(ns) || ns.includes(nd);
}

/** Kasalxona admini: faqat o'z kasalxonasi va berilgan bo'limlar chatlari */
export function filterHospitalAdminChatGroups(
  all: AdminChatGroup[],
  hospitalId: string | undefined,
  departmentNames: string[],
): AdminChatGroup[] {
  const hid = hospitalId?.trim();
  if (!hid) return [];
  const atHospital = all.filter((g) => g.hospitalId === hid);
  const names = departmentNames.map((n) => n.trim()).filter(Boolean);
  if (!names.length) return [];
  return atHospital.filter((g) => names.some((dn) => deptNameMatchesSpecialty(dn, g.specialty)));
}
