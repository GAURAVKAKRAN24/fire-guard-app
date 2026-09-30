import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationApiService } from './notification-api';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private router = inject(Router);
  private notificationApi = inject(NotificationApiService);

  readonly isSupported = signal<boolean>(false);
  readonly permission = signal<NotificationPermission>('default');
  readonly isRegistered = signal<boolean>(false);
  readonly isListening = signal<boolean>(false);

  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private lastKnownUnreadCount = 0;
  private pollIntervalId: any = null;

  constructor() {
    this.checkSupport();
    this.init();
  }

  private checkSupport(): void {
    if (typeof window !== 'undefined') {
      const hasSW = 'serviceWorker' in navigator;
      const hasNotify = 'Notification' in window;
      this.isSupported.set(hasSW && hasNotify);
      if (hasNotify) {
        this.permission.set(Notification.permission);
      }
    }
  }

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !this.isSupported()) {
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      this.isRegistered.set(true);

      // Listen for notification clicks or messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICKED' && event.data?.url) {
          this.router.navigateByUrl(event.data.url);
        }
      });

      // If already granted, initialize background alert listener
      if (this.permission() === 'granted') {
        this.startAlertWatcher();
      }
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  }

  /**
   * Request native OS notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      this.permission.set(result);

      if (result === 'granted') {
        await this.init();
        this.startAlertWatcher();
        // Send initial confirmation alert
        await this.showNotification('Notifications Enabled', {
          body: 'FireGuard alerts will now notify you for upcoming extinguisher due dates and safety inspections.',
          url: '/notifications'
        });
      }
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show a native system notification via the Service Worker
   */
  async showNotification(title: string, payload?: Partial<PushNotificationPayload>): Promise<void> {
    if (this.permission() !== 'granted') {
      return;
    }

    const body = payload?.body || 'Fire safety service notification.';
    const url = payload?.url || '/notifications';
    const tag = payload?.tag || 'fireguard-alert-' + Date.now();

    // Prefer service worker showNotification for native OS & mobile background support
    if (this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [250, 100, 250, 100, 250],
          tag,
          renotify: true,
          data: { url }
        } as NotificationOptions);
        return;
      } catch (e) {
        console.warn('SW showNotification failed, falling back to window Notification:', e);
      }
    }

    // Fallback to Window Notification API
    if ('Notification' in window) {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag
      });

      n.onclick = () => {
        window.focus();
        n.close();
        if (url) {
          this.router.navigateByUrl(url);
        }
      };
    }
  }

  /**
   * Send a test WhatsApp-style system notification
   */
  async sendTestNotification(): Promise<void> {
    if (this.permission() !== 'granted') {
      const granted = await this.requestPermission();
      if (granted !== 'granted') {
        return;
      }
    }

    await this.showNotification('🚨 Fire Safety Due Alert', {
      body: 'Inspection due: Extinguisher #EX-104 at Phoenix Commercial Complex.',
      url: '/notifications'
    });
  }

  /**
   * Starts monitoring for new notifications to trigger system notifications
   * whenever new alerts arrive (even when user is on another tab)
   */
  startAlertWatcher(intervalMs = 45000): void {
    if (this.isListening() || typeof window === 'undefined') {
      return;
    }
    this.isListening.set(true);

    // Initial check
    this.checkNewNotifications();

    this.pollIntervalId = setInterval(() => {
      this.checkNewNotifications();
    }, intervalMs);
  }

  stopAlertWatcher(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.isListening.set(false);
  }

  private checkNewNotifications(): void {
    this.notificationApi.getUnreadCount().subscribe({
      next: (res) => {
        const count = res?.unread_count || 0;
        if (count > this.lastKnownUnreadCount && this.lastKnownUnreadCount > 0) {
          // New alert arrived!
          const diff = count - this.lastKnownUnreadCount;
          this.showNotification(`⚠️ ${diff} New Fire Safety Alert${diff > 1 ? 's' : ''}`, {
            body: 'New inspection or due-date reminder received. Tap to view.',
            url: '/notifications'
          });
        }
        this.lastKnownUnreadCount = count;
      },
      error: () => {}
    });
  }
}

