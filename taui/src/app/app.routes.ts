import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { MeasurementsComponent } from './features/measurements/measurements';
import { ClothingTypesComponent } from './features/clothing-types/clothing-types';
import { BillingComponent } from './features/billing/billing';
import { CreateInvoiceComponent } from './features/billing/create-invoice/create-invoice';
import { LoginComponent } from './features/auth/login';
import { SignupComponent } from './features/auth/signup';
import { ForgotPasswordComponent } from './features/auth/forgot-password';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'measurements', component: MeasurementsComponent, canActivate: [authGuard] },
  { path: 'clothing-types', component: ClothingTypesComponent, canActivate: [authGuard] },
  { path: 'billing', component: BillingComponent, canActivate: [authGuard] },
  { path: 'billing/create', component: CreateInvoiceComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];


