import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerResponse } from '../models/customer.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) {}

  getCustomers(page: number = 1, limit: number = 10): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(
      `${environment.apiUrl}/customers?page=${page}&limit=${limit}`
    );
  }

  createCustomer(customerData: Customer): Observable<any> {
    return this.http.post(`${environment.apiUrl}/customers`, customerData);
  }

  updateCustomer(customerId: number | undefined, customerData: Customer): Observable<any> {
    if (customerId === undefined) {
      return new Observable();
    }
    return this.http.put(`${environment.apiUrl}/customers/${Number(customerId)}`, customerData);
  }

  removeCustomer(customerId: number | undefined): Observable<any> {
    if (customerId === undefined) {
      return new Observable();
    }
    return this.http.delete(`${environment.apiUrl}/customers/${customerId}`);
  }

  search(query: string): Observable<Customer[]> { return this.http.get<Customer[]>(`${environment.apiUrl}/customers/search?q=${encodeURIComponent(query)}`); }
  getById(customerId: number): Observable<Customer> { return this.http.get<Customer>(`${environment.apiUrl}/customers/${customerId}`); }
  getDetails(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/details`); }
  getServiceHistory(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/service-history`); }
  getDashboard(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/dashboard`); }
  getExtinguishers(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/extinguishers`); }
  getServices(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/services`); }
  getNotifications(customerId: number): Observable<unknown> { return this.http.get(`${environment.apiUrl}/customers/${customerId}/notifications`); }
}
