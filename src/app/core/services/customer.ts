import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerResponse } from '../models/customer.model';
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
}