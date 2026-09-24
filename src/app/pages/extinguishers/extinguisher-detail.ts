import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Extinguisher } from '../../core/models/extinguisher.model';
import { ServiceRecord } from '../../core/models/service.model';
import { ExtinguisherService } from '../../core/services/extinguisher';
import { NotificationService } from '../../core/services/notification';
import { Customer } from '../../core/models/customer.model';
import { CustomerService } from '../../core/services/customer';

interface ServiceHistoryResponse {
  extinguisher: Extinguisher;
  total_services: number;
  services: ServiceRecord[];
}

@Component({
  selector: 'app-extinguisher-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './extinguisher-detail.html',
  styleUrl: './extinguisher-detail.scss',
})
export class ExtinguisherDetail implements OnInit {
  extinguisher: Extinguisher | null = null;
  customer: Customer | null = null;
  services: ServiceRecord[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly extinguisherApi: ExtinguisherService,
    private readonly customerApi: CustomerService,
    private readonly notice: NotificationService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid extinguisher ID.';
      this.loading = false;
      return;
    }

    this.extinguisherApi.getById(id).subscribe({
      next: (item) => {
        this.extinguisher = item;
        this.loadCustomer(item.customer_id);
        this.loadServiceHistory(id);
      },
      error: () => {
        this.error = 'Unable to load extinguisher details.';
        this.loading = false;
        this.notice.error(this.error);
        this.cdr.detectChanges();
      },
    });
  }

  private loadCustomer(customerId: number): void {
    this.customerApi.getById(customerId).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notice.error('Unable to load customer details.');
        this.cdr.detectChanges();
      },
    });
  }

  private loadServiceHistory(id: number): void {
    this.extinguisherApi.getServiceHistory(id).subscribe({
      next: (response) => {
        const history = response as ServiceHistoryResponse;
        this.services = history.services ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.notice.error('Unable to load extinguisher service history.');
        this.cdr.detectChanges();
      },
    });
  }
}
