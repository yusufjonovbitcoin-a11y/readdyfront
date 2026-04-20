import { describe, expect, it } from "vitest";
import { normalizeRole, toLegacyUserRole } from "@/types/roles";

describe("roles mapping", () => {
  it("normalizes canonical and legacy role values", () => {
    expect(normalizeRole("SUPER_ADMIN")).toBe("SUPER_ADMIN");
    expect(normalizeRole("DOKTOR")).toBe("DOCTOR");
    expect(normalizeRole("QABULXONA")).toBe("RECEPTION");
  });

  it("returns null for unsupported role values", () => {
    expect(normalizeRole("ROOT")).toBeNull();
    expect(normalizeRole(42)).toBeNull();
  });

  it("maps canonical roles to legacy backend values", () => {
    expect(toLegacyUserRole("HOSPITAL_ADMIN")).toBe("HOSPITAL_ADMIN");
    expect(toLegacyUserRole("DOCTOR")).toBe("DOKTOR");
    expect(toLegacyUserRole("RECEPTION")).toBe("QABULXONA");
  });
});
