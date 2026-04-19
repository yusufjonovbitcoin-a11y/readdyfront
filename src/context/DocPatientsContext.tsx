import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { docPatients, type DocPatient } from "@/mocks/doc_patients";
import { formatLocalYMD } from "@/utils/date";

/** Navbatdagi bemorlarning yangi tartib bo‘yicha id ro‘yxati (to‘liq navbat) */
function applyQueueOrder(prev: DocPatient[], orderedQueueIds: string[]): DocPatient[] {
  const queueInPrev = prev.filter((p) => p.status === "queue");
  if (orderedQueueIds.length !== queueInPrev.length) return prev;
  const idSet = new Set(orderedQueueIds);
  if (!queueInPrev.every((p) => idSet.has(p.id))) return prev;

  const nextQueue = orderedQueueIds.map((id, i) => {
    const p = prev.find((x) => x.id === id);
    if (!p) return null;
    return { ...p, queueNumber: i + 1 };
  });
  if (nextQueue.some((x) => x === null)) return prev;

  let k = 0;
  return prev.map((p) => {
    if (p.status !== "queue") return p;
    return nextQueue[k++] as DocPatient;
  });
}

interface DocPatientsContextValue {
  patients: DocPatient[];
  updatePatient: (id: string, patch: Partial<DocPatient>) => void;
  reorderQueuePatients: (orderedQueueIds: string[]) => void;
}

const DocPatientsContext = createContext<DocPatientsContextValue | null>(null);

export function DocPatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<DocPatient[]>(() => docPatients.map((p) => ({ ...p })));

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
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const reorderQueuePatients = useCallback((orderedQueueIds: string[]) => {
    setPatients((prev) => applyQueueOrder(prev, orderedQueueIds));
  }, []);

  const value = useMemo(
    () => ({ patients, updatePatient, reorderQueuePatients }),
    [patients, updatePatient, reorderQueuePatients],
  );

  return <DocPatientsContext.Provider value={value}>{children}</DocPatientsContext.Provider>;
}

export function useDocPatients(): DocPatientsContextValue {
  const ctx = useContext(DocPatientsContext);
  if (!ctx) {
    throw new Error("useDocPatients must be used within DocPatientsProvider");
  }
  return ctx;
}
