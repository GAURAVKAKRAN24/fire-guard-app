import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { MainLayoutComponent } from './main-layout';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the main layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar and user dropdown', () => {
    expect(component.sidebarOpen).toBe(false);
    component.openSidebar();
    expect(component.sidebarOpen).toBe(true);
    component.closeSidebar();
    expect(component.sidebarOpen).toBe(false);

    expect(component.userDropdownOpen).toBe(false);
    component.toggleUserDropdown();
    expect(component.userDropdownOpen).toBe(true);
    component.closeUserDropdown();
    expect(component.userDropdownOpen).toBe(false);
  });

  it('should filter customers by name, phone, or address in global search suggestions', () => {
    component.allCustomers = [
      { id: 1, name: 'Alice Towers', phone: '9876543210', address: '123 Downtown Ave' },
      { id: 2, name: 'Bob Plaza', phone: '1122334455', address: '456 Industrial Zone' },
      { id: 3, name: 'Charlie Mall', phone: '5566778899', address: '789 Harbor Road' }
    ];

    // Search by name
    component.onSearchInput('Alice');
    expect(component.searchPanelOpen).toBe(true);
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].name).toBe('Alice Towers');

    // Search by mobile number
    component.onSearchInput('1122');
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].name).toBe('Bob Plaza');

    // Search by address
    component.onSearchInput('Harbor');
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].name).toBe('Charlie Mall');

    // Clear search
    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.searchResults.length).toBe(0);
    expect(component.searchPanelOpen).toBe(false);
  });

  it('should redirect to customer upon selection', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const customer = { id: 42, name: 'Metro Station', phone: '9988776655', address: 'Station Road' };
    component.selectCustomer(customer);

    expect(component.searchPanelOpen).toBe(false);
    expect(component.searchQuery).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['/customers'], {
      queryParams: {
        id: 42,
        search: 'Metro Station'
      }
    });
  });

  it('should toggle notification dropdown and slice to 3 latest alerts', () => {
    expect(component.notificationDropdownOpen).toBe(false);
    component.toggleNotificationDropdown();
    expect(component.notificationDropdownOpen).toBe(true);

    component.closeNotificationDropdown();
    expect(component.notificationDropdownOpen).toBe(false);
  });
});

