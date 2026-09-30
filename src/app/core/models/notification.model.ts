export interface NotificationCustomer {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
}

export interface NotificationExtinguisher {
  id?: number;
  extinguisher_no?: string;
  due_date?: string | null;
}

export interface AppNotification {
  id: number;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  customer?: NotificationCustomer;
  extinguisher?: NotificationExtinguisher;
}

export interface NotificationResponse {
  page: number;
  limit: number;
  total: number;
  notifications: AppNotification[];
}
