import { useCallback, useEffect, useState } from "react";

export type PatientDetailLayoutMode = "scroll" | "tabs";

const STORAGE_KEY = "doc-patient-detail-layout";

function readStored(): PatientDetailLayoutMode {
  if (typeof window === "undefined") {
    return "scroll";
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "tabs") return "tabs";
  } catch {
    /* ignore */
  }
  return "scroll";
}

function persist(next: PatientDetailLayoutMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

export function usePersistedPatientDetailLayout(): [PatientDetailLayoutMode, (next: PatientDetailLayoutMode) => void] {
  const [mode, setModeState] = useState<PatientDetailLayoutMode>(() => readStored());

  const setMode = useCallback((next: PatientDetailLayoutMode) => {
    setModeState((prev) => {
      if (prev === next) return prev;
      persist(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setModeState(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return [mode, setMode];
}
