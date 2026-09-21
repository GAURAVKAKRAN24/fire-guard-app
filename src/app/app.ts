import { Component } from '@angular/core';
import { Sidebar } from './layout/sidebar/sidebar';
import { Dashboard } from './pages/dashboard/dashboard';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationCenter } from './shared/notification-center/notification-center';
import { GlobalLoader } from './shared/global-loader/global-loader';
import { ConfirmationDialog } from './shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Sidebar, RouterOutlet, RouterLink, RouterLinkActive, NotificationCenter, GlobalLoader, ConfirmationDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
   sidebarOpen = false;

  openSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
