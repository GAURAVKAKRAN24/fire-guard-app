import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ServiceRecord, ServiceResponse } from "../models/service.model";
import { environment } from "../../../environments/environment";
@Injectable({ providedIn: "root" })
export class ServiceService {
    constructor(private http: HttpClient) {}
    getAll(page = 1, limit = 50) {
        return this.http.get<ServiceResponse>(
            `${environment.apiUrl}/services?page=${page}&limit=${limit}`,
        );
    }
    create(data: ServiceRecord) {
        return this.http.post<ServiceRecord>(
            `${environment.apiUrl}/services`,
            data,
        );
    }
    update(id: number, data: ServiceRecord) {
        return this.http.put<ServiceRecord>(
            `${environment.apiUrl}/services/${id}`,
            data,
        );
    }
    remove(id: number) {
        return this.http.delete(`${environment.apiUrl}/services/${id}`);
    }
}
