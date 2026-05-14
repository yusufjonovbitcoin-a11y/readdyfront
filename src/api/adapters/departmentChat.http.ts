import { apiRequest } from "@/api/client";
import type {
  DepartmentChatMemberDto,
  DepartmentChatMessagesPageDto,
  DepartmentChatRoomSummaryDto,
  DepartmentChatMessageDto,
  DoctorDepartmentChatSummaryDto,
} from "@/api/types/departmentChat.types";

export async function getDoctorDepartmentChatSummary(): Promise<DoctorDepartmentChatSummaryDto | null> {
  try {
    return await apiRequest<DoctorDepartmentChatSummaryDto>("/api/department-chat/me/summary");
  } catch {
    return null;
  }
}

export async function getDoctorDepartmentChatMembers(): Promise<DepartmentChatMemberDto[]> {
  try {
    return await apiRequest<DepartmentChatMemberDto[]>("/api/department-chat/me/members");
  } catch {
    return [];
  }
}

export async function getDoctorDepartmentChatMessages(
  cursor?: string,
): Promise<DepartmentChatMessagesPageDto> {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiRequest<DepartmentChatMessagesPageDto>(`/api/department-chat/me/messages${q}`);
}

export async function postDoctorDepartmentChatMessage(body: string): Promise<DepartmentChatMessageDto> {
  return apiRequest<DepartmentChatMessageDto>("/api/department-chat/me/messages", {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function postDoctorDepartmentChatMarkRead(): Promise<void> {
  await apiRequest<{ ok: boolean }>("/api/department-chat/me/mark-read", { method: "POST" });
}

export async function getHospitalDepartmentChatRooms(): Promise<DepartmentChatRoomSummaryDto[]> {
  try {
    return await apiRequest<DepartmentChatRoomSummaryDto[]>("/api/department-chat/rooms");
  } catch {
    return [];
  }
}

export async function getAllDepartmentChatRooms(params?: {
  hospitalId?: string;
  q?: string;
}): Promise<DepartmentChatRoomSummaryDto[]> {
  const sp = new URLSearchParams();
  if (params?.hospitalId) sp.set("hospitalId", params.hospitalId);
  if (params?.q) sp.set("q", params.q);
  const q = sp.toString();
  try {
    return await apiRequest<DepartmentChatRoomSummaryDto[]>(
      `/api/department-chat/rooms/all${q ? `?${q}` : ""}`,
    );
  } catch {
    return [];
  }
}

export async function getDepartmentChatRoomMessages(
  departmentId: string,
  cursor?: string,
): Promise<DepartmentChatMessagesPageDto> {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiRequest<DepartmentChatMessagesPageDto>(
    `/api/department-chat/rooms/${encodeURIComponent(departmentId)}/messages${q}`,
  );
}

export async function postDepartmentChatRoomMessage(
  departmentId: string,
  body: string,
): Promise<DepartmentChatMessageDto> {
  return apiRequest<DepartmentChatMessageDto>(
    `/api/department-chat/rooms/${encodeURIComponent(departmentId)}/messages`,
    { method: "POST", body: JSON.stringify({ body }) },
  );
}

export async function postDepartmentChatRoomMarkRead(departmentId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(
    `/api/department-chat/rooms/${encodeURIComponent(departmentId)}/mark-read`,
    { method: "POST" },
  );
}

export async function getDepartmentChatRoomMembers(
  departmentId: string,
): Promise<DepartmentChatMemberDto[]> {
  try {
    return await apiRequest<DepartmentChatMemberDto[]>(
      `/api/department-chat/rooms/${encodeURIComponent(departmentId)}/members`,
    );
  } catch {
    return [];
  }
}
