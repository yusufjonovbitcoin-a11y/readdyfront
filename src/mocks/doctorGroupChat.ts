/**
 * Doctor guruh chat mocklari — UI `@/mocks/doctorGroupChat` dan import qiladi.
 * Ma'lumot manbai: `doctorChat.ts` dagi `getDoctorGroupChannel()`.
 */
import {
  getDoctorGroupChannel,
  statusColors,
  statusLabels,
  type DoctorGroup,
  type GroupMember,
  type GroupMessage,
} from "./doctorChat";

export type { GroupMessage, GroupMember, DoctorGroup };
export { statusColors, statusLabels };

function cloneGroup(): DoctorGroup {
  const g = getDoctorGroupChannel();
  return { ...g, members: [...g.members], messages: [...g.messages] };
}

/** `useState`-ning boshlang‘ich qiymati uchun yangi nusxa. */
export function initialDoctorGroup(): DoctorGroup {
  return cloneGroup();
}

/** Modul yuklanganda bir marta — import { doctorGroup } uchun. */
export const doctorGroup = cloneGroup();

export const currentGroupMember: GroupMember =
  getDoctorGroupChannel().members.find((m) => m.id === "d-current") ?? getDoctorGroupChannel().members[0];
