// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/auth", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}));

import { bootstrapAuth } from "@/hooks/useAuth";
import { getCurrentUser } from "@/api/auth";

describe("bootstrapAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed when /auth/me returns null", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const result = await bootstrapAuth();
    expect(result).toEqual({ status: "anonymous", reason: "server_rejected" });
  });

  it("fails closed when /auth/me validation fails", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("network"));
    const result = await bootstrapAuth();
    expect(result).toEqual({ status: "anonymous", reason: "validation_failed" });
  });

  it("authenticates when /auth/me returns valid user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u-1",
      name: "Admin User",
      email: "admin@medcore.local",
      role: "SUPER_ADMIN",
      avatar: "AU",
    });

    const result = await bootstrapAuth();

    expect(result.status).toBe("authenticated");
    if (result.status === "authenticated") {
      expect(result.user.id).toBe("u-1");
      expect(result.user.role).toBe("SUPER_ADMIN");
      expect(result.source).toBe("server");
    }
  });
});
