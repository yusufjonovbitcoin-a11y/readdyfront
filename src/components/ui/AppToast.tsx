import type { AppToastState } from "@/hooks/useAppToast";

type AppToastProps = {
  toast: AppToastState;
};

export default function AppToast({ toast }: AppToastProps) {
  if (!toast) return null;

  const isError = toast.tone === "error";
  const className =
    toast.tone === "success"
      ? "bg-emerald-500 text-white"
      : toast.tone === "info"
        ? "bg-sky-600 text-white"
        : "bg-red-500 text-white";

  return (
    <div className="fixed inset-x-3 top-4 z-50 sm:inset-x-auto sm:top-20 sm:right-6">
      <div
        key={toast.id}
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
        aria-atomic="true"
        className={`w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${className}`}
      >
        {toast.message}
      </div>
    </div>
  );
}
