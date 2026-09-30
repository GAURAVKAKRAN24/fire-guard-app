import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sign in and store token and user in localStorage and signals', () => {
    const mockResponse = {
      message: 'Login successful',
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
      user: {
        id: 1,
        name: 'Gaurav Staff',
        email: 'gaurav@fireguard.internal',
        role: 'STAFF'
      }
    };

    service.login({ email: 'gaurav@fireguard.internal', password: 'password123' }).subscribe((res) => {
      expect(res.access_token).toBe('fake-jwt-token');
      expect(res.user.name).toBe('Gaurav Staff');
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.getToken()).toBe('fake-jwt-token');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.name).toBe('Gaurav Staff');
    expect(localStorage.getItem('access_token')).toBe('fake-jwt-token');
  });

  it('should sign up new staff user', () => {
    const mockSignupResponse = {
      message: 'User registered successfully',
      user: {
        id: 2,
        name: 'Jane Staff',
        email: 'jane@fireguard.internal',
        role: 'STAFF'
      }
    };

    service.signup({
      name: 'Jane Staff',
      email: 'jane@fireguard.internal',
      password: 'password123'
    }).subscribe((res) => {
      expect(res.user.email).toBe('jane@fireguard.internal');
      expect(res.message).toBe('User registered successfully');
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/signup`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSignupResponse);
  });

  it('should logout and clear stored session', () => {
    localStorage.setItem('access_token', 'sample-token');
    localStorage.setItem('current_user', JSON.stringify({ id: 1, name: 'Test' }));

    service.logout(false);

    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});

