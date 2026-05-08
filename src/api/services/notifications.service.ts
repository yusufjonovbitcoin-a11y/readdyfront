import * as notificationsHttp from "@/api/adapters/notifications.http";
import type {
  CreateNotificationRequestDto,
  NotificationCategoryDto,
  NotificationDto,
  NotificationPriorityDto,
} from "@/api/types/notifications.types";

export type Notification = NotificationDto;
export type NotificationCategory = NotificationCategoryDto;
export type NotificationPriority = NotificationPriorityDto;
export const NOTIFICATIONS_UPDATED_EVENT = "medcore:notifications-updated";

export function emitNotificationsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

export function getNotifications(): Promise<Notification[]> {
  return notificationsHttp.getNotifications();
}

export function createNotification(input: Omit<Notification, "id">): Promise<Notification | null> {
  return notificationsHttp.createNotification(input);
}

export function updateNotification(id: string, input: Partial<Notification>): Promise<Notification | null> {
  return notificationsHttp.updateNotification(id, input);
}

export function deleteNotification(id: string): Promise<boolean> {
  return notificationsHttp.deleteNotification(id);
}

export function getNotificationCategories(): Promise<NotificationCategory[]> {
  return notificationsHttp.getNotificationCategories();
}

export function getNotificationPriorities(): Promise<NotificationPriority[]> {
  return notificationsHttp.getNotificationPriorities();
}

export function createNotificationByIds(input: CreateNotificationRequestDto): Promise<Notification | null> {
  return notificationsHttp.createNotificationByIds(input);
}
