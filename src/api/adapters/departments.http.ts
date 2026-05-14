import { apiRequest } from "@/api/client";

export interface DepartmentListItemDto {
  id: string;
  name: string;
  hospital_id: string | null;
  hospital?: { name: string } | null;
}

export async function listDepartments(): Promise<DepartmentListItemDto[]> {
  return apiRequest<DepartmentListItemDto[]>("/api/departments");
}
