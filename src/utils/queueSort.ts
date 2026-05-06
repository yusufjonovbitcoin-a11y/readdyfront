import type { DoctorPatientDto } from "@/api/types/doctor.types";

/** "HH:mm" (masalan 13:01) → kun boshidan daqiqalar */
export function parseQueueTimeToMinutes(queueTime: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(queueTime.trim());
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return 0;
  return h * 60 + min;
}

/** Navbat: avvalo ro‘yxatdan o‘tgan vaqt, keyin server queueNumber, keyin id */
export function compareDoctorPatientsByQueueChronology(
  a: DoctorPatientDto,
  b: DoctorPatientDto,
): number {
  const ta = parseQueueTimeToMinutes(a.queueTime);
  const tb = parseQueueTimeToMinutes(b.queueTime);
  if (ta !== tb) return ta - tb;
  if (a.queueNumber !== b.queueNumber) return a.queueNumber - b.queueNumber;
  return a.id.localeCompare(b.id);
}
