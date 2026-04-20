import { useCallback, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type AsyncState<T> = {
  status: AsyncStatus;
  data?: T;
  error?: string;
};

type HttpLikeError = {
  status?: number;
  message?: string;
  data?: unknown;
};

function toHumanReadableError(error: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "Internet aloqasi yo'q. Tarmoqni tekshirib qayta urinib ko'ring.";
  }

  if (error && typeof error === "object") {
    const httpErr = error as HttpLikeError;
    if (typeof httpErr.message === "string" && httpErr.message.trim().length > 0) {
      return httpErr.message;
    }
    if (typeof httpErr.status === "number") {
      if (httpErr.status === 409) return "Ma'lumot ziddiyati aniqlandi. Ma'lumotni yangilab, qayta urinib ko'ring.";
      if (httpErr.status >= 500) return "Serverda vaqtinchalik xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
      if (httpErr.status === 401 || httpErr.status === 403) return "Sizda bu amalni bajarish huquqi yo'q.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Amalni bajarishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
}

/**
 * Generic async state manager for mutation/fetch flows.
 * Wrap any async operation with execute() to get loading/success/error states.
 */
export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | undefined> => {
    setState({ status: "loading" });
    try {
      const data = await operation();
      setState({ status: "success", data });
      return data;
    } catch (error) {
      setState({ status: "error", error: toHumanReadableError(error) });
      return undefined;
    }
  }, []);

  return [state, execute] as const;
}
