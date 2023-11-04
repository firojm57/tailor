import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './feature/sidebar/sidebar.component';
import { BillingComponent } from './feature/billing/billing.component';
import { VarietyComponent } from './feature/variety/variety.component';
import { CustomerComponent } from './feature/customer/customer.component';
import { ReportComponent } from './feature/report/report.component';
import { TagInputComponent } from './shared/tag-input/tag-input.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    BillingComponent,
    VarietyComponent,
    CustomerComponent,
    ReportComponent,
    TagInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
