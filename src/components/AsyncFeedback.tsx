import { useEffect, useState } from "react";
import type { AsyncState } from "@/hooks/useAsync";

interface AsyncFeedbackProps<T> {
  state: AsyncState<T>;
  onRetry?: () => void;
}

export default function AsyncFeedback<T>({ state, onRetry }: AsyncFeedbackProps<T>) {
  const [showSuccess, setShowSuccess] = useState(false);
  const politeAnnouncementProps = { role: "status" as const, "aria-live": "polite" as const };
  const assertiveAnnouncementProps = { role: "alert" as const, "aria-live": "assertive" as const };

  useEffect(() => {
    if (state.status !== "success") return;
    setShowSuccess(true);
    const timer = window.setTimeout(() => setShowSuccess(false), 3000);
    return () => window.clearTimeout(timer);
  }, [state.status]);

  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div
        {...politeAnnouncementProps}
        className="fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg bg-[#1A2235] text-white flex items-center gap-2"
      >
        <i className="ri-loader-4-line always-spin text-base" aria-hidden="true" />
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  if (state.status === "success" && showSuccess) {
    const successText =
      typeof state.data === "string" && state.data.trim().length > 0 ? state.data : "Amal muvaffaqiyatli bajarildi.";
    return (
      <div
        {...politeAnnouncementProps}
        className="fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg bg-emerald-500 text-white"
      >
        {successText}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        {...assertiveAnnouncementProps}
        className="fixed top-20 right-6 z-50 max-w-sm px-4 py-3 rounded-lg text-sm shadow-lg bg-red-50 border border-red-200 text-red-700"
      >
        <div className="flex items-start gap-2">
          <i className="ri-error-warning-line text-base mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium">{state.error ?? "Xatolik yuz berdi."}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 text-xs font-semibold underline cursor-pointer"
              >
                Qayta urinish
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
