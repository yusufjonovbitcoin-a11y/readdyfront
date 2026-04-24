import type { RefObject } from "react";
import { useModalA11y } from "@/hooks/useModalA11y";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  darkMode?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  confirmTone?: "danger" | "primary";
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
}

const DIALOG_INERT_SELECTORS = ["header", "main", "aside"];

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  darkMode = false,
  triggerRef,
  confirmTone = "danger",
  confirmDisabled = false,
  cancelDisabled = false,
}: ConfirmDialogProps) {
  const dialogRef = useModalA11y({
    isOpen: open,
    onClose: onCancel,
    triggerRef,
    inertSelectors: DIALOG_INERT_SELECTORS,
  });

  if (!open) return null;

  const confirmBtnClass =
    confirmTone === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-teal-500 hover:bg-teal-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl p-6 ${darkMode ? "bg-[#141824]" : "bg-white"}`}
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
          <i className="ri-delete-bin-line text-red-500 text-xl"></i>
        </div>
        <h3 id="confirm-dialog-title" className={`text-base font-bold text-center mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>
        <p className={`text-sm text-center mb-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelDisabled}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${cancelDisabled ? "" : "cursor-pointer"} ${darkMode ? "bg-[#1A2235] text-gray-300" : "bg-gray-100 text-gray-700"}`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`flex-1 min-h-[44px] rounded-lg ${confirmBtnClass} text-white text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${confirmDisabled ? "" : "cursor-pointer"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

