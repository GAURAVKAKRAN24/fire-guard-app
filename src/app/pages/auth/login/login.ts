import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;
  infoMessage: string | null = null;
  returnUrl = '/dashboard';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.route.snapshot.queryParams['sessionExpired']) {
      this.errorMessage = 'Your session has expired. Please sign in again.';
    }

    if (this.route.snapshot.queryParams['registered']) {
      this.infoMessage = 'Account created successfully! Please sign in with your credentials.';
      const prefillEmail = this.route.snapshot.queryParams['email'];
      if (prefillEmail) {
        this.loginForm.patchValue({ email: prefillEmail });
      }
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notification.success(`Welcome back, ${response.user.name}!`);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = err.error?.detail || 'Invalid email or password.';
        } else if (err.status === 403) {
          this.errorMessage = err.error?.detail || 'Account is inactive. Please contact your administrator.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the backend server. Please verify the API is running at http://127.0.0.1:8000.';
        } else {
          this.errorMessage = err.error?.detail || 'An unexpected error occurred during login.';
        }
        this.notification.error(this.errorMessage!);
      }
    });
  }

  fillDemo(): void {
    this.loginForm.patchValue({
      email: 'staff@fireguard.internal',
      password: 'Password123!'
    });
  }
}
