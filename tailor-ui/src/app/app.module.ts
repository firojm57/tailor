import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './feature/sidebar/sidebar.component';
import { BillingComponent } from './feature/billing/billing.component';
import { VarietyComponent } from './feature/variety/variety.component';
import { CustomerComponent } from './feature/customer/customer.component';
import { ReportComponent } from './feature/report/report.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    BillingComponent,
    VarietyComponent,
    CustomerComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
