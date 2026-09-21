import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
    Extinguisher,
    ExtinguisherResponse,
} from "../models/extinguisher.model";
import { environment } from "../../../environments/environment.development";
@Injectable({ providedIn: "root" })
export class ExtinguisherService {
    constructor(private http: HttpClient) {}
    getAll(page = 1, limit = 50, status = "") {
        return this.http.get<ExtinguisherResponse>(
            `${environment.apiUrl}/extinguishers?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
        );
    }
    getDue() {
        return this.http.get<Extinguisher[]>(
            `${environment.apiUrl}/extinguishers/due`,
        );
    }
    getUpcoming() {
        return this.http.get<Extinguisher[]>(
            `${environment.apiUrl}/extinguishers/upcoming`,
        );
    }
    search(query: string) {
        return this.http.get<Extinguisher[]>(
            `${environment.apiUrl}/extinguishers/search?q=${encodeURIComponent(query)}`,
        );
    }
    getById(id: number) {
        return this.http.get<Extinguisher>(
            `${environment.apiUrl}/extinguishers/${id}`,
        );
    }
    getServices(id: number) {
        return this.http.get(
            `${environment.apiUrl}/extinguishers/${id}/services`,
        );
    }
    getServiceHistory(id: number) {
        return this.http.get(
            `${environment.apiUrl}/extinguishers/${id}/service-history`,
        );
    }
    create(data: Extinguisher) {
        return this.http.post<Extinguisher>(
            `${environment.apiUrl}/extinguishers`,
            data,
        );
    }
    update(id: number, data: Extinguisher) {
        return this.http.put<Extinguisher>(
            `${environment.apiUrl}/extinguishers/${id}`,
            data,
        );
    }
}
