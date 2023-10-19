import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingComponent } from './feature/billing/billing.component';
import { VarietyComponent } from './feature/variety/variety.component';
import { CustomerComponent } from './feature/customer/customer.component';
import { menuId } from './shared/util/constant';
import { ReportComponent } from './feature/report/report.component';

const routes: Routes = [{
  path: menuId.billing,
  component: BillingComponent
}, {
  path: menuId.variety,
  component: VarietyComponent
}, {
  path: menuId.customer,
  component: CustomerComponent
}, {
  path: menuId.report,
  component: ReportComponent
}, {
  path: '**',
  redirectTo: menuId.billing
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
