import { useCallback, useEffect, useMemo, useState } from "react";

export type ViewMode = "card" | "table";

function normalizeMode(value: string | null | undefined): ViewMode | null {
  if (value === "card" || value === "table") return value;
  return null;
}

export function useViewMode(pageKey: string, defaultMode: ViewMode = "card") {
  const storageKey = useMemo(() => `medcore:view:${pageKey}`, [pageKey]);
  const [mode, setModeState] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = normalizeMode(raw);
      if (parsed) setModeState(parsed);
      else setModeState(defaultMode);
    } catch {
      setModeState(defaultMode);
    }
  }, [storageKey, defaultMode]);

  const setMode = useCallback(
    (nextMode: ViewMode) => {
      setModeState(nextMode);
      try {
        window.localStorage.setItem(storageKey, nextMode);
      } catch {
        // ignore storage write errors
      }
    },
    [storageKey],
  );

  return { mode, setMode };
}
