import { useState, type DragEvent } from "react";
import type { DoctorPatientDto as DocPatient } from "@/api/types/doctor.types";
import PatientCard from "./PatientCard";

const DND_TYPE = "application/x-readdynavbat-patient-id";

interface QueueDraggableGridProps {
  patients: DocPatient[];
  darkMode: boolean;
  onReorder: (orderedIds: string[]) => void;
}

export default function QueueDraggableGrid({
  patients,
  darkMode,
  onReorder,
}: QueueDraggableGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => (e: DragEvent) => {
    e.dataTransfer.setData(DND_TYPE, id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const handleDragOver = (id: string) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggingId && draggingId !== id) setOverId(id);
  };

  const handleDrop = (targetId: string) => (e: DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData(DND_TYPE) || draggingId;
    setDraggingId(null);
    setOverId(null);
    if (!sourceId || sourceId === targetId) return;

    const ids = patients.map((p) => p.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;

    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    onReorder(next);
  };

  const ringOver = overId && draggingId && overId !== draggingId;
  const offsetCls = darkMode ? "ring-offset-[#0D1117]" : "ring-offset-[#F4F6FB]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          draggable
          onDragStart={handleDragStart(patient.id)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver(patient.id)}
          onDrop={handleDrop(patient.id)}
          className={`rounded-xl transition-shadow duration-150 cursor-grab active:cursor-grabbing ${
            draggingId === patient.id ? "opacity-70" : ""
          } ${ringOver && overId === patient.id ? `ring-2 ring-violet-500 ring-offset-2 ${offsetCls}` : ""}`}
        >
          <PatientCard patient={patient} darkMode={darkMode} />
        </div>
      ))}
    </div>
  );
}
