import { useCallback, useEffect, useRef, useState } from "react";

export type AppToastTone = "success" | "info" | "error";

export type AppToastState = {
  id: number;
  message: string;
  tone: AppToastTone;
} | null;

export function useAppToast(defaultDurationMs = 3000) {
  const [toast, setToast] = useState<AppToastState>(null);
  const timerRef = useRef<number | null>(null);
  const idRef = useRef(0);

  const clearToast = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, tone: AppToastTone = "success", durationMs = defaultDurationMs) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      idRef.current += 1;
      setToast({ id: idRef.current, message, tone });
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setToast(null);
      }, durationMs);
    },
    [defaultDurationMs],
  );

  useEffect(() => clearToast, [clearToast]);

  return { toast, showToast, clearToast };
}
