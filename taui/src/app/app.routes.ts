import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { MeasurementsComponent } from './features/measurements/measurements';
import { ClothingTypesComponent } from './features/clothing-types/clothing-types';
import { BillingComponent } from './features/billing/billing';
import { CreateInvoiceComponent } from './features/billing/create-invoice/create-invoice';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'measurements', component: MeasurementsComponent },
  { path: 'clothing-types', component: ClothingTypesComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'billing/create', component: CreateInvoiceComponent },
  { path: '**', redirectTo: 'dashboard' }
];
