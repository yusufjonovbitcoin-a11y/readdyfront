import { useCallback, useEffect, useRef, useState } from "react";
import type { AsyncStatus } from "@/hooks/useAsync";

export type PageState<T> = {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  reload: () => Promise<void>;
};

function toPageErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Ma'lumotlarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.";
}

export function usePageState<T>(fetchFn: () => Promise<T>): PageState<T> {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const load = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetchFn();

      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setData(response);
      setStatus("success");
    } catch (err) {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setStatus("error");
      setError(toPageErrorMessage(err));
    }
  }, [fetchFn]);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, data, error, reload: load };
}
