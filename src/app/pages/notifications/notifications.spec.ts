import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Notifications } from './notifications';
import { environment } from '../../../environments/environment';

describe('Notifications Component', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;
  let httpTesting: HttpTestingController;

  const mockNotifications = [
    {
      id: 1,
      notification_type: 'SERVICE_DUE',
      message: 'Extinguisher EXT-101 is due for inspection',
      is_read: false,
      created_at: '2026-09-30T10:00:00',
      customer: {
        id: 1,
        name: 'Metro Mall',
        phone: '9876543210',
        address: 'Downtown Avenue'
      },
      extinguisher: {
        id: 10,
        extinguisher_no: 'EXT-101',
        due_date: '2026-10-01'
      }
    },
    {
      id: 2,
      notification_type: 'GENERAL',
      message: 'Inspection completed for Unit EXT-102',
      is_read: true,
      created_at: '2026-09-29T14:30:00',
      customer: {
        id: 2,
        name: 'Grand Hotel',
        phone: '9876500000',
        address: 'Sea View Road'
      },
      extinguisher: {
        id: 11,
        extinguisher_no: 'EXT-102',
        due_date: null
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the notifications component', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${environment.apiUrl}/notifications?page=1&limit=100`);
    req.flush({ page: 1, limit: 10, total: 2, notifications: mockNotifications });

    const countReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    countReq.flush({ unread_count: 1 });

    expect(component).toBeTruthy();
    expect(component.items().length).toBe(2);
    expect(component.unreadCount()).toBe(1);
    expect(component.serviceDueCount()).toBe(1);
  });

  it('should filter notifications by status correctly', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${environment.apiUrl}/notifications?page=1&limit=100`);
    req.flush({ page: 1, limit: 10, total: 2, notifications: mockNotifications });
    const countReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    countReq.flush({ unread_count: 1 });

    // Filter by unread
    component.setFilter('unread');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].id).toBe(1);

    // Filter by read
    component.setFilter('read');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].id).toBe(2);

    // Filter by due
    component.setFilter('due');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].id).toBe(1);

    // Reset to all
    component.setFilter('all');
    expect(component.filteredItems().length).toBe(2);
  });

  it('should search notifications by customer name and extinguisher number', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${environment.apiUrl}/notifications?page=1&limit=100`);
    req.flush({ page: 1, limit: 10, total: 2, notifications: mockNotifications });
    const countReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    countReq.flush({ unread_count: 1 });

    // Search by customer name
    component.searchQuery.set('Metro');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].customer?.name).toBe('Metro Mall');

    // Search by extinguisher number
    component.searchQuery.set('EXT-102');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].extinguisher?.extinguisher_no).toBe('EXT-102');

    // Search nonexistent query
    component.searchQuery.set('nonexistent query 123');
    expect(component.filteredItems().length).toBe(0);
  });

  it('should mark single notification as read', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${environment.apiUrl}/notifications?page=1&limit=100`);
    req.flush({ page: 1, limit: 10, total: 2, notifications: mockNotifications });
    const countReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    countReq.flush({ unread_count: 1 });

    const itemToRead = component.items()[0];
    component.markRead(itemToRead);

    const markReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/1/read`);
    expect(markReq.request.method).toBe('PUT');
    markReq.flush({ ...itemToRead, is_read: true });

    expect(component.items()[0].is_read).toBe(true);
    expect(component.unreadCount()).toBe(0);
  });

  it('should mark all notifications as read', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne(`${environment.apiUrl}/notifications?page=1&limit=100`);
    req.flush({ page: 1, limit: 10, total: 2, notifications: mockNotifications });
    const countReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    countReq.flush({ unread_count: 1 });

    component.markAll();

    const markAllReq = httpTesting.expectOne(`${environment.apiUrl}/notifications/read-all`);
    expect(markAllReq.request.method).toBe('PUT');
    markAllReq.flush({ message: 'All notifications marked as read', updated_count: 1 });

    expect(component.unreadCount()).toBe(0);
    expect(component.items().every((n) => n.is_read)).toBe(true);
  });
});
