import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppNotification } from '../../core/models/notification.model';
import { NotificationApiService } from '../../core/services/notification-api';
import { NotificationService } from '../../core/services/notification';

export type NotificationFilter = 'all' | 'unread' | 'due' | 'read';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  readonly Math = Math;
  private api = inject(NotificationApiService);
  private notice = inject(NotificationService);
  private router = inject(Router);

  items = signal<AppNotification[]>([]);
  isLoading = signal<boolean>(false);
  activeFilter = signal<NotificationFilter>('all');
  searchQuery = signal<string>('');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);

  readonly globalUnreadCount = this.api.unreadCount;

  readonly unreadCount = computed(() => {
    return this.items().filter((n) => !n.is_read).length;
  });

  readonly serviceDueCount = computed(() => {
    return this.items().filter(
      (n) => n.notification_type === 'SERVICE_DUE' || (n.message && n.message.toLowerCase().includes('due'))
    ).length;
  });

  readonly filteredItems = computed(() => {
    const list = this.items();
    const filter = this.activeFilter();
    const q = this.searchQuery().trim().toLowerCase();

    return list.filter((item) => {
      // 1. Filter by status / type
      if (filter === 'unread' && item.is_read) return false;
      if (filter === 'read' && !item.is_read) return false;
      if (filter === 'due') {
        const isDue =
          item.notification_type === 'SERVICE_DUE' ||
          (item.message && item.message.toLowerCase().includes('due'));
        if (!isDue) return false;
      }

      // 2. Search query filter
      if (q) {
        const messageMatch = item.message?.toLowerCase().includes(q) ?? false;
        const customerMatch =
          item.customer?.name?.toLowerCase().includes(q) ||
          item.customer?.phone?.toLowerCase().includes(q) ||
          item.customer?.address?.toLowerCase().includes(q);
        const extinguisherMatch =
          item.extinguisher?.extinguisher_no?.toLowerCase().includes(q);
        const typeMatch = item.notification_type?.toLowerCase().includes(q);

        return messageMatch || customerMatch || extinguisherMatch || typeMatch;
      }

      return true;
    });
  });

  readonly paginatedItems = computed(() => {
    const filtered = this.filteredItems();
    const start = (this.currentPage() - 1) * this.pageSize();
    return filtered.slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getAll(1, 100).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const notifications = Array.isArray(response)
          ? response
          : (response?.notifications || []);

        this.items.set(notifications);
        this.totalItems.set(notifications.length);

        // Keep unread count synced with backend
        this.api.getUnreadCount().subscribe({
          error: () => {}
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notice.error('Unable to fetch notifications. Please check server connection.');
      }
    });
  }

  setFilter(filter: NotificationFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  markRead(item: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (item.is_read) return;

    this.api.markRead(item.id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        this.notice.success('Notification marked as read.');
      },
      error: () => {
        this.notice.error('Failed to update notification status.');
      }
    });
  }

  markAll(): void {
    if (!this.unreadCount()) return;

    this.api.markAllRead().subscribe({
      next: () => {
        this.items.update((list) => list.map((n) => ({ ...n, is_read: true })));
        this.notice.success('All notifications marked as read.');
      },
      error: () => {
        this.notice.error('Failed to update notifications.');
      }
    });
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  formatType(type?: string): string {
    if (!type) return 'Notification';
    return type.replace(/_/g, ' ');
  }
}
