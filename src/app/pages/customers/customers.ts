import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerService } from '../../core/services/customer';
import { Customer } from '../../core/models/customer.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class Customers implements OnInit {

  customers: Customer[] = [];

  loading = true;
  error = '';

  showForm = false;

  customerForm: FormGroup = new FormGroup({});
  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
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
        this.loading = false;

        this.cdr.detectChanges();
      }

    });

  }

  addCustomer(): void {

    console.log('Add customer clicked');

    this.showForm = true;

  }

  cancelAddCustomer(): void {

    this.showForm = false;

  }

  editCustomer(customer: Customer): void {

    console.log('Edit customer:', customer);

  }

  saveCustomer(): void {
    console.log('Form Data:', this.customerForm.value);
    this.showForm = false;
    this.cancelForm();
  }

  cancelForm(): void {
    this.customerForm.reset();
  }

}