import { useEffect, useRef, type RefObject } from "react";

type UseModalA11yParams = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  inertSelectors?: string[];
  trapFocus?: boolean;
  lockScroll?: boolean;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type InertedElement = {
  el: HTMLElement;
  prevAriaHidden: string | null;
  prevInert: boolean;
};

function setElementInert(el: HTMLElement, inerted: InertedElement[]) {
  if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
  const prevAriaHidden = el.getAttribute("aria-hidden");
  const prevInert = Boolean(el.inert);
  el.setAttribute("aria-hidden", "true");
  el.inert = true;
  inerted.push({ el, prevAriaHidden, prevInert });
}

function inertOutsideModal(modalEl: HTMLElement): InertedElement[] {
  const inerted: InertedElement[] = [];
  let current: HTMLElement | null = modalEl;

  while (current?.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (!(sibling instanceof HTMLElement)) return;
      if (sibling === current) return;
      setElementInert(sibling, inerted);
    });
    if (parent === document.body) break;
    current = parent;
  }

  return inerted;
}

function restoreInertedElements(inerted: InertedElement[]) {
  inerted.forEach(({ el, prevAriaHidden, prevInert }) => {
    el.inert = prevInert;
    if (prevAriaHidden === null) {
      el.removeAttribute("aria-hidden");
    } else {
      el.setAttribute("aria-hidden", prevAriaHidden);
    }
  });
}

export function useModalA11y({
  isOpen,
  onClose,
  triggerRef,
  returnFocusRef,
  initialFocusRef,
  inertSelectors = [],
  trapFocus = true,
  lockScroll = true,
}: UseModalA11yParams) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousActive = (triggerRef?.current ?? returnFocusRef?.current ?? document.activeElement) as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    let inerted: InertedElement[] = [];
    /**
     * We intentionally ignore broad selector-based hiding here to avoid
     * accidentally hiding ancestors that contain the dialog itself.
     * If callers passed inertSelectors in old code, we treat it as "enable
     * background isolation" and apply a structural sibling-based strategy.
     */
    if (inertSelectors.length > 0 && containerRef.current) {
      inerted = inertOutsideModal(containerRef.current);
    }

    if (trapFocus) {
      const focusables = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      const first = initialFocusRef?.current ?? focusables[0];
      (first ?? containerRef.current)?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (!trapFocus || event.key !== "Tab") return;

      const currentFocusables = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      if (currentFocusables.length === 0) {
        event.preventDefault();
        containerRef.current?.focus();
        return;
      }

      const firstFocusable = currentFocusables[0];
      const lastFocusable = currentFocusables[currentFocusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === firstFocusable || !containerRef.current?.contains(active)) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else if (!active || active === lastFocusable || !containerRef.current?.contains(active)) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }
      restoreInertedElements(inerted);
      if (previousActive?.isConnected) {
        previousActive.focus();
      }
    };
  }, [isOpen, onClose, triggerRef, returnFocusRef, initialFocusRef, inertSelectors, trapFocus, lockScroll]);

  return containerRef;
}
