import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SignupComponent } from './signup';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the signup component', () => {
    expect(component).toBeTruthy();
  });

  it('should require matching passwords', () => {
    component.signupForm.patchValue({
      name: 'John Staff',
      email: 'john@fireguard.internal',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      acceptTerms: true
    });

    expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    expect(component.signupForm.valid).toBe(false);

    component.signupForm.patchValue({
      confirmPassword: 'Password123!'
    });

    expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    expect(component.signupForm.valid).toBe(true);
  });

  it('should calculate password strength correctly', () => {
    component.signupForm.get('password')?.setValue('pass');
    expect(component.getPasswordStrength().label).toBe('Very Weak');

    component.signupForm.get('password')?.setValue('password123');
    expect(component.getPasswordStrength().label).toBe('Fair');

    component.signupForm.get('password')?.setValue('Password123!');
    expect(component.getPasswordStrength().score).toBe(100);
    expect(component.getPasswordStrength().label).toBe('Strong');
  });
});
