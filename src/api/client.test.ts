// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/sessionSignals", () => ({
  emitSessionFailure: vi.fn(),
}));

import { apiRequest, AuthError } from "@/api/client";
import { emitSessionFailure } from "@/auth/sessionSignals";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("retries original request after successful refresh on 401", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ message: "Token expired" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ ok: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ data: 123 }),
      } as Response);

    const result = await apiRequest<{ data: number }>("/api/protected");

    expect(result).toEqual({ data: 123 });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/auth/refresh"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/api/protected"),
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("throws AuthError when refresh fails", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ message: "Token expired" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "",
      } as Response);

    await expect(apiRequest("/api/protected")).rejects.toBeInstanceOf(AuthError);
    expect(emitSessionFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "unauthorized", status: 401 }),
    );
  });

  it("emits session failure after retried request still returns 401", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ message: "Token expired" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ ok: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ message: "Still unauthorized" }),
      } as Response);

    await expect(apiRequest("/api/protected")).rejects.toBeInstanceOf(AuthError);

    expect(emitSessionFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "unauthorized", status: 401 }),
    );
  });
});
