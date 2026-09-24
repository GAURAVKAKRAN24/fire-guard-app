import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { ServiceRecord } from '../../core/models/service.model';
import { ServiceService } from '../../core/services/service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../core/services/customer';
import { Extinguisher } from '../../core/models/extinguisher.model';
import { ExtinguisherService } from '../../core/services/extinguisher';
import { Customer } from '../../core/models/customer.model';
import { forkJoin } from 'rxjs';

interface ExtinguisherAlertItem extends Extinguisher {
  customer?: Customer;
  status: 'due' | 'upcoming';
  daysLeft: number;
}

interface RecentServiceItem extends ServiceRecord {
  customer?: Customer;
  extinguisher?: Extinguisher;
}

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  dashboardSummary: DashboardSummary | null = null;
  recentServices: RecentServiceItem[] = [];
  activeFilter: 'all' | 'due' | 'upcoming' = 'all';

  customerAlerts: ExtinguisherAlertItem[] = [];

  get filteredAlerts() {
    if (this.activeFilter === 'all') {
      return this.customerAlerts;
    }

    return this.customerAlerts.filter((item) => item.status === this.activeFilter);
  }

  constructor(
    private dashboardService: DashboardService,
    private serviceService: ServiceService,
    private extinguisherService: ExtinguisherService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecentServices();
    this.loadExtinguisherAlerts();
  }

  loadExtinguisherAlerts(): void {
    this.extinguisherService.getAll(1, 100).subscribe({
      next: (response) => {
        const today = this.today();
        const nextThirtyDays = this.addDays(today, 30);
        const alerts: ExtinguisherAlertItem[] = [];
        for (const item of response.extinguishers) {
          if (item.id === undefined || !item.next_service_date) continue;

          const serviceDate = this.toDateOnly(item.next_service_date);
          if (serviceDate <= today) {
            alerts.push({ ...item, status: 'due', daysLeft: this.getDaysUntil(serviceDate) });
          } else if (serviceDate <= nextThirtyDays && item.status.toLowerCase() !== 'inactive') {
            alerts.push({ ...item, status: 'upcoming', daysLeft: this.getDaysUntil(serviceDate) });
          }
        }

        this.customerAlerts = alerts;
        this.loadAlertCustomers();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Extinguishers API error:', error);
        this.notificationService.error('Unable to load due and upcoming extinguishers. Please try again.');
      },
    });
  }

  private loadAlertCustomers(): void {
    this.customerService.getCustomers(1, 100).subscribe({
      next: (response) => {
        const customers = response.customers;
        this.customerAlerts = this.customerAlerts.map((item) => ({
          ...item,
          customer: customers.find((customer) => customer.id === item.customer_id),
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Alert customers API error:', error),
    });
  }

  private getDaysUntil(serviceDate: string | null | undefined): number {
    if (!serviceDate) return 0;
    const today = new Date();
    const dueDate = new Date(serviceDate);
    return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private addDays(value: string, days: number): string {
    const date = new Date(`${value}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private toDateOnly(value: string | null | undefined): string {
    return value ? value.slice(0, 10) : '';
  }

  loadRecentServices(): void {
    forkJoin({
      services: this.serviceService.getAll(1, 50),
      extinguishers: this.extinguisherService.getAll(1, 100),
      customers: this.customerService.getCustomers(1, 100),
    }).subscribe({
      next: ({ services, extinguishers, customers }) => {
        const extinguisherById = new Map(
          extinguishers.extinguishers.map((item) => [Number(item.id), item])
        );
        const customerById = new Map(
          customers.customers.map((customer) => [Number(customer.id), customer])
        );

        this.recentServices = [...(services.services ?? [])]
          .sort((first, second) =>
            new Date(second.service_date).getTime() - new Date(first.service_date).getTime()
          )
          .slice(0, 3)
          .map((service) => {
            const extinguisher = extinguisherById.get(Number(service.extinguisher_id));
            return {
              ...service,
              extinguisher,
              customer: extinguisher
                ? customerById.get(Number(extinguisher.customer_id))
                : undefined,
            };
          });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Recent services API error:', error);
        this.notificationService.error('Unable to load recent services. Please try again.');
      },
    });
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

  getStatusLabel(item: ExtinguisherAlertItem): string {
    if (item.status === 'due') {
      return item.daysLeft <= 0 ? 'Due now' : `${Math.abs(item.daysLeft)} days overdue`;
    }

    return `Due in ${item.daysLeft} days`;
  }
}
