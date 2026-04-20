import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  getStoredUser: vi.fn(),
}));

vi.mock("@/auth/sessionSignals", () => ({
  emitSessionFailure: vi.fn(),
}));

import { apiRequest } from "@/api/client";
import { getStoredUser } from "@/hooks/useAuth";
import { emitSessionFailure } from "@/auth/sessionSignals";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends bearer token when stored user exists", async () => {
    vi.mocked(getStoredUser).mockReturnValue({
      id: "u-1",
      name: "A",
      email: "a@a.com",
      role: "SUPER_ADMIN",
      avatar: "AA",
      token: "token-123",
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    } as Response);

    await apiRequest<{ ok: boolean }>("/api/demo");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/demo"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws normalized error and emits session failure on 401", async () => {
    vi.mocked(getStoredUser).mockReturnValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ message: "Token expired" }),
    } as Response);

    await expect(apiRequest("/api/protected")).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        message: "Token expired",
      }),
    );
    expect(emitSessionFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "unauthorized", status: 401 }),
    );
  });
});
