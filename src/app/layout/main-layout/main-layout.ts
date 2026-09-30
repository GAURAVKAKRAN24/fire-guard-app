import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { NotificationApiService } from '../../core/services/notification-api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private notificationApi = inject(NotificationApiService);
  private router = inject(Router);

  sidebarOpen = false;
  userDropdownOpen = false;

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
    }
  }

  openSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.notification.info('You have signed out successfully.');
    this.closeUserDropdown();
  }
}
