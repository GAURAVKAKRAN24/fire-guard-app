import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../core/services/customer';
import { Customer } from '../../core/models/customer.model';
import { ExtinguisherService } from '../../core/services/extinguisher';
import { Extinguisher } from '../../core/models/extinguisher.model';
import { ServiceRecord } from '../../core/models/service.model';
import { ServiceService } from '../../core/services/service';
import { NotificationService } from '../../core/services/notification';
import { ConfirmationService } from '../../core/services/confirmation';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.html',
  styleUrl: '../extinguishers/operations.scss',
})
export class Services implements OnInit {
  items: ServiceRecord[] = [];
  extinguishers: Extinguisher[] = [];
  customers: Customer[] = [];
  extinguisherSearch = '';
  serviceSearch = '';
  serviceDateFilter = '';
  showForm = false;
  editingId?: number;
  readonly form;

  constructor(
    fb: FormBuilder,
    private api: ServiceService,
    private extinguisherApi: ExtinguisherService,
    private customerApi: CustomerService,
    private notice: NotificationService,
    private confirm: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = fb.group({
      extinguisher_id: ['', Validators.required],
      service_type: ['Annual service', Validators.required],
      service_date: ['', Validators.required],
      next_service_date: ['', Validators.required],
      amount: [0, Validators.required],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.load();
    this.extinguisherApi.getAll().subscribe({
      next: response => {
        this.extinguishers = response.extinguishers;
        this.cdr.detectChanges();
      },
      error: () => this.notice.error('Unable to load extinguishers.'),
    });
    this.customerApi.getCustomers(1, 100).subscribe({
      next: response => {
        this.customers = response.customers;
        this.cdr.detectChanges();
      },
      error: () => this.notice.error('Unable to load customers.'),
    });
  }

  load(): void {
    this.api.getAll().subscribe({
      next: response => {
        this.items = Array.isArray(response?.services) ? response.services : [];
        this.cdr.detectChanges();
      },
      error: () => this.notice.error('Unable to load service records.'),
    });
  }

  getExtinguisher(id: number | string): Extinguisher | undefined {
    return this.extinguishers.find(item => Number(item.id) === Number(id));
  }

  get filteredExtinguishers(): Extinguisher[] {
    const search = this.extinguisherSearch.trim().toLowerCase();

    if (!search) {
      return this.extinguishers;
    }

    return this.extinguishers.filter(item => {
      const customer = this.getCustomer(item.customer_id);
      return [
        item.extinguisher_no,
        item.type,
        customer?.name ?? '',
        customer?.address ?? '',
      ].some(value => value.toLowerCase().includes(search));
    });
  }

  getCustomer(customerId: number): Customer | undefined {
    return this.customers.find(customer => customer.id === customerId);
  }

  get filteredServices(): ServiceRecord[] {
    const search = this.serviceSearch.trim().toLowerCase();

    if (!search && !this.serviceDateFilter) {
      return this.items;
    }

    return this.items.filter(item => {
      const matchesDate = !this.serviceDateFilter || item.service_date === this.serviceDateFilter;
      if (!matchesDate) return false;

      if (!search) return true;

      const extinguisher = this.getExtinguisher(item.extinguisher_id);
      const customer = extinguisher ? this.getCustomer(extinguisher.customer_id) : undefined;

      return [
        extinguisher?.extinguisher_no ?? '',
        customer?.name ?? '',
        customer?.phone ?? '',
        customer?.address ?? '',
      ].some(value => value.toLowerCase().includes(search));
    });
  }

  getCustomerName(service: ServiceRecord): string {
    const extinguisher = this.getExtinguisher(service.extinguisher_id);
    return this.customers.find(customer => customer.id === extinguisher?.customer_id)?.name || 'Customer unavailable';
  }

  reset(): void {
    this.form.reset({ service_type: 'Annual service', amount: 0 });
    this.extinguisherSearch = '';
    this.serviceSearch = '';
    this.serviceDateFilter = '';
    this.editingId = undefined;
    this.showForm = false;
  }

  clearServiceFilters(): void {
    this.serviceSearch = '';
    this.serviceDateFilter = '';
  }

  save(): void {
    if (this.form.invalid) return;

    const data = {
      ...this.form.getRawValue(),
      extinguisher_id: Number(this.form.value.extinguisher_id),
      amount: Number(this.form.value.amount),
    } as ServiceRecord;

    const request = this.editingId
      ? this.api.update(this.editingId, data)
      : this.api.create(data);

    request.subscribe({
      next: () => {
        this.notice.success('Service record saved successfully.');
        this.reset();
        this.load();
      },
      error: () => this.notice.error('Unable to save service record.'),
    });
  }

  edit(item: ServiceRecord): void {
    this.editingId = item.id;
    this.form.patchValue({ ...item, extinguisher_id: String(item.extinguisher_id) });
    this.showForm = true;
  }

  async remove(item: ServiceRecord): Promise<void> {
    if (!item.id || !await this.confirm.open({
      title: 'Delete service record?',
      message: 'This record will be permanently removed.',
      confirmLabel: 'Delete record',
    })) return;

    this.api.remove(item.id).subscribe({
      next: () => {
        this.notice.success('Service record deleted.');
        this.load();
      },
      error: () => this.notice.error('Unable to delete service record.'),
    });
  }
}
