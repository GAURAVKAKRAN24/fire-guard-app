import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([]);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.notifications.update((notifications) => notifications.filter((notification) => notification.id !== id));
  }

  private show(message: string, type: NotificationType): void {
    const notification: AppNotification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      type
    };

    this.notifications.update((notifications) => [...notifications, notification]);
    window.setTimeout(() => this.dismiss(notification.id), 4500);
  }
}
