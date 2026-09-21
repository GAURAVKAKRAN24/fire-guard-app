import { Customer } from './customer.model';
export interface AppNotification { id: number; notification_type: string; message: string; is_read: boolean; created_at: string; customer: Customer; extinguisher: { id: number; extinguisher_no: string; due_date: string | null; }; }
export interface NotificationResponse { page: number; limit: number; total: number; notifications: AppNotification[]; }
