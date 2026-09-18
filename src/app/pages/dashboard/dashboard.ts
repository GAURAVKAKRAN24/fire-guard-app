import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit  {
   dashboardSummary: DashboardSummary | null = null;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        console.log('Dashboard API response:', data);
        this.dashboardSummary = {...data};
        this.cdr.detectChanges();
        console.log('Dashboard API dashboardSummary:', this.dashboardSummary);

      },
      error: (error) => {
        console.error('Dashboard API error:', error);
      }
    });
  }
}
