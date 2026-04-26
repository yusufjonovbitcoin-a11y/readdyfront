import type { ReactNode } from "react";
import type { PageState } from "@/hooks/usePageState";
import { useAnyDarkMode } from "@/context/useAnyDarkMode";

type PageStateBoundaryProps<T> = {
  state: Pick<PageState<T>, "status" | "data" | "error" | "reload">;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingFallback?: ReactNode;
  errorFallback?: (error: string, retry: () => void) => ReactNode;
  emptyFallback?: ReactNode;
  className?: string;
};

const defaultCardClassName = "rounded-xl border py-14 text-center";

function DefaultLoadingFallback({ className }: { className: string }) {
  return (
    <div className={className}>
      <i className="ri-loader-4-line always-spin text-2xl text-teal-500" aria-hidden="true" />
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );
}

function DefaultErrorFallback({
  className,
  error,
  retry,
}: {
  className: string;
  error: string;
  retry: () => void;
}) {
  return (
    <div className={className}>
      <i className="ri-error-warning-line text-2xl text-red-500" aria-hidden="true" />
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{error}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-4 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
      >
        Qayta yuklash
      </button>
    </div>
  );
}

function DefaultEmptyFallback({ className }: { className: string }) {
  return (
    <div className={className}>
      <i className="ri-inbox-line text-2xl text-gray-400" aria-hidden="true" />
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Hozircha ma'lumot mavjud emas.</p>
    </div>
  );
}

export default function PageStateBoundary<T>({
  state,
  children,
  isEmpty,
  loadingFallback,
  errorFallback,
  emptyFallback,
  className = defaultCardClassName,
}: PageStateBoundaryProps<T>) {
  const darkMode = useAnyDarkMode();
  const resolvedClassName =
    className === defaultCardClassName
      ? `${defaultCardClassName} ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`
      : className;

  if (state.status === "loading") {
    return <>{loadingFallback ?? <DefaultLoadingFallback className={resolvedClassName} />}</>;
  }

  if (state.status === "error") {
    const errorMessage = state.error ?? "Ma'lumotlarni yuklashda xatolik yuz berdi.";
    const retry = () => {
      void state.reload();
    };
    return (
      <>
        {errorFallback
          ? errorFallback(errorMessage, retry)
          : <DefaultErrorFallback className={resolvedClassName} error={errorMessage} retry={retry} />}
      </>
    );
  }

  if (state.data === null) {
    return <>{emptyFallback ?? <DefaultEmptyFallback className={resolvedClassName} />}</>;
  }

  if (isEmpty?.(state.data)) {
    return <>{emptyFallback ?? <DefaultEmptyFallback className={resolvedClassName} />}</>;
  }

  return <>{children(state.data)}</>;
}
