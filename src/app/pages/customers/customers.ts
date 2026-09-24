import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerService } from '../../core/services/customer';
import { Customer } from '../../core/models/customer.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification';
import { ConfirmationService } from '../../core/services/confirmation';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class Customers implements OnInit {

  customers: Customer[] = [];
  searchTerm = '';

  loading = true;
  error = '';

  showForm = false;

  isEditMode = false;

  selectedCustomer: Customer | null = null;

  customerForm: FormGroup = new FormGroup({});
if: any;
  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
     this.customerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      // email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  get filteredCustomers(): Customer[] {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return this.customers;
    }

    return this.customers.filter((customer) =>
      [customer.name, customer.phone, customer.address ?? '']
        .some((value) => value.toLowerCase().includes(searchTerm))
    );
  }

  loadCustomers(): void {

    this.loading = true;

    this.customerService.getCustomers().subscribe({

      next: (response) => {

        console.log('Customers API response:', response);

        this.customers = response.customers;

        this.loading = false;
        this.error = '';

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Customers API error:', error);

        this.error = 'Unable to load customers';
        this.notificationService.error('Unable to load customers. Please try again.');
        this.loading = false;

        this.cdr.detectChanges();
      }

    });

  }

  addCustomer(): void {

    console.log('Add customer clicked');

    this.cancelForm();
    this.showForm = true;

  }

  cancelAddCustomer(): void {

    this.showForm = false;
    this.cancelForm();

  }

  editCustomer(customer: Customer): void {
    console.log('Edit customer clicked:', customer);
    this.customerForm.patchValue({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address
    });
    this.selectedCustomer = customer;
    this.isEditMode = true;
    this.showForm = true;

  }

  updateCustomerDetails(selectedCustomerId: number | undefined, customerData: Customer): void {
    console.log('Edit customer clicked:', customerData);

    this.customerService.updateCustomer(selectedCustomerId, customerData).subscribe({
      next: (response) => {
        console.log('Customer updated successfully:', response);
        this.notificationService.success('Customer updated successfully.');
        this.loadCustomers();
        this.showForm = false;
        this.cancelForm();
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.notificationService.error('Unable to update customer. Please try again.');
      }
    });
  }

  async deleteCustomer(customerId: number | undefined): Promise<void> {

    if (customerId === undefined) {
      return;
    }

    const confirmed = await this.confirmationService.open({
      title: 'Delete this customer?',
      message: 'This action cannot be undone. The customer and their saved details will be removed permanently.',
      confirmLabel: 'Delete customer'
    });

    if (!confirmed) {
      return;
    }

    this.customerService.removeCustomer(customerId).subscribe({
      next: (response) => {
        console.log('Customer deleted successfully:', response);
        this.notificationService.success('Customer deleted successfully.');
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.notificationService.error('Unable to delete customer. Please try again.');
      }
    });
  }

  saveCustomer(): void {
    console.log('Form Data:', this.customerForm.value);

    if (this.customerForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const customerData: Customer = {
      name: this.customerForm.value.name,
      phone: this.customerForm.value.phone,
      address: this.customerForm.value.address
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: (response) => {
        console.log('Customer created successfully:', response);
        this.notificationService.success('Customer saved successfully.');
        this.loadCustomers();
        this.showForm = false;
        this.cancelForm();
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        this.notificationService.error('Unable to save customer. Please try again.');
      }
    });
  }

  cancelForm(): void {
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset({
      name: '',
      phone: '',
      address: ''
    });
  }

}
