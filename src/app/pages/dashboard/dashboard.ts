import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';

interface CustomerAlertItem {
  name: string;
  address: string;
  image: string;
  phone: string;
  count: number;
  status: 'due' | 'upcoming';
  daysLeft: number;
  dueDate: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  dashboardSummary: DashboardSummary | null = null;
  activeFilter: 'all' | 'due' | 'upcoming' = 'all';

  customerAlerts: CustomerAlertItem[] = [
    {
      name: 'Rajesh Kumar',
      address: 'Jansath Road, Muzaffarnagar',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      phone: '+919876543210',
      count: 3,
      status: 'due',
      daysLeft: 2,
      dueDate: '2026-09-23',
    },
    {
      name: 'Amit Sharma',
      address: 'Khatauli Market, Muzaffarnagar',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      phone: '+919812345678',
      count: 2,
      status: 'upcoming',
      daysLeft: 12,
      dueDate: '2026-10-03',
    },
    {
      name: 'Anil Kumar',
      address: 'Meerut Road, Muzaffarnagar',
      image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80',
      phone: '+919755443322',
      count: 1,
      status: 'due',
      daysLeft: 0,
      dueDate: '2026-09-21',
    },
    {
      name: 'Neha Verma',
      address: 'Shivaji Colony, Muzaffarnagar',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      phone: '+919900112233',
      count: 4,
      status: 'upcoming',
      daysLeft: 27,
      dueDate: '2026-10-18',
    },
    {
      name: 'Pankaj Gupta',
      address: 'Sadar Bazar, Muzaffarnagar',
      image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80',
      phone: '+919944556677',
      count: 2,
      status: 'due',
      daysLeft: 5,
      dueDate: '2026-09-26',
    },
  ];

  get filteredAlerts() {
    if (this.activeFilter === 'all') {
      return this.customerAlerts;
    }

    return this.customerAlerts.filter((item) => item.status === this.activeFilter);
  }

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        console.log('Dashboard API response:', data);
        this.dashboardSummary = { ...data };
        this.cdr.detectChanges();
        console.log('Dashboard API dashboardSummary:', this.dashboardSummary);
      },
      error: (error) => {
        console.error('Dashboard API error:', error);
        this.notificationService.error('Unable to load the dashboard summary. Please try again.');
      },
    });
  }

  getCallLink(phone: string): string {
    return `tel:${phone}`;
  }

  getWhatsAppLink(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  }

  getStatusLabel(item: CustomerAlertItem): string {
    if (item.status === 'due') {
      return item.daysLeft <= 0 ? 'Due now' : `${item.daysLeft} days overdue`;
    }

    return `Due in ${item.daysLeft} days`;
  }
}
