import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import OnboardingWidget, { type OnboardingAnswers } from "@/components/OnboardingWidget";

export interface MedicalBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Eski 3 qadamli so‘rovnoma; `children` berilsa ishlatilmaydi */
  onComplete?: (answers: OnboardingAnswers) => void;
  /** Check-in AI triage suhbati kabi maxsus kontent */
  children?: ReactNode;
  /** Orqa fon bosilganda `onClose` (oddiy yoki check-in chat uchun o‘chirish mumkin). */
  closeOnBackdropClick?: boolean;
  /**
   * `fixed` — butun ko‘rinish (demo / to‘liq ekran).
   * `contained` — faqat `position: relative` ota ichida (masalan, AI chat xabarlar zonasi).
   */
  mountStyle?: "fixed" | "contained";
  className?: string;
}

/**
 * Pastdan chiqadigan panel: `children` bo‘lsa AI triage suhbati, aks holda `OnboardingWidget`.
 */
export default function MedicalBottomSheet({
  isOpen,
  onClose,
  onComplete,
  children,
  closeOnBackdropClick = true,
  mountStyle = "fixed",
  className = "",
}: MedicalBottomSheetProps) {
  const { t } = useTranslation("checkin");

  useEffect(() => {
    if (!isOpen || mountStyle !== "fixed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, mountStyle]);

  if (!isOpen) return null;

  const overlayPosition =
    mountStyle === "contained"
      ? "absolute inset-0 z-20 flex flex-col justify-end"
      : "fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4";

  return (
    <div
      className={`pointer-events-none ${overlayPosition} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={
        children
          ? t("checkin:ai.triage.sheetAriaLabel", { defaultValue: "AI suhbat" })
          : t("checkin:ai.onboarding.sheetAriaLabel", {
              defaultValue: "Oldindan savollar",
            })
      }
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 pointer-events-auto cursor-default sm:rounded-none"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-label={t("checkin:ai.onboarding.close", { defaultValue: "Yopish" })}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto pointer-events-auto flex flex-col max-h-[min(85vh,720px)] sm:max-h-[85vh]">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] sm:shadow-2xl overflow-hidden flex flex-col max-h-[inherit]">
          <div className="shrink-0 w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" aria-hidden />

          <div className="overflow-y-auto px-4 pb-5 pt-1 sm:pt-4">
            {children ?? (
              <OnboardingWidget
                onComplete={onComplete!}
                onClose={onClose}
                className="rounded-xl border border-violet-100/80 bg-gradient-to-b from-violet-50/60 to-white shadow-sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
