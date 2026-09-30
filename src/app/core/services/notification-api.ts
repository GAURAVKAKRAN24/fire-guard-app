import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppNotification, NotificationResponse } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {
  readonly unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 50): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${environment.apiUrl}/notifications?page=${page}&limit=${limit}`
    ).pipe(
      tap((res) => {
        if (res && Array.isArray(res.notifications)) {
          const count = res.notifications.filter((n) => !n.is_read).length;
          this.unreadCount.set(count);
        }
      })
    );
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(
      `${environment.apiUrl}/notifications/unread-count`
    ).pipe(
      tap((res) => {
        if (typeof res?.unread_count === 'number') {
          this.unreadCount.set(res.unread_count);
        }
      })
    );
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.put<AppNotification>(
      `${environment.apiUrl}/notifications/${id}/read`,
      {}
    ).pipe(
      tap(() => {
        this.unreadCount.update((count) => Math.max(0, count - 1));
      })
    );
  }

  markAllRead(): Observable<{ message: string; updated_count: number }> {
    return this.http.put<{ message: string; updated_count: number }>(
      `${environment.apiUrl}/notifications/read-all`,
      {}
    ).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }
}
