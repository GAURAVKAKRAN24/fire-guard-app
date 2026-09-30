import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customers/customers').then((m) => m.Customers)
      },
      {
        path: 'extinguishers',
        loadComponent: () => import('./pages/extinguishers/extinguishers').then((m) => m.Extinguishers)
      },
      {
        path: 'extinguishers/:id',
        loadComponent: () => import('./pages/extinguishers/extinguisher-detail').then((m) => m.ExtinguisherDetail)
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/services/services').then((m) => m.Services)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications').then((m) => m.Notifications)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
