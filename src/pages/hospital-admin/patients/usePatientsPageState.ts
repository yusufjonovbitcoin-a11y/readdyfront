import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { DoctorDto } from "@/api/types/doctor.types";
import type { HAPatient } from "@/api/services/hospitalAdminData.service";

export interface PatientFormData {
  name: string;
  phone: string;
  age: string;
  gender: "male" | "female";
  doctorId: string;
  diagnosis: string;
  status: "active" | "discharged" | "scheduled";
}

export function usePatientsPageState(initialDoctors: DoctorDto[], initialPatients: HAPatient[]) {
  const haDoctors = useMemo(() => initialDoctors, [initialDoctors]);
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [patients, setPatients] = useState<HAPatient[]>(initialPatients);
  const [search, setSearch] = useState(qParam);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "discharged" | "scheduled">("all");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<HAPatient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dischargeDetailPatient, setDischargeDetailPatient] = useState<HAPatient | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      if (currentQ === search) return;

      const nextParams = new URLSearchParams(searchParams);
      if (search) nextParams.set("q", search);
      else nextParams.delete("q");

      setSearchParams(nextParams, { replace: true });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchParams, setSearchParams]);

  const doctorById = useMemo(() => {
    const map = new Map<string, string>();
    haDoctors.forEach((doctor) => {
      map.set(doctor.id, doctor.name);
    });
    return map;
  }, [haDoctors]);

  const searchLower = useMemo(() => search.toLowerCase(), [search]);

  const pool = useMemo(
    () =>
      patients.filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(searchLower) ||
          p.phone.includes(search) ||
          p.diagnosis.toLowerCase().includes(searchLower);
        const matchGender = filterGender === "all" || p.gender === filterGender;
        const matchDoctor = filterDoctor === "all" || p.doctorId === filterDoctor;
        return matchSearch && matchGender && matchDoctor;
      }),
    [patients, searchLower, search, filterGender, filterDoctor],
  );

  const filtered = useMemo(
    () => (filterStatus === "all" ? pool : pool.filter((p) => p.status === filterStatus)),
    [pool, filterStatus],
  );

  const statusCounts = useMemo(
    () =>
      pool.reduce(
        (acc, patient) => {
          acc[patient.status] += 1;
          return acc;
        },
        { active: 0, scheduled: 0, discharged: 0 },
      ),
    [pool],
  );

  const totalPages = useMemo(() => Math.ceil(filtered.length / perPage), [filtered.length, perPage]);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  useEffect(() => {
    const maxPage = Math.max(totalPages, 1);
    setPage((prev) => {
      const next = Math.min(Math.max(prev, 1), maxPage);
      return prev === next ? prev : next;
    });
  }, [totalPages, perPage]);

  const handleSave = useCallback((data: PatientFormData) => {
    const ageNumber = Number(data.age);
    const safeAge = Number.isFinite(ageNumber) ? ageNumber : 0;
    const doctorName = doctorById.get(data.doctorId);
    if (editingPatient) {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingPatient.id
            ? {
                ...p,
                ...data,
                age: safeAge,
                doctorName: doctorName || p.doctorName,
              }
            : p,
        ),
      );
    } else {
      const newP: HAPatient = {
        id: `pat-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        age: safeAge,
        gender: data.gender,
        doctorId: data.doctorId,
        doctorName: doctorName || "",
        lastVisit: new Date().toISOString().split("T")[0],
        nextVisit: null,
        diagnosis: data.diagnosis,
        status: data.status,
        hospitalId: "hosp-001",
        visitCount: 1,
      };
      setPatients((prev) => [newP, ...prev]);
    }
    setShowModal(false);
    setEditingPatient(null);
  }, [doctorById, editingPatient]);

  const handleDelete = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }, []);

  return {
    patients,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterGender,
    setFilterGender,
    filterDoctor,
    setFilterDoctor,
    showModal,
    setShowModal,
    editingPatient,
    setEditingPatient,
    deleteConfirm,
    setDeleteConfirm,
    dischargeDetailPatient,
    setDischargeDetailPatient,
    page,
    setPage,
    perPage,
    pool,
    filtered,
    statusCounts,
    totalPages,
    paginated,
    handleSave,
    handleDelete,
  };
}
