import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialDocPatients, type DocPatient } from "@/api/services/docPatients.service";
import { getDoctorPatients, updateDoctorPatientWorkflow } from "@/api/doctor";

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
  transitionPatientStatus: (
    id: string,
    nextStatus: DocPatient["status"],
    extra?: { notes?: string; diagnosis?: string; consultationDuration?: number },
  ) => Promise<void>;
}

const DocPatientsContext = createContext<DocPatientsContextValue | null>(null);

export function DocPatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<DocPatient[]>(() => getInitialDocPatients());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const serverPatients = await getDoctorPatients();
        if (cancelled) return;
        if (Array.isArray(serverPatients) && serverPatients.length > 0) {
          setPatients(serverPatients);
        }
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const transitionPatientStatus = useCallback(
    async (
      id: string,
      nextStatus: DocPatient["status"],
      extra?: { notes?: string; diagnosis?: string; consultationDuration?: number },
    ) => {
      const prevSnapshot = patients;
      setPatients((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            status: nextStatus,
            queueNumber: nextStatus === "queue" ? p.queueNumber : 0,
            notes: extra?.notes ?? p.notes,
            diagnosis: extra?.diagnosis ?? p.diagnosis,
            consultationDuration:
              extra?.consultationDuration ??
              (nextStatus === "completed"
                ? p.consultationDuration > 0
                  ? p.consultationDuration
                  : 15
                : p.consultationDuration),
          };
        });
        return normalizeQueueNumbers(next);
      });

      try {
        const updated = await updateDoctorPatientWorkflow(id, {
          status: nextStatus,
          notes: extra?.notes,
          diagnosis: extra?.diagnosis,
          consultationDuration: extra?.consultationDuration,
        });
        setPatients((prev) =>
          normalizeQueueNumbers(prev.map((p) => (p.id === id ? { ...p, ...updated } : p))),
        );
      } catch {
        setPatients(prevSnapshot);
      }
    },
    [patients],
  );

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
