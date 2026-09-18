import { Component } from '@angular/core';
import { Sidebar } from './layout/sidebar/sidebar';
import { Dashboard } from './pages/dashboard/dashboard';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Sidebar, RouterOutlet],
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