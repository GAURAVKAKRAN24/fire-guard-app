import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { NotificationApiService } from '../../core/services/notification-api';
import { CustomerService } from '../../core/services/customer';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { Customer } from '../../core/models/customer.model';
import { AppNotification } from '../../core/models/notification.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, Sidebar, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private notificationApi = inject(NotificationApiService);
  private customerService = inject(CustomerService);
  private pushNotificationService = inject(PushNotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly pushPermission = this.pushNotificationService.permission;
  readonly isPushSupported = this.pushNotificationService.isSupported;

  sidebarOpen = false;
  userDropdownOpen = false;
  notificationDropdownOpen = false;
  notificationsLoading = false;
  latestNotifications: AppNotification[] = [];

  // Global search state
  searchQuery = '';
  searchResults: Customer[] = [];
  searchPanelOpen = false;
  searchLoading = false;
  mobileSearchOpen = false;
  allCustomers: Customer[] = [];
  private hasLoadedCustomers = false;

  readonly currentUser = this.authService.currentUser;
  readonly unreadCount = this.notificationApi.unreadCount;

  readonly userInitial = computed(() => {
    const user = this.currentUser();
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  });

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.notificationApi.getUnreadCount().subscribe({
        error: () => {}
      });
      this.loadCustomerCache();
    }
  }

  // --- Search Logic ---
  loadCustomerCache(): void {
    if (this.hasLoadedCustomers) {
      return;
    }
    this.customerService.getCustomers(1, 100).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.customers)) {
          this.allCustomers = response.customers;
          this.hasLoadedCustomers = true;
        }
      },
      error: () => {}
    });
  }

  onSearchFocus(): void {
    this.loadCustomerCache();
    if (this.searchQuery.trim().length > 0) {
      this.searchPanelOpen = true;
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    const q = value.trim().toLowerCase();

    if (!q) {
      this.searchResults = [];
      this.searchPanelOpen = false;
      this.searchLoading = false;
      return;
    }

    this.searchPanelOpen = true;
    this.searchLoading = true;

    // 1. Immediately match locally on name, phone, or address
    const localMatches = this.allCustomers.filter((customer) => {
      const name = (customer.name || '').toLowerCase();
      const phone = (customer.phone || '').toLowerCase();
      const address = (customer.address || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || address.includes(q);
    });

    this.searchResults = localMatches;

    // 2. Query backend search endpoint to supplement results beyond local cache
    this.customerService.search(value.trim()).subscribe({
      next: (backendResults) => {
        this.searchLoading = false;
        const merged = [...localMatches];
        if (Array.isArray(backendResults)) {
          for (const item of backendResults) {
            if (!merged.some((c) => c.id === item.id)) {
              merged.push(item);
            }
          }
        }
        this.searchResults = merged;
        this.cdr.markForCheck();
      },
      error: () => {
        this.searchLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchPanelOpen = false;
  }

  closeSearchPanel(): void {
    this.searchPanelOpen = false;
  }

  selectCustomer(customer: Customer): void {
    this.closeSearchPanel();
    this.mobileSearchOpen = false;
    this.searchQuery = '';
    this.router.navigate(['/customers'], {
      queryParams: {
        id: customer.id,
        search: customer.name
      }
    });
  }

  onSearchSubmit(): void {
    const term = this.searchQuery.trim();
    this.closeSearchPanel();
    this.mobileSearchOpen = false;
    if (term) {
      this.router.navigate(['/customers'], {
        queryParams: { search: term }
      });
    } else {
      this.router.navigate(['/customers']);
    }
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
    if (this.mobileSearchOpen) {
      this.closeNotificationDropdown();
      this.closeUserDropdown();
      this.loadCustomerCache();
    }
  }

  // --- Notification Dropdown Logic ---
  toggleNotificationDropdown(): void {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    if (this.notificationDropdownOpen) {
      this.closeUserDropdown();
      this.closeSearchPanel();
      this.loadLatestNotifications();
    }
  }

  closeNotificationDropdown(): void {
    this.notificationDropdownOpen = false;
  }

  loadLatestNotifications(): void {
    this.notificationsLoading = true;
    this.notificationApi.getAll(1, 10).subscribe({
      next: (res) => {
        this.notificationsLoading = false;
        if (res && Array.isArray(res.notifications)) {
          this.latestNotifications = res.notifications.slice(0, 3);
        } else {
          this.latestNotifications = [];
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationsLoading = false;
        this.latestNotifications = [];
        this.cdr.markForCheck();
      }
    });
  }

  onNotificationClick(item: AppNotification): void {
    if (!item.is_read) {
      this.notificationApi.markRead(item.id).subscribe({
        next: () => {
          item.is_read = true;
        }
      });
    }
    this.closeNotificationDropdown();
    this.router.navigate(['/notifications']);
  }

  formatTimeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  }

  async enableSystemNotifications(): Promise<void> {
    const res = await this.pushNotificationService.requestPermission();
    if (res === 'granted') {
      this.notification.success('System notifications enabled! You will now receive mobile & desktop alerts.');
    } else if (res === 'denied') {
      this.notification.error('Notification permission was blocked in your browser settings.');
    }
  }

  async sendTestNotification(): Promise<void> {
    await this.pushNotificationService.sendTestNotification();
    this.notification.info('Test notification dispatched to your operating system.');
  }

  // --- Layout Controls ---
  openSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
    if (this.userDropdownOpen) {
      this.closeNotificationDropdown();
      this.closeSearchPanel();
    }
  }

  closeUserDropdown(): void {
    this.userDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.notification.info('You have signed out successfully.');
    this.closeUserDropdown();
  }
}
