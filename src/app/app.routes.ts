import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'customers',
        loadComponent: () => import('./pages/customers/customers').then(m => m.Customers)
    },
    { path: 'extinguishers', loadComponent: () => import('./pages/extinguishers/extinguishers').then(m => m.Extinguishers) },
    { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.Services) },
    { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications) },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: '**', redirectTo: 'dashboard' }
];
