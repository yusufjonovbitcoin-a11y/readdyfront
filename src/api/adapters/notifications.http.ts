import { apiRequest } from "@/api/client";
import type {
  CreateNotificationRequestDto,
  NotificationCategoryDto,
  NotificationDto,
  NotificationPriorityDto,
} from "@/api/types/notifications.types";

export async function getNotifications(): Promise<NotificationDto[]> {
  try {
    return await apiRequest<NotificationDto[]>("/api/notifications");
  } catch {
    return [];
  }
}

export async function createNotification(input: Omit<NotificationDto, "id">): Promise<NotificationDto | null> {
  try {
    return await apiRequest<NotificationDto>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function getNotificationCategories(): Promise<NotificationCategoryDto[]> {
  try {
    return await apiRequest<NotificationCategoryDto[]>("/api/categories");
  } catch {
    return [];
  }
}

export async function getNotificationPriorities(): Promise<NotificationPriorityDto[]> {
  try {
    return await apiRequest<NotificationPriorityDto[]>("/api/priorities");
  } catch {
    return [];
  }
}

export async function createNotificationByIds(input: CreateNotificationRequestDto): Promise<NotificationDto | null> {
  try {
    return await apiRequest<NotificationDto>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function updateNotification(id: string, input: Partial<NotificationDto>): Promise<NotificationDto | null> {
  try {
    return await apiRequest<NotificationDto>(`/api/notifications/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  try {
    await apiRequest<null>(`/api/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}
