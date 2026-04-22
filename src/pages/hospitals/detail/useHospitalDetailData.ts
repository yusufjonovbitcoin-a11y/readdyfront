import { useCallback, useMemo } from "react";
import { getHospitalById } from "@/api/hospitals";
import { getDoctors, getDoctorAnalytics, getDoctorPatients } from "@/api/doctor";
import type { Hospital } from "@/types";
import type { DoctorDto, DoctorPatientDto, DoctorAnalyticsDto } from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";

type HospitalDetailPayload = {
  hospital: Hospital | null;
  doctors: DoctorDto[];
  patients: DoctorPatientDto[];
  dailyData: DoctorAnalyticsDto[];
};

const EMPTY_DETAIL_PAYLOAD: HospitalDetailPayload = {
  hospital: null,
  doctors: [],
  patients: [],
  dailyData: [],
};

const isValidHospitalId = (value?: string) => Boolean(value && (/^hosp-\d+$/.test(value) || /^[0-9a-f-]{36}$/i.test(value)));

export function useHospitalDetailData(id: string | undefined, patientSearch: string) {
  const fetchDetail = useCallback(async (): Promise<HospitalDetailPayload> => {
    if (!isValidHospitalId(id)) return EMPTY_DETAIL_PAYLOAD;
    const hospitalId = id as string;
    const [hospital, allDoctors, allPatients, analytics] = await Promise.all([
      getHospitalById(hospitalId),
      getDoctors(),
      getDoctorPatients(),
      getDoctorAnalytics(),
    ]);
    if (!hospital) {
      return { ...EMPTY_DETAIL_PAYLOAD, dailyData: analytics };
    }
    const hospitalAliasId = hospital.id.startsWith("hosp-") ? hospital.id : `hosp-00${hospital.id}`;
    const doctors = allDoctors.filter((doctor) => doctor.hospitalId === hospital.id || doctor.hospitalId === hospitalAliasId);
    const doctorIds = new Set(doctors.map((doctor) => doctor.id));
    const patients = allPatients.filter((patient) =>
      patient.hospitalId === hospital.id ||
      patient.hospitalId === hospitalAliasId ||
      doctorIds.has(patient.doctorId),
    );
    return { hospital, doctors, patients, dailyData: analytics };
  }, [id]);

  const pageState = usePageState(fetchDetail);
  const hospital = pageState.data?.hospital ?? null;
  const doctors = useMemo(() => pageState.data?.doctors ?? [], [pageState.data?.doctors]);

  const doctorNameById = useMemo(() => {
    const m = new Map<string, string>();
    doctors.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [doctors]);

  const patients = useMemo(
    () =>
      (pageState.data?.patients ?? [])
        .filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch))
        .map((p) => ({
          ...p,
          dob: "-",
          lastVisit: p.date,
          status: p.status === "history" ? "discharged" : "active",
          doctorName: doctorNameById.get(p.doctorId) ?? "-",
          genderLabel: p.gender === "male" ? "Erkak" : "Ayol",
        })),
    [doctorNameById, pageState.data?.patients, patientSearch],
  );

  const dailyData = pageState.data?.dailyData ?? [];

  return { pageState, hospital, doctors, patients, dailyData };
}
