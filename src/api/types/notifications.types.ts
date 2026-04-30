export type NotificationType = "info" | "warning" | "success" | "error" | "system";
export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationCategory = "patient" | "doctor" | "hospital" | "system" | "security" | "appointment";
export type NotificationRole = "super_admin" | "hospital_admin" | "doctor";

export type NotificationDto = {
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

export type NotificationCategoryDto = {
  id: string;
  name: string;
};

export type NotificationPriorityDto = {
  id: string;
  name: string;
};

export type CreateNotificationRequestDto = {
  hospital_id?: string;
  recipient_type: "doctor" | "admin";
  recipient_id?: string;
  title: string;
  message: string;
  category_id: string;
  priority_id: string;
  is_read: boolean;
};
