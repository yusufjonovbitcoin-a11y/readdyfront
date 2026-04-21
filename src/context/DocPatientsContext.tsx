import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialDocPatients, type DocPatient } from "@/api/services/docPatients.service";
import { formatLocalYMD } from "@/utils/date";

/** Navbatdagi bemorlar uchun reorder: to‘liq yoki ko‘rinayotgan subset id ro‘yxatini qabul qiladi */
function applyQueueOrder(prev: DocPatient[], orderedQueueIds: string[]): DocPatient[] {
  if (orderedQueueIds.length === 0) return prev;

  const queueInPrev = prev.filter((p) => p.status === "queue");
  const queueIdSet = new Set(queueInPrev.map((p) => p.id));
  const orderedSet = new Set(orderedQueueIds);

  // DnD source might be a visible subset; reject invalid/duplicated ids only.
  if (orderedSet.size !== orderedQueueIds.length) return prev;
  if (orderedQueueIds.some((id) => !queueIdSet.has(id))) return prev;

  const orderedSubset = orderedQueueIds
    .map((id) => queueInPrev.find((p) => p.id === id))
    .filter((p): p is DocPatient => Boolean(p));

  if (orderedSubset.length !== orderedQueueIds.length) return prev;

  let subsetIndex = 0;
  const next = prev.map((p) => {
    if (p.status !== "queue") return p;
    if (!orderedSet.has(p.id)) return p;
    return orderedSubset[subsetIndex++];
  });

  return normalizeQueueNumbers(next);
}

function normalizeQueueNumbers(prev: DocPatient[]): DocPatient[] {
  let queueIndex = 1;
  return prev.map((p) => {
    if (p.status !== "queue") return p;
    return { ...p, queueNumber: queueIndex++ };
  });
}

interface DocPatientsContextValue {
  patients: DocPatient[];
  updatePatient: (id: string, patch: Partial<DocPatient>) => void;
  reorderQueuePatients: (orderedQueueIds: string[]) => void;
  transitionPatientStatus: (id: string, nextStatus: DocPatient["status"]) => void;
}

const DocPatientsContext = createContext<DocPatientsContextValue | null>(null);

export function DocPatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<DocPatient[]>(() => getInitialDocPatients());

  /** Kun almashganda bugundan oldingi kunlar bo'yicha faol bemorlarni tarixga */
  useEffect(() => {
    const archivePastDays = () => {
      const today = formatLocalYMD();
      setPatients((prev) => {
        let changed = false;
        const next = prev.map((p) => {
          if (p.status === "history") return p;
          if (p.date < today) {
            changed = true;
            return { ...p, status: "history" as const };
          }
          return p;
        });
        return changed ? next : prev;
      });
    };
    archivePastDays();
    const id = window.setInterval(archivePastDays, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const updatePatient = useCallback((id: string, patch: Partial<DocPatient>) => {
    setPatients((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      return normalizeQueueNumbers(next);
    });
  }, []);

  const reorderQueuePatients = useCallback((orderedQueueIds: string[]) => {
    setPatients((prev) => applyQueueOrder(prev, orderedQueueIds));
  }, []);

  const transitionPatientStatus = useCallback((id: string, nextStatus: DocPatient["status"]) => {
    setPatients((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;

        if (nextStatus === "in_progress") {
          return { ...p, status: "in_progress" as const, queueNumber: 0 };
        }
        if (nextStatus === "completed") {
          return {
            ...p,
            status: "completed" as const,
            queueNumber: 0,
            consultationDuration: p.consultationDuration > 0 ? p.consultationDuration : 15,
          };
        }
        if (nextStatus === "history") {
          return { ...p, status: "history" as const, queueNumber: 0 };
        }
        return { ...p, status: "queue" as const };
      });
      return normalizeQueueNumbers(next);
    });
  }, []);

  const value = useMemo(
    () => ({ patients, updatePatient, reorderQueuePatients, transitionPatientStatus }),
    [patients, updatePatient, reorderQueuePatients, transitionPatientStatus],
  );

  return <DocPatientsContext.Provider value={value}>{children}</DocPatientsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDocPatients(): DocPatientsContextValue {
  const ctx = useContext(DocPatientsContext);
  if (!ctx) {
    throw new Error("useDocPatients must be used within DocPatientsProvider");
  }
  return ctx;
}
