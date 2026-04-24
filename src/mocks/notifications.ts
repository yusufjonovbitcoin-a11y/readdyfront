export type NotificationType = "info" | "warning" | "success" | "error" | "system";
export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationCategory = "patient" | "doctor" | "hospital" | "system" | "security" | "appointment";
export type NotificationRole = "super_admin" | "hospital_admin" | "doctor";

export type Notification = {
  id: string;
  role: NotificationRole;
  senderRole: NotificationRole;
  senderName: string;
  hospitalId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionPath?: string;
};

export const mockNotifications: Notification[] = [];

