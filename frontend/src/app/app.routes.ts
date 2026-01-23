import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth.guard';
import { authGuard } from '../app/core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },

    // Públicas
    {
        path: 'auth',
        children: [
        {
            path: 'login',
            loadComponent: () =>
            import('./features/auth/login/login.component').then(m => m.LoginComponent),
        },
        {
            path: 'register',
            loadComponent: () =>
            import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        },
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        ],
    },

  // Privadas
    {
        path: 'app',
        canActivate: [authGuard],
        children: [
        {
            path: 'dashboard',
            loadComponent: () =>
            import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        },
        {
            path: 'subscriptions',
            loadComponent: () =>
            import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent),
        },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    {
    path: 'app',
    canActivate: [authGuard],
    children: [
        { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
        { path: 'subscriptions', loadComponent: () => import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent) },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
    },

  { path: '**', redirectTo: 'app/dashboard' },
];
