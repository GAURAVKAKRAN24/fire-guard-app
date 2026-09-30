import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
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
});

